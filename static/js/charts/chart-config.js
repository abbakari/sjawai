/**
 * STMBudget Advanced Chart Configuration
 * Comprehensive charting system with Chart.js optimizations
 */

(function() {
    'use strict';

    // Global chart defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#6b7280';
        Chart.defaults.borderColor = '#e5e7eb';
        Chart.defaults.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        
        // Performance optimizations
        Chart.defaults.animation.duration = 750;
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.interaction.mode = 'index';
    }

    /**
     * Chart Theme Configuration
     */
    window.ChartThemes = {
        colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            light: '#f8fafc',
            dark: '#111827'
        },
        
        gradients: {
            primary: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)'],
            success: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'],
            danger: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)'],
            warning: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.1)'],
            info: ['rgba(6, 182, 212, 0.8)', 'rgba(6, 182, 212, 0.1)']
        },
        
        palettes: {
            vibrant: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
            pastel: ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#67e8f9'],
            monochrome: ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
        }
    };

    /**
     * Chart Factory
     */
    window.ChartFactory = {
        /**
         * Create a gradient background
         */
        createGradient: function(ctx, colors, direction = 'vertical') {
            const gradient = direction === 'vertical' 
                ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
                : ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
            
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            return gradient;
        },

        /**
         * Create line chart
         */
        createLineChart: function(ctx, config) {
            const defaultConfig = {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: true,
                                color: '#f3f4f6'
                            },
                            ticks: {
                                color: '#6b7280'
                            }
                        },
                        y: {
                            grid: {
                                display: true,
                                color: '#f3f4f6'
                            },
                            ticks: {
                                color: '#6b7280',
                                callback: function(value) {
                                    return new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4,
                            borderWidth: 3
                        },
                        point: {
                            radius: 6,
                            hoverRadius: 8,
                            borderWidth: 2,
                            backgroundColor: '#ffffff'
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            };

            const mergedConfig = this.mergeConfig(defaultConfig, config);
            return new Chart(ctx, mergedConfig);
        },

        /**
         * Create bar chart
         */
        createBarChart: function(ctx, config) {
            const defaultConfig = {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#6b7280'
                            }
                        },
                        y: {
                            grid: {
                                display: true,
                                color: '#f3f4f6'
                            },
                            ticks: {
                                color: '#6b7280'
                            }
                        }
                    },
                    elements: {
                        bar: {
                            borderRadius: 4,
                            borderSkipped: false
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            };

            const mergedConfig = this.mergeConfig(defaultConfig, config);
            return new Chart(ctx, mergedConfig);
        },

        /**
         * Create doughnut chart
         */
        createDoughnutChart: function(ctx, config) {
            const defaultConfig = {
                type: 'doughnut',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        const dataset = data.datasets[0];
                                        return data.labels.map((label, i) => {
                                            const value = dataset.data[i];
                                            const total = dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            
                                            return {
                                                text: `${label} (${percentage}%)`,
                                                fillStyle: dataset.backgroundColor[i],
                                                strokeStyle: dataset.borderColor[i],
                                                lineWidth: dataset.borderWidth,
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}% (${context.formattedValue})`;
                                }
                            }
                        }
                    },
                    elements: {
                        arc: {
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            };

            const mergedConfig = this.mergeConfig(defaultConfig, config);
            return new Chart(ctx, mergedConfig);
        },

        /**
         * Create gauge chart (using doughnut)
         */
        createGaugeChart: function(ctx, config) {
            const value = config.data.value || 0;
            const max = config.data.max || 100;
            const percentage = (value / max) * 100;
            
            const gaugeConfig = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [percentage, 100 - percentage],
                        backgroundColor: [
                            config.data.color || ChartThemes.colors.primary,
                            '#f3f4f6'
                        ],
                        borderWidth: 0,
                        cutout: '75%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    rotation: -90,
                    circumference: 180,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    },
                    animation: {
                        animateRotate: true,
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                },
                plugins: [{
                    afterDatasetsDraw: function(chart) {
                        const ctx = chart.ctx;
                        const centerX = chart.width / 2;
                        const centerY = chart.height / 2;
                        
                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.font = 'bold 24px Inter';
                        ctx.fillStyle = '#111827';
                        ctx.fillText(`${percentage.toFixed(1)}%`, centerX, centerY - 10);
                        
                        ctx.font = '14px Inter';
                        ctx.fillStyle = '#6b7280';
                        ctx.fillText(config.data.label || 'Progress', centerX, centerY + 15);
                        ctx.restore();
                    }
                }]
            };

            return new Chart(ctx, gaugeConfig);
        },

        /**
         * Create area chart
         */
        createAreaChart: function(ctx, config) {
            // Ensure datasets have fill property
            if (config.data && config.data.datasets) {
                config.data.datasets.forEach(dataset => {
                    if (dataset.fill === undefined) {
                        dataset.fill = true;
                    }
                    if (dataset.backgroundColor && typeof dataset.backgroundColor === 'string') {
                        const color = dataset.backgroundColor;
                        dataset.backgroundColor = this.createGradient(ctx, [
                            color.replace('1)', '0.8)'),
                            color.replace('1)', '0.1)')
                        ]);
                    }
                });
            }

            return this.createLineChart(ctx, config);
        },

        /**
         * Create mixed chart
         */
        createMixedChart: function(ctx, config) {
            const defaultConfig = {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: true,
                                color: '#f3f4f6'
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: {
                                display: true,
                                color: '#f3f4f6'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            };

            const mergedConfig = this.mergeConfig(defaultConfig, config);
            return new Chart(ctx, mergedConfig);
        },

        /**
         * Merge configurations
         */
        mergeConfig: function(defaultConfig, userConfig) {
            const merged = JSON.parse(JSON.stringify(defaultConfig));
            
            if (userConfig.data) {
                merged.data = userConfig.data;
            }
            
            if (userConfig.options) {
                this.deepMerge(merged.options, userConfig.options);
            }
            
            if (userConfig.plugins) {
                merged.plugins = userConfig.plugins;
            }
            
            return merged;
        },

        /**
         * Deep merge objects
         */
        deepMerge: function(target, source) {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        if (!target[key]) target[key] = {};
                        this.deepMerge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }
    };

    /**
     * Chart Utilities
     */
    window.ChartUtils = {
        /**
         * Format currency values
         */
        formatCurrency: function(value, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        },

        /**
         * Format percentage values
         */
        formatPercentage: function(value, decimals = 1) {
            return `${value.toFixed(decimals)}%`;
        },

        /**
         * Generate time series labels
         */
        generateTimeLabels: function(start, end, interval = 'day') {
            const labels = [];
            const current = new Date(start);
            const endDate = new Date(end);

            while (current <= endDate) {
                switch (interval) {
                    case 'day':
                        labels.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        current.setDate(current.getDate() + 1);
                        break;
                    case 'week':
                        labels.push(`Week ${this.getWeekNumber(current)}`);
                        current.setDate(current.getDate() + 7);
                        break;
                    case 'month':
                        labels.push(current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
                        current.setMonth(current.getMonth() + 1);
                        break;
                    case 'quarter':
                        labels.push(`Q${Math.ceil((current.getMonth() + 1) / 3)} ${current.getFullYear()}`);
                        current.setMonth(current.getMonth() + 3);
                        break;
                    case 'year':
                        labels.push(current.getFullYear().toString());
                        current.setFullYear(current.getFullYear() + 1);
                        break;
                }
            }

            return labels;
        },

        /**
         * Get week number
         */
        getWeekNumber: function(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        },

        /**
         * Calculate trend
         */
        calculateTrend: function(data) {
            if (data.length < 2) return 0;
            
            const latest = data[data.length - 1];
            const previous = data[data.length - 2];
            
            return ((latest - previous) / previous) * 100;
        },

        /**
         * Smooth data using moving average
         */
        smoothData: function(data, window = 3) {
            const smoothed = [];
            
            for (let i = 0; i < data.length; i++) {
                const start = Math.max(0, i - Math.floor(window / 2));
                const end = Math.min(data.length, i + Math.ceil(window / 2));
                const slice = data.slice(start, end);
                const average = slice.reduce((a, b) => a + b, 0) / slice.length;
                smoothed.push(average);
            }
            
            return smoothed;
        }
    };

    /**
     * Responsive Chart Manager
     */
    window.ResponsiveCharts = {
        charts: new Map(),

        /**
         * Register chart for responsive management
         */
        register: function(chartId, chart) {
            this.charts.set(chartId, chart);
        },

        /**
         * Resize all charts
         */
        resizeAll: function() {
            this.charts.forEach(chart => {
                chart.resize();
            });
        },

        /**
         * Destroy chart
         */
        destroy: function(chartId) {
            const chart = this.charts.get(chartId);
            if (chart) {
                chart.destroy();
                this.charts.delete(chartId);
            }
        },

        /**
         * Initialize responsive behavior
         */
        init: function() {
            let resizeTimer;
            
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.resizeAll();
                }, 250);
            });
        }
    };

    // Initialize responsive charts
    ResponsiveCharts.init();

    // Export for global access
    window.STMCharts = {
        themes: ChartThemes,
        factory: ChartFactory,
        utils: ChartUtils,
        responsive: ResponsiveCharts
    };

})();

// Initialize Chart.js plugins
if (typeof Chart !== 'undefined') {
    // Custom plugin for data labels
    Chart.register({
        id: 'customDataLabels',
        afterDatasetsDraw: function(chart, args, options) {
            if (!options.enabled) return;
            
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                
                meta.data.forEach((element, index) => {
                    const data = dataset.data[index];
                    const position = element.tooltipPosition();
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = options.color || '#111827';
                    ctx.font = options.font || '12px Inter';
                    
                    const label = options.formatter ? options.formatter(data) : data;
                    ctx.fillText(label, position.x, position.y - 5);
                    ctx.restore();
                });
            });
        }
    });
}
