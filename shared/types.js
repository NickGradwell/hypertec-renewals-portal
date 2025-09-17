// Shared types and constants for the Hypertec Renewals Platform

// User roles
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARTNER: 'partner',
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  USER: 'user'
};

// Record types
export const RecordType = {
  SOFTWARE: 'software',
  VOUCHER: 'voucher',
  SOFTWARE_LICENSE: 'software_license',
  SERVICE_VOUCHER: 'service_voucher'
};

// Record status
export const RecordStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring_soon',
  RENEWED: 'renewed',
  CANCELLED: 'cancelled'
};

// Email status
export const EmailStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked'
};

// Mock user data structure
export const mockUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@hypertec.co.uk',
    role: UserRole.SUPER_ADMIN,
    companyId: 1,
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hypertec.co.uk',
    role: UserRole.ADMIN,
    companyId: 1,
    isActive: true,
    lastLogin: '2024-01-14T15:45:00Z'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.wilson@hypertec.co.uk',
    role: UserRole.MANAGER,
    companyId: 2,
    isActive: true,
    lastLogin: '2024-01-13T09:20:00Z'
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.davis@hypertec.co.uk',
    role: UserRole.USER,
    companyId: 2,
    isActive: true,
    lastLogin: '2024-01-12T14:10:00Z'
  }
];

// Mock company data structure
export const mockCompanies = [
  {
    id: 1,
    name: 'Hypertec Solutions Ltd',
    contactEmail: 'admin@hypertec.co.uk',
    contactPhone: '+44 20 1234 5678',
    address: '123 Business Street, London, UK',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Hypertec Services Ltd',
    contactEmail: 'services@hypertec.co.uk',
    contactPhone: '+44 20 8765 4321',
    address: '456 Service Avenue, Manchester, UK',
    isActive: true,
    createdAt: '2023-02-01T00:00:00Z'
  }
];

// Mock records data structure
export const mockRecords = [
  {
    id: 1,
    type: RecordType.SOFTWARE_LICENSE,
    name: 'Microsoft Office 365 Business Premium',
    companyId: 1,
    expiryDate: '2024-12-31',
    status: RecordStatus.ACTIVE,
    value: 1200,
    currency: 'GBP',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    type: RecordType.SERVICE_VOUCHER,
    name: 'Azure Support Plan',
    companyId: 1,
    expiryDate: '2024-06-30',
    status: RecordStatus.EXPIRING_SOON,
    value: 500,
    currency: 'GBP',
    createdAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 3,
    type: RecordType.SOFTWARE_LICENSE,
    name: 'Adobe Creative Cloud',
    companyId: 2,
    expiryDate: '2024-03-15',
    status: RecordStatus.EXPIRING_SOON,
    value: 800,
    currency: 'GBP',
    createdAt: '2023-03-01T00:00:00Z'
  }
];

// Mock email logs data structure
export const mockEmailLogs = [
  {
    id: 1,
    recipientEmail: 'admin@hypertec.co.uk',
    subject: 'License Renewal Reminder - Microsoft Office 365',
    status: EmailStatus.SENT,
    sentAt: '2024-01-10T09:00:00Z',
    recordId: 1
  },
  {
    id: 2,
    recipientEmail: 'services@hypertec.co.uk',
    subject: 'Service Voucher Expiry Notice - Azure Support',
    status: EmailStatus.DELIVERED,
    sentAt: '2024-01-08T14:30:00Z',
    recordId: 2
  }
];

// Utility functions
export const getCompanyById = (companies, companyId) => {
  return companies.find(company => company.id === companyId);
};

export const filterRecordsByRole = (records, userRole) => {
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
    return records;
  }
  // For partners and customers, filter by their company
  return records; // This would be filtered by user's company in real implementation
};

export const searchRecords = (records, searchTerm) => {
  if (!searchTerm) return records;
  const term = searchTerm.toLowerCase();
  return records.filter(record => 
    record.customerName?.toLowerCase().includes(term) ||
    record.partnerName?.toLowerCase().includes(term) ||
    record.partcode?.toLowerCase().includes(term) ||
    record.serial?.toLowerCase().includes(term) ||
    record.recordType?.toLowerCase().includes(term) ||
    record.status?.toLowerCase().includes(term)
  );
};

export const getStatusColor = (status) => {
  const colors = {
    [RecordStatus.ACTIVE]: 'text-green-600 bg-green-100',
    [RecordStatus.EXPIRED]: 'text-red-600 bg-red-100',
    [RecordStatus.EXPIRING_SOON]: 'text-yellow-600 bg-yellow-100',
    [RecordStatus.RENEWED]: 'text-blue-600 bg-blue-100',
    [RecordStatus.CANCELLED]: 'text-gray-600 bg-gray-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const sortByDate = (records, field = 'expiryDate') => {
  return [...records].sort((a, b) => new Date(a[field]) - new Date(b[field]));
};

export const sortByString = (records, field = 'name') => {
  return [...records].sort((a, b) => a[field].localeCompare(b[field]));
};
