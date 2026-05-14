import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { detectLanguage } from '../logic/language';
import { detectIntent } from '../logic/intents';
import { nextMissingPrompt } from '../logic/booking-extractor';
import { buildIntro, buildIntentReply } from '../templates/responses';
const quickReplies = ['Rit boeken', 'Prijs vragen', 'Luchthaven', 'Volg mijn taxi', 'Zakelijk/VIP', 'Contact'];
export function MoniAssistant() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ role: 'assistant', text: 'Moni Assistant • Premium concierge\nWelkom, ik help u direct met boekingen en service.' }]);
    const [bookingData] = useState({});
    const send = (text) => {
        if (!text.trim())
            return;
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
        setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: replies.join('\n') }]);
        setInput('');
    };
    const panelClass = useMemo(() => `moni-panel ${open && !minimized ? 'moni-panel--open' : ''}`, [minimized, open]);
    return (_jsxs("div", { className: 'moni-root', "aria-live": 'polite', children: [_jsx("button", { className: 'moni-fab', onClick: () => { setOpen(true); setMinimized(false); }, children: "Moni Assistant" }), _jsxs("section", { className: panelClass, children: [_jsxs("header", { className: 'moni-header', children: [_jsxs("div", { children: [_jsx("strong", { children: "Moni Assistant" }), _jsx("p", { children: "LV Transport Premium Concierge" })] }), _jsxs("div", { className: 'moni-actions', children: [_jsx("button", { onClick: () => setMinimized(true), children: "\u2013" }), _jsx("button", { onClick: () => { setOpen(false); setMinimized(false); }, children: "\u00D7" })] })] }), _jsx("div", { className: 'moni-quick', children: quickReplies.map((q) => _jsx("button", { onClick: () => send(q), children: q }, q)) }), _jsx("div", { className: 'moni-messages', children: messages.map((m, i) => _jsx("p", { className: m.role === 'assistant' ? 'assistant' : 'user', children: m.text }, i)) }), _jsxs("form", { className: 'moni-input', onSubmit: (e) => { e.preventDefault(); send(input); }, children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: 'Typ uw vraag...' }), _jsx("button", { type: 'submit', children: "Verstuur" })] })] })] }));
}
