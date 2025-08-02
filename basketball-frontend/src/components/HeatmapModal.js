'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share2, Maximize2 } from 'lucide-react';

export default function HeatmapModal({ isOpen, onClose, heatmapData, title, totalEvents }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && heatmapData) {
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, heatmapData]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (heatmapData) {
      const link = document.createElement('a');
      link.href = heatmapData;
      link.download = `${title || 'heatmap'}.png`;
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title || 'Basketball Heatmap',
        text: `Check out this basketball heatmap: ${title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{title || 'Basketball Heatmap'}</h2>
            {totalEvents && (
              <p className="text-sm text-slate-500 mt-1">
                {totalEvents} events analyzed
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-slate-600">Generating heatmap...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <X className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Heatmap</h3>
              <p className="text-slate-600">{error}</p>
            </div>
          ) : heatmapData ? (
            <div className="space-y-4">
              {/* Heatmap Image */}
              <div className="relative group">
                <img
                  src={heatmapData}
                  alt={title || 'Basketball Heatmap'}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white/90 rounded-full shadow-lg">
                    <Maximize2 className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Heatmap Legend</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-slate-600">Made Shots</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-slate-600">Missed Shots</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Darker areas indicate higher shot frequency. Red areas show made shots, blue areas show missed shots.
                </p>
              </div>

              {/* Stats Summary */}
              {totalEvents && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Analysis Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Events:</span>
                      <span className="ml-2 font-semibold text-slate-900">{totalEvents}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Data Points:</span>
                      <span className="ml-2 font-semibold text-slate-900">Shot Locations</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <X className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Heatmap Data</h3>
              <p className="text-slate-600">Unable to generate heatmap for this selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 