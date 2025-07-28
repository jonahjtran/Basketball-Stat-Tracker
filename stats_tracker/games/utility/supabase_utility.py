from supabase import create_client
import os

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def upload_heatmap_to_supabase(game_id, player_id, image):
    image_name = f"heatmap-{player_id}-{game_id}"
    supabase.storage.from_("heatmap").upload(image_name, image)

    # 2. Grab the public URL
      
    return supabase.storage.from_("heatmaps").get_public_url(image_name)