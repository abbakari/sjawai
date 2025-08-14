from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'forecasts'

router = DefaultRouter()
# Main forecast endpoint matching frontend expectation
router.register(r'', views.CustomerItemForecastViewSet, basename='forecast')
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'monthly', views.MonthlyForecastViewSet, basename='monthly-forecast')
router.register(r'summaries', views.ForecastSummaryViewSet, basename='forecast-summary')
router.register(r'templates', views.ForecastTemplateViewSet, basename='forecast-template')
router.register(r'history', views.ForecastHistoryViewSet, basename='forecast-history')

urlpatterns = [
    path('', include(router.urls)),
]
