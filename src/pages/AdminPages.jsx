import React, { useEffect, useState } from 'react';
import { PageHeader, StatCard, Badge, SectionLabel, Spinner, Button } from '../components/common';
import { adminService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

// ── Admin Overview ────────────────────────────────────────────────────────────
export const AdminOverviewPage = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getTransactions({ limit: 5 })])
      .then(([statsRes, txnRes]) => setData({ stats: statsRes.data.data, txns: txnRes.data.data.transactions }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  const userCounts    = data?.stats?.userCount || [];
  const projectCounts = data?.stats?.projectCounts || [];
  const txStats       = data?.stats?.txStats || {};
  const txns          = data?.txns || [];

  const countBy = (arr, field, val) => (arr.find((x) => x._id === val)?.count || 0);

  return (
    <div className="fade-in">
      <PageHeader title="Admin Overview" subtitle="Platform health and activity monitor" />

      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="👥" value={userCounts.reduce((s, u) => s + u.count, 0)} label="Total Users"      color="var(--info)" />
        <StatCard icon="🌿" value={projectCounts.reduce((s, p) => s + p.count, 0)} label="Total Projects" color="var(--lime)" />
        <StatCard icon="⏳" value={countBy(projectCounts, '_id', 'pending')}     label="Pending Review"  color="var(--warning)" />
        <StatCard icon="💰" value={formatCurrency(txStats.volume || 0)}          label="Total Volume"    color="var(--lime)" />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <SectionLabel>Recent Transactions</SectionLabel>
          <table className="data-table">
            <thead><tr><th>Buyer</th><th>Project</th><th>Amount</th></tr></thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontSize: '0.87rem' }}>{t.buyer?.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--ash)' }}>{t.snapshot?.project_name?.substring(0, 28)}…</td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--lime)', fontSize: '0.82rem' }}>{formatCurrency(t.total_price)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <SectionLabel>Project Status</SectionLabel>
          {['verified', 'pending', 'rejected'].map((s) => {
            const count = countBy(projectCounts, '_id', s);
            const total = projectCounts.reduce((a, p) => a + p.count, 0) || 1;
            const pct   = Math.round((count / total) * 100);
            const colors = { verified: 'var(--lime)', pending: 'var(--warning)', rejected: 'var(--danger)' };
            return (
              <div key={s} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.87rem' }}>{s}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: colors[s] }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div style={{ height: '100%', background: colors[s], borderRadius: 99, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Admin Projects ────────────────────────────────────────────────────────────
export const AdminProjectsPage = () => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetch = () => {
    setLoading(true);
    adminService.getProjects({ limit: 50 })
      .then(({ data }) => setProjects(data.data.projects || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleVerify = async (id, status) => {
    try {
      await adminService.verifyProject(id, { status });
      addToast(`Project ${status}`, status === 'verified' ? 'success' : 'error');
      fetch();
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  const pendingFirst = [...projects].sort((a, b) => {
    const order = { pending: 0, verified: 1, rejected: 2 };
    return order[a.verification_status] - order[b.verification_status];
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  return (
    <div className="fade-in">
      <PageHeader title="Project Verification" subtitle={`${projects.filter(p => p.verification_status === 'pending').length} pending review`} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pendingFirst.map((p) => (
          <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <Badge variant={p.verification_status}>{p.verification_status}</Badge>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--ash)', border: '1px solid rgba(255,255,255,0.08)' }}>{p.impact_type}</span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                {p.emoji} {p.project_name}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
                Seller: {p.seller?.name} · 📍 {p.location} · {(p.available_credits || 0).toLocaleString()} credits · {formatCurrency(p.price_per_credit)}/credit
              </div>
            </div>
            {p.verification_status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="sm" onClick={() => handleVerify(p._id, 'verified')}>✓ Verify</Button>
                <Button variant="danger"  size="sm" onClick={() => handleVerify(p._id, 'rejected')}>✗ Reject</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Admin Users ───────────────────────────────────────────────────────────────
export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminService.getUsers()
      .then(({ data }) => setUsers(data.data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(id, newStatus);
      addToast(`User ${newStatus}`, 'success');
      fetch();
    } catch { addToast('Action failed', 'error'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  return (
    <div className="fade-in">
      <PageHeader title="User Management" subtitle={`${users.length} registered users`} />

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', color: 'var(--ash)' }}>{u.email}</span></td>
                  <td><Badge variant={u.role}>{u.role}</Badge></td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--ash)' }}>{formatDate(u.createdAt)}</span></td>
                  <td>
                    <Badge variant={u.status === 'active' ? 'verified' : 'rejected'}>{u.status}</Badge>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <Button variant={u.status === 'active' ? 'danger' : 'secondary'} size="sm"
                        onClick={() => toggleStatus(u._id, u.status)}>
                        {u.status === 'active' ? 'Suspend' : 'Restore'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
