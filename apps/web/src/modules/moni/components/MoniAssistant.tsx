import { useMemo, useState } from 'react';
import { detectLanguage } from '../logic/language';
import { detectIntent } from '../logic/intents';
import { nextMissingPrompt } from '../logic/booking-extractor';
import { createLearningRecord, persistLearningRecord } from '../learning/controlled-learning';
import { buildIntro, buildIntentReply } from '../templates/responses';
import type { MoniBookingFields, MoniMessage } from '../types/moni.types';

type MoniPresenceState = 'idle' | 'listening' | 'thinking' | 'confirmation' | 'issue';

const quickReplies = ['Reserveer premium rit', 'Volg mijn rit', 'VIP onboarding', 'Business partner', 'Operator support', 'Contact dispatch'];

export function MoniAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [presenceState, setPresenceState] = useState<MoniPresenceState>('idle');
  const [messages, setMessages] = useState<MoniMessage[]>([
    { role: 'assistant', text: 'Moni Ride • Premium mobility companion\nWelkom. Ik bewaak uw rit en begeleid u stap voor stap.' }
  ]);
  const [bookingData] = useState<MoniBookingFields>({});

  const send = (text: string) => {
    if (!text.trim()) return;
    setPresenceState('thinking');
    const language = detectLanguage(text);
    const intent = detectIntent(text);
    const replies: string[] = [buildIntro(language)];
    const intentLine = buildIntentReply(language, intent);
    if (intentLine) replies.push(intentLine);
    if (intent === 'booking_request' || intent === 'airport_transfer') {
      const prompt = nextMissingPrompt(language, bookingData);
      if (prompt) replies.push(prompt);
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

  return (
    <div className='moni-root' aria-live='polite'>
      <button
        className={`moni-fab moni-fab--${presenceState}`}
        aria-label='Open Moni Ride concierge'
        onClick={() => { setOpen(true); setMinimized(false); setPresenceState('listening'); }}
      >
        <span className='moni-avatar' aria-hidden='true'>
          <span className='moni-eyes'><i /><i /></span>
        </span>
      </button>
      <section className={panelClass}>
        <header className='moni-header'>
          <div>
            <strong>Moni Ride</strong>
            <p>Concierge observer • founder-operated ecosystem</p>
          </div>
          <div className='moni-actions'>
            <button onClick={() => { setMinimized(true); setPresenceState('idle'); }}>–</button>
            <button onClick={() => { setOpen(false); setMinimized(false); setPresenceState('idle'); }}>×</button>
          </div>
        </header>
        <div className='moni-quick'>{quickReplies.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
        <div className='moni-messages'>{messages.map((m, i) => <p key={i} className={m.role === 'assistant' ? 'assistant' : 'user'}>{m.text}</p>)}</div>
        <form className='moni-input' onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input value={input} onFocus={() => setPresenceState('listening')} onChange={(e) => setInput(e.target.value)} placeholder='Beschrijf uw behoefte...' />
          <button type='submit'>Verzenden</button>
        </form>
      </section>
    </div>
  );
}
