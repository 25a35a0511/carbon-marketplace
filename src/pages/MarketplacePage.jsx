import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, Spinner, EmptyState } from '../components/common';
import ProjectCard from '../components/buyer/ProjectCard';
import BuyCreditsModal from '../components/buyer/BuyCreditsModal';
import { projectService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const IMPACT_TYPES = [
  'Forest Conservation', 'Renewable Energy', 'Blue Carbon',
  'Clean Cooking', 'Peatland Conservation', 'Biodiversity Conservation',
];

const MarketplacePage = () => {
  const { user } = useAuth();
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectService.getAll({ limit: 50 });
      setProjects(data.data.projects);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) =>
    (filter === 'all' || p.impact_type === filter) &&
    (!search || p.project_name.toLowerCase().includes(search.toLowerCase()) ||
     p.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Carbon Marketplace"
        subtitle={`${projects.length} Verified Projects Available`}
        action={
          <input className="input-field" style={{ width: 260 }}
            placeholder="🔍 Search projects…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        }
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}>All Projects</button>
        {IMPACT_TYPES.map((t) => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No projects found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid-3" style={{ gap: 20 }}>
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && user?.role === 'buyer' && (
        <BuyCreditsModal
          project={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { fetchProjects(); setSelected(null); }}
        />
      )}
      {selected && user?.role !== 'buyer' && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>{selected.emoji} {selected.project_name}</h3>
            <p style={{ color: 'var(--ash)' }}>{selected.description}</p>
            <hr className="divider" />
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
