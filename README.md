# Janet Swisher's Portfolio Repo

A static, Git-friendly portfolio system for position-specific landing pages.

## What this site includes
- `index.html` hub page
- `position.html` reusable position page template
- Shared CSS and JS
- JSON data files for site config, positions, and projects
- Empty asset folders for PDFs and images
- A matching smart table template (separate workbook) to populate the JSON

## Recommended workflow
1. Upload sample PDFs and images into:
   - `assets/pdfs/`
   - `assets/images/`
2. Fill out the smart table workbook.
3. Copy/export the rows into:
   - `data/positions.json`
   - `data/projects.json`
4. Publish with GitHub Pages.

## File conventions
- Use lowercase, hyphenated filenames.
- Prefer WebP/PNG for images.
- Keep PDFs reasonably small when possible.

## Key data files
- `data/site.json`: global site metadata
- `data/positions.json`: position-specific page settings
- `data/projects.json`: reusable work samples / case studies

## How the renderer works
`assets/js/app.js` reads the JSON files and:
- populates the homepage with position cards
- renders one position-specific page based on the `?slug=` URL parameter

Example:
- `index.html`
- `position.html?slug=acme-data-analyst`

## Notes
- This is a static-site site. No backend or database is required.
- Asset references should use repo-relative paths, e.g.:
  - `assets/images/dashboard.png`
  - `assets/pdfs/case-study-sales-dashboard.pdf`
