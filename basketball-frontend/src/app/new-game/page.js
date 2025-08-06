'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Users, Clock, Target, X, CheckCircle, AlertCircle, UserPlus, Calendar, Trophy } from 'lucide-react';
import BasketballCourt from '@/components/BasketballCourt';

export default function NewGamePage() {
  const [activeTab, setActiveTab] = useState('game'); // game, player, season
  const [gameState, setGameState] = useState('setup'); // setup, active, ended
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0],
    homeTeam: '',
    awayTeam: '',
    season_id: '',
  });
  const [seasons, setSeasons] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerData, setPlayerData] = useState({
    name: '',
  });
  const [seasonData, setSeasonData] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [events, setEvents] = useState([]);
  const [showPlayerInput, setShowPlayerInput] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const courtRef = useRef(null);

  const mockPlayers = [
    "LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo",
    "Luka Doncic", "Joel Embiid", "Nikola Jokic", "Damian Lillard"
  ];

  const actionTypes = {
    'left': { name: 'Made Shot', points: 2, color: 'green' },
    'right': { name: 'Missed Shot', points: 0, color: 'red' },
    'b': { name: 'Block', points: 0, color: 'blue' },
    'of': { name: 'Offensive Rebound', points: 0, color: 'orange' },
    'df': { name: 'Defensive Rebound', points: 0, color: 'purple' },
    't': { name: 'Turnover', points: 0, color: 'red' },
    'a': { name: 'Assist', points: 0, color: 'green' },
    's': { name: 'Steal', points: 0, color: 'yellow' },
  };

  const handleCourtClick = (coordinates, clickType = 'left') => {
    if (gameState !== 'active') return;
    if (!currentPlayer) {
      setMessage({ type: 'error', text: 'Please select a player first' });
      return;
    }
    
    // Handle shots with left/right click
    if (clickType === 'left' || clickType === 'right') {
      const action = clickType === 'left' ? actionTypes['left'] : actionTypes['right'];
      const newEvent = {
        id: Date.now(),
        player: currentPlayer,
        action: action.name,
        points: action.points,
        color: action.color,
        position: { x: coordinates.screenX, y: coordinates.screenY },
        x: coordinates.x,
        y: coordinates.y,
        timestamp: new Date().toISOString(),
      };
      setEvents([...events, newEvent]);
    } else {
      // For other actions, show input modal or use current action
      setLastClickPosition({ 
        x: coordinates.screenX, 
        y: coordinates.screenY,
        courtX: coordinates.x,
        courtY: coordinates.y 
      });
      
      if (currentAction) {
        // Use the typed action
        handleCustomAction();
      } else {
        setShowPlayerInput(true);
      }
    }
  };

  const handleAction = (actionType) => {
    if (!currentPlayer.trim()) return;
    
    const action = actionTypes[actionType];
    const newEvent = {
      id: Date.now(),
      player: currentPlayer,
      action: action.name,
      points: action.points,
      color: action.color,
      position: lastClickPosition,
      x: lastClickPosition.courtX,
      y: lastClickPosition.courtY,
      timestamp: new Date().toISOString(),
    };
    
    setEvents([...events, newEvent]);
    setCurrentPlayer('');
    setShowPlayerInput(false);
    setLastClickPosition(null);
  };

  const handleQuickAction = (actionType) => {
    if (!currentPlayer) {
      setMessage({ type: 'error', text: 'Please select a player first' });
      return;
    }

    const action = actionTypes[actionType];
    const newEvent = {
      id: Date.now(),
      player: currentPlayer,
      action: action.name,
      points: action.points,
      color: action.color,
      position: { x: 250, y: 200 }, // Default position
      x: 0, // Center court
      y: 100, // Mid-court
      timestamp: new Date().toISOString(),
    };
    
    setEvents([...events, newEvent]);
    setMessage({ type: 'success', text: `${action.name} recorded for ${currentPlayer}` });
  };

  const handleCustomAction = () => {
    if (!currentPlayer || !currentAction) return;

    const newEvent = {
      id: Date.now(),
      player: currentPlayer,
      action: currentAction,
      points: 0,
      color: 'blue',
      position: lastClickPosition,
      x: lastClickPosition.courtX,
      y: lastClickPosition.courtY,
      timestamp: new Date().toISOString(),
    };
    
    setEvents([...events, newEvent]);
    setCurrentAction('');
    setLastClickPosition(null);
  };

  const handleKeyPress = (e) => {
    if (!showPlayerInput) return;
    
    const actionType = e.key.toLowerCase();
    if (actionTypes[actionType]) {
      e.preventDefault();
      handleAction(actionType);
    }
  };



  const endGame = async () => {
    if (!gameId) {
      setMessage({ type: 'error', text: 'No game ID found. Please create a game first.' });
      return;
    }

    if (events.length === 0) {
      setMessage({ type: 'error', text: 'No events to upload.' });
      return;
    }

    setLoading(true);
    try {
      // Map action names to backend expected format
      const actionMapping = {
        'Made Shot': 'made_shot',
        'Missed Shot': 'missed_shot',
        'Offensive Rebound': 'off_reb',
        'Defensive Rebound': 'def_reb',
        'Steal': 'steal',
        'Assist': 'assist',
        'Block': 'block',
        'Turnover': 'turnover'
      };

      // Upload all events to the backend
      const eventsToUpload = events.map(event => {
        // Find player ID from player name
        const player = players.find(p => p.name === event.player);
        const playerId = player ? player.id : null;
        
        if (!playerId) {
          throw new Error(`Player ID not found for: ${event.player}`);
        }

        return {
          player_id: playerId,
          season_id: gameData.season_id || (seasons.length > 0 ? seasons[0].id : 12), // Use selected season or first available
          action: actionMapping[event.action] || 'made_shot',
          x: event.x || 0,
          y: event.y || 0
        };
      });

      const response = await fetch('/api/games/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          events: eventsToUpload
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Game ended successfully! ${events.length} events uploaded.` });
        setGameState('ended');
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to upload events: ${JSON.stringify(error)}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error uploading events: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getGameStats = () => {
    const stats = {};
    events.forEach(event => {
      if (!stats[event.player]) {
        stats[event.player] = { points: 0, assists: 0, rebounds: 0, steals: 0, blocks: 0, turnovers: 0 };
      }
      
      stats[event.player].points += event.points;
      if (event.action === 'Assist') stats[event.player].assists++;
      if (event.action.includes('Rebound')) stats[event.player].rebounds++;
      if (event.action === 'Steal') stats[event.player].steals++;
      if (event.action === 'Block') stats[event.player].blocks++;
      if (event.action === 'Turnover') stats[event.player].turnovers++;
    });
    return stats;
  };

  // API Functions
  const createPlayer = async () => {
    if (!playerData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a player name' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/players/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerData.name,
          external_id: playerData.name.toLowerCase().replace(/\s+/g, '_'),
        }),
      });

      if (response.ok) {
        const newPlayer = await response.json();
        setMessage({ type: 'success', text: `Player "${newPlayer.name}" created successfully!` });
        setPlayerData({ name: '' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to create player: ${JSON.stringify(error)}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error creating player: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const createSeason = async () => {
    if (!seasonData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a season name' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seasons/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: seasonData.name,
          external_id: seasonData.name.toLowerCase().replace(/\s+/g, '_'),
          start_date: seasonData.start_date,
          end_date: seasonData.end_date,
        }),
      });

      if (response.ok) {
        const newSeason = await response.json();
        setMessage({ type: 'success', text: `Season "${newSeason.name}" created successfully!` });
        setSeasonData({
          name: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to create season: ${JSON.stringify(error)}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error creating season: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons/');
      if (response.ok) {
        const data = await response.json();
        setSeasons(data);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players/');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const createGame = async () => {
    if (!gameData.opponent || !gameData.homeTeam || !gameData.awayTeam) {
      setMessage({ type: 'error', text: 'Please fill in all game details' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/games/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opponent: gameData.opponent,
          date: gameData.date,
          external_id: `${crypto.randomUUID()}`,
        }),
      });

      if (response.ok) {
        const newGame = await response.json();
        setGameId(newGame.id);
        setMessage({ type: 'success', text: `Game created successfully! Starting live tracking...` });
        // Automatically start live game tracking
        setGameState('active');
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to create game: ${JSON.stringify(error)}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error creating game: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPlayerInput) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showPlayerInput, currentPlayer]);

  useEffect(() => {
    fetchSeasons();
    fetchPlayers();
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderTabs = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'game'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>New Game</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('player')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'player'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>New Player</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('season')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'season'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>New Season</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderPlayerForm = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Player</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Player Name</label>
                          <input
                type="text"
                value={playerData.name}
                onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
                style={{ color: 'black' }}
                placeholder="Enter player name"
              />
          </div>
        </div>
        
        <button
          onClick={createPlayer}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Player...' : 'Create Player'}
        </button>
      </div>
    </div>
  );

  const renderSeasonForm = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Season</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Season Name</label>
                          <input
                type="text"
                value={seasonData.name}
                onChange={(e) => setSeasonData({...seasonData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
                style={{ color: 'black' }}
                placeholder="e.g., 2023-24 Season"
              />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={seasonData.start_date}
                style={{ color: 'black' }}
                onChange={(e) => setSeasonData({...seasonData, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={seasonData.end_date}
                style={{ color: 'black' }}
                onChange={(e) => setSeasonData({...seasonData, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={createSeason}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Season...' : 'Create Season'}
        </button>
      </div>
    </div>
  );

  const renderGameForm = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Game Setup</h2>
        
        <div className="space-y-4">
          <div >
            <label className="block text-sm font-medium text-slate-700 mb-2">Opponent</label>
            <input
              type="text"
              value={gameData.opponent}
              onChange={(e) => setGameData({...gameData, opponent: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
              style={{ color: 'black' }}
              placeholder="Enter opponent team name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={gameData.date}
              onChange={(e) => setGameData({...gameData, date: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
              style={{ color: 'black' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Season (Optional)</label>
            <select
              value={gameData.season_id}
              onChange={(e) => setGameData({...gameData, season_id: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
              style={{ color: 'black' }}
            >
              <option value="">Select a season (optional)</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id} style={{ color: 'black' }}>
                  {season.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Home Team</label>
              <input
                type="text"
                value={gameData.homeTeam}
                onChange={(e) => setGameData({...gameData, homeTeam: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
                style={{ color: 'black' }}
                placeholder="Your team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Away Team</label>
              <input
                type="text"
                value={gameData.awayTeam}
                onChange={(e) => setGameData({...gameData, awayTeam: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
                style={{ color: 'black' }}
                placeholder="Opponent team"
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={createGame}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Game...' : 'Create & Start Game'}
        </button>
      </div>
    </div>
  );

  const renderCourt = () => (
    <div className="space-y-6">
      {/* Game Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{gameData.homeTeam} vs {gameData.awayTeam}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={endGame}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Basketball Court and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basketball Court - Left Side */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Basketball Court</h3>
            <div className="text-sm text-slate-600">
              Left click: Made shot | Right click: Missed shot
            </div>
          </div>
          
          <div className="relative">
            <BasketballCourt
              onCourtClick={handleCourtClick}
              events={events}
              width={500}
              height={375}
              interactive={true}
            />
          </div>
        </div>

        {/* Controls - Right Side */}
        <div className="space-y-4">
          {/* Player Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-md font-semibold text-slate-900 mb-3">Player</h4>
            <select
              value={currentPlayer}
              onChange={(e) => setCurrentPlayer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
              style={{ color: 'black' }}
            >
              <option value="">Select a player</option>
              {players.map((player) => (
                <option key={player.id} value={player.name} style={{ color: 'black' }}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Input */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-md font-semibold text-slate-900 mb-3">Action</h4>
            <input
              type="text"
              value={currentAction}
              onChange={(e) => setCurrentAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
              style={{ color: 'black' }}
              placeholder="e.g., assist, block, steal, rebound..."
            />
            <div className="mt-3 text-xs text-slate-500">
              <p><strong>Keyboard shortcuts:</strong></p>
              <p>A - Assist | B - Block | S - Steal</p>
              <p>OF - Offensive Rebound | DF - Defensive Rebound</p>
              <p>T - Turnover</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-md font-semibold text-slate-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickAction('a')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Assist
              </button>
              <button
                onClick={() => handleQuickAction('b')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Block
              </button>
              <button
                onClick={() => handleQuickAction('s')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Steal
              </button>
              <button
                onClick={() => handleQuickAction('t')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Turnover
              </button>
              <button
                onClick={() => handleQuickAction('of')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Off. Rebound
              </button>
              <button
                onClick={() => handleQuickAction('df')}
                disabled={!currentPlayer}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Def. Rebound
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Player Input Modal */}
      {showPlayerInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Record Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Player</label>
                <input
                  type="text"
                  value={currentPlayer}
                  onChange={(e) => setCurrentPlayer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500 text-black"
                  style={{ color: 'black' }}
                  placeholder="Enter player name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('left')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                  >
                    Made Shot (Left)
                  </button>
                  <button
                    onClick={() => handleAction('right')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    Missed Shot (Right)
                  </button>
                  <button
                    onClick={() => handleAction('b')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    Block (B)
                  </button>
                  <button
                    onClick={() => handleAction('a')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                  >
                    Assist (A)
                  </button>
                  <button
                    onClick={() => handleAction('of')}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                  >
                    Off. Rebound (OF)
                  </button>
                  <button
                    onClick={() => handleAction('df')}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                  >
                    Def. Rebound (DF)
                  </button>
                  <button
                    onClick={() => handleAction('s')}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                  >
                    Steal (S)
                  </button>
                  <button
                    onClick={() => handleAction('t')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    Turnover (T)
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPlayerInput(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Game Events</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50">
              <div className={`w-3 h-3 rounded-full ${
                event.color === 'green' ? 'bg-green-500' :
                event.color === 'red' ? 'bg-red-500' :
                event.color === 'blue' ? 'bg-blue-500' :
                event.color === 'orange' ? 'bg-orange-500' :
                event.color === 'purple' ? 'bg-purple-500' :
                event.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              <span className="font-medium text-slate-900">{event.player}</span>
              <span className="text-slate-600">{event.action}</span>
              {event.points > 0 && (
                <span className="text-green-600 font-medium">+{event.points} pts</span>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-slate-600 text-center py-4">No events recorded yet. Click on the court to add events.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderGameSummary = () => {
    const stats = getGameStats();
    const totalPoints = Object.values(stats).reduce((sum, player) => sum + player.points, 0);
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Game Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Game Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Teams:</span> {gameData.homeTeam} vs {gameData.awayTeam}</p>
                <p><span className="font-medium">Date:</span> {gameData.date}</p>
                <p><span className="font-medium">Total Events:</span> {events.length}</p>
                <p><span className="font-medium">Total Points:</span> {totalPoints}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Player Statistics</h3>
              <div className="space-y-2">
                {Object.entries(stats).map(([player, playerStats]) => (
                  <div key={player} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-medium">{player}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-orange-600">{playerStats.points} pts</span>
                      <span className="text-blue-600">{playerStats.assists} ast</span>
                      <span className="text-green-600">{playerStats.rebounds} reb</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setGameState('setup')}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'game') {
      if (gameState === 'setup') return renderGameForm();
      if (gameState === 'active') return renderCourt();
      if (gameState === 'ended') return renderGameSummary();
    } else if (activeTab === 'player') {
      return renderPlayerForm();
    } else if (activeTab === 'season') {
      return renderSeasonForm();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">New Game</h1>
            <p className="text-slate-600">Track live basketball statistics with court interaction</p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {renderContent()}
    </div>
  );
} 