# BrandOS Development Prompt Scoping — Exact Implementation Details

## 1. Route Definitions with Meta Fields

**File:** `/Users/justinlobaito/repos/brandos/client/src/main.js` (lines 23–200+)

**Router meta pattern:**
```javascript
meta: {
  layout: 'admin-shell' | 'portal' | 'login' | 'portal-public',
  requiresAdminAuth: true,           // Admin routes only
  requiresDealerAuth: true,          // Portal routes only
  section: 'dashboard' | 'assets' | 'parts' | 'orders' | 'support' | 
           'marketing_materials' | 'hub_knowledge',  // Feature-gated sections
}
```

**Portal route examples:**
```javascript
{
  path: '/portal/dashboard',
  name: 'portal-dashboard',
  component: () => import('./views/PortalDashboard.vue'),
  meta: { layout: 'portal', requiresDealerAuth: true, section: 'dashboard' },
}

{
  path: '/portal/marketing',
  name: 'portal-marketing',
  component: () => import('./views/PortalMarketing.vue'),
  meta: { layout: 'portal', requiresDealerAuth: true, section: 'marketing_materials' },
}

{
  path: '/portal/marketing/wizard',
  name: 'portal-creative-wizard',
  component: () => import('./views/PortalCreativeWizard.vue'),
  meta: { layout: 'portal', requiresDealerAuth: true, section: 'marketing_materials' },
}
```

**Fallback sections (MM-11):**
```javascript
const FALLBACK_SECTIONS = Object.freeze({
  dashboard: true,
  assets: true,
  parts: true,
  orders: true,
  support: true,
  marketing_materials: false,
  hub_knowledge: false,
});
```

---

## 2. Portal Component Structure Example

**File:** `/Users/justinlobaito/repos/brandos/client/src/components/portal/WizardBucketCard.vue`

Large iconic selection card pattern:
```vue
<template>
  <button
    type="button"
    class="wbc"
    :class="{ 'wbc--selected': selected }"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span v-if="selected" class="wbc__check" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="7" fill="currentColor" />
        <path
          d="M4 7l2 2 4-4"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>

    <WizardIcon :name="icon" :size="32" class="wbc__icon" aria-hidden="true" />
    <span class="wbc__name">{{ name }}</span>
    <span v-if="subtitle" class="wbc__subtitle">{{ subtitle }}</span>
  </button>
</template>

<script setup>
import WizardIcon from './WizardIcon.vue';

defineProps({
  icon: { type: String, required: true },
  name: { type: String, required: true },
  subtitle: { type: String, default: '' },
  selected: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

<style scoped>
.wbc {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-7) var(--space-5) var(--space-6);
  min-height: 160px;
  background: var(--color-bg-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color var(--portal-duration-fast) var(--portal-easing),
    background var(--portal-duration-fast) var(--portal-easing),
    box-shadow var(--portal-duration-fast) var(--portal-easing);
}

.wbc:hover {
  border-color: color-mix(in srgb, var(--portal-accent) 40%, var(--color-border));
  box-shadow:
    var(--portal-shadow-card),
    0 4px 16px rgba(0, 0, 0, 0.08);
}

.wbc:focus-visible {
  outline: 2px solid var(--portal-accent);
  outline-offset: 3px;
}

.wbc--selected {
  border-color: var(--portal-accent);
  background: color-mix(in srgb, var(--portal-accent) 8%, transparent);
}

.wbc__check {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--portal-accent);
}

.wbc__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: color var(--portal-duration-fast) var(--portal-easing);
}

.wbc:hover .wbc__icon {
  color: var(--portal-accent);
}

.wbc--selected .wbc__icon {
  color: var(--portal-accent);
}

.wbc__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  line-height: 1.3;
}

.wbc__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.4;
}
</style>
```

---

## 3. Design Tokens (CSS Variables)

**File:** `/Users/justinlobaito/repos/brandos/client/src/style.css` (lines 1–45)

**Color palette:**
```css
:root {
  /* Neutral ramp (light → dark) */
  --color-bg: #F6F8F9;
  --color-bg-surface: #FFFFFF;
  --color-bg-hover: #EEF1F3;
  --color-border: #DEE4E8;
  --color-text: #222E40;
  --color-text-muted: #5E6B76;
  --color-ink: #111A2E;
  --color-ink-deep: #0A1120;

  /* Accent — Mint Signal (actions, focus, live/synced) */
  --color-accent: #08CE96;
  --color-accent-hover: #06A276;
  --color-accent-soft: #DFF7F0;

  /* Secondary — Steel (supporting UI, metadata) */
  --color-secondary: #38596E;
  --color-secondary-soft: #E1E9ED;

  /* Semantic */
  --color-success: #08CE96;
  --color-warning: #E6A817;
  --color-danger: #E5533C;
  --color-info: #38596E;

  /* Typography */
  --font-head: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'Space Mono', 'JetBrains Mono', 'Fira Code', monospace;

  /* Radii (brand spec) */
  --radius: 11px;
  --radius-card: 14px;
  --radius-lg: 20px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-topbar: 0 1px 0 var(--color-border);
}
```

**Portal-specific tokens** (from `portal.css`):
```css
--portal-accent: <tenant-specific #rrggbb>
--portal-accent-hover: <tenant-specific #rrggbb>
--portal-accent-text: <tenant-specific #rrggbb>
--portal-duration-fast: 150ms
--portal-duration-base: 250ms
--portal-easing: cubic-bezier(0.16, 1, 0.3, 1)
--portal-shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--portal-radius-nav: 8px
--portal-sidebar-width: 264px
--portal-sidebar-collapsed-width: 56px
--portal-topbar-height: 64px
```

---

## 4. Onboarding Endpoint Details

**File:** `/Users/justinlobaito/repos/brandos/server/routes/onboarding.js` (lines 20–36)

**POST /api/onboarding/import** (admin-only):
```javascript
router.post('/onboarding/import', requireAuth, (req, res) => {
  const raw = req.body?.payload;  // Field name: payload
  let payload = raw;
  if (typeof raw === 'string') {
    try { payload = JSON.parse(raw); }
    catch (err) { return res.status(400).json({ error: 'Payload is not valid JSON: ' + err.message }); }
  }
  // ... validation & storage
});
```

**Expected payload structure** (from Netlify Forms `_payload`):
- Generated dynamically from form fields
- Validated by `importSubmission()` in `services/onboarding.js`
- Returns `{ id, status: 'pending', submission: {...} }`

**Related endpoints:**
- `GET /api/onboarding/pending` — list pending submissions
- `GET /api/onboarding/submission/:id` — fetch one submission + generated spoke.config.json
- `POST /api/onboarding/submission/:id/approve` — create site + auto-generate design.md
- `POST /api/onboarding/submission/:id/reject` — archive without creating site

---

## 5. PortalShell Sidebar Navigation Structure

**File:** `/Users/justinlobaito/repos/brandos/client/src/components/portal/PortalSidebar.vue` (lines 132–156)

**Navigation items definition (NAV_ITEMS):**
```javascript
const NAV_ITEMS = [
  { to: '/portal/dashboard', label: 'Dashboard', icon: 'dashboard', section: 'dashboard' },
  { to: '/portal/assets', label: 'Brand Assets', icon: 'assets', section: 'assets' },
  { to: '/portal/parts', label: 'Parts Catalog', icon: 'parts', section: 'parts' },
  { to: '/portal/orders', label: 'My Orders', icon: 'orders', section: 'orders' },
  { to: '/portal/support', label: 'Support', icon: 'support', section: 'support' },
  { label: 'Notifications', icon: 'notifications', disabled: true, comingSoon: true },
  { label: 'Training', icon: 'training', disabled: true, comingSoon: true },
  { label: 'Community', icon: 'community', disabled: true, comingSoon: true },
];
```

**Marketing Assist conditional swap (MM-11):**
```javascript
const visibleNavItems = computed(() => {
  const items = NAV_ITEMS.filter((item) => !item.section || enabledSections.value[item.section]);
  items.push(
    enabledSections.value.marketing_materials
      ? { to: '/portal/marketing', label: 'Marketing Assist', icon: 'marketing', section: 'marketing_materials' }
      : { label: 'Marketing Assist', icon: 'marketing', disabled: true, comingSoon: true },
  );
  return items;
});
```

**Role-gated Administration group (D-08):**
```javascript
const ADMIN_ROLES = ['admin', 'tenant_admin', 'tenant_user', 'dealer_admin'];
const showAdministration = computed(() => ADMIN_ROLES.includes(portalUser.value?.role));

const TENANT_MGMT_ROLES = ['admin', 'tenant_admin', 'tenant_user'];
const showTenantManagement = computed(() => TENANT_MGMT_ROLES.includes(portalUser.value?.role));

const ORG_SETTINGS_ROLES = ['admin', 'tenant_admin'];
const showOrgSettings = computed(() => ORG_SETTINGS_ROLES.includes(portalUser.value?.role));
```

**Section injection pattern:**
```javascript
const enabledSections = inject(
  'portalEnabledSections',
  computed(() => ({
    dashboard: true, assets: true, parts: true, orders: true, support: true,
    marketing_materials: false, hub_knowledge: false,
  })),
);
```

---

## 6. Feature Toggle Pattern (Section Gating)

**Implementation:** MM-11 uses two layers:

**1. Client-side (UX convenience, not authoritative)**
- Router guard checks `meta.section` against `enabledSections`
- Redirects to dashboard if section disabled
- Fallback values when tenant fetch not yet resolved

**2. Server-side (authoritative enforcement)**
- `requireSection` middleware blocks API access
- Response includes enabled/disabled state
- Admin controls via `enabled_sections` on tenant model

**Section gate in route meta:**
```javascript
{
  path: '/portal/marketing',
  meta: { 
    layout: 'portal', 
    requiresDealerAuth: true, 
    section: 'marketing_materials'  // ← gated on this section
  },
}
```

**Navigation rendering:**
```vue
<PortalNavItem
  v-if="enabledSections.marketing_materials"
  to="/portal/marketing"
  label="Marketing Assist"
  icon="marketing"
/>
```

---

## 7. Callout / Banner / Card Component Patterns

**Existing patterns:**

**WizardBucketCard.vue** (see section 2 above):
- Large selection button with icon, title, subtitle
- Selected state: check badge + accent border + tinted background
- Uses tenant-specific `--portal-accent` color

**LaunchRailCard.vue** (`/Users/justinlobaito/repos/brandos/client/src/components/launch/LaunchRailCard.vue`):
- Status card displayed in rail
- Pattern TBD (file exists, implementation pattern needed)

**Structure conventions:**
- Scoped styles with `.component-class__element--modifier` BEM pattern
- Use CSS variables (`--color-*`, `--space-*`, `--portal-*`) exclusively
- Semantic HTML (`button`, `nav`, `article`) for accessibility
- Transitions via `var(--portal-duration-fast)` + `var(--portal-easing)`
- Focus-visible outlines: `outline: 2px solid var(--portal-accent)`

---

## 8. Component File Locations

**Portal components:** `/Users/justinlobaito/repos/brandos/client/src/components/portal/`
- `PortalShell.vue` — main layout wrapper
- `PortalSidebar.vue` — sidebar nav (section-gated)
- `PortalTopBar.vue` — top bar with branding/auth
- `PortalNavItem.vue` — nav item component
- `PortalDrawer.vue` — modal drawer
- `CopilotDrawer.vue` — Claude Code copilot drawer
- `WizardStepIndicator.vue` — step progress
- `WizardBucketCard.vue` — card component
- `WizardThemeRow.vue` — theme selector
- `WizardIcon.vue` — icon utility

**Portal views:** `/Users/justinlobaito/repos/brandos/client/src/views/`
- `PortalDashboard.vue`
- `PortalAssets.vue`
- `PortalParts.vue`
- `PortalOrders.vue`
- `PortalCart.vue`
- `PortalCheckout.vue`
- `PortalSupport.vue`
- `PortalMarketing.vue`
- `PortalCreativeWizard.vue`
- `PortalMyCreatives.vue`
- `PortalAdminMarketing.vue`
- `PortalMarketingReview.vue`
- `PortalHubKnowledge.vue`
- `PortalBrand.vue` (dealer_admin+ only)
- `PortalUsers.vue` (dealer_admin+ only)
- `PortalTenantAssets.vue`, `PortalTenantParts.vue`, `PortalOrgSettings.vue` (admin tabs)

**Backend routes:** `/Users/justinlobaito/repos/brandos/server/routes/`
- `onboarding.js` — `/api/onboarding` endpoints
- `portal-auth.js` — dealer login/logout (httpOnly)
- `portal-tenant.js` — tenant config + theming
- `portal-assets.js`, `portal-parts.js`, `portal-orders.js`, `portal-support.js`
- `admin-*.js` — admin CRUD endpoints

---

## 9. Key Composables

**File:** `/Users/justinlobaito/repos/brandos/client/src/composables/`

- `usePortalAuth.js` — httpOnly cookie auth, `portalUser` state
- `usePortalTheme.js` — tenant theming, `loadTheme()` fetch, accent token resolution
- `useCart.js` — cart state, `itemCount` computed
- `useUiMode.js` — dark/light mode toggle

---

## 10. Implementation Notes

1. **Always use design tokens** from `style.css` — no hardcoded colors
2. **Section gating** is MM-11: add `section: '...'` to meta, check `enabledSections` in render
3. **Portal accent** is dynamically set per tenant: use `var(--portal-accent)`, never hardcode hex
4. **Role gating** uses `portalUser.value?.role`: check against `ADMIN_ROLES`, `TENANT_MGMT_ROLES`, `ORG_SETTINGS_ROLES`
5. **Navigation items** are injected via `provide()` — extend `NAV_ITEMS` to add routes
6. **API calls** require `meta.requiresDealerAuth: true` for httpOnly cookie validation
7. **Test with dev account:** `dealer@dealer.com` (password: from `.env`)
8. **Run tests before commit:** `npm test`
