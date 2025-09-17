import { PublicClientApplication } from '@azure/msal-browser';
import { UserRole } from '../types';

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: `https://${import.meta.env.VITE_AZURE_TENANT_ID || 'your-tenant-id'}.b2clogin.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'your-tenant-id'}.onmicrosoft.com/${import.meta.env.VITE_AZURE_POLICY_NAME || 'your-policy-name'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    knownAuthorities: [`${import.meta.env.VITE_AZURE_TENANT_ID || 'your-tenant-id'}.b2clogin.com`]
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        // Suppress MSAL warnings for development
        if (message.includes('There is already an instance of MSAL.js')) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            break;
          case 1: // LogLevel.Warning
            console.warn(message);
            break;
          case 2: // LogLevel.Info
            console.info(message);
            break;
          case 3: // LogLevel.Verbose
            console.debug(message);
            break;
        }
      }
    }
  }
};

class AuthService {
  constructor() {
    // Check if MSAL is already initialized globally
    if (window.msalInstance) {
      this.msalInstance = window.msalInstance;
      this.isInitialized = true;
    } else {
      this.msalInstance = new PublicClientApplication(msalConfig);
      this.isInitialized = false;
    }
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Check if MSAL is already initialized in the window
      if (window.msalInstance) {
        this.msalInstance = window.msalInstance;
        this.isInitialized = true;
        return;
      }
      
      await this.msalInstance.initialize();
      // Store the instance globally to prevent multiple instances
      window.msalInstance = this.msalInstance;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw error;
    }
  }

  async login() {
    try {
      // For local development, use mock authentication
      if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID === 'your-client-id') {
        return this.mockLogin();
      }

      await this.initialize();
      
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account'
      });

      if (loginResponse.account) {
        return this.mapAccountToUser(loginResponse.account);
      }
      
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  mockLogin() {
    // Mock authentication for local development
    const mockUser = {
      id: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hypertec.example',
      role: UserRole.HYPERTEC_ADMIN,
      companyId: 'comp-hypertec',
      loginTime: new Date().toLocaleString()
    };

    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Store mock user in session storage
        sessionStorage.setItem('mock-user', JSON.stringify(mockUser));
        resolve(mockUser);
      }, 500);
    });
  }

  async logout() {
    try {
      // For local development, clear mock user from session storage
      if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID === 'your-client-id') {
        sessionStorage.removeItem('mock-user');
        return;
      }

      await this.initialize();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      // For local development, get mock user from session storage
      if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID === 'your-client-id') {
        const mockUser = sessionStorage.getItem('mock-user');
        return mockUser ? JSON.parse(mockUser) : null;
      }

      await this.initialize();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        return this.mapAccountToUser(accounts[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async acquireToken() {
    try {
      await this.initialize();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        return null;
      }

      const response = await this.msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: accounts[0]
      });

      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token:', error);
      return null;
    }
  }

  mapAccountToUser(account) {
    // Extract user information from Azure AD B2C account
    const nameParts = account.name?.split(' ') || ['User', ''];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // For now, we'll map all users to admin role
    // In production, you'd want to check user claims or call your API to determine role
    const role = this.determineUserRole(account);
    
    return {
      id: account.localAccountId,
      firstName,
      lastName,
      email: account.username,
      companyId: 'comp-hypertec', // Default to admin company for now
      role,
      loginTime: new Date().toLocaleString()
    };
  }

  determineUserRole(account) {
    // In a real implementation, you would:
    // 1. Check custom claims in the token
    // 2. Call your API to get user role from database
    // 3. Use Azure AD B2C groups or custom attributes
    
    // For now, we'll use a simple mapping based on email domain
    const email = account.username.toLowerCase();
    
    if (email.includes('@hypertec.')) {
      return UserRole.HYPERTEC_ADMIN;
    } else if (email.includes('@partner')) {
      return UserRole.PARTNER;
    } else {
      return UserRole.CUSTOMER;
    }
  }

  async handleRedirect() {
    try {
      await this.initialize();
      
      const response = await this.msalInstance.handleRedirectPromise();
      
      if (response && response.account) {
        return this.mapAccountToUser(response.account);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to handle redirect:', error);
      return null;
    }
  }

  isAuthenticated() {
    // For local development, check if we have a mock user in session storage
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID === 'your-client-id') {
      return sessionStorage.getItem('mock-user') !== null;
    }
    
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;
