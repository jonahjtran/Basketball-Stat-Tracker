# Basketball Stat Tracker

A full-stack basketball statistics tracking application with a Django backend and Next.js frontend.

## Project Structure

```
Basketball Stat Tracker/
├── backend/                    # Django backend
│   └── stats_tracker/         # Django project
│       ├── games/             # Main app with models, views, serializers
│       ├── manage.py          # Django management script
│       └── stats_tracker/     # Django settings and configuration
├── basketball-frontend/        # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   └── lib/             # Utilities and API functions
│   └── package.json
├── test_heatmap.py           # Heatmap functionality tests
├── pytest.ini               # Pytest configuration
└── package.json             # Root-level scripts
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL database (or SQLite for development)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```
   DATABASE_PWD=your_database_password
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only the Django backend
- `npm run dev:frontend` - Start only the Next.js frontend
- `npm run test` - Run backend tests
- `npm run test:heatmap` - Run heatmap functionality tests
- `npm run migrate` - Run Django migrations
- `npm run makemigrations` - Create new Django migrations
- `npm run build` - Build the frontend for production

## Development

### Backend (Django)
- Models: `backend/stats_tracker/games/models.py`
- Views: `backend/stats_tracker/games/views.py`
- API: `backend/stats_tracker/games/urls.py`

### Frontend (Next.js)
- Pages: `basketball-frontend/src/app/`
- Components: `basketball-frontend/src/components/`
- API Client: `basketball-frontend/src/lib/api.js`

## Features

- **Game Management**: Track basketball games with detailed statistics
- **Player Statistics**: Individual player performance tracking
- **Heatmaps**: Visual shot location analysis
- **Real-time Updates**: Live game statistics
- **Responsive Design**: Mobile-friendly interface
