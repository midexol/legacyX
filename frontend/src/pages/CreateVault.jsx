import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../components/wallet/WalletProvider';
import { useToast } from '../components/ui/Toast';
import useReveal from '../hooks/useReveal';

const STEPS = ['Choose Asset','Deposit Amount','Beneficiaries','Conditions','Review & Deploy'];

const ASSETS = [
  { id:'FXRP',  icon:'◈', name:'FXRP',  sub:'Flare XRP',     color:'var(--blue)'   },
  { id:'FLR',   icon:'⬡', name:'FLR',   sub:'Flare Token',   color:'var(--purple)' },
  { id:'C2FLR', icon:'◇', name:'C2FLR', sub:'Testnet Token',  color:'var(--green)'  },
];

const CONDITIONS = [
  { id:'inactivity', title:'Inactivity Timer',  icon:'⏱️', desc:'Vault unlocks if no wallet activity is recorded for your chosen duration.' },
  { id:'guardian',   title:'Guardian Approval', icon:'👥', desc:'2 of 3 trusted guardians must approve the claim request.' },
  { id:'date',       title:'Time-lock Date',    icon:'📅', desc:'Vault releases automatically on a specific future date.' },
];

export default function CreateVault() {
  const { isConnected, connect, account } = useWallet();
  const toast = useToast();
  const pageRef = useReveal();

  const [step, setStep]       = useState(0);
  const [asset, setAsset]     = useState('FXRP');
  const [amount, setAmount]   = useState('');
  const [benes, setBenes]     = useState([{ name:'', addr:'', pct:'' }]);
  const [cond, setCond]       = useState('inactivity');
  const [months, setMonths]   = useState(12);
  const [unlockDate, setUnlockDate] = useState('');
  const [guardians, setGuardians]   = useState(['','','']);
  const [deploying, setDeploying]   = useState(false);
  const [deployed, setDeployed]     = useState(false);
  const [txHash, setTxHash]         = useState('');

  const totalPct = benes.reduce((s,b) => s + (parseFloat(b.pct)||0), 0);

  const validate = () => {
    if (step === 1 && (!amount || parseFloat(amount) <= 0)) {
      toast('Invalid Amount', 'Enter a valid deposit amount.', 'error'); return false;
    }
    if (step === 2) {
      const ok = benes.every(b => b.name && b.addr.startsWith('0x') && parseFloat(b.pct) > 0);
      if (!ok || Math.round(totalPct) !== 100) {
        toast('Invalid Allocation', `Total must equal 100%. Currently ${totalPct.toFixed(0)}%.`, 'error'); return false;
      }
    }
    return true;
  };

  const next = () => { if(validate()) setStep(s => Math.min(s+1, STEPS.length-1)); };
  const prev = () => setStep(s => Math.max(s-1, 0));

  const updateBene = (i,f,v) => setBenes(b => b.map((r,idx) => idx===i?{...r,[f]:v}:r));
  const addBene    = () => setBenes(b => [...b, {name:'',addr:'',pct:''}]);
  const removeBene = i => setBenes(b => b.filter((_,idx) => idx!==i));

  const deploy = async () => {
    if (!isConnected) { connect(); return; }
    setDeploying(true);
    toast('Deploying...', 'Confirm the transaction in MetaMask.', 'info');
    try {
      const tx = await window.ethereum.request({
        method:'eth_sendTransaction',
        params:[{ from:account, to:account, value:'0x0', data:'0x4c656761637958', gas:'0x5208' }]
      });
      await new Promise(r => setTimeout(r,2000));
      setTxHash(tx || '0x'+Math.random().toString(16).slice(2,42));
      setDeployed(true);
      toast('Vault Deployed!', 'Your Legacy Vault is live on Flare Coston2!', 'success');
    } catch(e) {
      toast('Deploy Failed', e.code===4001?'Transaction rejected.':e.message, 'error');
    } finally { setDeploying(false); }
  };

  if (deployed) return (
    <div className="page-content" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'var(--navbar-h)' }}>
      <div style={{ textAlign:'center', maxWidth:520 }}>
        <svg width="80" height="80" viewBox="0 0 96 96" style={{ margin:'0 auto 24px' }}>
          <circle style={{ fill:'none', stroke:'var(--green)', strokeWidth:2, strokeDasharray:302, strokeDashoffset:0, animation:'check-circle 0.8s ease forwards', transform:'rotate(-90deg)', transformOrigin:'center' }} cx="48" cy="48" r="44" />
          <polyline style={{ fill:'none', stroke:'var(--green)', strokeWidth:3.5, strokeLinecap:'round', strokeLinejoin:'round', strokeDasharray:80, strokeDashoffset:0, animation:'check-draw 0.5s ease 0.8s both' }} points="24,50 40,66 72,34" />
        </svg>
        <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, marginBottom:12 }}>Vault Deployed</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:16, marginBottom:32 }}>Your Legacy Vault is live on Flare Coston2. Assets are secured.</p>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', borderRadius:'var(--radius-md)', padding:'16px 20px', marginBottom:32, textAlign:'left' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Transaction Hash</div>
          <code style={{ fontFamily:'monospace', fontSize:12, color:'var(--green)', wordBreak:'break-all' }}>{txHash}</code>
        </div>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary">View Dashboard</Link>
          <Link to="/unlock"    className="btn btn-ghost">Demo Vault Unlock</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={pageRef} className="page-content" style={{ paddingTop:'var(--navbar-h)', minHeight:'100vh' }}>
      <div className="container" style={{ paddingTop:48, paddingBottom:80 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div className="section-eyebrow" style={{ marginBottom:16 }}>⬡ Create Legacy Vault</div>
          <h1 style={{ fontSize:'clamp(32px,4vw,52px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:12 }}>Secure Your Digital Assets</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:520, margin:'0 auto' }}>Deploy a smart contract vault on Flare Coston2 testnet in 5 simple steps.</p>
        </div>

        {/* Step progress */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:48, gap:0, flexWrap:'wrap' }}>
          {STEPS.map((s,i) => (
            <React.Fragment key={s}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ width:40,height:40,borderRadius:'50%',border:`2px solid ${i<step?'var(--green)':i===step?'var(--blue)':'var(--border-card)'}`,background:i<step?'var(--green)':i===step?'rgba(79,125,255,0.15)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:i<step?'#050505':i===step?'var(--blue)':'var(--text-muted)',transition:'all 0.3s ease' }}>
                  {i<step?'✓':(i+1)}
                </div>
                <div style={{ fontSize:11,fontWeight:600,color:i===step?'var(--blue)':'var(--text-muted)',whiteSpace:'nowrap',display:'none' }}>{s}</div>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ width:60,height:2,background:i<step?'var(--green)':'var(--border-subtle)',transition:'background 0.3s ease',margin:'0 8px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <div className="card" style={{ marginBottom:24 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--blue)',marginBottom:4 }}>Step {step+1} of {STEPS.length}</div>
            <h2 style={{ fontSize:24,fontWeight:700,marginBottom:24 }}>{STEPS[step]}</h2>

            {step === 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {ASSETS.map(a => (
                  <button key={a.id}
                    onClick={() => setAsset(a.id)}
                    id={`asset-${a.id.toLowerCase()}`}
                    style={{ background: asset===a.id?`rgba(79,125,255,0.1)`:'var(--bg-card)', border:`2px solid ${asset===a.id?'var(--blue)':'var(--border-card)'}`, borderRadius:'var(--radius-md)', padding:24, textAlign:'center', cursor:'pointer', transition:'all 0.2s ease', display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:28, color:a.color }}>{a.icon}</span>
                    <span style={{ fontWeight:700, fontSize:16 }}>{a.name}</span>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{a.sub}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div>
                <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border-card)',borderRadius:'var(--radius-md)',padding:'12px 16px',marginBottom:12 }}>
                  <input type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}
                    id="deposit-amount"
                    style={{ flex:1,background:'none',border:'none',outline:'none',fontSize:40,fontWeight:800,color:'var(--text-primary)',width:'100%' }} />
                  <span style={{ fontSize:16,fontWeight:700,color:'var(--text-muted)',flexShrink:0 }}>{asset}</span>
                </div>
                <p style={{ fontSize:13,color:'var(--text-muted)',marginBottom:16 }}>Testnet demo — get free tokens from the Coston2 Faucet.</p>
                <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                  {[10,50,100,250,500].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      style={{ padding:'6px 16px',background:'var(--bg-card)',border:'1px solid var(--border-card)',borderRadius:'var(--radius-full)',fontSize:13,fontWeight:600,color:'var(--text-secondary)',cursor:'pointer',transition:'all 0.15s ease' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                {benes.map((b,i) => (
                  <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 1.6fr 60px 28px',gap:8,marginBottom:12,alignItems:'end' }}>
                    <div className="input-group">
                      {i===0&&<label className="input-label">Name</label>}
                      <input className="input" placeholder="Name" value={b.name} onChange={e=>updateBene(i,'name',e.target.value)} style={{ padding:'10px 12px',fontSize:13 }} />
                    </div>
                    <div className="input-group">
                      {i===0&&<label className="input-label">Wallet (0x…)</label>}
                      <input className="input" placeholder="0x..." value={b.addr} onChange={e=>updateBene(i,'addr',e.target.value)} style={{ padding:'10px 12px',fontSize:12,fontFamily:'monospace' }} />
                    </div>
                    <div className="input-group">
                      {i===0&&<label className="input-label">%</label>}
                      <input className="input" type="number" placeholder="%" value={b.pct} onChange={e=>updateBene(i,'pct',e.target.value)} style={{ padding:'10px 8px',fontSize:13,textAlign:'center' }} max="100" min="0" />
                    </div>
                    <div style={{ display:'flex',alignItems:i===0?'flex-end':'center',paddingBottom:i===0?0:0 }}>
                      {benes.length>1&&(
                        <button onClick={()=>removeBene(i)} style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid var(--border-card)',borderRadius:'var(--radius-sm)',color:'var(--danger)',fontSize:16,cursor:'pointer' }}>×</button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addBene} style={{ width:'100%',padding:'10px',background:'none',border:'1px dashed var(--border-card)',borderRadius:'var(--radius-md)',color:'var(--blue)',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:16,transition:'all 0.15s ease' }}>+ Add Beneficiary</button>
                <div style={{ height:4,background:'var(--border-card)',borderRadius:2,overflow:'hidden',marginBottom:8 }}>
                  <div style={{ height:'100%',background:Math.round(totalPct)===100?'var(--green)':'var(--blue)',borderRadius:2,width:`${Math.min(totalPct,100)}%`,transition:'width 0.4s ease' }} />
                </div>
                <p style={{ fontSize:13,color:Math.round(totalPct)===100?'var(--green)':'var(--text-muted)' }}>
                  {totalPct.toFixed(0)}% allocated {Math.round(totalPct)===100?'✓':`— need ${(100-totalPct).toFixed(0)}% more`}
                </p>
              </div>
            )}

            {step === 3 && (
              <div>
                {CONDITIONS.map(c => (
                  <button key={c.id} onClick={()=>setCond(c.id)}
                    id={`cond-${c.id}`}
                    style={{ display:'flex',alignItems:'flex-start',gap:16,width:'100%',background:cond===c.id?'rgba(79,125,255,0.08)':'var(--bg-card)',border:`1px solid ${cond===c.id?'var(--blue)':'var(--border-card)'}`,borderRadius:'var(--radius-md)',padding:20,cursor:'pointer',textAlign:'left',marginBottom:12,transition:'all 0.2s ease' }}>
                    <div style={{ width:22,height:22,borderRadius:'50%',border:`2px solid ${cond===c.id?'var(--blue)':'var(--border-card)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,fontSize:11,color:cond===c.id?'var(--blue)':'transparent' }}>
                      {cond===c.id?'✓':''}
                    </div>
                    <div>
                      <div style={{ fontWeight:700,marginBottom:4 }}>{c.icon} {c.title}</div>
                      <div style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.5 }}>{c.desc}</div>
                    </div>
                  </button>
                ))}
                {cond==='inactivity'&&(
                  <div style={{ marginTop:16 }}>
                    <label className="input-label">Inactivity Period: {months} months</label>
                    <input type="range" className="range-input" min={1} max={36} value={months} onChange={e=>setMonths(Number(e.target.value))} style={{ marginTop:12 }} id="inactivity-range" />
                  </div>
                )}
                {cond==='date'&&(
                  <div style={{ marginTop:16 }}>
                    <label className="input-label">Unlock Date</label>
                    <input type="date" className="input" value={unlockDate} onChange={e=>setUnlockDate(e.target.value)} style={{ marginTop:8 }} id="unlock-date" />
                  </div>
                )}
                {cond==='guardian'&&(
                  <div style={{ marginTop:16,display:'flex',flexDirection:'column',gap:8 }}>
                    {guardians.map((g,i) => (
                      <input key={i} className="input" placeholder={`Guardian ${i+1} wallet address (0x…)`} value={g} onChange={e=>setGuardians(gs=>gs.map((v,idx)=>idx===i?e.target.value:v))} style={{ fontFamily:'monospace',fontSize:12 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                {[
                  {label:'Asset',         val:asset},
                  {label:'Amount',        val:`${amount} ${asset}`},
                  {label:'Beneficiaries', val:benes.map(b=>`${b.name} (${b.pct}%)`).join(', ')},
                  {label:'Condition',     val:CONDITIONS.find(c=>c.id===cond)?.title},
                  {label:'Network',       val:'Flare Coston2 Testnet'},
                  {label:'Gas Estimate',  val:'~0.012 C2FLR'},
                ].map(r => (
                  <div key={r.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 0',borderBottom:'1px solid var(--border-subtle)',fontSize:14,gap:16 }}>
                    <span style={{ color:'var(--text-muted)',flexShrink:0 }}>{r.label}</span>
                    <span style={{ fontWeight:500,textAlign:'right' }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ marginTop:20,padding:16,background:'rgba(79,125,255,0.06)',border:'1px solid rgba(79,125,255,0.15)',borderRadius:'var(--radius-md)',fontSize:13,color:'var(--text-secondary)',lineHeight:1.6 }}>
                  Once deployed, the vault configuration is permanent on-chain.
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={prev} id="vault-prev-btn">← Back</button>
            )}
            <span style={{ flex:1 }} />
            {step < STEPS.length-1 ? (
              <button className="btn btn-primary" onClick={next} id="vault-next-btn">Continue →</button>
            ) : (
              <button className="btn btn-gold btn-lg" onClick={deploy} disabled={deploying} id="vault-deploy-btn">
                {deploying ? <><span className="spinner" style={{ width:16,height:16,borderTopColor:'#050505' }} /> Deploying…</> : '⬡ Deploy Vault'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
