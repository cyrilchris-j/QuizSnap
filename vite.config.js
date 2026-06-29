import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'eco-icon.svg'],
      manifest: {
        name: 'EcoQuest',
        short_name: 'EcoQuest',
        description: 'Gamified Environmental Education Platform',
        theme_color: '#0a2e1a',
        background_color: '#060f0a',
        display: 'standalone',
        icons: [
          {
            src: 'eco-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
