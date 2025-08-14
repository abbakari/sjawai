# STM Budget Django Backend

A comprehensive Django REST API backend for the STM Budget application, providing all the functionality to support the React frontend with user management, budget planning, rolling forecasts, inventory management, and workflow approvals.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Admin, Salesman, Manager, Supply Chain)
- **Sales Budget Management**: Yearly and monthly budget planning with seasonal distribution
- **Rolling Forecast**: Customer-item forecasting with confidence levels
- **Inventory Management**: Stock tracking, alerts, and projections
- **Workflow System**: Approval workflows for budgets and forecasts
- **Notifications**: Real-time notifications and digest system
- **Reporting**: Comprehensive analytics and reporting

### User Roles & Permissions
- **Admin**: Full system access, user management, all dashboards
- **Salesman**: Create budgets/forecasts, submit for approval, manage customers
- **Manager**: Approve/reject submissions, team oversight, send to supply chain
- **Supply Chain**: View approved items, inventory management, distribution planning

### API Features
- JWT and Session authentication
- Role-based permissions
- RESTful API design
- Real-time data processing
- File upload/export capabilities
- Comprehensive filtering and search
- Audit trails and history tracking

## 📋 Requirements

- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Celery for background tasks

## 🛠️ Installation

1. **Clone and Setup Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb stm_budget_db

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

4. **Create Sample Data**
```bash
# Create sample users matching frontend
python manage.py create_sample_users

# Create superuser (optional)
python manage.py createsuperuser
```

5. **Start Services**
```bash
# Start Redis (required for Celery)
redis-server

# Start Celery worker (in another terminal)
celery -A stm_budget worker -l info

# Start Celery beat (for scheduled tasks, in another terminal)
celery -A stm_budget beat -l info

# Start Django development server
python manage.py runserver
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login with JWT
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update profile
- `GET /api/auth/permissions/` - Get user permissions

### Budgets
- `GET /api/budgets/yearly/` - List yearly budgets
- `POST /api/budgets/yearly/` - Create yearly budget
- `GET /api/budgets/yearly/summary/` - Budget statistics
- `POST /api/budgets/yearly/{id}/submit_for_approval/` - Submit for approval
- `POST /api/budgets/yearly/{id}/update_monthly_data/` - Update monthly data

### Forecasts
- `GET /api/forecasts/customer-item/` - List customer forecasts
- `POST /api/forecasts/customer-item/` - Create forecast
- `GET /api/forecasts/summary/` - Forecast summary

### Workflow
- `GET /api/workflow/items/` - List workflow items
- `POST /api/workflow/items/{id}/approve/` - Approve item
- `POST /api/workflow/items/{id}/reject/` - Reject item
- `POST /api/workflow/items/{id}/send_to_supply_chain/` - Send to supply chain

### Inventory
- `GET /api/inventory/items/` - List inventory items
- `POST /api/inventory/requests/` - Create stock request
- `GET /api/inventory/alerts/` - Stock alerts

### Notifications
- `GET /api/notifications/` - User notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read

## 🔧 Configuration

### Database Settings
Configure PostgreSQL connection in `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/stm_budget_db
```

### Redis Configuration
For caching and Celery:
```env
REDIS_URL=redis://127.0.0.1:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
```

### CORS Settings
Allow frontend connections:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Email Configuration
For notifications:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 👥 Default Users

After running `create_sample_users`, you can login with:

- **Admin**: `admin@example.com` / `password`
- **Salesman**: `salesman@example.com` / `password`
- **Manager**: `manager@example.com` / `password`
- **Supply Chain**: `supply@example.com` / `password`

## 🔐 Security Features

- JWT token authentication
- Role-based access control
- Object-level permissions
- CORS protection
- SQL injection protection
- XSS protection
- CSRF protection
- Secure session handling

## 📊 Performance Optimizations

- Database query optimization with select_related/prefetch_related
- Redis caching for frequently accessed data
- Celery for background task processing
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient API serialization

## 🔄 Background Tasks

Celery handles:
- Notification digests
- Budget variance calculations
- Stock alert updates
- Workflow escalations
- Session cleanup
- Data aggregation

## 📝 Data Models

### Core Models
- **User**: Extended user model with roles and permissions
- **YearlyBudget**: Yearly budget planning with monthly breakdowns
- **CustomerItemForecast**: Rolling forecast by customer and item
- **WorkflowItem**: Approval workflow management
- **InventoryItem**: Stock management and tracking
- **Notification**: User notification system

### Model Relationships
- Users have roles determining their permissions
- Budgets and forecasts belong to users
- Workflow items track approval processes
- Notifications target specific users
- Inventory items track stock movements

## 🧪 Development

### Running Tests
```bash
python manage.py test
```

### Database Reset
```bash
python manage.py flush
python manage.py migrate
python manage.py create_sample_users
```

### API Documentation
Visit `/admin/` for Django admin interface
API documentation available at `/api/` when `DEBUG=True`

## 🚀 Deployment

### Production Settings
- Set `DEBUG=False`
- Configure proper `SECRET_KEY`
- Set up SSL certificates
- Configure static file serving
- Set up database backups
- Configure monitoring

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Integration with Frontend

The Django backend is designed to match the React frontend exactly:

1. **API Responses**: Match frontend TypeScript interfaces
2. **Authentication**: JWT tokens with user permissions
3. **Data Structure**: Consistent with frontend expectations
4. **Error Handling**: Standardized error responses
5. **Real-time Updates**: WebSocket support for live data

### Frontend Integration Points
- User roles and permissions match exactly
- API endpoints mirror frontend service calls
- Data models align with TypeScript interfaces
- Workflow states match frontend state management
- Notification system integrates with frontend alerts

## 📚 Additional Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guidelines](docs/security.md)

## �� Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check PostgreSQL is running
   - Verify connection settings in `.env`

2. **Celery Not Working**
   - Ensure Redis is running
   - Check Celery worker is started

3. **CORS Errors**
   - Verify frontend URL in `CORS_ALLOWED_ORIGINS`
   - Check Django CORS settings

4. **Permission Denied**
   - Verify user roles and permissions
   - Check authentication headers

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in `logs/django.log`
3. Check Django admin for data verification
4. Review Celery worker logs

---

**Note**: This backend provides a complete, production-ready API that exactly matches your React frontend requirements with proper authentication, permissions, data models, and business logic.
