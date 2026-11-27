# Rooots website

A one-page website for Rooots. It's plain HTML and CSS in a single file, so it needs no build step and runs free on GitHub Pages.

## Files

- `index.html`: the whole website
- `favicon.svg`: the small icon shown in the browser tab
- `CNAME`: GitHub creates this when you add your custom domain (step 4)

## Publish on GitHub Pages

1. The files are already in this repository.
2. **Turn on Pages.** Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main**, folder to **/ (root)**, then click **Save**. After a minute or two, your site is live at `https://<your-username>.github.io/Rooots/`.
3. **Connect your domain.** Still in **Settings → Pages**, type your domain under **Custom domain** (for example `rooots.in` or `www.rooots.in`) and click **Save**. GitHub adds a `CNAME` file to the repository for you.
4. **Point your domain to GitHub.** Sign in to wherever you bought the domain (GoDaddy, Namecheap, Hostinger and so on), open the DNS settings and add these records:

   | Type | Name / Host | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | `<your-username>.github.io` |

   Delete any old A records for `@` that point somewhere else.
5. **Turn on HTTPS.** DNS changes can take anywhere from a few minutes to 24 hours. Once GitHub shows your domain as verified, tick **Enforce HTTPS** in **Settings → Pages**.

## Updating the site later

Open `index.html` on GitHub, click the pencil icon, make your change and click **Commit changes**. The live site updates within a minute or two.

## Early Bird Show registration (30 seats)

Pages:

- `register/` — the registration page (the QR code on the poster opens this): follow on Instagram → fill the form → get a ticket. Shows live seats left.
- `admin/` — password-protected list of registrations. Tick "IG verified" / "Checked in", remove test or fake entries (their seats free up straight away), download a CSV.
- `qr/` — QR code for the poster (PNG, SVG, and a ready-to-print card).

The website itself can't store anything, so registrations are saved in a Google Sheet by a small free Google Apps Script.

### One-time setup (about 10 minutes)

1. Create a new Google Sheet (any name, e.g. "Rooots registrations") with the rooots.admin@gmail.com account.
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste the whole of `apps-script/Code.gs`, click **Save**.
3. **Set the admin password:** in Apps Script click the **gear (Project Settings)** → scroll to **Script properties** → **Add script property** → Property `ADMIN_PASSWORD`, Value: your password → **Save**.
4. **Deploy:** **Deploy → New deployment** → gear next to "Select type" → **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**, allow the permissions (Google warns because it's your own unverified script: Advanced → Go to project).
5. Copy the **Web app URL** (ends in `/exec`).
6. On GitHub open `config.js` → pencil icon → paste the URL between the quotes after `api:` → **Commit changes**. The site updates in a minute or two.
7. Test: open rooots.co.in/register, make a test booking, then open rooots.co.in/admin, log in and **Remove** it.

If you change `Code.gs` later: **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy** (the URL stays the same).

Notes:

- Instagram doesn't let websites check who follows an account, so the page asks for the family's Instagram username and a "I follow" tick. Check handles in the admin page (tap the handle to open their profile) and remove any that don't follow.
- Registrations close automatically at 6:30 pm on 29 Nov, or when 30 kids are booked. One booking per WhatsApp number; up to 3 kids per booking.
- To change the seats or the closing time, edit `CAPACITY` / `EVENT_START` at the top of `Code.gs` (and redeploy) and the matching values in `config.js`.
- Ticket numbers keep counting after you remove test bookings. To restart from RT-001, delete the `NEXT_TICKET` script property after clearing the sheet.
