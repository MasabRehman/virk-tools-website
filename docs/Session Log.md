---
title: Session Log
tags: [log, history]
---

# 📋 Session Log

[[Home|← Back to Home]]

> Tracks what was done each session and what comes next.

---

## Session 7 — 2026-07-09

### ✅ What Was Done
- Fixed admin login failing after PC restart
- Identified root cause: `start_all.bat` was not starting MySQL with the correct `--datadir` pointing to the project's database files
- Fixed `start_all.bat` to use `--datadir="D:\website\creation\mysql_data"` and `--port=3306` with `--bind-address=127.0.0.1`
- Fixed `AuthContext.jsx`: admin login was silently throwing "Unauthorized access" because the error wasn't being surfaced properly
- Added `credentials: 'include'` to the `adminLogin` fetch call in `api.js`
- Improved error reporting in admin login (now shows the actual server error instead of "Login failed")
- Created this Obsidian vault

### 🔜 Next Steps
- Verify admin login works end-to-end in browser
- Continue building features from [[Backlog]]

---

## Session 6 — 2026-07-07

### ✅ What Was Done
- Fixed MySQL not auto-starting after PC restart
- Created `start_all.bat` one-click startup script
- Explained three ways to view the database manually (VS Code extension, MySQL Workbench, CLI)

---

## Session 5 — 2026-07-07

### ✅ What Was Done
- Added advanced filtering & sorting to the Category Results page:
  - Dynamic brand checkboxes extracted from real product data
  - Sort by: Newest / Price Low-High / Price High-Low / Name A-Z / Name Z-A
  - Min/Max price range inputs
  - Instant live filtering (no "Apply" button)
  - "Clear All" button when filters are active
  - Shows "X of Y products" count

---

## Session 4 — 2026-07-06

### ✅ What Was Done
- Fixed category image upload — images were uploading but URL not being extracted correctly from API response
- Added Edit button to categories table in admin panel
- Added image upload field to Add/Edit Category modal
- Updated Homepage to dynamically fetch categories from the database (previously hardcoded)
- Updated `ProductCard` to fill the card with `object-cover` (full bleed image) instead of centered padded image

---

## Session 3 — 2026-07-06

### ✅ What Was Done
- Fixed search: debounced with 500ms delay, gives suggestions while typing
- Fixed "Add to Cart" navigating away from product page — now stays on page and shows alert
- Fixed category dropdown in search bar not loading options
- Fixed products not being added to Excel export

---

## Session 2 — 2026-07-06

### ✅ What Was Done
- Fixed subcategory system: subcategories now appear as a dropdown on the product detail page (not listed as attributes)
- Fixed category filter in search not working

---

## Session 1 — 2026-07-06

### ✅ What Was Done
- Initial project setup and full feature build
- Complete admin panel (Products, Categories, Orders, Brands, Subcategories)
- Full storefront (Homepage, Category pages, Product Detail, Cart)
- Auth system with JWT
- Image upload system
