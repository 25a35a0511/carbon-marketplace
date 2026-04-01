import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLE_REDIRECT = { buyer: '/dashboard', seller: '/seller', admin: '/admin' };

export default function RegisterPage() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { register } = useAuth();
  const toast         = useToast();
  const navigate      = useNavigate();

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}! 🌱`);
      navigate(ROLE_REDIRECT[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page:  { minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(155deg,#f0faf4,#fafaf7 60%,#e3f2fd)',padding:20 },
    card:  { background:'#fff',borderRadius:20,padding:32,width:'100%',maxWidth:420,boxShadow:'0 8px 40px rgba(0,0,0,.08)',border:'1px solid #e5e7eb' },
    label: { display:'block',fontSize:'.75rem',fontWeight:700,color:'#374151',letterSpacing:'.05em',textTransform:'uppercase',marginBottom:6,marginTop:16 },
    input: { width:'100%',border:'1.5px solid #e5e7eb',borderRadius:9,padding:'11px 14px',fontSize:'.9rem',color:'#1c2526',outline:'none',boxSizing:'border-box',fontFamily:'inherit' },
    btn:   { width:'100%',background:'linear-gradient(135deg,#2E7D32,#4caf7d)',color:'#fff',border:'none',borderRadius:10,padding:'12px',fontSize:'.95rem',fontWeight:700,cursor:'pointer',marginTop:20 },
    err:   { background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',color:'#dc2626',fontSize:'.85rem',marginBottom:16 },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign:'center',marginBottom:24 }}>
          <div style={{ width:52,height:52,background:'linear-gradient(135deg,#2E7D32,#4caf7d)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',margin:'0 auto 12px',boxShadow:'0 6px 20px rgba(46,125,50,.3)' }}>🌱</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:800,color:'#1c2526',marginBottom:4 }}>Create Account</h1>
          <p style={{ fontSize:'.85rem',color:'#6b7280' }}>Join the Carbon Marketplace</p>
        </div>

        {error && <div style={s.err}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} placeholder="Jane Smith" value={form.name} onChange={set('name')} required />

          <label style={s.label}>Email Address</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} minLength={6} required />

          <label style={s.label}>Account Type</label>
          <select style={s.input} value={form.role} onChange={set('role')}>
            <option value="buyer">Buyer — Purchase carbon credits</option>
            <option value="seller">Seller — List carbon projects</option>
          </select>

          <button type="submit" style={{ ...s.btn, opacity: loading ? .6 : 1 }} disabled={loading}>
            {loading ? '⏳ Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign:'center',fontSize:'.85rem',color:'#6b7280',marginTop:20 }}>
          Already have an account? <Link to="/login" style={{ color:'#2E7D32',fontWeight:700,textDecoration:'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
