// Chart.js default configuration
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Global data storage
let ridersData = null;
let metricsData = null;
let colors = null;

// Enhanced chart options with animations
const createChartOptions = (maxValue, stepSize = 1) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
        delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
            }
            return delay;
        }
    },
    interaction: {
        mode: 'nearest',
        intersect: false
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: function(context) {
                    const value = context.parsed.y;
                    const label = context.label;
                    return `${label}: ${value}`;
                },
                title: function() {
                    return '';
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 14,
                    weight: 600
                },
                color: '#4a4a5e'
            }
        },
        y: {
            beginAtZero: true,
            max: maxValue,
            ticks: {
                stepSize: stepSize,
                font: {
                    size: 12
                },
                color: '#7a7a8e'
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
            }
        }
    }
});

// Function to create gradient backgrounds
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Load data and initialize charts
async function loadDataAndInitialize() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        // Store data globally
        ridersData = data.riders;
        metricsData = data.metrics;

        // Set up colors object from rider data
        colors = {
            merckx: {
                primary: ridersData.merckx.colorPrimary,
                secondary: ridersData.merckx.colorSecondary,
                light: ridersData.merckx.colorLight
            },
            pogacar: {
                primary: ridersData.pogacar.colorPrimary,
                secondary: ridersData.pogacar.colorSecondary,
                light: ridersData.pogacar.colorLight
            }
        };

        // Update rider info cards
        updateRiderCards();

        // Initialize all charts
        initializeCharts();

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update rider info cards with data from JSON
function updateRiderCards() {
    const riderCards = document.querySelectorAll('.rider-card');

    // Merckx card
    riderCards[0].querySelector('h2').textContent = ridersData.merckx.name;
    riderCards[0].querySelector('.nickname').textContent = `"${ridersData.merckx.nickname}"`;
    riderCards[0].querySelector('.era').textContent = `${ridersData.merckx.country} | Active: ${ridersData.merckx.active}`;

    // Pogačar card
    riderCards[1].querySelector('h2').textContent = ridersData.pogacar.name;
    riderCards[1].querySelector('.nickname').textContent = `"${ridersData.pogacar.nickname}"`;
    riderCards[1].querySelector('.era').textContent = `${ridersData.pogacar.country} | Active: ${ridersData.pogacar.active}`;
}

// Create a chart from metric data
function createChart(metric) {
    const ctx = document.getElementById(metric.id).getContext('2d');
    const gradientMerckx = createGradient(ctx, colors.merckx.primary, colors.merckx.light);
    const gradientPogacar = createGradient(ctx, colors.pogacar.primary, colors.pogacar.light);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [ridersData.merckx.name, ridersData.pogacar.name],
            datasets: [{
                data: [metric.merckx, metric.pogacar],
                backgroundColor: [gradientMerckx, gradientPogacar],
                borderColor: [colors.merckx.secondary, colors.pogacar.secondary],
                borderWidth: 3,
                borderRadius: 8,
                barThickness: 80
            }]
        },
        options: createChartOptions(metric.maxValue, metric.stepSize)
    });
}

// Initialize all charts from data
function initializeCharts() {
    // Add loading class initially
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => chart.classList.add('loading'));

    // Create each chart from metrics data
    metricsData.forEach(metric => {
        createChart(metric);
    });

    // Update legends with dynamic data
    updateLegends();

    // Remove loading class after charts are initialized
    setTimeout(() => {
        charts.forEach(chart => chart.classList.remove('loading'));
    }, 500);
}

// Update legend values from data
function updateLegends() {
    const metricCards = document.querySelectorAll('.metric-card');

    metricCards.forEach((card, index) => {
        const metric = metricsData[index];
        const legendItems = card.querySelectorAll('.legend-item span');

        if (legendItems.length >= 2) {
            legendItems[0].textContent = `${ridersData.merckx.name}: ${metric.merckx} ${getUnitLabel(metric.title)}`;
            legendItems[1].textContent = `${ridersData.pogacar.name}: ${metric.pogacar} ${getUnitLabel(metric.title)}`;

            // Add note if it exists
            if (metric.note) {
                let noteElement = card.querySelector('.note');
                if (noteElement) {
                    noteElement.textContent = metric.note;
                }
            }
        }
    });
}

// Extract unit label from title
function getUnitLabel(title) {
    if (title.includes('Stage')) return 'stages';
    if (title.includes('Tour de France Wins')) return 'wins';
    if (title.includes('Grand Tour')) return 'wins';
    if (title.includes('Monument')) return 'wins';
    if (title.includes('World')) return 'wins';
    if (title.includes('Career')) return 'wins*';
    return '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadDataAndInitialize);

// Add smooth scroll behavior for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to header on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('header');
    if (header) {
        header.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effect sound (optional - uncomment if you want subtle sound effects)
/*
const hoverSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi');

document.querySelectorAll('.metric-card, .rider-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        hoverSound.volume = 0.1;
        hoverSound.currentTime = 0;
        hoverSound.play().catch(e => {}); // Catch error if autoplay is blocked
    });
});
*/

// Performance optimization - lazy load charts when they come into view
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all metric cards
document.querySelectorAll('.metric-card').forEach(card => {
    chartObserver.observe(card);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Reset any active states
        document.querySelectorAll('.active').forEach(el => {
            el.classList.remove('active');
        });
    }
});

// Console Easter Egg
console.log('%c🚴‍♂️ Merckx vs Pogačar 🚴‍♂️', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cTwo legends, different eras, one passion!', 'font-size: 14px; color: #764ba2;');
console.log('%cEddy Merckx: The Cannibal 🇧🇪', 'font-size: 12px; color: #FF6B6B;');
console.log('%cTadej Pogačar: Pogi 🇸🇮', 'font-size: 12px; color: #4ECDC4;');
