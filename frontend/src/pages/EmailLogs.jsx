import React from 'react';
import { UserRole } from '../types';
import Card from '../components/ui/Card';

const EmailLogs = ({ user, emailLogs, setEmailLogs }) => {
  const isAuthorized = user.role === UserRole.HYPERTEC_ADMIN || user.role === UserRole.PARTNER;

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          Your current role does not have permission to access the "Email Logs" section.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Email Send Logs</h3>
          <p className="text-sm text-gray-600 mb-4">
            History of automated emails sent by the system.
          </p>
          <div className="text-center py-8 text-gray-500">
            Email logs functionality coming soon...
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailLogs;
