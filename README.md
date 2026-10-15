# Biology Review Bank — teacher locks and shuffle filters

Live at https://josey.fun. The three current review sets are stored privately in Cloudflare and start locked. Production domain routing, bank persistence across deployments, and locked-content redaction have been verified. The teacher enters the private passphrase directly on the live website.

## What changed

- The header and favicon use 🧬.
- Each dated set of six questions has a teacher-only Lock set / Unlock set button.
- Teacher access uses one private password. Students never enter a password.
- Locked sets show six grey “Wait for class” cards. The server omits their questions and answers entirely, including from Random Order and Smartboard views.
- Lock settings persist on the server across browsers, sign-outs, imports, and deployments.
- Open student pages refresh their availability every five seconds. A connection failure hides question content until the next successful refresh.
- Random Order has a collapsed Choose sets menu with checkboxes, search by date/topic, Select all, and Clear. The list scrolls as the bank grows. Locked sets cannot be selected.
- New sets start locked. Existing dates retain their lock setting when a revised bank is imported.

## Hosting setup

This uses one Cloudflare Worker with static assets and one SQLite-backed Durable Object. No separate database setup is needed. It replaces GitHub Pages hosting for the live site; GitHub can continue storing the application code.

1. Sign in to, or create, a Cloudflare account. In this folder run `npm ci`, then `npx wrangler login` and complete the browser sign-in.
2. Run `npx wrangler secret put TEACHER_PASSWORD`. Enter a private passphrase of at least 16 characters at the local prompt. Never put the password in source code, GitHub, or chat. Secret creation may offer to create the Worker on its first run; accept that. Alternatively create an empty Worker named `biology-review-bank` in the dashboard, then set the secret.
3. Run `npm run deploy`. Open the resulting HTTPS workers.dev address. The service fails closed until a valid password is configured.
4. Click Teacher, sign in, click Import review bank, and select the included `private-data/bank.json`. All three current sets start locked. Unlock whichever dates students should see.
5. Verify the workers.dev site first. To keep the current custom domain, configure that domain as a Worker Custom Domain in Cloudflare. This may require moving the domain's DNS to Cloudflare and replacing the existing GitHub Pages DNS records. Do not change DNS until the new site works and the intended domain is confirmed.
6. Before the final switch, replace the old root `index.html` in the teaching repository with `public/index.html` from this package, or disable the old GitHub Pages site. This removes the inline questions from the current version and prevents the old site from serving an unlocked copy. The new HTML alone cannot run on GitHub Pages: it requires the Worker API.

Cloudflare references: [static asset bindings](https://developers.cloudflare.com/workers/static-assets/binding/), [Durable Object storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Repository contents

Commit `public/`, `src/`, `test/`, `package.json`, `package-lock.json`, `wrangler.jsonc`, and `.gitignore`. Keep the private-data folder out of the public repository. The .gitignore included here excludes it, local secrets, dependencies, and local database state.

Never upload this entire ZIP to the public repository: it includes the local review-bank import file. The Worker only uploads `public/` as browser-accessible files. Backend code is deployed separately, and bank content lives in private Durable Object storage.

The original questions were already public in the repository. This change cannot erase previously downloaded copies or Git history. Keep future unreleased question sets in private import files. Locking also cannot revoke content someone copied while a set was unlocked.

## Daily use

Open Teacher and enter your passphrase. Open a review date, or All Questions, and use Lock set / Unlock set. Sign out when finished, especially on a shared classroom screen. Teacher sessions expire after eight hours; changing the configured password invalidates existing sessions.

To add questions, update a private bank JSON file and import it from Teacher controls. Import replaces the complete bank, so include all courses and dates you want to retain. Each dated set must contain exactly six question/answer pairs. Back up the import file privately. The sample file uses the existing repository's course/date/question format.

For local development, put `TEACHER_PASSWORD="a private local passphrase"` in `.dev.vars`, then run `npm run dev`. The local database is separate from production. Do not commit `.dev.vars`.

## Verification completed

`npm test` covers unauthorized writes, origin checks, private-content redaction, unlocking/relocking, import validation, preserved lock settings, cookie attributes, sign-out, session expiry, password-guess throttling, and missing secrets.

Browser verification against the actual local Worker covered teacher sign-in, import, all-locked startup, unlock, searchable shuffle checkboxes, Select all/Clear, two separate teacher/student sessions, automatic removal of relocked questions from a student's random deck, Smartboard locking, and mobile layouts. No browser script errors were reported.

The included preview PNGs show the teacher's locked-set screen and shuffle-set menu. Production login, deployment, custom domain routing, and production persistence still require verification after account access is connected.
