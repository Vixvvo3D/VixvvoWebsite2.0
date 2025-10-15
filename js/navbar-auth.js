/**
 * Navbar Auth Updater - Syncs authentication state with navbar UI
 * This ensures the navbar shows the correct login/logout state on all pages
 */

(function() {
  /**
   * Update navbar UI elements based on authentication state
   */
  function updateNavbarAuth(user, userData) {
    // Get navbar elements
    const btnLoginNav = document.getElementById('btnLoginNav');
    const btnLoginSettings = document.getElementById('btnLoginSettings');
    const btnLogoutSettings = document.getElementById('btnLogoutSettings');
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    const settingsUsername = document.getElementById('settingsUsername');
    const settingsRole = document.getElementById('settingsRole');
    const userAvatar = document.getElementById('userAvatar');
    const btnSettingsPage = document.getElementById('btnSettingsPage');

    if (user) {
      // User is logged in
      console.log('🔐 Updating navbar: User logged in', user.email);
      
      // Hide login buttons
      if (btnLoginNav) btnLoginNav.style.display = 'none';
      if (btnLoginSettings) btnLoginSettings.style.display = 'none';
      
      // Show logout button and settings link
      if (btnLogoutSettings) btnLogoutSettings.style.display = 'block';
      if (btnSettingsPage) btnSettingsPage.style.display = 'block';
      
      // Show and update user info
      if (userInfoDisplay) userInfoDisplay.style.display = 'block';
      
      // Get username and role from userData or user object
      const username = userData?.username || user.displayName || user.email?.split('@')[0] || 'User';
      const role = userData?.role || 'Member';
      
      // Update username and role
      if (settingsUsername) settingsUsername.textContent = username;
      if (settingsRole) {
        settingsRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      }
      
      // Update avatar
      if (userAvatar) {
        userAvatar.textContent = username.charAt(0).toUpperCase();
      }
      
    } else {
      // User is logged out
      console.log('🔓 Updating navbar: User logged out');
      
      // Show login buttons
      if (btnLoginNav) btnLoginNav.style.display = 'inline-block';
      if (btnLoginSettings) btnLoginSettings.style.display = 'block';
      
      // Hide logout button, settings link, and user info
      if (btnLogoutSettings) btnLogoutSettings.style.display = 'none';
      if (btnSettingsPage) btnSettingsPage.style.display = 'none';
      if (userInfoDisplay) userInfoDisplay.style.display = 'none';
    }
  }

  /**
   * Fetch user data from Firebase
   */
  async function fetchUserData(user) {
    if (!user || typeof firebase === 'undefined') return null;
    
    try {
      const snapshot = await firebase.database().ref(`users/${user.uid}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Initialize auth state listener
   */
  function initializeAuthListener() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('Firebase Auth not available');
      return;
    }

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch additional user data
        const userData = await fetchUserData(user);
        updateNavbarAuth(user, userData);
      } else {
        updateNavbarAuth(null, null);
      }
    });
  }

  /**
   * Wait for both navbar and Firebase to be ready
   */
  function initialize() {
    // Check if Firebase is ready
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
      // Firebase is ready, initialize auth listener
      initializeAuthListener();
    } else {
      // Wait for Firebase to initialize
      const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
          clearInterval(checkFirebase);
          initializeAuthListener();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkFirebase), 5000);
    }
  }

  // Wait for navbar to load before initializing
  if (typeof NavbarHelper !== 'undefined') {
    NavbarHelper.onReady(initialize);
  } else {
    // Fallback: wait for navbar loaded event
    document.addEventListener('navbarLoaded', initialize);
    
    // Also try on DOMContentLoaded as backup
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initialize, 100);
      });
    } else {
      setTimeout(initialize, 100);
    }
  }
})();
