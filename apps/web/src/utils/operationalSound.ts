export type OperationalSoundEvent =
  | 'booking_confirmed'
  | 'tracking_updated'
  | 'driver_assigned'
  | 'new_ride'
  | 'ride_accepted'
  | 'navigation_step'
  | 'ride_completed'
  | 'gps_warning'
  | 'new_booking'
  | 'unassigned_ride'
  | 'operational_alert'
  | 'driver_online'
  | 'driver_offline'
  | 'deploy_failed'
  | 'api_down'
  | 'runtime_warning'

const STORAGE_KEY = 'lvtp_operational_sound_enabled'

const SOUND_PATHS: Record<OperationalSoundEvent, string> = {
  booking_confirmed: '/sounds/booking-confirmed.mp3',
  tracking_updated: '/sounds/tracking-updated.mp3',
  driver_assigned: '/sounds/driver-assigned.mp3',
  new_ride: '/sounds/new-ride.mp3',
  ride_accepted: '/sounds/ride-accepted.mp3',
  navigation_step: '/sounds/navigation-step.mp3',
  ride_completed: '/sounds/ride-completed.mp3',
  gps_warning: '/sounds/gps-warning.mp3',
  new_booking: '/sounds/new-booking.mp3',
  unassigned_ride: '/sounds/unassigned-ride.mp3',
  operational_alert: '/sounds/operational-alert.mp3',
  driver_online: '/sounds/driver-online.mp3',
  driver_offline: '/sounds/driver-offline.mp3',
  deploy_failed: '/sounds/deploy-failed.mp3',
  api_down: '/sounds/api-down.mp3',
  runtime_warning: '/sounds/runtime-warning.mp3',
}

function readPreference(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) !== 'false'
}

export function isOperationalSoundEnabled(): boolean {
  return readPreference()
}

export function setOperationalSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, String(enabled))
}

export function toggleOperationalSound(): boolean {
  const next = !isOperationalSoundEnabled()
  setOperationalSoundEnabled(next)
  return next
}

export async function playOperationalSound(event: OperationalSoundEvent): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isOperationalSoundEnabled()) return

  const source = SOUND_PATHS[event]
  if (!source) return

  try {
    const audio = new Audio(source)
    audio.volume = event.includes('warning') || event.includes('alert') || event.includes('down') ? 0.18 : 0.12
    await audio.play()
  } catch {
    // Browser autoplay or missing asset: fail silently to protect runtime stability.
  }
}

export function getOperationalSoundPath(event: OperationalSoundEvent): string {
  return SOUND_PATHS[event]
}
