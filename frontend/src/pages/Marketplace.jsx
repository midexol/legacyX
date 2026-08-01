import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '../components/wallet/WalletProvider';
import { useToast } from '../components/ui/Toast';
import Icn from '../components/ui/Icon';
import useReveal from '../hooks/useReveal';

const TRADES = [
  { id:'LX-8821', matched:true,  time:'2 min ago'  },
  { id:'LX-8820', matched:false, time:'8 min ago'  },
  { id:'LX-8819', matched:true,  time:'15 min ago' },
];

const SETTLEMENTS = [
  { hash:'0x4a2f…c31e', time:'5 min ago'  },
  { hash:'0x7d1b…9a3c', time:'12 min ago' },
  { hash:'0x2e5c…f88a', time:'31 min ago' },
  { hash:'0x9f3a…2b1d', time:'1 hr ago'   },
];

export default function Marketplace() {
  const { isConnected, connect } = useWallet();
  const toast = useToast();
  const pageRef = useReveal();
  const chartRef = useRef(null);
  const [sellAsset, setSellAsset] = useState('FXRP');
  const [sellAmt, setSellAmt]     = useState('');
  const [minPrice, setMinPrice]   = useState('');
  const [trades, setTrades]       = useState(TRADES);
  const [priceStr, setPriceStr]   = useState('$0.5214');

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const draw = () => {
      const W = canvas.parentElement.offsetWidth || 600;
      const H = 200;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const data = []; let p = 0.52;
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
  }, []);

  // Tick price
  useEffect(() => {
    const id = setInterval(() => {
      const v = 0.5214 + (Math.random()-0.5)*0.002;
      setPriceStr('$'+v.toFixed(4));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const submitOrder = () => {
    if (!isConnected) { connect(); return; }
    if (!sellAmt || parseFloat(sellAmt)<=0) { toast('Invalid Amount','Enter a valid amount.','error'); return; }
    toast('Order Submitted', 'Private order queued. Matching in progress…', 'success');
    const newId = 'LX-'+(8825+trades.length);
    setTrades(t => [{ id:newId, matched:false, time:'just now' }, ...t]);
    setTimeout(() => {
      setTrades(t => t.map(tr => tr.id===newId?{...tr,matched:true,time:'1 min ago'}:tr));
      toast('Trade Matched','Your order has been matched.','success');
    }, 6000);
    setSellAmt(''); setMinPrice('');
  };

  return (
    <div ref={pageRef} className="page-content" style={{ paddingTop:'var(--navbar-h)', minHeight:'100vh' }}>
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
            {label:'FXRP Price',      val:priceStr},
            {label:'24h OTC Volume',  val:'$284K'},
            {label:'Trades Settled',  val:'142'},
            {label:'Pending Matches', val:'7'},
          ].map(s => (
            <div key={s.label} style={{ background:'var(--bg-secondary)',padding:'20px 24px',textAlign:'center' }}>
              <div style={{ fontSize:26,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:11,color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Trades */}
        <div className="otc-main-grid">
          <div className="card reveal">
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
            {trades.map(t => (
              <div key={t.id} className="card" style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:12 }}># {t.id}</div>
                {['Seller','Buyer','Amount','Price'].map(k=>(
                  <div key={k} className="otc-row">
                    <span className="otc-key">{k}</span>
                    <span className="otc-val-hidden">{'█'.repeat(10)}</span>
                  </div>
                ))}
                <div className="otc-row">
                  <span className="otc-key">Status</span>
                  <span style={{ color:t.matched?'var(--green)':'var(--gold)',fontWeight:700,fontSize:12 }}>{t.matched?'✓ Matched':'⧖ Pending'}</span>
                </div>
                <div className="otc-row">
                  <span className="otc-key">Time</span>
                  <span style={{ color:'var(--text-muted)',fontSize:12 }}>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listing form — gated behind wallet connection; rest of the marketplace stays public */}
        <div className="card reveal" style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>List a Private Sale</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:14,marginBottom:24 }}>Identity and amount remain hidden throughout the match process.</p>

          {!isConnected ? (
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
              <button className="btn btn-primary" onClick={submitOrder} id="otc-submit-btn">Submit Private Order</button>
            </>
          )}
        </div>

        {/* Settlement table */}
        <div className="card reveal">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
            <h2 style={{ fontSize:20,fontWeight:700 }}>Recent Settlements</h2>
            <span className="badge badge-green"><span className="badge-dot" />On-Chain</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Tx Hash','Seller','Buyer','Amount','Price','Time','Status'].map(h=>(
                  <th key={h} style={{ textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',padding:'0 16px 12px 0',borderBottom:'1px solid var(--border-subtle)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {SETTLEMENTS.map(s => (
                  <tr key={s.hash}>
                    <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--blue)',fontFamily:'monospace',borderBottom:'1px solid var(--border-subtle)' }}>{s.hash}</td>
                    <td style={{ padding:'14px 16px 14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="otc-val-hidden">{'█'.repeat(8)}</span></td>
                    <td style={{ padding:'14px 16px 14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="otc-val-hidden">{'█'.repeat(8)}</span></td>
                    <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>**** FXRP</td>
                    <td style={{ padding:'14px 16px 14px 0',fontSize:13,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>$***.**</td>
                    <td style={{ padding:'14px 16px 14px 0',fontSize:12,color:'var(--text-muted)',borderBottom:'1px solid var(--border-subtle)' }}>{s.time}</td>
                    <td style={{ padding:'14px 0',borderBottom:'1px solid var(--border-subtle)' }}><span className="badge badge-green">Settled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
