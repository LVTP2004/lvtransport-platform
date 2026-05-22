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
import { useEffect, useMemo, useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '');
const API_V1_BASE = `${API_BASE}/api/v1`;
const GOLD = '#d4af37';
const parseTokenList = (value) => {
    if (typeof value !== 'string')
        return [];
    return value
        .split(/[\s,;|]+/)
        .map((token) => token.trim())
        .filter(Boolean);
};
const stringifyMaybe = (value) => {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return '';
};
const collectNodeRefs = (record) => {
    const lineageRefs = new Set();
    const sourceRefs = new Set();
    const explicitEntityRefs = new Set();
    Object.entries(record).forEach(([key, value]) => {
        const normalizedKey = key.toLowerCase();
        if (normalizedKey.includes('lineage')) {
            parseTokenList(stringifyMaybe(value)).forEach((token) => lineageRefs.add(token));
        }
        if (normalizedKey.includes('source')) {
            parseTokenList(stringifyMaybe(value)).forEach((token) => sourceRefs.add(token));
        }
        if (normalizedKey.includes('entity') || normalizedKey.includes('reference')) {
            parseTokenList(stringifyMaybe(value)).forEach((token) => explicitEntityRefs.add(token));
        }
    });
    return {
        lineageRefs: [...lineageRefs],
        sourceRefs: [...sourceRefs],
        explicitEntityRefs: [...explicitEntityRefs],
    };
};
const buildBookingNodes = (bookings) => bookings.flatMap((booking) => {
    const baseRecord = booking;
    const correlationId = stringifyMaybe(baseRecord.correlation_id ?? baseRecord.correlationId);
    const requestId = stringifyMaybe(baseRecord.request_id ?? baseRecord.requestId);
    const refs = collectNodeRefs(baseRecord);
    const entityNode = {
        id: `entity:${booking.id}`,
        label: `${booking.referenceCode} · ${booking.pickup} → ${booking.destination}`,
        kind: 'entity',
        timestamp: booking.scheduleAt,
        correlationId: correlationId || undefined,
        requestId: requestId || undefined,
        ...refs,
    };
    const transitionNode = {
        id: `transition:${booking.id}:${booking.lifecycle.version}`,
        label: `${booking.referenceCode} lifecycle ${booking.lifecycle.state}`,
        kind: 'transition',
        timestamp: booking.scheduleAt,
        correlationId: correlationId || undefined,
        requestId: requestId || undefined,
        lineageRefs: [entityNode.id, ...refs.lineageRefs],
        sourceRefs: refs.sourceRefs,
        explicitEntityRefs: [entityNode.id, ...refs.explicitEntityRefs],
    };
    return [entityNode, transitionNode];
});
const dedupeRelationshipId = (from, to, relationshipType, reason) => `${from}->${to}#${relationshipType}#${reason}`;
const createRelationships = (nodes) => {
    const relationships = new Map();
    nodes.forEach((node) => {
        node.explicitEntityRefs.forEach((ref) => {
            if (nodes.some((candidate) => candidate.id === ref)) {
                const reason = 'Explicit entity reference token matches known evidence node id.';
                const id = dedupeRelationshipId(node.id, ref, 'entity_reference', reason);
                relationships.set(id, {
                    id,
                    from: node.id,
                    to: ref,
                    relationshipType: 'entity_reference',
                    sourceEvidence: node.label,
                    lineageReference: ref,
                    correlationId: node.correlationId,
                    requestId: node.requestId,
                    deterministicReason: reason,
                    timestamp: node.timestamp,
                });
            }
        });
    });
    for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
            const left = nodes[i];
            const right = nodes[j];
            if (left.correlationId && right.correlationId && left.correlationId === right.correlationId) {
                const reason = 'Matching correlation_id values.';
                const id = dedupeRelationshipId(left.id, right.id, 'correlation_match', reason);
                relationships.set(id, {
                    id,
                    from: left.id,
                    to: right.id,
                    relationshipType: 'correlation_match',
                    sourceEvidence: `${left.label} ↔ ${right.label}`,
                    correlationId: left.correlationId,
                    deterministicReason: reason,
                    timestamp: left.timestamp ?? right.timestamp,
                });
            }
            if (left.requestId && right.requestId && left.requestId === right.requestId) {
                const reason = 'Matching request_id values.';
                const id = dedupeRelationshipId(left.id, right.id, 'request_match', reason);
                relationships.set(id, {
                    id,
                    from: left.id,
                    to: right.id,
                    relationshipType: 'request_match',
                    sourceEvidence: `${left.label} ↔ ${right.label}`,
                    requestId: left.requestId,
                    deterministicReason: reason,
                    timestamp: left.timestamp ?? right.timestamp,
                });
            }
            const sharedLineage = left.lineageRefs.find((lineageRef) => right.lineageRefs.includes(lineageRef));
            if (sharedLineage) {
                const reason = 'Shared lineage reference token.';
                const id = dedupeRelationshipId(left.id, right.id, 'lineage_reference', `${reason}:${sharedLineage}`);
                relationships.set(id, {
                    id,
                    from: left.id,
                    to: right.id,
                    relationshipType: 'lineage_reference',
                    sourceEvidence: `${left.label} ↔ ${right.label}`,
                    lineageReference: sharedLineage,
                    correlationId: left.correlationId ?? right.correlationId,
                    requestId: left.requestId ?? right.requestId,
                    deterministicReason: reason,
                    timestamp: left.timestamp ?? right.timestamp,
                });
            }
            const sharedSource = left.sourceRefs.find((sourceRef) => right.sourceRefs.includes(sourceRef));
            if (sharedSource) {
                const reason = 'Shared source reference token.';
                const id = dedupeRelationshipId(left.id, right.id, 'source_reference', `${reason}:${sharedSource}`);
                relationships.set(id, {
                    id,
                    from: left.id,
                    to: right.id,
                    relationshipType: 'source_reference',
                    sourceEvidence: `${left.label} ↔ ${right.label}`,
                    lineageReference: sharedSource,
                    correlationId: left.correlationId ?? right.correlationId,
                    requestId: left.requestId ?? right.requestId,
                    deterministicReason: reason,
                    timestamp: left.timestamp ?? right.timestamp,
                });
            }
            if (left.kind === 'replay' && right.kind === 'replay') {
                const chainRef = left.lineageRefs.find((lineageRef) => right.explicitEntityRefs.includes(lineageRef) || right.lineageRefs.includes(lineageRef));
                if (chainRef) {
                    const reason = 'Replay chain linked by explicit lineage token.';
                    const id = dedupeRelationshipId(left.id, right.id, 'replay_chain', `${reason}:${chainRef}`);
                    relationships.set(id, {
                        id,
                        from: left.id,
                        to: right.id,
                        relationshipType: 'replay_chain',
                        sourceEvidence: `${left.label} ↔ ${right.label}`,
                        lineageReference: chainRef,
                        correlationId: left.correlationId ?? right.correlationId,
                        requestId: left.requestId ?? right.requestId,
                        deterministicReason: reason,
                        timestamp: left.timestamp ?? right.timestamp,
                    });
                }
            }
        }
    }
    return [...relationships.values()];
};
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
    const evidenceNodes = useMemo(() => buildBookingNodes(bookings), [bookings]);
    const evidenceRelationships = useMemo(() => createRelationships(evidenceNodes), [evidenceNodes]);
    const navigationChain = ['timeline', 'replay', 'incident', 'migration', 'runbook', 'related entity', 'source lineage'];
    const groups = [
        { title: 'Related incidents', kinds: ['incident'] },
        { title: 'Related replays', kinds: ['replay'] },
        { title: 'Related transitions', kinds: ['transition'] },
        { title: 'Related runbooks', kinds: ['runbook'] },
        { title: 'Related migrations', kinds: ['migration'] },
        { title: 'Related entities', kinds: ['entity'] },
        { title: 'Related audit events', kinds: ['audit'] },
    ];
    const logs = [
        'MoniRide: GPS activo.',
        'Driver: estado actualizado.',
        'Founder: supervisión en curso.',
    ];
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }, children: [_jsx("h1", { style: { margin: 0, color: GOLD }, children: "Admin" }), _jsx("p", { style: { margin: 0 }, children: "Intervenci\u00F3n m\u00EDnima. Operaci\u00F3n primero." }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Textos visibles" }), _jsx("input", { value: visibleText, onChange: (e) => setVisibleText(e.target.value), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Precio base" }), _jsx("input", { type: 'number', value: basePrice, onChange: (e) => setBasePrice(Number(e.target.value)), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Tipos de servicio" }), _jsx("div", { style: { display: 'grid', gap: 8 }, children: services.map((service) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }, children: [_jsx("input", { value: service.name, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item)), style: inputStyle }), _jsx("input", { type: 'number', value: service.basePrice, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item)), style: inputStyle }), _jsx("button", { type: 'button', onClick: () => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item)), style: service.active ? enabledButton : disabledButton, children: service.active ? 'Activo' : 'Inactivo' })] }, service.id))) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Reservas y estados" }), error && _jsx("p", { style: { color: '#fca5a5' }, children: error }), metrics && _jsxs("p", { children: ["T: ", metrics.total, " \u00B7 A: ", metrics.active, " \u00B7 C: ", metrics.completed, " \u00B7 X: ", metrics.cancelled, " \u00B7 ", (metrics.completionRate * 100).toFixed(1), "%"] }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: bookings.slice(0, 15).map((booking) => _jsxs("li", { children: [booking.referenceCode, " \u00B7 ", booking.lifecycle.state, " \u00B7 ", booking.pickup, " \u2192 ", booking.destination] }, booking.id)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Operational correlation graph" }), _jsxs("p", { style: { marginTop: 0 }, children: ["Deterministic navigation: ", navigationChain.join(' → ')] }), evidenceRelationships.length === 0 ? (_jsx("p", { style: { color: '#d1d5db' }, children: "Insufficient deterministic evidence. No relationships are rendered." })) : (_jsx("ul", { style: { margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }, children: evidenceRelationships.slice(0, 20).map((relationship) => (_jsxs("li", { children: [_jsx("strong", { children: relationship.relationshipType }), " \u00B7 ", relationship.from, " \u2192 ", relationship.to, _jsx("br", {}), "reason: ", relationship.deterministicReason, "; source: ", relationship.sourceEvidence, "; lineage: ", relationship.lineageReference ?? 'n/a', "; correlation: ", relationship.correlationId ?? 'n/a', "; request: ", relationship.requestId ?? 'n/a', "; ts: ", relationship.timestamp ?? 'n/a'] }, relationship.id))) }))] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Evidence map panels" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }, children: groups.map((group) => {
                                const related = evidenceRelationships.filter((relationship) => {
                                    const fromNode = evidenceNodes.find((node) => node.id === relationship.from);
                                    const toNode = evidenceNodes.find((node) => node.id === relationship.to);
                                    return (fromNode && group.kinds.includes(fromNode.kind)) || (toNode && group.kinds.includes(toNode.kind));
                                });
                                return (_jsxs("section", { style: panelStyle, children: [_jsx("h3", { style: { margin: '0 0 8px', fontSize: 14, color: GOLD }, children: group.title }), related.length === 0 ? (_jsx("p", { style: { margin: 0, color: '#9ca3af', fontSize: 13 }, children: "No proven relationship evidence." })) : (_jsx("ul", { style: { margin: 0, paddingLeft: 16, display: 'grid', gap: 4 }, children: related.slice(0, 5).map((relationship) => (_jsxs("li", { style: { fontSize: 13 }, children: [relationship.relationshipType, ": ", relationship.from, " \u2192 ", relationship.to] }, relationship.id))) }))] }, group.title));
                            }) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Logs y alertas" }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: logs.map((log) => _jsx("li", { children: log }, log)) }), _jsx("p", { style: { color: GOLD, marginBottom: 0 }, children: "Alerta simple: solo intervenir en emergencia." })] })] }) });
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }, children: [_jsx("h1", { style: { margin: 0, color: GOLD }, children: "Admin" }), _jsx("p", { style: { margin: 0 }, children: "Intervenci\u00F3n m\u00EDnima. Operaci\u00F3n primero." }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Textos visibles" }), _jsx("input", { value: visibleText, onChange: (e) => setVisibleText(e.target.value), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Precio base" }), _jsx("input", { type: 'number', value: basePrice, onChange: (e) => setBasePrice(Number(e.target.value)), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Tipos de servicio" }), _jsx("div", { style: { display: 'grid', gap: 8 }, children: services.map((service) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }, children: [_jsx("input", { value: service.name, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item)), style: inputStyle }), _jsx("input", { type: 'number', value: service.basePrice, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item)), style: inputStyle }), _jsx("button", { type: 'button', onClick: () => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item)), style: service.active ? enabledButton : disabledButton, children: service.active ? 'Activo' : 'Inactivo' })] }, service.id))) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Reservas y estados" }), error && _jsx("p", { style: { color: '#fca5a5' }, children: error }), metrics && _jsxs("p", { children: ["T: ", metrics.total, " \u00B7 A: ", metrics.active, " \u00B7 C: ", metrics.completed, " \u00B7 X: ", metrics.cancelled, " \u00B7 ", (metrics.completionRate * 100).toFixed(1), "%"] }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: bookings.slice(0, 15).map((booking) => _jsxs("li", { children: [booking.referenceCode, " \u00B7 ", booking.lifecycle.state, " \u00B7 ", booking.pickup, " \u2192 ", booking.destination] }, booking.id)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Logs y alertas" }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: logs.map((log) => _jsx("li", { children: log }, log)) }), _jsx("p", { style: { color: GOLD, marginBottom: 0 }, children: "Alerta simple: solo intervenir en emergencia." })] })] }) });
}
const cardStyle = {
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: 12,
    padding: 14,
    background: '#0f1011',
};
const panelStyle = {
    border: '1px solid rgba(212,175,55,.2)',
    borderRadius: 10,
    padding: 10,
    background: '#131519',
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
