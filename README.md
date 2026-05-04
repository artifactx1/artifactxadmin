# Artifactx Admin

Internal control surface for managing the Artifactx marketplace. See [`../../ElementServer/ADMIN_PANEL_SPEC.md`](../../ElementServer/ADMIN_PANEL_SPEC.md) for the full spec.

## Stack

- Next.js 14 (Pages Router, JS — matches the main `ELEMENT` frontend)
- Tailwind CSS
- SWR for data fetching
- Axios for the API client
- Talks to ElementServer for auth (`/admin/login`) and every state-changing endpoint

## Run

```bash
cp .env.example .env
# edit .env to point at the right ElementServer
npm install
npm run dev
# → http://localhost:3100
```

The dev server proxies `/api/*` to whatever `ELEMENT_SERVER_URL` is set to, so admin session cookies stay same-origin and there's no CORS to wire.

## Auth

`/admin/login` (on ElementServer) sets an HTTP-only cookie. `lib/auth.js#useAdminSession` hydrates the current admin from `/admin/me` and bounces to `/login` on 401. `components/admin-layout.jsx` wraps every admin page with that check.

## Build state

This is the **scaffold** — every module page exists and renders chrome, but most are placeholders pointing at the spec. The login flow, navigation, layout, and dashboard skeleton are wired.

Phase 1 (per spec §8): Collections list/detail with flag toggles + reindex, Drops diagnostics, NFTs detail with refresh-metadata, Activity diagnostics, Users verify+dedupe, Reports queue, Indexer replay, Audit log, Admin users.

## Conventions

- Admin pages live under `pages/admin/*` and are wrapped in `<AdminLayout>`.
- All API calls go through `lib/api.js` (`baseURL: '/api'`, `withCredentials: true`).
- Stick with Tailwind utilities + the `ink-*` palette in `tailwind.config.js`.
- One module per file; if a module grows, promote it to its own folder.
- No emoji in code or copy.

## Deploy

TBD. Likely Vercel pointed at an ElementServer instance via `ELEMENT_SERVER_URL`. `noindex,nofollow` is set in `_app.jsx` to keep this off search indexes.
