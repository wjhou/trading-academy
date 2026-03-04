# Lesson 6.1: Introduction to Backtesting

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand what backtesting is and why it's essential
- Identify the key components of a backtesting framework
- Recognize the difference between in-sample and out-of-sample testing
- Implement a basic backtesting engine in Python
- Evaluate strategy performance using historical data

## Introduction

Backtesting is the process of testing a trading strategy on historical data to evaluate its performance before risking real capital. It's one of the most critical steps in strategy development, allowing traders to:

- Validate strategy logic and assumptions
- Estimate potential returns and risks
- Identify weaknesses and edge cases
- Build confidence before live trading
- Compare different strategies objectively

However, backtesting comes with significant challenges and potential pitfalls that can lead to overconfidence and poor live trading results if not properly addressed.

## What is Backtesting?

Backtesting simulates how a trading strategy would have performed in the past by:

1. **Loading historical data**: Price, volume, and other market data
2. **Applying strategy rules**: Entry and exit signals based on indicators
3. **Simulating trades**: Executing buy/sell orders at historical prices
4. **Tracking performance**: Recording P&L, drawdowns, and other metrics
5. **Analyzing results**: Evaluating risk-adjusted returns

### The Backtesting Process

```
Historical Data → Strategy Rules → Trade Simulation → Performance Analysis → Strategy Refinement
```

## Key Components of a Backtesting System

### 1. Data Handler

Manages historical market data:
- Price data (OHLCV)
- Corporate actions (splits, dividends)
- Data cleaning and validation
- Time series alignment

### 2. Strategy Logic

Implements trading rules:
- Entry conditions
- Exit conditions
- Position sizing
- Risk management

### 3. Execution Engine

Simulates order execution:
- Order types (market, limit, stop)
- Slippage modeling
- Commission and fees
- Fill assumptions

### 4. Portfolio Manager

Tracks portfolio state:
- Current positions
- Cash balance
- Equity curve
- Performance metrics

### 5. Performance Analyzer

Calculates metrics:
- Returns (total, annualized, risk-adjusted)
- Drawdowns
- Win rate and profit factor
- Sharpe ratio, Sortino ratio

## In-Sample vs Out-of-Sample Testing

### In-Sample (IS) Testing

Training period where strategy is developed and optimized:
- Used to develop strategy rules
- Optimize parameters
- Test different variations
- **Risk**: Overfitting to historical data

### Out-of-Sample (OOS) Testing

Validation period with unseen data:
- Tests strategy on new data
- Validates that strategy generalizes
- Provides realistic performance estimate
- **Critical**: Must never be used during development

### Best Practice: Walk-Forward Analysis

Combines IS and OOS testing:
1. Optimize on IS period
2. Test on OOS period
3. Roll forward and repeat
4. Aggregate results

## Python Implementation

Let's build a basic backtesting framework:

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt

@dataclass
class Trade:
    """Represents a completed trade."""
    entry_date: datetime
    exit_date: datetime
    entry_price: float
    exit_price: float
    shares: int
    pnl: float
    pnl_pct: float
    direction: str  # 'long' or 'short'


class Backtest:
    """
    Simple backtesting framework.
    """

    def __init__(self,
                 initial_capital: float = 100000,
                 commission: float = 0.001,
                 slippage: float = 0.0005):
        """
        Initialize backtest.

        Parameters:
        -----------
        initial_capital : float
            Starting capital
        commission : float
            Commission as fraction (0.001 = 0.1%)
        slippage : float
            Slippage as fraction (0.0005 = 0.05%)
        """
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage

        # Portfolio state
        self.cash = initial_capital
        self.position = 0  # Number of shares
        self.entry_price = 0.0
        self.entry_date = None

        # Performance tracking
        self.trades: List[Trade] = []
        self.equity_curve = []
        self.dates = []

    def calculate_commission(self, price: float, shares: int) -> float:
        """Calculate commission for trade."""
        return abs(price * shares * self.commission)

    def calculate_slippage(self, price: float, shares: int, direction: str) -> float:
        """Calculate slippage cost."""
        slippage_price = price * self.slippage
        if direction == 'buy':
            return slippage_price * shares
        else:
            return slippage_price * shares

    def buy(self, date: datetime, price: float, shares: int) -> bool:
        """
        Execute buy order.

        Parameters:
        -----------
        date : datetime
            Trade date
        price : float
            Execution price
        shares : int
            Number of shares

        Returns:
        --------
        bool : True if order executed
        """
        if self.position != 0:
            return False  # Already in position

        # Calculate costs
        execution_price = price * (1 + self.slippage)
        commission = self.calculate_commission(execution_price, shares)
        total_cost = (execution_price * shares) + commission

        if total_cost > self.cash:
            return False  # Insufficient funds

        # Execute trade
        self.cash -= total_cost
        self.position = shares
        self.entry_price = execution_price
        self.entry_date = date

        return True

    def sell(self, date: datetime, price: float) -> bool:
        """
        Execute sell order.

        Parameters:
        -----------
        date : datetime
            Trade date
        price : float
            Execution price

        Returns:
        --------
        bool : True if order executed
        """
        if self.position == 0:
            return False  # No position to close

        # Calculate proceeds
        execution_price = price * (1 - self.slippage)
        commission = self.calculate_commission(execution_price, self.position)
        proceeds = (execution_price * self.position) - commission

        # Calculate P&L
        pnl = proceeds - (self.entry_price * self.position)
        pnl_pct = (execution_price - self.entry_price) / self.entry_price

        # Record trade
        trade = Trade(
            entry_date=self.entry_date,
            exit_date=date,
            entry_price=self.entry_price,
            exit_price=execution_price,
            shares=self.position,
            pnl=pnl,
            pnl_pct=pnl_pct,
            direction='long'
        )
        self.trades.append(trade)

        # Update portfolio
        self.cash += proceeds
        self.position = 0
        self.entry_price = 0.0
        self.entry_date = None

        return True

    def get_portfolio_value(self, current_price: float) -> float:
        """
        Calculate current portfolio value.

        Parameters:
        -----------
        current_price : float
            Current market price

        Returns:
        --------
        float : Total portfolio value
        """
        position_value = self.position * current_price if self.position > 0 else 0
        return self.cash + position_value

    def run(self, data: pd.DataFrame, strategy_func) -> Dict:
        """
        Run backtest.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical price data with OHLCV columns
        strategy_func : callable
            Strategy function that returns signals

        Returns:
        --------
        Dict : Backtest results
        """
        # Generate signals
        signals = strategy_func(data)

        # Simulate trading
        for i in range(len(data)):
            date = data.index[i]
            price = data['Close'].iloc[i]

            # Check for entry signal
            if signals['entry'].iloc[i] and self.position == 0:
                # Calculate position size (use 95% of capital)
                shares = int((self.cash * 0.95) / (price * (1 + self.slippage)))
                if shares > 0:
                    self.buy(date, price, shares)

            # Check for exit signal
            elif signals['exit'].iloc[i] and self.position > 0:
                self.sell(date, price)

            # Record equity
            portfolio_value = self.get_portfolio_value(price)
            self.equity_curve.append(portfolio_value)
            self.dates.append(date)

        # Close any open position
        if self.position > 0:
            final_price = data['Close'].iloc[-1]
            self.sell(data.index[-1], final_price)

        # Calculate performance metrics
        results = self.calculate_metrics()

        return results

    def calculate_metrics(self) -> Dict:
        """Calculate performance metrics."""
        if not self.trades:
            return {'error': 'No trades executed'}

        # Basic metrics
        total_trades = len(self.trades)
        winning_trades = len([t for t in self.trades if t.pnl > 0])
        losing_trades = len([t for t in self.trades if t.pnl < 0])

        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        # P&L metrics
        total_pnl = sum(t.pnl for t in self.trades)
        avg_win = np.mean([t.pnl for t in self.trades if t.pnl > 0]) if winning_trades > 0 else 0
        avg_loss = np.mean([t.pnl for t in self.trades if t.pnl < 0]) if losing_trades > 0 else 0

        profit_factor = abs(sum(t.pnl for t in self.trades if t.pnl > 0) /
                           sum(t.pnl for t in self.trades if t.pnl < 0)) if losing_trades > 0 else float('inf')

        # Returns
        final_value = self.equity_curve[-1]
        total_return = (final_value - self.initial_capital) / self.initial_capital

        # Calculate annualized return
        days = (self.dates[-1] - self.dates[0]).days
        years = days / 365.25
        annualized_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0

        # Drawdown
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max
        max_drawdown = np.max(drawdowns)

        # Sharpe ratio
        returns = pd.Series(self.equity_curve).pct_change().dropna()
        sharpe_ratio = np.sqrt(252) * (returns.mean() / returns.std()) if returns.std() > 0 else 0

        metrics = {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor,
            'total_return': total_return,
            'annualized_return': annualized_return,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'final_value': final_value
        }

        return metrics

    def plot_results(self):
        """Plot backtest results."""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

        # Equity curve
        ax1.plot(self.dates, self.equity_curve, label='Portfolio Value', linewidth=2)
        ax1.axhline(y=self.initial_capital, color='gray', linestyle='--', label='Initial Capital')
        ax1.set_ylabel('Portfolio Value ($)')
        ax1.set_title('Equity Curve')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Drawdown
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        ax2.fill_between(self.dates, 0, -drawdowns * 100, alpha=0.3, color='red')
        ax2.plot(self.dates, -drawdowns * 100, color='red', linewidth=2)
        ax2.set_ylabel('Drawdown (%)')
        ax2.set_xlabel('Date')
        ax2.set_title('Drawdown')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()

    def print_results(self, metrics: Dict):
        """Print backtest results."""
        print("\n" + "=" * 60)
        print("BACKTEST RESULTS")
        print("=" * 60)

        print(f"\nInitial Capital:     ${self.initial_capital:,.2f}")
        print(f"Final Value:         ${metrics['final_value']:,.2f}")
        print(f"Total Return:        {metrics['total_return']:+.2%}")
        print(f"Annualized Return:   {metrics['annualized_return']:+.2%}")
        print(f"Max Drawdown:        {metrics['max_drawdown']:.2%}")
        print(f"Sharpe Ratio:        {metrics['sharpe_ratio']:.2f}")

        print(f"\nTotal Trades:        {metrics['total_trades']}")
        print(f"Winning Trades:      {metrics['winning_trades']}")
        print(f"Losing Trades:       {metrics['losing_trades']}")
        print(f"Win Rate:            {metrics['win_rate']:.2%}")

        print(f"\nTotal P&L:           ${metrics['total_pnl']:,.2f}")
        print(f"Average Win:         ${metrics['avg_win']:,.2f}")
        print(f"Average Loss:        ${metrics['avg_loss']:,.2f}")
        print(f"Profit Factor:       {metrics['profit_factor']:.2f}")

        print("\n" + "=" * 60)


# Example strategy: Moving Average Crossover
def ma_crossover_strategy(data: pd.DataFrame) -> pd.DataFrame:
    """
    Simple moving average crossover strategy.

    Parameters:
    -----------
    data : pd.DataFrame
        Price data with Close column

    Returns:
    --------
    pd.DataFrame : Signals with entry/exit columns
    """
    # Calculate moving averages
    data['MA_Short'] = data['Close'].rolling(window=20).mean()
    data['MA_Long'] = data['Close'].rolling(window=50).mean()

    # Generate signals
    signals = pd.DataFrame(index=data.index)
    signals['entry'] = False
    signals['exit'] = False

    # Entry: Short MA crosses above Long MA
    signals.loc[(data['MA_Short'] > data['MA_Long']) &
                (data['MA_Short'].shift(1) <= data['MA_Long'].shift(1)), 'entry'] = True

    # Exit: Short MA crosses below Long MA
    signals.loc[(data['MA_Short'] < data['MA_Long']) &
                (data['MA_Short'].shift(1) >= data['MA_Long'].shift(1)), 'exit'] = True

    return signals


# Example usage
def example_backtest():
    """
    Demonstrate backtesting framework.
    """
    print("Backtesting Framework Example")
    print("=" * 60)

    # Download data
    print("\nDownloading data...")
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Initialize backtest
    backtest = Backtest(
        initial_capital=100000,
        commission=0.001,
        slippage=0.0005
    )

    # Run backtest
    print("Running backtest...")
    results = backtest.run(data, ma_crossover_strategy)

    # Print results
    backtest.print_results(results)

    # Plot results
    backtest.plot_results()


if __name__ == "__main__":
    example_backtest()
```

## Limitations of Basic Backtesting

### 1. Look-Ahead Bias

Using future information in past decisions:
- Calculating indicators with future data
- Peeking at next bar's price
- Using end-of-day data for intraday decisions

**Solution**: Ensure all calculations use only past data.

### 2. Survivorship Bias

Testing only on stocks that survived:
- Ignores delisted companies
- Overestimates returns
- Misses bankruptcy risk

**Solution**: Use survivorship-bias-free datasets.

### 3. Overfitting

Optimizing too much on historical data:
- Too many parameters
- Curve-fitting to noise
- Poor out-of-sample performance

**Solution**: Use walk-forward analysis and limit parameters.

### 4. Unrealistic Execution

Assuming perfect fills:
- No slippage
- Instant execution
- Unlimited liquidity

**Solution**: Model slippage, commissions, and market impact.

### 5. Data Quality Issues

Problems with historical data:
- Missing data
- Incorrect prices
- Unadjusted for splits/dividends

**Solution**: Clean and validate data thoroughly.

## Best Practices

1. **Use Quality Data**: Ensure data is clean, adjusted, and complete
2. **Model Costs Realistically**: Include commissions, slippage, and market impact
3. **Avoid Overfitting**: Limit parameters and use out-of-sample testing
4. **Test Robustness**: Vary parameters and test on different periods
5. **Consider Market Regime**: Test in bull, bear, and sideways markets
6. **Document Assumptions**: Record all assumptions and limitations
7. **Be Conservative**: Expect live results to be worse than backtest
8. **Continuous Validation**: Monitor live performance vs backtest

## Exercises

### Exercise 1: Basic Backtest

Implement and backtest a simple RSI strategy:
- Buy when RSI < 30
- Sell when RSI > 70
- Test on SPY from 2015-2023

### Exercise 2: Commission Impact

Run the same strategy with different commission levels:
- 0% (no commission)
- 0.1% per trade
- 0.5% per trade

Analyze how commissions affect profitability.

### Exercise 3: Parameter Sensitivity

Test the MA crossover strategy with different MA periods:
- (10, 30), (20, 50), (50, 200)

Which combination performs best?

### Exercise 4: Multiple Symbols

Backtest the MA crossover strategy on:
- AAPL, MSFT, GOOGL, AMZN

Compare results across symbols.

## Summary

Backtesting is essential for strategy development but must be done carefully to avoid common pitfalls. A good backtesting framework includes:

- Clean, quality historical data
- Realistic execution modeling (slippage, commissions)
- Proper signal generation without look-ahead bias
- Comprehensive performance metrics
- Out-of-sample validation

Remember: backtesting shows what could have happened, not what will happen. Always be skeptical of backtest results and expect live trading to perform worse than backtests.

## Next Steps

In the next lesson, we'll explore common backtesting pitfalls in detail and learn how to avoid them, ensuring our backtest results are as realistic and reliable as possible.