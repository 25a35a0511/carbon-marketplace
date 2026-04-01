import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProjects } from '../../hooks/useProjects';
import api from '../../utils/api';
import { fmt, fmtN } from '../../utils/Currency';

const IMPACT_TYPES = [
  'Forest Conservation', 'Renewable Energy', 'Blue Carbon',
  'Clean Cooking', 'Peatland Conservation', 'Biodiversity Conservation',
  'Soil Carbon', 'Methane Capture', 'Other',
];

const TYPE_COLORS = {
  'Forest Conservation':        { bg: '#f0faf4', border: '#aee4c5', text: '#14532d' },
  'Renewable Energy':           { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
  'Blue Carbon':                { bg: '#ecfeff', border: '#a5f3fc', text: '#164e63' },
  'Clean Cooking':              { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' },
  'Peatland Conservation':      { bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },
  'Biodiversity Conservation':  { bg: '#fdf4ff', border: '#f5d0fe', text: '#701a75' },
  'Soil Carbon':                { bg: '#fefce8', border: '#fde68a', text: '#713f12' },
  'Methane Capture':            { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d' },
};

const CARD_GRADIENTS = {
  'Forest Conservation':       'linear-gradient(135deg,#1b5e20,#2e7d32)',
  'Renewable Energy':          'linear-gradient(135deg,#01579b,#0288d1)',
  'Blue Carbon':               'linear-gradient(135deg,#003c8f,#1565c0)',
  'Clean Cooking':             'linear-gradient(135deg,#bf360c,#e64a19)',
  'Peatland Conservation':     'linear-gradient(135deg,#263238,#37474f)',
  'Biodiversity Conservation': 'linear-gradient(135deg,#4e342e,#6d4c41)',
  'Soil Carbon':               'linear-gradient(135deg,#827717,#9e9d24)',
  'Methane Capture':           'linear-gradient(135deg,#880e4f,#ad1457)',
};


function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' };
  return (
    <span style={{ display: 'inline-block', background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 99, padding: '2px 10px', fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>
      {type}
    </span>
  );
}

function ProgressBar({ sold, total }) {
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#9ca3af', marginBottom: 4, fontFamily: 'monospace' }}>
        <span>{(total - sold).toLocaleString()} available</span>
        <span>{pct}% sold</span>
      </div>
      <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#2E7D32,#4caf7d)', borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function BuyModal({ project, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(10);
  const [buying,  setBuying]  = useState(false);

  const available = project.availableCredits ?? project.available_credits ?? 0;
  const price     = project.pricePerCredit   ?? project.price_per_credit  ?? 0;
  const total     = credits * price;

  const handleBuy = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'buyer') { toast.error('Only buyer accounts can purchase credits'); return; }
    setBuying(true);
    try {
      await api.post(`/credits/buy/${project._id}`, { credits });
      toast.success(`✅ Purchased ${credits} credits from ${project.title}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  const adj = (delta) => setCredits(c => Math.max(1, Math.min(available, c + delta)));

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ height: 110, background: CARD_GRADIENTS[project.impactType] || '#1b5e20', borderRadius: '16px 16px 0 0', margin: '-28px -28px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
          {project.emoji || '🌿'}
          <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,.3)', border: 'none', color: '#fff', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <TypeBadge type={project.impactType} />
          <span style={{ ...m.badge, background: '#f0faf4', color: '#166534', border: '1px solid #aee4c5' }}>✓ Verified</span>
        </div>

        <h2 style={m.title}>{project.title}</h2>
        <p style={m.loc}>📍 {project.location}</p>
        <p style={m.desc}>{project.description}</p>

        <div style={{ marginBottom: 20 }}>
          <ProgressBar sold={project.totalCredits - available} total={project.totalCredits} />
        </div>

        {user?.role === 'buyer' ? (
          <>
            <div style={m.field}>
              <label style={m.label}>Credits to purchase (1 credit = 1 ton CO₂)</label>
              <div style={m.stepper}>
                <button style={m.stepBtn} onClick={() => adj(-10)}>−</button>
                <input type="number" style={m.stepInp} value={credits} min={1} max={available}
                  onChange={e => setCredits(Math.max(1, Math.min(available, parseInt(e.target.value) || 1)))} />
                <button style={m.stepBtn} onClick={() => adj(10)}>+</button>
              </div>
            </div>

            <div style={m.summary}>
              {[['Price per credit', fmt(price)], ['CO₂ offset', `${credits} tons`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.85rem' }}>
                  <span style={{ color: '#6b7280' }}>{l}</span>
                  <span style={{ fontFamily: 'monospace' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: '1.3rem', color: '#2E7D32' }}>{fmt(total)}</span>
              </div>
            </div>

            <button style={{ ...m.btn, opacity: buying ? .6 : 1 }} disabled={buying} onClick={handleBuy}>
              {buying ? '⏳ Processing…' : `🌿 Buy ${credits} Credits — ${fmt(total)}`}
            </button>
          </>
        ) : !user ? (
          <button style={m.btn} onClick={() => navigate('/login')}>🔐 Log in to Purchase</button>
        ) : (
          <div style={m.info}>ℹ️ Only buyer accounts can purchase credits.</div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onSelect }) {
  const available = project.availableCredits ?? 0;
  const price     = project.pricePerCredit   ?? 0;
  const sold      = (project.totalCredits ?? 0) - available;

  return (
    <div style={c.card} onClick={() => onSelect(project)}>
      <div style={{ height: 150, background: CARD_GRADIENTS[project.impactType] || '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 50%,rgba(255,255,255,.12) 0%,transparent 60%)' }} />
        <span style={{ position: 'relative', zIndex: 1 }}>{project.emoji || '🌿'}</span>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: '.65rem', fontFamily: 'monospace', letterSpacing: '.06em', border: '1px solid rgba(255,255,255,.3)' }}>✓ VERIFIED</span>
        </div>
      </div>
      <div style={c.body}>
        <div style={{ marginBottom: 9 }}><TypeBadge type={project.impactType} /></div>
        <div style={c.cardTitle}>{project.title}</div>
        <div style={c.cardLoc}>📍 {project.location}</div>
        <div style={c.cardDesc}>{project.description?.slice(0, 85)}…</div>
        <ProgressBar sold={sold} total={project.totalCredits ?? 0} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
          <div>
            <div style={c.price}>{fmt(price)}</div>
            <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>per credit · 1 ton CO₂</div>
          </div>
          <button style={c.buyBtn} onClick={e => { e.stopPropagation(); onSelect(project); }}>Buy Credits</button>
        </div>
      </div>
    </div>
  );
}

// ── Navbar for public marketplace ──────────────────────────
function MarketNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashMap  = { buyer: '/dashboard', seller: '/seller', admin: '/admin' };
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2E7D32,#4caf7d)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌱</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1rem', color: '#1c2526' }}>CarbonMkt</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <>
              <span style={{ fontSize: '.85rem', color: '#6b7280', alignSelf: 'center' }}>Hi, {user.name.split(' ')[0]}</span>
              <button style={nb.btn} onClick={() => navigate(dashMap[user.role] || '/')}>Dashboard →</button>
            </>
          ) : (
            <>
              <button style={nb.outBtn} onClick={() => navigate('/login')}>Log In</button>
              <button style={nb.btn} onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function MarketplacePage() {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const { projects, loading, error, refetch } = useProjects({ status: 'verified', limit: 50 });

  const visible = projects.filter(p => {
    const matchType = filter === 'all' || p.impactType === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || p.impactType?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const types = [...new Set(projects.map(p => p.impactType))];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <MarketNav />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2E7D32 60%,#1565c0)', padding: '44px 24px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.9)', borderRadius: 99, padding: '4px 12px', fontSize: '.72rem', fontFamily: 'monospace', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>🌍 Carbon Marketplace</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 10 }}>Browse Verified Carbon Projects</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1rem', maxWidth: 500, marginBottom: 22 }}>Each credit = 1 verified tonne of CO₂ removed or avoided.</p>
          {/* Search */}
          <div style={{ maxWidth: 440, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
            <input style={{ width: '100%', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 10, padding: '11px 14px 11px 40px', fontSize: '.9rem', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
              placeholder="Search projects, locations…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <span style={{ fontSize: '.8rem', color: '#6b7280', fontWeight: 600, marginRight: 4 }}>Filter:</span>
          {['all', ...types].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ border: `1.5px solid ${filter === t ? '#2E7D32' : '#e5e7eb'}`, background: filter === t ? '#2E7D32' : '#fff', color: filter === t ? '#fff' : '#374151', borderRadius: 8, padding: '6px 14px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}>
              {t === 'all' ? `All (${projects.length})` : t}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🌿</div>
            <p style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>Loading projects…</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', color: '#dc2626', fontSize: '.9rem' }}>
            ❌ {error} — <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p style={{ fontSize: '.82rem', color: '#9ca3af', marginBottom: 18, fontFamily: 'monospace' }}>
              Showing {visible.length} of {projects.length} verified projects
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {visible.map(p => <ProjectCard key={p._id} project={p} onSelect={setSelected} />)}
            </div>
            {visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
                <p style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>No projects match your search.</p>
                <button onClick={() => { setSearch(''); setFilter('all'); }} style={{ marginTop: 12, background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '.82rem', color: '#374151', fontFamily: 'inherit' }}>Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <BuyModal project={selected} onClose={() => setSelected(null)} onSuccess={refetch} />}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────
const c = {
  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all .22s ease' },
  body:      { padding: '18px 20px' },
  cardTitle: { fontFamily: "'Playfair Display',serif", fontSize: '1rem', fontWeight: 700, marginBottom: 4, color: '#1c2526' },
  cardLoc:   { fontSize: '.78rem', color: '#9ca3af', marginBottom: 10, fontFamily: 'monospace' },
  cardDesc:  { fontSize: '.82rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 14 },
  price:     { fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 900, color: '#2E7D32' },
  buyBtn:    { background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
};
const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal:   { background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.15)' },
  badge:   { fontFamily: 'monospace', fontSize: '.68rem', letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 9px', borderRadius: 99 },
  title:   { fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 800, marginBottom: 4, color: '#1c2526' },
  loc:     { fontSize: '.8rem', color: '#9ca3af', fontFamily: 'monospace', marginBottom: 10 },
  desc:    { fontSize: '.875rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 18 },
  field:   { marginBottom: 16 },
  label:   { display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#374151', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 },
  stepper: { display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 9, overflow: 'hidden' },
  stepBtn: { background: '#f9fafb', border: 'none', padding: '12px 18px', cursor: 'pointer', fontSize: '1.2rem', color: '#2E7D32', fontFamily: 'inherit' },
  stepInp: { flex: 1, border: 'none', textAlign: 'center', fontFamily: 'monospace', fontSize: '1rem', padding: '12px 8px', outline: 'none', color: '#1c2526' },
  summary: { background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: 16, marginBottom: 18 },
  btn:     { width: '100%', background: 'linear-gradient(135deg,#2E7D32,#4caf7d)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  info:    { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '12px 16px', color: '#1e40af', fontSize: '.87rem' },
};
const nb = {
  btn:    { background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  outBtn: { background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '8px 16px', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};