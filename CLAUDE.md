# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScrapCasino is a full-stack Rust-themed loot crate gambling platform. Users authenticate via Steam OAuth, open crates to win items, and chat in real time. The monorepo uses pnpm workspaces with Turbo orchestration.

- `apps/api` — NestJS 11 + Fastify backend, PostgreSQL via Drizzle ORM, Socket.io
- `apps/app` — Next.js 16 frontend, React Query, Zustand, Tailwind CSS v4

## Commands

Run from the repo root unless noted.

### Development
```bash
pnpm dev                     # Start all dev servers in parallel (Turbo)
pnpm -F api start:dev        # API only (hot reload, port 3001)
pnpm -F app dev              # Frontend only (port 3000)
```

### Database
```bash
pnpm db:push                 # Apply Drizzle schema to dev DB
pnpm db:push:test            # Apply schema to test DB
pnpm db:generate             # Generate migration files
pnpm db:migrate              # Run migrations
pnpm db:seed                 # Seed crate data (runs scripts/seed-crate.ts)
pnpm -F api db:studio        # Open Drizzle Studio
```

> **Whenever you modify `src/database/schema.ts`**, run `pnpm db:generate --name <descriptive_name>` to create a new migration file. Use snake_case to describe what changed — e.g. `pnpm db:generate --name add_users_balance_column`. Migration files live in `apps/api/drizzle/` and must be committed alongside schema changes.

### Testing
```bash
pnpm test:e2e                # Run API E2E tests (requires test DB)
pnpm -F api test             # API unit tests
pnpm -F api test:watch       # Unit tests in watch mode
pnpm -F api test:cov         # Unit tests with coverage
```

### Code Quality
```bash
pnpm lint                    # ESLint --fix on both packages
pnpm format                  # Prettier check (not --write)
pnpm typecheck               # TypeScript noEmit check on both packages
```

### API Client Generation
```bash
pnpm generate:client         # Generate TypeScript client from Swagger spec into apps/app/src/client/
```
This command first runs `generate:swagger` (boots NestJS, writes `apps/api/client.json`, exits — no running server needed) then runs `swagger-typescript-api` to produce `apps/app/src/client/api.ts`.

> **Never manually edit `apps/api/client.json` or `apps/app/src/client/api.ts`** — both are auto-generated. Run `pnpm generate:client` to update them.

## Architecture

### Backend (`apps/api`)

**Module structure** (`src/modules/`): `app` (root), `auth`, `user`, `chat`, `crate`, `database`. Each is a self-contained NestJS feature module.

**Authentication** is session-based via signed HTTP-only cookies. `AuthGuard` (`src/guards/auth.guard.ts`) is applied globally; use `@IsPublic()` to opt routes out. Steam OAuth flow lives in the `auth` module.

**Authorization** uses `RolesGuard` with `@Roles()` decorator. User roles are stored on the `users` table.

**Environment** — all env vars are validated at startup in `src/utils/env.ts` and exported from there. Import env values from this file, not directly from `process.env`.

**Database schema** is defined in `src/database/schema.ts` (Drizzle). Tables: `users`, `sessions`, `serverSeeds`, `chatMessages`, `crates`, `items`, `crateItems`, `crateHistory`.

**Real-time chat** uses Socket.io via `IoAdapter` registered in `main.ts`. The `chat` module handles WebSocket gateway.

**Swagger** is auto-generated from NestJS decorators and exported to `client.json` on startup, which is used by `generate:client`.

### Frontend (`apps/app`)

**Routing**: Next.js App Router. Pages: `/` (home), `/crates` (browse), `/crate/[id]` (open crate), `/rewards` (levels).

**Data fetching**: `src/queries/` for reads (React Query), `src/mutations/` for writes. The auto-generated Axios client in `src/client/` is the only HTTP layer — do not use raw `fetch`/`axios` calls.

**State**: Zustand (`src/store/`) for global client state; React Query for server state. `UserProvider` (`src/providers/`) wraps the app and exposes the current user.

**Real-time**: Socket.io-client in the chat components subscribes to live message events.

**Styling**: Tailwind CSS v4 with `tailwind-scrollbar` plugin. No CSS modules.

**Forms**: React Hook Form + Zod for validation.

## Local Setup

1. Start PostgreSQL: `docker compose up -d`
2. Copy env files: `cp apps/api/.env.example apps/api/.env` and `cp apps/app/.env.example apps/app/.env`
3. Fill in `STEAM_API_KEY` and `SESSION_SECRET` in `apps/api/.env`
4. `pnpm install`
5. `pnpm db:push`
6. `pnpm db:seed` (optional)
7. `pnpm dev`

Docker Compose starts PostgreSQL 16 on port 5432. The init script (`docker/init.sql`) also creates the `scrapcasino_test` database used by E2E tests.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main` and PRs:
1. **lint-and-format**: ESLint + Prettier check on both packages
2. **run-tests**: Spins up PostgreSQL, runs `db:push:test`, then `test:e2e`
