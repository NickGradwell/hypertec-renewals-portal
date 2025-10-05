# 🚀 Hypertec Renewals Portal - Developer Guide

## 📋 Project Overview

The Hypertec Renewals Portal is a modern, cloud-native renewal management platform built with Azure Static Web Apps and Azure Functions. It provides a comprehensive solution for managing software licenses, service vouchers, and customer renewals.

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Azure Functions │    │  Azure MySQL    │
│   (Static Web)   │◄──►│     (API)        │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Azure AD B2C  │    │  Azure Key Vault │    │  Azure Storage  │
│ (Authentication)│    │   (Secrets)      │    │   (Files)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Azure MSAL** for authentication
- **Axios** for API calls

### Backend
- **Azure Functions** (Node.js 18+)
- **Express.js** for local development server
- **MySQL2** for database connectivity
- **Better-SQLite3** for local development

### Database
- **Azure Database for MySQL** (Production)
- **SQLite** (Local Development)
- **Database switching system** for seamless environment transitions

### Infrastructure
- **Azure Static Web Apps** for frontend hosting
- **Azure Functions** for API hosting
- **Azure Key Vault** for secrets management
- **Bicep** for Infrastructure as Code
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
hypertec-renewals-portal/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # Base UI components
│   │   │   ├── Header.jsx      # Navigation header
│   │   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── Login.jsx       # Authentication
│   │   │   └── ...
│   │   ├── services/           # API services
│   │   ├── contexts/           # React contexts
│   │   └── data/               # Mock data
│   ├── package.json
│   └── vite.config.js
├── api/                         # Azure Functions
│   ├── src/functions/          # Function implementations
│   │   ├── records/            # Record management
│   │   ├── users/              # User management
│   │   ├── companies/          # Company management
│   │   ├── database/           # Database utilities
│   │   └── health/             # Health checks
│   ├── shared/                 # Shared utilities
│   │   └── db.js               # Database connection logic
│   ├── host.json               # Functions configuration
│   └── package.json
├── infrastructure/              # Infrastructure as Code
│   ├── main.bicep              # Main Bicep template
│   ├── parameters.json         # Deployment parameters
│   └── database-schema.sql     # Database schema
├── .github/workflows/          # GitHub Actions
│   └── deploy.yml              # Deployment workflow
├── local-api-server.js         # Local development server
├── switch-database.js          # Database switching utility
├── database-configs.json       # Database configurations
└── DATABASE_SWITCHING.md       # Database switching guide
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (use Node.js 22 for best compatibility)
- **NVM** (Node Version Manager) for Node.js version management
- **Azure CLI** for Azure operations
- **Git** for version control

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd hypertec-renewals-portal

# Use Node.js 22 (recommended)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# Install root dependencies
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Starts development server on http://localhost:5173
```

### 3. Backend Setup

```bash
cd api
npm install

# For local development with SQLite
cd ..
node local-api-server.js  # Starts API server on http://localhost:3001
```

## 🔄 Database Management

The project includes a sophisticated database switching system that allows seamless transitions between local development (SQLite) and Azure production (MySQL).

### Available Configurations

1. **SQLite** (`sqlite`) - Local development with sample data
2. **MySQL Local** (`mysql-local`) - Connect to Azure MySQL from local development
3. **MySQL Production** (`mysql-production`) - Production deployment via Key Vault

### Database Switching Commands

```bash
# Switch to SQLite (Local Development)
node switch-database.js sqlite
node local-api-server.js

# Switch to Azure MySQL
node switch-database.js mysql-local
node local-api-server.js

# Switch to Production MySQL
node switch-database.js mysql-production
node local-api-server.js
```

### Database Credentials

**Azure MySQL Configuration:**
- **Server**: `hypertec-renewals-mysql.mysql.database.azure.com`
- **Username**: `hypertecadmin`
- **Password**: `MyNewPassword123!`
- **Database**: `hypertec_renewals`
- **Port**: `3306`
- **SSL**: Required

### Database Schema

The system uses identical schemas across SQLite and MySQL:

- `records` - License and voucher records
- `users` - User accounts
- `companies` - Company information
- `email_templates` - Email templates
- `email_logs` - Email sending logs

## 🧪 Development Workflow

### Local Development

1. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Start Backend** (SQLite):
   ```bash
   node switch-database.js sqlite
   node local-api-server.js
   ```

3. **Test API Endpoints**:
   ```bash
   # Database info
   curl http://localhost:3001/api/database/info
   
   # Test connection
   curl http://localhost:3001/api/database/test
   
   # Get records
   curl http://localhost:3001/api/records
   ```

### Testing with Azure MySQL

1. **Switch to MySQL**:
   ```bash
   node switch-database.js mysql-local
   node local-api-server.js
   ```

2. **Verify Connection**:
   ```bash
   curl http://localhost:3001/api/database/info
   ```

## 🚀 Deployment

### Infrastructure Deployment

The project uses Bicep templates for Infrastructure as Code:

```bash
# Deploy infrastructure
az deployment group create \
  --resource-group hypertec-renewals-eu-rg \
  --template-file infrastructure/main.bicep \
  --parameters @infrastructure/parameters.json
```

### Automated Deployment

GitHub Actions automatically deploys on push to `main`/`master`:

1. **Frontend**: Deploys to Azure Static Web Apps
2. **Backend**: Deploys to Azure Functions
3. **Database**: Uses existing Azure MySQL instance

### Manual Deployment

```bash
# Deploy frontend
cd frontend
npm run build
# Deploy to Azure Static Web Apps

# Deploy backend
cd api
func azure functionapp publish hypertec-renewals-api-v2 --node
```

## 🔧 Configuration

### Environment Variables

**Local Development** (`api/local.settings.json`):
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "NODE_ENV": "development",
    "DATABASE_TYPE": "sqlite",
    "MYSQL_HOST": "hypertec-renewals-mysql.mysql.database.azure.com",
    "MYSQL_USER": "hypertecadmin",
    "MYSQL_PASSWORD": "MyNewPassword123!",
    "MYSQL_DATABASE": "hypertec_renewals",
    "MYSQL_PORT": "3306",
    "MYSQL_SSL": "true"
  }
}
```

**Production** (Azure Key Vault):
- Database credentials stored securely in Azure Key Vault
- Accessed via Azure Functions managed identity

### GitHub Secrets

Required secrets for deployment:
- `AZURE_CREDENTIALS` - Azure service principal credentials
- `AZURE_WEBAPP_PUBLISH_PROFILE` - App Service publish profile
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Static Web Apps deployment token

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | Get all records |
| POST | `/api/records` | Create new record |
| PUT | `/api/records/:id` | Update record |
| DELETE | `/api/records/:id` | Delete record |
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create new user |
| GET | `/api/companies` | Get all companies |
| POST | `/api/companies` | Create new company |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/database/info` | Database configuration info |
| GET | `/api/database/test` | Test database connection |
| GET | `/api/health` | Health check |

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version Issues**:
   ```bash
   # Use Node.js 22
   nvm use 22
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database info
   curl http://localhost:3001/api/database/info
   
   # Test connection
   curl http://localhost:3001/api/database/test
   ```

3. **Module Import Issues**:
   - Ensure `"type": "module"` is in `package.json`
   - Use ES module imports (`import`) not CommonJS (`require`)

4. **Azure Functions Issues**:
   ```bash
   # Rebuild native modules
   cd api
   npm rebuild
   ```

### Database Switching Issues

1. **Server not reflecting changes**:
   - Always restart server after switching: `pkill -f "node local-api-server.js" && node local-api-server.js`

2. **Connection errors**:
   - Verify credentials in `database-configs.json`
   - Check Azure MySQL server status
   - Ensure SSL is enabled

## 📚 Additional Resources

- [Database Switching Guide](./DATABASE_SWITCHING.md)
- [Azure Deployment Guide](./docs/azure-deployment-guide.md)
- [Environment Setup Guide](./docs/environment-setup.md)
- [Azure AD B2C Setup](./docs/azure-ad-b2c-setup.md)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**:
   - Test with SQLite (local development)
   - Test with Azure MySQL (production-like environment)
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the existing documentation
3. Create an issue in the repository
4. Contact the development team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Hypertec Development Team
