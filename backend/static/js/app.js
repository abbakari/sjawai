/**
 * STMBudget - Advanced JavaScript Framework
 * Mobile-First SPA-like functionality with Django backend
 */

class STMBudgetApp {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Set();
        this.currentPage = null;
        this.navigationHistory = [];
        this.touchStartX = null;
        this.touchStartY = null;
        this.scrollPosition = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupServiceWorker();
        this.setupOfflineSupport();
        this.setupGestureNavigation();
        this.setupInfiniteScroll();
        this.setupPullToRefresh();
        this.preloadCriticalResources();
        this.setupPerformanceMonitoring();
        
        console.log('STMBudget App initialized');
    }
    
    // Event Listeners Setup
    setupEventListeners() {
        // SPA Navigation
        document.addEventListener('click', this.handleNavigation.bind(this));
        
        // Form submissions
        document.addEventListener('submit', this.handleFormSubmission.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Page visibility for performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Network status
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.saveScrollPosition.bind(this));
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Touch events for mobile interactions
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    // SPA-like Navigation
    async handleNavigation(e) {
        const link = e.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.href.includes('mailto:') || link.href.includes('tel:')) {
            return;
        }
        
        const url = new URL(link.href);
        if (url.origin !== window.location.origin) {
            return;
        }
        
        e.preventDefault();
        await this.navigateTo(url.pathname + url.search);
    }
    
    async navigateTo(url, options = {}) {
        if (this.loadingStates.has(url)) {
            return;
        }
        
        const { pushState = true, showLoader = true } = options;
        
        this.loadingStates.add(url);
        
        if (showLoader) {
            this.showPageLoader();
        }
        
        try {
            // Save current scroll position
            this.saveScrollPosition();
            
            // Check cache first
            let html = this.cache.get(url);
            
            if (!html) {
                // Fetch new content
                const response = await fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'text/html'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                html = await response.text();
                
                // Cache the result
                this.cache.set(url, html);
                
                // Limit cache size
                if (this.cache.size > 10) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            }
            
            // Update page content
            this.updatePageContent(html);
            
            // Update browser history
            if (pushState) {
                this.navigationHistory.push(window.location.href);
                history.pushState({ url }, '', url);
            }
            
            // Restore or reset scroll position
            setTimeout(() => {
                this.restoreScrollPosition(url);
            }, 100);
            
            // Update current page reference
            this.currentPage = url;
            
            // Trigger page change event
            this.dispatchEvent('pageChange', { url });
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showToast('Failed to load page. Please try again.', 'error');
            
            // Fallback to traditional navigation
            window.location.href = url;
        } finally {
            this.loadingStates.delete(url);
            this.hidePageLoader();
        }
    }
    
    updatePageContent(html) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Update title
        document.title = newDoc.title;
        
        // Update main content
        const newContent = newDoc.querySelector('main');
        const currentContent = document.querySelector('main');
        
        if (newContent && currentContent) {
            // Add exit animation
            currentContent.style.opacity = '0';
            currentContent.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                currentContent.innerHTML = newContent.innerHTML;
                
                // Add enter animation
                currentContent.style.opacity = '1';
                currentContent.style.transform = 'translateX(0)';
                
                // Re-initialize page-specific functionality
                this.initializePageComponents();
            }, 150);
        }
        
        // Update navigation state
        this.updateNavigationState();
    }
    
    // Advanced Form Handling
    async handleFormSubmission(e) {
        const form = e.target;
        if (!form.hasAttribute('data-ajax') && !form.classList.contains('ajax-form')) {
            return;
        }
        
        e.preventDefault();
        
        const submitButton = form.querySelector('[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : '';
        
        try {
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = `
                    <span class="spinner w-4 h-4 mr-2"></span>
                    ${originalText.includes('Sign In') ? 'Signing In...' : 'Submitting...'}
                `;
            }
            
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                if (result.redirect) {
                    await this.navigateTo(result.redirect);
                } else if (result.message) {
                    this.showToast(result.message, 'success');
                }
                
                // Reset form if successful
                form.reset();
            } else {
                this.handleFormErrors(form, result.errors || { __all__: [result.message || 'An error occurred'] });
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    }
    
    handleFormErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Display new errors
        Object.entries(errors).forEach(([field, messages]) => {
            if (field === '__all__') {
                this.showToast(messages[0], 'error');
                return;
            }
            
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-600 text-sm mt-1';
                errorDiv.textContent = messages[0];
                input.parentElement.appendChild(errorDiv);
            }
        });
    }
    
    // Touch and Gesture Support
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const diffX = this.touchStartX - currentX;
        const diffY = this.touchStartY - currentY;
        
        // Horizontal swipe detection
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left (next page)
                this.handleSwipeNavigation('next');
            } else {
                // Swipe right (previous page)
                this.handleSwipeNavigation('prev');
            }
        }
    }
    
    handleTouchEnd(e) {
        this.touchStartX = null;
        this.touchStartY = null;
    }
    
    handleSwipeNavigation(direction) {
        if (direction === 'prev' && this.navigationHistory.length > 0) {
            const prevUrl = this.navigationHistory.pop();
            this.navigateTo(prevUrl, { pushState: false });
        }
    }
    
    // Gesture Navigation Setup
    setupGestureNavigation() {
        if ('navigation' in window && 'addEventListener' in window.navigation) {
            window.navigation.addEventListener('navigate', (e) => {
                if (e.canIntercept && e.destination.url !== window.location.href) {
                    e.intercept({
                        handler: () => this.navigateTo(e.destination.url, { pushState: false })
                    });
                }
            });
        }
    }
    
    // Pull to Refresh
    setupPullToRefresh() {
        let pullStartY = null;
        let pullElement = null;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                pullStartY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (pullStartY !== null) {
                const currentY = e.touches[0].clientY;
                const pullDistance = currentY - pullStartY;
                
                if (pullDistance > 0) {
                    if (!pullElement) {
                        pullElement = this.createPullToRefreshIndicator();
                    }
                    
                    const progress = Math.min(pullDistance / 100, 1);
                    pullElement.style.transform = `translateY(${pullDistance * 0.5}px)`;
                    pullElement.style.opacity = progress;
                    
                    if (pullDistance > 100) {
                        pullElement.classList.add('ready');
                    } else {
                        pullElement.classList.remove('ready');
                    }
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            if (pullElement && pullElement.classList.contains('ready')) {
                this.refreshCurrentPage();
            }
            
            if (pullElement) {
                pullElement.remove();
                pullElement = null;
            }
            
            pullStartY = null;
        }, { passive: true });
    }
    
    createPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-to-refresh-indicator';
        indicator.innerHTML = `
            <div class="spinner w-6 h-6 mx-auto"></div>
            <div class="text-sm text-gray-600 mt-2">Pull to refresh</div>
        `;
        indicator.style.cssText = `
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 1rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    async refreshCurrentPage() {
        // Clear cache for current page
        this.cache.delete(this.currentPage);
        
        // Show refresh indicator
        this.showToast('Refreshing...', 'info');
        
        // Re-fetch current page
        await this.navigateTo(this.currentPage, { pushState: false, showLoader: false });
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    // Data Preloading and Caching
    preloadCriticalResources() {
        // Preload common pages based on user role
        const userRole = window.USER_DATA?.role;
        const preloadUrls = this.getPreloadUrls(userRole);
        
        // Use requestIdleCallback for non-blocking preloading
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadUrls(preloadUrls);
            });
        } else {
            setTimeout(() => this.preloadUrls(preloadUrls), 2000);
        }
    }
    
    getPreloadUrls(role) {
        const baseUrls = ['/dashboard/'];
        
        switch (role) {
            case 'admin':
                return [...baseUrls, '/user-management/', '/admin-panel/'];
            case 'manager':
                return [...baseUrls, '/approval-center/', '/sales-budget/'];
            case 'salesman':
                return [...baseUrls, '/sales-budget/', '/rolling-forecast/'];
            case 'supply_chain':
                return [...baseUrls, '/inventory-management/', '/distribution-management/'];
            default:
                return baseUrls;
        }
    }
    
    async preloadUrls(urls) {
        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                
                if (response.ok) {
                    const html = await response.text();
                    this.cache.set(url, html);
                }
            } catch (error) {
                console.log(`Failed to preload ${url}:`, error);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Infinite Scroll Implementation
    setupInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const url = element.dataset.loadMore;
                    
                    if (url && !this.loadingStates.has(url)) {
                        this.loadMoreContent(element, url);
                    }
                }
            });
        }, { rootMargin: '100px' });
        
        // Observe load-more triggers
        document.querySelectorAll('[data-load-more]').forEach(el => {
            observer.observe(el);
        });
    }
    
    async loadMoreContent(element, url) {
        this.loadingStates.add(url);
        
        try {
            const response = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            if (response.ok) {
                const html = await response.text();
                const container = element.previousElementSibling;
                container.insertAdjacentHTML('beforeend', html);
                
                // Update or remove load-more trigger
                const newUrl = element.dataset.nextUrl;
                if (newUrl) {
                    element.dataset.loadMore = newUrl;
                } else {
                    element.remove();
                }
            }
        } catch (error) {
            console.error('Load more error:', error);
            this.showToast('Failed to load more content', 'error');
        } finally {
            this.loadingStates.delete(url);
        }
    }
    
    // Scroll Position Management
    saveScrollPosition() {
        this.scrollPosition[this.currentPage] = window.scrollY;
    }
    
    restoreScrollPosition(url) {
        const savedPosition = this.scrollPosition[url];
        if (savedPosition !== undefined) {
            window.scrollTo(0, savedPosition);
        } else {
            window.scrollTo(0, 0);
        }
    }
    
    // UI Helper Methods
    showPageLoader() {
        let loader = document.getElementById('page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'page-loader';
            loader.className = 'fixed top-0 left-0 w-full h-1 bg-blue-600 z-50';
            loader.style.transform = 'scaleX(0)';
            loader.style.transformOrigin = 'left';
            loader.style.transition = 'transform 0.3s ease';
            document.body.appendChild(loader);
        }
        
        requestAnimationFrame(() => {
            loader.style.transform = 'scaleX(0.7)';
        });
    }
    
    hidePageLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.transform = 'scaleX(1)';
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 300);
            }, 200);
        }
    }
    
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type} slide-up`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openSearch();
        }
        
        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.refreshCurrentPage();
        }
        
        // ESC to close modals
        if (e.key === 'Escape') {
            this.closeTopModal();
        }
    }
    
    openSearch() {
        // Implement global search functionality
        console.log('Search opened');
    }
    
    closeTopModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length > 0) {
            modals[modals.length - 1].remove();
        }
    }
    
    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor page load times
        window.addEventListener('load', () => {
            if ('performance' in window && 'getEntriesByType' in performance) {
                const navigation = performance.getEntriesByType('navigation')[0];
                const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                
                console.log(`Page load time: ${loadTime}ms`);
                
                // Report slow pages
                if (loadTime > 3000) {
                    console.warn('Slow page load detected');
                }
            }
        });
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                
                if (usedMB > 100) {
                    console.warn(`High memory usage: ${usedMB}MB`);
                    this.optimizeMemory();
                }
            }, 30000);
        }
    }
    
    optimizeMemory() {
        // Clear old cache entries
        if (this.cache.size > 5) {
            const entries = Array.from(this.cache.entries());
            entries.slice(0, Math.floor(entries.length / 2)).forEach(([key]) => {
                this.cache.delete(key);
            });
        }
        
        // Force garbage collection if available
        if ('gc' in window) {
            window.gc();
        }
    }
    
    // Service Worker Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/static/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                    
                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showToast('App update available. Refresh to update.', 'info');
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }
    
    // Offline Support
    setupOfflineSupport() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Check initial state
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }
    
    handleOnline() {
        this.showToast('Back online', 'success');
        document.body.classList.remove('offline');
        
        // Sync any pending data
        this.syncPendingData();
    }
    
    handleOffline() {
        this.showToast('You are offline', 'warning');
        document.body.classList.add('offline');
    }
    
    syncPendingData() {
        // Implement data synchronization when back online
        console.log('Syncing pending data...');
    }
    
    // Page Visibility Handling
    handleVisibilityChange() {
        if (document.hidden) {
            // Page hidden - pause non-critical operations
            this.pauseBackgroundTasks();
        } else {
            // Page visible - resume operations
            this.resumeBackgroundTasks();
        }
    }
    
    pauseBackgroundTasks() {
        // Pause animations, polling, etc.
        console.log('Pausing background tasks');
    }
    
    resumeBackgroundTasks() {
        // Resume operations
        console.log('Resuming background tasks');
    }
    
    // Page Component Initialization
    initializePageComponents() {
        // Re-initialize components after page change
        this.initializeTooltips();
        this.initializeModals();
        this.initializeCharts();
        this.initializeForms();
    }
    
    initializeTooltips() {
        // Initialize tooltip functionality
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            // Add tooltip behavior
        });
    }
    
    initializeModals() {
        // Initialize modal functionality
        document.querySelectorAll('[data-modal]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(el.dataset.modal);
            });
        });
    }
    
    initializeCharts() {
        // Initialize chart components
        document.querySelectorAll('[data-chart]').forEach(el => {
            // Initialize chart
        });
    }
    
    initializeForms() {
        // Initialize form enhancements
        document.querySelectorAll('.form-input').forEach(input => {
            // Add form input enhancements
        });
    }
    
    openModal(modalId) {
        // Implement modal opening logic
        console.log(`Opening modal: ${modalId}`);
    }
    
    // Navigation State Management
    updateNavigationState() {
        // Update active navigation items
        const currentPath = window.location.pathname;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.pathname === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    handlePopState(e) {
        if (e.state && e.state.url) {
            this.navigateTo(e.state.url, { pushState: false });
        }
    }
    
    // Event Dispatcher
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
}

// Initialize the application
const app = new STMBudgetApp();

// Global utilities
window.STMApp = app;
window.showToast = app.showToast.bind(app);
window.navigateTo = app.navigateTo.bind(app);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STMBudgetApp;
}
