# Project State: Mr Gym Online Store

**Updated:** 2026-06-12 | **Status:** On track

## Accomplishments (this session)

- Clarified that POC is a static design reference, not directly Shopify-usable code, and locked the porting strategy: Dawn theme base + theme settings + custom CSS layer + Google Fonts + custom Liquid sections
- Established the five-step build process: Partners account → dev store → local theme dev via Shopify CLI → review with Bradley → handover to his Basic plan
- Created two decision documents (0017 & 0018) locking the implementation path (Dawn + custom sections) and build environment (BGD Partners account, free dev store, CLI-driven local dev)
- Created session source document capturing the build process rundown and discrepancies discovered
- Recovered missing POC homepage (`index.html`) from Netlify; verified POC is complete and ready to serve as design reference

## Current Status

The POC is recovered and verified as the complete v4 design reference. The build path, development workflow, and account structure are fully locked. Ready to begin theme scaffolding and custom section development.

## Next Steps

- [ ] Create free Shopify Partners account for Bearded Ginger Designs
- [ ] Spin up free development store from Partners dashboard
- [ ] Install Shopify CLI and scaffold Dawn theme into repo
- [ ] Port design tokens from `DESIGN.json` into theme: color scheme, 0px border-radius, shadows
- [ ] Add Google Fonts (Big Shoulders Display, Archivo, Space Mono) to `theme.liquid`
- [ ] Build custom Liquid sections for hero, manifesto band, lookbook grid
- [ ] Load dev store with real product content (tee designs from `poc/assets/`)

## Blockers

None.

## Key Dates

- 2026-06-12: Build path and development environment locked; POC recovered and verified