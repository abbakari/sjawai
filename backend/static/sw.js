// STMBudget Service Worker
// Provides offline functionality and caching for mobile app-like experience

const CACHE_NAME = 'stmbudget-v2.0.0';
const STATIC_CACHE = 'stmbudget-static-v2.0.0';
const DYNAMIC_CACHE = 'stmbudget-dynamic-v2.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/dashboard/',
    '/static/css/app.css',
    '/static/js/app.js',
    '/login/',
    '/offline.html'
];

// Dynamic cache patterns
const CACHE_PATTERNS = [
    /^\/dashboard\//,
    /^\/sales-budget\//,
    /^\/rolling-forecast\//,
    /^\/api\//,
    /^\/static\//
];

// Network-first patterns (always try network first)
const NETWORK_FIRST = [
    /^\/api\//,
    /^\/admin\//
];

// Cache-first patterns (prefer cache)
const CACHE_FIRST = [
    /^\/static\//,
    /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static files...');
                return cache.addAll(STATIC_FILES.map(url => {
                    return new Request(url, {
                        cache: 'reload'
                    });
                }));
            }),
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('stmbudget-') && 
                                   cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip requests to external domains
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different caching strategies based on request type
    event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
    const url = request.url;
    
    try {
        // Network-first strategy for API calls and admin pages
        if (NETWORK_FIRST.some(pattern => pattern.test(url))) {
            return await networkFirst(request);
        }
        
        // Cache-first strategy for static assets
        if (CACHE_FIRST.some(pattern => pattern.test(url))) {
            return await cacheFirst(request);
        }
        
        // Stale-while-revalidate for pages
        return await staleWhileRevalidate(request);
        
    } catch (error) {
        console.log('Request failed:', error);
        return await handleOffline(request);
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cache-first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
    }
    
    return response;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Always try to update cache in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return await fetchPromise;
}

// Update cache in background
function updateCacheInBackground(request) {
    fetch(request).then(response => {
        if (response.ok) {
            caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, response);
            });
        }
    }).catch(() => {
        // Silently fail for background updates
    });
}

// Handle offline scenarios
async function handleOffline(request) {
    const url = new URL(request.url);
    
    // Try to find cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // For navigation requests, show offline page
    if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // For API requests, return offline response
    if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'You are currently offline. Please check your connection.'
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    // Return generic offline response
    return new Response('You are offline', {
        status: 503,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncPendingRequests());
    }
});

// Sync pending requests when back online
async function syncPendingRequests() {
    try {
        // Get pending requests from IndexedDB or localStorage
        const pendingRequests = await getPendingRequests();
        
        for (const requestData of pendingRequests) {
            try {
                const response = await fetch(requestData.url, requestData.options);
                if (response.ok) {
                    // Remove successful request
                    await removePendingRequest(requestData.id);
                    
                    // Notify clients of successful sync
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'SYNC_SUCCESS',
                                data: requestData
                            });
                        });
                    });
                }
            } catch (error) {
                console.log('Sync failed for request:', requestData.id, error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/static/images/icon-192x192.png',
        badge: '/static/images/badge.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.actions || [],
        tag: data.tag || 'default'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const data = event.notification.data;
    const action = event.action;
    
    event.waitUntil(
        clients.matchAll().then(clientList => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url === data.url && 'focus' in client) {
                    client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        action: action,
                        data: data
                    });
                    return;
                }
            }
            
            // Open new window if app is not open
            if (clients.openWindow) {
                return clients.openWindow(data.url || '/dashboard/');
            }
        })
    );
});

// Message handler for communication with main app
self.addEventListener('message', event => {
    const data = event.data;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(cacheUrls(data.urls));
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearCache());
            break;
            
        case 'GET_CACHE_SIZE':
            event.waitUntil(getCacheSize().then(size => {
                event.ports[0].postMessage({ size });
            }));
            break;
    }
});

// Cache specific URLs
async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return Promise.all(
        urls.map(url => {
            return fetch(url).then(response => {
                if (response.ok) {
                    return cache.put(url, response);
                }
            }).catch(() => {
                // Silently fail
            });
        })
    );
}

// Clear all caches
async function clearCache() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames
            .filter(name => name.startsWith('stmbudget-'))
            .map(name => caches.delete(name))
    );
}

// Get total cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const name of cacheNames) {
        if (name.startsWith('stmbudget-')) {
            const cache = await caches.open(name);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
    }
    
    return totalSize;
}

// Helper functions for pending requests (implement with IndexedDB)
async function getPendingRequests() {
    // Implementation depends on your storage solution
    return [];
}

async function removePendingRequest(id) {
    // Implementation depends on your storage solution
}

// Log service worker lifecycle
console.log('STMBudget Service Worker loaded');
