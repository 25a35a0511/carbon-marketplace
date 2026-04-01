import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useProjects = (params = {}) => {
  const [projects,   setProjects]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchProjects = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/projects', { params: { ...params, ...overrides } });
      setProjects(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchProjects(); }, []); // eslint-disable-line

  return { projects, pagination, loading, error, refetch: () => fetchProjects() };
};

export const useProject = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/projects/${id}`)
      .then(({ data }) => setProject(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
};