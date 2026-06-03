# Image Builder — Interactive Prototype

PatternFly **6** interactive prototype of the RHEL **Image builder** console, based on `Untitled.pdf`.

Uses the official [@patternfly/patternfly](https://www.patternfly.org/) HTML/CSS library (v6.5.2). See [Develop with PatternFly](https://www.patternfly.org/get-started/develop) for documentation.

## Run locally

```bash
cd /home/anilsson/Projects/Builder
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

### Optional: refresh PatternFly from npm

```bash
npm install
```

This copies `patternfly.min.css`, `patternfly-addons.css`, and the `assets/` folder (fonts and icons) into `vendor/`.

## Features

- **Page layout** — `pf-v6-c-page`, masthead, vertical nav, breadcrumbs
- **Images table** — `pf-v6-c-table`, labels, link buttons, expandable rows
- **Toolbar** — menu-toggle filters, search input group, pagination, action list
- **Modals** — `pf-v6-c-modal-box` (Download RHEL, Import, cloud launch)
- **Cards & popover** — ISO download cards, details popover

Use the bottom **Prototype controls** bar to toggle empty state or open cloud launch modals.

## Files

| File | Purpose |
|------|---------|
| `index.html` | PatternFly 6 markup |
| `app.js` | Interactivity |
| `styles.css` | Minimal prototype-only overrides |
| `vendor/patternfly*.css` | PatternFly 6.5.2 styles |
