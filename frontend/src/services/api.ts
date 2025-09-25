import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Health & System
  health: () => api.get('/health'),
  
  // Terminology
  searchTerms: (query: string, options?: { limit?: number; category?: string }) => 
    api.get('/api/terminology/search', { params: { q: query, ...options } }),
  getTermById: (id: string) => api.get(`/api/terminology/term/${id}`),
  getTermsByCategory: (category: string) => api.get(`/api/terminology/category/${category}`),
  getMappedTerms: () => api.get('/api/terminology/mapped'),
  
  // Translation
  translateCode: (code: string, system: 'NAMASTE' | 'ICD-11-TM2') =>
    api.post('/api/terminology', { code, system }),
  
  // FHIR
  getCodeSystem: () => api.get('/api/fhir/CodeSystem/namaste'),
  getConceptMap: () => api.get('/api/fhir/ConceptMap/namaste-to-icd11'),
  
  // ICD-11
  searchICD11: (query: string) => api.get('/api/icd/search', { params: { q: query } }),
  
  // Admin
  ingestCSV: (csvData: string) => api.post('/admin/ingest-csv', { csvData }),
  loadSampleData: () => api.post('/admin/load-sample'),
  getStatistics: () => api.get('/admin/statistics'),
  clearData: () => api.delete('/admin/clear'),
  
  // Auth
  getAuthToken: (abhaId: string) => api.post('/auth/token', { abhaId }),
};

export default api;
