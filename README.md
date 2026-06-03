# ADS LAB — Ngajigaes.id

Dashboard monitoring performa Meta Ads + riset kompetitor, khusus untuk **Ngajigaes.id**.

Versi single-brand dari ADS LAB — fokus penuh ke satu brand tanpa brand switcher.

## Fitur

- **Dashboard** — Hero KPI (ROAS, Cost/Purchase, Profit Rate, Spend) + sparkline, campaign table 3-level (campaign → adset → ad) dengan drag-sort, winning ads, alert real-time
- **ADS LAB Kompetitor** — Ad Intelligence (filter funnel + preview), Competitor Analysis, Top Domains, Watchlist (niche: ngaji & quran online)
- **Automation** — Activity feed, creative pool, copy management (Phase 6)
- **Settings** — KPI targets, scoring weights, alert thresholds (localStorage + Supabase)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (static export), TypeScript, Tailwind |
| Database | Supabase (PostgreSQL) — optional, fallback ke mock data |
| Functions | Netlify Functions (meta-fetch, send-alert) |
| Data Source | Meta Ads Library + Marketing API |

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

### Environment (optional — untuk live data)

Copy `.env.local.example` → `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_NETLIFY_URL=https://your-site.netlify.app
```

Tanpa env, app jalan dengan mock data Ngajigaes.id.

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `out`
- Static export — tidak butuh plugin Next.js

## Brand Config

Single brand di-lock via `context/AppContext.tsx`:

```ts
export const BRAND_ID    = 'ngajigaes';
export const BRAND_NAME  = 'Ngajigaes.id';
export const BRAND_COLOR = '#6366F1';
```
