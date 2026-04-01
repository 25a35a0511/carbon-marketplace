import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';


const STATUS_STYLE = {
  completed: { bg:'#f0faf4', color:'#166534', border:'#aee4c5', icon:'✓' },
  refunded:  { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe', icon:'↩' },
  disputed:  { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', icon:'⚠' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.completed;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:99, padding:'2px 9px', fontSize:'.68rem', fontFamily:'monospace', letterSpacing:'.06em' }}>{s.icon} {status}</span>;
}

export default function AdminTransactionsPage() {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pag,     setPag]     = useState(null);
  const [summary, setSummary] = useState({ total:0, volume:0, credits:0 });
  const [expanded,setExpanded]= useState(null);

  const load = useCallback(async (pg = 1, q = search) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/admin/transactions', { params: { page:pg, limit:15, ...(q?{search:q}:{}) } });
      setTxns(data.data);
      setPag(data.pagination);
      setPage(pg);
      // Compute summary from full result set
      const vol = data.data.reduce((s,t)=>s+(t.totalAmount||0),0);
      const crd = data.data.reduce((s,t)=>s+(t.creditsPurchased||0),0);
      setSummary({ total:data.pagination?.total||data.data.length, volume:vol, credits:crd });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, []);

  // Monthly volume chart from current page
  const monthlyVol = new Array(12).fill(0);
  txns.forEach(t => { const m = new Date(t.createdAt).getMonth(); monthlyVol[m] += t.totalAmount||0; });
  const maxVol = Math.max(...monthlyVol, 1);
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  return (
    <DashboardLayout>
      {/* ── Responsive ── */}
      <style>{`
        /* shared dashboard responsive rules */
        @media(max-width:1024px){
          .resp-g4{grid-template-columns:repeat(2,1fr)!important;}
          .resp-g2{grid-template-columns:1fr!important;}
        }
        @media(max-width:768px){
          .resp-g4{grid-template-columns:repeat(2,1fr)!important;gap:12px!important;}
          .resp-g2{grid-template-columns:1fr!important;}
          .resp-g3{grid-template-columns:1fr!important;}
          .resp-wrap{flex-wrap:wrap!important;}
          .resp-stack{flex-direction:column!important;align-items:flex-start!important;}
          .resp-full{width:100%!important;min-width:0!important;max-width:100%!important;}
          .resp-scroll{overflow-x:auto!important;}
          .resp-hide-md{display:none!important;}
        }
        @media(max-width:640px){
          .resp-g4{grid-template-columns:1fr 1fr!important;gap:10px!important;}
          .resp-pad-sm{padding:14px!important;}
          .resp-text-sm{font-size:.78rem!important;}
        }
        @media(max-width:480px){
          .resp-g4{grid-template-columns:1fr 1fr!important;}
          .resp-2col-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>
      

  {/* ── Responsive styles ── */}
  <style>{`
    @media (max-width: 1024px) {
      .resp-g4 { grid-template-columns: repeat(2,1fr) !important; }
      .resp-g2 { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 768px) {
      .resp-g4 { grid-template-columns: repeat(2,1fr) !important; gap:12px !important; }
      .resp-g2 { grid-template-columns: 1fr !important; }
      .resp-g3 { grid-template-columns: 1fr !important; }
      .resp-hide { display:none !important; }
      .resp-stack { flex-direction:column !important; align-items:flex-start !important; }
      .resp-full { width:100% !important; min-width:0 !important; max-width:100% !important; }
      .resp-wrap { flex-wrap:wrap !important; }
      .resp-scroll { overflow-x:auto !important; }
    }
    @media (max-width: 640px) {
      .resp-g4 { grid-template-columns: 1fr 1fr !important; gap:10px !important; }
      .resp-pad { padding:14px !important; }
      .resp-text-sm { font-size:.78rem !important; }
    }
    @media (max-width: 480px) {
      .resp-g4 { grid-template-columns: 1fr 1fr !important; }
    }
  `}</style>
      <div style={{ marginBottom:24 }}>
        <h2 style={s.title}>All Transactions</h2>
        <p style={s.sub}>Complete platform transaction ledger — every credit purchase recorded.</p>
      </div>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }} className="resp-g4">
        {[
          { icon:'📋', val:fmtN(pag?.total??summary.total),  lbl:'Total Transactions', color:'#1c2526' },
          { icon:'💰', val:fmt(summary.volume),               lbl:'Page Volume',        color:'#2E7D32' },
          { icon:'🌿', val:fmtN(summary.credits)+' t',        lbl:'Credits on Page',    color:'#0288D1' },
          { icon:'💹', val:summary.credits>0?fmt(summary.volume/Math.max(summary.credits,1)):`${CURRENCY_SYMBOL}0`, lbl:'Avg Price/Credit', color:'#d97706' },
        ].map((st,i)=>(
          <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'16px 18px' }}>
            <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{st.icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', fontWeight:900, color:st.color, lineHeight:1 }}>{loading?'–':st.val}</div>
            <div style={{ fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'#9ca3af', marginTop:4 }}>{st.lbl}</div>
          </div>
        ))}
      </div>

      {/* Mini chart + search row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:20, marginBottom:22, alignItems:"flex-end" }} className="resp-g2">
        {/* Bar chart */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'16px 18px' }}>
          <div style={{ fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'#2E7D32', marginBottom:12 }}>Monthly Volume (Current Page)</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:60 }}>
            {months.map((mo,i)=>{
              const h = Math.max(3,(monthlyVol[i]/maxVol)*52);
              const active = monthlyVol[i] > 0;
              return (
                <div key={mo} title={active?fmt(monthlyVol[i]):''} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <div style={{ width:'100%', height:`${h}px`, background:active?'linear-gradient(to top,#2E7D32,#4caf7d)':'#f3f4f6', borderRadius:'3px 3px 0 0', transition:'height .6s ease' }} />
                  <span style={{ fontFamily:'monospace', fontSize:'.58rem', color:'#9ca3af' }}>{mo}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Search */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <input style={{ ...s.search, width:"100%", maxWidth:260 }} placeholder="🔍 Search project, buyer, seller…" value={search}
            onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&load(1,e.target.value)} />
          <button onClick={()=>load(1,search)} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Search</button>
          {search && <button onClick={()=>{setSearch('');load(1,'');}} style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 16px', fontSize:'.78rem', cursor:'pointer', fontFamily:'inherit', color:'#6b7280' }}>Clear ✕</button>}
        </div>
      </div>

      {loading && <div style={s.centerMsg}><div style={{ fontSize:'2rem', marginBottom:8 }}>⏳</div><p>Loading transactions…</p></div>}
      {error   && <div style={s.errBox}>❌ {error} <button onClick={()=>load(1)} style={s.retryBtn}>Retry</button></div>}

      {!loading && !error && (
        <>
          <p style={{ fontSize:'.8rem', color:'#9ca3af', fontFamily:'monospace', marginBottom:14 }}>
            Showing {txns.length} of {pag?.total??txns.length} records
          </p>

          {txns.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📋</div>
              <p style={{ fontWeight:600, color:'#374151', marginBottom:6 }}>No transactions found</p>
              <p style={{ fontSize:'.85rem', color:'#9ca3af' }}>{search?`No results for "${search}"` : 'No transactions have been made yet.'}</p>
            </div>
          ) : (
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
              <div style={{ overflowX:'auto' }}>
                <table style={s.tbl}>
                  <thead>
                    <tr>{['ID','Project','Buyer','Seller','Credits','Price/Credit','Total','Date','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {txns.map(t => {
                      const isExp = expanded===t._id;
                      return (
                        <>
                          <tr key={t._id}
                            style={{ cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                            onMouseLeave={e=>e.currentTarget.style.background=isExp?'#f0faf4':''}
                            onClick={()=>setExpanded(isExp?null:t._id)}>
                            <td style={s.td}><span style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#9ca3af' }}>#{t._id?.slice(-7)}</span></td>
                            <td style={s.td}>
                              <div style={{ fontWeight:600, fontSize:'.87rem' }}>{t.project?.emoji||'🌿'} {t.projectTitle}</div>
                              <div style={{ fontSize:'.72rem', color:'#9ca3af', fontFamily:'monospace' }}>{t.project?.impactType}</div>
                            </td>
                            <td style={s.td}>
                              <div style={{ fontWeight:500, fontSize:'.87rem' }}>{t.buyer?.name}</div>
                              <div style={{ fontSize:'.72rem', color:'#9ca3af', fontFamily:'monospace' }}>{t.buyer?.email}</div>
                            </td>
                            <td style={s.td}>
                              <div style={{ fontWeight:500, fontSize:'.87rem' }}>{t.seller?.name}</div>
                              <div style={{ fontSize:'.72rem', color:'#9ca3af', fontFamily:'monospace' }}>{t.seller?.email}</div>
                            </td>
                            <td style={s.td}><span style={{ fontFamily:'monospace', fontWeight:700, color:'#2E7D32' }}>{t.creditsPurchased}</span><span style={{ fontSize:'.72rem', color:'#9ca3af' }}> t</span></td>
                            <td style={s.td}><span style={{ fontFamily:'monospace', fontSize:'.82rem' }}>{fmt(t.pricePerCredit)}</span></td>
                            <td style={s.td}><span style={{ fontFamily:'monospace', fontWeight:700 }}>{fmt(t.totalAmount)}</span></td>
                            <td style={s.td}><span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#6b7280' }}>{t.createdAt?.split('T')[0]}</span></td>
                            <td style={s.td}><StatusBadge status={t.status} /></td>
                          </tr>
                          {isExp && (
                            <tr key={t._id+'-exp'} style={{ background:'#f0faf4' }}>
                              <td colSpan={9} style={{ padding:'14px 18px' }}>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, fontSize:'.85rem' }}>
                                  {[
                                    ['Transaction ID', t._id],
                                    ['Project Location', t.project?.location || '—'],
                                    ['Credits × Price', `${t.creditsPurchased} × ${fmt(t.pricePerCredit)}`],
                                    ['Transaction Date', new Date(t.createdAt).toLocaleString()],
                                  ].map(([l,v])=>(
                                    <div key={l}>
                                      <div style={{ fontFamily:'monospace', fontSize:'.65rem', letterSpacing:'.08em', textTransform:'uppercase', color:'#9ca3af', marginBottom:4 }}>{l}</div>
                                      <div style={{ fontFamily:'monospace', fontSize:'.8rem', color:'#374151', wordBreak:'break-all' }}>{v}</div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pag?.totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
              <button disabled={page<=1} onClick={()=>load(page-1)} style={{ ...s.pageBtn, opacity:page<=1?.4:1 }}>← Prev</button>
              <span style={{ fontFamily:'monospace', fontSize:'.8rem', color:'#6b7280' }}>
                Page {page} of {pag.totalPages} · {pag.total} total
              </span>
              <button disabled={page>=pag.totalPages} onClick={()=>load(page+1)} style={{ ...s.pageBtn, opacity:page>=pag.totalPages?.4:1 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

const s = {
  title:    { fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', fontWeight:900, marginBottom:4, color:'#1c2526' },
  sub:      { color:'#6b7280', fontSize:'.9rem' },
  search:   { border:'1.5px solid #e5e7eb', borderRadius:9, padding:'9px 14px', fontSize:'.85rem', outline:'none', fontFamily:'inherit' },
  tbl:      { width:'100%', borderCollapse:'collapse' },
  th:       { fontFamily:'monospace', fontSize:'.65rem', letterSpacing:'.08em', textTransform:'uppercase', color:'#9ca3af', padding:'11px 14px', textAlign:'left', borderBottom:'1px solid #f3f4f6', background:'#fafafa', whiteSpace:'nowrap' },
  td:       { padding:'12px 14px', fontSize:'.875rem', borderBottom:'1px solid #f9fafb', verticalAlign:'middle', transition:'background .1s' },
  centerMsg:{ textAlign:'center', padding:'60px 0', color:'#9ca3af', fontFamily:'monospace', fontSize:'.85rem' },
  errBox:   { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'12px 16px', color:'#dc2626', fontSize:'.87rem', marginBottom:16 },
  retryBtn: { background:'none', border:'none', color:'#2E7D32', fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  emptyBox: { textAlign:'center', padding:'60px 20px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, color:'#9ca3af', fontSize:'.85rem' },
  pageBtn:  { background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'7px 14px', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#374151' },
};