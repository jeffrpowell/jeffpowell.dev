# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm-workspace monorepo of independent Cloudflare Workers powering jeffpowell.dev and its subdomains. Each directory under `workers/*` is its own deployable worker with its own `wrangler.jsonc` and bundled Wrangler version. There is no shared application framework — workers are coupled only through shared Cloudflare resources (KV namespaces, R2 buckets) and a small shared date module.

## Commands

Run from the repo root:
- `pnpm install` — install all workspace deps
- `pnpm build` / `pnpm build-prod` — recursively run `build` / `build-prod` in every worker that defines one (only `jeffpowell-dev` does today)

Run from inside a worker directory (`cd workers/<name>`):
- `pnpm dev` — local dev server. For `jeffpowell-dev` this is `pnpm build && wrangler dev`; for the others it is bare `wrangler dev`
- `pnpm wrangler deploy` / `tail` / `whoami` — Wrangler is invoked per-worker, not globally

There is no test runner or linter configured in this repo.

### `jeffpowell-dev` build (the only worker with a build step)
- `pnpm build` — webpack dev build → `dist/`
- `pnpm build-watch` — webpack dev build with `--watch`
- `pnpm build-prod` — minified production build (Terser + CSS minimizer)

### Cloudflare auth
`wrangler dev`/`deploy` require Cloudflare credentials. Either run the login workaround (`pnpm wrangler login --callback-host 0.0.0.0`, then swap `0.0.0.0`→`localhost` in the browser URL — see README) or provide `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` in a `.env` file (copy `.env.example`). The devcontainer's `--env-file` flag requires `.env` to exist or it fails to load.

## Worker architecture

Two worker shapes are used:
- **HTTP workers** export `default { async fetch(request, env, ctx) }` — `jeffpowell-dev`, `tangram-calendar`, `tangram-calendar-submit`, `email-register`.
- **Email worker** — `email-triage` exports `default { async email(message, env, ctx) }`, an Email Routing handler (no HTTP entry point). It decides the destination (primary vs. backup based on a `PRIMARY_STATUS` health flag in KV), deduplicates retries via `KV_DEDUP` (2-week TTL), archives raw messages to the `email-backup` R2 bucket, and logs to an Analytics Engine dataset.

### Shared resources couple the workers
- `KV_EMAIL` (same namespace id) is **written** by `email-register` (alias → target) and **read** by `email-triage` for routing. A `target` of `"DEFAULT"` means "route to primary/backup per health status."
- `KV_HINTS` / `KV_SOLUTIONS` are shared by `tangram-calendar` (read/serve) and `tangram-calendar-submit` (write). Keyed by ISO date (`YYYY-MM-DD`).
- Changing a binding id/name in one worker's `wrangler.jsonc` can silently break the other worker that shares it.

### Shared date module
`workers/date-util/index.js` has **no `package.json`** and is not an npm dependency. Workers that use it import it by relative path (`../../date-util/index.js`) and declare it in `wrangler.jsonc` via a `rules` ESModule glob so Wrangler bundles it. Replicate both the import and the rule when adding a new consumer.

### Static asset serving pattern
Workers that own a domain serve static files from R2 (not Workers Assets) with edge caching: `assets.run_worker_first` routes a path prefix (`/assets/*`) through the worker first, which checks `caches.default`, falls back to an R2 `.get()`, sets `Cache-Control`/`etag`, and writes back to cache via `ctx.waitUntil`. See `workers/jeffpowell-dev/worker-src/index.js`. `email-register` instead uses `assets.binding` (`env.ASSETS.fetch`) with SPA fallback and `run_worker_first: ["/api/*"]`.

## `jeffpowell-dev` frontend

A multi-page HTMX site bundled by webpack, kept separate from the worker code:
- `worker-src/` — the Cloudflare worker (R2 asset server above), `main` entry in `wrangler.jsonc`
- `src/` — frontend source: `index.js` entry, `index.html` + per-page HTML in `src/pages/<name>/`, Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `dist/` — webpack output, served as the worker's `assets.directory`

The webpack `CopyWebpackPlugin` patterns list each page's HTML explicitly — **adding a new page requires adding it to `webpack.development.config.js`**, plus a `data-page` element and a page class registered in the `pages` map in `src/index.js` (each page implements the `PageInterface` lifecycle, instantiated on `htmx:afterSettle`).

## Adding a new worker

1. `mkdir workers/<name>`, add `package.json` (copy another worker's) and `wrangler.jsonc`. The pnpm workspace (`workers/*`) picks it up automatically.
2. Most configs set `workers_dev: false`, `preview_urls: false`, and `dev.ip: "0.0.0.0"` (the `0.0.0.0` is required to reach the dev server from inside the devcontainer).
3. To pull an existing worker from the dashboard for reference: `pnpm wrangler --cwd workers init --from-dash <name>` (it downloads to `/tmp/` and errors looking for `wrangler.toml`; manually copy `wrangler.jsonc` out).
