# feature.md — StockFlow Feature Specification

Companion to `AGENT.md`. This file defines WHAT to build: modules, data model,
API, screens, and build phases. Follow the phases in order.

---

## 1. Overview

**StockFlow** is an inventory and order management system for a small
business. Staff manage products, suppliers, stock, purchase orders (restock),
and sales orders (customers), and view a dashboard with reports.

**Out of scope:** payments, email/SMS, multi-warehouse, barcode scanning,
real-time updates, file uploads.

---

## 2. User roles

| Role | Can do |
|---|---|
| `admin` | Everything, including user management, deleting categories/suppliers |
| `staff` | Products, stock, purchase orders, sales orders, reports (read) |

The first registered user becomes `admin`. Later users are `staff` by default;
admin can change roles.

---

## 3. Modules and core functions

### 3.1 Auth and users
- Register, login, get current user (`/me`)
- Password hashed with bcrypt; JWT returned on login
- Admin: list users, change role, activate/deactivate user
- Deactivated users cannot log in

### 3.2 Categories
- CRUD (delete only if no product uses it)
- Unique name

### 3.3 Suppliers
- CRUD with name, contact name, email, phone, address
- Supplier detail shows the products it supplies

### 3.4 Products
- Create/edit: SKU (unique), name, category, supplier, cost price, sale
  price, reorder level, initial quantity
- List with search (name/SKU), filter by category, filter "low stock only",
  pagination, sorting
- Archive / unarchive (soft delete)
- Product detail shows the recent stock movements

### 3.5 Stock management
- Current quantity per product
- Manual adjustment (`ADJUSTMENT`, positive or negative, reason required)
- Stock movement history, filterable by product and date
- Low-stock list: `quantity <= reorderLevel`

### 3.6 Purchase orders (restock)
- Create with supplier and line items (product, quantity, unit cost)
- Status: `draft → ordered → received`
- Edit only while `draft`
- Receive: adds stock for each item and records `IN` movements
- Auto-generated number, e.g. `PO-2026-0001`

### 3.7 Sales orders
- Create with customer name/phone and line items (product, quantity)
- Server fills in name, SKU, and price snapshot and calculates the total
- Status: `pending → confirmed → completed`, or `cancelled`
- Confirm: deduct stock atomically; fail with 409 if any item lacks stock
- Cancel a confirmed order: restore stock
- Auto-generated number, e.g. `SO-2026-0001`

### 3.8 Dashboard and reports
- Summary cards: total products, low-stock count, orders today, revenue this
  month
- Sales per day for a date range (aggregation, `$group` by date)
- Top-selling products (aggregation, `$unwind` items, `$group`, `$sort`,
  `$limit`)
- Stock value: sum of `quantity * costPrice` (aggregation)

---

## 4. Data model (Mongoose)

```
User
  name, email (unique), passwordHash (select:false),
  role: 'admin' | 'staff', isActive, timestamps

Category
  name (unique), description

Supplier
  name, contactName, email, phone, address, timestamps

Product
  sku (unique, uppercase), name, description,
  category -> Category, supplier -> Supplier,
  costPrice, salePrice, quantity (>= 0), reorderLevel,
  isArchived, timestamps
  indexes: sku unique; text index on name; category

StockMovement
  product -> Product,
  type: 'IN' | 'OUT' | 'ADJUSTMENT',
  quantity (signed change), reason,
  refType: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'MANUAL',
  refId, createdBy -> User, createdAt
  index: { product: 1, createdAt: -1 }

PurchaseOrder
  poNumber (unique), supplier -> Supplier,
  status: 'draft' | 'ordered' | 'received',
  items: [{ product -> Product, name, sku, quantity, unitCost }],
  total, createdBy -> User, orderedAt, receivedAt, timestamps

SalesOrder
  orderNumber (unique), customerName, customerPhone,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  items: [{ product -> Product, name, sku, quantity, unitPrice }],
  total, createdBy -> User, timestamps
  index: createdAt
```

**Design notes (put these in the README):**
- Order items are **embedded** with a snapshot, because they belong to one
  order and must not change when the product changes.
- Products, suppliers, and users are **referenced**, because they change
  independently.
- `StockMovement` is a separate collection (audit log); `Product.quantity`
  is the fast-read current value.

---

## 5. REST API (base path `/api/v1`)

| Module | Method and path | Access |
|---|---|---|
| Auth | `POST /auth/register` | public |
| | `POST /auth/login` | public |
| | `GET /auth/me` | any user |
| Users | `GET /users` | admin |
| | `PATCH /users/:id/role` | admin |
| | `PATCH /users/:id/status` | admin |
| Categories | `GET /categories` | any user |
| | `POST /categories` | any user |
| | `PUT /categories/:id` | any user |
| | `DELETE /categories/:id` | admin |
| Suppliers | `GET /suppliers`, `GET /suppliers/:id` | any user |
| | `POST /suppliers`, `PUT /suppliers/:id` | any user |
| | `DELETE /suppliers/:id` | admin |
| Products | `GET /products?search=&category=&lowStock=&page=&limit=&sort=` | any user |
| | `POST /products` | any user |
| | `GET /products/:id` | any user |
| | `PUT /products/:id` | any user |
| | `PATCH /products/:id/archive` | any user |
| Stock | `GET /stock/low` | any user |
| | `GET /stock/movements?product=&from=&to=&page=` | any user |
| | `POST /stock/adjust` | any user |
| Purchase orders | `GET /purchase-orders`, `GET /purchase-orders/:id` | any user |
| | `POST /purchase-orders` | any user |
| | `PUT /purchase-orders/:id` (draft only) | any user |
| | `PATCH /purchase-orders/:id/order` | any user |
| | `PATCH /purchase-orders/:id/receive` | any user |
| Sales orders | `GET /sales-orders`, `GET /sales-orders/:id` | any user |
| | `POST /sales-orders` | any user |
| | `PATCH /sales-orders/:id/confirm` | any user |
| | `PATCH /sales-orders/:id/complete` | any user |
| | `PATCH /sales-orders/:id/cancel` | any user |
| Reports | `GET /reports/summary` | any user |
| | `GET /reports/sales?from=&to=` | any user |
| | `GET /reports/top-products?limit=` | any user |
| | `GET /reports/stock-value` | any user |

"Any user" means any authenticated user (`admin` or `staff`).

---

## 6. Frontend screens

| Route | Screen | Notes |
|---|---|---|
| `/login`, `/register` | Auth forms | Redirect to dashboard on success |
| `/` | Dashboard | Summary cards, sales chart (simple), low-stock list |
| `/products` | Product list | Search, filters, pagination, add/edit modal, archive |
| `/products/:id` | Product detail | Info and stock movement history |
| `/categories` | Categories | Simple table + modal |
| `/suppliers` | Suppliers | Table + modal, detail with products |
| `/stock` | Stock | Low-stock list, adjust form, movement history |
| `/purchase-orders` | PO list and create | Status badges, receive button |
| `/sales-orders` | Sales order list and create | Status badges, confirm/cancel buttons |
| `/reports` | Reports | Sales by date, top products, stock value |
| `/users` | User management | Admin only (RoleRoute) |

Layout: left sidebar, top bar with user name and logout. Clean and simple.

---

## 7. Build phases (do them in order, one at a time)

### Phase 1 — Setup
- [ ] Monorepo folders, `.gitignore`, `.env.example`, ESLint, Prettier
- [ ] Express app, MongoDB connection, `/api/v1/health` endpoint
- [ ] `ApiError`, `asyncHandler`, `errorHandler`, `notFound`, response helper
- [ ] Vite React app with Tailwind, Router, axios instance

### Phase 2 — Auth and users
- [ ] User model, register, login, `/me`
- [ ] `auth` and `role` middleware
- [ ] Zod validation middleware
- [ ] Frontend: login/register pages, `AuthContext`, `ProtectedRoute`,
      `RoleRoute`, app layout with sidebar

### Phase 3 — Categories, suppliers, products
- [ ] Models, validators, controllers, services, routes
- [ ] Search, filters, pagination, sorting, archive
- [ ] Frontend: category, supplier, and product pages with modals

### Phase 4 — Stock
- [ ] `stock.service.js`: `adjustStock`, `increaseStock`, `decreaseStock`
      (atomic), `createMovement`
- [ ] Stock endpoints (low stock, movements, adjust)
- [ ] Frontend: stock page, product detail movement history

### Phase 5 — Purchase orders
- [ ] Model, number generator, create/edit/order/receive
- [ ] Receive increases stock via `stock.service.js`
- [ ] Frontend: PO list, create form with line items, receive action

### Phase 6 — Sales orders
- [ ] Model, number generator, create/confirm/complete/cancel
- [ ] Confirm and cancel use a MongoDB session (transaction)
- [ ] Frontend: sales order list, create form, status actions

### Phase 7 — Dashboard and reports
- [ ] Summary, sales-by-date, top-products, stock-value aggregations
- [ ] Frontend: dashboard cards, simple charts (a small chart library is
      allowed here, ask first), reports page

### Phase 8 — Quality and delivery
- [ ] Seed script: admin + staff users, 5 categories, 3 suppliers,
      about 30 products, sample orders
- [ ] Jest + Supertest tests: auth, product create (duplicate SKU), sales
      order confirm (insufficient stock), purchase order receive
- [ ] Rate limiting, helmet, CORS configured
- [ ] Deploy: MongoDB Atlas, server on Render, client on Vercel
- [ ] README (see Section 8), screenshots, Postman collection in `docs/`

---

## 8. README checklist (final deliverable)

- Project overview and feature list
- Tech stack
- Screenshots (dashboard, products, orders)
- Architecture: folder structure and layering diagram
- Data model summary and the embedded vs referenced decisions
- How stock consistency is handled (atomic update and transactions)
- API endpoint table
- Setup steps (clone, env, install, seed, run)
- Demo accounts (admin and staff) and live links
- Honest note: the author comes from Next.js and PostgreSQL, and built this
  project to apply that experience to Express and MongoDB
- Future improvements: payments, multi-warehouse, barcode, email alerts,
  real-time updates

---

## 9. Acceptance tests (manual)

1. Register the first user: becomes admin. Second user: staff.
2. Create a product with a duplicate SKU: 409.
3. Create a sales order for more than the available stock, then confirm: 409,
   stock unchanged.
4. Confirm a valid sales order: quantity decreases and an `OUT` movement
   exists.
5. Cancel that order: quantity restored and an `IN` movement exists.
6. Receive a purchase order twice: the second attempt returns 409.
7. Staff user calls `GET /users`: 403.
8. Change a product price after an order exists: the old order keeps its
   original price.
9. Product list with 50+ items paginates correctly and search works.
10. Dashboard totals match the data.
