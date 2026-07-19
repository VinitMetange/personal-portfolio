/* ============================================================
   VINIT METANGE PORTFOLIO v2 — INTERACTIONS
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
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  themeToggle.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });


  /* ----------------------------------------------------------
     2. TAB NAVIGATION
  ---------------------------------------------------------- */
  const tabLinks  = document.querySelectorAll('.tab-link');
  const tabPanels = document.querySelectorAll('.tab-panel');
  let githubFetched = false;

  // Declared here so switchTab can reference them safely
  const navToggle = document.getElementById('navToggle');
  const tabNav    = document.getElementById('tabNav');

  function switchTab(tabName, pushState) {
    tabPanels.forEach(p => p.classList.remove('active'));
    tabLinks.forEach(l => l.classList.remove('active'));

    const panel = document.getElementById('tab-' + tabName);
    const links = document.querySelectorAll('.tab-link[data-tab="' + tabName + '"]');
    if (!panel) return;

    panel.classList.add('active');
    links.forEach(l => l.classList.add('active'));

    if (pushState !== false) {
      history.pushState({ tab: tabName }, '', '#' + tabName);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerReveal(panel);

    if (tabName === 'work' && !githubFetched) {
      fetchGitHubRepos();
      githubFetched = true;
    }

    // Close mobile nav
    if (tabNav)    tabNav.classList.remove('open');
    if (navToggle) { navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
  }

  tabLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Intercept all data-tab links (CTAs in panels)
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-tab]');
    if (!el || el.classList.contains('tab-link')) return;
    e.preventDefault();
    switchTab(el.dataset.tab);
  });

  // Handle back/forward
  window.addEventListener('popstate', e => {
    const tab = (e.state && e.state.tab) || 'home';
    switchTab(tab, false);
  });

  // Init from URL hash
  const initHash = location.hash.replace('#', '') || 'home';
  switchTab(initHash, false);


  /* ----------------------------------------------------------
     3. MOBILE NAV TOGGLE (navToggle + tabNav already declared above)
  ---------------------------------------------------------- */

  navToggle.addEventListener('click', () => {
    const isOpen = tabNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.addEventListener('click', e => {
    if (tabNav.classList.contains('open') &&
        !tabNav.contains(e.target) &&
        !navToggle.contains(e.target)) {
      tabNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && tabNav.classList.contains('open')) {
      tabNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });


  /* ----------------------------------------------------------
     4. STICKY HEADER
  ---------------------------------------------------------- */
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


  /* ----------------------------------------------------------
     5. SCROLL REVEAL
  ---------------------------------------------------------- */
  function triggerReveal(panel) {
    if (!panel) return;
    const els = Array.from(panel.querySelectorAll('.reveal'));
    els.forEach(el => el.classList.remove('visible'));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach(el => el.classList.add('visible'));
      });
    });
  }


  /* ----------------------------------------------------------
     6. SUB-TABS
  ---------------------------------------------------------- */
  document.querySelectorAll('.subtab-bar').forEach(bar => {
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.subtab');
      if (!btn) return;

      const bar    = btn.closest('.subtab-bar');
      const panels = btn.closest('.tab-panel, .container').querySelectorAll('.subtab-panel');

      bar.querySelectorAll('.subtab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.classList.add('active');
        triggerReveal(target);
      }
    });
  });


  /* ----------------------------------------------------------
     7. WORK TAB — FILTER BUTTONS
  ---------------------------------------------------------- */
  const filterBar = document.querySelector('.work-filter');
  if (filterBar) {
    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  }


  /* ----------------------------------------------------------
     8. GITHUB API — LIVE REPOS
  ---------------------------------------------------------- */
  const LANG_COLORS = {
    Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#2b7489',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
    Jupyter: '#DA5B0B', Go: '#00ADD8',
  };

  async function fetchGitHubRepos() {
    const grid = document.getElementById('githubGrid');
    if (!grid) return;

    try {
      const res = await fetch('https://api.github.com/users/VinitMetange/repos?sort=updated&per_page=30&type=owner');
      if (!res.ok) throw new Error('GitHub API error ' + res.status);
      const repos = await res.json();

      const filtered = repos
        .filter(r => !r.fork && r.description)
        .slice(0, 12);

      if (!filtered.length) throw new Error('No repos');

      grid.innerHTML = filtered.map(r => {
        const color = LANG_COLORS[r.language] || '#8888b8';
        const stars = r.stargazers_count;
        const forks = r.forks_count;
        return `
          <div class="github-card">
            <div class="github-card-name">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0;color:var(--text-3)" aria-hidden="true"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M3 7l9 6 9-6"/></svg>
              <a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${r.name}</a>
            </div>
            <div class="github-card-desc">${escHtml(r.description)}</div>
            <div class="github-card-meta">
              ${r.language ? `<span class="github-lang"><span class="github-lang-dot" style="background:${color}"></span>${r.language}</span>` : ''}
              ${stars ? `<span class="github-stat"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:12px;height:12px" aria-hidden="true"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>${stars}</span>` : ''}
              ${forks ? `<span class="github-stat"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:12px;height:12px" aria-hidden="true"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>${forks}</span>` : ''}
            </div>
          </div>`;
      }).join('');

    } catch (err) {
      const grid = document.getElementById('githubGrid');
      if (grid) grid.innerHTML = `<div id="githubError">Could not load repos — <a href="https://github.com/VinitMetange" target="_blank" rel="noopener noreferrer" style="color:var(--accent-text)">view on GitHub</a></div>`;
    }
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }


  /* ----------------------------------------------------------
     9. CONTACT FORM (Formspree)
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formFields  = document.getElementById('formFields');
  const formSuccess = document.getElementById('formSuccess');
  const formSubmit  = document.getElementById('formSubmit');

  // REPLACE YOUR_FORM_ID with ID from formspree.io/forms
  const FORMSPREE_ID = 'YOUR_FORM_ID';

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) { showFormError('Please fill in your name, email, and message.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormError('Please enter a valid email address.'); return; }

      formSubmit.disabled = true;
      formSubmit.textContent = 'Sending…';

      try {
        const type = document.getElementById('contactType').value;
        const res  = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, email, type, message }),
        });
        if (!res.ok) throw new Error('Network error');
        formFields.style.display = 'none';
        formSuccess.classList.add('show');
      } catch {
        formSubmit.disabled = false;
        formSubmit.textContent = 'Send Message';
        showFormError('Something went wrong. Please email me directly at vinit.metange30@gmail.com');
      }
    });

    function showFormError(msg) {
      contactForm.querySelector('.form-error')?.remove();
      const err = document.createElement('p');
      err.className = 'form-error';
      err.textContent = msg;
      formSubmit.before(err);
      setTimeout(() => err.remove(), 5000);
    }
  }


  /* ----------------------------------------------------------
     10. NEWSLETTER FORM — client-side guard
  ---------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      const email = newsletterForm.querySelector('input[type="email"]').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button');
        const orig = btn.textContent;
        btn.textContent = 'Enter a valid email';
        setTimeout(() => btn.textContent = orig, 3000);
      }
      // If valid, form submits naturally to Substack (target="_blank")
    });
  }

})();
