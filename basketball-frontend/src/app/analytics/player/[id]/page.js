'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, Target, TrendingUp, Calendar, Trophy, ArrowLeft, Search, Filter, Map } from 'lucide-react';
import Link from 'next/link';
import HeatmapModal from '@/components/HeatmapModal';

export default function PlayerAnalyticsPage() {
  const params = useParams();
  const playerId = params.id;
  
  const [player, setPlayer] = useState(null);
  const [careerStats, setCareerStats] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('career');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Heatmap state
  const [heatmapModal, setHeatmapModal] = useState({
    isOpen: false,
    data: null,
    title: '',
    totalEvents: 0
  });

  useEffect(() => {
    fetchPlayerData();
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      
      // Fetch player details
      const playerResponse = await fetch(`http://localhost:8000/games/players/${playerId}/`);
      const playerData = await playerResponse.json();
      setPlayer(playerData);

      // Fetch career stats
      const careerResponse = await fetch(`http://localhost:8000/games/player-stats/${playerId}/`);
      const careerData = await careerResponse.json();
      setCareerStats(careerData);

      // Fetch player's seasons with stats
      const seasonsResponse = await fetch(`http://localhost:8000/games/seasons/`);
      const seasonsData = await seasonsResponse.json();
      
      // Fetch season stats for each season
      const seasonsWithStats = await Promise.all(
        seasonsData.map(async (season) => {
          try {
            const seasonStatsResponse = await fetch(`http://localhost:8000/games/player-season/${season.id}/${playerId}/`);
            const seasonStatsData = await seasonStatsResponse.json();
            return {
              ...season,
              stats: seasonStatsData
            };
          } catch (error) {
            console.error(`Error fetching season stats for season ${season.id}:`, error);
            return {
              ...season,
              stats: null
            };
          }
        })
      );
      setSeasons(seasonsWithStats);

      // Fetch player's games with stats
      const gamesResponse = await fetch(`http://localhost:8000/games/games/`);
      const gamesData = await gamesResponse.json();
      
      // Fetch game stats for each game
      const gamesWithStats = await Promise.all(
        gamesData.map(async (game) => {
          try {
            const gameStatsResponse = await fetch(`http://localhost:8000/games/player-game/${game.id}/${playerId}/`);
            const gameStatsData = await gameStatsResponse.json();
            return {
              ...game,
              stats: gameStatsData
            };
          } catch (error) {
            console.error(`Error fetching game stats for game ${game.id}:`, error);
            return {
              ...game,
              stats: null
            };
          }
        })
      );
      setGames(gamesWithStats);

    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          title: data.error || 'Error generating heatmap',
          totalEvents: 0
        });
      }
    } catch (error) {
      console.error('Error generating heatmap:', error);
      setHeatmapModal({
        isOpen: true,
        data: null,
        title: `Error: ${error.message}`,
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

  const renderCareerView = () => {
    if (!careerStats) return <div className="text-center py-8">No career stats available</div>;

    return (
      <div className="space-y-6">
        {/* Career Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Career Overview</h3>
            <button
              onClick={() => generateHeatmap(`heatmap/player/${playerId}/`, `${player?.name} Career Heatmap`)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>Generate Heatmap</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{careerStats.games_played || 0}</p>
              <p className="text-sm text-slate-500">Games Played</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{careerStats.points || 0}</p>
              <p className="text-sm text-slate-500">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{careerStats.assists || 0}</p>
              <p className="text-sm text-slate-500">Total Assists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{careerStats.steals || 0}</p>
              <p className="text-sm text-slate-500">Total Steals</p>
            </div>
          </div>
        </div>

        {/* Career Averages */}
        {careerStats.averages && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Career Averages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{careerStats.averages.ppg || 0}</p>
                <p className="text-sm text-slate-500">PPG</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{careerStats.averages.apg || 0}</p>
                <p className="text-sm text-slate-500">APG</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{careerStats.averages.spg || 0}</p>
                <p className="text-sm text-slate-500">SPG</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{careerStats.averages.bpg || 0}</p>
                <p className="text-sm text-slate-500">BPG</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Points</span>
                <span className="font-semibold">{careerStats.points || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Assists</span>
                <span className="font-semibold">{careerStats.assists || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Steals</span>
                <span className="font-semibold">{careerStats.steals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Blocks</span>
                <span className="font-semibold">{careerStats.blocks || 0}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Offensive Rebounds</span>
                <span className="font-semibold">{careerStats.offensive_rebounds || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Defensive Rebounds</span>
                <span className="font-semibold">{careerStats.defensive_rebounds || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Turnovers</span>
                <span className="font-semibold">{careerStats.turnovers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Games Played</span>
                <span className="font-semibold">{careerStats.games_played || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSeasonView = () => {
    const filteredSeasons = seasons.filter(season => 
      selectedSeason === 'all' || season.id.toString() === selectedSeason
    );

    return (
      <div className="space-y-6">
        {/* Season Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">Filter by Season:</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>{season.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seasons List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeasons.map((season) => (
            <div key={season.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{season.name}</h3>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    {new Date(season.start_date).getFullYear()} - {new Date(season.end_date).getFullYear()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">
                      {season.stats?.games_played || '--'}
                    </p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {season.stats?.point ? Math.round(season.stats.point / (season.stats.games_played || 1)) : '--'}
                    </p>
                    <p className="text-xs text-slate-500">Avg PPG</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGamesView = () => {
    const filteredGames = games.filter(game => 
      game.opponent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.external_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search games by opponent or game ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">vs {game.opponent}</h3>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{new Date(game.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Game ID: {game.external_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">
                      {game.stats?.point || '--'}
                    </p>
                    <p className="text-xs text-slate-500">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {game.stats?.assist || '--'}
                    </p>
                    <p className="text-xs text-slate-500">Assists</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Player not found</p>
        <Link href="/analytics" className="text-orange-600 hover:text-orange-700">
          Back to Analytics
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Link 
            href="/analytics"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analytics</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{player.name}</h1>
            <p className="text-slate-600">Player ID: {player.external_id}</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('career')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedView === 'career'
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Career Stats
          </button>
          <button
            onClick={() => setSelectedView('seasons')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedView === 'seasons'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Seasons
          </button>
          <button
            onClick={() => setSelectedView('games')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedView === 'games'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Games
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          {selectedView === 'career' && renderCareerView()}
          {selectedView === 'seasons' && renderSeasonView()}
          {selectedView === 'games' && renderGamesView()}
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