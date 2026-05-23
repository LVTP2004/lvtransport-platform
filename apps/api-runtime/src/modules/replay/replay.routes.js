import express from "express";
import { listEvents } from "../events/event-store.service.js";

const router = express.Router();

function buildReplayState(events) {
  const state = {
    ok: true,
    eventCount: events.length,
    lastEventAt: null,
    counters: {},
    incidents: [],
    runtime: {
      healthConfirmed: false,
      lastHealth: null
    }
  };

  for (const event of events) {
    state.lastEventAt = event.createdAt;
    state.counters[event.type] = (state.counters[event.type] ?? 0) + 1;

    if (String(event.type).includes("FAILED")) {
      state.incidents.push(event);
    }

    if (event.type === "RUNTIME_HEALTH_CONFIRMED") {
      state.runtime.healthConfirmed = true;
      state.runtime.lastHealth = event.payload?.health ?? null;
    }
  }

  return state;
}

router.get("/", (_req, res) => {
  const events = listEvents()
    .slice()
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  res.json({
    ok: true,
    replayedAt: new Date().toISOString(),
    state: buildReplayState(events)
  });
});

export default router;
