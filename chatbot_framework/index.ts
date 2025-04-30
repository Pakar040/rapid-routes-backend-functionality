import { startSession, sendMessage, driver } from './src/sdk';

async function demo() {
  // Start a session
  const session = await startSession();
  console.log('✅ Session created:', session);

  // Send user messages
  const msg1 = await sendMessage(session.sessionId, 'Hello, chatbot!');
  console.log('✅ User message persisted:', msg1);

  const msg2 = await sendMessage(session.sessionId, 'How are you?');
  console.log('✅ Second user message:', msg2);
}

demo()
  .catch(err => {
    console.error('Demo failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await driver.close();
  });
