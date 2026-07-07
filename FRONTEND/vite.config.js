import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
     tailwindcss(),
     react()
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning threshold to 1MB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split third-party vendor dependencies into a separate chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
