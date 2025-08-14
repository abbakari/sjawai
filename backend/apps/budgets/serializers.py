from rest_framework import serializers
from .models import (
    YearlyBudget, MonthlyBudget, BudgetTemplate, BudgetHistory,
    BudgetDistribution, BudgetAlert
)
from apps.users.serializers import UserSerializer


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    """Monthly Budget serializer matching frontend MonthlyBudget interface"""
    
    class Meta:
        model = MonthlyBudget
        fields = [
            'month', 'month_number', 'budget_value', 'actual_value', 
            'rate', 'stock', 'git', 'discount', 'net_value', 
            'variance', 'variance_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['net_value', 'variance', 'variance_percentage']


class YearlyBudgetSerializer(serializers.ModelSerializer):
    """Yearly Budget serializer matching frontend YearlyBudgetData interface"""
    
    monthly_data = MonthlyBudgetSerializer(source='monthly_budgets', many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    monthly_data_summary = serializers.ReadOnlyField()
    
    class Meta:
        model = YearlyBudget
        fields = [
            'id', 'customer', 'item', 'category', 'brand', 'year',
            'total_budget', 'created_by', 'created_by_name', 'created_at',
            'updated_at', 'status', 'version', 'is_active',
            'monthly_data', 'monthly_data_summary'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        
        # Generate ID if not provided
        if not validated_data.get('id'):
            import uuid
            validated_data['id'] = f"budget_{int(timezone.now().timestamp())}_{uuid.uuid4().hex[:8]}"
        
        return super().create(validated_data)


class YearlyBudgetCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating yearly budgets with monthly data"""
    
    monthly_data = MonthlyBudgetSerializer(many=True, write_only=True)
    
    class Meta:
        model = YearlyBudget
        fields = [
            'customer', 'item', 'category', 'brand', 'year',
            'total_budget', 'monthly_data'
        ]
    
    def create(self, validated_data):
        monthly_data = validated_data.pop('monthly_data', [])
        
        # Set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        
        # Generate ID
        import uuid
        validated_data['id'] = f"budget_{int(timezone.now().timestamp())}_{uuid.uuid4().hex[:8]}"
        
        # Create yearly budget
        yearly_budget = YearlyBudget.objects.create(**validated_data)
        
        # Create monthly budgets
        for month_data in monthly_data:
            MonthlyBudget.objects.create(
                yearly_budget=yearly_budget,
                **month_data
            )
        
        return yearly_budget


class BudgetDistributionSerializer(serializers.ModelSerializer):
    """Budget Distribution serializer matching frontend seasonal distribution"""
    
    distribution_array = serializers.ReadOnlyField(source='get_distribution_array')
    
    class Meta:
        model = BudgetDistribution
        fields = [
            'id', 'name', 'type', 'description', 'january', 'february',
            'march', 'april', 'may', 'june', 'july', 'august',
            'september', 'october', 'november', 'december',
            'is_default', 'is_active', 'created_by', 'created_at',
            'distribution_array'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        # Validate that distribution totals to 100%
        months = ['january', 'february', 'march', 'april', 'may', 'june',
                 'july', 'august', 'september', 'october', 'november', 'december']
        
        total = sum(float(data.get(month, 0)) for month in months if month in data)
        
        if abs(total - 100) > 0.01:  # Allow small floating point errors
            raise serializers.ValidationError(
                f"Distribution must total 100%. Current total: {total}%"
            )
        
        return data


class BudgetTemplateSerializer(serializers.ModelSerializer):
    """Budget Template serializer"""
    
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = BudgetTemplate
        fields = [
            'id', 'name', 'description', 'category', 'brand',
            'monthly_distribution', 'default_rates', 'seasonal_adjustments',
            'created_by', 'created_by_name', 'is_public', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class BudgetHistorySerializer(serializers.ModelSerializer):
    """Budget History serializer for audit trail"""
    
    changed_by_name = serializers.CharField(source='changed_by.name', read_only=True)
    yearly_budget_title = serializers.CharField(source='yearly_budget.__str__', read_only=True)
    
    class Meta:
        model = BudgetHistory
        fields = [
            'id', 'yearly_budget', 'yearly_budget_title', 'action',
            'previous_data', 'new_data', 'changed_by', 'changed_by_name',
            'changed_at', 'comment'
        ]
        read_only_fields = ['id', 'changed_at']


class BudgetAlertSerializer(serializers.ModelSerializer):
    """Budget Alert serializer"""
    
    yearly_budget_title = serializers.CharField(source='yearly_budget.__str__', read_only=True)
    recipient_name = serializers.CharField(source='recipient.name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.name', read_only=True)
    
    class Meta:
        model = BudgetAlert
        fields = [
            'id', 'yearly_budget', 'yearly_budget_title', 'alert_type',
            'title', 'message', 'severity', 'is_active', 'is_read',
            'resolved_at', 'resolved_by', 'resolved_by_name',
            'recipient', 'recipient_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BudgetSummarySerializer(serializers.Serializer):
    """Budget summary statistics serializer"""
    
    total_budgets = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_customers = serializers.IntegerField()
    total_items = serializers.IntegerField()
    year_breakdown = serializers.DictField()
    category_breakdown = serializers.DictField()
    monthly_totals = serializers.DictField()
    status_breakdown = serializers.DictField()


class BudgetFilterSerializer(serializers.Serializer):
    """Budget filter parameters serializer"""
    
    customer = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    brand = serializers.CharField(required=False, allow_blank=True)
    item = serializers.CharField(required=False, allow_blank=True)
    year = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)
    created_by = serializers.CharField(required=False, allow_blank=True)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)


class MonthlyBudgetUpdateSerializer(serializers.Serializer):
    """Serializer for updating multiple monthly budgets at once"""
    
    yearly_budget_id = serializers.CharField()
    monthly_data = MonthlyBudgetSerializer(many=True)
    
    def validate_yearly_budget_id(self, value):
        try:
            budget = YearlyBudget.objects.get(id=value)
            # Check if user has permission to edit this budget
            if budget.created_by != self.context['request'].user:
                user = self.context['request'].user
                if not user.has_permission('sales_budget', 'manage') and user.role != 'admin':
                    raise serializers.ValidationError("You don't have permission to edit this budget")
            return value
        except YearlyBudget.DoesNotExist:
            raise serializers.ValidationError("Budget not found")
    
    def update_monthly_budgets(self):
        yearly_budget = YearlyBudget.objects.get(id=self.validated_data['yearly_budget_id'])
        monthly_data = self.validated_data['monthly_data']
        
        # Update or create monthly budgets
        for month_data in monthly_data:
            monthly_budget, created = MonthlyBudget.objects.update_or_create(
                yearly_budget=yearly_budget,
                month=month_data['month'],
                defaults=month_data
            )
        
        # Recalculate total budget
        total_budget = sum(mb.budget_value for mb in yearly_budget.monthly_budgets.all())
        yearly_budget.total_budget = total_budget
        yearly_budget.save()
        
        return yearly_budget
