const STATES = new Set(['pending', 'assigned', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'failed']);

/** Read only the existing public tracking contract; never infer driver/ETA/payment state. */
export async function readBookingStatus(reference: string, apiBase: string, fetcher: typeof fetch = fetch) {
  const code = reference.trim().toUpperCase();
  if (!/^(?:\d{5}|[A-Z0-9-]{6,100})$/.test(code)) throw new Error('Voer een geldige referentiecode in.');
  const base = apiBase.replace(/\/$/, '');
  const v1 = base.endsWith('/api/v1') ? base : base + '/api/v1';
  const response = await fetcher(`${v1}/tracking/booking/${encodeURIComponent(code)}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(response.status === 404 ? 'Aanvraag niet gevonden.' : 'De aanvraagstatus kan nu niet worden bevestigd.');
  const result = await response.json();
  if (result?.success !== true || result.booking?.referenceCode !== code || !STATES.has(result.booking?.status)) {
    throw new Error('De aanvraagstatus kan nu niet worden bevestigd.');
  }
  return { referenceCode: code, status: result.booking.status as string };
}
