# Project Template - Web App + API + Azure Deployment (v0.1)

Use this template to bootstrap projects that run locally and deploy to Azure.

## 1. Project Structure
```
root/
  frontend/            # React + Vite app
  api/ or simple-api/  # Node.js Express API
  infrastructure/      # IaC, schema, parameters
  Documents/           # Guides and docs
```

## 2. Frontend (React + Vite)
- Setup: `cd frontend && npm install`
- Dev: `npm run dev` (http://localhost:5173)
- Build: `VITE_API_URL=https://your-api-domain/api npm run build`
- Output: `frontend/dist`

Key points:
- Configure `apiService` with `VITE_API_URL` for production
- Use hashed filenames for cache busting

## 3. API (Node.js Express)
- Setup: `cd simple-api && npm install`
- Dev: `node server.js` (set PORT)
- MySQL: `mysql2/promise` with SSL for Azure
- Env:
  - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`

## 4. Database
- Azure MySQL Flexible Server
- Provide schema SQL in `infrastructure/database-schema.sql`
- Run migrations via CI/CD or manual script

## 5. Local Development
- Optional dev multiplexer server for DB switching
- Start backend first (local or Azure), then frontend
- Keep `.env`/`local.settings.json` for dev overrides

## 6. Deployment (Azure)
- Frontend: Azure App Service (static site container)
- API: Azure App Service (Linux)
- CI/CD: GitHub Actions workflow with jobs:
  - Build frontend and deploy
  - Zip and deploy API
- Required secrets:
  - `AZURE_CREDENTIALS`, `AZURE_WEBAPP_PUBLISH_PROFILE`, `AZURE_STATIC_WEB_APPS_API_TOKEN` (if used)

## 7. Security
- HTTPS everywhere
- Store secrets in App Service settings or Key Vault
- CORS restrict to known origins
- Optional auth: Azure AD B2C

## 8. Observability
- Enable logging on App Service
- Consider Application Insights for API

## 9. Scripts
- Add maintenance scripts (e.g., data normalization) at repo root
- Example: `normalize-uk-phones.js` with `phones:dryrun` and `phones:apply`

## 10. Checklist Before Go-Live
- [ ] Frontend built with correct `VITE_API_URL`
- [ ] API connected to Azure MySQL with SSL
- [ ] CORS configured
- [ ] Secrets set in Azure
- [ ] Logs enabled
- [ ] Backups enabled for MySQL

## 11. Handoff Notes
- Provide `Documents/User_Guide.md` to end users
- Provide `Documents/Technical_Overview.md` to developers
