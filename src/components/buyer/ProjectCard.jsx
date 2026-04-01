import React from 'react';
import { Badge, ProgressBar } from '../common';
import { formatCurrency, impactGradient } from '../../utils/formatters';

const ProjectCard = ({ project, onClick }) => {
  const soldPct = project.total_credits
    ? Math.round(((project.sold_credits || 0) / project.total_credits) * 100)
    : 0;

  return (
    <div className="project-card" onClick={() => onClick && onClick(project)}>
      {/* Header image area */}
      <div
        className="project-card-img"
        style={{ background: impactGradient(project.impact_type) }}
      >
        {project.emoji || '🌿'}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          {project.verification_status === 'verified' && (
            <Badge variant="verified">✓ Verified</Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="project-card-body">
        <div style={{ marginBottom: 8 }}>
          <span
            className="badge"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--ash)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.65rem',
            }}
          >
            {project.impact_type}
          </span>
        </div>

        <h3 className="project-title">{project.project_name}</h3>
        <p className="project-meta" style={{ marginBottom: 8 }}>📍 {project.location}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--ash)', lineHeight: 1.5, marginBottom: 14 }}>
          {project.description?.substring(0, 90)}…
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div className="project-price">{formatCurrency(project.price_per_credit)}</div>
            <div className="project-credits">per credit · 1 ton CO₂</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--lime)', fontWeight: 500 }}>
              {(project.available_credits || 0).toLocaleString()}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--ash)' }}>credits left</div>
          </div>
        </div>

        <ProgressBar value={project.sold_credits || 0} max={project.total_credits || 1} />
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--ash)', marginTop: 4, textAlign: 'right' }}>
          {soldPct}% sold
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
