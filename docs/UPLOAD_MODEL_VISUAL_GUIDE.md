# Upload Model Page - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│  [Logo]  [Tools ▼]  [Resources ▼]        [Settings ⚙] [Avatar] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Upload Model                               │
│              Add a new 3D model to your inventory                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📦 Model Information                                             │
├─────────────────────────────────────────────────────────────────┤
│  SKU: [1000]                    Designer: [Vixvvo3D]            │
│  Category: [________]           Marketplace: [Marketplace]       │
│  Model Name: [________________________] *                        │
│  Print Time:  [0] Hours  [0] Minutes                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📁 Model Files                                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              📤                                            │  │
│  │   Click to upload or drag and drop                        │  │
│  │   Supports: .stl, .3mf, .obj, .step, .zip (Max 100MB)   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📄 dragon_model.stl - 15.3 MB        [Remove]                  │
│  ████████████████░░░░░░░░░░░░ 65%                              │
│  📄 base.stl - 2.1 MB                 [Remove]                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🧵 Filament Cost                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Choose Your Filament:                                          │
│  [Select filament... ▼]                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Brand: Prusament        Type: PLA                         │  │
│  │ Spool Weight: 1000g     Cost per Spool: $24.99           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ⚠️ Auto-Calculator (Coming Soon)                               │
│  Filament cost calculation based on weight will be available.   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🔧 Supplies                                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ M3 Screws                              [Remove]           │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Category: Hardware          Cost Per Item: $0.15          │  │
│  │ In Stock: 500               Needed for Model: 8           │  │
│  │ Purchase Link: https://example.com/screws                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [➕ Add Existing Supply]  [✨ Create New Supply]               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🏪 Sales Platform                                                │
├─────────────────────────────────────────────────────────────────┤
│  Sales Platform Sold On?                                        │
│  [Select platform... ▼]                                         │
│   • Etsy                                                        │
│   • eBay                                                        │
│   • Shopify                                                     │
│   • TikTok Shop                                                 │
│   • Facebook Marketplace                                        │
│   • Other                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🖨️ Printer                                                       │
├─────────────────────────────────────────────────────────────────┤
│  Model Printed On                                               │
│  [Select printer... ▼]                                          │
│                                                                  │
│  [➕ Add Printer]                                                │
└─────────────────────────────────────────────────────────────────┘

                    ┌───────────────────┐
                    │  CREATE MODEL     │
                    └───────────────────┘
```

## Modals

### Add Existing Supply Modal
```
    ╔═══════════════════════════════════════╗
    ║ Add Existing Supply              [×] ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║ Select Supply                         ║
    ║ [Choose a supply... ▼]                ║
    ║                                       ║
    ║ Quantity Needed for This Model        ║
    ║ [1]                                   ║
    ║                                       ║
    ║  [Cancel]        [Add Supply]         ║
    ╚═══════════════════════════════════════╝
```

### Create New Supply Modal
```
    ╔═══════════════════════════════════════╗
    ║ Create New Supply                [×] ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║ Category *                            ║
    ║ [e.g., Hardware, Paint, Tools]        ║
    ║                                       ║
    ║ Supply Name *                         ║
    ║ [e.g., M3 Screws, Acrylic Paint]     ║
    ║                                       ║
    ║ Cost Per Item *                       ║
    ║ [19.99]                               ║
    ║                                       ║
    ║ Supplies in Stock                     ║
    ║ [0]                                   ║
    ║                                       ║
    ║ Quantity Needed for This Model *      ║
    ║ [1]                                   ║
    ║                                       ║
    ║ Purchase Link                         ║
    ║ [https://example.com/product]         ║
    ║                                       ║
    ║  [Cancel]      [Create & Add]         ║
    ╚═══════════════════════════════════════╝
```

### Add Printer Modal
```
    ╔═══════════════════════════════════════╗
    ║ Add Printer                      [×] ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║ Printer Name *                        ║
    ║ [e.g., Prusa i3 MK3S, Ender 3 Pro]   ║
    ║                                       ║
    ║  [Cancel]      [Add Printer]          ║
    ╚═══════════════════════════════════════╝
```

## Toast Notifications

### Success Toast
```
┌─────────────────────────────┐
│ ✓  Success                  │
│    Model created            │
│    successfully!            │
└─────────────────────────────┘
```

### Error Toast
```
┌─────────────────────────────┐
│ ✕  Error                    │
│    File too large           │
│    (max 100MB)              │
└─────────────────────────────┘
```

## Color Scheme

```
Background Gradient:
├─ Radial gradient overlays with purple tints
└─ Diagonal stripes: #1a1625 → #0f0b16 → #1d1530

Primary Purple:
├─ Base: #a855f7
├─ Light: #c084fc
└─ Hover: #9333ea

Sections:
├─ Background: rgba(36, 29, 53, 0.4)
├─ Border: rgba(168, 85, 247, 0.15)
└─ Backdrop blur: 10px

Text:
├─ Primary: #f0e9ff
├─ Muted: #9ca3af
└─ Error: #ef4444

Buttons:
├─ Primary: Linear gradient (purple)
├─ Secondary: Purple outline
└─ Ghost: Transparent with border
```

## Interactions

### File Upload States
```
Normal:
┌─────────────────────────┐
│      📤                 │
│  Click to upload...     │
└─────────────────────────┘

Hover:
┌═════════════════════════┐
║      📤                 ║  (Purple glow)
║  Click to upload...     ║
└═════════════════════════┘

Drag Over:
┌█████████████████████████┐
█      📤                 █  (Purple background)
█  Drop files here...     █
└█████████████████████████┘

Uploading:
📄 dragon.stl - 15.3 MB     [Remove]
████████░░░░░░░░░ 45%
```

### Button States
```
Primary Button:
[  CREATE MODEL  ]     Normal
[  CREATE MODEL  ]↑    Hover (lifted shadow)
[  CREATE MODEL  ]     Disabled (faded)
[  CREATING...   ]     Loading
```

### Form Input States
```
Normal:   [____________]
Focus:    [____________]  (Purple border + glow)
Error:    [____________]  (Red border)
Disabled: [____________]  (Faded)
```

## Responsive Behavior

### Desktop (>768px)
- Two-column grid for form fields
- Side-by-side supply fields
- Full modal width

### Mobile (<768px)
- Single column layout
- Stacked form fields
- Full-width buttons
- Reduced padding
- 95% modal width

## Keyboard Navigation

- Tab through all form fields
- Enter to submit form
- Escape to close modals
- Space to toggle checkboxes/selects

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on inputs
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ High contrast text
- ✅ Keyboard accessible

---

**Page URL**: `/pages/upload-model.html`  
**Last Updated**: October 17, 2025
