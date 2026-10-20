import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the domain root by the Cloudflare Worker (see wrangler.toml),
// not a GitHub Pages subpath, so base stays '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
