const defaultNails = [
    { title: "Vanilla Nude Chrome Set", category: "Nails", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800" },
    { title: "Blush Pink French Tip", category: "Nails", url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800" },
    { title: "Luxury Minimalist Sculpt", category: "Nails", url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800" }
];

const defaultLashes = [
    { title: "Soft Volume Lash Set", category: "Lashes", url: "https://images.unsplash.com/photo-1583001809873-a1284d563372?auto=format&fit=crop&q=80&w=800" },
    { title: "Hybrid Wispy Extensions", category: "Lashes", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" },
    { title: "Natural Classic Extensions", category: "Lashes", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" }
];

function loadData() {
    let nails = JSON.parse(localStorage.getItem('nailz_nails_data'));
    let lashes = JSON.parse(localStorage.getItem('nailz_lashes_data'));

    if (!nails || nails.length === 0) {
        localStorage.setItem('nailz_nails_data', JSON.stringify(defaultNails));
        nails = defaultNails;
    }
    if (!lashes || lashes.length === 0) {
        localStorage.setItem('nailz_lashes_data', JSON.stringify(defaultLashes));
        lashes = defaultLashes;
    }
    return { nails, lashes };
}

let nailsIndex = 0;
let lashesIndex = 0;
let currentCatalogTab = 'nails';

document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    const bookDateEl = document.getElementById('bookDate');
    if (bookDateEl) {
        const today = new Date().toISOString().split('T')[0];
        bookDateEl.min = today;
    }

    initHeroSlides();
    updateBadges();
});

function initHeroSlides() {
    const { nails, lashes } = loadData();

    const updateNailsHero = () => {
        const imgEl = document.getElementById('hero-nails-img');
        if (imgEl && nails.length > 0) {
            imgEl.style.opacity = '0.4';
            setTimeout(() => {
                imgEl.src = nails[nailsIndex].url;
                imgEl.style.opacity = '1';
                nailsIndex = (nailsIndex + 1) % nails.length;
            }, 300);
        }
    };

    const updateLashesHero = () => {
        const imgEl = document.getElementById('hero-lashes-img');
        if (imgEl && lashes.length > 0) {
            imgEl.style.opacity = '0.4';
            setTimeout(() => {
                imgEl.src = lashes[lashesIndex].url;
                imgEl.style.opacity = '1';
                lashesIndex = (lashesIndex + 1) % lashes.length;
            }, 300);
        }
    };

    updateNailsHero();
    updateLashesHero();

    setInterval(updateNailsHero, 4000);
    setInterval(updateLashesHero, 4500);
}

function updateBadges() {
    const { nails, lashes } = loadData();
    const nailsBadge = document.getElementById('nails-count-badge');
    const lashesBadge = document.getElementById('lashes-count-badge');
    if (nailsBadge) nailsBadge.textContent = `${nails.length} Styles Available`;
    if (lashesBadge) lashesBadge.textContent = `${lashes.length} Styles Available`;
}

function openCatalogModal(category = 'nails') {
    currentCatalogTab = category;
    const modal = document.getElementById('catalogModal');
    if (modal) modal.classList.remove('hidden');
    renderCatalogGrid();
}

function closeCatalogModal() {
    const modal = document.getElementById('catalogModal');
    if (modal) modal.classList.add('hidden');
}

function switchCatalogTab(tab) {
    currentCatalogTab = tab;
    renderCatalogGrid();
}

function renderCatalogGrid() {
    const { nails, lashes } = loadData();
    const grid = document.getElementById('catalogGrid');
    const title = document.getElementById('catalogModalTitle');
    if (!grid) return;

    const items = currentCatalogTab === 'nails' ? nails : lashes;
    if (title) title.textContent = currentCatalogTab === 'nails' ? 'Nails Collection' : 'Lashes Collection';

    const nailsBtn = document.getElementById('tab-btn-nails');
    const lashesBtn = document.getElementById('tab-btn-lashes');

    if (nailsBtn && lashesBtn) {
        if (currentCatalogTab === 'nails') {
            nailsBtn.className = "px-4 py-1.5 rounded-full font-medium transition bg-stone-900 text-white shadow";
            lashesBtn.className = "px-4 py-1.5 rounded-full font-medium transition text-stone-600 hover:text-stone-900 bg-stone-100";
        } else {
            lashesBtn.className = "px-4 py-1.5 rounded-full font-medium transition bg-stone-900 text-white shadow";
            nailsBtn.className = "px-4 py-1.5 rounded-full font-medium transition text-stone-600 hover:text-stone-900 bg-stone-100";
        }
    }

    grid.innerHTML = items.map((item) => `
        <div class="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition group">
            <div class="aspect-square relative overflow-hidden bg-stone-100">
                <img src="${item.url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            <div class="p-4 flex items-center justify-between">
                <div>
                    <h4 class="font-serif text-lg text-stone-900 font-medium">${item.title}</h4>
                    <span class="text-[10px] text-stone-400 uppercase tracking-widest">${item.category}</span>
                </div>
                <button onclick="closeCatalogModal(); openBookingModal('${item.title}');" class="w-8 h-8 rounded-full bg-stone-100 text-stone-700 hover:bg-rose-500 hover:text-white flex items-center justify-center transition">
                    <i class="fa-solid fa-calendar-plus text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function openBookingModal(presetService = '') {
    if (presetService) {
        const serviceSelect = document.getElementById('bookService');
        if (serviceSelect) {
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value.toLowerCase().includes(presetService.toLowerCase())) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) bookingModal.classList.remove('hidden');
}

function closeBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) bookingModal.classList.add('hidden');
}

function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('bookName').value.trim();
    const clientPhone = document.getElementById('bookPhone').value.trim();
    const service = document.getElementById('bookService').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;

    const helenWhatsAppNumber = "233547900382";

    const merchantMessage = `✨ *NEW BOOKING REQUEST - NAILZ BY HELEN* ✨\n\n` +
                            `👤 *Client Name:* ${name}\n` +
                            `📞 *Client Phone:* ${clientPhone}\n` +
                            `💅 *Service:* ${service}\n` +
                            `📅 *Booking Date:* ${date}\n` +
                            `⏰ *Booking Time:* ${time}\n\n` +
                            `Please confirm this appointment slot!`;

    const merchantUrl = `https://wa.me/${helenWhatsAppNumber}?text=${encodeURIComponent(merchantMessage)}`;

    window.open(merchantUrl, '_blank');
    alert(`Thank you, ${name}! Your booking request for ${service} on ${date} at ${time} has been prepared. Please click send in WhatsApp to finalize with Helen.`);
    closeBookingModal();
}