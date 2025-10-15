# Testing Username Validation

## How to Test the New Feature

### 1. Access Settings Page
1. Make sure you're logged in to your account
2. Navigate to the Settings page (click Settings in navbar)
3. You should be on the "Account" tab by default

### 2. Test Real-time Validation

#### Test Short Username (< 3 chars)
1. Type "ab" in the Display Name field
2. **Expected**: Orange warning "⚠️ Username must be at least 3 characters"

#### Test Long Username (> 20 chars)
1. Type "thisusernameiswaytoolong123"
2. **Expected**: Orange warning "⚠️ Username must be 20 characters or less"

#### Test Invalid Characters
1. Type "user@name" or "user name" or "user!name"
2. **Expected**: Orange warning "⚠️ Only letters, numbers, hyphens, and underscores allowed"

#### Test Valid Format
1. Type a valid username like "test_user_123"
2. **Expected**: Gray message "🔍 Checking availability..."
3. After 500ms, should show either:
   - Green "✓ Username is available" (if not taken)
   - Red "❌ Username is already in use" (if taken by another user)
   - Gray "ℹ️ This is your current username" (if it's your current name)

### 3. Test Username Update

#### Test with Invalid Username
1. Enter an invalid username (e.g., "ab")
2. Click "Update Profile"
3. **Expected**: Red notification popup "Username must be at least 3 characters long"

#### Test with Taken Username
1. If you know another user's username, try to use it
2. Click "Update Profile"
3. **Expected**: Red notification popup "Username is already in use. Please choose a different one."

#### Test with Available Username
1. Enter a new, valid, available username (e.g., "newuser123")
2. Click "Update Profile"
3. **Expected**: 
   - Green notification popup "Profile updated successfully!"
   - Display name updates on page
   - Avatar letter updates
   - Navbar username updates

### 4. Test Case Insensitivity
1. If your username is "TestUser"
2. Try to change it to "testuser" (different case)
3. **Expected**: Gray message "ℹ️ This is your current username"
4. Try to use another user's username with different case
5. **Expected**: Red message "❌ Username is already in use"

### 5. Verify Database Updates
After successfully changing username, check Firebase Database:

```
users/{your-uid}/
  username: "yournewusername"

usernames/{your-uid}: "yournewusername"
```

Both locations should be updated with the new username.

## Test Scenarios Checklist

- [ ] Real-time validation shows for short usernames
- [ ] Real-time validation shows for long usernames
- [ ] Real-time validation shows for invalid characters
- [ ] Checking availability message appears
- [ ] Available username shows green checkmark
- [ ] Taken username shows red X
- [ ] Current username shows info message
- [ ] Cannot submit with validation errors
- [ ] Cannot use taken username
- [ ] Can successfully update to available username
- [ ] UI updates everywhere (avatar, navbar, display)
- [ ] Case-insensitive checking works
- [ ] Database updates in both locations
- [ ] Notification popups display correctly

## Common Issues

### "Error checking availability"
- Check Firebase connection
- Check database rules allow read access to `usernames`
- Check browser console for detailed errors

### Update button doesn't respond
- Check if you're logged in
- Check browser console for JavaScript errors
- Verify Firebase is initialized

### Username changes but UI doesn't update
- Check navbar elements are loaded
- Check `navbarElements` variable exists
- Try refreshing the page

## Browser Console Commands for Debugging

```javascript
// Check current user
console.log('Current user:', firebase.auth().currentUser);

// Check current username
firebase.auth().currentUser.displayName;

// Check usernames in database
firebase.database().ref('usernames').once('value').then(s => console.log(s.val()));

// Check your user data
firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(s => console.log(s.val()));
```
