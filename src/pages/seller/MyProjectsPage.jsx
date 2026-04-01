import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';

/* ── helpers ─────────────────────────────────────────────── */

const IMPACT_TYPES = [
  'Forest Conservation','Renewable Energy','Blue Carbon','Clean Cooking',
  'Peatland Conservation','Biodiversity Conservation','Soil Carbon','Methane Capture','Other',
];

const STATUS_CFG = {
  verified:{ bg:'#f0faf4', color:'#166534', border:'#aee4c5', icon:'✓', label:'Verified'  },
  pending: { bg:'#fefce8', color:'#854d0e', border:'#fde68a', icon:'⏳', label:'Pending'   },
  rejected:{ bg:'#fef2f2', color:'#991b1b', border:'#fecaca', icon:'✗', label:'Rejected'  },
};

const TYPE_COLOR = {
  'Forest Conservation':'#2E7D32','Renewable Energy':'#0288D1','Blue Carbon':'#00838f',
  'Clean Cooking':'#e64a19','Peatland Conservation':'#7b1fa2','Biodiversity Conservation':'#c62828',
  'Soil Carbon':'#558b2f','Methane Capture':'#ad1457','Other':'#6b7280',
};

/* ── badges ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:99,padding:'3px 11px',fontSize:'.68rem',fontFamily:'monospace',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:600,display:'inline-flex',alignItems:'center',gap:4}}>
      {c.icon} {c.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const col = TYPE_COLOR[type] || '#6b7280';
  return (
    <span style={{background:`${col}14`,color:col,border:`1px solid ${col}33`,borderRadius:99,padding:'2px 9px',fontSize:'.65rem',fontFamily:'monospace',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:600}}>
      {type}
    </span>
  );
}

/* ── inline edit modal ───────────────────────────────────── */
function EditModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title:          project.title         || '',
    description:    project.description   || '',
    location:       project.location      || '',
    impactType:     project.impactType    || 'Forest Conservation',
    totalCredits:   project.totalCredits  || '',
    pricePerCredit: project.pricePerCredit|| '',
    emoji:          project.emoji         || '🌿',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (f) => (e) => setForm(p=>({...p,[f]:e.target.value}));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title required';
    if (!form.description.trim()) e.description = 'Description required';
    if (!form.location.trim())    e.location    = 'Location required';
    if (!form.totalCredits || Number(form.totalCredits) < 1)    e.totalCredits   = 'Must be ≥ 1';
    if (!form.pricePerCredit || Number(form.pricePerCredit) < 0.01) e.pricePerCredit = 'Must be > 0';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/seller/projects/${project._id}`, {
        ...form,
        totalCredits:   Number(form.totalCredits),
        pricePerCredit: Number(form.pricePerCredit),
      });
      toast.success('Project updated — back in review ⏳');
      onSaved();
      onClose();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type='text', extra={}) => (
    <div style={{marginBottom:14}}>
      <label style={ed.label}>{label}</label>
      <input type={type} value={form[key]} onChange={set(key)}
        style={{...ed.input,...(errors[key]?{borderColor:'#f87171'}:{})}}
        {...extra}/>
      {errors[key] && <span style={ed.err}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',backdropFilter:'blur(6px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20,overflowY:'auto'}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:560,boxShadow:'0 24px 60px rgba(0,0,0,.15)',position:'relative',overflow:'hidden'}}>
        {/* header */}
        <div style={{background:'linear-gradient(135deg,#1b5e20,#2E7D32)',padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:4}}>Editing Project</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1.05rem',color:'#fff'}}>{project.title}</div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:.9+'rem'}}>✕</button>
        </div>

        <div style={{padding:'24px 28px'}}>
          <div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:9,padding:'10px 14px',marginBottom:18,fontSize:'.82rem',color:'#854d0e'}}>
            ⚠️ Editing resets status to <strong>Pending</strong> — admin must re-verify before it goes live.
          </div>

          {/* emoji + title row */}
          <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:12,marginBottom:14}}>
            <div>
              <label style={ed.label}>Emoji</label>
              <input value={form.emoji} onChange={set('emoji')} maxLength={2}
                style={{...ed.input,textAlign:'center',fontSize:'1.4rem',padding:'8px'}}/>
            </div>
            <div>
              <label style={ed.label}>Project Title *</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. Amazon Forest Reserve"
                style={{...ed.input,...(errors.title?{borderColor:'#f87171'}:{})}}/>
              {errors.title && <span style={ed.err}>{errors.title}</span>}
            </div>
          </div>

          {/* description */}
          <div style={{marginBottom:14}}>
            <label style={ed.label}>Description *</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the project methodology and impact…"
              style={{...ed.input,resize:'vertical',minHeight:80,...(errors.description?{borderColor:'#f87171'}:{})}}/>
            {errors.description && <span style={ed.err}>{errors.description}</span>}
          </div>

          {/* location + type */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <label style={ed.label}>Location *</label>
              <input value={form.location} onChange={set('location')} placeholder="Country, Region"
                style={{...ed.input,...(errors.location?{borderColor:'#f87171'}:{})}}/>
              {errors.location && <span style={ed.err}>{errors.location}</span>}
            </div>
            <div>
              <label style={ed.label}>Impact Type</label>
              <select value={form.impactType} onChange={set('impactType')} style={{...ed.input,cursor:'pointer'}}>
                {IMPACT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* credits + price */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div>
              <label style={ed.label}>Total Credits *</label>
              <input type="number" min={1} value={form.totalCredits} onChange={set('totalCredits')}
                style={{...ed.input,...(errors.totalCredits?{borderColor:'#f87171'}:{})}}/>
              {errors.totalCredits && <span style={ed.err}>{errors.totalCredits}</span>}
            </div>
            <div>
              <label style={ed.label}>Price / Credit (USD) *</label>
              <input type="number" min={0.01} step={0.01} value={form.pricePerCredit} onChange={set('pricePerCredit')}
                style={{...ed.input,...(errors.pricePerCredit?{borderColor:'#f87171'}:{})}}/>
              {errors.pricePerCredit && <span style={ed.err}>{errors.pricePerCredit}</span>}
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{flex:1,background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:10,padding:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'.9rem',color:'#374151'}}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{flex:2,background:'linear-gradient(135deg,#2E7D32,#4caf7d)',color:'#fff',border:'none',borderRadius:10,padding:12,cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:'.9rem',opacity:saving?.6:1}}>
              {saving ? '⏳ Saving…' : '💾 Save & Resubmit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── delete confirm ──────────────────────────────────────── */
function DeleteModal({ project, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:18,padding:32,maxWidth:380,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.12)',textAlign:'center'}}>
        <div style={{width:64,height:64,background:'#fef2f2',border:'2px solid #fecaca',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',margin:'0 auto 16px'}}>🗑️</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1.1rem',marginBottom:8,color:'#1a1f1c'}}>Delete Project?</h3>
        <p style={{color:'#6b7280',fontSize:'.875rem',lineHeight:1.65,marginBottom:22}}>
          <strong style={{color:'#1a1f1c'}}>{project.title}</strong> will be permanently removed. This action cannot be undone.
        </p>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:10,padding:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Cancel</button>
          <button disabled={busy} onClick={async()=>{setBusy(true);await onConfirm();setBusy(false);}}
            style={{flex:1,background:'#dc2626',color:'#fff',border:'none',borderRadius:10,padding:11,cursor:'pointer',fontFamily:'inherit',fontWeight:700,opacity:busy?.6:1}}>
            {busy?'Deleting…':'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── project card ────────────────────────────────────────── */
function ProjectCard({ p, onEdit, onDelete, expanded, onToggle }) {
  const sold    = (p.totalCredits||0) - (p.availableCredits||0);
  const soldPct = p.totalCredits > 0 ? Math.round((sold/p.totalCredits)*100) : 0;
  const revenue = sold * (p.pricePerCredit||0);
  const col     = TYPE_COLOR[p.impactType] || '#6b7280';
  const st      = STATUS_CFG[p.status] || STATUS_CFG.pending;

  return (
    <div style={{background:'#fff',border:`1.5px solid ${p.status==='rejected'?'#fecaca':p.status==='verified'?'#aee4c5':'#e5e7eb'}`,borderRadius:16,overflow:'hidden',transition:'box-shadow .2s',boxShadow:expanded?'0 6px 24px rgba(0,0,0,.07)':'none'}}>

      {/* Top accent bar */}
      <div style={{height:3,background:`linear-gradient(90deg,${col},${col}88)`}}/>

      <div style={{padding:'18px 20px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:14}}>

          {/* Emoji avatar */}
          <div style={{width:52,height:52,borderRadius:13,background:`${col}14`,border:`1.5px solid ${col}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',flexShrink:0}}>
            {p.emoji||'🌿'}
          </div>

          {/* Main info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',gap:7,marginBottom:7,flexWrap:'wrap',alignItems:'center'}}>
              <StatusBadge status={p.status}/>
              <TypeBadge type={p.impactType}/>
              <span style={{fontFamily:'monospace',fontSize:'.68rem',color:'#9ca3af'}}>Listed {p.createdAt?.split('T')[0]}</span>
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.05rem',color:'#1a1f1c',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {p.title}
            </div>
            <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'#9ca3af',display:'flex',gap:12,flexWrap:'wrap'}}>
              <span>📍 {p.location}</span>
              <span>💰 {fmt(p.pricePerCredit)}/credit</span>
              <span>📦 {fmtN(p.totalCredits)} total credits</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',gap:7,flexShrink:0,alignItems:'flex-start'}}>
            {p.status !== 'verified' && (
              <button onClick={()=>onEdit(p)} style={ac.edit}>✏️ Edit</button>
            )}
            <button onClick={()=>onDelete(p)} style={ac.del}>🗑️</button>
            <button onClick={onToggle}
              style={{background:expanded?'#f0faf4':'#f9fafb',color:expanded?'#2E7D32':'#6b7280',border:`1px solid ${expanded?'#aee4c5':'#e5e7eb'}`,borderRadius:8,padding:'7px 12px',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>
              {expanded ? '▲ Less' : '▼ Details'}
            </button>
          </div>
        </div>

        {/* Progress bar always visible */}
        <div style={{marginTop:14}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.72rem',color:'#9ca3af',fontFamily:'monospace',marginBottom:5}}>
            <span>{fmtN(sold)} sold of {fmtN(p.totalCredits)}</span>
            <span>{soldPct}% · Est. revenue {fmt(revenue)}</span>
          </div>
          <div style={{height:6,background:'#f3f4f6',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${soldPct}%`,background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:99,transition:'width 1.2s ease'}}/>
          </div>
        </div>

        {/* Rejection reason */}
        {p.status==='rejected' && p.rejectionReason && (
          <div style={{marginTop:10,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px',fontSize:'.78rem',color:'#991b1b'}}>
            ✗ Rejection reason: {p.rejectionReason}
          </div>
        )}
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div style={{borderTop:'1px solid #f0faf4',background:'#fafaf7',padding:'16px 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[
              {lbl:'Total Credits',    val:fmtN(p.totalCredits)},
              {lbl:'Available',        val:fmtN(p.availableCredits)},
              {lbl:'Sold',             val:fmtN(sold)},
              {lbl:'Price / Credit',   val:fmt(p.pricePerCredit)},
              {lbl:'Est. Revenue',     val:fmt(revenue)},
              {lbl:'Sell-through',     val:`${soldPct}%`},
              {lbl:'Impact Type',      val:p.impactType},
              {lbl:'Status',           val:STATUS_CFG[p.status]?.label},
            ].map(({lbl,val})=>(
              <div key={lbl}>
                <div style={{fontFamily:'monospace',fontSize:'.62rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginBottom:4}}>{lbl}</div>
                <div style={{fontFamily:'monospace',fontWeight:600,fontSize:'.85rem',color:'#1a1f1c'}}>{val}</div>
              </div>
            ))}
          </div>
          {p.description && (
            <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #e5e7eb'}}>
              <div style={{fontFamily:'monospace',fontSize:'.62rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginBottom:6}}>Description</div>
              <p style={{fontSize:'.85rem',color:'#374151',lineHeight:1.75}}>{p.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────── */
export default function MyProjectsPage() {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [filterSt,  setFilterSt]  = useState('all');
  const [search,    setSearch]    = useState('');
  const [editing,   setEditing]   = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const toast    = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/seller/projects', { params:{ limit:100 } });
      setProjects(data.data || []);
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ load(); },[load]);

  const handleDelete = async () => {
    try {
      await api.delete(`/seller/projects/${deleting._id}`);
      toast.success('Project deleted');
      setDeleting(null);
      load();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setDeleting(null);
    }
  };

  /* derived counts & filtered list */
  const counts = {
    all:      projects.length,
    verified: projects.filter(p=>p.status==='verified').length,
    pending:  projects.filter(p=>p.status==='pending').length,
    rejected: projects.filter(p=>p.status==='rejected').length,
  };

  const visible = projects.filter(p => {
    const matchSt = filterSt==='all' || p.status===filterSt;
    const q = search.toLowerCase();
    const matchQ  = !q || p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || p.impactType?.toLowerCase().includes(q);
    return matchSt && matchQ;
  });

  /* summary stats */
  const totalRevenue  = projects.reduce((s,p)=>{ const sold=(p.totalCredits||0)-(p.availableCredits||0); return s+sold*(p.pricePerCredit||0); },0);
  const totalSold     = projects.reduce((s,p)=>s+((p.totalCredits||0)-(p.availableCredits||0)),0);
  const totalCredits  = projects.reduce((s,p)=>s+(p.totalCredits||0),0);
  const totalAvail    = projects.reduce((s,p)=>s+(p.availableCredits||0),0);

  return (
    <DashboardLayout>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={s.title}>My Projects</h2>
          <p style={s.sub}>{projects.length} project{projects.length!==1?'s':''} · all data fetched live</p>
        </div>
        <Link to="/seller/create" style={s.pill}>➕ New Project</Link>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:22}}>
        {[
          {icon:'📦',color:'#1a1f1c',val:projects.length,            lbl:'Total Projects'},
          {icon:'✅',color:'#2E7D32',val:counts.verified,             lbl:'Verified & Live'},
          {icon:'🌿',color:'#0288D1',val:`${fmtN(totalSold)} t`,     lbl:'Credits Sold'},
          {icon:'💰',color:'#d97706',val:fmt(totalRevenue),           lbl:'Est. Revenue'},
        ].map((st,i)=>(
          <div key={i} style={s.sc}>
            <div style={{width:44,height:44,borderRadius:11,background:`${st.color}14`,border:`1px solid ${st.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:12}}>{st.icon}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:900,color:st.color,lineHeight:1}}>{loading?'–':st.val}</div>
            <div style={{fontFamily:'monospace',fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9ca3af',marginTop:6}}>{st.lbl}</div>
          </div>
        ))}
      </div>

      {/* Credit inventory bar */}
      {!loading && totalCredits > 0 && (
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:14,padding:'16px 20px',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:'.82rem'}}>
            <span style={{fontFamily:'monospace',fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#2E7D32',fontWeight:600}}>Credit Inventory</span>
            <span style={{fontFamily:'monospace',fontSize:'.78rem',color:'#6b7280'}}>{fmtN(totalSold)} sold · {fmtN(totalAvail)} available of {fmtN(totalCredits)} total</span>
          </div>
          <div style={{height:8,background:'#f3f4f6',borderRadius:99,overflow:'hidden',display:'flex'}}>
            <div style={{height:'100%',width:`${totalCredits>0?Math.round((totalSold/totalCredits)*100):0}%`,background:'linear-gradient(90deg,#2E7D32,#4caf7d)',borderRadius:'99px 0 0 99px',transition:'width 1.2s ease'}}/>
          </div>
          <div style={{display:'flex',gap:16,marginTop:8,fontSize:'.75rem',color:'#9ca3af',fontFamily:'monospace'}}>
            <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:2,background:'#2E7D32',display:'inline-block'}}/>Sold</span>
            <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:2,background:'#f3f4f6',border:'1px solid #e5e7eb',display:'inline-block'}}/>Available</span>
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {[
            ['all',     'All',      '#374151', '#e5e7eb'],
            ['verified','✓ Verified','#166534','#aee4c5'],
            ['pending', '⏳ Pending','#854d0e','#fde68a'],
            ['rejected','✗ Rejected','#991b1b','#fecaca'],
          ].map(([val,lbl,col,bdr])=>(
            <button key={val} onClick={()=>setFilterSt(val)}
              style={{border:`1.5px solid ${filterSt===val?bdr:'#e5e7eb'}`,background:filterSt===val?`${bdr}33`:'#fff',color:filterSt===val?col:'#9ca3af',borderRadius:8,padding:'6px 13px',fontSize:'.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
              {lbl} <span style={{opacity:.7}}>({counts[val]||0})</span>
            </button>
          ))}
        </div>
        <input
          style={{border:'1.5px solid #e5e7eb',borderRadius:9,padding:'8px 14px',fontSize:'.85rem',outline:'none',fontFamily:'inherit',width:240,transition:'border-color .2s'}}
          placeholder="🔍 Search title, location, type…"
          value={search} onChange={e=>setSearch(e.target.value)}
          onFocus={e=>e.target.style.borderColor='#4caf7d'}
          onBlur={e=>e.target.style.borderColor='#e5e7eb'}
        />
      </div>

      {/* States */}
      {loading && (
        <div style={{textAlign:'center',padding:'64px 0',color:'#9ca3af'}}>
          <div style={{fontSize:'2.5rem',marginBottom:10,animation:'spin 1.4s linear infinite',display:'inline-block'}}>🌿</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{fontFamily:'monospace',fontSize:'.85rem'}}>Loading your projects…</p>
        </div>
      )}

      {error && (
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'16px 20px',color:'#dc2626',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span>❌ {error}</span>
          <button onClick={load} style={{background:'#2E7D32',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:'.82rem'}}>Retry</button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div style={{textAlign:'center',padding:'64px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,color:'#9ca3af'}}>
          <div style={{fontSize:'3.5rem',marginBottom:14}}>{projects.length===0?'🌱':'🔍'}</div>
          <p style={{fontWeight:700,fontSize:'1rem',color:'#374151',marginBottom:8}}>
            {projects.length===0 ? 'No projects yet' : `No projects match "${search||filterSt}"`}
          </p>
          <p style={{fontSize:'.875rem',marginBottom:20}}>
            {projects.length===0 ? 'List your first carbon offset project to start selling credits.' : 'Try adjusting your filters or search term.'}
          </p>
          {projects.length===0
            ? <Link to="/seller/create" style={s.pill}>Create First Project →</Link>
            : <button onClick={()=>{setSearch('');setFilterSt('all');}} style={{background:'#f0faf4',color:'#2E7D32',border:'1px solid #aee4c5',borderRadius:9,padding:'9px 18px',fontSize:'.85rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Clear Filters</button>
          }
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {visible.map(p=>(
            <ProjectCard
              key={p._id}
              p={p}
              onEdit={setEditing}
              onDelete={setDeleting}
              expanded={expanded===p._id}
              onToggle={()=>setExpanded(expanded===p._id ? null : p._id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {editing  && <EditModal   project={editing}  onClose={()=>setEditing(null)}  onSaved={load}/>}
      {deleting && <DeleteModal project={deleting} onClose={()=>setDeleting(null)} onConfirm={handleDelete}/>}
    </DashboardLayout>
  );
}

/* ── styles ──────────────────────────────────────────────── */
const s = {
  title:{ fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1a1f1c' },
  sub:  { color:'#6b7280',fontSize:'.9rem' },
  sc:   { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:'18px 20px' },
  pill: { background:'#2E7D32',color:'#fff',border:'none',borderRadius:9,padding:'9px 18px',fontSize:'.85rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit',textDecoration:'none',display:'inline-block' },
};
const ac = {
  edit:{ background:'#eff6ff',color:'#1e40af',border:'1px solid #bfdbfe',borderRadius:8,padding:'7px 12px',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap' },
  del: { background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,padding:'7px 10px',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit' },
};
const ed = {
  label:{ display:'block',fontSize:'.72rem',fontWeight:700,color:'#374151',letterSpacing:'.05em',textTransform:'uppercase',marginBottom:6 },
  input:{ width:'100%',border:'1.5px solid #e5e7eb',borderRadius:9,padding:'10px 13px',fontSize:'.9rem',outline:'none',fontFamily:'inherit',color:'#1a1f1c',boxSizing:'border-box',background:'#fafafa',transition:'border-color .2s' },
  err:  { fontSize:'.72rem',color:'#dc2626',marginTop:4,display:'block' },
};