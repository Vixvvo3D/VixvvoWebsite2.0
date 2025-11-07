/**
 * Upload Model Page Script
 * Handles model creation, file uploads, supplies, and form validation
 */

// Use existing Firebase instances (initialized in auth.js and dashboard.js)
// auth and db are already declared globally by auth.js
const storage = firebase.storage();

// Global state
const state = {
  currentUser: null,
  initialized: false, // Track if module has been initialized
  files: [],
  supplies: [],
  selectedFilament: null,
  categories: new Set(),
  printers: [],
  existingSupplies: [],
  modelImage: null, // Store cropped image
  editingModelId: null, // Track if we're editing a model
  existingImageUrl: null, // Store existing image URL when editing
  existingFiles: [], // Store existing files when editing
  cropData: {
    canvas: null,
    ctx: null,
    img: null,
    cropArea: { x: 0, y: 0, size: 0 }
  }
};

// Initialize page - Modified for dashboard integration
document.addEventListener('DOMContentLoaded', function() {
  console.log('Upload Model module loading...');
  
  // Wait for auth state
  auth.onAuthStateChanged((user) => {
    if (user) {
      state.currentUser = user;
      
      // Check if we're on standalone page or dashboard
      const isStandalone = window.location.pathname.includes('upload-model.html');
      
      if (isStandalone) {
        // Standalone page - initialize immediately
        initializePage();
      } else {
        // Dashboard integration - initialize when tab is active
        console.log('Upload Model ready for dashboard tab activation');
        
        // Initialize when upload-model section becomes active
        const observer = new MutationObserver((mutations) => {
          const uploadSection = document.getElementById('upload-model-section');
          if (uploadSection && uploadSection.classList.contains('active') && !state.initialized) {
            console.log('Upload Model tab activated - initializing...');
            state.initialized = true;
            initializePage();
          }
        });
        
        // Observe class changes on page sections
        const pageWrapper = document.getElementById('page-content-wrapper');
        if (pageWrapper) {
          observer.observe(pageWrapper, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
          });
        }
        
        // Check if already active on load
        const uploadSection = document.getElementById('upload-model-section');
        if (uploadSection && uploadSection.classList.contains('active')) {
          state.initialized = true;
          initializePage();
        }
      }
    } else if (window.location.pathname.includes('upload-model.html')) {
      // Only redirect on standalone page
      window.location.href = '../index.html?login=true';
    }
  });
});

/**
 * Initialize page after auth
 */
function initializePage() {
  // Safety check - ensure user is authenticated
  if (!state.currentUser || !state.currentUser.uid) {
    console.error('Upload Model: Cannot initialize - user not authenticated');
    return;
  }
  
  console.log('Initializing Upload Model for user:', state.currentUser.uid);
  
  // Load data
  loadCategories();
  loadFilamentsForUpload();
  loadSupplies();
  loadPrintersForUpload();
  loadModels(); // Load existing models
  
  // Setup event listeners
  setupShowAddModelButton();
  setupFileUpload();
  setupImageUpload();
  setupFormValidation();
  setupFilamentSelector();
  setupSupplyButtons();
  setupPrinterButton();
  setupFormSubmit();
  
  // Hide loading overlay
  hideLoadingOverlay();
}

/**
 * Setup show add model button
 */
function setupShowAddModelButton() {
  const btn = document.getElementById('btnShowAddModel');
  if (!btn) {
    console.error('Upload Model: btnShowAddModel not found');
    return;
  }
  
  console.log('Upload Model: Adding click handler to btnShowAddModel');
  btn.addEventListener('click', () => {
    console.log('Upload Model: btnShowAddModel clicked');
    openAddModelModal();
  });
}

/**
 * Open add model modal
 */
function openAddModelModal() {
  console.log('Upload Model: Opening add model modal');
  const modal = document.getElementById('addModelModal');
  
  if (!modal) {
    console.error('Upload Model: addModelModal not found in DOM');
    return;
  }
  
  console.log('Upload Model: Modal found, setting display to grid');
  modal.style.display = 'grid';
  
  // Close on outside click
  modal.onclick = (e) => {
    if (e.target.id === 'addModelModal') {
      closeAddModelModal();
    }
  };
}

/**
 * Close add model modal
 */
function closeAddModelModal() {
  console.log('Upload Model: Closing add model modal');
  const modal = document.getElementById('addModelModal');
  if (modal) {
    modal.style.display = 'none';
  }
  resetForm();
}

/**
 * Load and display models
 */
function loadModels() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  db.ref(`users/${state.currentUser.uid}/models`).on('value', snapshot => {
    const models = snapshot.val();
    renderModels(models);
  });
}

/**
 * Render models list
 */
function renderModels(models) {
  const modelsList = document.getElementById('modelsList');
  
  if (!models || Object.keys(models).length === 0) {
    modelsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No models yet</div>
        <div class="empty-state-text">Start by adding your first 3D model to your inventory</div>
        <button type="button" class="btn btn-primary" onclick="document.getElementById('btnShowAddModel').click()">
          Add Your First Model
        </button>
      </div>
    `;
    return;
  }
  
  const modelsArray = Object.entries(models).map(([id, model]) => ({
    id,
    ...model
  })).sort((a, b) => b.createdAt - a.createdAt);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  modelsList.innerHTML = `
    <div class="orders-table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Designer</th>
            <th>Print Time</th>
            <th>Files</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${modelsArray.map(model => `
            <tr>
              <td>
                ${model.imageUrl ? `
                  <img src="${model.imageUrl}" alt="${model.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1);">
                ` : `
                  <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; padding: 8px;">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                `}
              </td>
              <td>${model.name || 'N/A'}</td>
              <td>${model.category || 'N/A'}</td>
              <td>${model.sku === '0' || model.sku === 0 ? '<span style="color: #a855f7; font-size: 18px;">∞</span>' : (model.sku || 'N/A')}</td>
              <td>${model.designer || 'N/A'}</td>
              <td>${model.printTime ? `${model.printTime.hours}h ${model.printTime.minutes}m` : 'N/A'}</td>
              <td>${model.files ? model.files.length : 0} file(s)</td>
              <td>
                <div class="order-actions">
                  <button class="btn-action" onclick="viewModel('${model.id}')">View</button>
                  <button class="btn-action" onclick="editModel('${model.id}')">Edit</button>
                  <button class="btn-action" onclick="deleteModel('${model.id}')">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * View model details
 */
function viewModel(modelId) {
  console.log('View model:', modelId);
  
  // Load model data
  db.ref(`users/${state.currentUser.uid}/models/${modelId}`).once('value')
    .then(snapshot => {
      const model = snapshot.val();
      if (!model) {
        showToast('Error', 'Model not found', 'error');
        return;
      }
      
      console.log('Loaded model for viewing:', model);
      
      // Populate view modal
      const viewContent = document.getElementById('viewModelContent');
      
      viewContent.innerHTML = `
        <!-- Top Section: Image + Model Information -->
        <div style="display: grid; grid-template-columns: 250px 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Model Image -->
          ${model.imageUrl ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <img src="${model.imageUrl}" alt="${model.name}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
            </div>
          ` : `
            <div style="width: 100%; aspect-ratio: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          `}
          
          <!-- Model Information -->
          <div style="padding: 24px; background: rgba(0, 0, 0, 0.15); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Model Information</h4>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              <div>
                <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Model Name</label>
                <p style="color: #ffffff; margin: 0; font-size: 14px;">${model.name || 'N/A'}</p>
              </div>
              
              <div>
                <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Category</label>
                <p style="color: #ffffff; margin: 0; font-size: 14px;">${model.category || 'N/A'}</p>
              </div>
              
              <div>
                <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">SKU</label>
                <p style="color: ${model.sku === '0' || model.sku === 0 ? '#a855f7' : '#ffffff'}; margin: 0; font-size: ${model.sku === '0' || model.sku === 0 ? '20px' : '14px'};">${model.sku === '0' || model.sku === 0 ? '∞' : (model.sku || 'N/A')}</p>
              </div>
              
              <div>
                <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Designer</label>
                <p style="color: #ffffff; margin: 0; font-size: 14px;">${model.designer || 'N/A'}</p>
              </div>
              
              ${model.printTime ? `
                <div>
                  <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Print Time</label>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${model.printTime.hours}h ${model.printTime.minutes}m</p>
                </div>
              ` : ''}
              
              ${model.marketplace ? `
                <div>
                  <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Marketplace</label>
                  <p style="color: #ffffff; margin: 0; font-size: 14px;">${model.marketplace}</p>
                </div>
              ` : ''}
              
              ${model.description ? `
                <div style="grid-column: 1 / -1;">
                  <label style="display: block; color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; font-weight: 500;">Description</label>
                  <p style="color: #ffffff; margin: 0; font-size: 14px; line-height: 1.6;">${model.description}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Files -->
        ${model.files && model.files.length > 0 ? `
          <div style="padding: 24px; background: rgba(0, 0, 0, 0.15); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 24px;">
            <h4 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Files (${model.files.length})</h4>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${model.files.map(file => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <img src="../images/Icons/File.svg" alt="" style="width: 20px; height: 20px; filter: brightness(0) invert(1); opacity: 0.7;">
                    <div style="flex: 1;">
                      <div style="color: #ffffff; font-size: 14px; font-weight: 500;">${file.name}</div>
                      <div style="color: #9ca3af; font-size: 12px;">${formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button onclick="window.open('${file.url}', '_blank')" class="btn-action" style="white-space: nowrap;">
                    <img src="../images/Icons/Download.svg" alt="" style="width: 16px; height: 16px; margin-right: 6px; filter: brightness(0) invert(1);">
                    Download
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Supplies -->
        ${model.supplies && model.supplies.length > 0 ? (() => {
          let totalSupplyCost = 0;
          const suppliesHTML = model.supplies.map(supply => {
            const supplyCost = supply.costPerItem * supply.neededForModel;
            totalSupplyCost += supplyCost;
            
            const costPerItemFormatted = formatSupplyCurrency(supply.costPerItem);
            const supplyCostFormatted = formatSupplyCurrency(supplyCost);
            
            return `
              <div style="padding: 12px; background: rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
                <div style="color: #ffffff; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${supply.name}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                  <div>
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">Category</div>
                    <div style="color: #ffffff; font-size: 12px;">${supply.category}</div>
                  </div>
                  <div>
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">Qty Needed</div>
                    <div style="color: #ffffff; font-size: 12px;">${supply.neededForModel}</div>
                  </div>
                  <div>
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">Cost/Item</div>
                    <div style="color: #ffffff; font-size: 12px;">${costPerItemFormatted}</div>
                  </div>
                  <div>
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">In Stock</div>
                    <div style="color: ${supply.inStock === 0 ? '#a855f7' : '#ffffff'}; font-size: ${supply.inStock === 0 ? '16px' : '12px'};">${supply.inStock === 0 ? '∞' : supply.inStock}</div>
                  </div>
                </div>
                <div style="padding: 6px 10px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 6px; margin-top: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #9ca3af; font-size: 11px;">Cost:</span>
                    <span style="color: #a855f7; font-size: 13px; font-weight: 700;">${costPerItemFormatted} × ${supply.neededForModel} = ${supplyCostFormatted}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('');
          
          const totalFormatted = formatSupplyCurrency(totalSupplyCost);
          
          return `
          <div style="padding: 24px; background: rgba(0, 0, 0, 0.15); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 24px;">
            <h4 style="color: #a855f7; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Supplies (${model.supplies.length})</h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-bottom: 16px;">
              ${suppliesHTML}
            </div>
            
            <div style="padding: 16px; background: rgba(168, 85, 247, 0.15); border: 2px solid rgba(168, 85, 247, 0.3); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Total Supply Cost per Model:</span>
                <span style="color: #a855f7; font-size: 18px; font-weight: 700;">${totalFormatted}</span>
              </div>
            </div>
          </div>
          `;
        })() : ''}
        
        <!-- Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px;">
          <button type="button" class="btn-calc-ghost" onclick="closeViewModelModal()">Close</button>
          <button type="button" class="btn-calc" onclick="closeViewModelModal(); editModel('${modelId}')">Edit Model</button>
        </div>
      `;
      
      // Show modal
      openViewModelModal();
      
    })
    .catch(error => {
      console.error('Error loading model:', error);
      showToast('Error', 'Failed to load model', 'error');
    });
}

/**
 * Open view model modal
 */
function openViewModelModal() {
  const modal = document.getElementById('viewModelModal');
  if (modal) {
    modal.style.display = 'grid';
  }
}

/**
 * Close view model modal
 */
function closeViewModelModal() {
  const modal = document.getElementById('viewModelModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Make functions globally available
window.openViewModelModal = openViewModelModal;
window.closeViewModelModal = closeViewModelModal;

/**
 * Edit model
 */
function editModel(modelId) {
  console.log('Edit model:', modelId);
  
  // Load model data
  db.ref(`users/${state.currentUser.uid}/models/${modelId}`).once('value')
    .then(snapshot => {
      const model = snapshot.val();
      if (!model) {
        showToast('Error', 'Model not found', 'error');
        return;
      }
      
      console.log('Loaded model for editing:', model);
      
      // Store the model ID in state for updating
      state.editingModelId = modelId;
      
      // Populate form with existing data
      const setInputValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
      };
      
      setInputValue('sku', model.sku);
      setInputValue('designer', model.designer);
      setInputValue('category', model.category);
      setInputValue('marketplace', model.marketplace);
      setInputValue('modelName', model.name);
      setInputValue('printHours', model.printTime?.hours || 0);
      setInputValue('printMinutes', model.printTime?.minutes || 0);
      setInputValue('salesPlatform', model.salesPlatform);
      setInputValue('printerSelect', model.printer);
      
      // Load existing image if present
      const previewImg = document.getElementById('imagePreviewImg');
      const placeholder = document.querySelector('.image-preview-placeholder');
      const removeBtn = document.getElementById('btnRemoveImage');
      
      if (model.imageUrl) {
        if (previewImg && placeholder && removeBtn) {
          previewImg.src = model.imageUrl;
          previewImg.style.display = 'block';
          placeholder.style.display = 'none';
          removeBtn.style.display = 'block';
          
          // Store existing image URL in state
          state.existingImageUrl = model.imageUrl;
        }
      } else {
        // No image - show placeholder
        if (previewImg && placeholder && removeBtn) {
          previewImg.style.display = 'none';
          previewImg.removeAttribute('src');
          previewImg.src = '';
          placeholder.style.display = 'flex';
          removeBtn.style.display = 'none';
          state.existingImageUrl = null;
        }
      }
      
      // Load filament data
      if (model.filament) {
        const filamentSelect = document.getElementById('filamentSelect');
        if (filamentSelect) {
          const filamentValue = `${model.filament.source}_${model.filament.id}`;
          filamentSelect.value = filamentValue;
          
          // Trigger change event to display filament info
          state.selectedFilament = model.filament;
          displayFilamentInfo(model.filament);
        }
      }
      
      // Load supplies
      state.supplies = model.supplies || [];
      renderSupplyList();
      
      // Load files info (display existing files)
      state.existingFiles = model.files || [];
      renderFileList(); // Show existing files in the list
      
      // Change modal title and button text
      // Try different selectors for dashboard vs standalone page
      const modalTitle = document.querySelector('#addModelModal .modal-title-large') || 
                        document.querySelector('#addModelModal .modal-title') || 
                        document.querySelector('#addModelModal h3');
      const submitBtn = document.getElementById('btnCreateModel');
      
      if (modalTitle) {
        modalTitle.innerHTML = 'Edit <span class="gradient-highlight">Model</span>';
      }
      
      if (submitBtn) {
        submitBtn.textContent = 'UPDATE MODEL';
      }
      
      // Open modal
      openAddModelModal();
      
      // Validate form
      validateForm();
    })
    .catch(error => {
      console.error('Error loading model for edit:', error);
      showToast('Error', 'Failed to load model', 'error');
    });
}

/**
 * Delete model
 */
function deleteModel(modelId) {
  db.ref(`users/${state.currentUser.uid}/models/${modelId}`).once('value')
    .then(snapshot => {
      const model = snapshot.val();
      if (!model) return;
      
      if (confirm(`Are you sure you want to delete "${model.name}"?`)) {
        // Delete model
        return db.ref(`users/${state.currentUser.uid}/models/${modelId}`).remove()
          .then(() => {
            showToast('Success', 'Model deleted successfully', 'success');
          });
      }
    })
    .catch(error => {
      console.error('Error deleting model:', error);
      showToast('Error', 'Failed to delete model', 'error');
    });
}

/**
 * Load saved categories
 */
function loadCategories() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  db.ref(`users/${state.currentUser.uid}/modelCategories`).once('value')
    .then(snapshot => {
      const categories = snapshot.val() || {};
      const datalist = document.getElementById('categoryOptions');
      
      if (datalist) {
        Object.values(categories).forEach(category => {
          state.categories.add(category);
          const option = document.createElement('option');
          option.value = category;
          datalist.appendChild(option);
        });
      }
    })
    .catch(error => console.error('Error loading categories:', error));
}

/**
 * Load filaments from both global and user libraries
 */
function loadFilamentsForUpload() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  const globalGroup = document.getElementById('globalFilamentsGroup');
  const userGroup = document.getElementById('userFilamentsGroup');
  
  if (!globalGroup || !userGroup) return;
  
  // Load global filaments
  db.ref('filaments').once('value')
    .then(snapshot => {
      const filaments = snapshot.val() || {};
      Object.entries(filaments).forEach(([id, filament]) => {
        const option = document.createElement('option');
        option.value = `global_${id}`;
        const colorText = filament.color ? ` (${filament.color})` : '';
        option.textContent = `${filament.brand} - ${filament.type}${colorText}`;
        option.dataset.filament = JSON.stringify({ ...filament, source: 'global', id });
        globalGroup.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading global filaments:', error));
  
  // Load user filaments
  db.ref(`users/${state.currentUser.uid}/filaments`).once('value')
    .then(snapshot => {
      const filaments = snapshot.val() || {};
      Object.entries(filaments).forEach(([id, filament]) => {
        const option = document.createElement('option');
        option.value = `user_${id}`;
        const colorText = filament.color ? ` (${filament.color})` : '';
        option.textContent = `${filament.brand} - ${filament.type}${colorText}`;
        option.dataset.filament = JSON.stringify({ ...filament, source: 'user', id });
        userGroup.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading user filaments:', error));
}

/**
 * Load existing supplies
 */
function loadSupplies() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  db.ref(`users/${state.currentUser.uid}/supplies`).once('value')
    .then(snapshot => {
      const supplies = snapshot.val() || {};
      state.existingSupplies = Object.entries(supplies).map(([id, supply]) => ({
        id,
        ...supply
      }));
      
      console.log(`Loaded ${state.existingSupplies.length} supplies`);
    })
    .catch(error => console.error('Error loading supplies:', error));
}

/**
 * Load printers
 */
function loadPrintersForUpload() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  const globalGroup = document.getElementById('globalPrintersGroup');
  const userGroup = document.getElementById('userPrintersGroup');
  
  if (!globalGroup || !userGroup) return;
  
  // Load global printers
  db.ref('printers').once('value')
    .then(snapshot => {
      const printers = snapshot.val() || {};
      Object.entries(printers).forEach(([id, printer]) => {
        const option = document.createElement('option');
        option.value = `global_${id}`;
        option.textContent = printer.name || printer;
        globalGroup.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading global printers:', error));
  
  // Load user printers
  db.ref(`users/${state.currentUser.uid}/printers`).once('value')
    .then(snapshot => {
      const printers = snapshot.val() || {};
      state.printers = Object.entries(printers).map(([id, name]) => ({ id, name }));
      
      state.printers.forEach(printer => {
        const option = document.createElement('option');
        option.value = `user_${printer.id}`;
        option.textContent = printer.name;
        userGroup.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading user printers:', error));
}

/**
 * Setup file upload drag & drop
 */
function setupFileUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });
  
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });
}

/**
 * Handle selected files
 */
function handleFiles(files) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedExtensions = ['.stl', '.3mf', '.obj', '.step', '.zip'];
  
  files.forEach(file => {
    // Validate size
    if (file.size > maxSize) {
      showToast('Error', `File ${file.name} is too large (max 100MB)`, 'error');
      return;
    }
    
    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      showToast('Error', `File type ${ext} not supported`, 'error');
      return;
    }
    
    // Add to state
    const fileObj = {
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      uploaded: false
    };
    
    state.files.push(fileObj);
    renderFileList();
  });
  
  validateForm();
}

/**
 * Render file list
 */
function renderFileList() {
  const fileList = document.getElementById('fileList');
  
  if (!fileList) return; // Safety check
  
  // Combine existing files and new files
  const allFiles = [];
  
  // Add existing files (when editing)
  if (state.existingFiles && state.existingFiles.length > 0) {
    state.existingFiles.forEach((file, index) => {
      allFiles.push({
        id: `existing_${index}`,
        index: index,
        name: file.name,
        size: file.size,
        isExisting: true,
        fileData: file
      });
    });
  }
  
  // Add new files
  state.files.forEach(file => {
    allFiles.push({
      id: file.id,
      name: file.name,
      size: file.size,
      progress: file.progress,
      isExisting: false
    });
  });
  
  if (allFiles.length === 0) {
    fileList.innerHTML = '';
    return;
  }
  
  fileList.innerHTML = allFiles.map(file => `
    <div class="file-item ${file.isExisting ? 'existing-file' : ''}" data-id="${file.id}" data-is-existing="${file.isExisting}">
      <div class="file-icon">
        <img src="../images/Icons/${file.isExisting ? 'Paperclip' : 'File'}.svg" alt="" style="width: 20px; height: 20px; filter: brightness(0) invert(1); opacity: 0.7;">
      </div>
      <div class="file-info">
        <div class="file-name">
          ${file.name}
          ${file.isExisting ? '<span class="existing-badge">Existing</span>' : ''}
        </div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        ${file.progress > 0 ? `
          <div class="file-progress">
            <div class="file-progress-bar" style="width: ${file.progress}%"></div>
          </div>
        ` : ''}
      </div>
      <div class="file-actions" style="display: flex; gap: 8px;">
        ${file.isExisting ? `
          <button type="button" class="file-action-btn" onclick="window.open('${file.fileData.url}', '_blank')" title="Download">
            <img src="../images/Icons/Download.svg" alt="Download" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
          </button>
        ` : ''}
        <button type="button" class="file-remove ${file.isExisting ? 'file-remove-existing' : ''}" data-file-id="${file.id}" data-file-index="${file.index !== undefined ? file.index : ''}" data-is-existing="${file.isExisting}" title="Remove">
          <img src="../images/Icons/Trash.svg" alt="Remove" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event delegation for remove buttons
  fileList.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const fileId = this.getAttribute('data-file-id');
      const fileIndex = this.getAttribute('data-file-index');
      const isExisting = this.getAttribute('data-is-existing') === 'true';
      
      if (isExisting) {
        removeExistingFile(parseInt(fileIndex));
      } else {
        removeFile(fileId);
      }
    });
  });
}

/**
 * Remove file
 */
function removeFile(fileId) {
  state.files = state.files.filter(f => f.id != fileId);
  renderFileList();
  validateForm();
}

/**
 * Remove existing file (when editing)
 */
async function removeExistingFile(fileIndex) {
  console.log('removeExistingFile called with index:', fileIndex);
  
  if (fileIndex < 0 || fileIndex >= state.existingFiles.length) {
    console.error('Invalid file index:', fileIndex);
    showToast('Error', 'File not found', 'error');
    return;
  }
  
  const file = state.existingFiles[fileIndex];
  console.log('Found file:', file);
  
  const fileName = file.name || 'this file';
  
  if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
    console.log('User cancelled deletion');
    return;
  }
  
  console.log('User confirmed deletion');
  
  try {
    // Show loading state
    showToast('Deleting', `Deleting ${fileName}...`, 'success');
    
    // Delete from Storage if URL exists
    if (file.url) {
      try {
        const fileRef = storage.refFromURL(file.url);
        await fileRef.delete();
        console.log('File deleted from storage:', file.url);
      } catch (storageError) {
        console.warn('Could not delete from storage:', storageError);
        // Continue anyway - file might already be deleted
      }
    }
    
    // Remove from state by index
    state.existingFiles.splice(fileIndex, 1);
    
    // Update Firebase database immediately
    if (state.editingModelId) {
      await db.ref(`users/${state.currentUser.uid}/models/${state.editingModelId}/files`).set(state.existingFiles);
    }
    
    // Update UI
    renderFileList();
    validateForm();
    
    showToast('Success', `${fileName} deleted successfully`, 'success');
  } catch (error) {
    console.error('Error deleting file:', error);
    showToast('Error', `Failed to delete ${fileName}`, 'error');
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Setup image upload
 */
function setupImageUpload() {
  const imageInput = document.getElementById('imageInput');
  const btnRemove = document.getElementById('btnRemoveImage');
  
  imageInput.addEventListener('change', handleImageSelect);
  btnRemove.addEventListener('click', removeImage);
}

/**
 * Handle image selection
 */
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Error', 'Please select an image file', 'error');
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showToast('Error', 'Image must be less than 10MB', 'error');
    return;
  }
  
  // Read and show crop modal
  const reader = new FileReader();
  reader.onload = (event) => {
    openCropModal(event.target.result);
  };
  reader.readAsDataURL(file);
  
  // Reset input
  e.target.value = '';
}

/**
 * Open crop modal
 */
function openCropModal(imageSrc) {
  const modal = document.getElementById('cropModal');
  const canvas = document.getElementById('cropCanvas');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    // Set canvas size to fit image (max 600x600)
    const maxSize = 600;
    let width = img.width;
    let height = img.height;
    
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw image
    ctx.drawImage(img, 0, 0, width, height);
    
    // Store in state
    state.cropData.canvas = canvas;
    state.cropData.ctx = ctx;
    state.cropData.img = img;
    
    // Calculate square crop area (centered)
    const size = Math.min(width, height);
    state.cropData.cropArea = {
      x: (width - size) / 2,
      y: (height - size) / 2,
      size: size
    };
    state.cropData.isDragging = false;
    state.cropData.dragStart = { x: 0, y: 0 };
    
    // Add drag handlers
    canvas.onmousedown = startDrag;
    canvas.onmousemove = drag;
    canvas.onmouseup = endDrag;
    canvas.onmouseleave = endDrag;
    
    // Touch support
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const mouseEvent = {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
      startDrag(mouseEvent);
    };
    canvas.ontouchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const mouseEvent = {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
      drag(mouseEvent);
    };
    canvas.ontouchend = (e) => {
      e.preventDefault();
      endDrag();
    };
    
    // Draw crop overlay
    drawCropOverlay();
    
    // Show modal
    modal.style.display = 'grid';
  };
  img.src = imageSrc;
}

/**
 * Start dragging crop area
 */
function startDrag(e) {
  const { cropArea, canvas } = state.cropData;
  const x = e.offsetX;
  const y = e.offsetY;
  
  // Check if click is inside crop area
  if (x >= cropArea.x && x <= cropArea.x + cropArea.size &&
      y >= cropArea.y && y <= cropArea.y + cropArea.size) {
    state.cropData.isDragging = true;
    state.cropData.dragStart = {
      x: x - cropArea.x,
      y: y - cropArea.y
    };
    canvas.style.cursor = 'grabbing';
  }
}

/**
 * Drag crop area
 */
function drag(e) {
  if (!state.cropData.isDragging) {
    // Change cursor when hovering over crop area
    const { cropArea } = state.cropData;
    const x = e.offsetX;
    const y = e.offsetY;
    
    if (x >= cropArea.x && x <= cropArea.x + cropArea.size &&
        y >= cropArea.y && y <= cropArea.y + cropArea.size) {
      state.cropData.canvas.style.cursor = 'grab';
    } else {
      state.cropData.canvas.style.cursor = 'default';
    }
    return;
  }
  
  const { cropArea, canvas, dragStart } = state.cropData;
  
  // Calculate new position
  let newX = e.offsetX - dragStart.x;
  let newY = e.offsetY - dragStart.y;
  
  // Keep within bounds
  newX = Math.max(0, Math.min(newX, canvas.width - cropArea.size));
  newY = Math.max(0, Math.min(newY, canvas.height - cropArea.size));
  
  // Update crop area
  cropArea.x = newX;
  cropArea.y = newY;
  
  // Redraw
  drawCropOverlay();
}

/**
 * End dragging crop area
 */
function endDrag() {
  if (state.cropData.isDragging) {
    state.cropData.isDragging = false;
    state.cropData.canvas.style.cursor = 'grab';
  }
}

/**
 * Draw crop overlay
 */
function drawCropOverlay() {
  const { canvas, ctx, img, cropArea } = state.cropData;
  
  // Redraw image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Draw dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Clear crop area
  ctx.clearRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
  ctx.drawImage(img, 
    cropArea.x * (img.width / canvas.width),
    cropArea.y * (img.height / canvas.height),
    cropArea.size * (img.width / canvas.width),
    cropArea.size * (img.height / canvas.height),
    cropArea.x, cropArea.y, cropArea.size, cropArea.size
  );
  
  // Draw crop border
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
}

/**
 * Close crop modal
 */
function closeCropModal() {
  const modal = document.getElementById('cropModal');
  const canvas = document.getElementById('cropCanvas');
  
  if (modal) {
    modal.style.display = 'none';
  }
  
  // Remove event listeners
  if (canvas) {
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
    canvas.onmouseleave = null;
    canvas.ontouchstart = null;
    canvas.ontouchmove = null;
    canvas.ontouchend = null;
    canvas.style.cursor = 'default';
  }
  
  state.cropData = {
    canvas: null,
    ctx: null,
    img: null,
    cropArea: { x: 0, y: 0, size: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  };
}

/**
 * Apply crop
 */
function applyCrop() {
  const { img, cropArea, canvas } = state.cropData;
  
  // Create new canvas for cropped image
  const cropCanvas = document.createElement('canvas');
  const cropSize = 400; // Final square size
  cropCanvas.width = cropSize;
  cropCanvas.height = cropSize;
  const cropCtx = cropCanvas.getContext('2d');
  
  // Calculate source coordinates
  const scaleX = img.width / canvas.width;
  const scaleY = img.height / canvas.height;
  const sourceX = cropArea.x * scaleX;
  const sourceY = cropArea.y * scaleY;
  const sourceSize = cropArea.size * scaleX;
  
  // Draw cropped image
  cropCtx.drawImage(img, 
    sourceX, sourceY, sourceSize, sourceSize,
    0, 0, cropSize, cropSize
  );
  
  // Convert to blob
  cropCanvas.toBlob((blob) => {
    state.modelImage = blob;
    
    // Show preview
    const preview = document.getElementById('imagePreviewImg');
    const placeholder = preview.previousElementSibling;
    preview.src = URL.createObjectURL(blob);
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    
    // Show remove button
    document.getElementById('btnRemoveImage').style.display = 'block';
    
    // Close modal
    closeCropModal();
    
    showToast('Success', 'Image added successfully', 'success');
  }, 'image/jpeg', 0.9);
}

/**
 * Remove image
 */
function removeImage() {
  state.modelImage = null;
  state.imageDeleted = true; // Flag to indicate image should be removed
  
  const preview = document.getElementById('imagePreviewImg');
  const placeholder = preview?.previousElementSibling;
  
  if (preview) {
    preview.style.display = 'none';
    preview.removeAttribute('src');
    preview.src = '';
  }
  
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
  
  const removeBtn = document.getElementById('btnRemoveImage');
  if (removeBtn) {
    removeBtn.style.display = 'none';
  }
}

/**
 * Setup filament selector
 */
function setupFilamentSelector() {
  const select = document.getElementById('filamentSelect');
  const display = document.getElementById('filamentDisplay');
  
  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex];
    
    if (!option.dataset.filament) {
      display.style.display = 'none';
      state.selectedFilament = null;
      return;
    }
    
    const filament = JSON.parse(option.dataset.filament);
    state.selectedFilament = filament;
    
    displayFilamentInfo(filament);
  });
}

/**
 * Display filament information
 */
function displayFilamentInfo(filament) {
  const display = document.getElementById('filamentDisplay');
  
  // Display filament info
  document.getElementById('filamentBrand').textContent = filament.brand || '-';
  document.getElementById('filamentType').textContent = filament.type || '-';
  document.getElementById('filamentWeight').textContent = filament.spoolWeight ? `${filament.spoolWeight}g` : '-';
  document.getElementById('filamentCost').textContent = filament.spoolCost ? `$${filament.spoolCost}` : '-';
  
  display.style.display = 'block';
}

/**
 * Setup supply buttons
 */
function setupSupplyButtons() {
  document.getElementById('btnAddSupply').addEventListener('click', openAddSupplyModal);
  document.getElementById('btnCreateSupply').addEventListener('click', openCreateSupplyModal);
  
  // Search functionality for add supply modal
  const searchInput = document.getElementById('searchAddSupply');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAddSupplyGrid(e.target.value);
    });
  }
  
  // Manage supplies button
  const manageSuppliesBtn = document.getElementById('btnManageSupplies');
  if (manageSuppliesBtn) {
    manageSuppliesBtn.addEventListener('click', openManageSuppliesModal);
  }
  
  // Create supply form
  document.getElementById('createSupplyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    createNewSupply();
  });
}

/**
 * Open add supply modal
 */
function openAddSupplyModal() {
  const modal = document.getElementById('addSupplyModal');
  if (modal) {
    modal.style.display = 'grid';
    renderAddSupplyGrid();
  }
}

/**
 * Close add supply modal
 */
function closeAddSupplyModal() {
  const modal = document.getElementById('addSupplyModal');
  if (modal) {
    modal.style.display = 'none';
  }
  const searchInput = document.getElementById('searchAddSupply');
  if (searchInput) {
    searchInput.value = '';
  }
}

/**
 * Render supply grid in add modal
 */
function renderAddSupplyGrid(searchTerm = '') {
  const grid = document.getElementById('addSupplyGrid');
  if (!grid) return;
  
  // Filter supplies based on search term
  const filteredSupplies = state.existingSupplies.filter(supply => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return supply.name.toLowerCase().includes(search) || 
           supply.category.toLowerCase().includes(search);
  });
  
  // Filter out already added supplies
  const availableSupplies = filteredSupplies.filter(supply => 
    !state.supplies.some(s => s.id === supply.id)
  );
  
  if (availableSupplies.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #9ca3af;">
        <img src="../images/Icons/Box.svg" alt="" style="width: 48px; height: 48px; margin: 0 auto 16px; opacity: 0.3; filter: brightness(0) invert(1);">
        <p style="font-size: 14px;">${searchTerm ? 'No supplies found matching your search' : 'No supplies available. Create one first!'}</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = availableSupplies.map(supply => {
    const costFormatted = formatSupplyCurrency(supply.costPerItem);
    
    return `
      <div class="supply-card-selectable" onclick="selectSupplyToAdd('${supply.id}')" style="padding: 16px; background: rgba(36, 29, 53, 0.4); border: 1px solid #2d2e3a; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
        <div style="margin-bottom: 12px;">
          <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-bottom: 4px;">${supply.name}</div>
          <div style="color: #9ca3af; font-size: 12px;">${supply.category}</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div>
            <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">Cost/Item</div>
            <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${costFormatted}</div>
          </div>
          <div>
            <div style="color: #9ca3af; font-size: 11px; margin-bottom: 2px;">In Stock</div>
            <div style="color: ${supply.inStock === 0 ? '#a855f7' : '#ffffff'}; font-size: ${supply.inStock === 0 ? '16px' : '13px'}; font-weight: 500;">${supply.inStock === 0 ? '∞' : supply.inStock}</div>
          </div>
        </div>
        
        ${supply.purchaseLink ? `
          <div style="margin-bottom: 12px;">
            <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">Purchase Link</div>
            <div style="color: #a855f7; font-size: 11px; word-break: break-all; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${supply.purchaseLink}</div>
          </div>
        ` : ''}
        
        <button type="button" class="btn btn-primary" style="width: 100%; padding: 8px; font-size: 13px;" onclick="event.stopPropagation(); selectSupplyToAdd('${supply.id}')">
          <img src="../images/Icons/Plus.svg" alt="" style="width: 14px; height: 14px; margin-right: 4px; filter: brightness(0) invert(1);">
          Add to Model
        </button>
      </div>
    `;
  }).join('');
  
  // Add hover effects via CSS
  const cards = grid.querySelectorAll('.supply-card-selectable');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(36, 29, 53, 0.6)';
      this.style.borderColor = 'rgba(168, 85, 247, 0.4)';
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(36, 29, 53, 0.4)';
      this.style.borderColor = '#2d2e3a';
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
}

/**
 * Select supply to add
 */
function selectSupplyToAdd(supplyId) {
  const supply = state.existingSupplies.find(s => s.id === supplyId);
  if (!supply) return;
  
  // Check if already added
  if (state.supplies.some(s => s.id === supply.id)) {
    showToast('Error', 'This supply is already added', 'error');
    return;
  }
  
  // Prompt for quantity
  const quantity = prompt(`How many "${supply.name}" are needed for this model?`, '1');
  
  if (quantity && parseInt(quantity) > 0) {
    // Add to state
    state.supplies.push({
      ...supply,
      neededForModel: parseInt(quantity)
    });
    
    renderSupplyList();
    closeAddSupplyModal();
    showToast('Success', `${supply.name} added successfully`, 'success');
  }
}

/**
 * Open create supply modal
 */
function openCreateSupplyModal() {
  const modal = document.getElementById('createSupplyModal');
  if (modal) {
    modal.style.display = 'grid';
  }
  
  // Update currency label
  const currencyLabel = document.getElementById('createSupplyCurrencyLabel');
  if (currencyLabel && typeof window.getCurrencyLabel === 'function') {
    const label = window.getCurrencyLabel(window.currentCurrency);
    currencyLabel.textContent = `(${label})`;
  }
}

/**
 * Close create supply modal
 */
function closeCreateSupplyModal() {
  const modal = document.getElementById('createSupplyModal');
  if (modal) {
    modal.style.display = 'none';
  }
  document.getElementById('createSupplyForm').reset();
}

/**
 * Create new supply
 */
async function createNewSupply() {
  const category = document.getElementById('newSupplyCategory').value.trim();
  const name = document.getElementById('newSupplyName').value.trim();
  const costPerItemInput = parseFloat(document.getElementById('newSupplyCost').value);
  const inStock = parseInt(document.getElementById('newSupplyStock').value) || 0;
  const purchaseLink = document.getElementById('newSupplyLink').value.trim();
  
  if (!category || !name || !costPerItemInput) {
    showToast('Error', 'Please fill in all required fields', 'error');
    return;
  }
  
  try {
    // Convert cost to USD if using different currency
    let costPerItemUSD = costPerItemInput;
    if (typeof window.convertToUSD === 'function' && window.currentCurrency && window.currentCurrency !== 'USD') {
      costPerItemUSD = window.convertToUSD(costPerItemInput, window.currentCurrency);
    }
    
    // Save to Firebase
    const supplyRef = db.ref(`users/${state.currentUser.uid}/supplies`).push();
    const supplyId = supplyRef.key;
    
    const supply = {
      category,
      name,
      costPerItem: costPerItemUSD, // Store in USD
      inStock,
      purchaseLink,
      createdAt: Date.now()
    };
    
    await supplyRef.set(supply);
    
    // Update existing supplies list
    state.existingSupplies.push({ id: supplyId, ...supply });
    
    closeCreateSupplyModal();
    
    // Prompt user to specify quantity needed for this model
    const quantity = prompt(`How many "${name}" are needed for this model?`, '1');
    
    if (quantity && parseInt(quantity) > 0) {
      // Add to state for this model with the specified quantity
      state.supplies.push({
        id: supplyId,
        ...supply,
        neededForModel: parseInt(quantity)
      });
      
      renderSupplyList();
      showToast('Success', `${name} created and added to model`, 'success');
    } else {
      showToast('Success', `${name} created successfully`, 'success');
    }
    
    // Reload supplies in dropdown
    loadSupplies();
  } catch (error) {
    console.error('Error creating supply:', error);
    showToast('Error', 'Failed to create supply', 'error');
  }
}

/**
 * Render supply list
 */
function renderSupplyList() {
  const supplyList = document.getElementById('supplyList');
  
  if (!supplyList) return; // Safety check
  
  if (state.supplies.length === 0) {
    supplyList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No supplies added yet</p>';
    return;
  }
  
  // Calculate total supply cost for all items
  let totalSupplyCost = 0;
  
  supplyList.innerHTML = state.supplies.map((supply, index) => {
    // Calculate cost for this supply (cost per item × quantity needed)
    const supplyCost = supply.costPerItem * supply.neededForModel;
    totalSupplyCost += supplyCost;
    
    // Format currency
    const costPerItemFormatted = formatSupplyCurrency(supply.costPerItem);
    const supplyCostFormatted = formatSupplyCurrency(supplyCost);
    
    return `
    <div class="supply-item" data-index="${index}">
      <div class="supply-header">
        <div class="supply-title">${supply.name}</div>
        <button type="button" class="supply-remove" onclick="removeSupply(${index})">Remove</button>
      </div>
      <div class="supply-grid">
        <div>
          <label style="display: block; color: #9ca3af; margin: 0 0 4px 0; font-size: 11px; font-weight: 500;">Category</label>
          <div style="color: #ffffff; font-size: 13px;">${supply.category}</div>
        </div>
        <div>
          <label style="display: block; color: #9ca3af; margin: 0 0 4px 0; font-size: 11px; font-weight: 500;">Cost/Item</label>
          <div style="color: #ffffff; font-size: 13px;">${costPerItemFormatted}</div>
        </div>
        <div>
          <label style="display: block; color: #9ca3af; margin: 0 0 4px 0; font-size: 11px; font-weight: 500;">In Stock</label>
          <div style="color: ${supply.inStock === 0 ? '#a855f7' : '#ffffff'}; font-size: ${supply.inStock === 0 ? '16px' : '13px'};">${supply.inStock === 0 ? '∞' : supply.inStock}</div>
        </div>
        <div>
          <label style="display: block; color: #9ca3af; margin: 0 0 4px 0; font-size: 11px; font-weight: 500;">Qty Needed</label>
          <div style="color: #ffffff; font-size: 13px;">${supply.neededForModel}</div>
        </div>
        ${supply.purchaseLink ? `
          <div style="grid-column: 1 / -1; margin-top: 4px;">
            <label style="display: block; color: #9ca3af; margin: 0 0 4px 0; font-size: 11px; font-weight: 500;">Purchase Link</label>
            <a href="${supply.purchaseLink}" target="_blank" style="color: #a855f7; text-decoration: none; font-size: 12px; word-break: break-all;">${supply.purchaseLink}</a>
          </div>
        ` : ''}
        <div class="supply-cost-summary">
          <span class="supply-cost-label">Cost for 1 Model:</span>
          <span class="supply-cost-value">${costPerItemFormatted} × ${supply.neededForModel} = ${supplyCostFormatted}</span>
        </div>
      </div>
    </div>
  `;
  }).join('');
  
  // Add total summary at the bottom if there are supplies
  if (state.supplies.length > 0) {
    const totalFormatted = formatSupplyCurrency(totalSupplyCost);
    supplyList.innerHTML += `
      <div style="padding: 16px; background: rgba(168, 85, 247, 0.15); border: 2px solid rgba(168, 85, 247, 0.3); border-radius: 8px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Total Supply Cost per Model:</span>
          <span style="color: #a855f7; font-size: 18px; font-weight: 700;">${totalFormatted}</span>
        </div>
      </div>
    `;
  }
}

/**
 * Remove supply
 */
function removeSupply(index) {
  state.supplies.splice(index, 1);
  renderSupplyList();
}

/**
 * Format supply cost with currency conversion
 */
function formatSupplyCurrency(costUSD) {
  // Use formatCurrency from currency.js if available
  if (typeof window.formatCurrency === 'function' && window.currentCurrency) {
    return window.formatCurrency(parseFloat(costUSD), window.currentCurrency);
  }
  // Fallback to USD
  return `$${parseFloat(costUSD).toFixed(2)}`;
}

/**
 * Open manage supplies modal
 */
function openManageSuppliesModal() {
  const modal = document.getElementById('manageSuppliesModal');
  if (modal) {
    modal.style.display = 'grid';
    loadAllSuppliesForManagement();
  }
}

/**
 * Close manage supplies modal
 */
function closeManageSuppliesModal() {
  const modal = document.getElementById('manageSuppliesModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('searchSupplies').value = '';
  }
}

/**
 * Load all supplies for management view
 */
function loadAllSuppliesForManagement() {
  if (!state.currentUser || !state.currentUser.uid) return;
  
  db.ref(`users/${state.currentUser.uid}/supplies`).once('value')
    .then(snapshot => {
      const supplies = snapshot.val() || {};
      renderManageSuppliesList(supplies);
    })
    .catch(error => {
      console.error('Error loading supplies:', error);
      showToast('Error', 'Failed to load supplies', 'error');
    });
}

/**
 * Render manage supplies list
 */
function renderManageSuppliesList(supplies) {
  const listContainer = document.getElementById('manageSuppliesList');
  
  if (!listContainer) return;
  
  const suppliesArray = Object.entries(supplies).map(([id, supply]) => ({
    id,
    ...supply
  }));
  
  if (suppliesArray.length === 0) {
    listContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
        <div style="width: 80px; height: 80px; background: rgba(168, 85, 247, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <img src="../images/Icons/Package.svg" alt="" style="width: 40px; height: 40px; opacity: 0.4; filter: brightness(0) invert(1);">
        </div>
        <h4 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0;">No Supplies Yet</h4>
        <p style="font-size: 14px; color: #9ca3af; margin: 0 0 24px 0;">Create your first supply to start tracking your inventory</p>
        <button type="button" class="btn btn-primary" onclick="openCreateSupplyForManagement()" style="padding: 10px 24px;">
          <img src="../images/Icons/Plus.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; filter: brightness(0) invert(1);">
          Create First Supply
        </button>
      </div>
    `;
    return;
  }
  
  // Group by category
  const grouped = {};
  suppliesArray.forEach(supply => {
    const category = supply.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(supply);
  });
  
  let html = '';
  Object.keys(grouped).sort().forEach(category => {
    html += `
      <div style="margin-bottom: 24px;">
        <h4 style="color: #a855f7; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">
          ${category} <span style="color: #9ca3af; font-size: 12px; font-weight: 500; text-transform: none; letter-spacing: normal;">(${grouped[category].length} ${grouped[category].length === 1 ? 'item' : 'items'})</span>
        </h4>
        <div style="display: grid; gap: 10px;">
    `;
    
    grouped[category].forEach(supply => {
      // Handle stock status - 0 means unlimited
      let stockStatus;
      if (supply.inStock === 0) {
        stockStatus = `<span style="color: #a855f7; font-weight: 600; font-size: 18px;">∞</span>`;
      } else if (supply.inStock > 0) {
        stockStatus = `<span style="color: #10b981; font-weight: 500;">✓ ${supply.inStock} in stock</span>`;
      } else {
        stockStatus = `<span style="color: #ef4444; font-weight: 500;">✕ Out of stock</span>`;
      }
      
      html += `
        <div style="background: rgba(36, 29, 53, 0.4); border: 1px solid #2d2e3a; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: start; gap: 16px; transition: all 0.2s ease;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #ffffff; margin-bottom: 10px; font-size: 15px;">
              ${supply.name}
            </div>
            
            <!-- Info Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: ${supply.purchaseLink ? '10px' : '0'};">
              <div>
                <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 500;">Cost</div>
                <div style="color: #10b981; font-weight: 600; font-size: 14px;">${formatSupplyCurrency(supply.costPerItem)}<span style="color: #9ca3af; font-weight: 400; font-size: 12px;">/pcs</span></div>
              </div>
              <div>
                <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 500;">Stock</div>
                <div style="font-size: 13px;">
                  ${stockStatus}
                </div>
              </div>
            </div>
            
            ${supply.purchaseLink ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <a href="${supply.purchaseLink}" target="_blank" rel="noopener noreferrer" style="color: #a855f7; text-decoration: none; font-size: 12px; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s ease;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7;">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>Purchase Link</span>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </div>
            ` : ''}
          </div>
          
          <!-- Action Buttons -->
          <div style="display: flex; gap: 8px; align-items: flex-start;">
            <button type="button" class="btn btn-ghost btn-small" onclick="editSupply('${supply.id}')" style="padding: 7px 12px; font-size: 12px; white-space: nowrap;">
              <img src="../images/Icons/PencilSimple.svg" alt="" style="width: 13px; height: 13px; margin-right: 5px; vertical-align: middle; filter: brightness(0) invert(1);">
              Edit
            </button>
            <button type="button" class="btn btn-ghost btn-small" onclick="deleteSupply('${supply.id}', '${supply.name.replace(/'/g, "\\'")}')" style="padding: 7px 12px; font-size: 12px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3); white-space: nowrap;">
              <img src="../images/Icons/Trash.svg" alt="" style="width: 13px; height: 13px; margin-right: 5px; vertical-align: middle; filter: brightness(0) saturate(0) invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(98%) contrast(97%);">
              Delete
            </button>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  listContainer.innerHTML = html;
  
  // Setup search
  setupSupplySearch(suppliesArray);
}

/**
 * Setup supply search
 */
function setupSupplySearch(suppliesArray) {
  const searchInput = document.getElementById('searchSupplies');
  if (!searchInput) return;
  
  searchInput.oninput = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
      // Reset to full list grouped by category
      const supplies = {};
      suppliesArray.forEach(supply => {
        supplies[supply.id] = supply;
      });
      renderManageSuppliesList(supplies);
      return;
    }
    
    // Filter supplies
    const filtered = suppliesArray.filter(supply => 
      supply.name.toLowerCase().includes(searchTerm) ||
      (supply.category && supply.category.toLowerCase().includes(searchTerm))
    );
    
    // Convert back to object for rendering
    const filteredObj = {};
    filtered.forEach(supply => {
      filteredObj[supply.id] = supply;
    });
    
    renderManageSuppliesList(filteredObj);
  };
}

/**
 * Edit supply (placeholder for future implementation)
 */
function editSupply(supplyId) {
  showToast('Info', 'Edit functionality coming soon', 'info');
}

/**
 * Delete supply
 */
function deleteSupply(supplyId, supplyName) {
  if (!confirm(`Are you sure you want to delete "${supplyName}"?\n\nThis will remove it from all models that use it.`)) {
    return;
  }
  
  if (!state.currentUser || !state.currentUser.uid) return;
  
  db.ref(`users/${state.currentUser.uid}/supplies/${supplyId}`).remove()
    .then(() => {
      showToast('Success', `${supplyName} deleted successfully`, 'success');
      loadAllSuppliesForManagement();
    })
    .catch(error => {
      console.error('Error deleting supply:', error);
      showToast('Error', 'Failed to delete supply', 'error');
    });
}

/**
 * Open create supply modal from management view
 */
function openCreateSupplyForManagement() {
  closeManageSuppliesModal();
  openCreateSupplyModal();
  
  // Update currency label
  const currencyLabel = document.getElementById('createSupplyCurrencyLabel');
  if (currencyLabel && typeof window.getCurrencyLabel === 'function') {
    const label = window.getCurrencyLabel(window.currentCurrency);
    currencyLabel.textContent = `(${label})`;
  }
}

/**
 * Setup printer button
 */
function setupPrinterButton() {
  document.getElementById('btnAddPrinter').addEventListener('click', openAddPrinterModal);
  document.getElementById('btnConfirmAddPrinter').addEventListener('click', confirmAddPrinter);
}

/**
 * Open add printer modal
 */
function openAddPrinterModal() {
  document.getElementById('addPrinterModal').classList.add('show');
}

/**
 * Close add printer modal
 */
function closeAddPrinterModal() {
  document.getElementById('addPrinterModal').classList.remove('show');
  document.getElementById('newPrinterName').value = '';
}

/**
 * Confirm add printer
 */
async function confirmAddPrinter() {
  const name = document.getElementById('newPrinterName').value.trim();
  
  if (!name) {
    showToast('Error', 'Please enter a printer name', 'error');
    return;
  }
  
  try {
    // Save to Firebase
    const printerRef = db.ref(`users/${state.currentUser.uid}/printers`).push();
    await printerRef.set(name);
    
    const printerId = printerRef.key;
    
    // Add to state
    state.printers.push({ id: printerId, name });
    
    // Update select
    const select = document.getElementById('printerSelect');
    const option = document.createElement('option');
    option.value = printerId;
    option.textContent = name;
    select.appendChild(option);
    select.value = printerId;
    
    closeAddPrinterModal();
    showToast('Success', `${name} added successfully`, 'success');
  } catch (error) {
    console.error('Error adding printer:', error);
    showToast('Error', 'Failed to add printer', 'error');
  }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  const form = document.getElementById('modelForm');
  const inputs = form.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    input.addEventListener('input', validateForm);
    input.addEventListener('change', validateForm);
  });
  
  validateForm();
}

/**
 * Validate form
 */
function validateForm() {
  const modelName = document.getElementById('modelName').value.trim();
  const submitBtn = document.getElementById('btnCreateModel');
  
  // Required: model name and at least 1 file
  const hasFiles = state.files.length > 0 || (state.editingModelId && state.existingFiles.length > 0);
  const isValid = modelName.length > 0 && hasFiles;
  
  submitBtn.disabled = !isValid;
  
  // Update file validation message
  const fileList = document.getElementById('fileList');
  const uploadArea = document.getElementById('uploadArea');
  
  if (!hasFiles && modelName.length > 0) {
    // Show warning if name is filled but no files
    if (!uploadArea.classList.contains('validation-error')) {
      uploadArea.classList.add('validation-error');
      const errorMsg = uploadArea.querySelector('.validation-message');
      if (!errorMsg) {
        const msg = document.createElement('div');
        msg.className = 'validation-message';
        msg.textContent = 'At least 1 file is required';
        uploadArea.appendChild(msg);
      }
    }
  } else {
    uploadArea.classList.remove('validation-error');
    const errorMsg = uploadArea.querySelector('.validation-message');
    if (errorMsg) errorMsg.remove();
  }
}

/**
 * Setup form submit
 */
function setupFormSubmit() {
  document.getElementById('modelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createModel();
  });
}

/**
 * Create model
 */
async function createModel() {
  const submitBtn = document.getElementById('btnCreateModel');
  const isEditing = !!state.editingModelId;
  
  // Validate that at least 1 file exists
  const hasFiles = state.files.length > 0 || (isEditing && state.existingFiles.length > 0);
  if (!hasFiles) {
    showToast('Error', 'At least 1 file is required', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = isEditing ? 'UPDATING...' : 'CREATING...';
  
  try {
    // Gather form data
    const modelData = {
      sku: document.getElementById('sku').value.trim(),
      designer: document.getElementById('designer').value.trim(),
      category: document.getElementById('category').value.trim(),
      marketplace: document.getElementById('marketplace').value.trim(),
      name: document.getElementById('modelName').value.trim(),
      printTime: {
        hours: parseInt(document.getElementById('printHours').value) || 0,
        minutes: parseInt(document.getElementById('printMinutes').value) || 0
      },
      filament: state.selectedFilament ? {
        source: state.selectedFilament.source,
        id: state.selectedFilament.id,
        type: state.selectedFilament.type,
        brand: state.selectedFilament.brand,
        spoolWeight: state.selectedFilament.spoolWeight,
        spoolCost: state.selectedFilament.spoolCost
      } : null,
      supplies: state.supplies.map(s => ({
        id: s.id,
        category: s.category,
        name: s.name,
        costPerItem: s.costPerItem,
        inStock: s.inStock,
        neededForModel: s.neededForModel,
        purchaseLink: s.purchaseLink || ''
      })),
      salesPlatform: document.getElementById('salesPlatform').value,
      printer: document.getElementById('printerSelect').value,
      files: isEditing ? state.existingFiles || [] : [],
      updatedAt: Date.now()
    };
    
    // Only set createdAt for new models
    if (!isEditing) {
      modelData.createdAt = Date.now();
    }
    
    // Handle image upload or keep existing
    if (state.modelImage) {
      // New image uploaded
      showToast('Uploading', 'Uploading image...', 'success');
      try {
        const imageUrl = await uploadImage(state.modelImage);
        modelData.imageUrl = imageUrl;
        
        // Delete old image if editing and replacing
        if (isEditing && state.existingImageUrl) {
          try {
            const oldImageRef = storage.refFromURL(state.existingImageUrl);
            await oldImageRef.delete();
            console.log('Old image deleted successfully');
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Warning', 'Failed to upload image', 'error');
      }
    } else if (isEditing && state.existingImageUrl && !state.imageDeleted) {
      // Keep existing image (only if not marked for deletion)
      modelData.imageUrl = state.existingImageUrl;
    } else if (isEditing && state.imageDeleted && state.existingImageUrl) {
      // User removed the image - delete from storage
      try {
        const oldImageRef = storage.refFromURL(state.existingImageUrl);
        await oldImageRef.delete();
        console.log('Image deleted successfully');
        showToast('Success', 'Image removed', 'success');
      } catch (error) {
        console.error('Error deleting image:', error);
      }
      // Explicitly set to null to remove from database
      modelData.imageUrl = null;
    }
    
    // Upload new files (only for new models or when adding files to existing)
    if (state.files.length > 0) {
      showToast('Uploading', 'Uploading files...', 'success');
      
      for (const fileObj of state.files) {
        try {
          const fileData = await uploadFile(fileObj);
          modelData.files.push(fileData);
        } catch (error) {
          console.error('Error uploading file:', error);
          showToast('Warning', `Failed to upload ${fileObj.name}`, 'error');
        }
      }
    }
    
    // Save to Firebase
    if (isEditing) {
      // Update existing model
      await db.ref(`users/${state.currentUser.uid}/models/${state.editingModelId}`).update(modelData);
    } else {
      // Create new model
      const modelRef = db.ref(`users/${state.currentUser.uid}/models`).push();
      await modelRef.set(modelData);
    }
    
    // Save category if new
    if (modelData.category && !state.categories.has(modelData.category)) {
      await db.ref(`users/${state.currentUser.uid}/modelCategories`).push(modelData.category);
    }
    
    // Close modal first
    closeAddModelModal();
    
    // Show success notification AFTER modal closes (with small delay for animation)
    setTimeout(() => {
      showToast('Success', `Model "${modelData.name}" ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    }, 300);
    
  } catch (error) {
    console.error('Error saving model:', error);
    showToast('Error', `Failed to ${isEditing ? 'update' : 'create'} model. Please try again.`, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = isEditing ? 'UPDATE MODEL' : 'CREATE MODEL';
  }
}

/**
 * Upload file to Firebase Storage
 */
function uploadFile(fileObj) {
  return new Promise((resolve, reject) => {
    const storageRef = storage.ref();
    const filePath = `users/${state.currentUser.uid}/models/${Date.now()}_${fileObj.name}`;
    const fileRef = storageRef.child(filePath);
    
    const uploadTask = fileRef.put(fileObj.file);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        // Update progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        fileObj.progress = progress;
        renderFileList();
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Upload complete
        try {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          fileObj.uploaded = true;
          
          resolve({
            id: Date.now() + Math.random(),
            name: fileObj.name,
            size: fileObj.size,
            path: filePath,
            url: url,
            uploadedAt: Date.now()
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Upload image to Firebase Storage
 */
function uploadImage(imageBlob) {
  return new Promise((resolve, reject) => {
    const storageRef = storage.ref();
    const filePath = `users/${state.currentUser.uid}/model-images/${Date.now()}_image.jpg`;
    const fileRef = storageRef.child(filePath);
    
    const uploadTask = fileRef.put(imageBlob);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress tracking if needed
      },
      (error) => {
        console.error('Image upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Reset form
 */
function resetForm() {
  document.getElementById('modelForm').reset();
  document.getElementById('printHours').value = '0';
  document.getElementById('printMinutes').value = '0';
  
  state.files = [];
  state.supplies = [];
  state.selectedFilament = null;
  state.modelImage = null;
  state.editingModelId = null; // Clear editing state
  state.existingImageUrl = null; // Clear existing image URL
  state.existingFiles = []; // Clear existing files
  state.imageDeleted = false; // Clear image deletion flag
  
  renderFileList();
  renderSupplyList();
  
  // Reset image preview
  const preview = document.getElementById('imagePreviewImg');
  const placeholder = preview?.previousElementSibling;
  if (preview) {
    preview.style.display = 'none';
    preview.removeAttribute('src');
    preview.src = '';
  }
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
  const btnRemoveImage = document.getElementById('btnRemoveImage');
  if (btnRemoveImage) {
    btnRemoveImage.style.display = 'none';
  }
  
  const filamentDisplay = document.getElementById('filamentDisplay');
  if (filamentDisplay) {
    filamentDisplay.style.display = 'none';
  }
  
  // Reset modal title and button
  // Try different selectors for dashboard vs standalone page
  const modalTitle = document.querySelector('#addModelModal .modal-title-large') || 
                     document.querySelector('#addModelModal .modal-title') || 
                     document.querySelector('#addModelModal h3');
  if (modalTitle) {
    modalTitle.innerHTML = 'Add New <span class="gradient-highlight">Model</span>';
  }
  
  const submitBtn = document.getElementById('btnCreateModel');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'CREATE MODEL';
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show toast notification - Uses dashboard's showNotification if available
 */
function showToast(title, message, type = 'success') {
  // If dashboard's showNotification exists, use it (for consistency)
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type, title);
    return;
  }
  
  if (typeof showNotification === 'function') {
    showNotification(message, type, title);
    return;
  }
  
  // Fallback to old toast for standalone upload-model.html page
  const toast = document.getElementById('toast');
  if (!toast) return; // No toast element, skip
  
  const toastIcon = document.getElementById('toastIcon');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  
  // Set content
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  // Set icon and class
  toast.className = 'toast show';
  if (type === 'success') {
    toast.classList.add('success');
    toastIcon.textContent = '✓';
  } else if (type === 'error') {
    toast.classList.add('error');
    toastIcon.textContent = '✕';
  }
  
  // Auto hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/**
 * Hide loading overlay (only for standalone page)
 */
function hideLoadingOverlay() {
  // Only hide loading overlay on standalone page
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay && window.location.pathname.includes('upload-model.html')) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

// Make functions globally available for onclick handlers
window.removeFile = removeFile;
window.removeExistingFile = removeExistingFile;
window.removeSupply = removeSupply;
window.closeAddSupplyModal = closeAddSupplyModal;
window.selectSupplyToAdd = selectSupplyToAdd;
window.closeCreateSupplyModal = closeCreateSupplyModal;
window.closeAddPrinterModal = closeAddPrinterModal;
window.closeAddModelModal = closeAddModelModal;
window.viewModel = viewModel;
window.editModel = editModel;
window.deleteModel = deleteModel;
window.closeManageSuppliesModal = closeManageSuppliesModal;
window.openCreateSupplyForManagement = openCreateSupplyForManagement;
window.editSupply = editSupply;
window.deleteSupply = deleteSupply;
