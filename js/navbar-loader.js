/**
 * Navbar Loader - Dynamically loads and configures the navigation bar
 * This ensures all pages share the same navbar component
 */

(function() {
  // Determine if we're in a subdirectory
  const isSubPage = window.location.pathname.includes('/pages/');
  const pathPrefix = isSubPage ? '../' : '';

  // Load the navbar HTML
  async function loadNavbar() {
    try {
      const response = await fetch(pathPrefix + 'components/navbar.html');
      if (!response.ok) throw new Error('Failed to load navbar');
      
      const html = await response.text();
      
      // Create a placeholder for the navbar if it doesn't exist
      let navbarContainer = document.getElementById('navbar-container');
      if (!navbarContainer) {
        navbarContainer = document.createElement('div');
        navbarContainer.id = 'navbar-container';
        document.body.insertBefore(navbarContainer, document.body.firstChild);
      }
      
      navbarContainer.innerHTML = html;
      
      // Adjust paths based on current page location
      adjustPaths();
      
      // Initialize navbar functionality
      initializeNavbar();
      
    } catch (error) {
      console.error('Error loading navbar:', error);
    }
  }

  // Adjust image and link paths based on page location
  function adjustPaths() {
    // Adjust logo path
    const logo = document.querySelector('nav img[data-logo-path]');
    if (logo) {
      const originalPath = logo.getAttribute('data-logo-path');
      logo.src = pathPrefix + originalPath;
    }

    // Adjust navigation links
    const navLinks = document.querySelectorAll('nav .nav-links a[data-href]');
    navLinks.forEach(link => {
      const originalHref = link.getAttribute('data-href');
      link.href = pathPrefix + originalHref;
    });

    // Adjust settings link in dropdown
    const settingsLink = document.querySelector('#btnSettingsPage[data-href]');
    if (settingsLink) {
      const originalHref = settingsLink.getAttribute('data-href');
      settingsLink.href = pathPrefix + originalHref;
    }
  }

  // Initialize navbar interactivity
  function initializeNavbar() {
    // This function will be called after the navbar is loaded
    // Other scripts (auth.js, navigation.js) will handle the actual functionality
    
    // Dispatch a custom event to notify other scripts that navbar is ready
    const event = new CustomEvent('navbarLoaded', { 
      detail: { isSubPage: isSubPage, pathPrefix: pathPrefix } 
    });
    document.dispatchEvent(event);
  }

  // Load navbar when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  } else {
    loadNavbar();
  }
})();
