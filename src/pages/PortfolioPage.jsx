import React, { useEffect, useState } from 'react';
import { PageHeader, StatCard, SectionLabel, Spinner, EmptyState } from '../components/common';
import { ProgressBar } from '../components/common';
import { creditService } from '../services/api';
import { formatCurrency, formatNumber, co2Equivalents } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PortfolioPage = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creditService.getPortfolio()
      .then(({ data: res }) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>;

  const summary  = data?.summary  || {};
  const holdings = data?.holdings || [];
  const equiv    = co2Equivalents(summary.total_credits || 0);

  // Build monthly chart data from current month
  const now = new Date();
  const chartData = MONTH_LABELS.map((m, i) => ({
    month: m,
    credits: i === now.getMonth() ? (summary.total_credits || 0) : 0,
  }));

  return (
    <div className="fade-in">
      <PageHeader title="My Portfolio" subtitle="Your Carbon Offset Holdings" />

      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="🌿" value={formatNumber(summary.total_credits || 0)}   label="Total Credits"      sub="+425 this month" />
        <StatCard icon="🌍" value={formatNumber(summary.total_co2_offset_tons || 0)} label="CO₂ Offset (tons)" sub="≈ tonnes sequestered" />
        <StatCard icon="💰" value={formatCurrency(summary.total_invested || 0)} label="Total Invested"
          sub={summary.total_credits > 0 ? `Avg ${formatCurrency(summary.total_invested / summary.total_credits)}/credit` : ''} />
        <StatCard icon="📍" value={summary.projects_backed || 0}               label="Projects Backed"    sub="Diversified portfolio" />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Holdings */}
        <div className="card">
          <SectionLabel>Project Holdings</SectionLabel>
          {holdings.length === 0 ? (
            <EmptyState icon="📊" title="No holdings yet" description="Browse the marketplace to buy your first credits." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {holdings.map((h, i) => (
                <div key={i} style={{ background: 'rgba(107,221,138,0.05)', border: '1px solid rgba(107,221,138,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {h.project?.emoji} {h.project?.project_name}
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--lime)', fontWeight: 500 }}>
                      {formatNumber(h.credits)} credits
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
                      {h.credits} tons CO₂ offset
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--ash)' }}>
                      {formatCurrency(h.total_invested)} invested
                    </span>
                  </div>
                  <ProgressBar value={h.credits} max={summary.total_credits || 1} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart + Impact */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <SectionLabel>Monthly Credits Acquired</SectionLabel>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fill: '#8fa898' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fill: '#8fa898' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--moss)', border: '1px solid rgba(107,221,138,0.2)', borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                  labelStyle={{ color: 'var(--lime)' }}
                  itemStyle={{ color: 'var(--white)' }}
                />
                <Bar dataKey="credits" fill="var(--leaf)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <SectionLabel>Environmental Impact</SectionLabel>
            {[
              { icon: '🌳', label: 'Trees equivalent',       value: `${formatNumber(equiv.trees)} trees` },
              { icon: '🚗', label: 'Car miles avoided',      value: `${formatNumber(equiv.carMiles)} miles` },
              { icon: '🏠', label: 'Homes powered (year)',   value: `${equiv.homeYears} homes` },
              { icon: '✈️', label: 'Flight hours avoided',   value: `${equiv.flightHours} hours` },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.87rem', color: 'var(--ash)' }}>{item.icon} {item.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
