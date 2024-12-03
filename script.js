const apiKey = 'YOUR_API_KEY'; // Replace with your Alpha Vantage API key
const stockSymbols = ['AAPL', 'NVDA', 'GOOGL', 'META', 'MSFT', 'AMZN'];

const stockPrices = {
    AAPL: 150,
    NVDA: 400,
    GOOGL: 2800,
    META: 300,
    MSFT: 350,
    AMZN: 3200,
};

const stockOwned = {
    AAPL: 0,
    NVDA: 0,
    GOOGL: 0,
    META: 0,
    MSFT: 0,
    AMZN: 0,
};

const invested = {
    AAPL: 0,
    NVDA: 0,
    GOOGL: 0,
    META: 0,
    MSFT: 0,
    AMZN: 0,
};

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

            // Update the UI
            document.getElementById(`${symbol.toLowerCase()}-price`).textContent = latestPrice.toFixed(2);
        }
    }
    updateGraph(); // Optional if you have a graph update function
}

function buyStock(symbol) {
    const sharesInput = document.getElementById(`${symbol.toLowerCase()}-shares`);
    const shares = parseInt(sharesInput.value);
    if (shares > 0) {
        stockOwned[symbol] += shares;
        invested[symbol] += shares * stockPrices[symbol];

        // Update the UI
        document.getElementById(`${symbol.toLowerCase()}-investment-value`).textContent = invested[symbol].toFixed(2);
        document.getElementById(`${symbol.toLowerCase()}-shares-owned`).textContent = stockOwned[symbol];
        updateGainLoss(symbol);
    }
    sharesInput.value = ''; // Clear the input field
}

function sellStock(symbol) {
    const sharesInput = document.getElementById(`${symbol.toLowerCase()}-shares`);
    const shares = parseInt(sharesInput.value);
    if (shares > 0 && stockOwned[symbol] >= shares) {
        stockOwned[symbol] -= shares;
        invested[symbol] -= shares * stockPrices[symbol];

        // Update the UI
        document.getElementById(`${symbol.toLowerCase()}-investment-value`).textContent = invested[symbol].toFixed(2);
        document.getElementById(`${symbol.toLowerCase()}-shares-owned`).textContent = stockOwned[symbol];
        updateGainLoss(symbol);
    }
    sharesInput.value = ''; // Clear the input field
}

