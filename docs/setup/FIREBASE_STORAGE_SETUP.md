# Firebase Storage Setup Guide

## ⚠️ Required: Enable Firebase Storage

Firebase Storage needs to be enabled in your Firebase Console before the Upload Model page can work.

## 🚀 Quick Setup Steps

### Step 1: Enable Firebase Storage

1. Go to your Firebase Console: https://console.firebase.google.com/project/vixvvowebsite/storage

2. Click **"Get Started"** button

3. Choose **Start in production mode** (we have custom rules already)

4. Click **"Done"**

### Step 2: Deploy Storage Rules

Once Storage is enabled, deploy the security rules:

```bash
cd "/Users/vixvvo3d/Downloads/Website Vixvvo 2.0"
firebase deploy --only storage
```

Or use the full deploy script:

```bash
./scripts/deploy.sh
```

### Step 3: Verify Rules

The storage rules are already configured in `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Models folder - users can only access their own models
    match /models/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## ✅ What These Rules Do

- **User Isolation**: Each user can only access files in their own folder (`models/{their-uid}/`)
- **Authentication Required**: Users must be logged in to upload/download
- **Full Control**: Users can read, write, and delete their own files
- **Security**: No access to other users' files
- **Default Deny**: All other storage paths are locked down

## 📋 Current Status

- ✅ **Database Rules**: Deployed and working
- ⏳ **Storage Rules**: Waiting for Storage to be enabled
- ✅ **Upload Model Page**: Created and ready
- ✅ **Navigation**: Added to dropdown menu

## 🔧 After Enabling Storage

Once you enable Storage and deploy the rules, the Upload Model page will:

1. ✅ Allow file uploads (drag & drop or click)
2. ✅ Show upload progress
3. ✅ Store files securely in Firebase Storage
4. ✅ Save metadata in Realtime Database
5. ✅ Display uploaded models in a grid
6. ✅ Enable file downloads
7. ✅ Allow file deletion with confirmation

## 🆘 Troubleshooting

### "Client doesn't have permission" Error
- **Cause**: Database rules deployed, but Storage not enabled
- **Solution**: Enable Storage in Firebase Console first

### "Storage is not defined" Error
- **Cause**: Storage SDK not loaded or Storage not initialized
- **Solution**: Ensure Firebase Storage is enabled and page is reloaded

### "Missing required API" Error
- **Cause**: Storage API not enabled
- **Solution**: Firebase will auto-enable it when you click "Get Started"

## 📞 Need Help?

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify you're logged into the correct Firebase project
3. Ensure billing is enabled (required for Storage)
4. Check browser console for specific error messages

---

**Next Step**: Click the link above to enable Firebase Storage, then deploy the storage rules!
