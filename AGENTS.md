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

## Long Description

The world is full of delightful things that elevate our mood and give us hope.  These are the small, white, fluffy things. Though they may be important they are not consequential. They are fleeting, passing fancies.  A tiny cloud.  A tiny dog.  A dollop of foam. A wayward plastic bag. A hair-do passing you on the street.  An SWFT is an idea; a spontaneous something that brushes the backs of your ankles and reminds you that life is fleeting yet always completely full- a tingle of excitement, a tremor of joy, a glimpse of bliss.  Therefore a SWFT doesn’t have to be small, or white, or fluffy.  It just has to be whatever makes you feel that tiny burst of anticipation of wonderfulness.  Therefore a SWFT can be a poodle or a pitbull, a dandelion puff floating through the air or a rain drop hitting a puddle.  It’s whatever brings you that feeling that the world is actually more full of unexpected pleasure than predictable doldrums, more full of delight than depression. When that feeling invigorates you, whether by petting a kitten or kenning an idea, place a dot on your map and remove the construct of mandated rectilinear space and instead soften the landscape with playful memory. If you wish to make a note or add a photo-fantastic!  if you wish to share, thank you in advance!  If you wish only to look at other fluffs and floofs, or to see where others have had so much joy feel free to browse.  But most importantly touchstone your enjoyment of time and space and let the dots remind you of the fullness of the world . Today has the potential, always, to show you more than you anticipate if you participate in looking for it.