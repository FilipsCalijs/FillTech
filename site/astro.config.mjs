import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://visaulio.com',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()], build: { chunkSizeWarningLimit: 600 } },
});
