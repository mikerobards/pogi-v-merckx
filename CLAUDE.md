# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website that provides an interactive visual comparison between two cycling legends: Eddy Merckx ("The Cannibal") and Tadej Pogačar ("Pogi"). The site uses Chart.js to render bar charts comparing various performance metrics across different eras of professional cycling.

## Architecture

### Static HTML/CSS/JavaScript Application

- `index.html` - Main page structure with 6 metric comparison cards
- `styles.css` - Modern glassmorphic design with gradients, animations, and responsive layout
- `scripts.js` - Chart.js initialization and interactive features
- `data.json` - Centralized data store for rider information and statistics

### Key Dependencies

- Chart.js (loaded via CDN) - For rendering bar charts
- Inter font (Google Fonts) - Typography

### Data-Driven Architecture

The application follows a data-driven pattern where all rider information and metrics are stored in `data.json`. The JavaScript asynchronously loads this data on page initialization and dynamically:

- Populates rider information cards
- Generates all charts from metric data
- Updates legend values
- Applies color schemes from rider definitions

## Development

### Local Development

Open `index.html` directly in a browser, or use a simple HTTP server:

```bash
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

### No Build Process

This project has no build step, package manager, or compilation requirements. All files are served directly.

## Code Structure

### Data Layer (data.json)

Structured JSON containing:

- `riders` object: Rider metadata (name, nickname, country, active years, color scheme)
- `metrics` array: Each metric includes id, title, values for both riders, chart configuration (maxValue, stepSize), and optional notes

### Chart Configuration (scripts.js)

- `loadDataAndInitialize()` - Async function that fetches data.json and initializes the app
- `createChart(metric)` - Factory function that creates a Chart.js instance from metric data
- `updateRiderCards()` - Populates rider info cards with data from JSON
- `updateLegends()` - Dynamically updates all legend text with rider names and values
- `getUnitLabel(title)` - Helper to extract appropriate unit labels from metric titles
- All charts use centralized `createChartOptions()` factory function
- Performance optimization uses Intersection Observer for lazy visibility tracking

### Styling System (styles.css)

- CSS custom properties (`:root` variables) define the design system
- Glassmorphism effect using `backdrop-filter: blur(20px)` on header and footer
- Responsive grid layout with `grid-template-columns: repeat(auto-fit, minmax(450px, 1fr))`
- Staggered animation delays for metric cards (0.3s-0.8s)

## Making Changes

### Updating Statistics

All data changes should be made in `data.json`:

- To update statistics: Modify the `merckx` or `pogacar` values in the metrics array
- To add a new metric: Add a new object to the `metrics` array with required fields (id, title, merckx, pogacar, maxValue, stepSize)
- To change rider information: Edit the `riders` object
- To change color schemes: Modify `colorPrimary`, `colorSecondary`, and `colorLight` in rider objects

### Adding New Metrics

1. Add metric data to `data.json` metrics array
2. Add corresponding HTML structure to `index.html` with matching canvas id
3. The JavaScript will automatically generate the chart and populate legend values

### Modifying Charts

- Chart options: `createChartOptions(maxValue, stepSize)` function in scripts.js
- Chart type/style: Modify `createChart()` function in scripts.js

### Styling Updates

- Design tokens: Edit CSS custom properties in `:root` (styles.css:9-35)
- Animations: Keyframes defined throughout styles.css
- Responsive breakpoints: `@media` queries at lines 430-458
