/* ============================================================
   BULLETIN GALLERY — pulls files from a public Google Drive
   folder and renders them in our own gallery grid.
   ============================================================ */

const DRIVE_CONFIG = {
  API_KEY: 'AIzaSyDrPlwlZADTG3n5uIF0Q6wVJhazwG59m9s',
  LIVE_FOLDER_ID: '1fZNbAdJJVgaLa1YFntc50Mtq0PwEdSgd',
};

document.addEventListener('DOMContentLoaded', loadBulletinGallery);

async function loadBulletinGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (DRIVE_CONFIG.API_KEY.startsWith('REPLACE_') || DRIVE_CONFIG.LIVE_FOLDER_ID.startsWith('REPLACE_')) {
    grid.innerHTML = `<div class="gallery-empty">Bulletin gallery isn't connected yet — add your Google Drive API key and folder ID in <code>js/gallery.js</code>.</div>`;
    return;
  }

  try {
    const fields = 'files(id,name,mimeType,thumbnailLink,webViewLink,createdTime)';
    const q = encodeURIComponent(`'${DRIVE_CONFIG.LIVE_FOLDER_ID}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime&key=${DRIVE_CONFIG.API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive API responded ${res.status}`);
    const data = await res.json();
    const files = data.files || [];

    if (files.length === 0) {
      grid.innerHTML = `<div class="gallery-empty">No bulletins uploaded yet. Once one is emailed in, it will appear here automatically.</div>`;
      return;
    }

    grid.innerHTML = files.map(renderCard).join('');
  } catch (err) {
    console.error('Could not load bulletin gallery:', err);
    grid.innerHTML = `<div class="gallery-empty">Bulletins couldn't be loaded right now. Please check back shortly.</div>`;
  }
}

function renderCard(file) {
  const isImage = file.mimeType && file.mimeType.startsWith('image/');

  const actualImageUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
  const driveThumbUrl = file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : '';
  const viewUrl = isImage ? actualImageUrl : `https://drive.google.com/uc?export=view&id=${file.id}`;

  let thumbHtml = '';

  if (isImage) {
    thumbHtml = `<img src="${actualImageUrl}" alt="${escapeHtml(file.name)}" loading="lazy">`;
  } else if (driveThumbUrl) {
    thumbHtml = `<img src="${driveThumbUrl}" alt="${escapeHtml(file.name)}" loading="lazy" onerror="this.onerror=null; this.parentNode.innerHTML='<span class=\"icon\">📄</span>';">`;
  } else {
    thumbHtml = `<span class="icon">📄</span>`;
  }

  return `
    <a class="gallery-card" style="opacity: 1 !important; transform: none !important;" href="${viewUrl}" target="_blank" rel="noopener">
      <div class="gallery-thumb">${thumbHtml}</div>
    </a>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}