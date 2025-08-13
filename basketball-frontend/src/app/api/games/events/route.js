export async function POST(request) {
  try {
    const body = await request.json();
    const { game_id, events } = body;
    
    if (!game_id || !events || !Array.isArray(events)) {
      return Response.json({ error: 'Missing game_id or events array' }, { status: 400 });
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullUrl = `${apiUrl}/games/events/${game_id}/`;
    
    console.log('Making request to:', fullUrl);
    console.log('Request body:', JSON.stringify({ events }, null, 2));
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      return Response.json({ 
        error: 'Server returned non-JSON response', 
        details: text.substring(0, 500),
        status: response.status 
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }
    
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in events API route:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}