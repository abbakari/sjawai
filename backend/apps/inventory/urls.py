from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

app_name = 'inventory'

def inventory_placeholder(request):
    """Placeholder for inventory endpoints"""
    return JsonResponse({
        'message': 'Inventory API placeholder',
        'available_endpoints': []
    })

urlpatterns = [
    path('', inventory_placeholder, name='inventory_placeholder'),
]
