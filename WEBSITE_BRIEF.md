# FRAKTUR — Website Generation Brief
*Master prompt — to be executed to generate the site in `/Fraktur/website/`*
*Drafted: 2026-07-02 — v8 (bounded, qualified free-scan application flow — 2026-07-07)*

> **Parallel work notice:** as of 2026-07-07, the founder is running a second Claude Code session (VS Code) on the Home page and shared components at the same time this session works on Companies. If you're picking this project back up, check `git status`/`git log` before assuming this document is the only source of truth for the whole site — Home-side decisions (e.g. `testsRun`, `AuditFlowDiagram`, the `/legal` page, "The Cast" naming) may have been made in that other session and are real even if not documented here. Commit scoped to the files you actually changed, not `git add -A`, while two sessions are active on the same repo.

> **How to use:** This is the complete spec, kept in sync with the generated code. Read it before changing anything in `/website`. Decisions below were confirmed by the founder across five rounds — flag only genuine new ambiguities.

---

## 0. Context (do not skip)

FRAKTUR is a continuous, Bitcoin-native security service built on Loupe (Spiral/Block OSS), extended with fuzz testing (Layer 1) and on-chain proof of audit (OpenTimestamp). Full positioning: see `FRAKTUR_Pitch_Brief.md` in the parent folder. **Product name is "FRAKTUR" only — never "LaaS" anywhere on the site, including page titles, meta tags, alt text, and copy.**

**Dual audience, two pages:**
- **B2C** — Retail Bitcoin holders. Land on **Home**, which *is* the Wallet Watcher: live audit scorecard + donor gallery. No pitch content here.
- **B2B** — CTOs/VP Eng at 5–50-person Bitcoin companies. Everything pitch-related — problem, solution, proof, pricing — lives exclusively on **Companies**.

**Why this split (confirmed):** Home must load instantly into the thing people share (wallet scores + "look who's backing this"). Burying that under a sales pitch kills the viral loop. The B2B pitch, conversely, needs room to make a real case — it doesn't belong wedged into a consumer page.

**Non-negotiables (from CLAUDE.md — do not violate):**
- We only scan public open-source repos. No private-repo handling implied anywhere on the site.
- Every finding requires a PoC regression test. No PoC = no report. This must show up in copy on the Companies page.
- Never position FRAKTUR as a replacement for formal audits — "security co-pilot," not auditor-of-record.
- Never imply findings are withheld for payment — responsible disclosure is unconditional and stated as such.
- FRAKTUR never touches client keys or funds (Annex A7) — donation flow must not contradict this (no custody of donor funds beyond momentary receipt of a non-custodial Lightning payment).
- Donations are gifts to fund development, not investment — no equity, no token, no expectation of return. Full disclaimer language in §6.
- **Audited-wallet visibility is never conditional on donations.** Every wallet FRAKTUR audits appears on Home regardless of crowdfunding status — only the *donor gallery* (people, not wallets) is filtered by amount.

---

## 1. Information Architecture

Exactly two pages, plus one global persistent component.

| Page | Nav label | Content | Donation content? |
|---|---|---|---|
| **Home** (`/`) | Home | Wallet Watcher (audited wallets) + donor gallery. **This is the landing page.** | Yes — ticker banner + gallery live here |
| **Companies** (`/companies`) | For Companies | The entire pitch (problem → solution → proof → pricing → FAQ), including the quantified first-test results | No sats/donation language at all |

**Global persistent component (not a page):** a "⚡ Donate" pill button, fixed in the header, identical on both pages. Click opens the **donation drawer** (§2.3) — a slide-up panel, no page navigation, current scroll position preserved.

**Nav bar, in-page anchors:**
- On Home: `Wallets` (scrolls to the wallet list) · `Supporters` (scrolls to the donor gallery section) · `For Companies` (navigates to the other page) · `⚡ Donate` (opens drawer)
- On Companies: `Problem` · `Solution` · `Proof` · `Pricing` · `FAQ` (in-page anchors) · `Home` (navigates back) · `⚡ Donate` (opens drawer — button stays present even though this page's own copy is donation-free, per founder's earlier instruction that the button is global)

Footer on both pages: legal disclaimers (§6), links to X account, GitHub, OpenTimestamp verifier, contact email.

---

## 2. Home — page spec

Order, top to bottom, exactly as specified by the founder:

### 2.0 Header / nav
Logo lockup (`Name avec logo v2 sur fond noir.png` — see §5, black background required) + nav anchors above + persistent Donate button.

### 2.1 Hero
Short. **No pitch content** — that's exclusively on Companies. One line stating what this page is: e.g. *"Live, verifiable security scores for Bitcoin wallets — audited, timestamped, public."* One small secondary line pointing B2B visitors to the other page: *"Run a Bitcoin company? → For Companies"*. No problem stats, no "how it works," no stat cards here — all of that moved to Companies (§3).

### 2.2 Donation banner (dynamic ticker)
Directly under the hero, above the wallet list. Horizontal auto-scrolling strip of supporter avatars/handles **active in the last 30 days** (rolling window — see §4.2). Caption line always visible next to/above it: *"Supporters active this month"* + the threshold disclosure, worded plainly: *"Only supporters of 212,121 sats or more appear here."* This is a passive, live-updating display — not the donation form itself (that's the drawer, §2.3).

### 2.3 Wallets audités (main content, immediately after the banner)
Table/grid of every wallet FRAKTUR has scanned or is scanning, one row per wallet, from `wallets.json` (§4.1):
- Wallet name + logo/repo link
- Status (Monitoring / Audit in progress / Completed)
- Last review date
- Audit tool version
- OpenTimestamp hash (short, with "Verify" link to the OTS proof)
- **Layer 1 efficiency**: files scanned → files selected, shown as a reduction (e.g. "1,300 → 63 files — 95% noise cut")
- **Layer 2 progress**: files audited / files selected (e.g. "6 / 63 audited")
- Vulnerabilities by severity (critical/high/medium/low) — zero shown proudly, not hidden
- Overall risk badge (color-coded)

Sort/filter: by status, by risk badge, by last-review date. Search by name. Clicking a row opens the wallet detail view (§2.5).

### 2.4 Section donateurs (dépliante — collapsible, after the wallet list)
Full donor gallery: **top 10 shown by default** (avatars/handles, tier badge — not exact sats amount, see §4.2), with a "See all supporters" control that expands to the complete list with sort (rank/tier, most recent, alphabetical) and pagination. Threshold disclosure repeated here in the same wording as §2.2: *"Only supporters of 212,121 sats or more appear here."*

### 2.5 Wallet detail (expanded row / sub-view of a wallet)
- Timeline of all audits for that wallet (not just latest)
- Link to the public disclosure thread on X for each finding
- Downloadable/verifiable OpenTimestamp proof bundle reference
- "Suggest this wallet gets deeper coverage" → opens the donation drawer pre-filled with allocation = "Audit a specific wallet" and this wallet pre-selected

---

## 3. Companies — page spec (the entire pitch lives here, and only here)

Structure follows `FRAKTUR_Pitch_Brief.md` S1–S9 directly — do not paraphrase away from it, adapt it to web copy but keep the substance:

- **Problem** (S1–S3): the exploits/$ lost stat, the no-security-hire gap, the static-only tooling gap. Use `Images/Vulnerabilities.png` as reference for the exploit-stat visual if it fits; redraw to match the site's design system rather than embedding the slide image directly.
- **Solution** (S4–S6): How → What, Layer 1 (attack-surface triage), Layer 2 (selective Loupe + PoC-or-no-report rule). Use `Images/Layer1.png` and `Images/Layer 2.png` as reference material only.
- **Trust primitive** (S7): OpenTimestamp — every audit hashed and anchored on-chain.
- **Wallet Watcher as proof point** (S8): link back to Home, framed as "see it live."
- **Proof — our first real-world test** *(new section, from `FRAKTUR.pdf` pp.12–14 — see exact figures below)*.
- **Pricing** (from Annex A2 Market Size): ACV $24–48K/yr framed as "$2–4K/month," 5-client-Year-1 goal.
- **FAQ accordion**: Annex A8 (Key Objections), plus optionally A3/A5/A9/A10 content condensed as supporting detail.
- **CTA**: "Get a free scan of your public repo" / "Talk to us."

### 3.1 "Proof — our first real-world test" — exact figures (source: `FRAKTUR.pdf`, slides 12–14)

Three sub-blocks, each with a before/after chart (Loupe-only vs FRAKTUR triaged) — reproduce the numbers exactly, redraw the charts to match the site's design system rather than screenshotting the PDF slides:

| Metric | Loupe-only (whole codebase) | FRAKTUR (triaged) | Result |
|---|---|---|---|
| **L1 — Proof of Efficiency**: LLM agents launched per scan | 1,300 files | 63 files | **-95%** data to be verified |
| **L2 — Proof of Efficacy**: files reviewed / findings | — | 6 files reviewed (of the 63 selected) | **5 findings**: 2 Medium, 1 Medium-High, 2 Low |
| **Cost per scan** (Claude Opus 4.8, $8/$25 per 1M tokens, API-equivalent, typical case) | ~$3.2k (~1,300 agents) | ~$150–158 (63 triaged files) | **-95%** cost |

All three are framed as: *"For the wallet's repo we audited"* — keep the audited wallet's name anonymized (it is not named in the source deck either — consistent with responsible-disclosure norms; do not invent or guess a name).

**Resolved (was flagged as a discrepancy in v3):** confirmed by founder — the breakdown is **2 Medium, 1 Medium-High, 2 Low = 5 findings**. This requires a fifth severity tier, `Medium-High`, alongside Critical/High/Medium/Low — implemented as a proper `Findings` table (§4.1a) rather than four fixed count columns on `Wallets`, since a fixed-column model can't cleanly absorb a severity tier that wasn't anticipated. Counts shown on wallet cards are computed in code from the linked findings, not via Airtable rollup formulas.

---

## 4. Data backend — Airtable

### 4.1 Table: `Wallets`
| Field | Type | Notes |
|---|---|---|
| Name | Single line text | |
| Logo/Repo URL | URL | |
| Status | Single select | Monitoring / Audit in progress / Completed |
| Last Review Date | Date | |
| Audit Tool Version | Single line text | e.g. `v0.3.1` |
| OpenTimestamp Hash | Single line text | |
| OTS Proof URL | URL | |
| Files Scanned (L1 input) | Number | e.g. 1300 |
| Files Selected (L1 output) | Number | e.g. 63 |
| Files Audited (L2 progress) | Number | e.g. 6 |
| Risk Badge | Single select | Low / Medium / Medium-High / High / Critical |
| X Disclosure Thread URL | URL | |
| Published | Checkbox | Only `true` rows appear on Home — **never gated by donation amount** |

Note: vulnerability counts are **not** stored as fixed columns on `Wallets` (v3 had `Vulnerabilities Critical/High/Medium/Low` as four number fields). That model broke the moment the real data included a `Medium-High` tier that wasn't one of the four. Fixed instead with a proper `Findings` table below — severity counts are computed from it in application code.

### 4.1a Table: `Findings` (linked to `Wallets`)
| Field | Type | Notes |
|---|---|---|
| Wallet | Link to `Wallets` | |
| CWE | Single line text | e.g. `CWE-476` |
| Title | Single line text | e.g. "Signature verification — null client" |
| Severity | Single select | **Critical / High / Medium-High / Medium / Low** |
| Status | Single select | Open / Fixed |
| Disclosure URL | URL | link to the public X disclosure thread for this specific finding |

### 4.2 Donor data — two tables (needed for cumulative totals + rolling "active" window)

**`Donations`** (raw log — one row per submission)
| Field | Type | Notes |
|---|---|---|
| Timestamp | Created time | auto |
| Order ID | Single line text | generated server-side at form submission, also set as the BTCPay invoice's `orderId` metadata — this is what correlates a webhook event back to this row |
| Allocation Choice | Single select | Product Dev / Specific Wallet / Team |
| Wallet(s) Selected | Link to `Wallets` | shown if Allocation Choice = Specific Wallet |
| New Wallet Suggestion | Single line text | free text, optional |
| X Handle | Single line text | optional — identity key for aggregation |
| Nostr npub | Single line text | optional — identity key for aggregation |
| Sats Amount | Number | **written only by the BTCPay webhook handler, never by the donor.** No form field for this exists — see §7. |
| Consent to Public Gallery | Checkbox | set by the donor at submission time |
| Payment Verified | Checkbox | **set only by the webhook handler**, after signature verification, when BTCPay confirms the invoice settled |
| Approved | Checkbox | now follows automatically from `Payment Verified` — no manual curation step required for the amount itself (see §7 for what changed here) |

**`Supporters`** (aggregated identity — rollups over `Donations`)
| Field | Type | Notes |
|---|---|---|
| Handle | Single line text | unique key: X handle or Nostr npub |
| Linked Donations | Link to `Donations` | all approved submissions from this identity |
| Total Sats | Rollup (sum) | sum of linked `Donations.Sats Amount` where `Approved = true` |
| Last Donation Date | Rollup (max) | latest approved donation timestamp |
| Active Last 30 Days | Formula | `Last Donation Date >= TODAY() - 30` → drives the ticker banner |
| Gallery Eligible | Formula | `Total Sats >= Gallery Threshold` (from `Settings`) |
| Consent Confirmed | Checkbox | must be true on at least one linked donation |

**`Settings`** (single-row config — lets the founder change numbers without touching code)
| Field | Type | Value |
|---|---|---|
| Gallery Threshold (sats) | Number | **212,121** (confirmed) |
| Active Window (days) | Number | 30 (confirmed) |

**Public display rule:** the gallery is **permanent once eligible** (consistent with FRAKTUR's "immutable, on-chain proof" positioning — nobody is "erased"). The ticker banner is a secondary, rolling highlight of activity in the trailing 30 days; it does not remove anyone from the full gallery. Public entries show a **tier badge, not the exact sats total** (avoids painting large donors as targets); sort options (rank/tier, most recent, alphabetical) don't require exposing exact amounts.

**Intake mechanism:** Airtable's native public **Form view** on `Donations`, embedded inside the donation drawer — no custom backend. Payment happens via **BTCPay Server** (confirmed rail — self-hosted or founder's existing instance): Lightning invoice/address + QR shown alongside the form.

**Update workflow:**
1. Founder edits rows in Airtable directly (or asks Claude/Cowork to — same MCP connector as this session).
2. Founder marks new `Donations` rows `Approved = true` after checking against BTCPay's received-payments log (see §7 for why this matters).
3. Site reads `Wallets` (`Published = true`), `Supporters` (`Gallery Eligible` / `Active Last 30 Days`), and `Settings` via the Airtable API.
4. **Sync mechanism:** static JSON snapshot regenerated on request — founder asks Claude to "sync the site," Claude pulls current Airtable state via the MCP connector, regenerates `wallets.json` / `supporters.json` / `settings.json`, redeploys. Avoids exposing an Airtable API key client-side. A v2 upgrade path is a BTCPay Server webhook that writes the *actual received amount* straight into `Donations`, removing the self-report step entirely (see §7).

---

## 5. Visual identity

- **Logo (mark only):** `Images/Logo - v2 sur fond noir.png` — use for the compact/icon placement (favicon, mobile nav collapsed state).
- **Logo (full lockup with name):** `Images/Name avec logo v2 sur fond noir.png` — use for the header/nav wordmark.
- **Both assets are designed for a black background only.** Any surface these logos sit on must be black or near-black — this effectively mandates a dark theme across the whole site (header, footer, and any section carrying the logo), not just accents.
- **Do not use** `Images/frakturtransplogo.png` or `Images/Logo - v1.png` anywhere. These are superseded.
- Reference texture available: `Images/arriere plan.png` (dark cracked-glass motif) — usable as background texture, consistent with the dark theme forced by the logo constraint.
- Accent color: Bitcoin-orange, per existing brand assets. Do not invent a new palette.
- Tone: technical, confident, zero hype. No stock crypto imagery. Typography-led, data-dense.
- Donation drawer: slide-up panel with visible page content behind it (not a full-screen dimmed modal) — reads as "in-context," not "interruption," for a trust-sensitive audience.

---

## 6. Donation disclaimer — full wording (not just a placeholder)

*Disclosed as a decision-support draft, not legal advice — see note at the end of this section.*

Display prominently in the donation drawer (before the form) and in the footer of both pages:

> Donations to FRAKTUR are voluntary **tips** in support of open Bitcoin security research and tooling. They are gifts, not investments: donors receive no equity, tokens, revenue share, profit share, interest, or ownership interest of any kind, and have no expectation of financial return. Donations are non-refundable except at FRAKTUR's sole discretion. FRAKTUR retains full and final discretion over the allocation of contributed funds across product development, audits, and team tips; a donor's stated allocation preference is guidance only, not a directed-use contract, and does not entitle the donor to compel any specific audit, deliverable, or timeline. **The "Team" allocation functions as a direct tip to individual contributors — it is not a salary, wage, invoice payment, or any other form of formal compensation, and creates no employment or contractor relationship between FRAKTUR and the recipient.** FRAKTUR does not custody donor funds beyond the momentary receipt of a Lightning payment; donors are responsible for the security of their own wallets and payment methods. Nothing on this site constitutes financial, investment, tax, or legal advice.

**Why this specific wording, and what it's protecting against:**
- *"Gifts, not investments... no equity... no expectation of financial return"* — keeps this out of securities-law territory. The moment a donor is promised (or reasonably expects) a financial return tied to FRAKTUR's performance, the arrangement starts to resemble an unregistered security in most jurisdictions. Still the single most important line in the disclaimer.
- *"Tips... not a salary, wage, invoice payment... no employment or contractor relationship"* — confirmed by founder: the "Team" option is genuinely informal tips to individual devs, not disguised payroll. This line matters because if it read like compensation for services rendered, it would raise worker-classification and tax-withholding questions FRAKTUR doesn't want to own — tips are the recipient's own income to declare, not FRAKTUR's payroll obligation.
- *"Allocation preference is guidance only, not a directed-use contract"* — protects against a donor claiming FRAKTUR breached a commitment by not auditing "their" wallet, and reinforces the anti-pay-to-audit stance already in the brief.
- *"Does not custody donor funds beyond momentary receipt"* — consistent with Annex A7's regulatory positioning (outside custodian/money-transmitter definitions).

**What this draft does *not* cover, and where real counsel is needed before public launch:**
- FRAKTUR is a for-profit entity (C-Corp/AG-SA per Annex A7) soliciting public tips that fund its own product and contributors — closer to how open-source maintainers solicit sats via "buy me a coffee"-style tips (common and generally uncontroversial in the Bitcoin ecosystem) than to a registered non-profit or a rewards-based crowdfunding campaign — but "common practice" isn't the same as "cleared by a lawyer."
- Jurisdiction-specific charitable-solicitation registration requirements, AML considerations for pseudonymous crypto contributions, and individual tax-reporting obligations for tip recipients vary by country and are not addressed here.
- **Still open, restated because it matters:** have this wording reviewed by counsel before the donation flow goes live publicly, specifically checking the jurisdiction(s) where FRAKTUR is incorporated and where it expects most donors and tip-recipients to be.

---

## 7. Payment verification — resolved via BTCPay webhook (no self-reported amount)

**Superseded decision, kept here for the record:** v3 of this brief shipped with a self-reported sats amount (donor types in a number, founder manually cross-checks against BTCPay before approving). Founder's call in round 4: the amount must never be declarative — it has to be verified automatically via webhook, and everything else about the donation flow follows from that one decision. Implemented as follows.

**The flow, end to end:**
1. Donor submits the allocation form. **There is no amount field anywhere in it.**
2. `POST /api/donate/create-invoice` (server-side) generates an `Order ID`, writes a pending row into `Donations` with that ID, and asks BTCPay Server to create an invoice tagged with the same ID as `metadata.orderId`.
3. BTCPay's own hosted checkout opens as an in-page modal (via BTCPay's `btcpay.js`, so the donor never leaves the site) — the donor chooses their own amount there and pays.
4. When the invoice settles, BTCPay calls `POST /api/donate/webhook`. The handler verifies the request's HMAC-SHA256 signature against `BTCPAY_WEBHOOK_SECRET` before trusting anything in it — an unsigned or mis-signed request is rejected outright.
5. Only after signature verification does the handler look up the `Donations` row by `Order ID`, fetch the settled amount from BTCPay's own API, and write it as `Sats Amount`, flipping `Payment Verified` and `Approved` to true.

**Why this fully closes the gap the manual-approval design only patched over:** there is no code path from a browser-supplied number to the `Sats Amount` field — the only writer of that field is server code that has already checked BTCPay's cryptographic signature. A donor (or an attacker) cannot inflate their total by typing a bigger number, because there is nowhere left to type one.

**What this doesn't remove:** curation of *identity content* (handle spam, offensive display names) is still a judgment call a human may want to make — but that's a different problem from amount-inflation, and much lower stakes (worst case is a silly handle in the gallery, not a fabricated donation total).

---

## 8. Tech stack — chosen architecture (as-built)

The pure-static-site approach from v1–v3 (JSON snapshot manually re-synced by Claude on request) stopped being sufficient the moment automatic BTCPay webhook verification became a requirement (§7): a webhook needs a server endpoint to call, and creating a BTCPay invoice needs a place to hold the API key server-side. Rather than bolt a separate backend onto a static site, the whole site moved to a framework that gives both in one deploy:

**Next.js 14 (App Router), TypeScript, Tailwind CSS — deployed as a single Node app (Vercel or any Next.js-compatible host), not a static export.**

- **Pages** (`src/app/page.tsx`, `src/app/companies/page.tsx`) are React Server Components that fetch `Wallets` / `Supporters` / `Settings` **directly from the Airtable REST API at request time** (`src/lib/airtable.ts`), with a 60-second revalidation window. This is a real upgrade over the old JSON-snapshot workflow: the site now reflects an Airtable edit within a minute, automatically — no one has to ask Claude to "sync the site" anymore. The Airtable API key lives only in a server-side environment variable; it is never sent to the browser.
- **Fallback data** (`src/lib/data.ts`): every fetch function tries Airtable first and falls back to the checked-in `/data/*.sample.json` files if no credentials are configured. This means `git clone && npm install && npm run dev` produces a fully browsable site immediately, with no Airtable base required to evaluate the UI.
- **API routes** (`src/app/api/donate/create-invoice`, `src/app/api/donate/webhook`) are the two endpoints §7's flow needs — invoice creation and webhook receipt. Both are server-only Next.js route handlers.
- **Donation UI**: a global React Context (`DonationContext`) holds open/closed state for the slide-up drawer, so the header's "⚡ Donate" button and the "suggest deeper coverage" links on wallet cards can all trigger the same drawer instance regardless of which page they're on.
- **Styling**: Tailwind, dark theme mandated by the v2 logo assets (§5), Bitcoin-orange accent, no external UI kit — kept intentionally plain given the hackathon timeline.

Not done in this session (see README.md "Deploying"): actual deployment to a hosting account, and live end-to-end testing of the BTCPay webhook against a real BTCPay instance. The code is written and reasoned through against BTCPay's documented Greenfield API, not exercised against a live server.

---

## 9. Open items — status after generation

| Item | Status |
|---|---|
| Gallery Threshold | **Resolved — 212,121 sats**, set in `data/settings.sample.json` and the `Settings` table spec |
| Lightning payment rail | **Resolved — BTCPay Server**, wired via `src/lib/btcpay.ts` |
| L2 vulnerability breakdown | **Resolved — 2 Medium, 1 Medium-High, 2 Low**, reflected in the `Findings` model and the Companies proof table |
| Payment verification | **Resolved — automatic via signed BTCPay webhook**, no self-reported amount anywhere (§7) |
| Donation disclaimer wording | Drafted in §6, "tips" framing confirmed — **still needs actual legal review before public launch** |
| LaaS naming | Removed from this brief and the generated site. Still present in `FRAKTUR_Pitch_Brief.md` (S4, S9) and `Presentation.md` (title) — not touched, since those weren't explicitly in scope; flag if you want those cleaned too |
| Hosting account | **Not done** — code is deploy-ready (Vercel or any Next.js host) but nothing was deployed this session |
| BTCPay live test | **Not done** — webhook/invoice code written against BTCPay's documented API, not exercised against a live instance |
| Audited wallet's name (first test) | Kept anonymized per source material — confirm this stays intentional |
| Airtable base itself | **Not created** — schema is fully specified (§4) but no live base exists yet; site runs on sample data until one is created and credentials are set |

---

## 10. Definition of done — status

- [x] Exactly 2 pages (Home, Companies) + the global donation drawer, matching the section order in §2 and §3.
- [x] Home loads directly into hero → donation ticker banner → wallet list → collapsible donor gallery, zero pitch content.
- [x] Companies carries the entire pitch plus the §3.1 proof section with the corrected figures, zero donation language in its own copy.
- [x] Logo usage is exclusively the two v2-on-black assets (§5); the superseded logos are not referenced anywhere in `/website`.
- [x] Every non-negotiable in §0 is respected in the copy.
- [x] Data renders from Airtable when configured, from sample JSON otherwise — structure matches §4 exactly.
- [x] Mobile-responsive layout (ticker marquee + bottom-sheet drawer use responsive Tailwind classes).
- [x] No lorem ipsum — real content from the pitch brief and this document throughout.
- [x] `npm install && npm run build` verified clean (re-verified after the v5 redesign and the Next.js security patch — see §11).
- [ ] **Not done:** git commit pushed to a remote — no remote was configured; needs the founder's repository URL.
- [ ] **Not done:** actual deployment / live BTCPay test.

---

## 11. Companies page redesign (v5) — positioning + visual system

**Positioning, refined and confirmed:** the target buyer isn't choosing FRAKTUR over a full manual audit on price — a $50–250K audit was never actually reachable for a 5–50-engineer, often pre-Series-A company. The real competitor is *no security review at all*. This reframes the whole page: FRAKTUR isn't pitched as "audit, but cheaper" (a claim that would contradict the standing rule that FRAKTUR is a co-pilot, not a replacement for a formal audit) — it's pitched as the thing that exists in the gap where a full audit was never on the table to begin with. Two taglines came out of that reframe and anchor the page:

- **Cover:** *"Cheaper because smarter."* — opens the page, right under the eyebrow line.
- **Closing bookend:** *"Full audits weren't built for you. This is."* — the last thing said before pricing/CTA.

**Important distinction carried through the copy:** the -95% file/cost reduction numbers (§3.1) are measured facts from the first real test. The claim that this captures "90% of exploitable vulnerabilities" is *not* proven the same way — no controlled side-by-side against a full manual audit exists yet. The redesigned page does not state a vulnerability-capture percentage anywhere; it states the measured numbers (files, cost, findings) and lets the reader draw the inference. **Recommended next investment, not yet done:** commission one full manual audit on a wallet FRAKTUR has already triaged, and publish the diff. That single experiment would convert "smarter" from a claim into a proven number — the strongest asset FRAKTUR could produce.

**Visual system — why it changed:** the founder's brief was direct: `FRAKTUR.pdf` is "ultra visuel — une image puissante, 2 lignes de texte," and the original Companies page (dense paragraphs, an HTML comparison table) didn't meet that bar. The rebuild follows the deck's actual structure — one full-viewport "slide" per idea, one strong visual, a 1–2 line serif headline, almost no body text — but does **not** reuse the deck's stock photography (glass, Atlas statue, cow, bees, scales). Two reasons: licensing (those images aren't ours to ship), and brand fit (a proof-based security product is better served by visuals built from real data and the brand's own mark than generic metaphor photos). Concretely:

- `src/components/ShardArt.tsx` — six original SVG compositions, all built from the same wedge silhouette as the FRAKTUR mark, repeated/scaled/blurred to carry a specific idea (e.g. `burden`: one solid shard under a tall stack of faint ones, for "One Engineer, Millions at Stake"; `concentration`: scattered faint fragments funneling into one bright shard, for "Not cheaper. Concentrated." — literally drawing the 1,300→63 idea instead of just charting it).
- `src/components/ProofVisual.tsx` — recreates the deck's actual proof-slide language (a floating dark card, one bold bar, the result stated as a single number) for the L1/L2/cost figures, replacing the old plain HTML table.
- `src/components/Slide.tsx` — the reusable full-viewport split-screen (or centered, for the cover/closing bookends) layout every idea now goes through.
- Headlines now use a serif display stack (`font-display` in `tailwind.config.ts`) to match the deck's editorial voice, sans-serif everywhere else. **Deliberately a system font stack (Iowan Old Style/Palatino/Georgia), not a Google Fonts fetch** — `next/font/google` was tried first and failed at build time in this sandbox (no egress to `fonts.googleapis.com`), which is itself a good reason to avoid a network dependency at build time in general. Self-hosting a specific serif file (shipped in `/public`, no fetch) is the right upgrade if a particular typeface matters later — revisit if this is worth doing.
- FAQ stayed as plain utility content below the visual sections — it's reference material, not part of the emotional arc, and forcing it into "slide" format would have been the wrong instinct (the philosophy calls for restraint, not decoration for its own sake).

**Security patch applied in passing:** `npm install` flagged Next.js 14.2.5 with a critical advisory. Bumped to **14.2.35** (the latest 14.2.x patch) and dropped an unused `tsx` devDependency (a leftover `sync-data` script referencing a file that was never created — dead weight, and it pulled in a vulnerable `esbuild`). Residual: `npm audit` still flags a few advisories only fully resolved in the Next.js 15/16 line (image optimizer, middleware/i18n, WebSocket upgrades) — none of the affected features (`next/image`, `middleware.ts`, i18n config, WebSocket upgrades) are used anywhere in this codebase, so exposure is low, but a major-version upgrade wasn't attempted blind in this session and is worth scheduling deliberately, with its own test pass, rather than folding into this change.

---

## 13. Companies copy pass (v6) — hero decoupled, conflict resolved, proof reframed

**The Hero is not slide 1 of the pitch.** It states the brand promise ("Cheaper because smarter") and stops there — no `eyebrow`/`id` ties it into the problem→solution→proof sequence that follows. Reasoning (founder's catch): a hero that states the answer, immediately followed by slides that state the problem, immediately followed by another slide re-stating an answer, reads as incoherent — "we solved it… here's the problem… we solved it." Decoupling the Hero visually and structurally (no eyebrow, not part of the nav-anchored sequence) fixes that without removing it from being the first thing seen.

**Direct wording conflict, resolved.** The Hero promises "cheaper." An earlier draft of the pivot slide said "**Not** cheaper. Concentrated." — a literal contradiction sitting two scrolls apart. Fixed by changing the pivot headline to **"Not smaller. Smarter."** (word order flipped from an earlier draft — "Smarter, not smaller." — per the founder's call: naming the objection first and landing on "Smarter" last is more impactful than the reverse, and it means both the Hero and the pivot now end on the exact same word, an intentional echo rather than a coincidence).

**Proof slides now lead with mechanism, not raw numbers.** The previous version led with "1,300 files. Down to 63." and "6 files. 5 real findings." as headlines — accurate, but it buried *why* the numbers exist. Founder's framing: show the secret sauce. Rewritten using the original pitch deck's own language:
- Layer 1 slide headline is now **"1,000 Attackers. Automated."** with a sub explaining attack-surface triage (random/malformed/adversarial inputs at scale, crash sites mapping the risk landscape for Layer 2). The measured -95% file reduction is still there, but as the *supporting visual* (`CompareBars`), not the headline claim.
- Layer 2 slide headline is now **"Bitcoin-Native AI. Targeted by Fuzz."**, with the 6-files/5-findings `FindingsCard` demoted to supporting visual the same way.
- Cost slide (**"$3.2k. Down to $150."**) was left as-is per founder's call ("me semble pas mal"), sub tightened to explicitly land the original pitch line "Better signal, at a lower cost."

**Known limitation, intentional:** the founder shared a live update from whoever is building FRAKTUR's Layer 1/2 pipeline — a first complete test on Wasabi wallet just started (70+ tests excluding Loupe, run in regtest + mainnet, deterministic tools first to keep token usage low, then LLM fuzz, then Loupe). That real number isn't ready yet, so this pass keeps the existing first-test figures (1,300→63 files, $3.2k→$150, the 5-finding breakdown) as the illustrative proof, with the *concept* (Layer 1/2 mechanism) carrying the headlines instead. **When the Wasabi numbers land, swap the `CompareBars`/`FindingsCard` values — the headlines and subs describing the mechanism don't need to change.**

**New slide added — verification, in resonance with Home.** Home's hero states: *"Live, verifiable security scores for Bitcoin wallets. Audited, timestamped, public."* Companies had nothing that echoed this. Added a slide, headline **"Don't Trust. Verify."** (reused verbatim from the source pitch deck — it's the Bitcoin-native mantra, not a paraphrase), sub ties directly back to OpenTimestamp and explicitly points at the Wallet Watcher on Home ("the same proof your users can check... not a PDF you take our word for"). Positioned after the three Layer 1/2/cost proof slides, before the closing/pricing bookend. New `ShardArt` variant `verify` (a shard sealed inside a dashed timestamp ring) supports it — no stock imagery, same rationale as §11.

**Nav anchor bug fixed in passing:** `id="problem"` was sitting on the Hero slide, not the first actual problem slide — meant clicking "Problem" in the nav scrolled to the brand tagline, not the problem statement. Moved to the "83 Exploits..." slide where it belongs.

---

## 14. Hero rebuild + night-blue accent + donation drawer UX pass

**Hero is now its own component (`src/components/Hero.tsx`), not a `Slide` instance.** Founder's call after seeing the v6 result: reusing `Slide`'s split-screen/90vh layout for the Hero made it read as an emptier version of the next slide rather than a distinct arrival moment — "hauteur etc. non satisfaisant." Rebuilt as: full `min-h-screen` (not 90vh), single centered column (no split, no half-empty text side), the single biggest type on the page (up to `text-8xl` — every content slide caps at `text-6xl`, so the brand line is unambiguously the loudest thing on the page, not competing with what follows), `ShardArt` as a full-bleed atmospheric backdrop rather than confined to a visual half, and a scroll cue anchored to `#problem` so the Hero doesn't feel disconnected from the page below it.

**Second brand accent (`fraktur-electric` #3b6fed / `fraktur-electricDim` #1b2a5c) now used sparingly on Companies, matching a convention already established on Home:** electric blue carries "audit/verification" visual language (the `verify` `ShardArt` variant, `CompareBars`' result values), while orange stays reserved for the donation/CTA role — see the color comment block in `tailwind.config.ts`. Founder's brief was explicit that the Home page's blue application felt heavy-handed; the fix on Companies is to use it as a rare, structural accent (Hero's radial glow, selection states in the donation drawer) rather than a dominant color, keeping orange as the primary identity color.

**Donation drawer rewritten for concision (`DonationDrawer.tsx`):**
- Every disclosure line (the "gift not investment" framing + threshold/allocation-preference notes) is now **one small-print paragraph under the submit button** — previously split across three separate boxes above the form. The sentence *"This is verified automatically once BTCPay confirms your payment — there's no amount to type in below"* was cut entirely (founder's call — the absence of an amount field already makes this obvious, the sentence was explaining something nobody needed explained).
- Allocation labels shortened: "Product development — we decide between dev and audit work" → **"Product development"**; "Audit a specific wallet — pick one below, or suggest a new one" → **"Audit a specific wallet"**; "Team — direct tips to contributors" → **"Direct tips to the team"**.
- Allocation choices and wallet picker are now selectable cards/chips (not a bare radio + label, not a native `<select multiple>`) — selected state uses the electric/electricDim accent, giving the "which wallet" decision the same verification-adjacent visual language as the rest of the site, instead of looking like an unstyled form control.
- The wallet multi-select was flagged directly ("très moche") — replaced with a scrollable checkbox-chip list styled consistently with the rest of the site (rounded rows, border/background states), not a native OS `<select>` box.

---

## 15. Disclosure policy (decided 2026-07-07) — what gets published, to whom, and when

**The question:** never disclose finding details unless the company pays; sell the full report; or disclose findings free but keep it general? The founder asked this explicitly, weighing attacker-arming risk against Bitcoin community norms.

**Decision: staged disclosure, not an all-or-nothing choice between "free" and "paid."** Two different recipients, two different levels of detail:

| Recipient | What they get | When |
|---|---|---|
| The audited company | Full technical detail — exact file/function, PoC | Immediately, free, always — never gated on payment (that would be leverage/extortion-adjacent, and breaks the existing "never withhold findings" rule) |
| The public (X, Wallet Watcher) | Existence of the finding + severity + general category (e.g. "Medium — path/filesystem handling") | Immediately |
| The public (technical write-up) | Exact vulnerable code path, working PoC | Embargoed — after the company ships a fix, or a default 90-day window (extendable while a fix is actively in progress) expires, whichever first |
| Anyone, as a paid product | Continuous coverage across every file (not just the one free-tier finding), speed, ongoing engagement | Subscription — this sells the *service*, not information already owed to the affected company for free |

**Why this, not the other two options considered:**
- *"Nothing without payment"* was ruled out — it directly contradicts the standing rule against withholding findings as leverage, and reads as a shakedown ("pay us to learn if you're vulnerable") that would be reputationally toxic in a reputation-driven community.
- *"Sell the full report to end users"* was ruled out — retail users don't buy technical audit reports (the Wallet Watcher's public score already serves that audience), and selling a company's own vulnerability details to its users without the company's involvement reads as leverage against the company via its own users, not responsible disclosure.
- The Bitcoin/crypto security community's actual norm (Bitcoin Core, Lightning) is coordinated disclosure with an embargo — not immediate full technical publication. A vendor that leaks a live 0-day publicly loses credibility, it doesn't earn it. "Don't Trust. Verify." (the site's own proof-of-audit slide) is about verifying that a real audit happened, not about publishing exploit code before it's safe.

**Where this shows up in the actual copy:** Annex A5 (`FRAKTUR_Pitch_Brief.md`) tightened — "Disclose vulnerabilities in full, for free" was ambiguous and read as "publish full technical detail immediately," which is exactly the risky reading this decision rules out. New Annex A10 risk row added. `CLAUDE.md` (recreated — see note below) carries the same policy as a standing project rule. Companies page FAQ gets a new objection addressing this directly, since "will you dump my vulnerability details publicly?" is a real, high-stakes question for any B2B prospect evaluating a security vendor. `/legal` gets a short disclosure-policy paragraph alongside the donation terms.

**Note:** `CLAUDE.md` was found missing from the project root while making this change (not flagged as a parallel-session edit) and was recreated with this policy folded in — flag to the founder in case their other session moved or restructured it deliberately rather than it having been deleted by accident.

---

## 16. Companies pricing — three tiers, wallet-context aware

Companion to `HOME_UX_SPEC.md` §5-7 (the Home-side half of this change, implemented separately by the parallel VS Code session). The old pricing slide had one offer (subscribe) and two generic CTAs. It now has three, because two of the three revenue streams had no landing page at all:

| Tier | What it sells | Why it exists |
|---|---|---|
| Targeted re-verification | FRAKTUR independently re-scans a specific area a team just fixed, re-stamps it | The moment a team's motivation is highest — right after fixing something — previously had no offer at all; they'd otherwise wait for FRAKTUR's own re-scan schedule for free |
| Complete Findings Report | Full Layer 1 triage across the repo + every Layer 2 finding (with PoC) on the files that triage flagged | The "pay for the full report" revenue stream had no page to land on before this |
| Continuous coverage | The existing subscription | Unchanged, still the primary recommended path |

**Correction (founder catch, same session):** the first version of this tier was described as "a full scan across every file" — directly contradicting FRAKTUR's core thesis that concentration, not exhaustiveness, is the product ("Not smaller. Smarter."). Rewrote both the report and subscription tier descriptions to be precise about which claim is exhaustive and which is selective: Layer 1 triage legitimately covers 100% of the repo (it's cheap, automated fuzzing) — that part can honestly be called complete. Layer 2 deep-audit findings are only ever reported on the files Layer 1 flagged as high-risk, never "every file," in any tier, at any price. What "complete" means in the paid report is *every finding across the selected files, plus the full triage methodology (what was scanned, what was flagged, why)* — not a manual audit of the whole codebase. This mirrors exactly the five things the founder said the offer needs to justify: files scanned, tests run, files prioritized (and why), findings on those files, and proof-of-concept per finding.

**Also removed: the open "get a free scan of your public repo" self-serve CTA.** It let any visitor request a free scan on demand, which inverts the established GTM model — Annex A5 of `FRAKTUR_Pitch_Brief.md` is explicit that scanning is "**proactive**," FRAKTUR choosing which public repos to scan for the free-disclosure motion, not a service any company can request into. An unqualified inbound invite is an unbounded cost center (every wallet team asks, FRAKTUR does free audits for all of them, no revenue). Replaced with a "suggest your repo" nomination: costs FRAKTUR nothing to receive (it's a mailto, not a commitment), captures the same lead-gen signal, but the copy states outright that FRAKTUR chooses based on its own roadmap, not on request.

**Wallet-context banner:** `CompaniesPage` now reads `searchParams.wallet` / `searchParams.reason`. If a visitor arrived via a wallet card's `For Companies →` link carrying that context, the eyebrow becomes `"Checking in about {wallet}?"`, a one-line banner states the relevant reasoning, and the matching tier is visually highlighted (electric border/fill instead of the flat default) rather than presenting all three with equal weight. Mapping: `reason=stale` → highlight subscription; `reason=declared-fixed` → highlight re-verification; anything else/absent → highlight the one-time report. This makes `/companies` a page that responds to why someone arrived instead of the same flat pitch regardless of intent.

**Dependency on the Home side (not yet built as of this writing):** the `For Companies →` link on each wallet card needs to actually pass `?wallet=X&reason=Y` for this to activate — currently it's a bare link to `/companies`. Handed to the VS Code session as one of the Home-side implementation prompts (see chat log / their task queue), since that link lives in `WalletList.tsx`. Until that's wired up, this page works fine with no query params (falls back to the generic pitch, one-time report highlighted by default) — nothing breaks, the context-awareness is additive.

**Still explicit in the copy:** the free Public Disclosure Report (a specific already-embargoed finding, once fixed or 90 days pass) is called out directly under the three tiers so nobody confuses it with the paid Complete Findings Report — same distinction established in §15, now enforced in the actual pricing UI, not just the docs.

---

## 17. Free scan — from open self-serve, to nomination-only, to bounded and qualified

Third pass on this one CTA, each version fixing a real problem the previous one had — worth recording the full arc, not just the final state.

**v1 (original):** an unconditional "get a free scan of your public repo" mailto link. Problem: inverts the GTM model (Annex A5 says scanning is FRAKTUR-*proactive*, not on-request) and is an unbounded cost center — every wallet team asks, FRAKTUR does free Layer 2 + PoC + human-review work for all of them, no revenue. Removed.

**v2 (nomination-only):** replaced with "suggest your repo," explicitly no commitment, FRAKTUR decides based on its own roadmap. Safe, but the founder pushed back — a bounded free-trial motion is a legitimate, standard sales tool for converting prospects ("let them taste it"), the fix isn't to remove it, it's to bound it correctly.

**v3 (current) — bounded and qualified, not bounded by file percentage.** The founder's first instinct was to cap *depth per trial* (e.g. "50% of files") — worth stating plainly why that doesn't work: the expensive part of an audit isn't file count, it's Layer 2 depth and the human-review time a real finding triggers (`CLAUDE.md`: "Human reviewers validate high-severity findings before delivery"). A 50%-of-63-flagged-files free trial still commits to roughly half the paid Complete Findings Report's Layer 2 workload — it doesn't bound cost, it just relabels the exposure. The actual levers that bound cost:

- **Depth**, capped by plugging into the *existing* freemium mechanic instead of inventing a new one: Layer 1 triage of the whole repo (cheap, ~$150 per the site's own proof numbers, fine to give unconditionally) + exactly **one** finding disclosed in full with PoC (the same "free single finding" rule already defined for the proactive motion). Not a new percentage rule — the same rule, with a self-serve door added to it.
- **Volume**, capped at **5 accepted applications per month**, stated in the copy itself so it reads as scarcity (a real sales lever), not an unlimited tap.
- **Qualification**, via a real form (`/apply`) reviewed by a human before any scan runs — not instant, not automatic. This is the actual fix for adverse selection (an open invite disproportionately attracts companies who can't afford to pay, not the ones worth prioritizing) — a human decides who's worth the marginal cost, the same "we choose" principle already established for the proactive motion, just extended to also weigh inbound applications.

**Built:** `/apply` — a form (repo URL, contact email, project name, team size, a free-text "why now" field) that restates the rules in full above the form itself (5/month, what's included, what's not, disclosure policy still applies), submits to a new Airtable table `FreeScanApplications` via `POST /api/apply-free-scan`, and shows a "you're in the queue" confirmation — never a scan-triggered or auto-approved state. If Airtable isn't configured, the route returns an explicit error telling the applicant to email directly instead of silently losing the submission. The Companies pricing slide's CTA now links here instead of a mailto, with the 5/month + what's-included line restated in miniature next to the button.

**No automation enforces the 5/month cap** — it's a number in the copy and a column (`Status`) a human reviews in Airtable, on purpose. Automating "reject the 6th application" would require deciding *which* 5 to accept programmatically, which is exactly the judgment call ("we choose based on our roadmap and community impact") that shouldn't be automated.
