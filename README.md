# Marrow Studio — site + admin panel

A full-stack version of the Marrow Studio site: the same 4 public pages
(Home, About, Services, Contact), now backed by a real Node.js server with
a password-protected admin panel for editing content.

## What changed from the static version

- Page text, stats, project images, team photos, FAQ answers, and contact
  details are no longer hardcoded in the HTML — they're stored in a
  database and loaded into each page on request.
- `/admin` lets you edit all of that through a form, organized by page,
  with a save bar and confirmation toast.
- The contact form now really submits to the server and stores enquiries,
  which you can read on the **Enquiries** tab in the admin panel.

## Requirements

- Node.js 18+ (this was built and tested on Node 22)

## Setup

```bash
npm install
```

Open `.env` and set your own admin password before seeding (or change it
later from the admin panel's Account tab):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-real-password
SESSION_SECRET=replace-with-a-long-random-string
```

Then seed the database (creates the admin user + default content, safe to
re-run — it won't overwrite content you've already edited):

```bash
npm run seed
```

Start the server:

```bash
npm start
```

- Public site: http://localhost:4000
- Admin panel: http://localhost:4000/admin/login

## How editing works

1. Log in at `/admin/login` with the username/password from `.env`.
2. Pick a tab (Home page, About page, etc.) — every editable field on
   that page shows up as a text box, text area, or image-URL field with a
   live thumbnail.
3. Edit anything. A bar appears at the bottom showing how many changes
   are unsaved.
4. Click **Save changes**. The public site reflects the change on the
   next page load — no rebuild or redeploy needed.
5. **Enquiries** tab shows every contact form submission, newest first.
6. **Account** tab lets you change the admin password.

Images are edited as URLs (paste a link to an already-hosted image),
not file uploads — see "Upgrade paths" below.

## Project structure

```
server.js         — Express app: routes, auth, content API
db.js              — SQLite schema (content, admins, contact_submissions)
seed.js            — creates admin user + default content (run once)
views/
  login.html       — admin login screen
  admin.html        — admin panel (content editor, enquiries, account)
public/
  index.html, about.html, services.html, contact.html — public pages
  css/style.css     — shared styles (unchanged from the static version)
  js/main.js        — nav, scroll reveal, contact form submission
  js/content-loader.js — fetches content from the API and fills the page
data/
  marrow.db         — SQLite database (created on first run, gitignored)
```

## Reusing this for another client site

Because content lives in the database rather than the HTML, re-skinning
this for a different business means:

1. Edit `seed.js` — change the field values (and add/remove fields if the
   new site's pages differ), then re-run `npm run seed` against a fresh
   database.
2. Swap `public/css/style.css` tokens (colors, fonts) for the new brand.
3. Everything else — auth, the admin UI, the content API — carries over
   unchanged.

## Upgrade paths (not built, but straightforward from here)

- **Real image uploads**: swap the image-URL field for a file input,
  store uploads in `public/uploads/` (or S3), and save the resulting path
  instead of a pasted URL.
- **Multiple admin users / roles**: the `admins` table already supports
  more than one row — add a signup/invite flow and role column.
- **Deploying online**: this needs a host that runs a persistent Node
  process (Render, Railway, Fly.io, a VPS) rather than static hosting —
  SQLite's single-file database works fine for a small site, or swap in
  Postgres for higher traffic.
- **Email notifications on new enquiries**: hook a transactional email
  service (e.g. Resend, Postmark) into the `POST /api/contact` route.
