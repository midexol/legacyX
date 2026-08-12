import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import { useToast } from '../components/ui/Toast';
import Icn from '../components/ui/Icon';

const SECTIONS = [
  { id: 'overview',    icon: 'home',     label: 'What Is LegacyX?',    subtitle: 'Overview & Philosophy' },
  { id: 'howitworks',  icon: 'zap',      label: 'How It Works',        subtitle: '6-Step Execution Flow' },
  { id: 'safety',      icon: 'shield',   label: 'Is My Crypto Safe?',  subtitle: 'Security & FAQs'       },
  { id: 'technical',   icon: 'settings', label: 'Technical Deep-Dive', subtitle: 'Architecture & Contracts' },
];

const SECTION_HEADERS = {
  overview: {
    badge: 'Overview & Philosophy',
    titleMain: 'Understand LegacyX ',
    titleGradient: 'in plain English',
    description: (
      <>
        No jargon required. This page explains what LegacyX actually does, walks through
        how your assets are protected, and answers safety questions. Want smart contract details? Jump to{' '}
        <button
          onClick={() => window.__switchDocsSection && window.__switchDocsSection('technical')}
          style={{
            color: 'var(--gold)', textDecoration: 'underline', fontWeight: 700,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 'inherit', fontFamily: 'inherit'
          }}
        >
          Technical Deep-Dive
        </button>.
      </>
    )
  },
  howitworks: {
    badge: 'Execution Architecture',
    titleMain: 'Step-by-Step ',
    titleGradient: 'Inheritance Flow',
    description: 'Six transparent steps detailing the lifecycle of a Legacy Vault: from depositing FXRP on Flare to automated condition verification and beneficiary claim.'
  },
  safety: {
    badge: 'Security & FAQs',
    titleMain: 'Is My Crypto ',
    titleGradient: 'Completely Safe?',
    description: 'Direct answers to questions regarding smart contract security, non-custodial vault ownership, and guardian permissions.'
  },
  technical: {
    badge: 'Developer Reference',
    titleMain: 'Technical ',
    titleGradient: 'Deep-Dive',
    description: 'Complete developer documentation covering Solidity smart contracts, Flare FTSO v2, Flare Data Connector (FDC) attestations, LayerZero V2 relays, and REST APIs.'
  }
};

const STEPS = [
  {
    n: '1', icon: 'wallet',
    title: 'You deposit FXRP into your own vault',
    body: "This is a smart contract, not a company account. Only your wallet can withdraw from it, deposit more into it, or change its settings until the moment it unlocks.",
  },
  {
    n: '2', icon: 'users',
    title: 'You choose beneficiaries and guardians',
    body: "Beneficiaries are who inherits the crypto, and what percentage each of them gets. Guardians are trusted people (family, a friend, a lawyer) who can vouch that something has actually happened to you. They do not receive any of the money themselves, they just help confirm the vault should unlock.",
  },
  {
    n: '3', icon: 'clock',
    title: 'You check in periodically (a "heartbeat")',
    body: 'You set an inactivity window (such as 6 or 12 months). Any time you send a quick on-chain ping, that window resets. As long as you are active, nothing else happens.',
  },
  {
    n: '4', icon: 'shield',
    title: 'If you go quiet, nothing happens right away',
    body: 'Missing your check-in window does not immediately pay out. It moves into a grace period instead: this is deliberate, so a lost phone, a hospital stay, or a long trip off the grid does not accidentally trigger your entire inheritance.',
  },
  {
    n: '5', icon: 'check',
    title: 'Your guardians confirm what has actually happened',
    body: 'During the grace period, a majority of your guardians (you choose the threshold, e.g. 2 of 3) need to confirm that something has genuinely happened before the vault can unlock. This safety net stops false alarms.',
  },
  {
    n: '6', icon: 'coins',
    title: 'Beneficiaries automatically receive their share',
    body: "Once confirmed, the vault splits the balance exactly the way you configured it and beneficiaries can claim their share directly to their own wallet, or if they prefer cash-equivalent value instead of holding FXRP, privately match with a buyer through the OTC marketplace. No lawyer, no company approval step, and nobody holding the money in between.",
  },
];

const FAQ = [
  {
    q: 'Can LegacyX as a company take my money?',
    a: 'No. Your FXRP is locked in a smart contract, not a company-controlled account. LegacyX never has the ability to move, freeze, or redirect your funds. The contract only follows the rules you set: pay you back on request while you are active, or pay your beneficiaries once your conditions are genuinely met.',
  },
  {
    q: 'What if I just forget to check in, or lose my phone for a week?',
    a: 'That is exactly what the grace period and guardian confirmation are for. Missing your heartbeat window alone does not release funds: a majority of your guardians must also actively confirm something is wrong. A short lapse with no guardian confirmation does not release any funds.',
  },
  {
    q: 'Can my beneficiaries or guardians take my money early?',
    a: 'No. Beneficiaries have no access at all until the vault actually unlocks. Guardians can only confirm a condition. They cannot withdraw funds, redirect them to themselves, or change who the beneficiaries are.',
  },
  {
    q: 'Can I change my mind later?',
    a: 'Yes: beneficiaries, allocation splits, guardians, and your check-in window can all be updated any time while your vault is active. You can also withdraw your funds entirely, whenever you want, as long as the vault has not already unlocked.',
  },
  {
    q: 'Does this replace writing an actual legal will?',
    a: 'No, and we do not pretend it does. Legal inheritance of large estates still has jurisdiction-specific rules that a smart contract cannot resolve on its own. Treat LegacyX as the automatic technical transfer of crypto you have decided to leave someone, and record that same decision in a formal legal document as well.',
  },
];

const TECHNICAL_COMPONENTS = [
  {
    title: 'Multi-Factor Inheritance Trigger Engine', tag: 'CORE SMART CONTRACT', tagColor: 'gold',
    body: (
      <>
        Built into <code>LegacyVault.sol</code>, inheritance triggers support multiple condition types:
        <code>INACTIVITY</code> (heartbeat countdown that moves the vault to a grace state on expiry),
        <code>MULTI_PARTY_APPROVAL</code> (M-of-N guardian signatures proving cryptographic consent), and
        <code>LEGAL_DOCUMENT</code> (hashed document references verified via attestation). Conditions can be combined on a single vault so a payout requires multiple verified signals.
      </>
    ),
  },
  {
    title: 'Flare FTSO v2 Oracle Integration', tag: 'DECENTRALIZED ORACLE', tagColor: 'green',
    body: "LegacyX queries Flare's Time Series Oracle (FTSO v2) directly on-chain for sub-second FXRP/USD and FLR/USD pricing. This powers estate valuation, beneficiary percentage calculations, and private OTC trade valuation without relying on centralized price feeds.",
  },
  {
    title: 'Flare Data Connector (FDC) Evidence Verification', tag: 'DECENTRALIZED ATTESTATION', tagColor: 'blue',
    body: (
      <>
        The Flare Data Connector verifies the <strong>integrity and cryptographic existence</strong> of off-chain attestation payloads (such as document hashes or evidence proofs) without centralized government registries. Verified attestations are submitted on-chain directly to <code>LegacyVault.sol.verifyCondition()</code>.
      </>
    ),
  },
  {
    title: 'FAssets & LayerZero V2 Cross-Chain Claims', tag: 'OMNICHAIN OFT', tagColor: 'purple',
    body: (
      <>
        Vault collateral utilizes <code>FXRP</code> via Flare's FAssets framework and LayerZero OFT Adapter (<code>0x0b6A3645c240605887a5532109323A3E12273dc7</code>). When a beneficiary's registered home chain is outside Flare, calling <code>claim()</code> executes <code>IOFT(FXRP).send()</code> to bridge tokens directly to their native chain.
      </>
    ),
  },
  {
    title: 'Multi-Chain State Sync (LegacyVaultRelay.sol)', tag: 'LAYERZERO V2 OAPP', tagColor: 'gold',
    body: (
      <>
        Deploys as a LayerZero V2 OApp across chains (Flare Coston2 EID 40268 and Base Sepolia EID 40245). When an owner executes <code>pingHeartbeat()</code> on Flare, <code>LegacyVaultRelay</code> broadcasts cross-chain state updates to sibling vaults, synchronizing the owner's estate globally.
      </>
    ),
  },
  {
    title: 'Private OTC Settlement Engine (OtcSettlement.sol)', tag: 'NON-CUSTODIAL OTC', tagColor: 'green',
    body: 'Pairs an off-chain price-time-priority matching engine with an on-chain atomic settlement contract. Beneficiaries can liquidate inherited FXRP into USDC or FLR without public order book tracking or market slippage.',
  },
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/auth/nonce', desc: 'Request SIWE one-time login nonce for wallet authentication' },
  { method: 'POST', path: '/api/auth/verify', desc: 'Verify EIP-191 signature and issue JWT session token' },
  { method: 'POST', path: '/api/vaults', desc: 'Deploy or record new Legacy Vault configuration' },
  { method: 'POST', path: '/api/vaults/:id/heartbeat', desc: 'Reset vault inactivity countdown timer (Owner ping)' },
  { method: 'POST', path: '/api/conditions/:id/verify', desc: 'Submit FDC attestation proof to trigger condition unlock' },
  { method: 'GET',  path: '/api/orders', desc: 'Fetch redacted active orders from Private OTC Desk' },
  { method: 'POST', path: '/api/orders', desc: 'Create private sell order for inherited FXRP assets' },
];

export default function Docs() {
  const pageRef = useReveal();
  const toast = useToast();
  const [active, setActive] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const switchSection = (id) => {
    setActive(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.__switchDocsSection = switchSection;
    return () => {
      delete window.__switchDocsSection;
    };
  }, []);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast('Copied', `${label} copied to clipboard`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const nextPrevNav = {
    overview:   { prev: null, next: { id: 'howitworks', label: 'How It Works' } },
    howitworks: { prev: { id: 'overview', label: 'What Is LegacyX?' }, next: { id: 'safety', label: 'Is My Crypto Safe?' } },
    safety:     { prev: { id: 'howitworks', label: 'How It Works' }, next: { id: 'technical', label: 'Technical Deep-Dive' } },
    technical:  { prev: { id: 'safety', label: 'Is My Crypto Safe?' }, next: { id: '/vault', label: 'Create Legacy Vault', isLink: true } },
  };

  const currentNav = nextPrevNav[active];
  const headerInfo = SECTION_HEADERS[active] || SECTION_HEADERS.overview;

  // Filter content based on search query
  const q = searchQuery.toLowerCase().trim();
  const filteredFaq = q ? FAQ.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)) : FAQ;
  const filteredSteps = q ? STEPS.filter(s => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)) : STEPS;
  const filteredTech = q ? TECHNICAL_COMPONENTS.filter(t => t.title.toLowerCase().includes(q)) : TECHNICAL_COMPONENTS;

  return (
    <div ref={pageRef} style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Header Menu Toggle Button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle Documentation Navigation"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          position: 'fixed', top: 'calc(var(--navbar-h) + 12px)', left: '16px', zIndex: 90,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-full)', padding: '8px 16px', fontSize: 13,
          fontWeight: 600, color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer'
        }}
      >
        <Icn name={mobileOpen ? 'x' : 'menu'} size={16} />
        <span>Docs Menu</span>
      </button>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)', zIndex: 140
          }}
        />
      )}

      {/* Sticky Mobile Section Pills Bar */}
      <div
        className="docs-mobile-pills"
        style={{
          position: 'sticky', top: 'var(--navbar-h)', zIndex: 40,
          background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)', padding: '10px 16px',
          display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch'
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => switchSection(s.id)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
              background: active === s.id ? 'rgba(var(--blue-rgb),0.15)' : 'var(--bg-card)',
              color: active === s.id ? 'var(--blue)' : 'var(--text-secondary)',
              border: active === s.id ? '1px solid rgba(var(--blue-rgb),0.3)' : '1px solid var(--border-card)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Icn name={s.icon} size={13} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Sidebar Navigation */}
        <aside
          className={`sidebar ${mobileOpen ? 'open' : ''}`}
          style={{
            width: 260, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)',
            minHeight: '100vh', height: '100vh', padding: '100px 16px 40px', position: 'fixed',
            left: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 150,
            overflowY: 'auto', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)'
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 34px', background: 'var(--bg-card)',
                border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)',
                fontSize: 12, color: 'var(--text-primary)', outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Icn name="search" size={14} />
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14
                }}
              >
                ×
              </button>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, paddingLeft: 8 }}>
              Documentation Modules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {SECTIONS.map((s) => (
                <div
                  key={s.id}
                  className={`sidebar-item ${active === s.id ? 'active' : ''}`}
                  onClick={() => switchSection(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 500,
                    color: active === s.id ? 'var(--blue)' : 'var(--text-secondary)',
                    background: active === s.id ? 'rgba(var(--blue-rgb),0.12)' : 'transparent',
                    border: active === s.id ? '1px solid rgba(var(--blue-rgb),0.25)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  <span className="sidebar-icon" style={{ color: active === s.id ? 'var(--blue)' : 'var(--text-muted)' }}>
                    <Icn name={s.icon} size={16} />
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: active === s.id ? 600 : 500 }}>{s.label}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{s.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Facts Card */}
          <div className="card" style={{ padding: 16, marginTop: 'auto', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icn name="shield" size={14} />
              <span>Quick Specs</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
              {[
                ['Network', 'Flare Coston2 (114)'],
                ['Compiler', 'Solidity 0.8.24'],
                ['Oracle', 'Flare FTSO v2'],
                ['Cross-Chain', 'LayerZero V2 OApp'],
                ['Attestation', 'Flare Data Connector'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className="docs-main-content"
          style={{
            flex: 1, padding: '100px 40px 80px', maxWidth: 900,
            width: '100%', boxSizing: 'border-box'
          }}
        >
          {/* Dynamic Module Header Banner */}
          <div style={{ marginBottom: 36, animation: 'fade-up 0.4s var(--ease-out) both' }}>
            <div className="badge badge-gold" style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="badge-dot" />
              <span>{headerInfo.badge}</span>
            </div>
            <h1 className="text-h1" style={{ marginBottom: 12, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {headerInfo.titleMain}
              <span className="text-gradient-gold">{headerInfo.titleGradient}</span>
            </h1>
            <p className="text-body text-secondary" style={{ maxWidth: 680, fontSize: 15, lineHeight: 1.7 }}>
              {headerInfo.description}
            </p>
          </div>

          {/* Search Bar Filter Banner */}
          {searchQuery && (
            <div className="card" style={{ marginBottom: 24, padding: '12px 18px', background: 'rgba(var(--blue-rgb),0.08)', borderColor: 'rgba(var(--blue-rgb),0.2)' }}>
              <span style={{ fontSize: 13, color: 'var(--blue)' }}>
                Filtering documentation for: <strong>"{searchQuery}"</strong>
              </span>
            </div>
          )}

          {/* SECTION 1: WHAT IS LEGACYX */}
          {active === 'overview' && (
            <div key={active} style={{ animation: 'fade-up 0.4s var(--ease-out) both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 28 }}>
                <p>
                  If you keep crypto in a normal wallet and something happens to you: you lose your
                  phone, forget your seed phrase, or simply are not around anymore, nobody can get to
                  that money. There is no bank teller to call, and no next of kin form to fill out.
                  Unlike a bank account, a crypto wallet does not know you exist as a person; it only
                  knows the private key. If nobody has that key, the money is gone permanently.
                  Estimates put the amount of crypto already lost this way in the tens of billions of dollars.
                </p>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>LegacyX fixes this</strong> by
                  giving your crypto a way to find its way to the people you care about automatically,
                  without you having to hand your private key to anyone today, and without trusting a company to hold your money.
                </p>
              </div>

              <div className="grid-2" style={{ marginBottom: 28, display: 'grid', gap: 20 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ color: 'var(--gold)', marginBottom: 14 }}><Icn name="lock" size={26} /></div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>You keep full control</div>
                  <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    Your FXRP sits in a vault only you can move, withdraw from, or reconfigure for as long as you are active. LegacyX never holds your funds.
                  </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ color: 'var(--gold)', marginBottom: 14 }}><Icn name="users" size={26} /></div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>It only pays out if you are gone</div>
                  <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    A single missed check-in is not enough. People you trust must confirm something is actually wrong before anything moves.
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 22, background: 'rgba(255,209,102,0.05)', borderColor: 'rgba(255,209,102,0.25)', marginBottom: 32 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)' }}>
                  <Icn name="shield" size={16} />
                  <span>Important Legal Distinction</span>
                </div>
                <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>
                  LegacyX is <strong style={{ color: 'var(--text-primary)' }}>not</strong> a legal will, and using it does not replace one. Think of it this way: a legal will dictates who should get what. LegacyX is the technical mechanism that actually executes the crypto transfer once conditions are met. We recommend recording your intentions in a legal document as well. LegacyX ensures the crypto transfer happens automatically without intermediaries.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: HOW IT WORKS */}
          {active === 'howitworks' && (
            <div key={active} style={{ animation: 'fade-up 0.4s var(--ease-out) both' }}>
              <div style={{ position: 'relative', paddingLeft: 8 }}>
                <div style={{ position: 'absolute', left: 23, top: 20, bottom: 20, width: 2, background: 'var(--border-subtle)' }} aria-hidden="true" />
                {filteredSteps.map((s, i) => (
                  <div key={s.n} style={{ display: 'flex', gap: 24, paddingBottom: i === filteredSteps.length - 1 ? 0 : 32, position: 'relative' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--bg-card)', border: '2px solid rgba(255,209,102,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--gold)', flexShrink: 0, zIndex: 2,
                      boxShadow: '0 0 16px rgba(255,209,102,0.1)'
                    }}>
                      <Icn name={s.icon} size={20} />
                    </div>
                    <div style={{ paddingTop: 4, flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
                        Step {s.n}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</div>
                      <div className="card text-secondary" style={{ padding: 16, fontSize: 14, lineHeight: 1.7, background: 'var(--bg-card)' }}>{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: IS MY CRYPTO SAFE */}
          {active === 'safety' && (
            <div key={active} style={{ animation: 'fade-up 0.4s var(--ease-out) both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredFaq.map((item) => (
                  <div key={item.q} className="card" style={{ padding: 22 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 16, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icn name="check" size={16} />
                      <span>{item.q}</span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: TECHNICAL DEEP-DIVE (DEVELOPER REFERENCE) */}
          {active === 'technical' && (
            <div key={active} style={{ animation: 'fade-up 0.4s var(--ease-out) both' }}>
              {/* Architecture Components */}
              <div style={{ marginBottom: 36 }}>
                <div className="section-eyebrow" style={{ marginBottom: 14 }}>Core Infrastructure & Flare Integrations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredTech.map((item) => (
                    <div key={item.title} className="card" style={{ padding: 22 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{item.title}</span>
                        <span className={`badge badge-${item.tagColor}`}>{item.tag}</span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{item.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REST API Reference for Developers */}
              <div style={{ marginBottom: 36 }}>
                <div className="section-eyebrow" style={{ marginBottom: 14 }}>Backend REST API Reference</div>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                    Integrators can interact with the LegacyX API using standard EIP-191 SIWE wallet signatures. Pass <code>Authorization: Bearer JWT_TOKEN</code> for authenticated endpoints.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {API_ENDPOINTS.map((ep) => (
                      <div key={ep.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                          background: ep.method === 'POST' ? 'rgba(var(--blue-rgb),0.2)' : 'rgba(var(--green-rgb),0.2)',
                          color: ep.method === 'POST' ? 'var(--blue)' : 'var(--green)',
                          fontFamily: 'monospace'
                        }}>
                          {ep.method}
                        </span>
                        <code style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{ep.path}</code>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deployed Contract Addresses Table */}
              <div style={{ marginBottom: 36 }}>
                <div className="section-eyebrow" style={{ marginBottom: 14 }}>Deployed Smart Contracts (Flare Coston2 - Chain ID 114)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'LegacyVault.sol', address: '0xD59dbEa6435cf284E80a2745D43b49c2bD89D795', desc: 'Main Vault Execution & Claim Contract' },
                    { name: 'LegacyVaultRelay.sol', address: '0x6aecedc437b6679d7c0f29863db1b059fccaf977', desc: 'LayerZero V2 Multi-Chain Relay OApp' },
                    { name: 'OtcSettlement.sol', address: '0x3B718104E9284192A0b0019245C4E5E89F29', desc: 'Non-Custodial Private OTC Desk Settlement' },
                    { name: 'FXRP (OFT Adapter)', address: '0x0b6A3645c240605887a5532109323A3E12273dc7', desc: 'Official LayerZero-wrapped FXRP FAsset' },
                  ].map((c) => (
                    <div key={c.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.desc}</div>
                        <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--blue)', wordBreak: 'break-all', marginTop: 4, display: 'block' }}>{c.address}</code>
                      </div>
                      <button
                        onClick={() => copyText(c.address, c.name)}
                        style={{
                          padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                          cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <Icn name="copy" size={13} />
                        <span>{copiedCode === c.name ? 'Copied' : 'Copy Address'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Interface Code Spec */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="section-eyebrow" style={{ margin: 0 }}>ILegacyVault.sol Interface Specification</div>
                  <button
                    onClick={() => copyText(`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ninterface ILegacyVault {\n    enum VaultStatus { ACTIVE, GRACE_PERIOD, UNLOCKED }\n    enum ConditionType { INACTIVITY, MANUAL_APPROVAL, MULTI_PARTY_APPROVAL, LEGAL_DOCUMENT }\n\n    struct Beneficiary {\n        address wallet;\n        uint256 allocationBps;\n        uint32 homeChainEid;\n    }\n\n    event HeartbeatPinged(address indexed owner, uint256 timestamp);\n    event VaultUnlocked(uint256 totalUnlockedBalance);\n    event BeneficiaryClaimed(address indexed beneficiary, uint256 amount);\n\n    function pingHeartbeat() external;\n    function verifyCondition(uint256 conditionId) external;\n    function claim(address beneficiary) external;\n}`, 'Full Interface Spec')}
                    style={{
                      padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer'
                    }}
                  >
                    Copy Solidity Code
                  </button>
                </div>
                <pre style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: 20, overflowX: 'auto',
                  fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12.5, lineHeight: 1.7,
                  color: 'var(--text-secondary)'
                }}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ILegacyVault {
    enum VaultStatus { ACTIVE, GRACE_PERIOD, UNLOCKED }
    enum ConditionType { INACTIVITY, MANUAL_APPROVAL, MULTI_PARTY_APPROVAL, LEGAL_DOCUMENT }

    struct Beneficiary {
        address wallet;
        uint256 allocationBps;
        uint32 homeChainEid;
    }

    event HeartbeatPinged(address indexed owner, uint256 timestamp);
    event VaultUnlocked(uint256 totalUnlockedBalance);
    event BeneficiaryClaimed(address indexed beneficiary, uint256 amount);

    function pingHeartbeat() external;
    function verifyCondition(uint256 conditionId) external;
    function claim(address beneficiary) external;
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section Continuity Navigation Cards */}
          <div
            style={{
              marginTop: 60, paddingTop: 30, borderTop: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap'
            }}
          >
            {currentNav?.prev ? (
              <button
                onClick={() => switchSection(currentNav.prev.id)}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}
              >
                <span>← Previous: {currentNav.prev.label}</span>
              </button>
            ) : <div />}

            {currentNav?.next && (
              currentNav.next.isLink ? (
                <Link
                  to={currentNav.next.id}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}
                >
                  <span>{currentNav.next.label} →</span>
                </Link>
              ) : (
                <button
                  onClick={() => switchSection(currentNav.next.id)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}
                >
                  <span>Next: {currentNav.next.label} →</span>
                </button>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
