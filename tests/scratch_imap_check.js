const { ImapFlow } = require('imapflow');
require('dotenv').config();

async function run() {
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;
  
  console.log(`Connecting to IMAP with user: ${user}...`);
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false
  });

  await client.connect();
  console.log('Connected!');
  
  const lock = await client.getMailboxLock('INBOX');
  console.log('Mailbox locked!');
  
  try {
    const messages = await client.search({ all: true });
    console.log(`Total messages in INBOX: ${messages.length}`);
    
    // Fetch last 10 messages
    const last10 = messages.slice(-10);
    for (let i = last10.length - 1; i >= 0; i--) {
      const msgId = last10[i];
      const message = await client.fetchOne(msgId, { source: true, envelope: true });
      const sourceStr = message.source.toString();
      
      console.log(`\n--- Message ID: ${msgId} ---`);
      console.log(`Subject: ${message.envelope.subject}`);
      console.log(`To: ${JSON.stringify(message.envelope.to)}`);
      
      // Look for magic link in the source
      let decodedSource = sourceStr.replace(/=3D/g, '=');
      decodedSource = decodedSource.replace(/=\r?\n/g, '');
      decodedSource = decodedSource.replace(/=\n/g, '');
      decodedSource = decodedSource.replace(/&amp;/g, '&');
      
      const regex = /https:\/\/[^\s"'>]+/g;
      const matches = decodedSource.match(regex);
      const magicLink = matches ? matches.find(u => u.includes('email-verify') || u.includes('token')) : null;
      console.log(`Magic link found: ${magicLink}`);
    }
  } finally {
    lock.release();
    await client.logout();
    console.log('Logged out.');
  }
}

run().catch(console.error);
