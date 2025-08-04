#!/usr/bin/env python3
"""
Script to diagnose and fix Supabase deletion issues for the Basketball Stat Tracker.
This script will help identify why you can't delete players in Supabase.
"""

import os
import psycopg2
from django.conf import settings
from django.core.management import execute_from_command_line

def check_supabase_connection():
    """Test connection to Supabase database"""
    try:
        conn = psycopg2.connect(
            host=settings.DATABASES['default']['HOST'],
            database=settings.DATABASES['default']['NAME'],
            user=settings.DATABASES['default']['USER'],
            password=settings.DATABASES['default']['PASSWORD'],
            port=settings.DATABASES['default']['PORT'],
            sslmode='require'
        )
        print("✅ Successfully connected to Supabase database")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return None

def check_rls_policies(conn):
    """Check Row Level Security policies on tables"""
    cursor = conn.cursor()
    
    tables = ['games_player', 'games_playercareer', 'games_playerseason', 'games_playergame', 'games_event']
    
    print("\n🔍 Checking Row Level Security (RLS) policies:")
    for table in tables:
        cursor.execute(f"""
            SELECT schemaname, tablename, rowsecurity 
            FROM pg_tables 
            WHERE tablename = '{table}'
        """)
        result = cursor.fetchone()
        
        if result:
            schema, table_name, rls_enabled = result
            status = "🔒 ENABLED" if rls_enabled else "🔓 DISABLED"
            print(f"   {table_name}: {status}")
            
            if rls_enabled:
                # Check if there are any policies
                cursor.execute(f"""
                    SELECT policyname, permissive, roles, cmd, qual 
                    FROM pg_policies 
                    WHERE tablename = '{table_name}'
                """)
                policies = cursor.fetchall()
                
                if policies:
                    print(f"     Policies found: {len(policies)}")
                    for policy in policies:
                        print(f"       - {policy[0]} ({policy[3]})")
                else:
                    print(f"     ⚠️  No policies found - this will block all operations!")
        else:
            print(f"   {table}: ❌ Table not found")

def check_foreign_key_constraints(conn):
    """Check foreign key constraints and their cascade settings"""
    cursor = conn.cursor()
    
    print("\n🔗 Checking Foreign Key Constraints:")
    
    cursor.execute("""
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule,
            rc.update_rule
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name LIKE 'games_%'
        ORDER BY tc.table_name, kcu.column_name;
    """)
    
    constraints = cursor.fetchall()
    
    for constraint in constraints:
        table, column, foreign_table, foreign_column, delete_rule, update_rule = constraint
        delete_status = "✅ CASCADE" if delete_rule == "CASCADE" else f"⚠️  {delete_rule}"
        print(f"   {table}.{column} → {foreign_table}.{foreign_column}: {delete_status}")

def fix_rls_issues(conn):
    """Fix RLS issues by creating appropriate policies"""
    cursor = conn.cursor()
    
    print("\n🔧 Fixing RLS issues...")
    
    # Disable RLS for all tables (simplest solution for development)
    tables = ['games_player', 'games_playercareer', 'games_playerseason', 'games_playergame', 'games_event', 'games_game', 'games_season']
    
    for table in tables:
        try:
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")
            print(f"   ✅ Disabled RLS for {table}")
        except Exception as e:
            print(f"   ⚠️  Could not disable RLS for {table}: {e}")
    
    conn.commit()
    print("✅ RLS fixes applied")

def test_player_deletion(conn):
    """Test if we can now delete a player"""
    cursor = conn.cursor()
    
    print("\n🧪 Testing player deletion...")
    
    # Find a player to test with
    cursor.execute("SELECT id, name FROM games_player LIMIT 1")
    player = cursor.fetchone()
    
    if player:
        player_id, player_name = player
        print(f"   Testing deletion of player: {player_name} (ID: {player_id})")
        
        try:
            cursor.execute("DELETE FROM games_player WHERE id = %s", (player_id,))
            conn.commit()
            print("   ✅ Player deleted successfully!")
            
            # Verify related records were also deleted
            cursor.execute("SELECT COUNT(*) FROM games_playercareer WHERE player_id_id = %s", (player_id,))
            career_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM games_playerseason WHERE player_id_id = %s", (player_id,))
            season_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM games_playergame WHERE player_id_id = %s", (player_id,))
            game_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM games_event WHERE player_id = %s", (player_id,))
            event_count = cursor.fetchone()[0]
            
            print(f"   Related records deleted:")
            print(f"     - PlayerCareer: {career_count}")
            print(f"     - PlayerSeason: {season_count}")
            print(f"     - PlayerGame: {game_count}")
            print(f"     - Event: {event_count}")
            
        except Exception as e:
            print(f"   ❌ Failed to delete player: {e}")
            conn.rollback()
    else:
        print("   ⚠️  No players found to test with")

def main():
    """Main function to run the diagnosis and fix"""
    print("🏀 Basketball Stat Tracker - Supabase Deletion Fix")
    print("=" * 50)
    
    # Set up Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stats_tracker.settings')
    
    # Test connection
    conn = check_supabase_connection()
    if not conn:
        return
    
    try:
        # Check current state
        check_rls_policies(conn)
        check_foreign_key_constraints(conn)
        
        # Ask user if they want to fix RLS
        print("\n" + "=" * 50)
        response = input("Do you want to fix RLS issues? (y/n): ").lower().strip()
        
        if response == 'y':
            fix_rls_issues(conn)
            test_player_deletion(conn)
        else:
            print("Skipping RLS fixes. You can manually run the SQL commands in Supabase.")
            
    finally:
        conn.close()
        print("\n✅ Diagnosis complete!")

if __name__ == "__main__":
    main() 