const apiKey = 'K0RY5TYZH6KL9I2Y'; // Your Alpha Vantage API key
const stockSymbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL']; // Add more stock symbols here
let cash = 1000; // Starting balance
let stockOwned = { 'AAPL': 0, 'MSFT': 0, 'TSLA': 0, 'AMZN': 0, 'GOOGL': 0 }; // Track the number of shares owned for each stock
let invested = { 'AAPL': 0, 'MSFT': 0, 'TSLA': 0, 'AMZN': 0, 'GOOGL': 0 }; // Track total money invested for each stock
let stockPrices = { 'AAPL': 150, 'MSFT': 300, 'TSLA': 700, 'AMZN': 3500, 'GOOGL': 2800 }; // Initial prices for each stock
let timer = 300; // Countdown timer for 5 minutes (300 seconds)

// Attach event listeners to buy buttons for each stock
stockSymbols.forEach(symbol => {
    document.getElementById(`buy-button-${symbol}`).addEventListener('click', function() {
        console.log(`${symbol} Buy button clicked!`);
        buyStock(symbol); // Call buyStock function on button click
    });
});

// Initialize Chart.js
const ctx = document.getElementById('stock-chart').getContext('2d');
const stockChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Start empty
        datasets: [{
            label: 'Portfolio Balance',
            data: [], // Start empty
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

// Initialize the graph with starting portfolio balance
function initializeGraph() {
    const currentTime = new Date();
    const startingBalance = cash; // Initial cash as starting balance
    stockChart.data.labels.push(currentTime);
    stockChart.data.datasets[0].data.push(startingBalance);
    stockChart.update();
}

// Fetch stock data from Alpha Vantage API
async function fetchStockData() {
    for (const symbol of stockSymbols) {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        const timeSeries = data['Time Series (5min)'];
        if (timeSeries) {
            const latestTime = Object.keys(timeSeries)[0];
            const latestPrice = parseFloat(timeSeries[latestTime]['4. close']);
            stockPrices[symbol] = latestPrice;

            // Update UI with actual stock price
            document.getElementById(`${symbol.toLowerCase()}-price`).textContent = latestPrice.toFixed(2);

            // Update the graph
            updateGraph();
        }
    }
}

// Update the graph with the latest portfolio balance
function updateGraph() {
    const currentTime = new Date();
    const totalStockValue = stockSymbols.reduce((total, symbol) => {
        return total + (stockOwned[symbol] * stockPrices[symbol]);
    }, 0);
    const totalBalance = cash + totalStockValue;
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    stockChart.data.labels.push(currentTime);
    stockChart.data.datasets[0].data.push(totalBalance);
    stockChart.update();
}

// Simulate buying stock
function buyStock(symbol) {
    const sharesInput = document.getElementById(`${symbol.toLowerCase()}-shares`);
    const sharesAmount = parseInt(sharesInput.value);

    if (isNaN(sharesAmount) || sharesAmount <= 0) {
        alert('Please enter a valid number of shares.');
        return;
    }

    const totalCost = sharesAmount * stockPrices[symbol];
    if (totalCost > cash) {
        alert('Insufficient funds!');
        return;
    }

    cash -= totalCost;
    stockOwned[symbol] += sharesAmount;
    invested[symbol] += totalCost;

    document.getElementById('cash').textContent = `$${cash.toFixed(2)}`;
    document.getElementById(`${symbol.toLowerCase()}-investment-value`).textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById(`${symbol.toLowerCase()}-shares-owned`).textContent = stockOwned[symbol];

    alert('Purchase successful!');
    updateGraph();
}

// Simulate selling stock
function sellStock(symbol) {
    const sharesInput = document.getElementById(`${symbol.toLowerCase()}-shares`);
    const sharesAmount = parseInt(sharesInput.value);

    if (isNaN(sharesAmount) || sharesAmount <= 0) {
        alert('Please enter a valid number of shares.');
        return;
    }

    if (sharesAmount > stockOwned[symbol]) {
        alert('You do not own enough shares to sell!');
        return;
    }

    const totalRevenue = sharesAmount * stockPrices[symbol];
    cash += totalRevenue;
    stockOwned[symbol] -= sharesAmount;
    invested[symbol] -= totalRevenue;

    document.getElementById('cash').textContent = `$${cash.toFixed(2)}`;
    document.getElementById(`${symbol.toLowerCase()}-investment-value`).textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById(`${symbol.toLowerCase()}-shares-owned`).textContent = stockOwned[symbol];

    alert('Sale successful!');
    updateGraph();
}

// Start countdown timer
function startTimer() {
    updateTimerDisplay();
    const timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
        } else {
            fetchStockData(); // Fetch stock data when timer reaches 0
            timer = 300; // Reset the timer to 5 minutes
        }
        updateTimerDisplay();
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('time-left').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Dark mode toggle
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '🌞' : '🌙';
}

// Initialize everything when the page loads
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = '🌞';
    }
    initializeGraph();
    fetchStockData(); // Fetch stock prices immediately
    startTimer(); // Start the countdown timer immediately
};

