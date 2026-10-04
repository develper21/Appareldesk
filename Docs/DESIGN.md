# 🎨 Design System

**ApparelDesk – Bold. Modern. Business-Ready.**

> This document defines the visual design system, UI components, and user experience guidelines for ApparelDesk. The goal is a **dark, premium, commerce-grade interface** with a consistent brand identity across the storefront and the admin dashboard. All tokens live in [`src/index.css`](../src/index.css) (HSL CSS variables) and [`tailwind.config.ts`](../tailwind.config.ts).

---

## 1. Design Principles

| | | |
|:---:|:---:|:---:|
| 👤 **User-Centered** | ✨ **Bold & Premium** | 🧩 **Consistent** |
| *Simple flows for shop owners, distraction-free shopping for customers.* | *Dark theme with a signature rose-orange brand gradient.* | *Every screen uses the same shadcn/ui primitives and tokens.* |

- **Content first** — product imagery and business numbers are the heroes; chrome stays quiet.
- **Accessible by default** — Radix-based components ship keyboard nav, focus rings and ARIA.
- **Motion with restraint** — fade-in / slide-up micro-animations (`.animate-fade-in`, `.animate-slide-up`), never bouncy clutter.

---

## 2. Color Palette

Colors are defined as **HSL CSS variables** in `src/index.css` and consumed through Tailwind (`bg-primary`, `text-muted-foreground`, …). Primary swatches:

| Swatch | Token | Value | Usage |
|---|---|---|---|
| 🟥 | `--primary` | `hsl(345 98% 60%)` · **#F43F5E** | Main brand color — buttons, links, active states, focus rings |
| 🟧 | `gradient-primary` | `#F43F5E → #F97316` | Hero sections, brand CTAs, `.text-gradient` headlines |
| ⬛ | `--background` | `hsl(240 12% 10%)` · **#1D171D** | App background (dark violet-tinted) |
| ▣ | `--card` | `hsl(240 10% 13%)` · **#241E24** | Cards, panels, drawers |
| 🔲 | `--secondary` / `--muted` | `hsl(240 8% 18%)` / `hsl(240 8% 20%)` | Secondary buttons, chips, table stripes |
| 🟢 | `--success` | `hsl(142 76% 36%)` · **#16A34A** | Paid/delivered badges, success toasts |
| 🟡 | `--warning` | `hsl(38 92% 50%)` · **#F59E0B** | Pending/processing badges, caution states |
| 🔵 | `--info` | `hsl(199 89% 48%)` · **#0EA5E9** | Info banners, neutral status pills |
| 🔴 | `--destructive` | `hsl(0 84% 60%)` · **#EF4444** | Delete actions, error messages, cancel states |

**Sidebar tokens** follow the same system (`--sidebar-background: hsl(240 12% 8%)`) so the admin nav sits slightly darker than the content area. Shadows: `--shadow-glow` (brand halo), `--shadow-card`, `--shadow-elevated`.

> ✅ Rule: never hard-code hex values in components — always use Tailwind semantic classes (`bg-primary`, `text-success`) so the whole theme can change from one file.

---

## 3. Typography

We use **Inter** as the primary font — clean, modern and highly readable for both storefront and dense admin tables. Loaded via Google Fonts in `src/index.css`.

| | |
|---|---|
| **Aa** | **Inter** — Primary Font |
| | Font stack: `Inter, system-ui, -apple-system, sans-serif` |

| Style | Classes | Size / Weight |
|---|---|---|
| Display (hero) | `text-4xl md:text-5xl font-bold tracking-tight` | 36–48px · 700 |
| Page title | `text-3xl font-bold` | 30px · 700 |
| Section heading | `text-xl font-semibold` | 20px · 600 |
| Body | `text-sm` / `text-base` | 14–16px · 400 |
| Caption / muted | `text-sm text-muted-foreground` | 14px · 400, 55% lightness |
| Numbers / KPIs | `text-2xl font-bold tabular-nums` | 24px · 700, tabular |

---

## 4. UI Components

Standard shadcn/ui components are used throughout the app (in `src/components/ui/`). Never rebuild what exists here.

### Buttons

| Variant | Class / Look | Used for |
|---|---|---|
| **Primary** | `gradient-primary` or `bg-primary`, white text | Add to cart, Checkout, Save |
| **Secondary** | `bg-secondary text-secondary-foreground` | Cancel, ghost actions |
| **Destructive** | `bg-destructive` white text | Delete product/order, remove address |
| **Outline / Ghost** | bordered / transparent | Table row actions, filters |

### Component Inventory

| Component | Where used |
|---|---|
| **Card** | Product tiles, KPI stat cards, forms |
| **Dialog / Sheet** | Quick view modal, cart & wishlist drawers (vaul) |
| **Table** | Admin lists — orders, products, invoices, bills |
| **Badge** | Order status, invoice status, priority pills |
| **Tabs** | Product type filter, settings sections |
| **Toast (sonner)** | Add-to-cart, order placed, error feedback |
| **Skeleton + shimmer** | Loading states on catalog & dashboard |
| **Form (RHF + Zod)** | Login, register, checkout address, product editor |

### Status Badge Colors

| Status | Badge style |
|---|---|
| Delivered / Paid / Received | 🟢 `success` |
| Confirmed / Sent | 🔵 `info` |
| Processing / Pending / Overdue | 🟡 `warning` |
| Cancelled / Failed | 🔴 `destructive` |
| Draft | ⬛ `secondary` |

---

*See also: [PRD.md](PRD.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [RULES.md](RULES.md) • [TASKS.md](TASKS.md) • [MEMORY.md](MEMORY.md)*
