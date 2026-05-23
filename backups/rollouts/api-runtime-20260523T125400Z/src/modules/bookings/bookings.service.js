import { BookingStatus } from "../../contracts/runtime-contracts.js";
import { getRecord, listRecords, setRecord } from "../persistence/memory-store.js";
export function createBooking(input = {}) {
  const now = new Date().toISOString();
  return setRecord("bookings", { id: `booking_${Date.now()}`, status: BookingStatus.PENDING, pickup: input.pickup ?? null, destination: input.destination ?? null, customerName: input.customerName ?? null, createdAt: now, updatedAt: now });
}
export function getBooking(id) { return getRecord("bookings", id); }
export function listBookings() { return listRecords("bookings"); }
