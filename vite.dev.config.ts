/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import { URL } from 'url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import baseConfig from './vite.base.config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { resolve } from 'path'

const env = loadEnv('', process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 5146,
  },

  plugins: [alias(), vue(), wasm(), topLevelAwait(), svgLoader()],
  build: {
    minify: env.VITE_ENVIRONMENT === 'production',
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: new URL('./index.html', import.meta.url).pathname,
      },
    },
  },
  // worker: {
  // Not needed with vite-plugin-top-level-await >= 1.3.0
  // format: "es",
  // plugins: [wasm()],
  // },
})
