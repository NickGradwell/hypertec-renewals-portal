import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { getDbPool, getDatabaseInfo, testConnection, executeQuery } from './api/shared/db.js';

// Load environment variables from local.settings.json
const loadLocalSettings = () => {
  try {
    const settingsPath = './api/local.settings.json';
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    
    // Set environment variables
    Object.entries(settings.Values).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    
    console.log('📋 Loaded environment variables from local.settings.json');
    console.log(`🗄️  Database Type: ${process.env.DATABASE_TYPE || 'sqlite'}`);
  } catch (error) {
    console.log('⚠️  Could not load local.settings.json, using default environment');
  }
};

// Load settings before importing database module
loadLocalSettings();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await getDbPool(); // This will initialize the SQLite database
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Routes
app.get('/api/records', async (req, res) => {
  try {
    const [rows] = await executeQuery('SELECT * FROM records ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const recordData = req.body;
    
    const [result] = await executeQuery(`
      INSERT INTO records (recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      recordData.recordType, recordData.customerName, recordData.partnerName, 
      recordData.partcode, recordData.serial, recordData.renewalDue, 
      recordData.status, recordData.licenses, recordData.dateOfOrder, 
      recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
      recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
      JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0
    ]);
    
    res.status(201).json({ 
      success: true, 
      data: { id: result.insertId || result.lastInsertRowid, ...recordData }
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/records/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const recordData = req.body;
    
    await executeQuery(`
      UPDATE records SET 
      recordType = ?, customerName = ?, partnerName = ?, partcode = ?, serial = ?, 
      renewalDue = ?, status = ?, licenses = ?, dateOfOrder = ?, dateOfIssue = ?, 
      helReference = ?, resellerOrderNum = ?, endUserRef = ?, renewalEnabled = ?, 
      instructions = ?, voucherCodes = ?, claimedCount = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      recordData.recordType, recordData.customerName, recordData.partnerName, 
      recordData.partcode, recordData.serial, recordData.renewalDue, 
      recordData.status, recordData.licenses, recordData.dateOfOrder, 
      recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
      recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
      JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0,
      recordId
    ]);
    
    res.json({ success: true, data: { id: recordId, ...recordData } });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    
    await executeQuery('DELETE FROM records WHERE id = ?', [recordId]);
    
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await executeQuery('SELECT * FROM users ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    const [result] = await executeQuery('INSERT INTO users (email, name, role) VALUES (?, ?, ?)', [userData.email, userData.name, userData.role || 'user']);
    
    res.status(201).json({ success: true, data: { id: result.insertId || result.lastInsertRowid, ...userData } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    await executeQuery('UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?', [userData.email, userData.name, userData.role, userId]);
    
    res.json({ success: true, data: { id: userId, ...userData } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await executeQuery('SELECT * FROM companies ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const companyData = req.body;
    
    const [result] = await executeQuery('INSERT INTO companies (name, contactEmail, contactPhone, address) VALUES (?, ?, ?, ?)', [companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address]);
    
    res.status(201).json({ success: true, data: { id: result.insertId || result.lastInsertRowid, ...companyData } });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyData = req.body;
    
    await executeQuery('UPDATE companies SET name = ?, contactEmail = ?, contactPhone = ?, address = ? WHERE id = ?', [companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address, companyId]);
    
    res.json({ success: true, data: { id: companyId, ...companyData } });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    await executeQuery('DELETE FROM companies WHERE id = ?', [companyId]);
    
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Email Templates endpoints
app.get('/api/email-templates', async (req, res) => {
  try {
    const [rows] = await executeQuery('SELECT * FROM email_templates ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/email-templates/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templateData = req.body;
    
    await executeQuery('UPDATE email_templates SET name = ?, subject = ?, body = ?, isActive = ? WHERE id = ?', [templateData.name, templateData.subject, templateData.body, templateData.isActive, templateId]);
    
    res.json({ success: true, data: { id: templateId, ...templateData } });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Email Logs endpoints
app.get('/api/email-logs', async (req, res) => {
  try {
    const [rows] = await executeQuery(`
      SELECT el.*, et.name as templateName 
      FROM email_logs el 
      LEFT JOIN email_templates et ON el.templateId = et.id 
      ORDER BY el.sentAt DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/email-logs/:id/resend', async (req, res) => {
  try {
    const logId = req.params.id;
    
    // Update the status to indicate resend
    await executeQuery('UPDATE email_logs SET status = ? WHERE id = ?', ['Resent', logId]);
    
    res.json({ success: true, message: 'Email resent successfully' });
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// File Upload endpoint (mock implementation)
app.post('/api/upload', async (req, res) => {
  try {
    // Mock file upload response
    res.json({ 
      success: true, 
      data: { 
        filename: 'uploaded-file.csv',
        recordsProcessed: 5,
        message: 'File uploaded and processed successfully'
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Database management endpoints
app.get('/api/database/info', (req, res) => {
  try {
    const dbInfo = getDatabaseInfo();
    res.json({ success: true, data: dbInfo });
  } catch (error) {
    console.error('Error getting database info:', error);
    res.status(500).json({ success: false, error: 'Failed to get database info' });
  }
});

app.get('/api/database/test', async (req, res) => {
  try {
    const testResult = await testConnection();
    res.status(testResult.success ? 200 : 500).json({ 
      success: testResult.success, 
      data: testResult 
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({ success: false, error: 'Failed to test database connection' });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(port, () => {
    console.log(`Local API server running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  GET    /api/records');
    console.log('  POST   /api/records');
    console.log('  PUT    /api/records/:id');
    console.log('  DELETE /api/records/:id');
    console.log('  GET    /api/users');
    console.log('  POST   /api/users');
    console.log('  PUT    /api/users/:id');
    console.log('  DELETE /api/users/:id');
    console.log('  GET    /api/companies');
    console.log('  POST   /api/companies');
    console.log('  PUT    /api/companies/:id');
    console.log('  DELETE /api/companies/:id');
    console.log('  GET    /api/email-templates');
    console.log('  PUT    /api/email-templates/:id');
    console.log('  GET    /api/email-logs');
    console.log('  POST   /api/email-logs/:id/resend');
    console.log('  POST   /api/upload');
    console.log('  GET    /api/database/info');
    console.log('  GET    /api/database/test');
    console.log('');
    console.log('🔄 Database switching: node switch-database.js <config>');
    console.log('📖 Documentation: see DATABASE_SWITCHING.md');
  });
}

startServer().catch(console.error);
