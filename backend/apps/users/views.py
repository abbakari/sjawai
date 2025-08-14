from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User, UserSession, UserPreferences
from .serializers import UserSerializer, UserSessionSerializer, UserPreferencesSerializer
from apps.permissions import CanManageUsers


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['name', 'email', 'username']
    ordering_fields = ['name', 'created_at', 'last_login_time']
    ordering = ['name']
    permission_classes = [permissions.IsAuthenticated, CanManageUsers]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
