import os
from dotenv import load_dotenv
from supabase import create_client, Client
from event import Event, Action
from game import ShotZone
from analytics import define_shot_zone, calculate_fg_percentage


load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def increment(event):
    if event.action != Action.MADE_SHOT and event.action != Action.MISSED_SHOT:         # don't have to define shotzone
        action = event.action.name
        action = action.lower()
        try:
            action_count = (
                supabase.table("player_game")
                .select(action)
                .eq("player_id", event.player_id)
                .execute()
        )
            new_action_count = action_count + 1

            update_action = (
                supabase.table("player_game")
                .update({f"action": {new_action_count}})
                .eq("player_id", event.player_id)
            )
        except Exception as e:
            print(f"row doesn't exist or trouble connecting to database: {e}")
    else:                                                                           # action is a shot
        zone = define_shot_zone(event)
        zone = (zone.name).lower()
        zone_att = zone + "_att"
        zone_avr = zone + "_avr"
        
        try:
            # update zone attempts
            attempts_count = (
                supabase.table("player_game")
                .select(zone_att)
                .eq("player_id", event.player_id)
                .execute()
            )
            new_attempts_count = attempts_count + 1

            update_average = (
                supabase.table("player_game")
                .update({zone_avr: new_average})
                .eq("player_id", event.player_id)
                .execute*()
            )

            # update zone average
            og_average = (
                supabase.table("player_game")
                .select(zone_avr)
                .eq("player_id", event.player_id)
                .execute()
            )
            if event.action == Action.MADE_SHOT:
                new_average = calculate_fg_percentage(og_average, attempts_count, True)
            else:
                new_average = calculate_fg_percentage(og_average, attempts_count, False)

            update_attempts = (
                supabase.table("player_game")
                .update({zone_att: new_attempts_count})
                .eq("player_id", event.player_id)
                .execute()
            )

            # update overall attempts

        except Exception as e:
            print(f"row doesn't exist or trouble connecting to database: {e}")

def process_game(events):
    player_ids = []                                 # list of player_ids where row in player_game already created
    for event in events:
        if event.player_id in player_ids:           # already player_game for specific player already created
            player_ids.append(event.player_id)      # add data from event

        else:
            try:
                resp = (
                    supabase
                    .from_("player_games")
                    .select("player_id", count="exact")
                    .eq("player_id", event.player_id)
                    .limit(1)
                    .execute()
                )
            except Exception as e:
                print(f"error with supabase:{e}")

            if resp.data:
