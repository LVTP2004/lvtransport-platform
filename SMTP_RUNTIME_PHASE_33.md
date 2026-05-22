# LVTP Phase 33 — SMTP Runtime Configuration

## Date
2026-05-16

## Status
SMTP runtime variables were added to PM2 environment.

## Required Variables
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS

## Current Result
- productionWarnings no longer reports SMTP missing.
- Booking creation remains operational.
- Real email delivery requires the valid mailbox password for info@lvtransport.be.

## Operational Note
Do not commit SMTP passwords to GitHub.
Keep SMTP credentials only in the server runtime environment or a secure secret manager.
