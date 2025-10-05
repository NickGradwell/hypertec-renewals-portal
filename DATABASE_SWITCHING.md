# 🔄 Database Switching Guide

This project supports switching between different database configurations for testing both local and Azure environments.

## 🎯 Available Configurations

### 1. **SQLite (Default)**
- **Purpose**: Local development with sample data
- **Database**: Local SQLite file (`data/local.db`)
- **Use Case**: Quick development and testing

### 2. **MySQL Local**
- **Purpose**: Connect to Azure MySQL from local development
- **Database**: Azure Database for MySQL
- **Use Case**: Test against production database structure

### 3. **MySQL Production**
- **Purpose**: Production deployment
- **Database**: Azure Database for MySQL via Key Vault
- **Use Case**: Production environment

## 🚀 Quick Start

### Switch to SQLite (Local Development)
```bash
node switch-database.js sqlite
```

### Switch to MySQL (Azure Database)
```bash
node switch-database.js mysql-local
```

### Switch to Production MySQL
```bash
node switch-database.js mysql-production
```

## ⚙️ Configuration Setup

### 1. Azure MySQL Credentials

The Azure MySQL database is already configured with the following credentials:

```json
{
  "mysql-local": {
    "description": "Local MySQL connection to Azure database",
    "environment": {
      "DATABASE_TYPE": "mysql",
      "MYSQL_HOST": "hypertec-renewals-mysql.mysql.database.azure.com",
      "MYSQL_USER": "hypertecadmin",
      "MYSQL_PASSWORD": "MyNewPassword123!",
      "MYSQL_DATABASE": "hypertec_renewals",
      "MYSQL_PORT": "3306",
      "MYSQL_SSL": "true"
    }
  }
}
```

**🔐 Current Azure MySQL Configuration:**
- **Server**: `hypertec-renewals-mysql.mysql.database.azure.com`
- **Username**: `hypertecadmin`
- **Password**: `MyNewPassword123!`
- **Database**: `hypertec_renewals`
- **Port**: `3306`
- **SSL**: Required (enabled)

### 2. Update Key Vault URL

For production configuration, update the Key Vault URL:

```json
{
  "mysql-production": {
    "description": "Production MySQL via Azure Key Vault",
    "environment": {
      "DATABASE_TYPE": "mysql",
      "KEY_VAULT_URL": "https://your-actual-keyvault.vault.azure.net/"
    }
  }
}
```

## 🗄️ Database Status

### Current Database Setup
- **SQLite**: ✅ Working with sample data (3 records, 2 users, 6 companies)
- **Azure MySQL**: ✅ Working with full schema and data (7 records, 2 users, 14 companies)

### Database Schema
Both databases now have identical schemas with the following tables:
- `records` - License and voucher records
- `users` - User accounts  
- `companies` - Company information
- `email_templates` - Email templates
- `email_logs` - Email sending logs

## 🧪 Testing Database Connections

### Check Current Configuration
```bash
curl http://localhost:3001/api/database/info
```

### Test Database Connection
```bash
curl http://localhost:3001/api/database/test
```

### Get Sample Data
```bash
# Get all records
curl http://localhost:3001/api/records

# Get all users
curl http://localhost:3001/api/users

# Get all companies
curl http://localhost:3001/api/companies
```

## 📋 Step-by-Step Workflow

### 1. Start with SQLite
```bash
# Switch to SQLite
node switch-database.js sqlite

# Start local server
node local-api-server.js

# Test connection
curl http://localhost:3001/api/database/test
```

### 2. Switch to Azure MySQL
```bash
# Switch to MySQL
node switch-database.js mysql-local

# Restart server
node local-api-server.js

# Test connection
curl http://localhost:3001/api/database/test
```

### 3. Compare Data
```bash
# Get records from current database
curl http://localhost:3001/api/records
```

## 🔧 Troubleshooting

### Connection Issues
1. **Check credentials**: Verify MySQL host, user, password
2. **Check network**: Ensure you can reach the Azure MySQL server
3. **Check SSL**: Azure MySQL requires SSL connections

### Environment Variables
The switching script updates `api/local.settings.json`. After switching:
1. Restart your server
2. Check the database info endpoint
3. Test the connection

### Common Errors
- **"Connection refused"**: Check host and port
- **"Access denied"**: Check username and password
- **"SSL required"**: Ensure `MYSQL_SSL=true`

## 📊 Database Schema

Both SQLite and MySQL use the same schema:
- `records` - License and voucher records
- `users` - User accounts
- `companies` - Company information
- `email_templates` - Email templates
- `email_logs` - Email sending logs

## 🛠️ Setup Scripts

### Database Schema Setup
If you need to recreate the Azure MySQL database schema:

```bash
# Set up MySQL schema (run once)
node setup-mysql-schema.js

# Verify and fix schema issues
node fix-mysql-schema.js
```

### Clean Up Scripts
```bash
# Remove setup scripts after use (optional)
rm setup-mysql-schema.js fix-mysql-schema.js
```

## 🎯 Best Practices

1. **Development**: Use SQLite for quick iteration
2. **Testing**: Use MySQL-local to test against production schema
3. **Production**: Use MySQL-production with Key Vault
4. **Always test**: Use the test endpoints after switching
5. **Backup**: Keep your SQLite database as a backup
6. **Schema sync**: Both databases now have identical schemas

## 🔍 Monitoring

### Database Info Endpoint
```bash
curl http://localhost:3001/api/database/info
```

Response:
```json
{
  "success": true,
  "data": {
    "type": "mysql",
    "isLocal": true,
    "useSQLite": false,
    "useMySQL": true,
    "environment": "development"
  }
}
```

### Connection Test Endpoint
```bash
curl http://localhost:3001/api/database/test
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "type": "MySQL",
    "message": "MySQL connection successful",
    "testResult": { "test": 1 }
  }
}
```
