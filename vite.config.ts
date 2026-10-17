import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Serves /api/chat, /api/research and /api/proposals during `npm run dev` so chat and web research work locally.
const chatApi = (): Plugin => ({
  name: 'graphember-chat-api',
  async configureServer(server) {
    const { handleChat } = await import('./server/chat.mjs')
    server.middlewares.use('/api/chat', (req, res) => {
      void handleChat(req, res)
    })
    const { handleResearch, handleProposals } = await import('./server/research.mjs')
    server.middlewares.use('/api/research', (req, res) => {
      void handleResearch(req, res)
    })
    server.middlewares.use('/api/proposals', (req, res) => {
      void handleProposals(req, res)
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expose ANTHROPIC_API_KEY from .env files to the dev server (never to the browser bundle)
  const env = loadEnv(mode, process.cwd(), 'ANTHROPIC_')
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    // Relative asset paths so the build works from any static host or subfolder
    base: './',
    plugins: [react(), chatApi()],
    // The review queue is written while the dev server runs; don't reload the page when it changes
    server: { watch: { ignored: ['**/data/research/**'] } },
  }
})
