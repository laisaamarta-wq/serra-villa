# Serra

Concept website for Serra, a fictional private villa set into a wooded Mediterranean ridge above a bay.
Concept, design and imagery by Marta Jakovleva, 2026. Serra is not a real property; nothing on the site is a listing,
and the stay enquiry form sends nothing.

## The site

- A walk-through film opens the page, then the villa, its architecture (an axonometric drawing to scale),
  an interactive floor plan with a photograph of every room, materials, the making of the villa,
  the setting, life through the day and a stay enquiry.
- Vanilla JavaScript with Vite. No framework, no environment variables, no back end.
- Photographs and films are served from a CDN; their addresses are in `src/content.js`.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Editing content

All copy, media, room photographs, plan geometry and location facts live in `src/content.js`.
The location stays generic until `LOCATION.confirmed` is set to `true` with a verified region and distances.

## Deploy

Vercel, Vite preset: install `npm install`, build `vite build`, output `dist` (also set in `vercel.json`).
