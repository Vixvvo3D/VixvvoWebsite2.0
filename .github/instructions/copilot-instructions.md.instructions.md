---
applyTo: '**'
---
# Copilot Instructions for Vixvvo Website 2.0

## Code Organization Standards

### ✅ ALWAYS follow this structure:

1. **Separate CSS files** - Never put `<style>` blocks in HTML pages
   - Page-specific CSS → `/css/[pagename].css`
   - Shared CSS → `/css/shared-styles.css`
   - Component CSS → `/css/components.css`

2. **Separate JS files** - Never put `<script>` blocks (except external CDNs) in HTML pages
   - Page-specific JS → `/js/[pagename].js`
   - Shared JS → `/js/[functionality].js`

3. **Always use `defer` attribute** on local script tags for performance:
   ```html
   <script src="../js/myfile.js" defer></script>
   ```

4. **File paths from `/pages/` folder**:
   - CSS: `../css/filename.css`
   - JS: `../js/filename.js`
   - Images: `../images/...`

### 🚫 NEVER do this:

- ❌ Inline `<style>` blocks in HTML
- ❌ Inline `<script>` blocks in HTML (except for required callbacks like Google Maps)
- ❌ Mix page logic with HTML structure
- ❌ Duplicate CSS across multiple files

## Modal System Standards

### ⚠️ CRITICAL: When creating new modals:

**ALWAYS add the new modal ID to the main modal CSS selector in `/css/shared-styles.css`:**

```css
#modal, #signupModal, #verificationModal, #resetPasswordModal, 
#printerModal, #filamentModal, #savePresetModal, #managePresetsModal, 
#viewOrderModal, #editOrderModal, #addColorModal,
#addModelModal, #addSupplyModal, #createSupplyModal, #addPrinterModal, #cropModal {
  position: fixed;
  inset: 0;
  display: none;
  z-index: 10000;
  place-items: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}
```

**Why this matters:**
- Without this CSS rule, your modal will not display even if `display: grid` is set via JavaScript
- This is the most common bug when adding new modals
- The modal will appear to "not work" even though the JS is correct

### Checklist for new modals:

1. ✅ Create modal HTML in `/components/` or inline in page
2. ✅ Add modal ID to CSS selector in `/css/shared-styles.css` (line ~466)
3. ✅ Add open/close handlers in `/js/modal-handler.js`
4. ✅ Test that modal opens with `display: grid`
5. ✅ Test that modal closes and backdrop click works

### When creating or modifying HTML pages:

1. Extract all CSS to separate file: `/css/[pagename].css`
2. Extract all JS to separate file: `/js/[pagename].js`
3. Link them in the `<head>` (CSS) and before `</body>` (JS with defer)
4. Keep HTML clean - only structure and content

### Example structure for new page:

```html
<head>
  <!-- Shared styles first -->
  <link rel="stylesheet" href="../css/shared-styles.css">
  <!-- Page-specific styles after -->
  <link rel="stylesheet" href="../css/newpage.css">
  
  <!-- Local scripts with defer -->
  <script src="../js/shared-script.js" defer></script>
</head>
<body>
  <!-- HTML content only -->
  
  <!-- Page-specific script before closing body -->
  <script src="../js/newpage.js" defer></script>
</body>
```

## Why This Matters:

- ✅ Better caching and performance
- ✅ Easier maintenance and debugging
- ✅ Reusable code across pages
- ✅ Cleaner separation of concerns
- ✅ Better code review and version control

---

## 🔍 PRE-SUBMISSION CHECKLIST

Before completing any task, **VERIFY ALL** of the following:

### File Structure Verification:
- [ ] No `<style>` blocks exist in HTML files (except external CDN links)
- [ ] No `<script>` blocks with code in HTML files (only `src` attributes with `defer`)
- [ ] All CSS is in separate `.css` files under `/css/`
- [ ] All JS is in separate `.js` files under `/js/`
- [ ] File paths from `/pages/` use correct relative paths (`../css/`, `../js/`, `../images/`)

### Modal-Specific Verification (if modals were added/modified):
- [ ] New modal ID added to CSS selector in `/css/shared-styles.css` (line ~466)
- [ ] Modal handler functions exist in `/js/modal-handler.js`
- [ ] Open/close functionality tested
- [ ] Backdrop click-to-close works

### Code Quality Verification:
- [ ] No duplicate CSS rules across files
- [ ] No inline styles on HTML elements
- [ ] All local scripts use `defer` attribute
- [ ] Shared styles loaded before page-specific styles
- [ ] File naming follows convention: `[pagename].css`, `[pagename].js`

### Security & Performance:
- [ ] No hardcoded sensitive data in client-side code
- [ ] Firebase config uses environment-appropriate values
- [ ] Images optimized and properly referenced
- [ ] No console.log statements in production code (unless intentional)

---

## ⚠️ CRITICAL REMINDER

**THIS IS FOR VIXVVO WEBSITE 2.0 PROJECT**

- Core pages: `index.html`, `dashboard.html`, `/pages/*.html`
- ALL standards above are **MANDATORY**
- NO exceptions for inline styles/scripts
- ALL file paths relative to `/pages/` folder
- Maintain separation of concerns: HTML (structure), CSS (style), JS (behavior)
- Follow security best practices for authentication and data handling

**If you cannot follow these standards, ask for clarification before proceeding.**