import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/** Buyer's own transaction history */
export const useMyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetch = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const { data } = await api.get('/credits/transactions', { params: { page, limit } });
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, pagination, loading, error, refetch: fetch };
};

/** Buyer's portfolio (aggregated holdings) */
export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/credits/portfolio');
      setPortfolio(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { portfolio, loading, error, refetch: fetch };
};
