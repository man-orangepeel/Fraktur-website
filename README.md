# FRAKTUR website

Two-page Next.js 14 (App Router) site: `/` (Wallet Watcher + donor gallery — the
landing page) and `/companies` (the entire B2B pitch). Full spec: see
`WEBSITE_BRIEF.md` in this folder — read that before changing anything here,
it explains *why* things are structured this way, not just what to build.

## Quick start (works with zero credentials)

```bash
npm install
npm run dev
```

The site runs immediately against the checked-in sample data in `/data/*.sample.json`
— no Airtable base or BTCPay instance required to look at the UI. The moment
real credentials are set in `.env` (see below), every data-fetching function in
`src/lib/data.ts` switches to live Airtable data automatically — no code change
needed to go from demo to live.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` — a Personal Access Token scoped
  read+write to the FRAKTUR base only.
- `BTCPAY_URL` / `BTCPAY_API_KEY` / `BTCPAY_STORE_ID` / `BTCPAY_WEBHOOK_SECRET`
  — see "BTCPay Server setup" below.
- `NEXT_PUBLIC_BTCPAY_URL` — same URL as `BTCPAY_URL`, duplicated because this
  one loads client-side (the embedded checkout script). Not secret.
- `NEXT_PUBLIC_SITE_URL` — this site's own public URL, used to build the
  BTCPay checkout redirect.

## Airtable base to create

Five tables, exact schema in `WEBSITE_BRIEF.md` §4:

1. **Wallets** — one row per audited wallet. `Published` gates visibility —
   never gate this on donations, only `Findings`/donor data is amount-gated.
2. **Findings** — one row per vulnerability, linked to `Wallets`. Severity is
   a single select: `Critical / High / Medium-High / Medium / Low`. Wallet-card
   severity counts are computed in code (`src/lib/format.ts#countBySeverity`),
   not via Airtable rollup formulas — keep it that way, it's simpler to reason
   about than a five-way rollup formula.
3. **Donations** — one row per donation attempt. Needs an `Order ID` field
   (single line text) matching the BTCPay invoice's `orderId` metadata, plus
   `Payment Verified` and `Approved` checkboxes, both written only by
   `src/app/api/donate/webhook/route.ts` — never by anything the browser sends.
4. **Supporters** — aggregated identity, rollups over `Donations` (`Total Sats`
   sum, `Last Donation Date` max, `Active Last 30 Days` / `Gallery Eligible`
   formulas). See "Airtable automation required" below for how rows get linked.
5. **Settings** — single row: `Gallery Threshold (sats)` = **212121** (confirmed),
   `Active Window (days)` = **30** (confirmed).
6. **FreeScanApplications** — one row per free-scan application (`/apply`
   page, see `WEBSITE_BRIEF.md` §17). Fields: `Repo URL`, `Contact Email`,
   `Project Name`, `Team Size`, `Note`, `Status` (single select, default
   `Pending`). No automation on this table — the 5/month cap is a human
   decision made by reviewing rows here, not enforced in code. Set
   `AIRTABLE_TABLE_FREE_SCAN_APPLICATIONS` in `.env` if you name the table
   something other than `FreeScanApplications`.

### Airtable automation required

`Donations` rows are created and settled by this app's API routes, but linking
a settled Donation to the right `Supporters` row (find-or-create by handle) is
delegated to an Airtable Automation, not app code:

- Trigger: record updated in `Donations`, condition `Payment Verified = true`.
- Action: "Find record" in `Supporters` by `Handle`; if none, "Create record";
  then link the `Donations` row to it.

This keeps relational bookkeeping inside Airtable (consistent with "editing
rows is the update mechanism" for the rest of this project) instead of adding
a second source of truth for supporter identity in application code.

## BTCPay Server setup — replaces the old self-reported-amount design

Earlier drafts of this brief had donors type in how many sats they sent. That
design was replaced (see `WEBSITE_BRIEF.md` §7) because a self-reported amount
can't be trusted — nothing stops someone typing "300,000" after sending 1,000.
The flow now is:

1. Donor submits the allocation form (no amount field at all).
2. `POST /api/donate/create-invoice` creates a pending `Donations` row and asks
   BTCPay to create an invoice tagged with that row's order ID.
3. BTCPay's hosted checkout opens as an in-page modal (`btcpay.js`) — donor
   pays, choosing their own amount on BTCPay's own UI.
4. BTCPay calls `POST /api/donate/webhook` when the invoice settles. The
   handler verifies the HMAC-SHA256 signature (`BTCPAY_WEBHOOK_SECRET`) before
   trusting anything in the payload, then writes the **actual settled amount**
   into the matching `Donations` row and flips `Payment Verified` / `Approved`.

To configure: in the BTCPay dashboard, Store Settings → Webhooks → Create,
point it at `${NEXT_PUBLIC_SITE_URL}/api/donate/webhook`, subscribe to at least
"An invoice has been settled," and copy the generated secret into
`BTCPAY_WEBHOOK_SECRET`.

**Known gap to close before relying on this in production:** `resolveSettledAmountSats`
in `src/app/api/donate/webhook/route.ts` re-fetches the invoice from BTCPay's
API to read the settled amount rather than trusting a raw field on the webhook
event body — this is deliberate (webhook event shapes vary by BTCPay version),
but double-check the exact response shape against the BTCPay version you
deploy against, since this was written against the documented Greenfield API
shape, not tested against a live instance.

## Deploying

No hosting account was available in this session — the code is deploy-ready
for Vercel (or any Node host that supports Next.js API routes; this does *not*
work as a pure static export because of the two API routes) but was not
actually deployed. To ship:

```bash
vercel deploy   # or connect the repo in the Vercel dashboard
```

Set all `.env.example` variables as environment variables on the host before
the donation flow will work; the rest of the site (Wallet Watcher, Companies
pitch) works with zero configuration via the sample data fallback.

## What's still open (see WEBSITE_BRIEF.md §9 for the full list)

- Legal review of the donation disclaimer (drafted, not lawyer-reviewed).
- Hosting account / domain.
- Live-testing the BTCPay webhook against a real BTCPay instance (only
  written and reasoned through, not exercised against a live server here).
