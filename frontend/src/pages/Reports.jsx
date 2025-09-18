import React from 'react';
import { UserRole } from '../types';
import Card from '../components/ui/Card';

const Reports = ({ user }) => {
  const isAuthorized = user.role === UserRole.HYPERTEC_ADMIN || user.role === UserRole.PARTNER;

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          Your current role does not have permission to access the "Reports" section.
        </p>
      </div>
    );
  }

  // Mock data for reports
  const mockReports = {
    renewalStats: {
      total: 156,
      active: 142,
      pending: 8,
      expired: 6,
      totalLicenses: 1247,
      activeLicenses: 1134,
      upcomingRenewals: 23,
      activePercentage: 91
    },
    emailStats: {
      total: 89,
      sent: 84,
      failed: 3,
      pending: 2,
      successRate: 94
    },
    companyStats: {
      total: 45,
      withEmail: 42,
      withPhone: 38
    },
    userStats: {
      total: 12,
      admins: 3,
      regularUsers: 9
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your renewal operations</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Export Excel
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{mockReports.renewalStats.total}</h3>
            <p className="text-gray-600 mb-2">Total Renewals</p>
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {mockReports.renewalStats.activePercentage}% Active
            </span>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-xl">⚠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{mockReports.renewalStats.upcomingRenewals}</h3>
            <p className="text-gray-600 mb-2">Upcoming Renewals</p>
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Next 30 days
            </span>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">📧</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{mockReports.emailStats.total}</h3>
            <p className="text-gray-600 mb-2">Emails Sent</p>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {mockReports.emailStats.successRate}% Success
            </span>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{mockReports.companyStats.total}</h3>
            <p className="text-gray-600 mb-2">Companies</p>
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              {mockReports.companyStats.withEmail} with email
            </span>
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Renewal Status Distribution</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Active</span>
                  <span className="text-sm text-gray-600">{mockReports.renewalStats.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${mockReports.renewalStats.activePercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-sm text-gray-600">{mockReports.renewalStats.pending}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(mockReports.renewalStats.pending / mockReports.renewalStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Expired</span>
                  <span className="text-sm text-gray-600">{mockReports.renewalStats.expired}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(mockReports.renewalStats.expired / mockReports.renewalStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">License Statistics</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-3xl font-bold text-blue-600 mb-2">
                  {mockReports.renewalStats.totalLicenses.toLocaleString()}
                </h4>
                <p className="text-gray-600">Total Licenses</p>
              </div>

              <div className="text-center">
                <h4 className="text-3xl font-bold text-green-600 mb-2">
                  {mockReports.renewalStats.activeLicenses.toLocaleString()}
                </h4>
                <p className="text-gray-600">Active Licenses</p>
              </div>

              <div className="text-center">
                <h4 className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((mockReports.renewalStats.activeLicenses / mockReports.renewalStats.totalLicenses) * 100)}%
                </h4>
                <p className="text-gray-600">Active Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Performance */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Email Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total Emails
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mockReports.emailStats.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    100%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Successfully Sent
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mockReports.emailStats.sent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mockReports.emailStats.successRate}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Failed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mockReports.emailStats.failed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round((mockReports.emailStats.failed / mockReports.emailStats.total) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Pending
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mockReports.emailStats.pending}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round((mockReports.emailStats.pending / mockReports.emailStats.total) * 100)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
