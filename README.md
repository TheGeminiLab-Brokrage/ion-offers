# Ion — Offer Generator

A standalone web app that lets a sales rep build a branded PDF offer for the
**Ion — Phase 2** project (Prime Developments) in a few clicks:

**pick a building → pick a unit → pick a payment plan → download a 7-page PDF offer.**

It runs entirely in the browser (no server, no database) and can be hosted on any
static host (e.g. GitHub Pages).

## Run it locally

Open `index.html` in a browser. That's it.

## How it's built

| Folder / file | Purpose |
|---|---|
| `index.html`, `css/`, `js/` | The app (vanilla HTML/CSS/JS) |
| `js/engine.js` | Payment-schedule math (verified to the pound against a real offer) |
| `js/pdf.js` | The 7-page PDF export (jsPDF) |
| `js/data.js` | Unit inventory — **auto-generated**, do not edit by hand |
| `js/assets.js` | Image lookup for the PDF |
| `assets/` | Master plan, renders, floor plans, logos |
| `vendor/jspdf.umd.min.js` | PDF library |
| `scripts/generate-data.js` | Regenerates `js/data.js` + the Excel from the inventory source |
| `assets/deliverables/Ion-Phase2-Units-DEMO.xlsx` | Editable unit sheet (demo) |
| `build-artifact.js` | Bundles everything into one file for a shareable preview |

## Update the units

Edit the inventory in `scripts/generate-data.js` (or the Excel), then run:

```
node scripts/generate-data.js
```

This rewrites `js/data.js` and the Excel deliverable from one source, so they stay in sync.

## Payment plans

Six "Equal" installment plans (10%/9%/8%/7%/6% down, and 20%/4yr) plus a Cash option
(35% discount). Installments are quarterly. Maintenance (8%) is billed as a separate
bulk due 6 months before delivery. Two "Front-Loaded" plans are pending a worked example.
