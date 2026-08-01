import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/wallet/WalletProvider';
import { VaultDataProvider } from './components/wallet/VaultDataProvider';
import RequireWallet from './components/wallet/RequireWallet';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import ParticleCanvas from './components/background/ParticleCanvas';
import CursorGlow from './components/background/CursorGlow';
import Landing     from './pages/Landing';
import Dashboard   from './pages/Dashboard';
import CreateVault from './pages/CreateVault';
import Marketplace from './pages/Marketplace';
import Unlock      from './pages/Unlock';

import './styles/tokens.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/components.css';

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <VaultDataProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            {/* Fixed background layers */}
            <ParticleCanvas />
            <CursorGlow />
            <div className="orb orb-blue"  aria-hidden="true" />
            <div className="orb orb-purple" aria-hidden="true" />
            <div className="orb orb-gold"  aria-hidden="true" />

            {/* Global nav */}
            <Navbar />

            {/* Page routes */}
            <Routes>
              <Route path="/"              element={<Landing />} />
              <Route path="/dashboard"     element={<RequireWallet><Dashboard /></RequireWallet>} />
              <Route path="/dashboard-demo" element={<Dashboard demoMode />} />
              <Route path="/vault"         element={<RequireWallet><CreateVault /></RequireWallet>} />
              <Route path="/marketplace"   element={<Marketplace />} />
              <Route path="/unlock"        element={<Unlock />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
        </VaultDataProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
