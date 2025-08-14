#!/usr/bin/env python3
"""
Startup script for STM Budget Django backend
"""
import os
import sys
import subprocess

def main():
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    print("🚀 Starting STM Budget Django Backend...")
    print("📁 Working directory:", os.getcwd())
    
    # Run Django development server
    try:
        print("🔧 Running migrations...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        
        print("👤 Creating demo users...")
        subprocess.run([sys.executable, 'manage.py', 'create_demo_users'], check=False)
        
        print("🌐 Starting development server on http://localhost:8000")
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
