from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

app_name = 'dashboard'

def dashboard_placeholder(request):
    """Placeholder for dashboard endpoints"""
    return JsonResponse({
        'message': 'Dashboard API placeholder',
        'available_endpoints': []
    })

urlpatterns = [
    path('', dashboard_placeholder, name='dashboard_placeholder'),
]
