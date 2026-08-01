import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../components/wallet/WalletProvider';
import { useVaultData } from '../components/wallet/VaultDataProvider';
import Icn from '../components/ui/Icon';

const SIDEBAR_ITEMS = [
  { icon: 'home',     label: 'Overview',     id: 'overview'  },
  { icon: 'lock',     label: 'My Vault',     id: 'vault'     },
  { icon: 'users',    label: 'Beneficiaries',id: 'benes'     },
  { icon: 'barChart', label: 'Analytics',    id: 'analytics' },
  { icon: 'bell',     label: 'Activity',     id: 'activity'  },
  { icon: 'settings', label: 'Settings',     id: 'settings'  },
];

const colorFor = i => ['var(--blue)','var(--purple)','var(--green)','var(--gold)','var(--cyan)'][i % 5];
const colorRgb = c => c === 'var(--blue)' ? '212,160,23' : c === 'var(--purple)' ? '184,115,51'
  : c === 'var(--gold)' ? '255,209,102' : c === 'var(--green)' ? '0,214,143' : '44,230,255';

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// Fixed sample data for the unauthenticated "preview" dashboard only.
const DEMO_VAULT = {
  asset: 'FXRP', amount: '250', condition: 'inactivity', months: 12,
  conditionLabel: 'Inactivity timer set to 12 months',
  createdAt: Date.now() - 2*86400000,
  txHash: '0xDEMO00000000000000000000000000000000',
  beneficiaries: [
    { name:'Mother',   pct:50, addr:'0xDemo1', email:'mother@email.com'  },
    { name:'Brother',  pct:30, addr:'0xDemo2', email:'brother@email.com' },
    { name:'Daughter', pct:20, addr:'0xDemo3', email:''                  },
  ],
  activity: [
    { icon:'lock',  text:'Legacy Vault deployed on Coston2', time: Date.now() - 2*86400000 },
    { icon:'users', text:'3 beneficiaries added',            time: Date.now() - 2*86400000 },
    { icon:'clock', text:'Inactivity timer set to 12 months',time: Date.now() - 2*86400000 },
    { icon:'check', text:'Vault configuration verified',     time: Date.now() - 1*86400000 },
  ],
};

function EmptyState({ icon, title, sub, cta }) {
  return (
    <div className="card" style={{ textAlign:'center', padding:'48px 24px' }}>
      <div style={{ color:'var(--text-muted)', display:'flex', justifyContent:'center', marginBottom:16 }}>
        <Icn name={icon} size={30} />
      </div>
      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{title}</h3>
      <p style={{ color:'var(--text-muted)', fontSize:13.5, marginBottom: cta ? 20 : 0 }}>{sub}</p>
      {cta}
    </div>
  );
}

export default function Dashboard({ demoMode = false }) {
  const { isConnected, account, shorten, balance, disconnect, connect } = useWallet();
  const vaultData = useVaultData();
  const navigate = useNavigate();
  const [active, setActive]               = useState('overview');
  const [mobileNavOpen, setMobileNavOpen]  = useState(false);
  const [notifyEmail, setNotifyEmail]      = useState(true);

  // Demo mode is only for people who haven't connected yet — once they connect
  // a real wallet, bounce them to their real dashboard instead.
  useEffect(() => {
    if (demoMode && isConnected) navigate('/dashboard', { replace: true });
  }, [demoMode, isConnected, navigate]);

  const hasVault = demoMode ? true : vaultData.hasVault;
  const vault    = demoMode ? DEMO_VAULT : vaultData.vault;
  const benes    = hasVault ? vault.beneficiaries : [];
  const activity = hasVault ? vault.activity : [];

  const CreateCta = () => (
    <Link to="/vault" className="btn btn-gold btn-sm" style={{ display:'inline-flex' }}>+ Create Vault</Link>
  );

  const StatCards = () => (
    <div className="grid-4" style={{ marginBottom:32 }}>
      {[
        { label:'Total Vaulted',    value: hasVault ? `${vault.amount} ${vault.asset}` : '—', sub: hasVault ? 'On Flare Coston2' : 'No vault yet', accent:'var(--grad-blue-purple)' },
        { label:'Beneficiaries',    value: hasVault ? String(benes.length) : '0',              sub: hasVault ? 'Configured' : 'None added',        accent:'var(--grad-blue-cyan)'   },
        { label:'Vault Status',     value: hasVault ? 'Active' : 'None',                       sub: hasVault ? 'All conditions set' : 'Not deployed', accent:'linear-gradient(135deg,#00D68F,#00B4D8)' },
        { label:'Unlock Condition', value: hasVault ? (vault.condition === 'inactivity' ? `${vault.months}mo` : vault.condition === 'date' ? 'Timed' : 'Guardian') : '—', sub: hasVault ? vault.conditionLabel : 'No vault yet', accent:'var(--grad-gold)' },
      ].map(c => (
        <div key={c.label} className="stat-card" style={{ '--card-accent': c.accent }}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value" style={{ background: c.accent, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{c.value}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );

  const BeneCard = ({ compact }) => hasVault && benes.length > 0 ? (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div className="stat-label">Beneficiaries</div>
        <span className="badge badge-green">Active</span>
      </div>
      {benes.map((b, i) => (
        <div key={b.addr || i} style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontWeight:600 }}>{b.name}</span>
            <div style={{ display:'flex', gap:12, fontSize:13 }}>
              <span style={{ color: colorFor(i), fontWeight:700 }}>{b.pct}%</span>
              <span style={{ color:'var(--text-muted)' }}>{((parseFloat(b.pct)||0)/100 * parseFloat(vault.amount||0)).toFixed(2)} {vault.asset}</span>
            </div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width:`${b.pct}%`, background: colorFor(i) }} />
          </div>
          {!compact && (
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>
              Notify: {b.email ? b.email : <span style={{ color:'var(--danger)' }}>no email on file</span>}
            </div>
          )}
        </div>
      ))}
      {!demoMode && <Link to="/vault" className="btn btn-ghost btn-sm" style={{ marginTop:8, width:'100%', justifyContent:'center' }}>Edit Beneficiaries</Link>}
    </div>
  ) : (
    <EmptyState icon="users" title="No beneficiaries added" sub="Create a vault to assign who inherits your assets." cta={<CreateCta />} />
  );

  const ActivityCard = ({ compact }) => hasVault && activity.length > 0 ? (
    <div className="card">
      <div className="stat-label" style={{ marginBottom:20 }}>Recent Activity</div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {activity.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:36,height:36, borderRadius:'50%', background:`rgba(${colorRgb(colorFor(i))},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', color:colorFor(i), flexShrink:0 }}>
              <Icn name={a.icon} size={16} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{a.text}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{demoMode ? timeAgo(a.time) : timeAgo(a.time)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <EmptyState icon="bell" title="No activity yet" sub="Actions on your vault will show up here." cta={!hasVault ? <CreateCta /> : null} />
  );

  const renderSection = () => {
    switch (active) {
      case 'vault':
        return hasVault ? (
          <div className="card" style={{ maxWidth: 640 }}>
            <div className="stat-label" style={{ marginBottom:20 }}>Vault Details</div>
            {[
              { label:'Asset',            val:`${vault.asset}` },
              { label:'Amount Deposited', val:`${vault.amount} ${vault.asset}` },
              { label:'Condition',        val: vault.conditionLabel },
              { label:'Network',          val:'Flare Coston2 Testnet' },
              { label:'Transaction',      val: vault.txHash ? `${vault.txHash.slice(0,10)}…${vault.txHash.slice(-6)}` : '—' },
              { label:'Status',           val:'Active' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border-subtle)', fontSize:14 }}>
                <span style={{ color:'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight:500 }}>{r.val}</span>
              </div>
            ))}
            {!demoMode && <Link to="/vault" className="btn btn-gold" style={{ marginTop:20 }}>Manage Vault</Link>}
          </div>
        ) : (
          <div style={{ maxWidth: 480 }}>
            <EmptyState icon="lock" title="No vault deployed yet" sub="Deposit an asset and set your beneficiaries to create your Legacy Vault." cta={<CreateCta />} />
          </div>
        );

      case 'benes':
        return <div style={{ maxWidth: 640 }}><BeneCard /></div>;

      case 'analytics':
        return !hasVault ? (
          <div style={{ maxWidth: 480 }}>
            <EmptyState icon="barChart" title="No analytics yet" sub="Analytics appear once you've deployed a vault." cta={<CreateCta />} />
          </div>
        ) : (
          <div>
            <div className="grid-3" style={{ marginBottom:24 }}>
              {[
                { label:'Vault Value',    value:`${vault.amount} ${vault.asset}`, sub:'Deposited amount' },
                { label:'Vault Age',      value: `${Math.max(1, Math.floor((Date.now()-vault.createdAt)/86400000))}d`, sub:'Since deployment' },
                { label:'Beneficiaries',  value: String(benes.length), sub:'Configured' },
              ].map(c => (
                <div key={c.label} className="card">
                  <div className="stat-label">{c.label}</div>
                  <div style={{ fontSize:26, fontWeight:700, margin:'6px 0' }}>{c.value}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{c.sub}</div>
                </div>
              ))}
            </div>
            {benes.length > 0 && (
              <div className="card">
                <div className="stat-label" style={{ marginBottom:20 }}>Allocation Breakdown</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:24, height:140, padding:'0 8px', flexWrap:'wrap' }}>
                  {benes.map((b, i) => (
                    <div key={b.addr || i} style={{ flex:1, minWidth:60, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:colorFor(i) }}>{b.pct}%</div>
                      <div style={{ width:'100%', height:`${(b.pct||0) * 1.1}px`, background:colorFor(i), borderRadius:'6px 6px 0 0', opacity:0.85 }} />
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'activity':
        return <div style={{ maxWidth: 640 }}><ActivityCard /></div>;

      case 'settings':
        return (
          <div className="card" style={{ maxWidth: 560 }}>
            <div className="stat-label" style={{ marginBottom:20 }}>Account Settings</div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Connected Wallet</div>
              <div style={{ fontFamily:'monospace', fontSize:14, color:'var(--green)', wordBreak:'break-all' }}>
                {demoMode ? 'Not connected — this is a preview' : (isConnected ? account : 'Not connected')}
              </div>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, cursor:'pointer' }}>
              <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} disabled={demoMode} />
              <span style={{ fontSize:14 }}>Email beneficiaries automatically when the vault unlocks</span>
            </label>
            {!demoMode && <button className="btn btn-ghost" onClick={disconnect} disabled={!isConnected}>Disconnect Wallet</button>}
          </div>
        );

      case 'overview':
      default:
        return (
          <>
            <StatCards />
            {!hasVault ? (
              <EmptyState
                icon="lock"
                title="You haven't created a vault yet"
                sub="Deposit crypto, assign beneficiaries, and set unlock conditions — takes about 2 minutes."
                cta={<CreateCta />}
              />
            ) : (
              <div className="grid-2">
                <BeneCard compact />
                <ActivityCard compact />
              </div>
            )}
            {!demoMode && (
              <div className="card" style={{ marginTop:24, textAlign:'center', background:'linear-gradient(135deg,rgba(212,160,23,0.06),rgba(184,115,51,0.06))', borderColor:'rgba(212,160,23,0.2)' }}>
                <div style={{ color:'var(--gold)', display:'flex', justifyContent:'center', marginBottom:8 }}><Icn name="lock" size={24} /></div>
                <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Demo the Vault Unlock</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20 }}>See the full inheritance flow: conditions met → vault opens → assets distributed.</p>
                <Link to="/unlock" className="btn btn-primary" id="dash-demo-unlock-btn">Run Unlock Demo</Link>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {demoMode && (
        <div className="dashboard-demo-banner">
          <Icn name="zap" size={15} />
          <span>You're viewing a preview with sample data — nothing here is real.</span>
          <button className="btn btn-gold btn-sm" onClick={connect} id="demo-connect-btn">Connect Wallet</button>
        </div>
      )}

      {/* Mobile sidebar toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileNavOpen(o => !o)} aria-label="Toggle navigation">
        <Icn name="settings" size={18} />
        <span>{SIDEBAR_ITEMS.find(s => s.id === active)?.label || 'Menu'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar${mobileNavOpen ? ' open' : ''}${demoMode ? ' sidebar-with-banner' : ''}`}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Navigation</div>
          {SIDEBAR_ITEMS.map(item => (
            <div
              key={item.id}
              className={`sidebar-item${active === item.id ? ' active' : ''}`}
              onClick={() => { setActive(item.id); setMobileNavOpen(false); }}
              id={`sidebar-${item.id}`}
            >
              <span className="sidebar-icon"><Icn name={item.icon} size={17} /></span>
              {item.label}
            </div>
          ))}
        </div>
        <div style={{ marginTop:'auto' }}>
          {!demoMode && <Link to="/vault" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:13, padding:'10px 16px' }}>+ New Vault</Link>}
        </div>
      </aside>
      {mobileNavOpen && <div className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} />}

      {/* Main */}
      <main className={`dashboard-main${demoMode ? ' dashboard-main-with-banner' : ''}`}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(24px,3vw,36px)', fontWeight:600, letterSpacing:'-0.01em', marginBottom:6 }}>
              {SIDEBAR_ITEMS.find(s => s.id === active)?.label || 'Dashboard'}
            </h1>
            {demoMode
              ? <p style={{ color:'var(--text-muted)', fontSize:14 }}>Sample wallet · Sample balance</p>
              : isConnected
                ? <p style={{ color:'var(--text-muted)', fontSize:14 }}>Wallet: <span style={{ color:'var(--green)', fontFamily:'monospace' }}>{shorten(account)}</span> &nbsp;•&nbsp; Balance: <span style={{ color:'var(--blue)' }}>{balance} C2FLR</span></p>
                : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Connect your wallet to access your vault data.</p>
            }
          </div>
          {!demoMode && <Link to="/unlock" className="btn btn-ghost btn-sm" id="dash-unlock-btn">Demo Unlock</Link>}
        </div>

        {renderSection()}
      </main>
    </div>
  );
}
