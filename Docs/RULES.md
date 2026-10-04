# 📋 Development Rules

**ApparelDesk – Project Guidelines for AI & Human Collaboration**

> This document defines the development rules, coding standards, and best practices for the ApparelDesk application. These rules ensure consistency, maintainability, security, and high code quality. Both AI assistants and human contributors **must** follow these guidelines.

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation ([PRD](PRD.md), [ARCHITECTURE](ARCHITECTURE.md), [DESIGN](DESIGN.md)) before making changes.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability over cleverness.
- ✅ Do not duplicate logic — reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.
- ✅ Every API change must keep [postman/postman.json](../postman/postman.json) in sync (add/update the request).

---

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style.

| | Standard | Rule |
|---|---|---|
| 📘 | **Language** | Use **TypeScript** everywhere (frontend + backend). Avoid `any` unless absolutely necessary. |
| ⚛️ | **Frontend Framework** | Follow React 18 + Vite best practices — function components and hooks only. |
| 🏗️ | **Backend Framework** | Follow NestJS conventions — one module per domain, DTOs for every body, services hold the logic. |
| 🎨 | **Styling** | Use Tailwind CSS and follow the design system in [DESIGN.md](DESIGN.md). Never hard-code hex colors. |
| 🧩 | **Components** | Use existing shadcn/ui primitives from `src/components/ui/` before creating new ones. |
| 🧹 | **Linting** | ESLint must pass with **0 errors** (warnings acceptable): `npm run lint` / `npm run lint --prefix server`. |
| 📐 | **Formatting** | 2-space indent, single quotes (frontend) / project default, trailing commas — keep Prettier defaults. |
| 📦 | **Dependencies** | Use stable, well-maintained packages. Never install a new dependency without a strong reason. |
| 📄 | **File Naming** | React components: `PascalCase.tsx`. Lib/hooks/utilities: `camelCase.ts(x)`. Backend NestJS files: `dot.case.ts` (e.g. `orders.controller.ts`). |
| 🔒 | **Secrets** | Real credentials live only in `.env.local` / `.env.production` (gitignored). `.env.example` is reference-only — never commit real keys. |
| 🌐 | **API Contract** | All requests go through `src/lib/api/` axios client with the JWT header; frontend never builds raw `fetch` calls to the API. |
| 🛡️ | **Validation** | Backend: class-validator DTOs with `whitelist + forbidNonWhitelisted`. Frontend forms: Zod schemas. |
| 🧪 | **Testing** | Verify changes with the e2e scripts in `server/scripts/` and the Postman collection before considering a task done. |

---

## 3️⃣ Project Structure

Follow the defined folder structure in [ARCHITECTURE.md](ARCHITECTURE.md) — keep the codebase organized and predictable.

- ✅ Reusable UI components belong in `src/components/ui/` (shadcn) or `src/components/<area>/` (feature areas).
- ✅ Page-level screens live in `src/pages/<storefront|dashboard|auth>/`.
- ✅ Feature-specific code should be inside its feature folder (module on the server, area folder on the client).
- ✅ API clients live in `src/lib/api/`; shared contexts (`auth`, `cart`, `wishlist`) in `src/lib/`.
- ✅ Backend domain logic must live in `server/src/modules/<module>/` with its own `*.controller.ts`, `*.service.ts`, `dto/`, and `*.schema.ts`.
- ✅ Common backend utilities (guards, decorators, pipes) belong in `server/src/common/`.
- ✅ Types and shared interfaces should be placed next to their schema/DTO — do not create shadow duplicate types.
- ✅ Documentation belongs in `Docs/`; Postman collections in `postman/` and `server/postman/`.
- ❌ Do not create new folders without a clear purpose matching the structure.

---

## 4️⃣ Git & Deployment Rules

- ✅ Meaningful commit messages focused on *why*, not *what*.
- ✅ Never commit: `.env.local`, `.env.production`, `node_modules`, `dist/`.
- ✅ Deploys are automatic: backend → **Render** (`render.yaml`), frontend → **Netlify** (`netlify.toml`). Build must pass locally (`npm run build` + `npm run build --prefix server`) before pushing.
- ✅ `.env` files are gitignored; rotating a secret means updating the value on Render/Netlify dashboard, not committing it.

---

*See also: [PRD.md](PRD.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [DESIGN.md](DESIGN.md) • [TASKS.md](TASKS.md) • [MEMORY.md](MEMORY.md)*
