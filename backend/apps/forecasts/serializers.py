from rest_framework import serializers
from .models import (
    CustomerItemForecast, MonthlyForecast, ForecastSummary, BudgetImpact,
    Customer, Item, CustomerAnalytics, ForecastTemplate, ForecastHistory
)
from apps.users.serializers import UserSerializer


class CustomerSerializer(serializers.ModelSerializer):
    """Customer serializer matching frontend Customer interface"""
    
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'code', 'email', 'phone', 'region', 'segment',
            'credit_limit', 'currency', 'active', 'manager', 'manager_name',
            'channels', 'seasonality', 'tier', 'created_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity']


class ItemSerializer(serializers.ModelSerializer):
    """Item serializer matching frontend Item interface"""
    
    class Meta:
        model = Item
        fields = [
            'id', 'sku', 'name', 'category', 'brand', 'unit_price', 'cost_price',
            'currency', 'unit', 'active', 'description', 'seasonal', 'seasonal_months',
            'min_order_quantity', 'lead_time', 'supplier', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MonthlyForecastSerializer(serializers.ModelSerializer):
    """Monthly Forecast serializer matching frontend MonthlyForecast interface"""
    
    class Meta:
        model = MonthlyForecast
        fields = [
            'month', 'year', 'month_index', 'quantity', 'unit_price',
            'total_value', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_value', 'created_at', 'updated_at']


class CustomerItemForecastSerializer(serializers.ModelSerializer):
    """Customer Item Forecast serializer matching frontend interface"""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    monthly_forecasts = MonthlyForecastSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    monthly_budget_impact = serializers.ReadOnlyField()
    
    # Dynamic year data structure for compatibility with frontend
    yearly_budgets = serializers.SerializerMethodField()
    yearly_actuals = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomerItemForecast
        fields = [
            'id', 'customer', 'customer_name', 'item', 'item_name', 'item_sku',
            'yearly_total', 'yearly_budget_impact', 'status', 'confidence', 'notes',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'monthly_forecasts', 'monthly_budget_impact', 'yearly_budgets', 'yearly_actuals'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_yearly_budgets(self, obj):
        """Convert to dynamic year structure for frontend compatibility"""
        return {
            str(obj.monthly_forecasts.first().year if obj.monthly_forecasts.exists() else 2025): obj.yearly_total
        }
    
    def get_yearly_actuals(self, obj):
        """Convert to dynamic year structure for frontend compatibility"""
        return {
            str(obj.monthly_forecasts.first().year if obj.monthly_forecasts.exists() else 2025): 0
        }


class ForecastSummarySerializer(serializers.ModelSerializer):
    """Forecast Summary serializer"""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = ForecastSummary
        fields = [
            'customer', 'customer_name', 'year', 'total_items', 'total_yearly_value',
            'total_monthly_values', 'status', 'last_updated', 'created_at'
        ]
        read_only_fields = ['last_updated', 'created_at']


class BudgetImpactSerializer(serializers.ModelSerializer):
    """Budget Impact serializer"""
    
    class Meta:
        model = BudgetImpact
        fields = [
            'month', 'year', 'original_budget', 'forecast_impact',
            'new_projected_budget', 'variance', 'variance_percentage', 'created_at'
        ]
        read_only_fields = ['new_projected_budget', 'variance', 'variance_percentage', 'created_at']


class CustomerAnalyticsSerializer(serializers.ModelSerializer):
    """Customer Analytics serializer"""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = CustomerAnalytics
        fields = [
            'customer', 'customer_name', 'total_forecast', 'monthly_breakdown',
            'category_breakdown', 'channel_breakdown', 'growth_rate', 'seasonal_trends',
            'risk_score', 'confidence_score', 'calculated_at', 'created_at'
        ]
        read_only_fields = ['calculated_at', 'created_at']


class ForecastTemplateSerializer(serializers.ModelSerializer):
    """Forecast Template serializer"""
    
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = ForecastTemplate
        fields = [
            'id', 'name', 'description', 'category', 'seasonality_pattern',
            'default_confidence', 'monthly_distribution', 'created_by',
            'created_by_name', 'is_public', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ForecastHistorySerializer(serializers.ModelSerializer):
    """Forecast History serializer for audit trail"""
    
    changed_by_name = serializers.CharField(source='changed_by.name', read_only=True)
    forecast_title = serializers.CharField(source='customer_item_forecast.__str__', read_only=True)
    
    class Meta:
        model = ForecastHistory
        fields = [
            'id', 'customer_item_forecast', 'forecast_title', 'action',
            'previous_data', 'new_data', 'changed_by', 'changed_by_name',
            'changed_at', 'comment'
        ]
        read_only_fields = ['id', 'changed_at']


# Compatibility serializer for frontend RollingForecastItem interface
class RollingForecastItemSerializer(serializers.ModelSerializer):
    """Compatibility serializer matching frontend RollingForecastItem interface"""
    
    customer = serializers.CharField(source='customer.name')
    item = serializers.CharField(source='item.name')
    yearlyBudgets = serializers.SerializerMethodField()
    yearlyActuals = serializers.SerializerMethodField()
    forecast = serializers.IntegerField(source='yearly_total')
    stock = serializers.IntegerField(default=0)
    git = serializers.IntegerField(default=0)
    eta = serializers.CharField(default='')
    
    # Legacy compatibility fields
    bud25 = serializers.IntegerField(source='yearly_total')
    ytd25 = serializers.IntegerField(default=0)
    
    class Meta:
        model = CustomerItemForecast
        fields = [
            'id', 'customer', 'item', 'yearlyBudgets', 'yearlyActuals',
            'forecast', 'stock', 'git', 'eta', 'bud25', 'ytd25',
            'created_by', 'created_at', 'updated_at'
        ]
    
    def get_yearlyBudgets(self, obj):
        """Generate dynamic year budgets"""
        from datetime import datetime
        current_year = datetime.now().year
        year_str = str(current_year)
        return {year_str: obj.yearly_total}
    
    def get_yearlyActuals(self, obj):
        """Generate dynamic year actuals"""
        from datetime import datetime
        current_year = datetime.now().year
        year_str = str(current_year)
        return {year_str: 0}
