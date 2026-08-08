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
      <svg width="36" height="36" viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon fill="#E17726" points="174,0 105,52 118,22"/>
        <polygon fill="#E27625" points="38,0 107,53 94,22"/>
        <polygon fill="#E27625" points="151,136 133,163 170,173 181,137"/>
        <polygon fill="#E27625" points="31,137 42,173 79,163 61,136"/>
        <polygon fill="#E27625" points="77,83 66,100 103,102 102,62"/>
        <polygon fill="#E27625" points="135,83 109,62 107,102 145,100"/>
        <polygon fill="#D5BFB2" points="79,163 101,152 82,139"/>
        <polygon fill="#D5BFB2" points="111,152 133,163 128,139"/>
        <polygon fill="#233447" points="133,163 111,152 113,169 111,172"/>
        <polygon fill="#233447" points="79,163 89,172 87,169 101,152"/>
        <polygon fill="#F6851B" points="107,105 82,139 101,152 109,126"/>
        <polygon fill="#F6851B" points="145,100 107,105 109,126 127,152 146,139"/>
        <polygon fill="#161616" points="89,172 111,172 107,189"/>
        <polygon fill="#763D16" points="174,0 118,22 127,57 148,61 157,44"/>
        <polygon fill="#763D16" points="38,0 55,44 64,61 86,57 94,22"/>
        <polygon fill="#F6851B" points="86,57 66,100 103,102"/>
        <polygon fill="#F6851B" points="148,61 109,102 145,100"/>
        <polygon fill="#763D16" points="38,0 55,44 38,78 31,137 61,136 77,83 66,100 86,57 94,22"/>
        <polygon fill="#763D16" points="174,0 157,44 148,61 145,100 135,83 109,62 127,57 118,22"/>
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
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="#8697FF"/>
        <path d="M8 13C8 10.791 9.791 9 12 9H22C26.418 9 30 12.582 30 17C30 21.418 26.418 25 22 25H8V13Z" fill="white" fillOpacity="0.22"/>
        <circle cx="24" cy="15" r="3" fill="white"/>
        <circle cx="24" cy="15" r="1.5" fill="#8697FF"/>
        <rect x="8" y="9" width="3" height="16" rx="1.5" fill="white" fillOpacity="0.45"/>
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
