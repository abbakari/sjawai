from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Report(models.Model):
    """Generated reports"""
    REPORT_TYPES = [
        ('budget', 'Budget Report'),
        ('forecast', 'Forecast Report'),
        ('sales', 'Sales Report'),
        ('inventory', 'Inventory Report'),
        ('performance', 'Performance Report'),
    ]

    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    parameters = models.JSONField()
    file_path = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']


class ReportSchedule(models.Model):
    """Scheduled report generation"""
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=Report.REPORT_TYPES)
    schedule_expression = models.CharField(max_length=100)  # Cron expression
    recipients = models.JSONField()  # List of email addresses
    parameters = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report_schedules'
