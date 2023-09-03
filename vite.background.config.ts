import { resolve } from 'path'
import { defineConfig } from 'vite'
import baseConfig from './vite.base.config'

export default defineConfig({
  ...baseConfig,
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/background.ts'),
      name: 'Metalet',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.global.js',
        extend: true,
      },
    },
  },
})
