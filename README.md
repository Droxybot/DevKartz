# DevKartz website

A static site (plain HTML, CSS and JavaScript). No build step and no dependencies.

## Deploy on Vercel
1. Put this folder in a GitHub repository.
2. In Vercel choose **Add New → Project**, import the repo, and keep the defaults:
   Framework Preset **Other**, Build Command empty, Output Directory empty (the root).
3. Add your domain under Project → Settings → Domains.

## Run locally
`python3 -m http.server 8000` and open http://localhost:8000

## After the extension is approved
Open `js/main.js` and set `STORE_URL` at the top to your Chrome Web Store listing URL.
Every "Add to Chrome" button then opens the store page instead of the "coming soon" dialog.

## After you choose a domain
- Add `<link rel="canonical" href="https://YOUR-DOMAIN/">` and `<meta property="og:url" content="https://YOUR-DOMAIN/">` to `index.html`.
- Make the `og:image` value absolute: `https://YOUR-DOMAIN/img/og-image.png`.
- Uncomment the Sitemap line in `robots.txt` and add a `sitemap.xml`.
- Use `https://YOUR-DOMAIN/privacy` as the privacy policy URL in the Chrome Web Store dashboard.

## Files
- `index.html`, `privacy/index.html`: the two pages
- `css/style.css`: all styling (colours are CSS variables at the top)
- `js/main.js`: scroll effects, the working demo, dialogs
- `img/`: logo icon, transparent mark, wordmark, social preview image
- `vercel.json`: security headers, caching, clean URLs (`/privacy`)
