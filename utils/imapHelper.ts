import fs from 'fs';
import path from 'path';
import type { ImapFlow as ImapFlowType } from 'imapflow';

/**
 * Connects to Gmail via IMAP and searches for the magic sign-in link
 * sent to the recipientEmail.
 */
export async function getMagicLinkFromEmail(recipientEmail: string, startTime: number): Promise<string> {
  let user = process.env.IMAP_USER;
  let pass = process.env.IMAP_PASSWORD;

  if (!user || !pass) {
    throw new Error('IMAP_USER and IMAP_PASSWORD must be configured in your .env file.');
  }

  // Auto-correct if IMAP_USER and IMAP_PASSWORD were swapped in .env
  if (!user.includes('@') && pass.includes('@')) {
    const temp = user;
    user = pass;
    pass = temp;
  }

  // Lazy load ImapFlow dynamically at runtime so Playwright test discovery in VS Code doesn't evaluate the package
  const { ImapFlow } = await import('imapflow');
  const client: ImapFlowType = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false
  });

  client.on('error', (err: any) => {
    console.log(`IMAP client background error: ${err.message}`);
  });

  await client.connect();
  
  const mailboxesToTry = ['INBOX', '[Gmail]/All Mail', '[Gmail]/Spam'];
  let matchedMsgId: any = null;
  let activeLock: any = null;
  let activeBoxName = 'INBOX';

  for (const box of mailboxesToTry) {
    try {
      activeLock = await client.getMailboxLock(box);
      activeBoxName = box;
      const messages = await client.search({ all: true });
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        activeLock.release();
        activeLock = null;
        continue;
      }

      const last30 = messages.slice(-30);
      for (let i = last30.length - 1; i >= 0; i--) {
        const msgId = last30[i];
        const headerOnly = await client.fetchOne(msgId, { envelope: true, internalDate: true }).catch(() => null);
        if (!headerOnly || !headerOnly.envelope) continue;

        const toAddresses = headerOnly.envelope.to || [];
        const hasRecipient = toAddresses.some((addr: any) => {
          if (!addr.address) return false;
          const a = addr.address.toLowerCase();
          const r = recipientEmail.toLowerCase();
          return a === r || a.includes(r) || r.includes(a);
        });

        const emailDate = headerOnly.internalDate ? new Date(headerOnly.internalDate) : null;
        const emailTime = emailDate ? emailDate.getTime() : 0;

        if (hasRecipient && emailTime >= startTime - 5 * 60 * 1000) {
          matchedMsgId = msgId;
          break;
        }
      }

      if (matchedMsgId) break;
      activeLock.release();
      activeLock = null;
    } catch {
      if (activeLock) {
        activeLock.release();
        activeLock = null;
      }
    }
  }

  try {
    if (!matchedMsgId) {
      throw new Error(`No new email found for recipient: ${recipientEmail} received after test start in INBOX, All Mail, or Spam.`);
    }

    // Download full source ONLY for the matching message
    const matchedMsg = await client.fetchOne(matchedMsgId, { source: true, internalDate: true, envelope: true });
    if (!matchedMsg || !matchedMsg.source) {
      throw new Error(`No email source buffer retrieved from IMAP server for ${recipientEmail}.`);
    }

    const messageSource = matchedMsg.source.toString();

    // Decode quoted-printable first to join split lines
    let decodedSource = messageSource.replace(/=3D/g, '=');
    decodedSource = decodedSource.replace(/=\r?\n/g, '');
    decodedSource = decodedSource.replace(/=\n/g, '');
    decodedSource = decodedSource.replace(/&amp;/g, '&');

    // Regex to locate any link starting with https://
    const regex = /https:\/\/[^\s"'<>]+/g;
    const matches = decodedSource.match(regex);

    if (!matches) {
      console.log('--- Matches failed. Writing source to email_source.txt ---');
      fs.writeFileSync('email_source.txt', messageSource);
      throw new Error('No links found in email content. Full source saved to email_source.txt.');
    }

    // Filter to find the link that is for email-verify, token, callback, login, verify, auth, or target domain
    const magicLink = matches.find((u: string) => 
      u.includes('email-verify') || u.includes('token') || u.includes('callback') || 
      u.includes('login') || u.includes('verify') || u.includes('auth') || u.includes('avua.online')
    );
    if (!magicLink) {
      console.log('[imapHelper] Extracted URLs in email body:', matches);
      const fallbackLink = matches.find((u: string) => !u.endsWith('.png') && !u.endsWith('.jpg') && !u.endsWith('.svg') && !u.includes('schema.org'));
      if (fallbackLink) return fallbackLink;
      throw new Error(`No valid sign-in magic link found among ${matches.length} extracted URLs: ${matches.slice(0, 3).join(', ')}`);
    }

    return magicLink;
  } finally {
    if (activeLock) {
      try { activeLock.release(); } catch {}
    }
    await client.logout().catch(() => {});
  }
}

/**
 * Polls the Gmail inbox until the magic link email arrives and is successfully parsed.
 */
export async function pollForMagicLink(recipientEmail: string, startTime: number, maxAttempts = 25): Promise<string> {
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;
  if (!user || !pass) {
    throw new Error('IMAP_USER and IMAP_PASSWORD must be configured in your environment or .env file to run IMAP email verification tests.');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Polling for magic link email to ${recipientEmail} (Attempt ${attempt}/${maxAttempts})...`);
    try {
      const link = await getMagicLinkFromEmail(recipientEmail, startTime);
      if (link) {
        return link;
      }
    } catch (e: any) {
      console.log(`Attempt ${attempt} failed: ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  throw new Error(`Timeout waiting for magic link email to ${recipientEmail}`);
}

/**
 * Generates a unique email counter for test isolation.
 * In CI, derives from GITHUB_RUN_NUMBER to avoid file-based state.
 * Locally, uses an atomic directory lock for parallel safety.
 * 
 * @param testSuffix - A per-test offset (e.g., 1 for tc25, 2 for tc26) to avoid collisions in parallel CI runs
 */
export function getUniqueEmailCount(testSuffix: number): number {
  if (process.env.CI) {
    const runNumber = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
    const runAttempt = parseInt(process.env.GITHUB_RUN_ATTEMPT || '1', 10);
    return 10000 + (runNumber * 100) + (runAttempt * 10) + testSuffix;
  }

  const counterFile = path.join(__dirname, '..', 'tests', 'email_counter.json');
  const lockDir = counterFile + '.lock';
  let acquired = false;

  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      fs.mkdirSync(lockDir);
      acquired = true;
      break;
    } catch (e) {
      const delay = Math.floor(Math.random() * 50) + 10;
      const start = Date.now();
      while (Date.now() - start < delay) { }
    }
  }

  let count = 60;
  try {
    if (fs.existsSync(counterFile)) {
      const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
      count = (data.count || 59) + 1;
    }
    fs.writeFileSync(counterFile, JSON.stringify({ count }));
  } finally {
    if (acquired) {
      try {
        fs.rmdirSync(lockDir);
      } catch (e) { }
    }
  }

  return count;
}
