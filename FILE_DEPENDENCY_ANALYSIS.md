# File Dependency Analysis - Dashboard & Index

## 🎯 Core Pages You're Keeping

### ✅ `index.html` (Landing Page)
**Purpose:** Main marketing/landing page for the website

**Required Files:**
- **CSS:**
  - `css/shared-styles.css` ✅
- **JS:**
  - `js/navbar-helper.js` ✅
  - `js/navbar-loader.js` ✅
  - `js/settings-dropdown.js` ✅
  - `js/navbar-auth.js` ✅
  - `js/currency.js` ✅
- **Components:**
  - `components/navbar.html` (loaded by navbar-loader.js)
  - `components/auth-modals.html` (loaded for login/signup)

---

### ✅ `pages/dashboard.html` (Main Tool Hub)
**Purpose:** Central dashboard linking to all tools

**Required Files:**
- **CSS:**
  - `css/shared-styles.css` ✅
  - `css/dashboard.css` ✅
  - `css/notification-modals.css` ✅
- **JS:**
  - `js/dashboard.js` ✅
  - `js/navbar-helper.js` ✅
  - `js/navbar-loader.js` ✅
  - `js/settings-dropdown.js` ✅
  - `js/navbar-auth.js` ✅
  - `js/auth.js` ✅
  - `js/currency.js` ✅
- **Components:**
  - `components/navbar.html`
  - `components/auth-modals.html`

**Links to These Pages:**
- `pages/calculator.html` ← Quick action button
- `pages/orders.html` ← Quick action button
- `pages/upload-model.html` ← Quick action button
- `pages/more-tools.html` ← Quick action button
- `pages/settings.html` ← Sidebar link

---

## 🔗 Tool Pages (Linked from Dashboard)

### ✅ `pages/calculator.html`
**Used by Dashboard?** YES - "Start" button links to it
**Required Files:**
- `css/shared-styles.css`
- `css/calculator.css` (if it exists)
- `js/calculator.js` ✅
- All navbar JS files
**Keep?** ✅ YES - Core tool

---

### ✅ `pages/orders.html`
**Used by Dashboard?** YES - "View Orders" button
**Required Files:**
- `css/shared-styles.css`
- `js/orders.js` ✅
- All navbar JS files
**Keep?** ✅ YES - Core tool

---

### ✅ `pages/upload-model.html`
**Used by Dashboard?** YES - "Upload Model" button
**Required Files:**
- `css/shared-styles.css`
- `js/upload-model.js` ✅
- All navbar JS files
**Keep?** ✅ YES - Core tool

---

### ✅ `pages/more-tools.html`
**Used by Dashboard?** YES - "Explore" button
**Required Files:**
- `css/shared-styles.css`
- All navbar JS files
**Keep?** ✅ YES - Listed in dashboard

---

### ✅ `pages/settings.html`
**Used by Dashboard?** YES - Sidebar link
**Required Files:**
- `css/shared-styles.css`
- All navbar JS files
**Keep?** ✅ YES - User settings

---

## ❌ Pages NOT Used by Dashboard

### ❌ `pages/model-admin.html`
**Used by Dashboard?** NO - Not linked anywhere
**Purpose:** Admin page for managing models
**Keep?** 🟡 MAYBE - Only if you use it for admin tasks
**Recommendation:** Move to archive unless you actively use it

---

### ❌ `pages/patreon-link.html`
**Used by Dashboard?** NO - Separate Patreon integration page
**Purpose:** Patreon OAuth callback and linking
**Keep?** 🟡 MAYBE - Only if you have Patreon integration active
**Recommendation:** Move to archive if not using Patreon membership

---

### ❌ `pages/pricing.html`
**Used by Dashboard?** NO - Not linked from dashboard
**Purpose:** Pricing/membership page
**Keep?** 🟡 MAYBE - Only if you want a public pricing page
**Recommendation:** Move to archive unless you're selling memberships

---

## 📊 File Usage Summary

### CSS Files (in `css/`)
- ✅ **shared-styles.css** - Used by ALL pages - REQUIRED
- ✅ **dashboard.css** - Used by dashboard.html - REQUIRED
- ✅ **calculator.css** - Used by calculator.html - REQUIRED
- ✅ **notification-modals.css** - Used by dashboard - REQUIRED
- ❓ **components.css** - Check if used
- ❓ **main.css** - Check if used

### JavaScript Files (in `js/`)
**Core/Shared (REQUIRED):**
- ✅ `auth.js` - Authentication
- ✅ `navbar-helper.js` - Navbar functionality
- ✅ `navbar-loader.js` - Loads navbar component
- ✅ `navbar-auth.js` - Navbar auth state
- ✅ `settings-dropdown.js` - Settings menu
- ✅ `currency.js` - Currency handling
- ✅ `firebase-config.js` - Firebase setup
- ✅ `modal-handler.js` - Modal management

**Page-Specific (REQUIRED for those pages):**
- ✅ `dashboard.js` - Dashboard functionality
- ✅ `calculator.js` - Calculator page
- ✅ `orders.js` - Orders page
- ✅ `upload-model.js` - Upload model page

**Utility (CHECK USAGE):**
- ❓ `membership.js` - Membership features
- ❓ `navigation.js` - Navigation utilities
- ❓ `patreon-config.js` - Patreon integration

---

## 🎯 Recommended Actions

### Option 1: Keep All Tool Pages (Conservative)
**Keep:**
- index.html
- dashboard.html
- calculator.html
- orders.html
- upload-model.html
- more-tools.html
- settings.html

**Archive:**
- model-admin.html (unless you use it)
- patreon-link.html (unless you have Patreon)
- pricing.html (unless you sell memberships)

### Option 2: Minimal Setup (Aggressive)
**Keep:**
- index.html
- dashboard.html
- calculator.html (most used tool)
- settings.html

**Archive:**
- orders.html
- upload-model.html
- more-tools.html
- model-admin.html
- patreon-link.html
- pricing.html

---

## 🚨 Questions to Answer

1. **Do you use the Orders page?** If yes, keep `orders.html` + `orders.js`
2. **Do you use Upload Model feature?** If yes, keep `upload-model.html` + `upload-model.js`
3. **Do you have Patreon integration?** If no, archive `patreon-link.html` + `patreon-config.js`
4. **Do you sell memberships?** If no, archive `pricing.html`
5. **Do you need admin model management?** If no, archive `model-admin.html`
6. **What is More Tools page?** Check if it's actually used

---

## 💡 Next Steps

**Tell me which pages you actually USE, and I'll:**
1. Keep only those pages + their dependencies
2. Archive everything else
3. Clean up unused CSS/JS files
4. Update dashboard links if needed
