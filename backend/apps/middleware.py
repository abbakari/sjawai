from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
import pytz


class TimezoneMiddleware(MiddlewareMixin):
    """Middleware to handle user timezone"""
    
    def process_request(self, request):
        # Get timezone from user settings or default to UTC
        if hasattr(request, 'user') and request.user.is_authenticated:
            # You can add timezone field to User model later
            user_timezone = getattr(request.user, 'timezone', 'UTC')
        else:
            user_timezone = 'UTC'
        
        try:
            timezone.activate(pytz.timezone(user_timezone))
        except pytz.UnknownTimeZoneError:
            timezone.activate(pytz.timezone('UTC'))
