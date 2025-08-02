export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const season_id = searchParams.get('season_id');
    
    const url = new URL('/games/games/', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
    if (season_id) {
      url.searchParams.set('season_id', season_id);
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/games/games/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }
    
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 