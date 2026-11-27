import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { EmailCodePortal } from '../auth/services/email-code.service.js';

const emailAddress = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function curlValue(value: string) {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/** Use the runtime's existing cURL SMTP client, enforcing TLS even on a STARTTLS port. */
export function configuredEmailCodeSender(env: NodeJS.ProcessEnv = process.env) {
  const { SMTP_HOST: host, SMTP_PORT: rawPort, SMTP_SECURE: secure, SMTP_USER: user, SMTP_PASS: password } = env;
  if (!host || !rawPort || !user || !password) return;
  const from = env.MAIL_FROM_ADDRESS || user;
  const port = Number(rawPort);
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(host) || !/^\d{1,5}$/.test(rawPort)
    || port < 1 || port > 65535 || ![undefined, 'true', 'false'].includes(secure)
    || !emailAddress.test(from) || /[:\x00-\x1f\x7f]/.test(user) || /[\x00-\x1f\x7f]/.test(password)) {
    throw new Error('Invalid email code SMTP configuration');
  }
  const url = (secure === 'true' || (secure === undefined && port === 465) ? 'smtps://' : 'smtp://') + host + ':' + port;

  return async (email: string, code: string, portal: EmailCodePortal) => {
    if (!emailAddress.test(email) || !/^\d{6}$/.test(code)) throw Error('Invalid email code recipient');
    const directory = await mkdtemp(join(tmpdir(), 'lvtp-code-'));
    try {
      const message = join(directory, 'message.txt');
      await writeFile(message, [
        'From: ' + from,
        'To: ' + email,
        'Date: ' + new Date().toUTCString(),
        'Subject: LVTransport sign-in code',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        'Your LVTransport ' + portal + ' sign-in code is: ' + code,
        'It expires in 5 minutes. If you did not request it, ignore this email.',
        '',
      ].join('\r\n'), { mode: 0o600, flag: 'wx' });
      const config = [
        'url = ' + curlValue(url),
        'user = ' + curlValue(user + ':' + password),
        'mail-from = ' + curlValue(from),
        'mail-rcpt = ' + curlValue(email),
        'upload-file = ' + curlValue(message),
        'proto = "=smtp,smtps"', 'ssl-reqd', 'silent', 'connect-timeout = 4', 'max-time = 8', '',
      ].join('\n');
      await new Promise<void>((resolve, reject) => {
        const child = spawn('/usr/bin/curl', ['-q', '--config', '-'], {
          env: {}, stdio: ['pipe', 'ignore', 'ignore'], timeout: 10_000,
        });
        child.on('error', () => reject(Error('Email code delivery could not start')));
        child.on('close', status => status === 0 ? resolve() : reject(Error('Email code delivery failed')));
        child.stdin.on('error', () => {});
        child.stdin.end(config);
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  };
}
