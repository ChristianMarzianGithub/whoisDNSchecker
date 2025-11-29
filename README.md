# Whois + DNS Checker

Full-stack web application for Whois and DNS lookups with a React + Vite frontend and a Node.js (Express) backend.

## Features
- Whois lookup endpoint returning full raw text
- DNS lookup endpoint supporting A, AAAA, CNAME, MX, NS, TXT, SOA
- Frontend with domain examples, record-type multi-select, and dark/light mode
- TailwindCSS styling with monospaced result panels
- Dockerfiles for frontend and backend plus docker-compose for local runs
- Ready for deployment to GCP Cloud Run (frontend and backend as separate services)

## Project Structure
```
backend/   # Express API in TypeScript
frontend/  # Vite + React + Tailwind UI
```

## Local Development
1. Install Node.js 20+.
2. Install dependencies in each project directory:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Run backend (port 4000):
   ```bash
   cd backend
   npm run dev
   ```
4. Run frontend (port 5173, API defaults to http://localhost:4000):
   ```bash
   cd frontend
   npm run dev
   ```

## Testing
- Backend: `npm test` inside `backend/`
- Frontend: `npm test` inside `frontend/`

## Docker
Build images:
```bash
docker compose build
```
Run both services:
```bash
docker compose up
```
- Frontend available at http://localhost:5173
- Backend available at http://localhost:4000

## Cloud Run Deployment
Deploy each service separately:
1. Build and push backend image:
   ```bash
   docker build -t gcr.io/<PROJECT_ID>/whoisdns-backend ./backend
   docker push gcr.io/<PROJECT_ID>/whoisdns-backend
   gcloud run deploy whoisdns-backend --image gcr.io/<PROJECT_ID>/whoisdns-backend --port 4000 --allow-unauthenticated
   ```
2. Build and push frontend image:
   ```bash
   docker build -t gcr.io/<PROJECT_ID>/whoisdns-frontend ./frontend
   docker push gcr.io/<PROJECT_ID>/whoisdns-frontend
   gcloud run deploy whoisdns-frontend --image gcr.io/<PROJECT_ID>/whoisdns-frontend --port 4173 --allow-unauthenticated --set-env-vars VITE_API_BASE_URL=https://<BACKEND_SERVICE_URL>
   ```

## Example Responses
- `GET /whois?domain=openai.com` returns `{ success: true, domain: "openai.com", raw: "..." }`
- `GET /dns?domain=cloudflare.com&types=A,MX` returns records grouped by type, e.g. `{ "A": ["1.1.1.1"], "MX": [{"priority": 1, "exchange": "mx.cloudflare.net"}] }`

## Notes
- Domain validation rejects malformed inputs.
- The backend gracefully returns errors for timeouts or unreachable lookups.
- The frontend shows clear messaging for invalid domains, unreachable backend, and empty responses.
