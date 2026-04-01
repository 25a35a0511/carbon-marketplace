import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';


export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState([]);
  const [txns,     setTxns]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/projects', { params: { status:'pending', limit:5 } }),
      api.get('/admin/transactions', { params: { limit:6 } }),
    ]).then(([sR, pR, tR]) => {
      setStats(sR.data.data);
      setPending(pR.data.data);
      setTxns(tR.data.data);
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const verify = async (id, status) => {
    try {
      await api.put(`/admin/projects/${id}/verify`, { status });
      toast.success(`Project ${status}! ✅`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const u = stats?.users       || {};
  const p = stats?.projects     || {};
  const t = stats?.transactions || {};

  const cards = [
    { icon:'👥', val:u.total ?? '–', lbl:'Total Users',      sub:`${u.buyers??0} buyers · ${u.sellers??0} sellers` },
    { icon:'🌿', val:p.total ?? '–', lbl:'Total Projects',   sub:`${p.verified??0} verified` },
    { icon:'⏳', val:p.pending?? '–',lbl:'Pending Review',   sub:'Awaiting verification' },
    { icon:'💰', val:fmt(t.totalVolume??0),lbl:'Total Volume',sub:`${t.total??0} transactions` },
  ];

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
      <h2 style={s.title}>Admin Overview</h2>
      <p style={s.sub}>Platform health at a glance.</p>

      {/* Stats */}
      <div style={s.g4} className="resp-g4">
        {cards.map((c,i) => (
          <div key={i} style={s.sc}>
            <div style={{ fontSize:'1.4rem',marginBottom:8 }}>{c.icon}</div>
            <div style={s.sv}>{loading ? '–' : c.val}</div>
            <div style={s.sl}>{c.lbl}</div>
            <div style={s.ss}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending verification */}
      {pending.length > 0 && (
        <div style={s.card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <div style={s.sec}>⏳ Pending Verification ({pending.length})</div>
            <Link to="/admin/projects" style={s.viewAll}>View all →</Link>
          </div>
          {pending.map(proj => (
            <div key={proj._id} style={s.pendRow} className="resp-wrap">
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600,fontSize:'.9rem',marginBottom:3 }}>{proj.emoji} {proj.title}</div>
                <div style={{ fontSize:'.75rem',color:'#6b7280' }}>
                  📍 {proj.location} · {proj.impactType} · {proj.totalCredits?.toLocaleString()} credits · {fmt(proj.pricePerCredit)}/credit
                </div>
                <div style={{ fontSize:'.75rem',color:'#9ca3af',marginTop:2 }}>
                  Seller: {proj.seller?.name} ({proj.seller?.email})
                </div>
              </div>
              <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                <button style={s.btnG} onClick={() => verify(proj._id,'verified')}>✓ Verify</button>
                <button style={s.btnR} onClick={() => verify(proj._id,'rejected')}>✗ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.g2} className="resp-g2">
        {/* Project status breakdown */}
        <div style={s.card}>
          <div style={s.sec}>📊 Project Status</div>
          {[
            { label:'Verified', count:p.verified??0, total:p.total??1, color:'#2E7D32', bg:'#f0faf4' },
            { label:'Pending',  count:p.pending??0,  total:p.total??1, color:'#d97706', bg:'#fefce8' },
            { label:'Rejected', count:p.rejected??0, total:p.total??1, color:'#dc2626', bg:'#fef2f2' },
          ].map(r => {
            const pct = p.total ? Math.round((r.count/p.total)*100) : 0;
            return (
              <div key={r.label} style={{ marginBottom:16 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                  <span style={{ fontSize:'.87rem' }}>{r.label}</span>
                  <span style={{ fontFamily:'monospace',fontSize:'.8rem',color:r.color,fontWeight:600 }}>{r.count} ({pct}%)</span>
                </div>
                <div style={{ height:6,background:'#f3f4f6',borderRadius:99,overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${pct}%`,background:r.color,borderRadius:99,transition:'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent txns */}
        <div style={s.card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <div style={s.sec}>🔄 Recent Transactions</div>
            <Link to="/admin/transactions" style={s.viewAll}>View all →</Link>
          </div>
          {txns.map(t => (
            <div key={t._id} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f9fafb' }}>
              <div>
                <div style={{ fontSize:'.85rem',fontWeight:600 }}>{t.buyer?.name}</div>
                <div style={{ fontSize:'.75rem',color:'#9ca3af' }}>{t.projectTitle?.slice(0,28)}…</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'monospace',fontSize:'.82rem',fontWeight:700,color:'#2E7D32' }}>{fmt(t.totalAmount)}</div>
                <div style={{ fontFamily:'monospace',fontSize:'.72rem',color:'#9ca3af' }}>{t.creditsPurchased} credits</div>
              </div>
            </div>
          ))}
          {!loading && txns.length === 0 && <p style={{ color:'#9ca3af',fontSize:'.85rem',textAlign:'center',padding:'20px 0' }}>No transactions yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

const s = {
  title:   { fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1c2526' },
  sub:     { color:'#6b7280',fontSize:'.9rem',marginBottom:24 },
  g4:      { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20 },
  g2:      { display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 },
  card:    { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:22,marginBottom:20 },
  sc:      { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  sv:      { fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:900,color:'#2E7D32',lineHeight:1 },
  sl:      { fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:5 },
  ss:      { fontSize:'.73rem',color:'#9ca3af',marginTop:3 },
  sec:     { fontFamily:'monospace',fontSize:'.7rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',marginBottom:14 },
  viewAll: { fontSize:'.8rem',color:'#2E7D32',fontWeight:600,textDecoration:'none' },
  pendRow: { display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,padding:'14px 0',borderBottom:'1px solid #f3f4f6',flexWrap:'wrap' },
  btnG:    { background:'#2E7D32',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontWeight:700,fontSize:'.8rem',fontFamily:'inherit' },
  btnR:    { background:'#dc2626',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontWeight:700,fontSize:'.8rem',fontFamily:'inherit' },
};