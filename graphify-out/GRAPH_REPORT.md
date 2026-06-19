# Graph Report - .  (2026-06-17)

## Corpus Check
- Corpus is ~33,479 words - fits in a single context window. You may not need a graph.

## Summary
- 218 nodes · 270 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_BrandOS & Channel Platform|BrandOS & Channel Platform]]
- [[_COMMUNITY_BGD Client Portfolio & Dealers|BGD Client Portfolio & Dealers]]
- [[_COMMUNITY_Iowa State Fair Operations|Iowa State Fair Operations]]
- [[_COMMUNITY_Business Priorities & Roadmap|Business Priorities & Roadmap]]
- [[_COMMUNITY_Justin Core Identity & Pains|Justin Core Identity & Pains]]
- [[_COMMUNITY_BGD Pivot & AI Services|BGD Pivot & AI Services]]
- [[_COMMUNITY_AIOS Connections & Integrations|AIOS Connections & Integrations]]
- [[_COMMUNITY_Wild Rose & Thermal Kitchen|Wild Rose & Thermal Kitchen]]
- [[_COMMUNITY_BrandOS Growth & Dealer Sites|BrandOS Growth & Dealer Sites]]
- [[_COMMUNITY_AIOS Architecture & Advisory Board|AIOS Architecture & Advisory Board]]
- [[_COMMUNITY_Financial Position & Employment|Financial Position & Employment]]
- [[_COMMUNITY_ToneQuest Launch|ToneQuest Launch]]
- [[_COMMUNITY_NPS Media Group Clients|NPS Media Group Clients]]
- [[_COMMUNITY_Global Ag Network|Global Ag Network]]
- [[_COMMUNITY_ISF Annual Lifecycle|ISF Annual Lifecycle]]
- [[_COMMUNITY_IowaEverywhere Operations|IowaEverywhere Operations]]
- [[_COMMUNITY_Partners For Sight Contacts|Partners For Sight Contacts]]
- [[_COMMUNITY_Mr Gym Shopify Build|Mr Gym Shopify Build]]
- [[_COMMUNITY_Base 44 to BrandOS Migration|Base 44 to BrandOS Migration]]
- [[_COMMUNITY_Mr Gym Owner & Constraints|Mr Gym Owner & Constraints]]
- [[_COMMUNITY_Personal (Cara Sanders)|Personal (Cara Sanders)]]
- [[_COMMUNITY_Iowa Content Networks|Iowa Content Networks]]
- [[_COMMUNITY_NPS Agency Billing|NPS Agency Billing]]
- [[_COMMUNITY_Mr Gym (orphan)|Mr Gym (orphan)]]
- [[_COMMUNITY_ToneQuest Report (orphan)|ToneQuest Report (orphan)]]

## God Nodes (most connected - your core abstractions)
1. `BrandOS (channel-marketing platform)` - 17 edges
2. `BrandOS dealer migration status (all migrated)` - 10 edges
3. `Terraplex (distributor hub)` - 9 edges
4. `Iowa State Fair (ISF)` - 9 edges
5. `Jon Liebl` - 9 edges
6. `Current Priorities (through end of July 2026)` - 9 edges
7. `BrandOS` - 8 edges
8. `Bearded Ginger Designs (BGD)` - 7 edges
9. `Jon Liebl (LMG, sales channel)` - 7 edges
10. `Financial context` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Site Manager (site-builder-phase2 engine)` --conceptually_related_to--> `BrandOS (channel-marketing platform)`  [INFERRED]
  graphify-input/connections.md → graphify-input/about-business.md
- `Jon Liebl (LMG, sales channel)` --conceptually_related_to--> `Kuberski Brothers`  [INFERRED]
  graphify-input/about-business.md → graphify-input/clients.yaml
- `AI automation service line (BGD pivot)` --conceptually_related_to--> `BGD pivot — solve business problems for mid-market companies`  [INFERRED]
  graphify-input/mem--project_ai_automation_service_line.md → graphify-input/about-business.md
- `2RM ↔ channel platform conflict-of-interest` --references--> `BrandOS (channel-marketing platform)`  [EXTRACTED]
  graphify-input/financials.md → graphify-input/about-business.md
- `Jon Liebl (LMG, sales channel)` --conceptually_related_to--> `Terraplex (distributor hub)`  [INFERRED]
  graphify-input/about-business.md → graphify-input/clients.yaml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **BrandOS dealer network (Terraplex hub + dealers)** — clients_terraplex, clients_pyro_ag, clients_black_knight_drones, clients_new_heights_ag, clients_great_river, clients_truss_services, clients_superior_drone, about_business_brandos [EXTRACTED 1.00]
- **BGD three revenue streams** — about_business_legacy_craft, about_business_brandos, about_business_ai_services [EXTRACTED 1.00]
- **AIOS advisory board roster** — mem_project_advisory_board_status_board, mem_project_advisory_board_status_nate_herk, mem_project_advisory_board_status_matt_pocock, mem_project_advisory_board_status_chris_do [EXTRACTED 1.00]
- **Combined retirement picture (ESOP + 401k)** — financials_esop, financials_401k, financials_2rm_w2 [EXTRACTED 1.00]
- **AI-pivot stress-test client set** — clients_co_line_mfg, clients_kirk_financial, clients_terraplex, clients_nps_media_group, clients_hatch_dsm, clients_iowaeverywhere [EXTRACTED 0.85]
- **AIOS dispatcher operating model** — mem_project_aios_dispatcher_vision_vision, mem_project_aios_dispatcher_vision_two_layer_filter, mem_project_aios_dispatcher_vision_routines, mem_project_aios_ui_staged_ingestion_staged_ingestion [INFERRED 0.85]
- **Iowa State Fair project (overview + tech + ops + contacts)** — mem_project_iowa_state_fair_overview_isf, mem_project_iowa_state_fair_tech_stack_tech_stack, mem_project_iowa_state_fair_fair_time_ops_fair_time_ops, mem_reference_iowa_state_fair_contacts_contacts, mem_project_iowa_state_fair_overview_hatch_dsm [EXTRACTED 1.00]
- **Terraplex BrandOS engagement (Jon, Cherity, intro, model)** — mem_project_jon_liebl_jon_liebl, mem_project_terraplex_brandos_intro_2026_06_09_cherity, mem_project_terraplex_brandos_intro_2026_06_09_brandos_intro, mem_project_terraplex_engagement_model_engagement_model, mem_project_jon_liebl_brandos [EXTRACTED 0.95]
- **Wild Rose / Lucky's / Thermal Kitchen launch sequence** — mem_project_wild_rose_walkthrough_2026_05_21_wild_rose, mem_project_lucky_restaurant_lucky, mem_project_thermal_kitchen_launch_2026_05_thermal_kitchen, mem_project_lucky_restaurant_aaron_harn [INFERRED 0.75]
- **Deploy Answers partnership (Nel + Alex + products)** — mem_project_nel_alex_partnership_status_deploy_answers, mem_project_nel_alex_partnership_status_nel_santiago, mem_project_nel_alex_partnership_status_alex_sdoucos, mem_project_nel_alex_partnership_status_backup_bison, mem_project_nel_alex_partnership_status_clappy [EXTRACTED 1.00]
- **Jon Liebl-Routed BGD Projects** — ref_kuberski_brothers_project_kuberski, ref_wild_rose_project_wild_rose, ref_thermal_kitchen_project_plan_thermal_kitchen_plan, ref_iowaeverywhere_project_iowaeverywhere, ref_revolution_drones_project_revolution_drones [INFERRED 0.85]
- **Justin's Strategic Risk-Tolerance Foundation** — mem_user_2rm_w2_esop_2rm_employment, mem_user_2rm_w2_esop_esop_vgm, mem_user_household_income_household [EXTRACTED 1.00]
- **Terraplex BrandOS Platform Stack** — ref_site_manager_site_builder_phase2, ref_site_manager_terraplex_hub, ref_revolution_drones_project_terraplex, mem_reference_terraplex_hubspot_access_hubspot_dealer_crm, priorities_ship_brandos_launch [INFERRED 0.85]
- **BGD AI-Services Pivot Positioning** — mem_user_core_positioning_translation_layer, mem_user_ai_research_own_work_ai_research_own, mem_user_ai_research_own_work_ai_automation_service_line, priorities_ai_services_pivot [INFERRED 0.85]

## Communities (25 total, 5 thin omitted)

### Community 0 - "BrandOS & Channel Platform"
Cohesion: 0.11
Nodes (28): BrandOS, BrandOS Strategic Brief (May 2026), Jon Liebl, LMG (Jon's marketing-services operation), Springboard Advertising (Terraplex marketing conflict), Terraplex (distributor hub), Alexandra 'Alex' Sdoucos (Doozy Films), Backup Bison (product) (+20 more)

### Community 1 - "BGD Client Portfolio & Dealers"
Cohesion: 0.14
Nodes (24): BrandOS (channel-marketing platform), Deploy Answers (Nel + Alex + Justin), BGD HQ (internal), Black Knight Drones — dealer, Deploy Answers project (Nel + Alex venture), Great River — dealer, Kuberski Brothers, New Heights Ag — dealer (+16 more)

### Community 2 - "Iowa State Fair Operations"
Cohesion: 0.12
Nodes (22): Contest-entry bulk-delete crash rule, Fair Eve Ritual (load balancer + 2nd server + cache), ISF Fair-Time Operations Ritual, ISF Load Balancer / 2-server Fair Mode, Bearded Ginger Designs (BGD), iowastatefairgrounds.org (adjacent site), Hatch DSM (agency), Iowa State Fair (ISF) (+14 more)

### Community 3 - "Business Priorities & Roadmap"
Cohesion: 0.12
Nodes (21): 12-Month Business Plan, Hard Constraint — No New Custom One-Off Craft Projects, Current Priorities (through end of July 2026), Ship BrandOS to Launch State (proof point #1), Inside Out Wellness & Advocacy Redesign, Kuberski Brothers Lawn Care Website, Red Beam (Alex's second rebuild), Thermal Kitchen Phase 2 — HubSpot Funnel Integration (+13 more)

### Community 4 - "Justin Core Identity & Pains"
Cohesion: 0.14
Nodes (17): ICP — B2B manufacturers with dealer networks, Two Rivers Marketing (2RM), AI tooling (Claude Code, project-wiki systems), Core niche — translation layer, Top pain — replying to email, project tracking, Justin Lobaito, Project/task tracking gap (Domain 5), 2RM W-2 income (+9 more)

### Community 5 - "BGD Pivot & AI Services"
Cohesion: 0.18
Nodes (13): AI-powered business solutions, Bearded Ginger Designs (BGD), Jon Liebl (LMG, sales channel), Legacy Craft CMS clients, BGD pivot — solve business problems for mid-market companies, Co-Line Manufacturing, Kirk Financial, Thermal Kitchen redesign (+5 more)

### Community 6 - "AIOS Connections & Integrations"
Cohesion: 0.20
Nodes (11): Bonsai (invoicing/payments), Inside Out Iowa, Google Calendar MCP, Google Drive MCP, Gemini meeting transcripts (Drive folder), Gmail MCP (draft-only), Terraplex onboarding form (Vue 3 + Netlify), Dealer onboarding pipeline (productized tier) (+3 more)

### Community 7 - "Wild Rose & Thermal Kitchen"
Cohesion: 0.24
Nodes (11): Aaron Harn (Wild Rose Corporate), Lucky's Restaurant Site, Daily HubSpot sync for dealer provisioning, Behind the Label (TK resource hub), Deann (TK photographer owner), TK Phase 2 HubSpot integration (blocked on access), Photography critical-path dependency, Thermal Kitchen Launch (2026-06-16) (+3 more)

### Community 8 - "BrandOS Growth & Dealer Sites"
Cohesion: 0.22
Nodes (11): BrandOS 30-Day Growth Plan, Terraplex HubSpot Dealer CRM Access, Revolution Drones (GTEEX Revolution manufacturer site), Terraplex (sole distribution network), Truss Services (dealer launch, logo-blocked), Claude Code Headless Orchestration, Dealer Spoke Site Stack (static HTML + Netlify), Site Manager (site-builder-phase2 / bgd-site-manager) (+3 more)

### Community 9 - "AIOS Architecture & Advisory Board"
Cohesion: 0.22
Nodes (9): AIOS advisory board, Chris Do (advisor), Matt Pocock (advisor), Nate Herk (advisor), Scheduled routines (not manual triggers), Two-layer knowledge filtering (double gate), AIOS dispatcher + strategic partner vision, AIOS UI staged ingestion via raw/aios/ (+1 more)

### Community 10 - "Financial Position & Employment"
Cohesion: 0.32
Nodes (8): 2RM W-2 Employment Cushion, VGM Group ESOP, context/financials.md, BGD AI Automation Service Line, AI Research Is Justin's Own Work, Justin's Core Positioning — Translation Layer, Justin's Household Income & Living Situation, AI Services Pivot (proof point #2) — mapped, parked

### Community 11 - "ToneQuest Launch"
Cohesion: 0.50
Nodes (5): Liz Wilson (ToneQuest owner), PDF-only download fallback (de-risk), Custom PDF Importer (load-bearing build risk), Pelcro (entitlement management), ToneQuest Redesign (launch June 1)

### Community 12 - "NPS Media Group Clients"
Cohesion: 0.50
Nodes (4): Door Is A Jar Magazine, NPS Media Group, Partners For Sight (RDPFS), Unity (Spirituality and Health)

### Community 13 - "Global Ag Network"
Cohesion: 0.67
Nodes (4): Global Ag Network, IowaEverywhere, Delaney Howell (Ag News Daily), Global Ag Network kickoff

### Community 14 - "ISF Annual Lifecycle"
Cohesion: 0.83
Nodes (4): Hatch DSM, Iowa State Fair, ISF 2027 redesign (Craft 5), ISF camping registration annual cycle

### Community 15 - "IowaEverywhere Operations"
Cohesion: 0.50
Nodes (4): Chris Williams (Cyclone Fanatic), IowaEverywhere (year-two brainstorm), Matt Van Winkle (IE ops), IE V2 Agenda (merch, SEO transcripts, BPCSN)

### Community 16 - "Partners For Sight Contacts"
Cohesion: 0.50
Nodes (4): Elizabeth Atkinson (RDPFS), Natalie Sorge (NPS routing), NPS Media Group (agency), Partners For Sight (RDPFS)

### Community 17 - "Mr Gym Shopify Build"
Cohesion: 0.50
Nodes (4): Broken Arrow (local print shop), Mr Gym — Online Store, Dawn Theme + Custom Sections Build Path, Project State: Mr Gym Online Store

### Community 18 - "Base 44 to BrandOS Migration"
Cohesion: 1.00
Nodes (3): Base 44 (no-code platform), BrandOS Website Builder Module, Kuberski Brothers Lawn Care

### Community 19 - "Mr Gym Owner & Constraints"
Cohesion: 0.67
Nodes (3): Bradley Banks (Mr Gym owner), Mr Gym (Shopify apparel store), Mr Gym no-acquisition-channel constraint

## Knowledge Gaps
- **64 isolated node(s):** `Legacy Craft CMS clients`, `AI tooling (Claude Code, project-wiki systems)`, `Inside Out Iowa`, `Wild Rose redesign`, `Thermal Kitchen redesign` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrandOS (channel-marketing platform)` connect `BGD Client Portfolio & Dealers` to `Justin Core Identity & Pains`, `BGD Pivot & AI Services`, `AIOS Connections & Integrations`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Bearded Ginger Designs (BGD)` connect `BGD Pivot & AI Services` to `BGD Client Portfolio & Dealers`, `Justin Core Identity & Pains`, `AIOS Connections & Integrations`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Current Priorities (through end of July 2026)` connect `Business Priorities & Roadmap` to `Financial Position & Employment`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `Legacy Craft CMS clients`, `Core niche — translation layer`, `AI tooling (Claude Code, project-wiki systems)` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BrandOS & Channel Platform` be split into smaller, more focused modules?**
  _Cohesion score 0.10846560846560846 - nodes in this community are weakly interconnected._
- **Should `BGD Client Portfolio & Dealers` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `Iowa State Fair Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._