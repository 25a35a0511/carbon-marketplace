import React, { useState } from 'react';
import { Badge, Button, Divider, Alert } from '../common';
import { NumberStepper } from '../common/FormFields';
import { formatCurrency, impactGradient } from '../../utils/formatters';
import { creditService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const BuyCreditsModal = ({ project, onClose, onSuccess }) => {
  const [credits, setCredits]   = useState(10);
  const [loading, setLoading]   = useState(false);
  const { addToast } = useToast();

  const total = credits * project.price_per_credit;

  const handleBuy = async () => {
    setLoading(true);
    try {
      await creditService.buy({ project_id: project._id, credits });
      addToast(`✅ Purchased ${credits} credits from ${project.project_name}!`, 'success');
      onSuccess && onSuccess(credits);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const soldPct = Math.round(((project.sold_credits || 0) / project.total_credits) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          height: 120, borderRadius: '8px 8px 0 0',
          margin: '-32px -32px 24px',
          background: impactGradient(project.impact_type),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', position: 'relative',
        }}>
          {project.emoji || '🌿'}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.35)', border: 'none',
            color: 'white', borderRadius: 6, padding: '4px 10px',
            cursor: 'pointer', fontSize: '1rem',
          }}>✕</button>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Badge variant="verified">✓ verified</Badge>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--ash)', border: '1px solid rgba(255,255,255,0.1)' }}>
            📍 {project.location}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--ash)', border: '1px solid rgba(255,255,255,0.1)' }}>
            🏷 {project.impact_type}
          </span>
        </div>

        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.35rem', fontWeight: 800, marginBottom: 10 }}>
          {project.project_name}
        </h2>
        <p style={{ color: 'var(--ash)', fontSize: '0.87rem', lineHeight: 1.7, marginBottom: 18 }}>
          {project.description}
        </p>

        {/* Credits availability */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Credits Available</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--lime)' }}>{(project.available_credits || 0).toLocaleString()}</span>
              <span style={{ color: 'var(--ash)' }}> / {(project.total_credits || 0).toLocaleString()}</span>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${soldPct}%` }} />
          </div>
          <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--ash)', marginTop: 4 }}>
            {soldPct}% sold
          </div>
        </div>

        <Divider />

        {/* Purchase form */}
        <NumberStepper
          label="Number of Credits (1 credit = 1 ton CO₂)"
          value={credits}
          onChange={setCredits}
          min={1}
          max={project.available_credits}
          step={10}
        />

        {/* Price summary */}
        <div style={{
          background: 'rgba(107,221,138,0.06)',
          border: '1px solid rgba(107,221,138,0.15)',
          borderRadius: 8, padding: 16, marginBottom: 20,
        }}>
          {[
            { label: 'Price per credit',    value: formatCurrency(project.price_per_credit) },
            { label: 'CO₂ Offset',          value: `${credits} tons`, color: 'var(--lime)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: 'var(--ash)' }}>{label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: color || 'var(--white)' }}>{value}</span>
            </div>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(107,221,138,0.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--lime)' }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <Button variant="primary" fullWidth loading={loading} onClick={handleBuy}>
          🌿 Buy {credits} Credits — {formatCurrency(total)}
        </Button>
      </div>
    </div>
  );
};

export default BuyCreditsModal;
