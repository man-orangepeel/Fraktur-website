# FRAKTUR — Website Generation Brief
*Master prompt — to be executed to generate the site in `/Fraktur/website/`*
*Drafted: 2026-07-02 — v11 (Home-side ground-up implementation, wallet detail page, and donation-modal change folded in — see §21–§24 — 2026-07-09)*

> **Parallel work notice:** as of 2026-07-07, the founder is running a second Claude Code session (VS Code) on the Home page and shared components at the same time this session works on Companies. If you're picking this project back up, check `git status`/`git log` before assuming this document is the only source of truth for the whole site — Home-side decisions (e.g. `testsRun`, `AuditFlowDiagram`, the `/legal` page, "the Kast" naming) may have been made in that other session and are real even if not documented here. Commit scoped to the files you actually changed, not `git add -A`, while two sessions are active on the same repo. **Update (2026-07-09):** §21–§24 below now fold in that other session's Home-side work explicitly, so this document no longer relies solely on this disclaimer to stay honest about what's real on Home.

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

**Superseded 2026-07-10 — see §26.** The table below was always labeled illustrative/placeholder pending the real pipeline run (see the "Known limitation, intentional" note further down this section). That real run has now happened, on two real codebases, with materially different (and stronger) numbers. Kept here only as a historical record of what shipped first; §26 has the current figures and the governance question that needs answering before they can replace this table on the live site.

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
- Donation drawer: slide-up panel with visible page content behind it (not a full-screen dimmed modal) — reads as "in-context," not "interruption," for a trust-sensitive audience. **Superseded 2026-07-09 — see §24: this is now a vertically centered modal, not a bottom-docked slide-up panel.**

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
- [x] Mobile-responsive layout (ticker marquee + bottom-sheet drawer use responsive Tailwind classes). *(Marquee superseded by a fracture animation, and bottom-sheet superseded by a centered modal — both still responsive; see §21 and §24.)*
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

**Known limitation, intentional (historical — resolved, see §26):** the founder shared a live update from whoever is building FRAKTUR's Layer 1/2 pipeline — a first complete test run had just started (70+ tests excluding Loupe, run in regtest + mainnet, deterministic tools first to keep token usage low, then LLM fuzz, then Loupe) against a real open-source wallet, deliberately not named here or anywhere else in this file (see §26 for why the redaction discipline is now stricter than a simple "name withheld"). That real number wasn't ready yet at the time, so this pass kept the illustrative first-test figures (1,300→63 files, $3.2k→$150, the 5-finding breakdown) as the proof, with the *concept* (Layer 1/2 mechanism) carrying the headlines instead. **The real run has since landed — §26 — but do not swap the `CompareBars`/`FindingsCard` values in from that section without first confirming disclosure status; see §26's governance note.**

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

**Correction (founder question, same session): two axes of the cap, disambiguated.**

1. **5/month is a total across every applicant combined, not 5 per company.** The copy said "5 free scans per month" without stating this, which is genuinely ambiguous — fixed on both `/apply` and the Companies CTA to say "across all applicants combined."
2. **The founder's proposed fix was "one application per company, ever" — pushed back on, and replaced with a sharper rule: one *completed* free scan per project, ever, not one *application* ever.** Reasoning: the scarce, costly resource is a scan actually performed, not the act of submitting a form. Barring a company from ever applying again just because it wasn't selected in a given month — pure volume/timing, not a judgment about the company — throws away a legitimate prospect for no reason. The rule now is: applications that aren't accepted stay `Pending` and roll into the next month's review automatically (no resubmission needed); a project that has already *received* a free scan is the one thing that's permanently ineligible for another. Dedup check is by `Repo URL` (normalized), done manually alongside the monthly review — not automated, same principle as the 5/month cap itself.

---

## 18. Companies page rebuilt from scratch (v2) — not a slide deck anymore

**The ask:** the founder was unsatisfied with the Companies page and asked for a ground-up rebuild — "you know the product, the buyer, the context; detach completely from what exists; best possible UI/UX." Not a copy pass this time, a structural one.

**What was actually wrong with v1-v9:** the page was a vertical sequence of full-viewport "slides" (`Hero.tsx`, `Slide.tsx`, `ShardArt.tsx`) — one idea per screen, forced scroll-through, closer to a pitch-deck-as-a-webpage than a B2B SaaS landing page. That's a defensible aesthetic choice, but it fights against how the actual buyer (a CTO/VP Eng evaluating a security vendor) wants to consume this page: scan the whole thing in under a minute, compare pricing fast, check the proof, move on. Nine screens of forced sequential scrolling optimizes for a *presentation* experience, not a *decision* experience.

**What changed:**
- **Structure:** conventional, compact, scannable sections (hero, trust bar, 3-card problem grid, 3-step how-it-works, 3-panel proof grid, 3-tier pricing, FAQ accordion, final CTA) — no section requires a full viewport of scroll to get past. A visitor can see problem → solution → proof → pricing without more than a few natural scrolls.
- **Hero visual:** replaced the abstract `ShardArt` composition with an illustrative product-preview card — a mocked scan result (risk badge, Layer 1/2 progress bars, severity chips) styled consistently with the real Wallet Watcher wallet cards on Home. Shows the actual product instead of brand art; labeled "Illustrative" so it's never mistaken for a live claim.
- **Trust bar:** a new element that didn't exist before — "Built on Loupe (Spiral/Block)," Bitcoin protocol pills, "No PoC, no report," "OpenTimestamp-verified" — cheap, immediate credibility signals for a visitor who hasn't scrolled far enough to reach the actual proof numbers yet.
- **Copy:** headline now speaks directly to the buyer's actual situation ("You can't hire a dedicated security engineer. You can still ship like one exists.") rather than opening with brand poetry. The moat-honesty framing from the strategic pass (pipeline = how it's delivered fast, on-chain proof = what's actually durable) is now a single explicit sentence in the "How it works" section instead of buried in a founder-facing doc only.
- **Removed:** `Hero.tsx`, `Slide.tsx`, `ShardArt.tsx` deleted — confirmed unused anywhere else first (`grep` across `src/`). Not left as dead code.
- **Kept:** `ProofVisual.tsx` (`CompareBars`, `FindingsCard`) — reused inside a 3-column grid instead of one-per-slide; the pricing tiers, wallet-context `searchParams` logic, and FAQ content are unchanged in substance, only in layout. `Header.tsx`'s companies-variant nav anchors (`#problem #solution #proof #pricing #faq`) were kept intact rather than renamed, since that file belongs to the parallel session — the new page's section ids match what the nav already expects.

**Verification:** `npm run build` clean, all three routes (`/`, `/companies`, `/apply`) return 200 against a local `next start` in this session's sandbox. That sandbox's `localhost` is not reachable from the founder's own browser — see the chat reply for how to view it on their machine (the code is already saved to the real project folder, `npm run dev` there is immediate).

**Round 2 fixes, same session, first-look feedback:**
- Hero copy tightened ("full time security team," "dedicated security team" — team, not one engineer).
- **Hero preview card replaced entirely** — the first version was a hand-rolled simplified mockup (plain divs + hardcoded bars). Rebuilt using the *actual* `AuditFlowDiagram` and `SeverityBadge` components from the real Wallet Watcher card, with static illustrative `Finding[]` data conforming to the current 4-tier `Severity` type (`Critical/High/Medium/Low` — the shared type dropped `Medium-High` since v1 of this page was written, see `src/lib/types.ts`; the hero preview follows the current type, not the older 5-tier scheme). This is now genuinely "the same display as the real Wallet Watcher," not a lookalike.
- **Trust bar** moved from a separate full-width strip below the hero into a row of discrete pill badges directly under the hero's sub-headline — the inline dot-separated text version was illegible/cramped at most widths.
- **Problem section headline reframed.** "Bitcoin software is under attack. Most teams have no one watching." implicitly excluded any team that already has *some* security practice, even inadequate ones — which is most of the addressable market, not an edge case. Replaced with "Whatever you're doing today, it doesn't feel like enough," plus a sub-line naming the actual answer (key-file focus + Bitcoin-native AI, a fraction of a full audit's cost) — inclusive of any starting point, still validates the underlying anxiety.
- Problem-card and pricing-tier subtitle lines recolored from orange to electric blue (founder's direct call).
- The "Public Disclosure Report vs. paid tiers" paragraph was too much inline text on the pricing section — cut from there and turned into a new FAQ entry instead; the distinction (already established in §15/§16) is preserved, just relocated to where reference detail belongs.

---

## 19. Sample data anonymized — this is a public site, urgent fix

**`data/wallets.sample.json` named six real, identifiable Bitcoin wallets** (six well-known open-source wallet projects — names deliberately not repeated here either, per the stricter redaction discipline established in §26) — real GitHub repo links, real project names — each carrying entirely fabricated vulnerability findings ("hardcoded cryptographic key used across all installs," "insufficiently protected credentials in backup export," etc.). On a site the public can actually visit, that's not a placeholder problem, it's publishing invented security claims against named, real projects who never agreed to any of this — a real reputational/legal exposure, independent of anything the disclosure policy (§15) covers, because it isn't even a real audit.

**Fixed:** every wallet renamed to a fictional equivalent (Kestrel Wallet, Harbor Wallet, Thornwood Wallet, Ferrowatch, Lantern Desktop, Rowan), repo URLs pointed at a clearly placeholder `example-wallets` GitHub org, all internal ids and finding-id cross-references (`auditHistory.findingIds`) renamed consistently within each wallet block. Data shape, severities, dates, and finding counts are unchanged — only the identifying names are fictional now.

**Standing rule going forward: never put a real, named, identifiable project into this file** (or any other public-facing sample data) with invented findings attached — sample/illustrative data needs invented names by default, not real ones with a mental note to anonymize later. This file is shared between the Home and Companies pages and gets edited by both the founder's Cowork and VS Code sessions — worth either session flagging immediately if a real name shows up in it again, rather than assuming the other session will catch it.

---

## 20. Donation drawer — no preselected allocation

`DonationDrawer.tsx` defaulted `allocation` to `"Product Dev"` on open, and to `"Specific Wallet"` whenever a visitor arrived via a wallet card's "Help us go deeper" link (`WalletList.tsx` passes `allocationChoice: "Specific Wallet"` in the prefill). Founder's call: never preselect — let the donor actively choose every time, including after clicking a wallet-specific link. What should carry over from that click is *which wallet to offer*, not *that "Specific Wallet" is the answer*.

Fixed entirely inside `DonationDrawer.tsx` (no change needed on the Home side): `allocation` now starts as `undefined` and is reset to `undefined` every time the drawer opens, regardless of what `prefill.allocationChoice` says — that field is now deliberately ignored. `selectedWallets` still gets pre-populated from `prefill.walletId`, but stays dormant (the wallet-picker panel only renders once the donor manually selects "Specific Wallet") — so clicking "Help us go deeper" on a given wallet still saves the donor a step *if* they end up choosing that allocation, without forcing the choice. Submit is blocked with an inline message ("Please choose where this should go, above.") if no allocation was picked.

---

## 21. Home page — ground-up implementation, post-v10 (two-tone system, wallet card v2, "the Kast")

**Context:** everything below shipped in the parallel VS Code/Claude Code session on Home-side files (`Header.tsx`, `WalletList.tsx`, `SeverityBadge.tsx`, `AuditFlowDiagram.tsx`, `TickerBanner.tsx`, `SupportersGallery.tsx`, `Footer.tsx`, `tailwind.config.ts`, `data/*.sample.json`) between 2026-07-07 and 2026-07-09, largely executing the proposals in `HOME_UX_SPEC.md`. That document is a **pre-implementation proposal draft** — unlike this file, it is not kept in sync with the code after the fact. Treat this section as the as-built record; treat `HOME_UX_SPEC.md` as the rationale/history behind each decision.

**Nav bar — supersedes §1.** The `Wallets` / `Supporters` in-page anchors and the inline `For Companies` text link no longer exist on the Home header. Per `HOME_UX_SPEC.md` §1, `For Companies` is now a ghost/outline electric-blue pill paired directly next to the filled-orange `⚡ Help us fraKtur it before they do` donate button — matched size/weight, so the header's two most important actions read as a pair instead of one looking like a caption next to the other. Both pills stay visible at every width (no `hidden md:flex` collapse). The Companies-variant nav (`Problem/Solution/Proof/Pricing/FAQ`) is unchanged.

**Two-tone color system, now codified in `tailwind.config.ts`:** `fraktur.orange`/`orangeDim` stays the brand/CTA/donation color; `fraktur.electric` (`#3b6fed`) / `electricDim` (`#1b2a5c`) is a second accent reserved for audit/verification visual language (the flow diagram, "Verify" links, selection states), applied deliberately sparingly after the founder flagged early passes as too heavy-handed with it. A **separate `severity.*` token set** (none/low/medium/high/critical — green reserved exclusively for a genuinely clean wallet) now drives every severity color on Home. The original 5-tier `risk.*` tokens (including `Medium-High`, §4.1a) were left in place, untouched, because Companies' `ProofVisual.tsx` still depends on them — two color systems coexist on purpose rather than one being force-migrated mid-flight by a session that doesn't own that file.

**Donor community renamed "the Kast"** — `SupportersGallery.tsx`, `TickerBanner.tsx` (corrects the "The Cast" guess in this file's own parallel-work notice above).

**Ticker banner rebuilt as a fracture animation, replacing the marquee** (`HOME_UX_SPEC.md` §3): 3 donor slots shown at once, not a continuous scroll of everyone — holds for ~1.2s, cracks open in a two-phase animation (hairline fissure, then widen/fade), then the next group of 3 fades in. Retimed across several rounds of feedback; current constants live at the top of `TickerBanner.tsx`. The old CSS `marquee` keyframe is still defined in `tailwind.config.ts` but nothing currently renders it.

**Hero headline replaced** with `HOME_UX_SPEC.md` §2's confirmed option — *"Bitcoin-native AI, aimed at what actually breaks."* + tagline *"Bound to this wallet, this version, this date — proven on-chain, not just claimed."* The tagline deliberately narrows the on-chain-proof claim to binding/authenticity rather than implying the full report is public, consistent with §15's disclosure staging.

**Wallet card rebuilt around 3 "facts," replacing §2.3's flat field list:**
1. Icon/monogram + name + repo link (unchanged in substance).
2. Fact 1 — the scan date as plain colored text, not a pill (a date isn't a verdict), colored by the new freshness gradient below, linking straight into that wallet's audit-history page (§22).
3. Fact 2 — one merged pill: status + files-audited/selected count.
4. `AuditFlowDiagram.tsx` — a new mempool.space-style SVG (files/tests ribbons merging into severity-colored finding blocks) replacing the plain "1,300 → 63 files, -95% noise cut" text spec §2.3 originally called for; the old inline Layer-2 progress gauge folded into Fact 2's pill instead of living separately.
5. Fact 3 — "Fractures" severity badges plus a single `ⓘ` disclosure-info popover (hover-intent close, ~250ms grace so crossing from icon to panel doesn't dismiss it — the standard Radix/Tippy/Floating-UI pattern) replacing the original one-tooltip-per-badge design, which had repeated the same disclosure paragraph 3–4 times on a single card.

**Risk-filter bug, fixed.** The wallet grid's risk filter and "sort by risk" compared against `wallet.riskBadge` — a separately curated field reflecting only currently-*open* findings — while the visible severity badges on each card counted every finding regardless of fixed/open status. Filtering "High" could silently exclude a wallet whose card visibly showed "2 High" badges. Fixed with a shared `highestSeverity(findings)` helper (`format.ts`), computed from the wallet's actual findings array and used by both the filter and the sort. `wallet.riskBadge` itself is untouched (still valid for future Airtable-curated nuance) — it's just no longer the source of truth for what the UI filters/sorts by.

**Freshness gradient + two-tier fix status — implements `HOME_UX_SPEC.md` §6's "clean wallet paradox" resolution.** The founder's concern: a wallet showing "0 open findings" looks identical whether it was scanned 3 days ago or 8 months ago, so there was no honest way to reward recency without either overstating freshness or giving reassurance away for free forever. Resolved with two independent mechanisms, both in `format.ts`:
- `freshnessInfo` / `scanLabelFor` — a 4-band gradient (≤7d bright green → ≤30d dimmer green → ≤90d amber → >90d muted gray, labeled "re-scan pending"), replacing the old binary `isStale` ⓘ. Never hides that a scan is old; the visual reward for recency creates organic pressure on a team to pay for a re-scan rather than let its own badge dull in front of its users.
- `FindingStatus` (`"Open" | "Declared Fixed" | "Verified Fixed"`) — a team's own self-reported fix gets a free, neutral badge ("Team reports fixed — pending re-verification"); FRAKTUR's own independent re-scan confirming the fix gets a visually stronger badge ("FRAKTUR-verified fixed"). This is the technical seed of the **targeted re-verification** tier §16 already prices on Companies — the Home UI now visibly creates the moment that product sells into.

**Footer rebuilt:** an icon row (X / GitHub / OpenTimestamp / mail — `SocialIcons.tsx`) replaces a text link row, plus a shortened one-line donation disclaimer linking to a new `/legal` page (the full §6 wording now lives there, not inline in the footer).

---

## 22. Wallet detail — from a popup to a dedicated, shareable page (`/wallets/[slug]`)

`HOME_UX_SPEC.md` §4c/§7 specified an audit-history **popup** (built first as `AuditHistoryModal.tsx`, then `WalletHistoryBrowser.tsx`) with prev/next round navigation and public/embargoed badges. After it shipped, the founder asked for a professional opinion on converting it into a dedicated page instead. Argued for it: a per-wallet page is shareable (a URL a team or supporter can actually link to, unlike a modal), better for SEO/reputation — central to the viral/proof mechanic the whole product leans on — gives the history far more room than a modal ever could, and matches the page-per-concept pattern the site already established (`/legal`, `/companies`, `/apply`). Founder agreed. Both modal components were deleted and replaced with:

- `src/app/wallets/[slug]/page.tsx` — server component; fetches wallets, 404s on an unknown slug, sets a per-wallet `<title>`/description via `generateMetadata` so a shared link previews the wallet's own audit status rather than a generic site title.
- `src/components/WalletDetailView.tsx` — the interactive client body.
- The slug is **derived, not stored**: `walletSlug()` (`format.ts`) kebab-cases the wallet's name, avoiding a new field on the Airtable `Wallets` schema (§4.1) just for a URL.

**Data-model addition, not yet reflected in the Airtable schema (§4.1):** `AuditHistoryEntry` (`types.ts`) now carries its own `testsRun?` / `filesScanned` / `filesSelected` per round, not just `date` / `version` / `publiclyDisclosed` / `findingIds`. This matters functionally — switching between audit rounds on the detail page now actually changes the flow diagram and file/test counts shown, instead of always displaying the wallet's current-state totals regardless of which historical round is selected. **Open item:** `auditHistory`, with its per-round numbers, exists only in `data/wallets.sample.json` today — a real `AuditHistory`-equivalent Airtable table needs designing before this is backed by live data, the same gap §4.1a once had for `Findings` before that table existed.

**Page layout, current state:** two columns inside a centered `max-w-[960px]` wrapper — left (`360px`) is the filterable/sortable audit-round list, right (fixed `36rem`, sized to match the wallet card's own width rather than stretching to fill a wider grid track) is the wallet card plus the selected round's finding detail. History rows use a **fixed-column CSS grid** (date / Partial-or-Complete badge / highest-severity color swatch / spacer / disclosure icon) rather than a flex row with gaps — a flex row let "Complete" vs. "Partial" text width shift every following element out of alignment between rows; the grid guarantees each field lands in the same position on every row regardless of its own content length. Two `<select>` dropdowns (age, severity/vulnerability-type) plus a sort dropdown (most-recent-first / most-critical-first) reuse the exact pattern already established by the Home page's own wallet-grid filter, for interaction consistency between the two pages.

**Disclosure-state display, refined from §4c's spec:** the popup spec called for a text badge ("Public" vs. "Embargoed until [date]") on every history entry; the page shows a single icon instead (🔍 public / 🔒 embargoed) to keep each row compact, with the full "Public" / "🔒 Embargoed" text badge retained in the "Viewing {date} · {version}" line for whichever round is currently selected. The underlying rule from §15 is unchanged — severity + existence is always visible per round; exploit-level detail only renders once `publiclyDisclosed` is true.

**Bug fixed in passing:** the page's "Get the full report →" CTA at one point pointed at `/apply` (the free-scan-application queue) instead of `/contact?tier=report&wallet=X` (the paid lead-gen form) — a real bug the founder caught. Fixed; the wallet name carries through so the contact form arrives pre-scoped.

---

## 23. `/apply` and `/contact` forms — required project field, wallet interest picker

Both forms (`ApplyForm.tsx` for `/apply`, `ContactForm.tsx` for `/contact`) gained:
- A **required** "Company / project" field (previously optional or absent) — a submission with no stated company was effectively a dead lead.
- A **wallet-interest multi-select** — a scrollable checkbox list, visually matching the donation drawer's own wallet picker, pre-checked automatically when the visitor arrived via a wallet-specific link (e.g. a wallet card's "For Companies →", or a wallet page's "Get the full report →"). Stored end-to-end as `interestedWallets` (`ApplyForm`/`ContactForm` → `/api/apply-free-scan` / `/api/contact` → `airtable.ts`'s `createFreeScanApplication` / `createLead`, joined as a comma-separated field). Both routes now also enforce the project/company field server-side, not only in the client form.

**Nav-anchor bug fixed in passing:** `Header.tsx`'s companies-variant anchors were bare `#problem`-style fragments, which only resolve correctly when actually rendered on `/companies` — broke when that header variant is reused on `/apply` (clicking "Problem" there just tacked a fragment onto `/apply`'s own URL instead of navigating anywhere). Fixed to absolute `/companies#problem`-style paths.

---

## 24. Donation drawer — bottom-sheet retired for a centered modal

**Supersedes §5's "slide-up panel... not a full-screen dimmed modal" line and §10's "bottom-sheet drawer" checklist item.** Those described a deliberate earlier choice — docked to the bottom of the viewport, chosen specifically so it wouldn't read as a full-screen interruption for a trust-sensitive donor audience. The founder later asked for it to read as a genuine centered popup instead. Changed in `DonationDrawer.tsx`: `items-end` → `items-center` (the drawer no longer docks to the bottom), `rounded-t-2xl` → `rounded-2xl` (all four corners, not just the top), and added backdrop `p-4` so the panel doesn't touch viewport edges on small screens. The backdrop itself is unchanged — still a translucent `bg-black/30`, not a fully opaque overlay — so the original "page content stays faintly visible behind it, this isn't a jarring interruption" intent survives; only the panel's own position and corner treatment changed.

---

## 25. Cowork-side batch — lead-gen rationalization, wallet card polish, footer/CTA copy, infra incident

**Context:** shipped in this (Cowork) session, on Companies-side and shared files, between §20 and §21's Home-side work landing. Recorded here together since it's one coherent batch of small fixes plus one real architectural change (forms), not because it's chronologically after §24 — see `git log` for actual interleaving with the parallel session's commits.

**Forms rationalized — one lead pipeline, not two.** Every "buy a tier" CTA on Companies (three pricing tiers + the final "Talk to us" button) previously opened a bare `mailto:` link — no record kept, inconsistent with `/apply`'s Airtable-backed queue. Replaced with `/contact` (`ContactForm.tsx`, since extended by the parallel session with a required Company field and a wallet-interest picker, §23) → `POST /api/contact` → a new `Leads` table in `lib/airtable.ts` (`createLead`), same graceful-fallback shape as `/apply` and the donation flow (`airtableConfigured()` check, explicit 503 pointing to a direct email instead of a silent failure or a generic crash). `?tier=` and `?wallet=` carry context from the pricing tier clicked / wallet arrived from, prefilling without forcing the choice. README.md and `.env.example` updated with the `Leads` table schema and `AIRTABLE_TABLE_LEADS` var. **This closes a gap flagged in §9's original open-items table implicitly** — Leads is now the seventh Airtable table alongside the original six.

**`create-invoice` route hardened.** `POST /api/donate/create-invoice` was the one form-backing route without an `airtableConfigured()` guard — it would throw a generic 500 if Airtable env vars were unset, unlike `/apply` and (now) `/contact`. Fixed to the same graceful-503 pattern.

**Wallet card polish (`WalletList.tsx`):** the scan-date text now uses the same green/blue language as the status pill (`< 30 days` → green, older → blue) instead of a separate three-band electric/text/muted gradient — one fewer color language on the same card. Severity badges (`SeverityBadge.tsx`) gained an optional `onClick`, used here to route straight to the wallet's detail page (superseded by the parallel session's later modal→page migration, §22 — the click target is now `/wallets/[slug]` rather than a modal, but the badges staying clickable at all was this session's addition). Empty search/filter state now shows a message instead of a blank grid. "the Kast" (`SupportersGallery.tsx`) gained a "Show fewer supporters ↑" collapse control, symmetric to the existing "See all N supporters →" expand.

**Companies page copy/layout fixes:** hero preview card now pulls one real wallet's data from `getWallets()` (`wallet-rowan-01`) instead of hand-authored mock numbers — labeled "One live entry from our Wallet Watcher — not a mockup," a stronger claim than the old "Illustrative" caption since it's now literally true. Nav's "Home" link relabeled "Wallet Watcher." All five anchored sections (`#problem #solution #proof #pricing #faq`) got `scroll-mt-28` so the sticky header no longer covers the first few lines after an anchor jump. Final CTA rewritten from "Not smaller. Smarter. Full audits weren't built for you. This is." (repeated both the Solution section's and the Pricing section's own headlines verbatim) to "Every wallet fractures somewhere. Know where yours does. Now." — ties into the "Fractures" severity-row naming already established on Home instead of restating other sections. **Superseded once, then restored:** this session's trust-bar single-badge accent treatment (only "Built on Loupe" tinted blue) was reworked by the parallel session into a uniform outline style across all four badges (`cadc9d0`) — left as-is per this document's own rule (don't fight a concurrent, intentional revision; see the file-modification notes in-session).

**Footer split into two visual blocks:** the brand block (logo + social icons, §21's icon-row) and a "fine print" block (donation disclaimer + copyright) are now separated by a top border and extra spacing, rather than sitting in one undifferentiated stack — reads as "brand" then "legal," not one long column.

**Infra incident — cross-platform `node_modules` corruption, since fixed.** An `npm install` run from this session's Linux sandbox against the shared (mounted) `node_modules` wrote the Linux `@next/swc-linux-arm64-gnu` binary and left no macOS-compatible `@next/swc-darwin-*` package, breaking `next dev` locally for the founder ("Cannot find module './276.js'", "missing required error components"). Root-caused via a read-only scan (`node_modules/@next/` contents) rather than blind reinstall. Fixed by the founder locally: `rm -rf node_modules package-lock.json .next && npm install`, regenerating a macOS-native lockfile (`c7d0794`). **Standing rule going forward, added to this session's own working practice:** this session no longer runs `npm install` or `npm run build` against this shared repo — verification now uses `tsc --noEmit` only, which doesn't touch `node_modules` or `.next`.

---

## 26. Real pipeline results delivered (2026-07-10) — supersedes §3.1's illustrative figures, redaction discipline tightened

**What arrived:** a team-internal briefing (`fraktur_team_report_shareable/` — a separate connected folder, not part of `website/`) from whoever is building FRAKTUR's actual Layer 1/2 pipeline, reporting the first two complete real runs. This is the "Wasabi numbers" the "Known limitation, intentional" note in §3.1 said were still pending — they have now landed, and they are materially different from (and stronger than) the illustrative placeholder figures that shipped first.

**Redaction discipline — read before touching any of this.** The briefing itself is pre-redacted and explicit about why: the primary run's target is a **live, real, open-source wallet that has not yet been contacted under coordinated disclosure.** Per the briefing's own "Do / Don't," even this internal document never names the wallet — not just the public site. The Do/Don't, restated exactly, because it governs everything below:

- **OK to use anywhere internal, and eventually publicly once disclosure timing allows:** the tool description, the methodology, the economics, and results **at the severity + broad-category level only**.
- **Never** — internally or publicly — name the target wallet(s), state affected files/lines/method names, describe the exploit mechanism, or reproduce/reconstruct a proof-of-concept. This document does not repeat those specifics, and no future edit to this file should add them back in, even in a "redacted-except-for-this-one-detail" form.

**The real results, at the only level of detail this document will ever carry:**

| Metric | Value |
|---|---|
| Primary target — files deep-read vs. total | 7 of 1,334 (99.5% never AI-read; 72× fewer than deep-reading everything) |
| Primary target — code-verified findings | 6 (2 High, 3 Medium, 1 Low); 3 dynamically confirmed exploitable/state-corrupting, 0 refuted |
| Primary target — broad finding categories (no file/mechanism detail) | Untrusted network-input authenticity (×2), credential/key handling, resource-exhaustion/availability, transaction state-machine consistency, data-structure consistency |
| Cost — this run vs. deep-reading every file | ~$107 vs. ~$1,515 list-price-equivalent (~93% cheaper, robust across an 88–95% band) |
| Adversarial self-refutation rate | 17 candidates → 14 refuted → 3 kept (82% refuted before anything is reported) — a concrete number for the "AI hallucinates" FAQ objection, not just a policy statement |
| Second target (independent run, different language) | 9 further findings (3 Medium, 4 Low, 2 Informational) — same redaction, proof the pipeline generalizes beyond one codebase |
| Tool version / maturity | v0.3.0, wallet-agnostic (language detection covers Python/Go/Rust/C#/JS-TS/Java), full CI green, 108 tests passing, deterministic-stage outputs byte-identical to v0.2.0 |

**Why these numbers are a materially better proof point than §3.1's placeholder** — they replace a single illustrative example with a validated result across two independently-run codebases, they answer this document's own standing "is a second test underway" question, and they give the "AI hallucinates" objection a real number (82% self-refutation) instead of only a described process.

**The governance question this raises, not yet resolved — read before editing the live site:** the briefing's own disclosure table states the public gets "existence + severity + category" only **after the maintainers are notified** — not immediately, unlike this project's general disclosure policy (§15), which allows severity/category to go public immediately for an already-in-motion disclosure. The primary wallet **has not been contacted yet.** That means, strictly by the briefing's own rule, these aggregate numbers are not yet clear to put on the public-facing Companies page — even with the wallet unnamed — until contact has happened. This is a real tension with §3.1's original framing (which treated "name withheld" as sufficient to publish aggregate proof numbers immediately). **Do not update the live Companies page's proof section from the placeholder numbers to these real ones without an explicit founder confirmation that the affected maintainer(s) have been contacted** — see the chat log for the proposal presented on this exact point.

**Separately, and outside this document's scope but worth flagging where it was found:** per `CLAUDE.md`'s own standing rule ("do not withhold vulnerability findings from the affected company for payment — they always get full detail, free, immediately"), the operationally urgent next step implied by this briefing is contacting the primary wallet's maintainers with full technical detail, which per the briefing has not happened yet. That is a real-world action item, not a documentation one — flagged here, actioned by the founder/team, not by an edit to this file.
