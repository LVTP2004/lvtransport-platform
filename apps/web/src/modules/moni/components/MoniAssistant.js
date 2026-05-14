import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { detectLanguage } from '../logic/language';
import { detectIntent } from '../logic/intents';
import { nextMissingPrompt } from '../logic/booking-extractor';
import { createLearningRecord, persistLearningRecord } from '../learning/controlled-learning';
import { buildIntro, buildIntentReply } from '../templates/responses';
const quickReplies = ['Reserveer premium rit', 'Volg mijn rit', 'Moni Airport update', 'Moni Business support', 'Moni Driver assist', 'Contact dispatch'];
export function MoniAssistant() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [presenceState, setPresenceState] = useState('idle');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Moni Core • Unified intelligence layer\nMoni Ride online. Welkom — ik bewaak uw rit kalm, premium en stap voor stap.' }
    ]);
    const [bookingData] = useState({});
    const send = (text) => {
        if (!text.trim())
            return;
        setPresenceState('thinking');
        const language = detectLanguage(text);
        const intent = detectIntent(text);
        const replies = [buildIntro(language)];
        const intentLine = buildIntentReply(language, intent);
        if (intentLine)
            replies.push(intentLine);
        if (intent === 'booking_request' || intent === 'airport_transfer') {
            const prompt = nextMissingPrompt(language, bookingData);
            if (prompt)
                replies.push(prompt);
        }
        const assistantReply = replies.join('\n');
        const learningRecord = createLearningRecord({ userText: text, replyText: assistantReply, language, intent });
        persistLearningRecord(learningRecord);
        setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: assistantReply }]);
        setPresenceState(/probleem|issue|klacht|vertraging/i.test(text) ? 'issue' : 'confirmation');
        setInput('');
        setTimeout(() => setPresenceState('idle'), 1400);
    };
    const panelClass = useMemo(() => `moni-panel ${open && !minimized ? 'moni-panel--open' : ''}`, [open, minimized]);
    return (_jsxs("div", { className: 'moni-root', "aria-live": 'polite', children: [_jsx("button", { className: `moni-fab moni-fab--${presenceState}`, "aria-label": 'Open Moni Ride concierge', onClick: () => { setOpen(true); setMinimized(false); setPresenceState('listening'); }, children: _jsx("span", { className: 'moni-avatar', "aria-hidden": 'true', children: _jsxs("span", { className: 'moni-eyes', children: [_jsx("i", {}), _jsx("i", {})] }) }) }), _jsxs("section", { className: panelClass, children: [_jsxs("header", { className: 'moni-header', children: [_jsxs("div", { children: [_jsx("strong", { children: "Moni Ride" }), _jsx("p", { children: "Powered by Moni Core \u2022 unified ecosystem concierge" })] }), _jsxs("div", { className: 'moni-actions', children: [_jsx("button", { onClick: () => { setMinimized(true); setPresenceState('idle'); }, children: "\u2013" }), _jsx("button", { onClick: () => { setOpen(false); setMinimized(false); setPresenceState('idle'); }, children: "\u00D7" })] })] }), _jsx("div", { className: 'moni-quick', children: quickReplies.map((q) => _jsx("button", { onClick: () => send(q), children: q }, q)) }), _jsx("div", { className: 'moni-messages', children: messages.map((m, i) => _jsx("p", { className: m.role === 'assistant' ? 'assistant' : 'user', children: m.text }, i)) }), _jsxs("form", { className: 'moni-input', onSubmit: (e) => { e.preventDefault(); send(input); }, children: [_jsx("input", { value: input, onFocus: () => setPresenceState('listening'), onChange: (e) => setInput(e.target.value), placeholder: 'Beschrijf uw behoefte...' }), _jsx("button", { type: 'submit', children: "Verzenden" })] })] })] }));
}
