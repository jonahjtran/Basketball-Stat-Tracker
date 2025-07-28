from django.shortcuts import render
from django.http import FileResponse, Http404
from django.db import transaction

from collections import defaultdict
from .models import PlayerGame, Event, ShotZone, Game
from .heatmap import Heatmap
from .utility.supabase_utility import upload_heatmap_to_supabase



# Create your views here.