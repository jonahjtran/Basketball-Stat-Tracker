# Basketball Stat Tracker Frontend

A modern, responsive frontend for the Basketball Stat Tracker application built with Next.js, React, and TailwindCSS.

## Features

- **Dashboard**: Overview of players, games, and statistics
- **Player Pages**: Detailed player statistics with charts and heatmaps
- **Game Pages**: Game summaries and player performances
- **Heatmap Visualization**: Shot charts using Supabase storage
- **Responsive Design**: Mobile-first approach with clean, NBA.com-inspired UI
- **Real-time Charts**: Interactive charts using Recharts library

## Tech Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TailwindCSS 4**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library
- **Supabase**: Backend storage for heatmaps

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Django backend running (for API calls)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd basketball-stat-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint:
   - Open `src/lib/api.js`
   - Update the `API_BASE_URL` to match your Django backend URL
   - Default: `http://localhost:8000/games`

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.js            # Home page
│   ├── players/           # Player pages
│   │   ├── page.js        # Players listing
│   │   └── [id]/          # Individual player pages
│   └── games/             # Game pages
│       ├── page.js        # Games listing
│       └── [id]/          # Individual game pages
├── components/            # Reusable React components
│   ├── PlayerCard.js      # Player display card
│   ├── GameCard.js        # Game display card
│   ├── StatsTable.js      # Statistics table
│   ├── StatsChart.js      # Chart components
│   └── Heatmap.js         # Shot chart component
└── lib/                   # Utility functions
    └── api.js             # API integration functions
```

## Components

### PlayerCard
Displays player information with optional statistics. Used throughout the app for consistent player representation.

### GameCard
Shows game information with date and opponent. Includes click handlers for navigation.

### StatsTable
Reusable table component for displaying player statistics with icons and color coding.

### StatsChart
Chart component using Recharts library. Supports bar, line, and pie charts.

### Heatmap
Displays shot charts from Supabase storage with loading states and error handling.

## API Integration

The frontend is designed to work with your Django backend. The API functions are organized in `src/lib/api.js`:

- **Player API**: CRUD operations for players
- **Game API**: Game management and event posting
- **Season API**: Season management
- **Heatmap API**: Shot chart retrieval

### Mock Data

For development, the app uses mock data. To connect to your real backend:

1. Uncomment the API calls in each page
2. Remove the mock data
3. Ensure your Django backend is running and accessible

## Styling

The app uses TailwindCSS with a custom design system inspired by NBA.com:

- **Color Scheme**: Orange (#f97316) as primary, with supporting blues and grays
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Card-based design with soft shadows and rounded corners
- **Responsive**: Mobile-first approach with responsive grids

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

1. **Colors**: Update the color scheme in `tailwind.config.js`
2. **Components**: Modify components in `src/components/`
3. **API**: Update endpoints in `src/lib/api.js`
4. **Styling**: Add custom styles in `src/app/globals.css`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/games
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
