import axios from 'axios';

/**
 * Backend base URL
 * 👉 MUST be: https://medexa-v2.onrender.com/api
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* ================= AXIOS CLIENT ================= */
const apiClient = axios.create({
  baseURL: API_URL, // ✅ FIXED (NO /api again)
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/* ================= AUTH APIs ================= */
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

/* ================= USER APIs ================= */
export const userAPI = {
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getDashboard: () => apiClient.get('/users/dashboard'),
};

/* ================= CHAT APIs ================= */
export const chatAPI = {
  sendMessage: (data) => apiClient.post('/chat/message', data),
  getHistory: (sessionId) =>
    apiClient.get(`/chat/history${sessionId ? `?sessionId=${sessionId}` : ''}`),
  getSessions: () => apiClient.get('/chat/sessions'),
  deleteSession: (sessionId) =>
    apiClient.delete(`/chat/session/${sessionId}`),
};

/* ================= SYMPTOM APIs ================= */
export const symptomAPI = {
  analyze: (data) => apiClient.post('/symptoms/analyze', data),
  getHistory: (params) => apiClient.get('/symptoms/history', { params }),
  getStats: () => apiClient.get('/symptoms/stats'),
};

/* ================= RECOMMENDATION APIs ================= */
export const recommendationAPI = {
  get: () => apiClient.get('/recommendations'),
  getExercises: (params) =>
    apiClient.get('/recommendations/exercises', { params }),
};

/* ================= REPORT APIs ================= */
export const reportAPI = {
  downloadPDF: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reports/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MEDEXA_Report_${Date.now()}.pdf`;
    link.click();
  },

  downloadCSV: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reports/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MEDEXA_Report_${Date.now()}.csv`;
    link.click();
  },
};

/* ================= ADMIN APIs ================= */
/* ================= ADMIN APIs ================= */
export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: (params?: any) => apiClient.get('/admin/users', { params }),
  getUserDetails: (userId: string) => apiClient.get(`/admin/users/${userId}`),
  toggleUserStatus: (userId: string) =>
    apiClient.put(`/admin/users/${userId}/toggle-status`),
  getChats: (params?: any) => apiClient.get('/admin/chats', { params }),
  getSymptoms: (params?: any) => apiClient.get('/admin/symptoms', { params }),

  // ✅ ADD THIS (IMPORTANT)
  exportUsers: async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/export/users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export users');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `medexa_users_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users');
    }
  },
};

/* ================= ANALYSIS APIs ================= */
export const analysisAPI = {
  analyzePrescription: (data) =>
    apiClient.post('/analysis/prescription', data),
  analyzeLabReport: (data) =>
    apiClient.post('/analysis/lab-report', data),
  getHistory: (type) =>
    apiClient.get('/analysis/history', { params: { type } }),
  getAnalysis: (id) => apiClient.get(`/analysis/${id}`),
  deleteAnalysis: (id) => apiClient.delete(`/analysis/${id}`),
};