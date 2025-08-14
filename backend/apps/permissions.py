from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class HasBudgetPermission(permissions.BasePermission):
    """
    Custom permission for budget-related operations based on user role.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check role-based permissions
        if request.method in permissions.SAFE_METHODS:
            # Anyone can read budgets they have access to
            return request.user.has_permission('sales_budget', 'read') or \
                   request.user.has_permission('own_data', 'read')
        
        # Check create/update permissions
        if request.method == 'POST':
            return request.user.has_permission('sales_budget', 'create')
        
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_permission('sales_budget', 'create') or \
                   request.user.has_permission('sales_budget', 'manage')
        
        if request.method == 'DELETE':
            return request.user.has_permission('sales_budget', 'manage') or \
                   request.user.role == 'admin'
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins have full access
        if request.user.role == 'admin':
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        # Managers can access their team's budgets
        if request.user.role == 'manager':
            if hasattr(obj, 'created_by'):
                return obj.created_by in request.user.team_members.all() or \
                       obj.created_by == request.user
        
        # Supply chain can read approved budgets
        if request.user.role == 'supply_chain' and request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'status'):
                return obj.status in ['approved', 'sent_to_supply_chain']
        
        return False


class HasForecastPermission(permissions.BasePermission):
    """
    Custom permission for forecast-related operations based on user role.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_permission('forecasts', 'read') or \
                   request.user.has_permission('own_data', 'read')
        
        if request.method == 'POST':
            return request.user.has_permission('forecasts', 'create')
        
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_permission('forecasts', 'create') or \
                   request.user.has_permission('forecasts', 'manage')
        
        if request.method == 'DELETE':
            return request.user.has_permission('forecasts', 'manage') or \
                   request.user.role == 'admin'
        
        return False


class HasWorkflowPermission(permissions.BasePermission):
    """
    Custom permission for workflow-related operations based on user role.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True  # Everyone can read workflows they have access to
        
        # Check specific workflow permissions
        action = getattr(view, 'action', None)
        
        if action == 'approve':
            return request.user.has_permission('sales_budget', 'approve') or \
                   request.user.has_permission('forecasts', 'approve')
        
        if action == 'reject':
            return request.user.has_permission('sales_budget', 'approve') or \
                   request.user.has_permission('forecasts', 'approve')
        
        if action == 'submit':
            return request.user.has_permission('approvals', 'submit')
        
        if action == 'send_to_supply_chain':
            return request.user.has_permission('supply_chain', 'forward')
        
        return True


class HasInventoryPermission(permissions.BasePermission):
    """
    Custom permission for inventory-related operations based on user role.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True  # Everyone can read inventory data
        
        # Check inventory management permissions
        if request.user.has_permission('inventory', 'manage'):
            return True
        
        # Admins and supply chain have full access
        if request.user.role in ['admin', 'supply_chain']:
            return True
        
        # Salesmen can create stock requests
        if request.user.role == 'salesman' and request.method == 'POST':
            return True
        
        return False


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Permission that only allows managers and admins.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['manager', 'admin']


class IsAdminOnly(permissions.BasePermission):
    """
    Permission that only allows admins.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'admin'


class CanManageUsers(permissions.BasePermission):
    """
    Permission for user management operations.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.has_permission('users', 'manage')


class CanViewReports(permissions.BasePermission):
    """
    Permission for accessing reports and analytics.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.has_permission('reports', 'read') or \
               request.user.has_permission('team_data', 'read')
