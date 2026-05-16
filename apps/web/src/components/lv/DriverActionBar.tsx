interface DriverActionBarProps {
  online?: boolean
}

const actions = [
  'Onderweg',
  'Aangekomen',
  'Gestart',
  'Voltooid',
]

export function DriverActionBar({ online = true }: DriverActionBarProps) {
  return (
    <section className="lv-driver-action-bar">
      <header className="lv-driver-action-bar__header">
        <div>
          <p className="lv-driver-action-bar__label">Driver Runtime</p>
          <h3 className="lv-driver-action-bar__title">
            {online ? 'Online en beschikbaar' : 'Offline modus'}
          </h3>
        </div>

        <button
          type="button"
          className={`lv-driver-action-bar__status ${online ? 'is-online' : 'is-offline'}`}
        >
          {online ? 'Online' : 'Offline'}
        </button>
      </header>

      <div className="lv-driver-action-bar__actions">
        {actions.map((action) => (
          <button type="button" key={action} className="lv-driver-action-bar__button">
            {action}
          </button>
        ))}
      </div>
    </section>
  )
}
