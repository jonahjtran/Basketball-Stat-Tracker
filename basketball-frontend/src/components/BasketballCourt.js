'use client';

import { useState, useRef } from 'react';

export default function BasketballCourt({ 
  onCourtClick, 
  events = [], 
  width = 500, 
  height = 470,
  interactive = true 
}) {
  const courtRef = useRef(null);

  const handleClick = (e) => {
    if (!interactive || !onCourtClick) return;
    
    const rect = courtRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to court coordinates
    // Court coordinate system: center at (0,0), extends from -250 to 250 horizontally, -47.5 to 422.5 vertically
    const courtX = ((x / width) * 500) - 250;
    const courtY = ((y / height) * 470) - 47.5;
    
    const clickType = e.button === 0 ? 'left' : 'right';
    onCourtClick({ x: courtX, y: courtY, screenX: x, screenY: y }, clickType);
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent browser context menu
    handleClick(e);
  };

  // Convert court coordinates to screen coordinates
  const courtToScreen = (courtX, courtY) => {
    const screenX = ((courtX + 250) / 500) * width;
    const screenY = ((courtY + 47.5) / 470) * height;
    return { x: screenX, y: screenY };
  };

  return (
    <div className="relative bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg border border-slate-200 shadow-inner">
      <svg
        ref={courtRef}
        width={width}
        height={height}
        viewBox="0 0 500 470"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleClick}
        className={`w-full h-full ${interactive ? 'cursor-crosshair' : ''}`}
        style={{ 
          background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 100%)',
          borderRadius: '8px'
        }}
      >
        {/* Court background */}
        <rect width="500" height="470" fill="url(#courtGradient)" />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="courtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Transform group to match heatmap coordinate system */}
        <g transform="translate(250, 47.5)">
          
          {/* Court boundaries */}
          {/* Top sideline (half-court line) */}
          <line 
            x1="-250" y1="422.5" x2="250" y2="422.5" 
            stroke="white" strokeWidth="4"
          />
          {/* Bottom sideline (baseline) */}
          <line 
            x1="-250" y1="-47.5" x2="250" y2="-47.5" 
            stroke="white" strokeWidth="4"
          />
          {/* Left sideline */}
          <line 
            x1="-250" y1="-47.5" x2="-250" y2="422.5" 
            stroke="white" strokeWidth="4"
          />
          {/* Right sideline */}
          <line 
            x1="250" y1="-47.5" x2="250" y2="422.5" 
            stroke="white" strokeWidth="4"
          />

          {/* Center circle */}
          <circle 
            cx="0" cy="422.5" r="60" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />
          <circle 
            cx="0" cy="422.5" r="20" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Basketball hoop */}
          <circle 
            cx="0" cy="0" r="7.5" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Backboard */}
          <rect 
            x="-30" y="-8.5" width="60" height="1" 
            fill="url(#lineGradient)" stroke="none"
          />

          {/* Paint area - outer box */}
          <rect 
            x="-80" y="-47.5" width="160" height="190" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Paint area - inner box */}
          <rect 
            x="-60" y="-47.5" width="120" height="190" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Free throw circle - top arc */}
          <path 
            d="M -60 142.5 A 60 60 0 0 1 60 142.5" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Free throw circle - bottom arc (dashed) */}
          <path 
            d="M -60 142.5 A 60 60 0 0 0 60 142.5" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3" 
            strokeDasharray="5,5"
          />

          {/* Restricted area */}
          <path 
            d="M -40 0 A 40 40 0 0 1 40 0" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          Three-point line
          {/* Left corner three vertical line */}
          <line 
            x1="-220" y1="-47.5" x2="-220" y2="92.5" 
            stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Right corner three vertical line */}
          <line 
            x1="220" y1="-47.5" x2="220" y2="92.5" 
            stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Left baseline three-point line */}
          <line 
            x1="-220" y1="-47.5" x2="-220" y2="92.7" 
            stroke="white" strokeWidth="3" fill="none"
          />

          {/* Right baseline three-point line */}
          <line 
            x1="220" y1="92.7" x2="220" y2="-47.5" 
            stroke="white" strokeWidth="3"
          />

          {/* Three-point arc - corrected to curve away from basket */}
          <path 
            d="M -220 92.5 A 237.5 237.5 0 0 0 220 92.5" 
            fill="none" stroke="url(#lineGradient)" strokeWidth="3"
          />

          {/* Event markers */}
          {events.map((event, index) => {
            const screenPos = courtToScreen(event.x || event.position?.x || 0, event.y || event.position?.y || 0);
            return (
              <circle
                key={event.id || index}
                cx={event.x || event.position?.x || 0}
                cy={event.y || event.position?.y || 0}
                r="4"
                fill={
                  event.color === 'green' ? '#10b981' :
                  event.color === 'red' ? '#ef4444' :
                  event.color === 'blue' ? '#3b82f6' :
                  event.color === 'orange' ? '#f97316' :
                  event.color === 'purple' ? '#8b5cf6' :
                  event.color === 'yellow' ? '#eab308' : '#6b7280'
                }
                stroke="white"
                strokeWidth="2"
                opacity="0.9"
              >
                <title>{`${event.player || 'Player'}: ${event.action || 'Action'}`}</title>
              </circle>
            );
          })}
        </g>
      </svg>
      
      {/* Court legend */}
      {interactive && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Click anywhere on court to record event
        </div>
      )}
    </div>
  );
}