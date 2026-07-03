import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

const srcDir = path.resolve(__dirname, 'src');

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    resolve: {
      alias: [
        { find: 'react-router-dom', replacement: 'react-router' },
        // Mirrors tsconfig "paths": { "*": ["./src/*"] }
        // Explicit aliases ensure bare imports resolve in all environments
        { find: 'App', replacement: path.resolve(srcDir, 'App') },
        { find: 'config', replacement: path.resolve(srcDir, 'config') },
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
