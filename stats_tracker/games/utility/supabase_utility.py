from supabase import create_client
import os

def upload_heatmap_to_supabase(game_id, player_id, image):
    # Initialize Supabase client only if environment variables are available
    supabase_url = os.getenv("SUPABASE_URL")
    #supabase_key = os.getenv("SUPABASE_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_service_key:
        print(f" Supabase environment variables not set")
        print(f"   - SUPABASE_URL: {'Set' if supabase_url else 'Not set'}")
        print(f"   - SUPABASE_KEY: {'Set' if supabase_service_key else 'Not set'}")
        # Return a placeholder URL for testing
        return f"https://placeholder.com/heatmap-{player_id}-{game_id}"
    
    try:
        supabase = create_client(supabase_url, supabase_service_key)
        print(f"Supabase client initialized successfully")
        
        image_name = f"heatmap-{player_id}-{game_id}"
        
        # Convert BytesIO to bytes for upload
        image_bytes = image.getvalue()
        
        try:
            # Try to upload to the heatmap bucket
            supabase.storage.from_("heatmap").upload(image_name, image_bytes, {"content-type": "image/png"})
            return supabase.storage.from_("heatmap").get_public_url(image_name)
        except Exception as upload_error:
            print(f"   - Upload to 'heatmap' bucket failed: {upload_error}")
            
            # Try to upload to a different bucket or create a public URL
            try:
                # Try to upload to a public bucket
                supabase.storage.from_("public").upload(image_name, image_bytes, {"content-type": "image/png"})
                return supabase.storage.from_("public").get_public_url(image_name)
            except Exception as public_error:
                print(f"   - Upload to 'public' bucket also failed: {public_error}")
                # Return a placeholder URL
                return f"https://placeholder.com/heatmap-{player_id}-{game_id}"
        
    except Exception as e:
        print(f"❌ Supabase client creation failed: {e}")
        # Return a placeholder URL for testing
        return f"https://placeholder.com/heatmap-{player_id}-{game_id}"