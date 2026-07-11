import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

const srcDir = path.resolve(__dirname, 'src');

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    resolve: {
      alias: [
        { find: 'react-router-dom', replacement: 'react-router' },
        // Mirrors tsconfig "paths": { "*": ["./src/*"] }
        // Explicit aliases ensure bare imports resolve in all environments
        { find: 'App', replacement: path.resolve(srcDir, 'app.tsx') },
        { find: 'config', replacement: path.resolve(srcDir, 'config.ts') },
        { find: 'api', replacement: path.resolve(srcDir, 'api') },
        { find: 'components', replacement: path.resolve(srcDir, 'components') },
        { find: 'context', replacement: path.resolve(srcDir, 'context') },
        { find: 'data', replacement: path.resolve(srcDir, 'data') },
        { find: 'helpers', replacement: path.resolve(srcDir, 'helpers') },
        { find: 'hooks', replacement: path.resolve(srcDir, 'hooks') },
        { find: 'layouts', replacement: path.resolve(srcDir, 'layouts') },
        { find: 'lib', replacement: path.resolve(srcDir, 'lib') },
        { find: 'pages', replacement: path.resolve(srcDir, 'pages') },
        { find: 'providers', replacement: path.resolve(srcDir, 'providers') },
        { find: 'reducers', replacement: path.resolve(srcDir, 'reducers') },
        { find: 'routes', replacement: path.resolve(srcDir, 'routes') },
        { find: 'theme', replacement: path.resolve(srcDir, 'theme') },
        { find: 'types', replacement: path.resolve(srcDir, 'types') },
      ],
    },
    plugins: [
      tsconfigPaths(),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-icon.svg'],
        manifest: {
          name: 'WorkSphere HRMS',
          short_name: 'WorkSphere',
          description:
            'Complete HR management platform for employee management, attendance tracking, payroll processing, and analytics.',
          theme_color: '#4F46E5',
          background_color: '#0B1120',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['business', 'productivity'],
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
                networkTimeoutSeconds: 10,
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-stylesheets' },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
      ...(mode !== 'production'
        ? [
            checker({
              typescript: true,
              eslint: {
                useFlatConfig: true,
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
              },
              overlay: {
                initialIsOpen: false,
              },
            }),
          ]
        : []),
    ],
    preview: {
      port: Number(process.env.VITE_APP_PORT || 5005),
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.VITE_APP_PORT || 5005),
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    base: process.env.NODE_ENV === 'production' ? process.env.VITE_BASENAME : '/',
  });
};
