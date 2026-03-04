# Python for Trading

Essential Python concepts for algorithmic trading.

## Why Python for Trading?

Python is the most popular language for algorithmic trading because:
- **Easy to learn**: Clear, readable syntax
- **Rich libraries**: pandas, numpy, scikit-learn
- **Large community**: Lots of resources and help
- **Versatile**: Research, backtesting, and live trading
- **Integration**: Works with most brokers and data sources

## Python Basics

### Variables and Data Types

```python
# Numbers
price = 150.50          # float
shares = 100            # int
profit = price * shares # 15050.0

# Strings
symbol = "AAPL"
message = f"{symbol} price is ${price}"  # f-string formatting

# Booleans
is_profitable = True
should_buy = False

# None (null value)
stop_loss = None
```

### Lists (Arrays)

```python
# Create list
prices = [150.0, 151.5, 149.8, 152.3]

# Access elements
first_price = prices[0]      # 150.0
last_price = prices[-1]      # 152.3

# Slicing
first_two = prices[0:2]      # [150.0, 151.5]
last_two = prices[-2:]       # [149.8, 152.3]

# Add elements
prices.append(153.0)

# List comprehension
returns = [(prices[i] - prices[i-1]) / prices[i-1]
           for i in range(1, len(prices))]
```

### Dictionaries (Key-Value Pairs)

```python
# Create dictionary
position = {
    'symbol': 'AAPL',
    'shares': 100,
    'entry_price': 150.0,
    'current_price': 152.0
}

# Access values
symbol = position['symbol']           # 'AAPL'
shares = position.get('shares', 0)    # 100 (with default)

# Add/update
position['stop_loss'] = 145.0

# Iterate
for key, value in position.items():
    print(f"{key}: {value}")
```

### Control Flow

```python
# If statements
if price > 150:
    action = "sell"
elif price < 140:
    action = "buy"
else:
    action = "hold"

# For loops
for price in prices:
    if price > 150:
        print(f"High price: {price}")

# While loops
while portfolio_value < target:
    # Keep trading
    pass

# List comprehension (Pythonic way)
high_prices = [p for p in prices if p > 150]
```

### Functions

```python
# Basic function
def calculate_return(entry, exit):
    return (exit - entry) / entry

# With type hints
def calculate_return(entry: float, exit: float) -> float:
    """Calculate percentage return."""
    return (exit - entry) / entry

# With default arguments
def calculate_position_size(capital, risk_pct=0.02):
    return capital * risk_pct

# Multiple return values
def get_stats(prices):
    return min(prices), max(prices), sum(prices) / len(prices)

min_price, max_price, avg_price = get_stats(prices)
```

## Essential Libraries for Trading

### NumPy (Numerical Computing)

```python
import numpy as np

# Create arrays
prices = np.array([150.0, 151.5, 149.8, 152.3])
returns = np.array([0.01, -0.011, 0.017])

# Mathematical operations
mean_return = np.mean(returns)
std_return = np.std(returns)
cumulative_return = np.prod(1 + returns) - 1

# Array operations (vectorized - fast!)
normalized_prices = (prices - np.mean(prices)) / np.std(prices)

# Useful functions
max_price = np.max(prices)
min_price = np.min(prices)
price_range = np.ptp(prices)  # peak-to-peak
```

### Pandas (Data Analysis)

```python
import pandas as pd

# Create DataFrame
data = pd.DataFrame({
    'date': ['2024-01-01', '2024-01-02', '2024-01-03'],
    'open': [150.0, 151.0, 149.5],
    'high': [152.0, 152.5, 151.0],
    'low': [149.5, 150.0, 148.5],
    'close': [151.5, 149.8, 150.5],
    'volume': [1000000, 1200000, 950000]
})

# Set index
data['date'] = pd.to_datetime(data['date'])
data.set_index('date', inplace=True)

# Access columns
closes = data['close']
highs_lows = data[['high', 'low']]

# Calculate returns
data['returns'] = data['close'].pct_change()

# Rolling calculations
data['sma_20'] = data['close'].rolling(20).mean()
data['std_20'] = data['close'].rolling(20).std()

# Boolean indexing
high_volume_days = data[data['volume'] > 1000000]

# Apply custom functions
data['range'] = data.apply(lambda row: row['high'] - row['low'], axis=1)
```

### Matplotlib (Visualization)

```python
import matplotlib.pyplot as plt

# Simple line plot
plt.figure(figsize=(12, 6))
plt.plot(data.index, data['close'], label='Close Price')
plt.plot(data.index, data['sma_20'], label='20-day SMA')
plt.xlabel('Date')
plt.ylabel('Price')
plt.title('Stock Price and Moving Average')
plt.legend()
plt.grid(True)
plt.show()

# Multiple subplots
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# Price plot
ax1.plot(data.index, data['close'])
ax1.set_title('Price')

# Volume plot
ax2.bar(data.index, data['volume'])
ax2.set_title('Volume')

plt.tight_layout()
plt.show()
```

## Common Trading Patterns

### Loading Market Data

```python
import yfinance as yf

# Download data
data = yf.download('AAPL', start='2024-01-01', end='2024-12-31')

# Multiple symbols
data = yf.download(['AAPL', 'GOOGL', 'MSFT'],
                   start='2024-01-01',
                   end='2024-12-31')

# Access specific symbol
aapl_close = data['Close']['AAPL']
```

### Calculating Indicators

```python
def calculate_sma(prices, period):
    """Calculate Simple Moving Average."""
    return prices.rolling(window=period).mean()

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index."""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# Use the functions
data['SMA_20'] = calculate_sma(data['Close'], 20)
data['RSI'] = calculate_rsi(data['Close'])
```

### Generating Signals

```python
def generate_signals(data):
    """Generate buy/sell signals."""
    signals = pd.DataFrame(index=data.index)
    signals['price'] = data['Close']
    signals['signal'] = 0.0

    # Buy when price crosses above SMA
    signals['signal'][data['Close'] > data['SMA_20']] = 1.0

    # Sell when price crosses below SMA
    signals['signal'][data['Close'] < data['SMA_20']] = -1.0

    # Generate trading orders
    signals['positions'] = signals['signal'].diff()

    return signals

signals = generate_signals(data)
```

### Backtesting

```python
def backtest_strategy(data, signals, initial_capital=100000):
    """Simple backtest."""
    positions = pd.DataFrame(index=signals.index).fillna(0.0)
    positions['stock'] = 100 * signals['signal']  # 100 shares per signal

    portfolio = positions.multiply(data['Close'], axis=0)
    pos_diff = positions.diff()

    portfolio['holdings'] = (positions.multiply(data['Close'], axis=0)).sum(axis=1)
    portfolio['cash'] = initial_capital - (pos_diff.multiply(data['Close'], axis=0)).sum(axis=1).cumsum()
    portfolio['total'] = portfolio['cash'] + portfolio['holdings']
    portfolio['returns'] = portfolio['total'].pct_change()

    return portfolio

portfolio = backtest_strategy(data, signals)
```

## Object-Oriented Programming

### Classes for Trading

```python
class TradingStrategy:
    """Base class for trading strategies."""

    def __init__(self, symbol, capital=100000):
        self.symbol = symbol
        self.capital = capital
        self.positions = []

    def generate_signal(self, data):
        """Override this method in subclasses."""
        raise NotImplementedError

    def execute_trade(self, signal, price, quantity):
        """Execute a trade."""
        if signal == 'buy':
            cost = price * quantity
            if cost <= self.capital:
                self.capital -= cost
                self.positions.append({
                    'type': 'buy',
                    'price': price,
                    'quantity': quantity
                })
                return True
        return False

    def get_portfolio_value(self, current_price):
        """Calculate current portfolio value."""
        stock_value = sum(p['quantity'] for p in self.positions) * current_price
        return self.capital + stock_value

# Subclass example
class MovingAverageCrossover(TradingStrategy):
    """MA crossover strategy."""

    def __init__(self, symbol, short_window=20, long_window=50):
        super().__init__(symbol)
        self.short_window = short_window
        self.long_window = long_window

    def generate_signal(self, data):
        """Generate signal based on MA crossover."""
        short_ma = data['Close'].rolling(self.short_window).mean()
        long_ma = data['Close'].rolling(self.long_window).mean()

        if short_ma.iloc[-1] > long_ma.iloc[-1]:
            return 'buy'
        elif short_ma.iloc[-1] < long_ma.iloc[-1]:
            return 'sell'
        return 'hold'
```

## Error Handling

```python
try:
    data = yf.download('INVALID', start='2024-01-01')
    if data.empty:
        raise ValueError("No data downloaded")
except Exception as e:
    print(f"Error downloading data: {e}")
    # Handle error gracefully
    data = None

# Context managers (automatic cleanup)
with open('trades.csv', 'w') as f:
    f.write('symbol,price,quantity\n')
    f.write('AAPL,150.0,100\n')
# File automatically closed
```

## Best Practices

### 1. Use Type Hints

```python
from typing import List, Dict, Optional

def calculate_returns(prices: List[float]) -> List[float]:
    """Calculate returns from price list."""
    return [(prices[i] - prices[i-1]) / prices[i-1]
            for i in range(1, len(prices))]
```

### 2. Write Docstrings

```python
def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """
    Calculate Sharpe ratio.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    risk_free_rate : float
        Annual risk-free rate (default: 0.02)

    Returns:
    --------
    float
        Sharpe ratio
    """
    excess_returns = returns - risk_free_rate / 252
    return np.sqrt(252) * excess_returns.mean() / excess_returns.std()
```

### 3. Use List/Dict Comprehensions

```python
# Instead of:
squares = []
for x in range(10):
    squares.append(x**2)

# Use:
squares = [x**2 for x in range(10)]

# Dictionary comprehension
price_dict = {symbol: get_price(symbol) for symbol in ['AAPL', 'GOOGL']}
```

### 4. Leverage Pandas Vectorization

```python
# Slow (loop):
for i in range(len(data)):
    data.loc[i, 'return'] = (data.loc[i, 'close'] - data.loc[i-1, 'close']) / data.loc[i-1, 'close']

# Fast (vectorized):
data['return'] = data['close'].pct_change()
```

## Quick Reference

### Common Operations

```python
# Read CSV
data = pd.read_csv('prices.csv', index_col='date', parse_dates=True)

# Write CSV
data.to_csv('output.csv')

# Filter data
recent_data = data[data.index > '2024-01-01']

# Group by
monthly_returns = data.groupby(pd.Grouper(freq='M'))['returns'].sum()

# Merge dataframes
combined = pd.merge(df1, df2, on='date', how='inner')

# Handle missing data
data.fillna(method='ffill', inplace=True)  # Forward fill
data.dropna(inplace=True)  # Drop NaN rows
```

## Next Steps

1. Practice these concepts with the exercises in Module 1
2. Build simple scripts to download and analyze data
3. Implement basic indicators
4. Create your first simple strategy

## Resources

- [Official Python Tutorial](https://docs.python.org/3/tutorial/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [NumPy Documentation](https://numpy.org/doc/)
- [Real Python](https://realpython.com/) - Excellent tutorials

---

**Remember**: You don't need to be a Python expert to start trading. Learn as you go, and focus on the concepts relevant to trading first.

