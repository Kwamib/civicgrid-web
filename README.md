# civicgrid-web

The www.civicgrid.org frontend: Next.js 16 (App Router), Tailwind v4, Supabase auth.
It deploys to Vercel through Vercel's Git integration.

## Pages

- `/`: city explorer. Search, State and Population size filters, sorting, pagination, and a detail panel. Filtering runs over the full dataset before paging.
- `/cities/[slug]`: city profile with leadership, source and verification dates, published history, and demographics.
- `/developers`, `/methodology`, `/correction`: API docs, how records are checked, and a correction email draft.
- `/states`, `/compare`, `/dashboard`, `/login`: unchanged behaviour, new chrome.
- `/admin/review`: restricted review queue (Accept / Correct / Dismiss / Retry). `/admin/cities`: Fix a city.

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `CIVICGRID_API_KEY` | server | Key used to read city data |
| `ADMIN_TOKEN` | server | Admin API token for the review queue and Fix a city |
| `ADMIN_EMAILS` | server | Comma-separated admin allowlist (changing it needs a redeploy) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Auth |
| `CIVICGRID_API_BASE` | server, optional | Point at a local API, e.g. `http://127.0.0.1:8000`. Defaults to production. |

## Develop

```bash
npm ci
npm run dev
npm run lint && npx tsc --noEmit
```

Design tokens (navy, cobalt, ink, muted, line, panel) live in `src/app/globals.css`.
Shared UI is in `src/components/ui.tsx`, and display and filter helpers are in `src/lib/format.ts`.
