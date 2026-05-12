const ITERATIONS = 120000;

const pseudoHash = (value: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(16);
};

export function hashPassword(password: string): string {
  const salt = Math.random().toString(16).slice(2, 18);
  let hash = `${salt}:${password}`;
  for (let i = 0; i < ITERATIONS; i += 1) hash = pseudoHash(hash);
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) return false;
  let hash = `${salt}:${password}`;
  for (let i = 0; i < ITERATIONS; i += 1) hash = pseudoHash(hash);
  return hash === expectedHash;
}
