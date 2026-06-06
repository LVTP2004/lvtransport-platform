import { validateOperationalTransition } from '../modules/interim-operations/services/operational-state-machines.js';

const readArg = (name: string): string | undefined => {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return arg?.slice(name.length + 3);
};

const entity = readArg('entity');
const from = readArg('from');
const to = readArg('to');

if (!entity || !from || !to) {
  console.log(JSON.stringify({ allowed: false, reason: 'MISSING_REQUIRED_ARGS', required: ['entity', 'from', 'to'] }));
  process.exit(1);
}

const result = validateOperationalTransition(entity, from, to);

console.log(
  JSON.stringify({
    entity,
    from,
    to,
    allowed: result.allowed,
    reason: result.reason
  })
);
