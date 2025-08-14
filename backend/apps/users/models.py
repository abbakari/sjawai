from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone


class User(AbstractUser):
    """Custom User model matching frontend auth types exactly"""
    
    class UserRole(models.TextChoices):
        ADMIN = 'admin', 'Administrator'
        SALESMAN = 'salesman', 'Salesman'
        MANAGER = 'manager', 'Manager'
        SUPPLY_CHAIN = 'supply_chain', 'Supply Chain'
    
    # Core fields to match frontend User interface
    name = models.CharField(max_length=255, help_text="Full display name")
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.SALESMAN)
    department = models.CharField(max_length=100, default='Unknown')
    is_active = models.BooleanField(default=True)
    last_login_time = models.DateTimeField(null=True, blank=True)
    
    # Profile fields
    phone = models.CharField(max_length=20, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='team_members')
    timezone = models.CharField(max_length=50, default='UTC')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"
    
    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)
    
    @property
    def role_permissions(self):
        """Get role-based permissions matching frontend ROLE_PERMISSIONS"""
        permissions_map = {
            'admin': [
                {'id': '1', 'name': 'View All Dashboards', 'resource': 'dashboard', 'action': 'read'},
                {'id': '2', 'name': 'Manage Users', 'resource': 'users', 'action': 'manage'},
                {'id': '3', 'name': 'View All Reports', 'resource': 'reports', 'action': 'read'},
                {'id': '4', 'name': 'System Settings', 'resource': 'settings', 'action': 'manage'},
                {'id': '5', 'name': 'Approve All', 'resource': 'approvals', 'action': 'manage'}
            ],
            'salesman': [
                {'id': '6', 'name': 'Create Sales Budget', 'resource': 'sales_budget', 'action': 'create'},
                {'id': '7', 'name': 'Submit for Approval', 'resource': 'approvals', 'action': 'submit'},
                {'id': '8', 'name': 'Create Forecasts', 'resource': 'forecasts', 'action': 'create'},
                {'id': '9', 'name': 'View Own Data', 'resource': 'own_data', 'action': 'read'},
                {'id': '10', 'name': 'Customer Management', 'resource': 'customers', 'action': 'manage'}
            ],
            'manager': [
                {'id': '11', 'name': 'Approve Sales Budgets', 'resource': 'sales_budget', 'action': 'approve'},
                {'id': '12', 'name': 'Approve Forecasts', 'resource': 'forecasts', 'action': 'approve'},
                {'id': '13', 'name': 'Provide Feedback', 'resource': 'feedback', 'action': 'create'},
                {'id': '14', 'name': 'View Team Data', 'resource': 'team_data', 'action': 'read'},
                {'id': '15', 'name': 'Send to Supply Chain', 'resource': 'supply_chain', 'action': 'forward'}
            ],
            'supply_chain': [
                {'id': '16', 'name': 'View Approved Budgets', 'resource': 'approved_budgets', 'action': 'read'},
                {'id': '17', 'name': 'View Approved Forecasts', 'resource': 'approved_forecasts', 'action': 'read'},
                {'id': '18', 'name': 'Inventory Management', 'resource': 'inventory', 'action': 'manage'},
                {'id': '19', 'name': 'Supply Planning', 'resource': 'supply_planning', 'action': 'manage'},
                {'id': '20', 'name': 'Customer Satisfaction', 'resource': 'customer_satisfaction', 'action': 'read'}
            ]
        }
        return permissions_map.get(self.role, [])
    
    @property
    def accessible_dashboards(self):
        """Get accessible dashboards matching frontend ROLE_DASHBOARDS"""
        dashboards_map = {
            'admin': ['Dashboard', 'SalesBudget', 'RollingForecast', 'UserManagement', 'DataSources', 
                     'InventoryManagement', 'DistributionManagement', 'BiDashboard'],
            'salesman': ['Dashboard', 'SalesBudget', 'RollingForecast'],
            'manager': ['Dashboard', 'SalesBudget', 'RollingForecast', 'ApprovalCenter'],
            'supply_chain': ['Dashboard', 'InventoryManagement', 'DistributionManagement', 'SupplyChainDashboard']
        }
        return dashboards_map.get(self.role, [])
    
    def has_permission(self, resource, action):
        """Check if user has specific permission"""
        permissions = self.role_permissions
        return any(p['resource'] == resource and p['action'] == action for p in permissions)
    
    def can_access_dashboard(self, dashboard_name):
        """Check if user can access specific dashboard"""
        return dashboard_name in self.accessible_dashboards


class UserSession(models.Model):
    """Track user sessions for analytics and security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.name} - {self.ip_address}"


class UserPreferences(models.Model):
    """Store user preferences and settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Dashboard preferences
    default_dashboard = models.CharField(max_length=50, default='Dashboard')
    items_per_page = models.IntegerField(default=50)
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    currency_format = models.CharField(max_length=10, default='USD')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    browser_notifications = models.BooleanField(default=True)
    workflow_notifications = models.BooleanField(default=True)
    
    # UI preferences
    theme = models.CharField(max_length=20, choices=[('light', 'Light'), ('dark', 'Dark')], default='light')
    sidebar_collapsed = models.BooleanField(default=False)
    auto_save_interval = models.IntegerField(default=30)  # seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
    
    def __str__(self):
        return f"{self.user.name} Preferences"
