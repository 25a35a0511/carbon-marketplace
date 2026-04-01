import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';

export default function SellerDashboard() {
  const [sales,    setSales]    = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/seller/sales'),
      api.get('/seller/projects', { params: { limit: 10 } }),
    ]).then(([sRes, pRes]) => {
      setSales(sRes.data);
      setProjects(pRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const summary = sales?.summary || {};

  const stats = [
    { icon:'💰', val: fmt(summary.totalRevenue ?? 0), lbl:'Total Revenue',      sub:`${summary.txnCount ?? 0} transactions` },
    { icon:'🌿', val: (summary.totalSold ?? 0).toLocaleString(), lbl:'Credits Sold', sub:'Total across projects' },
    { icon:'📦', val: projects.length,                             lbl:'My Projects',  sub:`${projects.filter(p=>p.status==='verified').length} verified` },
    { icon:'⏳', val: projects.filter(p=>p.status==='pending').length, lbl:'Pending Review', sub:'Awaiting admin' },
  ];

  return (
    <DashboardLayout>
      <h2 style={s.title}>Seller Dashboard</h2>
      <p style={s.sub}>Track your projects and revenue.</p>

      <div style={s.grid4}>
        {stats.map((st,i) => (
          <div key={i} style={s.statCard}>
            <div style={{ fontSize:'1.4rem',marginBottom:8 }}>{st.icon}</div>
            <div style={s.statVal}>{loading ? '–' : st.val}</div>
            <div style={s.statLbl}>{st.lbl}</div>
            <div style={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div style={s.card}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <div style={s.sec}>🌿 My Projects</div>
          <Link to="/seller/create" style={s.btn}>➕ New Project</Link>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={s.tbl}>
            <thead><tr>{['Project','Status','Credits','Price','Sold'].map(c=><th key={c} style={s.th}>{c}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={s.ctr}>Loading…</td></tr>
              : projects.length === 0
                ? <tr><td colSpan={5} style={s.ctr}>No projects yet. <Link to="/seller/create" style={{ color:'#2E7D32' }}>Create one →</Link></td></tr>
                : projects.map(p => (
                <tr key={p._id}>
                  <td style={s.td}><div style={{ fontWeight:600 }}>{p.emoji} {p.title}</div><div style={{ fontSize:'.75rem',color:'#9ca3af' }}>{p.location}</div></td>
                  <td style={s.td}><span style={{ ...s.badge, ...badgeStyle(p.status) }}>{p.status}</span></td>
                  <td style={{ ...s.td,fontFamily:'monospace',color:'#2E7D32',fontWeight:600 }}>{p.availableCredits?.toLocaleString()}</td>
                  <td style={{ ...s.td,fontFamily:'monospace' }}>{fmt(p.pricePerCredit)}</td>
                  <td style={{ ...s.td,fontFamily:'monospace',color:'#9ca3af' }}>{((p.totalCredits||0)-(p.availableCredits||0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent sales */}
      <div style={s.card}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <div style={s.sec}>💰 Recent Sales</div>
          <Link to="/seller/sales" style={{ fontSize:'.8rem',color:'#2E7D32',fontWeight:600,textDecoration:'none' }}>View all →</Link>
        </div>
        <table style={s.tbl}>
          <thead><tr>{['Buyer','Project','Credits','Revenue','Date'].map(c=><th key={c} style={s.th}>{c}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={s.ctr}>Loading…</td></tr>
            : (sales?.data || []).slice(0,5).map(t => (
              <tr key={t._id}>
                <td style={s.td}>{t.buyer?.name}</td>
                <td style={{ ...s.td,fontSize:'.85rem' }}>{t.projectTitle}</td>
                <td style={{ ...s.td,fontFamily:'monospace',color:'#2E7D32',fontWeight:600 }}>{t.creditsPurchased}</td>
                <td style={{ ...s.td,fontFamily:'monospace',fontWeight:600 }}>{fmt(t.totalAmount)}</td>
                <td style={{ ...s.td,fontFamily:'monospace',fontSize:'.78rem',color:'#9ca3af' }}>{t.createdAt?.split('T')[0]}</td>
              </tr>
            ))}
            {!loading && !sales?.data?.length && <tr><td colSpan={5} style={s.ctr}>No sales yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

const badgeStyle = (st) => ({
  background: st==='verified'?'#f0faf4':st==='pending'?'#fefce8':'#fef2f2',
  color:      st==='verified'?'#1b5e20':st==='pending'?'#854d0e':'#991b1b',
  border:     `1px solid ${st==='verified'?'#aee4c5':st==='pending'?'#fde68a':'#fecaca'}`,
});

const s = {
  title:   { fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1c2526' },
  sub:     { color:'#6b7280',fontSize:'.9rem',marginBottom:24 },
  grid4:   { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20 },
  card:    { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:22,marginBottom:20 },
  statCard:{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  statVal: { fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:900,color:'#2E7D32',lineHeight:1 },
  statLbl: { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:5 },
  statSub: { fontSize:'.73rem',color:'#9ca3af',marginTop:3 },
  sec:     { fontFamily:'monospace',fontSize:'.7rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32' },
  btn:     { background:'#2E7D32',color:'#fff',border:'none',borderRadius:9,padding:'8px 16px',fontSize:'.82rem',fontWeight:700,cursor:'pointer',textDecoration:'none',display:'inline-block' },
  tbl:     { width:'100%',borderCollapse:'collapse' },
  th:      { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.08em',textTransform:'uppercase',color:'#9ca3af',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #f3f4f6' },
  td:      { padding:'12px 14px',fontSize:'.87rem',borderBottom:'1px solid #f9fafb',color:'#374151' },
  ctr:     { textAlign:'center',padding:'28px',color:'#9ca3af',fontSize:'.85rem' },
  badge:   { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.06em',textTransform:'uppercase',padding:'2px 9px',borderRadius:99 },
};
