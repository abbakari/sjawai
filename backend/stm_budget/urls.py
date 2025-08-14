from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Routes
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

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "STM Budget Administration"
admin.site.site_title = "STM Budget Admin"
admin.site.index_title = "Welcome to STM Budget Administration"
