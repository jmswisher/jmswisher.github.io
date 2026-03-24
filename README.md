# Janet Swisher's Portfolio Repo

A static-site, Git-friendly portfolio system for position-specific landing pages.

## Why do make this site this way?
This site is overkill for a writing portfolio site. I could have whipped up some HTML and CSS for a static site quickly and been done with it.
This site represents a way of thinking about documentation and metadata, especially in the AI age. This site is not intended for use by RAG systems, but it contains the type of metadata that a RAG system might make use of.

## What this repo contains
- `index.html` hub page
- Position-specific portfolio pages in `positions/`
- Shared CSS
- JSON data files for site config, positions, documents, document "objects", and selections of doc objects per position. (Document objects are "lenses" on documents: the same document can be viewed and described in multiple ways.)
- Build script that generates the hub pages and portfolio pages based on the JSON files

## Workflows
To add a new sample:
1. Add PDFs or images in the assets/ folder.
2. Update `documents.json` and `objects.json` with metadata about the samples.
3. For positions where this sample is appropriate, update `selections.json`.
4. Run `build.js` to regenerate the site.

To add a new position:
1. Update `organizations.json` if this is for a new organization. Company names are not used; I keep that mapping privately elsewhere.
2. Update `positions.json` with info about the position.
3. Update `selections.json` with document objects that are appropriate portfolio items for the position.
4. Run `build.js` to regenerate the site.

## File conventions
- Use lowercase, hyphenated filenames.
- Prefer WebP/PNG for images.
- Keep PDFs reasonably small when possible.

## To-dos
- Convert build.js into a GitHub Action. Currently, I run it locally and check in the updated output files into `docs`.
- Create tools/checks to ensure consistency among JSON files.

## Future work
- Enable "smart" selection of portfolio items.
