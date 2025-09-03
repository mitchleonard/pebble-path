## Pebble Path

Your daily check-in buddy. A super-light PWA that logs daily health signals and shows quick insights. Designed for GitHub Pages or any static host.

### Features
- Daily Home screen: meals/snacks quick-add, water (Stanleys), mood, physical health, workout, weekly weight/injection, notes.
- Dashboard: averages, totals, recent list, and export to Excel.
- Works offline, installs as an app (PWA), instant save via IndexedDB.

### Tech
- React + TypeScript + Vite, Tailwind CSS
- Zustand state with IndexedDB (localforage)
- PWA via `vite-plugin-pwa`

### Run locally
```bash
npm install
npm run dev
```

### Build
```bash
npm run build && npm run preview
```

### Test
```bash
npm test
```

### Deploy to GitHub Pages
1. Set repo Pages to serve from `root` of `main` (or `docs` if preferred).
2. Commit `dist/` via GitHub Action or `gh-pages` branch. For simplest:
   - Add a workflow using `actions/upload-pages-artifact` + `actions/deploy-pages`.

### Data Export
Use Dashboard date pickers and click Export to download an `.xlsx` spreadsheet. CSV can be added similarly.

### Branding
Primary color `#7C4DFF`, fonts Poppins (display) + Inter (body). Update `tailwind.config.ts` to tweak.


