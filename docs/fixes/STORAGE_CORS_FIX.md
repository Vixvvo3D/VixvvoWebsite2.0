# Firebase Storage CORS Fix

## Issue
Getting CORS errors when uploading files to Firebase Storage from localhost (127.0.0.1:5501).

## Solutions

### Solution 1: Configure CORS via Google Cloud Console (Recommended)

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project vixvvowebsite
   ```

3. **Apply CORS Configuration**:
   ```bash
   gsutil cors set cors.json gs://vixvvowebsite.appspot.com
   ```

### Solution 2: Configure CORS via Google Cloud Console (No CLI needed)

1. Go to: https://console.cloud.google.com/storage/browser?project=vixvvowebsite

2. Click on the bucket: **vixvvowebsite.appspot.com**

3. Click the **"Permissions"** tab

4. Click **"Edit CORS configuration"**

5. Add this configuration:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
     }
   ]
   ```

6. Click **"Save"**

### Solution 3: Test with Firebase Hosting (Recommended for Production)

CORS issues often don't occur when using Firebase Hosting. Deploy your site and test:

```bash
firebase deploy --only hosting
```

Then access your site via: `https://vixvvowebsite.web.app/pages/upload-model.html`

### Solution 4: Wait and Retry

Sometimes Firebase Storage needs a few minutes after initial setup to propagate settings. Wait 5-10 minutes and try again.

### Solution 5: Use VS Code Live Server with Different Port

The issue might be specific to the port. Try:
1. Stop current Live Server
2. Change port in VS Code settings
3. Restart and try again

## Temporary Workaround

While setting up CORS, you can test the page using Firebase Hosting:

```bash
cd "/Users/vixvvo3d/Downloads/Website Vixvvo 2.0"
firebase serve
```

Then open: `http://localhost:5000/pages/upload-model.html`

## Verify CORS is Set

After applying CORS, verify it's working:

```bash
gsutil cors get gs://vixvvowebsite.appspot.com
```

## Production Note

For production (when deployed to Firebase Hosting), CORS typically works automatically because the origin matches your Firebase domain.

---

**Recommended Next Steps:**
1. Try Solution 2 (Cloud Console - easiest, no CLI needed)
2. Or deploy to Firebase Hosting and test there
3. Storage usually works perfectly once CORS is configured
