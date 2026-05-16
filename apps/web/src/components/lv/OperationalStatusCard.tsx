interface OperationalStatusCardProps {
  title: string
  status: string
  description?: string
  accent?: 'gold' | 'green' | 'red' | 'blue'
}

const accentMap = {
  gold: 'lv-operational-card--gold',
  green: 'lv-operational-card--green',
  red: 'lv-operational-card--red',
  blue: 'lv-operational-card--blue',
}

export function OperationalStatusCard({
  title,
  status,
  description,
  accent = 'gold',
}: OperationalStatusCardProps) {
  return (
    <section className={`lv-operational-card ${accentMap[accent]}`}>
      <header className="lv-operational-card__header">
        <p className="lv-operational-card__label">Operational Status</p>
        <span className="lv-operational-card__indicator" />
      </header>

      <h3 className="lv-operational-card__title">{title}</h3>

      <p className="lv-operational-card__status">{status}</p>

      {description && <p className="lv-operational-card__description">{description}</p>}
    </section>
  )
}
