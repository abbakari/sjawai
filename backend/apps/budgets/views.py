"""
Django Budget Views
Views for the budget management module
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from django.core.paginator import Paginator
import json
import logging
from datetime import datetime, timedelta
from .models import Budget
from apps.users.models import User

logger = logging.getLogger(__name__)

class SalesBudgetView(LoginRequiredMixin, TemplateView):
    """Sales Budget management view"""
    template_name = 'budget/sales_budget.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Get user's budget data
        user_budgets = self.get_user_budgets(user)
        
        # Calculate statistics
        stats = self.calculate_budget_stats(user_budgets)
        
        # Get available filters
        filters = self.get_filter_options(user_budgets)
        
        context.update({
            'user_budgets': user_budgets,
            'budget_stats': stats,
            'filter_options': filters,
            'available_years': self.get_available_years(),
            'current_year': datetime.now().year,
            'user_role': getattr(user, 'role', 'user'),
            'page_title': 'Sales Budget Management',
            'breadcrumb': [
                {'name': 'Dashboard', 'url': '/dashboard/'},
                {'name': 'Sales Budget', 'url': '/sales-budget/'}
            ]
        })
        
        return context
    
    def get_user_budgets(self, user):
        """Get budget data based on user role"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            # Admin can see all budgets
            budgets = Budget.objects.all()
        elif role == 'manager':
            # Manager can see department budgets
            department = getattr(user, 'department', None)
            if department:
                budgets = Budget.objects.filter(
                    Q(created_by__department=department) | Q(created_by=user)
                )
            else:
                budgets = Budget.objects.filter(created_by=user)
        else:
            # Regular users see only their own budgets
            budgets = Budget.objects.filter(created_by=user)
        
        return budgets.order_by('-updated_at')
    
    def calculate_budget_stats(self, budgets):
        """Calculate budget statistics"""
        current_year = datetime.now().year
        
        # Get current year budgets
        current_budgets = budgets.filter(year=current_year)
        
        total_budget = current_budgets.aggregate(
            total=Sum('budget_amount')
        )['total'] or 0
        
        total_actual = current_budgets.aggregate(
            total=Sum('actual_amount')
        )['total'] or 0
        
        total_items = current_budgets.count()
        
        variance = 0
        if total_budget > 0:
            variance = ((total_actual - total_budget) / total_budget) * 100
        
        return {
            'total_budget': total_budget,
            'total_actual': total_actual,
            'total_items': total_items,
            'variance': round(variance, 1),
            'variance_amount': total_actual - total_budget
        }
    
    def get_filter_options(self, budgets):
        """Get filter options for dropdowns"""
        customers = budgets.values_list('customer', flat=True).distinct()
        categories = budgets.values_list('category', flat=True).distinct()
        brands = budgets.values_list('brand', flat=True).distinct()
        items = budgets.values_list('item', flat=True).distinct()
        
        return {
            'customers': sorted([c for c in customers if c]),
            'categories': sorted([c for c in categories if c]),
            'brands': sorted([b for b in brands if b]),
            'items': sorted([i for i in items if i])
        }
    
    def get_available_years(self):
        """Get available years for budget planning"""
        current_year = datetime.now().year
        return list(range(current_year - 2, current_year + 5))

class BudgetAllocationView(LoginRequiredMixin, TemplateView):
    """Budget allocation view for admins"""
    template_name = 'budget/budget_allocation.html'

# API Views
class BudgetListAPI(LoginRequiredMixin, TemplateView):
    """API to get budget list"""
    
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            role = getattr(user, 'role', 'user')
            
            # Get budgets based on user role
            if role == 'admin':
                budgets = Budget.objects.all()
            elif role == 'manager':
                department = getattr(user, 'department', None)
                if department:
                    budgets = Budget.objects.filter(
                        Q(created_by__department=department) | Q(created_by=user)
                    )
                else:
                    budgets = Budget.objects.filter(created_by=user)
            else:
                budgets = Budget.objects.filter(created_by=user)
            
            # Apply filters
            customer = request.GET.get('customer')
            category = request.GET.get('category')
            brand = request.GET.get('brand')
            year = request.GET.get('year')
            
            if customer:
                budgets = budgets.filter(customer__icontains=customer)
            if category:
                budgets = budgets.filter(category__icontains=category)
            if brand:
                budgets = budgets.filter(brand__icontains=brand)
            if year:
                budgets = budgets.filter(year=year)
            
            # Paginate
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 50))
            
            paginator = Paginator(budgets, per_page)
            page_obj = paginator.get_page(page)
            
            # Serialize data
            budget_data = []
            for budget in page_obj:
                budget_data.append({
                    'id': budget.id,
                    'customer': budget.customer,
                    'item': budget.item,
                    'category': budget.category,
                    'brand': budget.brand,
                    'yearlyBudgets': {
                        str(budget.year): budget.budget_amount
                    },
                    'yearlyActuals': {
                        str(budget.year): budget.actual_amount
                    },
                    'rate': float(budget.rate) if budget.rate else 0,
                    'stock': budget.stock_quantity or 0,
                    'git': budget.git_quantity or 0,
                    'discount': float(budget.discount_percentage) if budget.discount_percentage else 0,
                    'status': budget.status,
                    'created_at': budget.created_at.isoformat(),
                    'updated_at': budget.updated_at.isoformat()
                })
            
            return JsonResponse({
                'success': True,
                'budgets': budget_data,
                'pagination': {
                    'current_page': page_obj.number,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Error in BudgetListAPI: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to load budget data'
            }, status=500)

class BudgetCreateAPI(LoginRequiredMixin, TemplateView):
    """API to create new budget"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            
            budget = Budget.objects.create(
                customer=data.get('customer'),
                item=data.get('item'),
                category=data.get('category'),
                brand=data.get('brand'),
                year=data.get('year', datetime.now().year),
                budget_amount=data.get('budget_amount', 0),
                actual_amount=data.get('actual_amount', 0),
                rate=data.get('rate', 0),
                stock_quantity=data.get('stock_quantity', 0),
                git_quantity=data.get('git_quantity', 0),
                discount_percentage=data.get('discount_percentage', 0),
                created_by=request.user,
                status='draft'
            )
            
            return JsonResponse({
                'success': True,
                'budget': {
                    'id': budget.id,
                    'customer': budget.customer,
                    'item': budget.item,
                    'category': budget.category,
                    'brand': budget.brand,
                    'year': budget.year,
                    'budget_amount': float(budget.budget_amount),
                    'actual_amount': float(budget.actual_amount),
                    'rate': float(budget.rate),
                    'stock_quantity': budget.stock_quantity,
                    'git_quantity': budget.git_quantity,
                    'discount_percentage': float(budget.discount_percentage),
                    'status': budget.status
                },
                'message': 'Budget item created successfully'
            })
            
        except Exception as e:
            logger.error(f"Error creating budget: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to create budget item'
            }, status=500)

class BudgetDetailAPI(LoginRequiredMixin, TemplateView):
    """API to get, update, or delete specific budget"""
    
    def get(self, request, budget_id, *args, **kwargs):
        try:
            budget = get_object_or_404(Budget, id=budget_id)
            
            # Check permissions
            if not self.can_access_budget(request.user, budget):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            return JsonResponse({
                'success': True,
                'budget': {
                    'id': budget.id,
                    'customer': budget.customer,
                    'item': budget.item,
                    'category': budget.category,
                    'brand': budget.brand,
                    'year': budget.year,
                    'budget_amount': float(budget.budget_amount),
                    'actual_amount': float(budget.actual_amount),
                    'rate': float(budget.rate),
                    'stock_quantity': budget.stock_quantity,
                    'git_quantity': budget.git_quantity,
                    'discount_percentage': float(budget.discount_percentage),
                    'status': budget.status,
                    'created_at': budget.created_at.isoformat(),
                    'updated_at': budget.updated_at.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting budget {budget_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to load budget'
            }, status=500)
    
    def put(self, request, budget_id, *args, **kwargs):
        try:
            budget = get_object_or_404(Budget, id=budget_id)
            
            # Check permissions
            if not self.can_modify_budget(request.user, budget):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            data = json.loads(request.body)
            
            # Update budget fields
            if 'customer' in data:
                budget.customer = data['customer']
            if 'item' in data:
                budget.item = data['item']
            if 'category' in data:
                budget.category = data['category']
            if 'brand' in data:
                budget.brand = data['brand']
            if 'budget_amount' in data:
                budget.budget_amount = data['budget_amount']
            if 'actual_amount' in data:
                budget.actual_amount = data['actual_amount']
            if 'rate' in data:
                budget.rate = data['rate']
            if 'stock_quantity' in data:
                budget.stock_quantity = data['stock_quantity']
            if 'git_quantity' in data:
                budget.git_quantity = data['git_quantity']
            if 'discount_percentage' in data:
                budget.discount_percentage = data['discount_percentage']
            
            budget.updated_at = timezone.now()
            budget.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Budget updated successfully'
            })
            
        except Exception as e:
            logger.error(f"Error updating budget {budget_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to update budget'
            }, status=500)
    
    def delete(self, request, budget_id, *args, **kwargs):
        try:
            budget = get_object_or_404(Budget, id=budget_id)
            
            # Check permissions
            if not self.can_modify_budget(request.user, budget):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            budget.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Budget deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Error deleting budget {budget_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to delete budget'
            }, status=500)
    
    def can_access_budget(self, user, budget):
        """Check if user can access this budget"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager':
            # Managers can access budgets from their department
            user_dept = getattr(user, 'department', None)
            budget_user_dept = getattr(budget.created_by, 'department', None)
            return user_dept == budget_user_dept or budget.created_by == user
        else:
            # Regular users can only access their own budgets
            return budget.created_by == user
    
    def can_modify_budget(self, user, budget):
        """Check if user can modify this budget"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager' and budget.status in ['draft', 'submitted']:
            # Managers can modify drafts and submitted budgets from their department
            user_dept = getattr(user, 'department', None)
            budget_user_dept = getattr(budget.created_by, 'department', None)
            return user_dept == budget_user_dept
        else:
            # Regular users can only modify their own draft budgets
            return budget.created_by == user and budget.status == 'draft'
