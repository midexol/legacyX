import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../components/wallet/WalletProvider';
import { useToast } from '../components/ui/Toast';
import Icn from '../components/ui/Icon';
import { fetchListings, fetchStats, fetchSettlements, createOrder, apiMode } from '../lib/api';

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)} min ago`;
  return `${Math.floor(s/3600)} hr ago`;
}

// Fixed sample data for the unauthenticated "preview" marketplace only — never shown on the live page.
const DEMO_STATS = { priceUsd: 0.5214, volume24hUsd: 284000, tradesSettled: 142 };
const DEMO_TRADES = [
  { id:'LX-8821', asset:'FXRP', amountRange:'100-500', status:'matched', createdAt: Date.now()-2*60000  },
  { id:'LX-8820', asset:'FXRP', amountRange:'500-1000',status:'pending', createdAt: Date.now()-8*60000  },
  { id:'LX-8819', asset:'FLR',  amountRange:'50-100',  status:'matched', createdAt: Date.now()-15*60000 },
];
const DEMO_SETTLEMENTS = [
  { hash:'0x4a2f…c31e', asset:'FXRP', amountRange:'100-500', settledAt: Date.now()-5*60000  },
  { hash:'0x7d1b…9a3c', asset:'FLR',  amountRange:'50-100',  settledAt: Date.now()-12*60000 },
  { hash:'0x2e5c…f88a', asset:'FXRP', amountRange:'500-1000',settledAt: Date.now()-31*60000 },
  { hash:'0x9f3a…2b1d', asset:'C2FLR',amountRange:'0-100',   settledAt: Date.now()-3600000  },
];

export default function Marketplace({ demoMode = false }) {
  const { isConnected, connect, account } = useWallet();
  const toast = useToast();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [sellAsset, setSellAsset]   = useState('FXRP');
  const [sellAmt, setSellAmt]       = useState('');
  const [minPrice, setMinPrice]     = useState('');
  const [trades, setTrades]         = useState(demoMode ? DEMO_TRADES : []);
  const [tradesLoading, setTradesLoading] = useState(!demoMode);
  const [settlements, setSettlements]         = useState(demoMode ? DEMO_SETTLEMENTS : []);
  const [settlementsLoading, setSettlementsLoading] = useState(!demoMode);
  const [stats, setStats]           = useState(demoMode ? DEMO_STATS : null);
  const [submitting, setSubmitting] = useState(false);

  const loadTrades = useCallback(async () => {
    if (demoMode) return;
    try { setTrades(await fetchListings()); }
    catch (e) { toast('Couldn\'t load trades', e.message, 'error'); }
    finally { setTradesLoading(false); }
  }, [toast, demoMode]);

  const loadSettlements = useCallback(async () => {
    if (demoMode) return;
    try { setSettlements(await fetchSettlements()); }
    catch { /* non-critical */ }
    finally { setSettlementsLoading(false); }
  }, [demoMode]);

  const loadStats = useCallback(async () => {
    if (demoMode) return;
    try { setStats(await fetchStats()); } catch { /* stats are non-critical, fail quietly */ }
  }, [demoMode]);

  useEffect(() => { loadTrades(); loadStats(); loadSettlements(); }, [loadTrades, loadStats, loadSettlements]);

  useEffect(() => {
    if (demoMode) return;
    const id = setInterval(() => { loadTrades(); loadStats(); loadSettlements(); }, 15000);
    return () => clearInterval(id);
  }, [loadTrades, loadStats, loadSettlements, demoMode]);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const draw = () => {
      const W = canvas.parentElement.offsetWidth || 600;
      const H = 200;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const data = []; let p = stats?.priceUsd || 0.52;
      for (let i=0;i<80;i++) { p += (Math.random()-0.49)*0.004; p=Math.max(0.44,Math.min(0.62,p)); data.push(p); }
      const min=Math.min(...data),max=Math.max(...data),range=max-min||0.01;
      const toY = v => H*0.1+((max-v)/range)*(H*0.8);
      ctx.strokeStyle='rgba(150,130,90,0.15)'; ctx.lineWidth=1;
      for(let i=1;i<5;i++){const y=(H/5)*i;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      const grad=ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'rgba(212,160,23,0.15)'); grad.addColorStop(1,'rgba(212,160,23,0)');
      ctx.beginPath(); ctx.moveTo(0,H);
      data.forEach((v,i)=>{const x=(i/(data.length-1))*W; i===0?ctx.lineTo(x,toY(v)):ctx.lineTo(x,toY(v));});
      ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle='#D4A017'; ctx.lineWidth=2; ctx.lineJoin='round';
      data.forEach((v,i)=>{const x=(i/(data.length-1))*W; i===0?ctx.moveTo(x,toY(v)):ctx.lineTo(x,toY(v));});
      ctx.stroke();
      ctx.beginPath(); ctx.arc(W,toY(data[data.length-1]),5,0,Math.PI*2); ctx.fillStyle='#FFD166'; ctx.fill();
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [stats]);

  const submitOrder = async () => {
    if (demoMode) { navigate('/marketplace'); return; }
    if (!isConnected) { connect(); return; }
    if (!sellAmt || parseFloat(sellAmt) <= 0) { toast('Invalid amount', 'Enter a valid amount.', 'error'); return; }
    if (!minPrice || parseFloat(minPrice) <= 0) { toast('Invalid price', 'Enter a minimum price.', 'error'); return; }
    setSubmitting(true);
    try {
      await createOrder({ asset: sellAsset, amount: sellAmt, minPrice, sellerAddress: account });
      toast('Order submitted', 'Private order queued. Matching in progress…', 'success');
      setSellAmt(''); setMinPrice('');
      loadTrades();
    } catch (e) {
      toast('Order failed', e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const priceStr = stats ? `$${stats.priceUsd.toFixed(4)}` : '—';

  return (
    <div className="page-content" style={{ paddingTop: demoMode ? 'calc(var(--navbar-h) + 46px)' : 'var(--navbar-h)', minHeight:'100vh' }}>
      {demoMode && (
        <div className="dashboard-demo-banner">
          <Icn name="zap" size={15} />
          <span>You're viewing a preview with sample data — nothing here is real.</span>
          <Link to="/marketplace" className="btn btn-gold btn-sm">View Live Marketplace</Link>
        </div>
      )}

      <div className="container" style={{ paddingTop:48, paddingBottom:80 }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:40,flexWrap:'wrap',gap:16 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><Icn name="lock" size={14} /> Private OTC Marketplace</div>
            <h1 style={{ fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.03em',marginBottom:8 }}>Private OTC Marketplace</h1>
            <p style={{ color:'var(--text-secondary)',fontSize:15,maxWidth:560 }}>Sell inherited assets privately. Identities and amounts concealed until settlement.</p>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:8 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 8px var(--green)',display:'inline-block',animation:'ping 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize:13,fontWeight:600,color:'var(--green)' }}>Live — Coston2</span>
            {!demoMode && apiMode === 'mock' && (
              <span className="badge" style={{ fontSize:11, color:'var(--text-muted)', borderColor:'var(--border-card)' }} title="No backend configured yet. Set VITE_API_BASE_URL to go live.">
                no backend connected
              </span>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <div style={{ background:'rgba(212,160,23,0.06)',border:'1px solid rgba(212,160,23,0.15)',borderRadius:'var(--radius-md)',padding:'16px 20px',marginBottom:32,display:'flex',gap:16,alignItems:'flex-start' }}>
          <span style={{ color:'var(--gold)', flexShrink:0, marginTop:2 }}><Icn name="shield" size={20} /></span>
          <div>
            <div style={{ fontWeight:700,marginBottom:4 }}>Zero-Knowledge Trading</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)' }}>Seller and buyer identities, amounts, and prices remain hidden. Only on-chain settlement is public.</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="otc-stats-grid">
          {[
            {label:'FXRP Price',      val: priceStr},
            {label:'24h OTC Volume',  val: stats ? `$${(stats.volume24hUsd/1000).toFixed(0)}K` : '—'},
            {label:'Trades Settled',  val: stats ? String(stats.tradesSettled) : '—'},
            {label:'Pending Matches', val: String(trades.filter(t=>t.status==='pending').length)},
          ].map(s => (
            <div key={s.label} style={{ background:'var(--bg-secondary)',padding:'20px 24px',textAlign:'center' }}>
              <div style={{ fontSize:26,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:11,color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Trades */}
        <div className="otc-main-grid">
          <div className="card">
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20 }}>
              <div>
                <div style={{ fontSize:13,color:'var(--text-muted)',marginBottom:4 }}>FXRP / USD</div>
                <div style={{ fontSize:32,fontWeight:800,letterSpacing:'-0.03em' }}>{priceStr}</div>
              </div>
              <span className="badge badge-green">+2.4%</span>
            </div>
            <canvas ref={chartRef} style={{ width:'100%',height:200,display:'block' }} />
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)' }}>Active Trades</div>
            {tradesLoading ? (
              <div className="card" style={{ padding:'32px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Loading trades…</div>
            ) : trades.length === 0 ? (
              <div className="card" style={{ padding:'32px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
                No active trades yet.
                {!demoMode && <div style={{ marginTop:10 }}><Link to="/marketplace-demo" style={{ color:'var(--gold)', fontWeight:600, fontSize:12.5 }}>See what an active marketplace looks like →</Link></div>}
              </div>
            ) : trades.map(t => (
              <div key={t.id} className="card" style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:12 }}># {t.id}</div>
                <div className="otc-row">
                  <span className="otc-key">Asset</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.asset}</span>
                </div>
                <div className="otc-row">
                  <span className="otc-key">Amount</span>
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{t.amountRange}</span>
                </div>
                {['Seller','Buyer','Price'].map(k=>(
                  <div key={k} className="otc-row">
                    <span className="otc-key">{k}</span>
                    <span className="otc-val-hidden">{'█'.repeat(10)}</span>
                  </div>
                ))}
                <div className="otc-row">
                  <span className="otc-key">Status</span>
                  <span style={{ color:t.status==='matched'||t.status==='settled'?'var(--green)':'var(--gold)',fontWeight:700,fontSize:12 }}>{t.status==='matched'?'✓ Matched':t.status==='settled'?'✓ Settled':t.status==='cancelled'?'Cancelled':'⧖ Pending'}</span>
                </div>
                <div className="otc-row">
                  <span className="otc-key">Time</span>
                  <span style={{ color:'var(--text-muted)',fontSize:12 }}>{timeAgo(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listing form — gated behind wallet connection; rest of the marketplace stays public */}
        <div className="card" style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>List a Private Sale</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:14,marginBottom:24 }}>Identity and amount remain hidden throughout the match process.</p>

          {demoMode ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:16, padding:'32px 16px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', border:'1px dashed var(--border-card)' }}>
              <div style={{ color:'var(--gold)' }}><Icn name="lock" size={26} /></div>
              <div>
                <div style={{ fontWeight:700, marginBottom:4 }}>This is a preview</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Head to the live marketplace to actually list an asset.</div>
              </div>
              <button className="btn btn-gold" onClick={submitOrder} id="otc-demo-goto-btn">Go to Live Marketplace</button>
            </div>
          ) : !isConnected ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:16, padding:'32px 16px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', border:'1px dashed var(--border-card)' }}>
              <div style={{ color:'var(--gold)' }}><Icn name="lock" size={26} /></div>
              <div>
                <div style={{ fontWeight:700, marginBottom:4 }}>Connect your wallet to list an asset</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Browsing trades and prices doesn't require a wallet — only creating a listing does.</div>
              </div>
              <button className="btn btn-gold" onClick={connect} id="otc-connect-btn">Connect Wallet</button>
            </div>
          ) : (
            <>
              <div className="otc-form-grid">
                {[
                  { label:'Asset',         node: <select className="input" value={sellAsset} onChange={e=>setSellAsset(e.target.value)} id="otc-asset"><option>FXRP</option><option>FLR</option><option>C2FLR</option></select> },
                  { label:'Amount',        node: <input className="input" type="number" placeholder="0" value={sellAmt} onChange={e=>setSellAmt(e.target.value)} id="otc-amount" /> },
                  { label:'Min Price (USD)',node: <input className="input" type="number" placeholder="0.00" value={minPrice} onChange={e=>setMinPrice(e.target.value)} id="otc-min-price" /> },
                ].map(f => (
                  <div key={f.label} className="input-group">
                    <label className="input-label">{f.label}</label>
                    {f.node}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={submitOrder} disabled={submitting} id="otc-submit-btn">{submitting ? 'Submitting…' : 'Submit Private Order'}</button>
            </>
          )}
        </div>

        {/* Settlement table */}
        <div className="card">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
            <h2 style={{ fontSize:20,fontWeight:700 }}>Recent Settlements</h2>
            <span className="badge badge-green"><span className="badge-dot" />On-Chain</span>
          </div>
          {settlementsLoading ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'24px 0' }}>Loading settlements…</div>
          ) : settlements.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'24px 0' }}>
              No settlements yet.
              {!demoMode && <div style={{ marginTop:10 }}><Link to="/marketplace-demo" style={{ color:'var(--gold)', fontWeight:600, fontSize:12.5 }}>See sample settlements in the demo →</Link></div>}
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['Tx Hash','Seller','Buyer','Amount','Price','Time','Status'].map(h=>(
                    <th key={h} style={{ textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',padding:'0 16px 12px 0',borderBottom:'1px solid var(--border-subtle)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.hash}>
                      <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--blue)',fontFamily:'monospace',borderBottom:'1px solid var(--border-subtle)' }}>{s.hash}</td>
                      <td style={{ padding:'14px 16px 14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="otc-val-hidden">{'█'.repeat(8)}</span></td>
                      <td style={{ padding:'14px 16px 14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="otc-val-hidden">{'█'.repeat(8)}</span></td>
                      <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>{s.amountRange} {s.asset}</td>
                      <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>$***.**</td>
                      <td style={{ padding:'14px 16px 14px 0',fontSize:12,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>{timeAgo(s.settledAt)}</td>
                      <td style={{ padding:'14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="badge badge-green">Settled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
