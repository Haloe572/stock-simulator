const apiKey = 'K0RY5TYZH6KL9I2Y'; // Your Alpha Vantage API key
const stockSymbols = ['AAPL']; // Only tracking Apple stock now
let cash = 1000; // Starting balance
let stockOwned = { 'AAPL': 0 }; // Track the number of shares owned
let invested = { 'AAPL': 0 }; // Track total money invested
let stockPrices = { 'AAPL': 150 }; // Start with a stock price of $150 for simulation
let timer = 300; // Countdown timer for 5 minutes (300 seconds)

// Simulate stock prices (just for this example)
const simulatedStockPrices = { 'AAPL': 150 }; // Initial price for Apple

// Log to check when the button works
document.getElementById('buy-button').addEventListener('click', function() {
    console.log('Buy button clicked!'); // Check if the button is being clicked
    buyStock('AAPL'); // Call buyStock function on button click
});

// Log to check when the sell button works
document.getElementById('sell-button').addEventListener('click', function() {
    console.log('Sell button clicked!'); // Check if the button is being clicked
    sellStock('AAPL'); // Call sellStock function on button click
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
        document.getElementById('theme-toggle').textContent = '🌞';
    }
    initializeGraph(); // Populate the graph with initial data
    fetchStockData(); // Fetch stock prices immediately
    startTimer(); // Start the countdown timer immediately
};

// Initialize graph with the starting portfolio balance
function initializeGraph() {
    const currentTime = new Date();
    const startingBalance = cash; // Initial cash as starting balance
    stockChart.data.labels.push(currentTime); // Add the current time to labels
    stockChart.data.datasets[0].data.push(startingBalance); // Add initial balance to dataset
    stockChart.update(); // Update the chart
}

// Timer countdown
function startTimer() {
    updateTimerDisplay();
    const timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--; // Decrease the timer
        } else {
            fetchStockData(); // Fetch stock data when timer reaches 0
            timer = 300; // Reset the timer to 5 minutes
        }
        updateTimerDisplay(); // Update the display every second
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('time-left').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Fetch stock data from Alpha Vantage API (actual data)
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
            if (symbol === 'AAPL') {
                document.getElementById('apple-price').textContent = latestPrice.toFixed(2);
            }

            // Update graph with the new portfolio balance
            updateGraph();
        }
    }
}

// Update the graph with the latest portfolio balance
function updateGraph() {
    const currentTime = new Date();
    const totalStockValue = stockOwned['AAPL'] * stockPrices['AAPL']; // Total value of owned stock
    const totalBalance = cash + totalStockValue; // Total balance including cash and stock value
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    stockChart.data.labels.push(currentTime);
    stockChart.data.datasets[0].data.push(totalBalance);
    stockChart.update();
}

// Simulate buying stock (for example, AAPL)
function buyStock(symbol) {
    const sharesInput = document.getElementById('apple-shares'); // Get shares to buy
    const sharesAmount = parseInt(sharesInput.value); // Get number of shares from input

    console.log(`Shares to buy: ${sharesAmount}`); // Debugging the input

    if (isNaN(sharesAmount) || sharesAmount <= 0) {
        alert('Please enter a valid number of shares.');
        return;
    }

    const totalCost = sharesAmount * simulatedStockPrices[symbol]; // Calculate cost of shares
    console.log(`Total cost for ${sharesAmount} shares: $${totalCost}`); // Debug cost

    if (totalCost > cash) {
        alert('Insufficient funds!');
        return;
    }

    // Deduct cash balance and update shares owned
    cash -= totalCost;
    stockOwned[symbol] += sharesAmount;
    invested[symbol] += totalCost;

    console.log(`Remaining cash: $${cash}`); // Debug remaining cash
    console.log(`Shares owned: ${stockOwned[symbol]}`); // Debug shares owned

    // Update the UI with new values
    document.getElementById('cash').textContent = `$${cash.toFixed(2)}`;
    document.getElementById('apple-investment-value').textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById('apple-shares-owned').textContent = stockOwned[symbol];

    alert('Purchase successful!');

    // Update graph with new values after purchase
    updateGraph();
}

// Simulate selling stock
function sellStock(symbol) {
    const sharesInput = document.getElementById('apple-shares'); // Get shares to sell
    const sharesAmount = parseInt(sharesInput.value); // Get number of shares from input

    console.log(`Shares to sell: ${sharesAmount}`); // Debugging the input

    if (isNaN(sharesAmount) || sharesAmount <= 0) {
        alert('Please enter a valid number of shares.');
        return;
    }

    if (sharesAmount > stockOwned[symbol]) {
        alert('You do not own enough shares to sell!');
        return;
    }

    const totalRevenue = sharesAmount * stockPrices[symbol]; // Calculate revenue from selling shares
    console.log(`Total revenue from selling ${sharesAmount} shares: $${totalRevenue}`); // Debug revenue

    // Add the revenue to cash balance and update shares owned
    cash += totalRevenue;
    stockOwned[symbol] -= sharesAmount;
    invested[symbol] -= totalRevenue;

    console.log(`Remaining cash: $${cash}`); // Debug remaining cash
    console.log(`Shares owned: ${stockOwned[symbol]}`); // Debug shares owned

    // Update the UI with new values
    document.getElementById('cash').textContent = `$${cash.toFixed(2)}`;
    document.getElementById('apple-investment-value').textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById('apple-shares-owned').textContent = stockOwned[symbol];

    alert('Sale successful!');

    // Update graph with new values after sale
    updateGraph();
}

// Simulate a
