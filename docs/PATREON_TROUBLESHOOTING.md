# 🔧 Patreon Integration - Troubleshooting Guide

## Quick Diagnostics

Run through this checklist first:

```bash
# 1. Check Firebase config
firebase functions:config:get

# 2. Check function logs
firebase functions:log --limit 50

# 3. Test webhook (if applicable)
# Check Patreon Developer Portal → Your App → Webhooks → Recent Deliveries
```

---

## Common Issues & Solutions

### 🚨 Issue 1: "redirect_uri_mismatch" Error

**Symptoms:**
- After clicking "Connect with Patreon", see error page
- Error says redirect URI doesn't match

**Causes:**
- Redirect URI in code doesn't match Patreon settings
- Missing trailing slash or extra parameters
- HTTP instead of HTTPS

**Solutions:**

1. **Check your patreon-config.js:**
   ```javascript
   // Should be exactly:
   get redirectUri() {
     return `${window.location.origin}/pages/patreon-link.html`;
   }
   ```

2. **Check Patreon Developer Portal:**
   - Go to https://www.patreon.com/portal/registration/register-clients
   - Click your app
   - Under "Redirect URIs", should have EXACTLY:
     ```
     https://yourdomain.com/pages/patreon-link.html
     ```
   - No trailing slash after .html
   - Must be HTTPS in production
   - Can add `http://localhost:3000/pages/patreon-link.html` for testing

3. **Test the exact URL:**
   ```javascript
   // In browser console on your site:
   console.log(window.location.origin + '/pages/patreon-link.html');
   // Should output: https://yourdomain.com/pages/patreon-link.html
   ```

4. **Save and try again**

---

### 🚨 Issue 2: "Patreon configuration missing" Error

**Symptoms:**
- Error when trying to complete OAuth
- Function returns configuration error
- Logs show "Patreon configuration missing"

**Solutions:**

1. **Check if config exists:**
   ```bash
   firebase functions:config:get
   ```

   Should show:
   ```json
   {
     "patreon": {
       "client_id": "your-id",
       "client_secret": "your-secret",
       "redirect_uri": "https://yourdomain.com/pages/patreon-link.html"
     }
   }
   ```

2. **If missing or incorrect, set it:**
   ```bash
   firebase functions:config:set \
     patreon.client_id="YOUR_CLIENT_ID" \
     patreon.client_secret="YOUR_CLIENT_SECRET" \
     patreon.redirect_uri="https://yourdomain.com/pages/patreon-link.html"
   ```

3. **Redeploy functions:**
   ```bash
   firebase deploy --only functions
   ```

4. **Wait 2-3 minutes** for deployment to complete

5. **Try OAuth again**

---

### 🚨 Issue 3: "Connect to Patreon" Button Not Visible

**Symptoms:**
- Button doesn't appear in dropdown
- Dropdown shows but button is missing

**Solutions:**

1. **Check if logged in:**
   - Button only shows when user is authenticated
   - Try logging out and back in

2. **Check browser console:**
   ```javascript
   // Should see:
   console.log(document.getElementById('btnConnectPatreon'));
   // If null, navbar didn't load
   ```

3. **Verify navbar loaded:**
   - Check that `components/navbar.html` is being loaded
   - Look for navbar in DOM inspector

4. **Check navbar-auth.js is loaded:**
   ```html
   <!-- In your page, should have: -->
   <script src="../js/navbar-auth.js"></script>
   ```

5. **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

### 🚨 Issue 4: Button Doesn't Do Anything When Clicked

**Symptoms:**
- Button visible but click does nothing
- No redirect happens
- No console errors

**Solutions:**

1. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Look for JavaScript errors

2. **Verify event listener attached:**
   ```javascript
   // In browser console:
   const btn = document.getElementById('btnConnectPatreon');
   console.log(btn, btn.onclick);
   // Should show button element
   ```

3. **Check if patreon-config.js loaded:**
   ```javascript
   // In browser console:
   console.log(typeof PATREON_CONFIG);
   // Should output: 'object'
   ```

4. **Verify Client ID is set:**
   ```javascript
   // In browser console:
   console.log(PATREON_CONFIG.clientId);
   // Should NOT be: 'YOUR_PATREON_CLIENT_ID'
   ```

5. **If still not working:**
   - Clear browser cache
   - Hard refresh
   - Try incognito mode

---

### 🚨 Issue 5: Redirects to Patreon but "Invalid Client" Error

**Symptoms:**
- Successfully redirects to Patreon
- Patreon shows "Invalid client" or similar error

**Solutions:**

1. **Verify Client ID in patreon-config.js:**
   ```javascript
   // js/patreon-config.js
   clientId: 'your-actual-client-id'  // Check this!
   ```

2. **Copy Client ID from Patreon:**
   - Go to https://www.patreon.com/portal/registration/register-clients
   - Click your app
   - Copy "Client ID" EXACTLY
   - No extra spaces or characters

3. **Update and deploy:**
   - Save `js/patreon-config.js`
   - Commit and push
   - Deploy website
   - Hard refresh browser

4. **Check the OAuth URL:**
   ```javascript
   // In browser console before clicking button:
   console.log(PATREON_CONFIG.authUrl);
   // Should show proper URL with your client_id
   ```

---

### 🚨 Issue 6: Redirects Back But Shows Error

**Symptoms:**
- OAuth completes, redirects back
- Error message shows on patreon-link.html
- Tier doesn't update

**Solutions:**

1. **Check URL parameters:**
   - Look at URL after redirect
   - Should have: `?code=XXXXXX`
   - If has `?error=...`, authorization was denied

2. **Check Firebase Function logs:**
   ```bash
   firebase functions:log --limit 20
   ```
   Look for errors in `patreonOAuthCallback`

3. **Common function errors:**

   **"Failed to get access token":**
   - Check Client Secret in Firebase config
   - Verify it matches Patreon Portal

   **"Network error":**
   - Check Firebase has billing enabled
   - Functions need Blaze plan for external API calls

   **"Invalid grant":**
   - Authorization code was used twice
   - Try OAuth flow again (get new code)

4. **Test manually:**
   ```bash
   # In Firebase Console → Functions → patreonOAuthCallback
   # Click "Test function" and provide:
   {
     "code": "test-code-from-url",
     "userId": "your-firebase-user-id"
   }
   ```

---

### 🚨 Issue 7: Tier Not Updating After Connection

**Symptoms:**
- OAuth completes successfully
- No errors shown
- But tier stays at "free"

**Solutions:**

1. **Check Firebase Database:**
   - Open Firebase Console → Database
   - Navigate to: `users/{userId}/membership/tier`
   - Is it set correctly?

2. **Check user actually has Patreon subscription:**
   - Verify subscription active on Patreon.com
   - Check subscription amount matches tier prices

3. **Check tier mapping logic:**
   ```javascript
   // In functions/index.js
   // Should be:
   if (dollarAmount >= 25) tier = "business";
   else if (dollarAmount >= 10) tier = "scaling";
   else if (dollarAmount >= 3) tier = "starter";
   else tier = "free";
   ```

4. **Verify Patreon API response:**
   - Check function logs for API response
   - Look for `currently_entitled_amount_cents`

5. **Try manual sync:**
   - Click "Sync Membership" button
   - Check if tier updates

---

### 🚨 Issue 8: Webhooks Not Working

**Symptoms:**
- User changes tier on Patreon
- Website tier doesn't update
- Need to manually sync

**Solutions:**

1. **Check webhook is configured:**
   - Patreon Portal → Your App → Webhooks
   - Should have webhook URL listed
   - Should have events selected

2. **Check webhook deliveries:**
   - In Patreon Portal → Webhooks
   - See "Recent Deliveries"
   - Click on one to see details

3. **Common webhook errors:**

   **"401 Unauthorized":**
   - Webhook signature verification failing
   - Check webhook secret in Firebase config:
     ```bash
     firebase functions:config:get patreon.webhook_secret
     ```
   - Should match secret in Patreon Portal

   **"500 Internal Server Error":**
   - Check Firebase function logs
   - Look for errors in `patreonWebhook` function

   **"Timeout":**
   - Function taking too long
   - Check for infinite loops
   - Optimize database operations

4. **Test webhook manually:**
   ```bash
   # Use curl or Postman:
   curl -X POST https://your-region-your-project.cloudfunctions.net/patreonWebhook \
     -H "Content-Type: application/json" \
     -H "X-Patreon-Event: members:pledge:update" \
     -H "X-Patreon-Signature: test-signature" \
     -d '{"data":{"type":"member","id":"123"}}'
   ```

5. **Set webhook secret if missing:**
   ```bash
   firebase functions:config:set patreon.webhook_secret="YOUR_SECRET"
   firebase deploy --only functions
   ```

---

### 🚨 Issue 9: Features Still Locked After Tier Update

**Symptoms:**
- Tier shows correct in database
- Tier badge displays correctly
- But features still locked

**Solutions:**

1. **Check feature gating logic:**
   ```javascript
   // Should use:
   const tier = await getUserMembershipTier(userId);
   const hasAccess = hasFeatureAccess(tier, 'starter');
   
   if (!hasAccess) {
     // Show locked message
     return;
   }
   ```

2. **Verify tier hierarchy:**
   ```javascript
   // In membership.js, should have:
   const TIER_LEVELS = {
     free: 0,
     starter: 1,
     scaling: 2,
     business: 3
   };
   ```

3. **Check if reading from correct database path:**
   ```javascript
   // Should read from:
   firebase.database().ref(`users/${userId}/membership/tier`)
   ```

4. **Try clearing browser cache:**
   - Old tier might be cached
   - Hard refresh: Cmd+Shift+R / Ctrl+Shift+R

5. **Check auth state:**
   ```javascript
   // In browser console:
   firebase.auth().currentUser
   // Should show user object with uid
   ```

---

### 🚨 Issue 10: "Client ID not configured" Warning

**Symptoms:**
- Console shows: "⚠️ Patreon Client ID not configured"
- Can't start OAuth flow

**Solutions:**

1. **Edit js/patreon-config.js:**
   ```javascript
   const PATREON_CONFIG = {
     clientId: 'paste-your-client-id-here',  // ← Change this line
     // ...
   };
   ```

2. **Get Client ID:**
   - Go to https://www.patreon.com/portal/registration/register-clients
   - Click your app
   - Copy "Client ID"

3. **Save and deploy:**
   - Save file
   - Deploy website
   - Hard refresh browser

---

## Debug Tools & Commands

### Check All Configurations:
```bash
# 1. Firebase config
firebase functions:config:get

# 2. Check if functions deployed
firebase functions:list

# 3. Recent function logs
firebase functions:log --limit 50

# 4. Specific function logs
firebase functions:log --only patreonOAuthCallback

# 5. Follow logs in real-time
firebase functions:log --tail
```

### Browser Console Checks:
```javascript
// 1. Check if button exists
console.log(document.getElementById('btnConnectPatreon'));

// 2. Check config loaded
console.log(PATREON_CONFIG);

// 3. Check auth state
console.log(firebase.auth().currentUser);

// 4. Check membership functions available
console.log(typeof getUserMembershipTier);

// 5. Check current tier
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const tier = await getUserMembershipTier(user.uid);
    console.log('Current tier:', tier);
  }
});
```

### Firebase Console Checks:
```
1. Database → users → {userId} → membership
   - Check tier value
   - Check patreon data

2. Functions → Logs
   - Recent errors
   - Execution times

3. Functions → Metrics
   - Invocation counts
   - Error rates
```

---

## Network Issues

### If external API calls fail:

1. **Check Firebase plan:**
   - Blaze (Pay-as-you-go) required for external APIs
   - Free plan blocks outbound requests

2. **Upgrade if needed:**
   - Firebase Console → Upgrade to Blaze plan
   - External APIs are usage-based

3. **Check billing:**
   - Make sure billing account is active
   - Check for any billing alerts

---

## Still Not Working?

### Systematic Debugging:

1. **Start fresh:**
   ```bash
   # Clear all config
   firebase functions:config:unset patreon
   
   # Set again carefully
   firebase functions:config:set \
     patreon.client_id="..." \
     patreon.client_secret="..." \
     patreon.redirect_uri="..."
   
   # Redeploy
   firebase deploy --only functions
   ```

2. **Test each component:**
   - ✅ Button visible? → navbar-auth.js
   - ✅ Button clickable? → Check console errors
   - ✅ Redirects to Patreon? → Check Client ID
   - ✅ Patreon auth works? → Check redirect URI
   - ✅ Callback fires? → Check function logs
   - ✅ Tier updates? → Check database

3. **Enable verbose logging:**
   ```javascript
   // Add to functions/index.js temporarily:
   console.log('OAuth code:', code);
   console.log('User ID:', userId);
   console.log('Token response:', tokenData);
   console.log('Identity data:', identityData);
   console.log('Calculated tier:', tier);
   ```

4. **Check Patreon API status:**
   - Visit https://www.patreon.com/platform/documentation/status
   - Check for any ongoing incidents

---

## Prevention Checklist

✅ Keep credentials secure (never commit secrets)  
✅ Use environment-specific configs  
✅ Monitor function logs regularly  
✅ Set up error alerting  
✅ Test in staging before production  
✅ Document any custom changes  
✅ Keep backup of working configuration  
✅ Update dependencies regularly  
✅ Test webhook deliveries monthly  
✅ Have rollback plan ready  

---

## Need More Help?

1. **Check official docs:**
   - Patreon API: https://docs.patreon.com/
   - Firebase Functions: https://firebase.google.com/docs/functions

2. **Check your detailed setup guide:**
   - `docs/setup/PATREON_COMPLETE_SETUP_GUIDE.md`

3. **Review implementation:**
   - `functions/index.js` - Backend logic
   - `js/patreon-config.js` - Frontend config
   - `js/membership.js` - Tier management

4. **Debug systematically:**
   - Follow error messages
   - Check logs at each step
   - Test one component at a time

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
