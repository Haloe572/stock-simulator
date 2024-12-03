const apiKey = 'K0RY5TYZH6KL9I2Y'; // Your Alpha Vantage API key
const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN']; // Add the desired stock symbols here
let cash = 1000; // Starting balance
let stockOwned = {}; // Track the number of shares owned for each stock
let invested = {}; // Track total money invested per stock
let stockPrices = {}; // Track current stock prices
let timer = 300; // Countdown timer for 5 minutes (300 seconds)

// Initialize stock data structures
stockSymbols.forEach((symbol) => {
    stockOwned[symbol] = 0;
    invested[symbol] = 0;
    stockPrices[symbol] = 150; // Default initial price for simulation
});

// Initialize the page dynamically
function initializeStocks() {
    const stockContainer = document.querySelector('.stock-info');
    stockContainer.innerHTML = ''; // Clear any existing stocks

    stockSymbols.forEach((symbol) => {
        // Create a stock card for each stock
        const stockCard = document.createElement('div');
        stockCard.classList.add('stock');
        stockCard.innerHTML = `
            <h2>${symbol} Stock</h2>
            <p>Price: $<span id="${symbol}-price">${stockPrices[symbol].toFixed(2)}</span></p>
            <input id="${symbol}-shares" type="number" placeholder="Enter number of shares" min="1" step="1">
            <button onclick="buyStock('${symbol}')">Buy</button>
            <button onclick="sellStock('${symbol}')">Sell</button>
            <p>Investment: $<span id="${symbol}-investment-value">0.00</span></p>
            <p>Gain/Loss: $<span id="${symbol}-gain-loss">0.00</span></p>
            <p>Shares Owned: <span id="${symbol}-shares-owned">0</span></p>
        `;
        stockContainer.appendChild(stockCard);
    });
}

// Fetch stock data from Alpha Vantage API for all stocks
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

            // Update UI with the stock's price
            document.getElementById(`${symbol}-price`).textContent = latestPrice.toFixed(2);
            updateGraph(); // Update the portfolio balance graph
        }
    }
}

// Buy stock logic
function buyStock(symbol) {
    const sharesInput = document.getElementById(`${symbol}-shares`);
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
    document.getElementById(`${symbol}-investment-value`).textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById(`${symbol}-shares-owned`).textContent = stockOwned[symbol];
    alert('Purchase successful!');
    updateGraph();
}

// Sell stock logic
function sellStock(symbol) {
    const sharesInput = document.getElementById(`${symbol}-shares`);
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
    document.getElementById(`${symbol}-investment-value`).textContent = `$${invested[symbol].toFixed(2)}`;
    document.getElementById(`${symbol}-shares-owned`).textContent = stockOwned[symbol];
    alert('Sale successful!');
    updateGraph();
}

// Timer countdown
function startTimer() {
    updateTimerDisplay();
    const timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
        } else {
            fetchStockData();
            timer = 300; // Reset the timer
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('time-left').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update the graph with the latest portfolio balance
function updateGraph() {
    const totalBalance = Object.keys(stockOwned).reduce((total, symbol) => {
        return total + stockOwned[symbol] * stockPrices[symbol];
    }, cash);
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    const currentTime = new Date();
    stockChart.data.labels.push(currentTime);
    stockChart.data.datasets[0].data.push(totalBalance);
    stockChart.update();
}

// Initialize the application
window.onload = () => {
    initializeStocks();
    fetchStockData();
    startTimer();
};
