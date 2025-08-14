from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Sum, Count
from django.utils import timezone
from decimal import Decimal
import logging

from .models import (
    YearlyBudget, MonthlyBudget, BudgetTemplate, BudgetHistory,
    BudgetDistribution, BudgetAlert
)
from .serializers import (
    YearlyBudgetSerializer, YearlyBudgetCreateSerializer,
    MonthlyBudgetSerializer, BudgetTemplateSerializer,
    BudgetHistorySerializer, BudgetDistributionSerializer,
    BudgetAlertSerializer, BudgetSummarySerializer,
    MonthlyBudgetUpdateSerializer
)
from apps.permissions import IsOwnerOrReadOnly, HasBudgetPermission

logger = logging.getLogger(__name__)


class YearlyBudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing yearly budgets
    Matches frontend YearlyBudgetData interface exactly
    """
    queryset = YearlyBudget.objects.select_related('created_by').prefetch_related('monthly_budgets')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['customer', 'category', 'brand', 'year', 'status', 'created_by']
    search_fields = ['customer', 'item', 'category', 'brand']
    ordering_fields = ['created_at', 'updated_at', 'total_budget', 'year']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated, HasBudgetPermission]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return YearlyBudgetCreateSerializer
        return YearlyBudgetSerializer
    
    def get_queryset(self):
        """Filter budgets based on user role and permissions"""
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'salesman':
            # Salesmen can only see their own budgets
            queryset = queryset.filter(created_by=user)
        elif user.role == 'manager':
            # Managers can see budgets from their team
            team_members = user.team_members.all()
            queryset = queryset.filter(
                Q(created_by=user) | Q(created_by__in=team_members)
            )
        # Admins and supply_chain can see all budgets
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate summary statistics
        total_budgets = queryset.count()
        total_value = queryset.aggregate(Sum('total_budget'))['total_budget__sum'] or 0
        
        # Customer and item counts
        total_customers = queryset.values('customer').distinct().count()
        total_items = queryset.values('item').distinct().count()
        
        # Year breakdown
        year_breakdown = dict(
            queryset.values('year').annotate(
                count=Count('id'),
                total=Sum('total_budget')
            ).values_list('year', 'total')
        )
        
        # Category breakdown
        category_breakdown = dict(
            queryset.values('category').annotate(
                count=Count('id'),
                total=Sum('total_budget')
            ).values_list('category', 'total')
        )
        
        # Status breakdown
        status_breakdown = dict(
            queryset.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        )
        
        # Monthly totals (aggregate from monthly budgets)
        monthly_totals = {}
        for budget in queryset.prefetch_related('monthly_budgets'):
            for monthly in budget.monthly_budgets.all():
                month_key = f"{budget.year}-{monthly.month}"
                if month_key not in monthly_totals:
                    monthly_totals[month_key] = 0
                monthly_totals[month_key] += float(monthly.budget_value)
        
        summary_data = {
            'total_budgets': total_budgets,
            'total_value': total_value,
            'total_customers': total_customers,
            'total_items': total_items,
            'year_breakdown': year_breakdown,
            'category_breakdown': category_breakdown,
            'monthly_totals': monthly_totals,
            'status_breakdown': status_breakdown
        }
        
        serializer = BudgetSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get budgets grouped by customer"""
        customer = request.query_params.get('customer')
        if not customer:
            return Response(
                {'error': 'Customer parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.filter_queryset(self.get_queryset())
        customer_budgets = queryset.filter(customer__icontains=customer)
        
        serializer = self.get_serializer(customer_budgets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_year(self, request):
        """Get budgets for specific year"""
        year = request.query_params.get('year')
        if not year:
            return Response(
                {'error': 'Year parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.filter_queryset(self.get_queryset())
        year_budgets = queryset.filter(year=year)
        
        serializer = self.get_serializer(year_budgets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_monthly_data(self, request, pk=None):
        """Update monthly budget data for a yearly budget"""
        budget = self.get_object()
        
        serializer = MonthlyBudgetUpdateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_budget = serializer.update_monthly_budgets()
            
            # Create history record
            BudgetHistory.objects.create(
                yearly_budget=budget,
                action='updated',
                previous_data={'total_budget': float(budget.total_budget)},
                new_data={'total_budget': float(updated_budget.total_budget)},
                changed_by=request.user,
                comment='Monthly data updated'
            )
            
            response_serializer = YearlyBudgetSerializer(updated_budget)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit budget for approval"""
        budget = self.get_object()
        
        if budget.status != 'draft':
            return Response(
                {'error': 'Only draft budgets can be submitted for approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        budget.status = 'submitted'
        budget.save()
        
        # Create history record
        BudgetHistory.objects.create(
            yearly_budget=budget,
            action='submitted',
            previous_data={'status': 'draft'},
            new_data={'status': 'submitted'},
            changed_by=request.user,
            comment='Budget submitted for approval'
        )
        
        logger.info(f"Budget {budget.id} submitted for approval by {request.user.email}")
        
        serializer = YearlyBudgetSerializer(budget)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Override to set created_by and create history"""
        budget = serializer.save(created_by=self.request.user)
        
        # Create history record
        BudgetHistory.objects.create(
            yearly_budget=budget,
            action='created',
            previous_data={},
            new_data=serializer.validated_data,
            changed_by=self.request.user,
            comment='Budget created'
        )


class MonthlyBudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing monthly budgets"""
    queryset = MonthlyBudget.objects.select_related('yearly_budget', 'yearly_budget__created_by')
    serializer_class = MonthlyBudgetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['yearly_budget', 'month', 'month_number']
    ordering_fields = ['month_number', 'budget_value', 'actual_value']
    ordering = ['yearly_budget', 'month_number']
    permission_classes = [permissions.IsAuthenticated, HasBudgetPermission]
    
    def get_queryset(self):
        """Filter monthly budgets based on user permissions"""
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'salesman':
            queryset = queryset.filter(yearly_budget__created_by=user)
        elif user.role == 'manager':
            team_members = user.team_members.all()
            queryset = queryset.filter(
                Q(yearly_budget__created_by=user) | 
                Q(yearly_budget__created_by__in=team_members)
            )
        
        return queryset


class BudgetDistributionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing budget distributions (seasonal patterns)"""
    queryset = BudgetDistribution.objects.all()
    serializer_class = BudgetDistributionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['type', 'is_default', 'is_active']
    search_fields = ['name', 'description']
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get default distribution"""
        default_distribution = self.queryset.filter(is_default=True, is_active=True).first()
        
        if not default_distribution:
            # Create default seasonal distribution if none exists
            default_distribution = BudgetDistribution.objects.create(
                name='Default Seasonal',
                type='seasonal',
                description='Holiday-aware seasonal distribution with reduced allocation for Nov-Dec',
                # Higher allocation for non-holiday months
                january=9.5, february=9.5, march=9.5, april=9.5,
                may=8.5, june=8.5, july=8.5, august=8.5,
                september=8.0, october=8.0,
                # Reduced allocation for holiday months
                november=6.0, december=6.0,
                is_default=True,
                is_active=True,
                created_by=request.user
            )
        
        serializer = self.get_serializer(default_distribution)
        return Response(serializer.data)


class BudgetTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing budget templates"""
    queryset = BudgetTemplate.objects.select_related('created_by')
    serializer_class = BudgetTemplateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'brand', 'is_public', 'is_active']
    search_fields = ['name', 'description']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter templates based on visibility"""
        user = self.request.user
        return self.queryset.filter(
            Q(is_public=True) | Q(created_by=user)
        )


class BudgetHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only ViewSet for budget history (audit trail)"""
    queryset = BudgetHistory.objects.select_related('yearly_budget', 'changed_by')
    serializer_class = BudgetHistorySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['yearly_budget', 'action', 'changed_by']
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter history based on user permissions"""
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'salesman':
            queryset = queryset.filter(yearly_budget__created_by=user)
        elif user.role == 'manager':
            team_members = user.team_members.all()
            queryset = queryset.filter(
                Q(yearly_budget__created_by=user) | 
                Q(yearly_budget__created_by__in=team_members)
            )
        
        return queryset


class BudgetAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing budget alerts"""
    queryset = BudgetAlert.objects.select_related('yearly_budget', 'recipient', 'resolved_by')
    serializer_class = BudgetAlertSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['recipient', 'alert_type', 'severity', 'is_active', 'is_read']
    ordering_fields = ['created_at', 'severity']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter alerts for current user"""
        return self.queryset.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark alert as read"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve alert"""
        alert = self.get_object()
        alert.is_active = False
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
