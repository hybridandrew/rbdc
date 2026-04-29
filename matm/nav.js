/* ===== MAGE AGAINST THE MACHINE - NAVIGATION JS ===== */

// Detect if we're in a subdirectory
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/sessions/')) {
    return '../';
  }
  return '';
}

// Navigation HTML template
function getNavHTML(currentPage) {
  const base = getBasePath();
  const isActive = (page) => currentPage === page ? 'active' : '';
  
  return `
  <nav class="main-nav" id="mainNav">
    <div class="nav-container">
      <a href="${base}index.html" class="nav-logo">
        <div class="nav-logo-icon">🔥</div>
        <span class="nav-logo-text">
          <span class="full">Mage Against The Machine</span>
          <span class="abbrev">MATM</span>
        </span>
      </a>
      
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <ul class="nav-menu" id="navMenu">
        <li class="nav-item">
          <a href="${base}overview.html" class="nav-link ${isActive('chronicle')}">Overview</a>
        </li>
        
        <li class="nav-item">
          <a href="#" class="nav-link ${isActive('characters')}">
            Characters <span class="arrow">▼</span>
          </a>
          <div class="nav-dropdown">
            <a href="${base}party.html" class="dropdown-link">
              <span class="icon">👥</span> The Party
            </a>
            <div class="dropdown-divider"></div>
            <a href="${base}semaj.html" class="dropdown-link">
              <span class="icon">✨</span> Semaj
            </a>
            <a href="${base}kaelia.html" class="dropdown-link">
              <span class="icon">🔥</span> Kaelia
            </a>
            <a href="${base}beldan.html" class="dropdown-link">
              <span class="icon">🔨</span> Beldan
            </a>
            <a href="${base}ekran.html" class="dropdown-link">
              <span class="icon">🗡️</span> Ekran
            </a>
            <a href="${base}valrex.html" class="dropdown-link">
              <span class="icon">⚔️</span> Valrex
            </a>
            <a href="${base}aster.html" class="dropdown-link">
              <span class="icon">🌟</span> Aster
            </a>
            <a href="${base}larry.html" class="dropdown-link">
              <span class="icon">🐺</span> Larry
            </a>
          </div>
        </li>
        
        <li class="nav-item">
          <a href="#" class="nav-link ${isActive('sessions')}">
            Chronicle <span class="arrow">▼</span>
          </a>
          <div class="nav-dropdown">
            <a href="${base}sessions.html" class="dropdown-link">
              <span class="icon">📚</span> All Sessions
            </a>
            <a href="${base}chronicle-timeline.html" class="dropdown-link">
              <span class="icon">📜</span> Legend So Far
            </a>
            <a href="${base}quotebook.html" class="dropdown-link">
              <span class="icon">💬</span> Quotebook
            </a>
            <a href="${base}killboard.html" class="dropdown-link">
              <span class="icon">💀</span> Kill Board
            </a>
          </div>
        </li>
        
        <li class="nav-item">
          <a href="#" class="nav-link ${isActive('world')}">
            World <span class="arrow">▼</span>
          </a>
          <div class="nav-dropdown">
            <a href="${base}npcs.html" class="dropdown-link">
              <span class="icon">🎭</span> NPCs
            </a>
            <a href="${base}locations.html" class="dropdown-link">
              <span class="icon">🗺️</span> Locations
            </a>
            <a href="${base}mysteries.html" class="dropdown-link">
              <span class="icon">❓</span> Mysteries
            </a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
  `;
}

// Initialize navigation
function initNav(currentPage = '') {
  // Insert nav at start of body
  document.body.insertAdjacentHTML('afterbegin', getNavHTML(currentPage));
  
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  
  // Hamburger toggle
  let menuOpen = false;
  toggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    toggle.classList.toggle('active', menuOpen);
    menu.classList.toggle('active', menuOpen);
  });

  // Dropdown toggle — works at ALL viewport sizes (fixes touch/hover gap on tablets)
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.nav-dropdown');

    if (dropdown && link.getAttribute('href') === '#') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.classList.toggle('is-open');
        // Close siblings
        document.querySelectorAll('.nav-item.is-open').forEach(other => {
          if (other !== item) other.classList.remove('is-open');
        });
      });
    }
  });

  // Close open dropdowns when clicking/tapping outside the nav
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.is-open').forEach(item => {
        item.classList.remove('is-open');
      });
    }
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        menuOpen = false;
        toggle.classList.remove('active');
        menu.classList.remove('active');
      }
    });
  });
}

// Auto-init if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initNav());
} else {
  // DOM already loaded, but wait for script to determine current page
  // Page should call initNav('pagename') manually
}

// ===== SCROLL REVEAL =====
// Adds .reveal to content cards on inner pages, then uses IntersectionObserver
// to add .visible as they enter the viewport. Not applied on index.html.
(function () {
  if (window.location.pathname.endsWith('index.html') ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/')) {
    return;
  }

  const CARD_SELECTORS = [
    '.info-card',
    '.mystery-card',
    '.npc-card',
    '.session-card',
    '.quote-card',
    '.character-card',
    '.timeline-entry',
    '.stat-card',
    '.kill-card',
    '.trophy-card',
    '.nat20-card',
    '.location-card',
    '.content-card',
    '.highlight-card',
    '.combat-card',
    '.spotlight-card',
    '.entry-card',
  ].join(',');

  function initReveal() {
    const cards = document.querySelectorAll(CARD_SELECTORS);
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    cards.forEach((card) => {
      card.classList.add('reveal');
      observer.observe(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
