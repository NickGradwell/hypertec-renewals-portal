# Azure AD B2C Setup Guide for Hypertec Renewals Platform

This guide walks you through setting up Azure AD B2C authentication for the Hypertec Renewals Platform.

## Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI installed and configured
- Access to create Azure AD B2C tenants

## Step 1: Create Azure AD B2C Tenant

1. **Sign in to Azure Portal**
   ```bash
   az login
   ```

2. **Create B2C Tenant**
   ```bash
   az ad b2c tenant create \
     --tenant-name hypertecrenewalsb2c \
     --display-name "Hypertec Renewals B2C" \
     --location "United States"
   ```

3. **Note the tenant details**
   - Tenant ID: `hypertecrenewalsb2c.onmicrosoft.com`
   - Tenant Domain: `hypertecrenewalsb2c`

## Step 2: Register Applications

### Frontend Application (SPA)

1. **Navigate to Azure AD B2C**
   - Go to Azure Portal → Azure AD B2C
   - Select your tenant

2. **Register Frontend App**
   ```bash
   az ad app create \
     --display-name "Hypertec Renewals Frontend" \
     --web-redirect-uris "https://your-app.azurestaticapps.net" "http://localhost:5173" \
     --spa-redirect-uris "https://your-app.azurestaticapps.net" "http://localhost:5173"
   ```

3. **Note the Application ID** (Client ID)

### Backend Application (API)

1. **Register API App**
   ```bash
   az ad app create \
     --display-name "Hypertec Renewals API" \
     --api-permissions "Microsoft.Graph/User.Read"
   ```

2. **Note the Application ID** (API Client ID)

## Step 3: Create User Flows

### Sign-up and Sign-in Flow

1. **In Azure AD B2C Portal**
   - Go to User flows → New user flow
   - Select "Sign up and sign in"
   - Choose "Recommended" version

2. **Configure the flow**
   - Name: `B2C_1_signup_signin`
   - Identity providers: Email signup
   - User attributes: Email Address, Given Name, Surname
   - Application claims: Email Addresses, Given Name, Surname, User's Object ID

3. **Create the flow**

### Password Reset Flow

1. **Create password reset flow**
   - Name: `B2C_1_password_reset`
   - Identity providers: Reset password using email address
   - Application claims: Email Addresses, User's Object ID

### Profile Editing Flow

1. **Create profile editing flow**
   - Name: `B2C_1_profile_edit`
   - Identity providers: Local account profile editing
   - User attributes: Given Name, Surname
   - Application claims: Given Name, Surname, User's Object ID

## Step 4: Configure Custom Attributes (Optional)

For role-based access control, you can add custom attributes:

1. **Go to User attributes**
2. **Add custom attribute**
   - Name: `Role`
   - Data type: String
   - Description: User role (Admin, Partner, Customer)

## Step 5: Update Environment Variables

### Frontend (.env.local)
```bash
VITE_AZURE_CLIENT_ID=your-frontend-client-id
VITE_AZURE_TENANT_ID=hypertecrenewalsb2c
VITE_AZURE_POLICY_NAME=B2C_1_signup_signin
VITE_API_URL=https://your-function-app.azurewebsites.net/api
```

### Backend (local.settings.json)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KEY_VAULT_URL": "https://your-keyvault.vault.azure.net/",
    "AZURE_AD_B2C_TENANT_ID": "hypertecrenewalsb2c.onmicrosoft.com",
    "AZURE_AD_B2C_CLIENT_ID": "your-api-client-id",
    "AZURE_AD_B2C_CLIENT_SECRET": "your-api-client-secret"
  }
}
```

## Step 6: Test Authentication

1. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to http://localhost:5173**
3. **Click "Sign in with Microsoft"**
4. **Complete the sign-up/sign-in flow**
5. **Verify you're redirected back to the app**

## Step 7: Production Configuration

### Update Redirect URIs

1. **In Azure AD B2C Portal**
2. **Go to App registrations**
3. **Select your frontend app**
4. **Update redirect URIs** to include production URL:
   - `https://your-production-app.azurestaticapps.net`
   - `https://your-custom-domain.com`

### Configure CORS

1. **In Azure Functions**
2. **Update host.json** to allow your production domain:
   ```json
   {
     "http": {
       "cors": {
         "allowedOrigins": [
           "https://your-production-app.azurestaticapps.net",
           "https://your-custom-domain.com"
         ]
       }
     }
   }
   ```

## Step 8: User Management

### Create Test Users

1. **In Azure AD B2C Portal**
2. **Go to Users**
3. **Create new user**
4. **Set user attributes** including custom role attribute

### Assign Roles

You can assign roles in several ways:

1. **Custom Attributes**: Set the Role custom attribute
2. **Groups**: Create groups and assign users
3. **API Integration**: Check roles via API call

## Step 9: Monitoring and Logging

### Enable Application Insights

1. **In Azure Functions**
2. **Go to Application Insights**
3. **Enable monitoring**

### Monitor Authentication

1. **In Azure AD B2C Portal**
2. **Go to Monitoring**
3. **View sign-in logs and errors**

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that redirect URIs match exactly
   - Include both HTTP and HTTPS versions for development

2. **"Token validation failed"**
   - Verify tenant ID and policy name
   - Check that the token is not expired

3. **"CORS error"**
   - Update CORS settings in Azure Functions
   - Ensure production domains are included

### Debug Mode

Enable debug logging in the frontend:

```javascript
// In authService.js
const msalConfig = {
  // ... other config
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3 // Verbose
    }
  }
};
```

## Security Best Practices

1. **Use HTTPS everywhere**
2. **Validate tokens on the backend**
3. **Implement proper CORS policies**
4. **Use environment variables for secrets**
5. **Regularly rotate client secrets**
6. **Monitor authentication logs**

## Next Steps

1. **Implement role-based authorization**
2. **Add multi-factor authentication**
3. **Set up automated user provisioning**
4. **Configure email templates**
5. **Implement password policies**

---

For additional help, refer to:
- [Azure AD B2C Documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure Functions Authentication](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-token)
