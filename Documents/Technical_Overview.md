# Hypertec Renewals Portal - Technical Overview (v0.1)

This document gives developers the context to understand, run, and extend the solution.

## Architecture
- Frontend: React + Vite, deployed to Azure App Service (Static site container)
- API: Node.js Express (simple-api), deployed to Azure App Service (Linux)
- Database: Azure Database for MySQL Flexible Server

## Repos and Key Paths
- Frontend: `frontend/` (src, vite config, deployment)
- API (Express): `simple-api/` (`server.js`, MySQL connection via mysql2/promise)
- Local API (dev multiplexer): `local-api-server.js` with DB switching
- Shared DB utils (local dev): `api/shared/` (generic query helpers)
- Infrastructure: `infrastructure/` (schema, bicep params)
- Documents: `Documents/`

## Local Development
- Node 20+ recommended
- Start local API (switchable DB):
  - `node switch-database.js sqlite` or `node switch-database.js mysql-local`
  - `node local-api-server.js` (serves at http://localhost:3001)
- Start frontend:
  - `cd frontend && npm run dev` (http://localhost:5173)

## Production Deployment
- GitHub Actions workflow deploys:
  - Frontend build → Azure App Service (static site container)
  - Express API zip → Azure App Service
- Frontend API base URL baked via `VITE_API_URL` during build
- API connects to MySQL with SSL enforced (`ssl: { rejectUnauthorized: false }`)

## Configuration
- Frontend env: `VITE_API_URL`, Azure AD B2C vars (optional)
- API env: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`
- Local dev: `local.settings.json` for DB switching

## Data Model (core)
- `companies(id, name, type, resellerEmail, createdAt, updatedAt)`
- `users(id, firstName, lastName, email, companyId, role, loginTime, createdAt, updatedAt)`
- `records(... software/voucher fields ...)`
- `emailLogs`, `emailTemplates`
- Note: Azure DB may include additional columns (e.g., `companies.phone`).

## Security
- Transport: HTTPS end-to-end; MySQL requires secure transport
- CORS: Restrict API origins to frontend domain(s)
- Auth: Azure AD B2C integration optional; mock mode when not configured
- Secrets: Store MySQL credentials in App Service Application Settings or Key Vault; never commit secrets
- Dependencies: Regularly update npm deps; monitor `mysql2`, `express`, `axios` advisories
- Headers: Ensure App Service adds HSTS; consider adding security headers (CSP, X-Content-Type-Options) at the frontend container

## Known Issues / Considerations
- Cached frontend assets can persist; use hashed filenames and force redeploys
- Ensure `VITE_API_URL` is set at build time for production
- Data shape: frontend expects `{ success, data }` from API endpoints
- Azure regions: keep services co-located for latency

## Usability Notes
- Provide clear error states on data fetch failures
- Show loading spinners; avoid blank screens
- Confirm destructive actions (delete)
- Keep table filters/search responsive

## Tooling & Scripts
- Phone normalization (Azure MySQL): `normalize-uk-phones.js` with `phones:dryrun` / `phones:apply`
- DB switching: `switch-database.js`

## Extending the System
- Add new endpoints to `simple-api/server.js`
- Add matching service methods in `frontend/src/services/apiService.js`
- Render UI in `frontend/src/pages` or `frontend/src/components`
- Update schema in `infrastructure/database-schema.sql` and run migration in Azure

## Logging & Monitoring
- Enable App Service logs for API and Frontend containers
- Consider Application Insights for API telemetry

## Backups & DR
- Enable automated backups for Azure MySQL
- Keep infrastructure definitions under version control; document restore steps
