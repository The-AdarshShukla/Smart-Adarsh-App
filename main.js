// main.js - Core application initialization and shared functionality


// बाकी code वही रहेगा

// ======================
// App Configuration
// ======================
const appConfig = {
  defaultTheme: 'light',
  pwaInstallPromptDelay: 5000,
  loadingScreenDuration: 1500,
  apiEndpoints: {
    quotes: 'https://api.quotable.io/random',
    weather: '/api/weather' // Example endpoint
  },
  featureFlags: {
    analytics: true,
    offlineSupport: true
  }
};

// ======================
// Global App State
// ======================
const appState = {
  currentTool: 'dashboard',
  isDarkMode: false,
  isOnline: true,
  isLoading: false,
  lastActiveTime: null,
  userPreferences: {}
};

// ======================
// DOM Elements Cache
// ======================
const elements = {
  appContainer: document.querySelector('.app-container'),
  loadingOverlay: document.getElementById('loading-overlay'),
  themeToggle: document.getElementById('theme-toggle'),
  installPrompt: document.getElementById('install-prompt'),
  currentDateTime: document.getElementById('currentDateTime'),
  globalProgress: document.getElementById('global-progress')
};

// ======================
// Core Initialization
// ======================
function initApp() {
  try {
    console.log('Initializing app...');
    
    // Show loading screen immediately
    showLoadingScreen();
    
    // Initialize state and modules
    initializeState();
    setupEventListeners();
    
    if (appConfig.featureFlags.offlineSupport) {
      initServiceWorker();
    }
    
    initCoreModules();
    checkNetworkStatus();
    trackUserActivity();
    
    console.log('App initialization complete');
  } catch (error) {
    console.error('Initialization failed:', error);
    hideLoadingScreen();
    showToast('App initialization failed', 'error');
  }
}
document.addEventListener('DOMContentLoaded', () => {
    initMusicPlayer();
});

document.addEventListener('DOMContentLoaded', initApp);


document.addEventListener('DOMContentLoaded', function() {
    // Initialize all app modules
    initializeApp();
});

// ======================
// State Management
// ======================
function initializeState() {
  
  // Load user preferences from localStorage
  appState.userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
  
  // Set initial theme
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  appState.isDarkMode = savedTheme === 'dark';
  applyTheme(appState.isDarkMode);
  
  // Set last active time
  appState.lastActiveTime = new Date();
}

// ======================
// Event Handling
// ======================
function setupEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Network status changes
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // PWA install prompt
  window.addEventListener('beforeinstallprompt', handleInstallPrompt);
  
  // Navigation clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavigation);
  });
  
  // Quick action buttons
  document.querySelectorAll('.action-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', handleQuickAction);
  });
}

// ======================
// Core Modules
// ======================
function initCoreModules() {
  initDateTime();
  initNavigation();
  initInstallPrompt();
  
  // Initialize analytics if enabled
  if (appConfig.featureFlags.analytics) {
    initAnalytics();
  }
}

// ======================
// Theme Management
// ======================
function toggleTheme() {
  appState.isDarkMode = !appState.isDarkMode;
  applyTheme(appState.isDarkMode);
  localStorage.setItem('theme', appState.isDarkMode ? 'dark' : 'light');
  
  // Update theme toggle icon
  elements.themeToggle.innerHTML = appState.isDarkMode 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  
  // Update theme color meta tag for PWA
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#1a1a2e' : '#4361ee';
}

// ======================
// Date and Time
// ======================
function initDateTime() {
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
}

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  elements.currentDateTime.textContent = now.toLocaleDateString('en-IN', options);
}

// ======================
// Navigation
// ======================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all nav items
      navItems.forEach(navItem => {
        navItem.classList.remove('active');
        navItem.setAttribute('aria-selected', 'false');
      });
      
      // Add active class to clicked nav item
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      
      // Get the tool to show
      const toolToShow = this.getAttribute('data-tool');
      switchTool(toolToShow);
    });
  });
}

function handleNavigation(e) {
  const toolId = this.getAttribute('data-tool');
  switchTool(toolId);
}

function switchTool(toolId) {
  // Hide all tool contents
  document.querySelectorAll('.tool-content').forEach(content => {
    content.classList.remove('active');
    content.setAttribute('hidden', '');
  });
  
  // Show selected tool content
  const toolContent = document.getElementById(toolId);
  if (toolContent) {
    toolContent.classList.add('active');
    toolContent.removeAttribute('hidden');
    appState.currentTool = toolId;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    
    const activeNavItem = document.querySelector(`.nav-item[data-tool="${toolId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
      activeNavItem.setAttribute('aria-selected', 'true');
    }
    
    // Special handling for Security tab
    if (toolId === 'security') {
      initSecurityVault();
    }
    
    // Dispatch custom event for tool change
    document.dispatchEvent(new CustomEvent('toolChanged', {
      detail: { tool: toolId }
    }));
  }
}

// ======================
// Quick Actions
// ======================
function handleQuickAction() {
  const toolId = this.getAttribute('data-tool');
  switchTool(toolId);
  
  // Special handling for specific tools
  if (toolId === 'notes') {
    setTimeout(() => {
      const addNoteBtn = document.getElementById('add-note-btn');
      if (addNoteBtn) addNoteBtn.click();
    }, 300);
  } else if (toolId === 'todo') {
    setTimeout(() => {
      const todoInput = document.getElementById('todo-input');
      if (todoInput) todoInput.focus();
    }, 300);
  }
}

// ======================
// Loading Screen
// ======================
function showLoadingScreen() {
  // Ensure loading overlay exists
  if (!elements.loadingOverlay) {
    console.error('Loading overlay element not found');
    return;
  }

  // Reset any previous state
  elements.loadingOverlay.classList.remove('hidden');
  elements.loadingOverlay.style.display = 'flex';
  
  // Force reflow to enable transition
  void elements.loadingOverlay.offsetWidth;
  
  // Set a fail-safe timeout to hide loading screen
  const loadingTimeout = setTimeout(() => {
    hideLoadingScreen();
    console.warn('Loading screen timeout reached');
  }, appConfig.loadingScreenDuration + 2000); // 2s buffer

  // Listen for when all critical assets are loaded
  window.addEventListener('load', () => {
    clearTimeout(loadingTimeout);
    hideLoadingScreen();
  });

  // Alternative check if window load doesn't fire
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(hideLoadingScreen, 500);
  });
}

function hideLoadingScreen() {
  if (!elements.loadingOverlay) return;

  // Start fade out
  elements.loadingOverlay.classList.add('hidden');
  
  // Remove from DOM after animation completes
  elements.loadingOverlay.addEventListener('transitionend', () => {
    elements.loadingOverlay.style.display = 'none';
  }, { once: true });
}

// ======================
// Network Management
// ======================
function checkNetworkStatus() {
  appState.isOnline = navigator.onLine;
  updateNetworkStatusUI();
}

function handleNetworkChange() {
  appState.isOnline = navigator.onLine;
  updateNetworkStatusUI();
  
  if (appState.isOnline) {
    showToast('You are back online', 'success');
    // Sync any pending offline data
    syncOfflineData();
  } else {
    showToast('You are offline - some features may be limited', 'warning');
  }
}

function updateNetworkStatusUI() {
  const indicator = document.getElementById('network-status-indicator') || 
                   createNetworkStatusIndicator();
  
  indicator.className = `network-status ${appState.isOnline ? 'online' : 'offline'}`;
  indicator.title = appState.isOnline ? 'Online' : 'Offline';
}

function createNetworkStatusIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'network-status-indicator';
  indicator.className = `network-status ${appState.isOnline ? 'online' : 'offline'}`;
  indicator.title = appState.isOnline ? 'Online' : 'Offline';
  
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    headerActions.insertBefore(indicator, elements.currentDateTime);
  }
  
  return indicator;
}

// ======================
// PWA Functionality
// ======================
function initInstallPrompt() {
  setTimeout(() => {
    elements.installPrompt.classList.add('active');
  }, appConfig.pwaInstallPromptDelay);
  
  document.getElementById('install-confirm').addEventListener('click', async () => {
    elements.installPrompt.classList.remove('active');
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      logEvent('install_prompt', { outcome });
      window.deferredPrompt = null;
    }
  });
  
  document.getElementById('install-cancel').addEventListener('click', () => {
    elements.installPrompt.classList.remove('active');
  });
}

function handleInstallPrompt(e) {
  e.preventDefault();
  window.deferredPrompt = e;
}

// ======================
// User Activity Tracking
// ======================
function trackUserActivity() {
  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
  
  activityEvents.forEach(event => {
    window.addEventListener(event, () => {
      appState.lastActiveTime = new Date();
    });
  });
  
  // Check idle time every minute
  setInterval(checkIdleTime, 60000);
}

function checkIdleTime() {
  const now = new Date();
  const idleTime = (now - appState.lastActiveTime) / (1000 * 60); // in minutes
  
  if (idleTime > 30) { // 30 minutes idle
    logEvent('user_idle', { duration: idleTime });
  }
}

// ======================
// Analytics
// ======================
function initAnalytics() {
  // Initialize analytics service
  logEvent('app_init');
}

function logEvent(eventName, data = {}) {
  if (!appConfig.featureFlags.analytics) return;
  
  const eventData = {
    ...data,
    timestamp: new Date().toISOString(),
    currentTool: appState.currentTool,
    theme: appState.isDarkMode ? 'dark' : 'light'
  };
  
  // In a real app, you would send this to your analytics service
  console.log(`[Analytics] ${eventName}`, eventData);
}

// ======================
// Security Vault
// ======================
function initSecurityVault() {
  // Check authentication status
  const isAuthenticated = localStorage.getItem('vaultAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Show PIN entry modal
    showPinModal();
  } else {
    // Load vault content
    loadVaultContent();
  }
}

function showPinModal() {
  // Implement your PIN modal display logic here
  console.log("Showing PIN modal for security vault");
  // This should show your PIN entry interface
}

function loadVaultContent() {
  // Implement loading of vault content
  console.log("Loading security vault content");
}

// ======================
// Utility Functions
// ======================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, 10);
}

function syncOfflineData() {
  // In a real app, this would sync any locally stored data with the server
  console.log('Syncing offline data...');
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful');
      }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}

// ======================
// Global Exports
// ======================
window.initSecurityVault = initSecurityVault;
window.showPinModal = showPinModal;