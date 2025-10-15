/**
 * Settings Dropdown Handler - Universal dropdown functionality for navbar
 * This script handles the settings dropdown menu interaction across all pages
 */

(function() {
  /**
   * Initialize the settings dropdown functionality
   */
  function initializeDropdown() {
    const settingsBtn = document.getElementById('btnSettings');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    if (!settingsBtn || !settingsDropdown) {
      console.warn('Settings dropdown elements not found');
      return;
    }

    // Toggle dropdown on settings button click
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDropdown.classList.toggle('active');
      settingsBtn.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
        settingsDropdown.classList.remove('active');
        settingsBtn.classList.remove('active');
      }
    });

    // Prevent dropdown from closing when clicking inside it
    settingsDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    console.log('Settings dropdown initialized');
  }

  // Wait for navbar to load before initializing
  if (typeof NavbarHelper !== 'undefined') {
    NavbarHelper.onReady(initializeDropdown);
  } else {
    // Fallback if NavbarHelper is not available
    document.addEventListener('navbarLoaded', initializeDropdown);
    
    // Also try on DOMContentLoaded as backup
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeDropdown, 100);
      });
    } else {
      setTimeout(initializeDropdown, 100);
    }
  }
})();
