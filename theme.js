// ============================================
// THEME MANAGEMENT
// Light/Dark Mode Toggle
// ============================================

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.setupListeners();
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    this.theme = theme;
    localStorage.setItem('theme', theme);
    
    // Update toggle button icon if it exists
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }

  toggle() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    
    // Add transition effect
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  }

  setupListeners() {
    // Find all theme toggle buttons
    const toggleBtns = document.querySelectorAll('.theme-toggle, #themeToggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }

  getTheme() {
    return this.theme;
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
