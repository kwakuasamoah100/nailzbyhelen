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

const defaultTraining = [
    { title: "Nail Extensions & Apex Class", category: "Training", url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800" },
    { title: "Live Model Manicure Practice", category: "Training", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800" }
];

function loadData() {
    let nails = JSON.parse(localStorage.getItem('nailz_nails_data'));
    let lashes = JSON.parse(localStorage.getItem('nailz_lashes_data'));
    let training = JSON.parse(localStorage.getItem('nailz_training_data'));

    if (!nails || nails.length === 0) {
        localStorage.setItem('nailz_nails_data', JSON.stringify(defaultNails));
        nails = defaultNails;
    }
    if (!lashes || lashes.length === 0) {
        localStorage.setItem('nailz_lashes_data', JSON.stringify(defaultLashes));
        lashes = defaultLashes;
    }
    if (!training || training.length === 0) {
        localStorage.setItem('nailz_training_data', JSON.stringify(defaultTraining));
        training = defaultTraining;
    }
    return { nails, lashes, training };
}

const catalogStyles = {
    nails: [
        { name: "Acrylic Nails", icon: "fa-gem" },
        { name: "Stick-on Nails", icon: "fa-hand-sparkles" },
        { name: "Gel-X Nails", icon: "fa-wand-magic-sparkles" }
    ],
    lashes: [
        { name: "Classic Cat Eye Lashes", icon: "fa-eye" },
        { name: "Hybrid Cat Eye Lashes", icon: "fa-eye" },
        { name: "Volume Cat Eye Lashes", icon: "fa-eye" },
        { name: "Hybrid Wispy Lashes", icon: "fa-feather" },
        { name: "Volume Wispy Lashes", icon: "fa-feather" },
        { name: "Wet Set Lashes", icon: "fa-droplet" }
    ]
};

function getStyleImages() {
    try { return JSON.parse(localStorage.getItem('nailz_style_images')) || {}; }
    catch (e) { return {}; }
}

function optimizeImg(url) {
    return url.includes('res.cloudinary.com') && url.includes('/image/upload/') && !url.includes('/f_auto')
        ? url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_800/')
        : url;
}

let nailsIndex = 0;
let lashesIndex = 0;
let trainingIndex = 0;
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

function toggleMobileNav() {
    const nav = document.getElementById('mobileNav');
    if (nav) nav.classList.toggle('hidden');
}

function initHeroSlides() {
    const updateNailsHero = () => {
        const { nails } = loadData();
        const imgEl = document.getElementById('hero-nails-img');
        if (imgEl && nails.length > 0) {
            imgEl.style.opacity = '0.4';
            setTimeout(() => {
                imgEl.src = nails[nailsIndex % nails.length].url;
                imgEl.style.opacity = '1';
                nailsIndex = (nailsIndex + 1) % nails.length;
            }, 300);
        }
    };

    const updateLashesHero = () => {
        const { lashes } = loadData();
        const imgEl = document.getElementById('hero-lashes-img');
        if (imgEl && lashes.length > 0) {
            imgEl.style.opacity = '0.4';
            setTimeout(() => {
                imgEl.src = lashes[lashesIndex % lashes.length].url;
                imgEl.style.opacity = '1';
                lashesIndex = (lashesIndex + 1) % lashes.length;
            }, 300);
        }
    };

    const updateTrainingHero = () => {
        const { training } = loadData();
        const imgEl = document.getElementById('hero-training-img');
        if (imgEl && training.length > 0) {
            imgEl.style.opacity = '0.4';
            setTimeout(() => {
                imgEl.src = training[trainingIndex % training.length].url;
                imgEl.style.opacity = '1';
                trainingIndex = (trainingIndex + 1) % training.length;
            }, 300);
        }
    };

    updateNailsHero();
    updateLashesHero();
    updateTrainingHero();

    setInterval(updateNailsHero, 4000);
    setInterval(updateLashesHero, 4500);
    setInterval(updateTrainingHero, 5000);
}

function updateBadges() {
    const nailsBadge = document.getElementById('nails-count-badge');
    const lashesBadge = document.getElementById('lashes-count-badge');
    if (nailsBadge) nailsBadge.textContent = `${catalogStyles.nails.length} Styles Available`;
    if (lashesBadge) lashesBadge.textContent = `${catalogStyles.lashes.length} Styles Available`;
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
    const grid = document.getElementById('catalogGrid');
    const title = document.getElementById('catalogModalTitle');
    if (!grid) return;

    const items = catalogStyles[currentCatalogTab];
    if (title) title.textContent = currentCatalogTab === 'nails' ? 'Nail Styles' : 'Lash Extension Styles';

    const nailsBtn = document.getElementById('tab-btn-nails');
    const lashesBtn = document.getElementById('tab-btn-lashes');

    if (nailsBtn && lashesBtn) {
        if (currentCatalogTab === 'nails') {
            nailsBtn.className = "px-4 py-1.5 rounded-full text-xs font-medium transition bg-stone-900 text-white shadow";
            lashesBtn.className = "px-4 py-1.5 rounded-full text-xs font-medium transition text-stone-600 hover:text-stone-900 bg-stone-100";
        } else {
            lashesBtn.className = "px-4 py-1.5 rounded-full text-xs font-medium transition bg-stone-900 text-white shadow";
            nailsBtn.className = "px-4 py-1.5 rounded-full text-xs font-medium transition text-stone-600 hover:text-stone-900 bg-stone-100";
        }
    }

    const styleImages = getStyleImages();
    grid.innerHTML = items.map((item, idx) => {
        const img = styleImages[item.name];
        const media = img
            ? `<img src="${optimizeImg(img)}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">`
            : `<span class="text-rose-300 group-hover:text-rose-500 text-4xl transition"><i class="fa-solid ${item.icon}"></i></span>`;
        return `
        <button type="button" onclick="bookStyle('${currentCatalogTab}', ${idx})" class="group text-left bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-rose-300 shadow-sm hover:shadow-lg transition flex flex-col">
            <div class="aspect-[4/3] bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 flex items-center justify-center overflow-hidden">${media}</div>
            <div class="p-4 flex items-center justify-between gap-3">
                <span class="font-serif text-lg text-stone-900 font-medium leading-snug">${item.name}</span>
                <span class="shrink-0 w-8 h-8 rounded-full bg-stone-100 text-stone-700 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center transition">
                    <i class="fa-solid fa-calendar-plus text-xs"></i>
                </span>
            </div>
        </button>`;
    }).join('');
}

function bookStyle(category, index) {
    const item = catalogStyles[category][index];
    if (!item) return;
    closeCatalogModal();
    openBookingModal(item.name);
}

function openBookingModal(presetService = '') {
    if (presetService) {
        const serviceSelect = document.getElementById('bookService');
        if (serviceSelect) {
            const wanted = presetService.toLowerCase();
            let match = -1;
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value.toLowerCase() === wanted) { match = i; break; }
            }
            if (match === -1) {
                for (let i = 0; i < serviceSelect.options.length; i++) {
                    if (serviceSelect.options[i].value.toLowerCase().includes(wanted)) { match = i; break; }
                }
            }
            if (match !== -1) serviceSelect.selectedIndex = match;
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

// Live update listener across tabs
window.addEventListener('storage', (e) => {
    if (['nailz_nails_data', 'nailz_lashes_data', 'nailz_training_data', 'nailz_style_images'].includes(e.key)) {
        updateBadges();
        if (!document.getElementById('catalogModal').classList.contains('hidden')) {
            renderCatalogGrid();
        }
    }
});