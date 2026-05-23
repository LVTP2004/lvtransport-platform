import express from "express";
import { createBooking, getBooking, listBookings } from "./bookings.service.js";
const router = express.Router();
router.get("/", (_req, res) => res.json(listBookings()));
router.post("/", (req, res) => res.status(201).json(createBooking(req.body ?? {})));
router.get("/:id", (req, res) => {
  const booking = getBooking(req.params.id);
  if (!booking) return res.status(404).json({ ok: false, error: "booking_not_found" });
  res.json(booking);
});
export default router;
