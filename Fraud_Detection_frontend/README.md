# Fraud Detection Console (Frontend)

React single-page app that visualises the fraud detection backend (`Fraud_Detection_backend`). It shows summary KPIs, recent decisions, latest transactions, and high-risk alerts powered by the Spring Boot services.

## Prerequisites

- Node.js 18+
- Backend stack running locally:
  ```bash
  cd "../Fraud_Detection_backend"
  docker compose up -d              # Kafka, Redis, Postgres, Prometheus, Grafana
  cd services/ingest-api            # start ingest API
  KAFKA_BOOTSTRAP_SERVERS=localhost:9094 ./mvnw spring-boot:run

  # new tab
  cd services/fraud-service         # start fraud service REST API (port 8082)
  KAFKA_BOOTSTRAP_SERVERS=localhost:9094 \
  DB_URL=jdbc:postgresql://localhost:5543/fraud \
  DB_USER=postgres DB_PASS=postgres \
  REDIS_HOST=localhost REDIS_PORT=6380 \
  ./mvnw spring-boot:run
  ```

## Getting started

```bash
npm install
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173). API calls default to `http://localhost:8082` (fraud-service) and `http://localhost:8080` (ingest-api) but can be overridden via:

```bash
VITE_API_BASE=http://my-fraud-service:8082 \
VITE_INGEST_BASE=http://my-ingest-api:8080 \
npm run dev
```

## Available scripts

- `npm run dev` – start Vite dev server
- `npm run build` – create production build in `dist/`
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint (flat config)

## API expectations

The frontend calls the following backend endpoints:

- `GET /api/overview` – summary metrics
- `GET /api/decisions?page=0&size=25` – paged decisions
- `GET /api/decisions/high-risk?size=10` – high-risk decisions
- `GET /api/transactions/recent?limit=25` – recent transactions (from fraud-service)
- `POST /transactions` – submit a new transaction (ingest-api)

Cross-origin requests are enabled for `http://localhost:5173` by default. Update `CORS_ORIGINS` env vars on the services to relax/lock down origins as needed.

## Tech stack

- [Vite](https://vitejs.dev/) for lightning-fast development builds
- React Router v6 for client-side routing
- [Recharts](https://recharts.org/) for simple data visualisations
- Vanilla CSS modules for styling & responsive layout
- ESLint flat config with React plugins

## Project structure

```
Fraud_Detection_ frontend/
├── public/              Static assets (favicon, etc.)
├── src/
│   ├── api/             API client configuration
│   ├── components/      Reusable UI building blocks
│   ├── context/         Theme toggles and shared providers
│   ├── data/            Mock datasets used by the app
│   ├── pages/           Route-level views
│   ├── services/        Fetch helpers (currently return mock data)
│   └── styles/          Global styles and CSS modules
├── index.html           Vite entry point
├── package.json         Scripts & dependencies
└── vite.config.js       Vite configuration
```

## Switching to live APIs

The `src/services/fraudApi.js` file centralises all data access. Replace the mock implementations with real `fetch`/`axios` calls and adjust response parsing. Components expect:

- `fetchTransactions({ searchTerm, limit })` → array of transaction objects
- `fetchLatencySeries()` → list of `{ timestamp, p95, p99 }`
- `fetchDecisionBreakdown()` → list of pie-slice entries
- `fetchAlerts()` → review/block alerts with reasons

## Styling & theming

The global stylesheet defines light/dark theme tokens. The top bar exposes a theme toggle and stores the current mode in `body[data-theme]`. Add more tokens and CSS modules as needed for new components.

## Testing & linting

Run `npm run lint` to execute ESLint with the flat config. Add unit/component tests as the UI grows.
