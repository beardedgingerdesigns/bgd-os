# IowaEverywhere podcast network

Compiled 2026-05-02 from Gmail IowaEverywhere threads, UptimeRobot alerts, and Bonsai invoices.

## What it is

IowaEverywhere (iowaeverywhere.com) is an Iowa-based podcast network. Justin manages the Craft CMS website at $250/month (maintenance + hosting). It's a multi-show network with local Iowa content. Cyclone Fanatic (Iowa State sports coverage) has a connection through Chris Williams (ChrisMWilliams@cyclonefanatic.com).

Site fetch returned 403 during the overnight sweep. Live state not confirmed via automated access.

## Stakeholders

| Person | Contact | Role |
|---|---|---|
| Matt Van Winkle | matt@iowaeverywhere.com | Day-to-day ops, content requests |
| Aiden Wyatt | aiden@iowaeverywhere.com | Appears to manage show content/entries |
| Jon (last name unclear) | jon@iowaeverywhere.com | Leadership, planning |
| Jon Liebl | jon@lieblmg.com | CC'd on planning session thread |
| Chris Williams | ChrisMWilliams@cyclonefanatic.com | Cyclone Fanatic, network partner |
| Lawrence Cunningham | lawrencecunningham@bpcdm.com | Des Moines Business Record / BPCSN |

Additional people Matt wants to add to the planning session: Cade, AD, and Jake (last names/emails not identified in threads).

## 2026 activity log

| Date | Event |
|---|---|
| Mar 15, Mar 17 | Brief uptime incident on iowaeverywhere.com. Resolved within hours. |
| Mar 17, 2026 | New partnership announced: BPCSN (Business Publication Corporation Streaming Network) with Des Moines Business Record. Aiden will build shows in CMS. Justin to build landing page. |
| Mar 25, 2026 | Justin confirmed he'll build the BPCSN landing page. |
| Apr 2, Apr 2 | Another brief uptime incident. Resolved within ~10 min. |
| Apr 9, 2026 | Matt requested contest added ASAP: Win tickets to Nate Bargatze at Casey's Center. Running through Apr 19. Justin turned it around same day. https://www.iowaeverywhere.com/contests/nate-bargatze |
| Apr 21, 2026 | Justin proposed 60-90 min planning/brainstorming session. Referenced the site's two-year anniversary as the timing reason. |
| Apr 21, 2026 | Matt confirmed week of May 11 works, 10am-3pm window preferred. Suggested adding Cade, AD, and Jake. |
| Apr 22, 2026 | Jon confirmed week of May 11. Suggested in-person if possible. |
| Apr 30, 2026 | Brief uptime incident (~15 min). |
| May 1, 2026 | Monthly uptime report - April 2026 received. |
| May 1, 2026 | $250 invoice auto-sent, due May 31. |

## Uptime pattern

Three brief incidents in 2026: Mar 15, Apr 2, Apr 30. All resolved within 20 minutes or less. Not chronic but worth monitoring. The site is hosted on beardedgingerdesigns.com infrastructure (subdomain at iowaeverywhere.beardedgingerdesigns.com was flagged in an April security observation email, likely dev/staging).

## Meeting: week of May 11

Confirmed attendees so far: Justin, Matt, Aiden, Jon (Iowa Everywhere), Jon Liebl, Chris Williams. Matt wants to add Cade, AD, and Jake (likely additional network voices).

Jon suggested in-person if possible.

No specific agenda set yet. Justin framed it as a look ahead for the site's second year.

## Brainstorm preparation: 5 directions for May 11

### 1. BPCSN integration build-out

The Des Moines Business Record partnership is brand new (March 2026) and appears to be just a landing page so far. This is a major network expansion. Pitch: dedicated BPCSN section with individual show pages, episode archives, embedded players (Spotify/Apple iframes), cross-links to Business Record content. Makes Iowa Everywhere a multi-brand podcast home, not just Iowa sports/lifestyle.

### 2. Podcast RSS + distribution indexing

If shows are not individually submitted to Apple Podcasts, Spotify, and Amazon Music, that's a significant distribution gap. Craft CMS can generate episode-specific RSS feeds per show. Structured data markup (Podcast + Episode schema.org) gets episodes indexed by Google as rich results. Low-cost, high-return SEO move. Bring a quick audit to the meeting showing which shows are indexed vs not.

### 3. Episode transcripts for SEO + accessibility

AI transcription of back-catalog is cheap now (Whisper API or equivalent). A 30-minute episode = a 3,000-word searchable page. Full-text search across all episodes. Each episode page becomes a long-form, keyword-rich document. Two-year archive = hundreds of indexed pages. Especially valuable if Cyclone Fanatic content is in there. Sports fans search for specific names, games, topics.

### 4. Host + guest profile system

Craft CMS structured content: each host/guest gets a profile entry. Episodes link to profiles. Profiles link back to episodes. People search their own names. Cross-promotion: a guest on one show appears on the network homepage. This makes Iowa Everywhere feel like a real network, not a collection of RSS feeds with a shared homepage.

### 5. Sponsor infrastructure + contest self-service

They're already doing contests (Nate Bargatze). Build a repeatable system: a contest entry type in Craft that Matt or Aiden can duplicate and launch without Justin's involvement. Separately: a sponsor landing page with network reach stats, show demographics, package options. Allows Iowa Everywhere to sell directly, vs. ad-hoc deal emails. The Des Moines Business Record partnership validates that brands want to be here. Make it easier for the next one to say yes.
