-- Add missing columns to match frontend form fields
-- Run this script against your Azure MySQL database

USE hypertec_renewals;

-- Add missing columns to companies table
ALTER TABLE companies 
ADD COLUMN contactEmail VARCHAR(255) AFTER resellerEmail,
ADD COLUMN contactPhone VARCHAR(64) AFTER contactEmail,
ADD COLUMN address TEXT AFTER contactPhone;

-- Update existing companies to copy resellerEmail to contactEmail
UPDATE companies SET contactEmail = resellerEmail WHERE resellerEmail IS NOT NULL;

-- Verify the changes
DESCRIBE companies;
DESCRIBE users;
