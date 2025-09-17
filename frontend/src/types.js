// Shared types and constants for the Hypertec Renewals Platform

// User roles - Updated to match prototype
export const UserRole = {
  HYPERTEC_ADMIN: 'Hypertec Admin',
  PARTNER: 'Partner',
  CUSTOMER: 'Customer'
};

// Record types - Updated to match prototype
export const RecordType = {
  SOFTWARE_LICENSE: 'Software License',
  SERVICE_VOUCHER: 'Service Voucher'
};

// Company types
export const CompanyType = {
  ADMIN: 'Admin',
  PARTNER: 'Partner',
  CUSTOMER: 'Customer'
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

// Mock user data structure - Updated to match prototype
export const mockUsers = [
  {
    id: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hypertec.example',
    companyId: 'comp-hypertec',
    role: UserRole.HYPERTEC_ADMIN,
    loginTime: new Date(Date.now() - 1000 * 60 * 5).toLocaleString()
  },
  {
    id: 'partnerX',
    firstName: 'PartnerX',
    lastName: 'Rep',
    email: 'user@partnerx.example',
    companyId: 'comp-px',
    role: UserRole.PARTNER,
    loginTime: new Date(Date.now() - 1000 * 60 * 60).toLocaleString()
  },
  {
    id: 'partnerY',
    firstName: 'PartnerY',
    lastName: 'User',
    email: 'user@partnery.example',
    companyId: 'comp-py',
    role: UserRole.PARTNER,
    loginTime: new Date(Date.now() - 1000 * 60 * 120).toLocaleString()
  },
  {
    id: 'customerAlpha',
    firstName: 'Alpha',
    lastName: 'Contact',
    email: 'user@alpha.example',
    companyId: 'comp-alpha',
    role: UserRole.CUSTOMER,
    loginTime: new Date(Date.now() - 1000 * 30).toLocaleString()
  },
  {
    id: 'customerBeta',
    firstName: 'Beta',
    lastName: 'User',
    email: 'user@beta.example',
    companyId: 'comp-beta',
    role: UserRole.CUSTOMER,
    loginTime: new Date(Date.now() - 1000 * 60 * 240).toLocaleString()
  }
];

// Mock company data structure - Updated to match prototype
export const mockCompanies = [
  {
    id: 'comp-hypertec',
    name: 'Hypertec (Internal)',
    type: CompanyType.ADMIN,
    resellerEmail: null
  },
  {
    id: 'comp-px',
    name: 'Partner X',
    type: CompanyType.PARTNER,
    resellerEmail: 'contact@partnerx.example'
  },
  {
    id: 'comp-py',
    name: 'Partner Y',
    type: CompanyType.PARTNER,
    resellerEmail: 'sales@partnery.example'
  },
  {
    id: 'comp-alpha',
    name: 'Alpha Corp',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  },
  {
    id: 'comp-beta',
    name: 'Beta Solutions',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  },
  {
    id: 'comp-gamma',
    name: 'Gamma Industries',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  },
  {
    id: 'comp-delta',
    name: 'Delta Systems',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  },
  {
    id: 'comp-epsilon',
    name: 'Epsilon Ltd',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  },
  {
    id: 'comp-zeta',
    name: 'Zeta Components',
    type: CompanyType.CUSTOMER,
    resellerEmail: null
  }
];

// Mock records data structure - Updated to match prototype
export const mockRecords = [
  // Software Licenses
  {
    id: 'rec1',
    recordType: RecordType.SOFTWARE_LICENSE,
    customerName: 'Alpha Corp',
    partnerName: 'Partner X',
    partcode: 'HYP-SFW-1Y',
    serial: 'SN12345678',
    renewalDue: '2025-08-15',
    status: 'Active',
    licenses: 5,
    dateOfOrder: '2024-08-10',
    dateOfIssue: '2024-08-14',
    helReference: 'HEL1001',
    resellerOrderNum: 'PO-PX-001',
    endUserRef: 'EU-Alpha-01',
    renewalEnabled: true,
    instructions: 'Download from portal: portal.hypertec.com/downloads/sfw1'
  },
  {
    id: 'rec2',
    recordType: RecordType.SOFTWARE_LICENSE,
    customerName: 'Beta Solutions',
    partnerName: 'Partner Y',
    partcode: 'HYP-HDW-3Y',
    serial: 'SN87654321',
    renewalDue: '2025-06-30',
    status: 'Expiring Soon',
    licenses: 1,
    dateOfOrder: '2022-06-25',
    dateOfIssue: '2022-06-28',
    helReference: 'HEL1002',
    resellerOrderNum: 'PO-PY-005',
    endUserRef: 'EU-Beta-05',
    renewalEnabled: true,
    instructions: 'See attached PDF for setup.'
  },
  {
    id: 'rec3',
    recordType: RecordType.SOFTWARE_LICENSE,
    customerName: 'Gamma Industries',
    partnerName: 'Partner X',
    partcode: 'HYP-CLD-M',
    serial: 'SNABCDEFGH',
    renewalDue: '2026-01-10',
    status: 'Active',
    licenses: 20,
    dateOfOrder: '2025-01-05',
    dateOfIssue: '2025-01-09',
    helReference: 'HEL1003',
    resellerOrderNum: 'PO-PX-002',
    endUserRef: 'EU-Gamma-10',
    renewalEnabled: false,
    instructions: 'Cloud access auto-provisioned.'
  },
  {
    id: 'rec4',
    recordType: RecordType.SOFTWARE_LICENSE,
    customerName: 'Delta Systems',
    partnerName: null,
    partcode: 'HYP-SFW-1Y',
    serial: 'SNIJKLMNOP',
    renewalDue: '2025-05-01',
    status: 'Expired',
    licenses: 2,
    dateOfOrder: '2024-04-20',
    dateOfIssue: '2024-04-25',
    helReference: 'HEL1004',
    resellerOrderNum: null,
    endUserRef: 'EU-Delta-15',
    renewalEnabled: true,
    instructions: 'Download from portal: portal.hypertec.com/downloads/sfw1'
  },
  // Service Vouchers
  {
    id: 'rec5',
    recordType: RecordType.SERVICE_VOUCHER,
    customerName: 'Alpha Corp',
    partnerName: 'Partner X',
    partcode: 'HYP-SVC-STD',
    serial: null,
    renewalDue: '2025-10-31',
    status: 'Active',
    licenses: 10,
    dateOfOrder: '2024-10-15',
    dateOfIssue: '2024-10-20',
    helReference: 'HEL2001',
    resellerOrderNum: 'PO-PX-003',
    endUserRef: 'EU-Alpha-02',
    voucherCodes: ['VCA001','VCA002','VCA003','VCA004','VCA005','VCA006','VCA007','VCA008','VCA009','VCA010'],
    claimedCount: 3,
    instructions: 'Redeem at redeem.hypertec.com'
  },
  {
    id: 'rec6',
    recordType: RecordType.SERVICE_VOUCHER,
    customerName: 'Epsilon Ltd',
    partnerName: 'Partner Y',
    partcode: 'HYP-SVC-PREM',
    serial: null,
    renewalDue: '2025-12-31',
    status: 'Active',
    licenses: 5,
    dateOfOrder: '2024-12-10',
    dateOfIssue: '2024-12-18',
    helReference: 'HEL2002',
    resellerOrderNum: 'PO-PY-010',
    endUserRef: 'EU-Eps-20',
    voucherCodes: ['VCE001','VCE002','VCE003','VCE004','VCE005'],
    claimedCount: 0,
    instructions: 'Contact support@hypertec.com to redeem.'
  }
];

// Mock email logs data structure - Updated to match prototype
export const mockEmailLogs = [
  {
    id: 'log1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    recipient: 'user@beta.example',
    subject: 'Reminder: Your Hypertec Renewal for HYP-HDW-3Y',
    status: 'Sent',
    templateUsed: 'software_60day',
    body: 'Dear Beta Solutions,\n\nThis is a reminder that your Hypertec license for HYP-HDW-3Y (Serial: SN87654321) is due for renewal on 2025-06-30.\n\nPlease contact us or your partner Partner Y to arrange your renewal.\n\nInstructions: See attached PDF for setup.\n\nThanks,\nThe Hypertec Team'
  },
  {
    id: 'log2',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    recipient: 'user@alpha.example',
    subject: 'Reminder: Your Hypertec Renewal for HYP-SFW-1Y',
    status: 'Sent',
    templateUsed: 'software_90day',
    body: 'Dear Alpha Corp,\n\nThis is a reminder that your Hypertec license for HYP-SFW-1Y (Serial: SN12345678) is due for renewal on 2025-08-15.\n\nPlease contact us or your partner Partner X to arrange your renewal.\n\nInstructions: Download from portal: portal.hypertec.com/downloads/sfw1\n\nThanks,\nThe Hypertec Team'
  },
  {
    id: 'log3',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    recipient: 'user@epsilon.example',
    subject: 'Reminder: Your Hypertec Renewal for HYP-SVC-PREM',
    status: 'Failed',
    templateUsed: 'software_90day',
    body: 'Dear Epsilon Ltd,\n\nThis is a reminder that your Hypertec license for HYP-SVC-PREM is due for renewal on 2025-12-31.\n\nPlease contact us or your partner Partner Y to arrange your renewal.\n\nInstructions: Contact support@hypertec.com to redeem.\n\nThanks,\nThe Hypertec Team'
  },
  {
    id: 'log4',
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    recipient: 'user@gamma.example',
    subject: 'Reminder: Your Hypertec Renewal for HYP-CLD-M',
    status: 'Sent',
    templateUsed: 'software_90day',
    body: 'Dear Gamma Industries,\n\nThis is a reminder that your Hypertec license for HYP-CLD-M (Serial: SNABCDEFGH) is due for renewal on 2026-01-10.\n\nPlease contact us or your partner Partner X to arrange your renewal.\n\nInstructions: Cloud access auto-provisioned.\n\nThanks,\nThe Hypertec Team'
  },
  // Voucher examples
  {
    id: 'log5',
    timestamp: new Date(Date.now() - 86400000 * 35).toISOString(),
    recipient: 'user@alpha.example',
    subject: 'Reminder: Unused Hypertec Service Vouchers',
    status: 'Sent',
    templateUsed: 'voucher_monthly',
    body: 'Dear Alpha Corp,\n\nYou have 7 unused service vouchers associated with HEL ref HEL2001 (Your ref: EU-Alpha-02) expiring on 2025-10-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team'
  },
  {
    id: 'log6',
    timestamp: new Date(Date.now() - 86400000 * 40).toISOString(),
    recipient: 'user@epsilon.example',
    subject: 'Reminder: Unused Hypertec Service Vouchers',
    status: 'Sent',
    templateUsed: 'voucher_initial',
    body: 'Dear Epsilon Ltd,\n\nYou have 5 unused service vouchers associated with HEL ref HEL2002 (Your ref: EU-Eps-20) expiring on 2025-12-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team'
  }
];

// Utility functions - Updated to match prototype
export const getCompanyById = (companyId, companies) => {
  if (!companies || !Array.isArray(companies)) {
    console.warn('getCompanyById: companies is not an array', companies);
    return null;
  }
  return companies.find(c => c.id === companyId);
};

export const getCompanyNameById = (companyId, companies) => {
  if (!companies || !Array.isArray(companies)) {
    console.warn('getCompanyNameById: companies is not an array', companies);
    return 'N/A';
  }
  const company = companies.find(c => c.id === companyId);
  return company ? company.name : 'N/A';
};

export const formatTimestamp = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};

export const filterRecordsByRole = (records, userRole) => {
  if (userRole === UserRole.HYPERTEC_ADMIN) {
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
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expiring soon': return 'bg-yellow-100 text-yellow-800';
    case 'expired': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const sortByDate = (records, field = 'renewalDue') => {
  return [...records].sort((a, b) => new Date(a[field]) - new Date(b[field]));
};

export const sortByString = (records, field = 'customerName') => {
  return [...records].sort((a, b) => a[field].localeCompare(b[field]));
};
