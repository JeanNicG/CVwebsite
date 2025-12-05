// Store historical data
let historicalData = {
    temp: [],
    hum: [],
    co2: [],
    pm25: [],
    o3: [],
    tvoc: []
};

// Chart instances
let charts = {};

// Function to fetch data from your API
async function fetchSensorData() {
    try {
        const response = await fetch('https://jeannicolasgosselin.ca/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateDisplay(data);
        updateHistoricalData(data);
        updateCharts();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Show error state
        document.querySelectorAll('.value').forEach(el => {
            el.textContent = 'Error';
        });
    }
}

// Function to update historical data
function updateHistoricalData(data) {
    const now = new Date();
    const dataPoint = {
        timestamp: now,
        temp: data.temp,
        hum: data.hum,
        co2: data.co2,
        pm25: data.pm25,
        o3: data.o3,
        tvoc: data.tvoc
    };
    
    // Add new data point to each array
    Object.keys(historicalData).forEach(key => {
        historicalData[key].push({
            x: now,
            y: dataPoint[key]
        });
        
        // Keep only last 24 hours of data (assuming data points every 30 seconds)
        const cutoffTime = new Date(now - 24 * 60 * 60 * 1000); // 24 hours ago
        historicalData[key] = historicalData[key].filter(point => point.x > cutoffTime);
    });
}

// Function to initialize charts
function initializeCharts() {
    const chartConfig = {
        temp: { label: 'Temperature (°C)', color: 'rgb(75, 192, 192)', min: null, max: null },
        hum: { label: 'Humidity (%)', color: 'rgb(54, 162, 235)', min: 0, max: 100 },
        co2: { label: 'CO₂ (ppm)', color: 'rgb(255, 99, 132)', min: null, max: null },
        pm25: { label: 'PM2.5 (μg/m³)', color: 'rgb(255, 206, 86)', min: 0, max: null },
        o3: { label: 'Ozone (ppb)', color: 'rgb(153, 102, 255)', min: 0, max: null },
        tvoc: { label: 'TVOC (ppb)', color: 'rgb(255, 159, 64)', min: 0, max: null }
    };

    Object.keys(chartConfig).forEach(key => {
        const ctx = document.getElementById(`${key}-chart`).getContext('2d');
        charts[key] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: chartConfig[key].label,
                    data: historicalData[key],
                    borderColor: chartConfig[key].color,
                    backgroundColor: chartConfig[key].color + '20',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: chartConfig[key].label.split(' (')[0]
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                hour: 'HH:mm',
                                minute: 'HH:mm'
                            },
                            tooltipFormat: 'MMM dd, HH:mm'
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartConfig[key].label
                        },
                        min: chartConfig[key].min,
                        max: chartConfig[key].max
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    });
}

// Function to update charts with new data
function updateCharts() {
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].data.datasets[0].data = historicalData[key];
            charts[key].update('none'); // No animation for better performance
        }
    });
}

// Function to update the display with new data
function updateDisplay(data) {
    // Update values
    document.getElementById('co2-value').textContent = data.co2;
    document.getElementById('pm25-value').textContent = data.pm25;
    document.getElementById('o3-value').textContent = data.o3;
    document.getElementById('temp-value').textContent = data.temp;
    document.getElementById('hum-value').textContent = data.hum;
    document.getElementById('tvoc-value').textContent = data.tvoc;
    
    // Update last update time
    const now = new Date();
    const lastUpdate = new Date(now.getTime() - (data.lastUpdate * 1000));
    document.getElementById('last-update').textContent = formatTime(lastUpdate);
    
    // Apply color coding based on values
    applyColorCoding(data);
}

// Function to get air quality level and color
function getAirQualityLevel(value, type) {
    let level, color, label;
    
    switch(type) {
        case 'pm25':
            if (value <= 12) {
                level = 'good'; color = '#15ff00ff'; label = 'Good';
            } else if (value <= 35) {
                level = 'moderate'; color = '#ffe600ff'; label = 'Moderate';
            } else if (value <= 55) {
                level = 'sensitive'; color = '#ff7700ff'; label = 'Sensitive';
            } else if (value <= 150) {
                level = 'unhealthy'; color = '#ff0000ff'; label = 'Unhealthy';
            } else {
                level = 'hazardous'; color = '#6f00ffff'; label = 'Hazardous';
            }
            break;
            
        case 'co2':
            if (value <= 700) {
                level = 'good'; color = '#15ff00ff'; label = 'Good';
            } else if (value <= 1000) {
                level = 'moderate'; color = '#ffe600ff'; label = 'Moderate';
            } else if (value <= 1500) {
                level = 'sensitive'; color = '#ff7700ff'; label = 'Sensitive';
            } else if (value <= 2500) {
                level = 'unhealthy'; color = '#ff0000ff'; label = 'Unhealthy';
            } else {
                level = 'hazardous'; color = '#6f00ffff'; label = 'Hazardous';
            }
            break;
            
        case 'tvoc':
            if (value <= 200) {
                level = 'good'; color = '#15ff00ff'; label = 'Good';
            } else if (value <= 400) {
                level = 'moderate'; color = '#ffe600ff'; label = 'Moderate';
            } else if (value <= 600) {
                level = 'sensitive'; color = '#ff7700ff'; label = 'Sensitive';
            } else if (value <= 800) {
                level = 'unhealthy'; color = '#ff0000ff'; label = 'Unhealthy';
            } else {
                level = 'hazardous'; color = '#6f00ffff'; label = 'Hazardous';
            }
            break;
            
        case 'o3':
            if (value <= 50) {
                level = 'good'; color = '#15ff00ff'; label = 'Good';
            } else if (value <= 100) {
                level = 'moderate'; color = '#ffe600ff'; label = 'Moderate';
            } else if (value <= 150) {
                level = 'sensitive'; color = '#ff7700ff'; label = 'Sensitive';
            } else if (value <= 200) {
                level = 'unhealthy'; color = '#ff0000ff'; label = 'Unhealthy';
            } else {
                level = 'hazardous'; color = '#6f00ffff'; label = 'Hazardous';
            }
            break;
            
        default:
            level = 'good'; color = '#15ff00ff'; label = 'Good';
    }
    
    return { level, color, label };
}

// Function to apply color coding based on air quality levels
function applyColorCoding(data) {
    // CO2 levels
    const co2Info = getAirQualityLevel(data.co2, 'co2');
    const co2Card = document.getElementById('co2-card');
    co2Card.className = 'card ' + co2Info.level;
    co2Card.style.borderLeft = `5px solid ${co2Info.color}`;
    
    // PM2.5 levels
    const pm25Info = getAirQualityLevel(data.pm25, 'pm25');
    const pm25Card = document.getElementById('pm25-card');
    pm25Card.className = 'card ' + pm25Info.level;
    pm25Card.style.borderLeft = `5px solid ${pm25Info.color}`;
    
    // Ozone levels
    const o3Info = getAirQualityLevel(data.o3, 'o3');
    const o3Card = document.getElementById('o3-card');
    o3Card.className = 'card ' + o3Info.level;
    o3Card.style.borderLeft = `5px solid ${o3Info.color}`;
    
    // TVOC levels
    const tvocInfo = getAirQualityLevel(data.tvoc, 'tvoc');
    const tvocCard = document.getElementById('tvoc-card');
    tvocCard.className = 'card ' + tvocInfo.level;
    tvocCard.style.borderLeft = `5px solid ${tvocInfo.color}`;
}

// Function to format time nicely
function formatTime(date) {
    return date.toLocaleString();
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    // Initial load
    fetchSensorData();
    // Update every 30 seconds
    setInterval(fetchSensorData, 30000);
});