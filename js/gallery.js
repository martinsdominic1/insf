/* ============================================================
   BULLETIN + NOTICES GALLERIES — each pulls from its own public
   Google Drive folder and renders inline into its own grid.
   ============================================================ */

const DRIVE_CONFIG = {
  API_KEY: 'AIzaSyDrPlwlZADTG3n5uIF0Q6wVJhazwG59m9s',
  BULLETIN_LIVE_FOLDER_ID: '1I5UMXbBOnQOu9rrA8BswfbhUSoV3w1hr',
  // ⚠️ Run setup() in the Apps Script (after pasting the updated Code.gs)
  // then replace this with the "Notices Live Folder" ID it logs out.
  NOTICE_LIVE_FOLDER_ID: '16_joiA8XA1sIs_gQPEKNQfHmr-Z-23kc',
};

document.addEventListener('DOMContentLoaded', () => {
  loadGallery('galleryGrid', DRIVE_CONFIG.BULLETIN_LIVE_FOLDER_ID, 'bulletins');
  loadGallery('noticesGrid', DRIVE_CONFIG.NOTICE_LIVE_FOLDER_ID, 'notices');
});

async function loadGallery(gridId, folderId, label) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!DRIVE_CONFIG.API_KEY || DRIVE_CONFIG.API_KEY.startsWith('REPLACE_') || !folderId || folderId.startsWith('REPLACE_')) {
    grid.innerHTML = `<div class="gallery-empty">${label} gallery isn't connected yet — add the Drive API key and folder ID in <code>js/gallery.js</code>.</div>`;
    return;
  }

  try {
    const fields = 'files(id,name,mimeType,thumbnailLink,webViewLink,createdTime)';
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime&key=${DRIVE_CONFIG.API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive API responded ${res.status}`);
    const data = await res.json();
    const files = data.files || [];

    if (files.length === 0) {
      grid.innerHTML = `<div class="gallery-empty">No ${label} uploaded yet. Once one is emailed in, it will appear here automatically.</div>`;
      return;
    }

    grid.innerHTML = files.map(renderCard).join('');
  } catch (err) {
    console.error(`Could not load ${label} gallery:`, err);
    grid.innerHTML = `<div class="gallery-empty">${label} couldn't be loaded right now. Please check back shortly.</div>`;
  }
}

function renderCard(file) {
  const isImage = file.mimeType && file.mimeType.startsWith('image/');

  // Notice the '/preview' URL format for Google Drive PDFs
  const embedUrl = isImage ? `https://lh3.googleusercontent.com/d/${file.id}` : `https://drive.google.com/file/d/${file.id}/preview`;

  const contentHtml = isImage
    ? `<img src="${embedUrl}" style="width:100%; height:auto;" alt="Bulletin" loading="lazy">`
    : `<iframe src="${embedUrl}" style="width:100%; height:600px; border:none;" title="Bulletin PDF Viewer"></iframe>`;

  return `
    <div class="gallery-card inline-viewer">
      <div class="gallery-body">
        ${contentHtml}
      </div>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
