# 🎨 Patreon Integration Guide

Complete guide to setting up and using Patreon integration for automatic membership management.

## Overview

This system automatically syncs membership tiers between Patreon and your website:
- **Bronze** (Free) - Default tier, no Patreon required
- **Silver** ($3/month) - Entry tier with extra features
- **Gold** ($10/month) - Mid-tier with advanced features  
- **Platinum** ($25/month) - Premium tier with all features

## Features

✅ **OAuth Authentication** - Users link their Patreon account securely  
✅ **Webhook Integration** - Automatic updates when membership changes  
✅ **Manual Sync** - Users can manually sync their membership status  
✅ **Tier Mapping** - Automatic mapping from Patreon $ amounts to tiers  
✅ **Feature Gating** - Control access to features based on membership level

---

## Setup Instructions

### 1. Create Patreon Creator Account

1. Go to [Patreon.com](https://www.patreon.com) and create a creator account
2. Set up your membership tiers:
   - **$3/month** - Silver tier
   - **$10/month** - Gold tier
   - **$25/month** - Platinum tier

### 2. Register Your Application

1. Go to [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients)
2. Click "Create Client"
3. Fill in details:
   - **App Name**: Vixvvo Website
   - **Description**: Membership management for Vixvvo
   - **App Category**: Creator tools
   - **Redirect URIs**: 
     ```
     https://your-domain.com/pages/patreon-link.html
     http://localhost:8000/pages/patreon-link.html
     ```
   - **Client API Version**: 2

4. Save and note down:
   - **Client ID**
   - **Client Secret**

### 3. Configure Firebase Functions

Set the Patreon configuration in Firebase:

```bash
cd functions

# Set Patreon OAuth credentials
firebase functions:config:set \
  patreon.client_id="YOUR_CLIENT_ID" \
  patreon.client_secret="YOUR_CLIENT_SECRET" \
  patreon.redirect_uri="https://your-domain.com/pages/patreon-link.html"

# Set webhook secret (generate a random string)
firebase functions:config:set \
  patreon.webhook_secret="YOUR_RANDOM_SECRET_KEY"
```

To generate a secure webhook secret:
```bash
openssl rand -hex 32
```

### 4. Update Patreon Client ID in Frontend

Edit `/pages/patreon-link.html` and replace the Client ID:

```javascript
const clientId = 'YOUR_PATREON_CLIENT_ID'; // Line ~350
```

### 5. Install Dependencies and Deploy

```bash
cd functions
npm install
cd ..

# Deploy functions
firebase deploy --only functions
```

### 6. Set Up Patreon Webhook

1. In Patreon Developer Portal, go to your app
2. Click "Add Webhook"
3. Configure:
   - **Webhook URL**: `https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/patreonWebhook`
   - **Triggers**: Select all member events:
     - `members:pledge:create`
     - `members:pledge:update`
     - `members:pledge:delete`
   - **Secret**: Use the webhook secret you set in step 3

4. Test the webhook using Patreon's test feature

### 7. Update Patreon Tier Mapping (Optional)

If you want to use Patreon's tier IDs instead of dollar amounts, edit `/functions/index.js`:

```javascript
const PATREON_TIER_MAPPING = {
  "YOUR_PATREON_TIER_ID_1": "silver",  // $3 tier
  "YOUR_PATREON_TIER_ID_2": "gold",    // $10 tier
  "YOUR_PATREON_TIER_ID_3": "platinum" // $25 tier
};
```

To get your tier IDs:
1. Use Patreon API to fetch your campaign tiers
2. Or check webhook payloads for tier IDs

---

## Database Structure

User data is stored in Firebase Realtime Database:

```
users/
  {userId}/
    membership/
      tier: "silver" | "gold" | "platinum" | "bronze"
      updatedAt: timestamp
      patreon/
        patronId: "patreon-user-id"
        tierId: "patreon-tier-id"
        status: "active_patron" | "former_patron"
        amountCents: 300  # $3.00
        lastSyncedAt: timestamp
    
    patreonConnection/
      patronId: "patreon-user-id"
      accessToken: "encrypted-token"
      refreshToken: "encrypted-refresh-token"
      linkedAt: timestamp
      status: "connected"
```

---

## Usage

### For Users

1. **Link Patreon Account**:
   - Go to `/pages/patreon-link.html`
   - Click "Connect with Patreon"
   - Authorize the connection
   - Membership tier auto-updates

2. **Sync Membership**:
   - Click "Sync Membership" button
   - System checks current Patreon status
   - Updates tier if changed

3. **Unlink Account**:
   - Click "Unlink Patreon Account"
   - Membership resets to Bronze

### For Developers

#### Check User's Membership Tier

```javascript
// Get user's tier
const tier = await getUserMembershipTier(userId);

// Check if user has access to feature
if (hasFeatureAccess(tier, 'gold')) {
  // User has Gold or higher
  enablePremiumFeature();
} else {
  showFeatureLockedMessage('gold');
}
```

#### Gate Features

```javascript
// Example: Export to PDF (requires Silver)
async function exportToPDF() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  
  if (!hasFeatureAccess(tier, 'silver')) {
    showFeatureLockedMessage('silver');
    return;
  }
  
  // Proceed with export
  // ...
}
```

#### Display Membership Badge

```javascript
// Show badge in navbar or profile
const user = firebase.auth().currentUser;
const tier = await getUserMembershipTier(user.uid);
const badgeContainer = document.getElementById('membershipBadge');

displayMembershipBadge(tier, badgeContainer);
```

---

## Feature Restrictions by Tier

### Bronze (Free)
- ✅ Full calculator access
- ✅ Save calculations
- ✅ Basic printer management
- ✅ Public view of printers
- ❌ Community support only
- ❌ Standard features

### Silver ($3/month)
- ✅ Everything in Bronze
- ✅ Priority support
- ✅ Advanced analytics
- ✅ Export to PDF
- ✅ Remove ads
- ✅ Silver badge

### Gold ($10/month)
- ✅ Everything in Silver
- ✅ Custom branding
- ✅ Early access to features
- ✅ Advanced presets
- ✅ Priority feature requests
- ✅ Gold badge

### Platinum ($25/month)
- ✅ Everything in Gold
- ✅ API access
- ✅ White-label solution
- ✅ Custom integrations
- ✅ Dedicated support
- ✅ Platinum badge

---

## Webhook Events

The system handles these Patreon webhook events:

### `members:pledge:create`
- New member subscribes
- Creates membership record
- Sets appropriate tier

### `members:pledge:update`
- Member upgrades/downgrades tier
- Member changes payment method
- Updates tier based on new amount

### `members:pledge:delete`
- Member cancels subscription
- Resets to Bronze tier
- Marks as former patron

---

## Testing

### Test OAuth Flow

1. Use test mode in Patreon Developer Portal
2. Create test creator account
3. Test linking account:
   ```
   http://localhost:8000/pages/patreon-link.html
   ```

### Test Webhooks

1. Use Patreon's webhook testing tool
2. Send test events:
   - Create member
   - Update member
   - Delete member

3. Check Firebase Database for updates

### Test Feature Gating

```javascript
// Manually set tier for testing
await firebase.database()
  .ref(`users/${userId}/membership/tier`)
  .set('platinum');

// Test feature access
const tier = await getUserMembershipTier(userId);
console.log('Has Gold access:', hasFeatureAccess(tier, 'gold')); // true
```

---

## Security Considerations

### Access Tokens
- Tokens are stored in Firebase (secure)
- Use Firebase Security Rules to protect:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "patreonConnection": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "membership": {
          ".read": "$uid === auth.uid",
          ".write": false  // Only Cloud Functions can write
        }
      }
    }
  }
}
```

### Webhook Verification
- Always verify webhook signatures
- Use secure webhook secret
- Validate payload structure

### Client-Side Security
- Never trust client-side tier checks for critical features
- Always verify tier server-side for API calls
- Use Firebase Security Rules for data access

---

## Troubleshooting

### "Failed to link Patreon account"
- Check Client ID and Secret are correct
- Verify redirect URI matches exactly
- Check Firebase Functions logs

### Membership not updating
- Check webhook is configured correctly
- Verify webhook secret matches
- Check Firebase Functions logs for errors
- Manually sync using "Sync Membership" button

### Tier not matching Patreon
- Verify tier mapping in `functions/index.js`
- Check Patreon API response in logs
- Manually sync membership

### OAuth redirect not working
- Check redirect URI in Patreon settings
- Verify HTTPS is enabled (required for production)
- Check browser console for errors

---

## API Reference

### Cloud Functions

#### `patreonOAuthCallback`
Exchange OAuth code for access token and set up user.

**Parameters:**
- `code` (string): OAuth authorization code
- `userId` (string): Firebase user ID

**Returns:**
```javascript
{
  success: true,
  tier: "silver",
  message: "Patreon account linked successfully"
}
```

#### `patreonWebhook`
Handle Patreon webhook events (HTTP endpoint).

**URL:** `https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/patreonWebhook`

#### `syncPatreonMembership`
Manually sync user's membership with Patreon.

**Parameters:**
- `userId` (string): Firebase user ID

**Returns:**
```javascript
{
  success: true,
  tier: "gold",
  message: "Membership synced successfully"
}
```

### Frontend Functions

See `/js/membership.js` for complete function reference.

---

## Roadmap

Future enhancements:
- [ ] Scheduled daily sync for all users
- [ ] Membership history tracking
- [ ] Grace period for cancelled subscriptions
- [ ] Lifetime membership option
- [ ] Analytics dashboard for membership metrics
- [ ] Email notifications for tier changes

---

## Support

For issues or questions:
1. Check Firebase Functions logs
2. Check browser console
3. Review webhook delivery logs in Patreon
4. Contact support with logs and error messages

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
