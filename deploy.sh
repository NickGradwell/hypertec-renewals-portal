#!/bin/bash

# Hypertec Renewals Platform - Azure Deployment Script
# This script automates the deployment process to Azure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="hypertec-renewals-rg"
LOCATION="UK South"
APP_NAME="hypertec-renewals"
ENVIRONMENT="dev"

echo -e "${BLUE}🚀 Hypertec Renewals Platform - Azure Deployment${NC}"
echo "=================================================="

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure. Please run 'az login' first.${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create resource group
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output table

# Deploy infrastructure
echo -e "${YELLOW}🏗️  Deploying infrastructure...${NC}"
cd infrastructure
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file "main.bicep" \
    --parameters "@parameters.json" \
    --output table

# Get resource names
echo -e "${YELLOW}🔍 Getting resource names...${NC}"
MYSQL_SERVER=$(az mysql flexible-server list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
FUNCTION_APP=$(az functionapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
SWA_NAME=$(az staticwebapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)

echo -e "${BLUE}📝 Resource Names:${NC}"
echo "MySQL Server: $MYSQL_SERVER"
echo "Function App: $FUNCTION_APP"
echo "Static Web App: $SWA_NAME"

# Create database
echo -e "${YELLOW}🗄️  Creating database...${NC}"
az mysql flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER \
    --database-name "hypertec_renewals" \
    --output table

# Run database schema
echo -e "${YELLOW}📊 Setting up database schema...${NC}"
az mysql flexible-server execute \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER \
    --database-name "hypertec_renewals" \
    --file-path "database-schema.sql"

# Configure Function App
echo -e "${YELLOW}⚙️  Configuring Function App...${NC}"
az functionapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP \
    --settings \
        "KEY_VAULT_URL=https://${APP_NAME}-${ENVIRONMENT}-kv.vault.azure.net/" \
        "NODE_ENV=production" \
    --output table

# Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd ../frontend
npm install
npm run build

# Deploy frontend
echo -e "${YELLOW}🌐 Deploying frontend...${NC}"
az staticwebapp deploy \
    --resource-group $RESOURCE_GROUP \
    --name $SWA_NAME \
    --source "dist" \
    --type "local" \
    --output table

# Deploy backend
echo -e "${YELLOW}🔧 Deploying backend...${NC}"
cd ../api
npm install
func azure functionapp publish $FUNCTION_APP --output table

# Get URLs
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================================="

# Get Static Web App URL
SWA_URL=$(az staticwebapp show --resource-group $RESOURCE_GROUP --name $SWA_NAME --query "defaultHostname" -o tsv)
echo -e "${BLUE}🌐 Frontend URL: https://$SWA_URL${NC}"

# Get Function App URL
FUNCTION_URL=$(az functionapp show --resource-group $RESOURCE_GROUP --name $FUNCTION_APP --query "hostNames[0]" -o tsv)
echo -e "${BLUE}🔧 Backend URL: https://$FUNCTION_URL${NC}"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Visit the frontend URL to test the application"
echo "2. Configure Azure AD B2C for production authentication"
echo "3. Set up monitoring with Application Insights"
echo "4. Configure custom domain if needed"

echo -e "${GREEN}✨ Deployment complete! Happy coding! 🚀${NC}"
