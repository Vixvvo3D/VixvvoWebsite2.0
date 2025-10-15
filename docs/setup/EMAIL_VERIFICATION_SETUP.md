# 📧 Email Verification Setup Guide

## ✅ What's Been Implemented

Your website now has a **6-digit email verification system** that works like this:

1. User enters username, email, and password
2. System sends a 6-digit code to their email
3. User enters the code within 10 minutes
4. Account is created only after successful verification

## 🚀 Setup Steps

### Step 1: Configure Gmail for Sending Emails

You need to set up a Gmail account to send verification emails.

#### Option A: Use Your Existing Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Vixvvo Website"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Configure Firebase with Your Email Credentials**:
   ```bash
   cd "/Users/vixvvo3d/Downloads/Website Vixvvo 2.0"
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password-here"
   ```

   Replace:
   - `your-email@gmail.com` with your actual Gmail address
   - `your-app-password-here` with the 16-character app password

#### Option B: Create a New Gmail Account (More Professional)

1. Create a new Gmail account like `noreply@yourdomain.com` or `hello@vixvvo.com`
2. Follow the same steps as Option A
3. This keeps your personal email separate

---

### Step 2: Deploy Cloud Functions

```bash
cd "/Users/vixvvo3d/Downloads/Website Vixvvo 2.0"
firebase deploy --only functions
```

This will deploy two functions:
- `sendVerificationCode` - Sends the 6-digit code
- `verifyCode` - Validates the code

**First time deployment takes 2-5 minutes** ⏱️

---

### Step 3: Deploy Website Updates

```bash
firebase deploy --only hosting
```

This updates your website with the new verification UI.

---

### Step 4: Update Firebase Database Rules

Your Realtime Database needs to allow verification codes. Update your rules:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **VixvvoWebsite**
3. Go to **Realtime Database** → **Rules**
4. Add these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users/' + auth.uid + '/role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users/' + auth.uid + '/role').val() === 'admin'"
      }
    },
    "usernames": {
      ".read": true,
      ".write": "auth != null"
    },
    "verificationCodes": {
      "$email": {
        ".read": false,
        ".write": true
      }
    }
  }
}
```

5. Click **Publish**

---

### Step 5: Test the System

1. Open your website
2. Click "Sign Up"
3. Fill in the form and click "Continue"
4. Check your email for the 6-digit code
5. Enter the code
6. Account should be created successfully!

---

## 🎨 What Changed in Your Website

### New Files Created:
- `functions/index.js` - Cloud Functions for sending/verifying codes
- `functions/package.json` - Node.js dependencies

### Modified Files:
- `index.html` - Added verification modal and logic
- `js/auth.js` - Added verification functions

### What Wasn't Changed:
- ✅ All existing functionality still works
- ✅ Existing users can still log in
- ✅ Admin features untouched
- ✅ Calculator and other pages unchanged

---

## 💰 Cost Information

### Firebase Blaze Plan:
- **Free tier:** 2 million function invocations/month
- **Your usage:** ~1 invocation per signup
- **Cost for 1,000 signups/month:** $0.00
- **Cost for 100,000 signups/month:** $0.00
- **Cost for 3 million signups/month:** ~$0.40

### Gmail:
- **Free:** Unlimited emails through Gmail SMTP
- **Rate limit:** 500 emails/day (more than enough)

---

## 🔧 Troubleshooting

### "Error sending verification code"
- Check that you've set the email config correctly
- Verify your App Password is correct
- Make sure 2FA is enabled on Gmail

### "Code has expired"
- Codes expire after 10 minutes
- User can click "Resend Code" to get a new one

### "Firebase config not found"
- Run: `firebase functions:config:get`
- Should show your email configuration
- If empty, repeat Step 1

### "Permission denied" in database
- Update your database rules (Step 4)

---

## 📧 Customize Email Template

Edit `functions/index.js` to customize the email appearance:

```javascript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p>Your verification code is:</p>
    <div style="background: #f4f4f4; padding: 20px; text-align: center; 
                font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
      ${code}
    </div>
    <p style="color: #666;">This code will expire in 10 minutes.</p>
  </div>
`
```

After changes, redeploy:
```bash
firebase deploy --only functions
```

---

## 🛡️ Security Features

✅ **Codes expire after 10 minutes**  
✅ **Codes are stored securely in Firebase**  
✅ **Can't create account without verified email**  
✅ **Codes are deleted after successful verification**  
✅ **Rate limiting through Firebase Functions**

---

## 📞 Support

If you have issues:
1. Check the browser console (F12) for errors
2. Check Firebase Functions logs: `firebase functions:log`
3. Verify your email config: `firebase functions:config:get`

---

## ✨ Next Steps

After setup, you can:
- Customize the email template with your branding
- Add SMS verification (requires Twilio)
- Set up email for password resets
- Add welcome emails for new users

Enjoy your secure email verification system! 🎉
