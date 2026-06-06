import { runRuntimeVerification } from './runtime-verification.service.js';
import { runRestoreValidation } from './restore-validation.service.js';

async function main() {
  const command = process.argv[2] ?? 'runtime:verify';
  const result = command === 'restore:validate' ? await runRestoreValidation() : await runRuntimeVerification();
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'blocked') process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
