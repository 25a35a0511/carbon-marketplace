import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV = {
  buyer: [
    { to: '/marketplace',    icon: '🌍', label: 'Marketplace'  },
    { to: '/dashboard',      icon: '📊', label: 'Dashboard'    },
    { to: '/portfolio',      icon: '🌿', label: 'Portfolio'    },
    { to: '/transactions',   icon: '📋', label: 'Transactions' },
  ],
  seller: [
    { to: '/seller',          icon: '📈', label: 'Dashboard'   },
    { to: '/seller/projects', icon: '🌿', label: 'Projects'    },
    { to: '/seller/create',   icon: '➕', label: 'New'         },
    { to: '/seller/sales',    icon: '💰', label: 'Sales'       },
  ],
  admin: [
    { to: '/admin',               icon: '📈', label: 'Overview'  },
    { to: '/admin/projects',      icon: '✅', label: 'Verify'    },
    { to: '/admin/users',         icon: '👥', label: 'Users'     },
    { to: '/admin/transactions',  icon: '🔄', label: 'Txns'      },
    { to: '/admin/messages',      icon: '📬', label: 'Messages'  },
  ],
};

const ROLE_COLOR = { buyer: '#0288D1', seller: '#2E7D32', admin: '#d97706' };

/* ── Breakpoint hook ─────────────────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const toast            = useToast();
  const navigate         = useNavigate();
  const isMobile         = useIsMobile();

  const navItems = NAV[user?.role] || [];
  const color    = ROLE_COLOR[user?.role] || '#2E7D32';

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  /* nav link style — reused for sidebar and bottom bar */
  const sideLink = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8, marginBottom: 2,
    fontWeight: 600, fontSize: '.82rem', letterSpacing: '.02em',
    textTransform: 'uppercase', textDecoration: 'none', transition: 'all .18s',
    background: isActive ? 'rgba(76,175,125,.22)' : 'transparent',
    color:      isActive ? '#6ecf96' : 'rgba(255,255,255,.55)',
  });

  return (
    <>
      {/* ── Global CSS ──────────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        /* ── Bottom tab bar ── */
        .db-bottom-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: #14451a;
          border-top: 1px solid rgba(255,255,255,.1);
          display: flex; align-items: stretch; height: 64px;
          box-shadow: 0 -6px 24px rgba(0,0,0,.28);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .db-tab {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          text-decoration: none; border: none; background: transparent;
          transition: background .18s, color .18s;
          color: rgba(255,255,255,.45);
          border-top: 2.5px solid transparent;
          padding: 6px 2px 4px; min-width: 0; cursor: pointer;
          font-family: inherit;
        }
        .db-tab.active,
        .db-tab[data-active="true"] {
          color: #6ecf96 !important;
          border-top-color: #6ecf96 !important;
          background: rgba(76,175,125,.12) !important;
        }
        .db-tab:active { background: rgba(255,255,255,.06) !important; }
        .db-tab-icon { font-size: 1.3rem; line-height: 1; }
        .db-tab-label {
          font-size: .52rem; font-weight: 700; letter-spacing: .07em;
          text-transform: uppercase; font-family: monospace; line-height: 1;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 100%; padding: 0 1px;
        }
        .db-tab-logout { color: rgba(239,68,68,.65) !important; }
        .db-tab-logout:active { background: rgba(239,68,68,.08) !important; }

        /* ── Layout helpers ── */
        .db-wrap   { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; background: #f9fafb; }
        .db-main   { flex: 1; display: flex; flex-direction: column; }
        .db-header {
          background: #fff; border-bottom: 1px solid #e5e7eb;
          height: 56px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 20px;
          position: sticky; top: 0; z-index: 30;
        }
        .db-content { flex: 1; padding: 24px 20px; max-width: 1200px; width: 100%; margin: 0 auto; }

        @media (min-width: 1024px) {
          .db-main    { margin-left: 240px; }
          .db-header  { padding: 0 28px; height: 60px; }
          .db-content { padding: 28px 28px; }
        }
      `}</style>

      <div className="db-wrap">

        {/* ══════════════════════════════════════
            DESKTOP SIDEBAR  (≥1024px)
        ══════════════════════════════════════ */}
        {!isMobile && (
          <aside style={{
            width: 240, background: '#14451a',
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
            borderRight: '1px solid rgba(255,255,255,.08)',
          }}>
            {/* Logo + user */}
            <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg,#4caf7d,#6ecf96)',
                  borderRadius: 9, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.1rem',
                }}>🌱</div>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  CarbonMkt
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 9, padding: '10px 12px' }}>
                <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#fff', marginBottom: 4 }}>{user?.name}</div>
                <span style={{
                  fontFamily: 'monospace', fontSize: '.65rem', letterSpacing: '.08em',
                  textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99,
                  border: `1px solid ${color}44`, background: `${color}22`, color,
                }}>{user?.role}</span>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
              {navItems.map(({ to, icon, label }) => (
                <NavLink key={to} to={to}
                  end={to === '/dashboard' || to === '/seller' || to === '/admin'}
                  style={({ isActive }) => sideLink(isActive)}>
                  <span style={{ width: 18, textAlign: 'center' }}>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
              <NavLink to="/marketplace"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderRadius:8, color:'rgba(255,255,255,.45)', fontSize:'.82rem',
                  fontWeight:600, textTransform:'uppercase', textDecoration:'none', marginBottom:2 }}>
                <span>🌍</span> Marketplace
              </NavLink>
              <button onClick={handleLogout} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', borderRadius:8, width:'100%',
                border:'none', background:'transparent', color:'rgba(239,68,68,.7)',
                cursor:'pointer', fontSize:'.82rem', fontWeight:600,
                textTransform:'uppercase', textAlign:'left', fontFamily:'inherit',
              }}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          </aside>
        )}

        {/* ══════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════ */}
        <div className="db-main">
          {/* Top header */}
          <header className="db-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isMobile && (
                <div style={{
                  width: 30, height: 30,
                  background: 'linear-gradient(135deg,#2E7D32,#4caf7d)',
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '.9rem', flexShrink: 0,
                }}>🌱</div>
              )}
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: isMobile ? '.95rem' : '1.1rem', color: '#1c2526' }}>
                  {isMobile ? 'CarbonMkt' : 'Carbon Marketplace'}
                </div>
                <div style={{ fontFamily:'monospace', fontSize:'.6rem', color:'#9ca3af', letterSpacing:'.06em', textTransform:'uppercase' }}>
                  {user?.role} portal
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {!isMobile && (
                <NavLink to="/marketplace" style={{
                  background:'none', border:'1.5px solid #e5e7eb', borderRadius:8,
                  padding:'6px 14px', fontSize:'.8rem', fontWeight:600,
                  color:'#374151', textDecoration:'none',
                }}>🌍 Marketplace</NavLink>
              )}
              {!isMobile && (
                <div style={{
                  background: `${color}14`, border: `1px solid ${color}33`,
                  borderRadius: 99, padding: '4px 12px',
                  fontSize: '.72rem', fontWeight: 700, color,
                  fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.06em',
                }}>
                  {user?.name?.split(' ')[0]}
                </div>
              )}
              {!isMobile && (
                <button onClick={handleLogout} style={{
                  background:'#2E7D32', border:'none', borderRadius:8,
                  padding:'6px 14px', fontSize:'.8rem', fontWeight:600,
                  color:'#fff', cursor:'pointer',
                }}>Sign Out</button>
              )}
              {isMobile && (
                <div style={{
                  background: `${color}14`, border: `1px solid ${color}33`,
                  borderRadius: 99, padding: '4px 10px',
                  fontSize: '.7rem', fontWeight: 700, color,
                  fontFamily: 'monospace', textTransform: 'uppercase',
                }}>
                  {user?.name?.split(' ')[0]}
                </div>
              )}
            </div>
          </header>

          {/* Page content — extra bottom padding so content never hides behind tab bar */}
          <main className="db-content" style={{ paddingBottom: isMobile ? '80px' : undefined }}>
            {children}
          </main>
        </div>

        {/* ══════════════════════════════════════
            MOBILE / TABLET BOTTOM TAB BAR  (<1024px)
        ══════════════════════════════════════ */}
        {isMobile && (
          <nav className="db-bottom-bar" role="tablist" aria-label="Main navigation">
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard' || to === '/seller' || to === '/admin'}
                className={({ isActive }) => `db-tab${isActive ? ' active' : ''}`}
                role="tab"
              >
                <span className="db-tab-icon">{icon}</span>
                <span className="db-tab-label">{label}</span>
              </NavLink>
            ))}

            {/* Sign-out tab */}
            <button
              className="db-tab db-tab-logout"
              onClick={handleLogout}
              role="tab"
              aria-label="Sign out"
            >
              <span className="db-tab-icon">🚪</span>
              <span className="db-tab-label">Out</span>
            </button>
          </nav>
        )}

      </div>
    </>
  );
}