export async function POST(request) {
  try {
    const body = await request.json();
    const { game_id, events } = body;
    
    if (!game_id || !events || !Array.isArray(events)) {
      return Response.json({ error: 'game_id and events array are required' }, { status: 400 });
    }

    // Upload events to the backend using the existing endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/games/events/${game_id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: events
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }
    
    return Response.json({ 
      message: `Successfully uploaded ${events.length} events`,
      data: data
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}