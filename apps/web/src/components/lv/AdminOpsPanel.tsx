type AdminOpsPanelProps = {
  rides?: number
  drivers?: number
  alerts?: number
}

export function AdminOpsPanel({ rides = 0, drivers = 0, alerts = 0 }: AdminOpsPanelProps) {
  const items = [
    { label: 'Actieve ritten', value: rides },
    { label: 'Drivers online', value: drivers },
    { label: 'Aandachtspunten', value: alerts },
  ]

  return (
    <section className="lv-admin-ops-panel">
      <div className="lv-admin-ops-panel__top">
        <div>
          <p className="lv-admin-ops-panel__eyebrow">Admin</p>
          <h3 className="lv-admin-ops-panel__title">Operations overzicht</h3>
        </div>
        <span className="lv-admin-ops-panel__badge">Live</span>
      </div>

      <div className="lv-admin-ops-panel__grid">
        {items.map((item) => (
          <article className="lv-admin-ops-panel__item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
