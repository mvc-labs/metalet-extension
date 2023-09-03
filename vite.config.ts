/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { URL } from 'url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import baseConfig from './vite.base.config'

// https://vitejs.dev/config/
export default defineConfig({
  ...baseConfig,
  test: {
    globals: true,
  },

  plugins: [alias(), vue(), svgLoader()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: new URL('./popup.html', import.meta.url).pathname,
      },
    },
  },
})
