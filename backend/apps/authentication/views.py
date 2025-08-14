"""
Django Authentication Views
Custom authentication views for STMBudget
"""
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.views.generic import TemplateView
from django.contrib import messages
from django.urls import reverse_lazy
from django.http import JsonResponse
import json
import logging

logger = logging.getLogger(__name__)

class LoginView(DjangoLoginView):
    """Custom login view"""
    template_name = 'auth/login.html'
    redirect_authenticated_user = True
    success_url = reverse_lazy('dashboard')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'page_title': 'Sign In - STMBudget',
            'show_navbar': False,
            'show_footer': False
        })
        return context
    
    def form_valid(self, form):
        """Security checks and user validation"""
        user = form.get_user()
        
        # Check if user is active
        if not user.is_active:
            messages.error(self.request, 'Your account is inactive. Please contact support.')
            return self.form_invalid(form)
        
        # Log successful login
        logger.info(f"User {user.username} logged in successfully")
        
        # Login user
        auth_login(self.request, user)
        
        # Check if this is an AJAX request
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'redirect': self.get_success_url(),
                'message': 'Login successful'
            })
        
        messages.success(self.request, f'Welcome back, {user.get_full_name() or user.username}!')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        """Handle login errors"""
        # Check if this is an AJAX request
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'errors': form.errors,
                'message': 'Login failed. Please check your credentials.'
            }, status=400)
        
        return super().form_invalid(form)
    
    def get_success_url(self):
        """Determine redirect URL after login"""
        # Check for next parameter
        next_url = self.request.GET.get('next')
        if next_url:
            return next_url
        
        # Role-based redirect
        user = self.request.user
        if hasattr(user, 'role'):
            role = user.role
            if role == 'admin':
                return reverse_lazy('advanced_admin')
            elif role == 'manager':
                return reverse_lazy('approval_center')
            elif role == 'supply_chain':
                return reverse_lazy('inventory_management')
        
        # Default to dashboard
        return reverse_lazy('dashboard')

class LogoutView(TemplateView):
    """Custom logout view"""
    
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            username = request.user.username
            auth_logout(request)
            logger.info(f"User {username} logged out")
            messages.success(request, 'You have been logged out successfully.')
        
        return redirect('login')

class APILoginView(TemplateView):
    """API endpoint for AJAX login"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Username and password are required'
                }, status=400)
            
            # Authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    auth_login(request, user)
                    
                    return JsonResponse({
                        'success': True,
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'name': user.get_full_name() or user.username,
                            'email': user.email,
                            'role': getattr(user, 'role', 'user'),
                            'department': getattr(user, 'department', '')
                        },
                        'redirect': self.get_redirect_url(user),
                        'message': 'Login successful'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'error': 'Your account is inactive. Please contact support.'
                    }, status=400)
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid username or password'
                }, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'An error occurred during login'
            }, status=500)
    
    def get_redirect_url(self, user):
        """Get redirect URL based on user role"""
        role = getattr(user, 'role', 'user')
        
        if role == 'admin':
            return '/advanced-admin/'
        elif role == 'manager':
            return '/approval-center/'
        elif role == 'supply_chain':
            return '/inventory-management/'
        else:
            return '/dashboard/'
