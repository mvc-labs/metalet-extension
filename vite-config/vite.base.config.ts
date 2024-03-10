import { resolve } from 'path'
import tailwind from 'tailwindcss'
import wasm from 'vite-plugin-wasm'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue(), nodePolyfills(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
})
