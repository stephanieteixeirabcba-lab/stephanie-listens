import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        quiz: './quiz.html',
        teaching: './teaching.html',
        ceus: './ceus.html',
        supervisorGuide: './supervisor-guide.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
