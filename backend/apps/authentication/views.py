from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db import transaction
from .serializers import (
    CustomTokenObtainPairSerializer, 
    LoginSerializer, 
    UserSerializer,
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    UserProfileSerializer,
    UserPreferencesSerializer
)
from apps.users.models import User, UserSession, UserPreferences
import logging

logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view matching frontend expectations"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                # Track user session
                user_email = request.data.get('email')
                user = User.objects.get(email=user_email)
                
                # Create session record
                UserSession.objects.create(
                    user=user,
                    session_key=request.session.session_key or 'api_session',
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
                
                logger.info(f"User {user.email} successfully logged in")
            
            return response
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {'error': 'Login failed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginView(APIView):
    """Login view for session-based authentication (alternative to JWT)"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Login user (creates session)
            login(request, user)
            
            # Update last login
            user.last_login_time = timezone.now()
            user.save(update_fields=['last_login_time'])
            
            # Create session record
            UserSession.objects.create(
                user=user,
                session_key=request.session.session_key,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Deactivate user sessions
            if hasattr(request.user, 'sessions'):
                request.user.sessions.filter(is_active=True).update(is_active=False)
            
            # If using JWT, blacklist the token
            if 'refresh' in request.data:
                refresh_token = RefreshToken(request.data['refresh'])
                refresh_token.blacklist()
            
            # Session logout
            logout(request)
            
            logger.info(f"User {request.user.email} logged out")
            
            return Response({'message': 'Logout successful'})
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': 'Logout failed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(APIView):
    """User registration view"""
    permission_classes = [permissions.AllowAny]  # Or restrict based on your needs
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                
                # Create JWT tokens
                refresh = RefreshToken.for_user(user)
                
                logger.info(f"New user registered: {user.email}")
                
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Registration successful'
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """User profile management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            logger.info(f"Password changed for user: {user.email}")
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserPreferencesView(APIView):
    """User preferences management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user preferences"""
        try:
            preferences = request.user.preferences
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data)
        except UserPreferences.DoesNotExist:
            # Create default preferences if they don't exist
            preferences = UserPreferences.objects.create(user=request.user)
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data)
    
    def put(self, request):
        """Update user preferences"""
        try:
            preferences = request.user.preferences
        except UserPreferences.DoesNotExist:
            preferences = UserPreferences.objects.create(user=request.user)
        
        serializer = UserPreferencesSerializer(
            preferences,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_permissions(request):
    """Get user permissions and role information"""
    user = request.user
    
    return Response({
        'role': user.role,
        'role_display': user.get_role_display(),
        'permissions': user.role_permissions,
        'accessible_dashboards': user.accessible_dashboards,
        'department': user.department,
        'manager': user.manager.name if user.manager else None
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_permission(request):
    """Check if user has specific permission"""
    resource = request.data.get('resource')
    action = request.data.get('action')
    
    if not resource or not action:
        return Response(
            {'error': 'Resource and action are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    has_permission = request.user.has_permission(resource, action)
    
    return Response({
        'has_permission': has_permission,
        'resource': resource,
        'action': action
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_dashboard_access(request):
    """Check if user can access specific dashboard"""
    dashboard_name = request.data.get('dashboard_name')
    
    if not dashboard_name:
        return Response(
            {'error': 'Dashboard name is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    can_access = request.user.can_access_dashboard(dashboard_name)
    
    return Response({
        'can_access': can_access,
        'dashboard_name': dashboard_name
    })


class SessionInfoView(APIView):
    """Get current session information"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get active session
            session = request.user.sessions.filter(
                session_key=request.session.session_key,
                is_active=True
            ).first()
            
            session_data = {
                'session_key': request.session.session_key,
                'ip_address': request.META.get('REMOTE_ADDR', ''),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'created_at': session.created_at if session else None,
                'last_activity': session.last_activity if session else None
            }
            
            return Response({
                'user': UserSerializer(request.user).data,
                'session': session_data,
                'server_time': timezone.now()
            })
            
        except Exception as e:
            logger.error(f"Session info error: {str(e)}")
            return Response(
                {'error': 'Failed to get session info'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
