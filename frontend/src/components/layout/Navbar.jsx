import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWallet } from '../wallet/WalletProvider';
import ThemeToggle from '../theme/ThemeToggle';
import WalletModal from './WalletModal';
import '../../styles/components.css';

export default function Navbar() {
  const { isConnected, account, connect, connectDemo, disconnect, shorten } = useWallet();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { to: '/',           label: 'Home'        },
    { to: '/vault',      label: 'Vault'       },
    { to: '/marketplace',label: 'Marketplace' },
    { to: '/dashboard',  label: 'Dashboard'   },
    { to: '/docs',       label: 'Docs'        },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container">
          <div className="navbar-inner">
            <NavLink to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <svg viewBox="0 0 100 100" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 L82 23 V49 C82 71 68 86 50 93 C32 86 18 71 18 49 V23 Z" fill="#1a1204"/>
                  <circle cx="50" cy="43" r="10" fill="#FFD166"/>
                  <path d="M50 51 L58 71 H42 Z" fill="#FFD166"/>
                </svg>
              </div>
              <span className="navbar-logo-text">LegacyX</span>
            </NavLink>

            <div className="navbar-links">
              {navLinks.map(l => (
                <NavLink
                  key={l.to} to={l.to}
                  className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
                  end={l.to === '/'}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="navbar-actions">
              <ThemeToggle />
              <NavLink to="/vault" className="btn btn-ghost btn-sm hide-mobile">Create Vault</NavLink>
              {isConnected ? (
                <button
                  className="btn-connect connected"
                  onClick={disconnect}
                  id="nav-wallet-btn"
                  title={isDashboard ? account : 'Wallet connected'}
                >
                  <span style={{ width:8,height:8,borderRadius:'50%',background:'#00D68F',display:'inline-block',boxShadow:'0 0 8px #00D68F' }} />
                  {isDashboard ? shorten(account) : 'Connected'}
                </button>
              ) : (
                <button
                  className="btn-connect"
                  onClick={() => setModalOpen(true)}
                  id="nav-connect-btn"
                >
                  Connect Wallet
                </button>
              )}
              <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background:' var(--bg-glass)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border-subtle)', padding:'16px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} className="navbar-link" onClick={() => setMenuOpen(false)} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
            {!isConnected && (
              <button className="btn-connect" onClick={() => { setMenuOpen(false); setModalOpen(true); }}>Connect Wallet</button>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <ThemeToggle />
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Toggle theme</span>
            </div>
          </div>
        )}
      </nav>

      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={async () => { setModalOpen(false); await connect(); }}
        onConnectDemo={() => { setModalOpen(false); connectDemo(); }}
      />
    </>
  );
}
