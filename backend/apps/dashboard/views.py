from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models import Q
import json
from datetime import datetime, timedelta

from apps.users.models import User
from apps.budgets.models import Budget
from apps.forecasts.models import Forecast


def login_view(request):
    """Enhanced login view with mobile optimization"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # AJAX login request
            user = authenticate(request, username=email, password=password)
            if user:
                auth_login(request, user)
                return JsonResponse({
                    'success': True,
                    'redirect': '/dashboard/'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or password.'
                }, status=400)
        else:
            # Regular form submission
            user = authenticate(request, username=email, password=password)
            if user:
                auth_login(request, user)
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid email or password.')
    
    context = {
        'page_title': 'Sign In',
        'debug': settings.DEBUG if hasattr('settings', 'DEBUG') else False
    }
    return render(request, 'auth/login.html', context)


def logout_view(request):
    """Logout view"""
    auth_logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('login')


@login_required
def dashboard_view(request):
    """Main dashboard view with role-based content"""
    user = request.user
    
    # Get stats data based on user role
    stats_data = get_user_stats(user)
    
    # Get quick actions based on user role
    quick_actions = get_user_quick_actions(user)
    
    context = {
        'stats_data': stats_data,
        'quick_actions': quick_actions,
        'last_refresh': timezone.now(),
        'page_title': 'Dashboard'
    }
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Return JSON for AJAX requests
        return JsonResponse({
            'html': render(request, 'dashboard/dashboard.html', context).content.decode(),
            'title': 'Dashboard - STMBudget'
        })
    
    return render(request, 'dashboard/dashboard.html', context)


@login_required
def sales_budget_view(request):
    """Sales budget management view"""
    user = request.user
    
    # Filter budgets based on user role
    if user.role == 'admin':
        budgets = Budget.objects.all()
    elif user.role == 'manager':
        budgets = Budget.objects.filter(department=user.department)
    else:
        budgets = Budget.objects.filter(created_by=user)
    
    context = {
        'budgets': budgets,
        'can_create': user.role in ['salesman', 'manager', 'admin'],
        'can_approve': user.role in ['manager', 'admin'],
        'page_title': 'Sales Budget'
    }
    
    return render(request, 'budget/sales_budget.html', context)


@login_required
def rolling_forecast_view(request):
    """Rolling forecast management view"""
    user = request.user
    
    # Filter forecasts based on user role
    if user.role == 'admin':
        forecasts = Forecast.objects.all()
    elif user.role == 'manager':
        forecasts = Forecast.objects.filter(department=user.department)
    else:
        forecasts = Forecast.objects.filter(created_by=user)
    
    context = {
        'forecasts': forecasts,
        'can_create': user.role in ['salesman', 'manager', 'admin'],
        'page_title': 'Rolling Forecast'
    }
    
    return render(request, 'forecast/rolling_forecast.html', context)


@login_required
def user_management_view(request):
    """User management view (admin only)"""
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    users = User.objects.all().order_by('-date_joined')
    
    # Handle search
    search_query = request.GET.get('search', '')
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(users, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'total_users': User.objects.count(),
        'page_title': 'User Management'
    }
    
    return render(request, 'admin/user_management.html', context)


@login_required
def approval_center_view(request):
    """Approval center view (manager and admin only)"""
    if request.user.role not in ['manager', 'admin']:
        return redirect('dashboard')
    
    user = request.user
    
    # Get pending approvals based on role
    if user.role == 'admin':
        pending_budgets = Budget.objects.filter(status='pending')
        pending_forecasts = Forecast.objects.filter(status='pending')
    else:
        pending_budgets = Budget.objects.filter(
            status='pending',
            department=user.department
        )
        pending_forecasts = Forecast.objects.filter(
            status='pending',
            department=user.department
        )
    
    context = {
        'pending_budgets': pending_budgets,
        'pending_forecasts': pending_forecasts,
        'total_pending': pending_budgets.count() + pending_forecasts.count(),
        'page_title': 'Approval Center'
    }
    
    return render(request, 'approval/approval_center.html', context)


@login_required
def inventory_management_view(request):
    """Inventory management view (supply chain and admin only)"""
    if request.user.role not in ['supply_chain', 'admin']:
        return redirect('dashboard')
    
    context = {
        'can_manage_all': request.user.role == 'admin',
        'page_title': 'Inventory Management'
    }
    
    return render(request, 'inventory/inventory_management.html', context)


@login_required
def distribution_management_view(request):
    """Distribution management view (supply chain and admin only)"""
    if request.user.role not in ['supply_chain', 'admin']:
        return redirect('dashboard')
    
    context = {
        'can_manage_all': request.user.role == 'admin',
        'page_title': 'Distribution Management'
    }
    
    return render(request, 'distribution/distribution_management.html', context)


@login_required
def admin_panel_view(request):
    """Admin panel view (admin only)"""
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    # Get system statistics
    total_users = User.objects.count()
    total_budgets = Budget.objects.count()
    total_forecasts = Forecast.objects.count()
    
    recent_users = User.objects.order_by('-date_joined')[:5]
    
    context = {
        'total_users': total_users,
        'total_budgets': total_budgets,
        'total_forecasts': total_forecasts,
        'recent_users': recent_users,
        'page_title': 'Admin Panel'
    }
    
    return render(request, 'admin/admin_panel.html', context)


# API Views for AJAX functionality
@login_required
@require_http_methods(["GET"])
def api_recent_activity(request):
    """API endpoint for recent activity"""
    # Mock recent activity data
    activities = [
        {
            'title': 'Budget report generated',
            'time': '2 minutes ago',
            'color': 'blue',
            'icon': '<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 01-1-1V9a1 1 0 10-2 0v3a1 1 0 01-1 1H6a1 1 0 100 2h8a1 1 0 100-2z" clip-rule="evenodd"></path>'
        },
        {
            'title': 'New sales forecast approved',
            'time': '15 minutes ago',
            'color': 'green',
            'icon': '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>'
        },
        {
            'title': 'Stock alert: Low inventory',
            'time': '1 hour ago',
            'color': 'orange',
            'icon': '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
        }
    ]
    
    return JsonResponse({'activities': activities})


@login_required
@require_http_methods(["POST"])
def api_refresh_data(request):
    """API endpoint for data refresh"""
    try:
        # Simulate data refresh
        stats_data = get_user_stats(request.user)
        
        return JsonResponse({
            'success': True,
            'stats': stats_data,
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def get_user_stats(user):
    """Get statistics data based on user role"""
    stats_data = []
    
    if user.role == 'admin':
        stats_data = [
            {
                'title': 'Total System Users',
                'value': '24',
                'subtitle': 'Active users',
                'color': 'blue',
                'trend': {'value': '+3 new', 'is_positive': True},
                'icon_svg': '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>'
            },
            {
                'title': 'Total Sales',
                'value': '$2.4M',
                'subtitle': 'All regions',
                'color': 'green',
                'trend': {'value': '+18.2%', 'is_positive': True},
                'icon_svg': '<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>'
            },
            {
                'title': 'System Performance',
                'value': '99.2%',
                'subtitle': 'Uptime',
                'color': 'purple',
                'trend': {'value': '+0.1%', 'is_positive': True},
                'icon_svg': '<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
            },
            {
                'title': 'Budget Utilization',
                'value': '87%',
                'subtitle': 'Organization wide',
                'color': 'orange',
                'trend': {'value': '+5%', 'is_positive': True},
                'icon_svg': '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>'
            }
        ]
    elif user.role == 'salesman':
        stats_data = [
            {
                'title': 'My Sales',
                'value': '$156K',
                'subtitle': 'This month',
                'color': 'blue',
                'trend': {'value': '+12.5%', 'is_positive': True},
                'icon_svg': '<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>'
            },
            {
                'title': 'Stock Requests',
                'value': '8',
                'subtitle': '3 pending review',
                'color': 'green',
                'trend': {'value': '+2 approved', 'is_positive': True},
                'icon_svg': '<path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 112 0v6a1 1 0 11-2 0V9zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" clip-rule="evenodd"></path>'
            },
            {
                'title': 'My Budget',
                'value': '$45K',
                'subtitle': 'Remaining',
                'color': 'purple',
                'trend': {'value': '-$12K', 'is_positive': False},
                'icon_svg': '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>'
            },
            {
                'title': 'Stock Alerts',
                'value': '5',
                'subtitle': 'Active alerts',
                'color': 'orange',
                'trend': {'value': '2 critical', 'is_positive': False},
                'icon_svg': '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
            }
        ]
    # Add more role-specific stats...
    
    return stats_data


def get_user_quick_actions(user):
    """Get quick actions based on user role"""
    actions = []
    
    if user.role == 'admin':
        actions = [
            {
                'title': 'User Management',
                'description': 'Manage system users',
                'url': '/user-management/',
                'color': 'blue',
                'icon_svg': '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>'
            },
            {
                'title': 'System Reports',
                'description': 'View system analytics',
                'url': '/admin-panel/',
                'color': 'green',
                'icon_svg': '<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>'
            }
        ]
    elif user.role == 'salesman':
        actions = [
            {
                'title': 'My Budget',
                'description': 'Manage personal budget',
                'url': '/sales-budget/',
                'color': 'blue',
                'icon_svg': '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>'
            },
            {
                'title': 'My Forecast',
                'description': 'Create sales forecast',
                'url': '/rolling-forecast/',
                'color': 'purple',
                'icon_svg': '<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>'
            }
        ]
    # Add more role-specific actions...
    
    return actions
