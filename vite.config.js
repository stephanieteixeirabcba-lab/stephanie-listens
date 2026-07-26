import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        quiz: './quiz.html',
        sessionReset: './session-reset.html',
        teaching: './teaching.html',
        ceus: './ceus.html',
        remoteBcba: './remote-bcba.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
