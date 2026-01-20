import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';

// Check if local HTTPS certificates exist (for local development only)
const httpsConfig = fs.existsSync('localhost-key.pem') && fs.existsSync('localhost.pem')
  ? {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    }
  : false;

export default defineConfig({
  plugins: [svelte()],
  base: process.env.GITHUB_ACTIONS ? '/Listening_Wrapped-Information_Design/' : '/',
  server: {
    port: 5173,
    https: httpsConfig,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
