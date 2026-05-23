import express from "express";
import { listEvents } from "../events/event-store.service.js";

const router = express.Router();

router.get("/", (_req, res) => {
  const events = listEvents();

  res.json({
    ok: true,
    count: events.length,
    timeline: events
      .slice()
      .sort((a, b) =>
        String(a.createdAt).localeCompare(String(b.createdAt))
      )
      .map((event, index) => ({
        sequence: index + 1,
        id: event.id,
        type: event.type,
        createdAt: event.createdAt,
        payload: event.payload ?? {}
      }))
  });
});

export default router;
