import axios from 'axios';
import authService from './authService';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await authService.acquireToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to acquire token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, try to refresh
      try {
        await authService.logout();
        window.location.href = '/';
      } catch (logoutError) {
        console.error('Failed to logout after 401:', logoutError);
      }
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Users
  async getUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // Companies
  async getCompanies() {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  async createCompany(companyData) {
    const response = await apiClient.post('/companies', companyData);
    return response.data;
  },

  async updateCompany(companyId, companyData) {
    const response = await apiClient.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  async deleteCompany(companyId) {
    const response = await apiClient.delete(`/companies/${companyId}`);
    return response.data;
  },

  // Records
  async getRecords() {
    const response = await apiClient.get('/records');
    return response.data;
  },

  async createRecord(recordData) {
    const response = await apiClient.post('/records', recordData);
    return response.data;
  },

  async updateRecord(recordId, recordData) {
    const response = await apiClient.put(`/records/${recordId}`, recordData);
    return response.data;
  },

  async deleteRecord(recordId) {
    const response = await apiClient.delete(`/records/${recordId}`);
    return response.data;
  },

  // Email Logs
  async getEmailLogs() {
    const response = await apiClient.get('/email-logs');
    return response.data;
  },

  async resendEmail(logId) {
    const response = await apiClient.post(`/email-logs/${logId}/resend`);
    return response.data;
  },

  // Email Templates
  async getEmailTemplates() {
    const response = await apiClient.get('/email-templates');
    return response.data;
  },

  async updateEmailTemplate(templateId, templateData) {
    const response = await apiClient.put(`/email-templates/${templateId}`, templateData);
    return response.data;
  },

  // File Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default apiService;
