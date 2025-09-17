#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔌 Testing MySQL Workbench connection parameters...');
  console.log('');
  
  const connectionConfig = {
    host: 'hypertec-renewals-mysql.mysql.database.azure.com',
    port: 3306,
    user: 'hypertecadmin',
    password: 'Hypertec2024!',
    database: 'hypertec_renewals',
    ssl: { rejectUnauthorized: false }
  };
  
  console.log('📋 Connection Details:');
  console.log(`   Host: ${connectionConfig.host}`);
  console.log(`   Port: ${connectionConfig.port}`);
  console.log(`   User: ${connectionConfig.user}`);
  console.log(`   Database: ${connectionConfig.database}`);
  console.log(`   SSL: Enabled`);
  console.log('');
  
  try {
    console.log('🔄 Attempting connection...');
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log('✅ Connection successful!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM records');
    console.log(`📊 Records in database: ${rows[0].count}`);
    
    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('');
    console.log('🎉 Connection test completed successfully!');
    console.log('💡 These exact parameters should work in MySQL Workbench.');
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting steps:');
    console.log('   1. Verify SSL is enabled in MySQL Workbench');
    console.log('   2. Check firewall settings');
    console.log('   3. Ensure MySQL Workbench version supports SSL');
  }
}

testConnection();


