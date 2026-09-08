# Pixcel Studio — website + CMS

A fully static site (no framework, no build step) with a real content-management
system built in: **Decap CMS** (free, open source — formerly Netlify CMS). You
edit text, services, portfolio items and testimonials from a visual admin panel
at `/admin`, and changes are saved straight to this repo — no database to run
or pay for.

```
pixcel-studio/
├── index.html          the whole site (one page)
├── css/style.css        all styling — colours, type and layout live at the top as CSS variables
├── js/main.js            loads content/*.json and renders it into the page
├── content/               ← this is what the CMS edits
│   ├── site.json          hero, about, contact text
│   ├── services.json      the 3 services + deliverables
│   ├── works.json         portfolio grid
│   └── testimonials.json  client quotes
├── admin/
│   ├── index.html         loads the Decap CMS admin app
│   └── config.yml         defines the editable fields (the CMS "schema")
├── images/uploads/        CMS-uploaded images land here
└── netlify.toml           deploy config
```

---

## 1. Preview it locally

Opening `index.html` directly by double-clicking will show a blank hero — browsers
block `fetch()` of local JSON files over `file://`. Serve the folder instead:

```bash
cd pixcel-studio
python3 -m http.server 8080
# or: npx serve .
```

Then visit `http://localhost:8080`.

---

## 2. Put it on the internet (Netlify, free tier)

The CMS needs a git host + Netlify's Identity/Git Gateway service to handle
logins, so GitHub + Netlify is the fastest path.

1. **Create a GitHub repo** and push this folder to it:
   ```bash
   cd pixcel-studio
   git init
   git add .
   git commit -m "Pixcel Studio site"
   git branch -M main
   git remote add origin https://github.com/<you>/pixcel-studio.git
   git push -u origin main
   ```
2. **Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import an
   existing project**, pick the repo. Build command: leave blank. Publish
   directory: `.` (already set in `netlify.toml`). Click **Deploy**.
3. Your site is now live at `https://<random-name>.netlify.app` (you can rename
   it or attach a custom domain under **Site configuration → Domain management**).

---

## 3. Turn on the CMS (Netlify Identity + Git Gateway)

1. In your Netlify site dashboard: **Site configuration → Identity → Enable
   Identity**.
2. Under **Identity → Registration**, set it to **Invite only** (so strangers
   can't sign up to your admin panel).
3. Under **Identity → Services**, enable **Git Gateway**. This lets Identity
   users commit to your repo without needing their own GitHub account.
4. Under **Identity → Invite users**, invite yourself (and anyone else who
   should be able to edit content) by email. You'll get an email with a link
   to set a password.
5. Visit `https://<your-site>.netlify.app/admin` — log in with that account.

You now have a full visual CMS: **Site content**, **Services**, **Portfolio /
Work**, and **Testimonials** collections, each mapped to one of the JSON files
above. Every save is a git commit — Netlify redeploys automatically (usually
live within ~30 seconds, no rebuild step needed since the JSON is fetched at
runtime).

> Alternative to Netlify: Decap CMS also supports a GitHub-only backend (no
> Netlify Identity) — see the [Decap CMS backend docs](https://decapcms.org/docs/backends-overview/)
> if you'd rather host elsewhere (Vercel, GitHub Pages, your own server) and
> just need somewhere to serve static files.

---

## 4. The contact form

The form in the **Contact** section already has the attributes Netlify Forms
needs (`data-netlify="true"`, a hidden `form-name` field, a honeypot field).
Once deployed on Netlify, submissions show up under **Site configuration →
Forms** and you can wire up email notifications or a Zapier/Slack webhook from
there — no extra code. If you host elsewhere, swap the `fetch("/")` call in
`js/main.js` (`initForm`) for Formspree, a Google Form action URL, or your own
API endpoint.

---

## 5. Customizing the design

Everything visual is controlled from the top of **`css/style.css`**:

```css
:root{
  --ink: #14130f;        /* text / dark sections */
  --paper: #ede8dd;       /* page background */
  --magenta: #ff2e63;     /* accent 1 — buttons, links, hover */
  --lime: #d4ff3f;        /* accent 2 — used in the pixel hero graphic */
  --font-display: "Space Grotesk", sans-serif;  /* headings */
  --font-body: "Inter", sans-serif;              /* body text */
}
```

Change these and the whole site restyles — no need to hunt through the file.
To change fonts, swap the Google Fonts `<link>` in `index.html`'s `<head>` and
update the two `--font-*` variables to match.

The animated grid in the hero is generated in `js/main.js` (`buildPixelGrid`)
— edit the `palette` array there to change its colours.

Portfolio items currently render as colour-swatch placeholders (built from the
`palette` field in `content/works.json`) instead of photos, so the site works
immediately with zero image assets and no copyright risk from placeholder
stock photography. To use real project shots instead:
1. Add an `image` field to each work item in `admin/config.yml` (`widget: "image"`).
2. In `js/main.js`'s `renderWork()`, swap the `.work-swatch` markup for an
   `<img src="${w.image}">`.

---

## 6. Editing content without the CMS

You can always hand-edit the JSON files in `content/` directly (they're plain,
readable JSON) and push/redeploy — the CMS is a convenience layer on top, not
a requirement.

---

## 7. What's not included (and why)

- **No page builder / drag-and-drop layout editor.** The CMS here edits
  *content* (text, portfolio entries, testimonials), not layout — that keeps
  the design consistent and prevents accidental breakage. If you want
  block-based page building too, Decap CMS supports that pattern as well; ask
  and it can be extended.
- **No real photography.** Swap in real project photography per the instructions
  above whenever you have it — the placeholder swatches are intentionally
  simple so the site never looks like a stock-photo template.
