# StockFlow — Inventory & Order Management System

A full-stack MERN inventory and order management platform designed for small businesses. Staff and administrators manage products, categories, suppliers, stock adjustments, purchase orders, and customer sales orders while monitoring real-time KPIs and reports.

---

## Live Deployment & Demo Accounts

- **API Health Check:** `https://stockflow-api-one.vercel.app/api/v1/health`
- **Frontend App:** `https://<your-frontend-project>.vercel.app` *(update with your Vercel client URL)*

After running `npm --prefix server run seed`, you can sign in with:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@stockflow.dev` | `Admin123!` |
| **Staff** | `staff@stockflow.dev` | `Staff123!` |

*(Or register a new account at `/register` — the first registered user automatically becomes `admin`.)*

---

## Screenshots

> Add screenshots of the live app to `docs/screenshots/` before sharing:
> - `docs/screenshots/dashboard.png` — KPI cards, 30-day sales chart, and low-stock alerts
> - `docs/screenshots/products.png` — Product catalog with search, filters, and pagination
> - `docs/screenshots/orders.png` — Purchase & sales order workflows

---

## Key Features

- **Role-Based Authentication (`admin` / `staff`):** JWT authentication with `bcryptjs` password hashing. Admins manage user roles, account activation, and category/supplier deletion; staff handle daily catalog, stock, order, and reporting workflows.
- **Catalog Management:** Categories, Suppliers (with supplied-products detail), and Products with unique uppercase SKUs, search, category and low-stock filters, sorting, pagination, and soft-delete archiving.
- **Stock & Audit Trail:** Centralized stock mutations through `stock.service.js`, low-stock monitoring (`quantity <= reorderLevel`), manual adjustments with required reasons, and a filterable `StockMovement` history (`IN`, `OUT`, `ADJUSTMENT`).
- **Purchase Orders (`draft → ordered → received`):** Auto-numbered (`PO-YYYY-0001`), editable while `draft`, and transactional receiving that atomically updates product stock and records `IN` movements.
- **Sales Orders (`pending → confirmed → completed` / `cancelled`):** Auto-numbered (`SO-YYYY-0001`), server-computed totals with immutable price snapshots, transactional confirmation (atomic stock check + deduction, `409 Conflict` on insufficient stock), and transactional cancellation (restores stock if `confirmed`).
- **Dashboard & Reports:** Summary KPIs, 30-day sales trend chart (Recharts), top-selling products, and inventory cost/retail valuation by category via MongoDB aggregation pipelines.
- **Production Hardening:** `helmet`, `cors`, `express-rate-limit` (with `trust proxy` enabled), Zod request validation, central error handling, and Jest + Supertest integration tests.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router, TanStack Query, Axios, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express 5, Zod, JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Database** | MongoDB Atlas, Mongoose 9 |
| **Quality & Testing** | Jest, Supertest, ESLint, Prettier, Postman |

---

## Architecture

### Project Structure

```text
StockFlow/
├── client/
│   ├── vercel.json             # SPA rewrite rules for client-side routing
│   └── src/
│       ├── api/                # Axios instance + per-module API clients
│       ├── components/         # Reusable UI (Modals, Tables, Pagination, Charts, StatCard)
│       ├── context/            # AuthContext
│       ├── hooks/              # useAuth
│       ├── pages/              # Route-level screens
│       └── routes/             # ProtectedRoute, RoleRoute
├── server/
│   ├── api/index.js            # Vercel serverless entry point
│   ├── vercel.json             # Serverless routing config
│   ├── tests/api.test.js       # Jest + Supertest integration tests
│   └── src/
│       ├── config/             # db.js (cached connection), env.js
│       ├── models/             # Mongoose schemas
│       ├── validators/         # Zod request schemas
│       ├── middleware/         # auth, validate, rateLimiter, errorHandler, notFound
│       ├── controllers/        # Thin HTTP request/response handlers
│       ├── services/           # Business logic & MongoDB transactions
│       ├── routes/             # Express route definitions
│       ├── seed/               # Demo data seed script
│       ├── utils/              # ApiError, asyncHandler, response, orderNumber
│       ├── app.js              # Express app (exportable for tests & serverless)
│       └── server.js           # Local HTTP server entry point
├── docs/
│   └── StockFlow.postman_collection.json
└── README.md
```

### Request Layering

```text
route → middleware (auth, validate, rateLimiter) → controller → service → model
```

- **Strict Stock Ownership:** `server/src/services/stock.service.js` is the **only** module permitted to modify `Product.quantity`, guaranteeing every change produces an immutable `StockMovement` record.

---

## Data Model & Engineering Decisions

| Model | Key Fields |
|---|---|
| `User` | `name`, `email` (unique), `passwordHash` (`select: false`), `role` (`admin` \| `staff`), `isActive` |
| `Category` | `name` (unique), `description` |
| `Supplier` | `name`, `contactName`, `email`, `phone`, `address` |
| `Product` | `sku` (unique uppercase), `name`, `category`, `supplier`, `costPrice`, `salePrice`, `quantity` (`>= 0`), `reorderLevel`, `isArchived` |
| `StockMovement` | `product`, `type` (`IN` \| `OUT` \| `ADJUSTMENT`), `quantity` (signed), `reason`, `refType`, `refId`, `createdBy` |
| `PurchaseOrder` | `poNumber` (unique), `supplier`, `status`, embedded `items[]` snapshot, `total`, `orderedAt`, `receivedAt` |
| `SalesOrder` | `orderNumber` (unique), `customerName`, `customerPhone`, `status`, embedded `items[]` snapshot, `total` |

### Embedded vs. Referenced Documents
- **Embedded item snapshots on orders:** Line items store a snapshot of `name`, `sku`, and `unitPrice` / `unitCost` at order time so historical orders stay accurate even if a product is later renamed or repriced.
- **Referenced shared entities:** `Product`, `Category`, `Supplier`, and `User` are referenced by `ObjectId` because they evolve independently across many orders.
- **Separate `StockMovement` collection:** Keeps an unbounded audit log without bloating `Product` documents, indexed on `{ product: 1, createdAt: -1 }` for fast product history queries.

### Stock Consistency (Atomic Updates & Transactions)
- **Conditional atomic updates:** `decreaseStock` executes `Product.findOneAndUpdate({ _id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } })`. If `null` is returned, the request fails with `409 Conflict`, preventing negative inventory under concurrent requests.
- **Multi-document transactions:** `receivePurchaseOrder`, `confirmSalesOrder`, and `cancelSalesOrder` run inside `mongoose.startSession()` + `session.withTransaction(...)` so multi-item stock updates and order status transitions succeed or roll back together.

---

## REST API Reference (`/api/v1`)

| Module | Endpoints | Access |
|---|---|---|
| **Health** | `GET /health` | Public |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public / Auth |
| **Users** | `GET /users`, `PATCH /users/:id/role`, `PATCH /users/:id/status` | Admin |
| **Categories** | `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | Auth / Admin (`DELETE`) |
| **Suppliers** | `GET /suppliers`, `GET /suppliers/:id`, `POST /suppliers`, `PUT /suppliers/:id`, `DELETE /suppliers/:id` | Auth / Admin (`DELETE`) |
| **Products** | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `PATCH /products/:id/archive` | Auth |
| **Stock** | `GET /stock/low`, `GET /stock/movements`, `POST /stock/adjust` | Auth |
| **Purchase Orders** | `GET /purchase-orders`, `GET /purchase-orders/:id`, `POST /purchase-orders`, `PUT /purchase-orders/:id`, `PATCH /purchase-orders/:id/order`, `PATCH /purchase-orders/:id/receive` | Auth |
| **Sales Orders** | `GET /sales-orders`, `GET /sales-orders/:id`, `POST /sales-orders`, `PATCH /sales-orders/:id/confirm`, `PATCH /sales-orders/:id/complete`, `PATCH /sales-orders/:id/cancel` | Auth |
| **Reports** | `GET /reports/summary`, `GET /reports/sales`, `GET /reports/top-products`, `GET /reports/stock-value` | Auth |

Import [docs/StockFlow.postman_collection.json](docs/StockFlow.postman_collection.json) into Postman to test all endpoints.

---

## Local Development

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd StockFlow
npm --prefix server install
npm --prefix client install
```

### 2. Environment Variables
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Seed Demo Data
```bash
npm --prefix server run seed
```

### 4. Run Locally
```bash
npm --prefix server run dev
npm --prefix client run dev
```

### 5. Run Tests & Linters
```bash
npm --prefix server test
npm --prefix server run lint
npm --prefix client run lint
```

---

## Deployment (MongoDB Atlas + Vercel)

1. **MongoDB Atlas:** Create an M0 cluster (supports replica-set transactions), add a database user, and whitelist `0.0.0.0/0` in **Network Access**.
2. **Backend (Vercel):** Import the repository with Root Directory `server` and Framework Preset `Other`. Set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, and `CLIENT_URL`.
3. **Frontend (Vercel):** Import the repository with Root Directory `client` and Framework Preset `Vite`. Set `VITE_API_URL=https://<your-backend>.vercel.app/api/v1`.
4. **CORS Sync:** Update `CLIENT_URL` on the backend Vercel project to your live frontend URL and redeploy.

---

## Author's Note

Coming from a Next.js and PostgreSQL background, I built StockFlow to apply relational data-integrity practices—strict service layering, normalized references vs. intentional order snapshots, atomic conditional updates, and multi-document transactions—directly in Express and MongoDB/Mongoose.

## Future Improvements

- Payment & invoicing integration
- Multi-warehouse inventory tracking
- Barcode / QR scanning
- Automated low-stock email/SMS alerts
- Real-time stock updates via WebSockets
