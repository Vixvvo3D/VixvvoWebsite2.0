# 📋 Navbar System Guide

## 🎯 Overview

Your website uses a **centralized navbar component system** that allows you to edit the navigation bar in ONE place and have it automatically update across ALL pages.

---

## 📁 Key Files

### 1. `/components/navbar.html`
**The master navbar file** - Edit this to change the navbar everywhere!
- Contains the HTML structure of the navigation bar
- Includes logo, links, and dropdown menu
- Has `data-` attributes for automatic path adjustment

### 2. `/js/navbar-loader.js`
**Automatically loads the navbar** on every page
- Fetches `navbar.html` and injects it into pages
- Adjusts all paths based on page location (root vs `/pages/`)
- Dispatches `navbarLoaded` event when ready

### 3. `/js/navbar-helper.js`
**Utility functions** for working with navbar elements
- Provides `NavbarHelper.onReady()` to run code when navbar loads
- Safely access navbar elements
- Add event listeners to navbar elements

### 4. `/js/settings-dropdown.js`
**Handles dropdown menu functionality**
- Automatically toggles the settings dropdown
- Closes dropdown when clicking outside
- Works on all pages automatically

### 5. `/js/navbar-auth.js`
**Syncs authentication state with navbar**
- Updates login/logout buttons based on auth state
- Shows user info when logged in
- Automatically syncs across all pages

---

## ✅ Setting Up New Pages

When creating a new page, include these lines:

### In the `<head>` section:
```html
<!-- Load shared styles -->
<link rel="stylesheet" href="../css/shared-styles.css">

<!-- Load shared navbar components -->
<script src="../js/navbar-helper.js"></script>
<script src="../js/navbar-loader.js"></script>
<script src="../js/settings-dropdown.js"></script>
<script src="../js/navbar-auth.js"></script>
<script src="../js/auth.js"></script>
```

### In the `<body>` section (at the very top):
```html
<div id="navbar-container"></div>
```

**That's it!** The navbar will automatically load with full functionality.

---

## 🎨 Updating the Navbar

### To change navbar appearance or content:
1. Open `/components/navbar.html`
2. Make your changes
3. Save the file
4. **All pages automatically get the update!**

### Common Updates:

**Adding a new navigation link:**
```html
<a href="pages/new-page.html" data-href="pages/new-page.html">New Page</a>
```

**Adding a menu item to the dropdown:**
```html
<div class="settings-section">
  <span class="settings-label">New Section</span>
  <button class="btn btn-primary">New Button</button>
</div>
```

**Changing the logo:**
```html
<img src="images/your-logo.png" alt="Logo" data-logo-path="images/your-logo.png">
```

⚠️ **Important:** Always use the `data-href` and `data-logo-path` attributes - they ensure paths work correctly on all pages!

---

## 🔧 Working with the Navbar in JavaScript

### Wait for navbar to load before accessing elements:
```javascript
NavbarHelper.onReady(() => {
  // Navbar is ready, safe to access elements
  const settingsBtn = document.getElementById('btnSettings');
  console.log('Settings button:', settingsBtn);
});
```

### Add event listeners to navbar elements:
```javascript
NavbarHelper.addEventListener('btnLoginSettings', 'click', () => {
  console.log('Login button clicked!');
});
```

### Check if navbar is loaded:
```javascript
if (NavbarHelper.isLoaded) {
  console.log('Navbar is ready!');
}
```

---

## 🎉 Benefits

✅ **Edit once, update everywhere** - Change the navbar in one file  
✅ **Automatic dropdown functionality** - Works on all pages automatically  
✅ **Smart path handling** - Paths adjust based on page location  
✅ **No code duplication** - Cleaner, easier to maintain  
✅ **Consistent UI** - All pages look the same  

---

## 🐛 Troubleshooting

**Navbar not showing up?**
- Check that `<div id="navbar-container"></div>` is in your HTML
- Verify the navbar scripts are loaded in the `<head>` section
- Check browser console for errors

**Dropdown not working?**
- Make sure `settings-dropdown.js` is loaded
- Check that navbar scripts are loaded BEFORE your page scripts

**Wrong paths on links?**
- Use `data-href` attribute instead of just `href`
- Use `data-logo-path` for images
- The loader automatically adjusts these paths

---

## 📝 Template

Use the `NEW_PAGE_TEMPLATE.html` file as a starting point for creating new pages!

---

**Questions?** Check existing pages (`index.html`, `calculator.html`, etc.) for examples!
