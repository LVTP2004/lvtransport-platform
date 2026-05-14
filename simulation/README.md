# Moni Ride Experimental Simulation Sandbox

This folder contains a **standalone and fully isolated** experimental environment for Moni Ride.
It is explicitly separated from production LV Transport Platform (LVTP) workloads.

## Isolation Guarantees

- Uses only local mock JSON data under `/simulation`.
- No dependency on production database, production API, or live routing systems.
- No real payment operations.
- No real customer contact.
- No hooks into `lvtransport.be` or `app.lvtransport.be` routes.

## Structure

- `clients/`: simulated customer persona definitions.
- `bookings/`: mock booking objects and state changes.
- `scenarios/`: operational event scripts (normal and failure flows).
- `agents/`: Moni Ride behavioral policy and fallback rules.
- `memory/`: lightweight in-memory profile/history simulation.
- `metrics/`: scoring and operational readiness model.
- `logs/`: generated run logs for timeline replay.
- `ui/`: premium black/gold SaaS-like dashboard mockup.

## Run the simulation

```bash
node simulation/run-simulation.mjs
```

This command generates:

- `simulation/logs/latest-run.json`
- `simulation/logs/latest-run-summary.md`

## Optional UI preview

Open `simulation/ui/index.html` in a browser. The UI reads local mock datasets and visualizes:

- conversation timeline
- booking timeline
- operational feed
- metrics cards

## Tower Twin Preparation

The simulation model already reserves control points for:

- **Moni Assistant supervisor** handoff
- **Leo IA metrics monitor** ingestion
- fallback takeover path testing

For this phase, only `Moni Ride` is configured as active.
