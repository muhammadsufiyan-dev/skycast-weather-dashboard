# Architecture
- Keep Skycast on the root TanStack route so existing shared links and GitHub Pages URLs remain compatible.
- Use shrink-safe grid tracks and a locally scrollable hourly chart to keep narrow screens readable without page overflow.
- Use the shared Button component for weather controls so touch targets and focus states stay consistent.
- Preserve the GitHub Pages SPA shell workflow and repository-derived base path so the existing deployment continues to work.
