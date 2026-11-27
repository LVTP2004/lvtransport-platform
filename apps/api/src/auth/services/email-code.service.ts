import type { Auth } from 'firebase-admin/auth';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

const lifetimeMs = 5 * 60_000;
const resendMs = 60_000;
const maxAttempts = 5;
const maxOutstanding = 5_000;
const rolesByPortal = {
  admin: ['admin', 'super_admin'],
  driver: ['driver'],
  customer: ['customer'],
  founder: ['founder'],
} as const;

export type EmailCodePortal = keyof typeof rolesByPortal;
export function isEmailCodePortal(value: unknown): value is EmailCodePortal {
  return typeof value === 'string' && Object.hasOwn(rolesByPortal, value);
}

type Recipient = { uid: string; email: string; emailVerified: boolean; disabled: boolean; role: string; status: string };
type Challenge = {
  emailKey: string;
  portal: EmailCodePortal;
  recipientId: string | undefined;
  digest: string;
  expiresAt: number;
  attempts: number;
};
type Dependencies = {
  signingKey: Buffer;
  lookup: (email: string) => Promise<Recipient | undefined>;
  send: (email: string, code: string, portal: EmailCodePortal) => Promise<void>;
  mintSession: (uid: string) => Promise<string>;
};

type FirebaseEmailCodeOptions = Pick<Dependencies, 'signingKey' | 'send'>;

export function createFirebaseEmailCodeService(auth: Pick<Auth, 'getUserByEmail' | 'createCustomToken'>,
  { signingKey, send }: FirebaseEmailCodeOptions) {
  return createEmailCodeService({
    signingKey,
    send,
    async lookup(email) {
      const account = await auth.getUserByEmail(email);
      if (!account.email) return;
      const role = account.customClaims?.role;
      const status = account.customClaims?.status;
      // Verified accounts without claims can use the customer portal only.
      const unassigned = role === undefined && status === undefined;
      return {
        uid: account.uid,
        email: account.email,
        emailVerified: account.emailVerified,
        disabled: account.disabled,
        role: unassigned ? 'customer' : typeof role === 'string' ? role : '',
        status: unassigned ? 'active' : typeof status === 'string' ? status : '',
      };
    },
    mintSession: uid => auth.createCustomToken(uid),
  });
}

/** Challenges are process-local. A restart invalidates unused codes. */
export function createEmailCodeService({ signingKey, lookup, send, mintSession }: Dependencies, now = Date.now) {
  if (signingKey.byteLength < 32) throw new Error('Email code key must be at least 32 bytes');
  const challenges = new Map<string, Challenge>();
  const recent = new Map<string, number>();
  let pendingDeliveries = 0;
  const hash = (...parts: string[]) => createHmac('sha256', signingKey).update(JSON.stringify(parts)).digest('hex');

  function eligible(recipient: Recipient | undefined, email: string, portal: EmailCodePortal): recipient is Recipient {
    const roles: readonly string[] = rolesByPortal[portal];
    return Boolean(recipient?.uid && recipient.email.toLowerCase() === email && recipient.emailVerified
      && !recipient.disabled && recipient.status === 'active' && roles.includes(recipient.role));
  }

  function prune(at: number) {
    for (const [id, entry] of challenges) if (entry.expiresAt <= at) challenges.delete(id);
    for (const [key, expiresAt] of recent) if (expiresAt <= at) recent.delete(key);
  }

  return {
    issue(email: string, portal: EmailCodePortal) {
      const challengeId = randomUUID();
      const emailKey = hash(email);
      const at = now();
      prune(at);
      if (recent.has(emailKey) || pendingDeliveries >= 20 || challenges.size >= maxOutstanding || recent.size >= maxOutstanding) return challengeId;

      recent.set(emailKey, at + resendMs);
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const digest = hash(challengeId, code);
      const entry: Challenge = { emailKey, portal, recipientId: undefined, digest, expiresAt: at + lifetimeMs, attempts: 0 };
      challenges.set(challengeId, entry);
      // Supersede earlier codes for this address and portal, even while delivery is pending.
      for (const [id, old] of challenges) {
        if (id !== challengeId && old.emailKey === emailKey && old.portal === portal) challenges.delete(id);
      }
      pendingDeliveries++;
      void (async () => {
        const recipient = await lookup(email);
        if (eligible(recipient, email, portal) && challenges.get(challengeId) === entry && entry.expiresAt > now()) {
          await send(recipient.email, code, portal);
          entry.recipientId = recipient.uid;
        }
      })().catch(() => {
        // The public response is the same for invalid accounts and delivery failures.
      }).finally(() => { pendingDeliveries--; });
      return challengeId;
    },
    async redeem(email: string, portal: EmailCodePortal, challengeId: string, code: string) {
      const entry = challenges.get(challengeId);
      if (!entry || entry.expiresAt <= now() || entry.portal !== portal || entry.emailKey !== hash(email)) return;
      entry.attempts++;
      const matches = timingSafeEqual(Buffer.from(entry.digest, 'hex'), Buffer.from(hash(challengeId, code), 'hex'));
      if (matches || entry.attempts >= maxAttempts) challenges.delete(challengeId);
      if (!matches || !entry.recipientId) return;
      const recipient = await lookup(email);
      if (eligible(recipient, email, portal) && recipient.uid === entry.recipientId && entry.expiresAt > now()) {
        return mintSession(recipient.uid);
      }
    },
  };
}
