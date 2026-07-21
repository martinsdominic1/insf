/* ============================================================
   BULLETIN GALLERY — pulls files from a public Google Drive
   folder (the "live" folder the Apps Script keeps updated)
   and renders them in our own gallery grid. No Google Drive
   UI is ever shown to visitors.

   ⚠️ REQUIRED SETUP — fill in the three values below.
   See README.md section "3. Connect the website to Drive"
   for exactly how to get each one.
   ============================================================ */

const DRIVE_CONFIG = {
  // Get this from Google Cloud Console → APIs & Services → Credentials.
  // Must be restricted to the Google Drive API and to your website's domain.
  API_KEY: 'AIzaSyDrPlwlZADTG3n5uIF0Q6wVJhazwG59m9s',

  // The ID of the "Live" folder in Google Drive (the long string of
  // letters/numbers in the folder's URL after /folders/).
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
    // Added webContentLink to API fields
    const fields = 'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime)';
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
  const date = file.createdTime
    ? new Date(file.createdTime).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // Direct CDN link for images
  const actualImageUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
  
  // High-resolution thumbnail for PDFs
  const pdfCoverUrl = file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : '';
  
  // Direct file URL when clicked
  const viewUrl = isImage ? actualImageUrl : `https://drive.google.com/uc?export=view&id=${file.id}`;

  let thumbHtml = '';

  if (isImage) {
    thumbHtml = `<img src="${actualImageUrl}" alt="${escapeHtml(file.name)}" loading="lazy">`;
  } else if (pdfCoverUrl) {
    thumbHtml = `<img src="${pdfCoverUrl}" alt="${escapeHtml(file.name)}" loading="lazy" onerror="this.onerror=null; this.parentNode.innerHTML='<span class=\"icon\">📄</span>';">`;
  } else {
    thumbHtml = `<span class="icon">📄</span>`;
  }

  return `
    <a class="gallery-card reveal" href="${viewUrl}" target="_blank" rel="noopener">
      <div class="gallery-thumb">${thumbHtml}</div>
      <div class="gallery-meta">
        <div class="gallery-name">${escapeHtml(file.name)}</div>
        <div class="gallery-date">${date}</div>
      </div>
    </a>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}