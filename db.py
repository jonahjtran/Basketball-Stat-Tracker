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
   if game.block > 0:
    og_blocks = (
        supabase.table("player_game")
        .select("block")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    new_block = og_blocks + game.block
    update_blocks = (
        supabase.from_("player_id")
        .update({"block":new_block})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    if game.assist > 0:
        og_assist = (
        supabase.table("player_game")
        .select("block")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    new_assist = og_assist + game.assist
    update_assist = (
        supabase.from_("player_id")
        .update({"assist":new_assist})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    if game.steal > 0:
        og_steal = (
        supabase.table("player_game")
        .select("steal")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    new_steal = og_steal + game.steal
    update_steal = (
        supabase.from_("player_id")
        .update({"steal": new_steal})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    if game.off_reb > 0:
        og_off_reb = (
        supabase.table("player_game")
        .select("offensive_rebound")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    new_off_reb= og_off_reb + game.off_reb
    update_off_reb = (
        supabase.from_("player_id")
        .update({"offensive_rebound": new_off_reb})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    if game.def_reb > 0:
        og_def_reb = (
        supabase.table("player_game")
        .select("defensive_rebound")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    new_def_reb = og_def_reb + game.def_reb
    update_assist = (
        supabase.from_("player_id")
        .update({"defensive_rebound":new_def_reb})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    if game.turnover> 0:
        og_turnover = (
        supabase.table("player_game")
        .select("turnover")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
        
    new_turnover = og_turnover+ game.turnover
    update_turnover = (
        supabase.from_("player_id")
        .update({"turnover":new_turnover})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    # update field goal attempts/averages
    og_average = (
        supabase.table("player_game")
        .select("field_goal_avr")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    og_attempts = (
        supabase.table("player_game")
        .select("field_goal_att")
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    old_makes = og_average * og_attempts
    new_makes = old_makes + game.shot_makes

    new_attempts = og_attempts + game.shot_att

    new_average = float(new_makes/new_attempts)
    update_attempts = (
        supabase.from_("player_game")
        .update({"field_goal_att": new_attempts})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )
    update_average = (
        supabase.from_("player_game")
        .update({"field_goal_avr": new_average})
        .eq("player_id", game.player_id)
        .eq("game_id", game.game_id)
        .execute()
    )

    # update shot zones
    for index, row in game.df_zone_stats.iterrows():
        supabase_zone = str(index).lower()
        supabase_zone_att = supabase_zone + "_att"
        supabase_zone_avr = supabase_zone + "_avr"

        og_zone_att = (
            supabase.table("player_game")
            .select(supabase_zone_att)
            .eq("player_id", game.player_id)
            .eq("game_id", game.game_id)
            .execute()
        )
        new_zone_att = og_zone_att + game.df_zone_stats.loc[row, "attempts"]

        og_zone_avr = (
            supabase.table("player_game")
            .select(supabase_zone_att)
            .eq("player_id", game.player_id)
            .eq("game_id", game.game_id)
            .execute()
        )
        new_zone_avr = (og_zone_avr * og_zone_att + game.df_zone_stats.loc[row, "makes"])/(new_zone_att)

        update_zone_att = (
            supabase.from_("player_game")
            .update(supabase_zone_att)
            .eq("player_id", game.player_id)
            .eq("game_id", game.game_id)
            .execute()
        )

        update_zone_avr = (
            supabase.from_("player_game")
            .update(supabase_zone_avr)
            .eq("player_id", game.player_id)
            .eq("game_id", game.game_id)
            .execute()
        )


def process_game(events, game_id):
    player_games: dict[int, Game] = {}                                # dictionary of games created for each player (key: player_id, value: Game())
    for event in events:

        if event.player_id in player_games:           # already player_game for specific player already created
            player_games[event.player_id].add_event(event)
        else:
            player_games[event.player_id] = Game(event.player_id, game_id)
            player_games[event.player_id].add_event(event)

    for key, value in player_games.items():
        # generate heatmaps
        heatmap = Heatmap(key, value.events)
        image = heatmap.save_as_image()
        
        #supabase.from_("player_game").update({"heatmap": image}).eq("player_id", key).eq("game_id", value.game_id).execute()
        image_name = f"heatmap-{key}-{value.game_id}"
        supabase.storage.from_("heatmap").upload(image_name, image)

        # 2. Grab the public URL
      
        url = supabase.storage.from_("heatmaps").get_public_url(image_name)

        # 3. Save the URL in your table
        supabase.from_("player_game") \
            .update({"heatmap_url": url}) \
            .eq("player_id", key) \
            .eq("game_id", value.game_id) \
            .execute()

        # update statistics
        increment(value)

def process_season(game: Game):
    # get season game is part of
    season_id = (
        supabase.table("game")
        .select("season_id")
        .eq("game_id", game.game_id)
        .eq("player_id", game.player_id)
        .execute()
    )

    # number of games played in season (includes the game being processed now)
    num_games = (
        supabase.table("game")
        .select("*", count="exact")
        .eq("season_id", season_id.data[0]["season_id"])
        .execute()
    ).count

    # update block average
    block_avr = (
        supabase.table("player_season")
        .select("block")
        .eq("player_id", game.player_id)
    )
    old_blocks = (num_games - 1) * block_avr
    new_blocks = float((old_blocks + game.block)/num_games)

    update_blocks = (
        supabase.table("player_season")
        .upsert({"player_id": game.player_id, "block" : new_blocks})
    )

    # update assist
    


