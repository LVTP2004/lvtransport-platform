export const bookingTimeZone = 'Europe/Brussels';

const clock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: bookingTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const day = 86400000;

function localTimestamp(instant: number) {
  return clock.format(instant).replace(' ', 'T');
}

export function bookingSchedule(date: string, time: string): string {
  const wall = `${date}T${time}`;
  const base = Date.parse(wall + ':00Z');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall) || !Number.isFinite(base)
    || new Date(base).toISOString().slice(0, 16) !== wall) {
    throw new Error('Vul een geldige vertrekdatum en -tijd in.');
  }
  // Sample both sides so the clocks on either side of a DST change are considered.
  const offsets = new Set([base - day, base + day].map(sample =>
    Date.parse(localTimestamp(sample) + ':00Z') - sample));
  const candidates = [...offsets].map(offset => base - offset)
    .filter(instant => localTimestamp(instant) === wall);
  if (candidates.length !== 1) {
    throw new Error('Kies een andere vertrektijd vanwege de zomer- of wintertijd in België.');
  }
  return new Date(candidates[0]).toISOString();
}
