import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { routePrices } from '../../pricing/constants/route-prices';
import { hasUnverifiedNumber } from '../logic/moni-reply';
import { readBookingStatus } from '../services/booking-status-client';

const statusLabel: Record<string, string> = {
  pending: 'Aanvraag ontvangen', assigned: 'Toegewezen', accepted: 'Geaccepteerd',
  en_route: 'Onderweg', arrived: 'Aangekomen', in_progress: 'Rit bezig',
  completed: 'Afgerond', cancelled: 'Geannuleerd', failed: 'Niet uitgevoerd',
};

type Reply = { text: string; destination?: string; booking?: boolean; prices?: boolean };
type Exchange = { question: string; reply: Reply; conversation?: string };

function greetingReply(question: string): string | undefined {
  const greeting = question.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z\s]/g, ' ').trim().replace(/\s+/g, ' ');
  if (/^(hola(?: como estas| que tal)?|como estas|que tal|buenos dias|buenas(?: tardes| noches)?)$/.test(greeting)) {
    return '¡Hola! Estoy bien, gracias. ¿En qué puedo ayudarte con tu viaje?';
  }
  if (/^(hallo|hoi|goedendag|hoe gaat het|hallo hoe gaat het)$/.test(greeting)) {
    return 'Hallo! Goed, dank u. Waarmee kan ik u helpen voor uw rit?';
  }
  if (/^(hi|hello|how are you|(?:hi|hello) how are you)$/.test(greeting)) {
    return 'Hello! I’m doing well, thanks. How can I help with your ride?';
  }
}

function answer(question: string, previousDestination?: string): Reply {
  const normalized = question.toLowerCase().replace(/\brotterdan\b/g, 'rotterdam');
  const route = routePrices.find(({ destination }) =>
    new RegExp(`\\b${destination.toLowerCase()}\\b`).test(normalized),
  );
  const booking = /reserv|boek|aanvragen|booking/.test(normalized);
  if (route) {
    return {
      text: `De gepubliceerde prijsindicatie voor ${route.destination} is ${route.price}. We bevestigen de definitieve prijs bij uw aanvraag.`,
      destination: route.destination,
      booking: true,
    };
  }
  if (booking) {
    return {
      text: 'Vul uw vertrekadres, bestemming en vertrektijd in om uw rit aan te vragen.',
      destination: /\b(die|dezelfde|that|esa)\b/.test(normalized) ? previousDestination : undefined,
      booking: true,
    };
  }
  if (/prijs|kost|tarie|precio|cost|price|\bnaar\b/.test(normalized)) {
    return {
      text: 'Naar welke bestemming wilt u reizen? Voor ritten zonder gepubliceerd tarief bevestigen we de prijs na uw aanvraag.',
      prices: true,
      booking: true,
    };
  }
  return { text: 'Ik help u met een rit aanvragen, een prijsindicatie of de status van uw aanvraag. Noem bijvoorbeeld Zaventem of kies hieronder een optie.' };
}

async function readChatReply(response: Response, onProgress: (text: string) => void): Promise<string> {
  if (!response.headers.get('Content-Type')?.includes('application/x-ndjson')) {
    const data: { reply?: unknown } = await response.json();
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty reply');
    return data.reply;
  }
  if (!response.body) throw new Error('Empty stream');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) throw new Error('Incomplete reply');
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error('Chat unavailable');
        if (typeof event.delta === 'string') {
          text += event.delta;
          onProgress(text);
        }
        if (event.done === true) {
          if (!text.trim()) throw new Error('Empty reply');
          return text.trim();
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

const launcherSize = 48;
const edge = 12;
type Point = { x: number; y: number };

function viewport() {
  return { width: document.documentElement.clientWidth, height: window.innerHeight };
}

function clampPosition(point: Point, width: number, height: number): Point {
  return {
    x: Math.max(edge, Math.min(point.x, width - launcherSize - edge)),
    y: Math.max(edge, Math.min(point.y, height - launcherSize - edge)),
  };
}

export function LiveMoniAssistant() {
  const [open, setOpen] = useState(false);
  const [{ width, height }, setViewport] = useState(viewport);
  const [position, setPosition] = useState<Point | null>(null);
  const drag = useRef<{ id: number; origin: Point; start: Point; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const point = clampPosition(position ?? { x: width - launcherSize - 16, y: 80 }, width, height);
  const panelWidth = Math.min(384, width - 2 * edge);
  const panelLeft = Math.max(edge, Math.min(point.x + launcherSize - panelWidth, width - panelWidth - edge));
  const roomBelow = height - point.y - launcherSize - 8;
  const panelBelow = roomBelow >= point.y;
  const panelStyle = {
    position: 'fixed' as const,
    left: panelLeft,
    width: panelWidth,
    maxHeight: Math.max(0, (panelBelow ? roomBelow : point.y - 8) - edge),
    ...(panelBelow ? { top: point.y + launcherSize + 8 } : { bottom: height - point.y + 8 }),
  };

  useEffect(() => {
    function resize() { setViewport(viewport()); }
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    skipClick.current = false;
    drag.current = { id: event.pointerId, origin: point, start: { x: event.clientX, y: event.clientY }, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.start.x;
    const dy = event.clientY - gesture.start.y;
    if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
    gesture.moved = true;
    skipClick.current = true;
    setPosition(clampPosition({ x: gesture.origin.x + dx, y: gesture.origin.y + dy }, width, height));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [responding, setResponding] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatPending = useRef(false);
  const [reference, setReference] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [exchanges, open, responding]);

  function close() {
    setOpen(false);
    launcher.current?.focus();
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || chatPending.current) return;
    setChatError('');
    const greeting = greetingReply(text);
    if (greeting) {
      setExchanges(history => [...history, { question: text, reply: { text: greeting } }]);
      setQuestion('');
      return;
    }
    chatPending.current = true;
    setResponding(true);
    const previous = [...exchanges].reverse().find(exchange => exchange.reply.destination);
    const reply = answer(text, previous?.reply.destination);
    setExchanges(history => [...history, { question: text, reply }]);
    setQuestion('');
    try {
      const base = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '');
      const api = base.endsWith('/api/v1') ? base : base + '/api/v1';
      const messages = exchanges.slice(-4).flatMap(exchange => [
        { role: 'user', content: exchange.question.replace(/\brotterdan\b/gi, 'Rotterdam') },
        { role: 'assistant', content: [exchange.reply.destination && `Bestemming: ${exchange.reply.destination}.`, exchange.conversation ?? exchange.reply.text].filter(Boolean).join(' ').slice(0, 600) },
      ]);
      messages.push({ role: 'user', content: text.replace(/\brotterdan\b/gi, 'Rotterdam') });
      const response = await fetch(api + '/moni/ride/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true }), signal: AbortSignal.timeout(31000),
      });
      if (!response.ok) throw new Error('Chat unavailable');
      const knownDestination = reply.destination ?? previous?.reply.destination;
      const setConversation = (conversation?: string) => {
        if (alive.current) setExchanges(history => history.map((item, i) =>
          i === history.length - 1 ? { ...item, conversation } : item));
      };
      const invalid = (text: string) => hasUnverifiedNumber(text) || Boolean(
        knownDestination && /(?:bestemming|destination|destino|waar.*heen|naar welke).{0,60}\?/iu.test(text),
      );
      const modelReply = await readChatReply(response, partial => {
        // Only reveal complete words so a split currency label is checked before it is shown.
        const completeWords = partial.replace(/\S*$/u, '').trim();
        setConversation(invalid(partial) ? undefined : completeWords || undefined);
      });
      setConversation(invalid(modelReply)
        ? (knownDestination ? 'Waar wilt u worden opgehaald?' : 'Vanwaar en naar welke bestemming wilt u reizen?')
        : modelReply);
    } catch {
      if (alive.current) setChatError('Het gesprek is tijdelijk niet beschikbaar. U kunt nog steeds een rit aanvragen.');
    } finally {
      chatPending.current = false;
      if (alive.current) setResponding(false);
    }
  }

  async function lookup(event: FormEvent) {
    event.preventDefault();
    if (pending.current || !reference.trim()) return;
    pending.current = true;
    setBusy(true);
    setStatus('');
    try {
      const ride = await readBookingStatus(reference, import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be');
      if (alive.current) setStatus(`${ride.referenceCode}: ${statusLabel[ride.status]}.`);
    } catch (error) {
      if (alive.current) setStatus(error instanceof Error ? error.message : 'De aanvraagstatus kan nu niet worden bevestigd.');
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return (
    <aside className="fixed z-50 text-white" style={{ left: point.x, top: point.y }} aria-label="Moni Ride"
      onKeyDown={event => { if (event.key === 'Escape' && open) close(); }}>
      {open && (
        <section id="moni-live-help" style={panelStyle} className="flex flex-col gap-3 overflow-auto rounded-2xl border border-amber-400/40 bg-zinc-950 p-4 shadow-xl">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Moni Ride</h2>
            <button type="button" onClick={close}>Sluiten</button>
          </header>
          <div ref={transcript} role="log" aria-label="Gesprek met Moni Ride" className="min-h-16 max-h-52 space-y-3 overflow-y-auto text-sm">
            <p>Hallo. Waar wilt u naartoe? Ik help u met de prijsindicatie en uw ritaanvraag. Vul contactgegevens in bij het reserveren.</p>
            {exchanges.map(({ question: message, reply, conversation }, index) => (
              <div key={index} className="space-y-2">
                <p className="rounded-lg bg-zinc-800 p-2">{message}</p>
                {conversation && <p>{conversation}</p>}
                {(!conversation || reply.destination || reply.prices) && <p>{reply.text}</p>}
                {reply.booking && <Link className="mr-3 text-amber-300 underline" to="/booking" state={{ destination: reply.destination }}>Rit aanvragen</Link>}
                {reply.prices && <a className="text-amber-300 underline" href="#prijzen" onClick={() => setOpen(false)}>Bekijk tarieven</a>}
              </div>
            ))}
          </div>
          {responding && <p role="status">Moni Ride schrijft…</p>}
          {chatError && <p role="status">{chatError}</p>}
          <form onSubmit={send} className="flex gap-2">
            <input ref={input} className="min-w-0 flex-1 rounded bg-zinc-800 p-2" aria-label="Uw bericht" placeholder="Bijvoorbeeld: prijs naar Zaventem" disabled={responding} required maxLength={300} value={question} onChange={event => setQuestion(event.target.value)} />
            <button className="text-amber-300" type="submit" disabled={responding}>Verstuur</button>
          </form>
          <div className="flex flex-wrap gap-3 text-sm text-amber-300">
            <Link to="/booking">Rit aanvragen</Link>
            <a href="#prijzen" onClick={() => setOpen(false)}>Tarieven</a>
            <button type="button" aria-expanded={statusOpen} onClick={() => setStatusOpen(value => !value)}>Ritstatus</button>
          </div>
          {statusOpen && (
            <form onSubmit={lookup} className="space-y-2 text-sm">
              <label className="block">Uw referentiecode
                <input className="mt-1 block w-full rounded bg-zinc-800 p-2" required maxLength={100} value={reference} onChange={event => setReference(event.target.value)} />
              </label>
              <button className="text-amber-300" disabled={busy} type="submit">{busy ? 'Controleren…' : 'Status controleren'}</button>
              {status && <p role="status">{status}</p>}
            </form>
          )}
        </section>
      )}
      <button ref={launcher} type="button" className="grid h-12 w-12 place-items-center rounded-full border border-amber-400/60 bg-zinc-950 text-amber-300 shadow-lg"
        aria-label={open ? 'Moni Ride sluiten' : 'Moni Ride openen'} aria-expanded={open} aria-controls={open ? 'moni-live-help' : undefined}
        style={{ touchAction: 'none', cursor: 'grab', userSelect: 'none' }}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
        onPointerCancel={endDrag} onLostPointerCapture={endDrag}
        onClick={event => {
          if (event.detail !== 0 && skipClick.current) return;
          if (open) close(); else setOpen(true);
        }}>
        <span aria-hidden="true" className="text-lg font-semibold">M</span>
      </button>
    </aside>
  );
}
