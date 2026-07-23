/**
 * ============================================================
 * BULLETIN AUTOMATION — website.insf@gmail.com
 * ============================================================
 */

const LABEL_NAME = 'Bulletin-Processed';

function processBulletinEmail() {
  const label = getOrCreateLabel_(LABEL_NAME);
  const props = PropertiesService.getScriptProperties();
  const liveFolderId = props.getProperty('LIVE_FOLDER_ID');
  const archiveFolderId = props.getProperty('ARCHIVE_FOLDER_ID');

  if (!liveFolderId || !archiveFolderId) {
    throw new Error('LIVE_FOLDER_ID / ARCHIVE_FOLDER_ID are not set. Run setup() once first — see README.md.');
  }

  // FIXED: Restricted to 'in:inbox' so Drafts and Sent emails are ignored.
  const threads = GmailApp.search('in:inbox has:attachment -label:' + LABEL_NAME, 0, 20);
  if (threads.length === 0) return; // Nothing new — exits without archiving or touching anything.

  // The first thread returned is the most recent.
  const newestThread = threads[0];
  const newestMessage = getLatestMessageWithAttachments_(newestThread);

  if (newestMessage) {
    archiveCurrentLiveFiles_(liveFolderId, archiveFolderId);
    uploadAttachmentsInOrder_(newestMessage, liveFolderId);
  }

  // Label all found threads so they are never picked up again.
  threads.forEach(t => t.addLabel(label));
}

/** Moves every file currently in the Live folder into a dated Archive subfolder. */
function archiveCurrentLiveFiles_(liveFolderId, archiveFolderId) {
  const liveFolder = DriveApp.getFolderById(liveFolderId);
  const archiveRoot = DriveApp.getFolderById(archiveFolderId);

  const files = liveFolder.getFiles();
  if (!files.hasNext()) return; // nothing to archive yet

  const dateStamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  const dated = archiveRoot.createFolder(dateStamp);

  while (files.hasNext()) {
    const file = files.next();
    dated.addFile(file);
    liveFolder.removeFile(file);
  }
}

/** Saves a message's attachments into the Live folder, preserving attachment order. */
function uploadAttachmentsInOrder_(message, liveFolderId) {
  const liveFolder = DriveApp.getFolderById(liveFolderId);
  const attachments = message.getAttachments({ includeInlineImages: true, includeAttachments: true });

  attachments.forEach((attachment, index) => {
    const prefix = String(index + 1).padStart(2, '0') + '_';
    
    // FIXED: Correctly assign 'file' inside the loop and set permissions
    const file = liveFolder.createFile(attachment.copyBlob()).setName(prefix + attachment.getName());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  });
}

/** Finds the newest message in a thread that actually has attachments. */
function getLatestMessageWithAttachments_(thread) {
  const messages = thread.getMessages();
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].getAttachments({ includeInlineImages: true, includeAttachments: true }).length > 0) return messages[i];
  }
  return null;
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function setup() {
  const props = PropertiesService.getScriptProperties();

  let liveFolderId = props.getProperty('LIVE_FOLDER_ID');
  let archiveFolderId = props.getProperty('ARCHIVE_FOLDER_ID');

  if (!liveFolderId) {
    const liveFolder = DriveApp.createFolder('Parish Bulletins - Live');
    liveFolderId = liveFolder.getId();
    props.setProperty('LIVE_FOLDER_ID', liveFolderId);
  }
  if (!archiveFolderId) {
    const archiveFolder = DriveApp.createFolder('Parish Bulletins - Archive');
    archiveFolderId = archiveFolder.getId();
    props.setProperty('ARCHIVE_FOLDER_ID', archiveFolderId);
  }

  Logger.log('LIVE FOLDER ID (put this in js/gallery.js): ' + liveFolderId);
  Logger.log('ARCHIVE FOLDER ID (for reference only): ' + archiveFolderId);
}

function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'processBulletinEmail')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('processBulletinEmail')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger installed — processBulletinEmail() will now run every 5 minutes.');
}