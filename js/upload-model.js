/**
 * Upload Model Page Script
 * Handles model creation, file uploads, supplies, and form validation
 */

// Use existing Firebase instances (initialized in auth.js)
// auth and db are already declared globally
const storage = firebase.storage();

// Global state
const state = {
  currentUser: null,
  files: [],
  supplies: [],
  selectedFilament: null,
  categories: new Set(),
  printers: [],
  existingSupplies: [],
  modelImage: null, // Store cropped image
  cropData: {
    canvas: null,
    ctx: null,
    img: null,
    cropArea: { x: 0, y: 0, size: 0 }
  }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Upload Model page initializing...');
  
  // Wait for auth state
  auth.onAuthStateChanged((user) => {
    if (user) {
      state.currentUser = user;
      initializePage();
    } else {
      // Redirect to login
      window.location.href = '../index.html?login=true';
    }
  });
});

/**
 * Initialize page after auth
 */
function initializePage() {
  console.log('Initializing page for user:', state.currentUser.uid);
  
  // Load data
  loadCategories();
  loadFilaments();
  loadSupplies();
  loadPrinters();
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
  document.getElementById('btnShowAddModel').addEventListener('click', () => {
    openAddModelModal();
  });
}

/**
 * Open add model modal
 */
function openAddModelModal() {
  const modal = document.getElementById('addModelModal');
  modal.classList.add('show');
  
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
  document.getElementById('addModelModal').classList.remove('show');
  resetForm();
}

/**
 * Load and display models
 */
function loadModels() {
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
    <div class="models-grid">
      ${modelsArray.map(model => `
        <div class="model-card" onclick="viewModel('${model.id}')">
          <div class="model-card-content">
            ${model.imageUrl ? `
              <img src="${model.imageUrl}" alt="${model.name}" class="model-image">
            ` : `
              <div class="model-image-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            `}
            <div class="model-card-info">
              <div class="model-card-header">
                <div class="model-card-title">${model.name}</div>
                <div class="model-card-actions">
                  <button class="model-card-action" onclick="event.stopPropagation(); editModel('${model.id}')" title="Edit">Edit</button>
                  <button class="model-card-action delete" onclick="event.stopPropagation(); deleteModel('${model.id}')" title="Delete">Delete</button>
                </div>
              </div>
              <div class="model-card-meta">${model.category ? `
                  <div class="model-card-meta-item">
                    <span class="model-card-meta-label">Category:</span>
                    <span>${model.category}</span>
                  </div>
                ` : ''}
                <div class="model-card-meta-item">
                  <span class="model-card-meta-label">SKU:</span>
                  <span>${model.sku || 'N/A'}</span>
                </div>
                ${model.printTime ? `
                  <div class="model-card-meta-item">
                    <span class="model-card-meta-label">Print Time:</span>
                    <span>${model.printTime.hours}h ${model.printTime.minutes}m</span>
                  </div>
                ` : ''}
                <div class="model-card-meta-item">
                  <span class="model-card-meta-label">Added:</span>
                  <span>${formatDate(model.createdAt)}</span>
                </div>
                ${model.updatedAt && model.updatedAt !== model.createdAt ? `
                  <div class="model-card-meta-item">
                    <span class="model-card-meta-label">Updated:</span>
                    <span>${formatDate(model.updatedAt)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * View model details
 */
function viewModel(modelId) {
  console.log('View model:', modelId);
  // TODO: Implement model detail view
  showToast('Info', 'Model detail view coming soon!', 'success');
}

/**
 * Edit model
 */
function editModel(modelId) {
  console.log('Edit model:', modelId);
  // TODO: Implement model editing
  showToast('Info', 'Model editing coming soon!', 'success');
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
  db.ref(`users/${state.currentUser.uid}/modelCategories`).once('value')
    .then(snapshot => {
      const categories = snapshot.val() || {};
      const datalist = document.getElementById('categoryOptions');
      
      Object.values(categories).forEach(category => {
        state.categories.add(category);
        const option = document.createElement('option');
        option.value = category;
        datalist.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading categories:', error));
}

/**
 * Load filaments from both global and user libraries
 */
function loadFilaments() {
  const globalGroup = document.getElementById('globalFilamentsGroup');
  const userGroup = document.getElementById('userFilamentsGroup');
  
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
  db.ref(`users/${state.currentUser.uid}/supplies`).once('value')
    .then(snapshot => {
      const supplies = snapshot.val() || {};
      state.existingSupplies = Object.entries(supplies).map(([id, supply]) => ({
        id,
        ...supply
      }));
      
      // Populate supply select in modal
      const select = document.getElementById('existingSupplySelect');
      select.innerHTML = '<option value="">Choose a supply...</option>';
      
      state.existingSupplies.forEach(supply => {
        const option = document.createElement('option');
        option.value = supply.id;
        option.textContent = `${supply.name} - $${supply.costPerItem} (${supply.category})`;
        option.dataset.supply = JSON.stringify(supply);
        select.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading supplies:', error));
}

/**
 * Load printers
 */
function loadPrinters() {
  const globalGroup = document.getElementById('globalPrintersGroup');
  const userGroup = document.getElementById('userPrintersGroup');
  
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
  
  if (state.files.length === 0) {
    fileList.innerHTML = '';
    return;
  }
  
  fileList.innerHTML = state.files.map(file => `
    <div class="file-item" data-id="${file.id}">
      <div class="file-icon">📄</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        ${file.progress > 0 ? `
          <div class="file-progress">
            <div class="file-progress-bar" style="width: ${file.progress}%"></div>
          </div>
        ` : ''}
      </div>
      <button type="button" class="file-remove" onclick="removeFile('${file.id}')">Remove</button>
    </div>
  `).join('');
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
    
    // Draw crop overlay
    drawCropOverlay();
    
    // Show modal
    modal.classList.add('show');
  };
  img.src = imageSrc;
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
  document.getElementById('cropModal').classList.remove('show');
  state.cropData = {
    canvas: null,
    ctx: null,
    img: null,
    cropArea: { x: 0, y: 0, size: 0 }
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
  
  const preview = document.getElementById('imagePreviewImg');
  const placeholder = preview.previousElementSibling;
  preview.style.display = 'none';
  preview.src = '';
  placeholder.style.display = 'block';
  
  document.getElementById('btnRemoveImage').style.display = 'none';
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
    
    // Display filament info
    document.getElementById('filamentBrand').textContent = filament.brand || '-';
    document.getElementById('filamentType').textContent = filament.type || '-';
    document.getElementById('filamentWeight').textContent = filament.spoolWeight ? `${filament.spoolWeight}g` : '-';
    document.getElementById('filamentCost').textContent = filament.spoolCost ? `$${filament.spoolCost}` : '-';
    
    display.style.display = 'block';
  });
}

/**
 * Setup supply buttons
 */
function setupSupplyButtons() {
  document.getElementById('btnAddSupply').addEventListener('click', openAddSupplyModal);
  document.getElementById('btnCreateSupply').addEventListener('click', openCreateSupplyModal);
  document.getElementById('btnConfirmAddSupply').addEventListener('click', confirmAddSupply);
  
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
  document.getElementById('addSupplyModal').classList.add('show');
}

/**
 * Close add supply modal
 */
function closeAddSupplyModal() {
  document.getElementById('addSupplyModal').classList.remove('show');
  document.getElementById('existingSupplySelect').value = '';
  document.getElementById('existingSupplyQuantity').value = '1';
}

/**
 * Confirm add existing supply
 */
function confirmAddSupply() {
  const select = document.getElementById('existingSupplySelect');
  const quantity = parseInt(document.getElementById('existingSupplyQuantity').value);
  
  if (!select.value) {
    showToast('Error', 'Please select a supply', 'error');
    return;
  }
  
  const option = select.options[select.selectedIndex];
  const supply = JSON.parse(option.dataset.supply);
  
  // Check if already added
  if (state.supplies.some(s => s.id === supply.id)) {
    showToast('Error', 'This supply is already added', 'error');
    return;
  }
  
  // Add to state
  state.supplies.push({
    ...supply,
    neededForModel: quantity
  });
  
  renderSupplyList();
  closeAddSupplyModal();
  showToast('Success', `${supply.name} added successfully`, 'success');
}

/**
 * Open create supply modal
 */
function openCreateSupplyModal() {
  document.getElementById('createSupplyModal').classList.add('show');
}

/**
 * Close create supply modal
 */
function closeCreateSupplyModal() {
  document.getElementById('createSupplyModal').classList.remove('show');
  document.getElementById('createSupplyForm').reset();
}

/**
 * Create new supply
 */
async function createNewSupply() {
  const category = document.getElementById('newSupplyCategory').value.trim();
  const name = document.getElementById('newSupplyName').value.trim();
  const costPerItem = parseFloat(document.getElementById('newSupplyCost').value);
  const inStock = parseInt(document.getElementById('newSupplyStock').value) || 0;
  const neededForModel = parseInt(document.getElementById('newSupplyNeeded').value);
  const purchaseLink = document.getElementById('newSupplyLink').value.trim();
  
  if (!category || !name || !costPerItem || !neededForModel) {
    showToast('Error', 'Please fill in all required fields', 'error');
    return;
  }
  
  try {
    // Save to Firebase
    const supplyRef = db.ref(`users/${state.currentUser.uid}/supplies`).push();
    const supplyId = supplyRef.key;
    
    const supply = {
      category,
      name,
      costPerItem,
      inStock,
      purchaseLink,
      createdAt: Date.now()
    };
    
    await supplyRef.set(supply);
    
    // Add to state for this model
    state.supplies.push({
      id: supplyId,
      ...supply,
      neededForModel
    });
    
    // Update existing supplies list
    state.existingSupplies.push({ id: supplyId, ...supply });
    
    renderSupplyList();
    closeCreateSupplyModal();
    showToast('Success', `${name} created and added successfully`, 'success');
    
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
  
  if (state.supplies.length === 0) {
    supplyList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No supplies added yet</p>';
    return;
  }
  
  supplyList.innerHTML = state.supplies.map((supply, index) => `
    <div class="supply-item" data-index="${index}">
      <div class="supply-header">
        <div class="supply-title">${supply.name}</div>
        <button type="button" class="supply-remove" onclick="removeSupply(${index})">Remove</button>
      </div>
      <div class="supply-grid">
        <div class="form-group">
          <label class="form-label">Category</label>
          <input type="text" class="form-input" value="${supply.category}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Cost Per Item</label>
          <input type="text" class="form-input" value="$${supply.costPerItem}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">In Stock</label>
          <input type="text" class="form-input" value="${supply.inStock}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Needed for Model</label>
          <input type="text" class="form-input" value="${supply.neededForModel}" disabled>
        </div>
        ${supply.purchaseLink ? `
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Purchase Link</label>
            <a href="${supply.purchaseLink}" target="_blank" style="color: var(--purple-light); text-decoration: none; font-size: 14px;">${supply.purchaseLink}</a>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Remove supply
 */
function removeSupply(index) {
  state.supplies.splice(index, 1);
  renderSupplyList();
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
  
  // Required: model name
  const isValid = modelName.length > 0;
  
  submitBtn.disabled = !isValid;
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
  submitBtn.disabled = true;
  submitBtn.textContent = 'CREATING...';
  
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
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Upload image if provided
    if (state.modelImage) {
      showToast('Uploading', 'Uploading image...', 'success');
      try {
        const imageUrl = await uploadImage(state.modelImage);
        modelData.imageUrl = imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Warning', 'Failed to upload image', 'error');
      }
    }
    
    // Upload files
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
    const modelRef = db.ref(`users/${state.currentUser.uid}/models`).push();
    await modelRef.set(modelData);
    
    // Save category if new
    if (modelData.category && !state.categories.has(modelData.category)) {
      await db.ref(`users/${state.currentUser.uid}/modelCategories`).push(modelData.category);
    }
    
    showToast('Success', `Model "${modelData.name}" created successfully!`, 'success');
    
    // Close modal and reset form
    setTimeout(() => {
      closeAddModelModal();
    }, 1500);
    
  } catch (error) {
    console.error('Error creating model:', error);
    showToast('Error', 'Failed to create model. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'CREATE MODEL';
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
  
  renderFileList();
  renderSupplyList();
  
  // Reset image preview
  const preview = document.getElementById('imagePreviewImg');
  const placeholder = preview.previousElementSibling;
  preview.style.display = 'none';
  preview.src = '';
  placeholder.style.display = 'block';
  document.getElementById('btnRemoveImage').style.display = 'none';
  
  document.getElementById('filamentDisplay').style.display = 'none';
  
  const submitBtn = document.getElementById('btnCreateModel');
  submitBtn.disabled = true;
  submitBtn.textContent = 'CREATE MODEL';
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show toast notification
 */
function showToast(title, message, type = 'success') {
  const toast = document.getElementById('toast');
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
 * Hide loading overlay
 */
function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

// Make functions globally available for onclick handlers
window.removeFile = removeFile;
window.removeSupply = removeSupply;
window.closeAddSupplyModal = closeAddSupplyModal;
window.closeCreateSupplyModal = closeCreateSupplyModal;
window.closeAddPrinterModal = closeAddPrinterModal;
window.closeAddModelModal = closeAddModelModal;
window.viewModel = viewModel;
window.editModel = editModel;
window.deleteModel = deleteModel;
