import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ROLE_STYLE = {
  buyer:  { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  seller: { bg: '#f0faf4', color: '#166534', border: '#aee4c5' },
  admin:  { bg: '#fefce8', color: '#854d0e', border: '#fde68a' },
};
const STATUS_STYLE = {
  active:    { bg: '#f0faf4', color: '#166534', border: '#aee4c5', label: '● Active' },
  suspended: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: '⊘ Suspended' },
};

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || ROLE_STYLE.buyer;
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 10px', fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>{role}</span>;
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.active;
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 10px', fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.06em', fontWeight: 500 }}>{s.label}</span>;
}

function ConfirmModal({ user, action, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const isSuspend = action === 'suspended';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.12)' }}>
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 10 }}>{isSuspend ? '⊘' : '✓'}</div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#1c2526' }}>
          {isSuspend ? 'Suspend User?' : 'Reactivate User?'}
        </h3>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '.875rem', lineHeight: 1.6, marginBottom: 20 }}>
          <strong style={{ color: '#1c2526' }}>{user.name}</strong> ({user.email}) will be{' '}
          {isSuspend ? 'suspended and unable to log in.' : 'reactivated and able to access the platform again.'}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={onClose}>Cancel</button>
          <button style={{ flex: 1, background: isSuspend ? '#dc2626' : '#2E7D32', color: '#fff', border: 'none', borderRadius: 9, padding: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, opacity: loading ? .6 : 1 }}
            disabled={loading}
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}>
            {loading ? 'Saving…' : isSuspend ? 'Suspend' : 'Reactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [roleF,    setRoleF]    = useState('all');
  const [statusF,  setStatusF]  = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pag,      setPag]      = useState(null);
  const [modal,    setModal]    = useState(null); // { user, action }
  const { user: me } = useAuth();
  const toast = useToast();

  const load = useCallback(async (pg = 1) => {
    setLoading(true); setError(null);
    try {
      const params = { page: pg, limit: 15 };
      if (roleF   !== 'all') params.role   = roleF;
      if (statusF !== 'all') params.status = statusF;
      if (search)            params.search = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
      setPag(data.pagination);
      setPage(pg);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleF, statusF, search]);

  useEffect(() => { load(1); }, [roleF, statusF]);

  const handleStatusChange = async () => {
    const { user: target, action } = modal;
    try {
      await api.patch(`/admin/users/${target._id}/status`, { status: action });
      toast.success(`User ${action === 'suspended' ? 'suspended' : 'reactivated'}`);
      setModal(null);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      setModal(null);
    }
  };

  // Aggregate stats from current page data
  const buyers  = users.filter(u => u.role === 'buyer').length;
  const sellers = users.filter(u => u.role === 'seller').length;
  const admins  = users.filter(u => u.role === 'admin').length;
  const suspended = users.filter(u => u.status === 'suspended').length;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={s.title}>User Management</h2>
        <p style={s.sub}>{pag?.total ?? users.length} registered users on the platform.</p>
      </div>

      {/* Quick stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon:'👥', val: pag?.total ?? '–', lbl:'Total Users',    color:'#1c2526' },
          { icon:'🛒', val: buyers,             lbl:'Buyers',         color:'#1e40af' },
          { icon:'🌿', val: sellers,            lbl:'Sellers',        color:'#166534' },
          { icon:'⊘',  val: suspended,          lbl:'Suspended',      color:'#991b1b' },
        ].map((st,i)=>(
          <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'16px 18px' }}>
            <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{st.icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', fontWeight:900, color:st.color, lineHeight:1 }}>{loading?'–':st.val}</div>
            <div style={{ fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'#9ca3af', marginTop:4 }}>{st.lbl}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        {/* Role filter */}
        <div style={{ display:'flex', gap:5 }}>
          {[['all','All Roles'],['buyer','Buyers'],['seller','Sellers'],['admin','Admins']].map(([val,lbl])=>(
            <button key={val} onClick={()=>setRoleF(val)} style={{ border:`1.5px solid ${roleF===val?'#2E7D32':'#e5e7eb'}`, background:roleF===val?'#f0faf4':'#fff', color:roleF===val?'#166534':'#6b7280', borderRadius:8, padding:'7px 13px', fontSize:'.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {lbl}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div style={{ display:'flex', gap:5 }}>
          {[['all','Any Status'],['active','Active'],['suspended','Suspended']].map(([val,lbl])=>(
            <button key={val} onClick={()=>setStatusF(val)} style={{ border:`1.5px solid ${statusF===val?'#6b7280':'#e5e7eb'}`, background:statusF===val?'#f9fafb':'#fff', color:statusF===val?'#374151':'#9ca3af', borderRadius:8, padding:'7px 13px', fontSize:'.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {lbl}
            </button>
          ))}
        </div>
        {/* Search */}
        <input style={s.search} placeholder="🔍 Search name or email…" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(1)} />
        <button onClick={() => load(1)} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Search</button>
      </div>

      {loading && <div style={s.centerMsg}><div style={{ fontSize:'2rem', marginBottom:8 }}>⏳</div><p>Loading users…</p></div>}
      {error   && <div style={s.errBox}>❌ {error} <button onClick={()=>load(1)} style={s.retryBtn}>Retry</button></div>}

      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>👥</div>
              <p style={{ fontWeight:600, color:'#374151', marginBottom:6 }}>No users found</p>
              <p style={{ fontSize:'.85rem', color:'#9ca3af' }}>Try adjusting your filters or search.</p>
            </div>
          ) : (
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={s.tbl}>
                  <thead>
                    <tr>{['User','Email','Role','Status','Joined','Actions'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isMe = u._id === me?._id;
                      return (
                        <tr key={u._id}
                          onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e=>e.currentTarget.style.background=''}>
                          <td style={s.td}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${ROLE_STYLE[u.role]?.bg||'#f0faf4'},${ROLE_STYLE[u.role]?.border||'#aee4c5'})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.9rem', color:ROLE_STYLE[u.role]?.color||'#166634', flexShrink:0 }}>
                                {u.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight:600, fontSize:'.88rem', color:'#1c2526' }}>{u.name} {isMe && <span style={{ fontSize:'.68rem', background:'#f0faf4', color:'#2E7D32', border:'1px solid #aee4c5', borderRadius:99, padding:'1px 7px', fontFamily:'monospace', marginLeft:4 }}>You</span>}</div>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}><span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#6b7280' }}>{u.email}</span></td>
                          <td style={s.td}><RoleBadge role={u.role} /></td>
                          <td style={s.td}><StatusBadge status={u.status || 'active'} /></td>
                          <td style={s.td}><span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#9ca3af' }}>{u.createdAt?.split('T')[0]}</span></td>
                          <td style={s.td}>
                            {isMe ? (
                              <span style={{ fontSize:'.78rem', color:'#9ca3af', fontStyle:'italic' }}>—</span>
                            ) : (
                              <button
                                style={{ background: (u.status||'active')==='active' ? '#fef2f2' : '#f0faf4', color: (u.status||'active')==='active' ? '#dc2626' : '#166534', border: `1px solid ${(u.status||'active')==='active' ? '#fecaca' : '#aee4c5'}`, borderRadius:8, padding:'6px 12px', fontSize:'.78rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}
                                onClick={() => setModal({ user: u, action: (u.status||'active')==='active' ? 'suspended' : 'active' })}>
                                {(u.status||'active')==='active' ? '⊘ Suspend' : '✓ Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pag?.totalPages > 1 && (
            <div style={{ marginTop:18, display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
              <button disabled={page<=1} onClick={()=>load(page-1)} style={{ ...s.pageBtn, opacity:page<=1?.4:1 }}>← Prev</button>
              <span style={{ fontFamily:'monospace', fontSize:'.8rem', color:'#6b7280' }}>Page {page} of {pag.totalPages} · {pag.total} users</span>
              <button disabled={page>=pag.totalPages} onClick={()=>load(page+1)} style={{ ...s.pageBtn, opacity:page>=pag.totalPages?.4:1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {modal && (
        <ConfirmModal user={modal.user} action={modal.action} onClose={()=>setModal(null)} onConfirm={handleStatusChange} />
      )}
    </DashboardLayout>
  );
}

const s = {
  title:    { fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', fontWeight:900, marginBottom:4, color:'#1c2526' },
  sub:      { color:'#6b7280', fontSize:'.9rem' },
  search:   { flex:1, minWidth:200, maxWidth:280, border:'1.5px solid #e5e7eb', borderRadius:9, padding:'8px 14px', fontSize:'.85rem', outline:'none', fontFamily:'inherit' },
  tbl:      { width:'100%', borderCollapse:'collapse' },
  th:       { fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.08em', textTransform:'uppercase', color:'#9ca3af', padding:'12px 16px', textAlign:'left', borderBottom:'1px solid #f3f4f6', background:'#fafafa', whiteSpace:'nowrap' },
  td:       { padding:'13px 16px', fontSize:'.875rem', borderBottom:'1px solid #f9fafb', verticalAlign:'middle' },
  centerMsg:{ textAlign:'center', padding:'60px 0', color:'#9ca3af', fontFamily:'monospace', fontSize:'.85rem' },
  errBox:   { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'12px 16px', color:'#dc2626', fontSize:'.87rem', marginBottom:16 },
  retryBtn: { background:'none', border:'none', color:'#2E7D32', fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  emptyBox: { textAlign:'center', padding:'60px 20px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, color:'#9ca3af', fontSize:'.85rem' },
  pageBtn:  { background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'7px 14px', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#374151' },
};
