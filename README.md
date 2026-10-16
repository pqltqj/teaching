# Biology Review Bank — teacher locks and shuffle filters

Live at https://ejosey.ca. The complete website and API are served on ejosey.ca. The three current review sets are stored privately in Cloudflare and start locked. Production bank persistence across deployments, and locked-content redaction have been verified. The teacher enters the private passphrase directly on the live website.

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


## Smartboard device preview and appearance

In Smartboard view, choose a locked date and click **Preview on this device**. Enter the existing teacher passphrase. A separate HttpOnly session permits read-only access for 30 minutes; it cannot import a bank or change a lock. Other browsers keep receiving redacted locked sets. Click **End device preview**, or leave Smartboard, to end the preview. Refreshing the page also hides the preview until the passphrase is entered again. Preview cookies are separate from teacher sessions. To release a set to students, leave Smartboard and sign in through Teacher as usual.

The header sun/moon button switches light and dark mode, including Smartboard. It defaults to light mode and saves a manual choice on that browser.


## Resources

The home-page library card opens `/resources/`, with a separate Biology 30 / Biology 20 course picker. Each course lists dated resources, newest first, grouped by month. Search filters by topic, type, date, or description. Courses with no resources show an honest empty state. Review questions, locks, filters, and Smartboard are unchanged.

To add a resource, create its page or file under `public/resources/`, then add an entry to the relevant course in `public/resources/catalog.json`: `{"date":"2026-10-16","title":"Resource title","type":"Investigation","summary":"A short description.","href":"/resources/resource-slug/"}`. Dates use YYYY-MM-DD. Links may point to an on-site page, PDF, or an HTTPS resource. Deploy the public assets after editing. The catalog starts empty; no case study has been published yet. Resources are public, independent of question-set locks; keep any private answer keys outside `public/`.


## Human Reproductive Technology case study

Published under Biology 30 / Unit B / October 16, 2026 at `/resources/reproductive-technology/`. The independent activity contains the supplied textbook's exact introduction, seven technology readings, and five questions from pp. 542-543. Line wrapping has changed; separately labelled scientific clarifications distinguish historical textbook wording from current explanations. Five figures are cropped from the supplied textbook and paired with distinct scientific photographs. Photograph captions retain source/licence links; the media folder includes attribution details. No AI-generated photos are used.

Answers and reading progress save in the student's browser and automatically back up to the site under a private recovery code. A cryptographically random 96-bit code appears when work begins. Students copy it, choose Recover work on any device, and enter the code to restore their name, all five answers, optional response, and read markers. The code grants access to that draft; keep it private. Codes are sent in POST bodies, never URLs, and only their SHA-256 digest is used for storage routing. Each draft has a separate Durable Object, isolated from teacher sessions and the review bank. There is no public draft directory or student account.

The online status acknowledges durable saves, not just typing. Changes queue after 900 ms and retry after a connection failure; a local copy remains available. Pending writes survive refresh and reuse mutation IDs to handle lost responses safely. Optimistic revisions prevent an older tab/device from overwriting newer work. On conflict, students can recover the newer draft or preserve their local version under a new code. Clear my draft removes the local draft and local code; the previously saved code still recovers its online draft. Online drafts currently have no automatic expiry.

Students still download a PDF and upload/email it using the teacher's usual route. Online backup is not submission. Draft JSON backup/restore remains available. Recovery restores saved content and reading progress, not the scroll position, open page, or keyboard cursor.

PDF export uses the locally vendored jsPDF 4.2.1 (MIT; licence included). The private teacher answer guide is delivered separately and is never placed under `public/` or committed to this public repository. The review bank, lock API, teacher sessions, Smartboard preview, and review layouts are unchanged.

Validation: checked all seven excerpts and five questions against extracted textbook text, all diagram enlargements, mobile layout, saved drafts after reload, backup/restore/clear, storage error messaging, PDF bytes/filename, long response pagination, and print fallback. PDF output was rendered and inspected. The headless test browser cancels native downloads in this environment, including a plain text test; the activity test captures and verifies the actual generated export bytes and download trigger instead.


## Primary domain

ejosey.ca is the primary Cloudflare Worker custom domain; www.ejosey.ca forwards to the root address. The retired domain is disconnected. Keep these domain entries in wrangler.jsonc on deployment. The existing REVIEW binding, Worker name, and migrations are unchanged, so review locks and recovery-code drafts retain their data. Browser-only drafts and teacher sign-in cookies belong to their original host; students can recover saved online drafts on the new host using their codes. GitHub Pages is a redirect entry point and does not host the application backend.
