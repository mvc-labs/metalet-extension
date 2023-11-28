/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import { URL } from 'url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import baseConfig from './vite.base.config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const env = loadEnv('', process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  ...baseConfig,
  test: {
    globals: true,
  },

  plugins: [alias(), vue(), nodePolyfills(), wasm(), topLevelAwait(), svgLoader()],
  build: {
    minify: env.VITE_ENVIRONMENT !== 'development',
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: new URL('../index.html', import.meta.url).pathname,
      },
    },
  },
  // worker: {
  // Not needed with vite-plugin-top-level-await >= 1.3.0
  // format: "es",
  // plugins: [wasm()],
  // },
})
