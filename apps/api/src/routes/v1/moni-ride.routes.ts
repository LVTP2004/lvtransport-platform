import type { Request, Response } from 'express';

let inFlight = 0;

async function streamReply(upstream: ReadableStream<Uint8Array>, res: Response) {
  res.set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let length = 0;
  try {
    while (!res.destroyed) {
      const { done, value } = await reader.read();
      if (done) throw new Error('Incomplete model response');
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error('Model unavailable');
        if (typeof event.message?.content === 'string' && length < 600) {
          const delta = event.message.content.slice(0, 600 - length);
          length += delta.length;
          if (delta) res.write(JSON.stringify({ delta }) + '\n');
        }
        if (event.done === true) {
          if (!length) throw new Error('Empty model response');
          res.end(JSON.stringify({ done: true }) + '\n');
          return;
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export async function respondToMoniRide(req: Request, res: Response) {
  res.set('Cache-Control', 'no-store');
  const history: unknown = req.body?.messages;
  if (!Array.isArray(history) || history.length < 1 || history.length > 9 ||
    history.some((message, index) => !message ||
      message.role !== (index % 2 === 0 ? 'user' : 'assistant') ||
      typeof message.content !== 'string' || !message.content.trim() || message.content.length > 600) ||
    history.length % 2 === 0) {
    return res.status(400).json({ error: 'Ongeldige gespreksgegevens.' });
  }
  if (inFlight >= 2) return res.status(429).json({ error: 'Moni Ride is even bezet.' });

  const stream = req.body?.stream === true;
  const clientClosed = new AbortController();
  const cancel = () => clientClosed.abort();
  res.once('close', cancel);
  inFlight++;
  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.any([AbortSignal.timeout(28000), clientClosed.signal]),
      body: JSON.stringify({
        model: 'qwen3:1.7b', stream, think: false,
        options: { num_ctx: 3072, num_predict: 75, temperature: 0.15 },
        messages: [{
          role: 'system',
          content: 'Je bent MONI Ride. Antwoord met één korte, natuurlijke zin in de taal van de reiziger. Gebruik het gesprek om één ontbrekend ritgegeven te vragen, zoals vertrekadres, bestemming of tijd. Als alles bekend is, verwijs naar het reserveringsformulier. Gebruik nooit cijfers, prijzen, valuta of verzonnen ritgegevens. Het scherm toont gepubliceerde prijzen apart. Maak of bevestig geen reserveringen.',
        }, ...history.map(({ role, content }) => ({ role, content }))],
      }),
    });
    if (!response.ok) throw new Error('Model unavailable');
    if (stream) {
      if (!response.body) throw new Error('Empty model stream');
      await streamReply(response.body, res);
      return;
    }
    const reply: unknown = (await response.json())?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('Empty model response');
    return res.json({ reply: reply.trim().slice(0, 600) });
  } catch {
    if (res.destroyed) return;
    if (res.headersSent) {
      res.end(JSON.stringify({ error: 'Moni Ride kan nu geen antwoord geven.' }) + '\n');
      return;
    }
    return res.status(503).json({ error: 'Moni Ride kan nu geen antwoord geven.' });
  } finally {
    res.off('close', cancel);
    inFlight--;
  }
}
