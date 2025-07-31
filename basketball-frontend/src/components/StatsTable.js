'use client';

import { TrendingUp, Target, Shield, Zap, RotateCcw, Minus, BarChart3 } from 'lucide-react';

export default function StatsTable({ stats, title = "Statistics" }) {
  const statItems = [
    { key: 'point', label: 'Points', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { key: 'assist', label: 'Assists', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
    { key: 'steal', label: 'Steals', icon: Zap, color: 'text-green-600', bg: 'bg-green-100' },
    { key: 'block', label: 'Blocks', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
    { key: 'off_reb', label: 'Off. Reb', icon: RotateCcw, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { key: 'def_reb', label: 'Def. Reb', icon: RotateCcw, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { key: 'turnover', label: 'Turnovers', icon: Minus, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="card-header border-b border-border bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="divide-y divide-border">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            const value = stats[item.key] || 0;
            
            return (
              <div 
                key={item.key} 
                className="group hover:bg-muted/50 transition-colors duration-200 animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${item.color}`}>
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </span>
                    {value > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="card-footer bg-gradient-to-r from-muted/30 to-muted/50">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-muted-foreground">Total Stats</span>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {Object.values(stats).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Combined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 