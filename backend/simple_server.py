#!/usr/bin/env python3
"""
Simple HTTP server to provide API endpoints for the frontend
This is a temporary solution while Django dependencies are being set up
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime
import uuid


class STMBudgetAPIHandler(http.server.BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def add_cors_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.add_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())
    
    def do_GET(self):
        """Handle GET requests"""
        path = urllib.parse.urlparse(self.path).path
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        
        if path == '/api/health/':
            self.send_json_response({
                'status': 'healthy',
                'message': 'STM Budget API is running',
                'timestamp': datetime.now().isoformat()
            })
        
        elif path == '/api/auth/me/':
            # Mock user data
            self.send_json_response({
                'id': 1,
                'username': 'demo_user',
                'email': 'demo@stmbudget.com',
                'role': 'salesman',
                'first_name': 'Demo',
                'last_name': 'User',
                'is_active': True
            })
        
        elif path == '/api/budgets/':
            # Mock budget data
            self.send_json_response({
                'count': 4,
                'results': [
                    {
                        'id': 1,
                        'customer': 'Action Aid International (Tz)',
                        'item': 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO',
                        'category': 'Tyres',
                        'brand': 'BF Goodrich',
                        'budget_2025': 1200000,
                        'actual_2025': 850000,
                        'budget_2026': 0,
                        'rate': 341,
                        'stock': 232,
                        'git': 0,
                        'created_at': datetime.now().isoformat()
                    },
                    {
                        'id': 2,
                        'customer': 'Action Aid International (Tz)',
                        'item': 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO',
                        'category': 'Tyres',
                        'brand': 'BF Goodrich',
                        'budget_2025': 980000,
                        'actual_2025': 720000,
                        'budget_2026': 0,
                        'rate': 412,
                        'stock': 7,
                        'git': 0,
                        'created_at': datetime.now().isoformat()
                    }
                ]
            })
        
        elif path == '/api/forecasts/':
            # Mock forecast data
            self.send_json_response({
                'count': 3,
                'results': [
                    {
                        'id': 1,
                        'customer': 'Action Aid International (Tz)',
                        'item': 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO',
                        'budget_25': 120,
                        'ytd_25': 45,
                        'forecast': 0,
                        'stock': 86,
                        'git': 0,
                        'eta': '',
                        'created_at': datetime.now().isoformat()
                    }
                ]
            })
        
        elif path == '/api/users/':
            # Mock users data
            self.send_json_response({
                'count': 3,
                'results': [
                    {
                        'id': 1,
                        'username': 'admin',
                        'email': 'admin@stmbudget.com',
                        'role': 'admin',
                        'first_name': 'Admin',
                        'last_name': 'User',
                        'is_active': True
                    },
                    {
                        'id': 2,
                        'username': 'salesman1',
                        'email': 'salesman@stmbudget.com',
                        'role': 'salesman',
                        'first_name': 'John',
                        'last_name': 'Salesman',
                        'is_active': True
                    }
                ]
            })
        
        else:
            self.send_json_response({
                'error': 'Not Found',
                'message': f'Endpoint {path} not found'
            }, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        path = urllib.parse.urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        
        if content_length > 0:
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
            except json.JSONDecodeError:
                data = {}
        else:
            data = {}
        
        if path == '/api/auth/login/':
            # Mock login - accept both email and username
            email = data.get('email', data.get('username', 'demo@stmbudget.com'))
            password = data.get('password', '')

            # Mock user database
            users = {
                'admin@example.com': {
                    'id': 1,
                    'name': 'System Administrator',
                    'email': 'admin@example.com',
                    'role': 'admin',
                    'department': 'IT',
                    'is_active': True,
                    'created_at': '2024-01-01',
                    'permissions': [
                        {'id': '1', 'name': 'View All Dashboards', 'resource': 'dashboard', 'action': 'read'},
                        {'id': '2', 'name': 'Manage Users', 'resource': 'users', 'action': 'manage'},
                        {'id': '3', 'name': 'View All Reports', 'resource': 'reports', 'action': 'read'},
                        {'id': '4', 'name': 'System Settings', 'resource': 'settings', 'action': 'manage'},
                        {'id': '5', 'name': 'Approve All', 'resource': 'approvals', 'action': 'manage'}
                    ],
                    'accessible_dashboards': ['Dashboard', 'SalesBudget', 'RollingForecast', 'UserManagement', 'DataSources', 'InventoryManagement', 'DistributionManagement', 'BiDashboard']
                },
                'salesman@example.com': {
                    'id': 2,
                    'name': 'John Salesman',
                    'email': 'salesman@example.com',
                    'role': 'salesman',
                    'department': 'Sales',
                    'is_active': True,
                    'created_at': '2024-01-01',
                    'permissions': [
                        {'id': '6', 'name': 'Create Sales Budget', 'resource': 'sales_budget', 'action': 'create'},
                        {'id': '7', 'name': 'Submit for Approval', 'resource': 'approvals', 'action': 'submit'},
                        {'id': '8', 'name': 'Create Forecasts', 'resource': 'forecasts', 'action': 'create'},
                        {'id': '9', 'name': 'View Own Data', 'resource': 'own_data', 'action': 'read'},
                        {'id': '10', 'name': 'Customer Management', 'resource': 'customers', 'action': 'manage'}
                    ],
                    'accessible_dashboards': ['Dashboard', 'SalesBudget', 'RollingForecast']
                },
                'manager@example.com': {
                    'id': 3,
                    'name': 'Jane Manager',
                    'email': 'manager@example.com',
                    'role': 'manager',
                    'department': 'Sales',
                    'is_active': True,
                    'created_at': '2024-01-01',
                    'permissions': [
                        {'id': '11', 'name': 'Approve Sales Budgets', 'resource': 'sales_budget', 'action': 'approve'},
                        {'id': '12', 'name': 'Approve Forecasts', 'resource': 'forecasts', 'action': 'approve'},
                        {'id': '13', 'name': 'Provide Feedback', 'resource': 'feedback', 'action': 'create'},
                        {'id': '14', 'name': 'View Team Data', 'resource': 'team_data', 'action': 'read'},
                        {'id': '15', 'name': 'Send to Supply Chain', 'resource': 'supply_chain', 'action': 'forward'}
                    ],
                    'accessible_dashboards': ['Dashboard', 'SalesBudget', 'RollingForecast', 'ApprovalCenter']
                },
                'supply@example.com': {
                    'id': 4,
                    'name': 'Bob Supply Chain',
                    'email': 'supply@example.com',
                    'role': 'supply_chain',
                    'department': 'Supply Chain',
                    'is_active': True,
                    'created_at': '2024-01-01',
                    'permissions': [
                        {'id': '16', 'name': 'View Approved Budgets', 'resource': 'approved_budgets', 'action': 'read'},
                        {'id': '17', 'name': 'View Approved Forecasts', 'resource': 'approved_forecasts', 'action': 'read'},
                        {'id': '18', 'name': 'Inventory Management', 'resource': 'inventory', 'action': 'manage'},
                        {'id': '19', 'name': 'Supply Planning', 'resource': 'supply_planning', 'action': 'manage'},
                        {'id': '20', 'name': 'Customer Satisfaction', 'resource': 'customer_satisfaction', 'action': 'read'}
                    ],
                    'accessible_dashboards': ['Dashboard', 'InventoryManagement', 'DistributionManagement', 'SupplyChainDashboard']
                }
            }

            # Validate credentials (for demo, any password works)
            if email in users and password == 'password':
                user = users[email]
                self.send_json_response({
                    'user': user,
                    'access': 'mock_access_token',
                    'refresh': 'mock_refresh_token',
                    'message': 'Login successful'
                })
            else:
                self.send_json_response({
                    'email': ['Invalid email or password.']
                }, 400)
        
        elif path == '/api/budgets/':
            # Mock budget creation
            new_budget = {
                'id': len(data) + 1,
                'customer': data.get('customer', ''),
                'item': data.get('item', ''),
                'category': data.get('category', ''),
                'brand': data.get('brand', ''),
                'budget_2025': data.get('budget_2025', 0),
                'actual_2025': data.get('actual_2025', 0),
                'budget_2026': data.get('budget_2026', 0),
                'created_at': datetime.now().isoformat()
            }
            self.send_json_response(new_budget, 201)
        
        elif path == '/api/forecasts/':
            # Mock forecast creation
            new_forecast = {
                'id': len(data) + 1,
                'customer': data.get('customer', ''),
                'item': data.get('item', ''),
                'forecast_data': data.get('forecast_data', {}),
                'created_at': datetime.now().isoformat()
            }
            self.send_json_response(new_forecast, 201)
        
        else:
            self.send_json_response({
                'error': 'Not Found',
                'message': f'POST endpoint {path} not found'
            }, 404)


def run_server(port=8000):
    """Run the development API server"""
    handler = STMBudgetAPIHandler

    print(f"🚀 Starting STM Budget API Server on port {port}...")

    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"✅ STM Budget API Server running on http://localhost:{port}")
            print("🌐 Available endpoints:")
            print("  GET  /api/health/")
            print("  GET  /api/auth/me/")
            print("  POST /api/auth/login/")
            print("  GET  /api/budgets/")
            print("  POST /api/budgets/")
            print("  GET  /api/forecasts/")
            print("  POST /api/forecasts/")
            print("  GET  /api/users/")
            print("\n🔄 Server ready to accept connections!")
            print("Press Ctrl+C to stop the server\n")

            httpd.serve_forever()
    except OSError as e:
        print(f"❌ Error starting server: {e}")
        if "Address already in use" in str(e):
            print(f"Port {port} is already in use. Try a different port.")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")


if __name__ == "__main__":
    run_server()
