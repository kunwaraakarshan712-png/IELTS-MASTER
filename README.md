IELTS MASTER — Single-page marketing & educational site

This repo contains a static single-page site designed to convert visitors to WhatsApp enrollments for the IELTS Master Course.

Files:
- index.html — main page
- styles.css — site styles
- script.js — interactive features (band calculator, raw converter, timers, checklist localStorage, WhatsApp CTAs)

How to run:
Open `index.html` in a browser. No server required.

Primary conversion flow: Every CTA opens WhatsApp to +977 9707450833 with pre-filled messages.

Notes & constraints:
- No accounts, logins, payments or databases are implemented (by design).
- The raw-score converter uses an approximate linear conversion — official conversions vary by test version.

Accessibility & SEO updates:
- ARIA labels and roles added for interactive elements
- Open Graph and canonical meta tags added for sharing and SEO
- Sticky mobile CTA and floating WhatsApp button added for better conversions on mobile

Next steps you might want:
- Add real instructor content and testimonials (do not fabricate)
- Add optimized images (WebP/AVIF) in `public/images`
- Deploy as static site (Netlify, Vercel, GitHub Pages)

Deployment
 - GitHub Pages: push this repository's `main` branch and enable Pages in the repo settings (root folder). The site will serve `index.html` from the root.
 - Vercel: import the repo and deploy. `vercel.json` and `api/track.js` are included to enable serverless tracking. Set `LOG_WEBHOOK_URL` in Project Environment Variables to forward tracking events.
 - Netlify: drag-and-drop or connect the repo. `netlify.toml` and `netlify/functions/track.js` are included. Set `LOG_WEBHOOK_URL` in Site Settings → Build & deploy → Environment to forward tracking events.

Analytics & tracking
 - GA4: set your Measurement ID in the page head meta `ga-id` (index.html) or edit it before deploying: `<meta name="ga-id" content="G-XXXXXXX">`. When present the site will load Google Analytics (gtag) and events will be sent automatically.
 - Server-side tracking: a lightweight serverless forwarder is included for Vercel (`/api/track`) and Netlify (`/.netlify/functions/track`). By default these functions will log events to the server logs. To persist or forward events, set `LOG_WEBHOOK_URL` to an endpoint that accepts JSON POSTs (e.g., your logging service, Zapier webhook, custom endpoint).

Environment variables
 - `LOG_WEBHOOK_URL` — optional. If provided, serverless functions will forward tracking events to this URL.

Testing analytics locally
 - For local testing, you can set `ga-id` in `index.html` to a test GA4 id and deploy to Vercel/Netlify. To test server forwarding, set `LOG_WEBHOOK_URL` to a request inspector (e.g., https://webhook.site) and trigger interactions (WhatsApp CTA clicks, calculators, checklist).
