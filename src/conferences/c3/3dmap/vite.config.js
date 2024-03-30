import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    //outDir: './dist',
    rollupOptions: {
      output: {
        dir: '../js/',
        entryFileNames: '3dmap.js',
        assetFileNames: '3dmap.css',
        chunkFileNames: 'chunk.js',
        manualChunks: undefined,
      }
    }
  }
})
