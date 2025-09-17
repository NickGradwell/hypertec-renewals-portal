// Shared utility functions for the Hypertec Renewals Platform

import { User, Company, Record, EmailLog } from '../types';

// Date formatting utilities
export const formatTimestamp = (isoString: string): string => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Company utilities
export const getCompanyNameById = (companyId: string, companies: Company[]): string => {
  const company = companies.find((c) => c.id === companyId);
  return company ? company.name : "N/A";
};

export const getCompanyById = (companyId: string, companies: Company[]): Company | undefined => {
  return companies.find((c) => c.id === companyId);
};

// Record utilities
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "expiring soon":
      return "bg-yellow-100 text-yellow-800";
    case "expired":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getEmailStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "sent":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value && value.trim().length > 0;
};

// Sorting utilities
export const sortByDate = (a: string, b: string, direction: 'asc' | 'desc' = 'asc'): number => {
  const dateA = a ? new Date(a) : null;
  const dateB = b ? new Date(b) : null;
  
  if (dateA && dateB) {
    if (dateA < dateB) return direction === 'asc' ? -1 : 1;
    if (dateA > dateB) return direction === 'asc' ? 1 : -1;
    return 0;
  }
  if (dateA) return -1;
  if (dateB) return 1;
  return 0;
};

export const sortByString = (a: string, b: string, direction: 'asc' | 'desc' = 'asc'): number => {
  const valA = typeof a === "string" ? a.toLowerCase() : a;
  const valB = typeof b === "string" ? b.toLowerCase() : b;
  if (valA < valB) return direction === 'asc' ? -1 : 1;
  if (valA > valB) return direction === 'asc' ? 1 : -1;
  return 0;
};

// Filter utilities
export const filterRecordsByRole = (
  records: Record[],
  user: User,
  companies: Company[]
): Record[] => {
  const userCompany = getCompanyById(user.companyId, companies);
  
  return records.filter((record) => {
    if (user.role === "Hypertec Admin") return true;
    if (user.role === "Partner" && userCompany) {
      return record.partnerName === userCompany.name;
    }
    if (user.role === "Customer" && userCompany) {
      return record.customerName === userCompany.name;
    }
    return false;
  });
};

// Search utilities
export const searchRecords = (
  records: Record[],
  searchTerm: string,
  user: User
): Record[] => {
  if (!searchTerm) return records;
  
  const term = searchTerm.toLowerCase();
  return records.filter((record) => {
    let match = false;
    
    if (user.role === "Hypertec Admin" || user.role === "Partner") {
      match = match || record.customerName?.toLowerCase().includes(term);
    }
    if (user.role === "Hypertec Admin") {
      match = match || record.partnerName?.toLowerCase().includes(term);
    }
    match = match || record.partcode?.toLowerCase().includes(term);
    match = match || record.serial?.toLowerCase().includes(term);
    match = match || record.renewalDue?.toLowerCase().includes(term);
    match = match || record.status?.toLowerCase().includes(term);
    match = match || record.recordType?.toLowerCase().includes(term);
    match = match || record.helReference?.toLowerCase().includes(term);
    
    return match;
  });
};

// API utilities
export const createApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || import.meta.env.VITE_API_URL || '/api';
  return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const handleApiError = (error: any): string => {
  if (error.response?.status === 401) {
    return "Authentication required. Please log in again.";
  } else if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  } else if (error.response?.status === 404) {
    return "The requested resource was not found.";
  } else if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  } else {
    return error.response?.data?.message || error.message || "An unexpected error occurred.";
  }
};
