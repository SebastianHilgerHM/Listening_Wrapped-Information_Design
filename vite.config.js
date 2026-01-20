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
  // Base path for GitHub Pages - change 'Site-Code' to your repository name
  // Use '/' if deploying to username.github.io (user site)
  // Use '/repository-name/' if deploying to username.github.io/repository-name (project site)
  base: process.env.GITHUB_ACTIONS ? '/Site-Code/' : '/',
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
