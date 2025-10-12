# 🚀 Quick Setup (3 Commands)

## Prerequisites
- Gmail account with 2FA enabled
- App Password generated from Google Account settings
- Firebase Blaze plan enabled

## Setup Commands

```bash
# 1. Configure email (replace with your credentials)
firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-16-char-app-password"

# 2. Deploy Cloud Functions
firebase deploy --only functions

# 3. Deploy website
firebase deploy --only hosting
```

## Or Use the Automated Script

```bash
./setup-email-verification.sh
```

## Update Database Rules

Go to Firebase Console → Realtime Database → Rules, add:

```json
"verificationCodes": {
  "$email": {
    ".read": false,
    ".write": true
  }
}
```

## Test It

1. Visit your website
2. Click "Sign Up"
3. Fill form → Check email for code
4. Enter code → Account created!

## Troubleshooting

```bash
# View your config
firebase functions:config:get

# View function logs
firebase functions:log

# Test locally (requires Firebase emulator)
firebase emulators:start
```

## How It Works

```
User Signs Up
    ↓
Enter username, email, password
    ↓
System sends 6-digit code to email
    ↓
User enters code (10-minute timeout)
    ↓
Code verified → Account created
```

## Cost: $0 for most websites

- Free up to 2 million function calls/month
- 1,000 signups = $0.00
- 100,000 signups = $0.00
- Gmail = Free (500 emails/day limit)

## Security Features

✅ Codes expire in 10 minutes  
✅ Stored securely in Firebase  
✅ Deleted after verification  
✅ Can't create account without verified email  

## Full Documentation

See `EMAIL_VERIFICATION_SETUP.md` for detailed instructions.
