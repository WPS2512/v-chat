import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 如果是 node_modules 里的第三方依赖，进行精准分包
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('@tanstack')) {
              return 'query';
            }
            // 其余所有 node_modules 依赖自动归类到 vendor
            return 'vendor';
          }
        },
      },
    },
  },
})
