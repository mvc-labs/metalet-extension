/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import alias from '@rollup/plugin-alias'
import nodePolyfills from 'rollup-plugin-polyfill-node'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
  },

  plugins: [alias(), vue(), svgLoader()],
  resolve: {
    // alias: {
    //   '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    // },
    alias: [{ find: '@', replacement: '/src' }],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      plugins: [nodePolyfills()],
      input: {
        index: new URL('./popup.html', import.meta.url).pathname,
      },
    },
  },
})
