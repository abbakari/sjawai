"""
Custom context processors for STMBudget Django app
These replace the React contexts and provide global state management
"""
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from apps.users.models import User
from apps.budgets.models import Budget
from apps.forecasts.models import Forecast
import json


def user_context(request):
    """
    Provides user context data (replaces AuthContext from React)
    """
    context = {
        'current_user': request.user if request.user.is_authenticated else None,
        'user_role': getattr(request.user, 'role', None) if request.user.is_authenticated else None,
        'user_department': getattr(request.user, 'department', None) if request.user.is_authenticated else None,
        'user_permissions': get_user_permissions(request.user) if request.user.is_authenticated else [],
    }
    return context


def budget_context(request):
    """
    Provides budget context data (replaces BudgetContext from React)
    """
    if not request.user.is_authenticated:
        return {}
    
    user = request.user
    context = {}
    
    try:
        # Get user-specific budgets based on role
        if user.role == 'admin':
            user_budgets = Budget.objects.all()
        elif user.role == 'manager':
            user_budgets = Budget.objects.filter(department=user.department)
        else:
            user_budgets = Budget.objects.filter(created_by=user)
        
        context.update({
            'user_budgets': user_budgets[:5],  # Limit for performance
            'budget_summary': get_budget_summary(user, user_budgets),
            'pending_budget_approvals': user_budgets.filter(status='pending').count() if user.role in ['manager', 'admin'] else 0,
        })
    except Exception as e:
        # Handle gracefully if Budget model doesn't exist yet
        context.update({
            'user_budgets': [],
            'budget_summary': {},
            'pending_budget_approvals': 0,
        })
    
    return context


def stock_context(request):
    """
    Provides stock/inventory context data (replaces StockContext from React)
    """
    if not request.user.is_authenticated:
        return {}
    
    context = {
        'stock_alerts': get_stock_alerts(request.user),
        'inventory_summary': get_inventory_summary(request.user),
        'low_stock_items': get_low_stock_items(request.user),
    }
    return context


def workflow_context(request):
    """
    Provides workflow context data (replaces WorkflowContext from React)
    """
    if not request.user.is_authenticated:
        return {}
    
    context = {
        'pending_approvals': get_pending_approvals(request.user),
        'recent_activities': get_recent_activities(request.user),
        'workflow_stats': get_workflow_stats(request.user),
    }
    return context


def app_settings_context(request):
    """
    Provides global app settings and configuration
    """
    context = {
        'app_version': getattr(settings, 'STM_BUDGET_VERSION', '2.0.0'),
        'app_company': getattr(settings, 'STM_BUDGET_COMPANY', 'STM Group'),
        'debug_mode': settings.DEBUG,
        'static_url': settings.STATIC_URL,
        'media_url': settings.MEDIA_URL,
    }
    return context


def navigation_context(request):
    """
    Provides navigation context based on user role and permissions
    """
    if not request.user.is_authenticated:
        return {}
    
    navigation_items = get_navigation_items(request.user)
    
    context = {
        'navigation_items': navigation_items,
        'breadcrumbs': get_breadcrumbs(request),
        'quick_actions': get_quick_actions(request.user),
    }
    return context


# Helper functions

def get_user_permissions(user):
    """Get user permissions based on role"""
    permissions = []
    
    if user.role == 'admin':
        permissions = [
            'view_all_data',
            'manage_users',
            'approve_budgets',
            'approve_forecasts',
            'manage_system',
            'view_reports',
            'manage_inventory',
        ]
    elif user.role == 'manager':
        permissions = [
            'view_department_data',
            'approve_budgets',
            'approve_forecasts',
            'view_reports',
            'manage_team',
        ]
    elif user.role == 'salesman':
        permissions = [
            'view_own_data',
            'create_budgets',
            'create_forecasts',
            'request_stock',
        ]
    elif user.role == 'supply_chain':
        permissions = [
            'manage_inventory',
            'view_stock_data',
            'manage_distribution',
            'approve_stock_requests',
        ]
    
    return permissions


def get_budget_summary(user, budgets):
    """Get budget summary statistics"""
    try:
        total_budget = sum(float(b.amount or 0) for b in budgets)
        approved_budgets = budgets.filter(status='approved').count()
        pending_budgets = budgets.filter(status='pending').count()
        
        return {
            'total_amount': total_budget,
            'total_count': budgets.count(),
            'approved_count': approved_budgets,
            'pending_count': pending_budgets,
            'utilization_rate': 87.5,  # Mock data
        }
    except:
        return {
            'total_amount': 0,
            'total_count': 0,
            'approved_count': 0,
            'pending_count': 0,
            'utilization_rate': 0,
        }


def get_stock_alerts(user):
    """Get stock alerts for user"""
    # Mock data for now
    return [
        {
            'id': 1,
            'item': 'BF GOODRICH TYRE 235/85R16',
            'current_stock': 5,
            'minimum_stock': 20,
            'priority': 'high',
            'days_until_stockout': 3,
        },
        {
            'id': 2,
            'item': 'MICHELIN TYRE 265/65R17',
            'current_stock': 15,
            'minimum_stock': 30,
            'priority': 'medium',
            'days_until_stockout': 7,
        },
    ]


def get_inventory_summary(user):
    """Get inventory summary"""
    return {
        'total_items': 1247,
        'low_stock_items': 23,
        'out_of_stock_items': 5,
        'total_value': 1250000,
    }


def get_low_stock_items(user):
    """Get low stock items"""
    return []


def get_pending_approvals(user):
    """Get pending approvals for user"""
    if user.role not in ['manager', 'admin']:
        return []
    
    # Mock data
    return [
        {
            'type': 'budget',
            'id': 1,
            'title': 'Q1 Sales Budget',
            'submitted_by': 'John Doe',
            'amount': 50000,
            'submitted_date': '2024-01-15',
        },
        {
            'type': 'forecast',
            'id': 2,
            'title': 'March Forecast',
            'submitted_by': 'Jane Smith',
            'amount': 75000,
            'submitted_date': '2024-01-16',
        },
    ]


def get_recent_activities(user):
    """Get recent activities"""
    return [
        {
            'title': 'Budget report generated',
            'time': '2 minutes ago',
            'type': 'success',
        },
        {
            'title': 'New sales forecast approved',
            'time': '15 minutes ago',
            'type': 'info',
        },
        {
            'title': 'Stock alert: Low inventory',
            'time': '1 hour ago',
            'type': 'warning',
        },
    ]


def get_workflow_stats(user):
    """Get workflow statistics"""
    return {
        'completed_tasks': 45,
        'pending_tasks': 12,
        'overdue_tasks': 3,
        'completion_rate': 78.9,
    }


def get_navigation_items(user):
    """Get navigation items based on user role"""
    items = [
        {
            'name': 'Dashboard',
            'url': '/dashboard/',
            'icon': 'dashboard',
            'active': True,
        }
    ]
    
    if user.role in ['salesman', 'manager', 'admin']:
        items.append({
            'name': 'Budget',
            'url': '/sales-budget/',
            'icon': 'budget',
            'active': False,
        })
        items.append({
            'name': 'Forecast',
            'url': '/rolling-forecast/',
            'icon': 'forecast',
            'active': False,
        })
    
    if user.role in ['manager', 'admin']:
        items.append({
            'name': 'Approvals',
            'url': '/approval-center/',
            'icon': 'approvals',
            'active': False,
        })
    
    if user.role in ['supply_chain', 'admin']:
        items.append({
            'name': 'Inventory',
            'url': '/inventory-management/',
            'icon': 'inventory',
            'active': False,
        })
    
    if user.role == 'admin':
        items.append({
            'name': 'Admin',
            'url': '/admin-panel/',
            'icon': 'admin',
            'active': False,
        })
    
    return items


def get_breadcrumbs(request):
    """Generate breadcrumbs based on current path"""
    path = request.path
    breadcrumbs = [{'name': 'Home', 'url': '/dashboard/'}]
    
    if path.startswith('/sales-budget/'):
        breadcrumbs.append({'name': 'Sales Budget', 'url': '/sales-budget/'})
    elif path.startswith('/rolling-forecast/'):
        breadcrumbs.append({'name': 'Rolling Forecast', 'url': '/rolling-forecast/'})
    elif path.startswith('/admin-panel/'):
        breadcrumbs.append({'name': 'Admin Panel', 'url': '/admin-panel/'})
    elif path.startswith('/user-management/'):
        breadcrumbs.extend([
            {'name': 'Admin Panel', 'url': '/admin-panel/'},
            {'name': 'User Management', 'url': '/user-management/'}
        ])
    
    return breadcrumbs


def get_quick_actions(user):
    """Get quick actions based on user role"""
    actions = []
    
    if user.role == 'admin':
        actions = [
            {'name': 'Manage Users', 'url': '/user-management/', 'icon': 'users'},
            {'name': 'System Reports', 'url': '/admin-panel/', 'icon': 'reports'},
        ]
    elif user.role == 'salesman':
        actions = [
            {'name': 'Create Budget', 'url': '/sales-budget/', 'icon': 'budget'},
            {'name': 'Create Forecast', 'url': '/rolling-forecast/', 'icon': 'forecast'},
        ]
    elif user.role == 'manager':
        actions = [
            {'name': 'Review Approvals', 'url': '/approval-center/', 'icon': 'approvals'},
            {'name': 'Team Reports', 'url': '/dashboard/', 'icon': 'reports'},
        ]
    
    return actions
