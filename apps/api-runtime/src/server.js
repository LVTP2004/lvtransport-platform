import express from "express";
import cors from "cors";
import bookingsRoutes from "./modules/bookings/bookings.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import eventStoreRoutes from "./modules/events/event-store.routes.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const startedAt = new Date().toISOString();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, mode: "api-runtime", service: "lvtransport-api", startedAt, uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get("/api/v1/health", (_req, res) => res.json({ ok: true, mode: "api-runtime", api: "v1", timestamp: new Date().toISOString() }));
app.get("/api/v1/startup-validation", (_req, res) => res.json({ ok: true, mode: "api-runtime", checks: { http: "ok", runtime: "ok", source: "boot-repair" } }));

app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/events", eventStoreRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: "not_found", path: req.path }));

app.listen(port, "127.0.0.1", () => console.log(`LVTransport API runtime listening on 127.0.0.1:${port}`));
