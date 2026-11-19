# Solare Orbit

Interactive solar-system website for Solare Creative (Vite · React · TypeScript · Three.js / R3F · GLSL · GSAP · Zustand).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Deploy

Upload `dist/` to any static host. The site is a single-page app, so unknown paths must fall back to `index.html`:
`vercel.json` (Vercel) and `public/_redirects` (Netlify / Cloudflare Pages) are already included.

## Edit content

| What | Where |
| --- | --- |
| Projects, films, posters | `src/content/projects.ts` (media files go in `public/media/`) |
| All Turkish / English copy | `src/content/copy.ts` |
| Contact details, form endpoint, analytics | `src/config/site.ts` |
| Planets, orbits, colours | `src/config/planets.ts` |

- **Add a film:** put the file in `public/media/`, set `kind: 'film'` plus `video` / `poster` on the project, set `demo: false`.
- **Add photography:** set `kind: 'still'` and `poster` (plus optional `gallery`). Stills show as image screens, cards and a full-frame project page.
- Current photos in `public/media/` come from the existing site's assets folder.
- **Contact form:** uses a mailto fallback until `site.form.endpoint` is set (Formspree or any JSON POST endpoint).
- **Analytics:** off until `site.analytics` is configured (Plausible / Umami).
- Each planet stages up to two flat screens plus one curved screen; further projects still appear in the page gallery.

## URLs

Turkish at the root (`/films`, `/work/golden-hour`), English under `/en`.

## Secrets

Click the sun · type `solare` (or tap the top-left logo five times) · click a moon · wait for the comet.

## Planet textures

Equirectangular maps in `public/textures/` (4096 px for Venus, Earth, Mars, Jupiter; 2048 px for the rest) are from Solar System Scope, CC BY 4.0 — keep the credit on the legal page. To swap a surface, replace the file with the same name.
