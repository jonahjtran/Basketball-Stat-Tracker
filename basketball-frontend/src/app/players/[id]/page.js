'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsTable from '@/components/StatsTable';
import StatsChart from '@/components/StatsChart';
import Heatmap from '@/components/Heatmap';
import { ArrowLeft, User, Calendar, Target } from 'lucide-react';

export default function PlayerDetailPage({ params }) {
  const { id } = params;
  
  // Fetch real data from API
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/players/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }
        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/players" className="text-orange-600 hover:text-orange-700 mt-2 inline-block">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No player data found</p>
          <Link href="/players" className="text-orange-600 hover:text-orange-700 mt-2 inline-block">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const { player, careerStats, gameStats } = playerData;

  // Prepare chart data
  const pointsChartData = gameStats.map(game => ({
    name: game.game_id?.opponent || 'Unknown',
    value: game.point || 0
  }));

  const assistsChartData = gameStats.map(game => ({
    name: game.game_id?.opponent || 'Unknown',
    value: game.assist || 0
  }));

  const overallStatsData = [
    { name: 'Points', value: careerStats.points || 0 },
    { name: 'Assists', value: careerStats.assists || 0 },
    { name: 'Steals', value: careerStats.steals || 0 },
    { name: 'Blocks', value: careerStats.blocks || 0 },
    { name: 'Rebounds', value: (careerStats.offensive_rebounds || 0) + (careerStats.defensive_rebounds || 0) },
    { name: 'Turnovers', value: careerStats.turnovers || 0 },
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

      {/* Career Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsTable stats={careerStats} title="Career Statistics" />
        <StatsChart 
          data={overallStatsData} 
          type="bar" 
          title="Career Performance Overview"
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
          {gameStats.length > 0 ? (
            gameStats.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">vs {game.game_id?.opponent || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">{game.game_id?.date || 'Unknown Date'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className="text-2xl font-bold" 
                      style={{ color: '#111827' }}
                    >
                      {game.point || 0}
                    </p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4 text-sm">
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {game.assist || 0}
                    </p>
                    <p className="text-gray-500">Assists</p>
                  </div>
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {game.steal || 0}
                    </p>
                    <p className="text-gray-500">Steals</p>
                  </div>
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {game.block || 0}
                    </p>
                    <p className="text-gray-500">Blocks</p>
                  </div>
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {(game.off_reb || 0) + (game.def_reb || 0)}
                    </p>
                    <p className="text-gray-500">Rebounds</p>
                  </div>
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {game.turnover || 0}
                    </p>
                    <p className="text-gray-500">Turnovers</p>
                  </div>
                  <div className="text-center">
                    <p 
                      className="font-semibold" 
                      style={{ color: '#111827' }}
                    >
                      {game.point ? ((game.point / (game.point + (game.assist || 0) + (game.steal || 0) + (game.block || 0))) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-gray-500">Efficiency</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No games found for this player</p>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap 
        gameId={1} 
        playerId={player.id} 
        heatmapUrl={careerStats.heatmap_url}
        playerName={player.name}
      />
    </div>
  );
} 