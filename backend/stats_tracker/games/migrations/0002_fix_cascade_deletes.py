# Generated manually to fix cascade delete issues

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        # Drop existing foreign key constraints and recreate them with CASCADE
        migrations.RunSQL(
            # Forward SQL - drop and recreate constraints with CASCADE
            """
            -- Drop existing foreign key constraints
            ALTER TABLE games_playercareer DROP CONSTRAINT IF EXISTS games_playercareer_player_id_id_fkey;
            ALTER TABLE games_playerseason DROP CONSTRAINT IF EXISTS games_playerseason_player_id_id_fkey;
            ALTER TABLE games_playerseason DROP CONSTRAINT IF EXISTS games_playerseason_season_id_id_fkey;
            ALTER TABLE games_playergame DROP CONSTRAINT IF EXISTS games_playergame_player_id_id_fkey;
            ALTER TABLE games_playergame DROP CONSTRAINT IF EXISTS games_playergame_game_id_id_fkey;
            ALTER TABLE games_event DROP CONSTRAINT IF EXISTS games_event_game_id_fkey;
            ALTER TABLE games_event DROP CONSTRAINT IF EXISTS games_event_season_id_fkey;
            
            -- Recreate constraints with CASCADE delete
            ALTER TABLE games_playercareer 
                ADD CONSTRAINT games_playercareer_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id) ON DELETE CASCADE;
                
            ALTER TABLE games_playerseason 
                ADD CONSTRAINT games_playerseason_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id) ON DELETE CASCADE;
                
            ALTER TABLE games_playerseason 
                ADD CONSTRAINT games_playerseason_season_id_id_fkey 
                FOREIGN KEY (season_id_id) REFERENCES games_season(id) ON DELETE CASCADE;
                
            ALTER TABLE games_playergame 
                ADD CONSTRAINT games_playergame_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id) ON DELETE CASCADE;
                
            ALTER TABLE games_playergame 
                ADD CONSTRAINT games_playergame_game_id_id_fkey 
                FOREIGN KEY (game_id_id) REFERENCES games_game(id) ON DELETE CASCADE;
                
            ALTER TABLE games_event 
                ADD CONSTRAINT games_event_game_id_fkey 
                FOREIGN KEY (game_id) REFERENCES games_game(id) ON DELETE CASCADE;
                
            ALTER TABLE games_event 
                ADD CONSTRAINT games_event_season_id_fkey 
                FOREIGN KEY (season_id) REFERENCES games_season(id) ON DELETE CASCADE;
            """,
            # Reverse SQL - drop and recreate constraints with NO ACTION (original state)
            """
            -- Drop CASCADE constraints
            ALTER TABLE games_playercareer DROP CONSTRAINT IF EXISTS games_playercareer_player_id_id_fkey;
            ALTER TABLE games_playerseason DROP CONSTRAINT IF EXISTS games_playerseason_player_id_id_fkey;
            ALTER TABLE games_playerseason DROP CONSTRAINT IF EXISTS games_playerseason_season_id_id_fkey;
            ALTER TABLE games_playergame DROP CONSTRAINT IF EXISTS games_playergame_player_id_id_fkey;
            ALTER TABLE games_playergame DROP CONSTRAINT IF EXISTS games_playergame_game_id_id_fkey;
            ALTER TABLE games_event DROP CONSTRAINT IF EXISTS games_event_game_id_fkey;
            ALTER TABLE games_event DROP CONSTRAINT IF EXISTS games_event_season_id_fkey;
            
            -- Recreate constraints with NO ACTION delete (original state)
            ALTER TABLE games_playercareer 
                ADD CONSTRAINT games_playercareer_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id);
                
            ALTER TABLE games_playerseason 
                ADD CONSTRAINT games_playerseason_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id);
                
            ALTER TABLE games_playerseason 
                ADD CONSTRAINT games_playerseason_season_id_id_fkey 
                FOREIGN KEY (season_id_id) REFERENCES games_season(id);
                
            ALTER TABLE games_playergame 
                ADD CONSTRAINT games_playergame_player_id_id_fkey 
                FOREIGN KEY (player_id_id) REFERENCES games_player(id);
                
            ALTER TABLE games_playergame 
                ADD CONSTRAINT games_playergame_game_id_id_fkey 
                FOREIGN KEY (game_id_id) REFERENCES games_game(id);
                
            ALTER TABLE games_event 
                ADD CONSTRAINT games_event_game_id_fkey 
                FOREIGN KEY (game_id) REFERENCES games_game(id);
                
            ALTER TABLE games_event 
                ADD CONSTRAINT games_event_season_id_fkey 
                FOREIGN KEY (season_id) REFERENCES games_season(id);
            """
        ),
    ] 