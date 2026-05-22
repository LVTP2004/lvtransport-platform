import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
const GOLD = '#d4af37';
const initialIncidents = [
    {
        id: 'inc-2418',
        title: 'Airport pickup latency drift',
        severity: 'high',
        status: 'investigating',
        ackStatus: 'pending',
        assignmentLineage: [
            { operator: 'Nora V.', role: 'Dispatch lead', assignedAt: '2026-05-21T08:04:00Z', assignedBy: 'Scheduler-7', reason: 'Primary queue variance > 14%' },
            { operator: 'Marcos R.', role: 'Driver liaison', assignedAt: '2026-05-21T08:09:00Z', assignedBy: 'Nora V.', reason: 'Driver ETA reconciliation required' },
        ],
        timeline: [
            { id: 'evt-1', timestamp: '2026-05-21T08:01:00Z', actor: 'Ops sentinel', action: 'incident_opened', detail: 'Latency threshold breached for airport corridor.', immutableHash: 'a9f8-0102' },
            { id: 'evt-2', timestamp: '2026-05-21T08:10:00Z', actor: 'Nora V.', action: 'triage_started', detail: 'Started deterministic route replay.', immutableHash: 'a9f8-0103' },
        ],
    },
    {
        id: 'inc-2420',
        title: 'Night fleet fuel card mismatch',
        severity: 'medium',
        status: 'monitoring',
        ackStatus: 'acknowledged',
        ackAt: '2026-05-21T07:25:00Z',
        assignmentLineage: [
            { operator: 'Elias P.', role: 'Finance operations', assignedAt: '2026-05-21T07:08:00Z', assignedBy: 'Scheduler-2', reason: 'Mismatch checksum verification' },
        ],
        timeline: [
            { id: 'evt-3', timestamp: '2026-05-21T07:05:00Z', actor: 'Ops sentinel', action: 'incident_opened', detail: 'Fuel card settlement checksum divergence.', immutableHash: 'b4c1-4421' },
            { id: 'evt-4', timestamp: '2026-05-21T07:25:00Z', actor: 'Elias P.', action: 'incident_acknowledged', detail: 'Ownership accepted for finance reconciliation.', immutableHash: 'b4c1-4422' },
        ],
    },
];
export default function Admin() {
    const [incidents, setIncidents] = useState(initialIncidents);
    const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidents[0]?.id ?? '');
    const [ackActor, setAckActor] = useState('');
    const selectedIncident = useMemo(() => incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0] ?? null, [incidents, selectedIncidentId]);
    const acknowledgeIncident = () => {
        if (!selectedIncident || !ackActor.trim() || selectedIncident.ackStatus === 'acknowledged')
            return;
        const ackAt = new Date().toISOString();
        const event = {
            id: `evt-${selectedIncident.timeline.length + 10}`,
            timestamp: ackAt,
            actor: ackActor.trim(),
            action: 'incident_acknowledged',
            detail: 'Acknowledged operational ownership without mutating prior records.',
            immutableHash: `${selectedIncident.id}-${selectedIncident.timeline.length + 10}`,
        };
        setIncidents((prev) => prev.map((incident) => incident.id === selectedIncident.id
            ? {
                ...incident,
                ackStatus: 'acknowledged',
                ackAt,
                timeline: [...incident.timeline, event],
            }
            : incident));
        setAckActor('');
    };
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 14 }, children: [_jsx("h1", { style: { margin: 0, color: GOLD }, children: "Operator Collaboration" }), _jsx("p", { style: { margin: 0 }, children: "Structured coordination only. No chat or copilot intervention." }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Operator coordination views" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }, children: incidents.map((incident) => (_jsxs("button", { type: 'button', onClick: () => setSelectedIncidentId(incident.id), style: incident.id === selectedIncident?.id ? selectedCoordinationCard : coordinationCard, children: [_jsx("strong", { children: incident.id }), _jsx("span", { children: incident.title }), _jsxs("span", { children: ["Severity: ", incident.severity.toUpperCase()] }), _jsxs("span", { children: ["Status: ", incident.status] }), _jsxs("span", { children: ["Ack: ", incident.ackStatus] })] }, incident.id))) })] }), selectedIncident && _jsxs(_Fragment, { children: [_jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Incident collaboration timeline" }), _jsx("ol", { style: { margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }, children: selectedIncident.timeline.map((event) => _jsxs("li", { children: [_jsx("strong", { children: new Date(event.timestamp).toLocaleString() }), " \u00B7 ", event.actor, " \u00B7 ", event.action, _jsx("br", {}), event.detail, _jsx("br", {}), _jsxs("small", { style: { color: '#9ca3af' }, children: ["Immutable hash: ", event.immutableHash] })] }, event.id)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Operator assignment lineage" }), _jsx("ul", { style: { margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }, children: selectedIncident.assignmentLineage.map((assignment, index) => _jsxs("li", { children: [_jsxs("strong", { children: ["Step ", index + 1] }), ": ", assignment.operator, " (", assignment.role, ") \u00B7 Assigned by ", assignment.assignedBy, _jsx("br", {}), _jsxs("small", { children: [new Date(assignment.assignedAt).toLocaleString(), " \u00B7 Reason: ", assignment.reason] })] }, `${assignment.operator}-${assignment.assignedAt}`)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Acknowledgement flow" }), _jsxs("p", { style: { marginTop: 0 }, children: ["Incident ", selectedIncident.id, " is currently ", _jsx("strong", { children: selectedIncident.ackStatus }), selectedIncident.ackAt ? ` at ${new Date(selectedIncident.ackAt).toLocaleString()}` : '', "."] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }, children: [_jsx("input", { value: ackActor, onChange: (e) => setAckActor(e.target.value), placeholder: 'Operator name for acknowledgement', style: inputStyle, disabled: selectedIncident.ackStatus === 'acknowledged' }), _jsx("button", { type: 'button', onClick: acknowledgeIncident, style: selectedIncident.ackStatus === 'acknowledged' ? disabledButton : enabledButton, disabled: selectedIncident.ackStatus === 'acknowledged', children: selectedIncident.ackStatus === 'acknowledged' ? 'Acknowledged' : 'Acknowledge' })] }), _jsx("p", { style: { color: '#9ca3af', marginBottom: 0 }, children: "Audit trail is append-only. Existing timeline and lineage records are immutable." })] })] })] }) });
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '');
const API_V1_BASE = `${API_BASE}/api/v1`;
const GOLD = '#d4af37';
export default function Admin() {
    const [metrics, setMetrics] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [visibleText, setVisibleText] = useState('Reserva clara. GPS claro. Operación estable.');
    const [basePrice, setBasePrice] = useState(24);
    const [services, setServices] = useState([
        { id: 'standard', name: 'Standard', basePrice: 24, active: true },
        { id: 'business', name: 'Business', basePrice: 35, active: true },
        { id: 'van', name: 'Van', basePrice: 42, active: false },
    ]);
    useEffect(() => {
        void (async () => {
            try {
                const [metricsRes, bookingsRes] = await Promise.all([
                    fetch(`${API_V1_BASE}/admin/bookings/metrics`),
                    fetch(`${API_V1_BASE}/admin/bookings`),
                ]);
                const metricsJson = await metricsRes.json();
                const bookingsJson = await bookingsRes.json();
                if (!metricsRes.ok || !bookingsRes.ok)
                    throw new Error(metricsJson?.message || bookingsJson?.message || 'Admin data ophalen mislukt.');
                setMetrics(metricsJson.metrics ?? null);
                setBookings(Array.isArray(bookingsJson.bookings) ? bookingsJson.bookings : []);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Admin data ophalen mislukt.');
            }
        })();
    }, []);
    const logs = [
        'MoniRide: GPS activo.',
        'Driver: estado actualizado.',
        'Founder: supervisión en curso.',
    ];
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }, children: [_jsx("h1", { style: { margin: 0, color: GOLD }, children: "Admin" }), _jsx("p", { style: { margin: 0 }, children: "Intervenci\u00F3n m\u00EDnima. Operaci\u00F3n primero." }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Textos visibles" }), _jsx("input", { value: visibleText, onChange: (e) => setVisibleText(e.target.value), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Precio base" }), _jsx("input", { type: 'number', value: basePrice, onChange: (e) => setBasePrice(Number(e.target.value)), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Tipos de servicio" }), _jsx("div", { style: { display: 'grid', gap: 8 }, children: services.map((service) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }, children: [_jsx("input", { value: service.name, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item)), style: inputStyle }), _jsx("input", { type: 'number', value: service.basePrice, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item)), style: inputStyle }), _jsx("button", { type: 'button', onClick: () => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item)), style: service.active ? enabledButton : disabledButton, children: service.active ? 'Activo' : 'Inactivo' })] }, service.id))) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Reservas y estados" }), error && _jsx("p", { style: { color: '#fca5a5' }, children: error }), metrics && _jsxs("p", { children: ["T: ", metrics.total, " \u00B7 A: ", metrics.active, " \u00B7 C: ", metrics.completed, " \u00B7 X: ", metrics.cancelled, " \u00B7 ", (metrics.completionRate * 100).toFixed(1), "%"] }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: bookings.slice(0, 15).map((booking) => _jsxs("li", { children: [booking.referenceCode, " \u00B7 ", booking.lifecycle.state, " \u00B7 ", booking.pickup, " \u2192 ", booking.destination] }, booking.id)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Logs y alertas" }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: logs.map((log) => _jsx("li", { children: log }, log)) }), _jsx("p", { style: { color: GOLD, marginBottom: 0 }, children: "Alerta simple: solo intervenir en emergencia." })] })] }) });
}
const cardStyle = {
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: 12,
    padding: 14,
    background: '#0f1011',
};
const h2Style = {
    margin: '0 0 8px',
    color: GOLD,
    fontSize: 18,
};
const inputStyle = {
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 8,
    background: '#111214',
    color: 'white',
    padding: '9px 10px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
};
const coordinationCard = {
    display: 'grid',
    gap: 4,
    textAlign: 'left',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 10,
    padding: 10,
    background: '#131517',
    color: 'white',
};
const selectedCoordinationCard = {
    ...coordinationCard,
    border: '1px solid rgba(212,175,55,.65)',
    background: 'rgba(212,175,55,.12)',
};
const enabledButton = {
    border: '1px solid rgba(212,175,55,.4)',
    background: 'rgba(212,175,55,.2)',
    color: 'white',
    borderRadius: 8,
    padding: '9px 12px',
};
const disabledButton = {
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    color: '#d1d5db',
    borderRadius: 8,
    padding: '9px 12px',
};
