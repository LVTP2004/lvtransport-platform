import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const SOURCE_PATHS = {
    timeline: '/operational-memory/continuity-timeline.md',
    index: '/operational-memory/operational-memory-index.json',
    summary: '/operational-memory/continuity-summary.md'
};
const parseMarkdownBullets = (content, source) => content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => {
    const raw = line.replace(/^-\s*/, '');
    const timestampMatch = raw.match(/(\d{4}-\d{2}-\d{2}[^\s]*)/);
    const correlationId = raw.match(/correlation[_-]?id[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const entityType = raw.match(/entityType[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const entityId = raw.match(/entityId[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const category = raw.match(/category[:=]\s*([A-Za-z0-9_-]+)/i)?.[1] ?? 'continuity';
    return {
        timestamp: timestampMatch?.[1] ?? 'unknown',
        source,
        category,
        description: raw,
        correlationId,
        entityType,
        entityId,
        lineage: []
    };
});
const safeJson = (input) => {
    try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : (Array.isArray(parsed.records) ? parsed.records : []);
    }
    catch {
        return [];
    }
};
export function OperationsConsole() {
    const [sourceState, setSourceState] = useState({});
    const [timelineEntries, setTimelineEntries] = useState([]);
    const [summaryLines, setSummaryLines] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);
    useEffect(() => {
        let alive = true;
        const loadedAt = new Date().toISOString();
        const load = async () => {
            const nextState = {};
            const nextTimeline = [];
            const nextSummary = [];
            let nextHealth = [];
            for (const [key, path] of Object.entries(SOURCE_PATHS)) {
                const response = await fetch(path);
                if (!response.ok) {
                    nextState[key] = { ok: false, missing: response.status === 404, loadedAt, path };
                    continue;
                }
                const text = await response.text();
                nextState[key] = { ok: true, missing: false, loadedAt, path };
                if (key === 'timeline')
                    nextTimeline.push(...parseMarkdownBullets(text, 'continuity-timeline.md'));
                if (key === 'summary')
                    nextSummary.push(...text.split('\n').map((line) => line.trim()).filter(Boolean));
                if (key === 'index') {
                    nextHealth = safeJson(text);
                    nextTimeline.push(...nextHealth.map((record) => ({
                        timestamp: record.timestamp ?? 'unknown',
                        source: record.source ?? 'operational-memory-index.json',
                        category: record.category ?? 'operational_memory',
                        description: record.description ?? `Operational memory record ${record.id ?? 'unknown'}`,
                        entityType: record.entityType,
                        entityId: record.entityId,
                        correlationId: record.correlationId,
                        lineage: record.lineage
                    })));
                }
            }
            if (!alive)
                return;
            setSourceState(nextState);
            setTimelineEntries(nextTimeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
            setSummaryLines(nextSummary);
            setHealthRecords(nextHealth);
        };
        void load();
        return () => { alive = false; };
    }, []);
    const hasArtifacts = useMemo(() => Object.values(sourceState).some((state) => state.ok), [sourceState]);
    const replayCount = healthRecords.reduce((sum, record) => sum + (record.replayCount ?? 0), 0);
    const recoveryEvents = healthRecords.reduce((sum, record) => sum + (record.recoveryEvents ?? 0), 0);
    const failedNotifications = healthRecords.reduce((sum, record) => sum + (record.failedNotifications ?? 0), 0);
    const migrationVersion = healthRecords.find((record) => record.migrationVersion)?.migrationVersion ?? 'unknown';
    const integrityState = healthRecords.find((record) => record.integrity)?.integrity ?? 'unknown';
    const backupState = healthRecords.find((record) => record.backupStatus)?.backupStatus ?? 'unknown';
    return _jsxs("section", { className: 'glass-panel rounded-3xl p-5 sm:p-7', id: 'operations', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.22em] text-lv-champagne/85', children: "Operations Console" }), _jsx("h2", { className: 'mt-2 text-2xl sm:text-3xl', children: "Operational continuity foundation" }), _jsx("p", { className: 'mt-3 text-sm text-lv-mist', children: "Read-only cognition surface sourced from local operational memory artifacts. No realtime subscriptions, no mutation controls." }), !hasArtifacts && _jsx("div", { className: 'mt-5 rounded-2xl border border-lv-gold/30 bg-[#1f2329] p-4 text-sm text-lv-mist', children: "Operational memory artifacts are absent. Continuity timeline, summaries, and health cards are intentionally empty to preserve truthful visibility." }), _jsx("div", { className: 'mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3', children: [
                    { label: 'SQLite integrity', value: integrityState },
                    { label: 'Migration version', value: migrationVersion },
                    { label: 'Backup status', value: backupState },
                    { label: 'Replay count', value: String(replayCount) },
                    { label: 'Recovery events', value: String(recoveryEvents) },
                    { label: 'Failed notifications', value: String(failedNotifications) }
                ].map((card) => _jsxs("article", { className: 'rounded-2xl border border-lv-gold/20 bg-[#22262d] p-4', children: [_jsx("p", { className: 'text-[11px] uppercase tracking-[0.18em] text-lv-champagne/80', children: card.label }), _jsx("p", { className: 'mt-2 text-lg text-white', children: card.value })] }, card.label)) }), _jsxs("div", { className: 'mt-6 grid gap-4 xl:grid-cols-2', children: [_jsxs("section", { className: 'rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4', children: [_jsx("h3", { className: 'text-sm uppercase tracking-[0.16em] text-lv-champagne', children: "Continuity timeline" }), _jsxs("div", { className: 'mt-3 space-y-3', children: [timelineEntries.length === 0 && _jsx("p", { className: 'text-sm text-lv-mist', children: "No deterministic timeline entries available from local artifacts." }), timelineEntries.map((item, idx) => _jsxs("article", { className: 'rounded-xl border border-white/10 bg-[#252932] p-3 text-sm', children: [_jsxs("p", { className: 'text-lv-champagne', children: [item.timestamp, " \u00B7 ", item.category] }), _jsx("p", { className: 'mt-1 text-white', children: item.description }), _jsxs("p", { className: 'mt-1 text-xs text-lv-mist', children: ["source: ", item.source, " ", item.entityType ? `· ${item.entityType}:${item.entityId ?? 'unknown'}` : '', " ", item.correlationId ? `· correlation_id:${item.correlationId}` : ''] }), _jsxs("p", { className: 'mt-1 text-[11px] text-lv-mist/90', children: ["lineage: ", (item.lineage && item.lineage.length > 0) ? item.lineage.join(', ') : 'none declared'] })] }, `${item.timestamp}-${idx}`))] })] }), _jsxs("section", { className: 'rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4', children: [_jsx("h3", { className: 'text-sm uppercase tracking-[0.16em] text-lv-champagne', children: "Cognitive summaries" }), _jsxs("div", { className: 'mt-3 space-y-3 text-sm text-lv-mist', children: [summaryLines.length === 0 && _jsx("p", { children: "No continuity summary artifact found; replay, transition, and runbook context remain explicitly unknown." }), summaryLines.map((line, index) => _jsxs("article", { className: 'rounded-xl border border-white/10 bg-[#252932] p-3', children: [_jsx("p", { className: 'text-white', children: line }), _jsxs("p", { className: 'mt-1 text-xs', children: ["source: continuity-summary.md \u00B7 timestamp: ", sourceState.summary?.loadedAt ?? 'unknown', " \u00B7 lineage: continuity-summary"] })] }, `${line}-${index}`))] })] })] }), _jsxs("section", { className: 'mt-6 rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4', children: [_jsx("h3", { className: 'text-sm uppercase tracking-[0.16em] text-lv-champagne', children: "Source lineage" }), _jsx("div", { className: 'mt-3 grid gap-2 sm:grid-cols-3', children: Object.entries(SOURCE_PATHS).map(([key, path]) => {
                            const state = sourceState[key];
                            return _jsxs("article", { className: 'rounded-xl border border-white/10 bg-[#252932] p-3 text-xs text-lv-mist', children: [_jsx("p", { className: 'text-lv-champagne', children: key }), _jsx("p", { className: 'mt-1 break-all', children: path }), _jsxs("p", { className: 'mt-1', children: ["status: ", state?.ok ? 'loaded' : state?.missing ? 'missing' : 'unavailable'] }), _jsxs("p", { className: 'mt-1', children: ["timestamp: ", state?.loadedAt ?? 'unknown'] })] }, path);
                        }) })] })] });
}
