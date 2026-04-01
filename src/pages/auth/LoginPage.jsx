import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEMOS = [
  { email: 'buyer@demo.com',   role: 'Buyer',  color: '#0288D1' },
  { email: 'seller@demo.com',  role: 'Seller', color: '#2E7D32' },
  { email: 'admin@demo.com',   role: 'Admin',  color: '#d97706' },
];

const ROLE_REDIRECT = { buyer: '/dashboard', seller: '/seller', admin: '/admin' };

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login } = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();
  const location   = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🌿`);
      navigate(from || ROLE_REDIRECT[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🌱</div>
          <h1 style={styles.logoText}>Carbon Marketplace</h1>
          <p style={styles.subtext}>Sign in to your account</p>
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />

          <button type="submit" style={{ ...styles.btn, opacity: loading ? .6 : 1 }} disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={styles.divider} />

        {/* Demo quick-fill */}
        

        <p style={styles.switchText}>
          No account? <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(155deg,#f0faf4 0%,#fafaf7 60%,#e3f2fd 100%)', padding: 20 },
  card:     { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: { width: 52, height: 52, background: 'linear-gradient(135deg,#2E7D32,#4caf7d)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(46,125,50,.3)' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 800, color: '#1c2526', marginBottom: 4 },
  subtext:  { fontSize: '.85rem', color: '#6b7280' },
  label:    { display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#374151', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6, marginTop: 16 },
  input:    { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '11px 14px', fontSize: '.9rem', color: '#1c2526', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn:      { width: '100%', background: 'linear-gradient(135deg,#2E7D32,#4caf7d)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', marginTop: 20, letterSpacing: '.02em' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '.85rem', marginBottom: 16 },
  divider:  { borderTop: '1px solid #f3f4f6', margin: '20px 0' },
  demoLabel:{ fontSize: '.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 },
  demoBtn:  { border: '1.5px solid', borderRadius: 8, padding: '6px 14px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  switchText:{ textAlign: 'center', fontSize: '.85rem', color: '#6b7280', marginTop: 20 },
  link:     { color: '#2E7D32', fontWeight: 700, textDecoration: 'none' },
};
