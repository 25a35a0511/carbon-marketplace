import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';
import DashboardLayout from '../../components/layout/DashboardLayout';

/* ── helpers ───────────────────────────────────────────── */
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

const STATUS = {
  completed:{ bg:'#f0faf4', color:'#166534', border:'#aee4c5', icon:'✓', label:'Completed' },
  refunded: { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe', icon:'↩', label:'Refunded'  },
  disputed: { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', icon:'⚠', label:'Disputed'  },
};

const TYPE_COLORS = {
  'Forest Conservation':       '#2E7D32',
  'Renewable Energy':          '#0288D1',
  'Blue Carbon':               '#00838f',
  'Clean Cooking':             '#e64a19',
  'Peatland Conservation':     '#7b1fa2',
  'Biodiversity Conservation': '#c62828',
  'Soil Carbon':               '#558b2f',
  'Methane Capture':           '#ad1457',
};

/* ── animated counter ─────────────────────────────────── */
function Num({ val, prefix='', suffix='', dec=0 }) {
  const [d,setD] = useState(0);
  useEffect(()=>{
    if(!val) return;
    let t0=null;
    const step=(ts)=>{
      if(!t0)t0=ts;
      const p=Math.min((ts-t0)/1000,1);
      const e=1-Math.pow(1-p,3);
      setD(+(e*val).toFixed(dec));
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[val]);
  return <>{prefix}{Number(d).toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})}{suffix}</>;
}

/* ── status badge ─────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.completed;
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:99,padding:'3px 10px',fontSize:'.68rem',fontFamily:'monospace',letterSpacing:'.05em',fontWeight:600,display:'inline-flex',alignItems:'center',gap:4}}>
      {s.icon} {s.label}
    </span>
  );
}

/* ── expand row detail ────────────────────────────────── */
function ExpandedRow({ t }) {
  const col = TYPE_COLORS[t.project?.impactType] || '#2E7D32';
  return (
    <tr>
      <td colSpan={7} style={{padding:0,borderBottom:'2px solid #f0faf4'}}>
        <div style={{background:'linear-gradient(135deg,#f0faf4,#fafaf7)',padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {/* Project info */}
          <div>
            <div style={d.detLbl}>Project Details</div>
            <div style={{fontWeight:700,fontSize:'.88rem',color:'#1a1f1c',marginBottom:4}}>{t.project?.emoji||'🌿'} {t.projectTitle}</div>
            {t.project?.location && <div style={{fontSize:'.78rem',color:'#6b7280',fontFamily:'monospace'}}>📍 {t.project.location}</div>}
            {t.project?.impactType && (
              <span style={{display:'inline-block',marginTop:6,background:`${col}18`,color:col,border:`1px solid ${col}44`,borderRadius:99,padding:'2px 9px',fontSize:'.65rem',fontFamily:'monospace',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:600}}>
                {t.project.impactType}
              </span>
            )}
          </div>
          {/* Financials */}
          <div>
            <div style={d.detLbl}>Transaction Breakdown</div>
            {[
              ['Credits purchased', `${t.creditsPurchased} tonnes`],
              ['Price per credit',  fmt(t.pricePerCredit)],
              ['Total paid',        fmt(t.totalAmount)],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #e5e7eb',fontSize:'.82rem'}}>
                <span style={{color:'#6b7280'}}>{l}</span>
                <span style={{fontFamily:'monospace',fontWeight:600,color:'#1a1f1c'}}>{v}</span>
              </div>
            ))}
          </div>
          {/* Impact */}
          <div>
            <div style={d.detLbl}>CO₂ Impact Equivalent</div>
            {[
              ['🌳',`${fmtN(t.creditsPurchased*5)} trees`],
              ['🚗',`${fmtN(t.creditsPurchased*2481)} miles`],
              ['🏠',`${(t.creditsPurchased/7.5).toFixed(1)} homes / yr`],
            ].map(([ic,v])=>(
              <div key={v} style={{display:'flex',gap:8,alignItems:'center',padding:'4px 0',fontSize:'.82rem',color:'#374151'}}>
                <span>{ic}</span><span>{v}</span>
              </div>
            ))}
          </div>
          {/* Timestamps */}
          <div>
            <div style={d.detLbl}>Transaction Record</div>
            <div style={{fontSize:'.78rem',color:'#6b7280',fontFamily:'monospace',marginBottom:4}}>ID: {t._id}</div>
            <div style={{fontSize:'.78rem',color:'#6b7280',fontFamily:'monospace',marginBottom:4}}>Date: {fmtDate(t.createdAt)}</div>
            <div style={{fontSize:'.78rem',color:'#6b7280',fontFamily:'monospace',marginBottom:8}}>Time: {fmtTime(t.createdAt)}</div>
            <StatusBadge status={t.status}/>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── mini spend-by-type bar ───────────────────────────── */
function SpendByType({ transactions }) {
  const map = {};
  transactions.forEach(t => {
    const type = t.project?.impactType || 'Other';
    if (!map[type]) map[type] = { credits:0, spend:0 };
    map[type].credits += t.creditsPurchased || 0;
    map[type].spend   += t.totalAmount || 0;
  });
  const sorted = Object.entries(map).sort((a,b) => b[1].spend - a[1].spend);
  const maxSpend = sorted[0]?.[1]?.spend || 1;
  if (!sorted.length) return null;
  return (
    <div>
      {sorted.map(([type, stat]) => {
        const col = TYPE_COLORS[type] || '#9ca3af';
        const w   = Math.round((stat.spend / maxSpend) * 100);
        return (
          <div key={type} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:'.8rem'}}>
              <span style={{color:'#374151',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{type}</span>
              <span style={{fontFamily:'monospace',fontSize:'.78rem',color:col,fontWeight:700,flexShrink:0}}>{fmt(stat.spend)}</span>
            </div>
            <div style={{height:5,background:'#f3f4f6',borderRadius:99,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${w}%`,background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:99,transition:'width 1s ease'}}/>
            </div>
            <div style={{fontSize:'.7rem',color:'#9ca3af',fontFamily:'monospace',marginTop:2}}>{fmtN(stat.credits)} credits</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── main page ────────────────────────────────────────── */
export default function TransactionsPage() {
  const [allTxns,    setAllTxns]    = useState([]);   // full data for charts/stats
  const [pageTxns,   setPageTxns]   = useState([]);   // current page data for table
  const [pag,        setPag]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('all');
  const [page,       setPage]       = useState(1);
  const [expanded,   setExpanded]   = useState(null);
  const LIMIT = 10;

  /* Single combined load — fetches all (for stats) and page 1 (for table) together */
  const loadPage = useCallback(async (pg=1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/credits/transactions', { params:{ page:1, limit:200 } });
      const all = data.data || [];
      setAllTxns(all);
      setPag(data.pagination);
      // Slice client-side for the current page
      setPageTxns(all.slice((pg-1)*LIMIT, pg*LIMIT));
      setPage(pg);
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, []);

  /* derived stats from ALL transactions */
  const totalCredits = allTxns.reduce((s,t)=>s+(t.creditsPurchased||0),0);
  const totalSpent   = allTxns.reduce((s,t)=>s+(t.totalAmount||0),0);
  const avgPrice     = totalCredits > 0 ? totalSpent / totalCredits : 0;

  /* client-side filter on current page */
  const filtered = pageTxns.filter(t => {
    const matchSearch = !search
      || t.projectTitle?.toLowerCase().includes(search.toLowerCase())
      || t.project?.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusF === 'all' || t.status === statusF;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>

      {/* header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={s.title}>Transaction History</h2>
          <p style={s.sub}>Every credit purchase you've made — fetched live from the database.</p>
        </div>
        <Link to="/marketplace" style={s.pill}>🌿 Buy More Credits</Link>
      </div>

      {/* 4 stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
        {[
          {icon:'📋',color:'#1a1f1c',val:<Num val={pag?.total??allTxns.length}/>,           lbl:'Total Transactions'},
          {icon:'🌿',color:'#2E7D32',val:<><Num val={totalCredits}/> <span style={{fontSize:'1rem',fontWeight:400}}>t</span></>,lbl:'Credits Purchased'},
          {icon:'💰',color:'#d97706',val:<><span style={{fontSize:'1rem'}}>{CURRENCY_SYMBOL}</span><Num val={totalSpent} dec={2}/></>,        lbl:'Total Spent'},
          {icon:'📊',color:'#0288D1',val:<><span style={{fontSize:'1rem'}}>{CURRENCY_SYMBOL}</span><Num val={avgPrice} dec={2}/></>,           lbl:'Avg Price / Credit'},
        ].map((st,i)=>(
          <div key={i} style={s.sc}>
            <div style={{width:44,height:44,borderRadius:11,background:`${st.color}14`,border:`1px solid ${st.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:12}}>{st.icon}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.75rem',fontWeight:900,color:st.color,lineHeight:1}}>{loading?'–':st.val}</div>
            <div style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:6}}>{st.lbl}</div>
          </div>
        ))}
      </div>

      {/* spend by type + table side-by-side for wider screens */}
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>

        {/* Spend by project type */}
        <div style={{...s.card,position:'sticky',top:80}}>
          <div style={s.lbl}>💰 Spend by Type</div>
          {allTxns.length===0
            ? <p style={{fontSize:'.82rem',color:'#9ca3af',textAlign:'center',padding:'20px 0'}}>No data yet.</p>
            : <SpendByType transactions={allTxns}/>
          }
          <div style={{borderTop:'1px solid #f3f4f6',paddingTop:14,marginTop:14}}>
            <div style={s.lbl}>📈 Quick Stats</div>
            {[
              ['First purchase', allTxns.length ? fmtDate(allTxns[allTxns.length-1]?.createdAt) : '—'],
              ['Latest purchase', allTxns.length ? fmtDate(allTxns[0]?.createdAt) : '—'],
              ['Largest purchase', allTxns.length ? fmt(Math.max(...allTxns.map(t=>t.totalAmount||0))) : '—'],
              ['Most credits',     allTxns.length ? `${Math.max(...allTxns.map(t=>t.creditsPurchased||0))}t` : '—'],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f9fafb',fontSize:'.8rem'}}>
                <span style={{color:'#6b7280'}}>{l}</span>
                <span style={{fontFamily:'monospace',fontWeight:600,color:'#1a1f1c',fontSize:'.78rem'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table panel */}
        <div style={s.card}>
          {/* Filters bar */}
          <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <div style={s.lbl}>All Transactions</div>
              {/* status filter */}
              <div style={{display:'flex',gap:5}}>
                {[['all','All'],['completed','✓ Completed'],['refunded','↩ Refunded'],['disputed','⚠ Disputed']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>setStatusF(val)}
                    style={{border:`1.5px solid ${statusF===val?'#2E7D32':'#e5e7eb'}`,background:statusF===val?'#f0faf4':'#fff',color:statusF===val?'#166534':'#6b7280',borderRadius:7,padding:'5px 11px',fontSize:'.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <input
              style={{border:'1.5px solid #e5e7eb',borderRadius:9,padding:'8px 14px',fontSize:'.85rem',outline:'none',fontFamily:'inherit',width:220}}
              placeholder="🔍 Search project or location…"
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          {/* loading / error */}
          {loading && (
            <div style={{textAlign:'center',padding:'48px 0',color:'#9ca3af'}}>
              <div style={{fontSize:'2rem',marginBottom:8,animation:'spin .8s linear infinite',display:'inline-block'}}>🌿</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{fontFamily:'monospace',fontSize:'.85rem'}}>Loading transactions…</p>
            </div>
          )}
          {error && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',color:'#dc2626',fontSize:'.87rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span>❌ {error}</span>
              <button onClick={()=>loadPage(page)} style={{background:'#2E7D32',color:'#fff',border:'none',borderRadius:7,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:'.8rem'}}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <div style={{textAlign:'center',padding:'60px 20px',color:'#9ca3af'}}>
                  <div style={{fontSize:'3rem',marginBottom:12}}>🔍</div>
                  <p style={{fontWeight:600,color:'#374151',marginBottom:6}}>
                    {search||statusF!=='all' ? 'No matches found' : 'No transactions yet'}
                  </p>
                  <p style={{fontSize:'.85rem',marginBottom:16}}>
                    {search ? `Nothing matches "${search}"` : statusF!=='all' ? `No ${statusF} transactions` : 'Purchase credits from the marketplace to get started.'}
                  </p>
                  {(!search && statusF==='all') && <Link to="/marketplace" style={s.pill}>🌍 Browse Projects →</Link>}
                  {(search||statusF!=='all') && (
                    <button onClick={()=>{setSearch('');setStatusF('all');}} style={{background:'#f0faf4',color:'#2E7D32',border:'1px solid #aee4c5',borderRadius:8,padding:'8px 16px',fontSize:'.82rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Clear Filters</button>
                  )}
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr>
                        {['','Project','Credits','Price / Credit','Total','Date','Status'].map(h=>(
                          <th key={h} style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.08em',textTransform:'uppercase',color:'#9ca3af',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #f3f4f6',background:'#fafafa',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(t => {
                        const isExp = expanded === t._id;
                        const col   = TYPE_COLORS[t.project?.impactType] || '#2E7D32';
                        return (
                          <>
                            <tr key={t._id}
                              onClick={()=>setExpanded(isExp ? null : t._id)}
                              style={{cursor:'pointer',background:isExp?'#f0faf4':'',transition:'background .15s'}}
                              onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background='#f9fafb'; }}
                              onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background=''; }}>

                              {/* expand chevron */}
                              <td style={{padding:'13px 8px 13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',width:28}}>
                                <span style={{display:'inline-flex',width:20,height:20,background:isExp?'#2E7D32':'#f3f4f6',borderRadius:'50%',alignItems:'center',justifyContent:'center',fontSize:'.6rem',color:isExp?'#fff':'#6b7280',transition:'all .2s',transform:isExp?'rotate(90deg)':'none'}}>▶</span>
                              </td>

                              {/* project */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <div style={{fontWeight:600,fontSize:'.875rem',color:'#1a1f1c',marginBottom:3}}>{t.project?.emoji||'🌿'} {t.projectTitle}</div>
                                {t.project?.location && <div style={{fontSize:'.72rem',color:'#9ca3af',fontFamily:'monospace'}}>📍 {t.project.location}</div>}
                                {t.project?.impactType && (
                                  <div style={{marginTop:4}}>
                                    <span style={{fontSize:'.65rem',fontFamily:'monospace',color:col,background:`${col}14`,border:`1px solid ${col}33`,borderRadius:99,padding:'1px 7px',textTransform:'uppercase',letterSpacing:'.05em'}}>{t.project.impactType}</span>
                                  </div>
                                )}
                              </td>

                              {/* credits */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <span style={{fontFamily:'monospace',fontWeight:800,fontSize:'1rem',color:'#2E7D32'}}>{t.creditsPurchased}</span>
                                <span style={{fontFamily:'monospace',fontSize:'.72rem',color:'#9ca3af',marginLeft:3}}>t</span>
                              </td>

                              {/* price */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <span style={{fontFamily:'monospace',fontSize:'.85rem',color:'#374151'}}>{fmt(t.pricePerCredit)}</span>
                              </td>

                              {/* total */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <span style={{fontFamily:'monospace',fontWeight:700,fontSize:'.92rem',color:'#1a1f1c'}}>{fmt(t.totalAmount)}</span>
                              </td>

                              {/* date */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <div style={{fontFamily:'monospace',fontSize:'.78rem',color:'#374151',fontWeight:500}}>{fmtDate(t.createdAt)}</div>
                                <div style={{fontFamily:'monospace',fontSize:'.7rem',color:'#9ca3af'}}>{fmtTime(t.createdAt)}</div>
                              </td>

                              {/* status */}
                              <td style={{padding:'13px 14px',borderBottom:isExp?'none':'1px solid #f9fafb',verticalAlign:'middle'}}>
                                <StatusBadge status={t.status}/>
                              </td>
                            </tr>

                            {/* expanded detail row */}
                            {isExp && <ExpandedRow key={t._id+'-exp'} t={t}/>}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* pagination */}
              {pag && allTxns.length > LIMIT && (
                <div style={{marginTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                  <span style={{fontFamily:'monospace',fontSize:'.78rem',color:'#9ca3af'}}>
                    Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, allTxns.length)} of {allTxns.length}
                  </span>
                  <div style={{display:'flex',gap:6}}>
                    <button disabled={page<=1} onClick={()=>{ const pg=page-1; setPage(pg); setPageTxns(allTxns.slice((pg-1)*LIMIT,pg*LIMIT)); setExpanded(null); }}
                      style={{background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:8,padding:'7px 14px',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#374151',opacity:page<=1?.4:1,transition:'opacity .2s'}}>
                      ← Prev
                    </button>
                    {/* page number pills */}
                    {Array.from({length:Math.min(Math.ceil(allTxns.length/LIMIT),7)},(_, i) => {
                      const pg = i+1;
                      return (
                        <button key={pg} onClick={()=>{ setPage(pg); setPageTxns(allTxns.slice((pg-1)*LIMIT,pg*LIMIT)); setExpanded(null); }}
                          style={{background:pg===page?'#2E7D32':'#fff',color:pg===page?'#fff':'#374151',border:`1.5px solid ${pg===page?'#2E7D32':'#e5e7eb'}`,borderRadius:8,padding:'7px 12px',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',minWidth:36,transition:'all .15s'}}>
                          {pg}
                        </button>
                      );
                    })}
                    <button disabled={page>=Math.ceil(allTxns.length/LIMIT)} onClick={()=>{ const pg=page+1; setPage(pg); setPageTxns(allTxns.slice((pg-1)*LIMIT,pg*LIMIT)); setExpanded(null); }}
                      style={{background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:8,padding:'7px 14px',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#374151',opacity:page>=Math.ceil(allTxns.length/LIMIT)?.4:1,transition:'opacity .2s'}}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}

/* ── shared styles ────────────────────────────────────── */
const s = {
  title:{ fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1a1f1c' },
  sub:  { color:'#6b7280',fontSize:'.9rem' },
  card: { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:22 },
  sc:   { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  lbl:  { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:10 },
  pill: { background:'#2E7D32',color:'#fff',border:'none',borderRadius:9,padding:'9px 18px',fontSize:'.85rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit',textDecoration:'none',display:'inline-block' },
};
const d = {
  detLbl:{ fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:8 },
};