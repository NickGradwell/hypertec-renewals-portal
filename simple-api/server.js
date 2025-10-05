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

// Users endpoint
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

// Companies endpoint
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
    console.log(`  GET    /api/companies`);
});
