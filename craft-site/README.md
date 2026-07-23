# CRAFT — Club Website

Static site for CRAFT (Council for Real-world Applications & Future Tech),
Department of CSE, Amrita Vishwa Vidyapeetham, Nagercoil Campus.

## What's inside

```
index.html        Main page (all sections)
css/style.css      Design tokens + all styling
js/main.js         Pixel-art Pong hero canvas, nav toggle, join form
```

No build step, no dependencies to install. It's plain HTML/CSS/JS.

## Run it locally

Any static file server works. For example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html` — everything except the Google Fonts
request will still work offline.

## Deploy it

Drag-and-drop the whole folder onto any static host:

- **Vercel** — `vercel deploy` from this folder, or drag the folder into the Vercel dashboard
- **Netlify** — drag the folder into Netlify Drop
- **GitHub Pages** — push to a repo and enable Pages on the `main` branch

## Hero animation

The hero section is a small canvas "game": a ball bounces inside four
auto-tracking paddles and breaks apart a pixel-art rendering of the word
"CRAFT." It respects `prefers-reduced-motion` — if a visitor has that
setting on, the canvas renders once, statically, with no animation.
Move your cursor near the ball to nudge it.

## Join form

The registration form in `#join` is front-end only — it validates fields
and shows a success message, but doesn't send data anywhere yet. To wire
it up to a real backend (Google Form, Supabase, email service, etc.),
replace the `submit` handler in `js/main.js` with a `fetch()` call to
your endpoint of choice.

## Content sources

Copy throughout the page (mission, campus positioning, the 15-60-15
framework, semester roadmap, membership rules) is drawn directly from
the CRAFT Club Constitution and its companion Semester-I Curriculum
document. Update both together if the Constitution changes.
