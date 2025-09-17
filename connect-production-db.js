#!/usr/bin/env node

const mysql = require('mysql2/promise');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

async function connectToProductionDB() {
  try {
    console.log('🔐 Retrieving database credentials from Azure Key Vault...');
    
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://hypertec-renewals-kv.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);

    const dbHost = await secretClient.getSecret('db-host');
    const dbUser = await secretClient.getSecret('db-user');
    const dbPassword = await secretClient.getSecret('db-password');
    const dbName = await secretClient.getSecret('db-name');

    console.log('✅ Credentials retrieved successfully!');
    console.log(`📊 Host: ${dbHost.value}`);
    console.log(`👤 User: ${dbUser.value}`);
    console.log(`🗄️  Database: ${dbName.value}`);
    
    const connection = await mysql.createConnection({
      host: dbHost.value,
      user: dbUser.value,
      password: dbPassword.value,
      database: dbName.value,
      ssl: { rejectUnauthorized: false }
    });

    console.log('🚀 Connected to production database successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM records');
    console.log(`📈 Total records in production: ${rows[0].total}`);
    
    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('✅ Connection closed.');
    
  } catch (error) {
    console.error('❌ Error connecting to production database:', error.message);
    process.exit(1);
  }
}

connectToProductionDB();


