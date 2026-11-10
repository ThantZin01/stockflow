# AGENT.md — StockFlow (Inventory & Order Management System)

You are a senior full stack engineer helping build **StockFlow**, a MERN
portfolio project for a Mid-Level Full Stack Developer (MERN) job application.
Read this file fully before every task. Read `feature.md` for WHAT to build.
This file defines HOW to build it.

---

## 1. Project goal

A medium-size inventory and order management web app that proves:

- JavaScript (ES6+), React.js, Node.js, Express.js
- MongoDB with Mongoose, REST API design, database integration
- Clean frontend / backend architecture
- Git and GitHub discipline, debugging and performance awareness

The developer is experienced with Next.js and PostgreSQL and is **new to
Express + MongoDB**. When you use a MongoDB-specific concept (embedding vs
referencing, indexes, aggregation, atomic updates, transactions), add a short
comment explaining WHY. The code must look honest and readable, not
over-engineered.

---

## 2. Tech stack (do not change without asking)

| Layer | Choice |
|---|---|
| Language | JavaScript (ES modules, `"type": "module"`), no TypeScript |
| Frontend | React 18 + Vite, React Router, Axios, TanStack Query, Tailwind CSS |
| Backend | Node.js 20+, Express 4 |
| Database | MongoDB Atlas, Mongoose 8 |
| Auth | JWT (access token), bcryptjs |
| Validation | Zod (server) |
| Testing | Jest + Supertest (server), a few key tests only |
| Tooling | ESLint, Prettier, dotenv, cors, helmet, morgan, express-rate-limit |

Do NOT add: Redux, GraphQL, Next.js, TypeScript, Docker, Socket.io, payment
SDKs, or extra libraries unless the developer approves.

---

## 3. Folder structure (follow exactly)

```
stockflow/
├── client/
│   └── src/
│       ├── api/            # axios instance + one file per module
│       ├── components/     # reusable UI (Table, Modal, Pagination, StatCard...)
│       ├── context/        # AuthContext
│       ├── hooks/
│       ├── pages/          # route-level screens
│       ├── routes/         # ProtectedRoute, RoleRoute
│       └── main.jsx / App.jsx
├── server/
│   └── src/
│       ├── config/         # db.js, env.js
│       ├── models/         # Mongoose schemas
│       ├── validators/     # Zod schemas
│       ├── middleware/     # auth, role, validate, errorHandler, notFound
│       ├── controllers/    # thin: parse request, call service, send response
│       ├── services/       # business logic (stock.service.js, order.service.js)
│       ├── routes/         # route definitions only
│       ├── seed/           # seed.js demo data
│       ├── utils/          # ApiError, asyncHandler, response helpers
│       ├── app.js          # express app (no listen)
│       └── server.js       # connect DB + listen
├── docs/                   # screenshots, ERD, postman collection
├── README.md
├── feature.md
├── AGENT.md
└── .env.example
```

**Layering rule (strict):**
`route → middleware → controller → service → model`

- Routes: only wiring and middleware.
- Controllers: no business logic, no direct stock changes.
- Services: all business rules.
- **Only `stock.service.js` may change `Product.quantity`.** No other file
  may write to that field.

---

## 4. Coding conventions

**General**
- ES6+ only: `const`/`let`, arrow functions, destructuring, async/await,
  optional chaining. No `var`, no callbacks.
- Use named exports. Keep files under about 200 lines; split if larger.
- Names: `camelCase` variables/functions, `PascalCase` components and models,
  `kebab-case` for route paths, `UPPER_SNAKE` for constants.
- Comments explain WHY, not WHAT. No commented-out code.

**Backend**
- Wrap async handlers with `asyncHandler`; never write try/catch in every
  controller.
- Throw `new ApiError(statusCode, message)`; one central `errorHandler`
  formats errors.
- Validate every request body/query/params with Zod via `validate` middleware.
- Never return `passwordHash`. Use `select: false` on that field.
- Never trust the client for prices, totals, or roles; recompute on the server.
- Use `lean()` for read-only queries. Always paginate list endpoints.
- Environment variables only via `config/env.js`. Never hardcode secrets.

**Response format (always)**
```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 10, "total": 42 } }
{ "success": false, "message": "Insufficient stock for SKU-001" }
```

**HTTP status codes**
200 OK, 201 Created, 400 validation error, 401 not authenticated,
403 forbidden (wrong role), 404 not found, 409 conflict (duplicate SKU,
insufficient stock, invalid status change), 500 unexpected.

**Frontend**
- Function components and hooks only.
- API calls only inside `client/src/api/`; components never call axios
  directly.
- Server data via TanStack Query; auth state via `AuthContext`.
- Every page shows loading, error, and empty states.
- Forms: controlled inputs, show server validation messages.
- Tailwind utility classes only; no custom CSS files except a base import.
- Keep UI clean and simple: sidebar layout, tables, modal forms. Responsive
  down to tablet.

---

## 5. Business rules the code must enforce

1. SKU is unique. Duplicate returns 409.
2. Stock never goes below 0.
3. Every quantity change creates a `StockMovement` (type `IN`, `OUT`, or
   `ADJUSTMENT`) with `reason`, `refType`, `refId`, `createdBy`.
4. Purchase order flow: `draft → ordered → received`. Receiving adds stock
   (IN) and can happen only once.
5. Sales order flow: `pending → confirmed → completed`, or
   `pending/confirmed → cancelled`. Confirming deducts stock (OUT); cancelling
   a confirmed order restores stock (IN). Invalid transitions return 409.
6. Order items store a **snapshot** (name, sku, unitPrice). Later product
   price changes must not alter old orders.
7. Deduct stock atomically:
   `Product.findOneAndUpdate({ _id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } })`.
   If it returns null, the stock is insufficient. Use a MongoDB session
   (transaction) when an order touches several products, so a failure rolls
   everything back.
8. Roles: `admin` can do everything. `staff` can manage products, stock, and
   orders but cannot manage users, delete categories/suppliers, or view user
   admin screens.
9. Products are archived (soft delete), never hard-deleted.

---

## 6. How you must work (workflow)

1. **Work one phase at a time**, in the order listed in `feature.md`
   (Section 6). Do not start the next phase until the developer says
   "next phase".
2. At the start of each phase: state the plan in a short list of files you
   will create or change.
3. Build the smallest working slice, run it, and fix errors before moving on.
4. After each phase give:
   - what was built,
   - how to run/test it (exact commands, example Postman request),
   - any decision the developer should review.
5. Ask before making architecture changes, adding a dependency, or changing
   the data model.
6. If a requirement is unclear, ask one short question instead of guessing.
7. Do not rewrite working code from earlier phases unless fixing a bug. Say
   what you changed and why.
8. Do not generate fake data inside components. Use the seed script.

---

## 7. Git workflow

- Branch per phase: `feat/phase-1-setup`, `feat/phase-2-auth`, and so on.
- Small commits using Conventional Commits:
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Suggest the commit message at the end of each task. Never commit secrets.
- `.gitignore` must include `node_modules`, `.env`, `dist`, `coverage`.

---

## 8. Environment variables

`server/.env.example`
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/stockflow
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`client/.env.example`
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 9. Definition of done (per phase)

- App starts without errors or console warnings.
- Endpoints return the standard response format and correct status codes.
- Input is validated and errors are handled.
- No business logic in controllers or components.
- Code passes ESLint and Prettier.
- The developer can reproduce the result using your run instructions.

---

## 10. Do NOT

- Do not skip validation, auth middleware, or the error handler.
- Do not write to `Product.quantity` outside `stock.service.js`.
- Do not expose stack traces or secrets in API responses.
- Do not add features outside `feature.md` (payments, email, multi-warehouse,
  barcode, real-time). List them as "future work" in the README only.
- Do not create giant files or duplicate logic across modules.
