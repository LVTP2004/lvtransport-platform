import type { Request, Response } from 'express';
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
