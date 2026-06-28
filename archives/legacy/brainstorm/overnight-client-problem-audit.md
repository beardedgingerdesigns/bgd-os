# Overnight Client Problem Audit: AI Opportunities Across BGD's Portfolio

**Generated:** 2026-05-28
**Purpose:** Identify specific, practical business problems AI could solve for existing BGD clients. Ground every opportunity in the client's actual operations, not hypothetical theory.
**How to use this:** Pick the 2-3 highest-leverage opportunities. Build a one-pager pitch for each. Bring them to the next client touchpoint.

---

## 1. Co-Line Manufacturing

**Website:** colinemfg.com
**Current BGD relationship:** $75/mo maintenance. Website redesign stalled. Employment process needs and internal intranet workflows discussed.
**What they do:** Advanced metal fabrication out of Lynnville, Iowa (rural central Iowa). Full-service shop: CNC machining (Makino HMCs, Haas 5-axis VMCs, Mazak dual-spindle lathes), robotic welding (25 Fanuc Arc Mate robots, 5 Fanuc CRX cobots), CNC bending, laser cutting, metal stamping, tube bending, tool and die, finishing/powder coating. They serve OEMs and manufacturers worldwide. Tagline: "We Shape The Metal That Moves The World." This is a serious operation with millions in equipment.
**Estimated size:** 150-300 employees based on equipment list and facility campus. Multiple buildings on a campus in Lynnville.

### Problem 1: Employment Application Processing and Screening
**The pain:** Manufacturing in rural Iowa means constant hiring competition. Skilled welders, CNC operators, and machine operators are hard to find. Their website has employment needs but no visible careers portal. Paper or email applications mean HR staff manually screens, sorts, and follows up. Every day a position sits empty costs production capacity.

**The solution:** AI-powered employment pipeline. Online application form that feeds into an AI screening layer. Candidates scored on relevant experience (welding certs, CNC experience, shift availability). Automated follow-up emails. Interview scheduling. Integration with their existing HRIS if they have one. Weekly digest to HR of top candidates per open role.

**Complexity:** Medium
**What they'd pay:** $300-500/mo
**Pitch angle:** "You're already paying me to maintain the site. Let me turn it into a hiring machine. We build an application system that screens candidates overnight so your HR team walks in Monday with a ranked list instead of a pile."

### Problem 2: RFQ Response Automation
**The pain:** Custom metal fabrication means every new customer inquiry is a Request for Quote. Someone (probably an estimator or sales engineer) reads the specs, looks at drawings, figures out which machines/processes are needed, estimates hours, and writes a quote. This is slow, inconsistent between estimators, and backlogs kill deals.

**The solution:** AI-assisted quoting intake. Customer uploads drawings/specs through a web form. AI extracts key parameters (material, thickness, quantity, tolerances, processes needed). Pre-populates a quote template with suggested pricing based on historical jobs. The estimator reviews and adjusts rather than building from scratch. Cuts RFQ turnaround from days to hours.

**Complexity:** Complex (requires integration with their quoting/ERP system and training on historical data)
**What they'd pay:** $750-1,500/mo (this directly accelerates revenue)
**Pitch angle:** "Every day a quote sits in the queue is a day that customer might go to a competitor. What if we cut your response time by 60%?"

### Problem 3: Internal Knowledge Base / Intranet Assistant
**The pain:** Justin already knows they have intranet workflow needs. A 200+ person manufacturing operation generates tribal knowledge: machine setup procedures, quality specs per customer, safety protocols, onboarding docs. If it's scattered across shared drives, binders, and people's heads, new hires ramp slowly and mistakes repeat.

**The solution:** AI-powered internal knowledge assistant. Ingest existing docs (SOPs, quality manuals, machine setup sheets, customer specs). Employees ask questions in plain English ("What's the setup procedure for the Makino A81NX for part #4472?") and get immediate, sourced answers. Add a feedback loop so the shop floor can flag outdated info.

**Complexity:** Medium
**What they'd pay:** $500-800/mo
**Pitch angle:** "You told me you need intranet workflows. Instead of building a static intranet that nobody reads, let me build one that answers questions. Your best machinist's knowledge doesn't walk out the door when they retire."

### Problem 4: Quality Inspection Reporting
**The pain:** AWS-certified welding and tight-tolerance CNC work means quality documentation is mandatory. Inspection reports, first-article inspections, material certs. Probably being done on paper or basic spreadsheets. Audits require pulling records.

**The solution:** Digital quality capture with AI-assisted reporting. Mobile-friendly inspection forms. AI flags anomalies in measurement data. Automatic report generation for customer deliverables. Searchable history for audits. Photo documentation with AI-tagged defect categories.

**Complexity:** Medium-Complex
**What they'd pay:** $400-700/mo
**Pitch angle:** "Next time a customer audit comes around, you pull every inspection record in 30 seconds instead of 3 days."

### Problem 5: Production Scheduling Visibility
**The pain:** With that many machines (25+ robots, 10+ CNC machines, multiple saws, presses, lasers), scheduling is a nightmare. Jobs compete for machine time. Rush orders disrupt the plan. Shop floor supervisors probably track this on whiteboards or basic spreadsheets.

**The solution:** AI-assisted production dashboard. Not a full MES replacement, but a lightweight scheduling assistant that ingests the current job list, machine availability, and due dates, then recommends sequencing. Flags conflicts before they happen. Sends alerts when a job is at risk of missing its ship date.

**Complexity:** Complex
**What they'd pay:** $1,000-2,000/mo
**Pitch angle:** Save this for later. This is a Phase 2 conversation after trust is built with simpler wins.

---

## 2. Kirk Financial / Wild Rose Casino & Resort

**Websites:** wildroseresorts.com (live, BGD-built), thermalkitchen.com (BGD-built, launching June)
**Current BGD relationship:** $1,000/mo for Wild Rose redesign, $300/mo for Thermal Kitchen. Active build. Aaron Harn is the key contact at Kirk Financial/Wild Rose Corporate. Brian Diver (Kirke LLC) is the investor.
**What they do:** Kirk Financial is the parent entity. Wild Rose Casino & Resort operates three casino/hotel properties in Iowa: Emmetsburg, Clinton, and Jefferson. Each has a casino floor, hotel, restaurants (including 7's Casino Bar), and event spaces. Also owns Thermal Kitchen, a co-manufacturing facility for shelf-stable liquid nutrition (retort processing, spouted pouches, SQF/FDA/USDA certified). Also has Lucky's restaurant (microsite coming after Wild Rose launch).
**Estimated size:** 500-800 employees across three casino properties plus Thermal Kitchen operations.

### Problem 1: Multi-Property Promotion Management and Automation
**The pain:** This is visible on the website right now. Three properties, each with overlapping and unique promotions. Cash Confetti drawings, Dollar Dogs, 10X Slot Points, Last Dash for Cash, Tier It Up Tuesday. Someone (probably Krystal Light or Meghan Wymore) manually creates promotion entries, coordinates across properties, updates dates. The 5/21 walkthrough confirmed: they killed date-based scheduling for promos and went to a single text field because calendar logic was too complex. Three separate ticketing platforms on the backend. This is a content coordination nightmare.

**The solution:** AI-powered promotion lifecycle manager. Promotion templates with property-specific overrides. AI generates promotional copy variations per property. Automated social media post drafts when promotions go live. Calendar-aware scheduling that accounts for property-specific events. Monthly promotion performance summary pulling from whatever analytics they have.

**Complexity:** Medium
**What they'd pay:** $500-800/mo
**Pitch angle:** "Meghan is updating three properties worth of promotions by hand. What if we built a system where she enters a promotion once, AI adapts it per property, and social media drafts write themselves?"

### Problem 2: Casino Employee Scheduling and Turnover Reduction
**The pain:** Casinos have notoriously high employee turnover (industry average 25-35% annually). Three properties means three sets of floor staff, dealers, hotel staff, food service, security. Scheduling across shifts is complex. New hire onboarding is constant.

**The solution:** AI-assisted onboarding and retention system. Automated onboarding sequences for new hires (property-specific training materials, compliance docs, scheduling preferences). AI monitors tenure patterns and flags at-risk employees (missed shifts, schedule change requests). Exit interview analysis to identify systemic issues. Not a full HRIS, but a smart layer on top of whatever they use.

**Complexity:** Medium-Complex
**What they'd pay:** $600-1,000/mo
**Pitch angle:** "Every employee who quits in the first 90 days costs you $3-5K to replace. What if we caught the warning signs at day 30?"

### Problem 3: Guest Experience / Loyalty Program Intelligence
**The pain:** Wild Rose has a Club Wild loyalty program and players cards. Maro Post requires Player ID for email marketing (confirmed in the 5/21 walkthrough, which is why they killed the email signup feature). They have the data but probably aren't doing much AI-driven analysis on player behavior, visit frequency, or cross-property patterns.

**The solution:** AI-powered player behavior analysis. Weekly digest: which players are visiting less frequently (churn risk), which are increasing spend (upsell opportunity), which visit one property but never the others (cross-property promotion targets). Auto-generated personalized offers based on play history. Tie into the Maro Post email system they already have.

**Complexity:** Complex (requires access to their player tracking system)
**What they'd pay:** $1,000-2,000/mo (directly ties to revenue)
**Pitch angle:** "You already have the player data. You already have Maro Post. Let me connect them with AI that tells you which 50 players you're about to lose and what offer brings them back."

### Problem 4: Thermal Kitchen Lead Qualification Pipeline
**The pain:** Thermal Kitchen is repositioning from "emerging brands" to mid-to-large nutrition manufacturers. Phase 2 of the website project (June) already includes HubSpot integration for lead qualification. This is a natural AI extension.

**The solution:** AI-powered lead scoring and qualification. When a potential client fills out the contact form, AI analyzes their company (size, product type, volume needs) against Thermal Kitchen's ideal customer profile. Auto-routes hot leads to Deann for immediate follow-up. Generates a pre-call brief for each qualified lead (company background, likely needs, competitive landscape). Post-submission nurture sequence with AI-personalized content based on their product category (broth vs. baby food vs. hydration).

**Complexity:** Medium (natural extension of the Phase 2 HubSpot work)
**What they'd pay:** $400-600/mo (bundle with HubSpot Phase 2)
**Pitch angle:** "We're already wiring HubSpot in June. For a little more, every lead that comes in gets automatically scored and Deann gets a one-page brief before she picks up the phone."

### Problem 5: Cross-Property Event and Entertainment Coordination
**The pain:** Three properties booking entertainment separately. The 5/21 walkthrough confirmed: entertainment stays separate per property because people already show up at the wrong casino. Three different ticketing platforms. No shared calendar intelligence.

**The solution:** Internal entertainment coordination dashboard. AI analyzes booking patterns, suggests complementary acts across properties (don't book competing genres on the same weekend). Automated social media and email promotion for upcoming shows. Post-event attendance analysis. Eventually: dynamic ticket pricing based on demand signals.

**Complexity:** Medium
**What they'd pay:** $400-600/mo
**Pitch angle:** "You're booking three venues in three towns. Let me give you a single view of what's working, what's conflicting, and what to promote harder."

---

## 3. Terraplex Ag

**Website:** terraplexag.com (BrandOS platform)
**Current BGD relationship:** $600/mo hub subscription + ~$1,350/mo across 6 dealer subscriptions (Pyro Ag, Black Knight, New Heights, Great River, Truss Services, Superior Drone). Total Terraplex network MRR: ~$1,950/mo. This is the BrandOS flagship client.
**What they do:** Agricultural technology distributor with a dealer network across the Midwest. They distribute precision ag products (drones, sensors, application technology). Hub-and-spoke model: Terraplex is the brand/distributor, dealers are local operators who sell and service.
**Estimated size:** Small HQ team (5-15), dealer network of 6+ independent operators.

### Problem 1: Dealer Marketing Material Generation
**The pain:** Confirmed by two dealers independently. Pyro Ag asked for marketing material outlines and trade show guidelines. New Heights asked for templated marketing assets and trade show booth packages. Dealers are independent businesses who need brand-approved marketing materials but don't have marketing departments. Dakota Fest (mid-August) is a hard deadline for Pyro.

**The solution:** AI-powered marketing material generator inside the BrandOS dealer portal. Dealer logs in, selects template type (trade show banner, social post, email campaign, product sheet), inputs their local details (dealer name, service area, upcoming events), and AI generates brand-compliant materials using Terraplex's style guide and product info. Includes trade show planning toolkit: booth layout suggestions, talking points, lead capture forms.

**Complexity:** Medium (natural BrandOS extension; Justin already has the design infrastructure)
**What they'd pay:** $150-250/mo per dealer (rolls into existing dealer subscription as a tier upgrade) or $400/mo to Terraplex hub
**Pitch angle:** "Pyro and New Heights both asked for the same thing unprompted. Your dealers need marketing support. BrandOS can generate it on demand instead of you creating it by hand for each dealer."

### Problem 2: Seasonal Campaign Coordination
**The pain:** Agriculture is deeply seasonal. Spring planting, summer application, fall harvest, winter planning. Dealers need to run campaigns at the right time for their geography. Terraplex HQ (Cherity) probably sends email blasts or makes calls, but there's no automated campaign calendar that accounts for regional planting dates, dealer-specific inventory, or local events.

**The solution:** AI campaign planner integrated into BrandOS. Pre-built seasonal campaign templates that auto-adapt to dealer geography (planting zones, local event calendars). Cherity sets the master campaign; AI generates dealer-specific versions with local product availability and pricing. Automated email sequences that fire based on agricultural calendar triggers (e.g., "corn planting window opens in your area").

**Complexity:** Medium
**What they'd pay:** $300-500/mo to Terraplex hub
**Pitch angle:** "Every spring your dealers need to run the same campaigns but with local flavor. What if BrandOS generated the campaigns and scheduled them automatically based on planting zones?"

### Problem 3: Dealer CRM Automation (HubSpot Integration)
**The pain:** Justin has admin access to Terraplex's HubSpot dealer CRM. The CRM exists but the workflows are probably manual. Dealer lead assignment, follow-up sequences, territory management. Cherity coordinates dealer outreach but it's likely ad-hoc.

**The solution:** AI layer on top of HubSpot. Automated lead routing based on territory and product interest. AI-generated follow-up email drafts for Cherity to review before sending to dealers. Monthly dealer performance digest (leads generated, conversion rate, active campaigns). Stale-lead alerts when a dealer hasn't followed up in X days.

**Complexity:** Medium (HubSpot API is well-documented)
**What they'd pay:** $400-600/mo
**Pitch angle:** "You already have HubSpot. I already have admin access. Let me make it actually work for you instead of just storing contacts."

### Problem 4: Product Update Distribution
**The pain:** When Terraplex adds a new product or updates pricing, every dealer needs to know. Every dealer website needs to reflect it. Right now this is probably manual email notifications and individual site updates.

**The solution:** BrandOS product catalog sync. Terraplex updates product info once in the hub; AI generates dealer-specific product pages, social media announcements, and email notifications. Dealer sites auto-update. Product comparison sheets generated on demand. Seasonal product spotlight recommendations based on regional demand patterns.

**Complexity:** Simple-Medium (natural BrandOS platform feature)
**What they'd pay:** Bundled into hub subscription; justifies a $100-200/mo increase
**Pitch angle:** "Update a product once. Every dealer site, every dealer inbox, every marketing piece updates automatically."

---

## 4. NPS Media Group

**Website:** npsmediagroup.com
**Current BGD relationship:** $200/mo for Partners For Sight maintenance, $125/mo for Door Is A Jar Magazine. NPS is the agency; BGD is their web vendor for specific clients.
**What they do:** Multi-channel marketing agency specializing in subscription marketing, direct mail, telemarketing, email marketing, list management, media buying, and fulfillment. Their clients are primarily publishers and media companies (Cahaba Media Group, UK publishers like Paragraph Publishing/Chelsea Magazine/Immediate Media). They manage 16+ UK magazine titles in the US market. Core differentiator: data-driven subscription optimization. They handle everything from paid media campaigns to physical fulfillment of subscription orders.
**Estimated size:** 15-40 employees based on service breadth and client portfolio.

### Problem 1: Client Reporting Automation
**The pain:** NPS manages campaigns across multiple channels (email, telemarketing, direct mail, paid media) for each client. Their case studies cite metrics like "49% lower CPO" and "4.1% conversion rate." Someone is pulling these numbers, building reports, and presenting them to clients. With 16+ titles across 5 UK publishers alone, plus domestic clients, that's a lot of reporting.

**The solution:** AI-powered client reporting dashboard. Pulls data from email platforms, telemarketing logs, direct mail response tracking, and paid media dashboards. Auto-generates monthly performance reports with trend analysis, anomaly detection, and optimization recommendations. Client-facing portal where publishers can see their metrics in real time.

**Complexity:** Medium-Complex (depends on data source integrations)
**What they'd pay:** $500-1,000/mo
**Pitch angle through Natalie:** "You're already pulling these numbers for case studies. What if the reports wrote themselves every month and your team spent that time optimizing instead of compiling?"

### Problem 2: Subscription Churn Prediction
**The pain:** NPS improved retention rates from mid-40% to mid-80% for their UK publisher clients. They're clearly good at retention. But they're probably doing it with manual analysis and experience rather than predictive models.

**The solution:** AI churn prediction engine. Analyze subscriber behavior patterns (open rates, engagement, payment history, subscription age) to predict which subscribers are likely to cancel. Auto-trigger targeted retention campaigns (discounts, content previews, re-engagement emails) before the subscriber actually churns. Works across all their publisher clients.

**Complexity:** Complex (requires access to subscriber data across clients)
**What they'd pay:** $800-1,500/mo (directly impacts their clients' revenue, which impacts NPS's value)
**Pitch angle:** "You got retention from 40% to 80%. AI can get you from 80% to 90% by catching the cancellers before they cancel."

### Problem 3: Direct Mail Optimization
**The pain:** NPS does significant direct mail (tip-on campaigns, physical mailings). Direct mail is expensive per piece. List quality and targeting directly impact ROI. Their case study shows 3.8% response rate and $1.80 CPO on tip-ons, but optimization is probably done by experienced humans reviewing past campaign data.

**The solution:** AI-powered direct mail targeting. Analyze past campaign response data to build predictive models for which list segments respond to which offers. Optimize send timing, offer type, and creative per segment. A/B test recommendations generated by AI. Reduce waste by suppressing low-probability segments.

**Complexity:** Medium
**What they'd pay:** $400-800/mo
**Pitch angle:** "Every piece of mail you don't send to someone who won't respond is pure margin. AI can find those savings in your list data."

### Problem 4: Partners For Sight Donor/Supporter Engagement Automation
**The pain:** Partners For Sight is a foundation supporting publications for the visually impaired. They run on grants, donations, and supporter engagement. Elizabeth, Soja, and Matt manage this with limited staff. Donor communication, grant application tracking, and event coordination are likely manual.

**The solution:** AI-assisted donor engagement platform. Automated thank-you sequences. Grant deadline tracking with AI-assisted application drafts. Donor lapse detection (someone who gave last year but hasn't this year). Newsletter content suggestions based on foundation activities. Accessibility-first design (critical for a vision-impairment foundation).

**Complexity:** Simple-Medium
**What they'd pay:** $200-400/mo (nonprofit budget constraints)
**Pitch angle through NPS:** "Partners For Sight is doing donor engagement by hand. For a small monthly add, we can automate the follow-ups and catch lapsed donors before they're gone."

---

## 5. Hatch DSM

**Website:** hatchdsm.com
**Current BGD relationship:** Iowa State Fair website ($1,600/mo during fair, $600/mo off-season). 5-6 year tenure through agency owner Cooper.
**What they do:** Creative advertising agency in Des Moines. "Create with purpose." Clients include Iowa State Fair, Boesen (florist), Grand View University, ePlant, DART (Des Moines transit), RC Dermatology. They do brand strategy, campaign creative, digital/social, media buying. Small-to-mid agency focused on purposeful creative.
**Estimated size:** 10-25 employees.

### Problem 1: Iowa State Fair Content and Campaign Automation
**The pain:** The Iowa State Fair is an 11-day event in August that requires months of preparation and generates massive traffic spikes. The fair-eve ritual involves spinning up load balancers, second servers, and cache. Content updates are constant during the fair. Camping reservations have a complex annual cycle (files from John Moore in October, testing in April, go-live in May, close in June). Contest entries, event schedules, food vendors, concerts. The volume of content that needs to flow through the site during fair time is enormous.

**The solution:** AI-powered fair content pipeline. Pre-fair: AI generates social media post schedules from the event calendar, drafts vendor/exhibitor communications, auto-formats sponsor content for the site. During fair: AI monitors site performance and auto-scales caching, generates daily recap content from social media activity, auto-responds to common visitor questions (parking, hours, event locations). Post-fair: automated post-event reports, sponsor performance summaries, early planning triggers for next year.

**Complexity:** Medium
**What they'd pay:** $500-800/mo (seasonal, could be higher during July-August ramp)
**Pitch angle to Cooper:** "Every August your team is in war mode for 11 days. What if AI handled the content grind, the social media scheduling, and the common questions so your people could focus on the creative and the relationships?"

### Problem 2: Camping Reservation Support Automation
**The pain:** The camping system at the Iowa State Fair has recurring bugs: duplicate emails, address-change login issues. John Moore sends files 10/20/30/40/50 through a manual process starting in October. There's a test cycle in April and go-live around May 1. This is a predictable annual pain point that involves manual data handling and generates support tickets.

**The solution:** AI-powered camping support chatbot + data validation layer. Chatbot handles common camping questions (reservation status, payment confirmation, site map, check-in procedures). AI validation layer catches duplicate entries and address mismatches before they become bugs. Automated email sequences for reservation confirmations, reminders, and check-in instructions. Reduces support volume for John Moore and the ISF team.

**Complexity:** Simple-Medium
**What they'd pay:** $300-500/mo
**Pitch angle:** "John Moore's camping files are the same cycle every year with the same bugs. Let me build a smart layer that catches the duplicates, handles the common questions, and lets John focus on exceptions."

### Problem 3: Agency Workflow Automation for Hatch
**The pain:** Small agencies run on people-hours. Cooper's team is doing client management, creative briefing, campaign trafficking, reporting, and billing across multiple clients. Every manual handoff between strategy, creative, and media is a potential delay or error.

**The solution:** AI-assisted agency workflow. Creative brief generation from client meeting notes (integrate with meeting transcription). Automated campaign trafficking checklists. AI-generated first-draft copy and social posts for client review. Weekly client status reports auto-generated from project management tools. Media buy reconciliation and optimization alerts.

**Complexity:** Medium-Complex (agency workflows vary widely)
**What they'd pay:** $400-700/mo
**Pitch angle:** "I've been working with your team for 5+ years on the ISF site. I see how the sausage gets made. What if I helped automate the parts that don't need a creative brain?"

### Problem 4: Sponsor Performance Intelligence (ISF-specific)
**The pain:** The Iowa State Fair has sponsors. Sponsors want to know their ROI. Currently this is probably manual reporting based on attendance, impressions, and whatever analytics are available.

**The solution:** AI-powered sponsor dashboard. Real-time sponsor visibility metrics during the fair (page views on sponsor-tagged content, social mentions, foot traffic data if available). Post-fair sponsor report auto-generated with AI narrative ("Your brand reached X fairgoers, drove Y website visits, generated Z social mentions. Recommended optimizations for next year: ..."). Makes sponsorship renewal conversations data-driven.

**Complexity:** Medium
**What they'd pay:** $300-500/mo (seasonal, July-September)
**Pitch angle:** "Sponsors are the fair's revenue engine. Give them a dashboard that shows their money working in real time. They'll renew faster and pay more."

---

## 6. IowaEverywhere

**Website:** iowaeverywhere.com (Craft CMS, BGD-built)
**Current BGD relationship:** $250/mo maintenance + hosting. V2 planning conversations in progress.
**What they do:** Locally owned Iowa sports podcast network. Since 2022, they've amassed 5+ million podcast downloads and 500K+ hours of content consumed across YouTube, social media, and podcast platforms. All digital. Shows include Overthinking (77 episodes), Buckets (17 episodes), and others. Hosts are prominent Iowa sports media personalities. Connected to Cyclone Fanatic (Chris Williams) and Des Moines Business Record/BPCSN (Lawrence Cunningham).
**Key people:** Matt Van Winkle (ops), Aiden Wyatt (content), Jon (leadership).
**Estimated size:** 3-8 core team + network of hosts/personalities.

### Problem 1: Podcast Content Repurposing Pipeline
**The pain:** Iowa Everywhere produces a high volume of podcast and video content across multiple shows. Each episode is a goldmine of clips, quotes, and social media moments. But extracting those requires someone to listen to the full episode, identify the highlights, clip them, write captions, and post across platforms. With multiple shows producing weekly, this is a full-time job they probably don't have.

**The solution:** AI content repurposing engine. Episode audio/video uploaded. AI transcribes, identifies key moments (hot takes, breaking news reactions, funny exchanges), auto-generates: short-form video clips with captions (TikTok/Reels/Shorts), pull quotes for social media, episode summaries for the website, SEO-optimized show notes. Matt and Aiden review and approve instead of creating from scratch.

**Complexity:** Medium
**What they'd pay:** $400-600/mo
**Pitch angle:** "You're sitting on 5 million downloads worth of content. Every episode has 3-5 social media moments you're leaving on the table. AI can find them, clip them, and write the captions. Your team just hits publish."

### Problem 2: Advertising Sales Intelligence and Rate Card Automation
**The pain:** Iowa Everywhere needs ad revenue to grow. Selling podcast ads requires: knowing your audience demographics, download numbers per show, listener geography, and competitive rates. Building proposals for advertisers is manual. Tracking which sponsors are on which shows is probably a spreadsheet.

**The solution:** AI-powered ad sales toolkit. Automated audience insights dashboard pulling from podcast hosting platforms and YouTube analytics. AI-generated sponsor proposals customized per advertiser (matching their target demo to the right shows). Rate card optimization based on download trends. Sponsor delivery reports auto-generated at campaign end. CRM-lite: track sponsor conversations, renewals, and pipeline.

**Complexity:** Medium
**What they'd pay:** $300-500/mo
**Pitch angle:** "You need ad revenue to grow the network. Let me build you a sales toolkit that makes every sponsor proposal look like a million bucks and takes 10 minutes instead of 2 hours."

### Problem 3: Episode Transcript SEO and Search
**The pain:** Already identified in the brainstorm doc for the May 11 meeting. Podcast content is invisible to search engines. Thousands of hours of Iowa sports analysis with no SEO footprint. Someone searching "Iowa State basketball recruiting analysis" finds written articles, not IowaEverywhere podcasts.

**The solution:** AI-powered transcript pipeline. Every episode auto-transcribed. AI generates structured show notes with keywords, timestamps, guest bios, and topic tags. Published to the Craft CMS site as searchable, indexable content. Internal site search across all episodes. Long-tail SEO captures search traffic for niche Iowa sports topics that written media doesn't cover well.

**Complexity:** Simple-Medium (transcription APIs are mature; Craft CMS integration is Justin's wheelhouse)
**What they'd pay:** $200-350/mo
**Pitch angle:** "You have 5 million downloads but zero SEO footprint from that content. Every episode is a blog post waiting to happen. AI transcribes it, structures it, and publishes it. You start showing up in Google for every Iowa sports topic your hosts cover."

### Problem 4: Sponsor Self-Service and Contest Infrastructure
**The pain:** Also flagged in the brainstorm doc. Sponsors likely want to run contests, giveaways, and promotions through the network. Currently this probably requires manual coordination between the sponsor, the show host, and Matt's team. No self-service.

**The solution:** Sponsor portal on the IowaEverywhere site. Sponsors log in, configure a contest or giveaway (rules, prizes, duration, target show), and AI generates the promotional copy, social posts, and host talking points. Contest entries collected on-site. Winner selection automated. Post-contest report delivered to sponsor.

**Complexity:** Medium
**What they'd pay:** $250-400/mo (or commission on sponsor revenue generated through the portal)
**Pitch angle:** "Make it dead simple for a local car dealership or restaurant to run a contest on your network. They log in, set it up, and you get paid. No back-and-forth emails."

### Problem 5: Network Analytics Dashboard
**The pain:** Multiple shows, multiple platforms (Apple Podcasts, Spotify, YouTube, social media). Matt and the team are probably checking 5-10 different dashboards to understand how the network is performing. No single view.

**The solution:** Unified analytics dashboard. Pulls from podcast hosting, YouTube, and social platforms. Shows per-show and network-wide metrics: downloads, watch time, audience growth, top episodes, platform distribution. AI generates weekly insight emails ("Buckets had a 40% download spike after the Pollard episode. Consider booking more AD guests. Overthinking's YouTube is growing faster than audio; invest in video thumbnails.").

**Complexity:** Medium
**What they'd pay:** $200-350/mo
**Pitch angle:** "You're checking 8 different apps to figure out how the network is doing. Let me give you one dashboard and a weekly AI email that tells you what's working and what to do about it."

---

## Priority Matrix: Where to Start

| Client | Best First Pitch | Revenue Potential | Relationship Strength | Timing |
|---|---|---|---|---|
| **Wild Rose / Kirk Financial** | Promotion management automation | $500-800/mo new + upsell path | Strong (active build, trust established) | After June launch |
| **Terraplex Ag** | Dealer marketing material generator | $400/mo hub + $150/dealer tier upgrade | Strongest (BrandOS flagship) | Now (Dakota Fest deadline) |
| **IowaEverywhere** | Content repurposing pipeline | $400-600/mo | Good (V2 conversations active) | Now (V2 planning window) |
| **Co-Line Manufacturing** | Employment pipeline AI | $300-500/mo + redesign restart | Dormant (needs reactivation) | Within 30 days |
| **Hatch DSM** | ISF content/campaign automation | $500-800/mo seasonal | Established (5+ year history) | June (pre-fair planning) |
| **NPS Media Group** | Client reporting automation | $500-1,000/mo | Indirect (via Partners For Sight) | Opportunistic |

### Recommended Sequence

1. **Terraplex (NOW):** The dealer marketing material ask is confirmed by two dealers. Dakota Fest deadline forces action. This is a natural BrandOS platform extension that makes the whole product more valuable. Pitch it in the Friday 5/30 call.

2. **IowaEverywhere (NOW):** V2 planning is already in motion. Content repurposing and transcript SEO are the highest-leverage features to fold into V2 scope. These directly increase the network's ad revenue potential, which makes Justin's $250/mo feel cheap.

3. **Wild Rose (JUNE):** Don't distract from the active redesign. After launch, pitch the promotion management automation as a "Phase 3" add-on. Aaron already trusts Justin's judgment. Thermal Kitchen's HubSpot Phase 2 is also a natural entry for the AI lead qualification pitch.

4. **Hatch DSM (JUNE):** Pre-fair planning starts in June. Pitch Cooper on ISF content automation and the camping support bot. This is a seasonal ramp that could expand into year-round agency workflow help.

5. **Co-Line (JULY):** Use the employment pipeline as the hook to reactivate the stalled redesign conversation. "Forget the redesign for now. Let me solve your hiring problem and we'll talk about the site later."

6. **NPS Media Group (OPPORTUNISTIC):** The relationship runs through Partners For Sight and is relatively thin. Build NPS-specific trust by delivering well on the existing work. Watch for an opening when Natalie mentions reporting pain or client churn.
