# Product Requirements Document (PRD)

**ApparelDesk – Your Complete Apparel Business Companion**

> This document defines what ApparelDesk is, who it is for, and what the MVP must deliver. It is the single source of truth for product scope — every feature task in [TASKS.md](TASKS.md) traces back to this document.

| | |
|---|---|
| **Version:** | 1.0 |
| **Date:** | Sep 30, 2026 |
| **Author:** | Team ApparelDesk |
| **Status:** | Draft |
| **Target Launch:** | MVP (v1.0) |

---

## 1. Product Overview

ApparelDesk is a full-stack apparel business management platform designed to help garment and clothing businesses run their **entire retail operation** from one place. It combines a customer-facing **e-commerce storefront** (browse, search, cart, wishlist, coupons, checkout) with a complete **admin ERP dashboard** (products & inventory, orders, vendors, purchase orders, invoices, bills, payments, coupons, and business analytics).

One product. Two worlds:

- 🛍️ **Storefront** — customers discover and buy products.
- 🏢 **Admin ERP** — the business owner runs the operation behind it.

---

## 2. Problem Statement

Small and mid-sized apparel businesses still run on **scattered tools** — a register for stock, spreadsheets for orders, WhatsApp for vendors, and a separate (or missing) online store. There is no single system that connects the **shop floor to the customer's screen**: inventory goes stale, coupons are tracked by hand, invoices and vendor bills live in different places, and business owners have no real-time view of sales.

ApparelDesk solves this with **one integrated platform** — one API, one database, one source of truth for both the storefront and the back office.

---

## 3. Goals

- Provide a **single platform** to manage products, orders, vendors, invoices, bills and payments together.
- Give customers a **modern, fast shopping experience** with search, filters, wishlist, coupons and order tracking.
- Give the owner a **real-time dashboard** — sales, top products, recent orders — without spreadsheets.
- Eliminate double-entry: an online order flows straight into the admin's order pipeline.
- Keep the system **simple enough for a non-technical shop owner** to operate daily.

---

## 4. Target Users

- **Apparel / garment business owners** — boutiques, readymade shops, fabric stores.
- **Shop managers / staff** — who process orders, stock and billing daily.
- **Retail customers** — anyone shopping the storefront (mobile + desktop).
- Tech-savvy enough for web, but **no technical background required**.

---

## 5. Core Features (MVP)

| # | Feature | What it delivers |
|---|---------|------------------|
| 1 | 🔐 **User Authentication** | Sign up / login, JWT sessions, roles (`admin` / `user`), profile & password management |
| 2 | 🛍️ **Storefront Catalog** | Published products with search, category & price filters, pagination, product detail + quick view |
| 3 | 🛒 **Cart & Checkout** | Cart drawer, coupon codes, shipping address, payment method (UPI / card / COD / net-banking) |
| 4 | ❤️ **Wishlist** | Save products (guest-safe via localStorage, synced to server on login), heart toggle, move to cart |
| 5 | 📦 **Order Management** | Checkout → order pipeline (`draft → confirmed → processing → shipped → delivered`), order history & tracking |
| 6 | 🏷️ **Coupons & Discounts** | Percent / fixed discounts with min-order, usage limits, validity windows, live cart preview |
| 7 | 🏢 **Admin ERP** | Products, vendors/customers (contacts), purchase orders, invoices, bills, payments ledger |
| 8 | 📊 **Dashboard & Analytics** | KPI stats, recent orders, top products, monthly sales chart |
| 9 | 🔔 **Notifications** | Per-user notification feed, unread badge, admin broadcasts (order / inventory / payment / marketing) |
| 10 | ⚙️ **Settings** | Per-user store, notification & appearance preferences |

> **Out of MVP scope (v1.1+):** payment gateway integration, multi-store support, staff roles & permissions, returns/refunds, SMS/WhatsApp campaigns, size/variant matrix.

---

## 6. Success Criteria (MVP Sign-off)

- [ ] Customer can sign up, browse, add to cart/wishlist, apply a coupon and place an order end-to-end.
- [ ] Admin can log in and see live stats (revenue, orders, top products) reflect new orders immediately.
- [ ] Admin can move an order through the full status pipeline and the customer sees the update.
- [ ] Inventory, PO, invoice, bill and payment flows all work against one shared database.
- [ ] Deployed: API on Render + storefront on Netlify, both green.
- [ ] Full API testable via the bundled Postman collection ([postman/postman.json](../postman/postman.json)).

---

*See also: [ARCHITECTURE.md](ARCHITECTURE.md) • [DESIGN.md](DESIGN.md) • [RULES.md](RULES.md) • [TASKS.md](TASKS.md) • [MEMORY.md](MEMORY.md)*
