import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';
import DashboardLayout from '../../components/layout/DashboardLayout';


const COLORS = ['#2E7D32','#0288D1','#7b1fa2','#e64a19','#37474f','#c62828','#00838f','#558b2f'];
const MOS    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const IMPACT = (c) => [
  { icon:'🌳', label:'Trees planted equivalent',    value:`${fmtN(c*5)} trees`                    },
  { icon:'🚗', label:'Car miles avoided',            value:`${fmtN(c*2481)} miles`                 },
  { icon:'🏠', label:'Homes powered / year',         value:`${fmtN(Math.round(c/7.5))} homes`      },
  { icon:'✈️', label:'Flight hours offset',          value:`${fmtN(Math.round(c/0.255))} hrs`      },
  { icon:'💡', label:'kWh clean energy equivalent',  value:`${fmtN(c*1000)} kWh`                   },
  { icon:'💧', label:'Olympic pools saved',          value:`${fmtN(Math.round(c*0.3))} pools`      },
];

/* animated number */
function Num({ val, dec=0 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    if (!val) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0=ts;
      const p = Math.min((ts-t0)/1200,1);
      const e = 1-Math.pow(1-p,3);
      setD(+(e*val).toFixed(dec));
      if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [val]);
  return <>{Number(d).toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})}</>;
}

/* SVG donut */
function Donut({ holdings, total }) {
  const [hov, setHov] = useState(null);
  const R=70, SZ=180, CX=90, CY=90, C=2*Math.PI*R;
  if (!holdings.length) return null;
  let cum=0;
  const slices = holdings.map((h,i)=>{
    const pct=total>0?h.totalCredits/total:0;
    const rot=cum*360;
    cum+=pct;
    return {...h,pct,rot,color:COLORS[i%COLORS.length]};
  });
  const active = hov!==null ? slices[hov] : null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
      <div style={{position:'relative',flexShrink:0}}>
        <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={22}/>
          {slices.map((sl,i)=>(
            <circle key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={sl.color} strokeWidth={hov===i?27:22}
              strokeDasharray={`${C*sl.pct} ${C}`}
              strokeDashoffset={`${-C*slices.slice(0,i).reduce((s,x)=>s+x.pct,0)}`}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{cursor:'pointer',transition:'stroke-width .2s'}}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>
          ))}
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
          {active ? (
            <>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:'1.1rem',color:active.color,lineHeight:1}}>{Math.round(active.pct*100)}%</div>
              <div style={{fontFamily:'monospace',fontSize:'.58rem',color:'#9ca3af',textAlign:'center',maxWidth:68,marginTop:3,lineHeight:1.3}}>{(active.projectTitle||'').split(' ').slice(0,3).join(' ')}</div>
            </>
          ) : (
            <>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:'1.35rem',color:'#2E7D32',lineHeight:1}}>{fmtN(total)}</div>
              <div style={{fontFamily:'monospace',fontSize:'.58rem',color:'#9ca3af',marginTop:3}}>total credits</div>
            </>
          )}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:9,flex:1,minWidth:140}}>
        {slices.map((sl,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',opacity:hov===null||hov===i?1:.4,transition:'opacity .2s'}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:10,height:10,borderRadius:3,background:sl.color,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'.8rem',fontWeight:600,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sl.projectTitle}</div>
              <div style={{fontFamily:'monospace',fontSize:'.68rem',color:'#9ca3af'}}>{fmtN(sl.totalCredits)} t · {Math.round(sl.pct*100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* bar chart from real txns */
function BarChart({ txns }) {
  const monthly=new Array(12).fill(0), spend=new Array(12).fill(0);
  txns.forEach(t=>{
    const m=new Date(t.createdAt).getMonth();
    monthly[m]+=t.creditsPurchased||0;
    spend[m]  +=t.totalAmount||0;
  });
  const maxC=Math.max(...monthly,1);
  const [hov,setHov]=useState(null);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-end',gap:5,height:130}}>
        {MOS.map((mo,i)=>{
          const h=Math.max(3,(monthly[i]/maxC)*114);
          const act=monthly[i]>0;
          const isH=hov===i;
          return (
            <div key={mo} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:act?'pointer':'default'}}
              onMouseEnter={()=>act&&setHov(i)} onMouseLeave={()=>setHov(null)}>
              {isH
                ? <div style={{background:'#1a1f1c',color:'#fff',borderRadius:6,padding:'3px 7px',fontSize:'.62rem',fontFamily:'monospace',whiteSpace:'nowrap',marginBottom:2}}>{monthly[i]}t · {fmt(spend[i])}</div>
                : act ? <span style={{fontFamily:'monospace',fontSize:'.62rem',color:'#2E7D32',fontWeight:600}}>{monthly[i]}</span>
                : <span style={{fontSize:'.62rem'}}>&nbsp;</span>
              }
              <div style={{width:'100%',height:`${h}px`,background:isH?'linear-gradient(to top,#1b5e20,#2E7D32)':act?'linear-gradient(to top,#2E7D32,#4caf7d)':'#f3f4f6',borderRadius:'3px 3px 0 0',transition:'all .2s'}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:5,marginTop:4}}>
        {MOS.map((mo,i)=>(
          <div key={mo} style={{flex:1,textAlign:'center',fontFamily:'monospace',fontSize:'.6rem',color:monthly[i]>0?'#2E7D32':'#d1d5db',fontWeight:monthly[i]>0?600:400}}>{mo}</div>
        ))}
      </div>
    </div>
  );
}

/* certificate */
function Certificate({ user, totalC, holdings }) {
  if (!totalC) return null;
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  return (
    <div style={{background:'linear-gradient(155deg,#f0faf4,#fafaf7 50%,#e3f2fd)',border:'1.5px solid #aee4c5',borderRadius:18,padding:'28px 32px',position:'relative',overflow:'hidden',marginBottom:20}}>
      <div style={{position:'absolute',top:-20,right:-20,width:130,height:130,background:'radial-gradient(circle,rgba(76,175,125,.1),transparent 70%)',borderRadius:'50%'}}/>
      <div style={{position:'absolute',bottom:-20,left:-20,width:100,height:100,background:'radial-gradient(circle,rgba(2,136,209,.07),transparent 70%)',borderRadius:'50%'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,background:'linear-gradient(135deg,#2E7D32,#4caf7d)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🌱</div>
            <div>
              <div style={{fontFamily:'monospace',fontSize:'.62rem',letterSpacing:'.12em',textTransform:'uppercase',color:'#2E7D32',fontWeight:700}}>Carbon Offset Certificate</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1rem',color:'#1a1f1c'}}>CarbonX Platform</div>
            </div>
          </div>
          <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'#9ca3af'}}>{today}</div>
        </div>
        <div style={{borderTop:'1px dashed #aee4c5',borderBottom:'1px dashed #aee4c5',padding:'16px 0',margin:'0 0 16px',display:'flex',gap:36,flexWrap:'wrap'}}>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'.62rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:5}}>Certified to</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1.2rem',color:'#1a1f1c'}}>{user?.name||'—'}</div>
            <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'#6b7280'}}>{user?.email}</div>
          </div>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'.62rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:5}}>Total CO₂ Offset</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:'2rem',color:'#2E7D32',lineHeight:1}}>{fmtN(totalC)}</div>
            <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'#6b7280'}}>metric tonnes CO₂e</div>
          </div>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'.62rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:5}}>Projects Supported</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:'2rem',color:'#0288D1',lineHeight:1}}>{holdings.length}</div>
            <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'#6b7280'}}>verified projects</div>
          </div>
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:12}}>
          {holdings.slice(0,4).map((h,i)=>(
            <span key={i} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:7,padding:'4px 10px',fontSize:'.75rem',color:'#374151',fontWeight:500}}>
              {(h.projectTitle||'').split(' ').slice(0,3).join(' ')}
            </span>
          ))}
          {holdings.length>4 && <span style={{background:'#f0faf4',border:'1px solid #aee4c5',borderRadius:7,padding:'4px 10px',fontSize:'.75rem',color:'#2E7D32',fontWeight:600}}>+{holdings.length-4} more</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:18,height:18,background:'#2E7D32',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',color:'#fff'}}>✓</div>
          <span style={{fontFamily:'monospace',fontSize:'.65rem',color:'#2E7D32',fontWeight:600,letterSpacing:'.06em'}}>VERIFIED · PERMANENT · NON-TRANSFERABLE</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function PortfolioPage() {
  const { user }       = useAuth();
  const [portfolio,    setPortfolio]   = useState(null);
  const [transactions, setTransactions]= useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [pR, tR] = await Promise.all([
        api.get('/credits/portfolio'),
        api.get('/credits/transactions', { params:{ limit:100 } }),
      ]);
      setPortfolio(pR.data.data);
      setTransactions(tR.data.data||[]);
    } catch(err) {
      setError(err.response?.data?.message||'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{load();},[]);

  const summary  = portfolio?.summary  || {};
  const holdings = portfolio?.holdings || [];
  const totalC   = summary.totalCredits||0;
  const totalS   = summary.totalSpent  ||0;

  const monthly = new Array(12).fill(0);
  transactions.forEach(t=>{ monthly[new Date(t.createdAt).getMonth()]+=t.creditsPurchased||0; });
  const bestM = monthly.indexOf(Math.max(...monthly));

  if (loading) return (
    <DashboardLayout>
      <div style={{textAlign:'center',padding:'80px 0',color:'#9ca3af'}}>
        <div style={{width:56,height:56,background:'linear-gradient(135deg,#2E7D32,#4caf7d)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',margin:'0 auto 16px',animation:'spin 1.4s linear infinite'}}>🌿</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{fontFamily:'monospace',fontSize:'.85rem'}}>Loading your portfolio…</p>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:14,padding:'18px 24px',color:'#dc2626',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span>❌ {error}</span>
        <button onClick={load} style={{background:'#2E7D32',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem'}}>Retry</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      <div style={{marginBottom:24}}>
        <h2 style={s.title}>My Portfolio</h2>
        <p style={s.sub}>Your carbon offset holdings, environmental impact, and activity — all from the live database.</p>
      </div>

      {/* 4 stat cards */}
      <div style={s.g4}>
        {[
          {icon:'🌿',color:'#2E7D32',val:<Num val={totalC}/>,          lbl:'Total Credits',     sub:'1 credit = 1 ton CO₂'},
          {icon:'🌍',color:'#0288D1',val:<Num val={totalC}/>,           lbl:'CO₂ Offset (tons)', sub:`≈ ${fmtN(totalC*5)} trees`},
          {icon:'💰',color:'#d97706',val:<>{CURRENCY_SYMBOL}<Num val={totalS} dec={2}/></>,lbl:'Total Invested', sub:totalC>0?`Avg ${fmt(totalS/totalC)}/credit`:'–'},
          {icon:'📦',color:'#7b1fa2',val:<Num val={holdings.length}/>,  lbl:'Projects Backed',   sub:`${transactions.length} transactions`},
        ].map((st,i)=>(
          <div key={i} style={s.sc}>
            <div style={{width:44,height:44,borderRadius:12,background:`${st.color}15`,border:`1px solid ${st.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:12}}>{st.icon}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.75rem',fontWeight:900,color:st.color,lineHeight:1}}>{st.val}</div>
            <div style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:6}}>{st.lbl}</div>
            <div style={{fontSize:'.73rem',color:'#9ca3af',marginTop:3}}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Certificate */}
      <Certificate user={user} totalC={totalC} holdings={holdings}/>

      {/* Holdings + Impact */}
      <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:20,marginBottom:20}}>

        {/* Holdings */}
        <div style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={s.lbl}>🌿 Holdings by Project</div>
            <span style={{fontFamily:'monospace',fontSize:'.7rem',color:'#9ca3af'}}>{holdings.length} projects</span>
          </div>

          {holdings.length===0 ? (
            <div style={s.empty}>
              <div style={{fontSize:'3rem',marginBottom:12}}>📊</div>
              <p style={{fontWeight:600,color:'#374151',marginBottom:6}}>No holdings yet</p>
              <p style={{fontSize:'.85rem',marginBottom:16}}>Purchase credits from the marketplace to start building your portfolio.</p>
              <Link to="/marketplace" style={{background:'#2E7D32',color:'#fff',borderRadius:9,padding:'9px 18px',fontSize:'.85rem',fontWeight:700,textDecoration:'none'}}>🌍 Browse Marketplace →</Link>
            </div>
          ) : holdings.map((h,i)=>{
            const pct=totalC>0?Math.round((h.totalCredits/totalC)*100):0;
            const proj=h._id;
            const col=COLORS[i%COLORS.length];
            return (
              <div key={i} style={{background:'#fafaf7',border:'1px solid #f0faf4',borderRadius:11,padding:'13px 15px',marginBottom:10,transition:'background .18s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f0faf4'}
                onMouseLeave={e=>e.currentTarget.style.background='#fafaf7'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1,minWidth:0,marginRight:10}}>
                    <div style={{fontWeight:700,fontSize:'.875rem',color:'#1a1f1c',marginBottom:3}}>
                      {proj?.emoji||'🌿'} {h.projectTitle||proj?.title}
                    </div>
                    <div style={{fontSize:'.72rem',color:'#9ca3af',fontFamily:'monospace'}}>
                      {proj?.location&&`📍 ${proj.location}`}{proj?.impactType&&` · ${proj.impactType}`}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'monospace',fontWeight:800,fontSize:'.92rem',color:col}}>{fmtN(h.totalCredits)} t</div>
                    <div style={{fontFamily:'monospace',fontSize:'.68rem',color:'#9ca3af'}}>{fmt(h.totalSpent)}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{flex:1,height:5,background:'#e5e7eb',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:99,transition:'width 1.2s ease'}}/>
                  </div>
                  <span style={{fontFamily:'monospace',fontSize:'.68rem',color:col,fontWeight:700,flexShrink:0}}>{pct}%</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'.7rem',color:'#9ca3af',fontFamily:'monospace'}}>
                  <span>{fmtN(h.totalCredits)} tons CO₂</span>
                  <span>{h.transactionCount} purchase{h.transactionCount!==1?'s':''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact */}
        <div style={s.card}>
          <div style={s.lbl}>🌍 Environmental Impact</div>
          <p style={{fontSize:'.82rem',color:'#6b7280',marginBottom:14,lineHeight:1.6}}>
            Your <strong style={{color:'#2E7D32'}}>{fmtN(totalC)} tonnes</strong> of CO₂ offset is equivalent to:
          </p>
          {IMPACT(totalC).map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<5?'1px solid #f3f4f6':'none'}}>
              <span style={{fontSize:'.87rem',color:'#374151',display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:'1.05rem'}}>{it.icon}</span>{it.label}
              </span>
              <span style={{fontFamily:'monospace',fontSize:'.82rem',fontWeight:700,color:'#1a1f1c',flexShrink:0,marginLeft:8}}>{it.value}</span>
            </div>
          ))}
          {totalC>0 && (
            <div style={{marginTop:14,background:'linear-gradient(135deg,#f0faf4,#e3f2fd)',border:'1px solid #aee4c5',borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:'1.4rem'}}>🏆</span>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'.9rem',color:'#1a1f1c'}}>You've offset {fmtN(totalC)} tonnes!</div>
                <div style={{fontSize:'.75rem',color:'#6b7280',marginTop:2}}>Like planting {fmtN(totalC*5)} trees 🌱</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donut + Monthly */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>

        <div style={s.card}>
          <div style={s.lbl}>🥧 Portfolio Breakdown</div>
          {holdings.length===0
            ? <p style={{fontSize:'.85rem',color:'#9ca3af',textAlign:'center',padding:'28px 0'}}>No holdings yet.</p>
            : <Donut holdings={holdings} total={totalC}/>
          }
        </div>

        <div style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={s.lbl}>📈 Monthly Activity</div>
            {totalC>0 && <span style={{fontFamily:'monospace',fontSize:'.7rem',color:'#9ca3af'}}>Best: {MOS[bestM]} ({fmtN(monthly[bestM])}t)</span>}
          </div>
          {transactions.length===0
            ? <p style={{fontSize:'.85rem',color:'#9ca3af',textAlign:'center',padding:'28px 0'}}>No transactions yet.</p>
            : <BarChart txns={transactions}/>
          }
          {transactions.length>0 && (
            <div style={{borderTop:'1px solid #f3f4f6',paddingTop:13,marginTop:13}}>
              <div style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:9}}>Recent Purchases</div>
              {transactions.slice(0,4).map((t,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:i<3?'1px solid #f9fafb':'none'}}>
                  <div>
                    <div style={{fontSize:'.83rem',fontWeight:600,color:'#1a1f1c'}}>{t.projectTitle}</div>
                    <div style={{fontFamily:'monospace',fontSize:'.7rem',color:'#9ca3af'}}>{t.createdAt?.split('T')[0]}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'monospace',fontSize:'.82rem',fontWeight:700,color:'#2E7D32'}}>{t.creditsPurchased}t</div>
                    <div style={{fontFamily:'monospace',fontSize:'.7rem',color:'#9ca3af'}}>{fmt(t.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <Link to="/marketplace" style={{background:'#2E7D32',color:'#fff',border:'none',borderRadius:10,padding:'11px 22px',fontSize:'.9rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:7}}>
          🌿 Buy More Credits
        </Link>
        <Link to="/transactions" style={{background:'#fff',color:'#374151',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'11px 22px',fontSize:'.9rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:7}}>
          📋 Full Transaction History
        </Link>
      </div>

    </DashboardLayout>
  );
}

const s = {
  title:{ fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1a1f1c' },
  sub:  { color:'#6b7280',fontSize:'.9rem',marginBottom:24 },
  g4:   { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20 },
  card: { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:22 },
  sc:   { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  lbl:  { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:12 },
  empty:{ textAlign:'center',padding:'36px 0',color:'#9ca3af',fontSize:'.85rem' },
};