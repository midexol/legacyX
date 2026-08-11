import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { useVaultData } from '../components/wallet/VaultDataProvider';
import Icn from '../components/ui/Icon';

const SAMPLE_BENES = [
  { name:'Mother',   initial:'M', amount:'125 FXRP', pct:'50%', color:'var(--blue)'   },
  { name:'Brother',  initial:'B', amount:'75 FXRP',  pct:'30%', color:'var(--purple)' },
  { name:'Daughter', initial:'D', amount:'50 FXRP',  pct:'20%', color:'var(--green)'  },
];

const BENES_COLORS = ['var(--blue)', 'var(--purple)', 'var(--green)', 'var(--gold)'];

export default function Unlock() {
  const toast = useToast();
  const { vault, addActivity } = useVaultData();
  const goldRef = useRef(null);
  const [stage, setStage]         = useState('idle');
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [vaultLit, setVaultLit]   = useState(false);
  const [litCards, setLitCards]   = useState([]);
  const [checkDone, setCheckDone] = useState(false);

  const activeBenes = vault && vault.beneficiaries && vault.beneficiaries.length > 0
    ? vault.beneficiaries.map((b, i) => {
        const totalNum = parseFloat(vault.amount || 0);
        const pctNum = parseFloat(b.pct || 0);
        const calcAmt = totalNum > 0 ? (totalNum * (pctNum / 100)).toFixed(1) : '0';
        return {
          name: b.name || `Beneficiary ${i+1}`,
          initial: (b.name || 'B')[0].toUpperCase(),
          amount: `${calcAmt} ${vault.asset || 'FXRP'}`,
          pct: `${b.pct}%`,
          color: BENES_COLORS[i % BENES_COLORS.length],
        };
      })
    : SAMPLE_BENES;

  const totalAssetAmount = vault ? `${vault.amount || '0'} ${vault.asset || 'FXRP'}` : '250 FXRP';
  const vaultName = vault ? 'Your Legacy Vault' : "John's Legacy Vault";
  const conditionMessage = vault?.conditionLabel || 'Inactivity threshold exceeded: 365 days with no wallet activity.';

  const delay = ms => new Promise(r => setTimeout(r, ms));

  const goldBurst = () => {
    const canvas = goldRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    canvas.style.opacity = '1';
    const ctx = canvas.getContext('2d');
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    const pts = Array.from({length:80}, () => {
      const a = Math.random()*Math.PI*2, s = 3+Math.random()*6;
      return { x:cx, y:cy, vx:Math.cos(a)*s, vy:Math.sin(a)*s-2, r:2+Math.random()*4, alpha:1 };
    });
    let running = true;
    const tick = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.alpha-=0.014;
        if(p.alpha<=0) return;
        ctx.globalAlpha=p.alpha; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle='#D4A017'; ctx.shadowColor='#D4A017'; ctx.shadowBlur=8; ctx.fill();
      });
      ctx.globalAlpha=1; ctx.shadowBlur=0;
      if(running) requestAnimationFrame(tick);
    };
    tick();
    setTimeout(() => { running=false; canvas.style.opacity='0'; }, 2000);
  };

  const run = async () => {
    setStage('vault');
    await delay(800); setDoorsOpen(true);
    await delay(1200); setVaultLit(true);
    await delay(800); goldBurst();
    await delay(1000); setStage('distribution');
    for (let i=0;i<activeBenes.length;i++) {
      await delay(700);
      setLitCards(c => [...c, i]);
      toast(`${activeBenes[i].name} notified`, `${activeBenes[i].amount} sent to ${activeBenes[i].name}`, 'success');
    }
    await delay(1200); setStage('success');
    await delay(400); setCheckDone(true);
    if (vault && addActivity) {
      addActivity({ icon:'unlock', text:`Vault unlocked and ${totalAssetAmount} distributed` });
    }
  };

  return (
    <div className="page-content" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'var(--navbar-h)', padding:'var(--navbar-h) 24px 60px' }}>
      <canvas ref={goldRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:10,opacity:0,transition:'opacity 0.3s ease' }} aria-hidden="true" />

      {stage === 'idle' && (
        <div style={{ maxWidth:480,width:'100%',background:'var(--bg-card)',border:'1px solid var(--border-card)',borderRadius:'var(--radius-xl)',padding:48,textAlign:'center' }}>
          <div style={{ display:'flex',justifyContent:'center',color:'var(--gold)',marginBottom:24,animation:'float 3s ease-in-out infinite' }}><Icn name="lock" size={52} /></div>
          <h1 style={{ fontSize:'clamp(28px,4vw,40px)',fontWeight:800,marginBottom:12 }}>Vault Unlock <span style={{ background:'var(--grad-blue-purple)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Execution</span></h1>
          <p style={{ color:'var(--text-secondary)',fontSize:14,lineHeight:1.7,marginBottom:24 }}>
            Inheritance conditions have been met for {vaultName}. {totalAssetAmount} is ready to be distributed to {activeBenes.length} beneficiar{activeBenes.length === 1 ? 'y' : 'ies'}.
          </p>
          <div style={{ background:'rgba(255,209,102,0.08)',border:'1px solid rgba(255,209,102,0.2)',borderRadius:'var(--radius-md)',padding:'14px 20px',textAlign:'left',marginBottom:24 }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gold)',marginBottom:6 }}>Condition Met</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)' }}>{conditionMessage}</div>
          </div>
          <div style={{ display:'flex',justifyContent:'space-around',padding:'16px 0',borderTop:'1px solid var(--border-subtle)',borderBottom:'1px solid var(--border-subtle)',marginBottom:28 }}>
            {[
              {val: vault ? vault.amount : '250', label: `${vault?.asset || 'FXRP'} Total`},
              {val: String(activeBenes.length), label: 'Beneficiaries'},
              {val: 'Coston2', label: 'Network'}
            ].map(s=>(
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:24,fontWeight:800,marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:11,color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={run} id="unlock-trigger-btn" style={{ width:'100%',justifyContent:'center', display:'flex', alignItems:'center', gap:8 }}><Icn name="zap" size={16} /> Execute Vault Unlock</button>
          <Link to="/dashboard" style={{ display:'block',marginTop:16,fontSize:13,color:'var(--text-muted)',textAlign:'center' }}>← Back to Dashboard</Link>
        </div>
      )}

      {stage === 'vault' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:32,textAlign:'center' }}>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--blue)',opacity:0.7 }}>Verifying Inheritance Conditions…</div>
          <div style={{ width:180,height:180,borderRadius:'50%',border:`2px solid ${vaultLit?'rgba(212,160,23,0.5)':'var(--border-card)'}`,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-card)',transition:'all 1s ease',boxShadow:vaultLit?'0 0 60px rgba(212,160,23,0.2),inset 0 0 40px rgba(212,160,23,0.08)':'none',position:'relative',overflow:'hidden' }}>
            {!doorsOpen ? (
              <div style={{ width:80,height:80,borderRadius:'50%',border:'1.5px solid var(--border-card)',display:'flex',alignItems:'center',justifyContent:'center',animation:'spin 8s linear infinite' }}>
                <div style={{ width:40,height:40,borderRadius:'50%',border:'1px solid var(--border-subtle)' }} />
              </div>
            ) : (
              <>
                <div style={{ position:'absolute',width:2,height:'100%',background:'linear-gradient(to bottom,transparent,rgba(212,160,23,0.6),transparent)',animation:'float-slow 1.5s ease forwards' }} />
                <span style={{ display:'inline-flex', color:'var(--gold)', animation:'fade-in 0.5s ease both' }}><Icn name="unlock" size={56} /></span>
              </>
            )}
          </div>
          <div style={{ fontFamily:'Inter',fontSize:22,color:'var(--text-secondary)' }}>{doorsOpen?'Vault Open':'Unlocking Vault…'}</div>
        </div>
      )}

      {stage === 'distribution' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:24,textAlign:'center' }}>
          <h2 style={{ fontSize:24,fontWeight:700,color:'var(--text-secondary)' }}>Distributing Assets to Beneficiaries</h2>
          <div style={{ display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center' }}>
            {activeBenes.map((b,i) => (
              <div key={b.name + i} style={{ background:'var(--bg-card)',border:`1px solid ${litCards.includes(i)?b.color:'var(--border-card)'}`,borderRadius:'var(--radius-lg)',padding:'24px 32px',textAlign:'center',opacity:litCards.includes(i)?1:0,transform:litCards.includes(i)?'scale(1) translateY(0)':'scale(0.9) translateY(12px)',transition:'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',minWidth:140 }}>
                <div style={{ width:44,height:44,borderRadius:'50%',background:b.color,color:'#050505',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-heading)',fontWeight:700,fontSize:18,margin:'0 auto 10px' }}>{b.initial}</div>
                <div style={{ fontWeight:700,marginBottom:4 }}>{b.name}</div>
                <div style={{ fontSize:20,fontWeight:700,color:b.color,marginBottom:2 }}>{b.amount}</div>
                <div style={{ fontSize:11,color:'var(--text-muted)' }}>{b.pct} of vault</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'success' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:24,textAlign:'center',maxWidth:600 }}>
          <svg width="80" height="80" viewBox="0 0 96 96">
            <circle style={{ fill:'none',stroke:'var(--green)',strokeWidth:2,strokeDasharray:302,strokeDashoffset:checkDone?0:302,transition:'stroke-dashoffset 0.8s ease 0.2s',transform:'rotate(-90deg)',transformOrigin:'center' }} cx="48" cy="48" r="44" />
            <polyline style={{ fill:'none',stroke:'var(--green)',strokeWidth:3.5,strokeLinecap:'round',strokeLinejoin:'round',strokeDasharray:80,strokeDashoffset:checkDone?0:80,transition:'stroke-dashoffset 0.5s ease 1s' }} points="24,50 40,66 72,34" />
          </svg>
          <h1 style={{ fontSize:'clamp(32px,5vw,52px)',fontWeight:800,color:'var(--green)' }}>Inheritance Completed</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:16,lineHeight:1.7 }}>
            All {totalAssetAmount} has been distributed to your beneficiaries. No lawyers. No banks. No delays.
          </p>
          <div style={{ display:'flex',gap:32,flexWrap:'wrap',justifyContent:'center',padding:'20px 0',borderTop:'1px solid var(--border-subtle)',borderBottom:'1px solid var(--border-subtle)',width:'100%' }}>
            {[
              {val: totalAssetAmount,  label:'Total Distributed',  color:'var(--green)'  },
              {val: String(activeBenes.length), label:'Beneficiaries Paid', color:'var(--blue)'   },
              {val:'$0',   label:'Legal Fees',          color:'var(--gold)'   },
              {val:'~2s',  label:'Settlement Time',     color:'var(--purple)' },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:28,fontWeight:800,color:s.color,marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:11,color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',marginTop:8 }}>
            <Link to="/marketplace" className="btn btn-primary btn-lg" id="post-unlock-otc-btn">Sell on OTC Marketplace</Link>
            <Link to="/dashboard"   className="btn btn-ghost"          id="post-unlock-dash-btn">View Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}

