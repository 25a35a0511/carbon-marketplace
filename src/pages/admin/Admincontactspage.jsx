import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const STATUS_STYLES = {
  new:      { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', label:'🔴 New'      },
  read:     { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe', label:'🔵 Read'     },
  replied:  { bg:'#f0faf4', color:'#166534', border:'#aee4c5', label:'🟢 Replied'  },
  archived: { bg:'#f9fafb', color:'#6b7280', border:'#e5e7eb', label:'⚫ Archived' },
};

const TYPE_STYLES = {
  buyer:    { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe' },
  seller:   { bg:'#f0faf4', color:'#166534', border:'#aee4c5' },
  platform: { bg:'#fef2f2', color:'#991b1b', border:'#fecaca' },
  partner:  { bg:'#fefce8', color:'#854d0e', border:'#fde68a' },
  press:    { bg:'#f5f3ff', color:'#4c1d95', border:'#ddd6fe' },
  other:    { bg:'#f9fafb', color:'#6b7280', border:'#e5e7eb' },
};

const TYPE_LABELS = { buyer:'🛒 Buyer', seller:'🌿 Seller', platform:'⚙️ Platform', partner:'🤝 Partner', press:'📰 Press', other:'💬 Other' };

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:99, padding:'2px 10px', fontSize:'.68rem', fontFamily:'monospace', fontWeight:600 }}>{s.label}</span>;
}

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.other;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:99, padding:'2px 9px', fontSize:'.65rem', fontFamily:'monospace', letterSpacing:'.04em', textTransform:'uppercase' }}>{TYPE_LABELS[type]||type}</span>;
}

function MessageModal({ msg, onClose, onUpdate }) {
  const [status,     setStatus]     = useState(msg.status);
  const [adminNotes, setAdminNotes] = useState(msg.adminNotes || '');
  const [saving,     setSaving]     = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/contacts/${msg._id}`, { status, adminNotes });
      toast.success('Updated ✅');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete message from ${msg.name}?`)) return;
    try {
      await api.delete(`/admin/contacts/${msg._id}`);
      toast.success('Message deleted');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(6px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,.15)' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1b5e20,#2E7D32)', padding:'22px 28px', borderRadius:'20px 20px 0 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1.15rem', color:'#fff', marginBottom:4 }}>{msg.name}</div>
            <div style={{ fontFamily:'monospace', fontSize:'.78rem', color:'rgba(255,255,255,.7)' }}>{msg.email}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:'.9rem' }}>✕</button>
        </div>

        <div style={{ padding:'24px 28px' }}>
          {/* Badges */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <StatusBadge status={msg.status} />
            <TypeBadge   type={msg.inquiryType} />
            <span style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#9ca3af' }}>{fmt(msg.createdAt)}</span>
            {msg.source === 'landing' && <span style={{ fontFamily:'monospace', fontSize:'.65rem', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, padding:'2px 8px', color:'#6b7280' }}>from landing page</span>}
            {msg.user && <span style={{ fontFamily:'monospace', fontSize:'.65rem', background:'#f0faf4', border:'1px solid #aee4c5', borderRadius:6, padding:'2px 8px', color:'#2E7D32' }}>logged-in user</span>}
          </div>

          {/* Subject */}
          {msg.subject && (
            <div style={{ marginBottom:14 }}>
              <div style={s.detLabel}>Subject</div>
              <div style={{ fontWeight:600, fontSize:'.9rem', color:'#1a1f1c' }}>{msg.subject}</div>
            </div>
          )}

          {/* Message */}
          <div style={{ marginBottom:20 }}>
            <div style={s.detLabel}>Message</div>
            <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 16px', fontSize:'.9rem', color:'#374151', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{msg.message}</div>
          </div>

          {/* Admin controls */}
          <div style={{ borderTop:'1px solid #f3f4f6', paddingTop:18 }}>
            <div style={s.detLabel}>Admin Actions</div>

            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#374151', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:7 }}>Update Status</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {Object.entries(STATUS_STYLES).map(([val, st]) => (
                  <button key={val} onClick={() => setStatus(val)}
                    style={{ border:`1.5px solid ${status===val ? st.color : '#e5e7eb'}`, background:status===val ? st.bg : '#fff', color:status===val ? st.color : '#6b7280', borderRadius:8, padding:'6px 12px', fontSize:'.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#374151', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:7 }}>Admin Notes (internal only)</label>
              <textarea
                style={{ width:'100%', border:'1.5px solid #e5e7eb', borderRadius:9, padding:'10px 14px', fontSize:'.875rem', outline:'none', resize:'vertical', minHeight:80, fontFamily:'inherit', color:'#1a1f1c', boxSizing:'border-box', transition:'border-color .2s' }}
                placeholder="Add internal notes about this message or your reply..."
                value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                onFocus={e => e.target.style.borderColor='#4caf7d'}
                onBlur={e => e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* Reply helper */}
            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject||'Your CarbonX Enquiry')}&body=${encodeURIComponent(`Hi ${msg.name.split(' ')[0]},\n\nThank you for reaching out to CarbonX.\n\n`)}`}
              style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#eff6ff', color:'#1e40af', border:'1px solid #bfdbfe', borderRadius:9, padding:'8px 16px', fontSize:'.82rem', fontWeight:700, textDecoration:'none', marginBottom:16 }}>
              📧 Reply via Email
            </a>

            <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
              <button onClick={handleDelete} style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:9, padding:'9px 16px', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🗑 Delete</button>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onClose} style={{ background:'#fff', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:9, padding:'9px 18px', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:9, padding:'9px 20px', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:saving?.6:1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContactsPage() {
  const [messages,  setMessages]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [statusF,   setStatusF]   = useState('all');
  const [typeF,     setTypeF]     = useState('all');
  const [page,      setPage]      = useState(1);
  const [pag,       setPag]       = useState(null);
  const [selected,  setSelected]  = useState(null);
  const toast = useToast();

  const load = useCallback(async (pg = 1) => {
    setLoading(true); setError(null);
    try {
      const params = { page: pg, limit: 15 };
      if (statusF !== 'all') params.status = statusF;
      if (typeF   !== 'all') params.inquiryType = typeF;

      const [msgsRes, statsRes] = await Promise.all([
        api.get('/admin/contacts', { params }),
        pg === 1 ? api.get('/admin/contacts/stats') : Promise.resolve(null),
      ]);

      setMessages(msgsRes.data.data);
      setPag(msgsRes.data.pagination);
      setPage(pg);
      if (statsRes) setStats(statsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [statusF, typeF]);

  useEffect(() => { load(1); }, [statusF, typeF]);

  const openMessage = async (msg) => {
    setSelected(msg);
    // Auto-mark as read
    if (msg.status === 'new') {
      try {
        await api.patch(`/admin/contacts/${msg._id}`, { status: 'read' });
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: 'read' } : m));
        if (stats) setStats(prev => ({ ...prev, unread: Math.max(0, (prev?.unread||1) - 1), byStatus: { ...prev?.byStatus, new: Math.max(0,(prev?.byStatus?.new||1)-1), read: (prev?.byStatus?.read||0)+1 } }));
      } catch { /* silent */ }
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom:24 }}>
        <h2 style={s.title}>Contact Messages</h2>
        <p style={s.sub}>All enquiries submitted via the contact form and landing page.</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
          {[
            { icon:'📬', val:stats.total,         lbl:'Total Messages',    color:'#1a1f1c' },
            { icon:'🔴', val:stats.unread||0,      lbl:'Unread',           color:'#dc2626' },
            { icon:'📅', val:stats.lastSevenDays,  lbl:'Last 7 Days',      color:'#0288D1' },
            { icon:'✅', val:stats.byStatus?.replied||0, lbl:'Replied',    color:'#2E7D32' },
          ].map((st,i)=>(
            <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'16px 18px' }}>
              <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{st.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:900, color:st.color, lineHeight:1 }}>{st.val}</div>
              <div style={{ fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'#9ca3af', marginTop:4 }}>{st.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {/* Status */}
        <div style={{ display:'flex', gap:5 }}>
          {[['all','All'],['new','🔴 New'],['read','🔵 Read'],['replied','🟢 Replied'],['archived','⚫ Archived']].map(([val,lbl])=>(
            <button key={val} onClick={()=>setStatusF(val)}
              style={{ border:`1.5px solid ${statusF===val?'#2E7D32':'#e5e7eb'}`, background:statusF===val?'#f0faf4':'#fff', color:statusF===val?'#166534':'#6b7280', borderRadius:8, padding:'6px 13px', fontSize:'.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {lbl}
            </button>
          ))}
        </div>
        {/* Type */}
        <div style={{ display:'flex', gap:5 }}>
          {[['all','All Types'],['buyer','🛒 Buyer'],['seller','🌿 Seller'],['platform','⚙️ Platform'],['partner','🤝 Partner']].map(([val,lbl])=>(
            <button key={val} onClick={()=>setTypeF(val)}
              style={{ border:`1.5px solid ${typeF===val?'#374151':'#e5e7eb'}`, background:typeF===val?'#f9fafb':'#fff', color:typeF===val?'#374151':'#9ca3af', borderRadius:8, padding:'6px 12px', fontSize:'.78rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={s.centerMsg}><div style={{ fontSize:'2rem', marginBottom:8 }}>📬</div><p>Loading messages…</p></div>}
      {error   && <div style={s.errBox}>❌ {error} <button onClick={()=>load(1)} style={s.retryBtn}>Retry</button></div>}

      {!loading && !error && (
        <>
          <p style={{ fontSize:'.8rem', color:'#9ca3af', fontFamily:'monospace', marginBottom:14 }}>
            {pag?.total ?? messages.length} messages
          </p>

          {messages.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>📭</div>
              <p style={{ fontWeight:600, color:'#374151', marginBottom:6 }}>No messages</p>
              <p style={{ fontSize:'.85rem', color:'#9ca3af' }}>{statusF !== 'all' ? `No ${statusF} messages.` : 'No contact messages yet.'}</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {messages.map(msg => (
                <div key={msg._id}
                  onClick={() => openMessage(msg)}
                  style={{ background:'#fff', border:`1.5px solid ${msg.status==='new'?'#fecaca':msg.status==='replied'?'#aee4c5':'#e5e7eb'}`, borderRadius:13, padding:'16px 20px', cursor:'pointer', transition:'all .2s', display:'flex', gap:16, alignItems:'flex-start', ...(msg.status==='new'?{boxShadow:'0 2px 12px rgba(220,38,38,.08)'}:{}) }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=msg.status==='new'?'0 2px 12px rgba(220,38,38,.08)':''; }}>

                  {/* Avatar */}
                  <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${TYPE_STYLES[msg.inquiryType]?.bg||'#f0faf4'},${TYPE_STYLES[msg.inquiryType]?.border||'#aee4c5'})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', color:TYPE_STYLES[msg.inquiryType]?.color||'#166534', flexShrink:0 }}>
                    {msg.name?.[0]?.toUpperCase()||'?'}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4, flexWrap:'wrap', gap:8 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:700, fontSize:'.9rem', color:'#1a1f1c' }}>{msg.name}</span>
                        {msg.status === 'new' && <span style={{ width:8, height:8, background:'#dc2626', borderRadius:'50%', display:'inline-block' }} />}
                        <StatusBadge status={msg.status} />
                        <TypeBadge   type={msg.inquiryType} />
                      </div>
                      <span style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#9ca3af', flexShrink:0 }}>{fmt(msg.createdAt)}</span>
                    </div>
                    <div style={{ fontSize:'.82rem', color:'#6b7280', fontFamily:'monospace', marginBottom:5 }}>{msg.email}</div>
                    {msg.subject && <div style={{ fontSize:'.875rem', fontWeight:600, color:'#374151', marginBottom:4 }}>{msg.subject}</div>}
                    <div style={{ fontSize:'.85rem', color:'#6b7280', lineHeight:1.55, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{msg.message}</div>
                    {msg.adminNotes && <div style={{ marginTop:6, fontSize:'.75rem', color:'#9ca3af', fontStyle:'italic' }}>📝 Note: {msg.adminNotes.slice(0,60)}{msg.adminNotes.length>60?'…':''}</div>}
                  </div>

                  <div style={{ color:'#d1d5db', fontSize:'1rem', flexShrink:0, alignSelf:'center' }}>›</div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pag?.totalPages > 1 && (
            <div style={{ marginTop:18, display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
              <button disabled={page<=1} onClick={()=>load(page-1)} style={{ ...s.pageBtn, opacity:page<=1?.4:1 }}>← Prev</button>
              <span style={{ fontFamily:'monospace', fontSize:'.8rem', color:'#6b7280' }}>Page {page} of {pag.totalPages}</span>
              <button disabled={page>=pag.totalPages} onClick={()=>load(page+1)} style={{ ...s.pageBtn, opacity:page>=pag.totalPages?.4:1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => load(page)}
        />
      )}
    </DashboardLayout>
  );
}

const s = {
  title:    { fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', fontWeight:900, marginBottom:4, color:'#1c2526' },
  sub:      { color:'#6b7280', fontSize:'.9rem' },
  detLabel: { fontFamily:'monospace', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'#2E7D32', marginBottom:8 },
  centerMsg:{ textAlign:'center', padding:'60px 0', color:'#9ca3af', fontFamily:'monospace', fontSize:'.85rem' },
  errBox:   { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'12px 16px', color:'#dc2626', fontSize:'.87rem', marginBottom:16 },
  retryBtn: { background:'none', border:'none', color:'#2E7D32', fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  emptyBox: { textAlign:'center', padding:'60px 20px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, color:'#9ca3af', fontSize:'.85rem' },
  pageBtn:  { background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'7px 14px', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#374151' },
};