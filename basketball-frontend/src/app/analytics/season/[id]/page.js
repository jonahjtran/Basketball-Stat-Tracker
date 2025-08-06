'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import StatsTable from '@/components/StatsTable';
import StatsChart from '@/components/StatsChart';
import Heatmap from '@/components/Heatmap';
import HeatmapModal from '@/components/HeatmapModal';
import { ArrowLeft, Calendar, Trophy, Target, Users, TrendingUp } from 'lucide-react';

export default function SeasonDetailPage({ params }) {
  const { id } = use(params);
  
  // State management
  const [seasonData, setSeasonData] = useState(null);
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
    async function fetchSeasonData() {
      try {
        setLoading(true);
        
        // Fetch season details
        const seasonResponse = await fetch(`http://localhost:8000/games/seasons/${id}/`);
        if (!seasonResponse.ok) {
          throw new Error('Failed to fetch season data');
        }
        const season = await seasonResponse.json();

        // Fetch all player season stats for this season
        const playerSeasonsResponse = await fetch(`http://localhost:8000/games/seasons/${id}/players/`);
        if (!playerSeasonsResponse.ok) {
          throw new Error('Failed to fetch player season stats');
        }
        const playerSeasons = await playerSeasonsResponse.json();

        // Fetch games for this season
        const gamesResponse = await fetch(`http://localhost:8000/games/games/?season_id=${id}`);
        const games = gamesResponse.ok ? await gamesResponse.json() : [];

        setSeasonData({
          season,
          playerSeasons,
          games
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSeasonData();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading season data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/analytics" className="text-green-600 hover:text-green-700 mt-2 inline-block">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  if (!seasonData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No season data found</p>
          <Link href="/analytics" className="text-green-600 hover:text-green-700 mt-2 inline-block">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  const { season, playerSeasons, games } = seasonData;

  // Calculate season totals
  const seasonTotals = playerSeasons.reduce((totals, player) => ({
    points: totals.points + (player.points || 0),
    assists: totals.assists + (player.assists || 0),
    steals: totals.steals + (player.steals || 0),
    blocks: totals.blocks + (player.blocks || 0),
    offensive_rebounds: totals.offensive_rebounds + (player.offensive_rebounds || 0),
    defensive_rebounds: totals.defensive_rebounds + (player.defensive_rebounds || 0),
    turnovers: totals.turnovers + (player.turnovers || 0),
    games_played: Math.max(totals.games_played, player.games_played || 0)
  }), {
    points: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    offensive_rebounds: 0,
    defensive_rebounds: 0,
    turnovers: 0,
    games_played: 0
  });

  // Calculate averages
  const totalPlayers = playerSeasons.length;
  const seasonAverages = {
    point: totalPlayers > 0 ? (seasonTotals.points / totalPlayers).toFixed(1) : 0,
    assist: totalPlayers > 0 ? (seasonTotals.assists / totalPlayers).toFixed(1) : 0,
    steal: totalPlayers > 0 ? (seasonTotals.steals / totalPlayers).toFixed(1) : 0,
    block: totalPlayers > 0 ? (seasonTotals.blocks / totalPlayers).toFixed(1) : 0,
    off_reb: totalPlayers > 0 ? (seasonTotals.offensive_rebounds / totalPlayers).toFixed(1) : 0,
    def_reb: totalPlayers > 0 ? (seasonTotals.defensive_rebounds / totalPlayers).toFixed(1) : 0,
    turnover: totalPlayers > 0 ? (seasonTotals.turnovers / totalPlayers).toFixed(1) : 0,
    games_played: seasonTotals.games_played
  };

  // Prepare chart data
  const playerPointsData = playerSeasons.map(player => ({
    name: player.player_name || 'Unknown Player',
    value: player.points || 0
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const playerAssistsData = playerSeasons.map(player => ({
    name: player.player_name || 'Unknown Player',
    value: player.assists || 0
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const overallStatsData = [
    { name: 'Total Points', value: seasonTotals.points },
    { name: 'Total Assists', value: seasonTotals.assists },
    { name: 'Total Steals', value: seasonTotals.steals },
    { name: 'Total Blocks', value: seasonTotals.blocks },
    { name: 'Total Rebounds', value: seasonTotals.offensive_rebounds + seasonTotals.defensive_rebounds },
    { name: 'Total Turnovers', value: seasonTotals.turnovers },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/analytics" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </Link>
      </div>

      {/* Season Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{season.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(season.start_date).getFullYear()} - {new Date(season.end_date).getFullYear()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{totalPlayers} Players</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{games.length} Games</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Season Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsTable stats={seasonAverages} title="Season Averages per Player" />
        <StatsChart 
          data={overallStatsData} 
          type="bar" 
          title="Season Totals Overview"
          height={400}
        />
      </div>

      {/* Top Performers Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsChart 
          data={playerPointsData} 
          type="bar" 
          title="Top Scorers"
          height={300}
        />
        <StatsChart 
          data={playerAssistsData} 
          type="bar" 
          title="Top Assist Leaders"
          height={300}
        />
      </div>

      {/* Player Season Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Player Statistics</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assists
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rebounds
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PPG
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerSeasons.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.player_name || 'Unknown Player'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{ color: '#111827' }}>
                        {player.games_played || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900" style={{ color: '#111827' }}>
                        {player.points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{ color: '#111827' }}>
                        {player.assists || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{ color: '#111827' }}>
                        {(player.offensive_rebounds || 0) + (player.defensive_rebounds || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {player.games_played > 0 ? (player.points / player.games_played).toFixed(1) : '0.0'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Season Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Season Shot Chart</h2>
        <div className="flex justify-center">
          <button 
            onClick={() => generateHeatmap(`heatmap/season/${id}/`, `${season.name} Heatmap`)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Generate Season Heatmap</span>
          </button>
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