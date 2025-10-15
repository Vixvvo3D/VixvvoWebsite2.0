# Upload Model Page Documentation

## Overview
The Upload Model page allows users to upload, manage, and download their 3D model files. It includes drag-and-drop functionality, progress tracking, and a clean interface to view all uploaded models.

## Features

### ✅ File Upload
- **Drag & Drop Support**: Users can drag files directly onto the upload area
- **Click to Upload**: Click the upload area to browse for files
- **Supported Formats**: .obj, .fbx, .gltf, .glb, .blend, .stl, .dae, .3ds, .max, .ma, .mb
- **Progress Tracking**: Real-time upload progress bar
- **File Preview**: Shows selected file name and size before upload
- **Custom Naming**: Users can provide custom names for their models

### 📦 Model Management
- **Model List**: Grid display of all uploaded models
- **Model Information**: 
  - Model name
  - Original filename
  - File size
  - Upload date and time
- **Download**: Download any uploaded model with one click
- **Delete**: Remove models with confirmation dialog
- **Real-time Updates**: Models list updates immediately after upload/delete

### 🔐 Security
- **Authentication Required**: Users must be logged in to upload/view models
- **User Isolation**: Each user can only see and manage their own models
- **Firebase Storage Rules**: Enforces user-based access control
- **Firebase Database Rules**: Protects metadata from unauthorized access

## File Structure

### Page Location
- **Path**: `/pages/upload-model.html`
- **Type**: Full-featured page with navbar and authentication

### Dependencies
- Firebase App SDK
- Firebase Auth SDK
- Firebase Database SDK
- **Firebase Storage SDK** (for file upload/download)
- Firebase Functions SDK
- Navbar system (navbar-loader, navbar-helper, navbar-auth, settings-dropdown)
- Shared styles

### Firebase Structure

#### Storage Path
```
models/
  {userId}/
    {timestamp}_{filename}
```

#### Database Path
```
models/
  {userId}/
    {modelId}/
      name: "Model Name"
      fileName: "original-file.obj"
      fileSize: 1234567
      fileType: "application/octet-stream"
      downloadURL: "https://..."
      storagePath: "models/userId/..."
      uploadedAt: 1234567890
      userId: "user123"
```

## Navigation

### Navbar Links
The page is accessible from:
1. **Main Navigation**: "Upload Model" link in navbar
2. **Settings Dropdown**: Quick link in dropdown menu

### Updated Files
- `/components/navbar.html` - Added "Upload Model" link
- Navigation bar automatically adjusts paths based on page location

## Firebase Rules

### Database Rules
```json
"models": {
  "$uid": {
    ".read": "auth != null && auth.uid == $uid",
    ".write": "auth != null && auth.uid == $uid"
  }
}
```

### Storage Rules
```
match /models/{userId}/{allPaths=**} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
  allow delete: if request.auth != null && request.auth.uid == userId;
}
```

## User Experience

### For Logged-In Users
1. Page loads with upload area and empty models list
2. User selects or drags file
3. File info is displayed with optional name input
4. Click "Upload Model" button
5. Progress bar shows upload status
6. On completion, model appears in the list below
7. Users can download or delete their models anytime

### For Guest Users
- Upload section is visible but requires login
- Models section shows login prompt
- Notification appears: "Please login to upload and manage models"

## Notifications

The page uses the standard notification system:
- ✅ **Success**: Upload complete, download started, model deleted
- ❌ **Error**: Upload failed, delete failed, network errors
- ⚠️ **Warning**: Login required, no file selected
- ℹ️ **Info**: General information messages

## Deployment

### Deploy Database Rules
```bash
firebase deploy --only database
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Deploy Full Site
```bash
firebase deploy
```

Or use the provided script:
```bash
./scripts/deploy.sh
```

## Technical Details

### File Upload Process
1. User selects file via click or drag-drop
2. File is validated and info displayed
3. User clicks upload button
4. File is uploaded to Firebase Storage with progress tracking
5. Once upload completes, get download URL
6. Save metadata to Firebase Realtime Database
7. Refresh models list
8. Reset upload form

### Download Process
1. User clicks download button on a model card
2. Creates temporary anchor element with download URL
3. Triggers download via click event
4. Removes temporary element
5. Shows success notification

### Delete Process
1. User clicks delete button
2. Confirmation dialog appears
3. If confirmed:
   - Delete file from Firebase Storage
   - Delete metadata from Database
   - Refresh models list
   - Show success notification

## Styling

The page uses:
- **Gradient backgrounds** for cards and sections
- **Purple theme** consistent with site design
- **Responsive grid** for models display
- **Hover effects** for interactive elements
- **Mobile-friendly** layout with responsive breakpoints

## Future Enhancements

Potential additions:
- Model preview/thumbnail generation
- File type filtering
- Search and sort functionality
- Bulk operations (delete multiple)
- Model sharing with other users
- Model categories/tags
- Storage quota display
- Compression for large files

## Testing Checklist

- ✅ Navbar loads correctly
- ✅ Authentication state syncs
- ✅ Upload area accepts files via click
- ✅ Drag and drop functionality works
- ✅ Progress bar shows during upload
- ✅ Models list loads user's models
- ✅ Download button downloads files
- ✅ Delete button removes models (with confirmation)
- ✅ Notifications display correctly
- ✅ Responsive on mobile devices
- ✅ Firebase rules enforce security

## Support

For issues or questions:
1. Check Firebase console for errors
2. Verify Firebase Storage is enabled in project
3. Ensure storage rules are deployed
4. Check browser console for JavaScript errors
5. Verify user is logged in with valid authentication

---

**Created**: October 15, 2025  
**Version**: 1.0  
**Status**: ✅ Complete and functional
