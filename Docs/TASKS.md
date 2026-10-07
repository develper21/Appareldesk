# ✅ Project Tasks

**ApparelDesk – Task Breakdown & Development Plan**

> This document contains the complete list of tasks for building the ApparelDesk application. Tasks are divided into phases with clear deliverables, priorities and status tracking. Status definitions: ✅ **Completed** · 🔄 **In Progress** · ⬜ **Pending**.

| | | |
|:---:|:---:|:---:|
| 📊 **Total Tasks** | ✅ **Completed** | 🔄 **In Progress** |
| **40** | **35** | **1** |
| ▓▓▓▓▓▓▓▓▓░ 87% | ▓▓▓▓▓▓▓▓▓░ 87% | ▓░░░░░░░░░ 2% |

---

## ✅ Phase 1: Project Setup

Set up the development environment, repository and core configuration.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 1.1 | Initialize Vite + React + TypeScript project | 🔴 High | ✅ Completed | Vite 7 + React 18 + SWC |
| 1.2 | Configure Tailwind CSS + shadcn/ui | 🔴 High | ✅ Completed | Dark theme tokens in `index.css` |
| 1.3 | Set up Git repository | 🔴 High | ✅ Completed | GitHub-hosted, main branch |
| 1.4 | Configure ESLint | 🟡 Medium | ✅ Completed | Flat config, 0 errors |
| 1.5 | Scaffold NestJS backend (`server/`) | 🔴 High | ✅ Completed | NestJS 10 + Mongoose 8 |
| 1.6 | Env-file convention (`.env.local` / `.env.production`) | 🔴 High | ✅ Completed | Only `.env.example` committed |
| 1.7 | MongoDB Atlas cluster + connection normalization | 🔴 High | ✅ Completed | URI without db-name auto-appends `/appareldesk` |

## ✅ Phase 2: Authentication & Users

Implement JWT authentication with roles and profile management.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 2.1 | Users module + Mongoose schema | 🔴 High | ✅ Completed | Role: `admin` / `user` |
| 2.2 | Register + login endpoints | 🔴 High | ✅ Completed | Bcrypt + JWT, `{ user, accessToken }` |
| 2.3 | JWT auth guard + roles guard | 🔴 High | ✅ Completed | `@Roles('admin')` on ERP routes |
| 2.4 | Auth pages (Login / Register) | 🔴 High | ✅ Completed | RHF + Zod forms |
| 2.5 | Protected routes & auth context | 🔴 High | ✅ Completed | Storefront + dashboard shells |
| 2.6 | Profile & change-password APIs | 🟡 Medium | ✅ Completed | `PATCH /auth/me`, `PATCH /auth/me/password` |

## ✅ Phase 3: Storefront Core

Build the customer-facing shopping experience.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 3.1 | Products module (public + admin CRUD) | 🔴 High | ✅ Completed | Storefront filters: search/category/price |
| 3.2 | Product listing + filters page | 🔴 High | ✅ Completed | Pagination + skeletons |
| 3.3 | Product detail + Quick View modal | 🟡 Medium | ✅ Completed | Dialog with add-to-cart |
| 3.4 | Cart context + Cart drawer | 🔴 High | ✅ Completed | Quantity controls, totals |
| 3.5 | Coupon engine (discount-offers) | 🔴 High | ✅ Completed | Percent/fixed, min-order, usage caps |
| 3.6 | Coupon preview endpoint (public) | 🔴 High | ✅ Completed | `POST /discount-offers/preview` |
| 3.7 | Checkout page (address + payment method) | 🔴 High | ✅ Completed | upi / card / cod / netbanking |

## ✅ Phase 4: Orders & ERP Backend

Order pipeline plus the admin ERP modules.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | Orders module + checkout endpoint | 🔴 High | ✅ Completed | Stock decrement, coupon apply, order numbers |
| 4.2 | Order history & tracking (customer) | 🔴 High | ✅ Completed | `GET /orders/mine`, `GET /orders/:id` |
| 4.3 | Admin order management | 🔴 High | ✅ Completed | Status pipeline + search filters |
| 4.4 | Contacts module (customers + vendors) | 🔴 High | ✅ Completed | GST field, type filter |
| 4.5 | Purchase orders module | 🟡 Medium | ✅ Completed | Vendor populated, status enum |
| 4.6 | Invoices module (admin + mine) | 🟡 Medium | ✅ Completed | Optional order linkage |
| 4.7 | Bills + Payments + Payment terms modules | 🟡 Medium | ✅ Completed | Incoming/outgoing ledger |
| 4.8 | Notifications module | 🟡 Medium | ✅ Completed | Unread count, read-all, broadcasts |
| 4.9 | Settings module (per-user) | 🟢 Low | ✅ Completed | store/notifications/appearance |
| 4.10 | Dashboard aggregates | 🔴 High | ✅ Completed | stats, recent-orders, top-products, monthly-sales |

## ✅ Phase 5: Frontend Dashboard (Admin UI)

Admin dashboard screens wired to the ERP APIs.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Dashboard page (KPIs + charts) | 🔴 High | ✅ Completed | Recharts monthly sales |
| 5.2 | Products management page | 🔴 High | ✅ Completed | Create/edit/delete (PATCH never sends `id`) |
| 5.3 | Orders management page | 🔴 High | ✅ Completed | Status transitions |
| 5.4 | ERP pages: contacts, POs, invoices, bills, payments | 🟡 Medium | ✅ Completed | Tables + dialogs |
| 5.5 | Coupons & payment-terms admin pages | 🟡 Medium | ✅ Completed | Include inactive toggle |

## ✅ Phase 6: Wishlist & Extras

Recently shipped feature work.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 6.1 | Wishlist backend module | 🔴 High | ✅ Completed | Unique (userId, productId) index, toggle |
| 6.2 | Wishlist drawer + heart toggle UI | 🔴 High | ✅ Completed | Guest localStorage → server sync on login |
| 6.3 | Seed script with demo data | 🔴 High | ✅ Completed | 12 products, 6 coupons, sample orders, `npm run seed:prod` |
| 6.4 | Deploy configs (Render + Netlify) | 🔴 High | ✅ Completed | `render.yaml`, `netlify.toml`, `_redirects`; build fixes verified |
| 6.5 | README + Docs suite | 🟡 Medium | ✅ Completed | Full deployment & troubleshooting docs |
| 6.6 | Postman collection (75 requests) | 🟡 Medium | ✅ Completed | `postman/` + `server/postman/`, auto token capture |
| 6.7 | ESLint cleanup to 0 errors | 🟡 Medium | ✅ Completed | FE 4 warnings, server 52 warnings |

## 🔄 Phase 7: Hardening & Launch (Current)

Polish, verification and go-live tasks.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 7.1 | Commit & push deploy fixes → retrigger Render + Netlify | 🔴 High | 🔄 In Progress | Fixes on disk, awaiting push |
| 7.2 | Post-deploy smoke test on production URLs | 🔴 High | ⬜ Pending | Use Postman with prod `baseUrl` |
| 7.3 | Rate limiting + request logging on API | 🟡 Medium | ⬜ Pending | helmet already on; add throttler |
| 7.4 | Frontend unit tests (Vitest + React Testing Library) | 🔴 High | ✅ Completed | **43 tests green** — cart, wishlist, cn, api client, NavLink, StatsCard |
| 7.5 | Backend unit tests (Jest + ts-jest) | 🔴 High | ✅ Completed | **82 tests green** — auth, orders, products, wishlist, discounts, guards, DTOs |
| 7.6 | CI pipeline (`.github/workflows/ci.yml`) | 🔴 High | ✅ Completed | Separate FE & BE jobs: install → lint → test → build on Node 20 |

---

*See also: [PRD.md](PRD.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [DESIGN.md](DESIGN.md) • [RULES.md](RULES.md) • [MEMORY.md](MEMORY.md)*
