# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Use Medusa MCP First

Before implementing any feature or looking for answers about Medusa, always use the `mcp__medusa__ask_medusa_question` tool to query the official Medusa documentation. This ensures implementations follow current Medusa 2.0 patterns and best practices.

## Project Overview

MedusaJS 2.0 e-commerce monorepo with a backend (Medusa server + admin dashboard) and a Next.js 15 storefront. Pre-configured for Railway deployment with PostgreSQL, Redis, MinIO file storage, and MeiliSearch.

**Version**: MedusaJS 2.12.1

## Project Structure

```
medusajs-2.0-for-railway-boilerplate/
├── backend/                    # Medusa 2.0 server
│   └── src/
│       ├── admin/              # Admin dashboard customizations
│       ├── api/                # Custom REST API routes (file-based routing)
│       ├── jobs/               # Scheduled background jobs (cron)
│       ├── lib/                # Shared utilities and constants
│       ├── modules/            # Custom Medusa modules
│       │   ├── email-notifications/  # Resend email provider
│       │   └── minio-file/          # MinIO file storage provider
│       ├── scripts/            # Seed scripts and build helpers
│       ├── subscribers/        # Event handlers
│       └── workflows/          # Multi-step business logic
├── storefront/                 # Next.js 15 storefront
│   └── src/
│       ├── app/                # App Router pages (routes by [countryCode])
│       ├── lib/                # Medusa JS SDK client, utilities
│       ├── modules/            # React components grouped by section
│       └── middleware.ts       # Region/country code enforcement
└── medusa-config.js           # Backend module/plugin configuration
```

## Development Commands

### Backend (Medusa Server)
```bash
cd backend/
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (admin at localhost:9000/app)
pnpm ib                   # Initialize: run migrations + seed database
pnpm build && pnpm start  # Build and run production-like
pnpm seed                 # Run seed script only
pnpm email:dev            # Preview email templates at localhost:3002
```

### Storefront (Next.js)
```bash
cd storefront/
pnpm install              # Install dependencies
pnpm dev                  # Start dev server at localhost:8000
pnpm build                # Build for production
pnpm lint                 # Run ESLint
pnpm test-e2e             # Run Playwright E2E tests
```

## Environment Setup

1. Backend: Copy `.env.template` → `.env` and configure DATABASE_URL
2. Storefront: Copy `.env.local.template` → `.env.local` and set NEXT_PUBLIC_MEDUSA_BACKEND_URL

## Architecture Concepts

### Backend Extension Points

- **Modules** (`src/modules/`): Reusable service packages. Each module has a service class, exported via `Module()` from `@medusajs/utils`, and registered in `medusa-config.js`.

- **API Routes** (`src/api/`): File-based routing. Create `src/api/[path]/route.ts` with exported HTTP method handlers (GET, POST, etc.). Access Medusa container via `req.scope.resolve()`.

- **Workflows** (`src/workflows/`): Multi-step operations using `createWorkflow` and `createStep` from `@medusajs/workflows-sdk`. Steps have compensation logic for rollback.

- **Subscribers** (`src/subscribers/`): Event handlers. Export async handler + config with `event` name (e.g., `product.created`).

- **Jobs** (`src/jobs/`): Scheduled tasks with cron expressions. Export handler + config with `name` and `schedule`.

### Storefront Architecture

- **App Router**: Routes under `src/app/[countryCode]/` with route groups `(main)` and `(checkout)` for different layouts.
- **Server Components**: Data fetching via SDK in `src/lib/data/index.ts`
- **Middleware**: Enforces country code in URL, redirects based on region

### Configured Integrations

| Service | Backend Module | Optional |
|---------|---------------|----------|
| MinIO   | `src/modules/minio-file` | Yes (falls back to local) |
| Resend  | `src/modules/email-notifications` | Yes |
| SendGrid | `@medusajs/notification-sendgrid` | Yes |
| Stripe  | `@medusajs/payment-stripe` | Yes |
| MeiliSearch | `@rokmohar/medusa-plugin-meilisearch` | Yes |

All integrations are conditionally loaded based on environment variables (see `medusa-config.js`).

## Key Files

- `backend/medusa-config.js` - All module/plugin configuration
- `backend/src/lib/constants.ts` - Environment variable exports
- `storefront/src/lib/data/index.ts` - Medusa API client functions
- `storefront/src/middleware.ts` - Region routing logic
- `storefront/store.config.json` - Feature flags (search, etc.)

## Testing

Backend uses Jest. Storefront uses Playwright for E2E:
```bash
# E2E tests
cd storefront && pnpm test-e2e
```

## Deployment Notes

- Railway template auto-configures PostgreSQL, Redis, MinIO, MeiliSearch
- Backend runs on port 9000, storefront on port 8000
- `pnpm ib` (init-backend) runs automatically on `pnpm start` for first deployment
