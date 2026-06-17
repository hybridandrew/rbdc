/* ===== INTO THE HECKLE MIST - NAVIGATION JS ===== */

// Navigation HTML template
function getNavHTML(currentPage) {
  const isActive = (page) => currentPage === page ? 'active' : '';

  return `
  <nav class="main-nav" id="mainNav">
    <div class="nav-container">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-icon">🌫️</div>
        <span class="nav-logo-text">
          <span class="full">Into The Heckle Mist</span>
          <span class="abbrev">ITHM</span>
        </span>
      </a>

      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-menu" id="navMenu">
        <li class="nav-item">
          <a href="overview.html" class="nav-link ${isActive('overview')}">Overview</a>
        </li>

        <li class="nav-item">
          <a href="#" class="nav-link ${isActive('characters')}">
            Characters <span class="arrow">▼</span>
          </a>
          <div class="nav-dropdown">
            <a href="party.html" class="dropdown-link">
              <span class="icon">👥</span> The Party
            </a>
            <div class="dropdown-divider"></div>
            <a href="korrin.html" class="dropdown-link">
              <span class="icon">🌿</span> Korrin
            </a>
            <a href="flitter.html" class="dropdown-link">
              <span class="icon">🪶</span> Flitter
            </a>
          </div>
        </li>

        <li class="nav-item">
          <a href="sessions.html" class="nav-link ${isActive('sessions')}">Sessions</a>
        </li>

        <li class="nav-item">
          <a href="#" class="nav-link ${isActive('world')}">
            World <span class="arrow">▼</span>
          </a>
          <div class="nav-dropdown">
            <a href="npcs.html" class="dropdown-link">
              <span class="icon">🎭</span> NPCs
            </a>
            <a href="locations.html" class="dropdown-link">
              <span class="icon">🗺️</span> Locations
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

  // Dropdown toggle — CSS display:none/block controlled by is-open class
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.nav-dropdown');

    if (!dropdown || !link || link.getAttribute('href') !== '#') return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = item.classList.contains('is-open');

      // Close all open dropdowns
      document.querySelectorAll('.nav-item.is-open').forEach(i => i.classList.remove('is-open'));

      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });

  // Close dropdowns when tapping outside the nav
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.is-open').forEach(i => i.classList.remove('is-open'));
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
  // DOM already loaded — page should call initNav('pagename') manually
}

// ===== SCROLL REVEAL =====
// Adds .reveal to content cards on inner pages, then uses IntersectionObserver
// to add .visible as they enter the viewport.
(function () {
  if (window.location.pathname.endsWith('index.html') ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/')) {
    return;
  }

  const CARD_SELECTORS = [
    '.info-card',
    '.npc-card',
    '.session-card',
    '.character-card',
    '.location-card',
    '.content-card',
    '.stat-card',
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
