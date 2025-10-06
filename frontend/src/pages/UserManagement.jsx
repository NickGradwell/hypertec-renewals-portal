import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
// Temporary hard-coded fetch to validate hosted origin calls

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRows, setUserRows] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch('https://hypertec-renewals-simple-api.azurewebsites.net/api/users');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const res = await resp.json();
        // API shape is { success: boolean, data: User[] }
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) setUserRows(rows);
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">User & Company Management</h3>
          <p className="text-sm text-gray-600 mb-4">Manage users and their company associations.</p>

          {loading && (
            <div className="text-gray-500">Loading users…</div>
          )}
          {error && (
            <div className="text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b font-medium">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                  {userRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-gray-500 text-center">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
