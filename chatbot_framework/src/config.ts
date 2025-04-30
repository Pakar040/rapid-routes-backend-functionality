import dotenv from "dotenv";
import type { ChatbotConfig } from './types';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';

dotenv.config();

export const config: ChatbotConfig = {
    neo4jUri: process.env.NEO4J_URI!,
    neo4jAuth: {
        user: process.env.NEO4J_USERNAME!,
        pass: process.env.NEO4J_PASSWORD!,
    },
    modelClient: new OpenAIAdapter(process.env.OPENAI_API_KEY!, 'https://api.openai.com/v1'),
    retrieval: {
        k: 5,
        similarityThreshold: 0.75,
    },
};