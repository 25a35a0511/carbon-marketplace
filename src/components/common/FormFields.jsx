import React from 'react';

// ── TextInput ─────────────────────────────────────────────────────────────────
export const TextInput = ({
  label, name, type = 'text', value, onChange, placeholder,
  error, required = false, disabled = false, style = {},
}) => (
  <div className="form-group" style={style}>
    {label && (
      <label className="label" htmlFor={name}>
        {label}{required && <span style={{ color: 'var(--lime)' }}> *</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      className="input-field"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
    {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{error}</p>}
  </div>
);

// ── TextArea ──────────────────────────────────────────────────────────────────
export const TextArea = ({ label, name, value, onChange, placeholder, rows = 4, required = false, error }) => (
  <div className="form-group">
    {label && (
      <label className="label" htmlFor={name}>
        {label}{required && <span style={{ color: 'var(--lime)' }}> *</span>}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      className="input-field"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
    {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{error}</p>}
  </div>
);

// ── SelectInput ───────────────────────────────────────────────────────────────
export const SelectInput = ({ label, name, value, onChange, options, required = false, error }) => (
  <div className="form-group">
    {label && (
      <label className="label" htmlFor={name}>
        {label}{required && <span style={{ color: 'var(--lime)' }}> *</span>}
      </label>
    )}
    <select
      id={name}
      name={name}
      className="input-field"
      value={value}
      onChange={onChange}
    >
      {options.map((opt) =>
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
    {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{error}</p>}
  </div>
);

// ── NumberStepper ─────────────────────────────────────────────────────────────
export const NumberStepper = ({ label, value, onChange, min = 1, max, step = 10 }) => (
  <div className="form-group">
    {label && <label className="label">{label}</label>}
    <div className="number-input-wrap">
      <button type="button" className="number-step"
        onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max ?? Infinity, v)));
        }}
      />
      <button type="button" className="number-step"
        onClick={() => onChange(Math.min(max ?? Infinity, value + step))}>+</button>
    </div>
  </div>
);
