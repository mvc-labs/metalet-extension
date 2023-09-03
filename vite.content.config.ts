import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import baseConfig from './vite.base.config'

export default defineConfig({
  ...baseConfig,
  plugins: [vue()],
  define: {
    'process.env': {},
  },
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'public'),
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'src/content-script/main.ts'),
      name: 'Metalet',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'content.js',
        extend: true,
      },
    },
  },
})
