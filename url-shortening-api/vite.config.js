import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/url-shortening-api/',
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/shorten': {
        target: 'https://cleanuri.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/shorten/, '/api/v1/shorten')
      }
    }
  }
});