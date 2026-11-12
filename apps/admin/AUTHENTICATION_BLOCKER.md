# Founder Cockpit: authentication dependency

The render gate and every operational data batch require a verified admin or
super_admin session. Authentication failure, missing identity/role, changed
token, expiration or cancellation prevents operational requests. These checks
are policy and sequencing; they do not implement an identity provider.

## Concrete blocker at the reviewed head

Source revision: `f5031f1edb0c63e341092f3a7b0f42504d6acd1e`.

- `packages/auth/src/providers/firebase-auth.provider.ts` returns fixed runtime
  tokens, a synthetic session and profile. It is not a real Firebase Auth client.
- `apps/admin/src/firebase/index.ts` composes an architecture descriptor.
- `packages/realtime/src/core/firebase-app.ts` only returns metadata.
- `packages/realtime/src/auth/preparation.ts` explicitly returns `mode: placeholder`.
- Admin/auth package manifests do not install a real Firebase Auth SDK or
  initialize one. The example environment is not evidence of deployed config.

No usable real provider exists in that branch to connect. Adding configuration
values alone cannot make these placeholders authenticate a user. Consequently
`VERIFIED_FIREBASE_PROVIDER_NOT_IMPLEMENTED` remains a blocking requirement;
the login is intentionally unavailable, including for real administrators.
The disabled-login P1 is **not claimed resolved** by this containment.

## Required integration before enabling login

Provide and review a real Firebase Auth integration initialized for the intended
project/application, with its public client configuration and enabled sign-in
method. Assign admin/super_admin roles through an authoritative trusted process,
not a form field, browser storage or a client-decoded unsigned token. Bind the
verified user, token, role and expiry; define refresh, sign-out and revocation.
Verify matching token and role enforcement on the API server separately.

No credentials, SDK dependencies, deployment configuration or endpoints are
invented here. No local staged authentication changes from other work are
imported. Do not enable a UI flag or reuse demo tokens to bypass this blocker.
Tests use synthetic reader doubles to establish request ordering and denial;
they do not establish an operational login or live server authorization.
