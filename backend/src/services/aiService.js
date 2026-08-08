import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Lazy client instantiation helper to prevent crash on server startup if API key is missing
let geminiClientInstance = null;
const getGeminiClient = () => {
  if (!geminiClientInstance) {
    const key = process.env.GEMINI_API_KEY || 'dummy_key';
    geminiClientInstance = new GoogleGenerativeAI(key);
  }
  return geminiClientInstance;
};

let openaiClientInstance = null;
const getOpenAIClient = () => {
  if (!openaiClientInstance) {
    const key = process.env.OPENAI_API_KEY || 'dummy_key';
    openaiClientInstance = new OpenAI({ apiKey: key });
  }
  return openaiClientInstance;
};

// ─── Gemini Provider ────────────────────────────────────────
const callGemini = async (prompt) => {
  const gemini = getGeminiClient();
  const model = gemini.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const usage = {
    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
  };
  return { text, usage };
};

// ─── OpenAI Provider ────────────────────────────────────────
const callOpenAI = async (prompt) => {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const text = response.choices[0].message.content;
  const usage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
  };
  return { text, usage };
};

// ─── Unified AI Call ────────────────────────────────────────
export const callAI = async (prompt) => {
  const provider = process.env.ACTIVE_AI_PROVIDER || 'gemini';
  const start = Date.now();

  let result;
  if (provider === 'openai') {
    result = await callOpenAI(prompt);
  } else {
    result = await callGemini(prompt);
  }

  const latency = Date.now() - start;
  return { ...result, provider, latency };
};

// ─── Safe JSON Parser ────────────────────────────────────────
export const parseAIJson = (text) => {
  try {
    // Remove markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response was not valid JSON');
  }
};
