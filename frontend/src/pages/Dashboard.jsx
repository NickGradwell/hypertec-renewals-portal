import React, { useState, useMemo } from 'react';
import { UserRole, RecordType, RecordStatus } from "../types";
import { getCompanyById, filterRecordsByRole, searchRecords, getStatusColor, sortByDate, sortByString } from '../types';

// UI Components
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Switch from '../components/ui/Switch';
import KPICard from '../components/ui/KPICard';

const Dashboard = ({ user, companies, records, setRecords }) => {
  // State for sorting and filtering
  const [sortConfig, setSortConfig] = useState({
    key: "renewalDue",
    direction: "ascending",
  });
  const [filterText, setFilterText] = useState("");

  // Determine user role flags
  const isAdmin = user.role === UserRole.HYPERTEC_ADMIN;
  const isPartner = user.role === UserRole.PARTNER;
  const isCustomer = user.role === UserRole.CUSTOMER;

  // Get the current user's company details
  const userCompany = useMemo(
    () => getCompanyById(user.companyId, companies),
    [user.companyId, companies]
  );

  // Filter records based on user role
  const roleFilteredRecords = useMemo(() => {
    return filterRecordsByRole(records, user.role);
  }, [records, user.role]);

  // Apply global text filter and sorting
  const processedRecords = useMemo(() => {
    let filterableItems = [...roleFilteredRecords];
    
    // Apply search filter
    if (filterText) {
      filterableItems = searchRecords(filterableItems, filterText);
    }
    
    // Apply sorting
    if (sortConfig.key !== null) {
      filterableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.key === "renewalDue") {
          return sortByDate(aValue, bValue, sortConfig.direction === "ascending" ? "asc" : "desc");
        }
        
        return sortByString(aValue, bValue, sortConfig.direction === "ascending" ? "asc" : "desc");
      });
    }
    
    return filterableItems;
  }, [roleFilteredRecords, filterText, sortConfig, user]);

  // Handle column header click for sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (isAdmin || isPartner) {
      console.log(`User (${user.role}) deleting record with id:`, id);
      setRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));
      alert(`Record ${id} deleted (locally).`);
    } else {
      alert("Permission denied.");
    }
  };

  // Handle Toggle Change
  const handleToggleChange = (recordId, currentStatus) => {
    if (isAdmin || isPartner) {
      setRecords((prevRecords) =>
        prevRecords.map((rec) =>
          rec.id === recordId ? { ...rec, renewalEnabled: !currentStatus } : rec
        )
      );
      console.log(`Toggled renewalEnabled for ${recordId} to ${!currentStatus}`);
    } else {
      alert("Permission denied.");
    }
  };

  // Calculate colspan for empty row
  let colSpan = 0;
  if (isAdmin || isPartner) colSpan++; // Customer
  if (isAdmin) colSpan++; // Partner
  colSpan++; // Type
  colSpan++; // Partcode/Item
  colSpan++; // Serial/Vouchers
  colSpan++; // Expiry
  colSpan++; // Status/Claimed
  colSpan++; // Licenses/Qty
  if (isAdmin || isCustomer) colSpan++; // Instructions/Link
  if (isAdmin || isPartner) colSpan++; // Renewal Active Toggle
  if (isAdmin || isPartner) colSpan++; // Action

  // Mock KPI data
  const kpiData = {
    expiringSoon: processedRecords.filter(
      (r) => r.recordType === RecordType.SOFTWARE_LICENSE && r.status === 'Expiring Soon'
    ).length,
    totalActive: processedRecords.filter((r) => r.status === 'Active').length,
    expired: processedRecords.filter(
      (r) => r.recordType === RecordType.SOFTWARE_LICENSE && r.status === 'Expired'
    ).length,
    vouchersUnclaimed: processedRecords
      .filter(
        (r) => r.recordType === RecordType.SERVICE_VOUCHER && (r.claimedCount || 0) < r.licenses
      )
      .reduce((sum, r) => sum + (r.licenses - (r.claimedCount || 0)), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      {(isAdmin || isPartner) && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Expiring Soon (Licenses)"
            value={kpiData.expiringSoon}
            description="Licenses expiring within 30 days"
            icon="⚠️"
            color="#FBC02D"
          />
          <KPICard
            title="Total Active Records"
            value={kpiData.totalActive}
            description="Active licenses and vouchers"
            icon="✔️"
            color="#4CAF50"
          />
          <KPICard
            title="Total Unclaimed Vouchers"
            value={kpiData.vouchersUnclaimed}
            description="Service vouchers yet to be redeemed"
            icon="🎫"
            color="#1E88E5"
          />
          <KPICard
            title="Expired Licenses"
            value={kpiData.expired}
            description="Licenses past their renewal date"
            icon="❌"
            color="#F44336"
          />
        </div>
      )}

      {/* Records Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Licenses & Vouchers</h3>
              <p className="text-sm text-gray-600">
                Overview of software licenses and service vouchers.
              </p>
            </div>
            {(isAdmin || isPartner) && (
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            )}
          </div>
          
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Filter table..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="min-w-full">
            <Table>
              <thead>
              <tr className="border-b">
                {(isAdmin || isPartner) && (
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("customerName")}
                  >
                    Customer {getSortIndicator("customerName")}
                  </th>
                )}
                {isAdmin && <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Partner</th>}
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Partcode/Item</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Serial/Vouchers</th>
                <th
                  className="h-12 px-4 text-left align-middle font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("renewalDue")}
                >
                  Expiry Date {getSortIndicator("renewalDue")}
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status/Claimed</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Lic./Qty</th>
                {(isAdmin || isCustomer) && <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Instructions</th>}
                {(isAdmin || isPartner) && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Renewal Active</th>
                )}
                {(isAdmin || isPartner) && (
                  <th className="h-12 px-4 text-center align-middle font-medium text-gray-500">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {processedRecords.length > 0 ? (
                processedRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    {(isAdmin || isPartner) && (
                      <td className="p-4 align-middle font-medium">
                        {record.customerName}
                      </td>
                    )}
                    {isAdmin && (
                      <td className="p-4 align-middle">{record.partnerName || "Direct"}</td>
                    )}
                    <td className="p-4 align-middle">{record.recordType}</td>
                    <td className="p-4 align-middle">{record.partcode}</td>
                    <td className="p-4 align-middle">
                      {record.recordType === RecordType.SOFTWARE_LICENSE
                        ? record.serial
                        : record.recordType === RecordType.SERVICE_VOUCHER
                        ? `${record.voucherCodes?.length || 0} codes`
                        : "N/A"}
                    </td>
                    <td className="p-4 align-middle">{record.renewalDue}</td>
                    <td className="p-4 align-middle">
                      {record.recordType === RecordType.SOFTWARE_LICENSE ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      ) : record.recordType === RecordType.SERVICE_VOUCHER ? (
                        <span className="text-xs">
                          {record.claimedCount || 0} / {record.licenses || 0} claimed
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      {record.licenses}
                    </td>
                    {(isAdmin || isCustomer) && (
                      <td
                        className="p-4 align-middle text-xs truncate max-w-[150px]"
                        title={record.instructions}
                      >
                        {record.instructions}
                      </td>
                    )}
                    {(isAdmin || isPartner) && (
                      <td className="p-4 align-middle">
                        {record.recordType === RecordType.SOFTWARE_LICENSE ? (
                          <Switch
                            id={`toggle-${record.id}`}
                            checked={record.renewalEnabled}
                            onCheckedChange={() =>
                              handleToggleChange(record.id, record.renewalEnabled)
                            }
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    {(isAdmin || isPartner) && (
                      <td className="p-4 align-middle text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="text-center text-gray-500 py-8"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
