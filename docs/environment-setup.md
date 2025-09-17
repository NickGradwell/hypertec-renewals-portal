# Environment Configuration Template

## Frontend Environment Variables (.env.local)

```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_POLICY_NAME=your-policy-name
VITE_API_URL=https://your-function-app.azurewebsites.net/api
```

## Backend Environment Variables (local.settings.json)

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

## Required Azure Resources

1. **Azure AD B2C Tenant** - For authentication
2. **Azure Static Web App** - For frontend hosting
3. **Azure Functions** - For backend API
4. **Azure Database for MySQL** - For data storage
5. **Azure Key Vault** - For secrets management
6. **Azure Storage Account** - For Functions storage

## Setup Instructions

1. Create Azure resources using the Bicep templates in `/infrastructure`
2. Configure Azure AD B2C with user flows
3. Update environment variables with actual values
4. Deploy using GitHub Actions workflow
