from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import json


class YearlyBudget(models.Model):
    """Yearly Budget model matching frontend YearlyBudgetData interface"""
    
    id = models.CharField(max_length=100, primary_key=True)  # Match frontend string IDs
    customer = models.CharField(max_length=255)
    item = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    year = models.CharField(max_length=4)
    total_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_budgets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('saved', 'Saved'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='draft')
    
    # Additional fields for data integrity
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'yearly_budgets'
        verbose_name = 'Yearly Budget'
        verbose_name_plural = 'Yearly Budgets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'year']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['year', 'category']),
        ]
    
    def __str__(self):
        return f"{self.customer} - {self.item} ({self.year})"
    
    @property
    def monthly_data_summary(self):
        """Get summary of monthly data"""
        monthly_budgets = self.monthly_budgets.all()
        return {
            'total_months': monthly_budgets.count(),
            'total_budget_value': sum(mb.budget_value for mb in monthly_budgets),
            'total_actual_value': sum(mb.actual_value for mb in monthly_budgets),
            'average_rate': sum(mb.rate for mb in monthly_budgets) / max(monthly_budgets.count(), 1)
        }


class MonthlyBudget(models.Model):
    """Monthly Budget model matching frontend MonthlyBudget interface"""
    
    yearly_budget = models.ForeignKey(YearlyBudget, on_delete=models.CASCADE, related_name='monthly_budgets')
    month = models.CharField(max_length=3)  # 'Jan', 'Feb', etc.
    month_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    
    # Core budget fields matching frontend
    budget_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    stock = models.IntegerField(default=0)
    git = models.IntegerField(default=0, help_text="Goods In Transit")
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Calculated fields
    net_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    variance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    variance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'monthly_budgets'
        verbose_name = 'Monthly Budget'
        verbose_name_plural = 'Monthly Budgets'
        unique_together = ['yearly_budget', 'month']
        ordering = ['yearly_budget', 'month_number']
        indexes = [
            models.Index(fields=['yearly_budget', 'month_number']),
        ]
    
    def __str__(self):
        return f"{self.yearly_budget.customer} - {self.month} {self.yearly_budget.year}"
    
    def save(self, *args, **kwargs):
        # Calculate derived fields
        self.net_value = self.budget_value - self.discount
        if self.budget_value > 0:
            self.variance = self.actual_value - self.budget_value
            self.variance_percentage = (self.variance / self.budget_value) * 100
        super().save(*args, **kwargs)


class BudgetTemplate(models.Model):
    """Budget templates for quick budget creation"""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    
    # Template data as JSON
    monthly_distribution = models.JSONField(default=dict, help_text="Monthly distribution percentages")
    default_rates = models.JSONField(default=dict, help_text="Default rates by month")
    seasonal_adjustments = models.JSONField(default=dict, help_text="Seasonal adjustment factors")
    
    # Access control
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'budget_templates'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BudgetHistory(models.Model):
    """Track budget changes for audit trail"""
    
    yearly_budget = models.ForeignKey(YearlyBudget, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=[
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
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
        db_table = 'budget_history'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['yearly_budget', 'changed_at']),
        ]
    
    def __str__(self):
        return f"{self.yearly_budget} - {self.action} by {self.changed_by.name}"


class BudgetDistribution(models.Model):
    """Manage seasonal and custom budget distributions"""
    
    class DistributionType(models.TextChoices):
        SEASONAL = 'seasonal', 'Seasonal'
        CUSTOM = 'custom', 'Custom'
        HISTORICAL = 'historical', 'Historical-based'
        LINEAR = 'linear', 'Linear'
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=DistributionType.choices)
    description = models.TextField(blank=True)
    
    # Distribution data matching frontend seasonal distribution
    january = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    february = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    march = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    april = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    may = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    june = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    july = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    august = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    september = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    october = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    november = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    december = models.DecimalField(max_digits=5, decimal_places=2, default=8.33)
    
    # System fields
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'budget_distributions'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_distribution_array(self):
        """Return distribution as array matching frontend format"""
        return [
            {'month': 'Jan', 'value': float(self.january)},
            {'month': 'Feb', 'value': float(self.february)},
            {'month': 'Mar', 'value': float(self.march)},
            {'month': 'Apr', 'value': float(self.april)},
            {'month': 'May', 'value': float(self.may)},
            {'month': 'Jun', 'value': float(self.june)},
            {'month': 'Jul', 'value': float(self.july)},
            {'month': 'Aug', 'value': float(self.august)},
            {'month': 'Sep', 'value': float(self.september)},
            {'month': 'Oct', 'value': float(self.october)},
            {'month': 'Nov', 'value': float(self.november)},
            {'month': 'Dec', 'value': float(self.december)},
        ]
    
    def validate_distribution(self):
        """Ensure distribution totals to 100%"""
        total = (self.january + self.february + self.march + self.april + 
                self.may + self.june + self.july + self.august + 
                self.september + self.october + self.november + self.december)
        return abs(total - 100) < 0.01  # Allow for small floating point errors


class BudgetAlert(models.Model):
    """Budget alerts and notifications"""
    
    class AlertType(models.TextChoices):
        VARIANCE = 'variance', 'Variance Alert'
        APPROVAL = 'approval', 'Approval Required'
        DEADLINE = 'deadline', 'Deadline Alert'
        BUDGET_EXCEEDED = 'budget_exceeded', 'Budget Exceeded'
    
    yearly_budget = models.ForeignKey(YearlyBudget, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=AlertType.choices)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ], default='medium')
    
    # Alert status
    is_active = models.BooleanField(default=True)
    is_read = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='resolved_alerts')
    
    # Recipients
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='budget_alerts')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'budget_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['alert_type', 'severity']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.name}"
