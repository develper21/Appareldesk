# ApparelDesk

**A full-stack apparel business management platform — a customer-facing e-commerce storefront plus a complete admin ERP dashboard, powered by a single NestJS + MongoDB API.**

ApparelDesk lets a garment/apparel business run its **entire retail operation** from one place: publish products to a branded storefront, take online orders, manage stock, vendors, purchase orders, invoices, bills, payments, discount coupons and business analytics — while customers get a modern shopping experience with cart, wishlist, coupons and order tracking.

---

## Table of Contents

- [Feature Highlights](#feature-highlights)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Security](#security)
- [Testing](#testing)
- [Scripts](#scripts)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Feature Highlights

### 🛍️ Customer Storefront

| Feature | Details |
|---|---|
| Home page | Hero, category tiles, featured collections — all driven by live product data |
| Shop with filters | Category checkboxes, apparel-type chips, price-range slider, in-stock toggle, sorting (featured / price / rating / newest), grid & list views |
| Live search | Debounced header search with instant product dropdown results |
| Product detail page | Size & quantity selectors, price/discount display, delivery pincode checker, share, related products |
| Quick View modal | Preview + add-to-cart / buy-now without leaving the catalog |
| Global cart store | Persistent cart (per size variant) with slide-out cart drawer and free-shipping progress meter |
| Wishlist | Heart-to-save on every product card, wishlist drawer, move-to-cart — synced to the server for logged-in users, localStorage for guests |
| Checkout | Full delivery address form, payment method selection (UPI / Card / NetBanking / COD), coupon codes with live discount preview |
| My Orders | Order history with status timeline stepper, coupon badges and printable tax invoice |

### 🏢 Admin ERP Dashboard

| Module | What it does |
|---|---|
| Dashboard | Revenue, orders, products, customers KPIs; recent orders, top products, monthly sales chart |
| Products | Full CRUD with SKU, cost price, image URL, category, stock; publish/unpublish toggle; low-stock indicators |
| Contacts | Customers & vendors with GSTIN, address, city/state |
| Sales Orders | Track online orders, status workflow (confirmed → processing → shipped → delivered / cancelled), order detail drawer |
| Purchase Orders | Create POs to vendors with line items; receive stock back into inventory |
| Invoices | Customer tax invoices generated from orders; status tracking (draft / sent / paid / overdue) |
| Bills | Vendor bills with due dates and payment status |
| Payments | Record incoming & outgoing payments across methods (cash / bank / UPI / cheque / card) |
| Payment Terms | Configurable terms (COD, Net 7/15/30) used on orders & invoices |
| Discount Offers | Coupon engine: percent or fixed, min-order rules, usage limits, validity windows |
| Reports | Business analytics from aggregated order data |
| Notifications | In-app notification center with unread badge, priority levels and action links |
| Settings | Store profile + admin account settings (name, phone, avatar, password change) |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           React SPA (Vite + TS)             │
│                                             │
│  Storefront (public)      Dashboard (admin) │
│  ├─ HomePage              ├─ DashboardHome  │
│  ├─ ShopPage              ├─ ProductsPage   │
│  ├─ ProductDetailPage     ├─ SalesOrders …  │
│  ├─ CartPage              └─ Settings …     │
│  └─ MyOrdersPage                            │
│                                             │
│  State: TanStack Query + Context providers  │
│  (Auth, Cart, Wishlist) + localStorage      │
└──────────────────┬──────────────────────────┘
                   │  HTTP / JSON  (axios)
                   │  /api/*  — JWT Bearer auth
                   ▼
┌─────────────────────────────────────────────┐
│         NestJS API (server/, :3001)         │
│                                             │
│  Guards: JwtAuthGuard → RolesGuard          │
│  Pipes:  class-validator (whitelist)        │
│  Modules: auth, users, products, contacts,  │
│  orders, purchase-orders, invoices, bills,  │
│  payments, payment-terms, discount-offers,  │
│  wishlists, notifications, settings,        │
│  dashboard                                  │
└──────────────────┬──────────────────────────┘
                   │  Mongoose ODM
                   ▼
┌─────────────────────────────────────────────┐
│              MongoDB (:27017)               │
│         database: appareldesk               │
└─────────────────────────────────────────────┘
```

**Key design decisions**

- **Prices are computed server-side.** The storefront sends product IDs and quantities only; the API re-prices the cart from the database, validates stock, applies coupons, and decrements stock atomically per item. The client can never dictate a price.
- **Role-based access.** `JwtAuthGuard` verifies the Bearer token; `RolesGuard` + `@Roles('admin')` protect back-office routes. Customers can only ever read their own orders/invoices and their own wishlist.
- **Global JWT module.** `JwtGlobalModule` is registered once in `AppModule` so every feature module can use `JwtAuthGuard` without re-importing `JwtModule`.
- **Guest-friendly storefront.** Browsing, cart and wishlist work without an account; checkout and server-synced wishlists require one.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 7, Tailwind CSS, shadcn/ui, Radix UI, TanStack Query v5, React Router v6, Framer Motion, Lucide icons, Sonner (toasts) |
| Backend | Node.js, NestJS 10, TypeScript, Mongoose 8, Passport JWT, class-validator / class-transformer |
| Security | Helmet, CORS allow-list, rate throttling (300 req/min/IP), bcrypt password hashing, JWT access tokens |
| Database | MongoDB 7 (local Docker or MongoDB Atlas) |
| Tooling | ts-node (seed), Bash e2e suites, ESLint |

---

## Project Structure

```
appareldesk/
├── index.html                  # SPA entry
├── vite.config.ts              # Dev server + /api proxy → :3001
├── .env.example                # Frontend env TEMPLATE (reference only)
├── .env.local                  # Frontend ACTUAL env values (gitignored)
├── src/
│   ├── App.tsx                 # Routes + global providers
│   ├── lib/
│   │   ├── api/                # ── Frontend ↔ backend boundary ──
│   │   │   ├── client.ts       # axios instance, token storage, 401 handling
│   │   │   ├── index.ts        # authApi, productsApi, ordersApi, wishlistApi, …
│   │   │   └── types.ts        # Shared DTO types + ref helpers
│   │   ├── auth.tsx            # AuthContext (signUp/signIn/signOut/refreshUser)
│   │   ├── cart.tsx            # Global cart store (localStorage-persisted)
│   │   ├── wishlist.tsx        # Wishlist store (server-synced / guest-local)
│   │   └── mockData.ts         # Display helpers (images, deterministic ratings)
│   ├── components/
│   │   ├── storefront/         # Header, Footer, ProductCard, CartDrawer,
│   │   │                       # WishlistDrawer, QuickViewModal, …
│   │   └── layout/             # DashboardLayout, DashboardSidebar
│   └── pages/
│       ├── storefront/         # Home, Shop, ProductDetail, Cart, MyOrders
│       ├── dashboard/          # 13 back-office pages
│       └── auth/               # Login, Register
│
└── server/
    ├── .env.example            # API env TEMPLATE (reference only)
    ├── .env                    # API ACTUAL env values (gitignored)
    ├── src/
    │   ├── main.ts             # Bootstrap: prefix, validation, helmet, CORS, port
    │   ├── app.module.ts       # Root module (registers all feature modules)
    │   ├── health.controller.ts
    │   ├── common/
    │   │   ├── guards/         # JwtAuthGuard (JwtPayload), RolesGuard + @Roles
    │   │   ├── decorators/     # @CurrentUser
    │   │   └── jwt-global.module.ts
    │   ├── modules/            # One folder per domain, each with:
    │   │                       #   x.schema.ts · dto/x.dto.ts
    │   │                       #   x.service.ts · x.controller.ts · x.module.ts
    │   │   ├── auth/ users/ products/ contacts/ orders/
    │   │   ├── purchase-orders/ invoices/ bills/ payments/
    │   │   ├── payment-terms/ discount-offers/ wishlists/
    │   │   └── notifications/ settings/ dashboard/
    │   └── database/seeders/seed.ts   # Demo data seeder
    └── scripts/                # Self-contained e2e suites (start server, curl, assert)
        ├── e2e-test.sh         # API smoke: health, auth, RBAC, coupons, dashboard
        ├── e2e-checkout.sh     # register → login → checkout → stock decrement
        ├── e2e-new-features.sh # wishlist CRUD, new coupons, paymentMethod checkout
        └── e2e-fullstack.sh    # Vite dev server + proxy → API end-to-end
```

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | 22 recommended |
| npm | ≥ 10 | |
| MongoDB | 7 | Local Docker container, system service, or Atlas cluster |

Quick way to run MongoDB in Docker:

```bash
docker run -d --name appareldesk-mongo -p 27017:27017 mongo:7
```

---

## Getting Started

```bash
# 1) Install dependencies (root = frontend, server/ = API)
npm install
npm install --prefix server

# 2) Configure environment (see next section)
cp .env.example .env.local          # then edit with your values
cp server/.env.example server/.env  # then edit with your values

# 3) Start MongoDB (if local)
docker start appareldesk-mongo      # or: docker run -d --name appareldesk-mongo -p 27017:27017 mongo:7

# 4) Seed demo data (users, 12 products, contacts, coupons, sample orders)
npm run server:seed                 # equivalently: cd server && npm run seed

# 5) Run the two processes (two terminals)
npm run server                      # terminal 1 → API  on http://localhost:3001/api
npm run dev                         # terminal 2 → app on http://localhost:8080 (proxies /api → :3001)
```

Open **http://localhost:8080** for the storefront, and sign in as the demo admin to access **/dashboard**.

### Production build

```bash
npm run build               # frontend → dist/
npm run server:build        # backend  → server/dist/
npm run server:start        # serve API from compiled output
```

---

## Environment Variables

> **Convention:** real values live in **`.env.local`** (frontend, dev) / **`.env.production`** (frontend, production build) and **`server/.env`** (API, dev) / **`server/.env.production`** (API, production).
> The `.env.example` files are **templates kept for user reference only** — never put real secrets in them. All `.env*` files are gitignored except the `.example` templates.

### Frontend — `.env.local`

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | Base URL of the API. Leave empty in dev to use the Vite proxy. |
| `VITE_API_TIMEOUT` | `15000` | Axios timeout in ms. |

Optional (dev server only): `VITE_API_PROXY_TARGET` overrides the Vite proxy target (default `http://localhost:3001`).

### Backend — `server/.env`

| Variable | Example | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Runtime mode |
| `PORT` | `3001` | API listen port |
| `API_PREFIX` | `api` | Global route prefix |
| `CORS_ORIGINS` | `http://localhost:8080,http://localhost:3000` | Comma-separated allowed origins |
| `MONGODB_URI` | `mongodb://localhost:27017/appareldesk` | Connection string (Atlas supported) |
| `JWT_SECRET` | *(long random string)* | Token signing secret — **must** be changed in production |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@appareldesk.com` / `admin123` | Credentials created by the seeder |

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@appareldesk.com` | `admin123` |
| Customer | `customer@appareldesk.com` | `customer123` |

The seeder also creates: 12 apparel products, 4 contacts (2 vendors + 2 customers), 4 payment terms, and these demo coupons:

| Code | Effect | Min order |
|---|---|---|
| `APPAREL20` | 20% off | — |
| `WELCOME10` | 10% off | — |
| `SAVE10` | 10% off | — |
| `FIRST20` | 20% off | ₹999 |
| `FLAT500` | ₹500 off | ₹4,999 |
| `SAVE500` | ₹500 off | — |

---

## API Reference

Base URL: `http://localhost:3001/api` — authenticated routes need `Authorization: Bearer <token>`.
Admin-only routes are marked **🔒 admin**.

### Health
| Method | Route | Description |
|---|---|---|
| GET | `/health` | Liveness probe |

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account `{ name, email, password, phone? }` → `{ user, accessToken }` |
| POST | `/auth/login` | Sign in → `{ user, accessToken }` |
| GET | `/auth/me` | Current user profile |
| PATCH | `/auth/me` | Update profile `{ name?, phone?, avatarUrl? }` |
| PATCH | `/auth/me/password` | Change password `{ currentPassword, newPassword }` |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/products/public` | Storefront catalog — published only. Filters: `search, category, minPrice, maxPrice, page, limit` |
| GET | `/products/:id` | Product detail (public) |
| GET | `/products` | 🔒 All products incl. drafts |
| POST | `/products` | 🔒 Create product |
| PATCH | `/products/:id` | 🔒 Update (incl. `isPublished` toggle, SKU, costPrice, imageUrl) |
| DELETE | `/products/:id` | 🔒 Delete product |

### Wishlist 🔐 (per user)
| Method | Route | Description |
|---|---|---|
| GET | `/wishlist` | My wishlist — populated `Product[]`, newest first |
| POST | `/wishlist` | Add `{ productId, productName?, priceAtAdd? }` (idempotent upsert) |
| POST | `/wishlist/toggle` | Heart toggle → `{ wishlisted: boolean }` |
| DELETE | `/wishlist/:productId` | Remove one item |
| DELETE | `/wishlist` | Clear wishlist |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | `/orders/checkout` | Storefront checkout `{ items:[{productId,quantity}], couponCode?, shippingAddress?{fullName,phone,line1,city,state,pincode,paymentMethod}, notes? }` — server re-prices, validates stock, applies coupon, decrements stock |
| GET | `/orders/mine` | My order history (paginated) |
| GET | `/orders/:id` | Order detail |
| GET | `/orders` | 🔒 All orders (`search`, `status` filters) |
| POST | `/orders` | 🔒 Create order for a walk-in customer `{ customerId, items, taxAmount? }` |
| PATCH | `/orders/:id` | 🔒 Update status `draft→confirmed→processing→shipped→delivered` / `cancelled` |
| DELETE | `/orders/:id` | 🔒 Delete order |

### Purchase Orders
| Method | Route | Description |
|---|---|---|
| GET | `/purchase-orders` | 🔒 List (vendor populated) |
| GET | `/purchase-orders/:id` | 🔒 Detail |
| POST | `/purchase-orders` | 🔒 Create `{ vendorId, items:[{productId,quantity,unitPrice}], notes? }` |
| PATCH | `/purchase-orders/:id` | 🔒 Status `draft / confirmed / received / cancelled` (`received` re-stocks inventory) |
| DELETE | `/purchase-orders/:id` | 🔒 Delete |

### Invoices & Bills
| Method | Route | Description |
|---|---|---|
| GET | `/invoices/mine` | My invoices |
| GET | `/invoices` | 🔒 All invoices |
| GET | `/invoices/:id` | Invoice detail |
| POST | `/invoices` | 🔒 Create (optionally from `orderId`) |
| PATCH | `/invoices/:id` | 🔒 Status `draft / sent / paid / overdue / cancelled` |
| DELETE | `/invoices/:id` | 🔒 Delete |
| GET/POST/PATCH/DELETE | `/bills…` | 🔒 Vendor bills — same shape as invoices but vendor-scoped |

### Payments · Payment Terms · Discounts
| Method | Route | Description |
|---|---|---|
| GET/POST/DELETE | `/payments…` | 🔒 Incoming/outgoing payments `{ paymentType, amount, paymentMethod?, contactId?, invoiceId?, billId? }` |
| GET/POST/PATCH/DELETE | `/payment-terms…` | 🔒 Terms list (`includeInactive=true` to fetch all) |
| POST | `/discount-offers/preview` | Public coupon preview `{ code, subtotal }` → `{ discountAmount, code, description }` |
| GET/POST/PATCH/DELETE | `/discount-offers…` | 🔒 Coupon management `{ code, discountType: percent\|fixed, discountValue, minOrderAmount?, maxUses?, validFrom?, validUntil?, isActive }` |

### Wishlist-safe notifications, settings & dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/notifications` | My notifications (`unreadOnly=true`) |
| GET | `/notifications/unread-count` | `{ count }` for header badge |
| PATCH | `/notifications/:id` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |
| DELETE | `/notifications/:id` | Delete notification |
| GET/PATCH | `/settings` | 🔒 Store settings key/value |
| GET | `/dashboard/stats` | 🔒 KPI summary `{ totalRevenue, totalOrders, totalProducts, totalCustomers, ordersLast30Days }` |
| GET | `/dashboard/recent-orders?limit=` | 🔒 Latest orders |
| GET | `/dashboard/top-products?limit=` | 🔒 Best sellers by revenue |
| GET | `/dashboard/monthly-sales` | 🔒 Sales by month |

---

## Data Model

| Collection | Key fields |
|---|---|
| `users` | name, email (unique), password (bcrypt), phone, role `admin\|user`, avatarUrl |
| `products` | name, sku (unique sparse), description, category, productType `readymade\|fabric`, price, costPrice, stockQuantity, unit, imageUrl, isPublished, tags |
| `contacts` | name, contactType `customer\|vendor`, company, email, phone, address, city, state, pincode, gstNumber |
| `orders` | orderNumber (unique), userId→User, customerId→Contact, items[] {productId→Product, quantity, unitPrice, totalPrice}, subtotal, taxAmount, discountAmount, totalAmount, status, couponCode, paymentTermId, shippingAddress {fullName, phone, line1, city, state, pincode, paymentMethod}, notes |
| `wishlists` | userId→User, productId→Product, productName?, priceAtAdd?, addedAt — **unique index (userId, productId)** |
| `purchase_orders` | poNumber (unique), vendorId→Contact, items[], subtotal, taxAmount, totalAmount, status |
| `invoices` | invoiceNumber (unique), orderId→Order, customerId→Contact, totals, status, dueDate, paidAt |
| `bills` | billNumber (unique), vendorId→Contact, totals, status, dueDate, paidAt |
| `payments` | paymentNumber (unique), paymentType `incoming\|outgoing`, amount, paymentMethod, contactId, invoiceId, billId, paidAt, referenceNumber |
| `payment_terms` | name, days, description, isActive |
| `discount_offers` | code (unique), discountType `percent\|fixed`, discountValue, minOrderAmount, maxUses, usedCount, validFrom, validUntil, isActive |
| `notifications` | userId (null = admin broadcast), title, message, type, priority, read, actionUrl, actionText |
| `settings` | key/value store for store profile |

---

## Security

- **JWT authentication** with hashed passwords (bcrypt, 10 rounds); tokens expire per `JWT_EXPIRES_IN`.
- **RBAC** — admin-only back-office routes enforced by `RolesGuard`; customers are sandboxed to their own data (`/orders/mine`, `/invoices/mine`, `/wishlist`).
- **Validation** — every DTO validated with `class-validator`; unknown fields stripped (`whitelist`) and non-whitelisted fields rejected (`forbidNonWhitelisted`).
- **Server-authoritative pricing** — cart totals, discounts, and stock are computed and mutated only in the API.
- **Hardening** — Helmet headers, strict CORS allow-list, and global rate limiting (300 requests/min/IP).
- **Secrets** — real secrets only in gitignored `.env.local` / `server/.env`; `.env.example` files stay secret-free.

---

## Testing

Each script below starts its own API server, runs assertions with `curl`, and shuts it down — no manual server management needed:

```bash
cd server

bash scripts/e2e-test.sh          # API smoke: health, auth, RBAC (401/403), products,
                                  # orders, dashboard stats, coupons, notifications, POs, terms

bash scripts/e2e-checkout.sh      # register → login → storefront product → coupon checkout
                                  # → order created → stock decremented → admin route blocked

bash scripts/e2e-new-features.sh  # wishlist toggle/list/remove/clear + 401 guard,
                                  # APPAREL20/WELCOME10/SAVE500 previews,
                                  # checkout with paymentMethod + full shipping address

bash scripts/e2e-atlas.sh         # boot the API against the configured (Atlas) DB and
                                  # verify the seed: logins, 12 products, 6 coupons,
                                  # order history, dashboard aggregates, wishlist roundtrip

bash scripts/e2e-fullstack.sh     # boots Vite dev server (:8090) + API and verifies the
                                  # same-origin /api proxy path the browser uses
```

Type checks:

```bash
npx tsc --noEmit -p tsconfig.app.json   # frontend
cd server && npx tsc --noEmit           # backend
```

---

## Scripts

### Root (`package.json`)

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server on :8080 with `/api` proxy |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run server` | API dev server with watch on :3001 |
| `npm run server:build` | Compile the NestJS app |
| `npm run server:start` | Run compiled API (`server/dist`) |
| `npm run server:seed` | Seed demo data into MongoDB (uses `server/.env.local`) |

### Server (`server/package.json`)

`start`, `start:dev`, `start:debug`, `start:prod`, `build`, `lint`, `seed`.

---

## Deployment (Render + Netlify)

The repo ships ready-made deployment configs: [`render.yaml`](render.yaml) (Render Blueprint for the API) and [`netlify.toml`](netlify.toml) (frontend build + SPA fallback + security headers).

### 1. Backend on Render

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo. Render reads `render.yaml` automatically.
3. Fill in the prompted secrets:
   - `MONGODB_URI` — your Atlas URI **including the database name** (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/appareldesk`).
   - `JWT_SECRET` — auto-generated if you leave it, or paste your own.
   - `CORS_ORIGINS` — after step 5 below, set it to your Netlify URL (e.g. `https://appareldesk.netlify.app`).
   - `ADMIN_PASSWORD` — a strong production admin password.
4. Deploy. Render runs `npm ci && npm run build` in `server/` and starts `node dist/main.js`; the health check lives at `/api/health`.
5. Seed the production database once from your machine: `cd server && npm run seed:prod` (with `server/.env.production` pointing at Atlas) — or run the same command in the Render shell.

### 2. Frontend on Netlify

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Build settings come from `netlify.toml` (`npm run build`, publish `dist`).
3. Set environment variables in **Site configuration → Environment variables**:
   - `VITE_API_URL=https://appareldesk-api.onrender.com/api` (your Render URL + `/api`).
4. Deploy. SPA routing works via the `/* → /index.html` 200 redirect; `_redirects` is included as a backup.
5. Go back to Render and set `CORS_ORIGINS` to the final Netlify URL, then redeploy the API.

### Env file convention (dev → prod)

| | dev | production |
|---|---|---|
| Frontend | `.env.local` | `.env.production` (+ Netlify UI env vars, which win) |
| Backend | `server/.env.local` | `server/.env.production` (+ Render env vars, which win) |

All real-value env files are gitignored; only `.env.example` templates are tracked.

### Generic (non-Render/Netlify) deployment

1. **Frontend** — `npm run build`; host `dist/` on any static host with an SPA fallback.
2. **Backend** — `npm run server:build`, run `node dist/main.js` behind PM2/systemd/Docker.
3. **Database** — MongoDB Atlas or managed MongoDB; seed once, then change the demo admin credentials.
4. **Reverse proxy** — terminate TLS at Nginx/Cloudflare; forward `/api` to the Node process.

---

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| API logs show port `0` or fails to bind | Ensure `PORT=3001` in `server/.env` (the app falls back to 3001 automatically). |
| `Cannot populate path items.productId` / populate errors | Embedded sub-document classes (e.g. `OrderItem`) must carry their own `@Schema()` decorator so refs register in Mongoose. Already handled in this repo — don't remove it. |
| `JwtService` not found in a feature module | Import nothing — `JwtGlobalModule` is global. Just make sure it stays registered in `app.module.ts`. |
| Mongoose cast errors on optional fields | Nullable `@Prop()` fields need explicit types (`@Prop({ type: String })` etc.) — keep this pattern for new schema fields. |
| Frontend shows network errors | Check the API is on :3001; in dev leave `VITE_API_URL` empty to use the Vite proxy, or set it to `http://localhost:3001/api`. |
| Vite starts on a different port or 8080 is taken | Something else (e.g. Jenkins) owns :8080 — run `npm run dev -- --port 8090 --strictPort`. |
| 401 on every request after login | Token lives in `localStorage` under `appareldesk_access_token`; if the API restarted with a different `JWT_SECRET`, sign in again. |
| Wishlist shows stale data after sign-in/out | The provider adopts the server list when a token exists and restores the guest list otherwise; refresh the page to force re-sync. |

---

## License

Released under the [MIT License](LICENSE).
