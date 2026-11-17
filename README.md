# StockFlow — Inventory & Order Management System

A full-stack MERN inventory and order management application for small businesses. Staff manage products, categories, suppliers, stock adjustments, purchase orders (restock), and sales orders (customers), while tracking KPIs and reports on a live dashboard.

---

## Features

- **Authentication & Role-Based Access (`admin` / `staff`)**: JWT auth with `bcryptjs` password hashing. The first registered user becomes `admin`; subsequent users default to `staff`. Admins can manage user roles, activate/deactivate accounts, and delete categories/suppliers.
- **Catalog Management**: Categories, Suppliers (with supplied products detail), and Products with SKU uniqueness, search, category/low-stock filtering, pagination, sorting, and soft-delete archiving.
- **Stock Management**: Dedicated `stock.service.js` ownership of `Product.quantity`, low-stock alerts (`quantity <= reorderLevel`), manual adjustments (`ADJUSTMENT`), and filterable audit history (`StockMovement`).
- **Purchase Orders (`draft → ordered → received`)**: Auto-numbered (`PO-YYYY-0001`), editable while `draft`, and transactional receiving that atomically increases stock and logs `IN` movements.
- **Sales Orders (`pending → confirmed → completed` or `cancelled`)**: Auto-numbered (`SO-YYYY-0001`), server-side price/total calculation and item snapshots, transactional confirmation (atomic stock check + deduction), and transactional cancellation (restores stock if `confirmed`).
- **Dashboard & Reports**: KPI summary cards, 30-day sales chart, top-selling products, and inventory cost/retail valuation by category using MongoDB aggregation pipelines.
- **Security & Tooling**: `helmet`, `cors`, `express-rate-limit`, Zod request validation, central error handler, ESLint, Prettier, and Jest + Supertest integration tests.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, TanStack Query, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5, Zod, JWT (`jsonwebtoken`), `bcryptjs` |
| Database | MongoDB Atlas, Mongoose 9 |
| Testing & Quality | Jest, Supertest, ESLint, Prettier |

---

## Architecture

### Folder Structure

```text
StockFlow/
├── client/src/
│   ├── api/            # Axios instance + module API clients
│   ├── components/     # Reusable UI (Modals, Pagination, Tables, Charts, StatCard)
│   ├── context/        # AuthContext
│   ├── hooks/          # useAuth
│   ├── pages/          # Route-level screens
│   └── routes/         # ProtectedRoute, RoleRoute
├── server/src/
│   ├── config/         # db.js, env.js
│   ├── models/         # Mongoose schemas
│   ├── validators/     # Zod schemas
│   ├── middleware/     # auth, validate, rateLimiter, errorHandler, notFound
│   ├── controllers/    # Thin HTTP handlers
│   ├── services/       # Business logic (stock.service.js, order services, reports)
│   ├── routes/         # Express routers
│   ├── seed/           # Demo seed script
│   ├── utils/          # ApiError, asyncHandler, response, orderNumber
│   ├── app.js          # Express app (exportable for tests)
│   └── server.js       # DB connection + HTTP listener
├── docs/               # Postman collection (& screenshots)
└── README.md
```

### Request Layering

```text
route → middleware (auth, validate, rateLimiter) → controller → service → model
```

- **Strict Stock Ownership**: Only `server/src/services/stock.service.js` writes to `Product.quantity`, ensuring every quantity change is paired with an immutable `StockMovement` audit record.

---

## Data Model & Design Decisions

| Collection | Purpose |
|---|---|
| `User` | Staff and admin accounts (`passwordHash` excluded with `select: false`) |
| `Category` | Unique product categories |
| `Supplier` | Supplier contact details |
| `Product` | SKU (unique uppercase), pricing, `quantity >= 0`, `reorderLevel`, `isArchived` |
| `StockMovement` | Immutable audit log (`IN`, `OUT`, `ADJUSTMENT`) with `{ product: 1, createdAt: -1 }` index |
| `PurchaseOrder` | Restock orders with embedded item snapshots and `PO-YYYY-0001` numbering |
| `SalesOrder` | Customer orders with embedded item snapshots and `SO-YYYY-0001` numbering |

### Embedded vs. Referenced Decisions

- **Order items are embedded with a snapshot** (`product`, `name`, `sku`, `unitPrice` / `unitCost`) because line items belong strictly to one order and historical orders must never change if a product's price or name is updated later.
- **Products, categories, suppliers, and users are referenced** (`ObjectId`) because they are shared entities updated independently.
- **`StockMovement` is a separate collection** rather than an array inside `Product` so the audit log can grow indefinitely without hitting MongoDB's 16 MB document limit, while `Product.quantity` acts as a fast-read current balance.

### Stock Consistency (Atomic Updates & Transactions)

- **Atomic conditional deduction**: `decreaseStock` uses `Product.findOneAndUpdate({ _id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } })`. If `null` is returned, stock is insufficient (`409 Conflict`), preventing negative stock under concurrent requests.
- **Multi-item transactions**: `confirmSalesOrder`, `cancelSalesOrder`, and `receivePurchaseOrder` run inside `mongoose.startSession()` + `session.withTransaction(...)`. If any item in a multi-line sales order lacks stock, the entire transaction rolls back cleanly.

---

## API Endpoints (`/api/v1`)

| Module | Endpoints | Access |
|---|---|---|
| Health | `GET /health` | Public |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public / Auth |
| Users | `GET /users`, `PATCH /users/:id/role`, `PATCH /users/:id/status` | Admin |
| Categories | `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | Auth / Admin (DELETE) |
| Suppliers | `GET /suppliers`, `GET /suppliers/:id`, `POST /suppliers`, `PUT /suppliers/:id`, `DELETE /suppliers/:id` | Auth / Admin (DELETE) |
| Products | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `PATCH /products/:id/archive` | Auth |
| Stock | `GET /stock/low`, `GET /stock/movements`, `POST /stock/adjust` | Auth |
| Purchase Orders | `GET /purchase-orders`, `GET /purchase-orders/:id`, `POST /purchase-orders`, `PUT /purchase-orders/:id`, `PATCH /purchase-orders/:id/order`, `PATCH /purchase-orders/:id/receive` | Auth |
| Sales Orders | `GET /sales-orders`, `GET /sales-orders/:id`, `POST /sales-orders`, `PATCH /sales-orders/:id/confirm`, `PATCH /sales-orders/:id/complete`, `PATCH /sales-orders/:id/cancel` | Auth |
| Reports | `GET /reports/summary`, `GET /reports/sales`, `GET /reports/top-products`, `GET /reports/stock-value` | Auth |

A ready-to-import Postman collection is included at [docs/StockFlow.postman_collection.json](docs/StockFlow.postman_collection.json).

---

## Local Setup

1. **Clone & install dependencies**
   ```bash
   git clone <your-repo-url>
   cd StockFlow
   npm --prefix server install
   npm --prefix client install
   ```

2. **Configure environment variables**
   - `server/.env`:
     ```env
     PORT=5000
     MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
     JWT_SECRET=replace_with_a_strong_secret
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```
   - `client/.env`:
     ```env
     VITE_API_URL=http://localhost:5000/api/v1
     ```

3. **Seed demo data**
   ```bash
   npm --prefix server run seed
   ```

4. **Run in development**
   ```bash
   npm --prefix server run dev
   npm --prefix client run dev
   ```

5. **Run tests**
   ```bash
   npm --prefix server test
   ```

---

## Demo Accounts (after running `npm --prefix server run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@stockflow.dev` | `Admin123!` |
| Staff | `staff@stockflow.dev` | `Staff123!` |

## Deployment Guide

- **Database (MongoDB Atlas)**: Create a free M0 cluster (supports replica-set transactions), add a database user, allow access from Render's IP/network (`0.0.0.0/0` if using dynamic IPs), and copy the `mongodb+srv://` URI.
- **Backend (Render)**: Create a Web Service with Root Directory `server`, Build Command `npm install`, Start Command `npm start`, and set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel URL), and `NODE_ENV=production`.
- **Frontend (Vercel)**: Import the repo with Root Directory `client`, Build Command `npm run build`, Output Directory `dist`, and set `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`.

*(Add live URLs and screenshots in `docs/screenshots/` once deployed.)*

---

## Author's Note

Coming from a Next.js and PostgreSQL background, I built StockFlow to apply relational data-integrity practices—strict layering, normalized references vs. intentional snapshots, atomic conditional updates, and multi-document transactions—directly in Express and MongoDB/Mongoose.

## Future Improvements

- Payment & invoicing integration
- Multi-warehouse stock tracking
- Barcode / QR scanning
- Automated low-stock email/SMS alerts
- Real-time stock updates via WebSockets
