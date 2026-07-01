# Financial context

Canonical financial picture. Drives priority #3 (12-month business plan), risk-tolerance calibration on productization decisions, and AIOS reasoning about real-time tradeoffs (e.g., "is this $X expense a meaningful pinch?").

This doc is in `context/` so it's always loaded into the AIOS's working frame. Sensitive data — local-only, not synced anywhere outside Justin's machine and Claude conversations.

---

## Income sources

### 1. Two Rivers Marketing (W-2)

**Role:** Senior Interactive Front-End Developer
**Employer structure:** Two Rivers Marketing — ESOP, wholly-owned subsidiary of VGM Group (Waterloo, IA)
**Stability:** High. 26-year-old agency, 150+ employees, parent VGM is a large healthcare MSO. 2RM is the only marketing company in VGM's portfolio.
**Equity component:** ESOP shares. Allocation typically based on tenure + salary; vests over time; pays out at retirement or departure.

**Strategic relevance:** 2RM serves mid-market B2B manufacturers with dealer networks (Pioneer, DEVELON, Volvo CE, Genie, Miller Electric, Briggs & Stratton, Corteva). This is the exact customer profile the channel platform targets. Justin's day job is direct insider exposure to channel-platform prospects.

**Numbers (as of 2026-05-03):**

- **Bi-weekly gross:** $4,245.63
- **Bi-weekly net (take-home):** $2,688.41
- **Annualized gross:** $110,386 ($4,245.63 × 26)
- **Annualized net:** $69,899 ($2,688.41 × 26)
- **Monthly net (the cushion number):** ~$5,825
- **Effective tax + deductions:** ~37% (W-2 standard + state + 401k contributions)
- **Tenure:** 8 years (fully vested in ESOP — most plans vest by year 6)
- **Job stability assessment:** high (26-year-old agency, 150+ employees, ESOP, parent VGM is large healthcare MSO)

### 2RM ESOP

- **Current shares:** 433.3498
- **Current price per share:** $309.96
- **Current ESOP value:** $134,321.12
- **2026 contribution level:** 26% — measured in **share count growth**, not dollar percentage of compensation. Justin's share count grew by ~26% this year through company allocations.
- **Planning assumption:** 26% share count growth continues year over year (this is on the high end for ESOPs; actual rates can regress to 10-15% in weaker company years, so this is the optimistic planning baseline)
- **VGM CEO stated target:** $600+/share "in the next several years"
- **Compounding effect:** share count growing 26%/yr AND share price appreciating toward $600 over 4 years compound multiplicatively. The ESOP could reach ~$657K (vs $134K today). That's ~$523K growth over 4 years, ~$130K/yr in unrealized wealth growth.

**Why this matters:** $130K/yr in ESOP appreciation is roughly **2x annual 2RM net take-home (~$70K).** The ESOP is the larger wealth-building component of 2RM employment, not the paycheck. Walking from this — even when BGD MRR exceeds W-2 take-home — is leaving the bigger income stream on the table.

### 2RM 401k

- **Current balance:** $155,722
- **Personal contribution:** 10% of gross (~$11,039/year)
- **2RM match rate:** TBD (common range 3-6%)
- **Tenure:** 8 years of contributions (matching 2RM employment)

10-year forward projection (assuming 10% personal + 4% match + 7% market return):

| Year | Balance |
|---|---|
| 0 (now) | $155,722 |
| 1 | ~$182K |
| 2 | ~$211K |
| 4 | ~$278K |
| 10 | ~$508K |

If 2RM match is 6% (high case), 10-year balance lands closer to ~$565K.

### Combined retirement picture (ESOP + 401k)

| Year | 401k (mid case) | ESOP (planning) | ESOP (conservative) | Combined (planning) | Combined (conservative) |
|---|---|---|---|---|---|
| Now | $155,722 | $134,321 | $134,321 | $290,043 | $290,043 |
| 4 | ~$278K | ~$657K | ~$341K | ~$935K | ~$619K |
| 10 | ~$508K | TBD | TBD | likely $1.5M+ | likely $1M+ |

The combined picture is the load-bearing insight. By year 4, retirement assets between $619K-$935K depending on scenarios. By year 10, comfortably past $1M.

### 4-year projection (planning model)

Assumptions: 26% share count growth continues annually, share price reaches $600 in 4 years (~18% CAGR), no early distributions, fully vested.

| Year | Shares | Share price | Value |
|---|---|---|---|
| 0 (2026) | 433.35 | $310 | $134,321 |
| 1 (2027) | 546.02 | $366 | ~$200,000 |
| 2 (2028) | 687.98 | $432 | ~$297,000 |
| 3 (2029) | 866.86 | $510 | ~$442,000 |
| 4 (2030) | 1,092.24 | $602 | ~$657,000 |

**Conservative case:** if share count growth regresses to 15%/yr and share price only reaches $450 in 4 years, ESOP would reach ~$341K (still $200K+ growth). The directional case holds either way: every year of staying = meaningful unrealized wealth growth.

This is a planning model, not a forecast. Share price won't appreciate linearly; allocation rates will vary; vesting events and distribution mechanics will affect actual realized value. But the directional case is the load-bearing insight.

### 2. Bearded Ginger Designs (BGD)

See `context/financials.md` for the operational snapshot (pulled live from Bonsai 2026-06-29).

- **BGD gross MRR:** $5,850/month (on months Kirk Financial's quarterly $750 hits)
- **BGD normalized MRR:** $5,350/month (Kirk at $250/mo equivalent)
- **BGD monthly average (annualized):** $5,517/month
- **Projected MRR (with Refuge Sales $425 pending):** $5,942/month
- **Recurring clients:** 18 (19 with Refuge Sales pending)
- **Top clients:** Jon Liebl $1,000, Kirk Financial $750 (quarterly), Terraplex $600, ToneQuest $450, Refuge Sales $425 (pending), Kuberski $400, Inside Out $400
- **Overdue receivables:** $4,075 (as of 2026-06-29, mostly Jon-billed)
- **Annual run rate:** ~$66,200 (normalized + Kirk quarterly bumps)

---

## Expenses (placeholders)

### Business operating costs (BGD)

Total: **$1,259/month** ($15,107/year, deducted via Schedule C).

| Line | Category | Annual | Monthly |
|---|---|---|---|
| 18 | Office expense (hosting, software, domains) | $11,351 | $946 |
| 24a | Travel | $1,000 | $83 |
| 24b | Meals (50% deductible portion) | $900 | $75 |
| 25 | Utilities (business % of internet/phone) | $1,356 | $113 |
| 28 | Operating expense subtotal | $14,607 | $1,217 |
| 30 | Home office (simplified, 100 sq ft × $5) | $500 | $42 |
| | **Total Schedule C deductions** | **$15,107** | **$1,259** |

BGD operating cost ratio: ~27% of MRR. Most is fixed-ish (hosting, software, domains). Will scale modestly with growth but not linearly. Net BGD contribution at current MRR: ~$3,341/month ($4,600 MRR − $1,259 operating costs).

### Personal monthly nut

To be calculated once one full month in the new house has run.

**Known:**
- Mortgage: **$3,400/month** (just bought; partnered)
- Three kids in household (Justin's two from prior marriage + partner's daughter)
- Partner contributes to household income (see below)

**TBD (placeholder until ~one month in new house):**
- Total personal monthly nut
- Justin's allocated share of household expenses
- Insurance and benefit picture (presumably some via 2RM, some via partner's employer)

### Partner / household income

Justin shares household with a partner.

- **Partner gross:** $130K+ base + ~$20K annual bonus = ~$150K total
- **Partner monthly net** (estimated at ~30% effective tax): ~$8,750/mo
- **Combined household W-2 net** (Justin + partner): ~$14,575/mo
- **Combined household + BGD net:** ~$17,900/mo at current MRR

This materially raises Justin's strategic risk tolerance. Decisions like productization pushes, declining custom one-offs, $1,500 trips, founding-customer pricing experiments, etc. can be made on strategic merit rather than financial necessity. Partner income covers significant portion of household primary; Justin's 2RM and BGD are additive contributors, not sole support.

---

## Position

- **Cash on hand / runway:** TBD
- **Investments / retirement (401k, ESOP, Robinhood, others):** TBD (Robinhood account exists per email; 401k via 2RM presumably)
- **Debt:** TBD
- **Mortgage / housing situation:** TBD

---

## Trajectory

- **Goal BGD MRR by end of 2026:** $10,000/month
- **Current BGD MRR:** ~$5,500/month (normalized)
- **Gap to close:** ~$4,500/month over 6 months
- **Pipeline (as of 2026-06-29):**
  - Refuge Sales (Thomas Rindfuss): $425/mo — proposal sent, awaiting signature
  - Russell / Revolution (manufacturer site): $1,000+ — re-engaged 2026-06-29
  - ISF renegotiation (Cooper at Hatch): $600-800/mo — need to pitch flat monthly
  - Co-Line Manufacturing re-engagement: $300-400/mo — on todo list
  - BrandOS dealer feature layer ($20/dealer): $120+ (grows) — concept stage
  - Net-new clients (1-2): $400-1,000 — prospecting
- **Pipeline total if closed:** ~$2,845-3,645/mo, putting BGD at $8,400-9,100 range. 1-2 net-new clients closes the gap to $10K.
- **At $10K BGD MRR:** net BGD contribution ~$7,500-8,200/mo after scaled operating costs. Strategic milestone — "BGD is structurally serious" — not "I can survive without 2RM." With partner income, the latter bar is much lower than the former.
- **Honest exit-from-2RM bar (revised with household context):** ~$8-12K/mo BGD MRR if partner carries primary household and her benefits can cover Justin/family healthcare. Could be lower if partner's coverage is comprehensive. The $20-25K/mo bar from earlier reasoning was too high — that assumed Justin's 2RM was sole household income.
- **Target separation from 2RM:** even with household income reducing pressure, ESOP appreciation alone (~$130K/yr at planning rates) is a meaningful argument to stay through the $600/share window. Hybrid mode (2RM + BGD) is the right pattern for the next 2-4 years.
- **Channel platform standalone economics target:** when the platform alone (not BGD's other client work) sustains Justin's portion of household + benefits + ESOP-forgone offset, that's the moment 2RM becomes optional. Today the platform-only MRR is ~$1,950/mo. The path to standalone economics is multi-year platform-growth, not months.

**Reframe of the $10K MRR goal:** Less about "exit feasibility" and more about "BGD is real." It's the milestone that proves the productization thesis. It removes pressure from MRR growth as financial necessity and lets the platform be built thoughtfully rather than chase dollars.

---

## Conflict-of-interest considerations (2RM ↔ channel platform)

The platform serves the same customer profile 2RM serves. Worth being intentional about boundaries even though the work is structurally complementary (infrastructure vs creative services).

Open questions to resolve:

- 2RM's moonlighting / outside work policy — what's actually allowed?
- IP boundaries — anything Justin builds for BGD (especially the manager app + platform code) needs clean separation from 2RM IP
- Customer-overlap policy — if a 2RM client ever becomes a BGD platform prospect, what's the right path?
- ESOP / employee handbook references on this topic — worth knowing before scaling the platform play

Not urgent today. Worth resolving before the platform takes a manufacturer customer that 2RM also serves.

---

## How the AIOS should use this

- Priority #3 business plan target-setting anchors against BGD MRR + intended replacement of 2RM income (if that's the goal).
- Risk-tolerance calls (e.g., "freeze new custom client work to focus on productization") should weigh against 2RM cushion. With strong W-2, more aggressive moves are sustainable.
- Real-time decisions (e.g., "is this $1,500 trip worth it?") should consider both BGD operating margin and personal liquidity, not just business cash flow.
- Long-term wealth conversations should include the ESOP component, not just MRR.

---

*Document version: v1 — 2026-05-03. Numbers TBD pending Justin's input.*
