# Predictive Policing Prototype

Rapid 20-hour MERN stack prototype that demonstrates how historical FIR data can power proactive policing workflows. The system delivers a polished landing experience, authentication flows, a protected dashboard, and a Python-powered crime heatmap module.

## Project Structure

- `backend/` – Express API, MongoDB models, authentication, dashboard endpoints, and the Python aggregation hook.
- `frontend/` – React application with landing page, auth screens, and a protected dashboard UI layered with the crime heatmap.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or hosted)
- Python 3.10+ with `pip` available (for the aggregation script)

### Backend

```bash
cd backend
cp .env.example .env        # update MongoDB URI and JWT secret
npm install
python -m venv .venv        # optional but recommended
source .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r python/requirements.txt
npm run dev                 # starts the server on http://localhost:5000
```

> If `python` does not point to the correct interpreter on your machine, set `PYTHON_PATH` in `.env` (e.g. `PYTHON_PATH=python` or `PYTHON_PATH=C:\Python312\python.exe`).

### Frontend

```bash
cd frontend
cp .env.example .env        # ensure API base URL matches backend
npm install --legacy-peer-deps
npm run dev                 # starts the Vite dev server on http://localhost:5173
```

The React Leaflet heatmap layer currently requires `--legacy-peer-deps` because it targets React 17 in its peer dependencies.

## Environment Variables

### Backend `.env`

- `PORT` – API port (defaults to 5000).
- `MONGODB_URI` – Mongo connection string.
- `JWT_SECRET` – Secret for signing auth tokens.
- `CLIENT_ORIGIN` – Allowed frontend origin for CORS.
- `PYTHON_PATH` – (Optional) overrides the Python executable used to run the aggregation script.

### Frontend `.env`

- `VITE_API_URL` – Base URL for API requests (defaults to `http://localhost:5000/api`).

## Heatmap Pipeline

1. Raw CSV data lives at `backend/python/crime_dataset.csv`.
2. `backend/python/process_crime_data.py` uses Pandas/NumPy to clean, aggregate, and emit geo-count JSON.
3. The Express controller (`/api/crime-data`) launches the Python script with optional `date` and `crime_type` query params.
4. The React dashboard fetches that endpoint, renders a heatmap via `react-leaflet-heatmap-layer-v3`, and exposes filter dropdowns for date and crime type.

Example API call:

```
GET /api/crime-data?date=2025-01-17&crime_type=Theft
```

The response payload contains `points` (lat/lon/count) and `meta` (unique dates and crime types for the filter controls).

## Next Steps

- Connect the aggregation pipeline to live FIR streams or MongoDB collections.
- Integrate clustering, forecasting, and route optimization services behind dedicated endpoints.
- Expand frontend analytics with interactive charts and geospatial visualizations.
- Add automated tests for the Python aggregator and Express bridge.
