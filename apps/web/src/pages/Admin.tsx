import { useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type ActorType = 'admin' | 'founder'
type EntityType = 'service' | 'price' | 'text' | 'config'
type PublishableStatus = 'draft' | 'published' | 'archived'

type AuditEntry = {
  actorId: string
  actorType: ActorType
  entityType: EntityType
  entityId: string
  previousValue: unknown
  newValue: unknown
  timestamp: string
}

type PublicContent = {
  heroHeadline: string
  heroSubheadline: string
  bookingHelperText: string
  calculatorHelperText: string
  trackingHelperText: string
  footerSupportText: string
  contactText: string
}

type ServiceItem = {
  id: string
  name: string
  description: string
  status: PublishableStatus
}

type PriceItem = {
  id: string
  label: string
  amount: number
  isEstimate: boolean
  status: PublishableStatus
}

type BookingConfig = {
  rideTypes: string[]
  airportOptions: string[]
  serviceLabels: string[]
  fallbackContactText: string
}

const initialPublicContent: PublicContent = {
  heroHeadline: 'Discrete premium mobiliteit, operationeel betrouwbaar.',
  heroSubheadline: 'Founder-gestuurde serviceconfiguratie zonder codewijzigingen.',
  bookingHelperText: 'Gebruik exacte ophaalgegevens voor snelle dispatch.',
  calculatorHelperText: 'Tariefkaarten blijven indicatief tot definitieve bevestiging.',
  trackingHelperText: 'Realtime tracking volgt statusupdates vanuit rit-orkestratie.',
  footerSupportText: '24/7 operationele support via gecontroleerde communicatiekanalen.',
  contactText: 'Voor urgente operationele issues: support@lvtransport.be',
}

const initialServices: ServiceItem[] = [
  { id: 'srv-standard', name: 'Standard Transfer', description: 'Standaard premium transfer service.', status: 'published' },
  { id: 'srv-business', name: 'Business Transfer', description: 'Stille rit met zakelijke prioriteit.', status: 'published' },
]

const initialPrices: PriceItem[] = [
  { id: 'price-standard', label: 'Vanaf prijs Standard', amount: 49, isEstimate: true, status: 'published' },
  { id: 'price-business', label: 'Vanaf prijs Business', amount: 69, isEstimate: true, status: 'published' },
]

const initialBookingConfig: BookingConfig = {
  rideTypes: ['One-way', 'Return'],
  airportOptions: ['Brussels Airport', 'Charleroi Airport'],
  serviceLabels: ['Standaard', 'Zakelijk'],
  fallbackContactText: 'Fallback: telefonisch bevestigen via operationele support.',
}

function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= arr.length) return arr
  const next = [...arr]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export default function Admin() {
  const [publicContentDraft, setPublicContentDraft] = useState(initialPublicContent)
  const [servicesDraft, setServicesDraft] = useState(initialServices)
  const [pricesDraft, setPricesDraft] = useState(initialPrices)
  const [bookingConfigDraft, setBookingConfigDraft] = useState(initialBookingConfig)

  const [publicContentPublished, setPublicContentPublished] = useState(initialPublicContent)
  const [servicesPublished, setServicesPublished] = useState(initialServices)
  const [pricesPublished, setPricesPublished] = useState(initialPrices)
  const [bookingConfigPublished, setBookingConfigPublished] = useState(initialBookingConfig)

  const [auditQueue, setAuditQueue] = useState<AuditEntry[]>([])
  const [saveState, setSaveState] = useState('Concept lokaal opgeslagen. API-koppeling nog niet actief.')

  const queueAudit = (entry: Omit<AuditEntry, 'timestamp' | 'actorId' | 'actorType'>) => {
    setAuditQueue((prev) => [{
      actorId: 'founder-session',
      actorType: 'founder' as ActorType,
      ...entry,
      timestamp: new Date().toISOString(),
    }, ...prev].slice(0, 20))
  }

  const onSaveDraft = () => {
    setSaveState('Concept opgeslagen in lokale admin-state. Persistente opslag vereist API-implementatie.')
  }

  const onPublish = () => {
    setPublicContentPublished(publicContentDraft)
    setServicesPublished(servicesDraft)
    setPricesPublished(pricesDraft)
    setBookingConfigPublished(bookingConfigDraft)
    setSaveState('Wijzigingen gemarkeerd als gepubliceerd in UI-state. Backend publish endpoint nog te koppelen.')
  }

  const onRollback = () => {
    setPublicContentDraft(publicContentPublished)
    setServicesDraft(servicesPublished)
    setPricesDraft(pricesPublished)
    setBookingConfigDraft(bookingConfigPublished)
    setSaveState('Concept teruggezet naar laatst gepubliceerde lokale versie.')
  }

  const activeServices = useMemo(() => servicesDraft.filter((item) => item.status === 'published').length, [servicesDraft])
  const activePrices = useMemo(() => pricesDraft.filter((item) => item.status === 'published').length, [pricesDraft])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Founder/Admin Control</h1>
      <p style={{ margin: 0 }}>Admin toegang vereist Google-authenticatie. Deze pagina toont de integratieseam en lokale conceptstatus.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Veilige publicatie-flow</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type='button' onClick={onSaveDraft} style={actionButton}>Concept opslaan</button>
          <button type='button' onClick={onPublish} style={actionButton}>Publiceren</button>
          <button type='button' onClick={onRollback} style={neutralButton}>Rollback</button>
        </div>
        <p style={{ marginBottom: 0 }}>{saveState}</p>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Publieke contentbeheer</h2>
        {Object.entries(publicContentDraft).map(([key, value]) => <label key={key} style={labelStyle}>{key}
          <textarea
            value={value}
            onChange={(e) => {
              const previous = publicContentDraft[key as keyof PublicContent]
              const next = e.target.value
              setPublicContentDraft((prev) => ({ ...prev, [key]: next }))
              queueAudit({ entityType: 'text', entityId: key, previousValue: previous, newValue: next })
            }}
            style={textareaStyle}
          />
        </label>)}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Service management</h2>
        {servicesDraft.map((service, index) => <div key={service.id} style={rowStyle}>
          <input value={service.name} onChange={(e) => setServicesDraft((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item))} style={inputStyle} />
          <input value={service.description} onChange={(e) => setServicesDraft((prev) => prev.map((item) => item.id === service.id ? { ...item, description: e.target.value } : item))} style={inputStyle} />
          <button type='button' onClick={() => setServicesDraft((prev) => prev.map((item) => item.id === service.id ? { ...item, status: item.status === 'published' ? 'draft' : 'published' } : item))} style={neutralButton}>{service.status}</button>
          <button type='button' onClick={() => setServicesDraft((prev) => prev.map((item) => item.id === service.id ? { ...item, status: 'archived' } : item))} style={neutralButton}>Archiveer</button>
          <button type='button' onClick={() => setServicesDraft((prev) => moveItem(prev, index, -1))} style={neutralButton}>↑</button>
          <button type='button' onClick={() => setServicesDraft((prev) => moveItem(prev, index, 1))} style={neutralButton}>↓</button>
        </div>)}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Pricing management</h2>
        {pricesDraft.map((price, index) => <div key={price.id} style={rowStyle}>
          <input value={price.label} onChange={(e) => setPricesDraft((prev) => prev.map((item) => item.id === price.id ? { ...item, label: e.target.value } : item))} style={inputStyle} />
          <input type='number' value={price.amount} onChange={(e) => setPricesDraft((prev) => prev.map((item) => item.id === price.id ? { ...item, amount: Number(e.target.value) } : item))} style={inputStyle} />
          <button type='button' onClick={() => setPricesDraft((prev) => prev.map((item) => item.id === price.id ? { ...item, isEstimate: !item.isEstimate } : item))} style={neutralButton}>{price.isEstimate ? 'Vanaf-prijs' : 'Vast-prijs'}</button>
          <button type='button' onClick={() => setPricesDraft((prev) => prev.map((item) => item.id === price.id ? { ...item, status: 'archived' } : item))} style={neutralButton}>Archiveer</button>
          <button type='button' onClick={() => setPricesDraft((prev) => moveItem(prev, index, -1))} style={neutralButton}>↑</button>
          <button type='button' onClick={() => setPricesDraft((prev) => moveItem(prev, index, 1))} style={neutralButton}>↓</button>
        </div>)}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Booking configuratie</h2>
        <label style={labelStyle}>Ride types<input value={bookingConfigDraft.rideTypes.join(', ')} onChange={(e) => setBookingConfigDraft((prev) => ({ ...prev, rideTypes: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) }))} style={inputStyle} /></label>
        <label style={labelStyle}>Airport options<input value={bookingConfigDraft.airportOptions.join(', ')} onChange={(e) => setBookingConfigDraft((prev) => ({ ...prev, airportOptions: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) }))} style={inputStyle} /></label>
        <label style={labelStyle}>Service labels<input value={bookingConfigDraft.serviceLabels.join(', ')} onChange={(e) => setBookingConfigDraft((prev) => ({ ...prev, serviceLabels: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) }))} style={inputStyle} /></label>
        <label style={labelStyle}>Fallback contact text<textarea value={bookingConfigDraft.fallbackContactText} onChange={(e) => setBookingConfigDraft((prev) => ({ ...prev, fallbackContactText: e.target.value }))} style={textareaStyle} /></label>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Operational overview (API seam)</h2>
        <p style={{ margin: '0 0 8px' }}>Geen gesimuleerde metrics. Alleen productievelden zodra backend beschikbaar is.</p>
        <code style={codeStyle}>GET {API_V1_BASE}/admin/overview → activeRides, pendingRides, cancelledRides, completedRides, fallbackEvents, paymentStatus, driverAvailability</code>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Payment history foundation (API seam)</h2>
        <p style={{ margin: '0 0 8px' }}>Geen voorbeeldbetalingen getoond. Lege staat tot backend koppeling.</p>
        <code style={codeStyle}>GET {API_V1_BASE}/admin/payments/history → rideCode, subtotal, vatPercent, vatAmount, total, paymentMethod, paymentStatus, invoiceStatus, timestamps</code>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Messaging + Moni Assistant Core foundation</h2>
        <p style={{ marginTop: 0 }}>Doel: operationele continuïteit voor vertragingen, annuleringen en fallback-communicatie.</p>
        <code style={codeStyle}>POST {API_V1_BASE}/admin/messages/events · channels: driver-to-moni-core, customer-to-moniride, admin-bridge</code>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Audit voorbereidingsqueue</h2>
        <p style={{ marginTop: 0 }}>Structuur volgt verplichte auditvelden; lokale queue als voorbereidende laag.</p>
        <p style={{ margin: 0 }}>Actieve services: {activeServices} · Actieve prijskaarten: {activePrices}</p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {auditQueue.length === 0 ? <li>Geen wijzigingen geregistreerd in deze sessie.</li> : auditQueue.slice(0, 8).map((entry) => <li key={`${entry.entityId}-${entry.timestamp}`}>{entry.timestamp} · {entry.entityType}:{entry.entityId} · {entry.actorType}</li>)}
        </ul>
      </article>
    </section>
  </main>
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.28)',
  borderRadius: 12,
  padding: 14,
  background: '#0f1011',
}

const h2Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: GOLD,
  fontSize: 18,
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  borderRadius: 8,
  background: '#111214',
  color: 'white',
  padding: '9px 10px',
  width: '100%',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 64, resize: 'vertical' }
const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, marginBottom: 8 }
const rowStyle: React.CSSProperties = { display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr auto auto auto auto', marginBottom: 8 }
const actionButton: React.CSSProperties = { border: '1px solid rgba(212,175,55,.6)', background: 'rgba(212,175,55,.16)', color: 'white', borderRadius: 8, padding: '8px 10px' }
const neutralButton: React.CSSProperties = { border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: '#e5e7eb', borderRadius: 8, padding: '8px 10px' }
const codeStyle: React.CSSProperties = { display: 'block', padding: '8px 10px', borderRadius: 8, background: '#151619', color: '#f9e6a7', fontSize: 12, overflowX: 'auto' }
