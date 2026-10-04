# 🏛️ System Architecture

**ApparelDesk – Full-Stack Apparel Business Platform**

> This document describes the overall system architecture, technology stack, folder structure, data flow and key design decisions for the ApparelDesk application.

---

## 1. High-Level Architecture

ApparelDesk follows a classic **decoupled full-stack architecture**: a React SPA talks to a single NestJS REST API, which owns all business logic and persists everything in MongoDB (Atlas in production).

```
 ┌─────────────┐       HTTPS/JSON        ┌──────────────────┐      Mongoose       ┌──────────────────┐
 │    👤       │  ◄──────────────────►   │   ⚛️  FRONTEND    │  ◄────────────────► │   🗄️  BACKEND     │──► ☁️ MongoDB
 │    User     │      REST API           │  (React + Vite)  │    axios client     │   (NestJS API)   │      Atlas
 │ (Customer / │                         │                  │                     │                  │
 │   Admin)    │                         │  Tailwind +      │                     │  JWT Auth +      │
 └─────────────┘                         │  shadcn/ui       │                     │  Role Guards     │
                                         └──────────────────┘                     └──────────────────┘
```

**Flow (order checkout example):**

1. 👤 User adds products to cart in the **React frontend** (state in Context API).
2. ⚛️ Frontend calls `POST /api/orders/checkout` via **axios** with the JWT in `Authorization: Bearer`.
3. 🗄️ **NestJS API** validates the DTO (class-validator), applies the coupon, computes totals, and creates the order.
4. ☁️ Mongoose persists the order in **MongoDB** and stock quantities are decremented.
5. 📊 Admin dashboard aggregates (`/dashboard/stats`) read the same data in real time.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite 7 | UI framework + fast dev/build tooling |
| **Language** | TypeScript | Type safety across the whole codebase |
| **Styling** | Tailwind CSS + shadcn/ui | Design system & accessible component primitives |
| **Routing** | React Router v7 | SPA routing (storefront + dashboard) |
| **Data fetching** | TanStack Query + Axios | Server-state cache, retries, invalidation |
| **Forms** | React Hook Form + Zod | Validated forms with type-safe schemas |
| **Backend** | NestJS 10 | Modular REST API, DI, guards & pipes |
| **Database** | MongoDB 8 (Mongoose ODM) | Document store — Atlas cluster in production |
| **Authentication** | JWT (Passport) + Bcrypt | Stateless auth with role-based guards |
| **Validation** | class-validator / class-transformer | DTO whitelisting at the API edge |
| **Frontend hosting** | Netlify | SPA hosting with `_redirects` fallback |
| **Backend hosting** | Render | Node web service (build + start from `dist/`) |
| **Version Control** | Git + GitHub | Source code management |

---

## 3. Folder Structure

The project is a **two-app monorepo** — frontend at the root, backend inside `server/`.

```
appareldesk/
├── src/                      # ⚛️ React frontend (root app)
│   ├── components/
│   │   ├── ui/               #    shadcn/ui primitives (button, dialog, …)
│   │   ├── layout/           #    shell, sidebar, header
│   │   ├── storefront/       #    customer-facing components
│   │   └── dashboard/        #    admin components
│   ├── pages/
│   │   ├── storefront/       #    Home, Products, Cart, Checkout, Orders …
│   │   ├── dashboard/        #    admin pages (products, orders, ERP …)
│   │   └── auth/             #    Login, Register
│   ├── lib/                  #    api clients, auth/cart/wishlist contexts, utils
│   ├── hooks/                #    reusable React hooks
│   └── App.tsx               #    routes
├── server/                   # 🗄️ NestJS backend
│   └── src/
│       ├── common/           #    guards (JWT, roles), decorators, filters
│       ├── config/           #    env-driven configuration
│       ├── modules/          #    one folder per domain feature
│       │   ├── auth/         #      register, login, profile
│       │   ├── products/     #      storefront + admin catalog
│       │   ├── wishlists/    #      server-synced wishlist
│       │   ├── orders/       #      checkout + order pipeline
│       │   ├── contacts/     #      customers & vendors
│       │   ├── purchase-orders/
│       │   ├── invoices/ bills/ payments/ payment-terms/
│       │   ├── discount-offers/  #  coupons
│       │   ├── notifications/ settings/ dashboard/ users/
│       ├── database/
│       │   └── seeders/      #    seed.ts — demo data loader
│       ├── app.module.ts     #    envFilePath + Atlas URI normalization
│       └── main.ts           #    bootstrap (port, CORS, helmet, pipes)
├── postman/                  # 📮 Postman collection (same file inside server/)
│   └── postman.json          #    75 requests, 15 folders — import & test
├── Docs/                     # 📚 This documentation suite
├── public/                   #    static assets + _redirects (Netlify SPA)
├── netlify.toml              #    frontend deploy config
├── render.yaml               #    backend deploy config
└── tailwind.config.ts        #    design tokens (see DESIGN.md)
```

---

## 4. Key Design Decisions

| Decision | Why |
|---|---|
| **Single API for both apps** | Storefront and admin share products, orders and coupons — no data duplication. |
| **JWT + role guards** | Stateless scaling on Render; `@Roles('admin')` guards keep ERP routes locked. |
| **DTO whitelisting** (`forbidNonWhitelisted`) | Unknown/malicious body fields are rejected at the edge with a 400. |
| **Env-file convention** | `.env.local` (dev) / `.env.production` (prod), never committed — only `.env.example`. |
| **Atlas URI normalization** | If the connection string has no database name, the app auto-appends `/appareldesk`. |
| **Server-synced wishlist** | Guests keep a localStorage wishlist; on login it syncs to `/wishlist` (unique index per user+product). |
| **Postman collection in repo** | 75-request collection committed in `postman/` + `server/postman/` so QA and AI agents can test every route. |

---

*See also: [PRD.md](PRD.md) • [DESIGN.md](DESIGN.md) • [RULES.md](RULES.md) • [TASKS.md](TASKS.md) • [MEMORY.md](MEMORY.md)*
