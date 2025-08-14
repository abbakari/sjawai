from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

app_name = 'notifications'

def notifications_placeholder(request):
    """Placeholder for notifications endpoints"""
    return JsonResponse({
        'message': 'Notifications API placeholder',
        'available_endpoints': []
    })

urlpatterns = [
    path('', notifications_placeholder, name='notifications_placeholder'),
]
