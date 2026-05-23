import express from "express";
import { createPayment, getPayment, listPayments, markPaymentPaid } from "./payments.service.js";
const router = express.Router();
router.get("/", (_req, res) => res.json(listPayments()));
router.post("/", (req, res) => res.status(201).json(createPayment(req.body ?? {})));
router.get("/:id", (req, res) => {
  const payment = getPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: "payment_not_found" });
  res.json(payment);
});
router.post("/:id/capture", (req, res) => {
  const payment = markPaymentPaid(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: "payment_not_found" });
  res.json(payment);
});
export default router;
