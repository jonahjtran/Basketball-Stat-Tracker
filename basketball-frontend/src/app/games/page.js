'use client';

import Link from 'next/link';
import { gameAPI } from '@/lib/api';
import GameCard from '@/components/GameCard';
import { Calendar, Search } from 'lucide-react';

// Mock data for development - replace with actual API calls
const mockGames = [
  { id: 1, opponent: "Lakers", date: "2025-01-15", external_id: "game_001" },
  { id: 2, opponent: "Warriors", date: "2025-01-12", external_id: "game_002" },
  { id: 3, opponent: "Celtics", date: "2025-01-10", external_id: "game_003" },
  { id: 4, opponent: "Heat", date: "2025-01-08", external_id: "game_004" },
  { id: 5, opponent: "Nets", date: "2025-01-05", external_id: "game_005" },
  { id: 6, opponent: "Bucks", date: "2025-01-03", external_id: "game_006" },
];

export default function GamesPage() {
  // In production, uncomment this line and remove mock data
  // const games = await gameAPI.getAll();
  
  const games = mockGames;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Games</h1>
          <p className="text-gray-600">
            View game summaries and player performances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{games.length}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search games by opponent..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Games</option>
          <option value="recent">Recent Games</option>
          <option value="upcoming">Upcoming Games</option>
        </select>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <GameCard game={game} />
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No games found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding some games to your schedule.
          </p>
        </div>
      )}
    </div>
  );
} 