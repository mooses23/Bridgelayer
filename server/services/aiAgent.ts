import { getMegaPrompt } from './megaPromptLoader.js';
import { assemblePromptFromDocTypeWithVertical } from '@shared/assemblePrompt.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAiAgent(docType: string, fileText: string, firmId?: string | number): Promise<string> {
  let systemPrompt: string;
  
  if (firmId) {
    // Use vertical-aware prompt assembly
    systemPrompt = await assemblePromptFromDocTypeWithVertical(docType, firmId);
  } else {
    // Fallback to legacy mega prompt system
    systemPrompt = await getMegaPrompt(docType);
  }

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

// Legacy function for backward compatibility
export async function runAiAgentLegacy(docType: string, fileText: string): Promise<string> {
  return runAiAgent(docType, fileText);
}