# LVTP Production API Reality Map

## Current Production API

Active runtime API is currently:

/var/www/lvtransport-api/server.js

PM2 process:
lvtransport-api

Runtime data directory:
/var/www/lvtransport-api/data

Backup created:
/home/ubuntu/backups/lvtransport-api-data/data-20260516-110409

## Important Finding

The production API is currently a standalone API, separate from the monorepo API source located at:

/home/ubuntu/lvtransport-platform/apps/api

## Migration Rule

Do not overwrite or replace the standalone production API directly.

Migration must be gradual:

1. preserve production data
2. map standalone API features
3. compare with monorepo API modules
4. migrate route by route
5. validate health checks
6. validate booking persistence
7. only then switch runtime source

## Confirmed Production Features

- booking creation
- pricing estimate
- customer storage
- customer account storage
- dashboard aggregation
- PM2 runtime
- persistent data folder
- backup available

## Next Technical Goal

Create a safe migration bridge from standalone production API to monorepo API without losing data or breaking bookings.
