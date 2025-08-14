import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')

app = Celery('stm_budget')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery beat schedule for periodic tasks
app.conf.beat_schedule = {
    'send-notification-digests': {
        'task': 'apps.notifications.tasks.send_notification_digests',
        'schedule': 3600.0,  # Run every hour
    },
    'cleanup-old-sessions': {
        'task': 'apps.users.tasks.cleanup_old_sessions',
        'schedule': 86400.0,  # Run daily
    },
    'calculate-budget-variances': {
        'task': 'apps.budgets.tasks.calculate_budget_variances',
        'schedule': 21600.0,  # Run every 6 hours
    },
    'update-stock-alerts': {
        'task': 'apps.inventory.tasks.update_stock_alerts',
        'schedule': 1800.0,  # Run every 30 minutes
    },
    'process-workflow-escalations': {
        'task': 'apps.workflow.tasks.process_workflow_escalations',
        'schedule': 3600.0,  # Run every hour
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
