# D&D Character Sheet Designer

A lightweight single-page app for drafting a 3.5e/Pathfinder-style D&D character sheet with a live preview.

## Run locally

The app's JavaScript is split into ES modules (see [js/](js/)), so it must be served over `http(s)://` — browsers block module imports when a page is opened directly via `file://`.

Serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/.

## Code layout

- `js/state.js` — data model, constants, localStorage persistence
- `js/helpers.js` — formatting/number helpers (ability modifiers, signed numbers, escaping)
- `js/rows.js` — renders the dynamic add/remove row lists in the editor
- `js/preview.js` — renders the live sheet preview
- `js/app.js` — entry point: wires up event listeners and boots the app
