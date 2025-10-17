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
    const btnConnectPatreon = document.getElementById('btnConnectPatreon');
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
      
      // Show logout button, settings link, and Patreon button
      if (btnLogoutSettings) btnLogoutSettings.style.display = 'block';
      if (btnSettingsPage) btnSettingsPage.style.display = 'block';
      if (btnConnectPatreon) btnConnectPatreon.style.display = 'block';
      
      // Check Patreon connection status and update button
      checkPatreonConnection(user.uid, btnConnectPatreon);
      
      // Show and update user info
      if (userInfoDisplay) userInfoDisplay.style.display = 'block';
      
      // Get username from userData or user object
      const username = userData?.username || user.displayName || user.email?.split('@')[0] || 'User';
      
      // Check if user is admin first
      const role = userData?.role || 'member';
      const isAdmin = role === 'admin' || role === 'administrator';
      
      // If admin, show Administrator, otherwise show membership tier
      let displayText = 'Free';
      let tierClass = 'free';
      if (isAdmin) {
        displayText = 'Administrator';
        tierClass = 'admin';
      } else {
        const tier = userData?.membership?.tier || 'free';
        const tierInfo = typeof TIER_INFO !== 'undefined' ? TIER_INFO[tier] : null;
        displayText = tierInfo ? tierInfo.name : tier.charAt(0).toUpperCase() + tier.slice(1);
        tierClass = tier;
      }
      
      // Update username and tier/role
      if (settingsUsername) settingsUsername.textContent = username;
      if (settingsRole) {
        settingsRole.textContent = displayText;
        // Apply CSS class for styling
        settingsRole.className = `settings-role ${tierClass}`;
      }
      
      // Update avatar
      if (userAvatar) {
        userAvatar.textContent = username.charAt(0).toUpperCase();
      }
      
      // Show membership link
      const membershipLink = document.getElementById('membershipLink');
      if (membershipLink) membershipLink.style.display = 'block';
      
    } else {
      // User is logged out
      console.log('🔓 Updating navbar: User logged out');
      
      // Show login buttons
      if (btnLoginNav) btnLoginNav.style.display = 'inline-block';
      if (btnLoginSettings) btnLoginSettings.style.display = 'block';
      
      // Hide logout button, settings link, Patreon button, and user info
      if (btnLogoutSettings) btnLogoutSettings.style.display = 'none';
      if (btnSettingsPage) btnSettingsPage.style.display = 'none';
      if (btnConnectPatreon) btnConnectPatreon.style.display = 'none';
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
   * Check Patreon connection status and update button
   */
  async function checkPatreonConnection(userId, button) {
    if (!button || !userId) return;
    
    try {
      const snapshot = await firebase.database()
        .ref(`users/${userId}/membership/patreon/patronId`)
        .once('value');
      
      const patronId = snapshot.val();
      
      if (patronId) {
        // Connected
        button.textContent = 'Patreon Connected';
        button.classList.add('patreon-connected');
      } else {
        // Not connected
        button.textContent = 'Connect to Patreon';
        button.classList.remove('patreon-connected');
      }
    } catch (error) {
      console.error('Error checking Patreon connection:', error);
      button.textContent = 'Connect to Patreon';
    }
  }

  /**
   * Setup Connect Patreon button handler
   */
  function setupPatreonButton() {
    const btnConnectPatreon = document.getElementById('btnConnectPatreon');
    if (btnConnectPatreon) {
      btnConnectPatreon.addEventListener('click', function() {
        console.log('🎨 Connect Patreon button clicked');
        
        // Get base path for navigation
        const currentPath = window.location.pathname;
        const isInPagesFolder = currentPath.includes('/pages/');
        const targetPath = isInPagesFolder ? 'patreon-link.html' : 'pages/patreon-link.html';
        
        window.location.href = targetPath;
      });
      console.log('✅ Connect Patreon button handler attached');
    }
  }

  /**
   * Wait for both navbar and Firebase to be ready
   */
  function initialize() {
    // Check if Firebase is ready
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
      // Firebase is ready, initialize auth listener
      initializeAuthListener();
      // Setup button handlers
      setupPatreonButton();
    } else {
      // Wait for Firebase to initialize
      const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
          clearInterval(checkFirebase);
          initializeAuthListener();
          setupPatreonButton();
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
