"""
Dynamic Time-Based Models for STMBudget
These models automatically adapt to current time and create dynamic table structures
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
import json

User = get_user_model()


class TimeBasedModelMixin(models.Model):
    """
    Mixin that provides dynamic time-based functionality to models
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Dynamic year tracking
    current_year = models.IntegerField(default=lambda: datetime.now().year)
    target_year = models.IntegerField(default=lambda: datetime.now().year + 1)
    
    class Meta:
        abstract = True
    
    @property
    def available_years(self):
        """Returns available years from 2021 to current + 5"""
        current = datetime.now().year
        return list(range(2021, current + 6))
    
    @property
    def current_month(self):
        """Returns current month (1-12)"""
        return datetime.now().month
    
    @property
    def current_quarter(self):
        """Returns current quarter (1-4)"""
        month = datetime.now().month
        return (month - 1) // 3 + 1
    
    @property
    def remaining_months_in_year(self):
        """Returns remaining months in current year"""
        return 12 - datetime.now().month
    
    @property
    def is_future_year(self):
        """Check if target year is in the future"""
        return self.target_year > datetime.now().year


class DynamicBudget(TimeBasedModelMixin):
    """
    Dynamic budget model that adapts table structure based on time
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dynamic_budgets')
    customer = models.CharField(max_length=255)
    item = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    
    # Dynamic yearly data stored as JSON
    yearly_data = models.JSONField(default=dict, help_text="Stores budget/actual data by year")
    monthly_data = models.JSONField(default=dict, help_text="Stores monthly breakdown by year")
    
    # Current year quick access (auto-populated)
    current_year_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_year_actual = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    next_year_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Stock and other info
    stock = models.IntegerField(default=0)
    git = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status and approval workflow
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('revised', 'Needs Revision'),
    ], default='draft')
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_budgets')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'customer', 'item', 'current_year']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.customer} - {self.item} ({self.current_year})"
    
    def get_year_budget(self, year):
        """Get budget for specific year"""
        year_str = str(year)
        return self.yearly_data.get(year_str, {}).get('budget', 0)
    
    def set_year_budget(self, year, amount):
        """Set budget for specific year"""
        year_str = str(year)
        if year_str not in self.yearly_data:
            self.yearly_data[year_str] = {}
        self.yearly_data[year_str]['budget'] = float(amount)
        
        # Update quick access fields
        if year == self.current_year:
            self.current_year_budget = amount
        elif year == self.target_year:
            self.next_year_budget = amount
    
    def get_year_actual(self, year):
        """Get actual for specific year"""
        year_str = str(year)
        return self.yearly_data.get(year_str, {}).get('actual', 0)
    
    def set_year_actual(self, year, amount):
        """Set actual for specific year"""
        year_str = str(year)
        if year_str not in self.yearly_data:
            self.yearly_data[year_str] = {}
        self.yearly_data[year_str]['actual'] = float(amount)
        
        # Update quick access fields
        if year == self.current_year:
            self.current_year_actual = amount
    
    def get_monthly_breakdown(self, year):
        """Get monthly breakdown for specific year"""
        year_str = str(year)
        return self.monthly_data.get(year_str, {})
    
    def set_monthly_breakdown(self, year, monthly_dict):
        """Set monthly breakdown for specific year"""
        year_str = str(year)
        self.monthly_data[year_str] = monthly_dict
    
    def get_current_utilization(self):
        """Calculate current year utilization percentage"""
        budget = self.current_year_budget
        actual = self.current_year_actual
        if budget > 0:
            return (actual / budget) * 100
        return 0
    
    def is_over_budget(self):
        """Check if over budget for current year"""
        return self.current_year_actual > self.current_year_budget
    
    def save(self, *args, **kwargs):
        """Override save to ensure data consistency"""
        # Ensure current year data is in yearly_data
        if self.current_year_budget:
            self.set_year_budget(self.current_year, self.current_year_budget)
        if self.current_year_actual:
            self.set_year_actual(self.current_year, self.current_year_actual)
        if self.next_year_budget:
            self.set_year_budget(self.target_year, self.next_year_budget)
        
        super().save(*args, **kwargs)


class DynamicForecast(TimeBasedModelMixin):
    """
    Dynamic forecast model with time-aware functionality
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dynamic_forecasts')
    customer = models.CharField(max_length=255)
    item = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    
    # Dynamic forecast data
    yearly_forecasts = models.JSONField(default=dict, help_text="Stores forecast data by year")
    monthly_forecasts = models.JSONField(default=dict, help_text="Stores monthly forecast breakdown")
    
    # Current period quick access
    current_year_forecast = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    next_year_forecast = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Forecast accuracy and confidence
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Accuracy percentage")
    confidence_level = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    
    # Forecast methodology
    forecast_method = models.CharField(max_length=20, choices=[
        ('arima', 'ARIMA'),
        ('linear', 'Linear Regression'),
        ('neural', 'Neural Network'),
        ('exponential', 'Exponential Smoothing'),
        ('manual', 'Manual Input'),
    ], default='manual')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('revised', 'Under Revision'),
    ], default='draft')
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_forecasts')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'customer', 'item', 'current_year']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Forecast: {self.customer} - {self.item} ({self.current_year})"
    
    def get_year_forecast(self, year):
        """Get forecast for specific year"""
        year_str = str(year)
        return self.yearly_forecasts.get(year_str, 0)
    
    def set_year_forecast(self, year, amount):
        """Set forecast for specific year"""
        year_str = str(year)
        self.yearly_forecasts[year_str] = float(amount)
        
        # Update quick access fields
        if year == self.current_year:
            self.current_year_forecast = amount
        elif year == self.target_year:
            self.next_year_forecast = amount
    
    def get_monthly_forecast(self, year):
        """Get monthly forecast breakdown for year"""
        year_str = str(year)
        return self.monthly_forecasts.get(year_str, {})
    
    def set_monthly_forecast(self, year, monthly_dict):
        """Set monthly forecast breakdown"""
        year_str = str(year)
        self.monthly_forecasts[year_str] = monthly_dict
    
    def calculate_variance(self, actual_amount):
        """Calculate variance between forecast and actual"""
        forecast = self.current_year_forecast
        if forecast > 0:
            return ((actual_amount - forecast) / forecast) * 100
        return 0
    
    def update_accuracy(self, actual_amount):
        """Update accuracy score based on actual results"""
        if self.current_year_forecast > 0:
            variance = abs(self.calculate_variance(actual_amount))
            # Simple accuracy calculation: 100% - variance%
            accuracy = max(0, 100 - variance)
            self.accuracy_score = min(accuracy, 100)
            
            # Update confidence level based on accuracy
            if accuracy >= 90:
                self.confidence_level = 'high'
            elif accuracy >= 70:
                self.confidence_level = 'medium'
            else:
                self.confidence_level = 'low'
    
    def save(self, *args, **kwargs):
        """Override save to ensure data consistency"""
        # Ensure current year data is in yearly_forecasts
        if self.current_year_forecast:
            self.set_year_forecast(self.current_year, self.current_year_forecast)
        if self.next_year_forecast:
            self.set_year_forecast(self.target_year, self.next_year_forecast)
        
        super().save(*args, **kwargs)


class CommunicationMessage(models.Model):
    """
    Communication message model for internal messaging system
    """
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    to_role = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('salesman', 'Salesman'),
        ('supply_chain', 'Supply Chain'),
        ('all', 'All Users'),
    ], null=True, blank=True)
    
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    category = models.CharField(max_length=20, choices=[
        ('stock_request', 'Stock Request'),
        ('budget_approval', 'Budget Approval'),
        ('forecast_inquiry', 'Forecast Inquiry'),
        ('supply_chain', 'Supply Chain'),
        ('general', 'General'),
        ('system_alert', 'System Alert'),
    ], default='general')
    
    priority = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('read', 'Read'),
        ('responded', 'Responded'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),
    ], default='pending')
    
    # Reply functionality
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Attachments (optional)
    attachment = models.FileField(upload_to='communication_attachments/', null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username if self.to_user else self.to_role}: {self.subject}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if self.status == 'pending':
            self.status = 'read'
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_responded(self):
        """Mark message as responded"""
        self.status = 'responded'
        self.responded_at = timezone.now()
        self.save()
    
    def mark_as_resolved(self):
        """Mark message as resolved"""
        self.status = 'resolved'
        self.save()
    
    @property
    def is_unread(self):
        """Check if message is unread"""
        return self.status == 'pending'
    
    @property
    def time_since_created(self):
        """Get human-readable time since creation"""
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"


class TimeBasedSettings(models.Model):
    """
    Global settings for time-based functionality
    """
    setting_key = models.CharField(max_length=100, unique=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Time Based Settings"
    
    def __str__(self):
        return f"{self.setting_key}: {self.setting_value}"
    
    @classmethod
    def get_setting(cls, key, default=None):
        """Get a setting value"""
        try:
            setting = cls.objects.get(setting_key=key)
            return setting.setting_value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_setting(cls, key, value, description=""):
        """Set a setting value"""
        setting, created = cls.objects.get_or_create(
            setting_key=key,
            defaults={'setting_value': value, 'description': description}
        )
        if not created:
            setting.setting_value = value
            setting.description = description
            setting.save()
        return setting
