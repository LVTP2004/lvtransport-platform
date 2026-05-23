import express from "express";
import { listEvents, recordEvent } from "./event-store.service.js";
const router = express.Router();
router.get("/", (_req, res) => res.json(listEvents()));
router.post("/", (req, res) => res.status(201).json(recordEvent(req.body?.type ?? "CUSTOM_EVENT", req.body?.payload ?? {})));
export default router;
