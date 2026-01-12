import axios from 'axios';

/** Configurare URL backend (din .env sau default) */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Interceptor: Atașează token-ul JWT la fiecare request */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** Interceptor: Deloghează utilizatorul la eroare 401/403 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

//Auth Endpoints

export const authAPI = {
  /**
   * Înregistrează utilizator nou
   * @param {Object} userData { username, email, password }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Autentifică utilizator
   * @param {Object} credentials { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /** Obține profilul curent */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};

// Records Endpoints

export const recordsAPI = {
  /**
   * Obține lista de înregistrări
   * @param {Object} params { limit, sortBy }
   */
  getAll: async (params = {}) => {
    const response = await api.get('/records', { params });
    return response.data;
  },

  /** Obține o înregistrare după ID */
  getById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  /**
   * Creează înregistrare nouă (opțional cu vital signs)
   * @param {Object} recordData - { date, weight, steps, sleepHours, notes, vitalSigns: [] }
   * @returns {Promise<Object>} { message, record }
   */
  create: async (recordData) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },

  /**
   * Update record
   * @param {number} id - Record ID
   * @param {Object} recordData - { weight, steps, sleepHours, notes }
   * @returns {Promise<Object>} { message, record }
   */
  update: async (id, recordData) => {
    const response = await api.put(`/records/${id}`, recordData);
    return response.data;
  },

  /**
   * Delete record
   * @param {number} id - Record ID
   * @returns {Promise<Object>} { message }
   */
  delete: async (id) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },

  /**
   * Get statistics
   * @param {string} period - 'week', 'month', 'year', 'all'
   * @returns {Promise<Object>} { period, recordsCount, vitalSignsCount, statistics }
   */
  getStatistics: async (period = 'month') => {
    const response = await api.get('/records/statistics', { params: { period } });
    return response.data;
  },
};

// ============================================
// VITAL SIGNS API
// ============================================

export const vitalSignsAPI = {
  /**
   * Add vital sign to a record
   * @param {number} recordId - Record ID
   * @param {Object} vitalData - { timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, ... }
   * @returns {Promise<Object>} { message, vitalSign }
   */
  add: async (recordId, vitalData) => {
    const response = await api.post(`/records/${recordId}/vitals`, vitalData);
    return response.data;
  },

  /**
   * Update vital sign
   * @param {number} recordId - Record ID
   * @param {number} vitalId - Vital Sign ID
   * @param {Object} vitalData - { timeOfDay, heartRate, ... }
   * @returns {Promise<Object>} { message, updatedVital }
   */
  update: async (recordId, vitalId, vitalData) => {
    const response = await api.put(`/records/${recordId}/vitals/${vitalId}`, vitalData);
    return response.data;
  },

  /**
   * Delete vital sign
   * @param {number} recordId - Record ID
   * @param {number} vitalId - Vital Sign ID
   * @returns {Promise<Object>} { message }
   */
  delete: async (recordId, vitalId) => {
    const response = await api.delete(`/records/${recordId}/vitals/${vitalId}`);
    return response.data;
  },
};

export default api;