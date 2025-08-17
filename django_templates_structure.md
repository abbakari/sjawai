# Django Templates Structure for STMBudget System

## Project Overview
Converting React-based STMBudget system to Django templates with role-based access:
- **Roles**: Administrator, Salesman, Manager, Supply Chain
- **Key Features**: Budget management, sales tracking, inventory, forecasting
- **Architecture**: Multi-app Django with role-specific templates

## Django Apps Structure

```
stmbudget_project/
├── stmbudget/                 # Main project settings
├── authentication/           # User authentication & auth templates
├── dashboard/                # Main dashboard templates
├── sales/                    # Sales budget & forecast templates
├── inventory/               # Stock & inventory management templates  
├── admin_panel/             # Admin-specific templates
├── reports/                 # Reporting & analytics templates
├── communication/           # Messaging & notification templates
└── static/                  # CSS, JS, images, fonts
```

## Template Organization Structure

### 1. Base Templates (`templates/base/`)
```
templates/
├── base/
│   ├── base.html                    # Main base template
│   ├── base_auth.html               # Authentication layout
│   ├── base_dashboard.html          # Dashboard layout with sidebar
│   ├── base_salesman.html           # Horizontal nav layout for salesmen
│   └── components/
│       ├── navbar.html              # Top navigation with moving text
│       ├── sidebar.html             # Left sidebar navigation
│       ├── horizontal_nav.html      # Horizontal navigation for salesmen
│       ├── footer.html              # Footer component
│       ├── notifications.html       # Notification toasts
│       └── modals/
│           ├── base_modal.html      # Modal base template
│           ├── password_modal.html  # Change password modal
│           └── export_modal.html    # Export functionality modal
```

### 2. Authentication Templates (`authentication/templates/`)
```
authentication/templates/authentication/
├── login.html                       # Login page with demo users
├── logout.html                      # Logout confirmation
├── password_change.html             # Change password form
└── includes/
    ├── login_form.html              # Login form component
    └── demo_users.html              # Demo user selection
```

### 3. Dashboard Templates (`dashboard/templates/`)
```
dashboard/templates/dashboard/
├── dashboard.html                   # Main dashboard
├── role_specific/
│   ├── admin_dashboard.html         # Admin-specific dashboard
│   ├── salesman_dashboard.html      # Salesman dashboard
│   ├── manager_dashboard.html       # Manager dashboard
│   └── supply_chain_dashboard.html  # Supply chain dashboard
├── widgets/
│   ├── stats_card.html              # Statistical cards
│   ├── quick_actions.html           # Quick action buttons
│   ├── role_badge.html              # User role badge
│   └── git_summary.html             # GIT overview widget
└── includes/
    ├── user_info.html               # User information display
    └── data_refresh.html            # Data refresh controls
```

### 4. Sales Templates (`sales/templates/`)
```
sales/templates/sales/
├── budget/
│   ├── budget_list.html             # Budget overview
│   ├── budget_form.html             # Budget creation/edit
│   ├── budget_detail.html           # Budget details
│   └── budget_filters.html          # Budget filtering
├── forecast/
│   ├── forecast_list.html           # Forecast overview
│   ├── forecast_form.html           # Forecast creation
│   ├── rolling_forecast.html        # Rolling forecast page
│   └── forecast_report.html         # Forecast reports
├── charts/
│   ├── budget_allocation.html       # Budget allocation charts
│   ├── sales_trend.html             # Sales trend visualization
│   ├── budget_comparison.html       # Budget comparison charts
│   └── gauge_chart.html             # Gauge charts for targets
└── includes/
    ├── budget_table.html            # Budget data table
    ├── forecast_table.html          # Forecast data table
    └── sales_summary.html           # Sales summary component
```

### 5. Inventory Templates (`inventory/templates/`)
```
inventory/templates/inventory/
├── management/
│   ├── inventory_dashboard.html     # Inventory overview
│   ├��─ stock_list.html              # Stock items list
│   ├── stock_detail.html            # Stock item details
│   └── stock_alerts.html            # Low stock alerts
├── requests/
│   ├── request_list.html            # Stock requests list
│   ├── request_form.html            # Stock request form
│   ├── request_approval.html        # Approval interface
│   └── request_history.html         # Request history
├── distribution/
│   ├── distribution_dashboard.html  # Distribution overview
│   ├── distribution_form.html       # Distribution setup
│   └── seasonal_distribution.html   # Seasonal distribution
├── modals/
│   ├── add_item_modal.html          # Add new item
│   ├── edit_item_modal.html         # Edit item
│   ├── stock_modal.html             # Stock management
│   └── distribution_modal.html      # Distribution setup
└── includes/
    ├── stock_table.html             # Stock data table
    ├── distribution_table.html      # Distribution table
    └── inventory_stats.html         # Inventory statistics
```

### 6. Admin Panel Templates (`admin_panel/templates/`)
```
admin_panel/templates/admin_panel/
├── admin_dashboard.html             # Advanced admin dashboard
├── user_management/
│   ├── user_list.html               # Users list
│   ├── user_form.html               # User creation/edit
│   ├── user_detail.html             # User details
│   └── user_permissions.html        # User permissions
├── system/
│   ├── data_sources.html            # Data sources management
│   ├── system_settings.html         # System configuration
│   ├── git_eta_management.html      # GIT & ETA management
│   └── workflow_center.html         # Workflow management
├── communication/
│   ├── communication_center.html    # Admin communication center
│   └── message_templates.html       # Message templates
├── reports/
│   ├── bi_dashboard.html            # Business Intelligence
│   ├── system_reports.html          # System reports
│   └── analytics.html               # Analytics dashboard
└── modals/
    ├── add_user_modal.html          # Add user modal
    ├── data_source_modal.html       # Data source configuration
    └── workflow_modal.html          # Workflow configuration
```

### 7. Reports Templates (`reports/templates/`)
```
reports/templates/reports/
├── export/
│   ├── export_dashboard.html        # Export management
│   ├── export_history.html          # Export history
│   └── export_templates.html        # Export templates
├── analytics/
│   ├── customer_analytics.html      # Customer analytics
│   ├── forecast_analytics.html      # Forecast analytics
│   └── performance_analytics.html   # Performance reports
└── charts/
    ├── advanced_charts.html         # Advanced visualizations
    ├── comparison_charts.html       # Comparison charts
    └── trend_analysis.html          # Trend analysis
```

### 8. Communication Templates (`communication/templates/`)
```
communication/templates/communication/
├── center/
│   ├── communication_center.html    # Main communication center
│   ├── message_list.html            # Messages list
│   ├── message_detail.html          # Message details
│   └── compose_message.html         # Compose new message
├── notifications/
│   ├── notification_list.html       # Notifications list
│   ├── notification_settings.html   # Notification preferences
│   └── alert_center.html            # Alert management
└── includes/
    ├── message_thread.html          # Message thread component
    ├── notification_item.html       # Notification item
    └── quick_message.html           # Quick message form
```

## Static Files Organization

```
static/
├── css/
│   ├── base.css                     # Base styles
│   ├── components.css               # Component styles
│   ├── dashboard.css                # Dashboard-specific styles
│   ├── charts.css                   # Chart styling
│   ├── forms.css                    # Form styling
│   ├── tables.css                   # Table styling
│   ├── animations.css               # Animations and transitions
│   └── responsive.css               # Responsive design
├── js/
│   ├── base.js                      # Base JavaScript
│   ├── components/
│   │   ├── modals.js                # Modal functionality
│   │   ├── notifications.js         # Notification system
│   │   ├── forms.js                 # Form interactions
│   │   ├── tables.js                # Table functionality
│   │   └── search.js                # Search functionality
│   ├── charts/
│   │   ├── chart-config.js          # Chart.js configuration
│   │   ├── budget-charts.js         # Budget visualization
│   │   ├─��� sales-charts.js          # Sales charts
│   │   └── inventory-charts.js      # Inventory charts
│   ├── dashboard/
│   │   ├── dashboard.js             # Dashboard interactions
│   │   ├── stats-cards.js           # Statistics cards
│   │   └── quick-actions.js         # Quick actions
│   └── utils/
│       ├── api.js                   # API communication
│       ├── date-utils.js            # Date utilities
│       ├── format-utils.js          # Formatting utilities
│       └── validation.js            # Form validation
├── images/
│   ├── logos/
│   ├── icons/
│   ├── backgrounds/
│   └── users/
├── fonts/
└── vendor/
    ├── bootstrap/                   # Bootstrap CSS/JS
    ├── chartjs/                     # Chart.js library
    ├── lucide/                      # Lucide icons
    └── datatables/                  # DataTables plugin
```

## Key Features Implementation

### 1. Role-Based Navigation
- Dynamic sidebar/navigation based on user role
- Horizontal navigation for salesmen
- Role-specific quick actions

### 2. Real-time Features
- AJAX-based data updates
- WebSocket notifications (optional)
- Real-time chart updates

### 3. Advanced UI Components
- Interactive charts using Chart.js
- Data tables with sorting/filtering
- Modal dialogs for forms
- Toast notifications
- Progressive enhancement

### 4. Performance Optimizations
- Template caching
- Static file compression
- Lazy loading for charts
- Minimal JavaScript footprint
- CSS/JS minification

### 5. Responsive Design
- Mobile-first approach
- Flexible grid system
- Touch-friendly interfaces
- Progressive enhancement

## Development Phases

### Phase 1: Base Structure
1. Create base templates and layout
2. Implement authentication templates
3. Set up static file organization

### Phase 2: Core Functionality
1. Dashboard templates for each role
2. Navigation systems
3. Basic form templates

### Phase 3: Advanced Features
1. Chart implementations
2. Modal systems
3. AJAX functionality

### Phase 4: Polish & Optimization
1. Responsive design refinements
2. Performance optimizations
3. Accessibility improvements
