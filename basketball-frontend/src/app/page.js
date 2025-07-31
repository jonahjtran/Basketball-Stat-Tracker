'use client';

import Link from 'next/link';
import { playerAPI, gameAPI } from '@/lib/api';
import PlayerCard from '@/components/PlayerCard';
import GameCard from '@/components/GameCard';
import { Users, Calendar, TrendingUp, ArrowRight, Star, Trophy, Target } from 'lucide-react';

// Mock data for development - replace with actual API calls
const mockPlayers = [
  { id: 1, name: "LeBron James", external_id: "lebron_james", stats: { points: 28.5, assists: 8.7, games_played: 45 } },
  { id: 2, name: "Stephen Curry", external_id: "stephen_curry", stats: { points: 29.8, assists: 6.3, games_played: 42 } },
  { id: 3, name: "Kevin Durant", external_id: "kevin_durant", stats: { points: 27.1, assists: 5.2, games_played: 38 } },
  { id: 4, name: "Giannis Antetokounmpo", external_id: "giannis_antetokounmpo", stats: { points: 31.2, assists: 5.8, games_played: 47 } },
];

const mockGames = [
  { id: 1, opponent: "Lakers", date: "2025-01-15", external_id: "game_001", score: "112-108" },
  { id: 2, opponent: "Warriors", date: "2025-01-12", external_id: "game_002", score: "98-105" },
  { id: 3, opponent: "Celtics", date: "2025-01-10", external_id: "game_003", score: "120-115" },
];

export default function HomePage() {
  // In production, uncomment these lines and remove mock data
  // const players = await playerAPI.getAll();
  // const games = await gameAPI.getAll();
  
  const players = mockPlayers;
  const games = mockGames;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Basketball</span> Stat Tracker
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto text-balance">
            Track player performance, game statistics, and shot analytics with precision and style
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{players.length}</p>
                <p className="text-sm text-slate-500">Active Players</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{games.length}</p>
                <p className="text-sm text-slate-500">Games Tracked</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">2025</p>
                <p className="text-sm text-slate-500">Active Season</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Games Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Recent Games</h2>
            <p className="text-slate-600">Latest matchups and performances</p>
          </div>
          <Link 
            href="/games" 
            className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors duration-200"
          >
            <span>View All Games</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.slice(0, 6).map((game, index) => (
            <div key={game.id} className="animate-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Link href={`/games/${game.id}`}>
                <GameCard game={game} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Top Players Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Top Players</h2>
            <p className="text-slate-600">Leading performers this season</p>
          </div>
          <Link 
            href="/players" 
            className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors duration-200"
          >
            <span>View All Players</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.slice(0, 8).map((player, index) => (
            <div key={player.id} className="animate-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Link href={`/players/${player.id}`}>
                <PlayerCard player={player} stats={player.stats} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Why Choose Our Platform?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Comprehensive basketball analytics with modern design and powerful insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Shot Analytics</h3>
                <p className="text-slate-600">
                  Advanced heatmaps and shot zone analysis for every player
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Performance Tracking</h3>
                <p className="text-slate-600">
                  Real-time statistics and performance trends over time
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Game Insights</h3>
                <p className="text-slate-600">
                  Detailed game summaries and player performance breakdowns
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
