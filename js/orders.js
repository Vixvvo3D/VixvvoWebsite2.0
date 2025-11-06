/**
 * Orders Management System
 * Handles all order-related functionality including CRUD operations,
 * color selection, material management, and Firebase integration
 */

(function() {
  'use strict';
  
  // Wait for Firebase to initialize
  function waitForFirebase(callback) {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      callback();
    } else {
      setTimeout(() => waitForFirebase(callback), 100);
    }
  }

  waitForFirebase(() => {
    console.log('Orders.js: Firebase is ready');
    
    // Global variables
    let ordersData = [];
    let selectedColors = [];
    let autocomplete = null;
    let editAutocomplete = null;
    let currentViewingOrderId = null;
    
    // Access color data from dashboard.html global scope
    function getGlobalColorsData() {
      return window.globalColorsData || {};
    }
    
    function getUserColorsData() {
      return window.userColorsData || {};
    }
    
    // DOM elements - will be initialized after DOM loads
    let searchInput = null;
    let statusFilter = null;
    
    // Initialize filter elements
    function initializeFilters() {
      searchInput = document.getElementById('ordersSearchInput');
      statusFilter = document.getElementById('ordersStatusFilter');
      
      // Add event listeners for real-time filtering
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderOrdersTable();
        });
      }
      
      if (statusFilter) {
        statusFilter.addEventListener('change', () => {
          renderOrdersTable();
        });
      }
    }
    
    // Currency helper functions
    function getCurrentCurrency() {
      return window.currentCurrency || 'USD';
    }
    
    function getCurrencySymbolLocal() {
      if (typeof window.getCurrencySymbol === 'function') {
        return window.getCurrencySymbol(getCurrentCurrency());
      }
      return '$';
    }
    
    function formatCurrencyLocal(amount) {
      if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount, getCurrentCurrency());
      }
      return amount.toFixed(2);
    }
    
    function convertFromUSD(amount) {
      if (typeof window.convertFromUSD === 'function') {
        return window.convertFromUSD(amount, getCurrentCurrency());
      }
      return amount;
    }
    
    function convertToUSD(amount) {
      if (typeof window.convertToUSD === 'function') {
        return window.convertToUSD(amount, getCurrentCurrency());
      }
      return amount;
    }

    // Load orders from Firebase
    window.loadOrders = function() {
      const currentUser = firebase.auth().currentUser;
      
      if (!currentUser) {
        document.getElementById('ordersContent').innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-muted);">Please login to view orders</p>';
        return;
      }
      
      // Initialize filters if not already done
      if (!searchInput || !statusFilter) {
        initializeFilters();
      }
      
      const ordersRef = firebase.database().ref(`orders/${currentUser.uid}`);
      ordersRef.on('value', snapshot => {
        const data = snapshot.val();
        ordersData = [];
        
        if (data) {
          Object.entries(data).forEach(([id, order]) => {
            ordersData.push({ id, ...order });
          });
        }
        
        console.log('Loaded orders:', ordersData.length);
        renderOrdersTable();
      });
    };

    // Render orders table
    function renderOrdersTable() {
      const container = document.getElementById('ordersContent');
      if (!container) return;
      
      let filteredOrders = [...ordersData];
      
      // Apply search filter
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
          order.id?.toLowerCase().includes(searchTerm) ||
          order.orderTitle?.toLowerCase().includes(searchTerm) ||
          order.clientName?.toLowerCase().includes(searchTerm) ||
          order.productName?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply status filter
      const statusValue = statusFilter ? statusFilter.value : 'all';
      if (statusValue !== 'all') {
        filteredOrders = filteredOrders.filter(order => 
          order.orderStatus === statusValue || order.paymentStatus === statusValue
        );
      }
      
      // Sort by order status priority, then by date (newest first)
      const statusPriority = {
        'pending': 1,
        'processing': 2,
        'completed': 3,
        'cancelled': 4
      };
      
      filteredOrders.sort((a, b) => {
        const statusA = statusPriority[a.orderStatus] || 999;
        const statusB = statusPriority[b.orderStatus] || 999;
        
        // First sort by status priority
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        
        // If same status, sort by date (newest first)
        return (b.date || 0) - (a.date || 0);
      });
      
      if (filteredOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-muted);">No orders found</p>';
        return;
      }
      
      container.innerHTML = `
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Title</th>
                <th>Client</th>
                <!-- <th>Product</th> -->
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>#${order.id.slice(0, 7).toUpperCase()}</td>
                  <td>${order.orderTitle || 'N/A'}</td>
                  <td>${order.clientName || 'N/A'}</td>
                  <!-- <td>${order.productName || 'N/A'}</td> -->
                  <td>${formatCurrencyLocal(order.total || 0)}</td>
                  <td>
                    <select class="status-dropdown status-${order.orderStatus || 'pending'}" 
                            onchange="updateOrderStatus('${order.id}', this.value)" 
                            data-original="${order.orderStatus || 'pending'}">
                      <option value="pending" ${(order.orderStatus || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="processing" ${order.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
                      <option value="completed" ${order.orderStatus === 'completed' ? 'selected' : ''}>Completed</option>
                      <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select class="status-dropdown status-${order.paymentStatus || 'unpaid'}" 
                            onchange="updatePaymentStatus('${order.id}', this.value)" 
                            data-original="${order.paymentStatus || 'unpaid'}">
                      <option value="unpaid" ${(order.paymentStatus || 'unpaid') === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                      <option value="partially" ${order.paymentStatus === 'partially' ? 'selected' : ''}>Partially Paid</option>
                      <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                    </select>
                  </td>
                  <td>${formatDate(order.date)}</td>
                  <td>
                    <div class="order-actions">
                      <button class="btn-action" onclick="viewOrder('${order.id}')">View</button>
                      <button class="btn-action" onclick="editOrder('${order.id}')">Edit</button>
                      <button class="btn-action" onclick="duplicateOrder('${order.id}')">Duplicate</button>
                      <button class="btn-action" onclick="deleteOrder('${order.id}')">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    // Expose renderOrdersTable to window
    window.renderOrdersTable = renderOrdersTable;

    // Calculate payment status based on total and amount paid
    function calculatePaymentStatus(total, amountPaid) {
      const totalAmount = parseFloat(total) || 0;
      const paidAmount = parseFloat(amountPaid) || 0;
      
      if (paidAmount === 0) {
        return 'unpaid';
      } else if (paidAmount >= totalAmount) {
        return 'paid';
      } else {
        return 'partially';
      }
    }

    // Update order status
    window.updateOrderStatus = function(orderId, newStatus) {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        return;
      }

      // Find the select element that triggered this
      const selectElement = event.target;
      
      const orderRef = firebase.database().ref(`orders/${currentUser.uid}/${orderId}`);
      orderRef.update({
        orderStatus: newStatus,
        lastModified: Date.now()
      }).then(() => {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        
        // Update the CSS class on the dropdown immediately for visual feedback
        if (selectElement) {
          selectElement.className = `status-dropdown status-${newStatus}`;
          selectElement.setAttribute('data-original', newStatus);
        }
        
        // The table will auto-update due to Firebase listener
      }).catch(error => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
        
        // Revert the dropdown to original value on error
        if (selectElement) {
          const originalValue = selectElement.getAttribute('data-original');
          selectElement.value = originalValue;
        }
      });
    };

    // Update payment status (allows manual override in table)
    window.updatePaymentStatus = function(orderId, newStatus) {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        return;
      }

      // Find the select element that triggered this
      const selectElement = event.target;

      const orderRef = firebase.database().ref(`orders/${currentUser.uid}/${orderId}`);
      orderRef.update({
        paymentStatus: newStatus,
        lastModified: Date.now()
      }).then(() => {
        console.log(`Order ${orderId} payment status updated to ${newStatus}`);
        
        // Update the CSS class on the dropdown immediately for visual feedback
        if (selectElement) {
          selectElement.className = `status-dropdown status-${newStatus}`;
          selectElement.setAttribute('data-original', newStatus);
        }
        
        // The table will auto-update due to Firebase listener
      }).catch(error => {
        console.error('Error updating payment status:', error);
        alert('Failed to update payment status. Please try again.');
        
        // Revert the dropdown to original value on error
        if (selectElement) {
          const originalValue = selectElement.getAttribute('data-original');
          selectElement.value = originalValue;
        }
      });
    };

    // Update order amounts and auto-calculate payment status
    window.updateOrderAmounts = function(orderId, total, amountPaid) {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        return;
      }

      const autoPaymentStatus = calculatePaymentStatus(total, amountPaid);
      
      const orderRef = firebase.database().ref(`orders/${currentUser.uid}/${orderId}`);
      orderRef.update({
        total: total,
        amountPaid: amountPaid,
        paymentStatus: autoPaymentStatus,
        lastModified: Date.now()
      }).then(() => {
        console.log(`Order ${orderId} amounts updated - payment status auto-set to ${autoPaymentStatus}`);
      }).catch(error => {
        console.error('Error updating order amounts:', error);
        alert('Failed to update order amounts. Please try again.');
      });
    };

    // Format date helper
    function formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    // New Order Modal Functions
    window.openNewOrderModal = function() {
      const modal = document.getElementById('newOrderModal');
      const form = document.getElementById('newOrderForm');
      
      if (form) {
        form.reset();
        selectedColors = [];
      }
      
      // Populate material dropdown
      populateMaterialDropdowns();
      
      // Populate color picker
      setTimeout(() => {
        populateColorPicker();
      }, 100);
      
      if (modal) {
        modal.style.display = 'grid';
      }
      
      // Initialize address autocomplete
      setTimeout(initAutocomplete, 200);
    };

    window.closeNewOrderModal = function() {
      const modal = document.getElementById('newOrderModal');
      if (modal) {
        modal.style.display = 'none';
      }
    };

    // Initialize address autocomplete
    function initAutocomplete() {
      const input = document.getElementById('addressAutocomplete');
      if (!input || !window.google) return;
      
      autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address']
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;
        
        // Populate address fields
        place.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            document.getElementById('clientStreet').value = place.name || '';
          }
          if (types.includes('locality')) {
            document.getElementById('clientCity').value = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            document.getElementById('clientState').value = component.short_name;
          }
          if (types.includes('postal_code')) {
            document.getElementById('clientPostalCode').value = component.long_name;
          }
          if (types.includes('country')) {
            document.getElementById('clientCountry').value = component.long_name;
          }
        });
      });
    }

    // Populate material dropdowns
    function populateMaterialDropdowns() {
      // This would load from Firebase - placeholder for now
      console.log('Populate material dropdowns');
    }

    // Helper function to convert hex to HSL for rainbow sorting
    function hexToHSL(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    }

    // Populate color picker
    function populateColorPicker() {
      const grid = document.getElementById('colorSelectionGrid');
      if (!grid) return;
      
      const globalColorsData = getGlobalColorsData();
      const userColorsData = getUserColorsData();
      
      // User colors first, then global colors (matching printer/filament preset order)
      const allColors = [
        ...Object.entries(userColorsData).map(([id, color]) => ({ ...color, id, source: 'user' })),
        ...Object.entries(globalColorsData).map(([id, color]) => ({ ...color, id, source: 'global' }))
      ];
      
      if (allColors.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No colors available</p>';
        return;
      }
      
      // Separate selected and unselected colors by ID
      const selectedColorIds = selectedColors.map(c => c.id);
      const selectedColorObjects = allColors.filter(color => selectedColorIds.includes(color.id));
      const unselectedColors = allColors.filter(color => !selectedColorIds.includes(color.id));
      
      let html = '';
      
      // Add selected colors section if there are any
      if (selectedColorObjects.length > 0) {
        html += `
          <div style="grid-column: 1 / -1; padding: 12px 0 8px 0; border-bottom: 2px solid rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.1); margin: -8px -8px 8px -8px; padding: 12px 8px 8px 8px;">
            <h4 style="color: #a855f7; font-size: 14px; font-weight: 600; margin: 0;">
              ✓ Selected Colors <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${selectedColorObjects.length}/4)</span>
            </h4>
          </div>
        `;
        
        html += selectedColorObjects.map(color => `
          <div class="color-option selected color-swatch-preserve" 
               data-color-id="${color.id}"
               style="background-color: ${color.hex};" 
               onclick="selectColor('${color.id}', '${color.name}', '${color.hex}')"
               title="${color.name}">
            <span class="color-option-label" style="color: ${getContrastColor(color.hex)};">
              ${color.name.substring(0, 12)}
            </span>
          </div>
        `).join('');
      }
      
      // Separate user and global colors
      const userUnselected = unselectedColors.filter(c => c.source === 'user');
      const globalUnselected = unselectedColors.filter(c => c.source === 'global');
      
      // Helper function to render colors grouped by brand
      function renderColorsByBrand(colors, sectionTitle) {
        if (colors.length === 0) return '';
        
        let sectionHtml = '';
        
        // Add section header
        sectionHtml += `
          <div style="grid-column: 1 / -1; padding: 16px 0 8px 0; margin-top: 20px; border-bottom: 2px solid rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.05);">
            <h4 style="color: #a855f7; font-size: 15px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${sectionTitle} <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${colors.length})</span>
            </h4>
          </div>
        `;
        
        // Group by brand
        const colorsByBrand = {};
        colors.forEach(color => {
          const brand = color.brand || 'No Brand';
          if (!colorsByBrand[brand]) {
            colorsByBrand[brand] = [];
          }
          colorsByBrand[brand].push(color);
        });
        
        // Sort brands alphabetically
        const sortedBrands = Object.keys(colorsByBrand).sort();
        
        // Build HTML with brand categories
        sortedBrands.forEach(brand => {
          // Sort colors within brand by rainbow (hue)
          const brandColors = colorsByBrand[brand].sort((a, b) => {
            const hslA = hexToHSL(a.hex);
            const hslB = hexToHSL(b.hex);
            return hslA.h - hslB.h;
          });
          
          // Add brand header
          sectionHtml += `
            <div style="grid-column: 1 / -1; padding: 12px 0 8px 0; margin-top: 16px; border-bottom: 1px solid rgba(168, 85, 247, 0.3);">
              <h4 style="color: #a855f7; font-size: 14px; font-weight: 600; margin: 0;">
                ${brand} <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${brandColors.length})</span>
              </h4>
            </div>
          `;
          
          // Add colors for this brand
          sectionHtml += brandColors.map(color => `
            <div class="color-option color-swatch-preserve" 
                 data-color-id="${color.id}"
                 style="background-color: ${color.hex};" 
                 onclick="selectColor('${color.id}', '${color.name}', '${color.hex}')"
                 title="${color.name}">
              <span class="color-option-label" style="color: ${getContrastColor(color.hex)};">
                ${color.name.substring(0, 12)}
              </span>
            </div>
          `).join('');
        });
        
        return sectionHtml;
      }
      
      // Render user colors first, then global colors
      html += renderColorsByBrand(userUnselected, '👤 Your Colors');
      html += renderColorsByBrand(globalUnselected, '🌍 Global Colors');
      
      grid.innerHTML = html;
    }

    // Populate color picker for edit modal
    function populateEditColorPicker() {
      const grid = document.getElementById('editColorSelectionGrid');
      if (!grid) return;
      
      const globalColorsData = getGlobalColorsData();
      const userColorsData = getUserColorsData();
      
      // User colors first, then global colors (matching printer/filament preset order)
      const allColors = [
        ...Object.entries(userColorsData).map(([id, color]) => ({ ...color, id, source: 'user' })),
        ...Object.entries(globalColorsData).map(([id, color]) => ({ ...color, id, source: 'global' }))
      ];
      
      if (allColors.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No colors available</p>';
        return;
      }
      
      // Separate selected and unselected colors by ID
      const selectedColorIds = selectedColors.map(c => c.id);
      const selectedColorObjects = allColors.filter(color => selectedColorIds.includes(color.id));
      const unselectedColors = allColors.filter(color => !selectedColorIds.includes(color.id));
      
      let html = '';
      
      // Add selected colors section if there are any
      if (selectedColorObjects.length > 0) {
        html += `
          <div style="grid-column: 1 / -1; padding: 12px 0 8px 0; border-bottom: 2px solid rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.1); margin: -8px -8px 8px -8px; padding: 12px 8px 8px 8px;">
            <h4 style="color: #a855f7; font-size: 14px; font-weight: 600; margin: 0;">
              ✓ Selected Colors <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${selectedColorObjects.length}/4)</span>
            </h4>
          </div>
        `;
        
        html += selectedColorObjects.map(color => `
          <div class="color-option selected color-swatch-preserve" 
               data-color-id="${color.id}"
               style="background-color: ${color.hex};" 
               onclick="selectEditColor('${color.id}', '${color.name}', '${color.hex}')"
               title="${color.name}">
            <span class="color-option-label" style="color: ${getContrastColor(color.hex)};">
              ${color.name.substring(0, 12)}
            </span>
          </div>
        `).join('');
      }
      
      // Separate user and global colors
      const userUnselected = unselectedColors.filter(c => c.source === 'user');
      const globalUnselected = unselectedColors.filter(c => c.source === 'global');
      
      // Helper function to render colors grouped by brand
      function renderColorsByBrand(colors, sectionTitle) {
        if (colors.length === 0) return '';
        
        let sectionHtml = '';
        
        // Add section header
        sectionHtml += `
          <div style="grid-column: 1 / -1; padding: 16px 0 8px 0; margin-top: 20px; border-bottom: 2px solid rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.05);">
            <h4 style="color: #a855f7; font-size: 15px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${sectionTitle} <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${colors.length})</span>
            </h4>
          </div>
        `;
        
        // Group by brand
        const colorsByBrand = {};
        colors.forEach(color => {
          const brand = color.brand || 'No Brand';
          if (!colorsByBrand[brand]) {
            colorsByBrand[brand] = [];
          }
          colorsByBrand[brand].push(color);
        });
        
        // Sort brands alphabetically
        const sortedBrands = Object.keys(colorsByBrand).sort();
        
        // Build HTML with brand categories
        sortedBrands.forEach(brand => {
          // Sort colors within brand by rainbow (hue)
          const brandColors = colorsByBrand[brand].sort((a, b) => {
            const hslA = hexToHSL(a.hex);
            const hslB = hexToHSL(b.hex);
            return hslA.h - hslB.h;
          });
          
          // Add brand header
          sectionHtml += `
            <div style="grid-column: 1 / -1; padding: 12px 0 8px 0; margin-top: 16px; border-bottom: 1px solid rgba(168, 85, 247, 0.3);">
              <h4 style="color: #a855f7; font-size: 14px; font-weight: 600; margin: 0;">
                ${brand} <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">(${brandColors.length})</span>
              </h4>
            </div>
          `;
          
          // Add colors for this brand
          sectionHtml += brandColors.map(color => `
            <div class="color-option color-swatch-preserve" 
                 data-color-id="${color.id}"
                 style="background-color: ${color.hex};" 
                 onclick="selectEditColor('${color.id}', '${color.name}', '${color.hex}')"
                 title="${color.name}">
              <span class="color-option-label" style="color: ${getContrastColor(color.hex)};">
                ${color.name.substring(0, 12)}
              </span>
            </div>
          `).join('');
        });
        
        return sectionHtml;
      }
      
      // Render user colors first, then global colors
      html += renderColorsByBrand(userUnselected, '👤 Your Colors');
      html += renderColorsByBrand(globalUnselected, '🌍 Global Colors');
      
      grid.innerHTML = html;
    }

    // Select color for order (with toggle support)
    window.selectColor = function(id, name, hex) {
      // Check if color is already selected by ID (not hex, to handle duplicate hex values)
      const existingIndex = selectedColors.findIndex(c => c.id === id);
      
      if (existingIndex !== -1) {
        // Color is already selected, remove it (toggle off)
        selectedColors.splice(existingIndex, 1);
      } else {
        // Color is not selected, add it
        if (selectedColors.length >= 4) {
          alert('Maximum 4 colors allowed');
          return;
        }
        selectedColors.push({ id, name, hex });
      }
      
      // Update UI
      populateColorPicker(); // Refresh to show/hide checkmarks
      updateSelectedColorsPreview();
      updateColorHiddenInputs();
    };

    // Select color for edit order (with toggle support)
    window.selectEditColor = function(id, name, hex) {
      // Check if color is already selected by ID (not hex, to handle duplicate hex values)
      const existingIndex = selectedColors.findIndex(c => c.id === id);
      
      if (existingIndex !== -1) {
        // Color is already selected, remove it (toggle off)
        selectedColors.splice(existingIndex, 1);
      } else {
        // Color is not selected, add it
        if (selectedColors.length >= 4) {
          alert('Maximum 4 colors allowed');
          return;
        }
        selectedColors.push({ id, name, hex });
      }
      
      // Update UI
      populateEditColorPicker(); // Refresh to show/hide checkmarks
      updateEditSelectedColorsPreview();
      updateEditColorHiddenInputs();
    };

    function updateSelectedColorsPreview() {
      const preview = document.getElementById('selectedColorsPreview');
      if (!preview) return;
      
      preview.innerHTML = selectedColors.map((color, index) => `
        <div class="color-swatch-preserve" style="position: relative; width: 40px; height: 40px; border-radius: 6px; background-color: ${color.hex}; border: 2px solid var(--purple); cursor: pointer;" 
             onclick="removeSelectedColor(${index})"
             title="${color.name} - Click to remove">
        </div>
      `).join('');
    }

    function updateEditSelectedColorsPreview() {
      const preview = document.getElementById('editSelectedColorsPreview');
      if (!preview) return;
      
      preview.innerHTML = selectedColors.map((color, index) => `
        <div class="color-swatch-preserve" style="position: relative; width: 40px; height: 40px; border-radius: 6px; background-color: ${color.hex}; border: 2px solid var(--purple); cursor: pointer;" 
             onclick="removeEditSelectedColor(${index})"
             title="${color.name} - Click to remove">
        </div>
      `).join('');
    }

    window.removeSelectedColor = function(index) {
      selectedColors.splice(index, 1);
      updateSelectedColorsPreview();
      updateColorHiddenInputs();
    };

    window.removeEditSelectedColor = function(index) {
      selectedColors.splice(index, 1);
      updateEditSelectedColorsPreview();
      updateEditColorHiddenInputs();
    };

    function updateColorHiddenInputs() {
      for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`color${i}`);
        if (input) {
          input.value = selectedColors[i-1] ? selectedColors[i-1].name : '';
        }
      }
    }

    function updateEditColorHiddenInputs() {
      for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`editColor${i}`);
        if (input) {
          input.value = selectedColors[i-1] ? selectedColors[i-1].name : '';
        }
      }
    }

    // Get contrast color for text
    function getContrastColor(hexColor) {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // Handle new order form submission
    window.addEventListener('DOMContentLoaded', () => {
      const newOrderForm = document.getElementById('newOrderForm');
      if (newOrderForm) {
        newOrderForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const currentUser = firebase.auth().currentUser;
          
          if (!currentUser) {
            alert('Please login to create an order');
            return;
          }
          
          // Get the values entered by user (in their current currency)
          const totalInCurrentCurrency = parseFloat(document.getElementById('orderTotal').value) || 0;
          const amountPaidInCurrentCurrency = parseFloat(document.getElementById('amountPaid').value) || 0;
          
          // Convert to USD for storage in Firebase
          const totalInUSD = convertToUSD(totalInCurrentCurrency);
          const amountPaidInUSD = convertToUSD(amountPaidInCurrentCurrency);
          
          // Calculate payment status automatically based on amounts
          const autoPaymentStatus = calculatePaymentStatus(totalInUSD, amountPaidInUSD);
          
          const orderData = {
            date: Date.now(),
            orderTitle: document.getElementById('orderTitle').value.trim(),
            clientName: document.getElementById('clientName').value.trim(),
            clientEmail: document.getElementById('clientEmail').value.trim(),
            clientPhone: document.getElementById('clientPhone').value.trim(),
            clientStreet: document.getElementById('clientStreet').value.trim(),
            clientCity: document.getElementById('clientCity').value.trim(),
            clientState: document.getElementById('clientState').value.trim(),
            clientPostalCode: document.getElementById('clientPostalCode').value.trim(),
            clientCountry: document.getElementById('clientCountry').value.trim(),
            messagingApp: document.getElementById('messaging_app').value,
            productName: document.getElementById('productName').value.trim(),
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            colors: selectedColors.map(c => c.name),
            material: document.getElementById('material').value,
            finish: document.getElementById('finish').value,
            scale: document.getElementById('scale').value,
            extraNotes: document.getElementById('extraNotes').value.trim(),
            total: totalInUSD,
            amountPaid: amountPaidInUSD,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentStatus: autoPaymentStatus, // Use auto-calculated status
            orderStatus: document.getElementById('orderStatus').value
          };
          
          try {
            const orderRef = firebase.database().ref(`orders/${currentUser.uid}`).push();
            await orderRef.set(orderData);
            alert('Order created successfully!');
            closeNewOrderModal();
          } catch (error) {
            alert('Error creating order: ' + error.message);
          }
        });
      }
    });

    // Helper function to get color hex from name
    function getColorHexFromName(colorName) {
      const globalColorsData = getGlobalColorsData();
      const userColorsData = getUserColorsData();
      
      // Search in global colors
      for (const [id, color] of Object.entries(globalColorsData)) {
        if (color.name === colorName) {
          return color.hex;
        }
      }
      
      // Search in user colors
      for (const [id, color] of Object.entries(userColorsData)) {
        if (color.name === colorName) {
          return color.hex;
        }
      }
      
      return null;
    }

    // View order
    window.viewOrder = function(orderId) {
      const order = ordersData.find(o => o.id === orderId);
      if (!order) {
        alert('Order not found');
        return;
      }
      
      // Format order ID same as in the table (first 7 chars, uppercase)
      const orderIdShort = `#${orderId.slice(0, 7).toUpperCase()}`;
      
      // Display the order ID in the modal header
      const orderNumberDisplay = document.getElementById('viewOrderNumberDisplay');
      if (orderNumberDisplay) {
        orderNumberDisplay.innerHTML = `Order <span class="id-value">${orderIdShort}</span>`;
      }
      
      const content = document.getElementById('viewOrderContent');
      if (!content) return;
      
      // Calculate remaining amount
      const remaining = (order.total || 0) - (order.amountPaid || 0);
      
      // Format colors display with swatches
      let colorsDisplay = 'Not specified';
      if (order.colors && order.colors.length > 0) {
        const validColors = order.colors.filter(c => c);
        if (validColors.length > 0) {
          colorsDisplay = `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${validColors.map(colorName => {
                const hex = getColorHexFromName(colorName);
                if (hex) {
                  return `
                    <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(36, 29, 53, 0.6); border-radius: 8px; border: 1px solid #2d2e3a;">
                      <div class="color-swatch-preserve" style="width: 24px; height: 24px; border-radius: 6px; background-color: ${hex}; border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                      <span style="color: #ffffff; font-size: 13px;">${colorName}</span>
                    </div>
                  `;
                } else {
                  return `<span style="color: #ffffff; font-size: 13px; padding: 6px 12px; background: rgba(36, 29, 53, 0.6); border-radius: 8px;">${colorName}</span>`;
                }
              }).join('')}
            </div>
          `;
        }
      }
      
      content.innerHTML = `
        <div style="display: grid; gap: 24px;">
          <!-- Order Header -->
          <div style="padding: 24px; background: rgba(36, 29, 53, 0.4); border-radius: 12px; border: 1px solid #2d2e3a;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
              <div>
                <h4 style="color: #ffffff; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">${order.orderTitle || 'N/A'}</h4>
                <p style="color: #9ca3af; margin: 0; font-size: 14px;">Order ID: #${order.id.slice(0, 7).toUpperCase()}</p>
              </div>
              <div style="text-align: right;">
                <span class="status-badge status-${order.orderStatus || 'pending'}">${order.orderStatus || 'pending'}</span>
                <span class="status-badge status-${order.paymentStatus || 'unpaid'}" style="margin-left: 8px;">${order.paymentStatus || 'unpaid'}</span>
              </div>
            </div>
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">Created: ${formatDate(order.date)}</p>
          </div>
          
          <!-- Grid Layout for Information Sections -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            
            <!-- Client Information -->
            <div style="padding: 20px; background: rgba(36, 29, 53, 0.4); border-radius: 12px; border: 1px solid #2d2e3a;">
              <h5 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Client Information</h5>
              <div style="display: grid; gap: 14px;">
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Name</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Email</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px; word-break: break-word;">${order.clientEmail || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Phone</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.clientPhone || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Messaging Platform</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.messagingApp || 'N/A'}</p>
                </div>
                ${order.clientStreet || order.clientCity ? `
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Address</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px; line-height: 1.6;">
                    ${order.clientStreet || ''}<br>
                    ${order.clientCity || ''}${order.clientState ? ', ' + order.clientState : ''} ${order.clientPostalCode || ''}<br>
                    ${order.clientCountry || ''}
                  </p>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Product Information -->
            <div style="padding: 20px; background: rgba(36, 29, 53, 0.4); border-radius: 12px; border: 1px solid #2d2e3a;">
              <h5 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Product Information</h5>
              <div style="display: grid; gap: 14px;">
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Product Name</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.productName || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Quantity</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.quantity || 1}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Colors</p>
                  ${colorsDisplay}
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Material</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.material || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Finish</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.finish || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Scale</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.scale ? order.scale + '%' : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <!-- Payment Information -->
            <div style="padding: 20px; background: rgba(36, 29, 53, 0.4); border-radius: 12px; border: 1px solid #2d2e3a;">
              <h5 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Payment Information</h5>
              <div style="display: grid; gap: 14px;">
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Total Price</p>
                  <p style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${formatCurrencyLocal(order.total || 0)}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Amount Paid</p>
                  <p style="color: #10b981; margin: 0; font-size: 16px; font-weight: 600;">${formatCurrencyLocal(order.amountPaid || 0)}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Remaining</p>
                  <p style="color: ${remaining > 0 ? '#ef4444' : '#10b981'}; margin: 0; font-size: 16px; font-weight: 700;">${formatCurrencyLocal(remaining)}</p>
                </div>
                <div style="padding-top: 8px; border-top: 1px solid rgba(168, 85, 247, 0.2);">
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Payment Method</p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${order.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Payment Status</p>
                  <span class="status-badge status-${order.paymentStatus || 'unpaid'}">${order.paymentStatus || 'unpaid'}</span>
                </div>
                <div>
                  <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px; font-weight: 500;">Order Status</p>
                  <span class="status-badge status-${order.orderStatus || 'pending'}">${order.orderStatus || 'pending'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Additional Notes -->
          ${order.extraNotes ? `
          <div style="padding: 20px; background: rgba(36, 29, 53, 0.4); border-radius: 12px; border: 1px solid #2d2e3a;">
            <h5 style="color: #a855f7; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Additional Notes</h5>
            <p style="color: #ffffff; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${order.extraNotes}</p>
          </div>
          ` : ''}
          
          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid #2d2e3a;">
            <button type="button" class="btn-calc-ghost" onclick="closeViewOrderModal()">Close</button>
            <button type="button" class="btn-calc" onclick="closeViewOrderModal(); editOrder('${orderId}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                <path d="M11 2L14 5 5 14H2v-3L11 2z"/>
              </svg>
              Edit Order
            </button>
          </div>
        </div>
      `;
      
      const modal = document.getElementById('viewOrderModal');
      if (modal) {
        modal.style.display = 'grid';
      }
    };

    window.closeViewOrderModal = function() {
      const modal = document.getElementById('viewOrderModal');
      if (modal) {
        modal.style.display = 'none';
      }
    };

    // Edit order
    window.editOrder = function(orderId) {
      const order = ordersData.find(o => o.id === orderId);
      if (!order) {
        alert('Order not found');
        return;
      }
      
      // Store the order ID
      document.getElementById('editOrderId').value = orderId;
      
      // Format order ID same as in the table (first 7 chars, uppercase)
      const orderIdShort = `#${orderId.slice(0, 7).toUpperCase()}`;
      
      // Display the order ID in the modal header
      const orderNumberDisplay = document.getElementById('editOrderNumberDisplay');
      if (orderNumberDisplay) {
        orderNumberDisplay.innerHTML = `Order <span class="id-value">${orderIdShort}</span>`;
      }
      
      // Populate form fields
      document.getElementById('editOrderTitle').value = order.orderTitle || '';
      document.getElementById('editClientName').value = order.clientName || '';
      document.getElementById('editClientEmail').value = order.clientEmail || '';
      document.getElementById('editClientPhone').value = order.clientPhone || '';
      document.getElementById('editClientStreet').value = order.clientStreet || '';
      document.getElementById('editClientCity').value = order.clientCity || '';
      document.getElementById('editClientState').value = order.clientState || '';
      document.getElementById('editClientPostalCode').value = order.clientPostalCode || '';
      document.getElementById('editClientCountry').value = order.clientCountry || '';
      document.getElementById('editMessagingApp').value = order.messagingApp || '';
      document.getElementById('editProductName').value = order.productName || '';
      document.getElementById('editQuantity').value = order.quantity || 1;
      document.getElementById('editMaterial').value = order.material || '';
      document.getElementById('editFinish').value = order.finish || '';
      document.getElementById('editScale').value = order.scale || '';
      
      // Convert USD values from Firebase to current currency for display
      const totalInUSD = order.total || 0;
      const amountPaidInUSD = order.amountPaid || 0;
      const totalConverted = convertFromUSD(totalInUSD);
      const amountPaidConverted = convertFromUSD(amountPaidInUSD);
      
      console.log('Edit Order - Converting prices:', {
        totalInUSD,
        totalConverted,
        amountPaidInUSD,
        amountPaidConverted
      });
      
      document.getElementById('editOrderTotal').value = totalConverted.toFixed(2);
      document.getElementById('editAmountPaid').value = amountPaidConverted.toFixed(2);
      document.getElementById('editPaymentMethod').value = order.paymentMethod || '';
      document.getElementById('editPaymentStatus').value = order.paymentStatus || 'unpaid';
      document.getElementById('editOrderStatus').value = order.orderStatus || 'pending';
      document.getElementById('editExtraNotes').value = order.extraNotes || '';
      
      // Populate colors
      selectedColors = [];
      if (order.colors && Array.isArray(order.colors)) {
        const globalColorsData = getGlobalColorsData();
        const userColorsData = getUserColorsData();
        
        order.colors.forEach((colorName, index) => {
          if (index < 4 && colorName) {
            // Try to find the color in global or user colors
            const globalColor = Object.entries(globalColorsData).find(([id, c]) => c.name === colorName);
            const userColor = Object.entries(userColorsData).find(([id, c]) => c.name === colorName);
            
            if (globalColor) {
              selectedColors.push({ id: globalColor[0], name: globalColor[1].name, hex: globalColor[1].hex });
            } else if (userColor) {
              selectedColors.push({ id: userColor[0], name: userColor[1].name, hex: userColor[1].hex });
            } else {
              // Color not found in database, just use the name
              selectedColors.push({ id: '', name: colorName, hex: '#cccccc' });
            }
            
            document.getElementById(`editColor${index + 1}`).value = colorName;
          }
        });
      }
      
      // Open the modal
      const modal = document.getElementById('editOrderModal');
      if (modal) {
        modal.style.display = 'grid';
      }
      
      // Populate color picker and preview for edit modal
      setTimeout(() => {
        populateEditColorPicker();
        updateEditSelectedColorsPreview();
        initEditAutocomplete();
      }, 200);
    };

    window.closeEditOrderModal = function() {
      const modal = document.getElementById('editOrderModal');
      if (modal) {
        modal.style.display = 'none';
      }
    };

    // Initialize edit form address autocomplete
    function initEditAutocomplete() {
      const input = document.getElementById('editAddressAutocomplete');
      if (!input || !window.google) return;
      
      editAutocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address']
      });
      
      editAutocomplete.addListener('place_changed', () => {
        const place = editAutocomplete.getPlace();
        if (!place.address_components) return;
        
        // Populate address fields
        place.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            document.getElementById('editClientStreet').value = place.name || '';
          }
          if (types.includes('locality')) {
            document.getElementById('editClientCity').value = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            document.getElementById('editClientState').value = component.short_name;
          }
          if (types.includes('postal_code')) {
            document.getElementById('editClientPostalCode').value = component.long_name;
          }
          if (types.includes('country')) {
            document.getElementById('editClientCountry').value = component.long_name;
          }
        });
      });
    }

    // Handle edit order form submission
    window.addEventListener('DOMContentLoaded', () => {
      const editOrderForm = document.getElementById('editOrderForm');
      if (editOrderForm) {
        editOrderForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const currentUser = firebase.auth().currentUser;
          const orderId = document.getElementById('editOrderId').value;
          
          if (!currentUser || !orderId) {
            alert('Error: Missing user or order ID');
            return;
          }
          
          // Collect colors from hidden inputs
          const colors = [];
          for (let i = 1; i <= 4; i++) {
            const colorValue = document.getElementById(`editColor${i}`).value.trim();
            if (colorValue) {
              colors.push(colorValue);
            }
          }
          
          // Get the values entered by user (in their current currency)
          const totalInCurrentCurrency = parseFloat(document.getElementById('editOrderTotal').value) || 0;
          const amountPaidInCurrentCurrency = parseFloat(document.getElementById('editAmountPaid').value) || 0;
          
          // Convert to USD for storage in Firebase
          const totalInUSD = convertToUSD(totalInCurrentCurrency);
          const amountPaidInUSD = convertToUSD(amountPaidInCurrentCurrency);
          
          // Calculate payment status automatically based on amounts
          const autoPaymentStatus = calculatePaymentStatus(totalInUSD, amountPaidInUSD);
          
          const orderData = {
            date: ordersData.find(o => o.id === orderId)?.date || Date.now(), // Preserve original date
            orderTitle: document.getElementById('editOrderTitle').value.trim(),
            clientName: document.getElementById('editClientName').value.trim(),
            clientEmail: document.getElementById('editClientEmail').value.trim(),
            clientPhone: document.getElementById('editClientPhone').value.trim(),
            clientStreet: document.getElementById('editClientStreet').value.trim(),
            clientCity: document.getElementById('editClientCity').value.trim(),
            clientState: document.getElementById('editClientState').value.trim(),
            clientPostalCode: document.getElementById('editClientPostalCode').value.trim(),
            clientCountry: document.getElementById('editClientCountry').value.trim(),
            messagingApp: document.getElementById('editMessagingApp').value,
            productName: document.getElementById('editProductName').value.trim(),
            quantity: parseInt(document.getElementById('editQuantity').value) || 1,
            colors: colors,
            material: document.getElementById('editMaterial').value,
            finish: document.getElementById('editFinish').value,
            scale: document.getElementById('editScale').value,
            extraNotes: document.getElementById('editExtraNotes').value.trim(),
            total: totalInUSD,
            amountPaid: amountPaidInUSD,
            paymentMethod: document.getElementById('editPaymentMethod').value,
            paymentStatus: autoPaymentStatus, // Use auto-calculated status
            orderStatus: document.getElementById('editOrderStatus').value
          };
          
          try {
            await firebase.database().ref(`orders/${currentUser.uid}/${orderId}`).set(orderData);
            alert('Order updated successfully!');
            closeEditOrderModal();
          } catch (error) {
            alert('Error updating order: ' + error.message);
          }
        });
      }
    });

    // Duplicate order
    window.duplicateOrder = function(orderId) {
      if (!confirm('Create a duplicate of this order?')) return;
      
      const currentUser = firebase.auth().currentUser;
      const order = ordersData.find(o => o.id === orderId);
      if (!order) return;
      
      const duplicatedOrder = {
        ...order,
        date: Date.now(),
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        amountPaid: 0
      };
      
      delete duplicatedOrder.id;
      
      firebase.database().ref(`orders/${currentUser.uid}`).push().set(duplicatedOrder)
        .then(() => alert('Order duplicated successfully!'))
        .catch(error => alert('Error: ' + error.message));
    };

    // Delete order
    window.deleteOrder = function(orderId) {
      if (!confirm('Delete this order? This cannot be undone!')) return;
      
      const currentUser = firebase.auth().currentUser;
      
      firebase.database().ref(`orders/${currentUser.uid}/${orderId}`).remove()
        .then(() => alert('Order deleted'))
        .catch(error => alert('Error: ' + error.message));
    };
    
    // Initialize filters when DOM is ready
    initializeFilters();

    console.log('Orders.js: All functions initialized and ready');
  });
})();
