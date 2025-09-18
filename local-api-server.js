const express = require('express');
const cors = require('cors');
const { getDbPool } = require('./api/shared/db');

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
    const db = await getDbPool();
    const rows = db.prepare('SELECT * FROM records ORDER BY createdAt DESC').all();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const recordData = req.body;
    const db = await getDbPool();
    
    const stmt = db.prepare(`
      INSERT INTO records (recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      recordData.recordType, recordData.customerName, recordData.partnerName, 
      recordData.partcode, recordData.serial, recordData.renewalDue, 
      recordData.status, recordData.licenses, recordData.dateOfOrder, 
      recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
      recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
      JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0
    );
    
    res.status(201).json({ 
      success: true, 
      data: { id: result.lastInsertRowid, ...recordData }
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
    const db = await getDbPool();
    
    const stmt = db.prepare(`
      UPDATE records SET 
      recordType = ?, customerName = ?, partnerName = ?, partcode = ?, serial = ?, 
      renewalDue = ?, status = ?, licenses = ?, dateOfOrder = ?, dateOfIssue = ?, 
      helReference = ?, resellerOrderNum = ?, endUserRef = ?, renewalEnabled = ?, 
      instructions = ?, voucherCodes = ?, claimedCount = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      recordData.recordType, recordData.customerName, recordData.partnerName, 
      recordData.partcode, recordData.serial, recordData.renewalDue, 
      recordData.status, recordData.licenses, recordData.dateOfOrder, 
      recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
      recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
      JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0,
      recordId
    );
    
    res.json({ success: true, data: { id: recordId, ...recordData } });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const db = await getDbPool();
    
    const stmt = db.prepare('DELETE FROM records WHERE id = ?');
    stmt.run(recordId);
    
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const db = await getDbPool();
    const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const db = await getDbPool();
    
    const stmt = db.prepare('INSERT INTO users (email, name, role) VALUES (?, ?, ?)');
    const result = stmt.run(userData.email, userData.name, userData.role || 'user');
    
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid, ...userData } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const db = await getDbPool();
    
    const stmt = db.prepare('UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?');
    stmt.run(userData.email, userData.name, userData.role, userId);
    
    res.json({ success: true, data: { id: userId, ...userData } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const db = await getDbPool();
    
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const db = await getDbPool();
    const rows = db.prepare('SELECT * FROM companies ORDER BY createdAt DESC').all();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const companyData = req.body;
    const db = await getDbPool();
    
    const stmt = db.prepare('INSERT INTO companies (name, contactEmail, contactPhone, address) VALUES (?, ?, ?, ?)');
    const result = stmt.run(companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address);
    
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid, ...companyData } });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyData = req.body;
    const db = await getDbPool();
    
    const stmt = db.prepare('UPDATE companies SET name = ?, contactEmail = ?, contactPhone = ?, address = ? WHERE id = ?');
    stmt.run(companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address, companyId);
    
    res.json({ success: true, data: { id: companyId, ...companyData } });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    const db = await getDbPool();
    
    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    stmt.run(companyId);
    
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Email Templates endpoints
app.get('/api/email-templates', async (req, res) => {
  try {
    const db = await getDbPool();
    const rows = db.prepare('SELECT * FROM email_templates ORDER BY createdAt DESC').all();
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
    const db = await getDbPool();
    
    const stmt = db.prepare('UPDATE email_templates SET name = ?, subject = ?, body = ?, isActive = ? WHERE id = ?');
    stmt.run(templateData.name, templateData.subject, templateData.body, templateData.isActive, templateId);
    
    res.json({ success: true, data: { id: templateId, ...templateData } });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Email Logs endpoints
app.get('/api/email-logs', async (req, res) => {
  try {
    const db = await getDbPool();
    const rows = db.prepare(`
      SELECT el.*, et.name as templateName 
      FROM email_logs el 
      LEFT JOIN email_templates et ON el.templateId = et.id 
      ORDER BY el.sentAt DESC
    `).all();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/email-logs/:id/resend', async (req, res) => {
  try {
    const logId = req.params.id;
    const db = await getDbPool();
    
    // Update the status to indicate resend
    const stmt = db.prepare('UPDATE email_logs SET status = ? WHERE id = ?');
    stmt.run('Resent', logId);
    
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
  });
}

startServer().catch(console.error);
