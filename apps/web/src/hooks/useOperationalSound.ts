import { useCallback, useEffect, useState } from 'react'
import {
  isOperationalSoundEnabled,
  playOperationalSound,
  setOperationalSoundEnabled,
  toggleOperationalSound,
  type OperationalSoundEvent,
} from '../utils/operationalSound'

export function useOperationalSound() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(isOperationalSoundEnabled())
  }, [])

  const play = useCallback((event: OperationalSoundEvent) => {
    void playOperationalSound(event)
  }, [])

  const setSoundEnabled = useCallback((value: boolean) => {
    setOperationalSoundEnabled(value)
    setEnabled(value)
  }, [])

  const toggle = useCallback(() => {
    const next = toggleOperationalSound()
    setEnabled(next)
    return next
  }, [])

  return {
    enabled,
    play,
    setSoundEnabled,
    toggle,
  }
}
