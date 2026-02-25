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

- Target: working prototype in a single session
- Keep it simple — avoid premature abstraction
- No custom backend server needed initially; Supabase handles persistence and broadcast
- Architecture chosen to accommodate future backend services on DO App Platform
