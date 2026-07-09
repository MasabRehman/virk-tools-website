---
title: Backlog
tags: [backlog, features, todo]
---

# 🔲 Backlog

[[Home|← Back to Home]]

> Features to be built, ordered roughly by priority.

---

## 🔴 High Priority

- [ ] **Checkout Flow** — Full checkout page: shipping address, payment method, order confirmation
- [ ] **Order Status Page** — Customer can view their order status after placing an order
- [ ] **Fix MySQL Auto-Start** — Configure the MySQL84 service to use the correct datadir so `start_all.bat` is no longer needed after a restart

---

## 🟡 Medium Priority

- [ ] **Dedicated Search Results Page** — Currently only dropdown suggestions; needs a full `/search?q=` results page
- [ ] **Admin Dashboard Charts** — Revenue graph, top-selling products, order counts
- [ ] **Product Stock Management** — Track inventory count per product, show "Out of Stock" badge
- [ ] **Related Products** — Show "You May Also Like" section on product detail page
- [ ] **Pagination** — Add pagination or infinite scroll to category pages with many products

---

## 🟢 Low Priority / Nice to Have

- [ ] **Customer Reviews** — Star rating + text review system per product
- [ ] **Email Notifications** — Order confirmation emails using Nodemailer or similar
- [ ] **Wishlist** — Save products for later
- [ ] **Promo Codes / Discounts** — Apply discount codes at checkout
- [ ] **Multi-image Upload for Categories** — Currently only one image per category
- [ ] **Admin Activity Log UI** — View the `activity_log` table from the admin panel
- [ ] **Mobile Navigation Drawer** — Improve mobile nav UX with a proper slide-in drawer

---

## ✅ Completed Features

- Full admin panel (Products, Categories, Orders, Brands, Subcategories)
- Image upload for products and categories
- Homepage with dynamic category grid
- Category product listing with advanced filters (brand, price, sort)
- Product detail page (gallery, specs, subcategory selector, add to cart)
- Shopping cart (localStorage + backend sync)
- Debounced search with live suggestions
- Admin login with JWT auth
- Excel export for products/orders
- One-click `start_all.bat` startup script
