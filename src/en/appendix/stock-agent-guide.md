# Using stock-agent-system

Guide to using the stock-agent-system framework with this book.

## What is stock-agent-system?

stock-agent-system is a companion framework designed to work with this Trading Academy book. It provides:
- Pre-built trading infrastructure
- Data management utilities
- Strategy templates
- Backtesting framework
- Live trading capabilities

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Git

### Install from GitHub

```bash
# Clone the repository
git clone https://github.com/wjhou/stock-agent-system.git
cd stock-agent-system

# Install in development mode
pip install -e .

# Or install directly from GitHub
pip install git+https://github.com/wjhou/stock-agent-system.git
```

### Verify Installation

```python
import stock_agent_system
print(stock_agent_system.__version__)
```

## Quick Start

### Basic Usage

```python
from stock_agent_system import DataManager, Strategy, Backtest

# Initialize data manager
dm = DataManager()

# Download data
data = dm.get_data('AAPL', start='2024-01-01', end='2024-12-31')

# Create a simple strategy
class MyStrategy(Strategy):
    def generate_signals(self, data):
        # Your strategy logic here
        signals = data['Close'].rolling(20).mean()
        return signals

# Run backtest
strategy = MyStrategy()
backtest = Backtest(strategy, data)
results = backtest.run()

# View results
print(results.summary())
```

## Integration with Book Lessons

### Module 1-2: Getting Started

The book's early modules use basic Python and pandas. stock-agent-system is optional at this stage.

### Module 3-4: Indicators and Strategies

Use stock-agent-system's indicator library:

```python
from stock_agent_system.indicators import RSI, MACD, BollingerBands

# Calculate indicators
rsi = RSI(data['Close'], period=14)
macd = MACD(data['Close'])
bb = BollingerBands(data['Close'], period=20)
```

### Module 5-6: Risk Management and Backtesting

Leverage stock-agent-system's backtesting framework:

```python
from stock_agent_system import Backtest, RiskManager

# Set up risk management
risk_mgr = RiskManager(
    max_position_size=0.1,  # 10% per position
    max_portfolio_risk=0.20  # 20% total risk
)

# Run backtest with risk management
backtest = Backtest(strategy, data, risk_manager=risk_mgr)
results = backtest.run()
```

### Module 7-8: Advanced Topics

Use stock-agent-system for live trading:

```python
from stock_agent_system import LiveTrader

# Initialize live trader
trader = LiveTrader(
    strategy=strategy,
    broker='alpaca',
    api_key='your_key',
    secret_key='your_secret'
)

# Start trading
trader.start()
```

## Key Components

### DataManager

Handles data downloading and management:

```python
from stock_agent_system import DataManager

dm = DataManager()

# Single symbol
data = dm.get_data('AAPL', start='2024-01-01')

# Multiple symbols
data = dm.get_data(['AAPL', 'GOOGL', 'MSFT'], start='2024-01-01')

# Save/load data
dm.save_data(data, 'my_data.csv')
data = dm.load_data('my_data.csv')
```

### Strategy Base Class

Template for creating strategies:

```python
from stock_agent_system import Strategy

class MyStrategy(Strategy):
    def __init__(self, param1=10, param2=20):
        super().__init__()
        self.param1 = param1
        self.param2 = param2

    def generate_signals(self, data):
        """Generate trading signals."""
        # Your logic here
        return signals

    def calculate_position_size(self, signal, capital):
        """Calculate position size."""
        # Your sizing logic
        return size
```

### Backtest Engine

Comprehensive backtesting:

```python
from stock_agent_system import Backtest

backtest = Backtest(
    strategy=strategy,
    data=data,
    initial_capital=100000,
    commission=0.001,  # 0.1%
    slippage=0.0005    # 0.05%
)

results = backtest.run()

# Access results
print(f"Total Return: {results.total_return:.2%}")
print(f"Sharpe Ratio: {results.sharpe_ratio:.2f}")
print(f"Max Drawdown: {results.max_drawdown:.2%}")

# Plot results
results.plot()
```

### Risk Manager

Built-in risk management:

```python
from stock_agent_system import RiskManager

risk_mgr = RiskManager(
    max_position_size=0.10,      # 10% per position
    max_portfolio_risk=0.20,     # 20% total risk
    max_correlation=0.70,        # Max correlation between positions
    stop_loss_pct=0.05,          # 5% stop loss
    take_profit_pct=0.15         # 15% take profit
)

# Check if trade is allowed
if risk_mgr.check_trade(symbol, quantity, price):
    # Execute trade
    pass
```

## Example: Complete Strategy

Here's a complete example using stock-agent-system:

```python
from stock_agent_system import (
    DataManager, Strategy, Backtest,
    RiskManager, indicators
)
import pandas as pd

class MovingAverageCrossover(Strategy):
    """MA crossover strategy using stock-agent-system."""

    def __init__(self, short_window=20, long_window=50):
        super().__init__()
        self.short_window = short_window
        self.long_window = long_window

    def generate_signals(self, data):
        """Generate signals based on MA crossover."""
        signals = pd.DataFrame(index=data.index)
        signals['signal'] = 0.0

        # Calculate moving averages
        signals['short_ma'] = data['Close'].rolling(
            window=self.short_window
        ).mean()
        signals['long_ma'] = data['Close'].rolling(
            window=self.long_window
        ).mean()

        # Generate signals
        signals['signal'][self.short_window:] = np.where(
            signals['short_ma'][self.short_window:] >
            signals['long_ma'][self.short_window:],
            1.0, 0.0
        )

        # Generate trading orders
        signals['positions'] = signals['signal'].diff()

        return signals

# Run the strategy
if __name__ == '__main__':
    # Get data
    dm = DataManager()
    data = dm.get_data('AAPL', start='2020-01-01', end='2024-01-01')

    # Create strategy
    strategy = MovingAverageCrossover(short_window=20, long_window=50)

    # Set up risk management
    risk_mgr = RiskManager(max_position_size=0.10)

    # Run backtest
    backtest = Backtest(
        strategy=strategy,
        data=data,
        initial_capital=100000,
        risk_manager=risk_mgr
    )

    results = backtest.run()

    # Print results
    print(results.summary())
    results.plot()
```

## Configuration

### Config File

Create a `config.yaml` file:

```yaml
# config.yaml
data:
  source: yfinance
  cache_dir: ./data

backtest:
  initial_capital: 100000
  commission: 0.001
  slippage: 0.0005

risk:
  max_position_size: 0.10
  max_portfolio_risk: 0.20
  stop_loss_pct: 0.05

live_trading:
  broker: alpaca
  paper_trading: true
  update_frequency: 60  # seconds
```

Load configuration:

```python
from stock_agent_system import Config

config = Config.from_file('config.yaml')
```

## Best Practices

### 1. Use Version Control

```bash
# Track your strategies
git init
git add .
git commit -m "Initial strategy"
```

### 2. Separate Development and Production

```python
# development.py
config = Config(paper_trading=True)

# production.py
config = Config(paper_trading=False)
```

### 3. Log Everything

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Strategy started")
logger.warning("High volatility detected")
logger.error("Trade execution failed")
```

### 4. Test Thoroughly

```python
# test_strategy.py
import unittest
from my_strategy import MyStrategy

class TestMyStrategy(unittest.TestCase):
    def test_signal_generation(self):
        strategy = MyStrategy()
        signals = strategy.generate_signals(test_data)
        self.assertIsNotNone(signals)

if __name__ == '__main__':
    unittest.main()
```

## Troubleshooting

### Issue: Import Error

```python
# If you get: ModuleNotFoundError: No module named 'stock_agent_system'

# Solution: Reinstall
pip uninstall stock-agent-system
pip install -e /path/to/stock-agent-system
```

### Issue: Data Download Fails

```python
# If data download fails, try:
dm = DataManager(cache=True)  # Use cached data
data = dm.get_data('AAPL', start='2024-01-01', retry=3)
```

### Issue: Backtest Runs Slowly

```python
# Optimize by:
# 1. Use smaller date ranges for testing
# 2. Reduce data frequency (daily instead of minute)
# 3. Vectorize calculations
# 4. Use multiprocessing for multiple symbols
```

## Getting Help

- **Documentation**: Check the stock-agent-system docs
- **GitHub Issues**: Report bugs or request features
- **Examples**: See the `examples/` directory
- **Community**: Join discussions on GitHub

## Next Steps

1. Install stock-agent-system
2. Run the example strategies
3. Modify examples for your needs
4. Build your own strategies
5. Backtest thoroughly before live trading

---

**Note**: stock-agent-system is optional. All concepts in this book can be implemented with standard Python libraries (pandas, numpy, etc.). Use stock-agent-system if you want a structured framework.

