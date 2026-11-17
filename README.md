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
