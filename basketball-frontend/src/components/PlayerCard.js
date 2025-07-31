'use client';

import { User, TrendingUp, Calendar, Target, Star } from 'lucide-react';

export default function PlayerCard({ player, stats = null }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="p-6 space-y-4">
        {/* Player Header */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors duration-200">
              {player.name}
            </h3>
            <p className="text-sm text-slate-500">ID: {player.external_id}</p>
          </div>
          {stats && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-slate-900">
                {stats.points ? Math.round(stats.points) : 'N/A'}
              </span>
            </div>
          )}
        </div>
        
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200">
            <div className="text-center group/stat">
              <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                <TrendingUp className="w-4 h-4 group-hover/stat:scale-110 transition-transform duration-200" />
                <span className="text-lg font-bold">{stats.points ? Math.round(stats.points) : 0}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Points</p>
            </div>
            <div className="text-center group/stat">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <Target className="w-4 h-4 group-hover/stat:scale-110 transition-transform duration-200" />
                <span className="text-lg font-bold">{stats.assists ? Math.round(stats.assists) : 0}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Assists</p>
            </div>
            <div className="text-center group/stat">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Calendar className="w-4 h-4 group-hover/stat:scale-110 transition-transform duration-200" />
                <span className="text-lg font-bold">{stats.games_played || 0}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Games</p>
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        {stats && stats.points && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Performance</span>
              <span className="font-medium">
                {stats.points >= 30 ? 'Elite' : stats.points >= 25 ? 'Great' : stats.points >= 20 ? 'Good' : 'Average'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((stats.points / 35) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 