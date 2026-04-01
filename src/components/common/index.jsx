import React from 'react';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  onClick, type = 'button', className = '', style = {},
}) => {
  const sizes   = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  const classes = ['btn', `btn-${variant}`, sizes[size], fullWidth ? 'btn-full' : '', className]
    .filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...(fullWidth ? { width: '100%', justifyContent: 'center' } : {}), ...style }}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', style = {} }) => {
  const variantMap = {
    verified: 'badge-verified',
    pending:  'badge-pending',
    rejected: 'badge-rejected',
    buyer:    'badge-buyer',
    seller:   'badge-seller',
    admin:    'badge-admin',
    default:  '',
  };
  return (
    <span className={`badge ${variantMap[variant] || ''}`} style={style}>
      {children}
    </span>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <div
    className="spinner"
    style={{ width: size, height: size, flexShrink: 0 }}
  />
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description = '', action = null }) => (
  <div className="empty-state">
    <div className="icon">{icon}</div>
    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--white)' }}>
      {title}
    </p>
    {description && <p style={{ marginTop: 6, maxWidth: 320, margin: '0 auto' }}>{description}</p>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert = ({ children, variant = 'info' }) => (
  <div className={`alert alert-${variant}`}>
    {variant === 'warning' && '⚠️ '}
    {variant === 'info'    && 'ℹ️ '}
    {variant === 'success' && '✅ '}
    {children}
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, className = '', onClick, hover = false }) => (
  <div
    className={`card ${hover ? 'card-hover' : ''} ${className}`}
    style={style}
    onClick={onClick}
  >
    {children}
  </div>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, value, label, sub, color }) => (
  <div className="stat-card">
    {icon && <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>}
    <div className="stat-value" style={color ? { color } : {}}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--ash)', marginTop: 6 }}>{sub}</div>}
  </div>
);

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, showLabel = false }) => {
  const pct = Math.min(100, Math.round((value / max) * 100)) || 0;
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--lime)' }}>
            {pct}%
          </span>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── SectionLabel ──────────────────────────────────────────────────────────────
export const SectionLabel = ({ children }) => (
  <div className="section-label">{children}</div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style = {} }) => <hr className="divider" style={style} />;

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
