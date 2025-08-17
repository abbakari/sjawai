/**
 * STMBudget Advanced SPA Router
 * High-performance single page application router with caching, preloading, and transitions
 */

(function() {
    'use strict';

    class SPARouter {
        constructor(options = {}) {
            this.routes = new Map();
            this.middlewares = [];
            this.cache = new Map();
            this.preloadCache = new Map();
            this.currentRoute = null;
            this.currentParams = {};
            this.isNavigating = false;
            
            this.options = {
                containerSelector: '#app-container',
                transitionDuration: 300,
                cacheEnabled: true,
                preloadEnabled: true,
                maxCacheSize: 50,
                historyMode: true,
                ...options
            };

            this.container = document.querySelector(this.options.containerSelector);
            this.init();
        }

        init() {
            // Handle browser navigation
            if (this.options.historyMode) {
                window.addEventListener('popstate', this.handlePopState.bind(this));
                this.interceptLinks();
            }

            // Handle initial route
            this.navigate(window.location.pathname, false);

            // Preload critical routes
            this.preloadCriticalRoutes();

            // Setup intersection observer for preloading
            this.setupPreloadObserver();
        }

        /**
         * Register a route
         */
        route(path, handler, options = {}) {
            const routeConfig = {
                path: this.normalizePath(path),
                handler,
                middleware: options.middleware || [],
                cache: options.cache !== false,
                preload: options.preload === true,
                roles: options.roles || [],
                title: options.title || '',
                meta: options.meta || {}
            };

            this.routes.set(routeConfig.path, routeConfig);
            return this;
        }

        /**
         * Register middleware
         */
        use(middleware) {
            this.middlewares.push(middleware);
            return this;
        }

        /**
         * Navigate to a route
         */
        async navigate(path, addToHistory = true, data = {}) {
            if (this.isNavigating) {
                return false;
            }

            const normalizedPath = this.normalizePath(path);
            const route = this.matchRoute(normalizedPath);

            if (!route) {
                this.handleNotFound(normalizedPath);
                return false;
            }

            this.isNavigating = true;

            try {
                // Check role permissions
                if (!this.checkPermissions(route)) {
                    this.handleUnauthorized();
                    return false;
                }

                // Run middlewares
                const middlewareResult = await this.runMiddlewares(route, data);
                if (middlewareResult === false) {
                    this.isNavigating = false;
                    return false;
                }

                // Start transition
                await this.startTransition();

                // Load route content
                const content = await this.loadRoute(route, data);

                // Update content
                await this.updateContent(content, route);

                // Update browser history
                if (addToHistory && this.options.historyMode) {
                    history.pushState({ path: normalizedPath, data }, route.title, normalizedPath);
                }

                // Update current route
                this.currentRoute = route;
                this.currentParams = this.extractParams(route.path, normalizedPath);

                // Update title and meta
                this.updatePageMeta(route);

                // Complete transition
                await this.completeTransition();

                // Trigger route change event
                this.triggerEvent('routeChanged', { route, path: normalizedPath, params: this.currentParams });

                return true;

            } catch (error) {
                console.error('Navigation error:', error);
                this.handleError(error);
                return false;
            } finally {
                this.isNavigating = false;
            }
        }

        /**
         * Match route pattern
         */
        matchRoute(path) {
            for (const [pattern, route] of this.routes) {
                if (this.pathMatches(pattern, path)) {
                    return route;
                }
            }
            return null;
        }

        /**
         * Check if path matches pattern
         */
        pathMatches(pattern, path) {
            const patternParts = pattern.split('/').filter(p => p);
            const pathParts = path.split('/').filter(p => p);

            if (patternParts.length !== pathParts.length) {
                return false;
            }

            return patternParts.every((part, index) => {
                return part.startsWith(':') || part === pathParts[index];
            });
        }

        /**
         * Extract parameters from path
         */
        extractParams(pattern, path) {
            const params = {};
            const patternParts = pattern.split('/').filter(p => p);
            const pathParts = path.split('/').filter(p => p);

            patternParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    params[part.slice(1)] = pathParts[index];
                }
            });

            return params;
        }

        /**
         * Load route content
         */
        async loadRoute(route, data = {}) {
            const cacheKey = `${route.path}_${JSON.stringify(data)}`;

            // Check cache first
            if (this.options.cacheEnabled && route.cache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Load from handler
            const content = await route.handler(this.currentParams, data);

            // Cache the result
            if (this.options.cacheEnabled && route.cache) {
                this.cacheContent(cacheKey, content);
            }

            return content;
        }

        /**
         * Cache content with size management
         */
        cacheContent(key, content) {
            if (this.cache.size >= this.options.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            this.cache.set(key, {
                content,
                timestamp: Date.now()
            });
        }

        /**
         * Start page transition
         */
        async startTransition() {
            if (!this.container) return;

            this.container.style.opacity = '0';
            this.container.style.transform = 'translateY(10px)';
            
            return new Promise(resolve => {
                setTimeout(resolve, this.options.transitionDuration / 2);
            });
        }

        /**
         * Update page content
         */
        async updateContent(content, route) {
            if (!this.container) return;

            // Handle different content types
            if (typeof content === 'string') {
                this.container.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.container.innerHTML = '';
                this.container.appendChild(content);
            } else if (content && content.html) {
                this.container.innerHTML = content.html;
                
                // Execute scripts if provided
                if (content.scripts) {
                    this.executeScripts(content.scripts);
                }
                
                // Load styles if provided
                if (content.styles) {
                    this.loadStyles(content.styles);
                }
            }

            // Initialize new content
            this.initializeContent();
        }

        /**
         * Complete page transition
         */
        async completeTransition() {
            if (!this.container) return;

            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
            
            return new Promise(resolve => {
                setTimeout(resolve, this.options.transitionDuration / 2);
            });
        }

        /**
         * Execute scripts
         */
        executeScripts(scripts) {
            scripts.forEach(script => {
                if (typeof script === 'string') {
                    eval(script);
                } else if (script.src) {
                    this.loadScript(script.src);
                }
            });
        }

        /**
         * Load external script
         */
        loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        /**
         * Load styles
         */
        loadStyles(styles) {
            styles.forEach(style => {
                if (style.href && !document.querySelector(`link[href="${style.href}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = style.href;
                    document.head.appendChild(link);
                }
            });
        }

        /**
         * Initialize content after load
         */
        initializeContent() {
            // Reinitialize components
            if (window.STMBudget && window.STMBudget.components) {
                window.STMBudget.components.init();
            }

            // Setup form validation
            if (window.STMBudget && window.STMBudget.forms) {
                window.STMBudget.forms.init();
            }

            // Initialize tooltips
            this.initializeTooltips();

            // Setup lazy loading
            this.setupLazyLoading();

            // Focus management
            this.manageFocus();
        }

        /**
         * Run middlewares
         */
        async runMiddlewares(route, data) {
            const allMiddlewares = [...this.middlewares, ...route.middleware];

            for (const middleware of allMiddlewares) {
                const result = await middleware(route, data, this.currentParams);
                if (result === false) {
                    return false;
                }
            }

            return true;
        }

        /**
         * Check user permissions
         */
        checkPermissions(route) {
            if (!route.roles || route.roles.length === 0) {
                return true;
            }

            const userRole = this.getCurrentUserRole();
            return route.roles.includes(userRole);
        }

        /**
         * Get current user role
         */
        getCurrentUserRole() {
            return window.currentUser?.role || 'guest';
        }

        /**
         * Update page meta information
         */
        updatePageMeta(route) {
            if (route.title) {
                document.title = route.title;
            }

            // Update meta tags
            Object.entries(route.meta).forEach(([name, content]) => {
                let meta = document.querySelector(`meta[name="${name}"]`);
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = name;
                    document.head.appendChild(meta);
                }
                meta.content = content;
            });
        }

        /**
         * Preload critical routes
         */
        preloadCriticalRoutes() {
            const criticalRoutes = Array.from(this.routes.values())
                .filter(route => route.preload);

            criticalRoutes.forEach(route => {
                this.preloadRoute(route);
            });
        }

        /**
         * Preload route
         */
        async preloadRoute(route) {
            try {
                const content = await route.handler({}, {});
                this.preloadCache.set(route.path, content);
            } catch (error) {
                console.warn('Preload failed for route:', route.path, error);
            }
        }

        /**
         * Setup preload observer
         */
        setupPreloadObserver() {
            if (!('IntersectionObserver' in window)) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const link = entry.target;
                        const href = link.getAttribute('href');
                        if (href && !this.preloadCache.has(href)) {
                            this.preloadRouteByPath(href);
                        }
                    }
                });
            }, { rootMargin: '50px' });

            // Observe all internal links
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('a[href^="/"]').forEach(link => {
                    observer.observe(link);
                });
            });
        }

        /**
         * Preload route by path
         */
        async preloadRouteByPath(path) {
            const route = this.matchRoute(this.normalizePath(path));
            if (route) {
                await this.preloadRoute(route);
            }
        }

        /**
         * Intercept link clicks
         */
        interceptLinks() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                
                if (!link || 
                    link.hasAttribute('data-external') ||
                    link.getAttribute('href')?.startsWith('http') ||
                    link.getAttribute('href')?.startsWith('mailto:') ||
                    link.getAttribute('href')?.startsWith('tel:')) {
                    return;
                }

                const href = link.getAttribute('href');
                if (href && href.startsWith('/')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            });
        }

        /**
         * Handle browser back/forward
         */
        handlePopState(e) {
            const path = e.state?.path || window.location.pathname;
            this.navigate(path, false, e.state?.data || {});
        }

        /**
         * Handle 404 errors
         */
        handleNotFound(path) {
            this.triggerEvent('notFound', { path });
            this.navigate('/404', false);
        }

        /**
         * Handle unauthorized access
         */
        handleUnauthorized() {
            this.triggerEvent('unauthorized');
            this.navigate('/login', false);
        }

        /**
         * Handle errors
         */
        handleError(error) {
            this.triggerEvent('error', { error });
            console.error('Router error:', error);
        }

        /**
         * Initialize tooltips
         */
        initializeTooltips() {
            if (typeof bootstrap !== 'undefined') {
                const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            }
        }

        /**
         * Setup lazy loading
         */
        setupLazyLoading() {
            if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                lazyImages.forEach(img => imageObserver.observe(img));
            }
        }

        /**
         * Manage focus for accessibility
         */
        manageFocus() {
            const mainContent = document.querySelector('main, [role="main"], #main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        }

        /**
         * Trigger custom events
         */
        triggerEvent(eventName, detail = {}) {
            const event = new CustomEvent(`spa:${eventName}`, { detail });
            window.dispatchEvent(event);
        }

        /**
         * Normalize path
         */
        normalizePath(path) {
            return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        }

        /**
         * Clear cache
         */
        clearCache() {
            this.cache.clear();
            this.preloadCache.clear();
        }

        /**
         * Reload current route
         */
        reload() {
            this.clearCache();
            this.navigate(window.location.pathname, false);
        }

        /**
         * Go back
         */
        back() {
            if (this.options.historyMode) {
                history.back();
            }
        }

        /**
         * Go forward
         */
        forward() {
            if (this.options.historyMode) {
                history.forward();
            }
        }

        /**
         * Get current route
         */
        getCurrentRoute() {
            return this.currentRoute;
        }

        /**
         * Get current parameters
         */
        getCurrentParams() {
            return this.currentParams;
        }
    }

    // Export to global scope
    window.SPARouter = SPARouter;

    // Create default router instance
    window.router = new SPARouter({
        containerSelector: '#main-content',
        transitionDuration: 300,
        cacheEnabled: true,
        preloadEnabled: true,
        maxCacheSize: 50
    });

})();

/**
 * Route Handlers Factory
 * Creates route handlers for different page types
 */
window.RouteHandlers = {
    /**
     * Create AJAX route handler
     */
    ajax: function(url, options = {}) {
        return async function(params, data) {
            const requestUrl = this.interpolateUrl(url, params);
            
            try {
                const response = await fetch(requestUrl, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': STMBudget.utils.getCSRFToken(),
                        ...options.headers
                    },
                    body: data ? JSON.stringify(data) : undefined
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('AJAX route error:', error);
                throw error;
            }
        }.bind(this);
    },

    /**
     * Create template route handler
     */
    template: function(templatePath, dataLoader = null) {
        return async function(params, data) {
            try {
                // Load data if loader provided
                let templateData = {};
                if (dataLoader) {
                    templateData = await dataLoader(params, data);
                }

                // Load template
                const templateUrl = this.interpolateUrl(templatePath, params);
                const response = await fetch(templateUrl, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': STMBudget.utils.getCSRFToken()
                    }
                });

                if (!response.ok) {
                    throw new Error(`Template load failed: ${response.status}`);
                }

                let html = await response.text();

                // Simple template interpolation
                if (templateData) {
                    html = this.interpolateTemplate(html, templateData);
                }

                return html;
            } catch (error) {
                console.error('Template route error:', error);
                throw error;
            }
        }.bind(this);
    },

    /**
     * Interpolate URL with parameters
     */
    interpolateUrl: function(url, params) {
        let result = url;
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`:${key}`, encodeURIComponent(value));
        });
        return result;
    },

    /**
     * Simple template interpolation
     */
    interpolateTemplate: function(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });
    }
};
