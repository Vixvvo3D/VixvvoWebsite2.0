# 🎯 Patreon OAuth Client - Simplified Setup

## Just Fill These Fields (Minimum Required)

### 1. App Name
```
Vixvvo Tools
```
(Or whatever your website name is)

---

### 2. Description
```
Website integration for Vixvvo members to access premium features
```
(Short and simple)

---

### 3. App Category
```
Choose: "Software" or "Other"
```
(Doesn't really matter - just pick one)

---

### 4. Author/Owner Name
```
Your name or "Vixvvo"
```

---

### 5. Privacy Policy URL
```
https://yourdomain.com/privacy
```
**Don't have one?** → Use a simple generic one:
```
https://yourdomain.com
```
(They won't check deeply for personal projects)

---

### 6. Terms of Service URL
```
https://yourdomain.com/terms
```
**Don't have one?** → Same as above:
```
https://yourdomain.com
```

---

### 7. Redirect URIs (IMPORTANT!)
```
https://yourdomain.com/pages/patreon-link.html
```

**For testing, also add:**
```
http://localhost:5000/pages/patreon-link.html
```

**COPY THIS EXACTLY** - Replace `yourdomain.com` with your actual domain

---

### 8. Scopes (Check These Boxes)
✅ `identity` - See who they are  
✅ `identity[email]` - See their email  
✅ `campaigns.members` - See their membership tier  

---

## Optional Fields (Skip These)

❌ **Icon URL** - Skip it (not required)  
❌ **Website URL** - Optional  
❌ **Support Email** - Optional  

---

## After Creating

You'll get:

### Client ID
```
Something like: a1b2c3d4e5f6g7h8i9j0
```
**Copy this** → Put in `js/patreon-config.js`

### Client Secret
```
Something like: x9y8z7w6v5u4t3s2r1q0
```
**Copy this** → Put in Firebase config (keep secret!)

---

## Quick Example

Here's what your form might look like:

```
App Name:             Vixvvo Tools
Description:          Member access for Vixvvo website
App Category:         Software
Author Name:          Vixvvo
Privacy Policy URL:   https://vixvvo.com
Terms of Service:     https://vixvvo.com
Icon URL:             [leave blank]

Redirect URIs:
  • https://vixvvo.com/pages/patreon-link.html
  • http://localhost:5000/pages/patreon-link.html

Scopes:
  ✅ identity
  ✅ identity[email]
  ✅ campaigns.members
```

---

## If You Don't Have Privacy Policy/Terms

### Quick Solution 1: Use Homepage
```
Privacy Policy URL: https://yourdomain.com
Terms of Service:   https://yourdomain.com
```

### Quick Solution 2: Create Simple Pages

**Create `privacy.html`:**
```html
<!DOCTYPE html>
<html>
<head><title>Privacy Policy</title></head>
<body>
  <h1>Privacy Policy</h1>
  <p>We use Patreon to manage memberships. Your Patreon data is only used to verify your membership tier. We do not share your information with third parties.</p>
</body>
</html>
```

**Create `terms.html`:**
```html
<!DOCTYPE html>
<html>
<head><title>Terms of Service</title></head>
<body>
  <h1>Terms of Service</h1>
  <p>By using this service, you agree to follow our community guidelines. Membership benefits are tied to active Patreon subscriptions.</p>
</body>
</html>
```

Upload these and use their URLs.

---

## After You Click "Create"

1. **Copy Client ID** → Goes in `js/patreon-config.js`
2. **Copy Client Secret** → Goes in Firebase config
3. **That's it!** Continue with setup

---

## Still Confused?

### What Really Matters:
1. ✅ **Redirect URI** - MUST be exact
2. ✅ **Scopes** - Need the 3 checkboxes
3. ✅ **Client ID & Secret** - You'll get after creating

### What Doesn't Matter Much:
- Description (just write something)
- App Category (any is fine)
- Icon (optional)
- Privacy/Terms URLs (can use homepage for now)

---

## The Only 2 Things That MUST Be Perfect:

### 1. Redirect URI
```
https://yourdomain.com/pages/patreon-link.html
```
- No trailing slash
- Exact path
- HTTPS in production

### 2. Scopes
```
✅ identity
✅ identity[email]
✅ campaigns.members
```

Everything else is flexible! 🎉

---

## Next Steps After Creating Client

1. Copy Client ID
2. Edit `js/patreon-config.js`:
   ```javascript
   clientId: 'paste-your-client-id-here'
   ```
3. Run Firebase config:
   ```bash
   firebase functions:config:set \
     patreon.client_id="YOUR_CLIENT_ID" \
     patreon.client_secret="YOUR_CLIENT_SECRET" \
     patreon.redirect_uri="https://yourdomain.com/pages/patreon-link.html"
   ```
4. Deploy:
   ```bash
   firebase deploy --only functions
   ```

**Done!** 🚀

---

**Need more help?** Check [PATREON_SETUP_QUICK.md](PATREON_SETUP_QUICK.md)
