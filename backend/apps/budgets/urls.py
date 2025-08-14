from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'budgets'

router = DefaultRouter()
router.register(r'yearly', views.YearlyBudgetViewSet, basename='yearly-budget')
router.register(r'monthly', views.MonthlyBudgetViewSet, basename='monthly-budget')
router.register(r'distributions', views.BudgetDistributionViewSet, basename='budget-distribution')
router.register(r'templates', views.BudgetTemplateViewSet, basename='budget-template')
router.register(r'history', views.BudgetHistoryViewSet, basename='budget-history')
router.register(r'alerts', views.BudgetAlertViewSet, basename='budget-alert')

urlpatterns = [
    path('', include(router.urls)),
]
