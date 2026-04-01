import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../common';

const NAV_ITEMS = {
  buyer: [
    { to: '/marketplace',  icon: '🌍', label: 'Marketplace' },
    { to: '/portfolio',    icon: '📊', label: 'Portfolio' },
    { to: '/transactions', icon: '📋', label: 'Transactions' },
  ],
  seller: [
    { to: '/seller/projects',icon: '🌿', label: 'My Projects' },
    { to: '/seller/create',  icon: '➕', label: 'New Project' },
    { to: '/seller/sales',   icon: '💰', label: 'Sales' },
  ],
  admin: [
    { to: '/admin',              icon: '📈', label: 'Overview' },
    { to: '/admin/projects',     icon: '✅', label: 'Verify Projects' },
    { to: '/admin/users',        icon: '👥', label: 'Users' },
    { to: '/admin/transactions', icon: '🔄', label: 'Transactions' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    addToast('Signed out successfully', 'success');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(107,221,138,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--leaf), var(--lime))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
          }}>🌱</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.1 }}>CARBON</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: 'var(--lime)', letterSpacing: '0.15em' }}>MARKETPLACE</div>
          </div>
        </div>
        <div style={{ background: 'rgba(107,221,138,0.06)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{user?.name}</div>
          <Badge variant={user?.role}>{user?.role}</Badge>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(107,221,138,0.1)' }}>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ color: 'var(--danger)', width: '100%' }}
        >
          <span className="icon">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
