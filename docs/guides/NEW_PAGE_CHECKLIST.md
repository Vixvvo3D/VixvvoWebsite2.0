# ✅ New Page Checklist

Use this checklist when creating a new page to ensure ALL functionality works.

## 📋 Before You Start
- [ ] Copy `tools/COMPLETE_PAGE_TEMPLATE.html` to `pages/your-page.html`
- [ ] Read `docs/guides/COMPLETE_NEW_PAGE_GUIDE.md`

## 🎨 Customization
- [ ] Update page `<title>` tag
- [ ] Update page header text
- [ ] Add your custom styles
- [ ] Add your content HTML
- [ ] Add your custom JavaScript

## 🔗 Navigation
- [ ] Add link to navbar in `components/navbar.html`
- [ ] Test navigation from other pages
- [ ] Test navigation to other pages

## ✅ Required Components (DO NOT DELETE)

### In `<head>`:
- [ ] Firebase SDKs (4 scripts)
- [ ] Google Fonts link
- [ ] `shared-styles.css`
- [ ] `navbar-helper.js`
- [ ] `navbar-loader.js`
- [ ] `settings-dropdown.js`
- [ ] `navbar-auth.js`
- [ ] `auth.js`

### CSS Styles:
- [ ] `.notification` styles
- [ ] `.notification.show` styles
- [ ] `.confirm-dialog` styles
- [ ] `.confirm-dialog.show` styles
- [ ] `.btn-danger` styles

### In `<body>`:
- [ ] `<div id="navbar-container"></div>`
- [ ] `<div id="overlay"></div>`
- [ ] `<div id="customNotification">` (complete structure)
- [ ] `<div id="customConfirm">` (complete structure)

### JavaScript Functions:
- [ ] `showNotification()` function
- [ ] `hideNotification()` function
- [ ] `showConfirm()` function
- [ ] Currency handling code
- [ ] `updateSaveButton()` function
- [ ] `saveCurrencyPreference()` function
- [ ] `loadSavedCurrency()` function
- [ ] `navbarLoaded` event listener
- [ ] All button click handlers

## 🧪 Testing (Logged Out)
- [ ] Page loads without errors
- [ ] Navbar appears correctly
- [ ] Logo displays
- [ ] Navigation links work
- [ ] Settings dropdown opens/closes
- [ ] "Login" button shows in dropdown
- [ ] Login button works (redirects to home)
- [ ] Currency selector shows
- [ ] Currency selector changes currency
- [ ] NO save button shows (logged out)
- [ ] User info section is hidden

## 🧪 Testing (Logged In)

### Login Test:
- [ ] Click login button
- [ ] Enter credentials
- [ ] Successfully logs in
- [ ] Page reloads/updates

### Display Test:
- [ ] User avatar shows (first letter of username)
- [ ] Username displays correctly
- [ ] Role displays (Member/Admin)
- [ ] "Login" button is hidden
- [ ] "Logout" button shows
- [ ] "Settings" button shows

### Dropdown Test:
- [ ] Click settings (☰) button
- [ ] Dropdown opens smoothly
- [ ] User info section visible
- [ ] Avatar displays correctly
- [ ] Username shows correctly
- [ ] Role badge shows
- [ ] Currency selector visible
- [ ] Save currency button visible
- [ ] Logout button visible
- [ ] Settings button visible
- [ ] Click outside closes dropdown

### Currency Test:
- [ ] Currency dropdown shows saved preference
- [ ] Change currency updates selector
- [ ] Save button becomes enabled
- [ ] Click save button
- [ ] Shows "Saving..." text
- [ ] Success notification appears
- [ ] Shows "Saved" text
- [ ] Button becomes disabled
- [ ] Refresh page
- [ ] Saved currency still selected

### Logout Test:
- [ ] Click logout button
- [ ] Confirmation dialog appears
- [ ] Overlay shows (dark background)
- [ ] Dialog shows "Are you sure?" message
- [ ] Click "Cancel" - dialog closes
- [ ] Click logout again
- [ ] Click "Logout" - logs out successfully
- [ ] "Goodbye!" notification shows
- [ ] Page reloads
- [ ] User info hidden
- [ ] Login button shows again

### Settings Navigation:
- [ ] Click "Settings" button in dropdown
- [ ] Navigates to settings page correctly

## 🎨 Notifications Test
- [ ] Trigger success notification
- [ ] Overlay appears (dark background)
- [ ] Notification appears centered
- [ ] Animation is smooth (scale + fade)
- [ ] Icon displays (if provided)
- [ ] Title displays correctly
- [ ] Message displays correctly
- [ ] "Got it!" button works
- [ ] Clicking button closes notification
- [ ] Overlay disappears

## ❓ Confirmation Dialog Test
- [ ] Trigger confirm dialog
- [ ] Overlay appears (dark background)
- [ ] Dialog appears centered
- [ ] Animation is smooth
- [ ] Icon displays (if provided)
- [ ] Title displays correctly
- [ ] Message displays correctly
- [ ] "Confirm" button shows (custom text)
- [ ] "Cancel" button shows
- [ ] Clicking "Cancel" returns false
- [ ] Clicking "Confirm" returns true
- [ ] Dialog closes properly
- [ ] Overlay disappears

## 📱 Mobile Testing
- [ ] Test on mobile device or emulator
- [ ] Navbar is responsive
- [ ] Settings dropdown works on mobile
- [ ] Touch events work properly
- [ ] Dialogs are mobile-friendly
- [ ] Text is readable
- [ ] Buttons are tap-friendly

## 🌐 Browser Testing
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

## 🐛 Console Checks
- [ ] No JavaScript errors
- [ ] No CSS errors
- [ ] "✅ Navbar loaded" message appears
- [ ] "✅ User logged in" message (when logged in)
- [ ] "✅ Currency saved" message (after saving)
- [ ] Firebase connection successful

## 🔍 Final Verification

### Visual Check:
- [ ] All text is visible
- [ ] No broken images
- [ ] Colors look correct
- [ ] Animations are smooth
- [ ] Layout is not broken
- [ ] Responsive on all screen sizes

### Functionality Check:
- [ ] Every button does something
- [ ] No dead links
- [ ] Forms submit correctly
- [ ] Data saves to Firebase
- [ ] Data loads from Firebase

### Performance Check:
- [ ] Page loads quickly
- [ ] No lag when clicking
- [ ] Smooth scrolling
- [ ] No memory leaks

## ✨ Optional Enhancements
- [ ] Add loading spinner
- [ ] Add page transitions
- [ ] Add custom animations
- [ ] Add keyboard shortcuts
- [ ] Add accessibility features (ARIA labels)
- [ ] Add meta tags for SEO

## 📝 Documentation
- [ ] Add comments to complex code
- [ ] Document any custom functions
- [ ] Update README if needed

## 🚀 Deployment
- [ ] Test on production server
- [ ] Verify Firebase works in production
- [ ] Check all links work
- [ ] Test on real devices

---

## 🎉 Completion
- [ ] All items above checked
- [ ] Page fully functional
- [ ] No bugs found
- [ ] Ready for production

**Date Completed:** ___________

**Tested By:** ___________

**Notes:**
```
(Add any notes or issues here)
```

---

## 🆘 If Something Doesn't Work

1. **Check console for errors**
2. **Verify all required files exist**
3. **Compare with working page (calculator.html)**
4. **Review COMPLETE_NEW_PAGE_GUIDE.md**
5. **Check Firebase console**

## ✅ Quick Fix Common Issues

| Issue | Solution |
|-------|----------|
| Navbar doesn't load | Check `navbar-loader.js` exists |
| Dropdown doesn't work | Check `settings-dropdown.js` loaded |
| Login fails | Verify Firebase config in `auth.js` |
| Currency doesn't save | Check user is logged in |
| Notifications don't show | Verify overlay and notification div exist |
| Buttons don't work | Check event listeners in navbarLoaded |

---

**Pro Tip:** Keep this checklist open while building your page and check off items as you complete them!
