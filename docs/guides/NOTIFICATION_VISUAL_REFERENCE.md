# 🎨 Notification Component - Visual Reference

## What It Looks Like

```
┌─────────────────────────────────────────┐
│  ✓  │ Success!                      │ × │  ← Success (Green)
│     │ Order created successfully!   │   │
│     └────────────────────────────────   │
│     ████████████████░░░░░░░░░░░░░░░░   │  ← Progress bar
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ✕  │ Error                         │ × │  ← Error (Red)
│     │ Failed to save changes        │   │
│     └────────────────────────────────   │
│     ████████████████░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ⚠  │ Warning                       │ × │  ← Warning (Amber)
│     │ Please fill in all fields     │   │
│     └────────────────────────────────   │
│     ████████████████░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────┘
```

## Position
- **Location:** Top-right corner (24px from top and right)
- **Animation:** Slides in from right with bouncy effect
- **Duration:** Shows for 3 seconds then auto-dismisses
- **Mobile:** Full width with side margins

## Colors

### Success (Green Theme)
- **Border:** `rgba(16, 185, 129, 0.4)` - Emerald green
- **Icon:** `#10b981` - Bright green
- **Background:** Gradient from transparent green to dark purple
- **Progress Bar:** Green gradient

### Error (Red Theme)
- **Border:** `rgba(239, 68, 68, 0.4)` - Red
- **Icon:** `#ef4444` - Bright red
- **Background:** Gradient from transparent red to dark purple
- **Progress Bar:** Red gradient

### Warning (Amber Theme)
- **Border:** `rgba(245, 158, 11, 0.4)` - Amber
- **Icon:** `#f59e0b` - Orange-amber
- **Background:** Gradient from transparent amber to dark purple
- **Progress Bar:** Amber gradient

## Typography
- **Title:** 16px, semi-bold (600)
- **Message:** 14px, regular
- **Colors:** White title, gray message

## Dimensions
- **Min Width:** 320px
- **Max Width:** 420px
- **Padding:** 20px vertical, 24px horizontal
- **Border Radius:** 12px
- **Gap between elements:** 16px

## Components

```
[Icon]  [Title            ]  [×]
        [Message Text     ]
        ─────────────────────  ← Progress bar
```

1. **Icon** (28px)
   - Success: ✓
   - Error: ✕
   - Warning: ⚠
   - Has glow effect (drop-shadow)

2. **Content Area**
   - Title: Bold, white
   - Message: Regular, gray
   - Stacked vertically

3. **Close Button** (× symbol)
   - 20px size
   - Hover: slight highlight
   - Optional manual dismiss

4. **Progress Bar**
   - 3px height
   - Animated from 100% to 0%
   - 3 second duration
   - Color matches notification type

## Animation Details

### Entrance (0.4s)
- Starts: `translateX(400px)` (off-screen right)
- Ends: `translateX(0)` (on-screen)
- Easing: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (bouncy)
- Opacity: 0 → 1

### Exit (0.4s)
- Opacity: 1 → 0
- Position: Stays in place
- Easing: Default ease

### Progress Bar (3s)
- Width: 100% → 0%
- Easing: Linear
- Matches notification duration

## Responsive Behavior

### Desktop (>768px)
- Top-right corner
- Fixed 320-420px width
- 24px margins

### Mobile (≤768px)
- Full width (minus 12px margins each side)
- Top position: 12px (closer to top)
- Still slides from right

## States

### Hidden (Default)
```css
opacity: 0;
pointer-events: none;
transform: translateX(400px);
```

### Visible (.show)
```css
opacity: 1;
pointer-events: all;
transform: translateX(0);
```

## Z-Index
- **Value:** 9999
- **Purpose:** Always on top of everything
- **Higher than:** Modals (1000), overlays (999), dropdowns (100)

## Accessibility
- **Keyboard:** Can be closed with × button
- **Screen Readers:** Text is readable
- **Motion:** Respects prefers-reduced-motion (not implemented yet)
- **Contrast:** WCAG AA compliant colors

## Browser Support
- ✅ Chrome/Edge (modern)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ⚠️ IE11 (not tested)

## CSS Variables Used
- `--text` - Main text color (#f3f4f6)
- `--text-muted` - Secondary text (#9ca3af)
- `--purple` - Brand purple (#a855f7)
- `--purple-light` - Light purple (#c084fc)

## Comparison to Old System

### Old (Modal Style)
```
             ┌──────────────┐
             │              │
             │   [Icon]     │
             │              │
             │    Title     │
             │   Message    │
             │              │
             │  [Got it!]   │
             │              │
             └──────────────┘
```
- Center screen
- Blocks interaction (with overlay)
- Requires button click to dismiss
- Modal-like appearance
- User must take action

### New (Toast Style)
```
                        ┌──────────────┐
                        │ ✓ Title    × │
                        │   Message    │
                        │ ──────────── │
                        └──────────────┘
```
- Top-right corner
- Doesn't block interaction (no overlay)
- Auto-dismisses
- Toast/snackbar appearance
- Non-intrusive

## Usage Examples

### Minimal (Type only)
```javascript
showNotification('Changes saved!', 'success');
// Uses default title "Success!"
```

### With Custom Title
```javascript
showNotification('Please verify your email first', 'warning', 'Email Required');
// Title: "Email Required"
// Icon: ⚠
// Color: Amber
```

### Long Message
```javascript
showNotification('Unable to connect to the server. Please check your internet connection and try again.', 'error');
// Wraps text automatically
// Max width: 420px
```

## Tips for Visual Consistency

1. **Keep messages short** - One line is ideal
2. **Use title for context** - Message for details
3. **Match type to action** - Green for success, red for errors
4. **Let it auto-dismiss** - Don't require clicks
5. **Stack if needed** - Multiple notifications queue (not implemented yet)

## Files Reference

**Component:** `/components/notification.html`
**Template:** `/tools/NEW_PAGE_WITH_NOTIFICATIONS.html`
**Examples:** `/pages/orders.html`

---

**Last Updated:** October 14, 2025
