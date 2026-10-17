import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Serves /api/chat during `npm run dev` so the chatbot works locally.
const chatApi = (): Plugin => ({
  name: 'graphember-chat-api',
  async configureServer(server) {
    const { handleChat } = await import('./server/chat.mjs')
    server.middlewares.use('/api/chat', (req, res) => {
      void handleChat(req, res)
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
  }
})
