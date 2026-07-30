import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import VaultGlyph from '../components/background/VaultGlyph';

const FEATURES = [
  { icon:'🔐', title:'Legacy Vault',       desc:'Deposit your FXRP into a secure smart contract vault. Only you control the keys — we never touch your assets.',  tag:'→ Smart Contract Secured', color:'rgba(212,160,23,0.08)',  glow:'rgba(212,160,23,0.25)',   textColor:'var(--gold)'   },
  { icon:'👥', title:'Inheritance Rules',  desc:"Choose your beneficiaries and define exactly when and how your assets are distributed. Complete customization.",   tag:'→ Fully Customizable',     color:'rgba(184,115,51,0.08)',  glow:'rgba(184,115,51,0.25)',   textColor:'var(--gold)'   },
  { icon:'🔒', title:'Private OTC',        desc:'Beneficiaries can sell inherited assets privately without exposing wallet addresses, amounts, or prices on-chain.', tag:'→ Zero Knowledge Privacy', color:'rgba(255,209,102,0.08)', glow:'rgba(255,209,102,0.25)',  textColor:'var(--gold)'   },
  { icon:'⚡', title:'Flare Powered',      desc:"Built on Flare's infrastructure. Verified data feeds, FAssets, and FTSO ensure real-world condition checks.",      tag:'→ FTSO & FAssets',         color:'rgba(0,214,143,0.08)',   glow:'rgba(0,214,143,0.25)',    textColor:'var(--green)'  },
];

const STEPS = [
  { emoji:'🏦', step:'Step 01', title:'Deposit Your Assets',       desc:'Alice deposits 100 FXRP into her personal Legacy Vault smart contract. The assets are locked securely on-chain — only she can manage them while active.' },
  { emoji:'👨‍👩‍👧', step:'Step 02', title:'Choose Beneficiaries',     desc:'Alice assigns 50% to her mother, 30% to her brother, and 20% to her daughter by entering their wallet addresses. Allocations must total 100%.' },
  { emoji:'⏱️', step:'Step 03', title:'Set Inheritance Conditions', desc:'Alice sets her rules: "If I\'m inactive for 12 months, release the vault." Or: "Two trusted guardians must approve." Multiple conditions supported.' },
  { emoji:'✅', step:'Step 04', title:'Verification & Unlock',      desc:"When conditions are met, the smart contract automatically verifies and unlocks the vault. Flare's data feeds and DECO can verify real-world events." },
  { emoji:'💸', step:'Step 05', title:'Assets Released',            desc:'Each beneficiary automatically receives their share. No lawyers, no banks, no delays. Optionally, they can sell privately via the OTC marketplace.' },
];

function Counter({ target, prefix = '', suffix = '', duration = 1800 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isFinite(target)) { el.textContent = prefix + target + suffix; return; }
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const val = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, prefix, suffix, duration]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export default function Landing() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>

      {/* ── HERO ── */}
      <section className="page-content" style={{
        paddingTop: 'calc(var(--navbar-h) + 60px)',
        paddingBottom: 80,
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="container">

          {/* Badge */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
            <div className="badge badge-gold">
              <span className="badge-dot" style={{ background:'var(--gold)', boxShadow:'0 0 8px var(--gold)' }} />
              Built on Flare Coston2 — Testnet Live
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}>
            <span style={{ display:'block' }}>Protect Your Crypto.</span>
            <span style={{
              display: 'block',
              background: 'var(--grad-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Protect Your Family.
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(15px,1.4vw,18px)',
            lineHeight: 1.75,
            maxWidth: 580,
            margin: '0 auto 40px',
          }}>
            LegacyX is the first on-chain crypto inheritance platform. Create a Legacy Vault,
            assign beneficiaries, and ensure your digital assets are never lost — even if the
            unexpected happens.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', marginBottom:72 }}>
            <Link to="/vault"      className="btn btn-gold btn-lg"   id="hero-create-btn">⬡ Create Vault</Link>
            <a    href="#how-it-works" className="btn btn-ghost btn-lg">Explore ↓</a>
          </div>

          {/* ── VAULT GLYPH — abstract, blended into the background ── */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: 620,
            width: '100%',
            margin: '0 auto 56px',
          }}>
            {/* Glow halo, sits behind and bleeds into the page background */}
            <div style={{
              position: 'absolute',
              inset: '5%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,209,102,0.18) 0%, transparent 72%)',
              filter: 'blur(60px)',
              zIndex: 0,
              animation: 'pulse-glow-gold 4s ease-in-out infinite',
            }} aria-hidden="true" />

            <VaultGlyph
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: 'auto',
                animation: 'float-slow 7s ease-in-out infinite',
              }}
            />
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { val:2.4,  prefix:'$', suffix:'B+', label:'Crypto Lost Forever'       },
              { val:100,              suffix:'%',   label:'On-Chain & Trustless'       },
              { val:0,                suffix:' Keys',label:'We Never Hold'            },
              { val:'∞',              suffix:'',    label:'Beneficiaries Supported'   },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(24px,3vw,40px)', fontWeight:600, letterSpacing:'-0.01em', marginBottom:4, color:'var(--gold)' }}>
                  <Counter target={s.val} prefix={s.prefix||''} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="page-content" id="features" style={{ padding:'var(--space-10) 0', textAlign:'center' }}>
        <div className="container">
          <div className="section-header reveal">
            <div className="section-eyebrow">✦ Core Features</div>
            <h2 className="section-title">Everything You Need to Secure Your Legacy</h2>
            <p className="section-desc">Four pillars that work together to create the most secure crypto inheritance system ever built.</p>
          </div>
          <div className="grid-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card reveal-blur" data-delay={i * 100}
                style={{ background: f.color, borderColor:'rgba(255,209,102,0.1)', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:16 }}>{f.icon}</div>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>{f.title}</div>
                <div className="text-secondary" style={{ fontSize:14, marginBottom:16, lineHeight:1.6 }}>{f.desc}</div>
                <div style={{ color: f.textColor, fontSize:13, fontWeight:600 }}>{f.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="page-content" id="how-it-works" style={{ padding:'var(--space-10) 0' }}>
        <div className="container">
          <div className="section-header reveal" style={{ textAlign:'center' }}>
            <div className="section-eyebrow">✦ Process</div>
            <h2 className="section-title">How LegacyX Works</h2>
            <p className="section-desc">Five simple steps to secure your digital wealth for the next generation.</p>
          </div>
          <div style={{ maxWidth:680, margin:'0 auto', position:'relative' }}>
            <div style={{ position:'absolute', left:24, top:0, bottom:0, width:1, background:'var(--border-subtle)' }} aria-hidden="true" />
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {STEPS.map((s, i) => (
                <div key={s.step} className="reveal" data-delay={i * 100}
                  style={{ display:'flex', gap:32, paddingBottom:40, position:'relative' }}>
                  <div style={{
                    width:48, height:48, borderRadius:'50%',
                    background: 'var(--bg-secondary)',
                    border: '2px solid rgba(255,209,102,0.3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, flexShrink:0, zIndex:1,
                  }}>{s.emoji}</div>
                  <div style={{ paddingTop:8, textAlign:'left' }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:6 }}>{s.step}</div>
                    <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{s.title}</div>
                    <div className="text-secondary" style={{ fontSize:15, lineHeight:1.7 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OTC SECTION ── */}
      <section className="page-content" id="otc" style={{ padding:'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <div className="reveal-left" style={{ textAlign:'left' }}>
              <div className="section-eyebrow" style={{ marginBottom:16 }}>✦ Private OTC Marketplace</div>
              <h2 className="text-h1" style={{ marginBottom:16 }}>
                Sell Inherited Assets.<br />
                <span style={{ background:'var(--grad-gold)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Stay Invisible.</span>
              </h2>
              <p className="text-body text-secondary" style={{ marginBottom:24 }}>
                Beneficiaries can sell large amounts of inherited crypto without revealing their wallet address, the amount sold, or the agreed price.
              </p>
              <ul style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
                {['Hidden seller & buyer identity','Concealed transaction amount','Private price negotiation','On-chain final settlement only'].map(item => (
                  <li key={item} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--text-secondary)' }}>
                    <span style={{ color:'var(--green)', fontSize:18 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/marketplace" className="btn btn-gold" id="landing-otc-btn">View OTC Marketplace →</Link>
            </div>
            <div className="reveal-right">
              <div className="otc-mockup" style={{ borderColor:'rgba(255,209,102,0.15)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={{ fontSize:14, fontWeight:700 }}>Private OTC Desk</span>
                  <span className="badge badge-gold"><span className="badge-dot" />Live</span>
                </div>
                {[{id:'LX-8821',matched:true},{id:'LX-8820',matched:false}].map(t => (
                  <div key={t.id} className="otc-trade-card">
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Trade #{t.id}</div>
                    {['Seller','Buyer','Amount','Price'].map(k => (
                      <div key={k} className="otc-row">
                        <span className="otc-key">{k}</span>
                        <span className="otc-val-hidden">{'█'.repeat(9)}</span>
                      </div>
                    ))}
                    <div className="otc-row">
                      <span className="otc-key">Status</span>
                      <span className="otc-status">
                        {t.matched
                          ? <><span style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px var(--green)',display:'inline-block' }} /> Matched</>
                          : <span style={{ color:'var(--gold)', fontWeight:600, fontSize:12 }}>⏳ Pending Match</span>}
                      </span>
                    </div>
                  </div>
                ))}
                <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:12 }}>All trades settle on-chain. Identities remain private.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="page-content" style={{ padding:'var(--space-10) 0', textAlign:'center' }}>
        <div className="container">
          <div className="reveal-scale">
            <div className="section-eyebrow" style={{ display:'inline-flex', marginBottom:24 }}>✦ Start Today</div>
            <h2 className="text-h1" style={{ marginBottom:16 }}>
              Don't Let Your Crypto<br />
              <span style={{ background:'var(--grad-gold)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Disappear Forever</span>
            </h2>
            <p className="text-body text-secondary" style={{ maxWidth:480, margin:'0 auto 40px' }}>
              Billions in crypto has already been lost to inaccessible wallets. Create your Legacy Vault in minutes.
            </p>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/vault"     className="btn btn-gold btn-lg"   id="cta-create-btn">⬡ Create Your Vault</Link>
              <Link to="/dashboard" className="btn btn-ghost btn-lg"  id="cta-demo-btn">View Demo Dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="page-content" style={{ borderTop:'1px solid var(--border-subtle)', padding:'32px 0' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontWeight:800, fontSize:18, background:'var(--grad-gold)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>LegacyX</div>
            <div style={{ display:'flex', gap:32 }}>
              {[{to:'/vault',label:'Vault'},{to:'/marketplace',label:'Marketplace'},{to:'/dashboard',label:'Dashboard'},{to:'/unlock',label:'Demo Unlock'}].map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize:14, color:'var(--text-muted)', transition:'color 0.15s' }}>{l.label}</Link>
              ))}
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>Built on Flare Coston2 · © 2025 LegacyX</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
