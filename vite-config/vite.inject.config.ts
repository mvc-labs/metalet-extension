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
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, '../dist'),
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, '../src/content-script/inject.ts'),
      name: 'Metalet',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
})
