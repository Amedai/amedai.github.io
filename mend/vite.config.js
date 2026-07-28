import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }

          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'vendor-store'
          }

          if (id.includes('leaflet') || id.includes('geolinks')) {
            return 'vendor-map'
          }

          if (id.includes('axios')) {
            return 'vendor-api'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 3000
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
  base: '/%D0%BC%D0%B5%D0%BD%D0%B4%D0%B5%D0%BB%D0%B5%D0%B5%D0%B2%D1%81%D0%BA',
})
