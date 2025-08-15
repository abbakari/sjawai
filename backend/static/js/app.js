/**
 * STMBudget - Advanced SPA-like JavaScript Application
 * Mobile-first, PWA-ready application with advanced caching and navigation
 */

class STMApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = null;
        this.loadingTimeout = null;
        this.navigationCache = new Map();
        this.performanceMetrics = {
            pageLoads: 0,
            totalLoadTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // Configuration
        this.config = {
            animationDuration: 300,
            cacheTimeout: 300000, // 5 minutes
            preloadDelay: 100,
            maxCacheSize: 50,
            enableAnalytics: true,
            enablePrefetch: true,
            enableServiceWorker: true
        };
        
        // Bind methods
        this.navigateTo = this.navigateTo.bind(this);
        this.handlePopState = this.handlePopState.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing STMBudget App...');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup navigation
            this.setupNavigation();
            
            // Initialize data manager
            if (window.dataManager) {
                await window.dataManager.init();
            }
            
            // Setup service worker
            if (this.config.enableServiceWorker) {
                this.setupServiceWorker();
            }
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize touch gestures
            this.setupTouchGestures();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ STMBudget App initialized successfully');
            
            // Dispatch ready event
            this.dispatchEvent('app:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize STMBudget App:', error);
            this.handleError(error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation events
        window.addEventListener('popstate', this.handlePopState);
        
        // Form events
        document.addEventListener('submit', this.handleFormSubmit);
        
        // Link events
        document.addEventListener('click', this.handleLinkClick);
        
        // Visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseBackgroundTasks();
            } else {
                this.resumeBackgroundTasks();
            }
        });
        
        // Online/offline events
        window.addEventListener('online', () => {
            this.handleConnectivityChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleConnectivityChange(false);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Touch events for mobile
        if ('ontouchstart' in window) {
            this.setupMobileEvents();
        }
    }

    /**
     * Setup mobile-specific events
     */
    setupMobileEvents() {
        // Add touch class
        document.body.classList.add('touch-device');
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Handle viewport changes
        window.addEventListener('resize', this.debounce(() => {
            this.handleViewportChange();
        }, 250));
    }

    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let isGesturing = false;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isGesturing = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isGesturing || e.touches.length !== 1) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
                isGesturing = false;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            isGesturing = false;
        }, { passive: true });
    }

    /**
     * Handle swipe gestures
     */
    handleSwipeRight() {
        // Navigate back
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    handleSwipeLeft() {
        // Navigate forward if possible
        if (window.history.length > 1) {
            window.history.forward();
        }
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Initialize toast notifications
        this.initializeToasts();
        
        // Initialize modals
        this.initializeModals();
        
        // Initialize forms
        this.initializeForms();
        
        // Initialize charts if available
        if (window.STMCharts) {
            window.STMCharts.init();
        }
        
        // Initialize data tables
        this.initializeDataTables();
        
        // Initialize tooltips
        this.initializeTooltips();
    }

    /**
     * Setup navigation system
     */
    setupNavigation() {
        this.currentPage = window.location.pathname;
        
        // Preload critical pages
        if (this.config.enablePrefetch) {
            this.preloadCriticalPages();
        }
        
        // Update active navigation
        this.updateActiveNavigation();
    }

    /**
     * Navigate to a new page with SPA-like behavior
     */
    async navigateTo(url, options = {}) {
        const startTime = performance.now();
        
        try {
            // Show loading state
            this.showPageLoading();
            
            // Check cache first
            const cachedContent = this.getFromCache(url);
            
            let content;
            if (cachedContent && !options.forceRefresh) {
                content = cachedContent;
                this.performanceMetrics.cacheHits++;
            } else {
                // Fetch new content
                content = await this.fetchPageContent(url);
                this.cacheContent(url, content);
                this.performanceMetrics.cacheMisses++;
            }
            
            // Update page content
            await this.updatePageContent(content, url);
            
            // Update browser history
            if (!options.skipHistory) {
                window.history.pushState({ url }, '', url);
            }
            
            // Update navigation state
            this.currentPage = url;
            this.updateActiveNavigation();
            
            // Hide loading state
            this.hidePageLoading();
            
            // Track performance
            const loadTime = performance.now() - startTime;
            this.trackPageLoad(url, loadTime);
            
            // Dispatch navigation event
            this.dispatchEvent('app:navigate', { url, loadTime });
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.hidePageLoading();
            this.showToast('Failed to load page. Please try again.', 'error');
            throw error;
        }
    }

    /**
     * Fetch page content via AJAX
     */
    async fetchPageContent(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.text();
    }

    /**
     * Update page content with smooth transitions
     */
    async updatePageContent(html, url) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract main content
        const newContent = doc.querySelector('main') || doc.querySelector('#main-content') || doc.body;
        const currentContent = document.querySelector('main') || document.querySelector('#main-content');
        
        if (newContent && currentContent) {
            // Fade out current content
            await this.animateElement(currentContent, 'fadeOut');
            
            // Update content
            currentContent.innerHTML = newContent.innerHTML;
            
            // Update page title
            const newTitle = doc.querySelector('title');
            if (newTitle) {
                document.title = newTitle.textContent;
            }
            
            // Re-initialize components for new content
            this.initializePageComponents(currentContent);
            
            // Fade in new content
            await this.animateElement(currentContent, 'fadeIn');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Initialize components for newly loaded content
     */
    initializePageComponents(container) {
        // Re-initialize forms
        this.initializeForms(container);
        
        // Re-initialize tooltips
        this.initializeTooltips(container);
        
        // Re-initialize charts
        if (window.STMCharts) {
            container.querySelectorAll('.chart-container').forEach(chart => {
                window.STMCharts.initializeChart(chart);
            });
        }
        
        // Re-initialize data tables
        this.initializeDataTables(container);
    }

    /**
     * Handle popstate events (back/forward navigation)
     */
    handlePopState(event) {
        const url = event.state?.url || window.location.pathname;
        this.navigateTo(url, { skipHistory: true });
    }

    /**
     * Handle form submissions with AJAX
     */
    async handleFormSubmit(event) {
        const form = event.target;
        
        // Check if form should be handled by SPA
        if (!form.classList.contains('spa-form') && !form.hasAttribute('data-spa')) {
            return;
        }
        
        event.preventDefault();
        
        try {
            const formData = new FormData(form);
            const method = form.method || 'POST';
            const action = form.action || window.location.pathname;
            
            // Show loading state on submit button
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                this.setButtonLoading(submitBtn, true);
            }
            
            const response = await fetch(action, {
                method: method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': window.CSRF_TOKEN || ''
                },
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast(result.message || 'Operation completed successfully', 'success');
                
                // Handle redirect
                if (result.redirect) {
                    this.navigateTo(result.redirect);
                }
                
                // Refresh current page data if needed
                if (result.refresh) {
                    this.refreshPageData();
                }
            } else {
                this.showToast(result.message || 'Operation failed', 'error');
                
                // Show form errors
                if (result.errors) {
                    this.showFormErrors(form, result.errors);
                }
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('An error occurred. Please try again.', 'error');
        } finally {
            // Remove loading state
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                this.setButtonLoading(submitBtn, false);
            }
        }
    }

    /**
     * Handle link clicks for SPA navigation
     */
    handleLinkClick(event) {
        const link = event.target.closest('a');
        
        if (!link || 
            !link.href || 
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            link.href.startsWith('mailto:') ||
            link.href.startsWith('tel:') ||
            link.href.includes('://') && !link.href.startsWith(window.location.origin) ||
            link.classList.contains('external-link')) {
            return;
        }
        
        event.preventDefault();
        
        // Add haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        
        this.navigateTo(link.href);
    }

    /**
     * Cache management
     */
    cacheContent(url, content) {
        if (this.navigationCache.size >= this.config.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.navigationCache.keys().next().value;
            this.navigationCache.delete(firstKey);
        }
        
        this.navigationCache.set(url, {
            content,
            timestamp: Date.now()
        });
    }

    getFromCache(url) {
        const cached = this.navigationCache.get(url);
        
        if (!cached) return null;
        
        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
            this.navigationCache.delete(url);
            return null;
        }
        
        return cached.content;
    }

    clearCache() {
        this.navigationCache.clear();
    }

    /**
     * Loading states
     */
    showPageLoading() {
        const loader = document.getElementById('page-loader') || this.createPageLoader();
        loader.classList.remove('hidden');
        
        this.loadingTimeout = setTimeout(() => {
            this.hidePageLoading();
            this.showToast('Loading is taking longer than expected...', 'warning');
        }, 10000);
    }

    hidePageLoading() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
        
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    createPageLoader() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.className = 'fixed top-0 left-0 w-full h-1 bg-blue-600 z-50 loading-bar hidden';
        loader.innerHTML = '<div class="h-full bg-blue-800 animate-pulse"></div>';
        document.body.appendChild(loader);
        return loader;
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="spinner mr-2"></span>Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Submit';
        }
    }

    /**
     * Toast notifications
     */
    initializeToasts() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type} slide-in-right`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    /**
     * Animations
     */
    async animateElement(element, animation) {
        return new Promise(resolve => {
            element.style.transition = `all ${this.config.animationDuration}ms ease`;
            
            switch (animation) {
                case 'fadeOut':
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(-10px)';
                    break;
                case 'fadeIn':
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    break;
            }
            
            setTimeout(resolve, this.config.animationDuration);
        });
    }

    /**
     * Performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!this.config.enableAnalytics) return;
        
        // Monitor navigation performance
        this.performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    console.log('Navigation timing:', entry);
                }
            }
        });
        
        this.performanceObserver.observe({ entryTypes: ['navigation'] });
    }

    trackPageLoad(url, loadTime) {
        this.performanceMetrics.pageLoads++;
        this.performanceMetrics.totalLoadTime += loadTime;
        
        if (this.config.enableAnalytics) {
            console.log(`📊 Page load: ${url} (${loadTime.toFixed(2)}ms)`);
        }
    }

    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageLoadTime: this.performanceMetrics.totalLoadTime / this.performanceMetrics.pageLoads || 0,
            cacheHitRate: this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0
        };
    }

    /**
     * Utility functions
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    handleError(error) {
        console.error('STMApp Error:', error);
        this.showToast('An unexpected error occurred. Please refresh the page.', 'error');
    }

    // Additional methods for form handling, modals, etc. would be implemented here
    initializeForms(container = document) {
        // Form initialization logic
    }

    initializeModals() {
        // Modal initialization logic
    }

    initializeDataTables(container = document) {
        // Data table initialization logic
    }

    initializeTooltips(container = document) {
        // Tooltip initialization logic
    }

    updateActiveNavigation() {
        // Update active navigation state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    preloadCriticalPages() {
        // Preload important pages
        const criticalPages = ['/dashboard/', '/sales-budget/', '/user-management/'];
        
        criticalPages.forEach(page => {
            setTimeout(() => {
                this.fetchPageContent(page).then(content => {
                    this.cacheContent(page, content);
                }).catch(() => {
                    // Silently fail for preloading
                });
            }, this.config.preloadDelay * criticalPages.indexOf(page));
        });
    }

    handleKeyboardShortcuts(e) {
        // Implement keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    // Open search
                    break;
                case '/':
                    e.preventDefault();
                    // Focus search
                    break;
            }
        }
    }

    handleConnectivityChange(isOnline) {
        if (isOnline) {
            this.showToast('Connection restored', 'success', 3000);
        } else {
            this.showToast('You are offline. Some features may be limited.', 'warning', 8000);
        }
    }

    handleViewportChange() {
        // Handle viewport changes for responsive behavior
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    pauseBackgroundTasks() {
        // Pause non-critical background tasks when page is hidden
    }

    resumeBackgroundTasks() {
        // Resume background tasks when page becomes visible
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/static/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }

    showFormErrors(form, errors) {
        // Clear existing errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Show new errors
        Object.entries(errors).forEach(([field, messages]) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-600 text-sm mt-1';
                errorDiv.textContent = Array.isArray(messages) ? messages[0] : messages;
                input.parentNode.appendChild(errorDiv);
            }
        });
    }

    refreshPageData() {
        // Refresh current page data without full navigation
        if (this.currentPage) {
            this.navigateTo(this.currentPage, { forceRefresh: true, skipHistory: true });
        }
    }
}

// Initialize the application
const app = new STMApp();

// Global reference
window.STMApp = app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Global utility functions
window.showToast = (message, type, duration) => app.showToast(message, type, duration);
window.navigateTo = (url, options) => app.navigateTo(url, options);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STMApp;
}
