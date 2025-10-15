# Login Button Redirect Feature

## Overview
All login and sign-in buttons across the website now redirect users to the home page (index.html) and automatically open the login modal.

## Implementation Date
October 14, 2025

## Changes Made

### 1. Index.html (Home Page)
- **Login buttons behavior**: Opens modal directly (no redirect needed since already on home page)
- **URL Parameter Detection**: Added automatic modal opening based on URL parameters
  - `?login=true` → Opens login modal
  - `?signup=true` → Opens signup modal
- After opening modal, URL parameters are removed from the address bar without page refresh

### 2. Calculator.html
- **btnLoginNav** (navbar login button): Redirects to `../index.html?login=true`
- **btnLoginSettings** (dropdown login button): Redirects to `../index.html?login=true`

### 3. Settings.html
- **btnLoginNav** (navbar login button): Redirects to `../index.html?login=true`
- **btnLoginSettings** (dropdown login button): Redirects to `../index.html?login=true`

### 4. More-tools.html
- **Added new handlers** after navbar loads:
  - **btnLoginNav**: Redirects to `../index.html?login=true`
  - **btnLoginSettings**: Redirects to `../index.html?login=true`

## User Flow

### From Any Page (Calculator, Settings, More Tools):
1. User clicks any "Login" or "Sign In" button
2. Browser redirects to home page with `?login=true` parameter
3. Home page loads and detects the URL parameter
4. Login modal automatically opens after 500ms delay
5. URL parameter is removed from address bar
6. User can log in normally

### From Home Page:
1. User clicks "Login" button
2. Login modal opens immediately (no redirect)

## Technical Details

### URL Parameter System
```javascript
// Detection code in index.html
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('login') === 'true') {
  setTimeout(() => {
    const modal = document.getElementById('loginModal');
    if (modal) {
      document.getElementById('loginErr').textContent = '';
      modal.style.display = 'grid';
    }
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }, 500);
}
```

### Redirect Code Pattern
```javascript
// Used on all sub-pages (calculator, settings, more-tools)
btnLoginNav.addEventListener('click', () => {
  window.location.href = '../index.html?login=true';
});
```

## Benefits

1. **Consistent Experience**: All login actions lead to the same place
2. **Single Auth Modal**: Only need to maintain auth modals on the home page
3. **Cleaner Code**: Sub-pages don't need their own login modal implementations
4. **URL Preservation**: Hash fragments are preserved when removing URL parameters
5. **Better UX**: Automatic modal opening feels seamless to users

## Files Modified

- `/index.html` - Added URL parameter detection and kept direct modal opening
- `/pages/calculator.html` - Changed login buttons to redirect with parameter
- `/pages/settings.html` - Changed login buttons to redirect with parameter
- `/pages/more-tools.html` - Added login button handlers that redirect with parameter

## Testing Checklist

- [ ] Test login button in navbar from calculator page
- [ ] Test login button in dropdown from calculator page
- [ ] Test login button in navbar from settings page
- [ ] Test login button in dropdown from settings page
- [ ] Test login button in navbar from more-tools page
- [ ] Test login button in dropdown from more-tools page
- [ ] Test login button in navbar from home page
- [ ] Test login button in dropdown from home page
- [ ] Verify modal opens automatically after redirect
- [ ] Verify URL parameter is removed after modal opens
- [ ] Verify hash fragments are preserved during redirect

## Future Enhancements

- Could extend to support `?action=signup` for signup modal
- Could add support for error messages in URL parameters
- Could add support for redirect after login (e.g., `?login=true&returnTo=/calculator`)
