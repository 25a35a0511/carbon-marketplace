import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { fmt, fmtN, CURRENCY_SYMBOL } from '../../utils/Currency';
import DashboardLayout from '../../components/layout/DashboardLayout';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const MOS    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#2E7D32','#0288D1','#7b1fa2','#e64a19','#37474f','#c62828','#00838f','#558b2f'];

/* ── Animated number ─────────────────────────────────────── */
function Num({ val, dec = 0 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    if (!val) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1000, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setD(+(e * val).toFixed(dec));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [val]);
  return <>{Number(d).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}</>;
}

/* ── Monthly bar chart ───────────────────────────────────── */
function MonthlyChart({ txns }) {
  const [hov, setHov] = useState(null);
  const rev = new Array(12).fill(0);
  const cnt = new Array(12).fill(0);
  txns.forEach(t => { const m = new Date(t.createdAt).getMonth(); rev[m] += t.totalAmount || 0; cnt[m] += 1; });
  const maxR  = Math.max(...rev, 1);
  const bestM = rev.indexOf(Math.max(...rev));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 140 }}>
        {MOS.map((mo, i) => {
          const h   = Math.max(3, (rev[i] / maxR) * 124);
          const act = rev[i] > 0;
          const isH = hov === i;
          return (
            <div key={mo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: act ? 'pointer' : 'default', position: 'relative' }}
              onMouseEnter={() => act && setHov(i)} onMouseLeave={() => setHov(null)}>
              {isH && (
                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1a1f1c', color: '#fff', borderRadius: 7, padding: '5px 9px', fontSize: '.68rem', fontFamily: 'monospace', whiteSpace: 'nowrap', zIndex: 10, marginBottom: 4 }}>
                  {fmt(rev[i])}<br />{cnt[i]} sale{cnt[i] !== 1 ? 's' : ''}
                </div>
              )}
              {!isH && act  && <span style={{ fontFamily: 'monospace', fontSize: '.62rem', color: i === bestM ? '#d97706' : '#2E7D32', fontWeight: 700 }}>{fmt(rev[i]).replace(/[₹$]/, '').replace(/\.00$/, '')}</span>}
              {!isH && !act && <span style={{ fontSize: '.62rem' }}>&nbsp;</span>}
              <div style={{ width: '100%', height: `${h}px`, background: i === bestM ? 'linear-gradient(to top,#d97706,#fbbf24)' : isH ? 'linear-gradient(to top,#1b5e20,#2E7D32)' : act ? 'linear-gradient(to top,#2E7D32,#4caf7d)' : '#f3f4f6', borderRadius: '3px 3px 0 0', transition: 'all .2s' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
        {MOS.map((mo, i) => (
          <div key={mo} style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: '.6rem', color: rev[i] > 0 ? (i === bestM ? '#d97706' : '#2E7D32') : '#d1d5db', fontWeight: rev[i] > 0 ? 600 : 400 }}>{mo}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Revenue donut ───────────────────────────────────────── */
function RevenueDonut({ byProject }) {
  const [hov, setHov] = useState(null);
  const entries = Object.entries(byProject).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
  const total   = entries.reduce((s, [, v]) => s + v.revenue, 0);
  if (!entries.length) return null;
  const R = 70, SZ = 180, CX = 90, CY = 90, C = 2 * Math.PI * R;
  let cum = 0;
  const slices = entries.map(([title, stat], i) => {
    const pct = total > 0 ? stat.revenue / total : 0;
    const off = cum;
    cum += pct;
    return { title, stat, pct, off, color: COLORS[i % COLORS.length] };
  });
  const active = hov !== null ? slices[hov] : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={22} />
          {slices.map((sl, i) => (
            <circle key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={sl.color} strokeWidth={hov === i ? 27 : 22}
              strokeDasharray={`${C * sl.pct} ${C}`}
              strokeDashoffset={`${-C * sl.off}`}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ cursor: 'pointer', transition: 'stroke-width .2s' }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {active ? (
            <>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: '1.05rem', color: active.color }}>{Math.round(active.pct * 100)}%</div>
              <div style={{ fontFamily: 'monospace', fontSize: '.58rem', color: '#9ca3af', textAlign: 'center', maxWidth: 70, marginTop: 3 }}>{active.title.split(' ').slice(0, 3).join(' ')}</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: '1.05rem', color: '#2E7D32' }}>{fmt(total)}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '.58rem', color: '#9ca3af', marginTop: 3 }}>total revenue</div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 140 }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: hov === null || hov === i ? 1 : .4, transition: 'opacity .2s' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: sl.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sl.title}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '.68rem', color: '#9ca3af' }}>{fmt(sl.stat.revenue)} · {Math.round(sl.pct * 100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Transaction row (with expand) ──────────────────────── */
function TxnRow({ t, expanded, onToggle }) {
  const isExp = expanded === t._id;
  return (
    <>
      <tr onClick={onToggle}
        style={{ cursor: 'pointer', background: isExp ? '#f0faf4' : '', transition: 'background .15s' }}
        onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = isExp ? '#f0faf4' : ''; }}>
        <td style={{ ...s.td, width: 28, padding: '13px 8px 13px 14px' }}>
          <span style={{ display: 'inline-flex', width: 20, height: 20, background: isExp ? '#2E7D32' : '#f3f4f6', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: isExp ? '#fff' : '#6b7280', transform: isExp ? 'rotate(90deg)' : 'none', transition: 'all .2s' }}>▶</span>
        </td>
        <td style={s.td}>
          <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#1a1f1c' }}>{t.buyer?.name || '—'}</div>
          <div style={{ fontSize: '.72rem', color: '#9ca3af', fontFamily: 'monospace' }}>{t.buyer?.email}</div>
        </td>
        <td style={s.td}><span style={{ fontSize: '.85rem', color: '#374151', fontWeight: 500 }}>{t.projectTitle}</span></td>
        <td style={s.td}><span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '.95rem', color: '#2E7D32' }}>{t.creditsPurchased}</span><span style={{ fontSize: '.72rem', color: '#9ca3af' }}> t</span></td>
        <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{fmt(t.pricePerCredit)}</span></td>
        <td style={s.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.9rem' }}>{fmt(t.totalAmount)}</span></td>
        <td style={s.td}>
          <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#374151', fontWeight: 500 }}>{fmtDate(t.createdAt)}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#9ca3af' }}>{fmtTime(t.createdAt)}</div>
        </td>
        <td style={s.td}><span style={{ background: '#f0faf4', color: '#166534', border: '1px solid #aee4c5', borderRadius: 99, padding: '2px 9px', fontSize: '.68rem', fontFamily: 'monospace', fontWeight: 600 }}>✓ {t.status}</span></td>
      </tr>
      {isExp && (
        <tr style={{ background: '#f0faf4' }}>
          <td colSpan={8} style={{ padding: '14px 20px', borderBottom: '2px solid #d6f2e2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, fontSize: '.85rem' }}>
              {[
                ['Buyer Email',       t.buyer?.email || '—'],
                ['Credits × Price',   `${t.creditsPurchased} × ${fmt(t.pricePerCredit)}`],
                ['Transaction ID',    `#${t._id?.slice(-8)}`],
                ['Time',              fmtTime(t.createdAt)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'monospace', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '.8rem', color: '#374151', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function SalesPage() {
  const [allTxns,  setAllTxns]  = useState([]);
  const [pageTxns, setPageTxns] = useState([]);
  const [summary,  setSummary]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/seller/sales', { params: { page: 1, limit: 100 } });
      const all = data.data || [];
      setAllTxns(all);
      setSummary(data.summary || {});
      setPageTxns(all.slice(0, LIMIT));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* derived: group by project */
  const byProject = {};
  allTxns.forEach(t => {
    const k = t.projectTitle || 'Unknown';
    if (!byProject[k]) byProject[k] = { revenue: 0, credits: 0, txns: 0 };
    byProject[k].revenue += t.totalAmount      || 0;
    byProject[k].credits += t.creditsPurchased || 0;
    byProject[k].txns    += 1;
  });

  const filtered    = search
    ? allTxns.filter(t => t.projectTitle?.toLowerCase().includes(search.toLowerCase()) || t.buyer?.name?.toLowerCase().includes(search.toLowerCase()) || t.buyer?.email?.toLowerCase().includes(search.toLowerCase()))
    : pageTxns;

  const totalPages  = Math.ceil(allTxns.length / LIMIT);
  const goPage      = (pg) => { setPage(pg); setPageTxns(allTxns.slice((pg - 1) * LIMIT, pg * LIMIT)); setExpanded(null); };
  const toggleExp   = (id) => setExpanded(prev => prev === id ? null : id);

  const avgTxn  = summary.txnCount > 0 ? (summary.totalRevenue || 0) / summary.txnCount : 0;
  const avgPrc  = (summary.totalSold || 0) > 0 ? (summary.totalRevenue || 0) / summary.totalSold : 0;

  const bestMonthLabel = () => {
    const r = new Array(12).fill(0);
    allTxns.forEach(t => { r[new Date(t.createdAt).getMonth()] += t.totalAmount || 0; });
    return MOS[r.indexOf(Math.max(...r))];
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={s.title}>Sales Dashboard</h2>
          <p style={s.sub}>Revenue, transactions, and buyer activity across all your projects.</p>
        </div>
        <Link to="/seller/create" style={s.pill}>➕ New Project</Link>
      </div>

      {/* ── 4 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { icon: '💰', color: '#2E7D32', val: <>{CURRENCY_SYMBOL}<Num val={summary.totalRevenue || 0} dec={2} /></>, lbl: 'Total Revenue',   sub: `${fmtN(summary.txnCount)} transactions` },
          { icon: '🌿', color: '#0288D1', val: <><Num val={summary.totalSold || 0} /> <span style={{ fontSize: '1rem', fontWeight: 400 }}>t</span></>, lbl: 'Credits Sold', sub: 'CO₂ offset tonnes' },
          { icon: '📋', color: '#7b1fa2', val: <Num val={summary.txnCount || 0} />,  lbl: 'Total Sales',    sub: 'Completed transactions' },
          { icon: '💹', color: '#d97706', val: <>{CURRENCY_SYMBOL}<Num val={avgTxn} dec={2} /></>, lbl: 'Avg. Sale Value', sub: `${CURRENCY_SYMBOL}${avgPrc.toFixed(2)}/credit avg` },
        ].map((st, i) => (
          <div key={i} style={s.sc}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${st.color}14`, border: `1px solid ${st.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 12 }}>{st.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.75rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{loading ? '–' : st.val}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', marginTop: 6 }}>{st.lbl}</div>
            <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: 3 }}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={s.lbl}>📈 Monthly Revenue</div>
            {allTxns.length > 0 && <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#d97706', fontWeight: 600 }}>🏆 Best: {bestMonthLabel()}</span>}
          </div>
          {allTxns.length === 0
            ? <p style={{ fontSize: '.85rem', color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No sales yet.</p>
            : <MonthlyChart txns={allTxns} />}
        </div>
        <div style={s.card}>
          <div style={s.lbl}>🥧 Revenue by Project</div>
          {Object.keys(byProject).length === 0
            ? <p style={{ fontSize: '.85rem', color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No sales yet.</p>
            : <RevenueDonut byProject={byProject} />}
        </div>
      </div>

      {/* ── Project performance ── */}
      {Object.keys(byProject).length > 0 && (
        <div style={s.card}>
          <div style={s.lbl}>📦 Project Performance</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.tbl}>
              <thead>
                <tr>{['Project', 'Credits Sold', 'Revenue', 'Sales', 'Avg/Sale', 'Share'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {Object.entries(byProject).sort((a, b) => b[1].revenue - a[1].revenue).map(([title, stat], i) => {
                  const totalRev = summary.totalRevenue || 1;
                  const share    = Math.round((stat.revenue / totalRev) * 100);
                  const col      = COLORS[i % COLORS.length];
                  return (
                    <tr key={title}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={s.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} /><span style={{ fontWeight: 600, fontSize: '.87rem', color: '#1a1f1c' }}>{title}</span></div></td>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2E7D32' }}>{fmtN(stat.credits)}</span><span style={{ fontSize: '.72rem', color: '#9ca3af' }}> t</span></td>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{fmt(stat.revenue)}</span></td>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>{stat.txns}</span></td>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: '.85rem', color: '#6b7280' }}>{fmt(stat.revenue / stat.txns)}</span></td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ flex: 1, height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${share}%`, background: `linear-gradient(90deg,${col}88,${col})`, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '.72rem', color: col, fontWeight: 700, flexShrink: 0 }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Transaction ledger ── */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={s.lbl}>🔄 Transaction Ledger ({allTxns.length})</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '8px 14px', fontSize: '.85rem', outline: 'none', fontFamily: 'inherit', width: '100%', maxWidth: 260 }}
              placeholder="🔍 Search buyer or project…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: '#f0faf4', color: '#2E7D32', border: '1px solid #aee4c5', borderRadius: 8, padding: '8px 12px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
            )}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8, animation: 'spin .9s linear infinite', display: 'inline-block' }}>🌿</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>Loading sales data…</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>❌ {error}</span>
            <button onClick={load} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem' }}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>{allTxns.length === 0 ? '📊' : '🔍'}</div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>{allTxns.length === 0 ? 'No sales yet' : 'No results found'}</p>
                {allTxns.length === 0 && (
                  <p style={{ fontSize: '.875rem', marginBottom: 16 }}>Once your verified projects are purchased, sales will appear here.</p>
                )}
                {allTxns.length === 0 && <Link to="/seller/projects" style={s.pill}>View My Projects →</Link>}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={s.tbl}>
                  <thead>
                    <tr>{['', 'Buyer', 'Project', 'Credits', 'Price', 'Revenue', 'Date', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <TxnRow key={t._id} t={t} expanded={expanded} onToggle={() => toggleExp(t._id)} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!search && totalPages > 1 && (
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#9ca3af' }}>
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, allTxns.length)} of {allTxns.length}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={page <= 1} onClick={() => goPage(page - 1)} style={{ ...s.pageBtn, opacity: page <= 1 ? .4 : 1 }}>← Prev</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return <button key={pg} onClick={() => goPage(pg)} style={{ ...s.pageBtn, background: pg === page ? '#2E7D32' : '#fff', color: pg === page ? '#fff' : '#374151', borderColor: pg === page ? '#2E7D32' : '#e5e7eb', minWidth: 36 }}>{pg}</button>;
                  })}
                  <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} style={{ ...s.pageBtn, opacity: page >= totalPages ? .4 : 1 }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

const s = {
  title:   { fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', fontWeight: 900, marginBottom: 4, color: '#1a1f1c' },
  sub:     { color: '#6b7280', fontSize: '.9rem', marginBottom: 24 },
  card:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 22, marginBottom: 20 },
  sc:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' },
  lbl:     { fontFamily: 'monospace', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#2E7D32', marginBottom: 12 },
  tbl:     { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th:      { fontFamily: 'monospace', fontSize: '.65rem', letterSpacing: '.08em', textTransform: 'uppercase', color: '#9ca3af', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #f3f4f6', background: '#fafafa', whiteSpace: 'nowrap' },
  td:      { padding: '12px 14px', fontSize: '.875rem', borderBottom: '1px solid #f9fafb', verticalAlign: 'middle' },
  pill:    { background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block' },
  pageBtn: { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151', transition: 'all .15s' },
};