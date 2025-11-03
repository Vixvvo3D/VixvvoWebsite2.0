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
    let globalColorsData = {};
    let userColorsData = {};
    
    // DOM elements
    const searchInput = document.getElementById('searchOrders');
    const statusFilter = document.getElementById('statusFilter');
    
    // Currency helper functions
    function getCurrencySymbolLocal() {
      if (typeof window.getCurrencySymbol === 'function') {
        return window.getCurrencySymbol();
      }
      return '$';
    }
    
    function formatCurrencyLocal(amount) {
      if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
      }
      return amount.toFixed(2);
    }
    
    function convertFromUSD(amount) {
      if (typeof window.convertFromUSD === 'function') {
        return window.convertFromUSD(amount);
      }
      return amount;
    }
    
    function convertToUSD(amount) {
      if (typeof window.convertToUSD === 'function') {
        return window.convertToUSD(amount);
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
      
      // Sort by date (newest first)
      filteredOrders.sort((a, b) => (b.date || 0) - (a.date || 0));
      
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
                <th>Product</th>
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
                  <td>${order.productName || 'N/A'}</td>
                  <td>${getCurrencySymbolLocal()}${formatCurrencyLocal(convertFromUSD(order.total || 0))}</td>
                  <td><span class="status-badge status-${order.orderStatus || 'pending'}">${order.orderStatus || 'pending'}</span></td>
                  <td><span class="status-badge status-${order.paymentStatus || 'unpaid'}">${order.paymentStatus || 'unpaid'}</span></td>
                  <td>${formatDate(order.date)}</td>
                  <td>
                    <div class="order-actions">
                      <button class="btn-action" onclick="viewOrder('${order.id}')">View</button>
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

    // Populate color picker
    function populateColorPicker() {
      const grid = document.getElementById('colorSelectionGrid');
      if (!grid) return;
      
      const allColors = [
        ...Object.entries(globalColorsData).map(([id, color]) => ({ ...color, id, source: 'global' })),
        ...Object.entries(userColorsData).map(([id, color]) => ({ ...color, id, source: 'user' }))
      ];
      
      if (allColors.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No colors available</p>';
        return;
      }
      
      grid.innerHTML = allColors.map(color => `
        <div class="color-option" 
             style="background-color: ${color.hex}; border-color: ${color.hex};" 
             onclick="selectColor('${color.id}', '${color.name}', '${color.hex}')"
             title="${color.name}">
          <span class="color-option-label" style="color: ${getContrastColor(color.hex)};">
            ${color.name.substring(0, 12)}
          </span>
        </div>
      `).join('');
    }

    // Select color for order
    window.selectColor = function(id, name, hex) {
      if (selectedColors.length >= 4) {
        alert('Maximum 4 colors allowed');
        return;
      }
      
      if (selectedColors.some(c => c.hex === hex)) {
        alert('Color already selected');
        return;
      }
      
      selectedColors.push({ id, name, hex });
      updateSelectedColorsPreview();
      updateColorHiddenInputs();
    };

    function updateSelectedColorsPreview() {
      const preview = document.getElementById('selectedColorsPreview');
      if (!preview) return;
      
      preview.innerHTML = selectedColors.map((color, index) => `
        <div style="position: relative; width: 40px; height: 40px; border-radius: 6px; background-color: ${color.hex}; border: 2px solid var(--purple); cursor: pointer;" 
             onclick="removeSelectedColor(${index})"
             title="${color.name} - Click to remove">
        </div>
      `).join('');
    }

    window.removeSelectedColor = function(index) {
      selectedColors.splice(index, 1);
      updateSelectedColorsPreview();
      updateColorHiddenInputs();
    };

    function updateColorHiddenInputs() {
      for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`color${i}`);
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
            total: parseFloat(document.getElementById('orderTotal').value) || 0,
            amountPaid: parseFloat(document.getElementById('amountPaid').value) || 0,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentStatus: document.getElementById('paymentStatus').value,
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

    // View order
    window.viewOrder = function(orderId) {
      alert('View order functionality - ID: ' + orderId + '\nFull implementation in progress');
    };

    window.closeViewOrderModal = function() {
      const modal = document.getElementById('viewOrderModal');
      if (modal) {
        modal.style.display = 'none';
      }
    };

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
    
    // Add event listeners
    if (searchInput) {
      searchInput.addEventListener('input', renderOrdersTable);
    }
    
    if (statusFilter) {
      statusFilter.addEventListener('change', renderOrdersTable);
    }

    console.log('Orders.js: All functions initialized and ready');
  });
})();
