import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from 'react';
import { detectLanguage } from '../logic/language';
import { detectIntent } from '../logic/intents';
import { nextMissingPrompt } from '../logic/booking-extractor';
import { buildIntro, buildIntentReply } from '../templates/responses';
const quickReplies = ['Rit boeken', 'Prijs vragen', 'Luchthaven', 'Volg mijn taxi', 'Zakelijk/VIP', 'Contact'];
export function MoniAssistant() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ role: 'assistant', text: 'Moni Assistant • Premium operator\nNatuurlijk, ik help u graag met uw rit.' }]);
    const [bookingData, setBookingData] = useState({});
    const [position, setPosition] = useState({ x: 16, y: 16 });
    const drag = useRef({ sx: 0, sy: 0, dragging: false });
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
        if (intent === 'tracking_request')
            replies.push('Gebruik uw reserveringscode in de sectie “Volg uw taxi”.');
        if (intent === 'price_request')
            replies.push('Dit is een live indicatie. Definitieve prijs volgt bij bevestiging.');
        setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: replies.join('\n') }]);
        setInput('');
    };
    const containerClass = useMemo(() => `moni-panel ${open && !minimized ? 'moni-panel--open' : ''}`, [minimized, open]);
    return (_jsxs("div", { className: "moni-root", style: { right: position.x, bottom: position.y }, "aria-live": "polite", children: [_jsx("button", { className: "moni-fab", onPointerDown: (e) => { drag.current = { sx: e.clientX, sy: e.clientY, dragging: false }; }, onPointerMove: (e) => {
                    const dx = drag.current.sx - e.clientX;
                    const dy = drag.current.sy - e.clientY;
                    if (Math.abs(dx) + Math.abs(dy) > 6) {
                        drag.current.dragging = true;
                        setPosition((p) => ({ x: Math.max(8, p.x + dx), y: Math.max(8, p.y + dy) }));
                        drag.current.sx = e.clientX;
                        drag.current.sy = e.clientY;
                    }
                }, onPointerUp: () => {
                    if (!drag.current.dragging) {
                        setOpen(true);
                        setMinimized(false);
                    }
                }, children: "Moni Assistant" }), _jsxs("section", { className: containerClass, children: [_jsxs("header", { className: "moni-header", children: [_jsxs("div", { children: [_jsx("strong", { children: "Moni Assistant" }), _jsx("p", { children: "LV Transport Premium Operator" })] }), _jsxs("div", { className: "moni-actions", children: [_jsx("button", { onClick: () => setMinimized(true), children: "\u2013" }), _jsx("button", { onClick: () => { setOpen(false); setMinimized(false); }, children: "\u00D7" })] })] }), _jsx("div", { className: "moni-quick", children: quickReplies.map((q) => _jsx("button", { onClick: () => send(q), children: q }, q)) }), _jsx("div", { className: "moni-messages", children: messages.map((m, i) => _jsx("p", { className: m.role === 'assistant' ? 'assistant' : 'user', children: m.text }, i)) }), _jsxs("form", { className: "moni-input", onSubmit: (e) => { e.preventDefault(); send(input); }, children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Typ uw vraag of boekingsverzoek..." }), _jsx("button", { type: "submit", children: "Verstuur" })] })] })] }));
}
