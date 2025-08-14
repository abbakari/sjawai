from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserPreferences

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo users for testing'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete existing demo users first')

    def handle(self, *args, **options):
        demo_users = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'name': 'System Administrator',
                'role': 'admin',
                'department': 'IT',
                'password': 'password',
                'is_superuser': True,
                'is_staff': True
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

        if options['reset']:
            self.stdout.write('Deleting existing demo users...')
            User.objects.filter(email__in=[user['email'] for user in demo_users]).delete()

        created_count = 0
        for user_data in demo_users:
            email = user_data['email']
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(f'User {email} already exists, skipping...')
                continue
            
            password = user_data.pop('password')
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.save()
            
            # Create user preferences
            UserPreferences.objects.get_or_create(user=user)
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created user: {user.email} ({user.get_role_display()})')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} demo users')
        )
