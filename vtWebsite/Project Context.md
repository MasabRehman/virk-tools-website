---
title: Project Context
tags: [context, setup]
---

# 📦 Project Context

[[Home|← Back to Home]]

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (custom industrial theme) |
| Backend | Node.js + Express |
| Database | MySQL 8.4 |
| Auth | JWT (access + refresh tokens) |
| Image Upload | Multer |
| Excel Export | ExcelJS |

---

## How to Start the Project

> ⚠️ **Must do this after every PC restart.**

**Double-click:** `D:\website\creation\start_all.bat`

This opens 3 windows automatically:
1. **MySQL Database** — starts on port `3306` using `D:\website\creation\mysql_data`
2. **Backend API** — starts on port `5000`
3. **Frontend** — starts on port `3000`

> ⚠️ The Windows **MySQL84** service does **NOT** work for this project. The database files are stored in the project folder, not in the default location. Always use `start_all.bat`.

---

## Admin Credentials

| Field | Value |
|-------|-------|
| URL | `http://localhost:3000/admin/login` |
| Email | `admin@virktools.com` |
| Password | `admin123` |

---

## Key File Paths

| File | Purpose |
|------|---------|
| `client/src/pages/Home.jsx` | Homepage |
| `client/src/pages/CategoryList.jsx` | Category listing + filters |
| `client/src/pages/ProductDetail.jsx` | Single product page |
| `client/src/admin/Categories.jsx` | Admin: category management |
| `client/src/admin/Products.jsx` | Admin: product management |
| `client/src/context/AuthContext.jsx` | Admin login state |
| `client/src/services/api.js` | All frontend → backend API calls |
| `client/src/components/ui/ProductCard.jsx` | Homepage category card |
| `src/config/database.js` | MySQL connection config |
| `src/routes/` | All backend API routes |
| `.env` | Database, JWT, CORS config |
| `start_all.bat` | One-click startup |

---

## Database

- **Engine**: MySQL 8.4
- **Database name**: `virk_tools_db`
- **Data directory**: `D:\website\creation\mysql_data`
- **Port**: `3306`
- **User**: `root` (no password)

### Key Tables

| Table | Description |
|-------|-------------|
| `admins` | Admin user accounts |
| `products` | Product catalog |
| `categories` | Product categories (with image URLs) |
| `subcategories` | Subcategories linked to categories |
| `brands` | Brand names |
| `orders` | Customer orders |
| `order_items` | Items within each order |
| `cart` / `cart_items` | Shopping cart |
| `users` | Customer accounts |
