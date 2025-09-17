# Azure Deployment Guide

This guide will help you deploy the Hypertec Renewals Platform to Azure using Azure Static Web Apps, Azure Functions, and Azure Database for MySQL.

## Prerequisites

1. **Azure CLI** installed and configured
2. **Azure subscription** with appropriate permissions
3. **GitHub account** for CI/CD integration
4. **Node.js 20+** for local development

## Step 1: Azure CLI Setup

```bash
# Install Azure CLI (if not already installed)
# macOS: brew install azure-cli
# Windows: https://aka.ms/installazurecliwindows
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set your subscription (replace with your subscription ID)
az account set --subscription "your-subscription-id"

# Create a resource group
az group create --name "hypertec-renewals-rg" --location "East US"
```

## Step 2: Deploy Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Deploy the Bicep template
az deployment group create \
  --resource-group "hypertec-renewals-rg" \
  --template-file "main.bicep" \
  --parameters "@parameters.json"
```

## Step 3: Configure Database

```bash
# Get the MySQL server name from the deployment output
MYSQL_SERVER=$(az mysql flexible-server list --resource-group "hypertec-renewals-rg" --query "[0].name" -o tsv)

# Create the database
az mysql flexible-server db create \
  --resource-group "hypertec-renewals-rg" \
  --server-name $MYSQL_SERVER \
  --database-name "hypertec_renewals"

# Run the database schema
az mysql flexible-server execute \
  --resource-group "hypertec-renewals-rg" \
  --server-name $MYSQL_SERVER \
  --database-name "hypertec_renewals" \
  --file-path "../infrastructure/database-schema.sql"
```

## Step 4: Configure Azure Functions

```bash
# Get the Function App name
FUNCTION_APP=$(az functionapp list --resource-group "hypertec-renewals-rg" --query "[0].name" -o tsv)

# Set application settings
az functionapp config appsettings set \
  --resource-group "hypertec-renewals-rg" \
  --name $FUNCTION_APP \
  --settings \
    "KEY_VAULT_URL=https://hypertec-renewals-dev-kv.vault.azure.net/" \
    "NODE_ENV=production"
```

## Step 5: Deploy Frontend (Static Web App)

```bash
# Get the Static Web App name
SWA_NAME=$(az staticwebapp list --resource-group "hypertec-renewals-rg" --query "[0].name" -o tsv)

# Deploy the frontend
cd ../frontend
npm run build

# Deploy to Static Web App
az staticwebapp deploy \
  --resource-group "hypertec-renewals-rg" \
  --name $SWA_NAME \
  --source "dist" \
  --type "local"
```

## Step 6: Deploy Backend (Azure Functions)

```bash
# Navigate to API directory
cd ../api

# Install dependencies
npm install

# Deploy to Azure Functions
func azure functionapp publish $FUNCTION_APP
```

## Step 7: Configure GitHub Actions (Optional)

If you want to set up CI/CD:

1. **Fork the repository** to your GitHub account
2. **Add secrets** to your GitHub repository:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get from Azure portal
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Download from Function App
3. **Push to main branch** to trigger deployment

## Step 8: Configure Azure AD B2C (Optional)

For production authentication:

1. **Create Azure AD B2C tenant**
2. **Register application** in B2C
3. **Update environment variables** in Static Web App:
   - `VITE_AZURE_CLIENT_ID`
   - `VITE_AZURE_TENANT_ID`
   - `VITE_AZURE_POLICY_NAME`

## Environment Variables

### Frontend (Static Web App)
- `VITE_AZURE_CLIENT_ID`: Azure AD B2C Application ID
- `VITE_AZURE_TENANT_ID`: Azure AD B2C Tenant ID
- `VITE_AZURE_POLICY_NAME`: B2C Sign-up/Sign-in Policy Name

### Backend (Azure Functions)
- `KEY_VAULT_URL`: Azure Key Vault URL
- `NODE_ENV`: Environment (production)
- Database connection strings are stored in Key Vault

## Verification

1. **Check Static Web App**: Visit the URL provided in Azure portal
2. **Check Function App**: Test API endpoints
3. **Check Database**: Verify tables are created
4. **Test Authentication**: Try logging in (will use mock auth if B2C not configured)

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check Azure CLI login and permissions
2. **Database connection fails**: Verify MySQL server is running and firewall rules
3. **Function App not responding**: Check application settings and logs
4. **Static Web App not loading**: Check build output and deployment logs

### Useful Commands

```bash
# Check deployment status
az deployment group list --resource-group "hypertec-renewals-rg"

# View Function App logs
az functionapp logs tail --resource-group "hypertec-renewals-rg" --name $FUNCTION_APP

# Check Static Web App status
az staticwebapp show --resource-group "hypertec-renewals-rg" --name $SWA_NAME
```

## Cost Optimization

- **Use Free tier** for Static Web Apps (up to 100GB bandwidth)
- **Use Consumption plan** for Azure Functions (pay per execution)
- **Use Basic tier** for MySQL (suitable for development)
- **Monitor usage** in Azure Cost Management

## Security Considerations

- **Enable HTTPS** for all endpoints
- **Use Key Vault** for sensitive configuration
- **Configure firewall rules** for MySQL
- **Enable Azure AD B2C** for production authentication
- **Regular security updates** for dependencies

## Next Steps

1. **Configure monitoring** with Application Insights
2. **Set up backup** for MySQL database
3. **Implement CI/CD** with GitHub Actions
4. **Add custom domain** for production
5. **Configure SSL certificates**
