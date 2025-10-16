# 🚀 Complete Patreon Integration Setup Guide

This guide will walk you through setting up Patreon OAuth and webhooks for your website.

## 📋 Prerequisites

- A Patreon creator account
- Firebase project with Functions enabled
- Your website deployed and accessible

## ⏱️ Estimated Time: 30-45 minutes

---

## Part 1: Patreon Developer Portal Setup (15 minutes)

### Step 1: Create Patreon OAuth Client

1. **Go to Patreon Developer Portal**
   - Visit: https://www.patreon.com/portal/registration/register-clients
   - Log in with your Patreon creator account

2. **Click "Create Client"**

3. **Fill in the form:**
   - **App Name:** Your Website Name (e.g., "Vixvvo Tools")
   - **Description:** Brief description of your app
   - **App Category:** Choose the most relevant category
   - **Author or Owner Name:** Your name/company
   - **Privacy Policy URL:** Your privacy policy URL
   - **Terms of Service URL:** Your terms URL
   - **Icon URL:** Optional - URL to your logo (256x256px recommended)

4. **Set Redirect URIs:**
   ```
   https://yourdomain.com/pages/patreon-link.html
   http://localhost:3000/pages/patreon-link.html (for testing)
   ```
   **Important:** Must be HTTPS in production!

5. **Select Scopes:**
   - ✅ `identity` - Basic user info
   - ✅ `identity[email]` - User's email
   - ✅ `campaigns` - Your campaign info
   - ✅ `campaigns.members` - Access to member data

6. **Click "Create Client"**

7. **Save your credentials:**
   - **Client ID:** Copy this (it's safe to be public)
   - **Client Secret:** Copy this (KEEP SECRET!)
   
   ⚠️ Store these securely - you'll need them for the next steps!

---

## Part 2: Configure Your Website (10 minutes)

### Step 1: Update Patreon Config

1. **Open:** `js/patreon-config.js`

2. **Replace the Client ID:**
   ```javascript
   const PATREON_CONFIG = {
     clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',  // ← Paste your Client ID here
     // ... rest of config
   };
   ```

3. **Save the file**

### Step 2: Set Up Firebase Functions Config

1. **Open terminal** in your project directory

2. **Set Patreon credentials in Firebase:**
   ```bash
   firebase functions:config:set \
     patreon.client_id="YOUR_CLIENT_ID" \
     patreon.client_secret="YOUR_CLIENT_SECRET" \
     patreon.redirect_uri="https://yourdomain.com/pages/patreon-link.html"
   ```

   Replace:
   - `YOUR_CLIENT_ID` with your actual Client ID
   - `YOUR_CLIENT_SECRET` with your actual Client Secret
   - `yourdomain.com` with your actual domain

3. **Verify configuration:**
   ```bash
   firebase functions:config:get
   ```

   You should see:
   ```json
   {
     "patreon": {
       "client_id": "your-client-id",
       "client_secret": "your-client-secret",
       "redirect_uri": "https://yourdomain.com/pages/patreon-link.html"
     }
   }
   ```

---

## Part 3: Deploy Firebase Functions (5 minutes)

### Step 1: Deploy Functions

1. **Navigate to functions directory:**
   ```bash
   cd functions
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Go back to project root:**
   ```bash
   cd ..
   ```

4. **Deploy functions:**
   ```bash
   firebase deploy --only functions
   ```

   Wait for deployment to complete. You should see:
   ```
   ✔  functions[patreonOAuthCallback]: Successful...
   ✔  functions[patreonWebhook]: Successful...
   ```

5. **Copy the webhook URL** from the output:
   ```
   https://us-central1-your-project.cloudfunctions.net/patreonWebhook
   ```
   Save this - you'll need it in the next section!

---

## Part 4: Set Up Patreon Webhooks (10 minutes)

### Step 1: Configure Webhook

1. **Go back to Patreon Developer Portal:**
   - https://www.patreon.com/portal/registration/register-clients
   - Click on your app

2. **Scroll to "Webhooks" section**

3. **Click "Add Webhook"**

4. **Fill in webhook details:**
   - **Webhook URL:** 
     ```
     https://us-central1-your-project.cloudfunctions.net/patreonWebhook
     ```
     (Use the URL from your Firebase deploy output)
   
   - **Triggers:** Select these events:
     - ✅ `members:pledge:create` - New patron
     - ✅ `members:pledge:update` - Patron tier change
     - ✅ `members:pledge:delete` - Patron cancellation
     - ✅ `members:update` - Member info updated

5. **Click "Create Webhook"**

6. **Copy the Webhook Secret** that appears

### Step 2: Add Webhook Secret to Firebase

1. **In your terminal, run:**
   ```bash
   firebase functions:config:set patreon.webhook_secret="YOUR_WEBHOOK_SECRET"
   ```

2. **Redeploy functions:**
   ```bash
   firebase deploy --only functions
   ```

---

## Part 5: Set Up Patreon Membership Tiers

### Step 1: Create Tiers on Patreon

Make sure your Patreon tiers match these prices:

- **Starter Tier:** $3/month
- **Scaling Tier:** $10/month
- **Business Tier:** $25/month

The system automatically maps these amounts to the correct tier levels.

### Step 2: Verify Tier Mapping

The tier mapping in `functions/index.js` is:

```javascript
if (dollarAmount >= 25) {
  tier = "business";
} else if (dollarAmount >= 10) {
  tier = "scaling";
} else if (dollarAmount >= 3) {
  tier = "starter";
}
```

If your tier prices are different, update this logic accordingly.

---

## Part 6: Testing (10 minutes)

### Step 1: Test OAuth Flow

1. **Open your website** and log in
2. **Click on your profile dropdown** → "Connect to Patreon"
3. **You should be redirected** to Patreon authorization page
4. **Click "Allow"** to grant permissions
5. **You should be redirected back** to your website
6. **Check that your membership tier** is displayed correctly

### Step 2: Test Webhook (Optional)

1. **Make a test pledge** on Patreon (or have someone do it)
2. **Check Firebase Database** - the user's tier should update automatically
3. **Check Firebase Functions logs:**
   ```bash
   firebase functions:log
   ```
   You should see webhook events being processed

### Step 3: Test the Complete Flow

1. **New user signs up** on your website
2. **User clicks "Connect to Patreon"**
3. **User authorizes** your app on Patreon
4. **Membership tier syncs** automatically
5. **User can access** tier-specific features

---

## 🔒 Security Checklist

- ✅ Client Secret stored in Firebase config (not in code)
- ✅ Webhook Secret configured
- ✅ HTTPS enforced on production
- ✅ Redirect URI matches exactly
- ✅ Firebase Security Rules configured
- ✅ Functions only callable by authenticated users

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch" error

**Solution:** 
- Verify redirect URI in Patreon Developer Portal matches exactly
- Check for trailing slashes, http vs https
- Must be: `https://yourdomain.com/pages/patreon-link.html`

### Issue: "Patreon configuration missing" error

**Solution:**
```bash
# Check if config is set
firebase functions:config:get

# If missing, set it again
firebase functions:config:set \
  patreon.client_id="..." \
  patreon.client_secret="..." \
  patreon.redirect_uri="..."

# Redeploy
firebase deploy --only functions
```

### Issue: Webhooks not working

**Solution:**
- Check Firebase Functions logs: `firebase functions:log`
- Verify webhook URL is correct
- Check webhook secret is set: `firebase functions:config:get`
- Test webhook manually in Patreon Developer Portal

### Issue: Tier not updating

**Solution:**
- Check Firebase Database structure: `users/{userId}/membership/tier`
- Verify Patreon tier amounts match your code
- Check Functions logs for errors
- Try manually syncing: Click "Sync Membership" button

---

## 📊 Database Structure

After setup, your Firebase Realtime Database will have:

```json
{
  "users": {
    "{userId}": {
      "membership": {
        "tier": "scaling",
        "updatedAt": 1234567890,
        "patreon": {
          "patronId": "123456",
          "status": "active_patron",
          "lastSyncedAt": 1234567890
        }
      },
      "patreonConnection": {
        "patronId": "123456",
        "accessToken": "encrypted-token",
        "refreshToken": "encrypted-token",
        "linkedAt": 1234567890,
        "status": "connected"
      }
    }
  }
}
```

---

## 🎯 Quick Reference

### Important URLs

- **Patreon Developer Portal:** https://www.patreon.com/portal/registration/register-clients
- **Patreon API Docs:** https://docs.patreon.com/
- **Your Patreon Link Page:** https://yourdomain.com/pages/patreon-link.html

### Key Files

- `js/patreon-config.js` - Frontend config (Client ID)
- `functions/index.js` - Backend functions (OAuth, webhooks)
- `pages/patreon-link.html` - User-facing connection page
- `js/membership.js` - Membership management

### Firebase Commands

```bash
# View config
firebase functions:config:get

# Set config
firebase functions:config:set patreon.client_id="..."

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log

# Test locally
firebase emulators:start
```

---

## ✅ Setup Complete Checklist

Use this checklist to verify everything is set up:

- [ ] Patreon OAuth client created
- [ ] Client ID added to `js/patreon-config.js`
- [ ] Client Secret added to Firebase config
- [ ] Redirect URI configured in Patreon
- [ ] Firebase Functions deployed
- [ ] Webhook URL configured in Patreon
- [ ] Webhook Secret added to Firebase config
- [ ] Patreon tiers created ($3, $10, $25)
- [ ] Tested OAuth flow successfully
- [ ] Verified tier syncing works
- [ ] Checked Firebase Database structure

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Firebase Console** → Functions → Logs
2. **Check Browser Console** for JavaScript errors
3. **Verify all credentials** are set correctly
4. **Test with a fresh browser/incognito** mode
5. **Review Patreon API documentation** for updates

---

## 🎉 Next Steps

Once setup is complete:

1. **Test with real patrons** (or test pledges)
2. **Implement feature gating** for your tier-specific features
3. **Add tier badges** to your UI
4. **Monitor Firebase logs** for any issues
5. **Set up email notifications** for new patrons (optional)

---

**Setup Date:** _______________  
**Tested By:** _______________  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

