import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import inject from '@rollup/plugin-inject'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/background.ts'),
      name: 'Metalet',
    },
    rollupOptions: {
      plugins: [
        // inject({
        //   Buffer: ['buffer', 'Buffer'],
        // }),
        nodePolyfills(),
      ],
      output: {
        entryFileNames: 'background.global.js',
        extend: true,
      },
    },
  },
})
