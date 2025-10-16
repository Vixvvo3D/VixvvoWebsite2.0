# 🎨 Patreon Integration - Quick Reference

## 📊 Membership Tiers

| Tier | Price | Badge | Access Level |
|------|-------|-------|--------------|
| **Bronze** | Free | 🥉 | Basic features |
| **Silver** | $3/mo | 🥈 | + Priority support, PDF export, analytics |
| **Gold** | $10/mo | 🥇 | + Custom branding, early access, advanced presets |
| **Platinum** | $25/mo | 💎 | + API access, white-label, dedicated support |

---

## 🚀 Quick Setup (5 minutes)

1. **Create Patreon App**
   - Go to: https://www.patreon.com/portal/registration/register-clients
   - Get Client ID and Secret

2. **Run Setup Script**
   ```bash
   ./scripts/setup-patreon.sh
   ```

3. **Deploy Functions**
   ```bash
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```

4. **Configure Webhook**
   - URL: `https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/patreonWebhook`
   - Events: All member events
   - Secret: From setup script

---

## 💻 Code Examples

### Check Membership Tier
```javascript
const tier = await getUserMembershipTier(userId);
```

### Gate a Feature
```javascript
if (!hasFeatureAccess(tier, 'silver')) {
  showFeatureLockedMessage('silver');
  return;
}
```

### Display Badge
```javascript
displayMembershipBadge(tier, container);
```

---

## 📁 Files Created

### Backend
- `/functions/index.js` - Added Patreon OAuth & webhook handlers
- `/functions/package.json` - Added node-fetch dependency

### Frontend
- `/js/membership.js` - Core membership management
- `/js/feature-gating-examples.js` - Implementation examples
- `/pages/patreon-link.html` - User-facing Patreon linking page

### Documentation
- `/docs/features/PATREON_INTEGRATION_GUIDE.md` - Complete guide
- `/scripts/setup-patreon.sh` - Setup automation script

### Updated
- `/index.html` - Updated pricing section with 4 tiers

---

## 🔧 Configuration

### Firebase Functions Config
```bash
# View current config
firebase functions:config:get

# Update config
firebase functions:config:set patreon.client_id="YOUR_ID"
```

### Environment Variables
- `patreon.client_id` - Patreon OAuth Client ID
- `patreon.client_secret` - Patreon OAuth Client Secret  
- `patreon.redirect_uri` - OAuth redirect URL
- `patreon.webhook_secret` - Webhook verification secret

---

## 🎯 Key Functions

### Backend (Cloud Functions)
- `patreonOAuthCallback` - Handle OAuth login
- `patreonWebhook` - Process membership changes
- `syncPatreonMembership` - Manual sync

### Frontend (JavaScript)
- `getUserMembershipTier(userId)` - Get current tier
- `hasFeatureAccess(userTier, requiredTier)` - Check access
- `linkPatreonAccount()` - Connect Patreon
- `unlinkPatreonAccount()` - Disconnect Patreon
- `displayMembershipBadge()` - Show badge UI

---

## 🔒 Database Structure

```
users/{userId}/
  membership/
    tier: "bronze" | "silver" | "gold" | "platinum"
    patreon/
      patronId: "xxx"
      status: "active_patron"
      amountCents: 300
  patreonConnection/
    patronId: "xxx"
    accessToken: "xxx"
    refreshToken: "xxx"
```

---

## 🧪 Testing

### Test Locally
```bash
# Start local emulator
firebase emulators:start

# Test OAuth flow
open http://localhost:5000/pages/patreon-link.html
```

### Manual Tier Update (Testing)
```javascript
await firebase.database()
  .ref(`users/${userId}/membership/tier`)
  .set('platinum');
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| OAuth redirect fails | Check redirect URI matches exactly |
| Webhook not working | Verify signature and secret |
| Tier not updating | Check webhook logs, try manual sync |
| Functions not deployed | Run `firebase deploy --only functions` |

---

## 📞 Support Resources

- **Patreon API Docs**: https://docs.patreon.com/
- **Firebase Functions**: https://firebase.google.com/docs/functions
- **Full Guide**: `/docs/features/PATREON_INTEGRATION_GUIDE.md`
- **Examples**: `/js/feature-gating-examples.js`

---

## 🎨 Customization

### Add New Tier
1. Update pricing in `index.html`
2. Add tier to `TIER_INFO` in `membership.js`
3. Update amount mapping in `functions/index.js`
4. Create matching Patreon tier

### Change Tier Prices
1. Update Patreon tier prices
2. Update `index.html` pricing display
3. Update `TIER_INFO` in `membership.js`
4. Update amount thresholds in Cloud Functions

---

**Ready to launch! 🚀**

For detailed setup instructions, see:
`/docs/features/PATREON_INTEGRATION_GUIDE.md`
