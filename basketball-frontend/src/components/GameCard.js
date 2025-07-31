'use client';

import { Calendar, Users, Trophy, ArrowRight, Clock, MapPin } from 'lucide-react';

export default function GameCard({ game }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGameStatus = () => {
    const gameDate = new Date(game.date);
    const today = new Date();
    const diffTime = gameDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'Completed', color: 'text-green-600', bg: 'bg-green-100' };
    if (diffDays === 0) return { status: 'Today', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (diffDays <= 7) return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { status: 'Scheduled', color: 'text-slate-500', bg: 'bg-slate-100' };
  };

  const gameStatus = getGameStatus();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="p-6 space-y-4">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-orange-600 transition-colors duration-200">
                vs {game.opponent}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(game.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${gameStatus.bg} ${gameStatus.color}`}>
              {gameStatus.status}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </div>
        
        {/* Game Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Game ID:</span>
            <span className="font-medium text-slate-900">{game.external_id}</span>
          </div>
          
          {game.score && (
            <div className="flex items-center space-x-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-slate-500">Score:</span>
              <span className="font-bold text-slate-900">{game.score}</span>
            </div>
          )}
        </div>

        {/* Game Preview */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Match Preview</span>
            <span className="font-medium">Click to view details</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:w-full w-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 