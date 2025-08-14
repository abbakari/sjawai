from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardMetrics(models.Model):
    """Dashboard metrics and KPIs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    metric_type = models.CharField(max_length=100)
    metric_name = models.CharField(max_length=200)
    metric_value = models.JSONField()
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboard_metrics'
        ordering = ['-created_at']


class DashboardWidget(models.Model):
    """User dashboard widget configuration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    widget_type = models.CharField(max_length=100)
    widget_config = models.JSONField()
    position = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboard_widgets'
        ordering = ['position']
