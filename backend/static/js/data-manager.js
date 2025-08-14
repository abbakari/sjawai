/**
 * STMBudget Data Manager
 * Advanced data loading, caching, and optimization system
 */

class DataManager {
    constructor() {
        this.cache = new Map();
        this.loadingQueue = new Map();
        this.backgroundTasks = new Set();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.requestTimeout = 10000; // 10 seconds
        
        this.setupIndexedDB();
        this.setupOfflineStorage();
        this.setupRequestOptimization();
        
        console.log('DataManager initialized');
    }
    
    // IndexedDB setup for persistent caching
    async setupIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('STMBudgetDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('offline_queue')) {
                    db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
                }
                
                if (!db.objectStoreNames.contains('user_data')) {
                    db.createObjectStore('user_data', { keyPath: 'key' });
                }
            };
        }).catch(error => {
            console.warn('IndexedDB not available:', error);
            this.db = null;
        });
    }
    
    // Offline storage setup
    setupOfflineStorage() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.processOfflineQueue();
        });
        
        window.addEventListener('offline', () => {
            console.log('Offline mode activated');
        });
        
        // Setup periodic cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 60000); // Every minute
    }
    
    // Request optimization setup
    setupRequestOptimization() {
        // Setup request deduplication
        this.requestCache = new Map();
        
        // Setup batch request queue
        this.batchQueue = new Map();
        this.batchTimeout = null;
        this.batchDelay = 50; // 50ms batch delay
    }
    
    // Main data fetching method with advanced caching
    async fetchData(url, options = {}) {
        const {
            useCache = true,
            cacheTTL = this.cacheTimeout,
            forceRefresh = false,
            background = false,
            retries = this.maxRetries,
            timeout = this.requestTimeout,
            priority = 'normal' // 'high', 'normal', 'low'
        } = options;
        
        const cacheKey = this.generateCacheKey(url, options);
        
        // Check if request is already in progress
        if (this.loadingQueue.has(cacheKey)) {
            return this.loadingQueue.get(cacheKey);
        }
        
        // Check cache first
        if (useCache && !forceRefresh) {
            const cachedData = await this.getCachedData(cacheKey, cacheTTL);
            if (cachedData) {
                // Trigger background refresh if data is getting stale
                if (this.shouldBackgroundRefresh(cachedData)) {
                    this.scheduleBackgroundRefresh(url, options);
                }
                return cachedData.data;
            }
        }
        
        // Create request promise
        const requestPromise = this.executeRequest(url, options, cacheKey, retries, timeout);
        
        // Add to loading queue
        this.loadingQueue.set(cacheKey, requestPromise);
        
        // Handle background vs foreground requests
        if (background) {
            this.backgroundTasks.add(requestPromise);
            requestPromise.finally(() => {
                this.backgroundTasks.delete(requestPromise);
            });
        }
        
        try {
            const result = await requestPromise;
            
            // Cache successful results
            if (useCache && result) {
                await this.setCachedData(cacheKey, result, cacheTTL);
            }
            
            return result;
        } finally {
            this.loadingQueue.delete(cacheKey);
        }
    }
    
    // Execute HTTP request with error handling and retries
    async executeRequest(url, options, cacheKey, retries, timeout) {
        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                // Add timeout to request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const requestOptions = {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        ...options.headers
                    }
                };
                
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                
                // Reset retry count on success
                this.retryAttempts.delete(cacheKey);
                
                return data;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.name === 'AbortError' || 
                    (error.message && error.message.includes('HTTP 4'))) {
                    break;
                }
                
                // Exponential backoff
                if (attempt < retries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                    await this.sleep(delay);
                }
            }
        }
        
        // Store failed attempt
        const attempts = this.retryAttempts.get(cacheKey) || 0;
        this.retryAttempts.set(cacheKey, attempts + 1);
        
        // If offline, queue for later
        if (!navigator.onLine) {
            await this.queueOfflineRequest(url, options);
            throw new Error('Request queued for when online');
        }
        
        throw lastError;
    }
    
    // Batch multiple requests together
    async batchFetch(requests) {
        const batchId = Date.now().toString();
        
        // Group requests by domain and priority
        const groupedRequests = this.groupRequests(requests);
        
        const results = await Promise.allSettled(
            groupedRequests.map(group => this.processBatchGroup(group))
        );
        
        return this.processBatchResults(results, requests);
    }
    
    groupRequests(requests) {
        const groups = new Map();
        
        requests.forEach(request => {
            const domain = new URL(request.url).origin;
            const priority = request.options?.priority || 'normal';
            const key = `${domain}-${priority}`;
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(request);
        });
        
        return Array.from(groups.values());
    }
    
    async processBatchGroup(group) {
        // Limit concurrent requests per group
        const concurrencyLimit = 3;
        const batches = [];
        
        for (let i = 0; i < group.length; i += concurrencyLimit) {
            const batch = group.slice(i, i + concurrencyLimit);
            batches.push(
                Promise.all(
                    batch.map(request => 
                        this.fetchData(request.url, request.options)
                            .catch(error => ({ error, request }))
                    )
                )
            );
        }
        
        return Promise.all(batches);
    }
    
    processBatchResults(results, originalRequests) {
        const processedResults = [];
        let requestIndex = 0;
        
        results.forEach(groupResult => {
            if (groupResult.status === 'fulfilled') {
                groupResult.value.forEach(batchResult => {
                    batchResult.forEach(result => {
                        processedResults[requestIndex] = result;
                        requestIndex++;
                    });
                });
            } else {
                // Handle group failure
                console.error('Batch group failed:', groupResult.reason);
                processedResults[requestIndex] = { error: groupResult.reason };
                requestIndex++;
            }
        });
        
        return processedResults;
    }
    
    // Advanced caching methods
    async getCachedData(key, ttl) {
        // Try memory cache first
        const memoryData = this.cache.get(key);
        if (memoryData && (Date.now() - memoryData.timestamp) < ttl) {
            return memoryData;
        }
        
        // Try IndexedDB cache
        if (this.db) {
            try {
                const transaction = this.db.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                const result = await this.promisifyRequest(store.get(key));
                
                if (result && (Date.now() - result.timestamp) < ttl) {
                    // Update memory cache
                    this.cache.set(key, result);
                    return result;
                }
            } catch (error) {
                console.warn('IndexedDB cache read failed:', error);
            }
        }
        
        return null;
    }
    
    async setCachedData(key, data, ttl) {
        const cacheEntry = {
            key,
            data,
            timestamp: Date.now(),
            ttl
        };
        
        // Store in memory cache
        this.cache.set(key, cacheEntry);
        
        // Store in IndexedDB
        if (this.db) {
            try {
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                await this.promisifyRequest(store.put(cacheEntry));
            } catch (error) {
                console.warn('IndexedDB cache write failed:', error);
            }
        }
    }
    
    // Background refresh strategies
    shouldBackgroundRefresh(cachedData) {
        const age = Date.now() - cachedData.timestamp;
        const staleThreshold = cachedData.ttl * 0.7; // Refresh when 70% of TTL has passed
        return age > staleThreshold;
    }
    
    scheduleBackgroundRefresh(url, options) {
        if (this.backgroundTasks.size > 5) {
            return; // Limit background tasks
        }
        
        setTimeout(() => {
            this.fetchData(url, { ...options, background: true, forceRefresh: true })
                .catch(error => {
                    console.log('Background refresh failed:', error);
                });
        }, 100);
    }
    
    // Offline queue management
    async queueOfflineRequest(url, options) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['offline_queue'], 'readwrite');
            const store = transaction.objectStore('offline_queue');
            
            await this.promisifyRequest(store.add({
                url,
                options,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to queue offline request:', error);
        }
    }
    
    async processOfflineQueue() {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['offline_queue'], 'readwrite');
            const store = transaction.objectStore('offline_queue');
            const requests = await this.promisifyRequest(store.getAll());
            
            for (const request of requests) {
                try {
                    await this.fetchData(request.url, { 
                        ...request.options, 
                        useCache: false 
                    });
                    
                    // Remove from queue on success
                    await this.promisifyRequest(store.delete(request.id));
                } catch (error) {
                    console.log('Failed to process offline request:', error);
                    // Keep in queue for next attempt
                }
            }
        } catch (error) {
            console.warn('Failed to process offline queue:', error);
        }
    }
    
    // Cache management
    async cleanupCache() {
        const now = Date.now();
        
        // Clean memory cache
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
        
        // Clean IndexedDB cache
        if (this.db) {
            try {
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const index = store.index('timestamp');
                
                const cutoffTime = now - (24 * 60 * 60 * 1000); // 24 hours
                const range = IDBKeyRange.upperBound(cutoffTime);
                
                const request = index.openCursor(range);
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                };
            } catch (error) {
                console.warn('Cache cleanup failed:', error);
            }
        }
    }
    
    // Preloading strategies
    async preloadData(urls, options = {}) {
        const {
            priority = 'low',
            concurrency = 2,
            delay = 1000
        } = options;
        
        // Wait before starting preload
        await this.sleep(delay);
        
        // Process URLs in batches
        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            
            await Promise.allSettled(
                batch.map(url => 
                    this.fetchData(url, { 
                        priority, 
                        background: true,
                        useCache: true
                    })
                )
            );
            
            // Small delay between batches
            if (i + concurrency < urls.length) {
                await this.sleep(100);
            }
        }
    }
    
    // Smart preloading based on user behavior
    setupPredictivePreloading() {
        // Track user navigation patterns
        const navigationHistory = JSON.parse(
            localStorage.getItem('navigationHistory') || '[]'
        );
        
        // Predict next pages based on history
        const predictedUrls = this.predictNextPages(navigationHistory);
        
        // Preload predicted pages
        if (predictedUrls.length > 0) {
            this.preloadData(predictedUrls, { delay: 2000 });
        }
        
        // Update history on page changes
        document.addEventListener('pageChange', (event) => {
            navigationHistory.push({
                url: event.detail.url,
                timestamp: Date.now()
            });
            
            // Keep only recent history
            const recentHistory = navigationHistory
                .filter(entry => Date.now() - entry.timestamp < 7 * 24 * 60 * 60 * 1000)
                .slice(-50);
            
            localStorage.setItem('navigationHistory', JSON.stringify(recentHistory));
        });
    }
    
    predictNextPages(history) {
        // Simple prediction based on common patterns
        const currentUrl = window.location.pathname;
        const patterns = {
            '/dashboard/': ['/sales-budget/', '/rolling-forecast/'],
            '/sales-budget/': ['/rolling-forecast/', '/dashboard/'],
            '/rolling-forecast/': ['/sales-budget/', '/dashboard/'],
            '/user-management/': ['/admin-panel/', '/dashboard/'],
            '/admin-panel/': ['/user-management/', '/dashboard/']
        };
        
        return patterns[currentUrl] || [];
    }
    
    // Performance monitoring
    setupPerformanceMonitoring() {
        const metrics = {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            avgResponseTime: 0,
            errors: 0
        };
        
        // Track metrics
        this.onRequest = (url) => {
            metrics.requests++;
            const startTime = performance.now();
            
            return () => {
                const duration = performance.now() - startTime;
                metrics.avgResponseTime = 
                    (metrics.avgResponseTime * (metrics.requests - 1) + duration) / metrics.requests;
            };
        };
        
        this.onCacheHit = () => metrics.cacheHits++;
        this.onCacheMiss = () => metrics.cacheMisses++;
        this.onError = () => metrics.errors++;
        
        // Expose metrics for debugging
        window.dataManagerMetrics = metrics;
        
        // Log performance summary periodically
        setInterval(() => {
            if (metrics.requests > 0) {
                console.log('DataManager Performance:', {
                    ...metrics,
                    cacheHitRate: (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(1) + '%'
                });
            }
        }, 60000); // Every minute
    }
    
    // Utility methods
    generateCacheKey(url, options) {
        const keyData = {
            url,
            method: options.method || 'GET',
            body: options.body,
            headers: options.headers
        };
        
        return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
    }
    
    promisifyRequest(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Public API methods
    async get(url, options = {}) {
        return this.fetchData(url, { ...options, method: 'GET' });
    }
    
    async post(url, data, options = {}) {
        return this.fetchData(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.CSRF_TOKEN,
                ...options.headers
            },
            body: JSON.stringify(data)
        });
    }
    
    async put(url, data, options = {}) {
        return this.fetchData(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.CSRF_TOKEN,
                ...options.headers
            },
            body: JSON.stringify(data)
        });
    }
    
    async delete(url, options = {}) {
        return this.fetchData(url, {
            ...options,
            method: 'DELETE',
            headers: {
                'X-CSRFToken': window.CSRF_TOKEN,
                ...options.headers
            }
        });
    }
    
    // Cache control methods
    clearCache() {
        this.cache.clear();
        
        if (this.db) {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            store.clear();
        }
    }
    
    invalidateCache(pattern) {
        // Remove matching entries from memory cache
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
        
        // Remove from IndexedDB would require iteration
        // For now, just mark for cleanup
    }
    
    getCacheStats() {
        return {
            memorySize: this.cache.size,
            backgroundTasks: this.backgroundTasks.size,
            loadingQueue: this.loadingQueue.size
        };
    }
}

// Initialize and export
const dataManager = new DataManager();

// Setup predictive preloading
dataManager.setupPredictivePreloading();
dataManager.setupPerformanceMonitoring();

// Global access
window.dataManager = dataManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
