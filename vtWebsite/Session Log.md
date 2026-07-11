---
title: Session Log
tags: [log, history]
---

# 📋 Session Log

[[Home|← Back to Home]]

> Tracks what was done each session and what comes next.

---

## Session 8 — 2026-07-09

### ✅ What Was Done
- Created Obsidian vault at `D:\website\creation\vtWebsite\`
- Set up 5 interlinked notes: Home, Project Context, Session Log, Bug Tracker, Backlog
- Fixed vault being empty (Obsidian was pointed at `vtWebsite/` subfolder — moved notes in and removed default sample files)
- Configured `workspace.json` to open `Home.md` by default on launch
- Committed to auto-updating Obsidian notes after every session going forward
- Changed homepage categories grid from **4 columns → 5 columns** per row (`lg:grid-cols-5` in `Home.jsx`)
- Built the **Download Product Catalog PDF** feature:
  - Installed `pdfkit`
  - Created `catalogService.js` to dynamically generate a branded PDF grouped by category, showing images, SKUs, and prices
  - Added public API route `/api/v1/catalog/download`
  - Added download buttons to the **Storefront Homepage** and the **Admin Products** page
- Scraped 35 INGCO products from the website and inserted them into the database

### 🔜 Next Steps
- Continue with whatever the user requests next
- Keep updating this log and [[Bug Tracker]] / [[Backlog]] automatically

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

## Session 9 � 2026-07-09

### ? What Was Done
- Initialized Git repository and pushed full source code to GitHub.
- Set up **Vercel** for continuous deployment of the React frontend.
  - Configured Vercel's Root Directory to `client`.
  - Triggered automatic builds on push to the `main` branch.
- Integrated **Supabase** for PostgreSQL database hosting in the cloud.
- Set up **Render** for Node.js/Express backend hosting.
  - Configured Render to install and start the Express server.
- Fixed a production CORS issue where the Vercel dynamic URLs were being blocked by the Express backend by configuring the CORS middleware to accept any `*.vercel.app` origin.
- Updated the frontend API endpoint to dynamically use the live Render URL.

### ?? Next Steps
- Ensure all features work flawlessly in the live production environment.
- Update architecture documentation to reflect the new separated Vercel/Render hosting strategy.


- Fixed a critical production bug where the 'Add to Cart' functionality was failing because cross-origin session cookies were being blocked by the browser. Updated the Express backend to append \SameSite=None\ and \Secure=true\ headers to all session cookies.


- Removed the redundant large yellow 'Download Catalog' box from the Homepage promotional strip.
- Replaced it with a 4th dark-styled feature box ('100% Genuine - Authentic Brands') to match the aesthetics of the other three boxes, creating a clean 4-column grid layout.


- Refactored Homepage mobile layout to precisely match the provided Figma mockup.
  - Moved Hero Image to the top of the mobile screen.
  - Converted Hero Trust Badges to a 2x2 grid layout on mobile screens.
  - Updated the Promotional Strip (Bulk Orders, etc.) to be a 2x2 grid on mobile with left-aligned icons and proper mobile borders.


- Further refined mobile layout to match the Figma mockups:
  - Hidden TopBar and CategoryRibbon on mobile screens.
  - Added a visible mobile Search Bar below the Header logo.
  - Left-aligned Hero text on mobile to match the design.
  - Repositioned the 'BROWSE CATEGORIES' heading to sit directly above the Trust Badges on mobile.


- Updated Mobile Grids and Drawer:
  - Switched Categories, Featured Products, and Category Product listings from 1-column to 2-columns on mobile screens.
  - Moved 'Admin Portal Login' to the very top of the mobile hamburger menu so it is instantly visible without scrolling.


- Admin Panel Mobile Optimization:
  - Dashboard stats cards are now a 2x2 grid on mobile screens (instead of extremely wide 1x4 stacks).
  - Scaled down Dashboard font sizes and paddings to ensure numbers fit nicely on small screens.
  - Fixed Categories page layout so Categories and Subcategories panels now stack vertically on mobile rather than trying to cram side-by-side.


- Mobile Drawer and Nav fixes:
  - Fixed the mobile drawer scroll behavior so the 'Categories' list scrolls independently while the 'Admin Portal Login' remains permanently anchored to the bottom.
  - Restored the horizontally scrollable Category Ribbon to the mobile layout as requested.


- Category Ribbon Placement fix:
  - Moved the Category Ribbon from the global layout into the Homepage directly below the Hero Image section, as requested.


- Security & ZAP Report fixes:
  - Resolved missing security headers flagged by OWASP ZAP by adding a vercel.json configuration.
  - Added Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Cache-Control headers to the Vercel edge.


- Final ZAP Report Fixes:
  - Locked down Content-Security-Policy (CSP) by removing all 'unsafe-inline' rules for scripts and styles.
  - Added strict base-uri, form-action, and frame-src directives to CSP.
  - Enforced Access-Control-Allow-Origin to explicitly block Cross-Domain Misconfigurations.
  - Integrated @small-tech/vite-plugin-sri to inject cryptographic Subresource Integrity (SRI) hashes into all compiled React JS/CSS files.


- Build fix:
  - Removed the SRI injection plugin from Vite as it was causing ESM/cheerio module resolution failures during Vercel's remote build pipeline.


- Image Loading fixes:
  - Resolved broken images on Vercel deployment by removing hardcoded 'localhost:5000' URLs from the frontend codebase.
  - Added a Vercel reverse proxy rewrite rule to transparently forward '/uploads' image requests to the live Render backend.
  - Whitelisted the placehold.co domain in the strict Content-Security-Policy to allow fallback product images to load properly.


- Supabase Image Loading fixes:
  - Identified that the backend images had been migrated to Supabase storage.
  - Whitelisted the 'rgxzsqlqesspabksmuwm.supabase.co' domain in the strict Content-Security-Policy so Vercel allows the images to render.


- Admin Panel Mobile Layout Fix:
  - Fixed overlapping header elements (title vs buttons) and search bar on the Products and Dashboard pages specifically for mobile layouts without affecting the desktop view.


- Mobile Homepage Polish:
  - Scaled down the ProductCard text size and height gracefully on mobile so that 3 categories comfortably fit in a single row without breaking the layout.
  - Unhid the TopBar on mobile devices. Re-styled it to wrap its items neatly instead of stacking vertically, creating a presentable ribbon for contact info and links on mobile screens.


- Database API Performance Optimizations:
  - Fixed an N+1 query vulnerability in the category service by parallelizing bulk fetches and mapping relations in-memory, eliminating dozens of unnecessary database round-trips.
  - Implemented an intelligent Node.js in-memory caching system (5-minute TTL) for static frontend data (Brands, Categories, Featured Products) to instantly serve data without hitting the remote Supabase pooler.
  - Refactored correlated subqueries into much more efficient standard PostgreSQL LEFT JOINs inside the product repository.
  - Created and executed SQL migration scripts to add composite indexes (idx_products_published_disabled and idx_products_featured) on the products table.

- Admin Panel Database Optimizations:
  - Pared down the payload size of the Admin Panel products table by actively stripping massive HTML long_description data from the list view query, dropping the payload size from ~5MB down to ~160KB.
  - Parallelized the pagination COUNT(*) queries and the main data SELECT queries using Promise.all() for both the Admin Products and Admin Orders views to cut execution time in half.
  - Added Admin-specific database indexes on the deleted_at and created_at columns to optimize large table pagination counts.

- Dynamic Admin Settings Panel:
  - Created a database-backed Settings Dashboard enabling configuration of contact info, social links, and navigation popup content directly from the Admin Panel.
  - Updated the TopBar to dynamically fetch and display this data, and rendered beautiful popups for navigation links (About Us, etc.).
  - Resolved Content Security Policy (CSP) errors on the Settings panel by allowing 'unsafe-inline' styles within the Express Helmet configuration.

- Intelligent Caching Implementation:
  - Introduced automatic cache invalidation (cache.clear()) across Product, Category, and Brand controllers.
  - The storefront now accurately reflects Admin modifications instantaneously while maintaining zero-latency memory loads.

- Search Functionality Optimization:
  - Abstracted the Suggestions Dropdown UI in Header.jsx and implemented it gracefully for both mobile search views.
  - Added PostgreSQL pg_trgm extension and a GIN trigram index on product names.
  - Refactored the backend search logic to use ILIKE for case-insensitivity and similarity() thresholds for typo-tolerant (fuzzy) searching.
