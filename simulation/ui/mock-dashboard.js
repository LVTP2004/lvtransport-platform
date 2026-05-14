const metrics = [
  ['Bookings completion', '5/7'],
  ['Avg satisfaction', '6.90/10'],
  ['Fallback activations', '4'],
  ['Readiness', '71.73%']
];

const conversations = [
  'Standard klant: prijs + ophaaltijd helder bevestigd.',
  'Airport klant: vluchtvertraging verwerkt met aangepaste pickup.',
  'VIP klant: terugkerende route + facturatie opgezet.',
  'Difficult klant: ETA-klacht gede-escaleerd met duidelijke updates.',
  'Multilingual klant: NL/EN/ES ondersteuning actief.'
];

const bookings = [
  'BK-SIM-001 bevestigd (website chat)',
  'BK-SIM-002 aangepast na airport delay',
  'BK-SIM-003 VIP recurring ingepland',
  'BK-SIM-004 hersteld na ontbrekende code',
  'BK-SIM-005 tracking-only stress scenario'
];

const events = [
  'Driver delayed → fallback communicatie geactiveerd',
  'API unavailable → handmatige flow gestart',
  'Missing route data → minimale validatie gevraagd',
  'Interrupted flow → context recovery voltooid',
  'Traffic issue → ETA herberekend en gedeeld'
];

fillCards(document.getElementById('metrics'), metrics, true);
fillCards(document.getElementById('conversations'), conversations);
fillCards(document.getElementById('bookings'), bookings);
fillCards(document.getElementById('events'), events);

function fillCards(target, list, metric = false) {
  list.forEach((entry) => {
    const el = document.createElement('div');
    el.className = metric ? 'card' : 'item';

    if (metric) {
      el.innerHTML = `<div class="label">${entry[0]}</div><div class="value">${entry[1]}</div>`;
    } else {
      el.textContent = entry;
    }

    target.appendChild(el);
  });
}
