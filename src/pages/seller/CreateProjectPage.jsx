import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const IMPACT_TYPES = [
  'Forest Conservation','Renewable Energy','Blue Carbon','Clean Cooking',
  'Peatland Conservation','Biodiversity Conservation','Soil Carbon','Methane Capture','Other',
];
const EMOJIS = ['🌿','🌳','🌊','💨','☀️','🏔️','🦧','🌱','♻️','🔋'];

export default function CreateProjectPage() {
  const [form, setForm] = useState({
    title:'', description:'', location:'', impactType:'Forest Conservation',
    totalCredits:'', pricePerCredit:'', emoji:'🌿',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const toast    = useToast();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 5)         e.title       = 'Title must be at least 5 characters';
    if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters';
    if (!form.location)                                e.location    = 'Location is required';
    if (!form.totalCredits || form.totalCredits < 1)  e.totalCredits= 'Must be at least 1';
    if (!form.pricePerCredit || form.pricePerCredit <= 0) e.pricePerCredit = 'Must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post('/seller/projects', {
        ...form,
        totalCredits:   parseInt(form.totalCredits),
        pricePerCredit: parseFloat(form.pricePerCredit),
      });
      toast.success('Project submitted for verification! ✅');
      navigate('/seller/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) => ({ ...s.input, ...(err ? { borderColor:'#f87171' } : {}) });

  return (
    <DashboardLayout>
      <h2 style={s.title}>Create New Project</h2>
      <p style={s.sub}>Submit a carbon offset project for admin verification.</p>

      <div style={{ maxWidth:640 }}>
        <div style={s.card}>
          <div style={s.info}>ℹ️ Projects are reviewed by admins before appearing in the marketplace. Usually takes 1–2 business days.</div>

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Project Title *</label>
              <input style={inp(errors.title)} placeholder="e.g., Congo Basin Forest Reserve" value={form.title} onChange={set('title')} />
              {errors.title && <span style={s.err}>{errors.title}</span>}
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              <div style={s.field}>
                <label style={s.label}>Location *</label>
                <input style={inp(errors.location)} placeholder="Country / Region" value={form.location} onChange={set('location')} />
                {errors.location && <span style={s.err}>{errors.location}</span>}
              </div>
              <div style={s.field}>
                <label style={s.label}>Impact Type *</label>
                <select style={s.input} value={form.impactType} onChange={set('impactType')}>
                  {IMPACT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Description * (min 20 chars)</label>
              <textarea style={{ ...inp(errors.description),resize:'vertical',minHeight:100 }}
                placeholder="Describe methodology, location, communities impacted, and verification approach…"
                value={form.description} onChange={set('description')} />
              {errors.description && <span style={s.err}>{errors.description}</span>}
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              <div style={s.field}>
                <label style={s.label}>Total Credits *</label>
                <input style={inp(errors.totalCredits)} type="number" min={1} placeholder="10000"
                  value={form.totalCredits} onChange={set('totalCredits')} />
                {errors.totalCredits && <span style={s.err}>{errors.totalCredits}</span>}
              </div>
              <div style={s.field}>
                <label style={s.label}>Price per Credit (Rupees) *</label>
                <input style={inp(errors.pricePerCredit)} type="number" step="0.01" min={0.01} placeholder="500"
                  value={form.pricePerCredit} onChange={set('pricePerCredit')} />
                {errors.pricePerCredit && <span style={s.err}>{errors.pricePerCredit}</span>}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Project Emoji</label>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {EMOJIS.map(e => (
                  <button type="button" key={e} onClick={() => setForm({...form,emoji:e})}
                    style={{ background:form.emoji===e?'#f0faf4':'rgba(0,0,0,.03)', border:`${form.emoji===e?'2':'1'}px solid ${form.emoji===e?'#2E7D32':'#e5e7eb'}`, borderRadius:8,padding:'8px 11px',cursor:'pointer',fontSize:'1.2rem',transition:'all .2s' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex',gap:12,marginTop:8 }}>
              <button type="submit" style={{ ...s.btn, opacity:saving?.6:1 }} disabled={saving}>
                {saving ? '⏳ Submitting…' : 'Submit for Verification →'}
              </button>
              <button type="button" style={s.cancelBtn} onClick={() => navigate('/seller/projects')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

const s = {
  title:     { fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,marginBottom:4,color:'#1c2526' },
  sub:       { color:'#6b7280',fontSize:'.9rem',marginBottom:24 },
  card:      { background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:28 },
  info:      { background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'10px 14px',color:'#1e40af',fontSize:'.85rem',marginBottom:20 },
  field:     { marginBottom:18 },
  label:     { display:'block',fontSize:'.75rem',fontWeight:700,color:'#374151',letterSpacing:'.05em',textTransform:'uppercase',marginBottom:6 },
  input:     { width:'100%',border:'1.5px solid #e5e7eb',borderRadius:9,padding:'10px 14px',fontSize:'.9rem',color:'#1c2526',outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s' },
  err:       { display:'block',color:'#dc2626',fontSize:'.75rem',marginTop:4 },
  btn:       { background:'#2E7D32',color:'#fff',border:'none',borderRadius:10,padding:'11px 22px',fontSize:'.9rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit' },
  cancelBtn: { background:'none',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'11px 22px',fontSize:'.9rem',fontWeight:600,cursor:'pointer',color:'#374151',fontFamily:'inherit' },
};
