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

// ===== Form submission micro-interaction =====
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Đang xử lý...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = 'Đặt bàn thành công!';
        btn.style.backgroundColor = '#52652a';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = '';
            btn.disabled = false;
            this.reset();
        }, 3000);
    }, 1500);
});
