import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Simple template renderer using {{variable}} placeholders
export function renderTemplate(templateName: string, context: Record<string, any>): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templatePath = resolve(__dirname, `./templates/${templateName}.html`);
  let html = readFileSync(templatePath, 'utf8');

  html = html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const val = context[key];
    return val != null ? String(val) : '';
  });

  return html;
}
