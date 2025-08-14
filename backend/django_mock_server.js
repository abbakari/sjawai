#!/usr/bin/env node
/**
 * Mock Django backend server with SQLite database for user management
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple in-memory database (in production this would be SQLite/PostgreSQL)
let users = new Map();
let sessions = new Map();

// Initialize with a default superuser
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

const defaultSuperuser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'System Administrator',
    role: 'admin',
    department: 'IT',
    is_active: true,
    is_superuser: true,
    is_staff: true,
    password_hash: hashPassword('admin123'),
    created_at: new Date().toISOString(),
    last_login_time: null,
    permissions: [
        {'id': '1', 'name': 'View All Dashboards', 'resource': 'dashboard', 'action': 'read'},
        {'id': '2', 'name': 'Manage Users', 'resource': 'users', 'action': 'manage'},
        {'id': '3', 'name': 'View All Reports', 'resource': 'reports', 'action': 'read'},
        {'id': '4', 'name': 'System Settings', 'resource': 'settings', 'action': 'manage'},
        {'id': '5', 'name': 'Approve All', 'resource': 'approvals', 'action': 'manage'}
    ],
    accessible_dashboards: ['Dashboard', 'SalesBudget', 'RollingForecast', 'UserManagement', 'DataSources', 'InventoryManagement', 'DistributionManagement', 'BiDashboard']
};

// Initialize users
users.set(defaultSuperuser.email, defaultSuperuser);

// Helper functions
const generateToken = () => crypto.randomBytes(32).toString('hex');

const validatePassword = (plainPassword, hashedPassword) => {
    return hashPassword(plainPassword) === hashedPassword;
};

const authenticateUser = (email, password) => {
    const user = users.get(email);
    if (!user || !validatePassword(password, user.password_hash)) {
        return null;
    }
    return user;
};

const createSession = (user) => {
    const sessionToken = generateToken();
    const session = {
        token: sessionToken,
        user_id: user.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    sessions.set(sessionToken, session);
    return sessionToken;
};

const getUserFromSession = (token) => {
    const session = sessions.get(token);
    if (!session || new Date(session.expires_at) < new Date()) {
        return null;
    }
    
    for (const user of users.values()) {
        if (user.id === session.user_id) {
            return user;
        }
    }
    return null;
};

const sendResponse = (res, data, statusCode = 200) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
};

const sendError = (res, message, statusCode = 400) => {
    sendResponse(res, { error: message }, statusCode);
};

const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
};

const getAuthToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    try {
        // Health check
        if (path === '/health/' || path === '/api/health/') {
            sendResponse(res, {
                status: 'healthy',
                message: 'STM Budget Django Backend is running',
                timestamp: new Date().toISOString()
            });
            return;
        }

        // Authentication endpoints
        if (path === '/api/auth/login/' && method === 'POST') {
            const body = await parseBody(req);
            const { email, password } = body;

            if (!email || !password) {
                sendError(res, 'Email and password are required');
                return;
            }

            const user = authenticateUser(email, password);
            if (!user) {
                sendError(res, 'Invalid email or password');
                return;
            }

            // Update last login
            user.last_login_time = new Date().toISOString();
            
            // Create session
            const accessToken = createSession(user);
            const refreshToken = generateToken();

            sendResponse(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    permissions: user.permissions,
                    accessible_dashboards: user.accessible_dashboards
                },
                access: accessToken,
                refresh: refreshToken,
                message: 'Login successful'
            });
            return;
        }

        // Get current user
        if (path === '/api/auth/me/' && method === 'GET') {
            const token = getAuthToken(req);
            if (!token) {
                sendError(res, 'Authentication required', 401);
                return;
            }

            const user = getUserFromSession(token);
            if (!user) {
                sendError(res, 'Invalid or expired token', 401);
                return;
            }

            sendResponse(res, {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                is_active: user.is_active,
                created_at: user.created_at,
                permissions: user.permissions,
                accessible_dashboards: user.accessible_dashboards
            });
            return;
        }

        // User management - Get all users
        if (path === '/api/users/' && method === 'GET') {
            const token = getAuthToken(req);
            if (!token) {
                sendError(res, 'Authentication required', 401);
                return;
            }

            const currentUser = getUserFromSession(token);
            if (!currentUser || currentUser.role !== 'admin') {
                sendError(res, 'Admin access required', 403);
                return;
            }

            const userList = Array.from(users.values()).map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                is_active: user.is_active,
                created_at: user.created_at,
                last_login_time: user.last_login_time
            }));

            sendResponse(res, {
                count: userList.length,
                results: userList
            });
            return;
        }

        // User management - Create new user
        if (path === '/api/users/' && method === 'POST') {
            const token = getAuthToken(req);
            if (!token) {
                sendError(res, 'Authentication required', 401);
                return;
            }

            const currentUser = getUserFromSession(token);
            if (!currentUser || currentUser.role !== 'admin') {
                sendError(res, 'Admin access required', 403);
                return;
            }

            const body = await parseBody(req);
            const { name, email, role, department, password } = body;

            if (!name || !email || !role || !password) {
                sendError(res, 'Name, email, role, and password are required');
                return;
            }

            if (users.has(email)) {
                sendError(res, 'User with this email already exists');
                return;
            }

            const newUserId = Math.max(...Array.from(users.values()).map(u => u.id)) + 1;
            
            // Define role permissions
            const rolePermissions = {
                admin: [
                    {'id': '1', 'name': 'View All Dashboards', 'resource': 'dashboard', 'action': 'read'},
                    {'id': '2', 'name': 'Manage Users', 'resource': 'users', 'action': 'manage'},
                    {'id': '3', 'name': 'View All Reports', 'resource': 'reports', 'action': 'read'},
                    {'id': '4', 'name': 'System Settings', 'resource': 'settings', 'action': 'manage'},
                    {'id': '5', 'name': 'Approve All', 'resource': 'approvals', 'action': 'manage'}
                ],
                salesman: [
                    {'id': '6', 'name': 'Create Sales Budget', 'resource': 'sales_budget', 'action': 'create'},
                    {'id': '7', 'name': 'Submit for Approval', 'resource': 'approvals', 'action': 'submit'},
                    {'id': '8', 'name': 'Create Forecasts', 'resource': 'forecasts', 'action': 'create'},
                    {'id': '9', 'name': 'View Own Data', 'resource': 'own_data', 'action': 'read'},
                    {'id': '10', 'name': 'Customer Management', 'resource': 'customers', 'action': 'manage'}
                ],
                manager: [
                    {'id': '11', 'name': 'Approve Sales Budgets', 'resource': 'sales_budget', 'action': 'approve'},
                    {'id': '12', 'name': 'Approve Forecasts', 'resource': 'forecasts', 'action': 'approve'},
                    {'id': '13', 'name': 'Provide Feedback', 'resource': 'feedback', 'action': 'create'},
                    {'id': '14', 'name': 'View Team Data', 'resource': 'team_data', 'action': 'read'},
                    {'id': '15', 'name': 'Send to Supply Chain', 'resource': 'supply_chain', 'action': 'forward'}
                ],
                supply_chain: [
                    {'id': '16', 'name': 'View Approved Budgets', 'resource': 'approved_budgets', 'action': 'read'},
                    {'id': '17', 'name': 'View Approved Forecasts', 'resource': 'approved_forecasts', 'action': 'read'},
                    {'id': '18', 'name': 'Inventory Management', 'resource': 'inventory', 'action': 'manage'},
                    {'id': '19', 'name': 'Supply Planning', 'resource': 'supply_planning', 'action': 'manage'},
                    {'id': '20', 'name': 'Customer Satisfaction', 'resource': 'customer_satisfaction', 'action': 'read'}
                ]
            };

            const roleDashboards = {
                admin: ['Dashboard', 'SalesBudget', 'RollingForecast', 'UserManagement', 'DataSources', 'InventoryManagement', 'DistributionManagement', 'BiDashboard'],
                salesman: ['Dashboard', 'SalesBudget', 'RollingForecast'],
                manager: ['Dashboard', 'SalesBudget', 'RollingForecast', 'ApprovalCenter'],
                supply_chain: ['Dashboard', 'InventoryManagement', 'DistributionManagement', 'SupplyChainDashboard']
            };

            const newUser = {
                id: newUserId,
                username: email.split('@')[0],
                email,
                name,
                role,
                department: department || 'Unknown',
                is_active: true,
                is_superuser: role === 'admin',
                is_staff: role === 'admin',
                password_hash: hashPassword(password),
                created_at: new Date().toISOString(),
                last_login_time: null,
                permissions: rolePermissions[role] || [],
                accessible_dashboards: roleDashboards[role] || []
            };

            users.set(email, newUser);

            sendResponse(res, {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department,
                is_active: newUser.is_active,
                created_at: newUser.created_at,
                permissions: newUser.permissions,
                accessible_dashboards: newUser.accessible_dashboards
            }, 201);
            return;
        }

        // Default 404 response
        sendError(res, `Endpoint ${path} not found`, 404);

    } catch (error) {
        console.error('Server error:', error);
        sendError(res, 'Internal server error', 500);
    }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 STM Budget Django Backend running on http://127.0.0.1:${PORT}`);
    console.log('🔐 Default superuser credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('📋 Available endpoints:');
    console.log('   POST /api/auth/login/ - User login');
    console.log('   GET  /api/auth/me/ - Get current user');
    console.log('   GET  /api/users/ - List users (admin only)');
    console.log('   POST /api/users/ - Create user (admin only)');
    console.log('   GET  /api/health/ - Health check');
});

process.on('SIGINT', () => {
    console.log('\n🛑 Server stopped');
    process.exit(0);
});
