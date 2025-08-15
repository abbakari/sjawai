"""
STMBudget Django URL Configuration
Updated for Django template-based views
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.views.generic import RedirectView
from apps.dashboard import views as dashboard_views
from apps.authentication import views as auth_views_custom
from apps.users import views as user_views
from apps.budgets import views as budget_views
from apps.forecasts import views as forecast_views
from apps.reports import views as report_views

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Root redirect to dashboard
    path('', RedirectView.as_view(url='/dashboard/', permanent=False), name='home'),
    
    # Authentication URLs
    path('login/', auth_views_custom.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Dashboard - Main entry point
    path('dashboard/', dashboard_views.DashboardView.as_view(), name='dashboard'),
    
    # User Management
    path('user-management/', user_views.UserManagementView.as_view(), name='user_management'),
    path('profile/', user_views.ProfileView.as_view(), name='profile'),
    
    # Budget Management
    path('sales-budget/', budget_views.SalesBudgetView.as_view(), name='sales_budget'),
    path('budget-allocation/', budget_views.BudgetAllocationView.as_view(), name='budget_allocation'),
    
    # Forecasting
    path('rolling-forecast/', forecast_views.RollingForecastView.as_view(), name='rolling_forecast'),
    path('forecast-analysis/', forecast_views.ForecastAnalysisView.as_view(), name='forecast_analysis'),
    
    # Approval Center (Manager functions)
    path('approval-center/', dashboard_views.ApprovalCenterView.as_view(), name='approval_center'),
    
    # Advanced Admin Features
    path('advanced-admin/', dashboard_views.AdvancedAdminView.as_view(), name='advanced_admin'),
    path('inventory-management/', dashboard_views.InventoryManagementView.as_view(), name='inventory_management'),
    path('distribution-management/', dashboard_views.DistributionManagementView.as_view(), name='distribution_management'),
    
    # Business Intelligence
    path('bi-dashboard/', dashboard_views.BiDashboardView.as_view(), name='bi_dashboard'),
    
    # Reports
    path('reports/', report_views.ReportsView.as_view(), name='reports'),
    path('export/', report_views.ExportView.as_view(), name='export'),
    
    # API Endpoints for AJAX calls
    path('api/', include([
        # Dashboard API
        path('dashboard-stats/', dashboard_views.DashboardStatsAPI.as_view(), name='api_dashboard_stats'),
        path('recent-activity/', dashboard_views.RecentActivityAPI.as_view(), name='api_recent_activity'),
        path('quick-actions/', dashboard_views.QuickActionsAPI.as_view(), name='api_quick_actions'),
        
        # Chart Data API
        path('chart-data/budget-allocation/', dashboard_views.BudgetAllocationChartAPI.as_view(), name='api_budget_allocation_chart'),
        path('chart-data/sales-trend/', dashboard_views.SalesTrendChartAPI.as_view(), name='api_sales_trend_chart'),
        path('chart-data/performance/', dashboard_views.PerformanceChartAPI.as_view(), name='api_performance_chart'),
        
        # User Management API
        path('users/', user_views.UserListAPI.as_view(), name='api_users'),
        path('users/create/', user_views.UserCreateAPI.as_view(), name='api_user_create'),
        path('users/<int:user_id>/', user_views.UserDetailAPI.as_view(), name='api_user_detail'),
        
        # Budget API
        path('budgets/', budget_views.BudgetListAPI.as_view(), name='api_budgets'),
        path('budgets/create/', budget_views.BudgetCreateAPI.as_view(), name='api_budget_create'),
        path('budgets/<int:budget_id>/', budget_views.BudgetDetailAPI.as_view(), name='api_budget_detail'),
        
        # Forecast API
        path('forecasts/', forecast_views.ForecastListAPI.as_view(), name='api_forecasts'),
        path('forecasts/create/', forecast_views.ForecastCreateAPI.as_view(), name='api_forecast_create'),
        path('forecasts/<int:forecast_id>/', forecast_views.ForecastDetailAPI.as_view(), name='api_forecast_detail'),
        
        # Export API
        path('export/dashboard/', report_views.DashboardExportAPI.as_view(), name='api_export_dashboard'),
        path('export/budget/', report_views.BudgetExportAPI.as_view(), name='api_export_budget'),
        path('export/forecast/', report_views.ForecastExportAPI.as_view(), name='api_export_forecast'),
        
        # System Health API
        path('health/', dashboard_views.SystemHealthAPI.as_view(), name='api_health'),
        path('metrics/', dashboard_views.SystemMetricsAPI.as_view(), name='api_metrics'),
    ])),
    
    # Legacy API support (for gradual migration)
    path('api/v1/', include([
        path('auth/', include('apps.authentication.urls')),
        path('users/', include('apps.users.urls')),
        path('budgets/', include('apps.budgets.urls')),
        path('forecasts/', include('apps.forecasts.urls')),
        path('reports/', include('apps.reports.urls')),
        path('dashboard/', include('apps.dashboard.urls')),
        path('inventory/', include('apps.inventory.urls')),
        path('notifications/', include('apps.notifications.urls')),
        path('workflow/', include('apps.workflow.urls')),
    ])),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = 'apps.dashboard.views.custom_404'
handler500 = 'apps.dashboard.views.custom_500'

# Add CSP and security headers
def csp_middleware(get_response):
    def middleware(request):
        response = get_response(request)
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
            "font-src 'self' fonts.gstatic.com; "
            "img-src 'self' data: blob:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response['X-Frame-Options'] = 'DENY'
        response['X-Content-Type-Options'] = 'nosniff'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response
    return middleware
