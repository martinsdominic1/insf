/* ============================================================
   BULLETIN GALLERY — pulls files from Google Drive and opens
   them directly inside an on-page Lightbox Modal.
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
  const driveThumbUrl = file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : actualImageUrl;
  
  // Use /preview link so Google Drive renders directly inside our modal iframe
  const previewUrl = isImage ? actualImageUrl : `https://drive.google.com/file/d/${file.id}/preview`;

  let thumbHtml = isImage
    ? `<img src="${actualImageUrl}" alt="Bulletin" loading="lazy">`
    : (driveThumbUrl ? `<img src="${driveThumbUrl}" alt="Bulletin" loading="lazy" onerror="this.style.display='none';">` : '');

  return `
    <div class="gallery-card" onclick="openBulletinModal('${previewUrl}', ${isImage})" style="opacity: 1 !important; transform: none !important; cursor: pointer;">
      <div class="gallery-thumb">${thumbHtml}</div>
      <div class="gallery-action">
        <span class="gallery-btn">Click to view 🔍</span>
      </div>
    </div>`;
}

/* Modal Open / Close Logic */
function openBulletinModal(url, isImage) {
  const modal = document.getElementById('bulletinModal');
  const body = document.getElementById('bulletinModalBody');
  if (!modal || !body) return;

  body.innerHTML = isImage
    ? `<img src="${url}" alt="Bulletin Page">`
    : `<iframe src="${url}" title="Bulletin PDF Preview"></iframe>`;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeBulletinModal() {
  const modal = document.getElementById('bulletinModal');
  const body = document.getElementById('bulletinModalBody');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (body) body.innerHTML = '';
  document.body.style.overflow = '';
}

function closeBulletinModalOnBg(event) {
  if (event.target.id === 'bulletinModal') {
    closeBulletinModal();
  }
}