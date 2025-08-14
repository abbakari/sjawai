from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
import json


class WorkflowItem(models.Model):
    """Workflow Item model matching frontend WorkflowItem interface"""
    
    class WorkflowType(models.TextChoices):
        SALES_BUDGET = 'sales_budget', 'Sales Budget'
        ROLLING_FORECAST = 'rolling_forecast', 'Rolling Forecast'
    
    class WorkflowState(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        IN_REVIEW = 'in_review', 'In Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        SENT_TO_SUPPLY_CHAIN = 'sent_to_supply_chain', 'Sent to Supply Chain'
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
    
    id = models.CharField(max_length=100, primary_key=True)
    type = models.CharField(max_length=20, choices=WorkflowType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Creator information
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_workflow_items')
    created_by_role = models.CharField(max_length=20)
    
    # Workflow state
    current_state = models.CharField(max_length=25, choices=WorkflowState.choices, default='draft')
    
    # Timestamps for different states
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='reviewed_workflow_items')
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='approved_workflow_items')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='rejected_workflow_items')
    rejected_at = models.DateTimeField(null=True, blank=True)
    sent_to_supply_chain_at = models.DateTimeField(null=True, blank=True)
    
    # Business data
    customers = models.JSONField(default=list, help_text="List of customer names")
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    year = models.CharField(max_length=4)
    priority = models.CharField(max_length=10, choices=Priority.choices, default='medium')
    
    # Data payloads (stored as JSON for flexibility)
    budget_data = models.JSONField(default=list, blank=True, help_text="YearlyBudgetData array")
    forecast_data = models.JSONField(default=list, blank=True, help_text="ForecastData array")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workflow_items'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['current_state', 'type']),
            models.Index(fields=['created_by', 'current_state']),
            models.Index(fields=['year', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_current_state_display()})"
    
    def save(self, *args, **kwargs):
        # Auto-calculate priority based on total value
        if self.total_value > 200000:
            self.priority = 'high'
        elif self.total_value > 100000:
            self.priority = 'medium'
        else:
            self.priority = 'low'
        
        super().save(*args, **kwargs)


class WorkflowComment(models.Model):
    """Workflow Comment model matching frontend WorkflowComment interface"""
    
    class CommentType(models.TextChoices):
        COMMENT = 'comment', 'Comment'
        APPROVAL = 'approval', 'Approval'
        REJECTION = 'rejection', 'Rejection'
        REQUEST_CHANGES = 'request_changes', 'Request Changes'
    
    id = models.CharField(max_length=100, primary_key=True)
    workflow_item = models.ForeignKey(WorkflowItem, on_delete=models.CASCADE, related_name='comments')
    
    # Comment details
    author = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='workflow_comments')
    author_role = models.CharField(max_length=20)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=CommentType.choices, default='comment')
    is_follow_back = models.BooleanField(default=False)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'workflow_comments'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['workflow_item', 'timestamp']),
            models.Index(fields=['author', 'type']),
        ]
    
    def __str__(self):
        return f"{self.workflow_item.title} - {self.author.name} ({self.type})"


class WorkflowNotification(models.Model):
    """Workflow Notification model matching frontend WorkflowNotification interface"""
    
    class NotificationType(models.TextChoices):
        APPROVAL = 'approval', 'Approval'
        REJECTION = 'rejection', 'Rejection'
        COMMENT = 'comment', 'Comment'
        FOLLOW_BACK = 'follow_back', 'Follow Back'
        SUPPLY_CHAIN_REQUEST = 'supply_chain_request', 'Supply Chain Request'
    
    id = models.CharField(max_length=100, primary_key=True)
    
    # Recipients
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='workflow_notifications')
    recipient_role = models.CharField(max_length=20)
    
    # Sender
    from_user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_workflow_notifications')
    from_role = models.CharField(max_length=20)
    
    # Notification content
    title = models.CharField(max_length=255)
    message = models.TextField()
    workflow_item = models.ForeignKey(WorkflowItem, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=25, choices=NotificationType.choices)
    
    # Status
    read = models.BooleanField(default=False)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'workflow_notifications'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['recipient', 'read']),
            models.Index(fields=['workflow_item', 'type']),
        ]
    
    def __str__(self):
        return f"{self.title} - To: {self.recipient.name}"


class WorkflowTemplate(models.Model):
    """Workflow templates for standardized processes"""
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    workflow_type = models.CharField(max_length=20, choices=WorkflowItem.WorkflowType.choices)
    
    # Template configuration
    default_approvers = models.JSONField(default=list, help_text="List of default approver roles")
    required_fields = models.JSONField(default=list, help_text="Required fields for this workflow")
    auto_approval_rules = models.JSONField(default=dict, help_text="Rules for automatic approval")
    
    # Notification settings
    notification_triggers = models.JSONField(default=dict, help_text="When to send notifications")
    escalation_rules = models.JSONField(default=dict, help_text="Escalation after time periods")
    
    # Access control
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workflow_templates'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_workflow_type_display()})"


class WorkflowRule(models.Model):
    """Workflow rules for automated processing"""
    
    class RuleType(models.TextChoices):
        AUTO_APPROVE = 'auto_approve', 'Auto Approve'
        ESCALATE = 'escalate', 'Escalate'
        NOTIFY = 'notify', 'Notify'
        REJECT = 'reject', 'Auto Reject'
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    rule_type = models.CharField(max_length=15, choices=RuleType.choices)
    
    # Rule conditions (stored as JSON for flexibility)
    conditions = models.JSONField(default=dict, help_text="Conditions to trigger this rule")
    actions = models.JSONField(default=dict, help_text="Actions to take when rule triggers")
    
    # Scope
    workflow_types = models.JSONField(default=list, help_text="Which workflow types this applies to")
    user_roles = models.JSONField(default=list, help_text="Which user roles this applies to")
    
    # Status
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=100, help_text="Lower numbers = higher priority")
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workflow_rules'
        ordering = ['priority', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class WorkflowHistory(models.Model):
    """Track workflow state changes for audit trail"""
    
    workflow_item = models.ForeignKey(WorkflowItem, on_delete=models.CASCADE, related_name='history')
    
    # State change details
    from_state = models.CharField(max_length=25, choices=WorkflowItem.WorkflowState.choices)
    to_state = models.CharField(max_length=25, choices=WorkflowItem.WorkflowState.choices)
    action = models.CharField(max_length=50)
    
    # Context
    changed_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    comment = models.TextField(blank=True)
    
    # Data snapshot (before change)
    data_snapshot = models.JSONField(default=dict, help_text="Workflow data before this change")
    
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'workflow_history'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['workflow_item', 'changed_at']),
        ]
    
    def __str__(self):
        return f"{self.workflow_item.title} - {self.from_state} → {self.to_state}"


class ApprovalMatrix(models.Model):
    """Define approval requirements based on various criteria"""
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    # Criteria for this approval matrix
    workflow_type = models.CharField(max_length=20, choices=WorkflowItem.WorkflowType.choices)
    min_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    max_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Approval requirements
    required_approvers = models.JSONField(default=list, help_text="List of required approver roles")
    approval_levels = models.JSONField(default=list, help_text="Sequential approval levels")
    
    # Business rules
    customer_types = models.JSONField(default=list, blank=True, help_text="Applicable customer types")
    departments = models.JSONField(default=list, blank=True, help_text="Applicable departments")
    
    # Time limits
    approval_deadline_hours = models.IntegerField(default=72, help_text="Hours to complete approval")
    escalation_hours = models.IntegerField(default=48, help_text="Hours before escalation")
    
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approval_matrices'
        ordering = ['min_value']
    
    def __str__(self):
        return f"{self.name} (${self.min_value:,.0f}+)"


class FollowBack(models.Model):
    """Track follow-back requests in workflows"""
    
    workflow_item = models.ForeignKey(WorkflowItem, on_delete=models.CASCADE, related_name='follow_backs')
    
    # Follow-back details
    requested_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='requested_follow_backs')
    assigned_to = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='assigned_follow_backs')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=WorkflowItem.Priority.choices, default='medium')
    
    # Status
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    response = models.TextField(blank=True)
    
    # Timestamps
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'follow_backs'
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['assigned_to', 'is_completed']),
            models.Index(fields=['workflow_item', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.workflow_item.title}"
