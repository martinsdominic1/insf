/**
 * ============================================================
 * BULLETIN AUTOMATION — insf-website@gmail.com
 * ============================================================
 * What this does, every time it runs:
 *   1. Looks for the newest unprocessed email with attachments
 *      sent to this inbox.
 *   2. Moves everything currently in the "Live" Drive folder
 *      into an "Archive" folder, inside a subfolder stamped
 *      with today's date.
 *   3. Saves the new email's attachments into the "Live" folder,
 *      in the same order they were attached.
 *   4. Labels the email (and any older unprocessed emails) as
 *      processed, so nothing is uploaded twice.
 *
 * The website's gallery reads directly from the "Live" folder,
 * so step 3 is what makes new bulletins appear on the site.
 *
 * This script must run on a timer (see setup instructions in
 * README.md) — Gmail has no way to "instantly" notify a script,
 * so a check every 5 minutes is the standard, reliable way to
 * get bulletins onto the site within a few minutes of being sent.
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

  // Newest-first search for anything not yet processed that has an attachment.
  const threads = GmailApp.search('has:attachment -label:' + LABEL_NAME, 0, 20);
  if (threads.length === 0) return; // nothing new — normal on most runs

  // The first thread returned is the most recent. Only its attachments
  // get uploaded; every thread found (including older ones) gets labelled
  // so they are never picked up again.
  const newestThread = threads[0];
  const newestMessage = getLatestMessageWithAttachments_(newestThread);

  if (newestMessage) {
    archiveCurrentLiveFiles_(liveFolderId, archiveFolderId);
    uploadAttachmentsInOrder_(newestMessage, liveFolderId);
  }

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
  const attachments = message.getAttachments({ includeInlineImages: false, includeAttachments: true });

  attachments.forEach((attachment, index) => {
    // Zero-padded prefix keeps the gallery's display order identical
    // to the order files were attached in the email.
    const prefix = String(index + 1).padStart(2, '0') + '_';
    liveFolder.createFile(attachment.copyBlob()).setName(prefix + attachment.getName());
  });
}

/** Finds the newest message in a thread that actually has attachments. */
function getLatestMessageWithAttachments_(thread) {
  const messages = thread.getMessages();
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].getAttachments().length > 0) return messages[i];
  }
  return null;
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

/**
 * ============================================================
 * RUN THIS ONCE, MANUALLY, BEFORE ANYTHING ELSE.
 * Creates the "Live" and "Archive" Drive folders (if they don't
 * already exist) and stores their IDs for processBulletinEmail()
 * to use. Check the Execution Log (View → Logs) after running
 * for the Live Folder ID — you'll need it for js/gallery.js.
 * ============================================================
 */
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

/**
 * ============================================================
 * RUN THIS ONCE, MANUALLY, AFTER setup().
 * Installs the 5-minute timer that keeps the gallery updated.
 * ============================================================
 */
function installTrigger() {
  // Remove any existing triggers for this function first, so re-running
  // this doesn't create duplicates.
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'processBulletinEmail')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('processBulletinEmail')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger installed — processBulletinEmail() will now run every 5 minutes.');
}
