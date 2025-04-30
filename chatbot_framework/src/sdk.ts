import type { Session, Message } from './types';
import neo4j from 'neo4j-driver';
import crypto from 'crypto';
import { config } from './config';
import { computeEmbedding } from './embedder';

export const driver = neo4j.driver(
    config.neo4jUri,
    neo4j.auth.basic(config.neo4jAuth.user, config.neo4jAuth.pass)
);

// Retry helper for transient DB errors
async function withRetries<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0) return withRetries(fn, retries - 1);
        throw err;
    }
}

// Creates or finds a Session node and returns its data.
export async function startSession(): Promise<Session> {
    const session = driver.session();
    const sessionId = crypto.randomUUID();
    try {
        const result = await withRetries(() =>
            session.executeWrite(tx =>
                tx.run(
                    `
                    MERGE (s:Session { sessionId: $sessionId })
                    ON CREATE SET s.createdAt = datetime()
                    RETURN s.sessionId AS sessionId, s.createdAt AS createdAt
                    `,
                    { sessionId }
                )
            )
        );
        const rec = result.records[0]!;
        return {
            sessionId: rec.get('sessionId'),
            createdAt: new Date(rec.get('createdAt').toString()),
        };
    } finally {
        await session.close();
    }
}

// Persists a user message and links it into the given session.
export async function sendMessage(
    sessionId: string,
    text: string
): Promise<Message> {
    const session = driver.session();
    const messageId = crypto.randomUUID();
    try {
        await withRetries(() =>
            session.executeWrite(tx =>
              tx.run(
                `
                MATCH (s:Session { sessionId: $sessionId })
                CREATE (m:Message {
                  messageId: $messageId,
                  speaker: 'user',
                  text: $text,
                  timestamp: datetime()
                })
                CREATE (s)-[:HAS_MESSAGE]->(m)
                RETURN m
                `,
                { sessionId, messageId, text }
              )
            )
        );

        const embedding = await computeEmbedding(text);

        await withRetries(() =>
            session.executeWrite(tx =>
              tx.run(
                `
                MATCH (m:Message { messageId: $messageId })
                SET m.embedding = $embedding
                `,
                { messageId, embedding }
              )
            )
        );
        return {
            messageId,
            speaker: 'user',
            text,
            timestamp: new Date(),
            embedding,
        };
    } finally {
        await session.close();
    }
}
