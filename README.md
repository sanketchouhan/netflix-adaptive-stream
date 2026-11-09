# Netflix Adaptive Streaming

An educational, Netflix-style adaptive video streaming platform. Uploads are stored in shared media storage, processed asynchronously by a Temporal worker using FFmpeg, and served as HLS for browser playback.

## Stack

- **Web:** React, TypeScript, Vite, and hls.js
- **API:** Express and TypeScript
- **Processing:** Temporal workflows and FFmpeg
- **Data:** PostgreSQL and Prisma
- **Infrastructure:** Docker Compose

## How it works

1. Upload a video from the web app.
2. The API stores the upload, creates a video record, and starts a Temporal workflow.
3. The worker transcodes the video into adaptive HLS variants and updates its processing status.
4. The web app polls for status and plays the master HLS playlist when processing completes.

## Prerequisites

- Node.js 20 or newer and npm
- Docker with Docker Compose
- FFmpeg and ffprobe on `PATH` when running the worker locally (the worker container includes FFmpeg)
- Bash to run `scripts/init-media.sh` (for example, Git Bash or WSL on Windows)

## Getting started

1. Create the root environment file:

   ```sh
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

2. Set `MEDIA_ROOT` in `.env` to an absolute path **outside this repository**. This directory is shared by the API and worker; Docker mounts it into the worker container. Ensure the path is accessible to Docker.

3. Install dependencies and prepare media directories. The media script does not read `.env` itself, so pass the same `MEDIA_ROOT` value from your shell:

   ```sh
   npm install
   MEDIA_ROOT=/absolute/path/to/media npm run init:media
   ```

   In PowerShell, set `$env:MEDIA_ROOT = 'D:\path\to\media'` before running `npm run init:media`.

4. Start PostgreSQL, Temporal, the Temporal UI, and the worker:

   ```sh
   npm run docker:up
   ```

5. Generate the Prisma client and apply database migrations:

   ```sh
   npm run db:generate
   npm run db:migrate
   ```

6. In separate terminals, start the API and web app:

   ```sh
   npm run dev:api
   ```

   ```sh
   npm run dev:web
   ```

   Open the web app at [http://localhost:5173](http://localhost:5173). Upload a video, then follow its status and playback from the stream page.

The Compose stack starts a worker container. If you prefer to run the worker locally, start only the required infrastructure services instead:

```sh
docker compose -f docker/docker-compose.yml up -d postgres temporal temporal-ui
npm run dev:worker
```

Do not run both the Compose worker and local worker against the same task queue during development.

## Environment variables

The root `.env.example` documents the supported variables. Common settings:

| Variable | Purpose | Default |
|---|---|---|
| `MEDIA_ROOT` | Shared host directory for uploaded and transcoded media | `/data/adaptive-streaming-media` for local Node processes; Compose supplies a Windows host path if unset |
| `PORT` | API port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Local PostgreSQL on port `5432`, database `adaptive_streaming` |
| `TEMPORAL_ADDRESS` | Temporal address | `localhost:7233` locally; Compose worker uses `temporal:7233` |
| `TEMPORAL_TASK_QUEUE` | Queue used by the API and worker | `video-processing` |
| `CORS_ORIGIN` | Allowed web origin for the API | `http://localhost:5173` |
| `FFMPEG_PATH`, `FFPROBE_PATH` | Executable paths used by a locally run worker | `ffmpeg`, `ffprobe` |
| `VITE_API_URL` | API base URL used by the web app | `http://localhost:3000` |

Docker Compose reads the root `.env` for `MEDIA_ROOT` when mounting shared media storage.

## Services

| Service | Local URL |
|---|---|
| Web app | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:3000](http://localhost:3000) |
| API health check | [http://localhost:3000/health](http://localhost:3000/health) |
| Temporal UI | [http://localhost:8080](http://localhost:8080) |
| Temporal gRPC | `localhost:7233` |
| PostgreSQL | `localhost:5432` |

## API endpoints

The video API is mounted under `/api/v1/videos`:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/videos` | List videos and their processing status |
| `POST` | `/api/v1/videos/upload` | Upload a video as multipart form field `video` |
| `GET` | `/api/v1/videos/:videoId` | Get a video's processing status and stream URL |

Completed HLS output is served from `/media/output/<videoId>/master.m3u8`.

## Useful commands

| Command | Description |
|---|---|
| `npm run build` | Build all workspaces |
| `npm run dev:api` | Run the API in development mode |
| `npm run dev:web` | Run the Vite development server |
| `npm run dev:worker` | Build and run the worker locally |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply Prisma development migrations |
| `npm run docker:up` | Start the full Docker Compose stack |
| `npm run docker:down` | Stop the Docker Compose stack |
| `npm run docker:worker` | Rebuild and start the Compose worker |

## Repository layout

```text
apps/
  api/       Express REST API
  web/       React single-page app
  worker/    Temporal video-processing worker
packages/
  db/        Prisma schema, client, and migrations
  shared/    Types and constants shared across workspaces
docker/      PostgreSQL, Temporal, UI, and worker Compose setup
scripts/     Development utilities
```

## Notes

- Keep media outside the repository and configure one shared `MEDIA_ROOT` for the API and worker.
- The Compose worker needs the media directory mounted at the same host path configured by `MEDIA_ROOT`.
- The local worker requires FFmpeg and ffprobe installed and reachable via the configured executable paths.
- Do not commit `.env`, generated build output, `node_modules`, or generated Prisma client files.
