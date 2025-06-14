import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadMegaPrompt = (docType: string): string => {
  try {
    const promptPath = path.join(__dirname, '../../prompts/mega', `${docType}_complete.txt`);
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn(`Failed to load mega-prompt for ${docType}, falling back to modular assembly`);
    throw error;
  }
};

export async function getMegaPrompt(docType: string): Promise<string> {
  try {
    return loadMegaPrompt(docType);
  } catch (error) {
    // Fallback to contract mega-prompt if specific type not found
    console.log(`Document type ${docType} not found, using general contract analysis`);
    return loadMegaPrompt('contract');
  }
}

export function getAvailableMegaPrompts(): string[] {
  try {
    const megaDir = path.join(__dirname, '../../prompts/mega');
    const files = fs.readdirSync(megaDir);
    return files
      .filter(file => file.endsWith('_complete.txt'))
      .map(file => file.replace('_complete.txt', ''));
  } catch (error) {
    console.warn('No mega-prompts directory found');
    return [];
  }
}