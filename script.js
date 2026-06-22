// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
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
            mobileMenu.classList.add('hidden');
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
        navbar.classList.add('py-2');
        navbar.classList.remove('py-4');
        navbar.classList.add('shadow-md');
        navbar.classList.remove('shadow-sm');
    } else {
        navbar.classList.remove('py-2');
        navbar.classList.add('py-4');
        navbar.classList.remove('shadow-md');
        navbar.classList.add('shadow-sm');
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

document.getElementById('toast-overlay').addEventListener('click', closeToast);


// ===== Form submission → Excel export =====
document.querySelector('form').addEventListener('submit', function(e) {
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
            '<p class="col-span-full text-center text-on-surface-variant">Không thể tải thực đơn.</p>';
    }
}

function renderTabs() {
    const tabsContainer = document.getElementById('menu-tabs');
    tabsContainer.innerHTML = menuData.categories.map(cat => `
        <button
            class="menu-tab px-5 py-2 rounded-sm font-label-md text-body-md border transition-all duration-300 ${cat === activeCategory ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'}"
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

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    let filtered = activeCategory === 'Tất cả'
        ? [...menuData.menu]
        : menuData.menu.filter(item => item.category === activeCategory);
    filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">Chưa có món trong danh mục này.</p>';
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div class="menu-card bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative">
            <div class="h-64 overflow-hidden relative">
                <div class="w-full h-full transform group-hover:scale-105 transition-transform duration-500 bg-cover bg-center" style="background-image: url('${item.image}');"></div>
                ${item.popular ? '<span class="absolute top-3 left-3 bg-primary text-on-primary text-caption font-label-md px-3 py-1 rounded-full flex items-center gap-1 shadow-md"><span class="material-symbols-outlined text-sm leading-none" style="font-size:14px;">local_fire_department</span>Phổ biến</span>' : ''}
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-2 gap-2">
                    <h3 class="font-headline-md text-headline-md text-on-surface">${item.name}</h3>
                    <span class="shrink-0 bg-secondary-container text-on-secondary-container text-caption font-label-md px-2 py-0.5 rounded-sm">${item.category}</span>
                </div>
                <p class="font-body-md text-on-surface-variant mb-4">${item.description}</p>
                <span class="font-headline-md text-primary">${item.price}</span>
            </div>
        </div>
    `).join('');
}

loadMenu();
