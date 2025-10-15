# Firebase Realtime Database Structure

## Recommended Clean Database Structure

```
vixvvowebsite-default-rtdb/
│
├── users/                          # User profiles and settings
│   └── {userId}/
│       ├── username: "string"
│       ├── email: "string"
│       ├── role: "user" | "admin"
│       ├── currency: "USD"
│       ├── emailVerified: true
│       └── createdAt: "ISO timestamp"
│
├── usernames/                      # Username lookup (for uniqueness)
│   └── {userId}: "username"
│
├── printers/                       # Admin-managed global printers
│   └── {printerId}/
│       ├── name: "Printer Name"
│       ├── costPerHour: 2.50
│       ├── createdBy: "adminUserId"
│       └── createdAt: "ISO timestamp"
│
├── filaments/                      # Admin-managed global filaments
│   └── {filamentId}/
│       ├── name: "Filament Name"
│       ├── brand: "Brand Name"
│       ├── cost: 25.00
│       ├── weight: 1000
│       ├── createdBy: "adminUserId"
│       └── createdAt: "ISO timestamp"
│
├── userPrinters/                   # User's personal printer library
│   └── {userId}/
│       └── {printerId}/
│           ├── name: "My Printer"
│           ├── costPerHour: 2.50
│           └── addedAt: "ISO timestamp"
│
├── userFilaments/                  # User's personal filament library
│   └── {userId}/
│       └── {filamentId}/
│           ├── name: "My Filament"
│           ├── brand: "Brand"
│           ├── cost: 25.00
│           ├── weight: 1000
│           └── addedAt: "ISO timestamp"
│
├── calculations/                   # Saved calculations (optional)
│   └── {userId}/
│       └── {calculationId}/
│           ├── printTime: 5.5
│           ├── filamentUsed: 100
│           ├── totalCost: 24.50
│           ├── createdAt: "ISO timestamp"
│           └── notes: "string"
│
└── verificationCodes/              # Temporary email verification codes
    └── {email-with-commas}/
        ├── code: "123456"
        ├── expiresAt: timestamp
        ├── verified: false
        └── createdAt: timestamp

```

## Data Organization Guidelines

### 1. **users/** - User Profiles
- Store all user profile information
- Include preferences (currency, theme, etc.)
- Keep sensitive data minimal

### 2. **usernames/** - Username Uniqueness
- Flat structure for quick lookup
- Maps userId to username
- Used for checking username availability

### 3. **printers/** & **filaments/** - Global Resources
- Admin-curated resources
- Public read access
- Only admins can write

### 4. **userPrinters/** & **userFilaments/** - Personal Libraries
- Each user's custom printers/filaments
- Private to each user
- User-specific modifications

### 5. **calculations/** - Saved Calculations (Future)
- Store user's calculation history
- Allows tracking and reviewing past quotes

### 6. **verificationCodes/** - Temporary Data
- Auto-cleanup after 10 minutes
- Should be deleted after successful verification

## Cleanup Tasks

### Things to Remove/Clean:
1. ✅ Old test data
2. ✅ Expired verification codes
3. ✅ Duplicate entries
4. ✅ Incomplete user records
5. ✅ Test accounts

### Data to Keep:
1. ✅ Active user accounts
2. ✅ Admin-approved printers
3. ✅ Admin-approved filaments
4. ✅ User preferences (currency, etc.)

## Database Indexes

For better query performance, add these indexes in Firebase Console:

**users/**
- Index on: `email`, `role`, `createdAt`

**usernames/**
- Index on: `.value` (already configured)

**printers/**
- Index on: `name`, `createdAt`

**filaments/**
- Index on: `name`, `brand`, `createdAt`

## Auto-Cleanup Rules (Future Enhancement)

Consider setting up Cloud Functions to:
1. Delete expired verification codes (older than 15 minutes)
2. Archive old calculations (older than 1 year)
3. Remove incomplete user registrations (abandoned signups)
