/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import { URL } from 'url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import baseConfig from './vite.base.config'

const env = loadEnv('', process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  ...baseConfig,
  test: {
    globals: true,
  },

  plugins: [alias(), vue(), svgLoader()],
  build: {
    minify: env.VITE_ENVIRONMENT === 'production',
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: new URL('./popup.html', import.meta.url).pathname,
      },
    },
  },
})
