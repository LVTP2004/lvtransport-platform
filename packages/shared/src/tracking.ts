import crypto from 'node:crypto';

export type TrackingCode = string;

export function createTrackingCode(): TrackingCode {
  return `LV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export function normalizeTrackingCode(input: string): TrackingCode {
  return input.trim().toUpperCase();
}

export function isValidTrackingCode(input: string): boolean {
  return /^LV-[A-F0-9]{8}$/.test(normalizeTrackingCode(input));
}
