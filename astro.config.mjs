import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  // Netlify Functions (Node) — necesario para /api/contact con Nodemailer
  adapter: netlify({ edge: false }),
  vite: {
    ssr: {
      external: ['nodemailer']
    }
  }
});
