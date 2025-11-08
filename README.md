# Pogi v Merckx

React single-page app that compares Eddy Merckx and Tadej Pogačar using Chart.js visuals powered by data from `public/data.json`.

## Development

1. Install dependencies with `npm install`.
2. Start the local dev server via `npm run dev` (Vite, default port 5173).
3. Build the optimized bundle with `npm run build` and preview it using `npm run preview`.

## Data updates

- Rider bios, color tokens, and metric values live in `public/data.json`.
- Update copy or palette values there first so the UI stays data-driven.
- Chart styling comes from `src/styles.css`; keep palette usage centralized through the JSON colors.
