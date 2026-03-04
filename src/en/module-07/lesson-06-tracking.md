# Lesson 7.6: Performance Tracking

## Learning Objectives

By the end of this lesson, you will be able to:
- Track trading system performance in real-time
- Calculate key performance metrics
- Compare live vs backtest performance
- Identify performance degradation
- Generate performance reports

## Introduction

Performance tracking is essential for understanding how your trading system performs in live markets. This lesson covers tracking, analyzing, and reporting on system performance.

## Real-Time Performance Tracker

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class PerformanceSnapshot:
    """Snapshot of performance at a point in time."""
    timestamp: datetime
    total_value: float
    cash: float
    positions_value: float
    daily_pnl: float
    total_pnl: float
    num_trades: int
    win_rate: float
    sharpe_ratio: float
    max_drawdown: float

class PerformanceTracker:
    """
    Tracks trading system performance in real-time.
    """

    def __init__(self, initial_capital: float):
        """
        Initialize performance tracker.

        Parameters:
        -----------
        initial_capital : float
            Starting capital
        """
        self.initial_capital = initial_capital
        self.equity_curve = [initial_capital]
        self.equity_dates = [datetime.now()]
        self.trades = []
        self.daily_returns = []

    def update(self, portfolio_value: float, trades: List[Dict] = None):
        """
        Update performance metrics.

        Parameters:
        -----------
        portfolio_value : float
            Current portfolio value
        trades : List[Dict], optional
            New trades since last update
        """
        now = datetime.now()

        # Update equity curve
        self.equity_curve.append(portfolio_value)
        self.equity_dates.append(now)

        # Update trades
        if trades:
            self.trades.extend(trades)

        # Calculate daily return
        if len(self.equity_curve) > 1:
            daily_return = (portfolio_value - self.equity_curve[-2]) / self.equity_curve[-2]
            self.daily_returns.append(daily_return)

    def get_current_metrics(self) -> Dict:
        """
        Get current performance metrics.

        Returns:
        --------
        Dict : Performance metrics
        """
        if len(self.equity_curve) < 2:
            return {}

        current_value = self.equity_curve[-1]

        # Total return
        total_return = (current_value - self.initial_capital) / self.initial_capital

        # Calculate returns
        returns = pd.Series(self.equity_curve).pct_change().dropna()

        # Sharpe ratio
        if len(returns) > 0 and returns.std() > 0:
            sharpe = np.sqrt(252) * (returns.mean() / returns.std())
        else:
            sharpe = 0

        # Max drawdown
        equity_array = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity_array)
        drawdowns = (running_max - equity_array) / running_max
        max_dd = np.max(drawdowns)

        # Trade statistics
        if self.trades:
            winning_trades = [t for t in self.trades if t.get('pnl', 0) > 0]
            win_rate = len(winning_trades) / len(self.trades)

            total_pnl = sum(t.get('pnl', 0) for t in self.trades)
        else:
            win_rate = 0
            total_pnl = 0

        return {
            'current_value': current_value,
            'total_return': total_return,
            'total_pnl': total_pnl,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_dd,
            'num_trades': len(self.trades),
            'win_rate': win_rate,
            'days_trading': len(self.equity_curve) - 1
        }

    def get_snapshot(self, cash: float, positions_value: float) -> PerformanceSnapshot:
        """
        Get performance snapshot.

        Parameters:
        -----------
        cash : float
            Current cash
        positions_value : float
            Current positions value

        Returns:
        --------
        PerformanceSnapshot : Current snapshot
        """
        metrics = self.get_current_metrics()
        total_value = cash + positions_value

        # Daily P&L
        if len(self.equity_curve) > 1:
            daily_pnl = total_value - self.equity_curve[-2]
        else:
            daily_pnl = 0

        return PerformanceSnapshot(
            timestamp=datetime.now(),
            total_value=total_value,
            cash=cash,
            positions_value=positions_value,
            daily_pnl=daily_pnl,
            total_pnl=metrics.get('total_pnl', 0),
            num_trades=metrics.get('num_trades', 0),
            win_rate=metrics.get('win_rate', 0),
            sharpe_ratio=metrics.get('sharpe_ratio', 0),
            max_drawdown=metrics.get('max_drawdown', 0)
        )
```

## Live vs Backtest Comparison

```python
class PerformanceComparator:
    """
    Compares live performance to backtest.
    """

    def __init__(self, backtest_results: Dict):
        """
        Initialize comparator.

        Parameters:
        -----------
        backtest_results : Dict
            Backtest performance metrics
        """
        self.backtest_results = backtest_results

    def compare(self, live_metrics: Dict) -> Dict:
        """
        Compare live to backtest performance.

        Parameters:
        -----------
        live_metrics : Dict
            Live performance metrics

        Returns:
        --------
        Dict : Comparison results
        """
        comparison = {}

        metrics_to_compare = [
            'total_return',
            'sharpe_ratio',
            'max_drawdown',
            'win_rate'
        ]

        for metric in metrics_to_compare:
            backtest_value = self.backtest_results.get(metric, 0)
            live_value = live_metrics.get(metric, 0)

            if backtest_value != 0:
                difference = live_value - backtest_value
                pct_difference = (difference / abs(backtest_value)) * 100
            else:
                difference = live_value
                pct_difference = 0

            comparison[metric] = {
                'backtest': backtest_value,
                'live': live_value,
                'difference': difference,
                'pct_difference': pct_difference
            }

        return comparison

    def print_comparison(self, comparison: Dict):
        """Print comparison report."""
        print("\n" + "=" * 70)
        print("LIVE VS BACKTEST COMPARISON")
        print("=" * 70)

        for metric, values in comparison.items():
            print(f"\n{metric.replace('_', ' ').title()}:")
            print(f"  Backtest: {values['backtest']:.4f}")
            print(f"  Live:     {values['live']:.4f}")
            print(f"  Diff:     {values['difference']:+.4f} ({values['pct_difference']:+.1f}%)")

            # Flag significant differences
            if abs(values['pct_difference']) > 20:
                print(f"  ⚠ WARNING: Significant difference detected!")

        print("\n" + "=" * 70)
```

## Performance Degradation Detection

```python
class DegradationDetector:
    """
    Detects performance degradation.
    """

    def __init__(self, baseline_sharpe: float,
                 baseline_win_rate: float):
        """
        Initialize detector.

        Parameters:
        -----------
        baseline_sharpe : float
            Expected Sharpe ratio
        baseline_win_rate : float
            Expected win rate
        """
        self.baseline_sharpe = baseline_sharpe
        self.baseline_win_rate = baseline_win_rate

    def check_degradation(self, current_metrics: Dict) -> List[str]:
        """
        Check for performance degradation.

        Parameters:
        -----------
        current_metrics : Dict
            Current performance metrics

        Returns:
        --------
        List[str] : List of warnings
        """
        warnings = []

        # Check Sharpe ratio
        current_sharpe = current_metrics.get('sharpe_ratio', 0)
        if current_sharpe < self.baseline_sharpe * 0.7:
            warnings.append(
                f"Sharpe ratio degraded: {current_sharpe:.2f} "
                f"(expected: {self.baseline_sharpe:.2f})"
            )

        # Check win rate
        current_win_rate = current_metrics.get('win_rate', 0)
        if current_win_rate < self.baseline_win_rate * 0.8:
            warnings.append(
                f"Win rate degraded: {current_win_rate:.2%} "
                f"(expected: {self.baseline_win_rate:.2%})"
            )

        # Check drawdown
        max_dd = current_metrics.get('max_drawdown', 0)
        if max_dd > 0.20:
            warnings.append(
                f"High drawdown: {max_dd:.2%}"
            )

        return warnings
```

## Performance Reports

```python
class PerformanceReporter:
    """
    Generates performance reports.
    """

    def __init__(self, tracker: PerformanceTracker):
        """
        Initialize reporter.

        Parameters:
        -----------
        tracker : PerformanceTracker
            Performance tracker
        """
        self.tracker = tracker

    def generate_daily_report(self) -> str:
        """
        Generate daily performance report.

        Returns:
        --------
        str : Report text
        """
        metrics = self.tracker.get_current_metrics()

        report = []
        report.append("=" * 70)
        report.append("DAILY PERFORMANCE REPORT")
        report.append("=" * 70)
        report.append(f"Date: {datetime.now().strftime('%Y-%m-%d')}")
        report.append("")

        report.append("PORTFOLIO")
        report.append("-" * 70)
        report.append(f"Current Value:    ${metrics['current_value']:,.2f}")
        report.append(f"Total Return:     {metrics['total_return']:+.2%}")
        report.append(f"Total P&L:        ${metrics['total_pnl']:+,.2f}")
        report.append("")

        report.append("PERFORMANCE METRICS")
        report.append("-" * 70)
        report.append(f"Sharpe Ratio:     {metrics['sharpe_ratio']:.2f}")
        report.append(f"Max Drawdown:     {metrics['max_drawdown']:.2%}")
        report.append(f"Days Trading:     {metrics['days_trading']}")
        report.append("")

        report.append("TRADING ACTIVITY")
        report.append("-" * 70)
        report.append(f"Total Trades:     {metrics['num_trades']}")
        report.append(f"Win Rate:         {metrics['win_rate']:.2%}")
        report.append("")

        report.append("=" * 70)

        return "\n".join(report)

    def generate_monthly_report(self) -> str:
        """Generate monthly performance report."""
        # Calculate monthly statistics
        equity_series = pd.Series(
            self.tracker.equity_curve,
            index=self.tracker.equity_dates
        )

        monthly_returns = equity_series.resample('M').last().pct_change()

        report = []
        report.append("=" * 70)
        report.append("MONTHLY PERFORMANCE REPORT")
        report.append("=" * 70)
        report.append("")

        report.append("MONTHLY RETURNS")
        report.append("-" * 70)
        for date, ret in monthly_returns.items():
            if not pd.isna(ret):
                report.append(f"{date.strftime('%Y-%m')}: {ret:+.2%}")

        report.append("")
        report.append("=" * 70)

        return "\n".join(report)

    def save_report(self, report: str, filename: str):
        """
        Save report to file.

        Parameters:
        -----------
        report : str
            Report text
        filename : str
            Output filename
        """
        with open(filename, 'w') as f:
            f.write(report)

        print(f"Report saved to {filename}")
```

## Trade Analysis

```python
class TradeAnalyzer:
    """
    Analyzes individual trades.
    """

    def analyze_trades(self, trades: List[Dict]) -> Dict:
        """
        Analyze trade performance.

        Parameters:
        -----------
        trades : List[Dict]
            List of trades

        Returns:
        --------
        Dict : Trade analysis
        """
        if not trades:
            return {}

        # Separate wins and losses
        wins = [t for t in trades if t.get('pnl', 0) > 0]
        losses = [t for t in trades if t.get('pnl', 0) < 0]

        # Calculate statistics
        total_pnl = sum(t.get('pnl', 0) for t in trades)
        avg_pnl = total_pnl / len(trades)

        if wins:
            avg_win = sum(t['pnl'] for t in wins) / len(wins)
            max_win = max(t['pnl'] for t in wins)
        else:
            avg_win = 0
            max_win = 0

        if losses:
            avg_loss = sum(t['pnl'] for t in losses) / len(losses)
            max_loss = min(t['pnl'] for t in losses)
        else:
            avg_loss = 0
            max_loss = 0

        # Profit factor
        gross_profit = sum(t['pnl'] for t in wins)
        gross_loss = abs(sum(t['pnl'] for t in losses))

        if gross_loss > 0:
            profit_factor = gross_profit / gross_loss
        else:
            profit_factor = float('inf') if gross_profit > 0 else 0

        return {
            'total_trades': len(trades),
            'winning_trades': len(wins),
            'losing_trades': len(losses),
            'win_rate': len(wins) / len(trades),
            'total_pnl': total_pnl,
            'avg_pnl': avg_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'max_win': max_win,
            'max_loss': max_loss,
            'profit_factor': profit_factor
        }

    def print_analysis(self, analysis: Dict):
        """Print trade analysis."""
        print("\n" + "=" * 70)
        print("TRADE ANALYSIS")
        print("=" * 70)

        print(f"\nTotal Trades:      {analysis['total_trades']}")
        print(f"Winning Trades:    {analysis['winning_trades']}")
        print(f"Losing Trades:     {analysis['losing_trades']}")
        print(f"Win Rate:          {analysis['win_rate']:.2%}")

        print(f"\nTotal P&L:         ${analysis['total_pnl']:,.2f}")
        print(f"Average P&L:       ${analysis['avg_pnl']:,.2f}")
        print(f"Average Win:       ${analysis['avg_win']:,.2f}")
        print(f"Average Loss:      ${analysis['avg_loss']:,.2f}")
        print(f"Max Win:           ${analysis['max_win']:,.2f}")
        print(f"Max Loss:          ${analysis['max_loss']:,.2f}")
        print(f"Profit Factor:     {analysis['profit_factor']:.2f}")

        print("\n" + "=" * 70)
```

## Best Practices

1. **Track Everything**: All trades, orders, metrics
2. **Real-Time Updates**: Update metrics continuously
3. **Compare to Baseline**: Monitor vs backtest/expectations
4. **Detect Degradation**: Alert on performance issues
5. **Generate Reports**: Daily, weekly, monthly
6. **Analyze Trades**: Understand what works
7. **Store History**: Keep long-term records

## Exercises

### Exercise 1: Performance Tracker

Implement a performance tracker that:
- Updates in real-time
- Calculates key metrics
- Stores equity curve
- Tracks all trades

### Exercise 2: Comparison Tool

Create a tool that compares:
- Live vs backtest performance
- Current vs historical performance
- Multiple strategies

### Exercise 3: Degradation Detector

Build a detector that identifies:
- Declining Sharpe ratio
- Increasing drawdown
- Falling win rate
- Unusual patterns

### Exercise 4: Reporting System

Create an automated reporting system that:
- Generates daily reports
- Emails weekly summaries
- Creates monthly analysis
- Produces visualizations

## Summary

Effective performance tracking requires:

- **Real-Time Metrics**: Continuous calculation
- **Comparison**: Live vs backtest
- **Degradation Detection**: Early warning system
- **Comprehensive Reports**: Regular analysis
- **Trade Analysis**: Understand performance drivers

Good tracking:
- Identifies issues early
- Validates strategy effectiveness
- Guides improvements
- Documents performance

## Next Steps

In the final project for this module, you'll integrate all components into a complete automated trading system ready for deployment.