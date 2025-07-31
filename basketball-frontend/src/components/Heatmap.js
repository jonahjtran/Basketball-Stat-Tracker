'use client';

import { useState } from 'react';
import { Target, Image, AlertCircle, Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function Heatmap({ gameId, playerId, heatmapUrl, playerName = "Player" }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="card overflow-hidden">
      <div className="card-header border-b border-border bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="card-title">Shot Chart - {playerName}</h3>
              <p className="card-description">
                Game ID: {gameId} | Player ID: {playerId}
              </p>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1 rounded-md hover:bg-muted transition-colors duration-200 disabled:opacity-50"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1 rounded-md hover:bg-muted transition-colors duration-200 disabled:opacity-50"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        {imageLoading && (
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent"></div>
              <span>Loading shot chart...</span>
            </div>
          </div>
        )}
        
        {imageError && (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Shot chart not available
            </h4>
            <p className="text-muted-foreground text-center max-w-sm">
              No heatmap data for this player in this game. The shot chart will appear once game data is processed.
            </p>
          </div>
        )}
        
        {heatmapUrl && !imageError && (
          <div className="space-y-4">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-lg bg-muted/30">
              <div 
                className="transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={heatmapUrl}
                  alt={`Shot chart for ${playerName}`}
                  className="w-full h-auto rounded-lg shadow-sm"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
              </div>
            </div>
            
            {/* Legend */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2 text-orange-800 mb-3">
                <Image className="w-4 h-4" />
                <span className="text-sm font-medium">Shot Chart Legend</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-orange-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Made Shots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Missed Shots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Three Pointers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Free Throws</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Use zoom controls to explore shot patterns
              </div>
              <button className="btn-outline flex items-center space-x-2 text-xs">
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 