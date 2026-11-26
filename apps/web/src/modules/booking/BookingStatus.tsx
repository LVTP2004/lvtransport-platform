const labels = new Map([
  ['pending', 'Aanvraag ontvangen'],
  ['assigned', 'Toegewezen'],
  ['accepted', 'Geaccepteerd'],
  ['en_route', 'Onderweg'],
  ['arrived', 'Aangekomen'],
  ['in_progress', 'Rit bezig'],
  ['completed', 'Afgerond'],
  ['cancelled', 'Geannuleerd'],
  ['failed', 'Niet uitgevoerd'],
]);

export function bookingStatusLabel(status: string) {
  return labels.get(status) ?? 'Status niet beschikbaar';
}

export function BookingStatus({ status }: { status: string }) {
  return <span className="inline-flex rounded-full border border-amber-400/30 px-2.5 py-0.5 text-sm text-amber-200">
    {bookingStatusLabel(status)}
  </span>;
}
