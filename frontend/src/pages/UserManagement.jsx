import React from 'react';
import { UserRole } from '../types';
import Card from '../components/ui/Card';

const UserManagement = ({ user, users, setUsers, companies, setCompanies }) => {
  const isAuthorized = user.role === UserRole.HYPERTEC_ADMIN;

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          Your current role does not have permission to access the "User & Company Management" section.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">User & Company Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage users and their company associations.
          </p>
          <div className="text-center py-8 text-gray-500">
            User management functionality coming soon...
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
