const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
async function getConnection() {
    return await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'hypertec-renewals-mysql.mysql.database.azure.com',
        user: process.env.MYSQL_USER || 'hypertecadmin',
        password: process.env.MYSQL_PASSWORD || 'MyNewPassword123!',
        database: process.env.MYSQL_DATABASE || 'hypertec_renewals',
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        ssl: { rejectUnauthorized: false }
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

// Records endpoint
app.get('/api/records', async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM records ORDER BY createdAt DESC LIMIT 10');
        await connection.end();
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM users ORDER BY createdAt DESC');
        await connection.end();
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const connection = await getConnection();
        
        // Split name into firstName and lastName
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const [result] = await connection.execute(
            'INSERT INTO users (id, firstName, lastName, email, companyId, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [`user-${Date.now()}`, firstName, lastName, email, 'comp-hypertec', role]
        );
        await connection.end();
        
        res.json({
            success: true,
            data: { id: `user-${Date.now()}`, name, email, role }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user',
            message: error.message
        });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const connection = await getConnection();
        
        // Split name into firstName and lastName
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await connection.execute(
            'UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, updatedAt = NOW() WHERE id = ?',
            [firstName, lastName, email, role, id]
        );
        await connection.end();
        
        res.json({
            success: true,
            data: { id, name, email, role }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user',
            message: error.message
        });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        await connection.end();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user',
            message: error.message
        });
    }
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM companies ORDER BY createdAt DESC');
        await connection.end();
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Create company
app.post('/api/companies', async (req, res) => {
    try {
        const { name, contactEmail } = req.body;
        const connection = await getConnection();
        
        const [result] = await connection.execute(
            'INSERT INTO companies (id, name, type, resellerEmail, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [`comp-${Date.now()}`, name, 'Customer', contactEmail]
        );
        await connection.end();
        
        res.json({
            success: true,
            data: { id: `comp-${Date.now()}`, name, contactEmail }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create company',
            message: error.message
        });
    }
});

// Update company
app.put('/api/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactEmail } = req.body;
        const connection = await getConnection();
        
        await connection.execute(
            'UPDATE companies SET name = ?, resellerEmail = ?, updatedAt = NOW() WHERE id = ?',
            [name, contactEmail, id]
        );
        await connection.end();
        
        res.json({
            success: true,
            data: { id, name, contactEmail }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update company',
            message: error.message
        });
    }
});

// Delete company
app.delete('/api/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        
        await connection.execute('DELETE FROM companies WHERE id = ?', [id]);
        await connection.end();
        
        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete company',
            message: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Simple Express API working!',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple API server running on port ${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`  GET    /api/health`);
    console.log(`  GET    /api/test`);
    console.log(`  GET    /api/records`);
    console.log(`  GET    /api/users`);
    console.log(`  POST   /api/users`);
    console.log(`  PUT    /api/users/:id`);
    console.log(`  DELETE /api/users/:id`);
    console.log(`  GET    /api/companies`);
    console.log(`  POST   /api/companies`);
    console.log(`  PUT    /api/companies/:id`);
    console.log(`  DELETE /api/companies/:id`);
});
