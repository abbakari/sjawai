"""
Django Forecast Views
Views for the rolling forecast module
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
from datetime import datetime, timedelta, date
from calendar import monthrange
from .models import Forecast
from apps.users.models import User

logger = logging.getLogger(__name__)

class RollingForecastView(LoginRequiredMixin, TemplateView):
    """Rolling Forecast management view"""
    template_name = 'forecast/rolling_forecast.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Get user's forecast data
        user_forecasts = self.get_user_forecasts(user)
        
        # Calculate statistics
        stats = self.calculate_forecast_stats(user_forecasts)
        
        # Get available filters
        filters = self.get_filter_options(user_forecasts)
        
        # Get forecast period information
        period_info = self.get_forecast_period_info()
        
        context.update({
            'user_forecasts': user_forecasts,
            'forecast_stats': stats,
            'filter_options': filters,
            'period_info': period_info,
            'available_years': self.get_available_years(),
            'current_year': datetime.now().year,
            'current_month': datetime.now().month,
            'user_role': getattr(user, 'role', 'user'),
            'page_title': 'Rolling Forecast Management',
            'breadcrumb': [
                {'name': 'Dashboard', 'url': '/dashboard/'},
                {'name': 'Rolling Forecast', 'url': '/rolling-forecast/'}
            ]
        })
        
        return context
    
    def get_user_forecasts(self, user):
        """Get forecast data based on user role"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            # Admin can see all forecasts
            forecasts = Forecast.objects.all()
        elif role == 'manager':
            # Manager can see department forecasts
            department = getattr(user, 'department', None)
            if department:
                forecasts = Forecast.objects.filter(
                    Q(created_by__department=department) | Q(created_by=user)
                )
            else:
                forecasts = Forecast.objects.filter(created_by=user)
        else:
            # Regular users see only their own forecasts
            forecasts = Forecast.objects.filter(created_by=user)
        
        return forecasts.order_by('customer', 'item', '-updated_at')
    
    def calculate_forecast_stats(self, forecasts):
        """Calculate forecast statistics"""
        current_year = datetime.now().year
        next_year = current_year + 1
        
        # Calculate total forecast value for current and next year
        total_forecast = 0
        active_customers = set()
        
        for forecast in forecasts:
            # Get monthly data for current and next year
            monthly_data = getattr(forecast, 'monthly_data', {}) or {}
            
            for year in [current_year, next_year]:
                for month in range(1, 13):
                    key = f"{year}_{month-1}"  # 0-based month indexing
                    total_forecast += monthly_data.get(key, 0)
            
            if forecast.customer:
                active_customers.add(forecast.customer)
        
        # Calculate forecast accuracy (placeholder - would need historical data)
        forecast_accuracy = 89.2  # This would be calculated from actual vs forecast
        
        # Calculate variance (placeholder)
        variance = -3.2  # This would be calculated against budget
        
        return {
            'total_forecast_value': total_forecast,
            'active_customers': len(active_customers),
            'forecast_accuracy': forecast_accuracy,
            'variance': variance,
            'variance_trend': 'negative' if variance < 0 else 'positive'
        }
    
    def get_filter_options(self, forecasts):
        """Get filter options for dropdowns"""
        customers = forecasts.values_list('customer', flat=True).distinct()
        categories = forecasts.values_list('category', flat=True).distinct()
        statuses = forecasts.values_list('status', flat=True).distinct()
        
        return {
            'customers': sorted([c for c in customers if c]),
            'categories': sorted([c for c in categories if c]),
            'statuses': sorted([s for s in statuses if s])
        }
    
    def get_forecast_period_info(self):
        """Get current forecast period information"""
        current_date = date.today()
        next_review_date = date(current_date.year, 3, 15)  # March 15th
        
        if current_date.month >= 3:
            next_review_date = date(current_date.year + 1, 3, 15)
        
        return {
            'current_period': f"January {current_date.year} - December {current_date.year + 1}",
            'next_review_date': next_review_date.strftime("%B %d, %Y")
        }
    
    def get_available_years(self):
        """Get available years for forecast planning"""
        current_year = datetime.now().year
        return list(range(current_year, current_year + 5))

class ForecastAnalysisView(LoginRequiredMixin, TemplateView):
    """Forecast analysis view"""
    template_name = 'forecast/forecast_analysis.html'

# API Views
class ForecastListAPI(LoginRequiredMixin, TemplateView):
    """API to get forecast list"""
    
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            role = getattr(user, 'role', 'user')
            
            # Get forecasts based on user role
            if role == 'admin':
                forecasts = Forecast.objects.all()
            elif role == 'manager':
                department = getattr(user, 'department', None)
                if department:
                    forecasts = Forecast.objects.filter(
                        Q(created_by__department=department) | Q(created_by=user)
                    )
                else:
                    forecasts = Forecast.objects.filter(created_by=user)
            else:
                forecasts = Forecast.objects.filter(created_by=user)
            
            # Apply filters
            customer = request.GET.get('customer')
            category = request.GET.get('category')
            status = request.GET.get('status')
            year = request.GET.get('year')
            
            if customer:
                forecasts = forecasts.filter(customer__icontains=customer)
            if category:
                forecasts = forecasts.filter(category__icontains=category)
            if status:
                forecasts = forecasts.filter(status=status)
            if year:
                forecasts = forecasts.filter(forecast_year=year)
            
            # Paginate
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 50))
            
            paginator = Paginator(forecasts, per_page)
            page_obj = paginator.get_page(page)
            
            # Serialize data
            forecast_data = []
            for forecast in page_obj:
                # Get or generate monthly data
                monthly_data = getattr(forecast, 'monthly_data', {}) or {}
                if not monthly_data:
                    monthly_data = self.generate_sample_monthly_data()
                
                forecast_data.append({
                    'id': forecast.id,
                    'customer': forecast.customer,
                    'customerCode': f"CUST{forecast.id:03d}",
                    'item': forecast.item,
                    'category': forecast.category,
                    'monthlyData': monthly_data,
                    'status': forecast.status,
                    'selected': False,
                    'created_at': forecast.created_at.isoformat(),
                    'updated_at': forecast.updated_at.isoformat()
                })
            
            return JsonResponse({
                'success': True,
                'forecasts': forecast_data,
                'pagination': {
                    'current_page': page_obj.number,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Error in ForecastListAPI: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to load forecast data'
            }, status=500)
    
    def generate_sample_monthly_data(self):
        """Generate sample monthly data for demonstration"""
        import random
        monthly_data = {}
        
        for year in [2025, 2026]:
            for month in range(12):
                key = f"{year}_{month}"
                base_value = random.randint(1000, 5000)
                # Add seasonal variation
                seasonal_multiplier = self.get_seasonal_multiplier(month)
                monthly_data[key] = int(base_value * seasonal_multiplier)
        
        return monthly_data
    
    def get_seasonal_multiplier(self, month):
        """Get seasonal multiplier for a given month (0-based)"""
        # Simple seasonal pattern: higher in Q4, lower in Q2
        patterns = [1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5]
        return patterns[month]

class ForecastCreateAPI(LoginRequiredMixin, TemplateView):
    """API to create new forecast"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            
            # Generate monthly data structure
            monthly_data = {}
            current_year = datetime.now().year
            
            for year in [current_year, current_year + 1]:
                for month in range(12):
                    key = f"{year}_{month}"
                    monthly_data[key] = 0  # Start with zeros
            
            forecast = Forecast.objects.create(
                customer=data.get('customer'),
                item=data.get('item'),
                category=data.get('category'),
                forecast_year=data.get('year', current_year),
                monthly_data=monthly_data,
                created_by=request.user,
                status='draft'
            )
            
            return JsonResponse({
                'success': True,
                'forecast': {
                    'id': forecast.id,
                    'customer': forecast.customer,
                    'item': forecast.item,
                    'category': forecast.category,
                    'forecast_year': forecast.forecast_year,
                    'monthlyData': monthly_data,
                    'status': forecast.status
                },
                'message': 'Forecast item created successfully'
            })
            
        except Exception as e:
            logger.error(f"Error creating forecast: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to create forecast item'
            }, status=500)

class ForecastDetailAPI(LoginRequiredMixin, TemplateView):
    """API to get, update, or delete specific forecast"""
    
    def get(self, request, forecast_id, *args, **kwargs):
        try:
            forecast = get_object_or_404(Forecast, id=forecast_id)
            
            # Check permissions
            if not self.can_access_forecast(request.user, forecast):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            monthly_data = getattr(forecast, 'monthly_data', {}) or {}
            
            return JsonResponse({
                'success': True,
                'forecast': {
                    'id': forecast.id,
                    'customer': forecast.customer,
                    'item': forecast.item,
                    'category': forecast.category,
                    'forecast_year': forecast.forecast_year,
                    'monthlyData': monthly_data,
                    'status': forecast.status,
                    'created_at': forecast.created_at.isoformat(),
                    'updated_at': forecast.updated_at.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting forecast {forecast_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to load forecast'
            }, status=500)
    
    def put(self, request, forecast_id, *args, **kwargs):
        try:
            forecast = get_object_or_404(Forecast, id=forecast_id)
            
            # Check permissions
            if not self.can_modify_forecast(request.user, forecast):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            data = json.loads(request.body)
            
            # Update forecast fields
            if 'customer' in data:
                forecast.customer = data['customer']
            if 'item' in data:
                forecast.item = data['item']
            if 'category' in data:
                forecast.category = data['category']
            if 'monthlyData' in data:
                forecast.monthly_data = data['monthlyData']
            if 'status' in data and self.can_change_status(request.user, forecast):
                forecast.status = data['status']
            
            forecast.updated_at = timezone.now()
            forecast.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Forecast updated successfully'
            })
            
        except Exception as e:
            logger.error(f"Error updating forecast {forecast_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to update forecast'
            }, status=500)
    
    def delete(self, request, forecast_id, *args, **kwargs):
        try:
            forecast = get_object_or_404(Forecast, id=forecast_id)
            
            # Check permissions
            if not self.can_modify_forecast(request.user, forecast):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            forecast.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Forecast deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Error deleting forecast {forecast_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to delete forecast'
            }, status=500)
    
    def can_access_forecast(self, user, forecast):
        """Check if user can access this forecast"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager':
            # Managers can access forecasts from their department
            user_dept = getattr(user, 'department', None)
            forecast_user_dept = getattr(forecast.created_by, 'department', None)
            return user_dept == forecast_user_dept or forecast.created_by == user
        else:
            # Regular users can only access their own forecasts
            return forecast.created_by == user
    
    def can_modify_forecast(self, user, forecast):
        """Check if user can modify this forecast"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager' and forecast.status in ['draft', 'submitted']:
            # Managers can modify drafts and submitted forecasts from their department
            user_dept = getattr(user, 'department', None)
            forecast_user_dept = getattr(forecast.created_by, 'department', None)
            return user_dept == forecast_user_dept
        else:
            # Regular users can only modify their own draft forecasts
            return forecast.created_by == user and forecast.status == 'draft'
    
    def can_change_status(self, user, forecast):
        """Check if user can change forecast status"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager':
            # Managers can approve/reject forecasts
            return True
        else:
            # Regular users can only submit for approval
            return forecast.status == 'draft'

class ForecastMonthlyUpdateAPI(LoginRequiredMixin, TemplateView):
    """API to update monthly forecast data"""
    
    def post(self, request, forecast_id, *args, **kwargs):
        try:
            forecast = get_object_or_404(Forecast, id=forecast_id)
            
            # Check permissions
            if not self.can_modify_forecast(request.user, forecast):
                return JsonResponse({
                    'success': False,
                    'error': 'Access denied'
                }, status=403)
            
            data = json.loads(request.body)
            month_key = data.get('month_key')
            value = data.get('value', 0)
            
            if not month_key:
                return JsonResponse({
                    'success': False,
                    'error': 'Month key is required'
                }, status=400)
            
            # Update monthly data
            monthly_data = getattr(forecast, 'monthly_data', {}) or {}
            monthly_data[month_key] = float(value)
            forecast.monthly_data = monthly_data
            forecast.updated_at = timezone.now()
            forecast.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Monthly data updated successfully'
            })
            
        except Exception as e:
            logger.error(f"Error updating monthly data for forecast {forecast_id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to update monthly data'
            }, status=500)
    
    def can_modify_forecast(self, user, forecast):
        """Check if user can modify this forecast"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return True
        elif role == 'manager' and forecast.status in ['draft', 'submitted']:
            user_dept = getattr(user, 'department', None)
            forecast_user_dept = getattr(forecast.created_by, 'department', None)
            return user_dept == forecast_user_dept
        else:
            return forecast.created_by == user and forecast.status == 'draft'
