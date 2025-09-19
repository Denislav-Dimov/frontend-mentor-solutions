import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/url-shortening-api/',
  plugins: [tailwindcss()]
});