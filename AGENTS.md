# Project: swft

Real-time collaborative map app — users click a map to drop location pins that are instantly visible to all connected clients.

## Stack

**Frontend**
- Leaflet.js for the map (lightweight, free, good click interaction support)
- Vanilla JS (or thin React wrapper if component structure becomes useful)

**Backend**
- Supabase (Postgres + PostGIS + Realtime)

## Why Supabase
- PostGIS for native geospatial storage (lat/lng as `geography` type)
- Built-in WebSocket realtime subscriptions — no polling, no custom Socket.io setup
- Simple JS client for inserts and subscriptions
- Auth can be layered on later without stack changes

## Data Model

```sql
create table clicks (
  id uuid default gen_random_uuid() primary key,
  location geography(Point, 4326),
  created_at timestamptz default now()
);
```

## Flow

1. User clicks map → JS client inserts row into Supabase
2. Supabase Realtime broadcasts the insert to all connected clients
3. Each client receives the new point and drops a marker on the map

## Hosting

- **Platform**: DigitalOcean App Platform
- **Production URL**: swft.herebox.org
- **Frontend**: deployed as a static site component within the DO app
- **Future backend services** (APIs, workers, etc.) will be added as additional components in the same DO app spec, sharing env vars and internal networking

## Dev Workflow

- Local: `vite dev` (or `npx serve` for plain HTML)
- Supabase credentials in `.env.local` (gitignored)
- Deploy: git push to main → DO App Platform auto-builds and deploys

## Dev Notes

- Use 'ergo' for all feature planning, run "ergo --help" to learn it
- Target: working prototype in a single session
- Keep it simple — avoid premature abstraction
- No custom backend server needed initially; Supabase handles persistence and broadcast
- Architecture chosen to accommodate future backend services on DO App Platform

## Design Language

The visual identity should feel like the moment just before a dandelion puff blows away — soft, weightless, quietly joyful. Nothing sharp. Nothing demanding. The map is the experience; the UI is a whisper.

### Colour palette

| Token | Value | Use |
|---|---|---|
| `--swft-white` | `#FFFFFF` | Marker fill, button backgrounds |
| `--swft-surface` | `#FAFAF8` | Very warm near-white, future panel backgrounds |
| `--swft-cloud` | `#C8DCF0` | Sky blue accent, subtle highlights |
| `--swft-sky` | `#D8EEF8` | Toggle-active state, hover backgrounds — pale open sky |
| `--swft-muted` | `#9A8E88` | Icon colour, soft text — never hard black |
| `--swft-stroke` | `rgba(0,0,0,0.10)` | Marker border, button border — barely visible |
| `--swft-shadow` | `rgba(0,0,0,0.08)` | Button drop shadow |

No strong colours. No black. Pure white is reserved for the dots themselves; everything else is tinted or muted.

### Typography

**Nunito** (Google Fonts), weight 300 (Light). Rounded terminals, airy spacing. Load only the woff2, single weight — keep it lean. If Nunito fails to load, fall back to `system-ui, sans-serif`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300&display=swap" rel="stylesheet">
```

Use sparingly — the map is not a text experience. Font appears only in button tooltips, future notes, and attribution.

### Buttons

- **Shape**: pill (`border-radius: 999px`) for multi-icon groups; circle for single actions
- **Size**: 40px × 40px minimum touch target; icon 18px
- **Background**: `--swft-white` with `box-shadow: 0 2px 12px var(--swft-shadow)`
- **Icon colour**: `--swft-muted` at rest
- **Hover**: background → `--swft-sky`; icon darkens to `#5A7A90`
- **Active/toggle ON**: background → `--swft-cloud`; icon → `#3A6A88` (deep sky blue); subtle inner glow
- **Focus ring**: `2px solid rgba(150,200,230,0.6)` for keyboard accessibility
- **Press**: `transform: scale(0.94)` over 100ms
- **Icons**: Phosphor Icons (lightweight SVG set) or Unicode emoji as fallback

### Button placement

Vertical stack, **bottom-right**, 16px from edges, 8px gap between buttons. Sits above Leaflet attribution. Avoids Leaflet's default zoom controls (top-left).

Stack order top → bottom:
1. Auto-follow toggle
2. Go to most recent SWFT
3. Go to current location
4. Clear all SWFTs

### Motion

- **Marker appear**: CSS `opacity 0 → 1` over 400ms `ease-out` — floats in, doesn't snap
- **Button press**: `transform: scale(0.94)` 100ms
- No JS animation library needed — CSS transitions only
- Keep motion subtle; this is not a flashy app

### Map tile (see DONK2Q)

**CartoDB Positron** — near-white base, soft grey roads, no strong colours. Labels are minimal. White markers read clearly against it without competition. URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`

### Additional tech

- CSS custom properties (tokens above) defined in `index.html` `:root` — no build step needed
- One Google Fonts import (Nunito 300, woff2 only)
- No animation library
- No canvas overlay
- Leaflet CircleMarkers render as SVG — the `opacity` fade-in can be applied via CSS on `.leaflet-interactive`

---

## Long Description

The world is full of delightful things that elevate our mood and give us hope.  These are the small, white, fluffy things. Though they may be important they are not consequential. They are fleeting, passing fancies.  A tiny cloud.  A tiny dog.  A dollop of foam. A wayward plastic bag. A hair-do passing you on the street.  An SWFT is an idea; a spontaneous something that brushes the backs of your ankles and reminds you that life is fleeting yet always completely full- a tingle of excitement, a tremor of joy, a glimpse of bliss.  Therefore a SWFT doesn’t have to be small, or white, or fluffy.  It just has to be whatever makes you feel that tiny burst of anticipation of wonderfulness.  Therefore a SWFT can be a poodle or a pitbull, a dandelion puff floating through the air or a rain drop hitting a puddle.  It’s whatever brings you that feeling that the world is actually more full of unexpected pleasure than predictable doldrums, more full of delight than depression. When that feeling invigorates you, whether by petting a kitten or kenning an idea, place a dot on your map and remove the construct of mandated rectilinear space and instead soften the landscape with playful memory. If you wish to make a note or add a photo-fantastic!  if you wish to share, thank you in advance!  If you wish only to look at other fluffs and floofs, or to see where others have had so much joy feel free to browse.  But most importantly touchstone your enjoyment of time and space and let the dots remind you of the fullness of the world . Today has the potential, always, to show you more than you anticipate if you participate in looking for it.