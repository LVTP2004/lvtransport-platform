import { useState } from 'react'

type FloatingMoniMode = 'ride' | 'driver' | 'tower'

interface FloatingMoniProps {
  mode?: FloatingMoniMode
}

const copy = {
  ride: {
    title: 'Moni Ride',
    body: 'Hallo, ik ben Moni van LV Transport. Ik help u met reserveren, prijsindicatie en tracking.',
    actions: ['Rit boeken', 'Prijs vragen', 'Rit volgen'],
  },
  driver: {
    title: 'Moni Driver',
    body: 'Moni Driver helpt u met de volgende ritstap, navigatie en statusupdates.',
    actions: ['Start navigatie', 'Volgende stap', 'Ritstatus'],
  },
  tower: {
    title: 'Moni Tower',
    body: 'Moni Tower helpt met operationele signalen, dispatch overzicht en prioriteiten.',
    actions: ['Actieve ritten', 'Alerts', 'Drivers'],
  },
}

export function FloatingMoni({ mode = 'ride' }: FloatingMoniProps) {
  const [open, setOpen] = useState(false)
  const content = copy[mode]

  return (
    <div className="lv-floating-moni" data-mode={mode}>
      {open && (
        <section className="lv-floating-moni__panel" aria-label={content.title}>
          <header className="lv-floating-moni__header">
            <strong>{content.title}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Moni sluiten">
              ×
            </button>
          </header>

          <p>{content.body}</p>

          <div className="lv-floating-moni__actions">
            {content.actions.map((action) => (
              <button type="button" key={action}>
                {action}
              </button>
            ))}
          </div>
        </section>
      )}

      <button type="button" className="lv-floating-moni__button" onClick={() => setOpen((value) => !value)}>
        Moni
      </button>
    </div>
  )
}
