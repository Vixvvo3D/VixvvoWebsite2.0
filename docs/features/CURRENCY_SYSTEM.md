# Currency System Documentation

## Overview
The website uses a dynamic currency display system that allows users to view prices in their preferred currency while storing all values in USD in Firebase.

---

## How It Works

### 1. **User Preference Storage**
- Users select their preferred currency in Settings
- The preference is stored in `window.currentCurrency` variable
- **30 Supported currencies:**
  - USD ($), EUR (€), GBP (£), JPY (¥), CNY (¥), CAD ($), AUD ($)
  - CHF (Fr), INR (₹), MXN ($), BRL (R$), ZAR (R), KRW (₩), SGD ($)
  - NZD ($), SEK (kr), NOK (kr), DKK (kr), PLN (zł), THB (฿), IDR (Rp)
  - HUF (Ft), CZK (Kč), ILS (₪), CLP ($), PHP (₱), AED (د.إ), SAR (﷼)
  - MYR (RM), RON (lei)

### 2. **Data Storage (Firebase)**
- **All monetary values are stored in USD** in Firebase Realtime Database
- This ensures consistency across all users regardless of their display preference
- Example: If a Canadian user enters "20 CAD", the system converts it to USD (e.g., ~$14.80 USD) before saving to Firebase

### 3. **Display & Input System**

#### **When Viewing Orders:**
- The system displays prices in the user's selected currency
- Example: If you have CAD selected, you see "C$20.00"
- Example: If you switch to EUR, the same order shows "€18.50" (converted from USD in database)

#### **When Creating/Editing Orders:**
- Input fields show the currency symbol based on your current preference
- Labels display: `Total Price (C$)` or `Total Price ($)` etc.
- **Important:** The value you enter is assumed to be in your selected currency
- The system converts it to USD before saving to Firebase

---

## Example Workflow

### Scenario 1: Creating an Order with CAD Selected
1. User has CAD selected as currency preference
2. User creates new order and enters "20" in Total Price field
3. Label shows: `Total Price (C$)`
4. User saves order
5. **System converts:** C$20.00 → $14.80 USD (using current exchange rate)
6. **Firebase stores:** `14.80` (in USD)

### Scenario 2: Viewing the Same Order with Different Currency
1. User switches currency to EUR in settings
2. User opens the same order
3. **System converts:** $14.80 USD → €13.70 EUR (using current exchange rate)
4. **Display shows:** `Total Price (€)` with value "13.70"

### Scenario 3: Editing an Order
1. User has EUR selected
2. User edits order and changes price from "13.70" to "25.00"
3. User saves
4. **System converts:** €25.00 → $27.50 USD
5. **Firebase updates:** `27.50` (in USD)

---

## Technical Implementation

### Core Functions

#### `getCurrencySymbol()`
Returns the symbol for the currently selected currency.
```javascript
function getCurrencySymbol() {
  const currencySymbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
    'CAD': '$', 'AUD': '$', 'CHF': 'Fr', 'INR': '₹', 'MXN': '$',
    'BRL': 'R$', 'ZAR': 'R', 'KRW': '₩', 'SGD': '$', 'NZD': '$',
    'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'THB': '฿',
    'IDR': 'Rp', 'HUF': 'Ft', 'CZK': 'Kč', 'ILS': '₪', 'CLP': '$',
    'PHP': '₱', 'AED': 'د.إ', 'SAR': '﷼', 'MYR': 'RM', 'RON': 'lei'
  };
  return currencySymbols[window.currentCurrency || 'USD'] || '$';
}
```

#### `formatCurrency(amount)`
Formats a USD amount for display in the user's selected currency.
```javascript
function formatCurrency(amount) {
  // Convert USD to selected currency and format
  const convertedAmount = convertFromUSD(amount, window.currentCurrency);
  return `${getCurrencySymbol()}${convertedAmount.toFixed(2)}`;
}
```

### Currency Display Locations

#### **Orders Table**
- **Column:** Total
- **Implementation:** `formatCurrency(order.total)`
- Shows converted amount with currency symbol

#### **New Order Modal**
- **Field:** Total Price
- **Label:** `Total Price (${getCurrencySymbol()})`
- Dynamically updates when modal opens

#### **Edit Order Modal**
- **Field:** Total Price  
- **Label:** `Total Price (${getCurrencySymbol()})`
- Dynamically generated in `displayOrderDetails()`

---

## Key Benefits

### ✅ **Consistency**
- All data stored in single currency (USD) in Firebase
- No currency confusion in database queries
- Easy to generate reports and analytics

### ✅ **Flexibility**
- Users can switch currencies anytime
- Instant conversion for all existing orders
- No data migration needed when changing preference

### ✅ **International Support**
- Works seamlessly for users in different countries
- Each user sees prices in their preferred currency
- Accurate conversions using current exchange rates

---

## Important Notes

### 🔴 **Critical Rules**
1. **Always store USD in Firebase** - Never store the display currency
2. **Convert on input** - When user enters a value, convert from their currency to USD before saving
3. **Convert on display** - When showing data, convert from USD to user's currency
4. **Update dynamically** - Currency labels must update when modals open

### ⚠️ **Exchange Rates**
- The system uses exchange rates defined in `/js/currency.js`
- Exchange rates are relative to USD (base currency)
- Rates should be updated periodically for accuracy
- Current rates are approximate and based on October 2025 values

### 💡 **For Developers**
When adding new price fields:
1. Store value in USD in Firebase
2. Use `getCurrencySymbol()` for labels
3. Use `formatCurrency()` for displaying amounts
4. Convert input value to USD before saving
5. Convert USD value to display currency when loading

---

## Files Involved

- **`/pages/orders.html`** - Main implementation of currency system
- **`/pages/settings.html`** - Currency preference selector
- **`/js/currency.js`** - Currency conversion logic and API calls
- **`/js/config.js`** - Currency configuration and exchange rates

---

## Quick Reference

| Action | Input Currency | Stored in Firebase | Display Currency |
|--------|---------------|-------------------|------------------|
| Enter price with CAD selected | C$20.00 | $14.80 USD | Shows in selected currency |
| View same order with EUR | - | $14.80 USD | €13.70 |
| Edit with GBP selected | £30.00 | $39.00 USD | Shows in selected currency |
| Switch to JPY | - | $39.00 USD | ¥5,850 |

---

**Last Updated:** October 14, 2025  
**Version:** 1.0  
**Related Docs:** 
- [Settings Page Guide](./SETTINGS_PAGE_COMPLETE.md)
- [Orders System](../guides/DATABASE_STRUCTURE.md)
