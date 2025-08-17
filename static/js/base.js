/**
 * STMBudget Base JavaScript
 * Core functionality and utilities for the application
 */

(function() {
    'use strict';

    // Global namespace
    window.STMBudget = window.STMBudget || {};

    /**
     * Application Configuration
     */
    STMBudget.config = {
        debug: false,
        apiBaseUrl: '/api/',
        csrfToken: document.querySelector('[name=csrfmiddlewaretoken]')?.value,
        theme: localStorage.getItem('stm-theme') || 'light',
        notifications: {
            duration: 5000,
            position: 'top-right'
        }
    };

    /**
     * Utility Functions
     */
    STMBudget.utils = {
        /**
         * Debounce function execution
         */
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction() {
                const context = this;
                const args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        /**
         * Throttle function execution
         */
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Format number with thousand separators
         */
        formatNumber: function(num, decimals = 0) {
            if (isNaN(num)) return '0';
            return parseFloat(num).toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },

        /**
         * Format currency
         */
        formatCurrency: function(amount, currency = 'USD') {
            if (isNaN(amount)) return '$0.00';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },

        /**
         * Format date
         */
        formatDate: function(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            const formatOptions = { ...defaultOptions, ...options };
            return new Date(date).toLocaleDateString('en-US', formatOptions);
        },

        /**
         * Format relative time
         */
        formatRelativeTime: function(date) {
            const now = new Date();
            const diffTime = Math.abs(now - new Date(date));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 1) return 'just now';
            if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            
            return this.formatDate(date);
        },

        /**
         * Generate unique ID
         */
        generateId: function(prefix = 'stm') {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        /**
         * Get CSRF token
         */
        getCSRFToken: function() {
            return STMBudget.config.csrfToken || 
                   document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                   '';
        },

        /**
         * Scroll to element smoothly
         */
        scrollTo: function(element, offset = 0) {
            const targetElement = typeof element === 'string' ? 
                document.querySelector(element) : element;
            
            if (targetElement) {
                const targetPosition = targetElement.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        },

        /**
         * Check if element is in viewport
         */
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        /**
         * Local storage wrapper with error handling
         */
        storage: {
            get: function(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    console.warn('Error reading from localStorage:', e);
                    return defaultValue;
                }
            },

            set: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.warn('Error writing to localStorage:', e);
                    return false;
                }
            },

            remove: function(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.warn('Error removing from localStorage:', e);
                    return false;
                }
            }
        }
    };

    /**
     * Event Management
     */
    STMBudget.events = {
        listeners: {},

        /**
         * Add event listener
         */
        on: function(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        /**
         * Remove event listener
         */
        off: function(event, callback) {
            if (!this.listeners[event]) return;
            
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        },

        /**
         * Trigger event
         */
        trigger: function(event, data) {
            if (!this.listeners[event]) return;
            
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Error in event callback:', e);
                }
            });
        }
    };

    /**
     * Loading States
     */
    STMBudget.loading = {
        /**
         * Show loading state
         */
        show: function(element, text = 'Loading...') {
            const targetElement = typeof element === 'string' ? 
                document.querySelector(element) : element;
            
            if (!targetElement) return;

            targetElement.classList.add('loading');
            targetElement.setAttribute('data-original-html', targetElement.innerHTML);
            
            targetElement.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    ${text}
                </div>
            `;
        },

        /**
         * Hide loading state
         */
        hide: function(element) {
            const targetElement = typeof element === 'string' ? 
                document.querySelector(element) : element;
            
            if (!targetElement) return;

            const originalHtml = targetElement.getAttribute('data-original-html');
            if (originalHtml) {
                targetElement.innerHTML = originalHtml;
                targetElement.removeAttribute('data-original-html');
            }
            
            targetElement.classList.remove('loading');
        }
    };

    /**
     * Keyboard Navigation Support
     */
    STMBudget.keyboard = {
        init: function() {
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        },

        handleKeydown: function(e) {
            // Escape key handling
            if (e.key === 'Escape') {
                this.closeModals();
                this.closeDropdowns();
            }

            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                STMBudget.events.trigger('save-shortcut');
            }

            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                STMBudget.events.trigger('search-shortcut');
            }
        },

        closeModals: function() {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const backdrop = modal.querySelector('.modal-backdrop');
                if (backdrop) backdrop.click();
            });
        },

        closeDropdowns: function() {
            const dropdowns = document.querySelectorAll('.dropdown-menu.show');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    };

    /**
     * Form Enhancements
     */
    STMBudget.forms = {
        init: function() {
            this.setupValidation();
            this.setupAutoSave();
        },

        setupValidation: function() {
            const forms = document.querySelectorAll('form[data-validate]');
            forms.forEach(form => {
                form.addEventListener('submit', this.handleSubmit.bind(this));
                
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', this.validateField.bind(this));
                });
            });
        },

        validateField: function(e) {
            const field = e.target;
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }

            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            }

            // Number validation
            if (field.type === 'number' && value) {
                if (isNaN(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid number';
                }
            }

            this.updateFieldValidation(field, isValid, errorMessage);
        },

        updateFieldValidation: function(field, isValid, errorMessage) {
            field.classList.toggle('is-valid', isValid);
            field.classList.toggle('is-invalid', !isValid);

            // Remove existing error message
            const existingError = field.parentNode.querySelector('.invalid-feedback');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message if needed
            if (!isValid && errorMessage) {
                const errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback';
                errorElement.textContent = errorMessage;
                field.parentNode.appendChild(errorElement);
            }
        },

        handleSubmit: function(e) {
            const form = e.target;
            let isFormValid = true;

            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                this.validateField({ target: input });
                if (input.classList.contains('is-invalid')) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                e.preventDefault();
                const firstInvalidField = form.querySelector('.is-invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
            }
        },

        setupAutoSave: function() {
            const autoSaveForms = document.querySelectorAll('form[data-autosave]');
            autoSaveForms.forEach(form => {
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('input', STMBudget.utils.debounce(() => {
                        this.autoSave(form);
                    }, 2000));
                });
            });
        },

        autoSave: function(form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            STMBudget.utils.storage.set(`autosave_${form.id}`, data);
            STMBudget.events.trigger('form-autosaved', { form, data });
        }
    };

    /**
     * Performance Monitoring
     */
    STMBudget.performance = {
        marks: {},

        start: function(name) {
            this.marks[name] = performance.now();
        },

        end: function(name) {
            if (this.marks[name]) {
                const duration = performance.now() - this.marks[name];
                if (STMBudget.config.debug) {
                    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
                }
                delete this.marks[name];
                return duration;
            }
        }
    };

    /**
     * Main Initialization
     */
    STMBudget.init = function() {
        console.log('Initializing STMBudget application...');
        
        // Initialize core modules
        this.keyboard.init();
        this.forms.init();

        // Set up global error handling
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handleError.bind(this));

        // Initialize tooltips if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(tooltipTriggerEl => {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }

        // Trigger initialization complete event
        this.events.trigger('app-initialized');
        
        console.log('STMBudget application initialized successfully');
    };

    /**
     * Error Handling
     */
    STMBudget.handleError = function(error) {
        console.error('STMBudget Error:', error);
        
        // In production, you might want to send errors to a logging service
        if (!STMBudget.config.debug) {
            // Send to error tracking service
        }
    };

    /**
     * Export to global scope
     */
    window.STMBudget = STMBudget;

})();

/**
 * Additional utility functions that extend STMBudget
 */

// Animation helpers
STMBudget.animate = {
    fadeIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    fadeOut: function(element, duration = 300) {
        let start = null;
        const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = initialOpacity * (1 - progress / duration);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Browser compatibility checks
STMBudget.browser = {
    isIE: function() {
        return navigator.userAgent.indexOf('MSIE') !== -1 || 
               navigator.userAgent.indexOf('Trident') !== -1;
    },

    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    supportsFetch: function() {
        return 'fetch' in window;
    },

    supportsLocalStorage: function() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
};
