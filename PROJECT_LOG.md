# VIRK Tools & Equipment — Project Log

> **Auto-updated every session.** Last updated: 2026-07-09

---

## 📦 Project Context

**Project**: VIRK Tools & Equipment — Full-stack e-commerce web app for selling industrial tools.

**Stack**:
- **Frontend**: React (Vite) — runs on `http://localhost:3000`
- **Backend**: Node.js + Express — runs on `http://localhost:5000`
- **Database**: MySQL 8.4 — stored at `D:\website\creation\mysql_data`, runs on port `3306`

**Key Paths**:
- Backend root: `D:\website\creation\`
- Frontend root: `D:\website\creation\client\`
- Database data: `D:\website\creation\mysql_data\`
- Uploaded images: `D:\website\creation\src\uploads\images\`
- Start script: `D:\website\creation\start_all.bat`

**Admin Credentials**:
- URL: `http://localhost:3000/admin/login`
- Email: `admin@virktools.com`
- Password: `admin123`

---

## 🚀 How to Start the Project (After Every PC Restart)

Double-click `D:\website\creation\start_all.bat`

This starts 3 windows in order:
1. **MySQL Database** on port 3306
2. **Backend API Server** on port 5000
3. **Frontend React App** on port 3000

> ⚠️ The Windows MySQL84 service does **NOT** manage this project's database. The project uses its own MySQL data stored at `D:\website\creation\mysql_data`. Always use the `.bat` file.

---

## ✅ What Has Been Built (Completed Work)

### Admin Panel
- Full admin dashboard with sidebar navigation
- **Products**: Add, edit, delete products with images, price, brand, category, subcategory
- **Categories**: Add/edit categories with custom images that appear on the homepage
- **Orders**: View and manage customer orders
- **Excel export**: Export product/order data to `.xlsx` files

### Storefront (Customer-Facing)
- **Homepage**: Dynamic category grid — pulls category images from the database
- **Category Page** (`/category/:id`): Product listing with **advanced sidebar filters**:
  - Dynamic brand checkboxes (only shows brands present in that category)
  - Sort by: Newest / Price Low-High / Price High-Low / Name A-Z / Name Z-A
  - Min/Max price range inputs
  - Instant filtering (no "Apply" button needed)
  - "Clear All" button when filters are active
  - Shows "X of Y products" count
- **Product Detail Page**: Image gallery, price, brand, specs, subcategory selector, Add to Cart
- **Cart**: Persistent cart using `localStorage` + backend sync
- **Search**: Debounced search suggestions (500ms delay) with live dropdown results

### Image Upload System
- Admins can upload images for products and categories
- Images served statically from `/uploads/images/`
- `ProductCard` component updated to fill the card edge-to-edge (`object-cover`)

### Auth System
- Admin login with JWT tokens (stored in `localStorage`)
- Role-based access: `super_admin`, `admin`, `editor` all allowed
- Fixed bug where `super_admin` role was being incorrectly rejected at login

---

## 🐛 Known Bugs Fixed (History)

| Bug | Fix |
|-----|-----|
| Category dropdown in search not showing | Fixed API call and state management |
| Products being added and navigating to cart | `e.preventDefault()` + stay on page |
| Images uploading but not displaying | Fixed URL extraction from upload API response (`data.imageUrl`) |
| Categories hardcoded on homepage | Replaced with `api.getCategories()` dynamic fetch |
| Filter sidebar showing hardcoded brands (DeWALT, BOSCH, Makita) | Replaced with dynamic extraction from fetched products |
| Admin login failing with "Unauthorized access" | Fixed role check + added `credentials: 'include'` to fetch |
| MySQL not starting after PC restart | Created `start_all.bat` with correct `--datadir` and `--port` flags |

---

## 🔲 Next Steps / Backlog

These are features that have been discussed or are natural next steps:

- [ ] **Checkout Flow**: Full checkout page with address, payment method selection
- [ ] **Order Tracking**: Customer-facing order status page
- [ ] **Search Page**: Dedicated search results page (currently just dropdown suggestions)
- [ ] **Admin Dashboard Stats**: Charts showing revenue, top products, etc.
- [ ] **Product Reviews**: Customer review/rating system
- [ ] **Email Notifications**: Order confirmation emails
- [ ] **Make MySQL auto-start**: Configure MySQL service to automatically use the correct datadir on PC startup (would eliminate need for `.bat`)

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| [`client/src/pages/CategoryList.jsx`](file:///d:/website/creation/client/src/pages/CategoryList.jsx) | Category product listing + filters |
| [`client/src/pages/Home.jsx`](file:///d:/website/creation/client/src/pages/Home.jsx) | Homepage with dynamic categories |
| [`client/src/admin/Categories.jsx`](file:///d:/website/creation/client/src/admin/Categories.jsx) | Admin: manage categories + image upload |
| [`client/src/context/AuthContext.jsx`](file:///d:/website/creation/client/src/context/AuthContext.jsx) | Admin auth state + login logic |
| [`client/src/services/api.js`](file:///d:/website/creation/client/src/services/api.js) | All frontend API calls |
| [`client/src/components/ui/ProductCard.jsx`](file:///d:/website/creation/client/src/components/ui/ProductCard.jsx) | Category card on homepage |
| [`start_all.bat`](file:///d:/website/creation/start_all.bat) | One-click startup script |
| [`src/config/database.js`](file:///d:/website/creation/src/config/database.js) | MySQL connection config |
| [`.env`](file:///d:/website/creation/.env) | Backend environment variables |

### Performance & Security Optimizations
- **Database Efficiency**: Fixed N+1 query loops using LEFT JOINs and bulk fetching in repositories.
- **In-Memory Caching**: Implemented a 5-minute TTL cache on public routes to instantly serve categories and products without database overhead.
- **Admin Query Speed**: Stripped massive HTML payload data (long_description) from Admin List endpoints (reduced 5MB JSON to 160KB). Parallelized Admin pagination count queries using Promise.all().
- **Database Indexing**: Added composite indexes for published/featured products and admin-specific fallback indexes (created_at, deleted_at).
- **Security**: Hardened Content-Security-Policy (CSP) headers to block XSS and cross-domain misconfigurations.
- **Typo-Tolerant Searching**: Implemented pg_trgm trigram similarities along with GIN indices to support typo-tolerant fuzzy searching for products.
- **Mobile User Experience**: Injected intelligent search suggestion dropdowns across all mobile navigation variants.
- **Admin Cache Invalidation**: Enforced automatic memory cache purges whenever standard entities (Products, Brands, Categories) are modified via the Admin dashboard.
