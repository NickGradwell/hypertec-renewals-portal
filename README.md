# Hypertec Renewals Platform

A modern, cloud-native renewal management platform built with Azure Static Web Apps and Azure Functions.

## 🏗️ Architecture

This project follows the Azure Static Web Apps + Azure Functions architecture for cost-effective, scalable hosting:

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Azure Functions (Node.js)
- **Database**: Azure Database for MySQL
- **Authentication**: Azure AD B2C
- **Storage**: Azure Blob Storage
- **Secrets**: Azure Key Vault
- **Infrastructure**: Bicep templates

## 📁 Project Structure

```
hypertec-renewals-portal/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── data/            # Mock data and utilities
│   │   └── App.jsx          # Main application component
│   ├── package.json
│   └── vite.config.js
├── api/                      # Azure Functions
│   ├── functions/           # Function implementations
│   │   ├── users/           # User management functions
│   │   ├── records/         # Record management functions
│   │   ├── companies/       # Company management functions
│   │   └── emails/          # Email functions
│   ├── shared/              # Shared utilities
│   ├── host.json            # Functions configuration
│   └── package.json
├── shared/                   # Shared types and utilities
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── infrastructure/           # Infrastructure as Code
│   ├── main.bicep           # Main Bicep template
│   ├── parameters.json      # Deployment parameters
│   └── database-schema.sql   # Database schema
├── docs/                     # Documentation
└── .github/workflows/        # GitHub Actions
    └── deploy.yml            # Deployment workflow
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Azure CLI
- Azure Functions Core Tools
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hypertec-renewals-portal
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Set up the backend**
   ```bash
   cd ../api
   npm install
   func start
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:7071/api

### Environment Configuration

Create the following environment files:

**Frontend (.env.local)**
```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_POLICY_NAME=your-policy-name
VITE_API_URL=https://your-function-app.azurewebsites.net/api
```

**Backend (local.settings.json)**
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

## 📊 Current Status

### ✅ Implemented Features
- **Dashboard**: Complete with KPI cards, data table, search, and filtering
- **Upload Licenses**: File upload with drag & drop, validation, and preview
- **Email Templates**: Template management with editing and preview
- **Authentication**: Mock authentication for local development
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Role-based Access**: Admin, Partner, and Customer role permissions

### 🚀 Ready for Azure Deployment
- **Infrastructure**: Bicep templates for Azure resources
- **Database Schema**: MySQL schema ready for deployment
- **CI/CD**: GitHub Actions workflow configured
- **Deployment Script**: Automated deployment script available

### 🔄 Quick Azure Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment (requires Azure CLI login)
./deploy.sh
```

For detailed deployment instructions, see [Azure Deployment Guide](docs/azure-deployment-guide.md).

## 🏢 Features

### User Roles

- **Hypertec Admin**: Full access to all features
- **Partner**: Can manage their customers' records and send emails
- **Customer**: View-only access to their own records

### Core Functionality

- **Dashboard**: Overview of licenses and vouchers with KPIs ✅
- **Upload Licenses**: Bulk upload of renewal data via Excel ✅
- **Email Templates**: Configure automated renewal reminders ✅
- **Email Logs**: Track sent emails and resend failed ones (Coming Soon)
- **Reports**: Analytics and reporting (Coming Soon)
- **User Management**: Manage users and companies (Coming Soon)

### Record Types

- **Software Licenses**: Traditional software renewals
- **Service Vouchers**: Service credits with redemption tracking

## 🛠️ Development

### Adding New Features

1. **Frontend Components**: Add to `frontend/src/components/`
2. **Pages**: Add to `frontend/src/pages/`
3. **API Functions**: Add to `api/functions/`
4. **Types**: Update `shared/types/index.ts`

### Database Changes

1. Update `infrastructure/database-schema.sql`
2. Create migration scripts if needed
3. Update Bicep templates if new resources required

## 🚀 Deployment

### Azure Resources Setup

1. **Deploy Infrastructure**
   ```bash
   az deployment group create \
     --resource-group your-resource-group \
     --template-file infrastructure/main.bicep \
     --parameters @infrastructure/parameters.json
   ```

2. **Configure GitHub Secrets**
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
   - `AZURE_FUNCTION_APP_NAME`

3. **Deploy via GitHub Actions**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

### Manual Deployment

1. **Build and deploy frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder to Static Web App
   ```

2. **Deploy Azure Functions**
   ```bash
   cd api
   func azure functionapp publish your-function-app-name
   ```

## 🔧 Configuration

### Azure AD B2C Setup

1. Create B2C tenant
2. Register applications (frontend and API)
3. Create user flows (sign-up/sign-in, password reset)
4. Update environment variables

### Database Setup

1. Run the SQL schema from `infrastructure/database-schema.sql`
2. Configure connection strings in Key Vault
3. Update Function App settings

## 📊 Monitoring

- **Application Insights**: Built-in monitoring for Functions
- **Static Web Apps**: Built-in analytics
- **Azure Monitor**: Custom metrics and alerts

## 🔒 Security

- **Authentication**: Azure AD B2C
- **Authorization**: Role-based access control
- **Secrets**: Azure Key Vault
- **HTTPS**: Enforced everywhere
- **CORS**: Configured for production domains

## 💰 Cost Optimization

This architecture provides significant cost savings:

- **Static Web Apps**: Free tier covers most small-medium apps
- **Azure Functions**: Pay-per-execution model
- **MySQL**: Burstable tier for development
- **Estimated monthly cost**: $12-60 (vs $200-500 traditional hosting)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary to Hypertec Group.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added service voucher support
- **v1.2.0**: Enhanced email templates and reporting

---

Built with ❤️ by the Hypertec development team