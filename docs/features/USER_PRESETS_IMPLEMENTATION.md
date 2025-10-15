# User Presets Implementation

## Overview
Members can now add their own custom printer and filament presets to their personal library, separate from the global library that only admins can manage.

## Features Implemented

### 1. Personal Printer Library
- **Location**: "Your Presets" tab → "Your Printers Library" section
- **Functionality**:
  - Add custom printers with name, brand, price, and lifespan
  - Edit existing personal printers
  - Delete personal printers
  - Brand filtering
  - Organized by brand with counts
  - Same UI/UX as global library

### 2. Personal Filament Library
- **Location**: "Your Presets" tab → "Your Filaments Library" section
- **Functionality**:
  - Add custom filaments with type, brand, spool weight, and cost
  - Edit existing personal filaments
  - Delete personal filaments
  - Brand filtering
  - Organized by brand with counts
  - Same UI/UX as global library

### 3. Calculator Integration
- **Printer Dropdown**: Shows both global and personal printers in separate groups
  - 📚 Global Library (visible to all)
  - 👤 Your Library (personal presets)
- **Filament Dropdown**: Shows both global and personal filaments in separate groups
  - 📚 Global Library (visible to all)
  - 👤 Your Library (personal presets)

### 4. Firebase Database Structure
```
userPrinters/
  {userId}/
    {printerId}/
      name: "Printer Name"
      brand: "Brand Name"
      price: 299.99
      lifespan: 5000

userFilaments/
  {userId}/
    {filamentId}/
      type: "PLA"
      brand: "Brand Name"
      spoolWeight: 1000
      spoolCost: 19.99
```

### 5. Security Rules
- Users can only read and write their own presets
- Personal presets are private to each user
- Global library remains admin-only for modifications

## User Experience

### For Members (Logged In)
1. Navigate to **"Your Presets"** tab in the calculator
2. See two sections: Your Printers Library & Your Filaments Library
3. Click **"+ Add Printer"** or **"+ Add Filament"** buttons
4. Fill in the details in the modal
5. Presets are instantly available in calculator dropdowns
6. Can edit or delete personal presets anytime

### For Non-Members (Not Logged In)
- "Your Presets" tab shows a message to log in
- Cannot add personal presets
- Can still use global library

### Benefits
- **Personalization**: Track your own equipment and materials
- **Privacy**: Your presets are only visible to you
- **No Limits**: Add as many personal presets as needed
- **Organization**: Separate personal library from global presets
- **Convenience**: Quick access in calculator dropdowns

## Technical Details

### Key Functions Added
- `renderUserPrintersList()` - Displays user's printers with full UI
- `renderUserFilamentsList()` - Displays user's filaments with full UI
- `saveUserPrinter()` - Saves user printer to Firebase
- `saveUserFilament()` - Saves user filament to Firebase
- `editUserPrinter(id)` - Opens modal to edit user printer
- `editUserFilament(id)` - Opens modal to edit user filament
- `deleteUserPrinter(id)` - Deletes user printer with confirmation
- `deleteUserFilament(id)` - Deletes user filament with confirmation
- `populatePrinterDropdown()` - Updates calculator dropdown with all printers
- `populateFilamentDropdown()` - Updates calculator dropdown with all filaments

### Dropdown Format
- Global presets: `global:{name}` or `global:{type}`
- User presets: `user:{id}`
- Calculator functions parse the prefix to determine data source

### Firebase Listeners
- User-specific listeners are set up on login
- Listeners are cleaned up on logout
- Real-time updates when presets are added/modified/deleted

## Testing Checklist
- ✅ Login as member
- ✅ Add personal printer preset
- ✅ Add personal filament preset
- ✅ Verify presets appear in "Your Presets" tab
- ✅ Verify presets appear in calculator dropdowns
- ✅ Edit personal preset
- ✅ Delete personal preset
- ✅ Use personal preset in calculator
- ✅ Verify calculations work correctly
- ✅ Logout and verify personal presets are hidden
- ✅ Login as different user and verify presets are isolated

## Database Rules Update Required
Deploy the updated `database.rules.json` to Firebase:
```bash
firebase deploy --only database
```

## Notes
- Personal presets use the same modal dialogs as global presets
- Modal title changes to indicate "Your" vs global preset
- Save button behavior is dynamically assigned based on context
- Brand filtering works independently for personal and global libraries
- Personal presets don't support batch/quick add (can be added if needed)
