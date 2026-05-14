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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<MoniMessage[]>([{ role: 'assistant', text: 'Moni Assistant • Premium concierge\nWelkom, ik help u direct met boekingen en service.' }]);
  const [bookingData] = useState<MoniBookingFields>({});
  const [messages, setMessages] = useState<MoniMessage[]>([{ role: 'assistant', text: 'Moni Assistant • Premium operator\nNatuurlijk, ik help u graag met uw rit.' }]);
  const [bookingData, setBookingData] = useState<MoniBookingFields>({});
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const drag = useRef<{dx:number;dy:number}|null>(null);

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
    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: replies.join('\n') }]);
    setInput('');
  };

  const panelClass = useMemo(() => `moni-panel ${open && !minimized ? 'moni-panel--open' : ''}`, [minimized, open]);

  return (
    <div className="moni-root" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} aria-live="polite">
      <button
        className="moni-fab"
        draggable
        onDragEnd={(e) => setOffset({ x: e.clientX - window.innerWidth + 120, y: e.clientY - window.innerHeight + 120 })}
        onClick={() => { setOpen(true); setMinimized(false); }}
      >Moni Concierge</button>
      <section className={panelClass}>
        <header className="moni-header"><div><strong>Moni Assistant</strong><p>LV Transport Premium Concierge</p></div><div className="moni-actions"><button onClick={() => setMinimized(true)}>–</button><button onClick={() => { setOpen(false); setMinimized(false); }}>×</button></div></header>
    <div className="moni-root" aria-live="polite" style={{ right: pos.x, bottom: pos.y }}>
      <button className="moni-fab" onClick={() => { setOpen(true); setMinimized(false); }}>Moni Assistant</button>
      <section className={containerClass}>
        <header className="moni-header" onMouseDown={(e)=>{drag.current={dx:e.clientX,dy:e.clientY};}} onMouseMove={(e)=>{ if(!drag.current) return; setPos((p)=>({x:Math.max(8,p.x-(e.clientX-drag.current!.dx)),y:Math.max(8,p.y-(e.clientY-drag.current!.dy))})); drag.current={dx:e.clientX,dy:e.clientY};}} onMouseUp={()=>{drag.current=null;}}><div><strong>Moni Assistant</strong><p>LV Transport Premium Operator</p></div><div className="moni-actions"><button onClick={() => setMinimized(true)}>–</button><button onClick={() => { setOpen(false); setMinimized(false); }}>×</button></div></header>
        <div className="moni-quick">{quickReplies.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
        <div className="moni-messages">{messages.map((m, i) => <p key={i} className={m.role === 'assistant' ? 'assistant' : 'user'}>{m.text}</p>)}</div>
        <form className="moni-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Typ uw vraag..." />
          <button type="submit">Verstuur</button>
        </form>
      </section>
    </div>
  );
}
