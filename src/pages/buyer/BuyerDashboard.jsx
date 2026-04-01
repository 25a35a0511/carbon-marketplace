import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../hooks/useTransactions';
import { useMyTransactions } from '../../hooks/useTransactions';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt } from '../../utils/Currency';


export default function BuyerDashboard() {
  const { user }                    = useAuth();
  const { portfolio, loading: pl }  = usePortfolio();
  const { transactions, loading: tl } = useMyTransactions();

  const summary  = portfolio?.summary || {};
  const holdings = portfolio?.holdings || [];

  const stats = [
    { icon:'🌿', val: summary.totalCredits?.toLocaleString() ?? '–', lbl:'Total Credits',   sub:'1 credit = 1 ton CO₂' },
    { icon:'🌍', val: summary.totalCredits?.toLocaleString() ?? '–', lbl:'CO₂ Offset (t)',  sub:`≈ ${((summary.totalCredits||0)*5).toLocaleString()} trees` },
    { icon:'💰', val: fmt(summary.totalSpent  ?? 0),                 lbl:'Total Invested',   sub: summary.totalCredits ? `Avg ${fmt(Math.round((summary.totalSpent||0)/(summary.totalCredits||1)))}/credit` : '' },
    { icon:'📍', val: summary.projectCount ?? 0,                     lbl:'Projects Backed',  sub:'Diversified portfolio' },
  ];

  return (
    <DashboardLayout>
      <div style={{ animation:'fadeIn .4s ease' }}>
        <h2 style={h.title}>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p style={h.sub}>Your carbon offset portfolio at a glance.</p>

        {/* Stats */}
        <div style={h.grid4}>
          {stats.map((s,i) => (
            <div key={i} style={h.statCard}>
              <div style={{ fontSize:'1.4rem',marginBottom:8 }}>{s.icon}</div>
              <div style={h.statVal}>{pl ? '–' : s.val}</div>
              <div style={h.statLbl}>{s.lbl}</div>
              <div style={h.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={h.grid2}>
          {/* Holdings */}
          <div style={h.card}>
            <div style={h.secLabel}>🌿 Holdings by Project</div>
            {pl ? <p style={h.loading}>Loading…</p> : holdings.length === 0 ? (
              <div style={h.empty}>
                <div style={{ fontSize:'2rem',marginBottom:8 }}>📊</div>
                <p>No holdings yet.</p>
                <Link to="/marketplace" style={h.linkBtn}>Browse Marketplace →</Link>
              </div>
            ) : holdings.map((h2, i) => (
              <div key={i} style={h.holdingRow}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:'.87rem',marginBottom:3 }}>{h2.projectTitle}</div>
                  <div style={{ fontSize:'.75rem',color:'#6b7280' }}>{h2.totalCredits} tons CO₂ · {fmt(h2.totalSpent)} invested</div>
                </div>
                <div style={{ fontFamily:'monospace',fontSize:'.85rem',fontWeight:700,color:'#2E7D32' }}>{h2.totalCredits}</div>
              </div>
            ))}
          </div>

          {/* Impact */}
          <div style={h.card}>
            <div style={h.secLabel}>🌍 Environmental Equivalent</div>
            {[
              { icon:'🌳', lbl:'Trees planted equiv.',   val:`${((summary.totalCredits||0)*5).toLocaleString()}` },
              { icon:'🚗', lbl:'Car miles avoided',       val:`${((summary.totalCredits||0)*2481).toLocaleString()}` },
              { icon:'🏠', lbl:'Homes powered / year',    val:`${Math.round((summary.totalCredits||0)/7.5)}` },
              { icon:'✈️', lbl:'Flight hours avoided',    val:`${((summary.totalCredits||0)/0.255).toFixed(0)}` },
            ].map((it,i) => (
              <div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom: i<3 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize:'.87rem',color:'#374151' }}>{it.icon} {it.lbl}</span>
                <span style={{ fontFamily:'monospace',fontSize:'.82rem',fontWeight:600 }}>{it.val}</span>
              </div>
            ))}
            <Link to="/marketplace" style={{ ...h.linkBtn, display:'block',textAlign:'center',marginTop:16 }}>
              🌿 Buy More Credits
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={h.card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <div style={h.secLabel}>📋 Recent Transactions</div>
            <Link to="/transactions" style={{ fontSize:'.8rem',color:'#2E7D32',fontWeight:600,textDecoration:'none' }}>View all →</Link>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={h.tbl}>
              <thead><tr>{['Project','Credits','Amount','Date','Status'].map(c=><th key={c} style={h.th}>{c}</th>)}</tr></thead>
              <tbody>
                {tl ? <tr><td colSpan={5} style={h.tdCenter}>Loading…</td></tr>
                : transactions.slice(0,5).map(t => (
                  <tr key={t._id}>
                    <td style={h.td}>{t.projectTitle}</td>
                    <td style={{ ...h.td,fontFamily:'monospace',color:'#2E7D32',fontWeight:600 }}>{t.creditsPurchased}</td>
                    <td style={{ ...h.td,fontFamily:'monospace',fontWeight:600 }}>{fmt(t.totalAmount)}</td>
                    <td style={{ ...h.td,color:'#9ca3af',fontFamily:'monospace',fontSize:'.78rem' }}>{t.createdAt?.split('T')[0]}</td>
                    <td style={h.td}><span style={h.badgeG}>✓ {t.status}</span></td>
                  </tr>
                ))}
                {!tl && transactions.length===0 && <tr><td colSpan={5} style={h.tdCenter}>No transactions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const h = {
  title:   { fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1c2526' },
  sub:     { color:'#6b7280',fontSize:'.9rem',marginBottom:24 },
  grid4:   { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20 },
  grid2:   { display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 },
  card:    { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:22 },
  statCard:{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  statVal: { fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:900,color:'#2E7D32',lineHeight:1 },
  statLbl: { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:5 },
  statSub: { fontSize:'.73rem',color:'#9ca3af',marginTop:3 },
  secLabel:{ fontFamily:'monospace',fontSize:'.7rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:14 },
  loading: { color:'#9ca3af',fontSize:'.85rem' },
  empty:   { textAlign:'center',padding:'30px 0',color:'#9ca3af',fontSize:'.85rem' },
  holdingRow:{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#f9faf9',borderRadius:9,marginBottom:8,border:'1px solid #f0faf4' },
  linkBtn: { color:'#2E7D32',fontWeight:700,fontSize:'.85rem',textDecoration:'none',background:'#f0faf4',border:'1px solid #d6f2e2',borderRadius:8,padding:'7px 14px',display:'inline-block',marginTop:8 },
  tbl:     { width:'100%',borderCollapse:'collapse' },
  th:      { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.08em',textTransform:'uppercase',color:'#9ca3af',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #f3f4f6' },
  td:      { padding:'12px 14px',fontSize:'.87rem',borderBottom:'1px solid #f9fafb',color:'#374151' },
  tdCenter:{ textAlign:'center',padding:'28px',color:'#9ca3af',fontSize:'.85rem' },
  badgeG:  { background:'#f0faf4',border:'1px solid #aee4c5',borderRadius:99,padding:'2px 9px',fontSize:'.68rem',color:'#1b5e20',fontFamily:'monospace' },
};