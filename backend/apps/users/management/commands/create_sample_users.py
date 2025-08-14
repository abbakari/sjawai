from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserPreferences

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample users matching frontend mock data'

    def handle(self, *args, **options):
        # Create sample users that match frontend MOCK_USERS
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'name': 'System Administrator',
                'role': 'admin',
                'department': 'IT',
                'password': 'password'
            },
            {
                'username': 'salesman',
                'email': 'salesman@example.com',
                'name': 'John Salesman',
                'role': 'salesman',
                'department': 'Sales',
                'password': 'password'
            },
            {
                'username': 'manager',
                'email': 'manager@example.com',
                'name': 'Jane Manager',
                'role': 'manager',
                'department': 'Sales',
                'password': 'password'
            },
            {
                'username': 'supply',
                'email': 'supply@example.com',
                'name': 'Bob Supply Chain',
                'role': 'supply_chain',
                'department': 'Supply Chain',
                'password': 'password'
            }
        ]

        for user_data in users_data:
            email = user_data['email']
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {email} already exists, skipping...')
                )
                continue
            
            # Create user
            password = user_data.pop('password')
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.is_active = True
            user.save()
            
            # Create user preferences
            UserPreferences.objects.create(user=user)
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created user: {email}')
            )

        # Set up manager relationships
        try:
            manager = User.objects.get(email='manager@example.com')
            salesman = User.objects.get(email='salesman@example.com')
            salesman.manager = manager
            salesman.save()
            
            self.stdout.write(
                self.style.SUCCESS('Set up manager relationships')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.WARNING('Could not set up manager relationships')
            )

        self.stdout.write(
            self.style.SUCCESS('Sample users created successfully!')
        )
        self.stdout.write(
            self.style.SUCCESS('You can now login with any of these credentials:')
        )
        for user_data in users_data:
            self.stdout.write(f"  {user_data['email']} / password")
