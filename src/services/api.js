import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — auto refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        api.defaults.headers.Authorization = `Bearer ${data.data.accessToken}`;
        processQueue(null, data.data.accessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── API service methods ───────────────────────────────────────────────────────
export const authService = {
  register:  (data) => api.post('/auth/register', data),
  login:     (data) => api.post('/auth/login', data),
  logout:    ()     => api.post('/auth/logout'),
  getMe:     ()     => api.get('/auth/me'),
};

export const projectService = {
  getAll:  (params) => api.get('/projects', { params }),
  getById: (id)     => api.get(`/projects/${id}`),
};

export const creditService = {
  buy:             (data) => api.post('/credits/buy', data),
  getPortfolio:    ()     => api.get('/credits/portfolio'),
  getTransactions: (params) => api.get('/credits/transactions', { params }),
};

export const sellerService = {
  getProjects:   ()        => api.get('/seller/projects'),
  createProject: (data)    => api.post('/seller/projects', data),
  updateProject: (id, data)=> api.put(`/seller/projects/${id}`, data),
  deleteProject: (id)      => api.delete(`/seller/projects/${id}`),
  getSales:      (params)  => api.get('/seller/sales', { params }),
};

export const adminService = {
  getStats:        ()              => api.get('/admin/stats'),
  getProjects:     (params)        => api.get('/admin/projects', { params }),
  verifyProject:   (id, data)      => api.put(`/admin/projects/${id}/verify`, data),
  getUsers:        (params)        => api.get('/admin/users', { params }),
  updateUserStatus:(id, status)    => api.patch(`/admin/users/${id}/status`, { status }),
  getTransactions: (params)        => api.get('/admin/transactions', { params }),
};

export default api;
