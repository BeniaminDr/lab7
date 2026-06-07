import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lab7/' : '/',
  plugins: [tailwindcss()],
  build: {
    target: ['es2022', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        login: resolve(process.cwd(), 'login.html'),
      },
    },
  },
}))
