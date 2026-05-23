import { PaymentStatus } from "../../contracts/runtime-contracts.js";
import { getRecord, listRecords, setRecord } from "../persistence/memory-store.js";
export function createPayment(input = {}) {
  const now = new Date().toISOString();
  return setRecord("payments", { id: `payment_${Date.now()}`, bookingId: input.bookingId ?? null, amountMinor: Number(input.amountMinor ?? 0), currency: input.currency ?? "EUR", status: PaymentStatus.PENDING, provider: input.provider ?? "runtime", createdAt: now, updatedAt: now });
}
export function listPayments() { return listRecords("payments"); }
export function getPayment(id) { return getRecord("payments", id); }
export function markPaymentPaid(id) {
  const payment = getPayment(id);
  if (!payment) return null;
  payment.status = PaymentStatus.PAID;
  payment.updatedAt = new Date().toISOString();
  return setRecord("payments", payment);
}
