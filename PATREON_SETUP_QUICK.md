# ⚡ Patreon Setup - Quick Reference

## 🎯 Essential Steps (5 minutes)

### 1. Get Patreon Credentials
```
→ https://www.patreon.com/portal/registration/register-clients
→ Create Client
→ Copy: Client ID & Client Secret
```

### 2. Update Config File
```javascript
// js/patreon-config.js
clientId: 'YOUR_CLIENT_ID_HERE'
```

### 3. Set Firebase Config
```bash
firebase functions:config:set \
  patreon.client_id="YOUR_ID" \
  patreon.client_secret="YOUR_SECRET" \
  patreon.redirect_uri="https://yourdomain.com/pages/patreon-link.html"
```

### 4. Deploy
```bash
firebase deploy --only functions
```

### 5. Setup Webhook
```
→ Patreon Portal → Your App → Add Webhook
→ URL: https://[region]-[project].cloudfunctions.net/patreonWebhook
→ Events: members:pledge:* (all)
→ Copy webhook secret
```

### 6. Add Webhook Secret
```bash
firebase functions:config:set patreon.webhook_secret="YOUR_SECRET"
firebase deploy --only functions
```

---

## 🔑 What You Need

From Patreon:
- ✅ Client ID (public, goes in `js/patreon-config.js`)
- ✅ Client Secret (secret, goes in Firebase config)
- ✅ Webhook Secret (secret, goes in Firebase config)

Your Info:
- ✅ Domain: `https://yourdomain.com`
- ✅ Redirect URI: `https://yourdomain.com/pages/patreon-link.html`

---

## 📁 Files to Edit

1. **`js/patreon-config.js`**
   ```javascript
   clientId: 'paste-client-id-here'
   ```

2. **Firebase Config** (via terminal)
   ```bash
   firebase functions:config:set patreon.client_id="..."
   ```

---

## 🧪 Test It

1. Login to your website
2. Click profile → "Connect to Patreon"
3. Authorize on Patreon
4. Should redirect back with tier synced

---

## 🐛 Common Issues

**"redirect_uri_mismatch"**
- Check Patreon Portal → Redirect URIs matches exactly
- Must use HTTPS in production

**"Patreon configuration missing"**
- Run: `firebase functions:config:get`
- If empty, set config again and redeploy

**Webhook not firing**
- Check Firebase logs: `firebase functions:log`
- Verify webhook secret is set
- Test webhook in Patreon Portal

---

## 📞 Need Full Guide?

See: `docs/setup/PATREON_COMPLETE_SETUP_GUIDE.md`

---

**Status:** ⬜ Client ID Added | ⬜ Firebase Config Set | ⬜ Functions Deployed | ⬜ Webhook Setup | ⬜ Tested
