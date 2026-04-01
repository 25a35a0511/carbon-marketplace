import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Alert } from '../components/common';
import { TextInput, SelectInput } from '../components/common/FormFields';

const REDIRECT_MAP = { buyer: '/marketplace', seller: '/seller/projects', admin: '/admin' };

// ── Login ─────────────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(form);
      addToast(`Welcome back, ${user.name}! 🌿`, 'success');
      navigate(REDIRECT_MAP[user.role] || '/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return <AuthWrapper title="SIGN IN">
    {error && <Alert variant="warning">{error}</Alert>}
    <TextInput label="Email Address" name="email" type="email" value={form.email}
      onChange={set('email')} placeholder="you@example.com" />
    <TextInput label="Password" name="password" type="password" value={form.password}
      onChange={set('password')} placeholder="••••••••" />
    <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>Sign In →</Button>
    <hr className="divider" />
    <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.85rem' }}>
      No account?{' '}
      <Link to="/register" style={{ color: 'var(--lime)', fontFamily: "'Syne', sans-serif", fontWeight: 600, textDecoration: 'none' }}>
        Register
      </Link>
    </p>
  </AuthWrapper>;
};

// ── Register ──────────────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const user = await register(form);
      addToast(`Account created! Welcome, ${user.name}!`, 'success');
      navigate(REDIRECT_MAP[user.role] || '/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return <AuthWrapper title="CREATE ACCOUNT">
    {error && <Alert variant="warning">{error}</Alert>}
    <TextInput label="Full Name" name="name" value={form.name}
      onChange={set('name')} placeholder="Jane Smith" required />
    <TextInput label="Email Address" name="email" type="email" value={form.email}
      onChange={set('email')} placeholder="you@example.com" required />
    <TextInput label="Password" name="password" type="password" value={form.password}
      onChange={set('password')} placeholder="Min. 6 characters" required />
    <SelectInput label="Account Type" name="role" value={form.role}
      onChange={set('role')}
      options={[
        { value: 'buyer',  label: 'Buyer — Purchase carbon credits' },
        { value: 'seller', label: 'Seller — List carbon projects' },
      ]} />
    <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>Create Account →</Button>
    <hr className="divider" />
    <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.85rem' }}>
      Have an account?{' '}
      <Link to="/login" style={{ color: 'var(--lime)', fontFamily: "'Syne', sans-serif", fontWeight: 600, textDecoration: 'none' }}>
        Sign In
      </Link>
    </p>
  </AuthWrapper>;
};

// ── Shared auth wrapper ───────────────────────────────────────────────────────
const AuthWrapper = ({ title, children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--forest) 0%, #061a0d 100%)',
    position: 'relative', overflow: 'hidden', padding: '40px 24px',
  }}>
    <div className="hero-bg" /><div className="hero-grid" />
    <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌱</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem' }}>CARBON MARKETPLACE</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--lime)', letterSpacing: '0.12em', marginTop: 4 }}>
          {title}
        </div>
      </div>
      <div className="card">{children}</div>
    </div>
  </div>
);
