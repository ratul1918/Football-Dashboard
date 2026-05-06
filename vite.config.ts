import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Handles `import x from "figma:asset/xxx.png"` — resolves to /imports/ at build time
function figmaAssetPlugin(): Plugin {
  const PREFIX = 'figma:asset/';
  return {
    name: 'figma-asset',
    resolveId(id) {
      if (id.startsWith(PREFIX)) return '\0' + id;
    },
    load(id) {
      if (id.startsWith('\0' + PREFIX)) {
        const file = id.slice(('\0' + PREFIX).length);
        // Return the file as a URL from the src/imports directory
        return `import asset from "/src/imports/${file}"; export default asset;`;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
  ],
  resolve: {
    alias: {
      // @ → src/
      '@': path.resolve(__dirname, './src'),
      // Absolute /utils → project-root utils/  (used by Supabase info.tsx)
      '/utils': path.resolve(__dirname, './utils'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.png', '**/*.jpg', '**/*.webp'],
})
