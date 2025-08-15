# Pebble Path

Your daily check-in buddy.

## Tech
- React + Vite + TypeScript
- Tailwind (v4), React Router, React Query
- Recharts (charts), react-hot-toast, XLSX (CSV/Excel)
- PWA via `vite-plugin-pwa`

## Getting Started

```bash
npm install
npm run dev
```

## Configure Backend (Google Apps Script)
- Set your Apps Script web app URL in `src/services/api.ts` `BASE_URL`.
- The script should support:
  - `GET ?action=get&date=YYYY-MM-DD` → one day
  - `GET ?action=range&from=YYYY-MM-DD&to=YYYY-MM-DD` → array of days
  - `POST { action: 'save', payload: DayEntry }` → upsert
- Enable CORS to allow the site origin. Return JSON.

### DayEntry shape
```
{
  date: string,                // ISO yyyy-mm-dd
  weight?: string,             // optional (weekly)
  meals_snacks: string[],
  water_stanleys: number,      // 0–8
  mood: number,                // 1–5
  physical_health: number,     // 1–5
  workout: string,             // preset or other
  injection: boolean,          // weekly
  injection_note?: string,
  notes?: string
}
```

## Build & Deploy (GitHub Pages)
1. Add to `vite.config.ts` if deploying to repo subpath: `base: '/<repo>/'`.
2. Build and preview:
```bash
npm run build
npm run preview
```
3. Push to GitHub and enable Pages → Deploy from `dist/` via an action, or use a GH Action workflow for Vite.

## WordPress Embed
- Option 1: Host on GitHub Pages and embed via iframe:
```html
<iframe src="https://<user>.github.io/<repo>/" style="width:100%;height:100vh;border:0;" allow="fullscreen;display-capture"></iframe>
```
- Option 2: Use a subdomain pointing to Pages and embed.

## Testing
```bash
npm run test
```

## Notes
- App is PWA installable.
- Dashboard updates immediately after save via React Query cache updates.
- CSV/Excel export available on Dashboard by date range.
