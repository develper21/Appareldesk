# ApparelDesk

Full-stack apparel store & inventory management platform.

- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui (storefront + admin dashboard)
- **Backend**: NestJS + MongoDB (Mongoose) + JWT auth (`server/`)

## Project structure

`grp``
├── src/                  # React frontend
│   ├── lib/api/          # API client, endpoint modules, shared types
│   ├── lib/auth.tsx      # JWT auth context (login/register/session)
│   ├── pages/storefront/ # Home, Shop, Cart, My Orders
│   ├── pages/dashboard/  # Products, Contacts, Orders, Invoices, Bills, Payments, Reports...
│   └── pages/auth/       # Login, Register
└── server/               # NestJS backend
    └── src/
        ├── common/       # Guards (JWT, Roles), decorators, DTOs
        ├── modules/      # auth, users, products, contacts, orders,
        │                 # purchase-orders, invoices, bills, payments,
        │                 # payment-terms, discount-offers, notifications,
        │                 # settings, dashboard
        └── database/     # Seed script
grp```

## Getting started

### 1. Prerequisites

- Node.js 20+
- MongoDB running locally (or an Atlas URI)

```sh
# quick local MongoDB via Docker
docker run -d --name appareldesk-mongo -p 27017:27017 -v appareldesk_mongo_data:/data/db mongo:7
```

### 2. Backend

```sh
cd server
cp .env.example .env        # then edit values if needed
npm install
npm run seed                # demo data + admin account
npm run start:dev           # API at http://localhost:3001/api
```

Seeded accounts:

| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Admin    | admin@appareldesk.com     | admin123    |
| Customer | customer@appareldesk.com  | customer123 |

### 3. Frontend

```sh
cd ..
cp .env.example .env        # points to http://localhost:3001/api
npm install
npm run dev                 # app at http://localhost:8080 (proxies /api → :3001)
```

## Environment variables

- `server/.env.example` — API config (port, MongoDB URI, JWT secret, CORS origins, seed credentials)
- `.env.example` — frontend config (`VITE_API_URL`, timeout)

## API overview

All routes are prefixed with `/api`. Auth uses `Authorization: Bearer <token>`.

| Area | Routes |

|------|--------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PATCH /auth/me`, `PATCH /auth/me/password` |
| Products | `GET /products/public` (storefront), CRUD `/products` (admin) |
| Contacts | CRUD `/contacts` (admin) |
| Orders | `POST /orders/checkout` (customer), CRUD `/orders` (admin), `GET /orders/mine` |
| Purchase orders | CRUD `/purchase-orders` (admin; "received" increments stock) |
| Invoices | `/invoices`, `/invoices/mine` |
| Bills | CRUD `/bills` (admin) |
| Payments | CRUD `/payments` (admin) |
| Payment terms | CRUD `/payment-terms` (admin) |
| Coupons | `POST /discount-offers/preview` (public), CRUD `/discount-offers` (admin) |
| Notifications | `/notifications`, `/notifications/unread-count`, `/notifications/read-all` |
| Settings | `GET/PATCH /settings` (per user) |
| Dashboard | `/dashboard/stats`, `/dashboard/recent-orders`, `/dashboard/top-products`, `/dashboard/monthly-sales` |

## Tests / smoke checks

```sh
bash server/scripts/e2e-test.sh       # API smoke test (10 checks)
bash server/scripts/e2e-checkout.sh   # customer checkout flow
bash server/scripts/e2e-fullstack.sh  # frontend proxy ↔ API
```
