/* ============================================================
   VINIT METANGE PORTFOLIO — INTERACTIONS
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. THEME TOGGLE
     ---------------------------------------------------------- */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY   = 'vm-theme';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Init: respect saved preference, else default dark
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  /* ----------------------------------------------------------
     2. MOBILE NAV TOGGLE
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on link click
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });


  /* ----------------------------------------------------------
     3. STICKY HEADER ON SCROLL
     ---------------------------------------------------------- */
  const siteHeader = document.getElementById('siteHeader');

  function onScroll() {
    siteHeader.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ----------------------------------------------------------
     4. ACTIVE NAV LINK ON SCROLL
     ---------------------------------------------------------- */
  const sections  = document.querySelectorAll('section[id], div[id="top"]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }


  /* ----------------------------------------------------------
     5. SCROLL REVEAL (Intersection Observer)
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ----------------------------------------------------------
     6. CONTACT FORM HANDLER
     Front-end only — replace with real backend for production.
     Options: Formspree, Netlify Forms, EmailJS, your own API.
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formFields  = document.getElementById('formFields');
  const formSuccess = document.getElementById('formSuccess');
  const formSubmit  = document.getElementById('formSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        showFormError('Please fill in your name, email, and message.');
        return;
      }

      if (!isValidEmail(email)) {
        showFormError('Please enter a valid email address.');
        return;
      }

      // Disable submit while "sending"
      formSubmit.disabled = true;
      formSubmit.textContent = 'Sending…';

      /*
       * REPLACE: Wire up a real backend here.
       * Example with Formspree:
       *   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
       *     body: JSON.stringify({ name, email, message })
       *   });
       *   if (!res.ok) throw new Error('Network error');
       *
       * Example with Netlify Forms: add data-netlify="true" to the <form> tag.
       *
       * For now, we simulate a 1-second delay and show the success state.
       */
      await delay(1000);

      // Show success state
      formFields.style.display = 'none';
      formSuccess.classList.add('show');
    });
  }

  function showFormError(msg) {
    // Remove any existing error
    const existing = contactForm.querySelector('.form-error');
    if (existing) existing.remove();

    const err = document.createElement('p');
    err.className = 'form-error';
    err.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-bottom: 12px;';
    err.textContent = msg;
    formSubmit.before(err);

    // Auto-remove after 4 seconds
    setTimeout(() => err.remove(), 4000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /* ----------------------------------------------------------
     7. SMOOTH SCROLL FOR ANCHOR LINKS
     (Supplements CSS scroll-behavior for browsers that need it)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = siteHeader ? siteHeader.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ----------------------------------------------------------
     8. KEYBOARD ACCESSIBILITY — ESC closes mobile nav
     ---------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });

})();
