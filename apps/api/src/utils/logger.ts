const redactKeys = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key', 'password', 'token', 'secret']);

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, (_key, currentValue) => {
      if (typeof _key === 'string' && redactKeys.has(_key.toLowerCase())) {
        return '[REDACTED]';
      }
      return currentValue;
    });
  } catch {
    return '[unserializable-meta]';
  }
};

const baseLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown): void => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  const serialized = safeStringify(payload);
  if (level === 'ERROR') {
    console.error(serialized);
    return;
  }
  if (level === 'WARN') {
    console.warn(serialized);
    return;
  }
  console.log(serialized);
};

export const logger = {
  info: (message: string, meta?: unknown): void => baseLog('INFO', message, meta),
  warn: (message: string, meta?: unknown): void => baseLog('WARN', message, meta),
  error: (message: string, meta?: unknown): void => baseLog('ERROR', message, meta),
};
