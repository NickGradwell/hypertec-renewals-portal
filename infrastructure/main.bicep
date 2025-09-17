@description('The name of the application')
param appName string = 'hypertec-renewals'

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
var appServicePlanName = '${resourcePrefix}-plan'

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true
  }
}

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

// Outputs
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output functionAppUrl string = functionApp.properties.defaultHostName
output keyVaultUrl string = keyVault.properties.vaultUri
output mysqlServerName string = mysqlServer.name
