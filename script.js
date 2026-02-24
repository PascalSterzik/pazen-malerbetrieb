/* ==========================================================================
   Pazen Malerbetrieb - Premium JavaScript
   ========================================================================== */

// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
            nav.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });
}

// Header: shadow on scroll + hide-on-scroll-down / show-on-scroll-up
const header = document.getElementById('header');
const scrollProgress = document.querySelector('.scroll-progress');
let lastScroll = 0;
let ticking = false;

function onScroll() {
    const currentScroll = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Header shadow
    if (header) {
        header.classList.toggle('scrolled', currentScroll > 20);

        // Hide/show nav on scroll direction
        if (currentScroll > 100) {
            if (currentScroll > lastScroll + 5) {
                header.classList.add('nav-hidden');
            } else if (currentScroll < lastScroll - 5) {
                header.classList.remove('nav-hidden');
            }
        } else {
            header.classList.remove('nav-hidden');
        }
    }

    // Scroll progress bar
    if (scrollProgress && docHeight > 0) {
        const progress = (currentScroll / docHeight) * 100;
        scrollProgress.style.width = progress + '%';
    }

    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });

// Scroll reveal with stagger support
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Stagger children
            if (entry.target.classList.contains('stagger-parent')) {
                const children = entry.target.children;
                Array.from(children).forEach((child, i) => {
                    child.style.transitionDelay = (i * 0.1) + 's';
                });
            }

            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in, .stagger-parent').forEach(el => revealObserver.observe(el));

// Counter animation for stats
function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const hasDecimal = String(target).includes('.');
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (hasDecimal) {
            el.textContent = prefix + current.toFixed(1).replace('.', ',') + suffix;
        } else {
            el.textContent = prefix + Math.round(current) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-grid').forEach(el => counterObserver.observe(el));

// Gallery filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
let currentLightboxIndex = 0;
let lightboxImages = [];

function openLightbox(index) {
    lightboxImages = [];
    document.querySelectorAll('.gallery-item:not([style*="display: none"]) img').forEach(img => {
        lightboxImages.push(img.src);
    });
    currentLightboxIndex = index;
    if (lightbox && lightboxImg && lightboxImages.length > 0) {
        lightboxImg.src = lightboxImages[currentLightboxIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function navigateLightbox(dir) {
    currentLightboxIndex += dir;
    if (currentLightboxIndex < 0) currentLightboxIndex = lightboxImages.length - 1;
    if (currentLightboxIndex >= lightboxImages.length) currentLightboxIndex = 0;
    if (lightboxImg) lightboxImg.src = lightboxImages[currentLightboxIndex];
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
});

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Wird gesendet...';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = 'Nachricht gesendet ✓';
            btn.style.background = 'var(--accent)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
                contactForm.reset();
            }, 3000);
        }, 1200);
    });
}

// Paint drip animation trigger
const paintDrips = document.getElementById('paintDrips');
if (paintDrips) {
    const dripObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                paintDrips.classList.add('paint-drips-visible');
                dripObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    dripObserver.observe(paintDrips);
}

// Back to top button
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
