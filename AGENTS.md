# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the SPA entry point that wires up Chart.js, loads styles, and declares the rider cards plus six chart canvases. Styling lives in `styles.css`, organized top-down (base, layout containers, cards, utilities); reuse existing class names instead of adding inline styles. Behavior is concentrated in `scripts.js`, which fetches `data.json`, hydrates rider metadata, and renders charts through `createChartOptions()`. Update `data.json` when adjusting copy or palette so the UI stays data-driven. Keep any reference notes in `CLAUDE.md`.

## Build, Test, and Development Commands
- `python3 -m http.server 8000` (run from repo root) serves the static bundle locally; visit `http://localhost:8000` to test cross-browser behavior.
- `npx serve .` is an alternative zero-config host that mirrors production headers; use it when verifying caching or MIME settings.
- `open index.html` works for a quick smoke-check, but prefer a local server so fetch requests resolve.

## Coding Style & Naming Conventions
Use 4-space indentation in JS and CSS to match existing files. Favor `const` for immutable bindings, `let` otherwise, and template literals for UI strings. Function names follow verb-first camelCase (`loadDataAndInitialize`). Keep CSS class names descriptive and dash-separated (`.metric-card`). Palette tokens come from `data.json`; do not hardcode HEX values elsewhere. Run `prettier --write "*.{js,css,html}"` before sending a patch.

## Testing Guidelines
There is no automated test suite; perform manual checks in at least Chrome and Safari (or WebKit) to confirm Chart.js animations and gradients render correctly. After editing `data.json`, reload the page and verify each chart axis max/step matches the new numbers. Use the browser console to watch for fetch errors or Chart.js warnings. Record any visual regressions with screenshots in the PR description.

## Commit & Pull Request Guidelines
This snapshot lacks git history, so adopt concise, imperative commit subjects (e.g., `Add rider comparison gradients`) and include details in the body when touching multiple files. Group content, style, and behavior changes into separate commits to ease review. Pull requests should describe the problem, the UI impact, manual test steps, and mention any new dependencies. Link back to tracked issues or TODOs in `CLAUDE.md` when applicable.

## Data & Content Updates
When adding riders or metrics, extend `data.json` first, then mirror new canvases and legends in `index.html` and style hooks in `styles.css`. Keep emoji labels short to preserve layout, and update `scripts.js` constants only if a new Chart.js option is required. Store large assets (photos, fonts) outside this repo and reference CDN URLs to keep the bundle lightweight.
