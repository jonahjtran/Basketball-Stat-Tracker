// API base URL - update this to match your Django backend URL
const API_BASE_URL = 'http://localhost:8000/games';

// Generic API fetch function
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Player API functions
export const playerAPI = {
  // Get all players
  getAll: () => fetchAPI('/players/'),
  
  // Get a specific player
  getById: (id) => fetchAPI(`/players/${id}/`),
  
  // Create a new player
  create: (playerData) => fetchAPI('/players/create/', {
    method: 'POST',
    body: JSON.stringify(playerData),
  }),
  
  // Update a player
  update: (id, playerData) => fetchAPI(`/players/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(playerData),
  }),
  
  // Delete a player
  delete: (id) => fetchAPI(`/players/${id}/delete/`, {
    method: 'DELETE',
  }),
  
  // Get player stats
  getStats: (id) => fetchAPI(`/player-stats/${id}/`),
  
  // Get player game stats
  getGameStats: (gameId, playerId) => fetchAPI(`/player-game/${gameId}/${playerId}/`),
  
  // Get player season stats
  getSeasonStats: (seasonId, playerId) => fetchAPI(`/player-season/${seasonId}/${playerId}/`),
};

// Game API functions
export const gameAPI = {
  // Get all games
  getAll: () => fetchAPI('/games/'),
  
  // Get a specific game
  getById: (id) => fetchAPI(`/games/${id}/`),
  
  // Create a new game
  create: (gameData) => fetchAPI('/games/create/', {
    method: 'POST',
    body: JSON.stringify(gameData),
  }),
  
  // Update a game
  update: (id, gameData) => fetchAPI(`/games/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(gameData),
  }),
  
  // Delete a game
  delete: (id) => fetchAPI(`/games/${id}/delete/`, {
    method: 'DELETE',
  }),
  
  // Get all players in a game
  getPlayers: (id) => fetchAPI(`/games/${id}/players/`),
  
  // Post events for a game
  postEvents: (id, events) => fetchAPI(`/events/${id}/`, {
    method: 'POST',
    body: JSON.stringify({ events }),
  }),
};

// Season API functions
export const seasonAPI = {
  // Get all seasons
  getAll: () => fetchAPI('/seasons/'),
  
  // Get a specific season
  getById: (id) => fetchAPI(`/seasons/${id}/`),
  
  // Create a new season
  create: (seasonData) => fetchAPI('/seasons/create/', {
    method: 'POST',
    body: JSON.stringify(seasonData),
  }),
  
  // Update a season
  update: (id, seasonData) => fetchAPI(`/seasons/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(seasonData),
  }),
  
  // Delete a season
  delete: (id) => fetchAPI(`/seasons/${id}/delete/`, {
    method: 'DELETE',
  }),
  
  // Get all players in a season
  getPlayers: (id) => fetchAPI(`/seasons/${id}/players/`),
};

// Heatmap API functions
export const heatmapAPI = {
  // Get heatmap URL for a player in a game
  getHeatmap: (gameId, playerId) => fetchAPI(`/heatmap/${gameId}/${playerId}/`),
}; 