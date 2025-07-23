from dotenv import load_dotenv
import os
from supabase import create_client, Client

import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')
from db import process_game, increment, supabase
from event import Event, Action

load_dotenv()

# url: str = os.environ.get("SUPABASE_URL")
# key: str = os.environ.get("SUPABASE_KEY")
# supabase: Client = create_client(url, key)

def test_process_game():
    events = [Event(1111, 5678, Action.BLOCK, 0, 0), Event(2222, 5678, Action.STEAL, 0,0)]
    process_game(events, 5678)
    player_1_block = (
        supabase.table("player_games")
        .select("block")
        .eq("player_id", 1111)
        .eq("game_id", 5678)
        .execute()
    )

    player_1_steal = (
        supabase.table("player_games")
        .select("steal")
        .eq("player_id", 1111)
        .eq("game_id", 5678)
        .execute()
    )
    assert(player_1_block == 1)
    assert(player_1_steal == 0)
