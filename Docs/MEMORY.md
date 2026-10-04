# 🧠 Project Memory

**ApparelDesk – Context, Progress & Important Notes**

> This document keeps track of the current state of the project, important decisions and things to remember. It helps maintain continuity across development sessions or for new contributors (and AI assistants). Update it whenever something significant changes.

| | | |
|:---:|:---:|:---:|
| 📅 **Last Updated** | 👤 **Current Phase** | 🚀 **Deployment** |
| **Sep 30, 2026** | **Phase 7** | ⏳ Awaiting push |
| Deploy fixes verified locally | Hardening & Launch | Render + Netlify pending |

---

## 🎯 Current Status

- ✅ Project setup completed (React 18 + Vite 7 + TypeScript + Tailwind + shadcn/ui)
- ✅ NestJS backend completed — 14 modules, JWT auth, role guards
- ✅ MongoDB Atlas connected & seeded (12 products, 6 coupons, 4 payment terms, sample orders)
- ✅ Storefront completed — catalog, search/filters, product detail, quick view, cart, coupons, checkout
- ✅ Wishlist feature completed — server-synced with guest localStorage fallback
- ✅ ERP backend completed — contacts, purchase orders, invoices, bills, payments, payment terms
- ✅ Admin dashboard completed — KPI stats, recent orders, top products, monthly sales
- ✅ Notifications & settings modules completed
- ✅ Postman collection (75 requests / 15 folders) committed in `postman/` + `server/postman/`
- ✅ Docs suite created (`Docs/`: PRD, Architecture, Design, Rules, Tasks, Memory)
- ✅ Lint clean: frontend 0 errors / 4 warnings, server 0 errors / 52 warnings
- 🔄 Deploy fixes on disk — **needs commit + push** to retrigger Render & Netlify

---

## ✅ Completed Tasks

| # | Task | Completed On |
|---|------|--------------|
| 1.1 | Initialize Vite + React + TS project | Jan 2, 2026 |
| 1.2 | Configure Tailwind CSS + shadcn/ui | Jan 5, 2026 |
| 1.5 | Scaffold NestJS backend | Jan 8, 2026 |
| 2.2 | Register + login endpoints (JWT + bcrypt) | Jan 10, 2026 |
| 3.1 | Products module (public + admin CRUD) | Jan 12, 2026 |
| 3.4 | Cart context + cart drawer | Jan 14, 2026 |
| 3.5–3.6 | Coupon engine + public preview | Jan 16, 2026 |
| 3.7 | Checkout (address + payment method) | Jan 18, 2026 |
| 4.1 | Orders module + checkout endpoint | Jan 18, 2026 |
| 4.4–4.7 | Contacts, POs, invoices, bills, payments | Jan 20, 2026 |
| 4.10 | Dashboard aggregates | Jan 20, 2026 |
| 5.1–5.5 | Admin dashboard pages | Jan 22, 2026 |
| 6.1–6.2 | Wishlist module + UI (server-synced) | Feb 14, 2026 |
| 6.3 | Atlas seeded + URI-normalization fix | Feb 14, 2026 |
| 6.4 | Deploy configs + root-cause fixes (Render `nest: not found`, Netlify secrets scan) | Feb 16, 2026 |
| 6.5 | README + full documentation | Feb 16, 2026 |
| 6.6 | Postman collections (75 requests) | Sep 30, 2026 |
| 6.7 | Docs suite (this folder) | Sep 30, 2026 |

## 🔄 In Progress

| # | Task | Notes |
|---|------|-------|
| 7.1 | Commit & push deploy fixes | `render.yaml`, `netlify.toml`, `server/package.json` build-tool move — push karte hi dono deploys retrigger |
| 7.2 | Production smoke test | Postman `baseUrl` → `https://appareldesk-api.onrender.com/api` |

---

## 🧭 Important Notes & Gotchas

> Ye cheezein yaad rakhna — inhi se bugs nikle the:

- 📮 **Postman quick start:** `Health` → `Login (Admin)` → `Login (Customer)` → `Products ▸ Public List` → phir sab variables (`{{adminToken}}`, `{{token}}`, `{{lastProductId}}`…) auto-fill ho jaate hain.
- 🧩 **JwtGlobalModule** zaroori hai jab bhi naya module add ho.
- 📦 Embedded sub-docs (`OrderItem`, `PurchaseOrderItem`) ko `@Schema()` decorator chahiye, warna Mongoose save fail.
- 🫙 Nullable `@Prop` fields ko explicit type dena padta hai (strict mode).
- 🚫 ProductsPage `updateMutation` PATCH body me `id` **nahi** bhejni — `forbidNonWhitelisted` 400 dega (fixed: `({ id, ...patch })`).
- 🔌 Port resolution: `PORT` env → config → `3001`; listen on `0.0.0.0` (Render requirement).
- 🗄️ Atlas URI agar db-name ke bina ho to app khud `/appareldesk` append karti hai (ek stray `test` db Atlas pe padi hai — harmless).
- 🌱 Seed: `npm run seed` (dev `.env.local`) · `npm run seed:prod` (Atlas `.env.production`).
- 🌐 Frontend dev API: `VITE_API_URL=http://localhost:3001/api` (`.env.local`); prod: `https://appareldesk-api.onrender.com/api` (`.env.production`).
- 🧪 e2e scripts: `server/scripts/e2e-*.sh` — server change ke baad `e2e-atlas.sh` run karein.
- 🔍 ESLint: root config `eslint.config.js` hai (`.ts` wala delete), server `eslint.config.mjs`.

---

## 🗺️ Next Steps

1. Commit + push → dono deploys green hone tak wait karein.
2. Postman se production smoke test (Section 🔄).
3. Rate limiting + request logging (Phase 7.3).
4. Frontend unit tests (Phase 7.4).

---

*See also: [PRD.md](PRD.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [DESIGN.md](DESIGN.md) • [RULES.md](RULES.md) • [TASKS.md](TASKS.md)*
