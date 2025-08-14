from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import json


class NotificationTemplate(models.Model):
    """Template for different types of notifications"""
    
    class NotificationType(models.TextChoices):
        WORKFLOW_UPDATE = 'workflow_update', 'Workflow Update'
        BUDGET_ALERT = 'budget_alert', 'Budget Alert'
        STOCK_ALERT = 'stock_alert', 'Stock Alert'
        APPROVAL_REQUEST = 'approval_request', 'Approval Request'
        DEADLINE_REMINDER = 'deadline_reminder', 'Deadline Reminder'
        SYSTEM_UPDATE = 'system_update', 'System Update'
    
    class DeliveryMethod(models.TextChoices):
        EMAIL = 'email', 'Email'
        IN_APP = 'in_app', 'In-App'
        BOTH = 'both', 'Both'
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    subject_template = models.CharField(max_length=255, help_text="Subject line template with variables")
    body_template = models.TextField(help_text="Body template with variables")
    
    # Delivery settings
    delivery_method = models.CharField(max_length=10, choices=DeliveryMethod.choices, default='both')
    is_active = models.BooleanField(default=True)
    
    # Variables documentation
    available_variables = models.JSONField(default=list, help_text="List of available template variables")
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Notification(models.Model):
    """Individual notification instances"""
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        READ = 'read', 'Read'
        FAILED = 'failed', 'Failed'
    
    id = models.CharField(max_length=100, primary_key=True)
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, related_name='notifications')
    
    # Content (rendered from template)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    
    # Metadata
    priority = models.CharField(max_length=10, choices=Priority.choices, default='medium')
    status = models.CharField(max_length=10, choices=Status.choices, default='pending')
    
    # Context data
    context_data = models.JSONField(default=dict, help_text="Data used to render the template")
    
    # Related objects
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.CharField(max_length=100, blank=True)
    
    # Delivery tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    delivery_attempts = models.IntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['scheduled_for']),
            models.Index(fields=['related_object_type', 'related_object_id']),
        ]
    
    def __str__(self):
        return f"{self.subject} - {self.recipient.name}"
    
    def mark_as_read(self):
        if self.status != 'read':
            self.status = 'read'
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])


class NotificationPreference(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='notification_preferences')
    
    # General preferences
    email_notifications = models.BooleanField(default=True)
    in_app_notifications = models.BooleanField(default=True)
    
    # Workflow notifications
    workflow_submitted = models.BooleanField(default=True)
    workflow_approved = models.BooleanField(default=True)
    workflow_rejected = models.BooleanField(default=True)
    workflow_comments = models.BooleanField(default=True)
    
    # Budget notifications
    budget_alerts = models.BooleanField(default=True)
    budget_variance = models.BooleanField(default=True)
    budget_deadlines = models.BooleanField(default=True)
    
    # Stock notifications
    stock_alerts = models.BooleanField(default=True)
    stock_requests = models.BooleanField(default=True)
    
    # System notifications
    system_updates = models.BooleanField(default=True)
    maintenance_alerts = models.BooleanField(default=True)
    
    # Frequency settings
    digest_frequency = models.CharField(max_length=10, choices=[
        ('immediate', 'Immediate'),
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly')
    ], default='immediate')
    
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
    
    def __str__(self):
        return f"{self.user.name} Notification Preferences"


class NotificationDigest(models.Model):
    """Digest notifications for batch delivery"""
    
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notification_digests')
    digest_type = models.CharField(max_length=10, choices=[
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly')
    ])
    
    # Content
    subject = models.CharField(max_length=255)
    body = models.TextField()
    notification_count = models.IntegerField(default=0)
    
    # Include notifications
    notifications = models.ManyToManyField(Notification, related_name='digests')
    
    # Delivery tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    is_sent = models.BooleanField(default=False)
    
    # Period covered
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_digests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'digest_type']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.digest_type.title()} Digest for {self.user.name}"


class NotificationRule(models.Model):
    """Rules for automatic notification sending"""
    
    class TriggerEvent(models.TextChoices):
        WORKFLOW_STATE_CHANGE = 'workflow_state_change', 'Workflow State Change'
        BUDGET_VARIANCE = 'budget_variance', 'Budget Variance'
        STOCK_LOW = 'stock_low', 'Stock Low'
        DEADLINE_APPROACHING = 'deadline_approaching', 'Deadline Approaching'
        USER_ACTION = 'user_action', 'User Action'
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    trigger_event = models.CharField(max_length=25, choices=TriggerEvent.choices)
    
    # Conditions (stored as JSON for flexibility)
    conditions = models.JSONField(default=dict, help_text="Conditions that must be met")
    
    # Notification settings
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE)
    recipient_roles = models.JSONField(default=list, help_text="Roles to notify")
    specific_users = models.ManyToManyField('users.User', blank=True, 
                                          related_name='notification_rules')
    
    # Timing
    delay_minutes = models.IntegerField(default=0, help_text="Delay before sending")
    max_frequency_hours = models.IntegerField(default=24, 
                                            help_text="Minimum hours between same notifications")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_notification_rules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_rules'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_trigger_event_display()})"


class NotificationLog(models.Model):
    """Log of all notification processing for debugging"""
    
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    
    # Event details
    event_type = models.CharField(max_length=20, choices=[
        ('created', 'Created'),
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
        ('retried', 'Retried')
    ])
    
    message = models.TextField()
    metadata = models.JSONField(default=dict, help_text="Additional event data")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification', 'event_type']),
        ]
    
    def __str__(self):
        return f"{self.notification.id} - {self.event_type}"


class NotificationStats(models.Model):
    """Aggregated notification statistics"""
    
    date = models.DateField()
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notification_stats')
    
    # Daily counts
    total_sent = models.IntegerField(default=0)
    total_read = models.IntegerField(default=0)
    total_failed = models.IntegerField(default=0)
    
    # By type
    workflow_notifications = models.IntegerField(default=0)
    budget_notifications = models.IntegerField(default=0)
    stock_notifications = models.IntegerField(default=0)
    system_notifications = models.IntegerField(default=0)
    
    # Performance metrics
    average_read_time_minutes = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    read_rate_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_stats'
        unique_together = ['date', 'user']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.name} - {self.date}"
