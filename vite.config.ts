import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/market-prices')) {
          try {
            const apiModulePath = './api/market-prices.js';
            const { default: handler } = await import(apiModulePath);
            const urlObj = new URL(req.url, 'http://localhost');
            const symbols = urlObj.searchParams.get('symbols') || '';
            const mockReq = { query: { symbols }, method: req.method };
            const mockRes = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status: (code: number) => {
                res.statusCode = code;
                return {
                  json: (data: unknown) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end(),
                };
              },
            };
            await handler(mockReq, mockRes);
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    devApiPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FinTrack Rose - Smart Wealth & Expense',
        short_name: 'FinTrack',
        description: 'Personal Finance, Credit Card, and Wealth Tracker',
        theme_color: '#f43f5e',
        background_color: '#fff1f2',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
