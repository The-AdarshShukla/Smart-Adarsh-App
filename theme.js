// js/theme.js - Handles all theme-related functionality
class ThemeManager {
  constructor() {
    this.config = {
      darkMode: false,
      themeColorMetaId: 'theme-color-meta',
      darkThemeColor: '#1a1a2e',
      lightThemeColor: '#4361ee',
      iconMap: {
        dark: 'fa-sun',
        light: 'fa-moon'
      },
      themeClasses: {
        dark: 'dark-mode',
        light: 'light-mode'
      },
      musicIconColors: {
        dark: '#ffffff',  // white in dark mode
        light: '#4361ee'  // primary color in light mode
      }
    };

    this.elements = {
      themeToggle: document.getElementById('theme-toggle'),
      themeColorMeta: null,
      musicIcon: document.getElementById('music-icon')
    };
  }

  // Initialize theme manager
  init() {
    this.loadThemePreference();
    this.setupThemeToggle();
    this.setupSystemPreferenceListener();
    this.updateThemeColorMeta();
    this.updateMusicIcon(); // Initialize music icon color
  }

  // Load saved theme preference or detect system preference
  loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.config.darkMode = savedTheme 
      ? savedTheme === 'dark'
      : systemPrefersDark;
    
    this.applyTheme(this.config.darkMode);
  }

  // Apply theme to the document
  applyTheme(isDark) {
    this.config.darkMode = isDark;
    
    // Update body classes
    document.body.classList.remove(
      isDark ? this.config.themeClasses.light : this.config.themeClasses.dark
    );
    document.body.classList.add(
      isDark ? this.config.themeClasses.dark : this.config.themeClasses.light
    );

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update UI elements
    this.updateThemeToggleIcon();
    this.updateThemeColorMeta();
    this.updateMusicIcon();
    
    // Dispatch event for other modules
    this.dispatchThemeChangeEvent();
  }

  // Set up theme toggle button
  setupThemeToggle() {
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
      this.updateThemeToggleIcon();
    }
  }

  // Toggle between dark/light theme
  toggleTheme() {
    this.applyTheme(!this.config.darkMode);
  }

  // Update the theme toggle icon
  updateThemeToggleIcon() {
    if (this.elements.themeToggle) {
      const iconClass = this.config.darkMode 
        ? this.config.iconMap.dark 
        : this.config.iconMap.light;
      this.elements.themeToggle.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }
  }

  // Update music icon color based on theme
  updateMusicIcon() {
    if (this.elements.musicIcon) {
      this.elements.musicIcon.style.color = this.config.darkMode
        ? this.config.musicIconColors.dark
        : this.config.musicIconColors.light;
    }
  }

  

  // Update PWA theme color meta tag
  updateThemeColorMeta() {
    if (!this.elements.themeColorMeta) {
      this.elements.themeColorMeta = document.createElement('meta');
      this.elements.themeColorMeta.name = 'theme-color';
      this.elements.themeColorMeta.id = this.config.themeColorMetaId;
      document.head.appendChild(this.elements.themeColorMeta);
    }
    
    this.elements.themeColorMeta.content = this.config.darkMode
      ? this.config.darkThemeColor
      : this.config.lightThemeColor;
  }

  // Listen for system theme changes
  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches);
      }
    });
  }

  // Dispatch custom event when theme changes
  dispatchThemeChangeEvent() {
    const event = new CustomEvent('themeChanged', {
      detail: {
        darkMode: this.config.darkMode,
        theme: this.config.darkMode ? 'dark' : 'light'
      }
    });
    document.dispatchEvent(event);
  }
}

// Initialize ThemeManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  themeManager.init();
  
  // Make it globally available if needed
  window.appTheme = themeManager;
});

