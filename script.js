// Initial Default Catalog Data
const defaultNails = [
    { title: "Vanilla Nude Chrome Set", category: "Nails", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800" },
    { title: "Blush Pink French Tip", category: "Nails", url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800" },
    { title: "Luxury Minimalist Sculpt", category: "Nails", url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800" }
];

const defaultLashes = [
    { title: "Soft Volume Lash Set", category: "Lashes", url: "https://images.unsplash.com/photo-1583001809873-a1284a5da537?auto=format&fit=crop&q=80&w=800" },
    { title: "Hybrid Wispy Extensions", category: "Lashes", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" },
    { title: "Natural Classic Extensions", category: "Lashes", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" }
];

// Initialize LocalStorage Data
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

// Global Variables
let nailsIndex = 0;
let lashesIndex = 0;
let currentCatalogTab = 'nails';

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Set minimum date selector for booking to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookDate').min = today;

    initHeroSlides();
    updateBadges();
});

// Auto-Rotating Hero Slideshow
function initHeroSlides() {
    const { nails, lashes } = loadData();

    const updateNailsHero = () => {
        if (nails.length > 0) {
            const imgEl = document.getElementById('hero-nails-img');
            imgEl.style.opacity = 0.3;
            setTimeout(() => {
                imgEl.src = nails[nailsIndex].url;
                imgEl.style.opacity = 1;
                nailsIndex = (nailsIndex + 1) % nails.length;
            }, 300);
        }
    };

    const updateLashesHero = () => {
        if (lashes.length > 0) {
            const imgEl = document.getElementById('hero-lashes-img');
            imgEl.style.opacity = 0.3;
            setTimeout(() => {
                imgEl.src = lashes[lashesIndex].url;
                imgEl.style.opacity = 1;
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
    document.getElementById('nails-count-badge').textContent = `${nails.length} Styles`;
    document.getElementById('lashes-count-badge').textContent = `${lashes.length} Styles`;
}

// Mobile Nav Toggle
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

// Catalog Modal Logic
function openCatalogModal(category = 'nails') {
    currentCatalogTab = category;
    document.getElementById('catalogModal').classList.remove('hidden');
    renderCatalogGrid();
}

function closeCatalogModal() {
    document.getElementById('catalogModal').classList.add('hidden');
}

function switchCatalogTab(tab) {
    currentCatalogTab = tab;
    renderCatalogGrid();
}

function renderCatalogGrid() {
    const { nails, lashes } = loadData();
    const grid = document.getElementById('catalogGrid');
    const title = document.getElementById('catalogModalTitle');
    const items = currentCatalogTab === 'nails' ? nails : lashes;

    title.textContent = currentCatalogTab === 'nails' ? 'Nails Catalog' : 'Lashes Catalog';

    // Update Tab Styles
    const nailsBtn = document.getElementById('tab-btn-nails');
    const lashesBtn = document.getElementById('tab-btn-lashes');

    if (currentCatalogTab === 'nails') {
        nailsBtn.className = "px-4 py-1.5 rounded-full font-medium transition bg-stone-900 text-white shadow";
        lashesBtn.className = "px-4 py-1.5 rounded-full font-medium transition text-stone-600 hover:text-stone-900";
    } else {
        lashesBtn.className = "px-4 py-1.5 rounded-full font-medium transition bg-stone-900 text-white shadow";
        nailsBtn.className = "px-4 py-1.5 rounded-full font-medium transition text-stone-600 hover:text-stone-900";
    }

    grid.innerHTML = items.map((item) => `
        <div class="bg-white rounded-2xl overflow-hidden border border-warmnude-100 shadow-sm hover:shadow-md transition group">
            <div class="aspect-square relative overflow-hidden bg-stone-100">
                <img src="${item.url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            <div class="p-4 flex items-center justify-between">
                <div>
                    <h4 class="font-serif text-lg text-stone-900 font-medium">${item.title}</h4>
                    <span class="text-[10px] text-stone-400 uppercase tracking-widest">${item.category}</span>
                </div>
                <button onclick="closeCatalogModal(); openBookingModal('${item.title}');" class="w-8 h-8 rounded-full bg-vanilla-100 text-stone-700 hover:bg-blush-500 hover:text-white flex items-center justify-center transition">
                    <i class="fa-solid fa-calendar-plus text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Booking Modal Logic
function openBookingModal(presetService = '') {
    if (presetService) {
        const serviceSelect = document.getElementById('bookService');
        for (let i = 0; i < serviceSelect.options.length; i++) {
            if (serviceSelect.options[i].value.toLowerCase().includes(presetService.toLowerCase())) {
                serviceSelect.selectedIndex = i;
                break;
            }
        }
    }
    document.getElementById('bookingModal').classList.remove('hidden');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
}

function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('bookName').value.trim();
    const clientPhone = document.getElementById('bookPhone').value.trim();
    const service = document.getElementById('bookService').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;

    const helenWhatsAppNumber = "233547900382";
    const helenCallNumber = "0502971399";

    // 1. WhatsApp Message for Helen (Merchant)
    const merchantMessage = `✨ *NEW BOOKING REQUEST - NAILZ BY HELEN* ✨\n\n` +
                            `👤 *Client Name:* ${name}\n` +
                            `📞 *Client Phone:* ${clientPhone}\n` +
                            `💅 *Service:* ${service}\n` +
                            `📅 *Booking Date:* ${date}\n` +
                            `⏰ *Booking Time:* ${time}\n\n` +
                            `Please confirm this appointment slot!`;

    // 2. WhatsApp Message Copy for Customer
    const customerMessage = `💖 *BOOKING CONFIRMATION COPY - NAILZ BY HELEN* 💖\n\n` +
                            `Hello ${name},\n` +
                            `Here are your booking details:\n\n` +
                            `💅 *Service:* ${service}\n` +
                            `📅 *Date:* ${date}\n` +
                            `⏰ *Time Slot:* ${time}\n` +
                            `📞 *Your Phone:* ${clientPhone}\n\n` +
                            `If you need to make changes, contact Helen:\n` +
                            `• WhatsApp: 0547900382\n` +
                            `• Direct Call: ${helenCallNumber}\n\n` +
                            `Thank you for choosing Nailz by Helen!`;

    // Format URLs for WhatsApp
    const merchantUrl = `https://wa.me/${helenWhatsAppNumber}?text=${encodeURIComponent(merchantMessage)}`;

    // Clean client phone for WhatsApp standard format (assumes local 0... converts to Ghana country code 233)
    let formattedClientPhone = clientPhone.replace(/\D/g, '');
    if (formattedClientPhone.startsWith('0')) {
        formattedClientPhone = '233' + formattedClientPhone.substring(1);
    }
    const customerUrl = `https://wa.me/${formattedClientPhone}?text=${encodeURIComponent(customerMessage)}`;

    // Open WhatsApp to send to Helen
    window.open(merchantUrl, '_blank');

    // Optionally send copy to client if valid phone number is entered
    if (formattedClientPhone.length >= 10) {
        setTimeout(() => {
            window.open(customerUrl, '_blank');
        }, 1000);
    }

    alert(`Thank you, ${name}! Your booking request for ${service} on ${date} at ${time} has been prepared. Please click send in WhatsApp to finalize with Helen.`);
    closeBookingModal();
}