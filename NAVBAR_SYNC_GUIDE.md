# Shared Navigation Bar System

## Overview
This system allows you to maintain a single navigation bar component that syncs across all pages of your website. When you update the navigation in one place, it automatically updates everywhere!

## How It Works

### 1. Component Structure
- **`components/navbar.html`** - Contains the HTML structure of your navigation bar
- **`js/navbar-loader.js`** - JavaScript that loads and configures the navbar on each page

### 2. Path Management
The system automatically adjusts paths based on whether you're on:
- Root pages (like `index.html`) 
- Sub-pages (like `pages/calculator.html`)

## Implementation Guide

### For Each HTML Page:

#### Step 1: Add the navbar loader script
Add this line in the `<head>` section, BEFORE any other scripts that interact with the navbar:

```html
<!-- Load shared navbar -->
<script src="js/navbar-loader.js"></script>
```

For pages in subdirectories (like `pages/calculator.html`), use:
```html
<!-- Load shared navbar -->
<script src="../js/navbar-loader.js"></script>
```

#### Step 2: Add a navbar container (optional)
The script will automatically create one, but you can add a placeholder where you want the navbar to appear:

```html
<body>
  <div id="navbar-container"></div>
  
  <!-- Rest of your page content -->
</body>
```

#### Step 3: Remove the old hardcoded `<nav>` element
Delete your existing `<nav>...</nav>` block from each page since it will now be loaded dynamically.

## Adding/Editing Navigation Items

### To add a new page link:
Edit `components/navbar.html` and add a new link in the `nav-links` section:

```html
<div class="nav-links">
  <a href="index.html" data-href="index.html">Home</a>
  <a href="pages/calculator.html" data-href="pages/calculator.html">Calculator</a>
  <a href="pages/new-page.html" data-href="pages/new-page.html">New Page</a> <!-- NEW! -->
  <a href="index.html#features" data-href="index.html#features">Features</a>
  <a href="index.html#about" data-href="index.html#about">About</a>
</div>
```

**Important:** Always use the `data-href` attribute with the path relative to the root directory. The loader script will automatically adjust paths.

### To modify the settings menu:
Edit the sections inside `<div id="settingsDropdown">` in `components/navbar.html`.

### To change the logo:
Replace the image source in `components/navbar.html`:
```html
<img src="images/your-logo.png" alt="Logo" data-logo-path="images/your-logo.png">
```

## Event System

The navbar loader dispatches a custom event when the navbar is fully loaded:

```javascript
document.addEventListener('navbarLoaded', function(event) {
  console.log('Navbar loaded!');
  console.log('Is sub-page:', event.detail.isSubPage);
  console.log('Path prefix:', event.detail.pathPrefix);
  
  // Initialize any navbar-dependent functionality here
});
```

## Compatibility with Existing Scripts

Your existing scripts (`auth.js`, `navigation.js`, etc.) should continue to work. If they rely on the navbar being present immediately, update them to listen for the `navbarLoaded` event:

```javascript
// Old way (might fail if navbar isn't loaded yet)
document.getElementById('btnSettings').addEventListener('click', handler);

// New way (waits for navbar to be ready)
document.addEventListener('navbarLoaded', function() {
  document.getElementById('btnSettings').addEventListener('click', handler);
});
```

Or use this pattern:
```javascript
function initNavbarHandlers() {
  const settingsBtn = document.getElementById('btnSettings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', handler);
  }
}

// Try immediately (for cached/fast loads)
if (document.readyState === 'complete') {
  initNavbarHandlers();
} else {
  // Wait for navbar to load
  document.addEventListener('navbarLoaded', initNavbarHandlers);
}
```

## Benefits

✅ **Single Source of Truth** - Update navbar once, changes appear everywhere
✅ **Consistent Navigation** - All pages always have identical navigation
✅ **Easy Maintenance** - No need to edit multiple HTML files
✅ **Automatic Path Resolution** - Links work correctly from any page depth
✅ **Maintains Functionality** - All existing JavaScript interactions continue to work

## Troubleshooting

### Navbar doesn't appear
- Check browser console for errors
- Verify the path to `navbar-loader.js` is correct
- Ensure `components/navbar.html` exists and is accessible

### Links don't work correctly
- Verify you're using the `data-href` attribute in `navbar.html`
- Check that paths in `data-href` are relative to the site root

### JavaScript errors with navbar elements
- Make sure your scripts wait for the `navbarLoaded` event
- Check that element IDs haven't changed

## Future Enhancements

You can extend this system to:
- Load other shared components (footer, modals, etc.)
- Add loading animations while navbar loads
- Implement client-side caching for faster subsequent loads
- Add active page highlighting
