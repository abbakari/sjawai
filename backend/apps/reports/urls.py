from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

app_name = 'reports'

def reports_placeholder(request):
    """Placeholder for reports endpoints"""
    return JsonResponse({
        'message': 'Reports API placeholder',
        'available_endpoints': []
    })

urlpatterns = [
    path('', reports_placeholder, name='reports_placeholder'),
]
