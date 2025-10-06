import axios from 'axios';
import authService from './authService';

// Resolve baseURL: force absolute API in production
const resolvedBaseURL = import.meta.env.PROD
  ? 'https://hypertec-renewals-simple-api.azurewebsites.net/api'
  : (import.meta.env.VITE_API_URL || '/api');

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log resolved baseURL in production to verify runtime configuration
if (import.meta.env.PROD) {
  // This appears once on app load and helps confirm which API the bundle is calling
  // eslint-disable-next-line no-console
  console.log('[apiService] Resolved baseURL:', apiClient.defaults.baseURL);
}

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Only try to acquire token if Azure AD B2C is properly configured
      if (import.meta.env.VITE_AZURE_CLIENT_ID && 
          import.meta.env.VITE_AZURE_CLIENT_ID !== 'your-client-id' &&
          import.meta.env.VITE_AZURE_TENANT_ID !== 'your-tenant-id') {
        const token = await authService.acquireToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // For mock authentication, we don't need to add any headers
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
    // Only handle 401 errors if Azure AD B2C is properly configured
    if (error.response?.status === 401 && 
        import.meta.env.VITE_AZURE_CLIENT_ID && 
        import.meta.env.VITE_AZURE_CLIENT_ID !== 'your-client-id' &&
        import.meta.env.VITE_AZURE_TENANT_ID !== 'your-tenant-id') {
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
