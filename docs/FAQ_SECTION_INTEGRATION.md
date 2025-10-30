# FAQ Section Integration Guide

## 📐 Complete Measurements & Positioning

### **TOTAL SPACE REQUIRED: 1,724px**

This FAQ section is designed for a **1440px wide page layout**.

---

## ⚙️ Important: Positioning Methods

The FAQ preview page (`faq-preview.html`) uses **containers with absolute positioning** for precise control:

### **Original Preview Structure:**
- **`.top-section`** - 1120px container with `position: relative`
  - Child elements use `position: absolute` for exact placement
  - `.faq-heading` → `position: absolute; top: 0; left: 0;`
  - `.faq-main-question` → `position: absolute; top: 44.8px; left: 0;`
  - `.faq-accordion` → `position: absolute; top: 160px; right: 0;`

- **`.bottom-section`** - 1440px container with `position: relative`
  - All children use `position: absolute`
  - `.contact-text` → `position: absolute; top: 128px; left: 160px;`
  - `.large-vixvvo-text` → `position: absolute; bottom: 316.1px;`
  - `#footer-container` → `position: absolute; bottom: 0;`

### **This Integration Guide Uses:**
A **simplified approach** with relative positioning and margins for easier integration into existing pages. Both methods produce the same visual result, but the integration method is more flexible for different page structures.

---

## 🎯 Layout Breakdown

### **Structure:**
```
Current page content ends
    ↓ 128px top margin
FAQ Top Section (752px height)
    ↓ 128px gap
FAQ Bottom Section (716px height)
────────────────────────────
Total: 1,724px
```

---

## 📏 Detailed Measurements

### **TOP SECTION - FAQ Content Area**
- **Width:** 1120px (centered with 160px margins on each side)
- **Height:** 752px
- **Top margin:** 128px (from previous content)
- **Left/Right margins:** 160px each

#### **Elements inside Top Section:**

1. **FAQ Heading** - "FREQUENTLY ASKED QUESTIONS"
   - Position: `top: 0`, `left: 0`
   - Font: SF Pro Display, 18px, weight 450
   - Color: `rgba(255, 255, 255, 0.80)`
   - Line height: 160%
   - Letter spacing: -0.36px

2. **FAQ Main Question** - "Have questions in mind? Let us answer it"
   - Position: `top: 44.8px` (from heading)
   - Font: SF Pro Display, 64px, weight 450
   - Color: `#F1F0FF`
   - Letter spacing: -1.28px

3. **FAQ Accordion**
   - Position: `top: 160px`, `right: 0` (within 1120px container)
   - Width: 500px
   - Gap between items: 16px
   - Closed item height: 69px
   - Open item height: 157px
   - Border radius: 15px
   - Border: 1px solid `rgba(255, 255, 255, 0.16)`
   - Background: `linear-gradient(0deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.12) 100%), #000`

---

### **MIDDLE GAP**
- **Height:** 128px (between top and bottom sections)

---

### **BOTTOM SECTION - Footer Area**
- **Width:** 1440px (full width)
- **Height:** 716px
- **Background:** #000

#### **Elements inside Bottom Section:**

1. **Contact Text** - "Don't answer your question? contact us at..."
   - Position: `top: 128px`, `left: 160px` (within bottom section)
   - Font: SF Pro Display, 18px, weight 250
   - Color: `rgba(255, 255, 255, 0.80)`
   - Line height: 160%
   - Letter spacing: -0.36px
   - Link color: `#A9AAFF`

2. **Large "Vixvvo" Text**
   - Position: `bottom: 316.1px`
   - Left/Right margins: 165px each
   - Font: SF Pro Display, 386px, weight 590
   - Line height: 386px
   - Letter spacing: -3.86px
   - Gradient: `linear-gradient(180deg, #FFF 0%, #C1B2FF 100%)`
   - Uses `background-clip: text` and `-webkit-text-fill-color: transparent`

3. **Bottom Shine Image**
   - Position: `bottom: 0`, centered (`left: 50%, transform: translateX(-50%)`)
   - Image: `../images/Bottomshine.png`

4. **Footer Container**
   - Position: `absolute`, `bottom: 0`
   - Padding: `40px 140px`
   - Contains: Navigation links, divider, copyright, social icons

---

## 💻 Complete Code Implementation

### **Step 1: Add CSS Styles**

Add this CSS to your page's `<style>` section (before `</style>`):

```css
/* ========================================
   FAQ SECTION STYLES
   ======================================== */

/* FAQ Preview Section */
.faq-preview-section {
  width: 100%;
  margin-top: 128px;
  background: #000;
}

.faq-preview-container {
  width: 1120px;
  margin: 0 auto;
  padding-bottom: 128px;
  position: relative;
}

.faq-left {
  position: relative;
  width: 100%;
  margin-bottom: 160px;
}

/* FAQ Heading */
.faq-heading {
  margin: 0;
  padding: 0;
  color: rgba(255, 255, 255, 0.80);
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 450;
  line-height: 160%;
  letter-spacing: -0.36px;
}

/* FAQ Main Question */
.faq-main-question {
  margin: 0;
  padding: 0;
  margin-top: 44.8px;
  color: #F1F0FF;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 64px;
  font-style: normal;
  font-weight: 450;
  line-height: normal;
  letter-spacing: -1.28px;
}

.faq-accordion {
  position: absolute;
  top: 160px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 500px;
}

.faq-item {
  display: flex;
  width: 500px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.12) 100%), #000;
  cursor: pointer;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.faq-item.closed {
  height: 69px;
  padding: 20px;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
}

.faq-item.open {
  width: 500px;
  height: 157px;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.faq-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.faq-question {
  color: #FFF;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%;
  margin: 0;
  flex: 1;
  white-space: normal;
  overflow: visible;
}

.faq-toggle {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  font-size: 24px;
  font-weight: 300;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-item.open .faq-toggle {
  transform: rotate(45deg);
}

.faq-answer {
  color: rgba(255, 255, 255, 0.70);
  font-family: 'SF Pro Display', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0;
  display: none;
}

.faq-item.open .faq-answer {
  max-height: 77px;
  opacity: 1;
  margin-top: 10px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* FAQ Bottom Section */
.faq-bottom-section {
  width: 1440px;
  height: 716px;
  background: #000;
  position: relative;
  margin: 0 auto;
}

.bottom-shine {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  pointer-events: none;
  z-index: 1;
}

.large-vixvvo-text {
  position: absolute;
  bottom: 316.1px;
  left: 165px;
  right: 165px;
  margin: 0;
  padding: 0;
  text-align: center;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 386px;
  font-style: normal;
  font-weight: 590;
  line-height: 386px;
  letter-spacing: -3.86px;
  background: linear-gradient(180deg, #FFF 0%, #C1B2FF 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  pointer-events: none;
  z-index: 2;
}

.contact-text {
  position: absolute;
  top: 128px;
  left: 160px;
  margin: 0;
  padding: 0;
  color: rgba(255, 255, 255, 0.80);
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 250;
  line-height: 160%;
  letter-spacing: -0.36px;
  z-index: 2;
}

.contact-text a {
  color: #A9AAFF;
  text-decoration: none;
}

.contact-text a:hover {
  text-decoration: underline;
}

/* Footer container */
#footer-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 140px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  z-index: 20;
  box-sizing: border-box;
}

/* Footer navigation */
#footer-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
}

.footer-nav-link {
  color: #FFF;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.footer-nav-link:hover {
  opacity: 0.7;
}

/* Footer divider */
#footer-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* Footer bottom section */
#footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#footer-copyright {
  color: rgba(255, 255, 255, 0.60);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
}

/* Footer social icons */
#footer-social {
  display: flex;
  gap: 16px;
  align-items: center;
}

.footer-social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  text-decoration: none;
  font-size: 18px;
  transition: background 0.3s ease;
}

.footer-social-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

### **Step 2: Add HTML Markup**

Add this HTML at the bottom of your page content (before closing `</div>` of your main container):

```html
<!-- FAQ Section -->
<div class="faq-preview-section">
  <div class="faq-preview-container">
    <div class="faq-left">
      <p class="faq-heading">FREQUENTLY ASKED QUESTIONS</p>
      <h2 class="faq-main-question">Have questions<br>in mind? Let us<br>answer it</h2>
    </div>
    
    <div class="faq-accordion">
      <div class="faq-item open">
        <div class="faq-item-header">
          <h3 class="faq-question">What is Vixvvo?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Vixvvo is a comprehensive platform for 3D printing creators and vendors, offering tools to manage prints, sales, pricing, and connect with the community. We provide calculators, model upload features, and Patreon integration to help you grow your 3D printing business.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">How do I upload my 3D models?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Simply navigate to the Upload Model page, fill in your model details including title, description, and pricing. You can upload STL, OBJ, or 3MF files. Add preview images and set your licensing terms before publishing to the community.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">What file formats are supported?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Vixvvo supports all major 3D file formats including STL, OBJ, 3MF, and STEP files. You can upload models in any of these formats and our platform will handle the rest, ensuring compatibility across different 3D printing workflows.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">What does the pricing calculator include?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Our advanced calculator helps you price prints accurately by factoring in filament cost, electricity usage, print time, post-processing labor, failure rates, and desired markup percentages. It supports multiple currencies and saves your printer/filament profiles for quick calculations.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">How does Patreon integration work?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Link your Patreon account in settings to automatically grant your patrons access to exclusive models and features based on their tier level. Vixvvo syncs with Patreon in real-time, so your supporters get instant access when they subscribe.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">Is my payment information secure?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Absolutely. We use industry-standard encryption and secure payment gateways. We never store your full payment details on our servers. All transactions are processed through trusted payment providers with PCI compliance.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">Can I manage multiple printers and filaments?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Yes! Create and save unlimited printer profiles with specific settings like bed size, nozzle diameter, and power consumption. Track your filament inventory with color, material type, and cost per kg. All your data syncs across devices when you're logged in.</p>
      </div>

      <div class="faq-item closed">
        <div class="faq-item-header">
          <h3 class="faq-question">Do you offer customer support?</h3>
          <span class="faq-toggle">+</span>
        </div>
        <p class="faq-answer">Yes! Our support team is available to help you with any questions or issues. Reach out through email or our in-app chat, and we'll get back to you as quickly as possible to ensure you have the best experience on Vixvvo.</p>
      </div>
    </div>
  </div>

  <!-- Bottom Section -->
  <div class="faq-bottom-section">
    <p class="contact-text">Don't answer your question?<br>contact us at <a href="mailto:Vixvvo@gmail.com">Vixvvo@gmail.com</a></p>

    <h1 class="large-vixvvo-text">Vixvvo</h1>
    <img src="../images/Bottomshine.png" alt="Bottom Shine" class="bottom-shine">
    
    <!-- Footer Container -->
    <div id="footer-container">
      <!-- Footer Navigation -->
      <nav id="footer-nav">
        <a href="../index.html#features-heading" class="footer-nav-link">Features</a>
        <a href="../index.html#benefits-heading" class="footer-nav-link">Use Cases</a>
        <a href="pricing.html" class="footer-nav-link">Pricing</a>
        <a href="../index.html#about-vixvvo3d-heading" class="footer-nav-link">About Us</a>
        <a href="../index.html#faq-category-heading" class="footer-nav-link">FAQs</a>
      </nav>
      
      <!-- Footer Divider -->
      <div id="footer-divider"></div>
      
      <!-- Footer Bottom Section -->
      <div id="footer-bottom">
        <p id="footer-copyright">© 2025 Vixvvo, all rights reserved.</p>
        
        <!-- Social Media Icons -->
        <div id="footer-social">
          <a href="https://instagram.com" target="_blank" class="footer-social-icon" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" class="footer-social-icon" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" class="footer-social-icon" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### **Step 3: Add JavaScript**

Add this JavaScript before your closing `</script>` tag or in a `<script>` block:

```javascript
// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() {
      // Close all other items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== this) {
          otherItem.classList.remove('open');
          otherItem.classList.add('closed');
        }
      });
      // Toggle current item
      this.classList.toggle('open');
      this.classList.toggle('closed');
    });
  });
});
```

---

### **Step 4: Add Font (if not already present)**

Add this in your `<head>` section:

```html
<link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet">
```

---

## ⚠️ Important Notes

1. **Positioning Method:** This integration uses a simplified relative positioning approach. The original `faq-preview.html` uses absolute positioning within containers for pixel-perfect control. Both methods achieve the same visual result.
2. **Image Path:** Update `../images/Bottomshine.png` to match your project structure
3. **Footer Links:** Update navigation links to match your page structure
4. **Page Width:** This is designed for 1440px width pages. If your page uses a different width, adjust the container widths accordingly.
5. **Responsive:** Consider adding responsive styles for mobile/tablet views
6. **Position:** This section should be added at the BOTTOM of your page, before the closing `</div>` of your main container

---

## 🔧 Alternative: Absolute Positioning Method

If you need pixel-perfect positioning matching the preview page exactly, use this approach:

### Container Structure:
```css
.faq-preview-container {
  width: 1120px;
  height: 752px;
  margin: 128px auto 128px auto;
  position: relative;  /* Parent container */
  background: #000;
}

.faq-heading {
  position: absolute;
  top: 0;
  left: 0;
  /* ...other styles... */
}

.faq-main-question {
  position: absolute;
  top: 44.8px;
  left: 0;
  /* ...other styles... */
}

.faq-accordion {
  position: absolute;
  top: 160px;
  right: 0;
  /* ...other styles... */
}

.faq-bottom-section {
  width: 1440px;
  height: 716px;
  position: relative;  /* Parent container */
  margin: 0 auto;
  background: #000;
}

.contact-text {
  position: absolute;
  top: 128px;
  left: 160px;
  /* ...other styles... */
}

.large-vixvvo-text {
  position: absolute;
  bottom: 316.1px;
  left: 165px;
  right: 165px;
  /* ...other styles... */
}

#footer-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* ...other styles... */
}
```

This matches the exact structure from `faq-preview.html` for maximum precision.

---

## 🎨 Customization

### Change FAQ Questions/Answers:
Simply edit the text in each `.faq-item` HTML block.

### Adjust Colors:
- FAQ background: `.faq-item { background: ... }`
- Text colors: `.faq-question { color: ... }`
- Footer links: `.footer-nav-link { color: ... }`

### Modify Spacing:
- Top margin: `.faq-preview-section { margin-top: 128px; }` 
- Gap between items: `.faq-accordion { gap: 16px; }`
- Bottom section height: `.faq-bottom-section { height: 716px; }`

---

## 📱 Where to Place in Your Page

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your head content -->
  <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet">
  <style>
    /* Your existing styles */
    
    /* ADD FAQ STYLES HERE (from Step 1) */
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Your existing page content -->
    <!-- (navbar, hero, features, etc.) -->
    
    <!-- ADD FAQ HTML HERE (from Step 2) -->
    <!-- This should be the LAST thing before closing page-container -->
    
  </div>
  
  <script>
    // Your existing JavaScript
    
    // ADD FAQ JAVASCRIPT HERE (from Step 3)
  </script>
</body>
</html>
```

---

**✅ That's it! Your FAQ section should now display perfectly at the bottom of any page with a 1440px layout.**
