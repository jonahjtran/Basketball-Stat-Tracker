'use client';

import Link from 'next/link';
import { playerAPI, heatmapAPI } from '@/lib/api';
import StatsTable from '@/components/StatsTable';
import StatsChart from '@/components/StatsChart';
import Heatmap from '@/components/Heatmap';
import { ArrowLeft, User, Calendar, Target } from 'lucide-react';

// Mock data for development - replace with actual API calls
const mockPlayer = {
  id: 1,
  name: "LeBron James",
  external_id: "lebron_james"
};

const mockGameStats = [
  { id: 1, opponent: "Warriors", date: "2025-01-15", point: 28, assist: 8, steal: 2, block: 1, off_reb: 2, def_reb: 6, turnover: 3 },
  { id: 2, opponent: "Celtics", date: "2025-01-12", point: 32, assist: 12, steal: 1, block: 2, off_reb: 1, def_reb: 8, turnover: 2 },
  { id: 3, opponent: "Lakers", date: "2025-01-10", point: 25, assist: 6, steal: 3, block: 0, off_reb: 3, def_reb: 5, turnover: 4 },
];

const mockSeasonStats = {
  point: 28.5,
  assist: 8.7,
  steal: 2.1,
  block: 1.2,
  off_reb: 2.3,
  def_reb: 6.8,
  turnover: 3.1,
  games_played: 45
};

const mockHeatmapUrl = "https://placeholder.com/heatmap-1-1";

export default function PlayerDetailPage({ params }) {
  const { id } = params;
  
  // In production, uncomment these lines and remove mock data
  // const player = await playerAPI.getById(id);
  // const gameStats = await playerAPI.getGameStats(id);
  // const seasonStats = await playerAPI.getSeasonStats(id);
  // const heatmapData = await heatmapAPI.getHeatmap(gameId, id);
  
  const player = mockPlayer;
  const gameStats = mockGameStats;
  const seasonStats = mockSeasonStats;
  const heatmapUrl = mockHeatmapUrl;

  // Prepare chart data
  const pointsChartData = gameStats.map(game => ({
    name: game.opponent,
    value: game.point
  }));

  const assistsChartData = gameStats.map(game => ({
    name: game.opponent,
    value: game.assist
  }));

  const overallStatsData = [
    { name: 'Points', value: seasonStats.point },
    { name: 'Assists', value: seasonStats.assist },
    { name: 'Steals', value: seasonStats.steal },
    { name: 'Blocks', value: seasonStats.block },
    { name: 'Rebounds', value: seasonStats.off_reb + seasonStats.def_reb },
    { name: 'Turnovers', value: seasonStats.turnover },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/players" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Players</span>
        </Link>
      </div>

      {/* Player Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
            <p className="text-gray-600">ID: {player.external_id}</p>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsTable stats={seasonStats} title="Season Statistics" />
        <StatsChart 
          data={overallStatsData} 
          type="bar" 
          title="Season Performance Overview"
          height={400}
        />
      </div>

      {/* Game Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsChart 
          data={pointsChartData} 
          type="line" 
          title="Points per Game"
          height={300}
        />
        <StatsChart 
          data={assistsChartData} 
          type="line" 
          title="Assists per Game"
          height={300}
        />
      </div>

      {/* Recent Games Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Games</h2>
        <div className="space-y-4">
          {gameStats.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">vs {game.opponent}</h3>
                    <p className="text-sm text-gray-500">{game.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{game.point}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">{game.assist}</p>
                  <p className="text-gray-500">Assists</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">{game.steal}</p>
                  <p className="text-gray-500">Steals</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">{game.block}</p>
                  <p className="text-gray-500">Blocks</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-yellow-600">{game.off_reb + game.def_reb}</p>
                  <p className="text-gray-500">Rebounds</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-red-600">{game.turnover}</p>
                  <p className="text-gray-500">Turnovers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-600">
                    {((game.point / (game.point + game.assist + game.steal + game.block)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-500">Efficiency</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap 
        gameId={1} 
        playerId={player.id} 
        heatmapUrl={heatmapUrl}
        playerName={player.name}
      />
    </div>
  );
} 