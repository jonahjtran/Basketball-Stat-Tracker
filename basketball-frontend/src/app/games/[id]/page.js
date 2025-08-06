'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import StatsTable from '@/components/StatsTable';
import StatsChart from '@/components/StatsChart';
import Heatmap from '@/components/Heatmap';
import HeatmapModal from '@/components/HeatmapModal';
import PlayerCard from '@/components/PlayerCard';
import { ArrowLeft, Calendar, Users, Trophy, Target } from 'lucide-react';

export default function GameDetailPage({ params }) {
  const { id } = use(params);
  
  // State management
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Heatmap state
  const [heatmapModal, setHeatmapModal] = useState({
    isOpen: false,
    data: null,
    title: '',
    totalEvents: 0
  });

  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        
        // Fetch game details
        const gameResponse = await fetch(`http://localhost:8000/games/games/${id}/`);
        if (!gameResponse.ok) {
          throw new Error('Failed to fetch game data');
        }
        const game = await gameResponse.json();

        // Fetch player game stats for this game
        const playerStatsResponse = await fetch(`http://localhost:8000/games/games/${id}/players/`);
        if (!playerStatsResponse.ok) {
          throw new Error('Failed to fetch player game stats');
        }
        const playerStats = await playerStatsResponse.json();

        setGameData({
          game,
          playerStats
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGameData();
  }, [id]);

  const generateHeatmap = async (endpoint, title) => {
    try {
      setHeatmapModal({
        isOpen: true,
        data: null,
        title: 'Generating heatmap...',
        totalEvents: 0
      });

      const response = await fetch(`http://localhost:8000/games/${endpoint}`);
      const data = await response.json();

      if (response.ok) {
        setHeatmapModal({
          isOpen: true,
          data: data.heatmap_data,
          title: data.title || title,
          totalEvents: data.total_events
        });
      } else {
        setHeatmapModal({
          isOpen: true,
          data: null,
          title: 'Error',
          totalEvents: 0
        });
      }
    } catch (error) {
      console.error('Error generating heatmap:', error);
      setHeatmapModal({
        isOpen: true,
        data: null,
        title: 'Error loading heatmap',
        totalEvents: 0
      });
    }
  };

  const closeHeatmapModal = () => {
    setHeatmapModal({
      isOpen: false,
      data: null,
      title: '',
      totalEvents: 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/analytics?view=games" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No game data found</p>
          <Link href="/analytics?view=games" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  const { game, playerStats } = gameData;

  // Prepare chart data
  const pointsChartData = playerStats.map(playerStat => ({
    name: playerStat.player_name || 'Unknown Player',
    value: playerStat.point || 0
  }));

  const assistsChartData = playerStats.map(playerStat => ({
    name: playerStat.player_name || 'Unknown Player',
    value: playerStat.assist || 0
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
          href="/analytics?view=games" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
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
              <span className="text-lg font-semibold text-gray-900">{playerStats.length}</span>
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
          {playerStats.map((playerStat) => (
            <div key={playerStat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{playerStat.player_name || 'Unknown Player'}</h3>
                  <p className="text-sm text-gray-500">Player ID: {playerStat.player_id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#111827' }}>{playerStat.point || 0}</p>
                  <p className="text-gray-500">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#111827' }}>{playerStat.assist || 0}</p>
                  <p className="text-gray-500">Assists</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>{playerStat.steal || 0}</p>
                  <p className="text-gray-500">Steals</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>{playerStat.block || 0}</p>
                  <p className="text-gray-500">Blocks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>
                    {(playerStat.off_reb || 0) + (playerStat.def_reb || 0)}
                  </p>
                  <p className="text-gray-500">Rebounds</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>{playerStat.turnover || 0}</p>
                  <p className="text-gray-500">Turnovers</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Efficiency</span>
                  <span>
                    {playerStat.point ? 
                      ((playerStat.point / (playerStat.point + (playerStat.assist || 0) + (playerStat.steal || 0) + (playerStat.block || 0))) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ 
                      width: `${playerStat.point ? 
                        ((playerStat.point / (playerStat.point + (playerStat.assist || 0) + (playerStat.steal || 0) + (playerStat.block || 0))) * 100)
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center">
            <button 
              onClick={() => generateHeatmap(`heatmap/game/${id}/`, `Game vs ${game.opponent} Heatmap`)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span>Generate Game Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Modal */}
      <HeatmapModal
        isOpen={heatmapModal.isOpen}
        onClose={closeHeatmapModal}
        heatmapData={heatmapModal.data}
        title={heatmapModal.title}
        totalEvents={heatmapModal.totalEvents}
      />
    </div>
  );
} 