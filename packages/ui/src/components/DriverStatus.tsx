import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export function DriverStatusTile({ name, vehicle, online }: { name: string; vehicle: string; online: boolean }) {
  return (
    <Card className='flex items-center justify-between'>
      <div>
        <p className='font-display text-base text-white'>{name}</p>
        <p className='text-sm text-lv-mist'>{vehicle}</p>
      </div>
      <StatusBadge label={online ? 'Online' : 'Offline'} tone={online ? 'success' : 'neutral'} />
    </Card>
  );
}
