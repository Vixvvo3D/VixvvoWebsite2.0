# Model Upload Tracking & Admin Panel

## 🔍 How File Tracking Works

### Storage Organization
Every uploaded file is automatically organized by user:

```
Firebase Storage:
models/
  └── {user-id}/
      ├── {timestamp}_filename.stl
      ├── {timestamp}_filename.obj
      └── ...
```

### Database Metadata
Every upload also creates a database entry:

```json
Realtime Database:
models/
  └── {user-id}/
      └── {model-id}/
          ├── name: "My Model"
          ├── fileName: "model.stl"
          ├── fileSize: 1234567
          ├── fileType: "application/octet-stream"
          ├── downloadURL: "https://..."
          ├── storagePath: "models/{user-id}/..."
          ├── uploadedAt: 1760538944945
          └── userId: "{user-id}"
```

## 👨‍💼 Admin Panel

### Access the Admin Panel
**URL**: https://vixvvowebsite.web.app/pages/model-admin.html

### Who Can Access?
Only users with `role: 'admin'` in the database can view this page.

### What You Can See:

1. **Dashboard Statistics**
   - Total number of users with uploads
   - Total number of models uploaded
   - Total storage used
   - Time of latest upload

2. **Complete Upload History**
   - User email/username
   - User ID (for reference)
   - Model name
   - Original filename
   - File size
   - Upload date and time
   - Download button

3. **All Users' Uploads**
   - See models from ALL users in one place
   - Sorted by upload date (newest first)
   - Easy to identify who uploaded what

## 🔐 Security & Privacy

### User Privacy
- Regular users can ONLY see their own uploads
- Users cannot access other users' files
- Each user's uploads are in their own isolated folder

### Admin Access
- Admins can see ALL uploads across all users
- Admins can download any file
- Admins can see who uploaded what and when

### Firebase Rules (Already Deployed)

**Storage Rules:**
```
match /models/{userId}/{allPaths=**} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
  allow delete: if request.auth.uid == userId;
}
```

**Database Rules:**
```json
"models": {
  "$uid": {
    ".read": "auth.uid == $uid",
    ".write": "auth.uid == $uid"
  }
}
```

## 📊 Tracking Information Stored

For each upload, the system tracks:

1. **User Information**
   - User ID (Firebase Auth UID)
   - User email (from database lookup)

2. **File Information**
   - Custom model name (user-provided)
   - Original filename
   - File size (bytes)
   - File type/MIME type
   - Storage path

3. **Timestamps**
   - Upload date and time
   - Server timestamp

4. **URLs**
   - Direct download URL
   - Storage path for deletion

## 🎯 Use Cases

### For You (Admin):
1. **Monitor Storage Usage** - See total storage across all users
2. **Track User Activity** - See who's uploading models
3. **Content Moderation** - Review uploaded files if needed
4. **Support** - Help users locate their files
5. **Analytics** - Understand usage patterns

### For Users:
1. **Portfolio** - Track all their uploaded models
2. **Version Control** - Upload multiple versions
3. **Backup** - Store models securely in cloud
4. **Sharing** - Download and share with others

## 📋 How to Make Someone Admin

To give yourself or another user admin access:

1. Go to Firebase Console: https://console.firebase.google.com/project/vixvvowebsite/database
2. Navigate to: `users/{user-id}`
3. Add field: `role: "admin"`

Or use Firebase CLI:
```bash
# You'll need the user's UID
firebase database:set /users/{USER_UID}/role -d "admin"
```

## 🔎 Finding User IDs in Storage

If you browse Firebase Storage bucket directly:
- Each folder name = User's Firebase Auth UID
- Files inside = That user's uploads
- Timestamp prefix = When uploaded (Unix timestamp)

Example:
```
models/
  OWN56n8xxfV8XEM8XJcsGhATwCv1/
    1760538944945_Logo_Barber.stl
```
- `OWN56n8xxfV8XEM8XJcsGhATwCv1` = User ID
- `1760538944945` = Upload timestamp (Oct 15, 2025)
- `Logo_Barber.stl` = Original filename

## 📱 Access Points

1. **User Upload Page**
   - https://vixvvowebsite.web.app/pages/upload-model.html
   - Available in dropdown menu → "Upload Model"

2. **Admin Panel**
   - https://vixvvowebsite.web.app/pages/model-admin.html
   - Admin-only access

---

**Everything is tracked, organized, and secure!** ✅
