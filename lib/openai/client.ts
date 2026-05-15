import OpenAI from "openai";

// Singleton — reused across requests in the same process
let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(apiKey?: string): OpenAI {
  const key = apiKey ?? process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API key is required");

  // If a per-business key is provided, create a fresh instance
  if (apiKey) return new OpenAI({ apiKey });

  if (!openaiInstance) openaiInstance = new OpenAI({ apiKey: key });
  return openaiInstance;
}
