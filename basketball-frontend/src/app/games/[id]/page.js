'use client';

import Link from 'next/link';
import { gameAPI, playerAPI, heatmapAPI } from '@/lib/api';
import StatsTable from '@/components/StatsTable';
import StatsChart from '@/components/StatsChart';
import Heatmap from '@/components/Heatmap';
import PlayerCard from '@/components/PlayerCard';
import { ArrowLeft, Calendar, Users, Trophy, Target } from 'lucide-react';

// Mock data for development - replace with actual API calls
const mockGame = {
  id: 1,
  opponent: "Warriors",
  date: "2025-01-15",
  external_id: "game_001"
};

const mockPlayers = [
  { id: 1, name: "LeBron James", external_id: "lebron_james" },
  { id: 2, name: "Stephen Curry", external_id: "stephen_curry" },
  { id: 3, name: "Kevin Durant", external_id: "kevin_durant" },
  { id: 4, name: "Giannis Antetokounmpo", external_id: "giannis_antetokounmpo" },
];

const mockPlayerStats = [
  { player_id: 1, point: 28, assist: 8, steal: 2, block: 1, off_reb: 2, def_reb: 6, turnover: 3 },
  { player_id: 2, point: 32, assist: 12, steal: 1, block: 2, off_reb: 1, def_reb: 8, turnover: 2 },
  { player_id: 3, point: 25, assist: 6, steal: 3, block: 0, off_reb: 3, def_reb: 5, turnover: 4 },
  { player_id: 4, point: 18, assist: 4, steal: 1, block: 3, off_reb: 4, def_reb: 7, turnover: 1 },
];

const mockHeatmapUrl = "https://placeholder.com/heatmap-1-1";

export default function GameDetailPage({ params }) {
  const { id } = params;
  
  // In production, uncomment these lines and remove mock data
  // const game = await gameAPI.getById(id);
  // const players = await gameAPI.getPlayers(id);
  // const playerStats = await Promise.all(players.map(player => playerAPI.getGameStats(id, player.id)));
  
  const game = mockGame;
  const players = mockPlayers;
  const playerStats = mockPlayerStats;
  const heatmapUrl = mockHeatmapUrl;

  // Combine player data with stats
  const playersWithStats = players.map(player => {
    const stats = playerStats.find(stat => stat.player_id === player.id) || {};
    return { ...player, stats };
  });

  // Prepare chart data
  const pointsChartData = playersWithStats.map(player => ({
    name: player.name,
    value: player.stats.point || 0
  }));

  const assistsChartData = playersWithStats.map(player => ({
    name: player.name,
    value: player.stats.assist || 0
  }));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/games" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </Link>
      </div>

      {/* Game Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">vs {game.opponent}</h1>
              <p className="text-gray-600">{formatDate(game.date)}</p>
              <p className="text-sm text-gray-500">Game ID: {game.external_id}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">{players.length}</span>
            </div>
            <p className="text-sm text-gray-500">Players</p>
          </div>
        </div>
      </div>

      {/* Game Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsChart 
          data={pointsChartData} 
          type="bar" 
          title="Points by Player"
          height={300}
        />
        <StatsChart 
          data={assistsChartData} 
          type="bar" 
          title="Assists by Player"
          height={300}
        />
      </div>

      {/* Player Performances */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Player Performances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playersWithStats.map((player) => (
            <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{player.name}</h3>
                  <p className="text-sm text-gray-500">ID: {player.external_id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{player.stats.point || 0}</p>
                  <p className="text-gray-500">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{player.stats.assist || 0}</p>
                  <p className="text-gray-500">Assists</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{player.stats.steal || 0}</p>
                  <p className="text-gray-500">Steals</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-purple-600">{player.stats.block || 0}</p>
                  <p className="text-gray-500">Blocks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-yellow-600">
                    {(player.stats.off_reb || 0) + (player.stats.def_reb || 0)}
                  </p>
                  <p className="text-gray-500">Rebounds</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-600">{player.stats.turnover || 0}</p>
                  <p className="text-gray-500">Turnovers</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Efficiency</span>
                  <span>
                    {player.stats.point ? 
                      ((player.stats.point / (player.stats.point + (player.stats.assist || 0) + (player.stats.steal || 0) + (player.stats.block || 0))) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ 
                      width: `${player.stats.point ? 
                        ((player.stats.point / (player.stats.point + (player.stats.assist || 0) + (player.stats.steal || 0) + (player.stats.block || 0))) * 100)
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Heatmaps */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shot Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {playersWithStats.slice(0, 2).map((player) => (
            <Heatmap 
              key={player.id}
              gameId={game.id} 
              playerId={player.id} 
              heatmapUrl={heatmapUrl}
              playerName={player.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 