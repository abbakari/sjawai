from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

app_name = 'workflow'

def workflow_placeholder(request):
    """Placeholder for workflow endpoints"""
    return JsonResponse({
        'message': 'Workflow API placeholder',
        'available_endpoints': []
    })

urlpatterns = [
    path('', workflow_placeholder, name='workflow_placeholder'),
]
