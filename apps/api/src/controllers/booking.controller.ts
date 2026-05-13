import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { bookingFlowService } from '../modules/bookings/service.js';
import { validateCreateBookingPayload } from '../modules/bookings/validation.js';

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const payload = validateCreateBookingPayload(req.body);
    const idempotencyKey = req.header('x-idempotency-key')?.trim() || `auto-${randomUUID()}`;
    const booking = await bookingFlowService.createBooking(payload, idempotencyKey);

    return res.status(201).json({
      success: true,
      message: 'Booking created',
      booking,
      confirmation: {
        bookingId: booking.id,
        referenceCode: booking.referenceCode,
        status: booking.status,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid booking payload',
    });
  }
};

export const listBookingsController = async (_req: Request, res: Response) => {
  const bookings = await bookingFlowService.listBookings();
  return res.status(200).json({ success: true, bookings });
};

export const updateBookingLifecycleController = async (req: Request, res: Response) => {
  try {
    const booking = await bookingFlowService.updateBookingLifecycle(
      req.params.bookingId,
      req.body.nextState,
      req.body.actor ?? 'admin',
      req.body.reason,
      req.body.metadata
    );
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Lifecycle update failed' });
  }
};

export const bookingMetricsController = async (_req: Request, res: Response) => {
  const metrics = await bookingFlowService.getOperationalMetrics();
  return res.status(200).json({ success: true, metrics });
};
