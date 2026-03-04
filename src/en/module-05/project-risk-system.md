# Module 5 Project: Comprehensive Risk Management System

## Project Overview

In this project, you will build a complete risk management system that integrates all the concepts learned in Module 5. The system will handle position sizing, stop-loss management, risk-reward analysis, portfolio diversification, drawdown monitoring, and Kelly Criterion calculations.

This project represents a professional-grade risk management framework that can be integrated into any trading system.

## Project Objectives

By completing this project, you will:
- Integrate multiple risk management techniques into a unified system
- Build a portfolio-level risk monitoring dashboard
- Implement adaptive position sizing based on market conditions
- Create comprehensive risk reporting and analytics
- Develop a reusable risk management framework

## System Architecture

The risk management system consists of several integrated components:

1. **RiskManager**: Central coordinator for all risk management functions
2. **PositionSizer**: Handles position sizing using multiple methods
3. **StopLossManager**: Manages stop-loss orders and trailing stops
4. **RiskRewardAnalyzer**: Calculates and tracks risk-reward metrics
5. **PortfolioRiskMonitor**: Monitors portfolio-level risk and correlations
6. **DrawdownTracker**: Tracks and manages drawdowns
7. **KellyCalculator**: Computes optimal position sizes using Kelly Criterion
8. **RiskReporter**: Generates risk reports and visualizations

## Implementation

### Part 1: Core Risk Manager

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class Position:
    """Represents a trading position."""
    symbol: str
    entry_price: float
    shares: int
    entry_date: datetime
    stop_loss: float
    take_profit: Optional[float] = None
    current_price: Optional[float] = None

    @property
    def position_value(self) -> float:
        """Current position value."""
        price = self.current_price or self.entry_price
        return self.shares * price

    @property
    def unrealized_pnl(self) -> float:
        """Unrealized profit/loss."""
        if self.current_price is None:
            return 0.0
        return (self.current_price - self.entry_price) * self.shares

    @property
    def unrealized_pnl_pct(self) -> float:
        """Unrealized P&L as percentage."""
        if self.current_price is None:
            return 0.0
        return (self.current_price - self.entry_price) / self.entry_price


@dataclass
class Trade:
    """Represents a completed trade."""
    symbol: str
    entry_price: float
    exit_price: float
    shares: int
    entry_date: datetime
    exit_date: datetime
    pnl: float
    pnl_pct: float
    hold_days: int


class RiskManager:
    """
    Comprehensive risk management system.
    """

    def __init__(self,
                 initial_capital: float,
                 max_position_size: float = 0.10,
                 max_portfolio_risk: float = 0.06,
                 max_correlation: float = 0.70,
                 max_drawdown: float = 0.20,
                 kelly_fraction: float = 0.5):
        """
        Initialize risk manager.

        Parameters:
        -----------
        initial_capital : float
            Starting capital
        max_position_size : float
            Maximum position size as fraction of capital
        max_portfolio_risk : float
            Maximum total portfolio risk
        max_correlation : float
            Maximum correlation between positions
        max_drawdown : float
            Maximum allowed drawdown
        kelly_fraction : float
            Fraction of Kelly to use
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.max_position_size = max_position_size
        self.max_portfolio_risk = max_portfolio_risk
        self.max_correlation = max_correlation
        self.max_drawdown = max_drawdown
        self.kelly_fraction = kelly_fraction

        # Track positions and trades
        self.positions: Dict[str, Position] = {}
        self.trade_history: List[Trade] = []

        # Track equity curve
        self.equity_curve = [initial_capital]
        self.equity_dates = [datetime.now()]

        # Peak tracking for drawdown
        self.peak_capital = initial_capital
        self.peak_date = datetime.now()

    def calculate_position_size(self,
                                symbol: str,
                                entry_price: float,
                                stop_loss: float,
                                method: str = 'fixed_risk',
                                risk_amount: float = None) -> int:
        """
        Calculate position size using specified method.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        entry_price : float
            Entry price
        stop_loss : float
            Stop loss price
        method : str
            Sizing method: 'fixed_risk', 'fixed_pct', 'atr', 'kelly'
        risk_amount : float
            Risk amount (for fixed_risk method)

        Returns:
        --------
        int : Number of shares
        """
        # Default risk amount
        if risk_amount is None:
            risk_amount = self.current_capital * 0.01  # 1% risk

        # Calculate risk per share
        risk_per_share = abs(entry_price - stop_loss)

        if risk_per_share == 0:
            return 0

        if method == 'fixed_risk':
            # Risk-based sizing
            shares = int(risk_amount / risk_per_share)

        elif method == 'fixed_pct':
            # Fixed percentage of capital
            position_value = self.current_capital * 0.05  # 5% of capital
            shares = int(position_value / entry_price)

        elif method == 'kelly':
            # Kelly Criterion sizing
            if len(self.trade_history) < 10:
                # Not enough history, use conservative sizing
                shares = int((self.current_capital * 0.02) / entry_price)
            else:
                # Calculate Kelly from trade history
                returns = [t.pnl_pct for t in self.trade_history]
                kelly_pct = self._calculate_kelly(returns)
                position_value = self.current_capital * kelly_pct
                shares = int(position_value / entry_price)

        else:
            shares = 0

        # Apply maximum position size limit
        max_shares = int((self.current_capital * self.max_position_size) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def _calculate_kelly(self, returns: List[float]) -> float:
        """Calculate Kelly percentage from returns."""
        if not returns:
            return 0.0

        returns_array = np.array(returns)
        wins = returns_array[returns_array > 0]
        losses = returns_array[returns_array < 0]

        if len(wins) == 0 or len(losses) == 0:
            return 0.02  # Default 2%

        win_rate = len(wins) / len(returns_array)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        if avg_loss == 0:
            return 0.02

        win_loss_ratio = avg_win / avg_loss
        kelly = win_rate - ((1 - win_rate) / win_loss_ratio)
        kelly = kelly * self.kelly_fraction

        return max(0.0, min(kelly, self.max_position_size))

    def check_correlation(self, symbol: str) -> bool:
        """
        Check if adding position would violate correlation limits.

        Parameters:
        -----------
        symbol : str
            Symbol to check

        Returns:
        --------
        bool : True if correlation is acceptable
        """
        if not self.positions:
            return True

        # Download price data
        try:
            symbols = list(self.positions.keys()) + [symbol]
            data = yf.download(symbols, period='3mo', progress=False)['Adj Close']

            if len(symbols) == 2:
                corr = data.corr().iloc[0, 1]
            else:
                corr = data[symbol].corr(data[list(self.positions.keys())[0]])

            return abs(corr) < self.max_correlation

        except:
            return True  # Allow if data unavailable

    def check_portfolio_risk(self) -> float:
        """
        Calculate current portfolio risk.

        Returns:
        --------
        float : Total portfolio risk as fraction
        """
        if not self.positions:
            return 0.0

        total_risk = 0.0

        for pos in self.positions.values():
            # Risk per position
            risk_per_share = abs(pos.entry_price - pos.stop_loss)
            position_risk = (risk_per_share * pos.shares) / self.current_capital
            total_risk += position_risk

        return total_risk

    def can_open_position(self, symbol: str, position_risk: float) -> Tuple[bool, str]:
        """
        Check if new position can be opened.

        Parameters:
        -----------
        symbol : str
            Symbol to trade
        position_risk : float
            Risk of new position as fraction

        Returns:
        --------
        Tuple[bool, str] : (can_open, reason)
        """
        # Check if already have position
        if symbol in self.positions:
            return False, "Position already exists"

        # Check drawdown
        current_dd = self.get_current_drawdown()
        if current_dd >= self.max_drawdown:
            return False, f"Maximum drawdown reached: {current_dd:.2%}"

        # Check portfolio risk
        current_risk = self.check_portfolio_risk()
        if current_risk + position_risk > self.max_portfolio_risk:
            return False, f"Portfolio risk limit exceeded: {current_risk + position_risk:.2%}"

        # Check correlation
        if not self.check_correlation(symbol):
            return False, "Correlation limit exceeded"

        return True, "OK"

    def open_position(self,
                     symbol: str,
                     entry_price: float,
                     shares: int,
                     stop_loss: float,
                     take_profit: Optional[float] = None) -> bool:
        """
        Open a new position.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        entry_price : float
            Entry price
        shares : int
            Number of shares
        stop_loss : float
            Stop loss price
        take_profit : float, optional
            Take profit price

        Returns:
        --------
        bool : True if position opened successfully
        """
        # Calculate position risk
        risk_per_share = abs(entry_price - stop_loss)
        position_risk = (risk_per_share * shares) / self.current_capital

        # Check if can open
        can_open, reason = self.can_open_position(symbol, position_risk)

        if not can_open:
            print(f"Cannot open position: {reason}")
            return False

        # Create position
        position = Position(
            symbol=symbol,
            entry_price=entry_price,
            shares=shares,
            entry_date=datetime.now(),
            stop_loss=stop_loss,
            take_profit=take_profit,
            current_price=entry_price
        )

        self.positions[symbol] = position

        # Update capital
        self.current_capital -= entry_price * shares

        print(f"Opened position: {symbol} - {shares} shares @ ${entry_price:.2f}")
        print(f"Stop Loss: ${stop_loss:.2f}, Risk: {position_risk:.2%}")

        return True

    def close_position(self, symbol: str, exit_price: float, reason: str = "Manual") -> bool:
        """
        Close an existing position.

        Parameters:
        -----------
        symbol : str
            Symbol to close
        exit_price : float
            Exit price
        reason : str
            Reason for closing

        Returns:
        --------
        bool : True if closed successfully
        """
        if symbol not in self.positions:
            print(f"No position found for {symbol}")
            return False

        pos = self.positions[symbol]

        # Calculate P&L
        pnl = (exit_price - pos.entry_price) * pos.shares
        pnl_pct = (exit_price - pos.entry_price) / pos.entry_price

        # Update capital
        self.current_capital += exit_price * pos.shares

        # Create trade record
        hold_days = (datetime.now() - pos.entry_date).days
        trade = Trade(
            symbol=symbol,
            entry_price=pos.entry_price,
            exit_price=exit_price,
            shares=pos.shares,
            entry_date=pos.entry_date,
            exit_date=datetime.now(),
            pnl=pnl,
            pnl_pct=pnl_pct,
            hold_days=hold_days
        )

        self.trade_history.append(trade)

        # Remove position
        del self.positions[symbol]

        # Update equity curve
        self.equity_curve.append(self.current_capital)
        self.equity_dates.append(datetime.now())

        # Update peak
        if self.current_capital > self.peak_capital:
            self.peak_capital = self.current_capital
            self.peak_date = datetime.now()

        print(f"Closed position: {symbol} @ ${exit_price:.2f}")
        print(f"P&L: ${pnl:,.2f} ({pnl_pct:+.2%}) - Reason: {reason}")

        return True

    def update_positions(self):
        """Update all positions with current prices."""
        if not self.positions:
            return

        symbols = list(self.positions.keys())

        try:
            # Download current prices
            data = yf.download(symbols, period='1d', progress=False)

            if len(symbols) == 1:
                current_price = data['Adj Close'].iloc[-1]
                self.positions[symbols[0]].current_price = current_price
            else:
                for symbol in symbols:
                    current_price = data['Adj Close'][symbol].iloc[-1]
                    self.positions[symbol].current_price = current_price

            print("Positions updated with current prices")

        except Exception as e:
            print(f"Error updating positions: {e}")

    def check_stops(self) -> List[str]:
        """
        Check if any positions hit stop loss.

        Returns:
        --------
        List[str] : Symbols that hit stops
        """
        stopped_out = []

        for symbol, pos in self.positions.items():
            if pos.current_price is None:
                continue

            # Check stop loss
            if pos.current_price <= pos.stop_loss:
                self.close_position(symbol, pos.stop_loss, "Stop Loss")
                stopped_out.append(symbol)

            # Check take profit
            elif pos.take_profit and pos.current_price >= pos.take_profit:
                self.close_position(symbol, pos.take_profit, "Take Profit")
                stopped_out.append(symbol)

        return stopped_out

    def update_trailing_stops(self, trail_pct: float = 0.10):
        """
        Update trailing stops for profitable positions.

        Parameters:
        -----------
        trail_pct : float
            Trailing stop percentage
        """
        for symbol, pos in self.positions.items():
            if pos.current_price is None:
                continue

            # Only trail if profitable
            if pos.current_price > pos.entry_price:
                new_stop = pos.current_price * (1 - trail_pct)

                # Only raise stop, never lower
                if new_stop > pos.stop_loss:
                    pos.stop_loss = new_stop
                    print(f"Updated trailing stop for {symbol}: ${new_stop:.2f}")

    def get_current_drawdown(self) -> float:
        """
        Calculate current drawdown.

        Returns:
        --------
        float : Current drawdown as fraction
        """
        total_value = self.get_total_value()

        if self.peak_capital == 0:
            return 0.0

        drawdown = (self.peak_capital - total_value) / self.peak_capital
        return max(0.0, drawdown)

    def get_total_value(self) -> float:
        """
        Get total portfolio value.

        Returns:
        --------
        float : Total value (cash + positions)
        """
        position_value = sum(pos.position_value for pos in self.positions.values())
        return self.current_capital + position_value

    def get_performance_metrics(self) -> Dict:
        """
        Calculate performance metrics.

        Returns:
        --------
        Dict : Performance metrics
        """
        if not self.trade_history:
            return {}

        returns = [t.pnl_pct for t in self.trade_history]
        pnls = [t.pnl for t in self.trade_history]

        wins = [r for r in returns if r > 0]
        losses = [r for r in returns if r < 0]

        total_return = (self.get_total_value() - self.initial_capital) / self.initial_capital

        metrics = {
            'total_trades': len(self.trade_history),
            'winning_trades': len(wins),
            'losing_trades': len(losses),
            'win_rate': len(wins) / len(returns) if returns else 0,
            'avg_win': np.mean(wins) if wins else 0,
            'avg_loss': np.mean(losses) if losses else 0,
            'avg_win_loss_ratio': abs(np.mean(wins) / np.mean(losses)) if wins and losses else 0,
            'total_pnl': sum(pnls),
            'total_return': total_return,
            'max_drawdown': self.get_max_drawdown(),
            'current_drawdown': self.get_current_drawdown(),
            'sharpe_ratio': self.calculate_sharpe_ratio(),
            'expectancy': self.calculate_expectancy()
        }

        return metrics

    def get_max_drawdown(self) -> float:
        """Calculate maximum drawdown from equity curve."""
        if len(self.equity_curve) < 2:
            return 0.0

        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        return np.max(drawdowns)

    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio."""
        if len(self.trade_history) < 2:
            return 0.0

        returns = [t.pnl_pct for t in self.trade_history]
        excess_returns = np.array(returns) - (risk_free_rate / 252)

        if np.std(excess_returns) == 0:
            return 0.0

        return np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)

    def calculate_expectancy(self) -> float:
        """Calculate expectancy per trade."""
        if not self.trade_history:
            return 0.0

        returns = [t.pnl_pct for t in self.trade_history]
        wins = [r for r in returns if r > 0]
        losses = [r for r in returns if r < 0]

        if not wins or not losses:
            return 0.0

        win_rate = len(wins) / len(returns)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        expectancy = (win_rate * avg_win) - ((1 - win_rate) * avg_loss)
        return expectancy

    def generate_report(self):
        """Generate comprehensive risk report."""
        print("\n" + "=" * 70)
        print("RISK MANAGEMENT REPORT")
        print("=" * 70)

        # Portfolio summary
        print("\nPORTFOLIO SUMMARY")
        print("-" * 70)
        print(f"Initial Capital:    ${self.initial_capital:,.2f}")
        print(f"Current Cash:       ${self.current_capital:,.2f}")
        print(f"Position Value:     ${sum(p.position_value for p in self.positions.values()):,.2f}")
        print(f"Total Value:        ${self.get_total_value():,.2f}")
        print(f"Total Return:       {(self.get_total_value() - self.initial_capital) / self.initial_capital:+.2%}")

        # Current positions
        print("\nCURRENT POSITIONS")
        print("-" * 70)
        if self.positions:
            for symbol, pos in self.positions.items():
                print(f"\n{symbol}:")
                print(f"  Shares:           {pos.shares}")
                print(f"  Entry Price:      ${pos.entry_price:.2f}")
                print(f"  Current Price:    ${pos.current_price:.2f}" if pos.current_price else "  Current Price:    N/A")
                print(f"  Stop Loss:        ${pos.stop_loss:.2f}")
                print(f"  Position Value:   ${pos.position_value:,.2f}")
                print(f"  Unrealized P&L:   ${pos.unrealized_pnl:,.2f} ({pos.unrealized_pnl_pct:+.2%})")
        else:
            print("No open positions")

        # Risk metrics
        print("\nRISK METRICS")
        print("-" * 70)
        print(f"Portfolio Risk:     {self.check_portfolio_risk():.2%} / {self.max_portfolio_risk:.2%}")
        print(f"Current Drawdown:   {self.get_current_drawdown():.2%}")
        print(f"Max Drawdown:       {self.get_max_drawdown():.2%}")
        print(f"Peak Capital:       ${self.peak_capital:,.2f}")

        # Performance metrics
        if self.trade_history:
            print("\nPERFORMANCE METRICS")
            print("-" * 70)
            metrics = self.get_performance_metrics()
            print(f"Total Trades:       {metrics['total_trades']}")
            print(f"Win Rate:           {metrics['win_rate']:.2%}")
            print(f"Avg Win:            {metrics['avg_win']:+.2%}")
            print(f"Avg Loss:           {metrics['avg_loss']:+.2%}")
            print(f"Win/Loss Ratio:     {metrics['avg_win_loss_ratio']:.2f}")
            print(f"Expectancy:         {metrics['expectancy']:+.2%}")
            print(f"Sharpe Ratio:       {metrics['sharpe_ratio']:.2f}")

        print("\n" + "=" * 70)

    def plot_equity_curve(self):
        """Plot equity curve with drawdowns."""
        if len(self.equity_curve) < 2:
            print("Not enough data to plot")
            return

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

        # Equity curve
        ax1.plot(self.equity_dates, self.equity_curve, label='Portfolio Value', linewidth=2)
        ax1.axhline(y=self.initial_capital, color='gray', linestyle='--', label='Initial Capital')
        ax1.set_ylabel('Portfolio Value ($)')
        ax1.set_title('Equity Curve')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Drawdown
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        ax2.fill_between(self.equity_dates, 0, -drawdowns * 100, alpha=0.3, color='red')
        ax2.plot(self.equity_dates, -drawdowns * 100, color='red', linewidth=2)
        ax2.axhline(y=-self.max_drawdown * 100, color='orange', linestyle='--',
                   label=f'Max DD Limit ({self.max_drawdown:.0%})')
        ax2.set_ylabel('Drawdown (%)')
        ax2.set_xlabel('Date')
        ax2.set_title('Drawdown')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()


# Example usage
def example_risk_system():
    """
    Demonstrate comprehensive risk management system.
    """
    print("Comprehensive Risk Management System")
    print("=" * 70)

    # Initialize risk manager
    risk_mgr = RiskManager(
        initial_capital=100000,
        max_position_size=0.10,
        max_portfolio_risk=0.06,
        max_correlation=0.70,
        max_drawdown=0.20,
        kelly_fraction=0.5
    )

    # Example 1: Open positions
    print("\nExample 1: Opening Positions")
    print("-" * 70)

    # Calculate position size
    symbol = "AAPL"
    entry_price = 150.0
    stop_loss = 145.0

    shares = risk_mgr.calculate_position_size(
        symbol, entry_price, stop_loss, method='fixed_risk', risk_amount=1000
    )

    print(f"Calculated position size: {shares} shares")

    # Open position
    risk_mgr.open_position(
        symbol=symbol,
        entry_price=entry_price,
        shares=shares,
        stop_loss=stop_loss,
        take_profit=160.0
    )

    # Example 2: Update and monitor
    print("\nExample 2: Position Monitoring")
    print("-" * 70)

    # Simulate price update
    risk_mgr.positions[symbol].current_price = 155.0
    risk_mgr.update_trailing_stops(trail_pct=0.05)

    # Example 3: Close position
    print("\nExample 3: Closing Position")
    print("-" * 70)

    risk_mgr.close_position(symbol, 155.0, "Take Profit")

    # Generate report
    risk_mgr.generate_report()


if __name__ == "__main__":
    example_risk_system()
```

## Part 2: Advanced Features

### Risk Alerts System

```python
class RiskAlertSystem:
    """
    Alert system for risk violations.
    """

    def __init__(self, risk_manager: RiskManager):
        self.risk_manager = risk_manager
        self.alerts = []

    def check_alerts(self) -> List[str]:
        """Check for risk violations."""
        alerts = []

        # Check drawdown
        dd = self.risk_manager.get_current_drawdown()
        if dd > self.risk_manager.max_drawdown * 0.8:
            alerts.append(f"WARNING: Drawdown at {dd:.2%}, approaching limit")

        # Check portfolio risk
        risk = self.risk_manager.check_portfolio_risk()
        if risk > self.risk_manager.max_portfolio_risk * 0.9:
            alerts.append(f"WARNING: Portfolio risk at {risk:.2%}, near limit")

        # Check position concentration
        if self.risk_manager.positions:
            total_value = self.risk_manager.get_total_value()
            for symbol, pos in self.risk_manager.positions.items():
                concentration = pos.position_value / total_value
                if concentration > 0.25:
                    alerts.append(f"WARNING: {symbol} concentration at {concentration:.2%}")

        self.alerts.extend(alerts)
        return alerts

    def get_alert_history(self) -> List[str]:
        """Get all historical alerts."""
        return self.alerts
```

### Performance Attribution

```python
class PerformanceAttribution:
    """
    Analyze performance attribution.
    """

    def __init__(self, risk_manager: RiskManager):
        self.risk_manager = risk_manager

    def analyze_by_symbol(self) -> pd.DataFrame:
        """Analyze performance by symbol."""
        if not self.risk_manager.trade_history:
            return pd.DataFrame()

        symbol_stats = {}

        for trade in self.risk_manager.trade_history:
            if trade.symbol not in symbol_stats:
                symbol_stats[trade.symbol] = {
                    'trades': 0,
                    'wins': 0,
                    'total_pnl': 0,
                    'total_pnl_pct': 0
                }

            stats = symbol_stats[trade.symbol]
            stats['trades'] += 1
            if trade.pnl > 0:
                stats['wins'] += 1
            stats['total_pnl'] += trade.pnl
            stats['total_pnl_pct'] += trade.pnl_pct

        # Convert to DataFrame
        df = pd.DataFrame.from_dict(symbol_stats, orient='index')
        df['win_rate'] = df['wins'] / df['trades']
        df['avg_pnl_pct'] = df['total_pnl_pct'] / df['trades']

        return df.sort_values('total_pnl', ascending=False)

    def analyze_by_hold_period(self) -> pd.DataFrame:
        """Analyze performance by holding period."""
        if not self.risk_manager.trade_history:
            return pd.DataFrame()

        periods = {'0-1d': [], '1-5d': [], '5-20d': [], '20+d': []}

        for trade in self.risk_manager.trade_history:
            if trade.hold_days <= 1:
                periods['0-1d'].append(trade.pnl_pct)
            elif trade.hold_days <= 5:
                periods['1-5d'].append(trade.pnl_pct)
            elif trade.hold_days <= 20:
                periods['5-20d'].append(trade.pnl_pct)
            else:
                periods['20+d'].append(trade.pnl_pct)

        stats = {}
        for period, returns in periods.items():
            if returns:
                stats[period] = {
                    'trades': len(returns),
                    'avg_return': np.mean(returns),
                    'win_rate': len([r for r in returns if r > 0]) / len(returns)
                }

        return pd.DataFrame.from_dict(stats, orient='index')
```

## Part 3: Backtesting Integration

```python
def backtest_risk_system(symbols: List[str],
                        start_date: str,
                        end_date: str,
                        initial_capital: float = 100000):
    """
    Backtest the risk management system.

    Parameters:
    -----------
    symbols : List[str]
        List of symbols to trade
    start_date : str
        Start date
    end_date : str
        End date
    initial_capital : float
        Starting capital

    Returns:
    --------
    RiskManager : Risk manager with backtest results
    """
    # Initialize risk manager
    risk_mgr = RiskManager(initial_capital=initial_capital)

    # Download data
    data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']

    # Simple moving average crossover strategy
    for symbol in symbols:
        prices = data[symbol] if len(symbols) > 1 else data

        # Calculate moving averages
        ma_short = prices.rolling(20).mean()
        ma_long = prices.rolling(50).mean()

        position_open = False

        for i in range(50, len(prices)):
            current_price = prices.iloc[i]

            # Entry signal
            if not position_open and ma_short.iloc[i] > ma_long.iloc[i]:
                # Calculate stop loss (2 ATR)
                atr = prices.iloc[i-20:i].pct_change().std() * current_price
                stop_loss = current_price - (2 * atr)

                # Calculate position size
                shares = risk_mgr.calculate_position_size(
                    symbol, current_price, stop_loss, method='kelly'
                )

                if shares > 0:
                    success = risk_mgr.open_position(
                        symbol, current_price, shares, stop_loss
                    )
                    if success:
                        position_open = True

            # Exit signal
            elif position_open and ma_short.iloc[i] < ma_long.iloc[i]:
                risk_mgr.close_position(symbol, current_price, "Signal")
                position_open = False

            # Update positions
            if symbol in risk_mgr.positions:
                risk_mgr.positions[symbol].current_price = current_price

            # Check stops
            risk_mgr.check_stops()

    return risk_mgr
```

## Project Tasks

### Task 1: System Implementation
Implement the complete risk management system with all components.

### Task 2: Real-Time Monitoring
Create a dashboard that displays:
- Current positions and P&L
- Portfolio risk metrics
- Drawdown status
- Risk alerts

### Task 3: Backtesting
Backtest the system on historical data for multiple symbols and analyze:
- Performance metrics
- Risk-adjusted returns
- Drawdown characteristics
- Position sizing effectiveness

### Task 4: Optimization
Optimize risk parameters:
- Maximum position size
- Kelly fraction
- Drawdown limits
- Correlation thresholds

Test different combinations and compare results.

### Task 5: Reporting
Create comprehensive reports including:
- Performance attribution by symbol
- Performance by holding period
- Risk metrics over time
- Equity curve with drawdowns

## Evaluation Criteria

Your project will be evaluated on:

1. **Completeness** (25%): All components implemented and integrated
2. **Functionality** (25%): System works correctly and handles edge cases
3. **Risk Management** (20%): Proper implementation of risk controls
4. **Performance** (15%): System achieves good risk-adjusted returns
5. **Code Quality** (15%): Clean, well-documented, maintainable code

## Submission Guidelines

Submit the following:

1. Complete Python implementation
2. Backtest results on at least 3 different symbols
3. Performance report with metrics and visualizations
4. Documentation explaining your approach and findings
5. Analysis of risk parameter optimization

## Bonus Challenges

1. Implement Monte Carlo simulation for risk assessment
2. Add machine learning for dynamic parameter adjustment
3. Create real-time alert system with email/SMS notifications
4. Implement portfolio optimization using Modern Portfolio Theory
5. Add support for options and other derivatives

## Conclusion

This project integrates all risk management concepts from Module 5 into a professional-grade system. By completing this project, you'll have a reusable framework that can be applied to any trading strategy, significantly improving risk-adjusted returns and protecting capital during adverse market conditions.

The skills developed here form the foundation for professional trading system development and are essential for anyone serious about systematic trading.
