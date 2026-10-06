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
    location.reload();
}

function getAdminData() {
    const nails = JSON.parse(localStorage.getItem('nailz_nails_data')) || [];
    const lashes = JSON.parse(localStorage.getItem('nailz_lashes_data')) || [];
    const training = JSON.parse(localStorage.getItem('nailz_training_data')) || [];
    return { nails, lashes, training };
}

function renderAdminDashboard() {
    const { nails, lashes, training } = getAdminData();

    document.getElementById('nailsCount').textContent = `${nails.length} images`;
    document.getElementById('lashesCount').textContent = `${lashes.length} images`;
    document.getElementById('trainingCount').textContent = `${training.length} images`;

    const renderCard = (item, index, category) => `
        <div class="bg-stone-50 rounded-xl overflow-hidden border border-stone-200 relative group">
            <div class="aspect-square bg-stone-200">
                <img src="${item.url}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
                <h4 class="text-sm font-medium text-stone-900 truncate">${item.title}</h4>
                <p class="text-[10px] text-stone-400 mt-0.5">${category}</p>
            </div>
            <button onclick="deleteAdminImage('${category}', ${index})" class="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow transition">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    document.getElementById('adminNailsGrid').innerHTML = nails.map((item, idx) => renderCard(item, idx, 'Nails')).join('');
    document.getElementById('adminLashesGrid').innerHTML = lashes.map((item, idx) => renderCard(item, idx, 'Lashes')).join('');
    document.getElementById('adminTrainingGrid').innerHTML = training.map((item, idx) => renderCard(item, idx, 'Training')).join('');

    renderStylePhotos();
}

/* ===== Style photos (one photo per style) ===== */
const STYLE_IMAGES_KEY = 'nailz_style_images';
const STYLE_LIST = {
    nails: ["Acrylic Nails", "Stick-on Nails", "Gel-X Nails"],
    lashes: ["Classic Cat Eye Lashes", "Hybrid Cat Eye Lashes", "Volume Cat Eye Lashes", "Hybrid Wispy Lashes", "Volume Wispy Lashes", "Wet Set Lashes"]
};
const ALL_STYLES = [...STYLE_LIST.nails, ...STYLE_LIST.lashes];

function getStyleImages() {
    try { return JSON.parse(localStorage.getItem(STYLE_IMAGES_KEY)) || {}; }
    catch (e) { return {}; }
}

function saveStyleImage(styleName, url) {
    const map = getStyleImages();
    if (url) map[styleName] = url; else delete map[styleName];
    localStorage.setItem(STYLE_IMAGES_KEY, JSON.stringify(map));
    renderStylePhotos();
}

function renderStylePhotos() {
    const map = getStyleImages();
    const card = (name) => {
        const idx = ALL_STYLES.indexOf(name);
        const url = map[name];
        return `
        <div class="bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
            <div class="aspect-[4/3] bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center text-rose-300 text-3xl">
                ${url ? `<img src="${url}" alt="${name}" class="w-full h-full object-cover">` : '<i class="fa-regular fa-image"></i>'}
            </div>
            <div class="p-3 space-y-2">
                <h4 class="text-sm font-medium text-stone-900 truncate">${name}</h4>
                <div class="flex items-center gap-1.5">
                    <input type="file" accept="image/*" class="hidden" id="styleFile_${idx}" onchange="handleStyleFile(${idx}, this)">
                    <label for="styleFile_${idx}" id="styleLabel_${idx}" class="flex-1 text-center cursor-pointer bg-stone-900 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider py-2 rounded-lg transition">${url ? 'Change photo' : 'Upload photo'}</label>
                    <button type="button" onclick="setStyleUrl(${idx})" title="Paste image URL" class="w-8 h-8 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs transition"><i class="fa-solid fa-link"></i></button>
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

async function handleStyleFile(idx, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const name = ALL_STYLES[idx];
    const label = document.getElementById(`styleLabel_${idx}`);
    if (label) label.textContent = 'Uploading...';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
            saveStyleImage(name, data.secure_url);
        } else {
            alert('Cloudinary upload failed. Check preset configuration.');
            renderStylePhotos();
        }
    } catch (err) {
        alert('Network error while uploading file.');
        renderStylePhotos();
    }
}

function setStyleUrl(idx) {
    const name = ALL_STYLES[idx];
    const url = prompt(`Paste an image URL for "${name}":`);
    if (url && /^https?:\/\//i.test(url.trim())) {
        saveStyleImage(name, url.trim());
    } else if (url) {
        alert('Please enter a valid link starting with http:// or https://');
    }
}

function removeStyleImage(idx) {
    const name = ALL_STYLES[idx];
    if (!confirm(`Remove the photo for "${name}"?`)) return;
    saveStyleImage(name, null);
}

async function handleAdminUpload(e) {
    e.preventDefault();
    const category = document.getElementById('uploadCategory').value;
    const title = document.getElementById('uploadTitle').value.trim();
    const urlInput = document.getElementById('uploadUrl').value.trim();
    const fileInput = document.getElementById('uploadFile');
    const submitBtn = document.getElementById('submitBtn');

    let finalImageUrl = urlInput;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...`;

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.secure_url) {
                finalImageUrl = data.secure_url;
            } else {
                alert('Cloudinary upload failed. Check preset configuration.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Publish to Website</span>`;
                return;
            }
        } catch (err) {
            alert('Network error while uploading file.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Publish to Website</span>`;
            return;
        }
    }

    if (!finalImageUrl) {
        alert('Please select an image file to upload OR provide an Image URL.');
        return;
    }

    let storageKey = 'nailz_nails_data';
    if (category === 'Lashes') storageKey = 'nailz_lashes_data';
    if (category === 'Training') storageKey = 'nailz_training_data';

    let currentList = JSON.parse(localStorage.getItem(storageKey)) || [];

    currentList.unshift({ title, category, url: finalImageUrl });
    localStorage.setItem(storageKey, JSON.stringify(currentList));

    document.getElementById('uploadTitle').value = '';
    document.getElementById('uploadUrl').value = '';
    fileInput.value = '';

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Publish to Website</span>`;

    renderAdminDashboard();
    alert(`Successfully published new ${category} image!`);
}

function deleteAdminImage(category, index) {
    if (!confirm('Are you sure you want to remove this image?')) return;

    let storageKey = 'nailz_nails_data';
    if (category === 'Lashes') storageKey = 'nailz_lashes_data';
    if (category === 'Training') storageKey = 'nailz_training_data';

    let currentList = JSON.parse(localStorage.getItem(storageKey)) || [];

    currentList.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(currentList));

    renderAdminDashboard();
}