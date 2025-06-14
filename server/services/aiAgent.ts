import { assemblePrompt } from './promptAssembler.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAiAgent(docType: string, fileText: string): Promise<string> {
  const systemPrompt = await assemblePrompt(docType);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: fileText }
    ],
    temperature: 0.2
  });

  return response.choices[0].message.content || '';
}