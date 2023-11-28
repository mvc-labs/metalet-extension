import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import wasm from 'vite-plugin-wasm'

import baseConfig from './vite.base.config'

const env = loadEnv('', process.cwd())

export default defineConfig({
  ...baseConfig,
  build: {
    minify: env.VITE_ENVIRONMENT !== 'development',
    emptyOutDir: false,
    outDir: resolve(__dirname, '../dist'),
    lib: {
      entry: resolve(__dirname, '../src/background.ts'),
      name: 'Metalet',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.global.js',
        extend: true,
      },
    },
  },
  worker: {
    // Not needed with vite-plugin-top-level-await >= 1.3.0
    // format: "es",
    plugins: [wasm()],
  },
})
