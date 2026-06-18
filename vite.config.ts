import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // Proxy les APIs PHP vers le serveur PHP local
      '/api/db_api.php': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/chat_ai.php': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})
