const apiKey = 'K0RY5TYZH6KL9I2Y'; // Your Alpha Vantage API key
const stockSymbols = ['AAPL', 'NVDA', 'GOOGL', 'META', 'STOCK5']; // List of stock symbols
let cash = 1000; // Starting balance
let stockOwned = { 'AAPL': 0, 'NVDA': 0, 'GOOGL': 0, 'META': 0, 'STOCK5': 0 }; // Track the number of shares owned
let invested = { 'AAPL': 0, 'NVDA': 0, 'GOOGL': 0, 'META': 0, 'STOCK5': 0 }; // Track total money invested
let stockPrices = { 'AAPL': 150, 'NVDA': 500, 'GOOGL': 2800, 'META': 350, 'STOCK5': 100 }; // Initial stock prices
let timer = 300; // Countdown timer for 5 minutes (300 seconds)

// Countdown timer function
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    setInterval(() => {
        if (timer > 0) {
            timer--;
        }
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (timer === 0) {
            updateStockPrices();
            timer = 300; // Reset timer after update
        }
    }, 1000);
}

// Update stock prices every 5 minutes
function updateStockPrices() {
    // Simulating price changes for demo purposes
    stockSymbols.forEach(symbol => {
        stockPrices[symbol] = Math.round(Math.random() * 500 + 100); // Simulated price change
        document.getElementById(`${symbol.toLowerCase()}-price`).textContent = stockPrices[symbol].toFixed(2);
    });
    calculateTotalValue(); // Recalculate total value after price update
}

// Buy stock function
function buyStock(stock) {
    const sharesToBuy = parseInt(document.getElementById(`${stock.toLowerCase()}-shares`).value);
    const price = stockPrices[stock];
    const cost = sharesToBuy * price;

    if (cash >= cost) {
        cash -= cost;
        stockOwned[stock] += sharesToBuy;
        invested[stock] += cost;

        // Update UI
        document.getElementById('current-balance').textContent = cash.toFixed(2);
        document.getElementById(`${stock.toLowerCase()}-shares-owned`).textContent = stockOwned[stock];
        document.getElementById(`${stock.toLowerCase()}-investment-value`).textContent = invested[stock].toFixed(2);
        calculateTotalValue();
    } else {
        alert('Not enough funds to buy shares!');
    }
}

// Sell stock function
function sellStock(stock) {
    const sharesToSell = stockOwned[stock];
    if (sharesToSell > 0) {
        const price = stockPrices[stock];
        const amount = sharesToSell * price;
        cash += amount;
        stockOwned[stock] = 0;
        invested[stock] = 0;

        // Update UI
        document.getElementById('current-balance').textContent = cash.toFixed(2);
        document.getElementById(`${stock.toLowerCase()}-shares-owned`).textContent = 0;
        document.getElementById(`${stock.toLowerCase()}-investment-value`).textContent = 0.00;
        calculateTotalValue();
    } else {
        alert('You don\'t own any shares of this stock!');
    }
}

// Calculate the total portfolio value (cash + stocks value)
function calculateTotalValue() {
    let totalStockValue = 0;
    stockSymbols.forEach(symbol => {
        totalStockValue += stockOwned[symbol] * stockPrices[symbol];
    });
    const totalValue = cash + totalStockValue;
    document.getElementById('total-value').textContent = totalValue.toFixed(2);
}

// Dark mode toggle
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '🌞' : '🌙';
}

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
