# Basketball Stat Tracker

Full‑stack application for recording basketball game events, computing advanced player metrics, and visualizing shot charts and heatmaps. Built with a Django REST API and a modern Next.js frontend.

## Highlights

- **End‑to‑end product**: Ingests play‑by‑play events → aggregates season and career stats → renders interactive charts and heatmaps.
- **Clean API design**: Django REST Framework powering a clear resource model: `Player`, `Season`, `Game`, `Event`, and denormalized views (e.g., `PlayerSeason`, `PlayerCareer`).
- **Modern UI**: Next.js (App Router), React 19, TailwindCSS, and Recharts for responsive charts and box‑score style tables.
- **Analytics**: Matplotlib‑generated heatmaps and zone analytics persisted at game, season, and career granularities.
- **Production‑ready patterns**: CORS, environment‑based config, workspace scripts, and pytest.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Recharts, Lucide Icons
- **Backend**: Django 5, Django REST Framework, PostgreSQL (Supabase hosted)
- **Data/Analytics**: NumPy, Matplotlib, Pillow
- **Tooling**: pytest, ESLint, PostCSS, concurrently

## Architecture

```
Next.js (UI, charts) ──▶ REST API (Django) ──▶ PostgreSQL (Supabase)
         ▲                    │
         └──── Tailwind / Recharts / App Router
```

- Core domain entities live in `backend/stats_tracker/games/models.py`:
  - **Player**, **Season**, **Game**, **Event** (normalized)
  - **PlayerGame**, **PlayerSeason**, **PlayerCareer** (aggregations + `shot_zone_stats` and `heatmap_url`)
- Heatmap and zone logic: `backend/stats_tracker/games/heatmap.py`, `backend/stats_tracker/games/shotzone.py`
- API routes: `backend/stats_tracker/games/urls.py` and views in `backend/stats_tracker/games/views.py`

## Key Features

- **Event ingestion**: Create `Event`s with coordinates; backend infers `shot_zone` and classifies made/missed 2s and 3s.
- **Aggregations**: Per‑game, per‑season, and career rollups with `shot_zone_stats` persisted as JSON.
- **Visual analytics**: Interactive Recharts on the frontend; Matplotlib heatmaps generated and linked via `heatmap_url`.
- **Responsive UX**: Mobile‑first, NBA box‑score‑inspired cards and tables.

## API Overview (selected)

- `GET /api/games` and `GET /api/games/events` (Next.js API routes proxy/compose backend)
- `GET /api/players`, `GET /api/players/[id]`
- `GET /api/seasons`
- Backend REST endpoints are defined under `backend/stats_tracker/games/urls.py` and consumed by the frontend in `basketball-frontend/src/app/api/*`.

## Project Structure

```
Basketball Stat Tracker/
├── backend/
│   ├── requirements.txt
│   └── stats_tracker/
│       ├── games/                # models, serializers, views, urls, analytics
│       ├── manage.py
│       └── stats_tracker/        # settings, wsgi/asgi
├── basketball-frontend/
│   └── src/
│       ├── app/                  # Next.js App Router
│       ├── components/           # React components (cards, charts, tables)
│       └── lib/
├── pytest.ini
└── package.json                  # root scripts/workspaces
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- Access to a PostgreSQL database (Supabase recommended)

### One‑time setup

Option A — automated:
```bash
./setup-dev.sh
```

Option B — manual:
```bash
# Install all JS and Python dependencies
npm run install:all

# Create .env.local in the repo root
cat > .env.local << 'EOF'
DATABASE_PWD=your_database_password_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
EOF

# Apply Django migrations
npm run migrate
```

### Run locally

```bash
npm run dev
```

This starts:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Useful scripts

- `npm run dev` — run frontend and backend together
- `npm run dev:backend` — run Django only
- `npm run dev:frontend` — run Next.js only
- `npm run migrate` — apply Django migrations
- `npm run makemigrations` — create Django migrations
- `npm run build` — build the frontend
- `npm run test` — run backend tests (pytest)

## Data Model (simplified)

- `Player`, `Season`, `Game`: core entities
- `Event`: play‑by‑play with `x`, `y` coordinates; backend assigns `shot_zone` and 2PT/3PT classification
- `PlayerGame`, `PlayerSeason`, `PlayerCareer`: aggregated stats and `shot_zone_stats` JSON + optional `heatmap_url`

## What recruiters should notice

- Clear separation of concerns between API, analytics, and UI.
- Pragmatic choices: DRF for fast REST, Recharts for approachable data viz, Tailwind for velocity.
- Thoughtful data modeling for both normalized events and denormalized analytics views.
- Developer experience: workspace scripts, automated setup, and consistent conventions.

## Roadmap

- Authentication + user teams
- Real‑time websockets for live game feeds
- More advanced shot expected value models
- CI for tests and linting

## License

MIT — feel free to use and adapt for your own projects.
