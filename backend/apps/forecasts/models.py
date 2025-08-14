from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import json


class Customer(models.Model):
    """Customer model matching frontend Customer interface"""
    
    class SeasonalityType(models.TextChoices):
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'
    
    class TierType(models.TextChoices):
        PLATINUM = 'platinum', 'Platinum'
        GOLD = 'gold', 'Gold'
        SILVER = 'silver', 'Silver'
        BRONZE = 'bronze', 'Bronze'
    
    # Core customer fields matching frontend
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    region = models.CharField(max_length=100)
    segment = models.CharField(max_length=100)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    active = models.BooleanField(default=True)
    
    # Relationship fields
    manager = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Business characteristics
    channels = models.JSONField(default=list, help_text="Sales channels")
    seasonality = models.CharField(max_length=10, choices=SeasonalityType.choices, default='medium')
    tier = models.CharField(max_length=10, choices=TierType.choices, default='bronze')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customers'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['region', 'segment']),
            models.Index(fields=['manager', 'active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Item(models.Model):
    """Item model matching frontend Item interface"""
    
    id = models.CharField(max_length=50, primary_key=True)
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    unit = models.CharField(max_length=50, default='pcs')
    active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    # Seasonal characteristics
    seasonal = models.BooleanField(default=False)
    seasonal_months = models.JSONField(default=list, blank=True)
    
    # Supply chain info
    min_order_quantity = models.IntegerField(default=1)
    lead_time = models.IntegerField(default=0, help_text="Lead time in days")
    supplier = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'items'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['category', 'brand']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"


class CustomerItemForecast(models.Model):
    """Customer Item Forecast model matching frontend CustomerItemForecast interface"""
    
    class StatusType(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        APPROVED = 'approved', 'Approved'
        REVISED = 'revised', 'Revised'
    
    class ConfidenceType(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
    
    id = models.CharField(max_length=100, primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='forecasts')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='forecasts')
    
    # Yearly totals
    yearly_total = models.IntegerField(default=0, help_text="Total forecast units for the year")
    yearly_budget_impact = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status and confidence
    status = models.CharField(max_length=10, choices=StatusType.choices, default='draft')
    confidence = models.CharField(max_length=10, choices=ConfidenceType.choices, default='medium')
    notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_forecasts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_item_forecasts'
        unique_together = ['customer', 'item', 'created_by']
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['item', 'confidence']),
        ]
    
    def __str__(self):
        return f"{self.customer.name} - {self.item.name} ({self.status})"
    
    @property
    def monthly_budget_impact(self):
        """Calculate monthly budget impact from monthly forecasts"""
        monthly_impacts = {}
        for forecast in self.monthly_forecasts.all():
            month_key = f"{forecast.year}-{forecast.month_index:02d}"
            monthly_impacts[month_key] = forecast.total_value
        return monthly_impacts


class MonthlyForecast(models.Model):
    """Monthly Forecast model matching frontend MonthlyForecast interface"""
    
    customer_item_forecast = models.ForeignKey(CustomerItemForecast, on_delete=models.CASCADE, 
                                              related_name='monthly_forecasts')
    month = models.CharField(max_length=3)  # 'Jan', 'Feb', etc.
    year = models.IntegerField()
    month_index = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(11)])
    
    # Forecast data
    quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'monthly_forecasts'
        unique_together = ['customer_item_forecast', 'month', 'year']
        ordering = ['year', 'month_index']
        indexes = [
            models.Index(fields=['year', 'month_index']),
        ]
    
    def __str__(self):
        return f"{self.customer_item_forecast} - {self.month} {self.year}"
    
    def save(self, *args, **kwargs):
        self.total_value = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class ForecastSummary(models.Model):
    """Forecast Summary model matching frontend ForecastSummary interface"""
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='forecast_summaries')
    year = models.IntegerField()
    
    # Summary totals
    total_items = models.IntegerField(default=0)
    total_yearly_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_monthly_values = models.JSONField(default=dict)  # {month: value}
    
    # Status
    status = models.CharField(max_length=10, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('revised', 'Revised')
    ], default='draft')
    
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forecast_summaries'
        unique_together = ['customer', 'year']
        ordering = ['-year', 'customer__name']
    
    def __str__(self):
        return f"{self.customer.name} - {self.year} Summary"


class BudgetImpact(models.Model):
    """Budget Impact model matching frontend BudgetImpact interface"""
    
    forecast_summary = models.ForeignKey(ForecastSummary, on_delete=models.CASCADE, related_name='budget_impacts')
    month = models.CharField(max_length=3)
    year = models.IntegerField()
    
    # Budget impact calculations
    original_budget = models.DecimalField(max_digits=12, decimal_places=2)
    forecast_impact = models.DecimalField(max_digits=12, decimal_places=2)
    new_projected_budget = models.DecimalField(max_digits=12, decimal_places=2)
    variance = models.DecimalField(max_digits=12, decimal_places=2)
    variance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'budget_impacts'
        unique_together = ['forecast_summary', 'month', 'year']
        ordering = ['year', 'month']
    
    def save(self, *args, **kwargs):
        self.new_projected_budget = self.original_budget + self.forecast_impact
        self.variance = self.forecast_impact
        if self.original_budget > 0:
            self.variance_percentage = (self.variance / self.original_budget) * 100
        super().save(*args, **kwargs)


class CustomerAnalytics(models.Model):
    """Customer Analytics model matching frontend CustomerAnalytics interface"""
    
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='analytics')
    
    # Analytics data
    total_forecast = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    monthly_breakdown = models.JSONField(default=dict)  # {month: value}
    category_breakdown = models.JSONField(default=dict)  # {category: value}
    channel_breakdown = models.JSONField(default=dict)  # {channel: value}
    
    # Performance metrics
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    seasonal_trends = models.JSONField(default=list)
    risk_score = models.DecimalField(max_digits=3, decimal_places=1, default=0,
                                    validators=[MinValueValidator(0), MaxValueValidator(10)])
    confidence_score = models.DecimalField(max_digits=3, decimal_places=1, default=0,
                                          validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    # Timestamps
    calculated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'customer_analytics'
    
    def __str__(self):
        return f"{self.customer.name} Analytics"


class ForecastTemplate(models.Model):
    """Forecast templates for quick forecast creation"""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Template configuration
    category = models.CharField(max_length=100, blank=True)
    seasonality_pattern = models.CharField(max_length=50, default='Default Seasonal')
    default_confidence = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ], default='medium')
    
    # Monthly distribution
    monthly_distribution = models.JSONField(default=dict, help_text="Monthly distribution percentages")
    
    # Access control
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forecast_templates'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ForecastHistory(models.Model):
    """Track forecast changes for audit trail"""
    
    customer_item_forecast = models.ForeignKey(CustomerItemForecast, on_delete=models.CASCADE, 
                                              related_name='history')
    action = models.CharField(max_length=20, choices=[
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('revised', 'Revised'),
        ('deleted', 'Deleted')
    ])
    
    # Store the state before change
    previous_data = models.JSONField(default=dict)
    new_data = models.JSONField(default=dict)
    
    # User and timestamp
    changed_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    # Optional comment
    comment = models.TextField(blank=True)
    
    class Meta:
        db_table = 'forecast_history'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['customer_item_forecast', 'changed_at']),
        ]
    
    def __str__(self):
        return f"{self.customer_item_forecast} - {self.action} by {self.changed_by.name}"
