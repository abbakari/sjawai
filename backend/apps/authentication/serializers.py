from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone
from apps.users.models import User, UserPreferences


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer to match frontend auth requirements"""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the username field since we use email
        self.fields.pop('username', None)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to match frontend expectations
        token['user_id'] = user.id
        token['email'] = user.email
        token['name'] = user.name
        token['role'] = user.role
        token['department'] = user.department
        token['permissions'] = user.role_permissions
        token['accessible_dashboards'] = user.accessible_dashboards

        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Use email instead of username for authentication
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )

            if not user:
                raise serializers.ValidationError('Invalid email or password')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')

            # Update last login
            user.last_login_time = timezone.now()
            user.save(update_fields=['last_login_time'])

            refresh = self.get_token(user)

            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
        else:
            raise serializers.ValidationError('Must include email and password')

    @property
    def username_field(self):
        return 'email'


class UserSerializer(serializers.ModelSerializer):
    """User serializer matching frontend User interface"""
    
    permissions = serializers.SerializerMethodField()
    accessible_dashboards = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'role', 'department', 'permissions',
            'is_active', 'created_at', 'last_login_time', 'accessible_dashboards',
            'phone', 'timezone', 'profile_picture'
        ]
        read_only_fields = ['id', 'created_at', 'last_login_time']
    
    def get_permissions(self, obj):
        return obj.role_permissions
    
    def get_accessible_dashboards(self, obj):
        return obj.accessible_dashboards


class LoginSerializer(serializers.Serializer):
    """Login serializer matching frontend expectations"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'name', 'password', 'password_confirm',
            'role', 'department', 'phone', 'timezone'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create default preferences
        UserPreferences.objects.create(user=user)
        
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Password change serializer"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer for profile updates"""
    
    class Meta:
        model = User
        fields = [
            'name', 'email', 'phone', 'timezone', 'profile_picture',
            'department'  # Some fields might be editable depending on role
        ]
    
    def validate_email(self, value):
        user = self.instance
        if user and User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Email already in use')
        return value


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
