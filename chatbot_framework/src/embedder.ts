interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

export async function computeEmbedding(text: string): Promise<number[]> {
    const resp = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
                'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: text,
        }),
    });

    const body = (await resp.json()) as OpenAIEmbeddingResponse;
    const [first] = body.data;
    if (!first) {
        throw new Error('No embedding returned from OpenAI');
    }

    return first.embedding;
}
