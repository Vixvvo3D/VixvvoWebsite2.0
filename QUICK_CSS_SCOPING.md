# 🎯 CSS Scoping Quick Reference

## The Golden Rule

```
❌ NEVER:     .btn { }
✅ ALWAYS:    .your-container .btn { }
```

---

## Visual Guide

### ❌ Wrong Way:
```css
<style>
  .btn {
    padding: 10px;
  }
  
  .btn-download {
    background: blue;
  }
</style>
```

**Result:** Breaks navbar buttons! 💔

---

### ✅ Right Way:
```css
<style>
  .card-actions .btn {
    padding: 10px;
  }
  
  .card-actions .btn-download {
    background: blue;
  }
</style>
```

**Result:** Works perfectly! ✨

---

## Quick Check

Before deploying, search your page for:

```
Ctrl/Cmd + F: ".btn {"
```

If you find it → Add a container prefix!

---

## Common Containers

- `.page-content`
- `.card-actions`
- `.model-actions`
- `.button-group`
- `.action-bar`
- `#yourSection`

Pick any that makes sense for your layout.

---

## Remember:

**Generic `.btn` = BAD** 🚫  
**Scoped `.container .btn` = GOOD** ✅

---

See `docs/fixes/CSS_BUTTON_SCOPING_FIX.md` for full details.
