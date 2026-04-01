import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';


const STATUS_STYLES = {
  verified: { bg: '#f0faf4', color: '#166534', border: '#aee4c5', icon: '✓' },
  pending:  { bg: '#fefce8', color: '#854d0e', border: '#fde68a', icon: '⏳' },
  rejected: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '✗' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '3px 11px', fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>
      {s.icon} {status}
    </span>
  );
}

function RejectModal({ project, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.12)' }}>
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 10 }}>✗</div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, textAlign: 'center', marginBottom: 6, color: '#1c2526' }}>Reject Project</h3>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '.875rem', marginBottom: 18 }}>
          <strong style={{ color: '#1c2526' }}>{project.title}</strong> — please provide a reason.
        </p>
        <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#374151', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 7 }}>Rejection Reason *</label>
        <textarea style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 14px', fontSize: '.875rem', outline: 'none', resize: 'vertical', minHeight: 90, fontFamily: 'inherit', color: '#1c2526', boxSizing: 'border-box' }}
          placeholder="e.g., Insufficient project documentation, location data missing..."
          value={reason} onChange={e => setReason(e.target.value)} />
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={{ flex: 1, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '.875rem' }} onClick={onClose}>Cancel</button>
          <button
            disabled={!reason.trim() || loading}
            style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, padding: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '.875rem', opacity: (!reason.trim() || loading) ? .5 : 1 }}
            onClick={async () => { setLoading(true); await onConfirm(reason); setLoading(false); }}>
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [filter,    setFilter]    = useState('pending');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [pag,       setPag]       = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const toast = useToast();

  const load = useCallback(async (pg = 1, st = filter, q = search) => {
    setLoading(true); setError(null);
    try {
      const params = { page: pg, limit: 10 };
      if (st !== 'all') params.status = st;
      if (q) params.search = q;
      const { data } = await api.get('/admin/projects', { params });
      setProjects(data.data);
      setPag(data.pagination);
      setPage(pg);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(1, filter, search); }, [filter]);

  const handleVerify = async (id, status, rejectionReason) => {
    try {
      await api.put(`/admin/projects/${id}/verify`, { status, ...(rejectionReason ? { rejectionReason } : {}) });
      toast.success(status === 'verified' ? '✅ Project verified!' : '✗ Project rejected');
      setRejectTarget(null);
      load(page, filter, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const counts = { pending: 0, verified: 0, rejected: 0 };
  // show count from pagination when filter matches
  if (pag) counts[filter] = pag.total;

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
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={s.title}>Project Verification</h2>
        <p style={s.sub}>Review and approve or reject seller-submitted carbon projects.</p>
      </div>

      {/* Filter + Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['pending','⏳ Pending'],['verified','✓ Verified'],['rejected','✗ Rejected'],['all','All']].map(([val, lbl]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              style={{ border: `1.5px solid ${filter === val ? (val==='pending'?'#d97706':val==='verified'?'#2E7D32':val==='rejected'?'#dc2626':'#374151') : '#e5e7eb'}`,
                background: filter === val ? (val==='pending'?'#fefce8':val==='verified'?'#f0faf4':val==='rejected'?'#fef2f2':'#f9fafb') : '#fff',
                color: filter === val ? (val==='pending'?'#854d0e':val==='verified'?'#166534':val==='rejected'?'#991b1b':'#1c2526') : '#6b7280',
                borderRadius: 8, padding: '7px 14px', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
              {lbl}
            </button>
          ))}
        </div>
        <input style={s.search} placeholder="🔍 Search by title, location, type…" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(1, filter, e.target.value)} />
        <button onClick={() => load(1, filter, search)} style={{ ...s.btnG, padding: '8px 16px', fontSize: '.82rem' }}>Search</button>
      </div>

      {loading && <div style={s.centerMsg}><div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div><p>Loading projects…</p></div>}
      {error   && <div style={s.errBox}>❌ {error} <button onClick={() => load(1)} style={s.retryBtn}>Retry</button></div>}

      {!loading && !error && (
        <>
          <p style={{ fontSize: '.8rem', color: '#9ca3af', fontFamily: 'monospace', marginBottom: 16 }}>
            {pag?.total ?? projects.length} projects · page {page} of {pag?.totalPages ?? 1}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projects.length === 0 ? (
              <div style={s.emptyBox}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🌿</div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>No {filter !== 'all' ? filter : ''} projects found</p>
                <p style={{ fontSize: '.85rem', color: '#9ca3af' }}>
                  {filter === 'pending' ? 'All caught up — no projects awaiting review.' : `Try changing the filter or search term.`}
                </p>
              </div>
            ) : projects.map(p => {
              const isOpen = expanded === p._id;
              const sold   = (p.totalCredits || 0) - (p.availableCredits || 0);
              const soldPct = p.totalCredits > 0 ? Math.round((sold / p.totalCredits) * 100) : 0;
              return (
                <div key={p._id} style={{ background: '#fff', border: `1px solid ${p.status==='pending'?'#fde68a':p.status==='verified'?'#aee4c5':'#fecaca'}`, borderRadius: 14, overflow: 'hidden', transition: 'box-shadow .2s' }}>
                  {/* Row header */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <StatusBadge status={p.status} />
                        <span style={{ fontFamily: 'monospace', fontSize: '.68rem', color: '#9ca3af', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 6, padding: '2px 8px' }}>{p.impactType}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '.68rem', color: '#9ca3af' }}>Listed {p.createdAt?.split('T')[0]}</span>
                      </div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1rem', color: '#1c2526', marginBottom: 4 }}>
                        {p.emoji || '🌿'} {p.title}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#9ca3af', fontFamily: 'monospace', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>📍 {p.location}</span>
                        <span>💰 {fmt(p.pricePerCredit)}/credit</span>
                        <span>📦 {(p.totalCredits || 0).toLocaleString()} total credits</span>
                        <span>👤 {p.seller?.name} ({p.seller?.email})</span>
                      </div>
                      {p.status === 'rejected' && p.rejectionReason && (
                        <div style={{ marginTop: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '6px 10px', fontSize: '.78rem', color: '#991b1b' }}>
                          ✗ Rejection reason: {p.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {p.status === 'pending' && (
                        <>
                          <button style={s.btnG} onClick={() => handleVerify(p._id, 'verified')}>✓ Verify</button>
                          <button style={s.btnR} onClick={() => setRejectTarget(p)}>✗ Reject</button>
                        </>
                      )}
                      {p.status === 'verified' && (
                        <button style={{ ...s.btnAmber, fontSize: '.78rem' }} onClick={() => setRejectTarget(p)}>Revoke</button>
                      )}
                      <button style={s.toggleBtn} onClick={() => setExpanded(isOpen ? null : p._id)}>
                        {isOpen ? '▲ Less' : '▼ Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                          <div style={s.detLabel}>Project Description</div>
                          <p style={{ fontSize: '.87rem', color: '#374151', lineHeight: 1.7 }}>{p.description}</p>
                        </div>
                        <div>
                          <div style={s.detLabel}>Credits & Sales</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: '#6b7280', marginBottom: 5, fontFamily: 'monospace' }}>
                            <span>Sold</span><span>{sold.toLocaleString()} / {(p.totalCredits||0).toLocaleString()} ({soldPct}%)</span>
                          </div>
                          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                            <div style={{ height: '100%', width: `${soldPct}%`, background: 'linear-gradient(90deg,#2E7D32,#4caf7d)', borderRadius: 99 }} />
                          </div>
                          {[['Total Credits', (p.totalCredits||0).toLocaleString()],['Available', (p.availableCredits||0).toLocaleString()],['Price/Credit', fmt(p.pricePerCredit)],['Est. Revenue', fmt((p.totalCredits||0)*(p.pricePerCredit||0))]].map(([l,v])=>(
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: '.82rem' }}>
                              <span style={{ color: '#6b7280' }}>{l}</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {p.verifiedAt && (
                        <div style={{ marginTop: 12, fontSize: '.78rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                          Verified on {new Date(p.verifiedAt).toLocaleDateString()} by {p.verifiedBy?.name || 'Admin'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pag?.totalPages > 1 && (
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button disabled={page <= 1} onClick={() => load(page-1)} style={{ ...s.pageBtn, opacity: page<=1?.4:1 }}>← Prev</button>
              <span style={{ fontFamily: 'monospace', fontSize: '.82rem', color: '#6b7280', alignSelf: 'center' }}>
                {page} / {pag.totalPages}
              </span>
              <button disabled={page >= pag.totalPages} onClick={() => load(page+1)} style={{ ...s.pageBtn, opacity: page>=pag.totalPages?.4:1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {rejectTarget && (
        <RejectModal
          project={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleVerify(rejectTarget._id, 'rejected', reason)}
        />
      )}
    </DashboardLayout>
  );
}

const s = {
  title:    { fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', fontWeight: 900, marginBottom: 4, color: '#1c2526' },
  sub:      { color: '#6b7280', fontSize: '.9rem' },
  search:   { flex: 1, minWidth: 200, maxWidth: 320, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '8px 14px', fontSize: '.85rem', outline: 'none', fontFamily: 'inherit' },
  btnG:     { background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  btnR:     { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  btnAmber: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  toggleBtn:{ background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  centerMsg:{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontFamily: 'monospace', fontSize: '.85rem' },
  errBox:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '12px 16px', color: '#dc2626', fontSize: '.87rem', marginBottom: 16 },
  retryBtn: { background: 'none', border: 'none', color: '#2E7D32', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  emptyBox: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, color: '#9ca3af', fontSize: '.85rem' },
  pageBtn:  { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' },
  detLabel: { fontFamily: 'monospace', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#2E7D32', marginBottom: 10 },
};