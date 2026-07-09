---
title: Bug Tracker
tags: [bugs, fixes]
---

# 🐛 Bug Tracker

[[Home|← Back to Home]]

> Every bug discovered and how it was fixed.

---

## Fixed Bugs

| # | Date | Bug | Root Cause | Fix |
|---|------|-----|-----------|-----|
| 1 | 2026-07-06 | Subcategories showing as product attributes instead of a dropdown | Rendering logic was displaying subcategories inline | Moved subcategories to a proper `<select>` dropdown on product detail page |
| 2 | 2026-07-06 | Nothing being added to Excel file | Export function wasn't being called correctly | Fixed the API route and controller for Excel export |
| 3 | 2026-07-06 | Category dropdown in search bar not showing | State wasn't being populated from the API | Fixed `useEffect` fetching categories into dropdown options |
| 4 | 2026-07-06 | Search not returning results | Query params not passed correctly to backend | Fixed filter params in `getProducts()` call |
| 5 | 2026-07-06 | "Add to Cart" button navigating away to cart page | No `e.preventDefault()`, and navigation called after add | Added `preventDefault()`, removed redirect — stays on page and shows alert |
| 6 | 2026-07-06 | Search suggestions showing immediately on every keystroke | No debounce implemented | Added 500ms debounce using `useRef` timeout |
| 7 | 2026-07-06 | Category image not uploading | URL was being read from wrong field in API response (`res.url` instead of `res.data.imageUrl`) | Fixed field extraction with fallback chain: `uploadRes.data?.imageUrl \|\| uploadRes.imageUrl` |
| 8 | 2026-07-06 | Category images not showing on homepage | Homepage used hardcoded category array | Replaced with `api.getCategories()` dynamic fetch, passed `image_url` to `ProductCard` |
| 9 | 2026-07-06 | Category card image was small & padded | `ProductCard` used `w-48 h-48 object-contain` with padding | Changed to `w-full h-56 object-cover overflow-hidden` for full-bleed card image |
| 10 | 2026-07-06 | Category filter sidebar showed hardcoded brands (DeWALT, BOSCH, Makita) | Brands were hardcoded in JSX | Replaced with dynamic extraction: `[...new Set(allProducts.map(p => p.brand_name))]` |
| 11 | 2026-07-09 | Admin login failing after PC restart | MySQL84 Windows service uses wrong datadir; `start_all.bat` wasn't passing `--datadir` flag | Updated `start_all.bat` to explicitly pass `--datadir="D:\website\creation\mysql_data" --port=3306 --bind-address=127.0.0.1` |
| 12 | 2026-07-09 | Admin login showing silent "Unauthorized" error | `api.js` was throwing generic "Login failed" masking the real error | Added `credentials: 'include'` and proper error parsing from response JSON |

---

## Known Issues (Not Yet Fixed)

| Issue | Notes |
|-------|-------|
| Windows MySQL84 service doesn't use project database | Service is configured with wrong datadir. Would need admin access to fix the service. Current workaround: use `start_all.bat` |
