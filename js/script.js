// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.hidden = !mobileMenu.hidden;
        const spans = menuToggle.querySelectorAll('span');
        menuToggle.classList.toggle('open');
        if (menuToggle.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(2px, -2px)';
            spans[2].style.width = '1.5rem';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
            spans[2].style.width = '';
        }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.hidden = true;
            menuToggle.classList.remove('open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
            spans[2].style.width = '';
        });
    });
}

// ===== Navbar scroll shrink =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('is-scrolled');
    } else {
        navbar.classList.remove('is-scrolled');
    }
}, { passive: true });

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    let currentId = '';

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
            currentId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' && !currentId) {
            link.classList.add('active');
        } else if (href === '#' + currentId) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// ===== Smooth scroll for all anchors =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== Custom Toast =====
function showToast(title, message) {
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;
    document.getElementById('toast-overlay').classList.add('active');
    document.getElementById('toast-box').classList.add('active');
}

function closeToast() {
    document.getElementById('toast-overlay').classList.remove('active');
    document.getElementById('toast-box').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('toast-overlay');
    if (overlay) overlay.addEventListener('click', closeToast);

    // ===== Form submission → Excel export =====
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('res-name').value.trim();
        const phone = document.getElementById('res-phone').value.trim();
        const guests = document.getElementById('res-guests').value;
        const datetime = document.getElementById('res-datetime').value;

        if (!name || !phone || !datetime) {
            showToast('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin đặt bàn.');
            return;
        }

        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Đang xử lý...';
        btn.disabled = true;

        setTimeout(() => {
            const now = new Date();
            const timestamp = now.toLocaleString('vi-VN');
            const formattedDT = datetime.replace('T', ' ');

            try {
                const data = [
                    ['Họ và tên', 'Số điện thoại', 'Số khách', 'Ngày & Giờ', 'Thời gian đặt'],
                    [name, phone, guests, formattedDT, timestamp]
                ];

                const ws = XLSX.utils.aoa_to_sheet(data);
                ws['!cols'] = [
                    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 22 }
                ];

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Đặt bàn');
                XLSX.writeFile(wb, `DatBan_${name}_${now.getTime()}.xlsx`);
            } catch (err) {
                console.error('XLSX export failed:', err);
            }

            btn.innerText = 'Đặt bàn thành công!';
            btn.style.backgroundColor = '#52652a';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
                this.reset();
            }, 3000);
        }, 800);
    });
});

// ===== Dynamic Menu from menu.json =====
let menuData = null;
let activeCategory = 'Tất cả';

async function loadMenu() {
    try {
        const res = await fetch('menu.json');
        menuData = await res.json();
        renderTabs();
        renderMenu();
    } catch (err) {
        console.error('Failed to load menu:', err);
        document.getElementById('menu-grid').innerHTML =
            '<p class="menu-empty">Không thể tải thực đơn.</p>';
    }
}

function renderTabs() {
    const tabsContainer = document.getElementById('menu-tabs');
    tabsContainer.innerHTML = menuData.categories.map(cat => `
        <button
            class="menu-tab ${cat === activeCategory ? 'is-active' : ''}"
            data-category="${cat}"
        >${cat}</button>
    `).join('');

    tabsContainer.querySelectorAll('.menu-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeCategory = tab.dataset.category;
            renderTabs();
            renderMenu();
        });
    });
}

// ===== Menu Card: image + name only =====
function renderMenu(animate = true) {
    const grid = document.getElementById('menu-grid');
    let filtered = activeCategory === 'Tất cả'
        ? [...menuData.menu]
        : menuData.menu.filter(item => item.category === activeCategory);
    filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="menu-empty">Chưa có món trong danh mục này.</p>';
        return;
    }

    grid.innerHTML = filtered.map((item, index) => `
        <div class="menu-card ${animate ? 'menu-card-enter' : ''}"
             style="${animate ? `animation-delay: ${index * 60}ms` : ''}"
             data-index="${menuData.menu.indexOf(item)}">
            <div class="menu-card-image" style="background-image: url('${item.image}');"></div>
            <div class="menu-card-body">
                <h3>${item.name}</h3><span>Nhấn để xem chi tiết</span>
            </div>
        </div>
    `).join('');
}

// ===== Menu Popup =====
const popupOverlay = document.getElementById('menu-popup-overlay');
const popup = document.getElementById('menu-popup');
const popupClose = document.getElementById('menu-popup-close');
const popupImg = document.getElementById('menu-popup-img');
const popupName = document.getElementById('menu-popup-name');
const popupCategory = document.getElementById('menu-popup-category');
const popupDesc = document.getElementById('menu-popup-desc');
const popupPrice = document.getElementById('menu-popup-price');

function openMenuPopup(index) {
    const item = menuData.menu[index];
    if (!item) return;

    popupImg.src = item.image;
    popupImg.alt = item.name;
    popupName.textContent = item.name;
    popupCategory.textContent = item.category;
    popupDesc.textContent = item.description;
    popupPrice.textContent = item.price;

    popupOverlay.classList.add('active');
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenuPopup() {
    popupOverlay.classList.remove('active');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

popupClose.addEventListener('click', closeMenuPopup);
popupOverlay.addEventListener('click', closeMenuPopup);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenuPopup();
});

// ===== Menu card click delegation =====
document.getElementById('menu-grid').addEventListener('click', function (e) {
    const card = e.target.closest('.menu-card');
    if (!card) return;
    openMenuPopup(parseInt(card.dataset.index, 10));
});

loadMenu();
