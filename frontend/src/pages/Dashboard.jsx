import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../components/wallet/WalletProvider';
import { useToast } from '../components/ui/Toast';
import useReveal from '../hooks/useReveal';

const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Overview',     id: 'overview'  },
  { icon: '🔐', label: 'My Vault',     id: 'vault'     },
  { icon: '👥', label: 'Beneficiaries',id: 'benes'     },
  { icon: '📊', label: 'Analytics',    id: 'analytics' },
  { icon: '🔔', label: 'Activity',     id: 'activity'  },
  { icon: '⚙️',  label: 'Settings',    id: 'settings'  },
];

const ACTIVITY = [
  { icon:'🔐', text:'Legacy Vault deployed on Coston2',   time:'2 days ago',  color:'var(--blue)'   },
  { icon:'👥', text:'3 beneficiaries added',               time:'2 days ago',  color:'var(--purple)' },
  { icon:'⏱️', text:'Inactivity timer set to 12 months',  time:'2 days ago',  color:'var(--gold)'   },
  { icon:'✅', text:'Vault configuration verified',          time:'1 day ago',   color:'var(--green)'  },
  { icon:'⚡', text:'Connected to Flare Coston2',            time:'Just now',    color:'var(--cyan)'   },
];

const BENES = [
  { name:'Mother',   pct:50, color:'var(--blue)',   amount:'125 FXRP' },
  { name:'Brother',  pct:30, color:'var(--purple)', amount:'75 FXRP'  },
  { name:'Daughter', pct:20, color:'var(--green)',  amount:'50 FXRP'  },
];

export default function Dashboard() {
  const { isConnected, connect, account, shorten, balance } = useWallet();
  const toast    = useToast();
  const navigate = useNavigate();
  const pageRef  = useReveal();
  const [active, setActive]       = useState('overview');
  const [inactivity, setInactivity] = useState(0);
  const [pingLine, setPingLine]     = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setInactivity(35), 800);
    return () => clearTimeout(t);
  }, []);

  // Ping activity lines one by one
  useEffect(() => {
    ACTIVITY.forEach((_, i) => {
      setTimeout(() => setPingLine(i), 600 + i * 400);
    });
  }, []);

  return (
    <div ref={pageRef} style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar page-content">
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Navigation</div>
          {SIDEBAR_ITEMS.map(item => (
            <div
              key={item.id}
              className={`sidebar-item${active === item.id ? ' active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div style={{ marginTop:'auto' }}>
          <Link to="/vault" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:13, padding:'10px 16px' }}>+ New Vault</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="page-content" style={{ marginLeft:240, flex:1, padding:'100px 40px 60px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:6 }}>Dashboard</h1>
            {isConnected
              ? <p style={{ color:'var(--text-muted)', fontSize:14 }}>Wallet: <span style={{ color:'var(--green)', fontFamily:'monospace' }}>{shorten(account)}</span> &nbsp;•&nbsp; Balance: <span style={{ color:'var(--blue)' }}>{balance} C2FLR</span></p>
              : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Connect your wallet to access your vault data.</p>
            }
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {!isConnected && (
              <button className="btn btn-primary btn-sm" onClick={connect} id="dash-connect-btn">Connect Wallet</button>
            )}
            <Link to="/unlock" className="btn btn-ghost btn-sm" id="dash-unlock-btn">Demo Unlock</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid-4 reveal" style={{ marginBottom:32 }}>
          {[
            { label:'Total Vaulted',    value:'250 FXRP', sub:'~$130 USD',       accent:'var(--grad-blue-purple)', glow:'rgba(79,125,255,0.3)'   },
            { label:'Beneficiaries',    value:'3',         sub:'Fully configured', accent:'var(--grad-blue-cyan)',   glow:'rgba(44,230,255,0.3)'   },
            { label:'Vault Status',     value:'Active',    sub:'All conditions set',accent:'linear-gradient(135deg,#00D68F,#00B4D8)', glow:'rgba(0,214,143,0.3)' },
            { label:'Inactivity Timer', value:'35%',       sub:'4.2 months used',  accent:'var(--grad-gold)',        glow:'rgba(255,209,102,0.3)'  },
          ].map(c => (
            <div key={c.label} className="stat-card" style={{ '--card-accent': c.accent }}>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ background: c.accent, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{c.value}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Inactivity bar */}
        <div className="card reveal" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div className="stat-label">Inactivity Timer</div>
              <div style={{ fontSize:22, fontWeight:700, marginBottom:2 }}>4.2 / 12 months</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>Vault unlocks if no activity detected for 12 months</div>
            </div>
            <div style={{ fontSize:32 }}>⏱️</div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${inactivity}%`, transition:'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, color:'var(--text-muted)' }}>
            <span>0 months</span><span style={{ color:'var(--blue)', fontWeight:600 }}>{inactivity}% elapsed</span><span>12 months</span>
          </div>
        </div>

        {/* Beneficiaries + Activity */}
        <div className="grid-2 reveal">
          {/* Beneficiaries */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div className="stat-label">Beneficiaries</div>
              <span className="badge badge-green">Active</span>
            </div>
            {BENES.map(b => (
              <div key={b.name} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontWeight:600 }}>{b.name}</span>
                  <div style={{ display:'flex', gap:12, fontSize:13 }}>
                    <span style={{ color: b.color, fontWeight:700 }}>{b.pct}%</span>
                    <span style={{ color:'var(--text-muted)' }}>{b.amount}</span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width:`${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}
            <Link to="/vault" className="btn btn-ghost btn-sm" style={{ marginTop:8, width:'100%', justifyContent:'center' }}>Edit Beneficiaries</Link>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="stat-label" style={{ marginBottom:20 }}>Recent Activity</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:16, opacity: pingLine !== null && i <= pingLine ? 1 : 0.2, transition:'opacity 0.5s ease' }}>
                  <div style={{ width:36,height:36, borderRadius:'50%', background:`rgba(${a.color === 'var(--blue)' ? '79,125,255' : a.color === 'var(--purple)' ? '139,92,246' : a.color === 'var(--gold)' ? '255,209,102' : a.color === 'var(--green)' ? '0,214,143' : '44,230,255'},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{a.text}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card reveal" style={{ marginTop:24, textAlign:'center', background:'linear-gradient(135deg,rgba(79,125,255,0.06),rgba(139,92,246,0.06))', borderColor:'rgba(79,125,255,0.2)' }}>
          <div style={{ fontSize:24, marginBottom:8 }}>🔓</div>
          <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Demo the Vault Unlock</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20 }}>See the full inheritance flow: conditions met → vault opens → assets distributed.</p>
          <Link to="/unlock" className="btn btn-primary" id="dash-demo-unlock-btn">Run Unlock Demo</Link>
        </div>
      </main>
    </div>
  );
}
