import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    port: 3001
  },
  build: {
    assets: 'assets'
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
});
