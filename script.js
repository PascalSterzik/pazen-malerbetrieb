/* ==========================================================================
   Pazen Malerbetrieb — Premium JavaScript
   Enhanced interactions, smooth animations, FAQ accordion,
   lightbox with zoom, counter animations, mobile-first
   ========================================================================== */

(function() {
    'use strict';

    /* ── Mobile Navigation ── */
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('open');
            hamburger.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ── Header: Morphing Navbar ── */
    const header = document.getElementById('header');
    const scrollProgress = document.querySelector('.scroll-progress');
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const currentScroll = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (header) {
            header.classList.toggle('scrolled', currentScroll > 20);
            if (currentScroll > 120) {
                if (currentScroll > lastScroll + 8) {
                    header.classList.add('nav-hidden');
                } else if (currentScroll < lastScroll - 8) {
                    header.classList.remove('nav-hidden');
                }
            } else {
                header.classList.remove('nav-hidden');
            }
        }

        if (scrollProgress && docHeight > 0) {
            scrollProgress.style.width = ((currentScroll / docHeight) * 100) + '%';
        }

        lastScroll = currentScroll;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    /* ── Scroll Reveal (IntersectionObserver) ── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger children with reset
                if (entry.target.classList.contains('stagger-parent')) {
                    Array.from(entry.target.children).forEach((child, i) => {
                        child.style.transitionDelay = (i * 0.1) + 's';
                    });
                }

                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in, .stagger-parent').forEach(el => revealObserver.observe(el));

    /* ── Counter Animation ── */
    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const hasDecimal = String(target).includes('.');
        const duration = 2200;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (hasDecimal) {
                el.textContent = prefix + current.toFixed(1).replace('.', ',') + suffix;
            } else {
                el.textContent = prefix + Math.round(current) + suffix;
            }

            if (progress < 1) requestAnimationFrame(update);
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

    /* ── Gallery Filter ── */
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
                        item.style.animation = 'fadeScaleIn 0.4s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ── Lightbox with Zoom ── */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    let currentLightboxIndex = 0;
    let lightboxImages = [];

    function updateLightboxCounter() {
        if (lightboxCounter && lightboxImages.length > 0) {
            lightboxCounter.textContent = (currentLightboxIndex + 1) + ' / ' + lightboxImages.length;
        }
    }

    function openLightbox(index) {
        lightboxImages = [];
        document.querySelectorAll('.gallery-item:not([style*="display: none"]) img').forEach(img => {
            lightboxImages.push(img.src);
        });
        currentLightboxIndex = index;
        if (lightbox && lightboxImg && lightboxImages.length > 0) {
            lightboxImg.src = lightboxImages[currentLightboxIndex];
            lightboxImg.classList.remove('zoomed');
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateLightboxCounter();
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            if (lightboxImg) lightboxImg.classList.remove('zoomed');
        }
    }

    function navigateLightbox(dir) {
        currentLightboxIndex += dir;
        if (currentLightboxIndex < 0) currentLightboxIndex = lightboxImages.length - 1;
        if (currentLightboxIndex >= lightboxImages.length) currentLightboxIndex = 0;
        if (lightboxImg) {
            lightboxImg.classList.remove('zoomed');
            lightboxImg.src = lightboxImages[currentLightboxIndex];
        }
        updateLightboxCounter();
    }

    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.classList.toggle('zoomed');
        });
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

    // Touch swipe for lightbox
    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 60) {
                navigateLightbox(diff > 0 ? -1 : 1);
            }
        }, { passive: true });
    }

    /* ── FAQ Accordion ── */
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item.active').forEach(openItem => {
                openItem.classList.remove('active');
            });

            // Open clicked (if it wasn't already open)
            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });

    /* ── Contact Form ── */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Wird gesendet...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'Nachricht gesendet';
                btn.style.background = 'var(--accent)';
                btn.style.opacity = '1';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                    contactForm.reset();
                }, 3000);
            }, 1200);
        });
    }

    /* ── Paint Drip Animation Trigger ── */
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

    /* ── Back to Top ── */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Smooth Scroll for Anchor Links ── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const headerOffset = header ? header.offsetHeight + 20 : 80;
                const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ── Magnetic Button Effect (Desktop) ── */
    if (window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.btn-accent, .btn-outline').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ── Gallery Fade-Scale Animation Keyframes ── */
    if (!document.getElementById('dynamicStyles')) {
        const style = document.createElement('style');
        style.id = 'dynamicStyles';
        style.textContent = `
            @keyframes fadeScaleIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

})();
