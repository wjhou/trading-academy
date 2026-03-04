# Module 6 Project: Comprehensive Backtesting Framework

## Project Overview

In this project, you will build a professional-grade backtesting framework that integrates all concepts from Module 6. This framework will include proper data handling, comprehensive performance metrics, parameter optimization, walk-forward analysis, and Monte Carlo simulation.

The goal is to create a reusable, robust backtesting system that you can use to evaluate any trading strategy with confidence.

## Project Objectives

By completing this project, you will:
- Build a complete backtesting framework from scratch
- Implement bias-free data handling and execution modeling
- Calculate comprehensive performance metrics
- Optimize strategy parameters without overfitting
- Validate strategies using walk-forward analysis
- Assess risk using Monte Carlo simulation
- Create professional performance reports and visualizations

## System Architecture

The backtesting framework consists of several integrated components:

1. **DataHandler**: Manages historical data and prevents look-ahead bias
2. **Strategy**: Implements trading logic and signal generation
3. **ExecutionEngine**: Simulates realistic order execution
4. **PortfolioManager**: Tracks positions and portfolio state
5. **PerformanceAnalyzer**: Calculates comprehensive metrics
6. **Optimizer**: Finds optimal parameters
7. **WalkForwardValidator**: Validates strategy robustness
8. **MonteCarloSimulator**: Assesses probabilistic outcomes
9. **Reporter**: Generates reports and visualizations

## Implementation

### Part 1: Core Backtesting Engine

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
from abc import ABC, abstractmethod

@dataclass
class Order:
    """Represents a trading order."""
    symbol: str
    order_type: str  # 'market', 'limit'
    side: str  # 'buy', 'sell'
    quantity: int
    price: Optional[float] = None
    timestamp: Optional[datetime] = None


@dataclass
class Fill:
    """Represents an order fill."""
    symbol: str
    side: str
    quantity: int
    price: float
    commission: float
    slippage: float
    timestamp: datetime


@dataclass
class Position:
    """Represents a trading position."""
    symbol: str
    quantity: int
    entry_price: float
    entry_date: datetime
    current_price: float = 0.0

    @property
    def market_value(self) -> float:
        return self.quantity * self.current_price

    @property
    def unrealized_pnl(self) -> float:
        return (self.current_price - self.entry_price) * self.quantity

    @property
    def unrealized_pnl_pct(self) -> float:
        if self.entry_price == 0:
            return 0.0
        return (self.current_price - self.entry_price) / self.entry_price


class DataHandler:
    """
    Handles historical data and prevents look-ahead bias.
    """

    def __init__(self, data: pd.DataFrame):
        """
        Initialize data handler.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical OHLCV data
        """
        self.data = data.copy()
        self.current_index = 0

    def get_latest_bar(self) -> pd.Series:
        """Get the latest bar."""
        if self.current_index >= len(self.data):
            return None
        return self.data.iloc[self.current_index]

    def get_latest_bars(self, n: int = 1) -> pd.DataFrame:
        """Get the latest N bars."""
        if self.current_index < n:
            return self.data.iloc[:self.current_index + 1]
        return self.data.iloc[self.current_index - n + 1:self.current_index + 1]

    def get_historical_data(self, lookback: int = None) -> pd.DataFrame:
        """Get all historical data up to current point."""
        if lookback is None:
            return self.data.iloc[:self.current_index + 1]
        else:
            start_idx = max(0, self.current_index - lookback + 1)
            return self.data.iloc[start_idx:self.current_index + 1]

    def update_bars(self) -> bool:
        """
        Move to next bar.

        Returns:
        --------
        bool : True if more data available
        """
        self.current_index += 1
        return self.current_index < len(self.data)

    def reset(self):
        """Reset to beginning."""
        self.current_index = 0


class ExecutionEngine:
    """
    Simulates realistic order execution.
    """

    def __init__(self,
                 commission_pct: float = 0.001,
                 slippage_pct: float = 0.0005,
                 min_commission: float = 1.0):
        """
        Initialize execution engine.

        Parameters:
        -----------
        commission_pct : float
            Commission as percentage
        slippage_pct : float
            Slippage as percentage
        min_commission : float
            Minimum commission per trade
        """
        self.commission_pct = commission_pct
        self.slippage_pct = slippage_pct
        self.min_commission = min_commission

    def execute_order(self, order: Order, current_price: float,
                     volume: float = None) -> Fill:
        """
        Execute an order.

        Parameters:
        -----------
        order : Order
            Order to execute
        current_price : float
            Current market price
        volume : float, optional
            Current volume for market impact calculation

        Returns:
        --------
        Fill : Execution details
        """
        # Calculate slippage
        base_slippage = current_price * self.slippage_pct

        # Market impact (if volume provided)
        if volume is not None and volume > 0:
            order_pct = order.quantity / volume
            impact_multiplier = 1 + (order_pct * 10)
            slippage = base_slippage * impact_multiplier
        else:
            slippage = base_slippage

        # Execution price
        if order.side == 'buy':
            execution_price = current_price + slippage
        else:
            execution_price = current_price - slippage

        # Commission
        commission = max(
            execution_price * order.quantity * self.commission_pct,
            self.min_commission
        )

        return Fill(
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            price=execution_price,
            commission=commission,
            slippage=slippage * order.quantity,
            timestamp=order.timestamp
        )


class PortfolioManager:
    """
    Manages portfolio state and positions.
    """

    def __init__(self, initial_capital: float):
        """
        Initialize portfolio manager.

        Parameters:
        -----------
        initial_capital : float
            Starting capital
        """
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions: Dict[str, Position] = {}
        self.closed_trades = []

        # Track equity curve
        self.equity_curve = [initial_capital]
        self.equity_dates = []

    def process_fill(self, fill: Fill):
        """
        Process an order fill.

        Parameters:
        -----------
        fill : Fill
            Fill to process
        """
        if fill.side == 'buy':
            self._open_position(fill)
        else:
            self._close_position(fill)

    def _open_position(self, fill: Fill):
        """Open a new position."""
        cost = (fill.price * fill.quantity) + fill.commission
        self.cash -= cost

        self.positions[fill.symbol] = Position(
            symbol=fill.symbol,
            quantity=fill.quantity,
            entry_price=fill.price,
            entry_date=fill.timestamp,
            current_price=fill.price
        )

    def _close_position(self, fill: Fill):
        """Close an existing position."""
        if fill.symbol not in self.positions:
            return

        position = self.positions[fill.symbol]

        # Calculate P&L
        proceeds = (fill.price * fill.quantity) - fill.commission
        self.cash += proceeds

        pnl = proceeds - (position.entry_price * position.quantity)
        pnl_pct = (fill.price - position.entry_price) / position.entry_price

        # Record trade
        self.closed_trades.append({
            'symbol': fill.symbol,
            'entry_date': position.entry_date,
            'exit_date': fill.timestamp,
            'entry_price': position.entry_price,
            'exit_price': fill.price,
            'quantity': fill.quantity,
            'pnl': pnl,
            'pnl_pct': pnl_pct,
            'hold_days': (fill.timestamp - position.entry_date).days
        })

        # Remove position
        del self.positions[fill.symbol]

    def update_positions(self, current_prices: Dict[str, float]):
        """Update position prices."""
        for symbol, position in self.positions.items():
            if symbol in current_prices:
                position.current_price = current_prices[symbol]

    def get_total_value(self) -> float:
        """Get total portfolio value."""
        positions_value = sum(pos.market_value for pos in self.positions.values())
        return self.cash + positions_value

    def record_equity(self, date: datetime):
        """Record current equity."""
        self.equity_curve.append(self.get_total_value())
        self.equity_dates.append(date)


class Strategy(ABC):
    """
    Abstract base class for trading strategies.
    """

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> Dict[str, any]:
        """
        Generate trading signals.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical data

        Returns:
        --------
        Dict : Signals dictionary
        """
        pass


class MovingAverageCrossover(Strategy):
    """
    Example strategy: Moving Average Crossover.
    """

    def __init__(self, ma_short: int = 20, ma_long: int = 50):
        """
        Initialize strategy.

        Parameters:
        -----------
        ma_short : int
            Short MA period
        ma_long : int
            Long MA period
        """
        self.ma_short = ma_short
        self.ma_long = ma_long

    def generate_signals(self, data: pd.DataFrame) -> Dict[str, any]:
        """Generate signals based on MA crossover."""
        if len(data) < self.ma_long:
            return {'action': 'hold'}

        # Calculate MAs
        ma_short = data['Close'].iloc[-self.ma_short:].mean()
        ma_long = data['Close'].iloc[-self.ma_long:].mean()

        # Previous MAs
        if len(data) < self.ma_long + 1:
            return {'action': 'hold'}

        prev_ma_short = data['Close'].iloc[-self.ma_short-1:-1].mean()
        prev_ma_long = data['Close'].iloc[-self.ma_long-1:-1].mean()

        # Generate signals
        if ma_short > ma_long and prev_ma_short <= prev_ma_long:
            return {'action': 'buy'}
        elif ma_short < ma_long and prev_ma_short >= prev_ma_long:
            return {'action': 'sell'}
        else:
            return {'action': 'hold'}


class Backtest:
    """
    Main backtesting engine.
    """

    def __init__(self,
                 data: pd.DataFrame,
                 strategy: Strategy,
                 initial_capital: float = 100000,
                 commission: float = 0.001,
                 slippage: float = 0.0005):
        """
        Initialize backtest.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical OHLCV data
        strategy : Strategy
            Trading strategy
        initial_capital : float
            Starting capital
        commission : float
            Commission percentage
        slippage : float
            Slippage percentage
        """
        self.data_handler = DataHandler(data)
        self.strategy = strategy
        self.execution_engine = ExecutionEngine(commission, slippage)
        self.portfolio = PortfolioManager(initial_capital)

        self.symbol = 'ASSET'  # Generic symbol

    def run(self) -> Dict:
        """
        Run backtest.

        Returns:
        --------
        Dict : Backtest results
        """
        print("Running backtest...")

        self.data_handler.reset()

        while True:
            # Get current bar
            current_bar = self.data_handler.get_latest_bar()
            if current_bar is None:
                break

            current_price = current_bar['Close']
            current_date = current_bar.name

            # Update positions
            self.portfolio.update_positions({self.symbol: current_price})

            # Get historical data for strategy
            historical_data = self.data_handler.get_historical_data()

            # Generate signals
            signals = self.strategy.generate_signals(historical_data)

            # Execute trades
            if signals['action'] == 'buy' and self.symbol not in self.portfolio.positions:
                # Calculate position size (use 95% of cash)
                shares = int((self.portfolio.cash * 0.95) / current_price)

                if shares > 0:
                    order = Order(
                        symbol=self.symbol,
                        order_type='market',
                        side='buy',
                        quantity=shares,
                        timestamp=current_date
                    )

                    fill = self.execution_engine.execute_order(order, current_price)
                    self.portfolio.process_fill(fill)

            elif signals['action'] == 'sell' and self.symbol in self.portfolio.positions:
                position = self.portfolio.positions[self.symbol]

                order = Order(
                    symbol=self.symbol,
                    order_type='market',
                    side='sell',
                    quantity=position.quantity,
                    timestamp=current_date
                )

                fill = self.execution_engine.execute_order(order, current_price)
                self.portfolio.process_fill(fill)

            # Record equity
            self.portfolio.record_equity(current_date)

            # Move to next bar
            if not self.data_handler.update_bars():
                break

        # Close any open positions
        if self.symbol in self.portfolio.positions:
            final_bar = self.data_handler.data.iloc[-1]
            final_price = final_bar['Close']
            final_date = final_bar.name

            position = self.portfolio.positions[self.symbol]
            order = Order(
                symbol=self.symbol,
                order_type='market',
                side='sell',
                quantity=position.quantity,
                timestamp=final_date
            )

            fill = self.execution_engine.execute_order(order, final_price)
            self.portfolio.process_fill(fill)

        print("Backtest complete!")

        return self._calculate_results()

    def _calculate_results(self) -> Dict:
        """Calculate backtest results."""
        equity_curve = pd.Series(
            self.portfolio.equity_curve,
            index=self.portfolio.equity_dates
        )

        returns = equity_curve.pct_change().dropna()

        # Basic metrics
        total_return = (equity_curve.iloc[-1] - self.portfolio.initial_capital) / self.portfolio.initial_capital

        days = (equity_curve.index[-1] - equity_curve.index[0]).days
        years = days / 365.25
        annualized_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0

        # Risk metrics
        volatility = returns.std() * np.sqrt(252)

        running_max = equity_curve.expanding().max()
        drawdowns = (equity_curve - running_max) / running_max
        max_drawdown = abs(drawdowns.min())

        # Sharpe ratio
        sharpe = np.sqrt(252) * (returns.mean() / returns.std()) if returns.std() > 0 else 0

        # Trade metrics
        trades = self.portfolio.closed_trades
        if trades:
            trade_returns = [t['pnl_pct'] for t in trades]
            wins = [r for r in trade_returns if r > 0]
            losses = [r for r in trade_returns if r < 0]

            win_rate = len(wins) / len(trades) if trades else 0
            avg_win = np.mean(wins) if wins else 0
            avg_loss = np.mean(losses) if losses else 0

            profit_factor = abs(sum([t['pnl'] for t in trades if t['pnl'] > 0]) /
                               sum([t['pnl'] for t in trades if t['pnl'] < 0])) if losses else float('inf')
        else:
            win_rate = 0
            avg_win = 0
            avg_loss = 0
            profit_factor = 0

        return {
            'equity_curve': equity_curve,
            'returns': returns,
            'trades': trades,
            'total_return': total_return,
            'annualized_return': annualized_return,
            'volatility': volatility,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe,
            'total_trades': len(trades),
            'win_rate': win_rate,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor,
            'final_value': equity_curve.iloc[-1]
        }


# Example usage
def example_backtest():
    """
    Demonstrate backtesting framework.
    """
    print("Comprehensive Backtesting Framework")
    print("=" * 70)

    # Download data
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Create strategy
    strategy = MovingAverageCrossover(ma_short=20, ma_long=50)

    # Run backtest
    backtest = Backtest(
        data=data,
        strategy=strategy,
        initial_capital=100000,
        commission=0.001,
        slippage=0.0005
    )

    results = backtest.run()

    # Print results
    print("\n" + "=" * 70)
    print("BACKTEST RESULTS")
    print("=" * 70)
    print(f"\nTotal Return:        {results['total_return']:+.2%}")
    print(f"Annualized Return:   {results['annualized_return']:+.2%}")
    print(f"Volatility:          {results['volatility']:.2%}")
    print(f"Max Drawdown:        {results['max_drawdown']:.2%}")
    print(f"Sharpe Ratio:        {results['sharpe_ratio']:.2f}")
    print(f"\nTotal Trades:        {results['total_trades']}")
    print(f"Win Rate:            {results['win_rate']:.2%}")
    print(f"Profit Factor:       {results['profit_factor']:.2f}")
    print(f"\nFinal Value:         ${results['final_value']:,.2f}")

    # Plot equity curve
    plt.figure(figsize=(12, 6))
    plt.plot(results['equity_curve'].index, results['equity_curve'].values, linewidth=2)
    plt.axhline(y=100000, color='gray', linestyle='--', label='Initial Capital')
    plt.xlabel('Date')
    plt.ylabel('Portfolio Value ($)')
    plt.title('Equity Curve')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()


if __name__ == "__main__":
    example_backtest()
```

## Part 2: Parameter Optimization

Integrate grid search optimization:

```python
from itertools import product

def optimize_strategy(data: pd.DataFrame,
                     param_grid: Dict[str, List],
                     initial_capital: float = 100000) -> Dict:
    """
    Optimize strategy parameters.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical data
    param_grid : Dict[str, List]
        Parameter grid
    initial_capital : float
        Starting capital

    Returns:
    --------
    Dict : Optimization results
    """
    param_names = list(param_grid.keys())
    param_values = list(param_grid.values())
    combinations = list(product(*param_values))

    print(f"Testing {len(combinations)} parameter combinations...")

    best_sharpe = -np.inf
    best_params = None
    all_results = []

    for combo in combinations:
        params = dict(zip(param_names, combo))

        # Skip invalid combinations
        if params['ma_short'] >= params['ma_long']:
            continue

        # Create strategy
        strategy = MovingAverageCrossover(**params)

        # Run backtest
        backtest = Backtest(data, strategy, initial_capital)
        results = backtest.run()

        sharpe = results['sharpe_ratio']

        all_results.append({
            'params': params,
            'sharpe': sharpe,
            'return': results['total_return'],
            'max_dd': results['max_drawdown']
        })

        if sharpe > best_sharpe:
            best_sharpe = sharpe
            best_params = params

    return {
        'best_params': best_params,
        'best_sharpe': best_sharpe,
        'all_results': all_results
    }
```

## Part 3: Walk-Forward Analysis

Implement walk-forward validation:

```python
def walk_forward_analysis(data: pd.DataFrame,
                         param_grid: Dict[str, List],
                         is_period: int = 504,
                         oos_period: int = 126) -> List[Dict]:
    """
    Perform walk-forward analysis.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical data
    param_grid : Dict[str, List]
        Parameter grid
    is_period : int
        In-sample period (days)
    oos_period : int
        Out-of-sample period (days)

    Returns:
    --------
    List[Dict] : WFA results
    """
    results = []
    start_idx = is_period

    period = 1

    while start_idx + oos_period <= len(data):
        print(f"\nPeriod {period}")
        print("-" * 70)

        # Split data
        is_data = data.iloc[start_idx - is_period:start_idx]
        oos_data = data.iloc[start_idx:start_idx + oos_period]

        print(f"IS:  {is_data.index[0].date()} to {is_data.index[-1].date()}")
        print(f"OOS: {oos_data.index[0].date()} to {oos_data.index[-1].date()}")

        # Optimize on IS
        opt_results = optimize_strategy(is_data, param_grid)
        best_params = opt_results['best_params']
        is_sharpe = opt_results['best_sharpe']

        print(f"Best params: {best_params}")
        print(f"IS Sharpe: {is_sharpe:.3f}")

        # Test on OOS
        strategy = MovingAverageCrossover(**best_params)
        backtest = Backtest(oos_data, strategy)
        oos_results = backtest.run()
        oos_sharpe = oos_results['sharpe_ratio']

        print(f"OOS Sharpe: {oos_sharpe:.3f}")
        print(f"Efficiency: {oos_sharpe / is_sharpe * 100:.1f}%")

        results.append({
            'period': period,
            'best_params': best_params,
            'is_sharpe': is_sharpe,
            'oos_sharpe': oos_sharpe,
            'efficiency': oos_sharpe / is_sharpe if is_sharpe != 0 else 0
        })

        start_idx += oos_period
        period += 1

    return results
```

## Part 4: Monte Carlo Simulation

Add Monte Carlo analysis:

```python
def monte_carlo_analysis(trades: List[Dict],
                        initial_capital: float = 100000,
                        n_simulations: int = 1000) -> Dict:
    """
    Perform Monte Carlo simulation.

    Parameters:
    -----------
    trades : List[Dict]
        Historical trades
    initial_capital : float
        Starting capital
    n_simulations : int
        Number of simulations

    Returns:
    --------
    Dict : Monte Carlo results
    """
    trade_pnls = [t['pnl'] for t in trades]

    final_values = []
    max_drawdowns = []

    for _ in range(n_simulations):
        # Resample trades
        resampled = np.random.choice(trade_pnls, size=len(trade_pnls), replace=True)

        # Calculate equity curve
        capital = initial_capital
        equity = [capital]

        for pnl in resampled:
            capital += pnl
            equity.append(capital)

        final_values.append(capital)

        # Calculate max drawdown
        equity_array = np.array(equity)
        running_max = np.maximum.accumulate(equity_array)
        drawdowns = (running_max - equity_array) / running_max
        max_drawdowns.append(np.max(drawdowns))

    return {
        'mean_final_value': np.mean(final_values),
        'median_final_value': np.median(final_values),
        'final_value_5th': np.percentile(final_values, 5),
        'final_value_95th': np.percentile(final_values, 95),
        'mean_max_dd': np.mean(max_drawdowns),
        'max_dd_95th': np.percentile(max_drawdowns, 95),
        'prob_profit': np.sum(np.array(final_values) > initial_capital) / len(final_values)
    }
```

## Project Tasks

### Task 1: Build Core Framework
Implement the complete backtesting framework with:
- DataHandler for bias-free data access
- ExecutionEngine with realistic costs
- PortfolioManager for position tracking
- Strategy base class and example strategy

### Task 2: Add Performance Analysis
Implement comprehensive performance metrics:
- Return metrics (total, annualized, CAGR)
- Risk metrics (volatility, max DD, VaR)
- Risk-adjusted metrics (Sharpe, Sortino, Calmar)
- Trade-level metrics (win rate, profit factor)

### Task 3: Implement Optimization
Add parameter optimization with:
- Grid search
- Out-of-sample validation
- Overfitting detection
- Parameter stability analysis

### Task 4: Walk-Forward Analysis
Implement walk-forward validation:
- Rolling or anchored windows
- Efficiency ratio calculation
- Parameter evolution tracking
- Visualization of results

### Task 5: Monte Carlo Simulation
Add Monte Carlo analysis:
- Trade resampling
- Confidence intervals
- Probability metrics
- Risk assessment

### Task 6: Create Reports
Generate comprehensive reports with:
- Performance summary
- Equity curve and drawdown plots
- Parameter optimization results
- Walk-forward analysis charts
- Monte Carlo distributions

## Evaluation Criteria

Your project will be evaluated on:

1. **Correctness** (25%): Framework produces accurate results
2. **Completeness** (20%): All components implemented
3. **Bias Prevention** (20%): Proper handling of look-ahead and other biases
4. **Performance** (15%): Efficient execution
5. **Code Quality** (10%): Clean, documented, maintainable code
6. **Reporting** (10%): Clear, professional visualizations and reports

## Submission Guidelines

Submit the following:

1. Complete Python implementation of backtesting framework
2. Example strategy with full analysis including:
   - Basic backtest results
   - Parameter optimization
   - Walk-forward analysis
   - Monte Carlo simulation
3. Performance report with visualizations
4. Documentation explaining:
   - Framework architecture
   - How to add new strategies
   - Interpretation of results
   - Known limitations

## Bonus Challenges

1. Add support for multiple assets and portfolio strategies
2. Implement additional optimization methods (Bayesian, PSO)
3. Add transaction cost analysis
4. Create interactive dashboard using Plotly or Streamlit
5. Implement regime detection and regime-specific analysis
6. Add support for options and derivatives
7. Create strategy comparison framework
8. Implement live trading integration

## Testing Your Framework

Test your framework on multiple strategies and assets:

1. **Moving Average Crossover** on SPY, AAPL, MSFT
2. **RSI Mean Reversion** on QQQ
3. **Bollinger Band Breakout** on individual stocks
4. **Multi-asset rotation** strategy

For each strategy:
- Run basic backtest
- Optimize parameters
- Validate with walk-forward
- Assess risk with Monte Carlo
- Compare results across assets

## Common Pitfalls to Avoid

1. **Look-Ahead Bias**: Ensure indicators use only past data
2. **Survivorship Bias**: Acknowledge if using biased data
3. **Overfitting**: Use walk-forward to detect
4. **Unrealistic Execution**: Model slippage and commissions
5. **Data Snooping**: Reserve holdout data
6. **Ignoring Costs**: Include all transaction costs
7. **Cherry-Picking**: Report all results, not just best

## Conclusion

This project brings together all backtesting concepts into a professional framework. By completing it, you'll have a robust tool for evaluating trading strategies and the knowledge to interpret results correctly.

The framework you build here will serve as the foundation for all future strategy development, helping you avoid common pitfalls and develop strategies that actually work in live trading.

Remember: A good backtest doesn't guarantee live trading success, but a bad backtest almost certainly predicts failure. Use this framework to build confidence in your strategies before risking real capital.