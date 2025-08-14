from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# Import template-based views
from apps.dashboard.views import (
    login_view,
    logout_view,
    dashboard_view,
    sales_budget_view,
    rolling_forecast_view,
    user_management_view,
    approval_center_view,
    inventory_management_view,
    distribution_management_view,
    admin_panel_view,
    api_recent_activity,
    api_refresh_data,
)

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Authentication URLs
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    
    # Main application URLs (template-based)
    path('', RedirectView.as_view(url='/dashboard/', permanent=False), name='home'),
    path('dashboard/', dashboard_view, name='dashboard'),
    
    # Role-based pages
    path('sales-budget/', sales_budget_view, name='sales_budget'),
    path('rolling-forecast/', rolling_forecast_view, name='rolling_forecast'),
    path('user-management/', user_management_view, name='user_management'),
    path('approval-center/', approval_center_view, name='approval_center'),
    path('inventory-management/', inventory_management_view, name='inventory_management'),
    path('distribution-management/', distribution_management_view, name='distribution_management'),
    path('admin-panel/', admin_panel_view, name='admin_panel'),
    
    # API endpoints for AJAX functionality
    path('api/recent-activity/', api_recent_activity, name='api_recent_activity'),
    path('api/refresh-data/', api_refresh_data, name='api_refresh_data'),
    
    # Legacy API URLs (for backward compatibility)
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/forecasts/', include('apps.forecasts.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/workflow/', include('apps.workflow.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/reports/', include('apps.reports.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Add debug toolbar if available
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass

# Custom error handlers
handler404 = 'apps.dashboard.views.handler404'
handler500 = 'apps.dashboard.views.handler500'

# Add PWA manifest and service worker
urlpatterns += [
    path('manifest.json', lambda request: JsonResponse({
        "name": "STMBudget",
        "short_name": "STMBudget",
        "description": "Advanced Budget Management System",
        "start_url": "/dashboard/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#3b82f6",
        "icons": [
            {
                "src": "/static/images/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/static/images/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }), name='manifest'),
    
    path('sw.js', lambda request: HttpResponse('''
        const CACHE_NAME = 'stmbudget-v1';
        const urlsToCache = [
            '/',
            '/static/css/app.css',
            '/static/js/app.js',
            '/dashboard/',
        ];
        
        self.addEventListener('install', event => {
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then(cache => cache.addAll(urlsToCache))
            );
        });
        
        self.addEventListener('fetch', event => {
            event.respondWith(
                caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        return fetch(event.request);
                    })
            );
        });
    ''', content_type='application/javascript'), name='service_worker'),
]
