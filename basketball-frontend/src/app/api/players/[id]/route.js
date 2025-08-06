export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get player details
    const playerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/games/players/${id}/`);
    const playerData = await playerResponse.json();
    
    if (!playerResponse.ok) {
      return Response.json(playerData, { status: playerResponse.status });
    }
    
    // Get player career stats
    const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/games/players/${id}/stats/`);
    const statsData = await statsResponse.json();
    
    if (!statsResponse.ok) {
      return Response.json(statsData, { status: statsResponse.status });
    }
    
    // Get player game stats
    const gameStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/games/players/${id}/games/`);
    const gameStatsData = await gameStatsResponse.json();
    
    if (!gameStatsResponse.ok) {
      return Response.json(gameStatsData, { status: gameStatsResponse.status });
    }
    
    // Combine all data
    const combinedData = {
      player: playerData,
      careerStats: statsData,
      gameStats: gameStatsData
    };
    
    return Response.json(combinedData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 