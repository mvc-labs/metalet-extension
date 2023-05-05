import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import path from 'path'
import alias from '@rollup/plugin-alias'
import nodePolyfills from 'rollup-plugin-polyfill-node'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [alias(), vue(), svgLoader()],
  resolve: {
    alias: {
      // '@/': path.resolve(__dirname, './src/'),
    },
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
