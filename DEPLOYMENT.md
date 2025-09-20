# AIVA Chat Application - Azure Deployment

This document provides instructions for deploying the AIVA Chat Application to Azure App Service.

## Prerequisites

1. Azure subscription
2. Azure CLI installed
3. Git installed
4. Node.js 18.x or later

## Deployment Options

### Option 1: Deploy using Azure CLI (Recommended)

1. **Login to Azure CLI:**
   ```bash
   az login
   ```

2. **Create a resource group:**
   ```bash
   az group create --name aiva-rg --location "East US"
   ```

3. **Create an App Service plan:**
   ```bash
   az appservice plan create --name aiva-plan --resource-group aiva-rg --sku B1 --is-linux
   ```

4. **Create a web app:**
   ```bash
   az webapp create --resource-group aiva-rg --plan aiva-plan --name aiva-app --runtime "NODE:18-lts"
   ```

5. **Configure deployment settings:**
   ```bash
   az webapp config appsettings set --resource-group aiva-rg --name aiva-app --settings PORT=8080
   ```

6. **Deploy the application:**
   ```bash
   az webapp deployment source config-local-git --resource-group aiva-rg --name aiva-app
   ```

7. **Get the deployment URL:**
   ```bash
   az webapp deployment list-publishing-credentials --resource-group aiva-rg --name aiva-app --query scmUri --output tsv
   ```

8. **Add the remote and push:**
   ```bash
   git remote add azure <deployment-url>
   git add .
   git commit -m "Initial deployment"
   git push azure main
   ```

### Option 2: Deploy using GitHub Actions

1. Fork this repository to your GitHub account
2. Create an Azure App Service
3. Configure GitHub Actions deployment in Azure Portal
4. Set the following environment variables in GitHub Secrets:
   - AZURE_CLIENT_ID
   - AZURE_CLIENT_SECRET
   - AZURE_TENANT_ID
   - SQL_SERVER
   - SQL_DATABASE
   - SQL_USERNAME
   - SQL_PASSWORD

## Environment Variables

Set the following environment variables in your Azure App Service:

```env
# Azure SQL Database
SQL_SERVER=your-sql-server.database.windows.net
SQL_DATABASE=your-database-name
SQL_USERNAME=your-username
SQL_PASSWORD=your-password
SQL_ENCRYPT=true
SQL_TRUST_SERVER_CERTIFICATE=false

# Azure Authentication
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_STORAGE_ACCOUNT_KEY=your-storage-key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

## Architecture

The application consists of:
1. **Frontend**: React application built with Vite
2. **Backend**: Node.js/Express API server
3. **Database**: Azure SQL Database
4. **Authentication**: Microsoft Entra ID (Azure AD)
5. **Storage**: Azure Blob Storage
6. **AI Services**: Azure OpenAI

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check logs using `az webapp log tail --resource-group aiva-rg --name aiva-app`
2. **Database connection errors**: Verify firewall settings and connection strings
3. **Authentication issues**: Check Azure AD app registration settings

### Viewing Logs

```bash
az webapp log tail --resource-group aiva-rg --name aiva-app
```

## Scaling

To scale the application:
1. Upgrade the App Service plan to a higher tier
2. Enable autoscaling based on CPU or memory usage
3. Consider using Azure Cache for Redis for improved performance

## Security

1. Always use HTTPS
2. Store secrets in Azure Key Vault
3. Regularly rotate passwords and API keys
4. Enable authentication and authorization