"""
Django Dashboard Views
Comprehensive view classes for the Django-based STMBudget application
"""
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.core.paginator import Paginator
import json
import logging
from datetime import datetime, timedelta
from apps.users.models import User
from apps.budgets.models import Budget
from apps.forecasts.models import Forecast

logger = logging.getLogger(__name__)

class DashboardView(LoginRequiredMixin, TemplateView):
    """Main dashboard view with role-based content"""
    template_name = 'dashboard/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Get role-specific stats
        stats_data = self.get_stats_data(user)
        quick_actions = self.get_quick_actions(user)
        
        context.update({
            'stats_data': stats_data,
            'quick_actions': quick_actions,
            'last_refresh': timezone.now(),
            'user_role_name': self.get_user_role_name(user.role if hasattr(user, 'role') else 'user'),
            'recent_activities': self.get_recent_activities(user),
            'notifications_count': self.get_notifications_count(user),
            'system_health': self.get_system_health(),
        })
        
        return context
    
    def get_stats_data(self, user):
        """Generate role-specific dashboard statistics"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return [
                {
                    'title': 'Total System Users',
                    'value': User.objects.count(),
                    'subtitle': 'Active users',
                    'icon_svg': self.get_icon_svg('users'),
                    'color': 'blue',
                    'trend': {'value': '+3 new', 'is_positive': True}
                },
                {
                    'title': 'Total Sales',
                    'value': '$2.4M',
                    'subtitle': 'All regions',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'green',
                    'trend': {'value': '+18.2%', 'is_positive': True}
                },
                {
                    'title': 'System Performance',
                    'value': '99.2%',
                    'subtitle': 'Uptime',
                    'icon_svg': self.get_icon_svg('target'),
                    'color': 'purple',
                    'trend': {'value': '+0.1%', 'is_positive': True}
                },
                {
                    'title': 'Budget Utilization',
                    'value': '87%',
                    'subtitle': 'Organization wide',
                    'icon_svg': self.get_icon_svg('chart'),
                    'color': 'orange',
                    'trend': {'value': '+5%', 'is_positive': True}
                }
            ]
        elif role == 'manager':
            return [
                {
                    'title': 'Department Sales',
                    'value': '$850K',
                    'subtitle': getattr(user, 'department', 'Department'),
                    'icon_svg': self.get_icon_svg('building'),
                    'color': 'blue',
                    'trend': {'value': '+15%', 'is_positive': True}
                },
                {
                    'title': 'Stock Reviews',
                    'value': '12',
                    'subtitle': 'Pending review',
                    'icon_svg': self.get_icon_svg('package'),
                    'color': 'green',
                    'trend': {'value': '3 critical', 'is_positive': False}
                },
                {
                    'title': 'Department Budget',
                    'value': '$245K',
                    'subtitle': 'Utilized',
                    'icon_svg': self.get_icon_svg('pie-chart'),
                    'color': 'purple',
                    'trend': {'value': '73%', 'is_positive': True}
                },
                {
                    'title': 'Team Requests',
                    'value': '28',
                    'subtitle': 'Total requests',
                    'icon_svg': self.get_icon_svg('alert-triangle'),
                    'color': 'orange',
                    'trend': {'value': '18 approved', 'is_positive': True}
                }
            ]
        elif role == 'salesman':
            return [
                {
                    'title': 'My Sales',
                    'value': '$156K',
                    'subtitle': 'This month',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'blue',
                    'trend': {'value': '+12.5%', 'is_positive': True}
                },
                {
                    'title': 'Stock Requests',
                    'value': '8',
                    'subtitle': '3 pending review',
                    'icon_svg': self.get_icon_svg('package'),
                    'color': 'green',
                    'trend': {'value': '+5 approved', 'is_positive': True}
                },
                {
                    'title': 'My Budget',
                    'value': '$45K',
                    'subtitle': 'Remaining',
                    'icon_svg': self.get_icon_svg('pie-chart'),
                    'color': 'purple',
                    'trend': {'value': '-$12K', 'is_positive': False}
                },
                {
                    'title': 'Stock Alerts',
                    'value': '5',
                    'subtitle': 'Active alerts',
                    'icon_svg': self.get_icon_svg('alert-triangle'),
                    'color': 'orange',
                    'trend': {'value': '2 critical', 'is_positive': False}
                }
            ]
        elif role == 'supply_chain':
            return [
                {
                    'title': 'Inventory Value',
                    'value': '$1.2M',
                    'subtitle': 'Current stock',
                    'icon_svg': self.get_icon_svg('package'),
                    'color': 'blue',
                    'trend': {'value': '+5%', 'is_positive': True}
                },
                {
                    'title': 'Stock Accuracy',
                    'value': '98.5%',
                    'subtitle': 'System vs actual',
                    'icon_svg': self.get_icon_svg('target'),
                    'color': 'green',
                    'trend': {'value': '+1.2%', 'is_positive': True}
                },
                {
                    'title': 'Orders Processed',
                    'value': '1,247',
                    'subtitle': 'This month',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'purple',
                    'trend': {'value': '+156', 'is_positive': True}
                },
                {
                    'title': 'Low Stock Items',
                    'value': '23',
                    'subtitle': 'Need attention',
                    'icon_svg': self.get_icon_svg('alert-triangle'),
                    'color': 'orange',
                    'trend': {'value': '-5', 'is_positive': True}
                }
            ]
        else:
            return [
                {
                    'title': 'Total Budget Units',
                    'value': '5,042',
                    'subtitle': 'As of current year',
                    'icon_svg': self.get_icon_svg('pie-chart'),
                    'color': 'blue',
                    'trend': {'value': '+12.5%', 'is_positive': True}
                },
                {
                    'title': 'Total Sales',
                    'value': '$2.4M',
                    'subtitle': 'Current performance',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'green',
                    'trend': {'value': '+18.2%', 'is_positive': True}
                },
                {
                    'title': 'Target Achievement',
                    'value': '87%',
                    'subtitle': 'Monthly progress',
                    'icon_svg': self.get_icon_svg('target'),
                    'color': 'orange',
                    'trend': {'value': '+5.3%', 'is_positive': True}
                },
                {
                    'title': 'Active Users',
                    'value': '45',
                    'subtitle': 'System users',
                    'icon_svg': self.get_icon_svg('clock'),
                    'color': 'purple',
                    'trend': {'value': '+2', 'is_positive': True}
                }
            ]
    
    def get_quick_actions(self, user):
        """Generate role-specific quick actions"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return [
                {
                    'title': 'User Management',
                    'description': 'Manage system users',
                    'url': '/user-management/',
                    'icon_svg': self.get_icon_svg('users'),
                    'color': 'blue'
                },
                {
                    'title': 'System Reports',
                    'description': 'View system analytics',
                    'url': '/reports/',
                    'icon_svg': self.get_icon_svg('chart'),
                    'color': 'green'
                },
                {
                    'title': 'Global Targets',
                    'description': 'Set organization goals',
                    'url': '/budget-allocation/',
                    'icon_svg': self.get_icon_svg('target'),
                    'color': 'purple'
                },
                {
                    'title': 'Advanced Admin',
                    'description': 'Comprehensive system management',
                    'url': '/advanced-admin/',
                    'icon_svg': self.get_icon_svg('settings'),
                    'color': 'gray'
                }
            ]
        elif role == 'manager':
            return [
                {
                    'title': 'Department Budget',
                    'description': 'Manage department finances',
                    'url': '/sales-budget/',
                    'icon_svg': self.get_icon_svg('building'),
                    'color': 'blue'
                },
                {
                    'title': 'Team Performance',
                    'description': 'Monitor team progress',
                    'url': '/reports/',
                    'icon_svg': self.get_icon_svg('users'),
                    'color': 'green'
                },
                {
                    'title': 'Approval Center',
                    'description': 'Review submissions',
                    'url': '/approval-center/',
                    'icon_svg': self.get_icon_svg('check-circle'),
                    'color': 'purple'
                }
            ]
        elif role == 'salesman':
            return [
                {
                    'title': 'My Budget',
                    'description': 'Manage personal budget',
                    'url': '/sales-budget/',
                    'icon_svg': self.get_icon_svg('pie-chart'),
                    'color': 'blue'
                },
                {
                    'title': 'Sales Tracking',
                    'description': 'Track my sales progress',
                    'url': '/reports/',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'green'
                },
                {
                    'title': 'My Forecast',
                    'description': 'Create sales forecast',
                    'url': '/rolling-forecast/',
                    'icon_svg': self.get_icon_svg('chart'),
                    'color': 'purple'
                }
            ]
        elif role == 'supply_chain':
            return [
                {
                    'title': 'Inventory Management',
                    'description': 'Manage stock levels',
                    'url': '/inventory-management/',
                    'icon_svg': self.get_icon_svg('package'),
                    'color': 'blue'
                },
                {
                    'title': 'Stock Analytics',
                    'description': 'Analyze inventory trends',
                    'url': '/reports/',
                    'icon_svg': self.get_icon_svg('trending-up'),
                    'color': 'green'
                },
                {
                    'title': 'Distribution',
                    'description': 'Manage distribution',
                    'url': '/distribution-management/',
                    'icon_svg': self.get_icon_svg('truck'),
                    'color': 'purple'
                }
            ]
        else:
            return [
                {
                    'title': 'My Budget',
                    'description': 'View budget information',
                    'url': '/sales-budget/',
                    'icon_svg': self.get_icon_svg('pie-chart'),
                    'color': 'blue'
                },
                {
                    'title': 'Reports',
                    'description': 'View available reports',
                    'url': '/reports/',
                    'icon_svg': self.get_icon_svg('chart'),
                    'color': 'green'
                }
            ]
    
    def get_icon_svg(self, icon_name):
        """Return SVG path for icons"""
        icons = {
            'users': '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>',
            'trending-up': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>',
            'target': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
            'chart': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
            'building': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>',
            'package': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>',
            'pie-chart': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>',
            'alert-triangle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
            'clock': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
            'check-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
            'settings': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>',
            'truck': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>'
        }
        return icons.get(icon_name, '')
    
    def get_user_role_name(self, role):
        """Convert role code to display name"""
        role_names = {
            'admin': 'Administrator',
            'manager': 'Manager',
            'salesman': 'Sales Representative',
            'supply_chain': 'Supply Chain Manager',
            'user': 'User'
        }
        return role_names.get(role, 'User')
    
    def get_recent_activities(self, user):
        """Get recent activities for the user"""
        # This would typically fetch from an activity log model
        return [
            {
                'title': 'Budget report generated',
                'time': '2 minutes ago',
                'icon': 'document',
                'color': 'blue'
            },
            {
                'title': 'New sales forecast approved',
                'time': '15 minutes ago',
                'icon': 'check',
                'color': 'green'
            }
        ]
    
    def get_notifications_count(self, user):
        """Get count of unread notifications"""
        # This would typically query a notifications model
        return 3
    
    def get_system_health(self):
        """Get system health metrics"""
        return {
            'status': 'healthy',
            'uptime': '99.2%',
            'active_users': 24,
            'response_time': '120ms'
        }

class ApprovalCenterView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/approval_center.html'

class AdvancedAdminView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/advanced_admin.html'

class InventoryManagementView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/inventory_management.html'

class DistributionManagementView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/distribution_management.html'

class BiDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/bi_dashboard.html'

# API Views for AJAX calls
class DashboardStatsAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for dashboard statistics"""
    
    def get(self, request, *args, **kwargs):
        user = request.user
        dashboard_view = DashboardView()
        stats_data = dashboard_view.get_stats_data(user)
        
        return JsonResponse({
            'success': True,
            'data': stats_data,
            'timestamp': timezone.now().isoformat()
        })

class RecentActivityAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for recent activities"""
    
    def get(self, request, *args, **kwargs):
        user = request.user
        dashboard_view = DashboardView()
        activities = dashboard_view.get_recent_activities(user)
        
        return JsonResponse({
            'success': True,
            'activities': activities
        })

class QuickActionsAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for quick actions"""
    
    def get(self, request, *args, **kwargs):
        user = request.user
        dashboard_view = DashboardView()
        actions = dashboard_view.get_quick_actions(user)
        
        return JsonResponse({
            'success': True,
            'actions': actions
        })

class BudgetAllocationChartAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for budget allocation chart data"""
    
    def get(self, request, *args, **kwargs):
        data = [
            {'name': 'Marketing', 'value': 30, 'amount': 150000},
            {'name': 'Operations', 'value': 25, 'amount': 125000},
            {'name': 'Technology', 'value': 20, 'amount': 100000},
            {'name': 'Sales', 'value': 15, 'amount': 75000},
            {'name': 'HR', 'value': 10, 'amount': 50000}
        ]
        
        return JsonResponse({
            'success': True,
            'data': data
        })

class SalesTrendChartAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for sales trend chart data"""
    
    def get(self, request, *args, **kwargs):
        data = [
            {'month': 'Jan', 'sales': 120000, 'budget': 110000, 'forecast': 115000},
            {'month': 'Feb', 'sales': 135000, 'budget': 125000, 'forecast': 130000},
            {'month': 'Mar', 'sales': 148000, 'budget': 140000, 'forecast': 145000},
            {'month': 'Apr', 'sales': 162000, 'budget': 155000, 'forecast': 160000},
            {'month': 'May', 'sales': 178000, 'budget': 170000, 'forecast': 175000},
            {'month': 'Jun', 'sales': 195000, 'budget': 185000, 'forecast': 190000}
        ]
        
        return JsonResponse({
            'success': True,
            'data': data
        })

class PerformanceChartAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for performance chart data"""
    
    def get(self, request, *args, **kwargs):
        return JsonResponse({
            'success': True,
            'data': {
                'value': 87,
                'max': 100,
                'label': 'Performance Score'
            }
        })

class SystemHealthAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for system health"""
    
    def get(self, request, *args, **kwargs):
        return JsonResponse({
            'success': True,
            'health': {
                'status': 'healthy',
                'uptime': '99.2%',
                'active_users': User.objects.filter(is_active=True).count(),
                'response_time': '120ms',
                'last_updated': timezone.now().isoformat()
            }
        })

class SystemMetricsAPI(LoginRequiredMixin, TemplateView):
    """API endpoint for system metrics"""
    
    def get(self, request, *args, **kwargs):
        return JsonResponse({
            'success': True,
            'metrics': {
                'total_users': User.objects.count(),
                'active_sessions': 24,  # This would be calculated from session data
                'budget_records': 150,  # This would be from Budget model
                'forecast_records': 45,  # This would be from Forecast model
                'system_load': '23%',
                'memory_usage': '67%',
                'disk_usage': '45%'
            }
        })

# Error handlers
def custom_404(request, exception):
    return render(request, 'errors/404.html', status=404)

def custom_500(request):
    return render(request, 'errors/500.html', status=500)
