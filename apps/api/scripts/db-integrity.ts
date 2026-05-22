import { runIntegrityCheck } from '../src/modules/persistence/sqlite.persistence.js';

const result = runIntegrityCheck();

if (!result.ok) {
  console.error('SQLite integrity check failed.');
  for (const line of result.details) {
    console.error(` - ${line}`);
  }
  process.exit(1);
}

console.log('SQLite integrity check passed.');
