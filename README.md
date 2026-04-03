# Janet Swisher's Portfolio Repo

A static-site, Git-friendly portfolio system for position-specific landing pages.

## Why make this site this way?
This site is overkill for a writing portfolio site. I could have whipped up some HTML and CSS for a static site quickly and been done with it.
This site represents a way of thinking about documentation and metadata, especially in the AI age. This site is not intended for use by RAG systems, but it contains the type of metadata that a RAG system might make use of.

The current implementation keeps data for the system in a set of JSON files, which represents a very crude flat-file database and does not scale at all. However, it is sufficient for my immediate need of managing a fairly small number of items.

## What this repo contains
- `assets/`: PDFs of portfolio items, shared CSS, folder for future thumbnail images
- `data/`:JSON data files for site config, positions, documents, document "samples", and selections of doc objects per position. (A sample is a "lens" on a document: the same document can be viewed and described in multiple ways, as different samples.)
- `docs/`: Output directory for generated static files for https://jmswisher.github.io/
- `scripts/build.js`: Build script that generates the hub page and portfolio pages based on the JSON files

## Workflows
To add a new sample:
1. Add PDFs or images in the assets/ folder.
2. Update `documents.json` and `objects.json` with data about the sample.
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
- Replace JSON with a "real" lightweight database.

## Future work
- Enable "smart" selection of portfolio items.
