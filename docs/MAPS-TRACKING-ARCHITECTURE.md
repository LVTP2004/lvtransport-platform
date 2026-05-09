# Maps & Live Tracking Architecture Preparation

This document defines architecture-only preparation for Google Maps integration and realtime tracking across:

- `apps/web`
- `apps/admin`
- `apps/driver`
- `apps/api`
- `packages/maps`

## Scope

Prepared abstractions (no production integrations yet):

- Google Maps provider interface
- Places autocomplete abstraction
- Distance matrix abstraction
- Geocoding abstraction
- Directions abstraction
- Driver live tracking models
- Customer live tracking models
- Route visualization models
- ETA calculator interface
- Route synchronization models
- Trip coordinate lifecycle
- Live trip sessions
- Realtime map event naming conventions

## Non-goals

- No production API keys
- No real Google Maps API requests
- No real GPS stream ingestion
- No production navigation implementation
- No payment flows

## Design Notes

- A provider abstraction (`MapProvider`) isolates third-party vendor logic.
- A stub provider (`StubGoogleMapsProvider`) allows UI/backend integration without network coupling.
- Shared models are placed in `packages/maps/src/models` to enforce consistency.
- Event naming follows `map.<entity>.<action>` for predictable realtime streams.
- Trip route, ETA, and route sync are modeled separately to support recalculation and future geofencing.
