import OpenAI from 'openai';

export const openAi = new OpenAI({
  apiKey: import.meta.env.MAIN_VITE_OPENAI_API_KEY,
});

export { generateCaption } from '@src/main/libs/openai/vision';
export { summarize } from '@src/main/libs/openai/summarizer';
