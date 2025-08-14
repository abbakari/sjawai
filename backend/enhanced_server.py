#!/usr/bin/env python3
"""
Enhanced STM Budget API Server with proper data persistence
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime
import uuid
import sqlite3
import os


class DatabaseManager:
    """Simple SQLite database manager for development"""
    
    def __init__(self, db_path="stm_budget.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Budget items table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS budget_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer TEXT NOT NULL,
            item TEXT NOT NULL,
            category TEXT,
            brand TEXT,
            budget_2025 REAL DEFAULT 0,
            actual_2025 REAL DEFAULT 0,
            budget_2026 REAL DEFAULT 0,
            rate REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            git INTEGER DEFAULT 0,
            discount REAL DEFAULT 0,
            monthly_data TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        ''')
        
        # Forecast items table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS forecast_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer TEXT NOT NULL,
            item TEXT NOT NULL,
            bud25 INTEGER DEFAULT 0,
            ytd25 INTEGER DEFAULT 0,
            forecast INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 0,
            git INTEGER DEFAULT 0,
            eta TEXT,
            forecast_data TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        ''')
        
        # Insert sample users if table is empty
        cursor.execute('SELECT COUNT(*) FROM users')
        if cursor.fetchone()[0] == 0:
            sample_users = [
                ('admin', 'admin@stmbudget.com', 'admin', 'Admin', 'User'),
                ('salesman1', 'salesman@stmbudget.com', 'salesman', 'John', 'Salesman'),
                ('manager1', 'manager@stmbudget.com', 'manager', 'Jane', 'Manager'),
                ('supply1', 'supply@stmbudget.com', 'supply_chain', 'Bob', 'Supply'),
            ]
            cursor.executemany(
                'INSERT INTO users (username, email, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
                sample_users
            )
        
        # Insert sample budget data if table is empty
        cursor.execute('SELECT COUNT(*) FROM budget_items')
        if cursor.fetchone()[0] == 0:
            sample_budgets = [
                ('Action Aid International (Tz)', 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO', 'Tyres', 'BF Goodrich', 1200000, 850000, 0, 341, 232, 0, 0, '[]', 2),
                ('Action Aid International (Tz)', 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO', 'Tyres', 'BF Goodrich', 980000, 720000, 0, 412, 7, 0, 0, '[]', 2),
                ('Action Aid International (Tz)', 'VALVE 0214 TR 414J FOR CAR TUBELESS TYRE', 'Accessories', 'Generic', 15000, 18000, 0, 0.5, 2207, 0, 0, '[]', 2),
                ('Action Aid International (Tz)', 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL', 'Tyres', 'Michelin', 875000, 920000, 0, 300, 127, 0, 0, '[]', 2),
            ]
            cursor.executemany(
                'INSERT INTO budget_items (customer, item, category, brand, budget_2025, actual_2025, budget_2026, rate, stock, git, discount, monthly_data, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                sample_budgets
            )
        
        # Insert sample forecast data if table is empty
        cursor.execute('SELECT COUNT(*) FROM forecast_items')
        if cursor.fetchone()[0] == 0:
            sample_forecasts = [
                ('Action Aid International (Tz)', 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO', 120, 45, 0, 86, 0, '', '{}', 2),
                ('Action Aid International (Tz)', 'BF GOODRICH TYRE 265/65R17 120/117S TL ATT/A KO2 LRERWLGO', 80, 25, 0, 7, 0, '', '{}', 2),
                ('Action Aid International (Tz)', 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL', 150, 60, 0, 22, 100, '2025-08-24', '{}', 2),
                ('ADVENT CONSTRUCTION LTD.', 'WHEEL BALANCE ALLOYD RIMS', 200, 85, 0, 0, 0, '', '{}', 2),
            ]
            cursor.executemany(
                'INSERT INTO forecast_items (customer, item, bud25, ytd25, forecast, stock, git, eta, forecast_data, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                sample_forecasts
            )
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def execute_query(self, query, params=()):
        """Execute a query and return results"""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return [dict(row) for row in results]
    
    def execute_write(self, query, params=()):
        """Execute a write query"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        row_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return row_id


class STMBudgetAPIHandler(http.server.BaseHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        self.db = DatabaseManager()
        super().__init__(*args, **kwargs)
    
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
    
    def get_post_data(self):
        """Get POST data from request"""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            post_data = self.rfile.read(content_length)
            try:
                return json.loads(post_data.decode())
            except json.JSONDecodeError:
                return {}
        return {}
    
    def do_GET(self):
        """Handle GET requests"""
        path = urllib.parse.urlparse(self.path).path
        query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        
        if path == '/api/health/':
            self.send_json_response({
                'status': 'healthy',
                'message': 'STM Budget API is running with database',
                'timestamp': datetime.now().isoformat(),
                'database': 'connected'
            })
        
        elif path == '/api/auth/me/':
            # Mock current user
            self.send_json_response({
                'id': 2,
                'username': 'salesman1',
                'email': 'salesman@stmbudget.com',
                'role': 'salesman',
                'first_name': 'John',
                'last_name': 'Salesman',
                'is_active': True
            })
        
        elif path == '/api/budgets/':
            # Get budget items from database
            try:
                budgets = self.db.execute_query('''
                    SELECT b.*, u.username as created_by_name 
                    FROM budget_items b 
                    LEFT JOIN users u ON b.created_by = u.id 
                    ORDER BY b.created_at DESC
                ''')
                
                # Parse monthly_data JSON
                for budget in budgets:
                    try:
                        budget['monthly_data'] = json.loads(budget['monthly_data'] or '[]')
                    except:
                        budget['monthly_data'] = []
                
                self.send_json_response({
                    'count': len(budgets),
                    'results': budgets
                })
            except Exception as e:
                self.send_json_response({
                    'error': f'Database error: {str(e)}'
                }, 500)
        
        elif path == '/api/forecasts/':
            # Get forecast items from database
            try:
                forecasts = self.db.execute_query('''
                    SELECT f.*, u.username as created_by_name 
                    FROM forecast_items f 
                    LEFT JOIN users u ON f.created_by = u.id 
                    ORDER BY f.created_at DESC
                ''')
                
                # Parse forecast_data JSON
                for forecast in forecasts:
                    try:
                        forecast['forecast_data'] = json.loads(forecast['forecast_data'] or '{}')
                    except:
                        forecast['forecast_data'] = {}
                
                self.send_json_response({
                    'count': len(forecasts),
                    'results': forecasts
                })
            except Exception as e:
                self.send_json_response({
                    'error': f'Database error: {str(e)}'
                }, 500)
        
        elif path == '/api/users/':
            # Get users from database
            try:
                users = self.db.execute_query('SELECT * FROM users ORDER BY created_at DESC')
                self.send_json_response({
                    'count': len(users),
                    'results': users
                })
            except Exception as e:
                self.send_json_response({
                    'error': f'Database error: {str(e)}'
                }, 500)
        
        else:
            self.send_json_response({
                'error': 'Not Found',
                'message': f'Endpoint {path} not found'
            }, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        path = urllib.parse.urlparse(self.path).path
        data = self.get_post_data()
        
        if path == '/api/auth/login/':
            # Authenticate user
            try:
                username = data.get('username', '')
                users = self.db.execute_query('SELECT * FROM users WHERE username = ? OR email = ?', (username, username))
                
                if users:
                    user = users[0]
                    self.send_json_response({
                        'user': user,
                        'message': 'Login successful'
                    })
                else:
                    self.send_json_response({
                        'error': 'Invalid credentials'
                    }, 401)
            except Exception as e:
                self.send_json_response({
                    'error': f'Authentication error: {str(e)}'
                }, 500)
        
        elif path == '/api/budgets/':
            # Create new budget item
            try:
                monthly_data_json = json.dumps(data.get('monthly_data', []))
                
                budget_id = self.db.execute_write('''
                    INSERT INTO budget_items 
                    (customer, item, category, brand, budget_2025, actual_2025, budget_2026, rate, stock, git, discount, monthly_data, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('customer', ''),
                    data.get('item', ''),
                    data.get('category', ''),
                    data.get('brand', ''),
                    data.get('budget_2025', 0),
                    data.get('actual_2025', 0),
                    data.get('budget_2026', 0),
                    data.get('rate', 0),
                    data.get('stock', 0),
                    data.get('git', 0),
                    data.get('discount', 0),
                    monthly_data_json,
                    2  # Default to salesman user
                ))
                
                # Return created item
                new_budget = self.db.execute_query('SELECT * FROM budget_items WHERE id = ?', (budget_id,))[0]
                new_budget['monthly_data'] = json.loads(new_budget['monthly_data'] or '[]')
                
                self.send_json_response(new_budget, 201)
            except Exception as e:
                self.send_json_response({
                    'error': f'Failed to create budget: {str(e)}'
                }, 500)
        
        elif path == '/api/forecasts/':
            # Create new forecast item
            try:
                forecast_data_json = json.dumps(data.get('forecast_data', {}))
                
                forecast_id = self.db.execute_write('''
                    INSERT INTO forecast_items 
                    (customer, item, bud25, ytd25, forecast, stock, git, eta, forecast_data, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('customer', ''),
                    data.get('item', ''),
                    data.get('bud25', 0),
                    data.get('ytd25', 0),
                    data.get('forecast', 0),
                    data.get('stock', 0),
                    data.get('git', 0),
                    data.get('eta', ''),
                    forecast_data_json,
                    2  # Default to salesman user
                ))
                
                # Return created item
                new_forecast = self.db.execute_query('SELECT * FROM forecast_items WHERE id = ?', (forecast_id,))[0]
                new_forecast['forecast_data'] = json.loads(new_forecast['forecast_data'] or '{}')
                
                self.send_json_response(new_forecast, 201)
            except Exception as e:
                self.send_json_response({
                    'error': f'Failed to create forecast: {str(e)}'
                }, 500)
        
        else:
            self.send_json_response({
                'error': 'Not Found',
                'message': f'POST endpoint {path} not found'
            }, 404)
    
    def do_PUT(self):
        """Handle PUT requests"""
        path = urllib.parse.urlparse(self.path).path
        data = self.get_post_data()
        
        # Extract ID from path (e.g., /api/budgets/1/)
        if path.startswith('/api/budgets/') and path.count('/') >= 3:
            try:
                budget_id = int(path.split('/')[-2])
                monthly_data_json = json.dumps(data.get('monthly_data', []))
                
                self.db.execute_write('''
                    UPDATE budget_items SET 
                    customer=?, item=?, category=?, brand=?, budget_2025=?, actual_2025=?, 
                    budget_2026=?, rate=?, stock=?, git=?, discount=?, monthly_data=?, updated_at=CURRENT_TIMESTAMP
                    WHERE id=?
                ''', (
                    data.get('customer', ''),
                    data.get('item', ''),
                    data.get('category', ''),
                    data.get('brand', ''),
                    data.get('budget_2025', 0),
                    data.get('actual_2025', 0),
                    data.get('budget_2026', 0),
                    data.get('rate', 0),
                    data.get('stock', 0),
                    data.get('git', 0),
                    data.get('discount', 0),
                    monthly_data_json,
                    budget_id
                ))
                
                updated_budget = self.db.execute_query('SELECT * FROM budget_items WHERE id = ?', (budget_id,))[0]
                updated_budget['monthly_data'] = json.loads(updated_budget['monthly_data'] or '[]')
                
                self.send_json_response(updated_budget)
            except Exception as e:
                self.send_json_response({
                    'error': f'Failed to update budget: {str(e)}'
                }, 500)
        
        elif path.startswith('/api/forecasts/') and path.count('/') >= 3:
            try:
                forecast_id = int(path.split('/')[-2])
                forecast_data_json = json.dumps(data.get('forecast_data', {}))
                
                self.db.execute_write('''
                    UPDATE forecast_items SET 
                    customer=?, item=?, bud25=?, ytd25=?, forecast=?, stock=?, git=?, eta=?, forecast_data=?, updated_at=CURRENT_TIMESTAMP
                    WHERE id=?
                ''', (
                    data.get('customer', ''),
                    data.get('item', ''),
                    data.get('bud25', 0),
                    data.get('ytd25', 0),
                    data.get('forecast', 0),
                    data.get('stock', 0),
                    data.get('git', 0),
                    data.get('eta', ''),
                    forecast_data_json,
                    forecast_id
                ))
                
                updated_forecast = self.db.execute_query('SELECT * FROM forecast_items WHERE id = ?', (forecast_id,))[0]
                updated_forecast['forecast_data'] = json.loads(updated_forecast['forecast_data'] or '{}')
                
                self.send_json_response(updated_forecast)
            except Exception as e:
                self.send_json_response({
                    'error': f'Failed to update forecast: {str(e)}'
                }, 500)
        
        else:
            self.send_json_response({
                'error': 'Not Found',
                'message': f'PUT endpoint {path} not found'
            }, 404)


def run_server(port=8000):
    """Run the enhanced development API server"""
    handler = STMBudgetAPIHandler
    
    print(f"🚀 Starting Enhanced STM Budget API Server on port {port}...")
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"✅ Enhanced STM Budget API Server running on http://localhost:{port}")
            print("🗄️  Database: SQLite (stm_budget.db)")
            print("🌐 Available endpoints:")
            print("  GET  /api/health/")
            print("  GET  /api/auth/me/")
            print("  POST /api/auth/login/")
            print("  GET  /api/budgets/")
            print("  POST /api/budgets/")
            print("  PUT  /api/budgets/{id}/")
            print("  GET  /api/forecasts/")
            print("  POST /api/forecasts/")
            print("  PUT  /api/forecasts/{id}/")
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
