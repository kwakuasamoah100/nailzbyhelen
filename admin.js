const CLOUDINARY_CLOUD_NAME = 'uropsnyi';
const CLOUDINARY_PRESET = 'nailz_preset';

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('nailz_admin_authed') === 'true') {
        document.getElementById('authOverlay').classList.add('hidden');
        renderAdminDashboard();
    }
});

async function verifyAdminPasscode(e) {
    e.preventDefault();
    const input = document.getElementById('adminPasscode').value;
    const errorEl = document.getElementById('authError');

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passcode: input })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            sessionStorage.setItem('nailz_admin_authed', 'true');
            sessionStorage.setItem('nailz_admin_pass', input);
            document.getElementById('authOverlay').classList.add('hidden');
            errorEl.classList.add('hidden');
            renderAdminDashboard();
        } else {
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        alert('Authentication error. Please check your network connection.');
    }
}

function lockPortal() {
    sessionStorage.removeItem('nailz_admin_authed');
    sessionStorage.removeItem('nailz_admin_pass');
    location.reload();
}

/* ===== Shared gallery (stored in Cloudinary, served by /api/gallery) ===== */
const STYLE_LIST = {
    nails: ["Acrylic Nails", "Stick-on Nails", "Gel-X Nails"],
    lashes: ["Classic Cat Eye Lashes", "Hybrid Cat Eye Lashes", "Volume Cat Eye Lashes", "Hybrid Wispy Lashes", "Volume Wispy Lashes", "Wet Set Lashes"]
};
const ALL_STYLES = [...STYLE_LIST.nails, ...STYLE_LIST.lashes];
const CATEGORY_TAG = { Nails: 'nailz_nails', Lashes: 'nailz_lashes', Training: 'nailz_training' };

let state = { nails: [], lashes: [], training: [], styles: {} };

function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function ctxSafe(v) {
    return String(v).replace(/[|=]/g, ' ');
}

async function cloudUpload(fileOrUrl, tags, context) {
    const fd = new FormData();
    fd.append('file', fileOrUrl);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    fd.append('tags', tags.join(','));
    fd.append('context', context);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.secure_url) throw new Error((data.error && data.error.message) || 'Upload failed');
    return data;
}

async function deleteFromServer(publicId) {
    const res = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: sessionStorage.getItem('nailz_admin_pass') || '', public_id: publicId })
    });
    if (res.status === 401) {
        alert('Session expired. Please unlock the portal again.');
        lockPortal();
        return false;
    }
    if (!res.ok) {
        alert('Could not delete the image. Please try again.');
        return false;
    }
    return true;
}

async function renderAdminDashboard() {
    try {
        const res = await fetch('/api/gallery', { cache: 'no-store' });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || ('Server error ' + res.status));
        state = { nails: d.nails || [], lashes: d.lashes || [], training: d.training || [], styles: d.styles || {} };
        showLoadError('');
    } catch (e) {
        showLoadError('Could not load the live gallery from the server: ' + e.message);
    }
    drawDashboard();
}

function showLoadError(msg) {
    const el = document.getElementById('loadError');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
}

function drawDashboard() {
    const { nails, lashes, training } = state;

    document.getElementById('nailsCount').textContent = `${nails.length} images`;
    document.getElementById('lashesCount').textContent = `${lashes.length} images`;
    document.getElementById('trainingCount').textContent = `${training.length} images`;

    const renderCard = (item, category) => `
        <div class="bg-stone-50 rounded-xl overflow-hidden border border-stone-200 relative group">
            <div class="aspect-square bg-stone-200">
                <img src="${esc(item.url)}" alt="${esc(item.title)}" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
                <h4 class="text-sm font-medium text-stone-900 truncate">${esc(item.title)}</h4>
                <p class="text-[10px] text-stone-400 mt-0.5">${category}</p>
            </div>
            <button onclick="deleteAdminImage('${category}', '${esc(item.id)}')" class="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow transition">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    const empty = '<p class="text-xs text-stone-400 col-span-full">No photos yet. Nothing is showing on the website here until you add one.</p>';
    document.getElementById('adminNailsGrid').innerHTML = nails.map(i => renderCard(i, 'Nails')).join('') || empty;
    document.getElementById('adminLashesGrid').innerHTML = lashes.map(i => renderCard(i, 'Lashes')).join('') || empty;
    document.getElementById('adminTrainingGrid').innerHTML = training.map(i => renderCard(i, 'Training')).join('') || empty;

    renderStylePhotos();
}

/* ===== Style photos (one photo per style) ===== */
async function saveStyleImage(styleName, url, publicId) {
    const old = state.styles[styleName];
    if (url) state.styles[styleName] = { id: publicId, url };
    else delete state.styles[styleName];
    renderStylePhotos();
    if (old && old.id && old.id !== publicId) await deleteFromServer(old.id);
}

function renderStylePhotos() {
    const map = state.styles;
    const card = (name) => {
        const idx = ALL_STYLES.indexOf(name);
        const url = map[name] && map[name].url;
        return `
        <div class="bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
            <div class="aspect-[4/3] bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center text-rose-300 text-3xl">
                ${url ? `<img src="${esc(url)}" alt="${esc(name)}" class="w-full h-full object-cover">` : '<i class="fa-regular fa-image"></i>'}
            </div>
            <div class="p-3 space-y-2">
                <h4 class="text-sm font-medium text-stone-900 truncate">${esc(name)}</h4>
                <div class="flex items-center gap-1.5">
                    <input type="file" accept="image/*" class="hidden" id="styleFile_${idx}" onchange="handleStyleFile(${idx}, this)">
                    <label for="styleFile_${idx}" id="styleLabel_${idx}" class="flex-1 text-center cursor-pointer bg-stone-900 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider py-2 rounded-lg transition">${url ? 'Change photo' : 'Upload photo'}</label>
                    ${url ? `<button type="button" onclick="removeStyleImage(${idx})" title="Remove photo" class="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        </div>`;
    };

    const nailsGrid = document.getElementById('adminStyleNailsGrid');
    const lashesGrid = document.getElementById('adminStyleLashesGrid');
    if (nailsGrid) nailsGrid.innerHTML = STYLE_LIST.nails.map(card).join('');
    if (lashesGrid) lashesGrid.innerHTML = STYLE_LIST.lashes.map(card).join('');

    const countEl = document.getElementById('stylePhotoCount');
    if (countEl) countEl.textContent = `${ALL_STYLES.filter(n => map[n]).length} of ${ALL_STYLES.length} set`;
}

async function uploadStyle(name, fileOrUrl, labelEl) {
    if (labelEl) labelEl.textContent = 'Uploading...';
    try {
        const data = await cloudUpload(fileOrUrl, ['nailz_site', 'nailz_style'], `style=${ctxSafe(name)}`);
        await saveStyleImage(name, data.secure_url, data.public_id);
    } catch (err) {
        alert('Upload failed: ' + err.message);
        renderStylePhotos();
    }
}

function handleStyleFile(idx, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    uploadStyle(ALL_STYLES[idx], file, document.getElementById(`styleLabel_${idx}`));
}

async function removeStyleImage(idx) {
    const name = ALL_STYLES[idx];
    if (!confirm(`Remove the photo for "${name}"?`)) return;
    const entry = state.styles[name];
    if (entry && entry.id && await deleteFromServer(entry.id)) {
        await saveStyleImage(name, null);
    }
}

/* ===== Hero / training slideshow images ===== */
async function handleAdminUpload(e) {
    e.preventDefault();
    const category = document.getElementById('uploadCategory').value;
    const title = document.getElementById('uploadTitle').value.trim();
    const fileInput = document.getElementById('uploadFile');
    const submitBtn = document.getElementById('submitBtn');

    const source = fileInput.files.length > 0 ? fileInput.files[0] : null;
    if (!source) {
        alert('Please choose an image file to upload.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...`;

    try {
        const data = await cloudUpload(source, ['nailz_site', CATEGORY_TAG[category]], `title=${ctxSafe(title)}`);
        const key = category.toLowerCase();
        state[key].unshift({ id: data.public_id, title, category, url: data.secure_url });

        document.getElementById('uploadTitle').value = '';
        fileInput.value = '';
        drawDashboard();
        alert(`Successfully published new ${category} image! It will appear on all devices within a minute.`);
    } catch (err) {
        alert('Upload failed: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Publish to Website</span>`;
    }
}

async function deleteAdminImage(category, publicId) {
    if (!confirm('Are you sure you want to remove this image?')) return;
    if (!(await deleteFromServer(publicId))) return;
    const key = category.toLowerCase();
    state[key] = state[key].filter(i => i.id !== publicId);
    drawDashboard();
}