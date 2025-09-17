-- Create tables for Hypertec Renewals Platform
USE hypertec_renewals;

-- Records table
CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recordType VARCHAR(50),
    customerName VARCHAR(255),
    partnerName VARCHAR(255),
    partcode VARCHAR(100),
    serial VARCHAR(100),
    renewalDue DATE,
    status VARCHAR(50),
    licenses INT,
    dateOfOrder DATE,
    dateOfIssue DATE,
    helReference VARCHAR(100),
    resellerOrderNum VARCHAR(100),
    endUserRef VARCHAR(100),
    renewalEnabled BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    voucherCodes JSON,
    claimedCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Hypertec Admin', 'Partner', 'Customer') DEFAULT 'Customer',
    companyId VARCHAR(50),
    loginTime VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Admin', 'Partner', 'Customer') DEFAULT 'Customer',
    resellerEmail VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient VARCHAR(255),
    subject VARCHAR(500),
    status VARCHAR(50),
    templateUsed VARCHAR(100),
    body TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (id, firstName, lastName, email, role, companyId, loginTime) VALUES 
('admin', 'Admin', 'User', 'admin@hypertec.example', 'Hypertec Admin', 'comp-hypertec', '2025-09-15 14:30:00'),
('partnerX', 'PartnerX', 'Rep', 'user@partnerx.example', 'Partner', 'comp-px', '2025-09-15 13:30:00'),
('customerAlpha', 'Alpha', 'Contact', 'user@alpha.example', 'Customer', 'comp-alpha', '2025-09-15 14:29:30');

INSERT INTO companies (id, name, type, resellerEmail) VALUES 
('comp-hypertec', 'Hypertec (Internal)', 'Admin', NULL),
('comp-px', 'Partner X', 'Partner', 'contact@partnerx.example'),
('comp-py', 'Partner Y', 'Partner', 'sales@partnery.example'),
('comp-alpha', 'Alpha Corp', 'Customer', NULL),
('comp-beta', 'Beta Solutions', 'Customer', NULL),
('comp-gamma', 'Gamma Industries', 'Customer', NULL),
('comp-delta', 'Delta Systems', 'Customer', NULL),
('comp-epsilon', 'Epsilon Ltd', 'Customer', NULL),
('comp-zeta', 'Zeta Components', 'Customer', NULL);

INSERT INTO email_templates (name, subject, body, isActive) VALUES 
('Renewal Reminder', 'Your Software License Renewal is Due', 'Dear {{customerName}},\n\nYour software license renewal is due on {{renewalDue}}. Please contact us to renew your {{licenses}} licenses.\n\nBest regards,\nHypertec Team', TRUE);

INSERT INTO records (id, recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount) VALUES 
('rec1', 'Software License', 'Alpha Corp', 'Partner X', 'HYP-SFW-1Y', 'SN12345678', '2025-08-15', 'Active', 5, '2024-08-10', '2024-08-14', 'HEL1001', 'PO-PX-001', 'EU-Alpha-01', TRUE, 'Download from portal: portal.hypertec.com/downloads/sfw1', '[]', 0),
('rec2', 'Software License', 'Beta Solutions', 'Partner Y', 'HYP-HDW-3Y', 'SN87654321', '2025-06-30', 'Expiring Soon', 1, '2022-06-25', '2022-06-28', 'HEL1002', 'PO-PY-005', 'EU-Beta-05', TRUE, 'See attached PDF for setup.', '[]', 0),
('rec3', 'Software License', 'Gamma Industries', 'Partner X', 'HYP-CLD-M', 'SNABCDEFGH', '2026-01-10', 'Active', 20, '2025-01-05', '2025-01-09', 'HEL1003', 'PO-PX-002', 'EU-Gamma-10', FALSE, 'Cloud access auto-provisioned.', '[]', 0),
('rec4', 'Software License', 'Delta Systems', NULL, 'HYP-SFW-1Y', 'SNIJKLMNOP', '2025-05-01', 'Expired', 2, '2024-04-20', '2024-04-25', 'HEL1004', NULL, 'EU-Delta-15', TRUE, 'Download from portal: portal.hypertec.com/downloads/sfw1', '[]', 0),
('rec5', 'Service Voucher', 'Alpha Corp', 'Partner X', 'HYP-SVC-STD', NULL, '2025-10-31', 'Active', 10, '2024-10-15', '2024-10-20', 'HEL2001', 'PO-PX-003', 'EU-Alpha-02', TRUE, 'Redeem at redeem.hypertec.com', '["VCA001","VCA002","VCA003","VCA004","VCA005","VCA006","VCA007","VCA008","VCA009","VCA010"]', 3),
('rec6', 'Service Voucher', 'Epsilon Ltd', 'Partner Y', 'HYP-SVC-PREM', NULL, '2025-12-31', 'Active', 5, '2024-12-10', '2024-12-18', 'HEL2002', 'PO-PY-010', 'EU-Eps-20', TRUE, 'Contact support@hypertec.com to redeem.', '["VCE001","VCE002","VCE003","VCE004","VCE005"]', 0);

INSERT INTO email_logs (id, recipient, subject, status, templateUsed, body) VALUES 
('log1', 'user@beta.example', 'Reminder: Your Hypertec Renewal for HYP-HDW-3Y', 'Sent', 'software_60day', 'Dear Beta Solutions,\n\nThis is a reminder that your Hypertec license for HYP-HDW-3Y (Serial: SN87654321) is due for renewal on 2025-06-30.\n\nPlease contact us or your partner Partner Y to arrange your renewal.\n\nInstructions: See attached PDF for setup.\n\nThanks,\nThe Hypertec Team'),
('log2', 'user@alpha.example', 'Reminder: Your Hypertec Renewal for HYP-SFW-1Y', 'Sent', 'software_90day', 'Dear Alpha Corp,\n\nThis is a reminder that your Hypertec license for HYP-SFW-1Y (Serial: SN12345678) is due for renewal on 2025-08-15.\n\nPlease contact us or your partner Partner X to arrange your renewal.\n\nInstructions: Download from portal: portal.hypertec.com/downloads/sfw1\n\nThanks,\nThe Hypertec Team'),
('log3', 'user@epsilon.example', 'Reminder: Your Hypertec Renewal for HYP-SVC-PREM', 'Failed', 'software_90day', 'Dear Epsilon Ltd,\n\nThis is a reminder that your Hypertec license for HYP-SVC-PREM is due for renewal on 2025-12-31.\n\nPlease contact us or your partner Partner Y to arrange your renewal.\n\nInstructions: Contact support@hypertec.com to redeem.\n\nThanks,\nThe Hypertec Team'),
('log4', 'user@gamma.example', 'Reminder: Your Hypertec Renewal for HYP-CLD-M', 'Sent', 'software_90day', 'Dear Gamma Industries,\n\nThis is a reminder that your Hypertec license for HYP-CLD-M (Serial: SNABCDEFGH) is due for renewal on 2026-01-10.\n\nPlease contact us or your partner Partner X to arrange your renewal.\n\nInstructions: Cloud access auto-provisioned.\n\nThanks,\nThe Hypertec Team'),
('log5', 'user@alpha.example', 'Reminder: Unused Hypertec Service Vouchers', 'Sent', 'voucher_monthly', 'Dear Alpha Corp,\n\nYou have 7 unused service vouchers associated with HEL ref HEL2001 (Your ref: EU-Alpha-02) expiring on 2025-10-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team'),
('log6', 'user@epsilon.example', 'Reminder: Unused Hypertec Service Vouchers', 'Sent', 'voucher_initial', 'Dear Epsilon Ltd,\n\nYou have 5 unused service vouchers associated with HEL ref HEL2002 (Your ref: EU-Eps-20) expiring on 2025-12-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team');

