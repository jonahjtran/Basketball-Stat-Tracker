import os
from dotenv import load_dotenv
from supabase import create_client, Client
from event import Event, Action
from game import ShotZone, Game
from analytics import define_shot_zone, calculate_fg_percentage
from heatmap import Heatmap



load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def increment(game: Game):
   blocks = (
       supabase.from_("player_game")
       .update({"block": game.block})
       .eq("player_id", game.player_id)
       .eq("game_id", game.game)

   )


def process_game(events, game_id, season_id):
    player_games = {}                                # dictionary of games created for each player (key: player_id, value: Game())
    for event in events:

        if event.player_id in player_games:           # already player_game for specific player already created
            player_games[event.player_id].addEvent(event)
        else:
            player_games[event.player_id] = Game(event.player_id, game_id)
            player_games[event.player_id].addEvent(event)

    for key, value in player_games:
        # generate heatmaps
        heatmap = Heatmap(key, value.events)
        image = heatmap.save_as_image()
        supabase.from_("player_game").update({"heatmap": image}).eq("player_id", key).eq("game_id", value.game_id).execute()

        # update other statistics
        if (value.block > 0):
            og_blocks = (
                supabase.table("player_game")
                .select("block")
                .eq("player_id", value.player_id)
                .eq("game_id", value.game_id)
                .execute()
            )

            new_bl = og_blocks + value.block
            new_blocks = (
                supabase.from_("player_game")
                .update({"block": new_bl})
                .eq("player_id", key)
                .eq("game_id", value.game_id)
                .execute()
            )
        
        if (value.block)

        og_assists = 

    # update season stats
    og_season_avr = (
        supabase.table("player_season")
        .select("field_goal_avr")
        .eq("player_id", event.player_id)
        .eq("season_id", season_id)
        .execute()
    )
    og_season_att = (
        supabase.table("player_season")
        .select("field_goal_att")
        .eq("player_id", event.player_id)
        .eq("season_id", season_id)
        .execute()
    )







