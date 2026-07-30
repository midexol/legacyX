import React from 'react';
import '../../styles/components.css';

export default function WalletModal({ open, onClose, onConnect }) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:64,height:64,background:'linear-gradient(135deg,#4F7DFF,#8B5CF6)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px' }}>🔐</div>
          <div className="modal-title">Connect Wallet</div>
          <div className="modal-sub">Connect your wallet to access your Legacy Vault on Flare Coston2</div>
        </div>
        <div className="wallet-options">
          <div className="wallet-option" onClick={onConnect} id="metamask-option">
            <svg width="36" height="36" viewBox="0 0 212 189" style={{ flexShrink:0 }}>
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
            </svg>
            <span className="wallet-option-name">MetaMask</span>
            <span className="wallet-option-arrow">→</span>
          </div>
          <div className="wallet-option" style={{ opacity:0.4, cursor:'not-allowed' }}>
            <div style={{ width:36,height:36,background:'linear-gradient(135deg,#3B99FC,#7B3FE4)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>⟠</div>
            <span className="wallet-option-name">WalletConnect <span style={{ fontSize:11,opacity:0.5 }}>(coming soon)</span></span>
            <span className="wallet-option-arrow">→</span>
          </div>
        </div>
        <p style={{ marginTop:20,textAlign:'center',fontSize:12,color:'var(--text-muted)' }}>By connecting, you agree to the LegacyX Terms of Service. All transactions occur on Flare Coston2 Testnet.</p>
      </div>
    </div>
  );
}
