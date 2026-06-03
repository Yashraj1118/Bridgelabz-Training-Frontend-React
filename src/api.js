import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// USER API
export const authApi = {
  register: (userData) => apiClient.post('/users/register', userData),
  
  verifyOtp: (verifyData) => apiClient.post('/users/verify-otp', verifyData),
  
  resendOtp: (email) => apiClient.post(`/users/resend-otp?email=${encodeURIComponent(email)}`),
  
  login: async (loginData) => {
    const response = await apiClient.post('/users/login', loginData);
    // Read JWT from Authorization header
    const authHeader = response.headers['authorization'];
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      localStorage.setItem('token', token);
      localStorage.setItem('email', loginData.email);
    }
    return { data: response.data, token };
  },
  
  forgotPasswordOtp: (email) => 
    apiClient.post(`/users/forgot-password-otp?email=${encodeURIComponent(email)}`),
  
  resetPasswordOtp: (resetData) => 
    apiClient.post('/users/reset-password-otp', resetData),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  }
};

// NOTES API
export const notesApi = {
  create: (noteData) => apiClient.post('/notes', noteData),
  
  getAllActive: () => apiClient.get('/notes'),
  
  update: (id, noteData) => apiClient.put(`/notes/${id}`, noteData),
  
  deletePermanently: (id) => apiClient.delete(`/notes/${id}`),
  
  togglePin: (id) => apiClient.patch(`/notes/${id}/pin`),
  
  toggleArchive: (id) => apiClient.patch(`/notes/${id}/archive`),
  
  toggleTrash: (id) => apiClient.patch(`/notes/${id}/trash`),
  
  getPinned: () => apiClient.get('/notes/pinned'),
  
  getArchived: () => apiClient.get('/notes/archived'),
  
  getTrashed: () => apiClient.get('/notes/trash'),
  
  search: (keyword) => apiClient.get(`/notes/search?keyword=${encodeURIComponent(keyword)}`),
  
  filterByColor: (color) => apiClient.get(`/notes/color?color=${encodeURIComponent(color)}`),
  
  setReminder: (id, reminderTime) => 
    apiClient.patch(`/notes/${id}/reminder`, { reminderTime }),
  
  removeReminder: (id) => apiClient.delete(`/notes/${id}/reminder`),
};

// LABELS API
export const labelsApi = {
  create: (name) => apiClient.post('/labels', { name }),
  
  getAll: () => apiClient.get('/labels'),
  
  update: (id, name) => apiClient.put(`/labels/${id}`, { name }),
  
  delete: (id) => apiClient.delete(`/labels/${id}`),
  
  addLabelToNote: (labelId, noteId) => 
    apiClient.post(`/labels/${labelId}/notes/${noteId}`),
  
  removeLabelFromNote: (labelId, noteId) => 
    apiClient.delete(`/labels/${labelId}/notes/${noteId}`),
  
  getNotesByLabel: (labelId) => apiClient.get(`/labels/${labelId}/notes`),
};

export default apiClient;
