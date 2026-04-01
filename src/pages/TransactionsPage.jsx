import React, { useEffect, useState } from 'react';
import { PageHeader, Badge, Spinner, EmptyState } from '../components/common';
import { creditService, adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionsPage = () => {
  const { user }            = useAuth();
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFn = user?.role === 'admin'
      ? () => adminService.getTransactions()
      : () => creditService.getTransactions();

    fetchFn()
      .then(({ data }) => {
        const list = user?.role === 'admin'
          ? data.data.transactions
          : data.data.transactions;
        setTxns(list || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  return (
    <div className="fade-in">
      <PageHeader title="Transaction History" subtitle={`${txns.length} records`} />

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                {user?.role === 'admin' && <th>Buyer</th>}
                <th>Credits</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  <EmptyState icon="📋" title="No transactions yet" />
                </td></tr>
              ) : txns.map((t) => (
                <tr key={t._id}>
                  <td><span className="mono" style={{ fontSize: '0.72rem', color: 'var(--ash)' }}>{t._id?.slice(-8)}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {t.project?.emoji || '🌿'} {t.snapshot?.project_name || t.project?.project_name}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
                      {t.snapshot?.impact_type || t.project?.impact_type}
                    </div>
                  </td>
                  {user?.role === 'admin' && (
                    <td style={{ fontSize: '0.87rem' }}>
                      {t.buyer?.name}
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>{t.buyer?.email}</div>
                    </td>
                  )}
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--lime)' }}>{t.credits_purchased}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ash)' }}> tons</span>
                  </td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{formatCurrency(t.total_price)}</span></td>
                  <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--ash)' }}>{formatDate(t.createdAt)}</span></td>
                  <td><Badge variant="verified">✓ {t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
