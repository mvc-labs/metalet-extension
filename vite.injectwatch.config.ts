import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import baseConfig from './vite.base.config'

export default defineConfig({
  ...baseConfig,
  plugins: [
    vue(),
    {
      name: 'watch-external',
      buildStart() {
        this.addWatchFile(resolve(__dirname, 'public/content.js'))
      },
    },
  ],
  define: {
    'process.env': {},
  },
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'src/content-script/inject.ts'),
      name: 'Metalet',
    },
    watch: {
      include: ['src/content-script/inject.ts', 'public/content.js'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
})
