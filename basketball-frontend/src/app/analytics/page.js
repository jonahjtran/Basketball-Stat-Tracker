'use client';

import { useState } from 'react';
import { BarChart3, Filter, Download, TrendingUp, Target, Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedView, setSelectedView] = useState('players');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with actual API calls
  const mockPlayers = [
    { id: 1, name: "LeBron James", points: 28.5, assists: 8.7, rebounds: 7.5, games: 45 },
    { id: 2, name: "Stephen Curry", points: 29.8, assists: 6.3, rebounds: 4.2, games: 42 },
    { id: 3, name: "Kevin Durant", points: 27.1, assists: 5.2, rebounds: 6.8, games: 38 },
    { id: 4, name: "Giannis Antetokounmpo", points: 31.2, assists: 5.8, rebounds: 11.5, games: 47 },
  ];

  const mockGames = [
    { id: 1, opponent: "Lakers", date: "2025-01-15", score: "112-108", totalPoints: 220 },
    { id: 2, opponent: "Warriors", date: "2025-01-12", score: "98-105", totalPoints: 203 },
    { id: 3, opponent: "Celtics", date: "2025-01-10", score: "120-115", totalPoints: 235 },
  ];

  const mockSeasons = [
    { id: 1, name: "2024-25 Season", games: 47, avgPoints: 112.5, avgAssists: 24.3 },
    { id: 2, name: "2023-24 Season", games: 82, avgPoints: 108.2, avgAssists: 22.1 },
  ];

  const renderPlayersView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockPlayers.map((player) => (
          <div key={player.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{player.name}</h3>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{player.points}</p>
                  <p className="text-xs text-slate-500">PPG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{player.assists}</p>
                  <p className="text-xs text-slate-500">APG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{player.rebounds}</p>
                  <p className="text-xs text-slate-500">RPG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{player.games}</p>
                  <p className="text-xs text-slate-500">Games</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGamesView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGames.map((game) => (
          <div key={game.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">vs {game.opponent}</h3>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{game.date}</p>
                <p className="text-2xl font-bold text-slate-900">{game.score}</p>
                <p className="text-sm text-slate-600">Total Points: {game.totalPoints}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSeasonsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSeasons.map((season) => (
          <div key={season.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{season.name}</h3>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{season.games}</p>
                  <p className="text-xs text-slate-500">Games</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{season.avgPoints}</p>
                  <p className="text-xs text-slate-500">Avg PPG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{season.avgAssists}</p>
                  <p className="text-xs text-slate-500">Avg APG</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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

        <div className="flex items-center space-x-2">
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
    </div>
  );
} 