from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Sum, Count
from django.utils import timezone
import logging

from .models import (
    CustomerItemForecast, MonthlyForecast, ForecastSummary, BudgetImpact,
    Customer, Item, CustomerAnalytics, ForecastTemplate, ForecastHistory
)
from .serializers import (
    CustomerItemForecastSerializer, MonthlyForecastSerializer, ForecastSummarySerializer,
    BudgetImpactSerializer, CustomerSerializer, ItemSerializer, CustomerAnalyticsSerializer,
    ForecastTemplateSerializer, ForecastHistorySerializer, RollingForecastItemSerializer
)
from apps.permissions import IsOwnerOrReadOnly, HasForecastPermission

logger = logging.getLogger(__name__)


class CustomerItemForecastViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing customer item forecasts
    Matches frontend RollingForecastItem interface
    """
    queryset = CustomerItemForecast.objects.select_related('customer', 'item', 'created_by').prefetch_related('monthly_forecasts')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['customer', 'item', 'status', 'confidence', 'created_by']
    search_fields = ['customer__name', 'item__name', 'item__sku']
    ordering_fields = ['created_at', 'updated_at', 'yearly_total', 'status']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated, HasForecastPermission]
    
    def get_serializer_class(self):
        # Use RollingForecastItem serializer for frontend compatibility
        if self.action == 'list' or self.action == 'retrieve':
            return RollingForecastItemSerializer
        return CustomerItemForecastSerializer
    
    def get_queryset(self):
        """Filter forecasts based on user role and permissions"""
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'salesman':
            # Salesmen can only see their own forecasts
            queryset = queryset.filter(created_by=user)
        elif user.role == 'manager':
            # Managers can see forecasts from their team
            team_members = user.team_members.all()
            queryset = queryset.filter(
                Q(created_by=user) | Q(created_by__in=team_members)
            )
        # Admins and supply_chain can see all forecasts
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get forecast summary statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate summary statistics
        total_forecasts = queryset.count()
        total_value = queryset.aggregate(Sum('yearly_budget_impact'))['yearly_budget_impact__sum'] or 0
        
        # Customer and item counts
        total_customers = queryset.values('customer').distinct().count()
        total_items = queryset.values('item').distinct().count()
        
        # Status breakdown
        status_breakdown = dict(
            queryset.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        )
        
        # Confidence breakdown
        confidence_breakdown = dict(
            queryset.values('confidence').annotate(
                count=Count('id')
            ).values_list('confidence', 'count')
        )
        
        summary_data = {
            'total_forecasts': total_forecasts,
            'total_value': total_value,
            'total_customers': total_customers,
            'total_items': total_items,
            'status_breakdown': status_breakdown,
            'confidence_breakdown': confidence_breakdown
        }
        
        return Response(summary_data)
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get forecasts grouped by customer"""
        customer_id = request.query_params.get('customer')
        if not customer_id:
            return Response(
                {'error': 'Customer parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.filter_queryset(self.get_queryset())
        customer_forecasts = queryset.filter(customer_id=customer_id)
        
        serializer = self.get_serializer(customer_forecasts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_monthly_data(self, request, pk=None):
        """Update monthly forecast data"""
        forecast = self.get_object()
        monthly_data = request.data.get('monthly_data', [])
        
        # Update or create monthly forecasts
        for month_data in monthly_data:
            monthly_forecast, created = MonthlyForecast.objects.update_or_create(
                customer_item_forecast=forecast,
                month=month_data['month'],
                defaults={
                    'year': month_data.get('year', timezone.now().year),
                    'month_index': month_data.get('month_index', 0),
                    'quantity': month_data.get('quantity', 0),
                    'unit_price': month_data.get('unit_price', 0),
                    'notes': month_data.get('notes', '')
                }
            )
        
        # Recalculate yearly totals
        yearly_total = sum(mf.quantity for mf in forecast.monthly_forecasts.all())
        yearly_budget_impact = sum(mf.total_value for mf in forecast.monthly_forecasts.all())
        
        forecast.yearly_total = yearly_total
        forecast.yearly_budget_impact = yearly_budget_impact
        forecast.save()
        
        # Create history record
        ForecastHistory.objects.create(
            customer_item_forecast=forecast,
            action='updated',
            previous_data={'yearly_total': yearly_total},
            new_data={'yearly_total': forecast.yearly_total},
            changed_by=request.user,
            comment='Monthly data updated'
        )
        
        serializer = self.get_serializer(forecast)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit forecast for approval"""
        forecast = self.get_object()
        
        if forecast.status != 'draft':
            return Response(
                {'error': 'Only draft forecasts can be submitted for approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        forecast.status = 'submitted'
        forecast.save()
        
        # Create history record
        ForecastHistory.objects.create(
            customer_item_forecast=forecast,
            action='submitted',
            previous_data={'status': 'draft'},
            new_data={'status': 'submitted'},
            changed_by=request.user,
            comment='Forecast submitted for approval'
        )
        
        logger.info(f"Forecast {forecast.id} submitted for approval by {request.user.email}")
        
        serializer = self.get_serializer(forecast)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Override to set created_by and create history"""
        forecast = serializer.save(created_by=self.request.user)
        
        # Create history record
        ForecastHistory.objects.create(
            customer_item_forecast=forecast,
            action='created',
            previous_data={},
            new_data=serializer.validated_data,
            changed_by=self.request.user,
            comment='Forecast created'
        )


class MonthlyForecastViewSet(viewsets.ModelViewSet):
    """ViewSet for managing monthly forecasts"""
    queryset = MonthlyForecast.objects.select_related('customer_item_forecast', 'customer_item_forecast__customer', 'customer_item_forecast__item')
    serializer_class = MonthlyForecastSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['customer_item_forecast', 'month', 'year']
    ordering_fields = ['year', 'month_index', 'total_value']
    ordering = ['year', 'month_index']
    permission_classes = [permissions.IsAuthenticated, HasForecastPermission]


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for managing customers"""
    queryset = Customer.objects.select_related('manager')
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['region', 'segment', 'tier', 'active', 'manager']
    search_fields = ['name', 'code', 'email']
    ordering_fields = ['name', 'created_at', 'last_activity']
    ordering = ['name']
    permission_classes = [permissions.IsAuthenticated]


class ItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing items"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'brand', 'active', 'seasonal']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'created_at', 'unit_price']
    ordering = ['name']
    permission_classes = [permissions.IsAuthenticated]


class ForecastSummaryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing forecast summaries"""
    queryset = ForecastSummary.objects.select_related('customer')
    serializer_class = ForecastSummarySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['customer', 'year', 'status']
    ordering_fields = ['year', 'total_yearly_value', 'last_updated']
    ordering = ['-year', 'customer__name']
    permission_classes = [permissions.IsAuthenticated]


class ForecastTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing forecast templates"""
    queryset = ForecastTemplate.objects.select_related('created_by')
    serializer_class = ForecastTemplateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'is_public', 'is_active']
    search_fields = ['name', 'description']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter templates based on visibility"""
        user = self.request.user
        return self.queryset.filter(
            Q(is_public=True) | Q(created_by=user)
        )


class ForecastHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only ViewSet for forecast history (audit trail)"""
    queryset = ForecastHistory.objects.select_related('customer_item_forecast', 'changed_by')
    serializer_class = ForecastHistorySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['customer_item_forecast', 'action', 'changed_by']
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter history based on user permissions"""
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'salesman':
            queryset = queryset.filter(customer_item_forecast__created_by=user)
        elif user.role == 'manager':
            team_members = user.team_members.all()
            queryset = queryset.filter(
                Q(customer_item_forecast__created_by=user) | 
                Q(customer_item_forecast__created_by__in=team_members)
            )
        
        return queryset
