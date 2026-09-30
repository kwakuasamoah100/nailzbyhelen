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
    return { nails, lashes };
}

function renderAdminDashboard() {
    const { nails, lashes } = getAdminData();

    document.getElementById('nailsCount').textContent = `${nails.length} styles`;
    document.getElementById('lashesCount').textContent = `${lashes.length} styles`;

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
}

function handleAdminUpload(e) {
    e.preventDefault();
    const category = document.getElementById('uploadCategory').value;
    const title = document.getElementById('uploadTitle').value;
    const url = document.getElementById('uploadUrl').value;

    const storageKey = category === 'Nails' ? 'nailz_nails_data' : 'nailz_lashes_data';
    let currentList = JSON.parse(localStorage.getItem(storageKey)) || [];

    currentList.unshift({ title, category, url });
    localStorage.setItem(storageKey, JSON.stringify(currentList));

    document.getElementById('uploadTitle').value = '';
    document.getElementById('uploadUrl').value = '';

    renderAdminDashboard();
    alert(`Successfully added new ${category} style!`);
}

function deleteAdminImage(category, index) {
    if (!confirm('Are you sure you want to remove this style?')) return;

    const storageKey = category === 'Nails' ? 'nailz_nails_data' : 'nailz_lashes_data';
    let currentList = JSON.parse(localStorage.getItem(storageKey)) || [];

    currentList.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(currentList));

    renderAdminDashboard();
}