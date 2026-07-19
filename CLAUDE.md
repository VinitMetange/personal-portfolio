# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A personal portfolio site for Vinit Metange — a static single-page site with no build step, no framework, and no dependencies beyond two Google Fonts. The entire site is three files in `docs/`.

## Deployment

The site is published via **GitHub Pages** from the `docs/` folder on the `main` branch. To preview locally, open `docs/index.html` directly in a browser or run any static file server:

```bash
cd docs && python3 -m http.server 8080
```

There is no build, compile, or bundler step.

## File structure

```
docs/
  index.html   — full single-page site (all sections inline)
  styles.css   — design system + all component styles
  script.js    — all client-side behaviour (IIFE, no modules)
```

## Architecture decisions

**Single HTML file.** All sections (Hero, Credibility Strip, About, Services, Work, Experience, Contact) live in `docs/index.html` as sequential HTML. Sections are separated by comments like `<!-- SERVICES -->`.

**CSS custom properties for theming.** `styles.css` uses `:root` for the light theme tokens and `[data-theme="dark"]` overrides the same token names. Light/dark toggle is driven by `data-theme` on `<html>` and persisted to `localStorage` under key `vm-theme`.

**Scroll reveal.** Elements with class `.reveal` are animated in via `IntersectionObserver` in `script.js`. Adding `.reveal` to any element opts it into the fade-in-on-scroll behaviour.

**Fonts.** `Instrument Serif` (display/headings) and `Inter` (body) are loaded from Google Fonts. CSS tokens `--font-display` and `--font-body` are used throughout.

**Contact form.** Submits via Formspree (POST to `https://formspree.io/f/${FORMSPREE_ID}`). The form ID constant `FORMSPREE_ID` is at the top of the handler in `script.js:159`. Replace `YOUR_FORM_ID` with the actual Formspree form ID to activate it.

## Accent colour

`--accent: #0d9488` (teal-600). Used for links, CTAs, and highlights. `--accent-hi` is the hover/active shade; `--accent-lo` is the pale background tint.
