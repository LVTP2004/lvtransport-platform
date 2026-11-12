import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { adminAuthenticationConfigured, adminAuthService } from '../modules/auth/services/auth-client.service';
import { AdminAccessGate, authorizeAdminSession } from '../modules/auth/route-guards/admin-access';
export function App() {
    const [authState, setAuthState] = useState({ isAuthenticated: false, isLoading: true });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [access, setAccess] = useState(null);
    const [authError, setAuthError] = useState('');
    useEffect(() => {
        let active = true;
        const restoreSession = async () => {
            try {
                const session = await adminAuthService.getInitialState();
                const token = session.tokens?.accessToken;
                const [identity, profile] = session.isAuthenticated === true
                    ? await Promise.all([adminAuthService.getSession(token), adminAuthService.getUserProfile()])
                    : [null, null];
                if (!active)
                    return;
                setAccess(authorizeAdminSession(session, identity, profile, Date.now()));
                setAuthState({ ...session, isLoading: false });
            }
            catch {
                if (!active)
                    return;
                setAccess(null);
                setAuthState({ isAuthenticated: false, isLoading: false });
            }
        };
        void restoreSession();
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!access)
            return;
        const timer = window.setTimeout(() => {
            setAccess(null);
            setAuthState({ isAuthenticated: false, isLoading: false });
        }, Math.max(0, Math.min(access.expiresAt - Date.now(), 2147483647)));
        return () => window.clearTimeout(timer);
    }, [access]);
    const login = async () => {
        setAuthError('');
        setAccess(null);
        setAuthState({ isAuthenticated: false, isLoading: true });
        if (!adminAuthenticationConfigured) {
            setAuthState({ isAuthenticated: false, isLoading: false });
            setAuthError('Admin authentication is not configured. Access is disabled.');
            return;
        }
        try {
            const session = await adminAuthService.signIn({ email, password });
            const [identity, profile] = await Promise.all([
                adminAuthService.getSession(session.tokens?.accessToken), adminAuthService.getUserProfile()
            ]);
            const verifiedAccess = authorizeAdminSession(session, identity, profile, Date.now());
            if (!verifiedAccess) {
                setAuthState({ ...session, isAuthenticated: false, isLoading: false });
                setAuthError('Access denied. An active admin account is required.');
                return;
            }
            setAccess(verifiedAccess);
            setAuthState({ ...session, isAuthenticated: true, isLoading: false });
        }
        catch {
            setAccess(null);
            setAuthState({ isAuthenticated: false, isLoading: false });
            setAuthError('Sign in failed. Check your credentials and try again.');
        }
    };
    const logout = async () => {
        setAccess(null);
        setAuthState({ isAuthenticated: false, isLoading: false });
        try {
            await adminAuthService.signOut();
        }
        catch {
            // Keep the UI locked even if remote sign-out fails.
        }
    };
    if (authState.isLoading) {
        return _jsx("main", { className: "min-h-screen bg-zinc-900 p-8 text-white", children: "Loading admin session\u2026" });
    }
    if (!authState.isAuthenticated) {
        return (_jsxs("main", { className: "min-h-screen bg-zinc-900 p-8 text-white", children: [_jsx("h1", { className: "mb-4 text-3xl", children: "Admin Login" }), !adminAuthenticationConfigured ? _jsx("p", { role: "alert", children: "Admin authentication is not configured. Access is disabled." }) : null, authError ? _jsx("p", { role: "alert", className: "text-rose-300", children: authError }) : null, _jsxs("form", { className: "flex max-w-md flex-col gap-3", onSubmit: (event) => { event.preventDefault(); void login(); }, children: [_jsx("input", { className: "rounded p-2 text-black", type: "email", autoComplete: "username", required: true, value: email, onChange: (event) => setEmail(event.target.value) }), _jsx("input", { className: "rounded p-2 text-black", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (event) => setPassword(event.target.value) }), _jsx("button", { className: "rounded bg-amber-400 px-3 py-2 text-black disabled:opacity-50", type: "submit", disabled: !adminAuthenticationConfigured || authState.isLoading, children: authState.isLoading ? 'Signing in…' : 'Sign in' })] })] }));
    }
    if (!access) {
        return (_jsxs("main", { className: "min-h-screen bg-zinc-900 p-8 text-white", children: [_jsx("h1", { className: "mb-4 text-2xl", children: "Access denied" }), _jsx("p", { children: "A verified admin or super_admin account is required." }), _jsx("button", { className: "mt-4 rounded bg-zinc-700 px-3 py-2", onClick: () => void logout(), children: "Logout" })] }));
    }
    return _jsx(AdminAccessGate, { access: access, children: (verified) => _jsx(FounderDashboard, { access: verified, onLogout: logout }, verified.userId) });
}
const API_BASE = import.meta.env?.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1';
const stateTone = {
    Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
    Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
    Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};
const severityRank = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const mergeState = (...states) => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');
const buildDeterministicCopilotResponse = (input) => {
    const normalized = input.query.toLowerCase();
    const citations = [
        `admin.bookings:count=${input.bookings.length}`,
        `drivers.liveStates:count=${input.drivers.length}`,
        `operations.incidents:count=${input.incidents.length}`,
        `runtime.sync:${input.sync}`
    ];
    const evidence = [
        { source: 'admin.bookings', reference: `bookings_total:${input.bookings.length}`, detail: `Total bookings visible in control tower: ${input.bookings.length}` },
        { source: 'drivers.liveStates', reference: `drivers_total:${input.drivers.length}`, detail: `Driver state feed records: ${input.drivers.length}` },
        { source: 'operations.incidents', reference: `incidents_total:${input.incidents.length}`, detail: `Incident records: ${input.incidents.length}` },
        { source: 'runtime.sync', reference: `sync_state:${input.sync}`, detail: `Realtime sync state is ${input.sync}` }
    ];
    if (!input.query.trim()) {
        return {
            capability: 'summarize',
            answer: 'Insufficient evidence request context: provide a concrete operational question to summarize deterministic sources.',
            lineage: 'Deterministic retrieval pipeline: query -> source snapshot -> bounded response. No hidden inference applied.',
            deterministicCitations: citations,
            evidence,
            insufficientEvidence: true
        };
    }
    if (normalized.includes('correlat')) {
        const stalled = input.bookings.filter((booking) => ['arrived', 'failed'].includes(booking.status)).length;
        return {
            capability: 'correlate',
            answer: `Correlation (source-bound): stalled rides=${stalled}, incidents=${input.incidents.length}, sync=${input.sync}. Investigate whether stalled rides and incidents share timestamps in the incident ledger.`,
            lineage: 'Correlated only deterministic counters from admin/bookings + operations/incidents + sync state.',
            deterministicCitations: citations,
            evidence,
            insufficientEvidence: false
        };
    }
    if (normalized.includes('inspect') || normalized.includes('step') || normalized.includes('recommend')) {
        const hasEvidence = input.bookings.length > 0 || input.drivers.length > 0 || input.incidents.length > 0;
        return {
            capability: 'recommend_inspection_steps',
            answer: hasEvidence
                ? 'Inspection steps: (1) verify booking lifecycle versions for non-terminal rides, (2) compare online driver availability to pending/searching bookings, (3) cross-check open incidents against failed/arrived rides, (4) confirm realtime sync stability before escalation.'
                : 'Insufficient evidence: no source data available for safe inspection guidance. Validate source feeds first.',
            lineage: 'Recommendations constrained to observable control tower sources; no autonomous actions proposed.',
            deterministicCitations: citations,
            evidence,
            insufficientEvidence: !hasEvidence
        };
    }
    if (normalized.includes('explain')) {
        return {
            capability: 'explain',
            answer: `Explanation: control tower currently tracks ${input.bookings.length} bookings, ${input.drivers.length} drivers, ${input.incidents.length} incidents, and sync=${input.sync}. This explanation is strictly source-bound and does not infer hidden operational reality.`,
            lineage: 'Explanation rendered from deterministic in-memory snapshot derived from fetched sources.',
            deterministicCitations: citations,
            evidence,
            insufficientEvidence: false
        };
    }
    return {
        capability: 'summarize',
        answer: `Operational summary: bookings=${input.bookings.length}, drivers=${input.drivers.length}, incidents=${input.incidents.length}, sync=${input.sync}. Ask to explain, correlate, or recommend inspection steps for focused evidence narratives.`,
        lineage: 'Summary generated from deterministic retrieval of currently loaded sources only.',
        deterministicCitations: citations,
        evidence,
        insufficientEvidence: false
    };
};
function FounderDashboard({ access, onLogout }) {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sync, setSync] = useState('recovering');
    const [copilotQuery, setCopilotQuery] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            if (Date.now() >= access.expiresAt) {
                onLogout();
                return;
            }
            try {
                const options = { headers: { Authorization: `Bearer ${access.accessToken}` }, signal: controller.signal };
                const [bookingRes, driverRes, incidentRes] = await Promise.all([
                    fetch(`${API_BASE}/admin/bookings`, options),
                    fetch(`${API_BASE}/drivers/live-states`, options),
                    fetch(`${API_BASE}/operations/incidents`, options)
                ]);
                if ([bookingRes, driverRes, incidentRes].some((response) => response.status === 401 || response.status === 403)) {
                    onLogout();
                    return;
                }
                if (![bookingRes, driverRes, incidentRes].every((response) => response.ok))
                    throw new Error('Operational access denied');
                const b = await bookingRes.json();
                const d = await driverRes.json();
                const i = await incidentRes.json();
                if (controller.signal.aborted)
                    return;
                setBookings(Array.isArray(b.bookings) ? b.bookings : []);
                setDrivers(Array.isArray(d.drivers) ? d.drivers : []);
                setIncidents(Array.isArray(i.incidents) ? i.incidents : []);
                setSync('live');
            }
            catch {
                if (controller.signal.aborted)
                    return;
                setSync('degraded');
            }
        };
        load();
        const poll = setInterval(load, 12000);
        return () => { controller.abort(); clearInterval(poll); };
    }, [access.accessToken, access.expiresAt]);
    const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]);
    const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]);
    const onlineDrivers = useMemo(() => drivers.filter((driver) => ['online', 'active'].includes(driver.state)).length, [drivers]);
    const founderAttention = useMemo(() => {
        const attention = [];
        bookings.forEach((ride) => {
            if (ride.status === 'arrived')
                attention.push({ title: `Pickup waiting · ${ride.referenceCode ?? ride.id}`, state: 'Warning', reason: 'Passenger pickup confirmation pending.' });
            if (ride.status === 'failed')
                attention.push({ title: `Failed ride · ${ride.referenceCode ?? ride.id}`, state: 'Degraded', reason: 'Manual intervention required.' });
        });
        if (sync !== 'live')
            attention.push({ title: 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' });
        return attention.slice(0, 4);
    }, [bookings, sync]);
    const runtimeState = useMemo(() => mergeState(...founderAttention.map((a) => a.state), incidents.length > 2 ? 'Warning' : 'Healthy'), [founderAttention, incidents.length]);
    const trustLevel = runtimeState === 'Healthy' ? 'High' : runtimeState === 'Warning' ? 'Guarded' : runtimeState === 'Degraded' ? 'Stressed' : 'Critical';
    const leoSummary = useMemo(() => {
        const top = founderAttention[0];
        if (!top) {
            return {
                headline: 'Leo IA · Operations stable',
                priority: 'No anomaly requires founder escalation right now.',
                report: 'All active simulations remain inside controlled thresholds. Continue routine monitoring.'
            };
        }
        return {
            headline: `Leo IA · ${top.state} anomaly observed`,
            priority: `Priority: ${top.title}.`,
            report: `Recommendation: resolve ${top.title.toLowerCase()} first, then verify airport coordination and payment confidence.`
        };
    }, [founderAttention]);
    const copilotResponse = useMemo(() => buildDeterministicCopilotResponse({ query: copilotQuery, bookings, drivers, incidents, sync }), [copilotQuery, bookings, drivers, incidents, sync]);
    return _jsx("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-zinc-100 sm:p-5", children: _jsxs("div", { className: "relative mx-auto max-w-6xl space-y-4", children: [_jsx("header", { className: "lvtp-shell rounded-3xl p-5", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Cockpit" }), _jsx("h1", { className: "text-lg font-semibold text-amber-200 sm:text-xl", children: "Realtime Operations" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`, children: runtimeState }), _jsx("button", { className: "rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10", onClick: onLogout, children: "Logout" })] }) }), _jsxs("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Active rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: activeRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Pending rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: pendingRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Drivers online" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: onlineDrivers })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "System trust level" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-amber-100", children: trustLevel }), _jsxs("p", { className: "mt-1 text-xs text-zinc-400", children: ["Sync: ", sync] })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Ride lifecycle visibility" }), _jsx("div", { className: "mt-3 space-y-3", children: bookings.map((ride) => {
                                        const airportMessages = (ride.lvMessenger?.messages ?? []).filter((message) => (message.messageType === 'flight_delay_detected'
                                            || message.messageType === 'pickup_timing_adjusted'
                                            || message.messageType === 'airport_instruction'));
                                        return _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm text-zinc-100", children: ride.referenceCode ?? ride.id }), _jsx("span", { className: "text-xs uppercase text-zinc-300", children: ride.status.replaceAll('_', ' ') })] }), _jsxs("div", { className: "mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx("p", { children: "Status sync" }), _jsxs("p", { children: ["Version ", ride.lifecycle?.version ?? '-'] }), _jsxs("p", { children: ["Pickup ", ride.pickup ?? '-'] }), _jsxs("p", { children: ["Destination ", ride.destination ?? '-'] })] }), ride.airportIntelligence?.enabled ? _jsxs("div", { className: "mt-3 rounded-xl border border-amber-300/20 bg-black/30 p-3 text-xs text-zinc-200", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-amber-200", children: "Airport Intelligence" }), _jsxs("div", { className: "mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs("p", { children: ["providerPriority: ", (ride.airportIntelligence.monitoring.providerPriority ?? []).join(', ') || '-'] }), _jsxs("p", { children: ["status: ", ride.airportIntelligence.monitoring.status ?? '-'] }), _jsxs("p", { children: ["delayMin: ", ride.airportIntelligence.monitoring.delayMin ?? 0] }), _jsxs("p", { children: ["terminal: ", ride.airportIntelligence.monitoring.terminal ?? ride.airportIntel?.terminal ?? '-'] }), _jsxs("p", { children: ["pickupBufferMin: ", ride.airportIntelligence.pickupBufferMin] }), _jsxs("p", { children: ["synchronizedAt: ", ride.airportIntelligence.synchronizedAt ?? '-'] }), _jsxs("p", { className: "sm:col-span-2 lg:col-span-2", children: ["notes: ", (ride.airportIntelligence.monitoring.notes ?? []).join(' | ') || '-'] })] }), _jsxs("div", { className: "mt-2 rounded-lg border border-white/10 bg-black/20 p-2", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-zinc-400", children: "Generated LV messages" }), _jsx("ul", { className: "mt-1 space-y-1 text-zinc-300", children: airportMessages.length ? airportMessages.map((message) => _jsxs("li", { children: [message.at, " \u00B7 ", message.channel, " \u00B7 ", message.content] }, message.id)) : _jsx("li", { children: "No airport intelligence messages yet." }) })] })] }) : null] }, ride.id);
                                    }) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Founder priorities" }), _jsx("div", { className: "mt-3 space-y-2", children: founderAttention.length ? founderAttention.map((item) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 p-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("p", { className: "text-sm text-zinc-100", children: item.title }), _jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`, children: item.state })] }), _jsx("p", { className: "mt-1 text-xs text-zinc-300", children: item.reason })] }, item.title)) : _jsx("p", { className: "text-sm text-zinc-300", children: "No founder actions required." }) })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4 xl:col-span-2", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Leo IA executive summary" }), _jsx("p", { className: "mt-3 text-sm text-zinc-100", children: leoSummary.headline }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.priority }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.report })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Operational health" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { children: ["Airport pickups waiting: ", bookings.filter((r) => r.status === 'arrived').length] }), _jsxs("li", { children: ["Payment retries: ", bookings.filter((r) => r.status === 'failed').length] }), _jsxs("li", { children: ["Incidents observed: ", incidents.length] }), _jsxs("li", { children: ["Moni reassurance need: ", founderAttention.some((a) => a.title.startsWith('Airport pickup')) ? 'Elevated' : 'Normal'] })] })] })] }), _jsxs("section", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Constrained Operational Copilot" }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Capabilities: explain, summarize, correlate, recommend inspection steps. Hard boundaries: no state mutation, no replay execution, no hidden inference, no auto-escalation, no self-healing." }), _jsx("div", { className: "mt-3 flex flex-col gap-2 sm:flex-row", children: _jsx("input", { value: copilotQuery, onChange: (event) => setCopilotQuery(event.target.value), className: "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-zinc-100", placeholder: "Ask for an explanation, summary, correlation, or inspection guidance..." }) }), _jsxs("div", { className: "mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-200", children: [_jsxs("p", { children: [_jsx("strong", { children: "Answer:" }), " ", copilotResponse.answer] }), _jsxs("p", { className: "mt-1", children: [_jsx("strong", { children: "Source lineage:" }), " ", copilotResponse.lineage] }), _jsxs("p", { className: "mt-1", children: [_jsx("strong", { children: "Insufficient evidence:" }), " ", copilotResponse.insufficientEvidence ? 'yes' : 'no'] }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Evidence references" }), _jsx("ul", { className: "mt-1 list-disc space-y-1 pl-5 text-xs text-zinc-300", children: copilotResponse.evidence.map((item) => _jsxs("li", { children: [item.source, "::", item.reference, " \u2014 ", item.detail] }, `${item.source}-${item.reference}`)) }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Deterministic citations" }), _jsx("ul", { className: "mt-1 list-disc space-y-1 pl-5 text-xs text-zinc-300", children: copilotResponse.deterministicCitations.map((citation) => _jsx("li", { children: citation }, citation)) })] })] })] }) });
}
