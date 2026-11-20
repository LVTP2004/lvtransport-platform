# LVTransport — LiveKit private call pilot (local only)

Research spike for a **two-person browser audio/video call** using LiveKit, with passenger/driver roles **only as labels**. It is deliberately isolated from real LVTransport accounts, bookings, assignments, tracking, apps, deployment and MONI authority.

## Architecture

`browser tabs → localhost:8799 pilot token server → localhost:7880 LiveKit development server → WebRTC media`.

The Node token server uses only built-in APIs and HS256 JWT signing. All issued tokens are limited to the fixed room `lvtp-video-lab`, are valid for 10 minutes, and cannot administer rooms. **Pilot tokens are not authenticated as real passenger/driver identities**: anyone with local access can choose either label. No user data or API credentials are stored in code.

## Start the local lab (two terminals)

Requirements: Node 20+; an independently installed `livekit-server` binary; internet access to load the pinned LiveKit browser SDK version (2.23.0) from CDN. Installation of the LiveKit server is an **operator decision**, not part of this PR. Follow https://docs.livekit.io/transport/self-hosting/local/ and check downloaded binaries before running.

Terminal 1:

```sh
livekit-server --dev
```

This development-only server uses `devkey` and `secret`, intentionally insecure and unsuitable for production.

Terminal 2, inside this directory:

```sh
LIVEKIT_PILOT_DEV=1 LIVEKIT_URL=ws://127.0.0.1:7880 \
LIVEKIT_API_KEY=devkey LIVEKIT_API_SECRET=secret node server.mjs
```

Open `http://127.0.0.1:8799` in two browser tabs on the **same computer**. Select **Pasajero de prueba** in one and **Conductor de prueba** in the other. Join both, then enable mic/camera intentionally. A camera may not be usable from two tabs concurrently. Chromium/Firefox on localhost should allow media device permission prompts; allow explicitly when testing. Stop both servers with Ctrl+C.

## Automated tests

```sh
node --test server.test.mjs
node --check server.mjs
node --check client.js
```

These tests validate JWT scoping, local-only token API, rejects, and static assets. They **do not** prove a successful real media session; manually test two browsers or two tabs with LiveKit running. Do not count browser SDK delivery as verified offline; it requires the CDN.

## Security and production boundary

- Pilot Node HTTP only binds `127.0.0.1:8799`; allowed LiveKit URL is only `ws://127.0.0.1:7880`. No VPS, Nginx, DNS, TLS, ports, auth, workspace, or production modifications.
- Local LiveKit dev credentials are not secure; never expose the development server to the internet or use these tokens on `lvtransport.be`. The server does not log JWTs.
- This lab deliberately has **no real identity validation**. Production must issue short-lived room-scoped tokens from LVTransport's authenticated API after verifying both identities, the specific booking, participant role, consent and call lifecycle. Add expiry/revocation, rate limits and auditing.
- Production also requires TLS/WSS, ICE/TURN and firewall planning, privacy/retention policy, accessibility, connection failure handling, and test coverage on actual devices and networks.
- The client JavaScript SDK is loaded from a version-pinned third-party CDN in this local lab. Before production, bundle and review the dependency under the existing package-manager policy, with version lock and supply-chain checks.
- No recording, AI agent dispatch, storage of conversations or booking integration; those require separate review and permission.
- The repo AGENTS.md/spec lock prohibits fake bookings, fake ride codes, auth overrides, altering operational frontend or VPS deployment. This PR changes none of these.

## Gate for next phase

1. Verify genuine two-way video/audio between the two local participants with consent and device permissions.
2. Design API-side authenticated authorization for booking-bound room issuance (do not implement without review).
3. Then integrate a call UI into existing Ride/Driver components with explicit product acceptance, separate approvals and no silent production deploy.
