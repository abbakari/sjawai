from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import json


class ItemCategory(models.Model):
    """Item Category model matching frontend ItemCategory interface"""
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Hierarchy support
    parent_category = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True,
                                       related_name='sub_categories')
    
    # Display and ordering
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    icon_url = models.URLField(blank=True)
    color = models.CharField(max_length=7, blank=True, help_text="Hex color code")
    
    # Business settings
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    margin_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'item_categories'
        verbose_name = 'Item Category'
        verbose_name_plural = 'Item Categories'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class ItemBrand(models.Model):
    """Item Brand model matching frontend ItemBrand interface"""
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    
    # Contact information
    contact_info = models.JSONField(default=dict, help_text="Email, phone, address")
    
    is_active = models.BooleanField(default=True)
    country = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'item_brands'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Supplier model matching frontend Supplier interface"""
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Address
    address = models.JSONField(default=dict, help_text="Street, city, state, zipCode, country")
    
    # Business terms
    payment_terms = models.CharField(max_length=255)
    lead_time = models.IntegerField(default=0, help_text="Lead time in days")
    min_order_value = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    tax_id = models.CharField(max_length=50, blank=True)
    
    # Performance metrics
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0,
                                validators=[MinValueValidator(0), MaxValueValidator(5)])
    is_active = models.BooleanField(default=True)
    
    # Categories they supply
    categories = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suppliers'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class InventoryItem(models.Model):
    """Inventory Item model matching frontend InventoryItem interface"""
    
    class StockStatus(models.TextChoices):
        LOW = 'low', 'Low Stock'
        NORMAL = 'normal', 'Normal'
        HIGH = 'high', 'High Stock'
        OUT_OF_STOCK = 'out_of_stock', 'Out of Stock'
    
    id = models.CharField(max_length=100, primary_key=True)
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    
    # Category and brand relationships
    category = models.ForeignKey(ItemCategory, on_delete=models.CASCADE, related_name='items')
    brand = models.ForeignKey(ItemBrand, on_delete=models.CASCADE, related_name='items')
    
    # Pricing
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Stock management
    current_stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=0)
    max_stock = models.IntegerField(default=0)
    reorder_point = models.IntegerField(default=0)
    reorder_quantity = models.IntegerField(default=0)
    
    # Unit and supplier info
    unit = models.CharField(max_length=50, default='pcs')
    supplier = models.CharField(max_length=255)
    supplier_code = models.CharField(max_length=100, blank=True)
    
    # Physical characteristics
    barcode = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    shelf = models.CharField(max_length=50, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    dimensions = models.JSONField(default=dict, help_text="Length, width, height")
    
    # Status and tracking
    is_active = models.BooleanField(default=True)
    is_serial_tracked = models.BooleanField(default=False)
    is_batch_tracked = models.BooleanField(default=False)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Calculated fields
    stock_status = models.CharField(max_length=15, choices=StockStatus.choices, default='normal')
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_stock_update = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventory_items'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['category', 'brand']),
            models.Index(fields=['stock_status']),
            models.Index(fields=['supplier']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def save(self, *args, **kwargs):
        # Update calculated fields
        self.total_value = self.current_stock * self.average_cost
        
        # Update stock status
        if self.current_stock <= 0:
            self.stock_status = 'out_of_stock'
        elif self.current_stock <= self.min_stock:
            self.stock_status = 'low'
        elif self.current_stock >= self.max_stock:
            self.stock_status = 'high'
        else:
            self.stock_status = 'normal'
        
        super().save(*args, **kwargs)


class StockMovement(models.Model):
    """Stock Movement model matching frontend StockMovement interface"""
    
    class MovementType(models.TextChoices):
        IN = 'in', 'Stock In'
        OUT = 'out', 'Stock Out'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        TRANSFER = 'transfer', 'Transfer'
    
    class MovementReason(models.TextChoices):
        PURCHASE = 'purchase', 'Purchase'
        SALE = 'sale', 'Sale'
        RETURN = 'return', 'Return'
        DAMAGE = 'damage', 'Damage'
        EXPIRED = 'expired', 'Expired'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        TRANSFER = 'transfer', 'Transfer'
        PRODUCTION = 'production', 'Production'
    
    id = models.CharField(max_length=100, primary_key=True)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='movements')
    
    # Movement details
    type = models.CharField(max_length=15, choices=MovementType.choices)
    reason = models.CharField(max_length=15, choices=MovementReason.choices)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Reference and location
    reference = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=100, blank=True)
    from_location = models.CharField(max_length=100, blank=True)
    to_location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # Tracking details
    batch_number = models.CharField(max_length=100, blank=True)
    serial_numbers = models.JSONField(default=list, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # User tracking
    performed_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='performed_movements')
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='approved_movements')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['item', 'type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['performed_by']),
        ]
    
    def __str__(self):
        return f"{self.item.name} - {self.type} ({self.quantity})"
    
    def save(self, *args, **kwargs):
        if self.unit_cost and self.quantity:
            self.total_cost = self.unit_cost * abs(self.quantity)
        super().save(*args, **kwargs)


class InventoryAdjustment(models.Model):
    """Inventory Adjustment model matching frontend InventoryAdjustment interface"""
    
    class AdjustmentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
    
    id = models.CharField(max_length=100, primary_key=True)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='adjustments')
    
    # Adjustment details
    old_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    adjustment_quantity = models.IntegerField()
    reason = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    
    # Status and approval
    status = models.CharField(max_length=10, choices=AdjustmentStatus.choices, default='pending')
    
    # User tracking
    performed_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='performed_adjustments')
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='approved_adjustments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inventory_adjustments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.item.name} - Adjustment ({self.adjustment_quantity})"
    
    def save(self, *args, **kwargs):
        self.adjustment_quantity = self.new_quantity - self.old_quantity
        super().save(*args, **kwargs)


# Stock Management Models (matching frontend StockContext)

class StockRequest(models.Model):
    """Stock Request model matching frontend StockRequest interface"""
    
    class RequestType(models.TextChoices):
        STOCK_ALERT = 'stock_alert', 'Stock Alert'
        NEW_REQUEST = 'new_request', 'New Request'
        STOCK_PROJECTION = 'stock_projection', 'Stock Projection'
        STOCK_OVERVIEW = 'stock_overview', 'Stock Overview'
        REORDER_REQUEST = 'reorder_request', 'Reorder Request'
    
    class RequestStatus(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SENT_TO_MANAGER = 'sent_to_manager', 'Sent to Manager'
        UNDER_REVIEW = 'under_review', 'Under Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'
    
    class UrgencyLevel(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'
    
    id = models.CharField(max_length=100, primary_key=True)
    type = models.CharField(max_length=20, choices=RequestType.choices)
    title = models.CharField(max_length=255)
    item_name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    
    # Request details
    requested_quantity = models.IntegerField()
    current_stock = models.IntegerField()
    reason = models.TextField()
    customer_name = models.CharField(max_length=255, blank=True)
    urgency = models.CharField(max_length=10, choices=UrgencyLevel.choices)
    
    # Status and management
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default='draft')
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='stock_requests')
    created_by_role = models.CharField(max_length=20)
    
    # Manager review
    sent_to_manager_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='reviewed_stock_requests')
    manager_comments = models.TextField(blank=True)
    
    # Supply chain details
    expected_delivery = models.DateField(null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    supplier_info = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['urgency', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.item_name}"


class StockAlert(models.Model):
    """Stock Alert model matching frontend StockAlert interface"""
    
    class AlertType(models.TextChoices):
        LOW_STOCK = 'low_stock', 'Low Stock'
        OUT_OF_STOCK = 'out_of_stock', 'Out of Stock'
        OVERSTOCKED = 'overstocked', 'Overstocked'
    
    id = models.CharField(max_length=100, primary_key=True)
    item_name = models.CharField(max_length=500)
    current_stock = models.IntegerField()
    minimum_level = models.IntegerField()
    alert_type = models.CharField(max_length=15, choices=AlertType.choices)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    
    # Status and priority
    status = models.CharField(max_length=20, choices=StockRequest.RequestStatus.choices, default='draft')
    priority = models.CharField(max_length=10, choices=StockRequest.UrgencyLevel.choices)
    
    # Management
    manager_notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='stock_alerts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_alerts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.item_name} - {self.alert_type}"


class StockProjection(models.Model):
    """Stock Projection model matching frontend StockProjection interface"""
    
    class ProjectionPeriod(models.TextChoices):
        ONE_MONTH = '1_month', '1 Month'
        THREE_MONTHS = '3_months', '3 Months'
        SIX_MONTHS = '6_months', '6 Months'
        ONE_YEAR = '1_year', '1 Year'
    
    id = models.CharField(max_length=100, primary_key=True)
    item_name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    
    # Projection data
    current_stock = models.IntegerField()
    projected_demand = models.IntegerField()
    projection_period = models.CharField(max_length=15, choices=ProjectionPeriod.choices)
    seasonal_factor = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    notes = models.TextField()
    
    # Status and feedback
    status = models.CharField(max_length=20, choices=StockRequest.RequestStatus.choices, default='draft')
    manager_feedback = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='stock_projections')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_projections'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.item_name} - {self.projection_period}"


class StockOverview(models.Model):
    """Stock Overview model matching frontend StockOverview interface"""
    
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Status and review
    status = models.CharField(max_length=20, choices=StockRequest.RequestStatus.choices, default='draft')
    manager_review = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='stock_overviews')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_overviews'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class StockOverviewItem(models.Model):
    """Stock Overview Item for detailed breakdown"""
    
    class ItemStatus(models.TextChoices):
        GOOD = 'good', 'Good'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'
    
    stock_overview = models.ForeignKey(StockOverview, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    current_stock = models.IntegerField()
    status = models.CharField(max_length=10, choices=ItemStatus.choices)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'stock_overview_items'
    
    def __str__(self):
        return f"{self.stock_overview.title} - {self.item_name}"
