import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function readPageContent(path) {
  const source = await readFile(path, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`En-tête YAML manquant dans ${path}.`);
  return { data: parse(match[1]), body: match[2].trim() };
}
