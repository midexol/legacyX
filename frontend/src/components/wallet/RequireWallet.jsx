import React, { useState } from 'react';
import { useWallet } from './WalletProvider';
import WalletModal from '../layout/WalletModal';
import Icn from '../ui/Icon';

export default function RequireWallet({ children }) {
  const {
    isConnected, loading,
    connectMetaMask, connectRabby, connectBrave, connectCoinbaseExt, connectWalletConnect, connectDemo,
  } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected) return children;

  const handleConnectWallet = async (id) => {
    const map = {
      metamask:       connectMetaMask,
      rabby:          connectRabby,
      brave:          connectBrave,
      'coinbase-ext': connectCoinbaseExt,
      walletconnect:  connectWalletConnect,
      demo:           connectDemo,
    };
    const fn = map[id];
    if (fn) await fn();
  };

  return (
    <div className="page-content" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingTop: 'var(--navbar-h)', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--gold)',
        }}>
          <Icn name="lock" size={26} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 600, marginBottom: 28 }}>
          Connect your wallet to continue
        </h1>
        <button
          className="btn btn-gold btn-lg"
          onClick={() => setModalOpen(true)}
          disabled={loading}
          id="gate-connect-btn"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>

      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnectWallet={async (id) => {
          await handleConnectWallet(id);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
