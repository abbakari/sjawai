#!/usr/bin/env node
/**
 * Node.js script to start Django backend server
 */

const { spawn } = require('child_process');
const path = require('path');

function startDjango() {
    console.log('🚀 Starting Django backend server...');
    
    const backendDir = path.join(__dirname, 'backend');
    
    // Start Django development server
    const django = spawn('python3', ['manage.py', 'runserver', '127.0.0.1:8000'], {
        cwd: backendDir,
        stdio: 'inherit',
        env: { ...process.env, DJANGO_SETTINGS_MODULE: 'stm_budget.settings' }
    });
    
    django.on('error', (err) => {
        console.error('❌ Failed to start Django server:', err.message);
        process.exit(1);
    });
    
    django.on('close', (code) => {
        console.log(`🛑 Django server exited with code ${code}`);
        process.exit(code);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping Django server...');
        django.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        django.kill('SIGTERM');
    });
}

startDjango();
