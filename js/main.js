/* ═══════════════════════════════════════════════════════════
   CHARL ROSSOUW PORTFOLIO — main.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Footer year ──────────────────────────────────────── */
  function initYear() {
    var el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── 2. Nav scroll state (glassmorphism) ─────────────────── */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    function update() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', update, { passive: true });
    update(); // run once on load (handles pre-scrolled page)
  }

  /* ── 3. Mobile menu (fullscreen overlay) ─────────────────── */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var overlay   = document.getElementById('mobileOverlay');
    if (!hamburger || !overlay) return;

    var items = overlay.querySelectorAll('.mobile-overlay__links li');

    function openMenu() {
      hamburger.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
      document.body.style.overflow = 'hidden';

      // Stagger each link in
      items.forEach(function (item, i) {
        item.style.transitionDelay = (0.08 + i * 0.08) + 's';
      });
    }

    function closeMenu() {
      // Reset delays so links snap back instantly
      items.forEach(function (item) {
        item.style.transitionDelay = '0s';
      });

      hamburger.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      if (overlay.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when any overlay link is clicked
    overlay.querySelectorAll('.mobile-overlay__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* ── 4. Active nav link (IntersectionObserver) ───────────── */
  function initNavActiveState() {
    var sections  = document.querySelectorAll('section[id]');
    var navLinks  = document.querySelectorAll('.nav__link');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('nav--active', link.getAttribute('href') === id);
          });
        }
      });
    }, {
      // Fire when a section crosses the horizontal band in the middle of the viewport
      rootMargin: '-38% 0px -58% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ── 5. Scroll fade-in animations ────────────────────────── */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    // If reduced motion: make everything visible immediately, bail out
    if (prefersReducedMotion) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once, stop watching
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 0px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── 6. Contact form (client-side validation) ────────────── */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    function showError(input, message) {
      input.classList.add('is-invalid');
      var errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(input) {
      input.classList.remove('is-invalid');
      var errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.textContent = '';
    }

    // Clear errors as user types
    form.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('input', function () { clearError(input); });
    });

    form.addEventListener('submit', function (e) {
      var nameEl    = document.getElementById('name');
      var emailEl   = document.getElementById('email');
      var messageEl = document.getElementById('message');
      var hasError  = false;

      if (!nameEl.value.trim()) {
        showError(nameEl, 'Please enter your name.');
        hasError = true;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailEl.value.trim() || !emailRegex.test(emailEl.value.trim())) {
        showError(emailEl, 'Please enter a valid email address.');
        hasError = true;
      }

      if (!messageEl.value.trim() || messageEl.value.trim().length < 10) {
        showError(messageEl, 'Please enter a message (at least 10 characters).');
        hasError = true;
      }

      if (hasError) {
        e.preventDefault(); // block mailto: from firing if validation fails
        // Focus first invalid field
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  /* ── 7. Project carousels ────────────────────────────────── */
  function initCarousels() {
    document.querySelectorAll('.carousel').forEach(function (carousel) {
      var track  = carousel.querySelector('.carousel__track');
      var slides = carousel.querySelectorAll('.carousel__slide');
      var dots   = carousel.querySelector('.carousel__dots');
      var btnPrev = carousel.querySelector('.carousel__btn--prev');
      var btnNext = carousel.querySelector('.carousel__btn--next');

      if (!track || !slides.length) return;

      // Hide controls when only one slide
      if (slides.length <= 1) {
        carousel.setAttribute('data-single', 'true');
        return;
      }

      var current = 0;

      // Build dots
      if (dots) {
        dots.innerHTML = '';
        slides.forEach(function (_, i) {
          var dot = document.createElement('span');
          dot.className = 'carousel__dot' + (i === 0 ? ' carousel__dot--active' : '');
          dot.addEventListener('click', function () { goTo(i); });
          dots.appendChild(dot);
        });
      }

      function goTo(index) {
        slides[current].classList.remove('carousel__slide--active');
        if (dots) dots.querySelectorAll('.carousel__dot')[current].classList.remove('carousel__dot--active');

        current = (index + slides.length) % slides.length;

        slides[current].classList.add('carousel__slide--active');
        if (dots) dots.querySelectorAll('.carousel__dot')[current].classList.add('carousel__dot--active');

        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      }

      if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
      if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

      // Auto-advance every 4.5s
      if (!prefersReducedMotion) {
        setInterval(function () { goTo(current + 1); }, 4500);
      }

      // Swipe support (touch)
      var touchStartX = 0;
      carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      carousel.addEventListener('touchend', function (e) {
        var delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
      }, { passive: true });
    });
  }

  /* ── 8. Mouse parallax on hero orbs (subtle depth) ──────── */
  function initOrbParallax() {
    if (prefersReducedMotion) return;

    var hero = document.querySelector('.hero');
    var orbs = [
      { el: document.querySelector('.orb-1'), factor: 0.025 },
      { el: document.querySelector('.orb-2'), factor: -0.018 },
      { el: document.querySelector('.orb-3'), factor: 0.014 }
    ];

    // Filter out missing elements
    orbs = orbs.filter(function (o) { return o.el !== null; });
    if (!hero || !orbs.length) return;

    var centerX = window.innerWidth  / 2;
    var centerY = window.innerHeight / 2;
    var ticking = false;
    var mx = 0, my = 0;

    hero.addEventListener('mousemove', function (e) {
      mx = e.clientX - centerX;
      my = e.clientY - centerY;

      if (!ticking) {
        requestAnimationFrame(function () {
          orbs.forEach(function (o) {
            var dx = mx * o.factor;
            var dy = my * o.factor;
            o.el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    });

    // Reset on mouse leave
    hero.addEventListener('mouseleave', function () {
      requestAnimationFrame(function () {
        orbs.forEach(function (o) {
          o.el.style.transform = '';
        });
      });
    });

    // Recalculate center on resize
    window.addEventListener('resize', function () {
      centerX = window.innerWidth  / 2;
      centerY = window.innerHeight / 2;
    }, { passive: true });
  }

  /* ── Init ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initYear();
    initNavScroll();
    initMobileMenu();
    initNavActiveState();
    initScrollAnimations();
    initContactForm();
    initCarousels();
    initOrbParallax();
  });

})();
