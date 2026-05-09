import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export interface BookingCardProps {
  rider: string;
  pickup: string;
  dropoff: string;
  eta: string;
  status: string;
}

export function BookingCard({ rider, pickup, dropoff, eta, status }: BookingCardProps) {
  return (
    <Card className='space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-wide text-lv-mist/80'>Rider</p>
          <p className='font-display text-lg text-white'>{rider}</p>
        </div>
        <StatusBadge label={status} tone='warning' />
      </div>
      <div className='grid gap-2 text-sm text-lv-mist'>
        <p><span className='text-white'>Pickup:</span> {pickup}</p>
        <p><span className='text-white'>Dropoff:</span> {dropoff}</p>
        <p><span className='text-white'>ETA:</span> {eta}</p>
      </div>
    </Card>
  );
}
