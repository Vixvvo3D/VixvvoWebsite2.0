# Upload Model Feature Documentation

## Overview
The Upload Model page allows users to add 3D models to their inventory with comprehensive tracking of materials, supplies, costs, and files.

## Page Location
- **HTML**: `/pages/upload-model-new.html`
- **Script**: `/js/upload-model.js`
- **Documentation**: `/docs/models.md`

---

## Features

### 1. Model Information
Core details about the 3D model:
- **SKU**: Stock Keeping Unit (default: "1000", editable)
- **Designer**: Model creator (default: "Vixvvo3D")
- **Category**: Model category with autocomplete from saved categories
- **Marketplace**: Sales marketplace (default: "Marketplace")
- **Model Name**: Required field for the model's name
- **Print Time**: Hours and minutes required to print

### 2. File Upload
- **Drag & Drop**: Intuitive file upload area
- **Click to Upload**: Traditional file browser
- **Supported Formats**: `.stl`, `.3mf`, `.obj`, `.step`, `.zip`
- **File Size Limit**: 100MB per file
- **Multiple Files**: Upload multiple files per model
- **Progress Tracking**: Real-time upload progress for each file
- **File Management**: Remove files before submission

### 3. Filament Cost Tracking
- **Filament Library**: Choose from global or user-specific filaments
- **Filament Details Display**:
  - Brand
  - Type
  - Spool Weight (grams)
  - Cost per Spool
- **Auto-Calculator**: Placeholder for future weight/length-based cost calculation

### 4. Supplies Management
Two ways to add supplies:

#### A. Add Existing Supply
- Select from previously created supplies
- Specify quantity needed for this model
- Maintains reference to supply in database

#### B. Create New Supply
Creates a new supply and adds it to the model:
- **Category**: Supply category (e.g., Hardware, Paint, Tools)
- **Supply Name**: Descriptive name
- **Cost Per Item**: Price per unit
- **Supplies in Stock**: Current inventory count
- **Quantity Needed**: Amount required for this model
- **Purchase Link**: Optional URL for reordering

### 5. Sales Platform
Dropdown selection for where the model is sold:
- Etsy
- eBay
- Shopify
- TikTok Shop
- Facebook Marketplace
- Other

### 6. Printer Selection
- Select from configured printers
- Add new printer on-the-fly
- Printer list saved for future use

---

## Data Structure

### Model Object
```javascript
{
  sku: string,                    // Stock keeping unit
  designer: string,               // Model designer name
  category: string,               // Model category
  marketplace: string,            // Where it's sold
  name: string,                   // Model name (required)
  printTime: {
    hours: number,                // Print hours
    minutes: number               // Print minutes
  },
  filament: {
    source: "global" | "user",    // Filament library source
    id: string,                   // Filament ID
    type: string,                 // Filament type (PLA, ABS, etc.)
    brand: string,                // Manufacturer brand
    spoolWeight: number,          // Weight in grams
    spoolCost: number             // Cost in currency
  },
  supplies: [
    {
      id: string,                 // Supply reference ID
      category: string,           // Supply category
      name: string,               // Supply name
      costPerItem: number,        // Cost per unit
      inStock: number,            // Current inventory
      neededForModel: number,     // Quantity for this model
      purchaseLink: string        // Reorder URL
    }
  ],
  salesPlatform: string,          // Sales platform name
  printer: string,                // Printer ID
  files: [
    {
      id: string,                 // Unique file identifier
      name: string,               // Original filename
      size: number,               // File size in bytes
      path: string,               // Storage path
      url: string,                // Download URL
      uploadedAt: number          // Upload timestamp
    }
  ],
  createdAt: number,              // Creation timestamp
  updatedAt: number               // Last update timestamp
}
```

---

## Firebase Structure

### User Models
```
users/
  {userId}/
    models/
      {modelId}/
        sku: "1000"
        designer: "Vixvvo3D"
        category: "Gaming"
        marketplace: "Etsy"
        name: "Dragon Miniature"
        printTime: { hours: 5, minutes: 30 }
        filament: { ... }
        supplies: [ ... ]
        salesPlatform: "Etsy"
        printer: "printer123"
        files: [ ... ]
        createdAt: 1234567890
        updatedAt: 1234567890
```

### User Supplies
```
users/
  {userId}/
    supplies/
      {supplyId}/
        category: "Hardware"
        name: "M3 Screws"
        costPerItem: 0.15
        inStock: 500
        purchaseLink: "https://..."
        createdAt: 1234567890
```

### User Printers
```
users/
  {userId}/
    printers/
      {printerId}: "Prusa i3 MK3S"
```

### Model Categories
```
users/
  {userId}/
    modelCategories/
      {categoryId}: "Gaming"
```

---

## User Flow

### Creating a Model

1. **Enter Basic Info**
   - Fill in SKU, designer, category, marketplace
   - Enter model name (required)
   - Set print time

2. **Upload Files**
   - Drag and drop or click to upload model files
   - Monitor upload progress
   - Remove unwanted files

3. **Select Filament** (Optional)
   - Choose from global or personal filament library
   - View filament details

4. **Add Supplies** (Optional)
   - Add existing supplies or create new ones
   - Specify quantities needed
   - Multiple supplies can be added

5. **Select Platform & Printer**
   - Choose sales platform
   - Select printer (or add new one)

6. **Submit**
   - Click "CREATE MODEL" button
   - Files upload with progress indication
   - Success notification appears
   - Form resets for next entry

---

## Validation Rules

### Required Fields
- **Model Name**: Must not be empty

### File Validation
- **Size**: Maximum 100MB per file
- **Types**: Only `.stl`, `.3mf`, `.obj`, `.step`, `.zip`

### Supply Validation
- **Category**: Required when creating new supply
- **Name**: Required when creating new supply
- **Cost Per Item**: Required, must be positive number
- **Quantity Needed**: Required, must be positive integer

### Printer Validation
- **Name**: Required when adding new printer

---

## UI Components

### Form Sections
All sections use consistent styling:
- Semi-transparent background with backdrop blur
- Purple accent borders
- Smooth hover transitions
- Rounded corners (16px)

### Buttons
- **Primary**: Purple gradient background for main actions
- **Secondary**: Transparent with purple accent for supporting actions
- **Ghost**: Minimal styling for tertiary actions
- **Remove/Delete**: Red accent for destructive actions

### Modals
- Centered overlay with blur backdrop
- Smooth fade-in animation
- Close button with rotation animation
- Responsive to screen size

### Toast Notifications
- Slide-in animation from right
- Success (green) or error (red) styling
- Auto-dismiss after 4 seconds
- Icon + title + message format

---

## Future Enhancements

### Planned Features
1. **Filament Calculator**: Auto-calculate cost based on model weight/length
2. **Model Gallery**: View all uploaded models in a grid
3. **Edit Model**: Update existing model information
4. **Duplicate Model**: Clone model with modifications
5. **Cost Analysis**: Total cost breakdown including all materials
6. **Print History**: Track when and how many times a model was printed
7. **Sales Tracking**: Record sales and calculate profit margins
8. **Batch Upload**: Upload multiple models at once
9. **Model Tags**: Add searchable tags to models
10. **Export Data**: Export model inventory to CSV/JSON

### Integration Points
- **Calculator Page**: Link filament cost data to pricing calculator
- **Orders Page**: Pre-fill order data from model inventory
- **Analytics Dashboard**: Show model statistics and trends

---

## Troubleshooting

### Common Issues

**Files not uploading**
- Check file size (max 100MB)
- Verify file extension is supported
- Ensure stable internet connection
- Check Firebase Storage rules

**Filaments not loading**
- Verify Firebase database connection
- Check user authentication
- Ensure filament library has entries

**Supplies not saving**
- Check required fields are filled
- Verify Firebase database rules
- Ensure user is authenticated

**Form not submitting**
- Model name is required
- Check browser console for errors
- Verify Firebase connection

---

## Technical Notes

### Dependencies
- **Firebase SDK**: 9.22.2 (compat mode)
- **Firebase Services**: Auth, Database, Storage, Functions
- **Font**: Inter (Google Fonts)
- **CSS Framework**: Custom (shared-styles.css)

### Browser Support
- Modern browsers with ES6+ support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Files upload in sequence to avoid bandwidth issues
- Progress tracking for user feedback
- Lazy loading of dropdown options
- Efficient re-rendering of lists

### Security
- User authentication required
- File uploads scoped to user ID
- Firebase security rules enforcement
- URL validation for purchase links

---

## Support & Maintenance

### Updates
- Version tracking in Git repository
- Changelog maintained in `/docs/CHANGELOG.md`
- Breaking changes documented

### Contact
For issues or feature requests, refer to repository issue tracker.

---

**Last Updated**: October 17, 2025  
**Version**: 1.0.0  
**Author**: Vixvvo Development Team
