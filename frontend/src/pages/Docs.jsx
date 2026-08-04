import React, { useState } from 'react';
import useReveal from '../hooks/useReveal';
import Icn from '../components/ui/Icon';

const SECTIONS = [
  { id: 'overview',    icon: 'home',     label: 'What Is LegacyX?'     },
  { id: 'howitworks',  icon: 'zap',      label: 'How It Works'         },
  { id: 'safety',      icon: 'shield',   label: 'Is My Crypto Safe?'   },
  { id: 'technical',   icon: 'settings', label: 'Technical Deep-Dive'  },
];

const STEPS = [
  {
    n: '1', icon: 'wallet',
    title: 'You deposit FXRP into your own vault',
    body: "This is a smart contract, not a company account. Only your wallet can withdraw from it, deposit more into it, or change its settings — right up until the moment it unlocks.",
  },
  {
    n: '2', icon: 'users',
    title: 'You choose beneficiaries and guardians',
    body: "Beneficiaries are who inherits the crypto, and what percentage each of them gets. Guardians are trusted people (family, a friend, a lawyer) who can vouch that something has actually happened to you — they don't get any of the money themselves, they just help confirm the vault should unlock.",
  },
  {
    n: '3', icon: 'clock',
    title: 'You check in periodically (a "heartbeat")',
    body: 'You set an inactivity window — say, 6 or 12 months. Any time you send a quick on-chain "I\'m still here" ping, that window resets. As long as you\'re around, nothing else happens.',
  },
  {
    n: '4', icon: 'shield',
    title: 'If you go quiet, nothing happens right away',
    body: 'Miss your check-in window and the vault does not immediately pay out. It moves into a grace period instead — this is deliberate, so a lost phone, a hospital stay, or a long trip off the grid doesn\'t accidentally trigger your entire inheritance.',
  },
  {
    n: '5', icon: 'check',
    title: 'Your guardians confirm what\'s actually happened',
    body: 'During the grace period, a majority of your guardians (you choose the threshold, e.g. 2 of 3) need to confirm that something has genuinely happened before the vault can unlock. This is the safety net that stops false alarms.',
  },
  {
    n: '6', icon: 'coins',
    title: 'Beneficiaries automatically receive their share',
    body: "Once confirmed, the vault splits the balance exactly the way you configured it and beneficiaries can claim their share directly to their own wallet — or, if they'd rather have cash-equivalent value instead of holding FXRP, privately match with a buyer through the OTC marketplace. No lawyer, no company approval step, nobody holding the money in between.",
  },
];

const FAQ = [
  {
    q: 'Can LegacyX (the company) take my money?',
    a: 'No. Your FXRP is locked in a smart contract, not a LegacyX-controlled account. LegacyX never has the ability to move, freeze, or redirect your funds — the contract only follows the rules you set: pay you back on request while you\'re active, pay your beneficiaries once your conditions are genuinely met.',
  },
  {
    q: 'What if I just forget to check in, or lose my phone for a week?',
    a: 'That\'s exactly what the grace period and guardian confirmation are for. Missing your heartbeat window alone does not release funds — a majority of your guardians also have to actively confirm something is wrong. A short lapse with no guardian confirmation just... doesn\'t do anything.',
  },
  {
    q: 'Can my beneficiaries or guardians take my money early?',
    a: 'No. Beneficiaries have no access at all until the vault actually unlocks. Guardians can only confirm a condition — they can\'t withdraw funds, redirect them to themselves, or change who the beneficiaries are.',
  },
  {
    q: 'Can I change my mind later?',
    a: 'Yes — beneficiaries, allocation splits, guardians, and your check-in window can all be updated any time while your vault is active. You can also withdraw your funds entirely, whenever you want, as long as the vault hasn\'t already unlocked.',
  },
  {
    q: 'Does this replace writing an actual will?',
    a: 'No, and we don\'t want to pretend it does. Legal inheritance of large estates still has jurisdiction-specific rules that a smart contract can\'t resolve on its own. Treat LegacyX as the automatic technical transfer of crypto you\'ve already decided to leave someone — and put that same decision in a real legal document too.',
  },
];

const TECHNICAL = [
  {
    title: 'Multi-factor inheritance trigger', tag: 'CORE MODEL', tagColor: 'gold',
    body: (
      <>
        Rather than a single inactivity timer triggering an immediate payout, a vault condition
        can be <code>INACTIVITY</code> (a heartbeat countdown that moves the vault to a
        grace/review state on expiry), <code>MULTI_PARTY_APPROVAL</code> (M-of-N guardian
        addresses each submit a signature proving control of their key before the condition is
        satisfied), or <code>LEGAL_DOCUMENT</code> (a hashed document reference submitted as
        evidence). Conditions can be combined on a single vault so a real trigger requires more
        than one signal.
      </>
    ),
  },
  {
    title: 'Flare FTSO v2', tag: 'SYNCED', tagColor: 'green',
    body: "LegacyX reads Flare's decentralized Time Series Oracle for FXRP/USD pricing, used to display estate valuations in USD without relying on a centralized price feed.",
  },
  {
    title: 'Evidence verification (FDC)', tag: 'HONEST NOTE', tagColor: 'blue',
    body: (
      <>
        There is no live, queryable government death registry to check against — so the Flare
        Data Connector's role here is verifying the <strong>integrity and existence</strong> of a
        submitted attestation (that a specific document hash was submitted and matches the
        expected format), not performing a real-time government lookup. Combined with guardian
        confirmation, this is what actually gates a vault unlock.
      </>
    ),
  },
  {
    title: 'Private OTC — matching only (Phase 1)', tag: 'NON-CUSTODIAL', tagColor: 'gold',
    body: 'The OTC marketplace privately matches a beneficiary who wants to liquidate inherited FXRP with a counterparty, without exposing wallet size or address on a public order book. LegacyX does not custody funds or take a fee at this stage — settlement happens directly between the two wallets. Custodial settlement is deliberately deferred until a compliance/licensing review is complete, since matching-with-custody or fee-taking can trigger money-transmission requirements depending on jurisdiction.',
  },
];

export default function Docs() {
  const pageRef = useReveal();
  const [active, setActive] = useState('overview');

  return (
    <div ref={pageRef} style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar page-content">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
            Read In Order, Or Jump Around
          </div>
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              className={`sidebar-item${active === s.id ? ' active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              <span className="sidebar-icon"><Icn name={s.icon} size={17} /></span>
              {s.label}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>Quick Facts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {[
              ['Network', 'Flare Coston2 (testnet)'],
              ['Asset supported', 'FXRP'],
              ['Who holds your funds', 'You (the smart contract)'],
              ['Replaces a legal will?', 'No — see "Is My Crypto Safe?"'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="page-content" style={{ marginLeft: 240, flex: 1, padding: '100px 40px 80px', maxWidth: 880 }}>
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>
            <span className="badge-dot" />
            LegacyX Docs
          </div>
          <h1 className="text-h1" style={{ marginBottom: 12 }}>
            Understand LegacyX <span className="text-gradient-gold">in plain English</span>
          </h1>
          <p className="text-body text-secondary" style={{ maxWidth: 620 }}>
            No jargon required. This page explains what LegacyX actually does, walks through
            exactly what happens to your crypto, and answers the safety questions you're probably
            already asking. Want the smart contract internals instead? Jump to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Technical Deep-Dive</strong>.
          </p>
        </div>

        {/* SECTION: WHAT IS LEGACYX */}
        {active === 'overview' && (
          <div key={active} style={{ animation: 'fade-up 0.5s var(--ease-out) both' }}>
            <div className="section-eyebrow">Start Here</div>
            <h2 className="text-h2" style={{ margin: '12px 0 8px' }}>What Is LegacyX?</h2>
            <p className="text-secondary" style={{ marginBottom: 24 }}>A safety net for your crypto, in case something happens to you.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 24 }}>
              <p>
                If you keep crypto in a normal wallet and something happens to you — you lose your
                phone, forget your seed phrase, or simply aren't around anymore — nobody can get to
                that money. There's no bank teller to call, no "next of kin" form to fill out.
                Unlike a bank account, a crypto wallet doesn't know you exist as a person; it only
                knows the private key. If nobody has that key, the money is gone. Permanently.
                Estimates put the amount of crypto already lost this way in the tens of billions of
                dollars.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>LegacyX fixes this</strong> by
                giving your crypto a way to find its way to the people you care about —
                automatically, without you having to hand your private key to anyone today, and
                without trusting a company to hold your money.
              </p>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div className="card">
                <div style={{ color: 'var(--gold)', marginBottom: 12 }}><Icn name="lock" size={24} /></div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>You keep control</div>
                <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  Your FXRP sits in a vault only you can move, withdraw from, or reconfigure — for
                  as long as you're active. LegacyX (the company) never holds your money.
                </div>
              </div>
              <div className="card">
                <div style={{ color: 'var(--gold)', marginBottom: 12 }}><Icn name="users" size={24} /></div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>It only pays out if you're really gone</div>
                <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  A single missed check-in isn't enough. People you trust have to confirm something's
                  actually wrong before anything moves —{' '}
                  <button
                    onClick={() => setActive('howitworks')}
                    style={{ color: 'var(--gold)', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}
                  >
                    see how it works
                  </button>
                  .
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,209,102,0.05)', borderColor: 'rgba(255,209,102,0.2)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚖️</span> One honest disclaimer
              </div>
              <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>
                LegacyX is <strong style={{ color: 'var(--text-primary)' }}>not</strong> a legal
                will, and using it doesn't replace one. Think of it this way: a will says who should
                get what; LegacyX is the mechanism that actually moves the crypto once that's
                clear. We'd still recommend writing your wishes into a real legal document —
                LegacyX just makes sure the crypto part actually happens, automatically, without a
                company or court in the middle.
              </div>
            </div>
          </div>
        )}

        {/* SECTION: HOW IT WORKS */}
        {active === 'howitworks' && (
          <div key={active} style={{ animation: 'fade-up 0.5s var(--ease-out) both' }}>
            <div className="section-eyebrow">Step By Step</div>
            <h2 className="text-h2" style={{ margin: '12px 0 8px' }}>How It Works</h2>
            <p className="text-secondary" style={{ marginBottom: 32 }}>
              Six steps, from depositing your crypto to your beneficiaries actually receiving it.
            </p>

            <div style={{ maxWidth: 640, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 23, top: 0, bottom: 0, width: 1, background: 'var(--border-subtle)' }} aria-hidden="true" />
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', gap: 24, paddingBottom: i === STEPS.length - 1 ? 0 : 36, position: 'relative' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--bg-secondary)', border: '2px solid rgba(255,209,102,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--gold)', flexShrink: 0, zIndex: 1,
                  }}>
                    <Icn name={s.icon} size={20} />
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                      Step {s.n}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                    <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: IS MY CRYPTO SAFE */}
        {active === 'safety' && (
          <div key={active} style={{ animation: 'fade-up 0.5s var(--ease-out) both' }}>
            <div className="section-eyebrow">The Questions Everyone Asks</div>
            <h2 className="text-h2" style={{ margin: '12px 0 8px' }}>Is My Crypto Safe?</h2>
            <p className="text-secondary" style={{ marginBottom: 24 }}>Straight answers to the questions you're already thinking.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQ.map((item) => (
                <div key={item.q} className="card">
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{item.q}</div>
                  <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: TECHNICAL DEEP-DIVE */}
        {active === 'technical' && (
          <div key={active} style={{ animation: 'fade-up 0.5s var(--ease-out) both' }}>
            <div className="section-eyebrow">For Developers</div>
            <h2 className="text-h2" style={{ margin: '12px 0 8px' }}>Technical Deep-Dive</h2>
            <p className="text-secondary" style={{ marginBottom: 24 }}>
              How the inactivity guard, guardian confirmation, and Flare integrations actually work under the hood.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {TECHNICAL.map((item) => (
                <div key={item.title} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</span>
                    <span className={`badge badge-${item.tagColor}`}>{item.tag}</span>
                  </div>
                  <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{item.body}</div>
                </div>
              ))}
            </div>

            <div className="section-eyebrow" style={{ marginBottom: 12 }}>Deployed Testnet Contracts (Chain ID 114)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {[
                { name: 'VaultFactory.sol', address: '0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2' },
                { name: 'HeartbeatGuard.sol', address: '0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20' },
                { name: 'PrivateOTCDesk.sol', address: '0x3B718104E9284192A0b0019245C4E5E89F29' },
              ].map((c) => (
                <div key={c.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                    <div className="text-mono text-muted" style={{ fontSize: 11 }}>{c.address}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-eyebrow" style={{ marginBottom: 12 }}>VaultFactory.sol (Core Interface)</div>
            <pre style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: 20, overflowX: 'auto',
              fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12.5, lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultFactory {
    // Stores condition metrics & beneficiary allocations
    struct VaultConfig {
        address owner;
        uint256 heartbeatTimeout;
        uint256 lastPingTimestamp;
        bool isClaimed;
    }

    function createVault(uint256 _timeoutDays) external payable returns (address) {
        // Deploys non-custodial vault proxy on Flare
        require(msg.value > 0, "Must deposit FXRP");
        return _deployProxy(msg.sender, _timeoutDays);
    }
}`}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
