'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Filter, Download, TrendingUp, Target, Trophy, Map } from 'lucide-react';
import Link from 'next/link';
import HeatmapModal from '@/components/HeatmapModal';

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') || 'players';
  
  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Heatmap state
  const [heatmapModal, setHeatmapModal] = useState({
    isOpen: false,
    data: null,
    title: '',
    totalEvents: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch players
      const playersResponse = await fetch('http://localhost:8000/games/players/');
      const playersData = await playersResponse.json();
      
      // Fetch career stats for each player
      const playersWithStats = await Promise.all(
        playersData.map(async (player) => {
          try {
            const statsResponse = await fetch(`http://localhost:8000/games/player-stats/${player.id}/`);
            const statsData = await statsResponse.json();
            return {
              ...player,
              stats: statsData
            };
          } catch (error) {
            console.error(`Error fetching stats for player ${player.id}:`, error);
            return {
              ...player,
              stats: null
            };
          }
        })
      );
      
      setPlayers(playersWithStats);

      // Fetch games
      const gamesResponse = await fetch('http://localhost:8000/games/games/');
      const gamesData = await gamesResponse.json();
      setGames(gamesData);

      // Fetch seasons
      const seasonsResponse = await fetch('http://localhost:8000/games/seasons/');
      const seasonsData = await seasonsResponse.json();
      setSeasons(seasonsData);

    } catch (error) {
      console.error('Error fetching data:', error);
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

  const renderPlayersView = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading players...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Link href={`/analytics/player/${player.id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors">{player.name}</h3>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateHeatmap(`heatmap/player/${player.id}/`, `${player.name} Career Heatmap`)}
                      className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Generate Heatmap"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {player.stats?.averages?.ppg || player.stats?.points ? 
                        (player.stats.averages?.ppg || Math.round(player.stats.points / (player.stats.games_played || 1))) : 
                        '--'}
                    </p>
                    <p className="text-xs text-slate-500">PPG</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {player.stats?.averages?.apg || player.stats?.assists ? 
                        (player.stats.averages?.apg || Math.round(player.stats.assists / (player.stats.games_played || 1))) : 
                        '--'}
                    </p>
                    <p className="text-xs text-slate-500">APG</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {player.stats?.averages?.off_reb_per_game || player.stats?.offensive_rebounds ? 
                        (player.stats.averages?.off_reb_per_game || Math.round((player.stats.offensive_rebounds + player.stats.defensive_rebounds) / (player.stats.games_played || 1))) : 
                        '--'}
                    </p>
                    <p className="text-xs text-slate-500">RPG</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {player.stats?.games_played || '--'}
                    </p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGamesView = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading games...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Link href={`/games/${game.id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">vs {game.opponent}</h3>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateHeatmap(`heatmap/game/${game.id}/`, `All Players vs ${game.opponent}`)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Generate Game Heatmap"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{new Date(game.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Game ID: {game.external_id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSeasonsView = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading seasons...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasons.map((season) => (
            <div key={season.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Link href={`/analytics/season/${season.id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-green-600 transition-colors cursor-pointer">{season.name}</h3>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateHeatmap(`heatmap/season/${season.id}/`, `All Players - ${season.name}`)}
                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Generate Season Heatmap"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    {new Date(season.start_date).getFullYear()} - {new Date(season.end_date).getFullYear()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">--</p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">--</p>
                    <p className="text-xs text-slate-500">Avg PPG</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive statistics and performance insights</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('players')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedView === 'players'
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Players
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
        </div>

        <div className="flex items-center space-x-2 text-black">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="recent">Recent</option>
            <option value="top">Top Performers</option>
          </select>
          <button className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          {selectedView === 'players' && renderPlayersView()}
          {selectedView === 'games' && renderGamesView()}
          {selectedView === 'seasons' && renderSeasonsView()}
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