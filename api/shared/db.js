const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const path = require('path');

let pool = null;
let sqliteDb = null;

// Check if we're running locally
const isLocal = process.env.NODE_ENV === 'development' || process.env.AZURE_FUNCTIONS_ENVIRONMENT !== 'Production';

async function getDbPool() {
  if (isLocal) {
    // Use SQLite for local development
    if (!sqliteDb) {
      const dbPath = path.join(__dirname, '../../data/local.db');
      sqliteDb = new Database(dbPath);
      
      // Initialize database schema
      await initializeLocalDatabase(sqliteDb);
    }
    return sqliteDb;
  } else {
    // Use MySQL for production
    if (!pool) {
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = process.env.KEY_VAULT_URL;
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      const dbHost = await secretClient.getSecret('db-host');
      const dbUser = await secretClient.getSecret('db-user');
      const dbPassword = await secretClient.getSecret('db-password');
      const dbName = await secretClient.getSecret('db-name');
      
      pool = mysql.createPool({
        host: dbHost.value,
        user: dbUser.value,
        password: dbPassword.value,
        database: dbName.value,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return pool;
  }
}

async function initializeLocalDatabase(db) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      recordType TEXT,
      customerName TEXT,
      partnerName TEXT,
      partcode TEXT,
      serial TEXT,
      renewalDue TEXT,
      status TEXT,
      licenses INTEGER,
      dateOfOrder TEXT,
      dateOfIssue TEXT,
      helReference TEXT,
      resellerOrderNum TEXT,
      endUserRef TEXT,
      renewalEnabled BOOLEAN,
      instructions TEXT,
      voucherCodes TEXT,
      claimedCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'Customer',
      companyId TEXT,
      loginTime TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT DEFAULT 'Customer',
      resellerEmail TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      subject TEXT,
      body TEXT,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      recipient TEXT,
      subject TEXT,
      status TEXT,
      templateUsed TEXT,
      body TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data
  const sampleRecords = db.prepare(`
    INSERT OR IGNORE INTO records 
    (id, recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleUsers = db.prepare(`
    INSERT OR IGNORE INTO users (id, firstName, lastName, email, role, companyId, loginTime) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleCompanies = db.prepare(`
    INSERT OR IGNORE INTO companies (id, name, type, resellerEmail) VALUES (?, ?, ?, ?)
  `);

  const sampleTemplates = db.prepare(`
    INSERT OR IGNORE INTO email_templates (name, subject, body, isActive) VALUES (?, ?, ?, ?)
  `);

  const sampleEmailLogs = db.prepare(`
    INSERT OR IGNORE INTO email_logs (id, recipient, subject, status, templateUsed, body) VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Sample data
  sampleRecords.run(
    'rec1', 'Software License', 'Alpha Corp', 'Partner X', 'HYP-SFW-1Y', 'SN12345678', 
    '2025-08-15', 'Active', 5, '2024-08-10', '2024-08-14', 'HEL1001', 
    'PO-PX-001', 'EU-Alpha-01', 1, 'Download from portal: portal.hypertec.com/downloads/sfw1', '[]', 0
  );

  sampleRecords.run(
    'rec2', 'Software License', 'Beta Solutions', 'Partner Y', 'HYP-HDW-3Y', 'SN87654321', 
    '2025-06-30', 'Expiring Soon', 1, '2022-06-25', '2022-06-28', 'HEL1002', 
    'PO-PY-005', 'EU-Beta-05', 1, 'See attached PDF for setup.', '[]', 0
  );

  sampleRecords.run(
    'rec5', 'Service Voucher', 'Alpha Corp', 'Partner X', 'HYP-SVC-STD', null, 
    '2025-10-31', 'Active', 10, '2024-10-15', '2024-10-20', 'HEL2001', 
    'PO-PX-003', 'EU-Alpha-02', 1, 'Redeem at redeem.hypertec.com', '["VCA001","VCA002","VCA003","VCA004","VCA005","VCA006","VCA007","VCA008","VCA009","VCA010"]', 3
  );

  sampleUsers.run('admin', 'Admin', 'User', 'admin@hypertec.example', 'Hypertec Admin', 'comp-hypertec', '2025-09-15 14:30:00');
  sampleUsers.run('partnerX', 'PartnerX', 'Rep', 'user@partnerx.example', 'Partner', 'comp-px', '2025-09-15 13:30:00');
  sampleUsers.run('customerAlpha', 'Alpha', 'Contact', 'user@alpha.example', 'Customer', 'comp-alpha', '2025-09-15 14:29:30');

  sampleCompanies.run('comp-hypertec', 'Hypertec (Internal)', 'Admin', null);
  sampleCompanies.run('comp-px', 'Partner X', 'Partner', 'contact@partnerx.example');
  sampleCompanies.run('comp-py', 'Partner Y', 'Partner', 'sales@partnery.example');
  sampleCompanies.run('comp-alpha', 'Alpha Corp', 'Customer', null);
  sampleCompanies.run('comp-beta', 'Beta Solutions', 'Customer', null);

  sampleTemplates.run(
    'Renewal Reminder', 
    'Your Software License Renewal is Due Soon', 
    'Dear {{customerName}},\n\nYour software license renewal is due on {{renewalDue}}. Please contact us to renew your license.\n\nBest regards,\nHypertec Team',
    1
  );

  sampleEmailLogs.run(
    'log1', 'user@beta.example', 'Reminder: Your Hypertec Renewal for HYP-HDW-3Y', 'Sent', 'software_60day',
    'Dear Beta Solutions,\n\nThis is a reminder that your Hypertec license for HYP-HDW-3Y (Serial: SN87654321) is due for renewal on 2025-06-30.\n\nPlease contact us or your partner Partner Y to arrange your renewal.\n\nInstructions: See attached PDF for setup.\n\nThanks,\nThe Hypertec Team'
  );

  sampleEmailLogs.run(
    'log5', 'user@alpha.example', 'Reminder: Unused Hypertec Service Vouchers', 'Sent', 'voucher_monthly',
    'Dear Alpha Corp,\n\nYou have 7 unused service vouchers associated with HEL ref HEL2001 (Your ref: EU-Alpha-02) expiring on 2025-10-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team'
  );
}

// Helper function to execute queries that work with both SQLite and MySQL
async function executeQuery(query, params = []) {
  const db = await getDbPool();
  
  if (isLocal) {
    // SQLite
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      return [db.prepare(query).all(...params)];
    } else {
      const stmt = db.prepare(query);
      return [stmt.run(...params)];
    }
  } else {
    // MySQL
    return await db.execute(query, params);
  }
}

module.exports = { getDbPool, executeQuery };
