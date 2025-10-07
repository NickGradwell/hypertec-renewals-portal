-- Hypertec Renewals Platform Database Schema
-- This file contains the SQL schema for the MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS hypertec_renewals;
USE hypertec_renewals;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Partner', 'Customer', 'Admin') NOT NULL,
    resellerEmail VARCHAR(255),
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(64),
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    companyId VARCHAR(50) NOT NULL,
    role ENUM('Hypertec Admin', 'Partner', 'Customer') NOT NULL,
    loginTime TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Records table (for both software licenses and service vouchers)
CREATE TABLE IF NOT EXISTS records (
    id VARCHAR(50) PRIMARY KEY,
    recordType ENUM('Software License', 'Service Voucher') NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    partnerName VARCHAR(255),
    partcode VARCHAR(100) NOT NULL,
    serial VARCHAR(255),
    renewalDue DATE NOT NULL,
    status ENUM('Active', 'Expiring Soon', 'Expired') NOT NULL,
    licenses INT NOT NULL DEFAULT 1,
    dateOfOrder DATE NOT NULL,
    dateOfIssue DATE NOT NULL,
    helReference VARCHAR(100) NOT NULL,
    resellerOrderNum VARCHAR(100),
    endUserRef VARCHAR(100) NOT NULL,
    renewalEnabled BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    -- Voucher-specific fields
    voucherCodes JSON,
    claimedCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email logs table
CREATE TABLE IF NOT EXISTS emailLogs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status ENUM('Sent', 'Failed', 'Pending') NOT NULL,
    templateUsed VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE IF NOT EXISTS emailTemplates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('software', 'voucher') NOT NULL,
    interval VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default companies
INSERT INTO companies (id, name, type, resellerEmail) VALUES
('comp-hypertec', 'Hypertec (Internal)', 'Admin', NULL),
('comp-px', 'Partner X', 'Partner', 'contact@partnerx.example'),
('comp-py', 'Partner Y', 'Partner', 'sales@partnery.example'),
('comp-alpha', 'Alpha Corp', 'Customer', NULL),
('comp-beta', 'Beta Solutions', 'Customer', NULL),
('comp-gamma', 'Gamma Industries', 'Customer', NULL);

-- Insert default admin user
INSERT INTO users (id, firstName, lastName, email, companyId, role, loginTime) VALUES
('admin', 'Admin', 'User', 'admin@hypertec.example', 'comp-hypertec', 'Hypertec Admin', NOW());

-- Insert sample records
INSERT INTO records (id, recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount) VALUES
('rec1', 'Software License', 'Alpha Corp', 'Partner X', 'HYP-SFW-1Y', 'SN12345678', '2025-08-15', 'Active', 5, '2024-08-10', '2024-08-14', 'HEL1001', 'PO-PX-001', 'EU-Alpha-01', TRUE, 'Download from portal: portal.hypertec.com/downloads/sfw1', NULL, 0),
('rec2', 'Software License', 'Beta Solutions', 'Partner Y', 'HYP-HDW-3Y', 'SN87654321', '2025-06-30', 'Expiring Soon', 1, '2022-06-25', '2022-06-28', 'HEL1002', 'PO-PY-005', 'EU-Beta-05', TRUE, 'See attached PDF for setup.', NULL, 0),
('rec5', 'Service Voucher', 'Alpha Corp', 'Partner X', 'HYP-SVC-STD', NULL, '2025-10-31', 'Active', 10, '2024-10-15', '2024-10-20', 'HEL2001', 'PO-PX-003', 'EU-Alpha-02', TRUE, 'Redeem at redeem.hypertec.com', '["VCA001", "VCA002", "VCA003", "VCA004", "VCA005", "VCA006", "VCA007", "VCA008", "VCA009", "VCA010"]', 3);

-- Insert default email templates
INSERT INTO emailTemplates (id, name, type, interval, enabled, subject, body) VALUES
('software_90day', 'Software License - 90 Days', 'software', '90days', TRUE, 'Reminder: Your Hypertec Renewal for {{productName}}', 'Dear {{customerName}},\n\nThis is a reminder that your Hypertec license for {{productName}} (Serial: {{serialNumber}}) is due for renewal on {{expiryDate}}.\n\nPlease contact us or your partner {{partnerName}} to arrange your renewal.\n\nInstructions: {{instructions}}\n\nThanks,\nThe Hypertec Team'),
('software_60day', 'Software License - 60 Days', 'software', '60days', TRUE, 'Reminder: Your Hypertec Renewal for {{productName}}', 'Dear {{customerName}},\n\nThis is a reminder that your Hypertec license for {{productName}} (Serial: {{serialNumber}}) is due for renewal on {{expiryDate}}.\n\nPlease contact us or your partner {{partnerName}} to arrange your renewal.\n\nInstructions: {{instructions}}\n\nThanks,\nThe Hypertec Team'),
('voucher_monthly', 'Service Voucher - Monthly', 'voucher', 'monthly', TRUE, 'Reminder: Unused Hypertec Service Vouchers', 'Dear {{customerName}},\n\nYou have {{unclaimedCount}} unused service voucher(s) associated with HEL ref {{helReference}} (Your ref: {{endUserRef}}) expiring on {{expiryDate}}.\n\n{{callToAction}}\n\nThanks,\nThe Hypertec Team');

-- Create indexes for better performance
CREATE INDEX idx_records_customer ON records(customerName);
CREATE INDEX idx_records_partner ON records(partnerName);
CREATE INDEX idx_records_renewal_due ON records(renewalDue);
CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_type ON records(recordType);
CREATE INDEX idx_users_company ON users(companyId);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_email_logs_recipient ON emailLogs(recipient);
CREATE INDEX idx_email_logs_timestamp ON emailLogs(timestamp);
