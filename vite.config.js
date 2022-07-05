
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:15000/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

    }
  },
  build: {
    target: ['edge90', 'chrome90', 'firefox90', 'safari15']
  },
  plugins: [
    vue(),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        AntDesignVueResolver({
          resolveIcons: true,
        })
      ],
    }),
  ],
})
