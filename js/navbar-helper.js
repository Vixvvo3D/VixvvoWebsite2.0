/**
 * Navigation Helper - Ensures navbar elements are available before initialization
 * 
 * This helper provides utility functions to safely interact with navbar elements
 * after the dynamic navbar has been loaded.
 */

const NavbarHelper = {
  /**
   * Check if navbar is loaded
   */
  isLoaded: false,
  
  /**
   * Queue of functions to run when navbar is ready
   */
  readyQueue: [],
  
  /**
   * Execute a function when navbar is ready
   * @param {Function} callback - Function to execute when navbar is loaded
   */
  onReady: function(callback) {
    if (this.isLoaded) {
      // Navbar already loaded, execute immediately
      callback();
    } else {
      // Add to queue
      this.readyQueue.push(callback);
    }
  },
  
  /**
   * Initialize - called automatically when navbar loads
   */
  init: function() {
    this.isLoaded = true;
    
    // Execute all queued callbacks
    this.readyQueue.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error executing navbar ready callback:', error);
      }
    });
    
    // Clear the queue
    this.readyQueue = [];
  },
  
  /**
   * Safely get a navbar element
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  getElement: function(id) {
    const element = document.getElementById(id);
    if (!element && this.isLoaded) {
      console.warn(`Navbar element '${id}' not found`);
    }
    return element;
  },
  
  /**
   * Add event listener to navbar element (waits for navbar if needed)
   * @param {string} elementId - ID of the navbar element
   * @param {string} eventType - Event type (e.g., 'click')
   * @param {Function} handler - Event handler function
   */
  addEventListener: function(elementId, eventType, handler) {
    this.onReady(() => {
      const element = this.getElement(elementId);
      if (element) {
        element.addEventListener(eventType, handler);
      } else {
        console.error(`Cannot add event listener: element '${elementId}' not found`);
      }
    });
  }
};

// Listen for navbar loaded event
document.addEventListener('navbarLoaded', function() {
  NavbarHelper.init();
});

// Also check if navbar might already be loaded
if (document.querySelector('nav')) {
  NavbarHelper.init();
}

/**
 * USAGE EXAMPLES:
 * 
 * Example 1: Execute code when navbar is ready
 * ----------------------------------------------
 * NavbarHelper.onReady(function() {
 *   console.log('Navbar is ready!');
 *   // Your initialization code here
 * });
 * 
 * 
 * Example 2: Safely add event listener to navbar element
 * -------------------------------------------------------
 * NavbarHelper.addEventListener('btnSettings', 'click', function() {
 *   console.log('Settings button clicked!');
 * });
 * 
 * 
 * Example 3: Get navbar element safely
 * -------------------------------------
 * NavbarHelper.onReady(function() {
 *   const settingsBtn = NavbarHelper.getElement('btnSettings');
 *   if (settingsBtn) {
 *     // Do something with the element
 *     settingsBtn.classList.add('active');
 *   }
 * });
 * 
 * 
 * Example 4: Multiple operations when navbar is ready
 * ----------------------------------------------------
 * NavbarHelper.onReady(function() {
 *   // Initialize settings dropdown
 *   const dropdown = NavbarHelper.getElement('settingsDropdown');
 *   
 *   // Set up click handlers
 *   NavbarHelper.addEventListener('btnSettings', 'click', toggleDropdown);
 *   NavbarHelper.addEventListener('btnLoginSettings', 'click', showLogin);
 *   
 *   // Update user display
 *   updateUserDisplay();
 * });
 */
