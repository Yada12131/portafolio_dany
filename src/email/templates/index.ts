// Templates loader for serverless (bundled at build time)
// Usage: import { renderTemplate } from '../../email/templates'

// Import HTML as raw strings so Netlify Functions can bundle them
// (no filesystem access required at runtime)
// Vite supports the ?raw suffix to import file contents as string
import contactTpl from './contact.html?raw';

const templates: Record<string, string> = {
  contact: contactTpl,
};

export function renderTemplate(name: string, ctx: Record<string, any>): string {
  const base = templates[name];
  if (!base) {
    throw new Error(`Template not found: ${name}`);
  }
  return base.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const val = ctx[key];
    return val != null ? String(val) : '';
  });
}
