# Next Project Implementation Guide
## Azure Static Web Apps + Azure Functions Architecture

This guide provides a complete roadmap for building your next project using Azure Static Web Apps and Azure Functions - a modern, cost-effective, and scalable approach that's 80-90% cheaper than traditional hosting.

---

## 🎯 Overview

### Why This Architecture?
- **Cost**: Pay only for what you use (80-90% cost reduction)
- **Simplicity**: No Docker, containers, or complex orchestration
- **Performance**: Global CDN + serverless backend
- **Security**: Built-in authentication and HTTPS
- **Scalability**: Automatic scaling to zero and back up
- **Developer Experience**: Local development with emulators

### What You'll Build
```
Frontend (React) → Azure Static Web Apps
Backend (Node.js) → Azure Functions
Database → Azure Database for MySQL
Storage → Azure Blob Storage
Authentication → Azure AD B2C
```

---

## 📋 Prerequisites

### Required Tools
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Install Node.js (18+)
# Install Git
```

### Required Azure Resources
- Azure Subscription
- Azure Resource Group
- Azure AD B2C Tenant (for authentication)

---

## 🏗️ Project Structure

```
my-new-project/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── api/                     # Azure Functions
│   ├── functions/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── services/
│   │   └── admin/
│   ├── shared/
│   ├── host.json
│   └── package.json
├── shared/                  # Shared types and utilities
│   ├── types/
│   └── utils/
├── infrastructure/          # Infrastructure as Code
│   ├── main.bicep
│   └── parameters.json
├── docs/                   # Documentation
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Initialize the Project

```bash
# Create project directory
mkdir my-new-project
cd my-new-project

# Initialize git
git init

# Create directories
mkdir -p frontend api/shared infrastructure docs .github/workflows

# Initialize frontend (React + Vite)
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios @azure/msal-browser

# Initialize backend (Azure Functions)
cd ../api
func init . --javascript
npm install mysql2 bcryptjs jsonwebtoken dotenv @azure/keyvault-secrets @azure/identity

# Create shared utilities
cd ../shared
mkdir types utils
```

### Step 2: Set Up Frontend (React + Vite)

#### Frontend Configuration (`frontend/vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

#### Frontend Package.json (`frontend/package.json`)
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@azure/msal-browser": "^3.5.0",
    "react-router-dom": "^6.8.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

#### Main App Component (`frontend/src/App.jsx`)
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-browser'
import { PublicClientApplication } from '@azure/msal-browser'
import Layout from './components/Layout'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_AZURE_TENANT_ID}.b2clogin.com/${import.meta.env.VITE_AZURE_TENANT_ID}.onmicrosoft.com/${import.meta.env.VITE_AZURE_POLICY_NAME}`,
    redirectUri: window.location.origin
  }
}

const msalInstance = new PublicClientApplication(msalConfig)

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </MsalProvider>
  )
}

export default App
```

### Step 3: Set Up Backend (Azure Functions)

#### Host Configuration (`api/host.json`)
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  },
  "functionTimeout": "00:10:00",
  "http": {
    "routePrefix": "api",
    "cors": {
      "allowedOrigins": ["*"],
      "supportCredentials": false
    }
  }
}
```

#### Package.json (`api/package.json`)
```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.3.0",
    "@azure/keyvault-secrets": "^4.7.0",
    "@azure/identity": "^4.0.0"
  }
}
```

#### Database Utility (`api/shared/db.js`)
```javascript
const mysql = require('mysql2/promise')
const { DefaultAzureCredential } = require('@azure/identity')
const { SecretClient } = require('@azure/keyvault-secrets')

let pool = null

async function getDbPool() {
  if (!pool) {
    const credential = new DefaultAzureCredential()
    const keyVaultUrl = process.env.KEY_VAULT_URL
    const secretClient = new SecretClient(keyVaultUrl, credential)
    
    const dbHost = await secretClient.getSecret('db-host')
    const dbUser = await secretClient.getSecret('db-user')
    const dbPassword = await secretClient.getSecret('db-password')
    const dbName = await secretClient.getSecret('db-name')
    
    pool = mysql.createPool({
      host: dbHost.value,
      user: dbUser.value,
      password: dbPassword.value,
      database: dbName.value,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  
  return pool
}

module.exports = { getDbPool }
```

#### Sample Function (`api/functions/users/index.js`)
```javascript
const { app } = require('@azure/functions')
const { getDbPool } = require('../../shared/db')

app.http('getUsers', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'users',
  handler: async (request, context) => {
    try {
      const pool = await getDbPool()
      const [rows] = await pool.execute('SELECT * FROM users')
      
      return {
        status: 200,
        body: JSON.stringify({ users: rows })
      }
    } catch (error) {
      context.log.error('Error fetching users:', error)
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      }
    }
  }
})
```

### Step 4: Infrastructure as Code (Bicep)

#### Main Template (`infrastructure/main.bicep`)
```bicep
@description('The name of the application')
param appName string = 'my-new-app'

@description('The environment (dev, staging, prod)')
param environment string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

// Variables
var resourcePrefix = '${appName}-${environment}'
var staticWebAppName = '${resourcePrefix}-frontend'
var functionAppName = '${resourcePrefix}-api'
var keyVaultName = '${resourcePrefix}-kv'
var mysqlServerName = '${resourcePrefix}-mysql'
var storageAccountName = '${resourcePrefix}storage'

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableRbacAuthorization: true
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

// MySQL Database
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2022-01-01' = {
  name: mysqlServerName
  location: location
  sku: {
    name: 'B_Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'adminuser'
    administratorLoginPassword: 'TempPassword123!'
    version: '8.0.21'
    storage: {
      storageSizeGB: 20
    }
  }
}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: location
  properties: {
    repositoryUrl: ''
    branch: 'main'
    buildProperties: {
      appLocation: '/frontend'
      apiLocation: '/api'
      outputLocation: 'dist'
    }
  }
}

// Function App
resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'Node|18'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'KEY_VAULT_URL'
          value: keyVault.properties.vaultUri
        }
      ]
    }
  }
}
```

### Step 5: GitHub Actions Workflow

#### Deployment Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  id-token: write

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: "/api"
          output_location: "dist"
          skip_app_build: false

      - name: Deploy Functions
        uses: Azure/functions-action@v1
        with:
          app-name: ${{ secrets.AZURE_FUNCTION_APP_NAME }}
          package: ./api
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### Step 6: Environment Configuration

#### Frontend Environment (`.env.local`)
```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_POLICY_NAME=your-policy-name
VITE_API_URL=https://your-function-app.azurewebsites.net/api
```

#### Backend Environment (Local Settings)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KEY_VAULT_URL": "https://your-keyvault.vault.azure.net/"
  }
}
```

---

## 🔐 Authentication Setup

### Azure AD B2C Configuration

1. **Create B2C Tenant**
```bash
# Create B2C tenant
az ad b2c tenant create --tenant-name mynewappb2c --display-name "My New App B2C"
```

2. **Register Application**
```bash
# Register web app
az ad app create --display-name "My New App Frontend" \
  --web-redirect-uris "https://your-app.azurestaticapps.net" \
  --spa-redirect-uris "https://your-app.azurestaticapps.net"

# Register API
az ad app create --display-name "My New App API" \
  --api-permissions "Microsoft.Graph/User.Read"
```

3. **Create User Flows**
- Sign-up and sign-in flow
- Password reset flow
- Profile editing flow

---

## 🚀 Deployment Process

### Initial Setup
```bash
# 1. Create Azure resources
az deployment group create \
  --resource-group my-resource-group \
  --template-file infrastructure/main.bicep \
  --parameters @infrastructure/parameters.json

# 2. Configure GitHub Secrets
# Add these secrets to your GitHub repository:
# - AZURE_STATIC_WEB_APPS_API_TOKEN
# - AZURE_FUNCTIONAPP_PUBLISH_PROFILE
# - AZURE_FUNCTION_APP_NAME

# 3. Deploy via GitHub Actions
git add .
git commit -m "Initial commit"
git push origin main
```

### Local Development
```bash
# Start frontend
cd frontend
npm run dev

# Start backend (in separate terminal)
cd api
func start

# Access:
# Frontend: http://localhost:5173
# API: http://localhost:7071/api
```

---

## 💰 Cost Optimization

### Monthly Cost Breakdown (Estimated)
- **Static Web Apps**: $0-9 (free tier covers most small apps)
- **Azure Functions**: $0-20 (free tier: 1M requests/month)
- **MySQL Database**: $12-25 (Basic tier)
- **Key Vault**: $0-1 (first 10,000 operations free)
- **Storage**: $0-5 (minimal usage)

**Total: $12-60/month** (vs $200-500 for traditional hosting)

### Cost Optimization Tips
1. **Use consumption plans** for Functions (pay per execution)
2. **Enable auto-shutdown** for development databases
3. **Use Azure Advisor** for cost recommendations
4. **Monitor usage** with Azure Cost Management
5. **Use reserved capacity** for production databases

---

## 🔧 Development Best Practices

### Code Organization
```javascript
// Shared types (shared/types/index.js)
export interface User {
  id: string
  email: string
  name: string
  admin: boolean
}

export interface Service {
  id: string
  name: string
  type: 'Service' | 'Scan'
  description?: string
}
```

### Error Handling
```javascript
// Frontend error handling
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login'
  } else {
    // Show user-friendly error
    showNotification(error.response?.data?.message || 'Something went wrong', 'error')
  }
}

// Backend error handling
const handleError = (context, error) => {
  context.log.error('Function error:', error)
  return {
    status: 500,
    body: JSON.stringify({ 
      error: 'Internal server error',
      requestId: context.invocationId 
    })
  }
}
```

### Security Best Practices
1. **Use Azure Key Vault** for all secrets
2. **Implement proper authentication** with Azure AD B2C
3. **Validate all inputs** on both frontend and backend
4. **Use HTTPS everywhere**
5. **Implement rate limiting** for API endpoints
6. **Regular security updates** for dependencies

---

## 📊 Monitoring and Logging

### Application Insights Setup
```javascript
// Frontend monitoring
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING
  }
})

appInsights.loadAppInsights()
appInsights.trackPageView()
```

### Backend Logging
```javascript
// Structured logging
const logEvent = (context, level, message, properties = {}) => {
  context.log[level](JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...properties
  }))
}
```

---

## 🚀 Migration from Current Project

If you want to migrate your existing project:

### Phase 1: Frontend Migration
1. **Extract React components** from current App.jsx
2. **Set up Vite build system**
3. **Implement routing** with React Router
4. **Deploy to Static Web Apps**

### Phase 2: Backend Migration
1. **Convert Express routes** to Azure Functions
2. **Update database connections** to use Key Vault
3. **Implement serverless patterns**
4. **Deploy to Azure Functions**

### Phase 3: Optimization
1. **Implement caching strategies**
2. **Optimize database queries**
3. **Add monitoring and logging**
4. **Performance testing**

---

## 📚 Additional Resources

### Documentation
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure AD B2C Documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/)

### Tools and Extensions
- [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli)
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools)
- [VS Code Azure Extensions](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-azurefunctions)

### Community
- [Azure Static Web Apps Community](https://github.com/Azure/static-web-apps/discussions)
- [Azure Functions Community](https://github.com/Azure/Azure-Functions/discussions)

---

## ✅ Checklist

### Pre-Development
- [ ] Azure subscription set up
- [ ] Development tools installed
- [ ] Project structure created
- [ ] Git repository initialized

### Development
- [ ] Frontend application built
- [ ] Backend functions implemented
- [ ] Database schema created
- [ ] Authentication configured
- [ ] Local development working

### Deployment
- [ ] Infrastructure deployed
- [ ] GitHub Actions configured
- [ ] Production environment tested
- [ ] Monitoring set up
- [ ] Documentation updated

### Post-Deployment
- [ ] Performance monitoring active
- [ ] Cost monitoring configured
- [ ] Backup strategy implemented
- [ ] Security review completed

---

This guide provides everything you need to build a modern, cost-effective, and scalable application using Azure's serverless architecture. The approach will save you 80-90% on hosting costs while providing better performance and scalability than traditional hosting solutions.


*******CURSOR STARTUP **********

Great question! Let me walk you through starting a new project from scratch using Cursor, following the NEXT_PROJECT_GUIDE.md. I'll give you the exact commands and steps to get started.

## **🚀 Starting Your Next Project with Cursor**

### **Step 1: Create New Project Directory**

```bash
# Create the project directory
mkdir my-new-project
cd my-new-project

# Initialize git repository
git init

# Create initial README
echo "# My New Project" > README.md
```

### **Step 2: Open in Cursor**

```bash
# Open the project in Cursor
cursor .
```

### **Step 3: Set Up Project Structure**

In Cursor's terminal (or your system terminal), run:

```bash
# Create the directory structure
mkdir -p frontend api/shared infrastructure docs .github/workflows

# Create basic files
touch frontend/.gitkeep
touch api/.gitkeep
touch shared/.gitkeep
touch infrastructure/.gitkeep
```

### **Step 4: Initialize Frontend (React + Vite)**

```bash
# Navigate to frontend directory
cd frontend

# Create React app with Vite
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages from the guide
npm install axios @azure/msal-browser react-router-dom tailwindcss autoprefixer postcss

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### **Step 5: Configure Frontend**

Create `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

Create `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#EC4899',
        'brand-gradient': 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      }
    },
  },
  plugins: [],
}
```

### **Step 6: Initialize Backend (Azure Functions)**

```bash
# Navigate to api directory
cd ../api

# Initialize Azure Functions project
func init . --javascript

# Install dependencies from the guide
npm install mysql2 bcryptjs jsonwebtoken dotenv @azure/keyvault-secrets @azure/identity
```

### **Step 7: Set Up Infrastructure**

Create `infrastructure/main.bicep`:

```bicep
@description('The name of the application')
param appName string = 'my-new-app'

@description('The environment (dev, staging, prod)')
param environment string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

// Variables
var resourcePrefix = '${appName}-${environment}'
var staticWebAppName = '${resourcePrefix}-frontend'
var functionAppName = '${resourcePrefix}-api'
var keyVaultName = '${resourcePrefix}-kv'

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableRbacAuthorization: true
  }
}

// Add more resources as needed...
```

### **Step 8: Set Up GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  id-token: write

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: "/api"
          output_location: "dist"
          skip_app_build: false
```

### **Step 9: Create Environment Files**

Create `frontend/.env.local`:

```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_POLICY_NAME=your-policy-name
VITE_API_URL=https://your-function-app.azurewebsites.net/api
```

Create `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KEY_VAULT_URL": "https://your-keyvault.vault.azure.net/"
  }
}
```

### **Step 10: Initialize Git and First Commit**

```bash
# Go back to project root
cd ..

# Add all files to git
git add .

# Make initial commit
git commit -m "Initial project setup with React frontend and Azure Functions backend"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/my-new-project.git

# Push to GitHub
git push -u origin main
```

## **�� Cursor-Specific Tips**

### **1. Use Cursor's AI Features**
- **Ask Cursor**: "Help me set up the Azure Functions project structure"
- **Generate code**: Use Cursor's AI to create boilerplate components
- **Explain code**: Ask Cursor to explain any complex parts of the setup

### **2. Leverage Cursor's IntelliSense**
- **Auto-complete**: Cursor will suggest imports and function calls
- **Error detection**: Real-time error highlighting and suggestions
- **Refactoring**: Use Cursor's refactoring tools to organize code

### **3. Use Cursor's Terminal Integration**
- **Built-in terminal**: Use Cursor's integrated terminal for all commands
- **Multiple terminals**: Open separate terminals for frontend and backend
- **Command history**: Access previous commands easily

## **📋 Next Steps After Setup**

1. **Set up Azure resources** using the Bicep templates
2. **Configure authentication** with Azure AD B2C
3. **Set up database** and Key Vault
4. **Start developing** your application features

## **🔧 Useful Cursor Commands**

```bash
# In Cursor's terminal, you can use:
cursor .                    # Open current directory in Cursor
cursor frontend/           # Open frontend folder in new window
cursor api/                # Open API folder in new window

# Use Cursor's command palette (Cmd+Shift+P):
# - "Git: Clone" - Clone repositories
# - "Terminal: Create New Terminal" - New terminal
# - "Extensions: Install Extensions" - Install helpful extensions
```

## **�� Recommended Cursor Extensions**

Install these extensions in Cursor for better development experience:

1. **Azure Functions** - For Azure Functions development
2. **Azure Account** - For Azure authentication
3. **Bicep** - For infrastructure as code
4. **Tailwind CSS IntelliSense** - For Tailwind CSS support
5. **ES7+ React/Redux/React-Native snippets** - For React development

This setup gives you a complete foundation for building your next project with modern tooling and Cursor's powerful AI assistance! 🚀