# MONI API MAP

## Local PC

Moni Copilot API:
- Port: 4010
- Source: apps/moni-dashboard/server.js
- URL: http://192.168.241.149:4010

Web UI:
- Port: 5173
- Source: apps/web
- URL: http://192.168.241.149:5173

Booking Event Server:
- Port: 3100
- Source: packages/realtime/src/booking-event-server.cjs
- Route: /api/bookings

API Candidate:
- Port: 8080 currently listening
- Canonical app source: apps/api
- Canonical prefix: /api/v1

## VPS

Founder UI:
- Port: 3005
- URL: http://51.222.107.59:3005/founder

Control Tower:
- Port: 3020
- URL: http://51.222.107.59:3020

## Conflict

Port 4010 appears in:
- apps/moni-dashboard/server.js
- moni-core/founder/api/server.js

Decision:
- 4010 = Moni Copilot / Dashboard API
- Founder Runtime API must move to another port if both run together.

## Canonical Rule

Moni speaks through:
1. Moni Copilot API
2. Founder OS evidence
3. LVTP API /api/v1
4. Booking Event Server when booking events are involved

No direct production execution.

## Port Resolution

Resolved:
- 4010 = Moni Copilot / Dashboard API
- 4011 = Founder Runtime API

Reason:
Avoid port collision between Moni Dashboard and Founder Runtime.
