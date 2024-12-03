const apiKey = 'K0RY5TYZH6KL9I2Y'; // Your Alpha Vantage API key
const stockSymbols = ['AAPL', 'NVDA', 'GOOGL', 'META', 'STOCK5']; // List of stock symbols
let cash = 1000; // Starting balance
let stockOwned = { 'AAPL': 0, 'NVDA': 0, 'GOOGL': 0, 'META': 0, 'STOCK5': 0 }; // Track the number of shares owned
let invested = { 'AAPL': 0, 'NVDA': 0, 'GOOGL': 0, 'META': 0, 'STOCK5': 0 }; // Track total money invested
let stockPrices = { 'AAPL': 150, 'NVDA': 500, 'GOOGL': 2800, 'META': 350, 'STOCK5': 100 }; // Initial stock prices
let timer = 300; // Countdown timer for 5 minutes (300 seconds)

// Simulate stock prices (just for this example)
const simulatedStockPrices = { 'AAPL': 150, 'NVDA': 500, 'GOOGL': 2800, 'META': 350, 'STOCK5': 100 };

// Log to check when the button works
document.getElementById('apple-buy-button').addEventListener('click', function() {
    buyStock('AAPL');
});
document.getElementById('nvidia-buy-button').addEventListener('click', function() {
    buyStock('NVDA');
});
document.getElementById('google-buy-button').addEventListener('click', function() {
    buyStock('GOOGL');
});
document.getElementById('meta-buy-button').addEventListener('click', function() {
    buyStock('META');
});
document.getElementById('stock5-buy-button').addEventListener('click', function() {
    buyStock('STOCK5');
});

// Initialize Chart.js
const ctx = document.getElementById('stock-chart').getContext('2d');
const stockChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Portfolio Balance',
            data: [],
            borderColor: '#1e90ff',
            backgroundColor: 'rgba(30, 144, 255, 0.3)',
            fill: true,
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { 
                type: 'time', 
                time: { unit: 'minute' }, 
                title: { display: true, text: 'Time' } 
            },
            y: { 
                beginAtZero: false, 
                title: { display: true, text: 'Balance (USD)' } 
            }
        }
    }
});

// Dark mode toggle
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '🌞' : '🌙';
}

// Restore theme on page load and initialize timer + graph
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('
