import pytest
from unittest.mock import Mock, patch, MagicMock
from dotenv import load_dotenv
import os
import pandas as pd
import sys

sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')
from db import process_game, increment
from event import Event, Action
from stats_tracker.games.game import Game, ShotZone

load_dotenv()

class TestIncrement:
    @patch('db.supabase')
    def test_increment_blocks(self, mock_supabase):
        """Test incrementing block statistics."""
        # Setup mock responses
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"block": 2}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        # Create game with blocks
        game = Game(1111, 5678)
        game.block = 3
        
        increment(game)
        
        # Verify supabase was called to get and update blocks
        mock_supabase.table.assert_called()
        mock_supabase.from_.assert_called()

    @patch('db.supabase')
    def test_increment_assists(self, mock_supabase):
        """Test incrementing assist statistics."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"assist": 1}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        game = Game(1111, 5678)
        game.assist = 2
        
        increment(game)
        
        mock_supabase.table.assert_called()

    @patch('db.supabase')
    def test_increment_steals(self, mock_supabase):
        """Test incrementing steal statistics."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"steal": 0}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        game = Game(1111, 5678)
        game.steal = 1
        
        increment(game)
        
        mock_supabase.table.assert_called()

    @patch('db.supabase')
    def test_increment_rebounds(self, mock_supabase):
        """Test incrementing rebound statistics."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"offensive_rebound": 1, "defensive_rebound": 2}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        game = Game(1111, 5678)
        game.off_reb = 2
        game.def_reb = 1
        
        increment(game)
        
        mock_supabase.table.assert_called()

    @patch('db.supabase')
    def test_increment_turnovers(self, mock_supabase):
        """Test incrementing turnover statistics."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"turnover": 3}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        game = Game(1111, 5678)
        game.turnover = 1
        
        increment(game)
        
        mock_supabase.table.assert_called()

    @patch('db.supabase')
    def test_increment_field_goals(self, mock_supabase):
        """Test incrementing field goal statistics."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{"field_goal_avr": 0.5, "field_goal_att": 10}])
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        game = Game(1111, 5678)
        game.shot_att = 5
        game.shot_makes = 3
        
        increment(game)
        
        mock_supabase.table.assert_called()

class TestProcessGame:
    @patch('db.supabase')
    @patch('db.Heatmap')
    def test_process_game_single_player(self, mock_heatmap_class, mock_supabase):
        """Test processing game with events from single player."""
        # Setup mocks
        mock_heatmap = Mock()
        mock_heatmap.save_as_image.return_value = b'fake_image_data'
        mock_heatmap_class.return_value = mock_heatmap
        
        mock_supabase.storage.from_.return_value.upload.return_value = Mock()
        mock_supabase.storage.from_.return_value.get_public_url.return_value = "http://example.com/image.png"
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{}])
        
        # Create events for single player
        events = [
            Event(1111, 5678, Action.MADE_SHOT, 100, 200),
            Event(1111, 5678, Action.MISSED_SHOT, 150, 250),
            Event(1111, 5678, Action.STEAL, 0, 0)
        ]
        
        process_game(events, 5678)
        
        # Verify heatmap was created
        mock_heatmap_class.assert_called_with(1111, events)
        mock_heatmap.save_as_image.assert_called_once()
        
        # Verify storage operations
        mock_supabase.storage.from_.assert_called()

    @patch('db.supabase')
    @patch('db.Heatmap')
    def test_process_game_multiple_players(self, mock_heatmap_class, mock_supabase):
        """Test processing game with events from multiple players."""
        # Setup mocks
        mock_heatmap = Mock()
        mock_heatmap.save_as_image.return_value = b'fake_image_data'
        mock_heatmap_class.return_value = mock_heatmap
        
        mock_supabase.storage.from_.return_value.upload.return_value = Mock()
        mock_supabase.storage.from_.return_value.get_public_url.return_value = "http://example.com/image.png"
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(data=[{}])
        
        # Create events for multiple players
        events = [
            Event(1111, 5678, Action.MADE_SHOT, 100, 200),
            Event(2222, 5678, Action.MISSED_SHOT, 150, 250),
            Event(1111, 5678, Action.STEAL, 0, 0),
            Event(2222, 5678, Action.BLOCK, 50, 75)
        ]
        
        process_game(events, 5678)
        
        # Verify heatmaps were created for both players
        assert mock_heatmap_class.call_count == 2
        
        # Verify the calls were made with correct player IDs
        calls = mock_heatmap_class.call_args_list
        player_ids = {call[0][0] for call in calls}  # Extract first argument (player_id) from each call
        assert player_ids == {1111, 2222}

    @patch('db.supabase')
    @patch('db.Heatmap')
    def test_process_game_empty_events(self, mock_heatmap_class, mock_supabase):
        """Test processing game with no events."""
        events = []
        
        process_game(events, 5678)
        
        # No heatmaps should be created
        mock_heatmap_class.assert_not_called()

    @patch('db.supabase')
    @patch('db.Heatmap')
    @patch('db.increment')
    def test_process_game_calls_increment(self, mock_increment, mock_heatmap_class, mock_supabase):
        """Test that process_game calls increment for each player."""
        # Setup mocks
        mock_heatmap = Mock()
        mock_heatmap.save_as_image.return_value = b'fake_image_data'
        mock_heatmap_class.return_value = mock_heatmap
        
        mock_supabase.storage.from_.return_value.upload.return_value = Mock()
        mock_supabase.storage.from_.return_value.get_public_url.return_value = "http://example.com/image.png"
        mock_supabase.from_.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        events = [
            Event(1111, 5678, Action.MADE_SHOT, 100, 200),
            Event(2222, 5678, Action.STEAL, 0, 0)
        ]
        
        process_game(events, 5678)
        
        # increment should be called twice (once for each player)
        assert mock_increment.call_count == 2

class TestDatabaseIntegration:
    """Integration tests that would require actual database connection."""
    
    def test_database_connection_required(self):
        """Note: These tests require actual Supabase connection."""
        # These tests would need actual database credentials and should be run separately
        # from unit tests. They would test:
        # 1. Actual database insertions
        # 2. Data retrieval and verification
        # 3. Error handling with database failures
        # 4. Transaction handling
        
        # For now, we'll just pass to indicate these tests exist conceptually
        pass
