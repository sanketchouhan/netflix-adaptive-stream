# CLAUDE.md — Netflix Adaptive Streaming Monorepo

Agent instructions for working in this repository. For scaffolding new monorepos or workspaces, use the `.cursor/skills/monorepo-scaffold/` skill.

## Project Overview

Educational monorepo for building a Netflix-style adaptive bitrate streaming platform. TypeScript throughout, npm workspaces, Docker for infrastructure, Temporal for async video processing.

**Stack:** Express API · React/Vite web · Temporal worker · PostgreSQL/Prisma · FFmpeg transcoding · HLS playback

## Repository Structure

```
apps/
  api/       @adaptive-streaming/api    — REST API (port 3000)
  web/       @adaptive-streaming/web    — React SPA (port 5173)
  worker/    @adaptive-streaming/worker — Temporal worker (video processing)
packages/
  db/        @adaptive-streaming/db     — Prisma client + migrations
  shared/    @adaptive-streaming/shared — Shared types and constants
docker/      Postgres, Temporal, Temporal UI, worker container
scripts/     Utility scripts (init-media.sh)
```

## Key Conventions

### Workspaces

- npm workspaces: `apps/*` and `packages/*`
- Internal dependencies use `"@adaptive-streaming/<pkg>": "*"`
- Build order: **shared → db → apps**
- Node `>=20` required

### Environment

- Single root `.env` (copy from `.env.example`); never commit secrets
- Backend/worker: load via `dotenv-cli` in scripts or `dotenv.config()` pointing to repo root
- Frontend: only `VITE_*` variables (currently `VITE_API_URL`)
- `MEDIA_ROOT` points to storage **outside** the repo; mounted in Docker

### TypeScript

| Workspace | Module system | Notes |
|-----------|---------------|-------|
| api, worker, db, shared | CommonJS | `outDir: dist`, compile then run |
| web | ESM | Vite bundler, `noEmit: true` |

All backend packages use `strict: true`, target ES2022.

### Prisma (packages/db)

- Prisma v7 with `@prisma/adapter-pg` and `prisma.config.ts`
- Client generated to `packages/db/src/generated/client`
- Exclude generated code from tsconfig and git
- Commands: `npm run db:generate`, `npm run db:migrate` (from root)

Schema rules: both sides of relations, timestamps (`createdAt`/`updatedAt`), indexes on queried fields.

### Temporal (apps/worker)

- Workflows in `src/workflows/`, activities in `src/activities/`
- Must run `build:workflows` to produce `dist/workflow-bundle.js` before start
- Task queue: `video-processing` (configurable via `TEMPORAL_TASK_QUEUE`)
- Worker can run locally or via `docker compose up worker`

## Common Commands

```bash
# Setup
cp .env.example .env
npm install
npm run init:media
npm run docker:up
npm run db:generate && npm run db:migrate

# Development (run in separate terminals)
npm run dev:api       # http://localhost:3000
npm run dev:web       # http://localhost:5173
npm run dev:worker    # connects to Temporal on :7233

# Build & infra
npm run build
npm run docker:down
npm run docker:worker # rebuild worker container
```

## Service URLs (local)

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Web | http://localhost:5173 |
| Temporal gRPC | localhost:7233 |
| Temporal UI | http://localhost:8080 |
| Postgres | localhost:5432 |

## Code Patterns

### Config modules

Each Node app has `src/config/index.ts` that loads root `.env` and exports typed config with sensible defaults. Docker defaults differ from local (e.g. worker uses `temporal:7233` as fallback hostname).

### API client (web)

`apps/web/src/api/client.ts` — typed fetch wrappers. Env base URL via `import.meta.env.VITE_API_URL`.

### Adding a dependency to a workspace

```bash
npm install <pkg> -w @adaptive-streaming/api
```

### Adding a new workspace

Follow `.cursor/skills/monorepo-scaffold/SKILL.md`. Key steps: scoped `package.json`, tsconfig, root script alias, internal `"*"` deps.

## Docker Notes

- Compose file: `docker/docker-compose.yml`
- Build context is repo root (`context: ..`)
- Worker Dockerfile is multi-stage; copies only needed workspace package.json files before `npm install` for layer caching
- Postgres health check gates Temporal startup

## What NOT to Do

- Do not add per-workspace `.env` files — use root `.env` only
- Do not commit `node_modules/`, `dist/`, `.env`, or Prisma generated client
- Do not import `@temporalio/workflow` code into activities (Temporal sandbox rules)
- Do not store media files inside the repo — use `MEDIA_ROOT`
- Do not skip `db:generate` after schema changes

## Scaffolding New Projects

To create a similar monorepo or add workspaces:

1. Invoke the `monorepo-scaffold` skill (`.cursor/skills/monorepo-scaffold/`)
2. Use `reference.md` in that skill for copy-paste templates
3. Adapt scope name, infra services, and external storage paths
4. Copy this `CLAUDE.md` and the skill directory to the new repo
