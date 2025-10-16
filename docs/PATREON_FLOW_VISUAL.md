# 🎨 Patreon Integration - Visual Flow

## 📊 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CONNECTS PATREON                         │
└─────────────────────────────────────────────────────────────────┘

1. USER ON YOUR WEBSITE
   ┌──────────────┐
   │ User Login   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────┐
   │ Opens Dropdown   │
   │ Settings Menu    │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Clicks "Connect to   │
   │ Patreon" Button      │
   └──────┬───────────────┘
          │
          ▼

2. REDIRECT TO PATREON LINK PAGE
   ┌──────────────────────────┐
   │ pages/patreon-link.html  │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Shows membership status  │
   │ and connection button    │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ User clicks "Connect     │
   │ with Patreon"            │
   └──────┬───────────────────┘
          │
          ▼

3. REDIRECT TO PATREON (OAuth)
   ┌─────────────────────────────────┐
   │ https://patreon.com/oauth2/     │
   │ authorize?                      │
   │   - client_id                   │
   │   - redirect_uri                │
   │   - scope                       │
   └─────────┬───────────────────────┘
             │
             ▼
   ┌─────────────────────┐
   │ PATREON LOGIN PAGE  │
   │ (if not logged in)  │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │ AUTHORIZATION PAGE  │
   │ "Allow Vixvvo to:"  │
   │ ✓ View identity     │
   │ ✓ View email        │
   │ ✓ View membership   │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │ User Clicks "Allow" │
   └─────────┬───────────┘
             │
             ▼

4. CALLBACK TO YOUR WEBSITE
   ┌─────────────────────────────────┐
   │ Redirect to:                    │
   │ pages/patreon-link.html?        │
   │   code=AUTH_CODE                │
   └─────────┬───────────────────────┘
             │
             ▼
   ┌─────────────────────────────┐
   │ JavaScript detects code     │
   │ parameter in URL            │
   └─────────┬───────────────────┘
             │
             ▼
   ┌─────────────────────────────┐
   │ Calls Firebase Function:    │
   │ patreonOAuthCallback()      │
   │   - code                    │
   │   - userId                  │
   └─────────┬───────────────────┘
             │
             ▼

5. FIREBASE FUNCTION PROCESSING
   ┌──────────────────────────────────┐
   │ patreonOAuthCallback()           │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Exchange code for access token   │
   │ POST to Patreon API              │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Get user identity & membership   │
   │ from Patreon API                 │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Calculate tier based on amount:  │
   │ $25+ = business                  │
   │ $10+ = scaling                   │
   │ $3+  = starter                   │
   │ $0   = free                      │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Save to Firebase Database:       │
   │ users/{userId}/                  │
   │   - membership/tier              │
   │   - membership/patreon/*         │
   │   - patreonConnection/*          │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Return success response          │
   │ { tier: "scaling", success: true}│
   └──────────┬───────────────────────┘
              │
              ▼

6. BACK TO WEBSITE
   ┌──────────────────────────────────┐
   │ Show success message             │
   │ "Connected as Scaling member!"   │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Reload membership status         │
   │ Display tier badge               │
   │ Unlock features                  │
   └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC TIER UPDATES                        │
└─────────────────────────────────────────────────────────────────┘

7. WHEN USER CHANGES TIER ON PATREON
   ┌──────────────────────────────────┐
   │ User upgrades/downgrades on      │
   │ Patreon.com                      │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ PATREON SENDS WEBHOOK            │
   │ POST to your Firebase Function   │
   │ patreonWebhook()                 │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Webhook payload contains:        │
   │ - Event type (pledge update)     │
   │ - Patron ID                      │
   │ - New tier amount                │
   │ - Status                         │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Function verifies webhook        │
   │ signature (security)             │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Find user by Patron ID           │
   │ in Firebase Database             │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Update user's tier automatically │
   │ based on new amount              │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ User's tier is now synced!       │
   │ Next page load = new features    │
   └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE GATING EXAMPLE                        │
└─────────────────────────────────────────────────────────────────┘

8. USER TRIES TO ACCESS PREMIUM FEATURE
   ┌──────────────────────────────────┐
   │ User clicks "Export to PDF"      │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ JavaScript checks tier:          │
   │ const tier = await               │
   │   getUserMembershipTier(userId)  │
   └──────────┬───────────────────────┘
              │
              ├─────────────────────┐
              │                     │
              ▼                     ▼
   [Tier: "starter" or higher]  [Tier: "free"]
              │                     │
              ▼                     ▼
   ┌─────────────────────┐  ┌──────────────────┐
   │ Access Granted!     │  │ Access Denied    │
   │ Export PDF...       │  │ Show upgrade msg │
   └─────────────────────┘  └──────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────┐
│    SECURITY MEASURES IN PLACE       │
└─────────────────────────────────────┘

1. OAuth Flow
   ✓ No passwords stored
   ✓ Tokens encrypted in Firebase
   ✓ Patreon handles authentication

2. Webhook Verification
   ✓ HMAC signature verification
   ✓ Webhook secret validates source
   ✓ Prevents spoofing attacks

3. Firebase Security
   ✓ Functions only callable by auth users
   ✓ Database rules restrict access
   ✓ HTTPS enforced

4. Token Management
   ✓ Access tokens stored securely
   ✓ Refresh tokens for renewal
   ✓ Automatic token refresh
```

---

## 📂 File Structure

```
Your Website
├── js/
│   ├── patreon-config.js       ← Client ID (public)
│   ├── membership.js           ← Tier checking functions
│   └── navbar-auth.js          ← Button click handler
│
├── pages/
│   └── patreon-link.html       ← OAuth callback page
│
└── functions/
    └── index.js                ← OAuth & webhook handlers
                                  (Client Secret - secret!)

Firebase Config (via terminal)
└── patreon.client_id           ← Set via firebase CLI
    patreon.client_secret       ← Set via firebase CLI
    patreon.redirect_uri        ← Set via firebase CLI
    patreon.webhook_secret      ← Set via firebase CLI

Patreon Developer Portal
└── OAuth Client
    ├── Client ID               → Copy to patreon-config.js
    ├── Client Secret           → Copy to Firebase config
    ├── Redirect URIs           → Add your URL
    └── Webhook
        ├── URL                 → Your Firebase function URL
        └── Secret              → Copy to Firebase config
```

---

## 🎯 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│               FIREBASE DATABASE STRUCTURE                    │
└─────────────────────────────────────────────────────────────┘

After connection:

users/
  {userId}/
    membership/
      tier: "scaling"                    ← User's current tier
      updatedAt: 1234567890
      patreon/
        patronId: "123456"               ← Patreon user ID
        status: "active_patron"          ← Subscription status
        lastSyncedAt: 1234567890
    
    patreonConnection/
      patronId: "123456"
      accessToken: "encrypted..."        ← OAuth access token
      refreshToken: "encrypted..."       ← OAuth refresh token
      linkedAt: 1234567890
      status: "connected"

This data is used to:
✓ Check user's tier for feature access
✓ Display membership badge
✓ Refresh tokens when needed
✓ Map webhook updates to users
```

---

## 🔄 Update Cycle

```
┌──────────────────────────────────────────────────────────┐
│         HOW TIERS STAY IN SYNC                           │
└──────────────────────────────────────────────────────────┘

Initial Connection:
1. User authorizes
2. System reads current Patreon tier
3. Tier saved to Firebase
4. Features unlock immediately

Automatic Updates:
1. User changes tier on Patreon
2. Patreon sends webhook
3. Your Firebase function receives it
4. Tier updated in database
5. Next page load = new tier active

Manual Sync:
1. User clicks "Sync Membership"
2. System re-fetches from Patreon API
3. Tier updated if changed
4. Instant feedback to user

Real-time:
- Features check tier on every use
- Tier read from Firebase
- Changes apply on next page load
- No cache issues
```

---

## ✅ Testing Checklist

```
□ 1. Button Visible
    - Login to website
    - Open profile dropdown
    - See "Connect to Patreon" button

□ 2. Click Redirects
    - Click button
    - Redirect to patreon-link.html
    - Page loads correctly

□ 3. OAuth Flow
    - Click "Connect with Patreon"
    - Redirect to Patreon
    - Login (if needed)
    - See authorization request

□ 4. Authorization
    - Click "Allow"
    - Redirect back to website
    - See success message

□ 5. Tier Sync
    - Check tier is correct
    - See membership badge
    - Features unlock

□ 6. Database Check
    - Open Firebase Console
    - Check users/{userId}/membership
    - Verify tier and patreon data

□ 7. Webhook Test
    - Change tier on Patreon
    - Wait 1-2 minutes
    - Reload website
    - Verify tier updated

□ 8. Feature Gating
    - Try premium feature
    - Should work if tier allows
    - Should block if tier too low
```

---

## 🚨 Error Scenarios

```
┌──────────────────────────────────────────┐
│       WHAT HAPPENS WHEN...              │
└──────────────────────────────────────────┘

User cancels authorization:
→ Redirected with error parameter
→ Shows error message
→ No data saved
→ User can try again

Invalid Client ID:
→ Patreon shows error
→ Check patreon-config.js
→ Verify Client ID is correct

Network error during OAuth:
→ User sees error message
→ Can retry connection
→ No data corrupted

Webhook signature invalid:
→ Request rejected (security)
→ Logged in Firebase
→ Check webhook secret

Token expired:
→ Automatically refreshed
→ Using refresh token
→ Seamless to user
```

---

## 💡 Tips & Best Practices

1. **Test with a real Patreon subscription** first
2. **Use incognito mode** for clean testing
3. **Check Firebase logs** when debugging
4. **Keep webhook secret secure** - never commit to git
5. **Monitor webhook deliveries** in Patreon Portal
6. **Set up alerts** for failed function calls
7. **Document your tier prices** for team members
8. **Test all tier levels** (free, starter, scaling, business)
9. **Handle edge cases** (expired cards, failed payments)
10. **Provide clear error messages** to users

---

**Need Help?** Check `docs/setup/PATREON_COMPLETE_SETUP_GUIDE.md` for detailed instructions!
