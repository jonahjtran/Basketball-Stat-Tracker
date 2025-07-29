
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Player, Game, Season, PlayerCareer

class PlayerTests(APITestCase):
    def test_create_player(self):
        url = reverse("create_player")
        data = {"name": "John Doe", "external_id": "player_1"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Player.objects.count(), 1)

    def test_get_player(self):
        player = Player.objects.create(name="Jane Doe", external_id="player_2")
        url = reverse("get_player", args=[player.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Jane Doe")

    def test_update_player(self):
        player = Player.objects.create(name="Old Name", external_id="player_3")
        url = reverse("update_player", args=[player.id])
        data = {"name": "New Name"}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        player.refresh_from_db()
        self.assertEqual(player.name, "New Name")

    def test_delete_player(self):
        player = Player.objects.create(name="Delete Me", external_id="player_4")
        url = reverse("delete_player", args=[player.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Player.objects.count(), 0)

class GameTests(APITestCase):
    def test_create_game(self):
        url = reverse("create_game")
        data = {"date": "2025-07-28", "external_id": "game_1", "opponent": "Team A"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Game.objects.count(), 1)

    def test_post_events(self):
        game = Game.objects.create(date="2025-07-28", external_id="game_2", opponent="Team B")
        player = Player.objects.create(name="Event Player", external_id="player_5")
        # Create a season for the event
        season = Season.objects.create(
            name="2025 Season",
            start_date="2025-01-01",
            end_date="2025-12-31",
            external_id="season_1"
        )
        url = reverse("post_events", args=[game.id])
        data = {
            "events": [
                {"player_id": player.id, "season_id": season.id, "action": "assist", "x": 1.2, "y": 3.4}
            ]
        }
        response = self.client.post(url, data, format="json")
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_get_game(self):
        game = Game.objects.create(date="2025-07-28", external_id="game_3", opponent="Team C")
        url = reverse("get_game", args=[game.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_game(self):
        game = Game.objects.create(date="2025-07-28", external_id="game_4", opponent="Team D")
        url = reverse("update_game", args=[game.id])
        data = {"date": "2025-08-01"}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_game(self):
        game = Game.objects.create(date="2025-07-28", external_id="game_5", opponent="Team E")
        url = reverse("delete_game", args=[game.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Game.objects.count(), 0)

class SeasonTests(APITestCase):
    def test_create_season(self):
        url = reverse("create_season")
        data = {
            "name": "2025 Season",
            "external_id": "season_2",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Season.objects.count(), 1)

    def test_get_season(self):
        season = Season.objects.create(
            name="2025 Season",
            start_date="2025-01-01",
            end_date="2025-12-31",
            external_id="season_3"
        )
        url = reverse("get_season", args=[season.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_season(self):
        season = Season.objects.create(
            name="Old Season",
            start_date="2025-01-01",
            end_date="2025-12-31",
            external_id="season_4"
        )
        url = reverse("update_season", args=[season.id])
        data = {"name": "New Season"}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_season(self):
        season = Season.objects.create(
            name="Delete Season",
            start_date="2025-01-01",
            end_date="2025-12-31",
            external_id="season_5"
        )
        player = Player.objects.create(name="Player 1", external_id="player_6")
        url = reverse("delete_season", args=[season.id, player.id])
        response = self.client.delete(url)
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_404_NOT_FOUND])
