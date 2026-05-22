import { useOperationalSound } from '../../hooks/useOperationalSound'

export function OperationalSoundToggle() {
  const { enabled, toggle, play } = useOperationalSound()

  const handleToggle = () => {
    const next = toggle()
    if (next) play('tracking_updated')
  }

  return (
    <button
      type="button"
      className="lv-sound-toggle"
      onClick={handleToggle}
      aria-pressed={enabled}
      title={enabled ? 'Geluid uitschakelen' : 'Geluid inschakelen'}
    >
      <span aria-hidden="true">{enabled ? '●' : '○'}</span>
      <span>{enabled ? 'Geluid aan' : 'Geluid uit'}</span>
    </button>
  )
}
