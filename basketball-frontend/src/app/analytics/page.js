'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Filter, Download, TrendingUp, Target, Trophy, Map, Trash2, AlertTriangle, X } from 'lucide-react';
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

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: '', // 'player', 'game', 'season'
    item: null,
    loading: false
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
      
      // Fetch stats for each season
      const seasonsWithStats = await Promise.all(
        seasonsData.map(async (season) => {
          try {
            const statsResponse = await fetch(`http://localhost:8000/games/seasons/${season.id}/stats/`);
            const statsData = await statsResponse.json();
            return {
              ...season,
              stats: statsData
            };
          } catch (error) {
            console.error(`Error fetching stats for season ${season.id}:`, error);
            return {
              ...season,
              stats: { games_count: 0, avg_ppg: 0 }
            };
          }
        })
      );
      setSeasons(seasonsWithStats);

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

  const openDeleteModal = (type, item) => {
    setDeleteModal({
      isOpen: true,
      type,
      item,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: '',
      item: null,
      loading: false
    });
  };

  const handleDelete = async () => {
    const { type, item } = deleteModal;
    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      let endpoint = '';
      switch (type) {
        case 'player':
          endpoint = `http://localhost:8000/games/players/${item.id}/delete/`;
          break;
        case 'game':
          endpoint = `http://localhost:8000/games/games/${item.id}/delete/`;
          break;
        case 'season':
          endpoint = `http://localhost:8000/games/seasons/${item.id}/delete/`;
          break;
        default:
          throw new Error('Invalid delete type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data after successful deletion
        await fetchData();
        closeDeleteModal();
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error deleting ${type}: ${error.message}`);
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
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
                    <button
                      onClick={() => openDeleteModal('player', player)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
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
                    <button
                      onClick={() => openDeleteModal('game', game)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Game"
                    >
                      <Trash2 className="w-4 h-4" />
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
                    <button
                      onClick={() => openDeleteModal('season', season)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Season"
                    >
                      <Trash2 className="w-4 h-4" />
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
                    <p className="text-2xl font-bold text-green-600" style={{ color: '#059669' }}>
                      {season.stats?.games_count || 0}
                    </p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600" style={{ color: '#ea580c' }}>
                      {season.stats?.avg_ppg || 0}
                    </p>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Delete {deleteModal.type === 'player' ? 'Player' : deleteModal.type === 'game' ? 'Game' : 'Season'}
                </h2>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={deleteModal.loading}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-slate-700">
                <p className="font-medium mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-900">
                    {deleteModal.item?.name || `vs ${deleteModal.item?.opponent}`}
                  </span>
                  ?
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Warning: This action cannot be undone!</p>
                      <p>
                        Deleting this {deleteModal.type} will also permanently delete all related:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {deleteModal.type === 'player' && (
                          <>
                            <li>Player statistics and career data</li>
                            <li>Game performances and season records</li>
                            <li>All associated events and heatmaps</li>
                          </>
                        )}
                        {deleteModal.type === 'game' && (
                          <>
                            <li>All player statistics for this game</li>
                            <li>Game events and shot data</li>
                            <li>Associated heatmaps and analytics</li>
                          </>
                        )}
                        {deleteModal.type === 'season' && (
                          <>
                            <li>All games in this season</li>
                            <li>Player season statistics</li>
                            <li>Season events, heatmaps, and analytics</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={deleteModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteModal.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteModal.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete {deleteModal.type === 'player' ? 'Player' : deleteModal.type === 'game' ? 'Game' : 'Season'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 