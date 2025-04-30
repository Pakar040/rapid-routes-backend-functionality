export type UUID = string;

// A single chat message
export interface Message {
  messageId: UUID;
  speaker: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
  embedding?: number[]; // vector embedding
}

// A chat session container
export interface Session {
  sessionId: UUID;
  createdAt: Date;
}

// for LLM calls
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topK?: number;
  // allow other adapter‐specific fields without using `any`, i.e. 'gpt-4'
  [key: string]: unknown;
}

// Result of an LLM call
export interface GenerateResult {
  text: string;
  tokensUsed: number;
}

// Adapter contract for any LLM (HTTP or local)
export interface ModelClient {
  /**
   * Send a prompt to the model and receive generated text.
   * @param prompt The full prompt to send.
   * @param options Generation settings (maxTokens, temperature, etc).
   */
  generate(
    prompt: string,
    options?: GenerateOptions
  ): Promise<GenerateResult>;
}

// configuration for the chatbot SDK
export interface ChatbotConfig {
  neo4jUri: string;
  neo4jAuth: {
    user: string;
    pass: string;
  };
  modelClient: ModelClient;
  retrieval: {
    // Number of neighbors to fetch from Neo4j vector index
    k: number;
    // Minimum similarity score (0-1) to include in context
    similarityThreshold?: number;
  };
}
