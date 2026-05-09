# Auth & User Management Architecture

This document defines architecture-only preparation for `apps/web`, `apps/admin`, `apps/driver`, and `apps/api`.

## Coverage
- Customer, Driver, Admin accounts
- RBAC roles + permission model
- Session + token lifecycle policy (access/refresh)
- Protected route and auth state patterns
- Firebase auth provider adapter (placeholder)
- Google, Apple, email/password onboarding-ready contract
- Password reset / account verification contract
- Onboarding flow state model
- User/driver/business/VIP profile models
- Admin secure actions + audit logging preparation
- Future-ready flags for MFA, biometric login, trusted devices, fraud prevention, KYC, driver document verification, suspension

## Package Layout
- `packages/auth`: shared enums, user/session/onboarding models, provider interface, RBAC maps, token policy, Firebase provider stub, auth service façade.
- `apps/*/src/modules/auth`: app-specific auth state hooks, client service, route guards.
- `apps/api/src/auth`: middleware structure (`authenticate`, `authorize`), access-control service, provider registry.

## Security Notes
- No real OAuth/Firebase implementation added.
- No secrets/keys stored.
- `authorize` middleware currently no-op placeholder to be wired after persistence/user lookup implementation.
