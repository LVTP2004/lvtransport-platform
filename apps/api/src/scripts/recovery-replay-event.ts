import { getReplayState, openRecoveryDb, parseReplayArgs, printResult, writeReplayAudit } from './manual-replay.shared.js';

const target = process.argv[1]?.includes('notifications')
  ? 'notifications:retry'
  : process.argv[1]?.includes('messages')
    ? 'messages:replay'
    : 'recovery:replay:event';

try {
  const options = parseReplayArgs(process.argv.slice(2), target);
  const db = openRecoveryDb();
  const state = getReplayState(db, options.id, options.replaySource);

  if (options.dryRun) {
    printResult({
      ok: true,
      mode: 'dry-run',
      target,
      id: options.id,
      reason: options.reason ?? null,
      replaySource: options.replaySource,
      replayedBy: options.replayedBy,
      alreadyReplayed: Boolean(state),
      willMutate: false,
      action: state ? 'noop.already_replayed' : 'would.replay',
      details: {
        summary: 'Dry-run only. No SQLite mutation, no audit event append, no external retries.',
        existingReplay: state ?? null,
      },
    });
    process.exit(0);
  }

  if (state) {
    printResult({
      ok: true,
      mode: 'execute',
      target,
      id: options.id,
      reason: options.reason ?? null,
      replaySource: options.replaySource,
      replayedBy: options.replayedBy,
      alreadyReplayed: true,
      willMutate: false,
      action: 'noop.already_replayed',
      details: { existingReplay: state },
    });
    process.exit(0);
  }

  const audit = writeReplayAudit({
    db,
    id: options.id,
    source: options.replaySource,
    reason: options.reason!,
    replayedBy: options.replayedBy,
    action: `${target}.executed`,
  });

  const updated = getReplayState(db, options.id, options.replaySource);
  printResult({
    ok: true,
    mode: 'execute',
    target,
    id: options.id,
    reason: options.reason ?? null,
    replaySource: options.replaySource,
    replayedBy: options.replayedBy,
    alreadyReplayed: false,
    willMutate: true,
    action: 'replay.executed',
    details: { replayMetadata: updated, audit },
  });
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown replay failure';
  process.stderr.write(`${JSON.stringify({ ok: false, error: message }, null, 2)}\n`);
  process.exit(1);
}
