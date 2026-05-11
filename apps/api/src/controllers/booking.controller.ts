import type { Request, Response } from 'express';
import { bookingFlowService } from '../modules/bookings/service.js';
import { validateCreateBookingPayload } from '../modules/bookings/validation.js';

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const payload = validateCreateBookingPayload(req.body);
    const booking = await bookingFlowService.createBooking(payload);

    return res.status(201).json({
      message: 'Booking created',
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Invalid booking payload',
    });
  }
};

export const listBookingsController = async (_req: Request, res: Response) => {
  const bookings = await bookingFlowService.listBookings();
  return res.status(200).json({ bookings });
import { bookingService } from '../services/booking.service.js';

export const createBookingHandler = (req: Request, res: Response) => {
  const result = bookingService.createBooking(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'invalid_booking_payload',
      message: result.message,
      details: result.errors,
    });
  }

  return res.status(201).json({
    booking: result.booking,
    message: 'Booking created successfully',
  });
};

export const listBookingsHandler = (_req: Request, res: Response) => {
  return res.status(200).json({
    bookings: bookingService.listBookings(),
  });
};
