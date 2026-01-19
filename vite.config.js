import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    },
    open: true
  }
});
