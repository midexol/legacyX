import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // WalletConnect v2 and some SDKs reference `global`
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        // Split wallet SDKs into lazy chunks — they only load when user connects
        manualChunks(id) {
          if (id.includes('@walletconnect')) return 'walletconnect';
          if (id.includes('@coinbase/wallet-sdk')) return 'coinbase-sdk';
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@walletconnect/ethereum-provider'],
  },
});
