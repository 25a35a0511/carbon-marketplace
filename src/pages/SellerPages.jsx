import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, StatCard, SectionLabel, Spinner, EmptyState, Button } from '../components/common';
import ProjectForm from '../components/seller/ProjectForm';
import { sellerService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

// ── My Projects ───────────────────────────────────────────────────────────────
export const SellerProjectsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    sellerService.getProjects()
      .then(({ data }) => setProjects(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await sellerService.deleteProject(id);
      addToast('Project deleted', 'success');
      fetchProjects();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const statusBadge = { verified: 'verified', pending: 'pending', rejected: 'rejected' };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  return (
    <div className="fade-in">
      <PageHeader title="My Projects" subtitle={`${projects.length} total projects`}
        action={<Button variant="primary" onClick={() => navigate('/seller/create')}>➕ New Project</Button>} />

      {projects.length === 0 ? (
        <EmptyState icon="🌿" title="No projects yet"
          description="Create your first carbon offset project."
          action={<Button variant="primary" onClick={() => navigate('/seller/create')}>Create Project</Button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map((p) => (
            <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <Badge variant={statusBadge[p.verification_status]}>{p.verification_status}</Badge>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--ash)', border: '1px solid rgba(255,255,255,0.08)' }}>{p.impact_type}</span>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                  {p.emoji} {p.project_name}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
                  📍 {p.location} · {(p.available_credits || 0).toLocaleString()} credits · {formatCurrency(p.price_per_credit)}/credit
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Project ────────────────────────────────────────────────────────────
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      <PageHeader title="Create New Project" subtitle="Submit a carbon offset project for verification" />
      <ProjectForm onSuccess={() => navigate('/seller/projects')} />
    </div>
  );
};

// ── Sales Dashboard ───────────────────────────────────────────────────────────
export const SellerSalesPage = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getSales()
      .then(({ data: res }) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  const txns    = data?.transactions || [];
  const summary = data?.summary || {};

  return (
    <div className="fade-in">
      <PageHeader title="Sales Dashboard" subtitle="Revenue and transaction overview" />

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <StatCard icon="💰" value={formatCurrency(summary.total || 0)}       label="Total Revenue" />
        <StatCard icon="🌿" value={(summary.credits || 0).toLocaleString()}  label="Credits Sold" />
        <StatCard icon="📋" value={txns.length}                              label="Transactions" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Buyer</th><th>Project</th><th>Credits</th><th>Revenue</th><th>Date</th></tr></thead>
            <tbody>
              {txns.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                  <EmptyState icon="💰" title="No sales yet" />
                </td></tr>
              ) : txns.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 500 }}>{t.buyer?.name}<br />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>{t.buyer?.email}</span></td>
                  <td style={{ fontSize: '0.87rem' }}>{t.project?.project_name}</td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--lime)' }}>{t.credits_purchased}</span></td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{formatCurrency(t.total_price)}</span></td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--ash)' }}>{formatDate(t.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
