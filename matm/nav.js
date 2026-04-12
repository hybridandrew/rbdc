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
  
  // Mobile toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });
  
  // Mobile dropdown toggle
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.nav-dropdown');
    
    if (dropdown && window.innerWidth <= 768) {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
          item.classList.toggle('mobile-expanded');
        }
      });
    }
  });
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Close mobile menu on link click
  document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
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
