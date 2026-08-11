import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '../wallet/WalletProvider';
import '../../styles/wallet-modal.css';

/* ─── Static wallet registry ────────────────────────────────────────────── */
const WALLET_REGISTRY = [
  {
    id: 'metamask',
    name: 'MetaMask',
    tagline: 'Browser extension',
    detectKey: 'isMetaMask',
    installUrl: 'https://metamask.io/download/',
    icon: (
      <svg width="40" height="40" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
        <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
        <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 176.3,103.4 175.1,164.6 231.3,162.1"/>
        <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.2 111.4,208.1"/>
        <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.2 211.8,247.4 207.1,208.1"/>
        <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.2 180.6,253 180.3,262.3"/>
        <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.2"/>
        <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
        <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="179.7,193.5 187.9,176.1 208,185.2"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="207,206.8 211.8,247.4 238.3,207.7"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="231.3,162.1 175.1,164.6 179.8,193.5 188,176.1 208.1,185.2"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 130.7,176.1 138.8,193.5 144.1,164.6 87.8,162.1"/>
        <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 110.6,185.2"/>
        <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="208.1,185.2 207.1,208.1 231.3,162.1"/>
        <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7"/>
        <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="175.1,164.6 171.9,182.6 172.9,227.6 179.8,193.5"/>
        <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="179.8,193.5 172.9,227.6 177.9,230.2 207.1,208.1 208.1,185.2"/>
        <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 111.4,208.1 140.6,230.2 145.4,227.6 138.8,193.5"/>
        <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 140.1,271.9 178.4,271.9 200.9,256.4 211.8,247.4"/>
        <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.2 172.9,227.6 145.4,227.6 140.6,230.2 138.1,253 140.4,250.8 178.1,250.8 180.6,253"/>
        <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.8,136.4 281.8,129.1 275.6,124.3 283.6,118.2"/>
        <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="31.8,73.4 40.3,114.2 34.9,118.2 42.9,124.3 36.8,129.1 44.8,136.4 39.8,140 51.3,153.5 103.6,138.2 140.6,106.9 44.4,35.5"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="267.2,153.5 214.9,138.2 231.3,162.1 207.1,208.1 238.3,207.7 284.8,207.7"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 87.8,162.1"/>
        <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="175.1,164.6 177.9,106.9 193.2,65.8 125.6,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 172.9,227.6 173.1,182.8"/>
      </svg>
    ),
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    tagline: 'Browser extension · DeFi optimised',
    detectKey: 'isRabby',
    installUrl: 'https://rabby.io/',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rabby-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7084FF"/>
            <stop offset="100%" stopColor="#5162E8"/>
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="40" height="40" rx="11" fill="url(#rabby-bg)"/>
        {/* Left ear */}
        <path d="M11 18 C11 10 14 6 16.5 6 C18 6 19 7.5 19 10 L19 18 Z" fill="white" fillOpacity="0.95"/>
        {/* Left ear inner */}
        <path d="M12.5 17.5 C12.5 12 14.5 8.5 16.5 8.5 C17.3 8.5 17.8 9.5 17.8 11.5 L17.8 17.5 Z" fill="#FFB8C6" fillOpacity="0.7"/>
        {/* Right ear */}
        <path d="M29 18 C29 10 26 6 23.5 6 C22 6 21 7.5 21 10 L21 18 Z" fill="white" fillOpacity="0.95"/>
        {/* Right ear inner */}
        <path d="M27.5 17.5 C27.5 12 25.5 8.5 23.5 8.5 C22.7 8.5 22.2 9.5 22.2 11.5 L22.2 17.5 Z" fill="#FFB8C6" fillOpacity="0.7"/>
        {/* Head */}
        <ellipse cx="20" cy="24" rx="10" ry="9" fill="white" fillOpacity="0.96"/>
        {/* Left eye */}
        <circle cx="16.5" cy="22" r="2" fill="#5162E8"/>
        <circle cx="17.2" cy="21.3" r="0.7" fill="white"/>
        {/* Right eye */}
        <circle cx="23.5" cy="22" r="2" fill="#5162E8"/>
        <circle cx="24.2" cy="21.3" r="0.7" fill="white"/>
        {/* Nose */}
        <ellipse cx="20" cy="26" rx="1.2" ry="0.9" fill="#FFB8C6"/>
        {/* Mouth */}
        <path d="M18.2 27.2 Q20 28.8 21.8 27.2" stroke="#C0A0A8" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        {/* Cheeks */}
        <ellipse cx="14" cy="25.5" rx="2.2" ry="1.3" fill="#FFB8C6" fillOpacity="0.4"/>
        <ellipse cx="26" cy="25.5" rx="2.2" ry="1.3" fill="#FFB8C6" fillOpacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'coinbase-ext',
    name: 'Coinbase Wallet',
    tagline: 'Browser extension · Self-custody',
    detectKey: 'isCoinbaseWallet',
    installUrl: 'https://www.coinbase.com/wallet/downloads',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="#0052FF"/>
        <circle cx="18" cy="18" r="9" fill="white"/>
        <rect x="15" y="15" width="6" height="6" rx="2" fill="#0052FF"/>
      </svg>
    ),
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    tagline: 'Built into Brave browser',
    detectKey: 'isBraveWallet',
    installUrl: 'https://brave.com/download/',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="#FF5500"/>
        <path d="M18 8L26 12V20C26 24.418 22.418 28 18 28C13.582 28 10 24.418 10 20V12L18 8Z" fill="white" fillOpacity="0.9"/>
        <circle cx="18" cy="19" r="4" fill="#FF5500"/>
        <circle cx="18" cy="19" r="2" fill="white" fillOpacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    tagline: 'Connect via mobile wallet',
    detectKey: null, // always show
    installUrl: null,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="#3B99FC"/>
        <path d="M10.5 15.8C14.642 11.658 21.358 11.658 25.5 15.8L25.97 16.27C26.165 16.465 26.165 16.782 25.97 16.977L24.556 18.391C24.458 18.489 24.3 18.489 24.202 18.391L23.561 17.75C20.574 14.763 15.426 14.763 12.439 17.75L11.753 18.436C11.655 18.534 11.497 18.534 11.399 18.436L9.985 17.022C9.79 16.827 9.79 16.511 9.985 16.315L10.5 15.8Z" fill="white"/>
        <path d="M27.75 18.068L29 19.318C29.195 19.513 29.195 19.83 29 20.025L23.561 25.464C23.366 25.659 23.049 25.659 22.854 25.464L19.025 21.635C18.976 21.586 18.897 21.586 18.848 21.635L15.019 25.464C14.824 25.659 14.507 25.659 14.312 25.464L8.873 20.025C8.678 19.83 8.678 19.513 8.873 19.318L10.123 18.068C10.318 17.873 10.635 17.873 10.83 18.068L14.659 21.897C14.708 21.946 14.787 21.946 14.836 21.897L18.665 18.068C18.86 17.873 19.177 17.873 19.372 18.068L23.201 21.897C23.25 21.946 23.329 21.946 23.378 21.897L27.207 18.068C27.402 17.873 27.555 17.873 27.75 18.068Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'demo',
    name: 'Demo Wallet',
    tagline: 'Instant preview, no extension needed',
    detectKey: null,
    installUrl: null,
    badge: 'No setup',
    icon: (
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #00D68F 0%, #00916E 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, lineHeight: 1,
      }}>⚡</div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function WalletModal({ open, onClose, onConnectWallet }) {
  const { detectedWallets, loading } = useWallet();

  const [connectingId, setConnectingId] = useState(null);
  const [errMsg, setErrMsg]             = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) { setConnectingId(null); setErrMsg(''); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  /* ─── Robust wallet detection ───────────────────────────────────────── */
  // Normalise all injected providers into one flat list so we always check
  // both the top-level window.ethereum AND any window.ethereum.providers[].
  function isInstalled(walletId) {
    if (walletId === 'demo' || walletId === 'walletconnect') return true;

    const eth = window.ethereum;

    // Rabby also exposes window.rabby — check that first as a reliable signal
    if (walletId === 'rabby' && window.rabby) return true;

    if (!eth) return false;

    // Build a flat list: always include eth itself, plus any .providers[]
    const all = [eth, ...(Array.isArray(eth.providers) ? eth.providers : [])];

    switch (walletId) {
      case 'metamask':
        // Rabby sets isMetaMask:true too — exclude it to avoid false positive
        return all.some(p => p.isMetaMask && !p.isRabby);
      case 'rabby':
        return all.some(p => p.isRabby);
      case 'coinbase-ext':
        return all.some(p => p.isCoinbaseWallet);
      case 'brave':
        return all.some(p => p.isBraveWallet);
      default:
        return false;
    }
  }

  const wallets = WALLET_REGISTRY.map(w => ({ ...w, installed: isInstalled(w.id) }));

  const handleConnect = async (walletId, installed, installUrl) => {
    if (!installed && installUrl) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setConnectingId(walletId);
    setErrMsg('');
    try {
      await onConnectWallet(walletId);
      onClose();
    } catch (e) {
      setErrMsg(e?.message || 'Connection failed. Please try again.');
      setConnectingId(null);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="wm-overlay"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Connect Wallet"
    >
      <div className="wm-panel">

        {/* Header */}
        <div className="wm-header">
          <div className="wm-logo-wrap">
            <svg viewBox="0 0 100 100" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 L82 23 V49 C82 71 68 86 50 93 C32 86 18 71 18 49 V23 Z" fill="#1a1204"/>
              <circle cx="50" cy="43" r="10" fill="#FFD166"/>
              <path d="M50 51 L58 71 H42 Z" fill="#FFD166"/>
            </svg>
          </div>
          <div className="wm-header-text">
            <div className="wm-title">Connect Wallet</div>
            <div className="wm-subtitle">Choose a wallet to access your Legacy Vault</div>
          </div>
          <button className="wm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Network pill */}
        <div className="wm-network-badge">
          <span className="wm-network-dot" />
          Flare Testnet Coston2
        </div>

        {/* Error */}
        {errMsg && (
          <div className="wm-error">
            <span className="wm-error-icon">⚠</span>
            <span>{errMsg}</span>
            <button onClick={() => setErrMsg('')} className="wm-error-dismiss">Dismiss</button>
          </div>
        )}

        {/* Wallet list */}
        <div className="wm-list">
          {wallets.map(w => {
            const isConnecting = connectingId === w.id;
            const isDisabled   = !!(connectingId && !isConnecting);
            const notInstalled = !w.installed && !!w.installUrl;

            return (
              <button
                key={w.id}
                className={`wm-item${isConnecting ? ' connecting' : ''}${notInstalled ? ' not-installed' : ''}`}
                onClick={() => handleConnect(w.id, w.installed, w.installUrl)}
                disabled={isDisabled}
                id={`wallet-opt-${w.id}`}
                aria-label={`Connect with ${w.name}`}
              >
                <div className="wm-item-icon">{w.icon}</div>
                <div className="wm-item-info">
                  <span className="wm-item-name">{w.name}</span>
                  <span className="wm-item-tag">
                    {notInstalled ? (
                      <span className="wm-item-install">Not installed — click to install</span>
                    ) : w.tagline}
                  </span>
                </div>
                {w.badge && <span className="wm-badge">{w.badge}</span>}
                {w.installed && !notInstalled && !w.badge && w.id !== 'demo' && w.id !== 'walletconnect' && (
                  <span className="wm-detected-dot" title="Detected" />
                )}
                <div className="wm-item-right">
                  {isConnecting ? (
                    <div className="wm-spinner" />
                  ) : notInstalled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="wm-footer">
          By connecting, you agree to the LegacyX Terms of Service. Transactions occur on Flare Coston2 Testnet.
        </p>
      </div>
    </div>
  );
}
