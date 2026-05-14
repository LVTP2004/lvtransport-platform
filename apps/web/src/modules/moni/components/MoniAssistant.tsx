import { useMemo, useRef, useState } from 'react';
import { detectLanguage } from '../logic/language';
import { detectIntent } from '../logic/intents';
import { nextMissingPrompt } from '../logic/booking-extractor';
import { buildIntro, buildIntentReply } from '../templates/responses';
import type { MoniBookingFields, MoniMessage } from '../types/moni.types';

const quickReplies = ['Rit boeken', 'Prijs vragen', 'Luchthaven', 'Volg mijn taxi', 'Zakelijk/VIP', 'Contact'];

export function MoniAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MoniMessage[]>([{ role: 'assistant', text: 'Moni Assistant • Premium operator\nNatuurlijk, ik help u graag met uw rit.' }]);
  const [bookingData, setBookingData] = useState<MoniBookingFields>({});
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const drag = useRef<{ sx: number; sy: number; dragging: boolean }>({ sx: 0, sy: 0, dragging: false });

  const send = (text: string) => {
    if (!text.trim()) return;
    const language = detectLanguage(text);
    const intent = detectIntent(text);
    const replies: string[] = [buildIntro(language)];
    const intentLine = buildIntentReply(language, intent);
    if (intentLine) replies.push(intentLine);
    if (intent === 'booking_request' || intent === 'airport_transfer') {
      const prompt = nextMissingPrompt(language, bookingData);
      if (prompt) replies.push(prompt);
    }
    if (intent === 'tracking_request') replies.push('Gebruik uw reserveringscode in de sectie “Volg uw taxi”.');
    if (intent === 'price_request') replies.push('Dit is een live indicatie. Definitieve prijs volgt bij bevestiging.');

    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: replies.join('\n') }]);
    setInput('');
  };

  const containerClass = useMemo(() => `moni-panel ${open && !minimized ? 'moni-panel--open' : ''}`, [minimized, open]);

  return (
    <div className="moni-root" style={{ right: position.x, bottom: position.y }} aria-live="polite">
      <button
        className="moni-fab"
        onPointerDown={(e) => { drag.current = { sx: e.clientX, sy: e.clientY, dragging: false }; }}
        onPointerMove={(e) => {
          const dx = drag.current.sx - e.clientX;
          const dy = drag.current.sy - e.clientY;
          if (Math.abs(dx) + Math.abs(dy) > 6) {
            drag.current.dragging = true;
            setPosition((p) => ({ x: Math.max(8, p.x + dx), y: Math.max(8, p.y + dy) }));
            drag.current.sx = e.clientX;
            drag.current.sy = e.clientY;
          }
        }}
        onPointerUp={() => {
          if (!drag.current.dragging) {
            setOpen(true);
            setMinimized(false);
          }
        }}
      >Moni Assistant</button>
      <section className={containerClass}>
        <header className="moni-header"><div><strong>Moni Assistant</strong><p>LV Transport Premium Operator</p></div><div className="moni-actions"><button onClick={() => setMinimized(true)}>–</button><button onClick={() => { setOpen(false); setMinimized(false); }}>×</button></div></header>
        <div className="moni-quick">{quickReplies.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
        <div className="moni-messages">{messages.map((m, i) => <p key={i} className={m.role === 'assistant' ? 'assistant' : 'user'}>{m.text}</p>)}</div>
        <form className="moni-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Typ uw vraag of boekingsverzoek..." />
          <button type="submit">Verstuur</button>
        </form>
      </section>
    </div>
  );
}
