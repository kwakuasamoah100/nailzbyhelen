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

    document.getElementById('nailsCount').textContent = `${nails.length} styles`;
    document.getElementById('lashesCount').textContent = `${lashes.length} styles`;
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