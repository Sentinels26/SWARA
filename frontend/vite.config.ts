import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    outDir: 'dist',
  },
  // Allow VITE_API_BASE_URL to be set at build time or runtime via import.meta.env
  define: {
    // No frontend secrets — API key lives only on the backend
  },
})
