# Modal Design Standards - Vixvvo Website 2.0

## 🎨 Official Modal Design System

**Reference Modals:** Filament Modal & Printer Modal from Dashboard  
**Last Updated:** November 5, 2025

---

## Color Palette

### Primary Colors
```css
--dark-bg: #1a1625
--darker-bg: #0f0b16
--card-bg: #241d35
--purple: #a855f7
--purple-hover: #9333ea
--purple-light: #c084fc
--text: #f0e9ff
--text-muted: #9ca3af
--border: rgba(168, 85, 247, .15)
```

### Modal-Specific Colors
- **Modal Background:** `#0a0a0a`
- **Modal Border:** `rgba(255, 255, 255, 0.1)`
- **Backdrop:** `rgba(0, 0, 0, 0.85)` with `backdrop-filter: blur(8px)`
- **Input Background:** `rgba(0, 0, 0, 0.4)`
- **Input Border:** `rgba(255, 255, 255, 0.15)`
- **Input Focus Border:** `#6445F5` (Purple focus)
- **Input Focus Shadow:** `0 0 0 3px rgba(100, 69, 245, 0.1)` (Purple glow)

---

## Structure

### Standard Modal HTML Structure
```html
<div id="modalName" style="display: none;">
  <div class="modal-card modal-wide">
    <button class="modal-close" id="closeModalX">×</button>
    
    <h3 id="modalTitle">Modal Title</h3>
    <p class="modal-subtitle">Brief description of what this modal does.</p>
    
    <!-- Modal Content Here -->
    
    <div class="modal-buttons">
      <button id="primaryBtn" class="btn btn-primary">Primary Action</button>
      <button id="cancelBtn" class="btn btn-ghost">Cancel</button>
    </div>
  </div>
</div>
```

### Two-Column Layout (For Complex Forms)
```html
<div class="modal-two-column">
  <div class="modal-column">
    <!-- Left column content -->
  </div>
  <div class="modal-column">
    <!-- Right column content -->
  </div>
</div>
```

---

## Typography

### Modal Title
- **Font Size:** `32px`
- **Font Weight:** `600`
- **Color:** `#ffffff`
- **Letter Spacing:** `-0.02em`
- **Margin Bottom:** `6px`

### Modal Subtitle
- **Font Size:** `14px`
- **Color:** `rgba(255, 255, 255, 0.6)`
- **Margin Bottom:** `24px`
- **Line Height:** `1.5`

### Labels
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Color:** `#ffffff`
- **Margin Bottom:** `8px`
- **Margin Top:** `14px` (except first)

### Hint Text
- **Font Size:** `13px`
- **Color:** `rgba(255, 255, 255, 0.4)`
- **Margin:** `10px 0 18px 0`
- **Line Height:** `1.5`

---

## Input Fields

### Standard Input Style
```css
width: 100%;
padding: 12px 14px;
background: rgba(0, 0, 0, 0.4);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 8px;
color: #ffffff;
font-size: 15px;
transition: all 0.2s ease;
```

### Input Placeholder
- **Color:** `rgba(255, 255, 255, 0.4)`

### Input Focus State ⭐
```css
outline: none;
border-color: #6445F5; /* Purple */
background: rgba(255, 255, 255, 0.05);
box-shadow: 0 0 0 3px rgba(100, 69, 245, 0.1); /* Purple glow */
```

### Textarea Style
```css
/* Same as input, plus: */
font-family: 'Courier New', monospace;
resize: vertical;
min-height: 100px;
```

---

## Buttons

### Primary Button ⭐
```css
background: rgba(255, 255, 255, 0.08);
color: #ffffff;
padding: 11px 16px;
font-size: 13px;
font-weight: 600;
border-radius: 8px;
border: none;
cursor: pointer;
transition: all 0.2s ease;
```

**Hover State:**
```css
background: rgba(255, 255, 255, 0.12);
transform: translateY(-1px);
```

### Ghost Button (Secondary)
```css
background: transparent;
color: rgba(255, 255, 255, 0.6);
border: 1px solid rgba(255, 255, 255, 0.1);
padding: 11px 16px;
font-size: 13px;
font-weight: 600;
border-radius: 8px;
cursor: pointer;
transition: all 0.2s ease;
```

**Hover State:**
```css
background: rgba(255, 255, 255, 0.05);
color: #ffffff;
```

### Button Container
```css
.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
```

---

## Modal Card Specifications

### Standard Modal
```css
position: relative;
width: 480px;
max-width: 90vw;
background: #0a0a0a !important;
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 16px;
padding: 40px;
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
```

### Wide Modal
```css
width: 900px;
max-width: 90vw;
```

### Modal Overlay
```css
position: fixed;
inset: 0;
display: none; /* Changed to 'grid' when shown */
z-index: 10000;
place-items: center;
background: rgba(0, 0, 0, 0.85);
backdrop-filter: blur(8px);
```

---

## Close Button

```css
position: absolute;
top: 24px;
right: 24px;
background: transparent;
border: none;
color: rgba(255, 255, 255, 0.6);
font-size: 24px;
cursor: pointer;
width: 32px;
height: 32px;
display: flex;
align-items: center;
justify-content: center;
border-radius: 6px;
transition: all 0.2s ease;
```

**Hover State:**
```css
background: rgba(255, 255, 255, 0.1);
color: #ffffff;
```

---

## Error & Success Messages

### Error Message
```css
color: #ff6b6b;
font-size: 11px;
margin: 8px 0;
background: rgba(255, 107, 107, 0.1);
padding: 6px 10px;
border-radius: 6px;
border-left: 3px solid #ff6b6b;
```

### Success Message
```css
color: #51cf66;
font-size: 11px;
margin: 8px 0;
background: rgba(81, 207, 102, 0.1);
padding: 6px 10px;
border-radius: 6px;
border-left: 3px solid #51cf66;
```

---

## Key Visual Effects

### 🟣 Purple Glow on Focus
- All inputs get purple border and glow on focus
- Creates consistent interactive feedback

### Shadow on Buttons
- Primary buttons lift on hover with `transform: translateY(-1px)`
- No box-shadow needed due to clean design

### Backdrop Blur
- Modal backdrop uses `backdrop-filter: blur(8px)` for modern glassmorphism effect

---

## Modal Registration

### CRITICAL: Always add new modal IDs to shared-styles.css

**Location:** `/css/shared-styles.css` (line ~466)

```css
#modal, #signupModal, #verificationModal, #resetPasswordModal, 
#printerModal, #filamentModal, #savePresetModal, #managePresetsModal, 
#viewOrderModal, #editOrderModal, #addColorModal, #addModelModal, 
#addSupplyModal, #createSupplyModal, #addPrinterModal, #cropModal,
#yourNewModalId { /* ADD HERE */
  position: fixed;
  inset: 0;
  display: none;
  z-index: 10000;
  place-items: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}
```

---

## Implementation Checklist

When creating a new modal:

- [ ] Modal ID added to CSS selector in `shared-styles.css`
- [ ] Uses `.modal-card` class
- [ ] Has `.modal-close` button in top-right
- [ ] Title uses `<h3>` with proper styling
- [ ] Subtitle present if needed
- [ ] All inputs have focus state with purple glow
- [ ] Primary button uses `btn btn-primary` classes
- [ ] Cancel/Secondary button uses `btn btn-ghost` classes
- [ ] Button container uses `modal-buttons` class
- [ ] Error messages use `.err` class
- [ ] Modal opens with `display: grid`
- [ ] Modal closes on backdrop click
- [ ] Modal closes with close button (×)

---

## Reference Examples

### Perfect Implementation Examples
1. **Printer Modal** - `/pages/dashboard.html` (line 703)
2. **Filament Modal** - `/pages/dashboard.html` (line 758)

These modals showcase:
✅ Proper two-column layout  
✅ Purple focus states on all inputs  
✅ Clean button styling with hover effects  
✅ Proper spacing and typography  
✅ Hint text for user guidance  
✅ Error handling display  

---

## Common Mistakes to Avoid

❌ **Don't use inline styles** for colors (use CSS classes)  
❌ **Don't forget to add modal ID** to shared-styles.css  
❌ **Don't use different purple shades** - stick to `#6445F5` for focus  
❌ **Don't skip the purple glow** on input focus  
❌ **Don't use box-shadows** on buttons (except focus glow)  
❌ **Don't make buttons flat** - they should lift on hover  
❌ **Don't use different border-radius** values  
❌ **Don't skip backdrop blur** effect  

---

## Quick Copy-Paste Template

```html
<!-- Your New Modal -->
<div id="yourModalId" style="display: none;">
  <div class="modal-card modal-wide">
    <button class="modal-close" onclick="closeYourModal()">×</button>
    
    <h3>Your Modal Title</h3>
    <p class="modal-subtitle">Brief description here.</p>
    
    <label>Field Label</label>
    <input type="text" placeholder="Enter value...">
    
    <div class="modal-hint">
      Helpful hint text for users
    </div>
    
    <div id="yourModalErr" class="err" style="display: none;"></div>
    
    <div class="modal-buttons">
      <button class="btn btn-primary">Save</button>
      <button class="btn btn-ghost" onclick="closeYourModal()">Cancel</button>
    </div>
  </div>
</div>
```

---

**Remember:** This is the OFFICIAL modal design standard. All future modals must follow this exact styling for consistency across the application.

🎨 **Key Brand Elements:**  
- Purple focus glow (#6445F5)  
- Dark glassmorphism aesthetic  
- Clean, minimal button design  
- Consistent spacing and typography
