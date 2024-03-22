/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import baseConfig from './vite.base.config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import VueDevTools from 'vite-plugin-vue-devtools'
// import Inspector from 'vite-plugin-vue-inspector' // OR vite-plugin-vue-inspector

const env = loadEnv('', process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  ...baseConfig,
  plugins: [
    alias(),
    vue(),
    VueDevTools({
      // appendTo: 'src/App.vue',
    }),
    // Inspector(),
    nodePolyfills(),
    wasm(),
    topLevelAwait(),
    svgLoader(),
  ],

  server: {
    port: 5146,
    open: true,
  },
})
