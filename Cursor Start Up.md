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