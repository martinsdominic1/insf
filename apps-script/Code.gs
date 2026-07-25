/**
 * ============================================================
 * BULLETIN + NOTICES AUTOMATION — website.insf@gmail.com
 * ============================================================
 * Routes incoming emails by subject line:
 *   - subject contains something close to "bulletin" -> Bulletins folders
 *   - subject contains something close to "notice"/"notices" -> Notices folders
 * Matching is typo-tolerant (fuzzy), so "Buletin", "Bulliten",
 * "Notce", "Noitce" etc. all still route correctly.
 *
 * For each category, every run:
 *   1. Finds the newest unprocessed email in that category.
 *   2. Archives whatever is currently in that category's Live
 *      folder into a dated subfolder of its Archive folder.
 *   3. Uploads the new email's attachments into the Live folder,
 *      in the order they were attached.
 *
 * Runs on a 5-minute timer (see installTrigger()).
 * ============================================================
 */

const LABEL_NAME = 'Bulletin-Processed';
const FUZZY_THRESHOLD = 2; // max spelling-typo "distance" still counted as a match

const CATEGORIES = {
  BULLETIN: {
    words: ['bulletin'],
    liveProp: 'BULLETIN_LIVE_FOLDER_ID',
    archiveProp: 'BULLETIN_ARCHIVE_FOLDER_ID',
    liveName: 'Parish Bulletins - Live',
    archiveName: 'Parish Bulletins - Archive',
  },
  NOTICE: {
    words: ['notice', 'notices'],
    liveProp: 'NOTICE_LIVE_FOLDER_ID',
    archiveProp: 'NOTICE_ARCHIVE_FOLDER_ID',
    liveName: 'Parish Notices - Live',
    archiveName: 'Parish Notices - Archive',
  },
};

function processBulletinEmail() {
  const label = getOrCreateLabel_(LABEL_NAME);
  const props = PropertiesService.getScriptProperties();

  // Threads with attachments, not yet processed, newest first.
  const threads = GmailApp.search('in:inbox has:attachment -label:' + LABEL_NAME, 0, 40);
  if (threads.length === 0) return;

  // Bucket threads by category (newest first, since search already sorts that way).
  const buckets = { BULLETIN: [], NOTICE: [] };
  const labelledThreads = [];

  threads.forEach(thread => {
    const message = getLatestMessageWithAttachments_(thread);
    if (!message) return;

    const category = classifySubject_(message.getSubject());
    if (category) {
      buckets[category].push(message);
      labelledThreads.push(thread); // only label threads we actually understood
    }
    // Unrecognised subjects are left unlabelled on purpose, so they stay
    // visible in the inbox instead of silently vanishing — check their
    // subject line and resend with "Bulletin" or "Notices" in it.
  });

  Object.keys(buckets).forEach(categoryKey => {
    const messages = buckets[categoryKey];
    if (messages.length === 0) return;

    const cfg = CATEGORIES[categoryKey];
    const liveFolderId = props.getProperty(cfg.liveProp);
    const archiveFolderId = props.getProperty(cfg.archiveProp);
    if (!liveFolderId || !archiveFolderId) {
      throw new Error(cfg.liveProp + ' / ' + cfg.archiveProp + ' are not set. Run setup() once first.');
    }

    archiveCurrentLiveFiles_(liveFolderId, archiveFolderId);
    uploadAttachmentsInOrder_(messages[0], liveFolderId); // messages[0] = newest
  });

  labelledThreads.forEach(t => t.addLabel(label));
}

/** Matches a subject line's words against each category's fuzzy word list. */
function classifySubject_(subject) {
  const words = (subject || '').toLowerCase().match(/[a-z]+/g) || [];
  let best = null;      // 'BULLETIN' | 'NOTICE'
  let bestDist = Infinity;

  words.forEach(word => {
    Object.keys(CATEGORIES).forEach(categoryKey => {
      CATEGORIES[categoryKey].words.forEach(target => {
        const dist = levenshtein_(word, target);
        if (dist <= FUZZY_THRESHOLD && dist < bestDist) {
          bestDist = dist;
          best = categoryKey;
        }
      });
    });
  });

  return best;
}

/** Standard Levenshtein edit distance between two lowercase strings. */
function levenshtein_(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i].concat(Array(n).fill(0)));
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

/** Moves every file currently in a Live folder into a dated Archive subfolder. */
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

/** Saves a message's attachments into a Live folder, preserving attachment order. */
function uploadAttachmentsInOrder_(message, liveFolderId) {
  const liveFolder = DriveApp.getFolderById(liveFolderId);
  const attachments = message.getAttachments({ includeInlineImages: true, includeAttachments: true });

  attachments.forEach((attachment, index) => {
    const prefix = String(index + 1).padStart(2, '0') + '_';
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

/**
 * ============================================================
 * RUN THIS ONCE, MANUALLY, BEFORE ANYTHING ELSE (or again after
 * pulling this update — it only creates folders that don't
 * already exist, so it's safe to re-run).
 * Check the Execution Log afterwards for the four folder IDs.
 * ============================================================
 */
function setup() {
  const props = PropertiesService.getScriptProperties();

  Object.keys(CATEGORIES).forEach(categoryKey => {
    const cfg = CATEGORIES[categoryKey];

    let liveId = props.getProperty(cfg.liveProp);
    if (!liveId) {
      liveId = DriveApp.createFolder(cfg.liveName).getId();
      props.setProperty(cfg.liveProp, liveId);
    }

    let archiveId = props.getProperty(cfg.archiveProp);
    if (!archiveId) {
      archiveId = DriveApp.createFolder(cfg.archiveName).getId();
      props.setProperty(cfg.archiveProp, archiveId);
    }

    Logger.log(cfg.liveName + ' ID (put this in js/gallery.js): ' + liveId);
    Logger.log(cfg.archiveName + ' ID (for reference only): ' + archiveId);
  });
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
