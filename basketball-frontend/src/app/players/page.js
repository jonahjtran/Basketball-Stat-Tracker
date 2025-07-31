'use client';

import Link from 'next/link';
import { playerAPI } from '@/lib/api';
import PlayerCard from '@/components/PlayerCard';
import { Users, Search } from 'lucide-react';

// Mock data for development - replace with actual API calls
const mockPlayers = [
  { id: 1, name: "LeBron James", external_id: "lebron_james", stats: { points: 28.5, assists: 8.7, games_played: 45 } },
  { id: 2, name: "Stephen Curry", external_id: "stephen_curry", stats: { points: 29.8, assists: 6.3, games_played: 42 } },
  { id: 3, name: "Kevin Durant", external_id: "kevin_durant", stats: { points: 27.1, assists: 5.2, games_played: 38 } },
  { id: 4, name: "Giannis Antetokounmpo", external_id: "giannis_antetokounmpo", stats: { points: 31.2, assists: 5.8, games_played: 47 } },
  { id: 5, name: "Luka Dončić", external_id: "luka_doncic", stats: { points: 26.8, assists: 8.1, games_played: 40 } },
  { id: 6, name: "Joel Embiid", external_id: "joel_embiid", stats: { points: 30.2, assists: 4.2, games_played: 35 } },
  { id: 7, name: "Nikola Jokić", external_id: "nikola_jokic", stats: { points: 25.4, assists: 9.8, games_played: 48 } },
  { id: 8, name: "Jayson Tatum", external_id: "jayson_tatum", stats: { points: 26.9, assists: 4.9, games_played: 43 } },
];

export default function PlayersPage() {
  // In production, uncomment this line and remove mock data
  // const players = await playerAPI.getAll();
  
  const players = mockPlayers;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Players</h1>
          <p className="text-slate-600">
            Browse and analyze player statistics and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{players.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search players..."
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player) => (
          <Link key={player.id} href={`/players/${player.id}`}>
            <PlayerCard player={player} stats={player.stats} />
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {players.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No players found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by adding some players to your roster.
          </p>
        </div>
      )}
    </div>
  );
} 