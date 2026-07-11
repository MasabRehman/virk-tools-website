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
| 13 | 2026-07-09 | Unterminated JSX contents in `Products.jsx` | Accidentally deleted a closing `</div>` tag while adding the "Download Catalog PDF" button | Restored the missing `</div>` tag to properly close the header layout |
| 2026-07-09 | Bug | Backend | Main page featured products SQL crash (`near ''4''`) | **Root Cause:** `req.query.limit` was passing a string to a prepared statement LIMIT clause | **Fix:** Parsed the limit as an integer (`parseInt(req.query.limit, 10)`) in `productController.js` |
| 2026-07-09 | Bug | Backend | Backend crashes entirely when editing frontend React code | **Root Cause:** `node --watch` in `package.json` was watching the entire project folder (including `client/`). When I edited `Home.jsx` to fix the button, `node` restarted the backend too quickly, causing an `EADDRINUSE` port 5000 crash and taking the whole API offline. This is why the main page button didn't work. | **Fix:** Updated `package.json` dev script to `node --watch-path=./src --watch-path=./server.js server.js` so it only watches backend files. Killed the stuck process on port 5000 and restarted the backend. |

---

## Known Issues (Not Yet Fixed)

| Issue | Notes |
|-------|-------|
| Windows MySQL84 service doesn't use project database | Service is configured with wrong datadir. Would need admin access to fix the service. Current workaround: use `start_all.bat` |

## ?? Bug: Add to Cart Failing in Production
**Status:** ? Fixed
**Date:** 2026-07-09
**Issue:** The 'Add to Cart' button worked locally but failed on the live Vercel deployment. The server logs showed no errors, but the session token was missing on subsequent requests.
**Root Cause:** The backend (Render) and frontend (Vercel) are on different domains. Modern browsers block cross-site cookies by default. The session cookie was missing the required \SameSite=None\ and \Secure=true\ attributes.
**Fix:** Modified \cartController.js\ and \uthController.js\ to detect if \NODE_ENV === 'production'\ and dynamically append the correct Cross-Origin cookie headers.


## ?? Bug: Cart still failing due to strict browser tracking prevention
**Status:** ? Fixed
**Date:** 2026-07-09
**Issue:** Even after adding SameSite=None and Secure=true, strict browsers (like Safari) and Incognito modes forcibly block all Cross-Site cookies to prevent tracking. Express also ignored the \Secure\ flag because it was behind Render's load balancer without \	rust proxy\ enabled.
**Fix:** 
1. Added \pp.set('trust proxy', 1)\ in Express so it knows it is running securely behind Render.
2. Built a fail-proof **localStorage fallback**. The backend now returns the \session_token\ inside the JSON response body. The React frontend intercepts this, saves it in \localStorage\, and manually attaches an \X-Cart-Session\ header to all future cart requests, entirely bypassing the browser's cookie-blocking engines!


## ?? Bug: Custom header blocked by CORS Preflight
**Status:** ? Fixed
**Date:** 2026-07-09
**Issue:** The newly added \x-cart-session\ header used for the localStorage fallback triggered a CORS preflight (OPTIONS) request. The backend rejected it because the header was not explicitly listed in the \Access-Control-Allow-Headers\ CORS configuration.
**Fix:** Added \'x-cart-session'\ to the \llowedHeaders\ array in \src/app.js\ and deployed.


## ?? Bug: Checkout throwing 404 Not Found
**Status:** ? Fixed
**Date:** 2026-07-09
**Issue:** The checkout API was returning a 404 Not Found error because the newly implemented \x-cart-session\ header was not being sent by the frontend during checkout, nor was the backend looking for it in the checkout controller.
**Fix:** Updated \orderController.js\ to extract the session token from the custom header, and updated the frontend's \pi.js\ checkout method to append the header to the POST request.

