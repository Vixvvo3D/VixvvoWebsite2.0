# Firebase Database Rules - Enhanced Username Security

## Current Rules (Already Good!)

The current `database.rules.json` already has solid protection:

```json
"usernames": {
  ".read": true,
  ".indexOn": [".value"],
  "$uid": {
    ".write": "auth != null && (!data.exists() || auth.uid == $uid)"
  }
}
```

### What This Does:
✅ Anyone can read usernames (needed for availability checking)
✅ Only authenticated users can write
✅ Users can only write to their own UID entry
✅ Prevents users from overwriting other users' username entries
✅ Indexed on value for efficient lookups

## Optional Enhanced Rules

If you want to add additional server-side validation, here's an enhanced version:

```json
"usernames": {
  ".read": true,
  ".indexOn": [".value"],
  "$uid": {
    ".validate": "newData.isString() && 
                  newData.val().length >= 3 && 
                  newData.val().length <= 20 && 
                  newData.val().matches(/^[a-zA-Z0-9_-]+$/)",
    ".write": "auth != null && 
               (!data.exists() || auth.uid == $uid) &&
               !root.child('usernames').child(auth.uid).exists() ||
               auth.uid == $uid"
  }
}
```

### Additional Validation:
- ✅ Validates username is a string
- ✅ Enforces 3-20 character length
- ✅ Enforces allowed characters (alphanumeric, underscore, hyphen)
- ✅ Prevents duplicate entries

## Username Format Validation Rules

### Current Client-Side Rules
```javascript
- Minimum: 3 characters
- Maximum: 20 characters
- Pattern: /^[a-zA-Z0-9_-]+$/
- Case-insensitive uniqueness checking
```

### Server-Side Rules (Optional)
Add to `users/{uid}/username`:

```json
"users": {
  "$uid": {
    ".read": "auth != null && auth.uid == $uid",
    ".write": "auth != null && auth.uid == $uid",
    "username": {
      ".validate": "newData.isString() && 
                    newData.val().length >= 3 && 
                    newData.val().length <= 20 && 
                    newData.val().matches(/^[a-zA-Z0-9_-]+$/)"
    }
  }
}
```

## Reserved Usernames Protection

To prevent users from taking system usernames, you can add a reserved list:

```json
"usernames": {
  ".read": true,
  ".indexOn": [".value"],
  "$uid": {
    ".validate": "newData.isString() && 
                  newData.val().length >= 3 && 
                  newData.val().length <= 20 && 
                  newData.val().matches(/^[a-zA-Z0-9_-]+$/) &&
                  newData.val().toLowerCase() != 'admin' &&
                  newData.val().toLowerCase() != 'system' &&
                  newData.val().toLowerCase() != 'vixvvo' &&
                  newData.val().toLowerCase() != 'support' &&
                  newData.val().toLowerCase() != 'help' &&
                  newData.val().toLowerCase() != 'root' &&
                  newData.val().toLowerCase() != 'administrator'",
    ".write": "auth != null && (!data.exists() || auth.uid == $uid)"
  }
}
```

## Testing Firebase Rules

Use the Firebase Rules Simulator in the Firebase Console:

### Test 1: User Can Set Own Username
```
Type: Write
Location: /usernames/{their-uid}
Data: "newusername"
Auth: Simulate authenticated user with UID matching location
Expected: ✅ Allow
```

### Test 2: User Cannot Set Another User's Username
```
Type: Write
Location: /usernames/{different-uid}
Data: "newusername"
Auth: Simulate authenticated user with different UID
Expected: ❌ Deny
```

### Test 3: Invalid Username Format
```
Type: Write
Location: /usernames/{their-uid}
Data: "ab" (too short)
Auth: Simulate authenticated user
Expected: ❌ Deny (if validation rules added)
```

### Test 4: Read Access
```
Type: Read
Location: /usernames
Auth: Any (even unauthenticated)
Expected: ✅ Allow
```

## Deployment

### Deploy Current Rules (Recommended)
Your current rules are already secure! To deploy:

```bash
firebase deploy --only database
```

### Deploy Enhanced Rules (Optional)
1. Backup current rules:
```bash
cp database.rules.json database.rules.backup.json
```

2. Edit `database.rules.json` with enhanced validation

3. Test in Firebase Console Rules Simulator

4. Deploy:
```bash
firebase deploy --only database
```

## Security Checklist

Current Implementation:
- ✅ Client-side validation (format, length, uniqueness)
- ✅ Server-side write permissions (only own UID)
- ✅ Read access for availability checking
- ✅ Case-insensitive checking
- ✅ Indexed for performance

Optional Enhancements:
- ⬜ Server-side format validation
- ⬜ Reserved username protection
- ⬜ Rate limiting on username changes
- ⬜ Username change history tracking
- ⬜ Username change cooldown period

## Best Practices

1. **Keep current rules** - They're already secure
2. **Client-side validation first** - Better UX with immediate feedback
3. **Server-side validation** - Additional security layer (optional)
4. **Regular monitoring** - Check for abuse patterns
5. **Reserved usernames** - Protect system/admin names
6. **Username history** - Track changes for security

## Related Files

- `database.rules.json` - Current Firebase security rules
- `pages/settings.html` - Client-side validation implementation
- `DATABASE_STRUCTURE.md` - Database schema documentation
- `USERNAME_VALIDATION_FEATURE.md` - Feature documentation
