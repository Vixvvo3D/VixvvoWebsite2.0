# Shared Auth Modals - Quick Setup Guide

## Overview
Beautiful, modern authentication modals inspired by Kindle3D's design. Consistent across all pages.

## Files Created
1. **`/components/auth-modals.html`** - Modal HTML structure
2. **`/css/shared-styles.css`** - Updated with new modal styles
3. **`/js/modal-handler.js`** - Modal behavior and interactions

## How to Add to Any Page

### Step 1: Include Required Files in `<head>`
```html
<!-- Firebase SDKs (if not already included) -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-functions-compat.js"></script>

<!-- Shared Styles (includes modal styles) -->
<link rel="stylesheet" href="../css/shared-styles.css">
```

### Step 2: Include Auth Scripts Before Closing `</body>`
```html
<!-- Auth system -->
<script src="../js/auth.js"></script>

<!-- Modal handler -->
<script src="../js/modal-handler.js"></script>
```

### Step 3: Load Modal HTML
Add this JavaScript snippet to load the modals:
```html
<script>
  // Load auth modals
  fetch('../components/auth-modals.html')
    .then(response => response.text())
    .then(html => {
      const div = document.createElement('div');
      div.innerHTML = html;
      document.body.appendChild(div);
    });
</script>
```

### Step 4: Trigger Modals from Buttons
Add click handlers to your "Get Started" or "Login" buttons:

```javascript
// Open login modal
document.querySelector('.your-login-button').addEventListener('click', function() {
  window.openLoginModal();
});

// Open signup modal
document.querySelector('.get-started-button').addEventListener('click', function() {
  window.openSignupModal();
});

// Or inline:
<button onclick="window.openSignupModal()">Get Started</button>
```

## Complete Example for Pricing Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pricing - Vixvvo</title>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-database-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-functions-compat.js"></script>
  
  <!-- Shared Styles -->
  <link rel="stylesheet" href="../css/shared-styles.css">
</head>
<body>
  
  <!-- Your page content -->
  <button onclick="window.openSignupModal()">Get Started</button>
  
  <!-- Auth Scripts -->
  <script src="../js/auth.js"></script>
  <script src="../js/modal-handler.js"></script>
  
  <!-- Load Modals -->
  <script>
    fetch('../components/auth-modals.html')
      .then(response => response.text())
      .then(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
      });
  </script>
</body>
</html>
```

## Modal Functions Available

```javascript
// Open modals
window.openLoginModal()      // Opens login modal
window.openSignupModal()     // Opens signup modal

// Close all modals
window.closeAllModals()      // Closes any open modal
```

## Features Included

✅ **Login Modal**
- Email/password login
- Google Sign-In (placeholder)
- Password visibility toggle
- "Forgot Password" link
- Switch to signup

✅ **Signup Modal**
- Username field
- Email/password registration
- Google Sign-Up (placeholder)
- Password confirmation
- Password visibility toggle
- Email verification flow
- Switch to login

✅ **Verification Modal**
- 6-digit code input
- Auto-focus on next input
- Countdown timer (10 minutes)
- Resend code option
- Back to signup

✅ **Modern Design**
- Kindle3D-inspired dark theme
- Smooth animations
- Click outside to close
- ESC key to close (coming soon)
- Fully responsive
- Accessible form controls

## Customization

### Change Logo
Edit `/components/auth-modals.html`:
```html
<img src="../images/YourLogo.png" alt="Your Brand" class="modal-logo">
```

### Modify Colors
Edit `/css/shared-styles.css`:
```css
.btn-primary {
  background: linear-gradient(135deg, #YourColor1 0%, #YourColor2 100%);
}
```

### Add More Social Logins
Add buttons in `/components/auth-modals.html`:
```html
<button class="social-login-btn" id="githubLoginBtn">
  <svg>...</svg>
  Log in with GitHub
</button>
```

Then handle in `/js/modal-handler.js`.

## Notes

- **Path Adjustments**: If your page is in a different directory, adjust paths accordingly
  - From `/pages/`: use `../images/`, `../css/`, `../js/`
  - From root: use `./images/`, `./css/`, `./js/`
  
- **Auth System**: Requires `auth.js` to be loaded for actual authentication
  
- **Firebase**: Make sure Firebase is initialized before modal-handler.js loads

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)
✅ Mobile browsers
⚠️ IE11 not supported (uses modern CSS Grid)
