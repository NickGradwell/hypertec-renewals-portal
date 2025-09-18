import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadLicenses from './pages/UploadLicenses';
import EmailTemplates from './pages/EmailTemplates';
import EmailLogs from './components/EmailLogs';
import Reports from './pages/Reports';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import Login from './pages/Login';
import LoadingScreen from './components/LoadingScreen';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Types
import { mockUsers, mockCompanies, mockRecords, mockEmailLogs } from './types';

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
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

// Main App Content Component
function AppContent() {
  const { user, isAuthenticated, isLoading, login, logout, error } = useAuth();
  
  // State management
  const [users, setUsers] = useState(mockUsers);
  const [companies, setCompanies] = useState(mockCompanies);
  const [records, setRecords] = useState(mockRecords);
  const [emailLogs, setEmailLogs] = useState(mockEmailLogs);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} error={error} />;
  }

  // Safety check: ensure user object exists before rendering
  if (!user) {
    return <LoadingScreen />;
  }

  // Main application
  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={
          <Dashboard 
            user={user}
            companies={companies}
            records={records}
            setRecords={setRecords}
          />
        } />
        <Route path="/upload" element={
          <UploadLicenses user={user} />
        } />
        <Route path="/email-templates" element={
          <EmailTemplates user={user} />
        } />
        <Route path="/email-logs" element={<EmailLogs />} />
        <Route path="/reports" element={<Reports user={user} />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/company-management" element={<CompanyManagement />} />
      </Routes>
    </Layout>
  );
}

// Main App Component
function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </MsalProvider>
  );
}

export default App;