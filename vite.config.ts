import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const resolvedApiKey =
    process.env.VITE_AI_API_KEY || env.VITE_AI_API_KEY || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.API_KEY || env.API_KEY || '';
  const resolvedModel =
    process.env.VITE_AI_MODEL || env.VITE_AI_MODEL || process.env.AI_MODEL || env.AI_MODEL || 'gemini-2.5-flash';
  const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET || env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8787';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(resolvedApiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(resolvedApiKey),
      'process.env.AI_MODEL': JSON.stringify(resolvedModel),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
