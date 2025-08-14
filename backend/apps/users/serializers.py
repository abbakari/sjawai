from rest_framework import serializers
from .models import User, UserSession, UserPreferences


class UserSerializer(serializers.ModelSerializer):
    """User serializer matching frontend User interface"""
    
    permissions = serializers.SerializerMethodField()
    accessible_dashboards = serializers.SerializerMethodField()
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'role', 'department', 'permissions',
            'is_active', 'created_at', 'last_login_time', 'accessible_dashboards',
            'phone', 'timezone', 'profile_picture', 'manager', 'manager_name'
        ]
        read_only_fields = ['id', 'created_at', 'last_login_time']
    
    def get_permissions(self, obj):
        return obj.role_permissions
    
    def get_accessible_dashboards(self, obj):
        return obj.accessible_dashboards


class UserSessionSerializer(serializers.ModelSerializer):
    """User session serializer"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'user_name', 'session_key', 'ip_address',
            'user_agent', 'is_active', 'created_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """User preferences serializer"""
    
    class Meta:
        model = UserPreferences
        exclude = ['id', 'user']
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
