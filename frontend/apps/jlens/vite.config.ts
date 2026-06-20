import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
 
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-scroll-area', '@radix-ui/react-accordion', '@radix-ui/react-tabs'],
          'vendor-markdown': ['react-markdown', 'rehype-raw', 'remark-gfm', 'react-syntax-highlighter'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/actions": path.resolve(__dirname,"./src/actions"),
      "@/auth": path.resolve(__dirname, "./src/auth"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      '@ui': path.resolve(__dirname, '../../packages/ui/dist'),
      "@query": path.resolve(__dirname, "./src/store"),
      "@context": path.resolve(__dirname, "./src/context"),
    },
  },
})
 