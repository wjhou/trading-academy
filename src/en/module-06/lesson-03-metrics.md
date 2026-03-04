# Lesson 6.3: Performance Metrics

## Learning Objectives

By the end of this lesson, you will be able to:
- Calculate and interpret comprehensive performance metrics
- Understand risk-adjusted return measures
- Evaluate strategy quality beyond simple returns
- Compare strategies using multiple metrics
- Identify which metrics matter most for different trading styles

## Introduction

Total return is not enough to evaluate a trading strategy. Two strategies with the same return can have vastly different risk profiles, drawdowns, and consistency. Comprehensive performance metrics help you understand the true quality of a strategy and compare different approaches objectively.

Professional traders focus on risk-adjusted returns—how much return you generate per unit of risk taken. This lesson covers the essential metrics used in quantitative trading.

## Return Metrics

### Total Return

The simplest metric—percentage gain or loss:

```python
def calculate_total_return(initial_capital: float, final_capital: float) -> float:
    """
    Calculate total return.

    Parameters:
    -----------
    initial_capital : float
        Starting capital
    final_capital : float
        Ending capital

    Returns:
    --------
    float : Total return as fraction
    """
    return (final_capital - initial_capital) / initial_capital
```

### Annualized Return

Standardizes returns to annual basis for comparison:

```python
def calculate_annualized_return(total_return: float, days: int) -> float:
    """
    Calculate annualized return.

    Parameters:
    -----------
    total_return : float
        Total return as fraction
    days : int
        Number of days

    Returns:
    --------
    float : Annualized return
    """
    years = days / 365.25
    if years <= 0:
        return 0.0

    annualized = (1 + total_return) ** (1 / years) - 1
    return annualized
```

### Compound Annual Growth Rate (CAGR)

Similar to annualized return, emphasizes compounding:

```python
def calculate_cagr(initial_capital: float,
                   final_capital: float,
                   years: float) -> float:
    """
    Calculate CAGR.

    Parameters:
    -----------
    initial_capital : float
        Starting capital
    final_capital : float
        Ending capital
    years : float
        Number of years

    Returns:
    --------
    float : CAGR
    """
    if years <= 0 or initial_capital <= 0:
        return 0.0

    cagr = (final_capital / initial_capital) ** (1 / years) - 1
    return cagr
```

## Risk Metrics

### Volatility (Standard Deviation)

Measures return variability:

```python
import numpy as np
import pandas as pd

def calculate_volatility(returns: pd.Series, annualize: bool = True) -> float:
    """
    Calculate volatility.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    annualize : bool
        Whether to annualize

    Returns:
    --------
    float : Volatility
    """
    vol = returns.std()

    if annualize:
        vol = vol * np.sqrt(252)  # Assuming daily returns

    return vol
```

### Maximum Drawdown

Largest peak-to-trough decline:

```python
def calculate_max_drawdown(equity_curve: pd.Series) -> float:
    """
    Calculate maximum drawdown.

    Parameters:
    -----------
    equity_curve : pd.Series
        Equity curve values

    Returns:
    --------
    float : Maximum drawdown as fraction
    """
    running_max = equity_curve.expanding().max()
    drawdowns = (equity_curve - running_max) / running_max
    max_dd = drawdowns.min()

    return abs(max_dd)


def calculate_drawdown_duration(equity_curve: pd.Series) -> int:
    """
    Calculate longest drawdown duration in days.

    Parameters:
    -----------
    equity_curve : pd.Series
        Equity curve with datetime index

    Returns:
    --------
    int : Longest drawdown duration in days
    """
    running_max = equity_curve.expanding().max()
    is_drawdown = equity_curve < running_max

    # Find drawdown periods
    drawdown_periods = []
    start = None

    for i, in_dd in enumerate(is_drawdown):
        if in_dd and start is None:
            start = i
        elif not in_dd and start is not None:
            drawdown_periods.append((start, i))
            start = None

    if start is not None:
        drawdown_periods.append((start, len(equity_curve)))

    # Calculate durations
    if not drawdown_periods:
        return 0

    max_duration = 0
    for start, end in drawdown_periods:
        duration = (equity_curve.index[end-1] - equity_curve.index[start]).days
        max_duration = max(max_duration, duration)

    return max_duration
```

### Value at Risk (VaR)

Maximum expected loss at given confidence level:

```python
def calculate_var(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    Calculate Value at Risk.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    confidence : float
        Confidence level (0.95 = 95%)

    Returns:
    --------
    float : VaR as fraction
    """
    var = returns.quantile(1 - confidence)
    return abs(var)


def calculate_cvar(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    Calculate Conditional Value at Risk (Expected Shortfall).

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    confidence : float
        Confidence level

    Returns:
    --------
    float : CVaR as fraction
    """
    var = calculate_var(returns, confidence)
    cvar = returns[returns <= -var].mean()
    return abs(cvar)
```

## Risk-Adjusted Return Metrics

### Sharpe Ratio

Most widely used risk-adjusted metric:

```python
def calculate_sharpe_ratio(returns: pd.Series,
                          risk_free_rate: float = 0.02,
                          periods_per_year: int = 252) -> float:
    """
    Calculate Sharpe Ratio.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    risk_free_rate : float
        Annual risk-free rate
    periods_per_year : int
        Number of periods per year (252 for daily)

    Returns:
    --------
    float : Sharpe ratio
    """
    # Convert annual risk-free rate to period rate
    rf_period = risk_free_rate / periods_per_year

    # Calculate excess returns
    excess_returns = returns - rf_period

    # Calculate Sharpe ratio
    if excess_returns.std() == 0:
        return 0.0

    sharpe = excess_returns.mean() / excess_returns.std()

    # Annualize
    sharpe = sharpe * np.sqrt(periods_per_year)

    return sharpe
```

**Interpretation:**
- < 1.0: Poor
- 1.0 - 2.0: Good
- 2.0 - 3.0: Very good
- > 3.0: Excellent (but verify for errors!)

### Sortino Ratio

Like Sharpe but only penalizes downside volatility:

```python
def calculate_sortino_ratio(returns: pd.Series,
                           risk_free_rate: float = 0.02,
                           periods_per_year: int = 252) -> float:
    """
    Calculate Sortino Ratio.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    risk_free_rate : float
        Annual risk-free rate
    periods_per_year : int
        Number of periods per year

    Returns:
    --------
    float : Sortino ratio
    """
    rf_period = risk_free_rate / periods_per_year
    excess_returns = returns - rf_period

    # Downside deviation (only negative returns)
    downside_returns = excess_returns[excess_returns < 0]

    if len(downside_returns) == 0 or downside_returns.std() == 0:
        return 0.0

    sortino = excess_returns.mean() / downside_returns.std()
    sortino = sortino * np.sqrt(periods_per_year)

    return sortino
```

### Calmar Ratio

Return divided by maximum drawdown:

```python
def calculate_calmar_ratio(annualized_return: float,
                          max_drawdown: float) -> float:
    """
    Calculate Calmar Ratio.

    Parameters:
    -----------
    annualized_return : float
        Annualized return
    max_drawdown : float
        Maximum drawdown as fraction

    Returns:
    --------
    float : Calmar ratio
    """
    if max_drawdown == 0:
        return 0.0

    return annualized_return / max_drawdown
```

**Interpretation:**
- < 1.0: Poor
- 1.0 - 3.0: Good
- 3.0 - 5.0: Very good
- > 5.0: Excellent

### Omega Ratio

Probability-weighted ratio of gains vs losses:

```python
def calculate_omega_ratio(returns: pd.Series, threshold: float = 0.0) -> float:
    """
    Calculate Omega Ratio.

    Parameters:
    -----------
    returns : pd.Series
        Series of returns
    threshold : float
        Threshold return (usually 0)

    Returns:
    --------
    float : Omega ratio
    """
    excess_returns = returns - threshold

    gains = excess_returns[excess_returns > 0].sum()
    losses = abs(excess_returns[excess_returns < 0].sum())

    if losses == 0:
        return float('inf') if gains > 0 else 0.0

    return gains / losses
```

## Trade-Level Metrics

### Win Rate

Percentage of winning trades:

```python
def calculate_win_rate(trades: list) -> float:
    """
    Calculate win rate.

    Parameters:
    -----------
    trades : list
        List of trade P&Ls

    Returns:
    --------
    float : Win rate as fraction
    """
    if not trades:
        return 0.0

    winning_trades = len([t for t in trades if t > 0])
    return winning_trades / len(trades)
```

### Profit Factor

Gross profit divided by gross loss:

```python
def calculate_profit_factor(trades: list) -> float:
    """
    Calculate profit factor.

    Parameters:
    -----------
    trades : list
        List of trade P&Ls

    Returns:
    --------
    float : Profit factor
    """
    gross_profit = sum([t for t in trades if t > 0])
    gross_loss = abs(sum([t for t in trades if t < 0]))

    if gross_loss == 0:
        return float('inf') if gross_profit > 0 else 0.0

    return gross_profit / gross_loss
```

**Interpretation:**
- < 1.0: Losing strategy
- 1.0 - 1.5: Marginal
- 1.5 - 2.0: Good
- > 2.0: Excellent

### Expectancy

Average expected profit per trade:

```python
def calculate_expectancy(trades: list) -> float:
    """
    Calculate expectancy.

    Parameters:
    -----------
    trades : list
        List of trade P&Ls

    Returns:
    --------
    float : Expectancy
    """
    if not trades:
        return 0.0

    wins = [t for t in trades if t > 0]
    losses = [t for t in trades if t < 0]

    if not wins or not losses:
        return 0.0

    win_rate = len(wins) / len(trades)
    avg_win = np.mean(wins)
    avg_loss = abs(np.mean(losses))

    expectancy = (win_rate * avg_win) - ((1 - win_rate) * avg_loss)

    return expectancy
```

### Average Win/Loss Ratio

```python
def calculate_win_loss_ratio(trades: list) -> float:
    """
    Calculate average win to average loss ratio.

    Parameters:
    -----------
    trades : list
        List of trade P&Ls

    Returns:
    --------
    float : Win/loss ratio
    """
    wins = [t for t in trades if t > 0]
    losses = [t for t in trades if t < 0]

    if not wins or not losses:
        return 0.0

    avg_win = np.mean(wins)
    avg_loss = abs(np.mean(losses))

    return avg_win / avg_loss if avg_loss != 0 else 0.0
```

## Comprehensive Performance Analyzer

Let's create a complete performance analysis class:

```python
from typing import Dict, List
from dataclasses import dataclass
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class PerformanceMetrics:
    """Container for performance metrics."""
    # Return metrics
    total_return: float
    annualized_return: float
    cagr: float

    # Risk metrics
    volatility: float
    max_drawdown: float
    max_dd_duration: int
    var_95: float
    cvar_95: float

    # Risk-adjusted metrics
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    omega_ratio: float

    # Trade metrics
    total_trades: int
    win_rate: float
    profit_factor: float
    expectancy: float
    avg_win_loss_ratio: float

    # Additional metrics
    best_trade: float
    worst_trade: float
    avg_trade: float
    longest_win_streak: int
    longest_loss_streak: int


class PerformanceAnalyzer:
    """
    Comprehensive performance analysis.
    """

    def __init__(self, equity_curve: pd.Series, trades: List[float]):
        """
        Initialize analyzer.

        Parameters:
        -----------
        equity_curve : pd.Series
            Equity curve with datetime index
        trades : List[float]
            List of trade P&Ls
        """
        self.equity_curve = equity_curve
        self.trades = trades
        self.returns = equity_curve.pct_change().dropna()

    def calculate_all_metrics(self, risk_free_rate: float = 0.02) -> PerformanceMetrics:
        """
        Calculate all performance metrics.

        Parameters:
        -----------
        risk_free_rate : float
            Annual risk-free rate

        Returns:
        --------
        PerformanceMetrics : All metrics
        """
        # Return metrics
        initial = self.equity_curve.iloc[0]
        final = self.equity_curve.iloc[-1]
        total_ret = calculate_total_return(initial, final)

        days = (self.equity_curve.index[-1] - self.equity_curve.index[0]).days
        ann_ret = calculate_annualized_return(total_ret, days)
        cagr = calculate_cagr(initial, final, days / 365.25)

        # Risk metrics
        vol = calculate_volatility(self.returns)
        max_dd = calculate_max_drawdown(self.equity_curve)
        max_dd_dur = calculate_drawdown_duration(self.equity_curve)
        var = calculate_var(self.returns)
        cvar = calculate_cvar(self.returns)

        # Risk-adjusted metrics
        sharpe = calculate_sharpe_ratio(self.returns, risk_free_rate)
        sortino = calculate_sortino_ratio(self.returns, risk_free_rate)
        calmar = calculate_calmar_ratio(ann_ret, max_dd)
        omega = calculate_omega_ratio(self.returns)

        # Trade metrics
        total_trades = len(self.trades)
        win_rate = calculate_win_rate(self.trades)
        pf = calculate_profit_factor(self.trades)
        exp = calculate_expectancy(self.trades)
        wl_ratio = calculate_win_loss_ratio(self.trades)

        # Additional metrics
        best = max(self.trades) if self.trades else 0
        worst = min(self.trades) if self.trades else 0
        avg = np.mean(self.trades) if self.trades else 0
        win_streak = self._calculate_longest_streak(self.trades, positive=True)
        loss_streak = self._calculate_longest_streak(self.trades, positive=False)

        return PerformanceMetrics(
            total_return=total_ret,
            annualized_return=ann_ret,
            cagr=cagr,
            volatility=vol,
            max_drawdown=max_dd,
            max_dd_duration=max_dd_dur,
            var_95=var,
            cvar_95=cvar,
            sharpe_ratio=sharpe,
            sortino_ratio=sortino,
            calmar_ratio=calmar,
            omega_ratio=omega,
            total_trades=total_trades,
            win_rate=win_rate,
            profit_factor=pf,
            expectancy=exp,
            avg_win_loss_ratio=wl_ratio,
            best_trade=best,
            worst_trade=worst,
            avg_trade=avg,
            longest_win_streak=win_streak,
            longest_loss_streak=loss_streak
        )

    def _calculate_longest_streak(self, trades: List[float], positive: bool = True) -> int:
        """Calculate longest winning or losing streak."""
        if not trades:
            return 0

        max_streak = 0
        current_streak = 0

        for trade in trades:
            if (positive and trade > 0) or (not positive and trade < 0):
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        return max_streak

    def print_report(self, metrics: PerformanceMetrics):
        """Print comprehensive performance report."""
        print("\n" + "=" * 70)
        print("PERFORMANCE ANALYSIS REPORT")
        print("=" * 70)

        print("\nRETURN METRICS")
        print("-" * 70)
        print(f"Total Return:          {metrics.total_return:+.2%}")
        print(f"Annualized Return:     {metrics.annualized_return:+.2%}")
        print(f"CAGR:                  {metrics.cagr:+.2%}")

        print("\nRISK METRICS")
        print("-" * 70)
        print(f"Volatility (Annual):   {metrics.volatility:.2%}")
        print(f"Maximum Drawdown:      {metrics.max_drawdown:.2%}")
        print(f"Max DD Duration:       {metrics.max_dd_duration} days")
        print(f"VaR (95%):             {metrics.var_95:.2%}")
        print(f"CVaR (95%):            {metrics.cvar_95:.2%}")

        print("\nRISK-ADJUSTED METRICS")
        print("-" * 70)
        print(f"Sharpe Ratio:          {metrics.sharpe_ratio:.2f}")
        print(f"Sortino Ratio:         {metrics.sortino_ratio:.2f}")
        print(f"Calmar Ratio:          {metrics.calmar_ratio:.2f}")
        print(f"Omega Ratio:           {metrics.omega_ratio:.2f}")

        print("\nTRADE METRICS")
        print("-" * 70)
        print(f"Total Trades:          {metrics.total_trades}")
        print(f"Win Rate:              {metrics.win_rate:.2%}")
        print(f"Profit Factor:         {metrics.profit_factor:.2f}")
        print(f"Expectancy:            ${metrics.expectancy:,.2f}")
        print(f"Avg Win/Loss Ratio:    {metrics.avg_win_loss_ratio:.2f}")

        print("\nTRADE STATISTICS")
        print("-" * 70)
        print(f"Best Trade:            ${metrics.best_trade:,.2f}")
        print(f"Worst Trade:           ${metrics.worst_trade:,.2f}")
        print(f"Average Trade:         ${metrics.avg_trade:,.2f}")
        print(f"Longest Win Streak:    {metrics.longest_win_streak}")
        print(f"Longest Loss Streak:   {metrics.longest_loss_streak}")

        print("\n" + "=" * 70)

    def plot_analysis(self):
        """Create comprehensive performance visualizations."""
        fig = plt.figure(figsize=(15, 10))
        gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)

        # Equity curve
        ax1 = fig.add_subplot(gs[0, :])
        ax1.plot(self.equity_curve.index, self.equity_curve.values, linewidth=2)
        ax1.set_title('Equity Curve', fontsize=14, fontweight='bold')
        ax1.set_ylabel('Portfolio Value ($)')
        ax1.grid(True, alpha=0.3)

        # Drawdown
        ax2 = fig.add_subplot(gs[1, :])
        running_max = self.equity_curve.expanding().max()
        drawdowns = (self.equity_curve - running_max) / running_max
        ax2.fill_between(self.equity_curve.index, 0, drawdowns * 100,
                        alpha=0.3, color='red')
        ax2.plot(self.equity_curve.index, drawdowns * 100,
                color='red', linewidth=2)
        ax2.set_title('Drawdown', fontsize=14, fontweight='bold')
        ax2.set_ylabel('Drawdown (%)')
        ax2.grid(True, alpha=0.3)

        # Returns distribution
        ax3 = fig.add_subplot(gs[2, 0])
        ax3.hist(self.returns * 100, bins=50, alpha=0.7, edgecolor='black')
        ax3.axvline(x=0, color='red', linestyle='--', linewidth=2)
        ax3.set_title('Returns Distribution', fontsize=12, fontweight='bold')
        ax3.set_xlabel('Return (%)')
        ax3.set_ylabel('Frequency')
        ax3.grid(True, alpha=0.3)

        # Monthly returns heatmap
        ax4 = fig.add_subplot(gs[2, 1])
        monthly_returns = self.returns.resample('M').apply(lambda x: (1 + x).prod() - 1)
        monthly_returns_pct = monthly_returns * 100

        if len(monthly_returns_pct) > 0:
            # Create pivot table for heatmap
            monthly_data = pd.DataFrame({
                'Year': monthly_returns_pct.index.year,
                'Month': monthly_returns_pct.index.month,
                'Return': monthly_returns_pct.values
            })

            pivot = monthly_data.pivot(index='Month', columns='Year', values='Return')

            sns.heatmap(pivot, annot=True, fmt='.1f', cmap='RdYlGn',
                       center=0, ax=ax4, cbar_kws={'label': 'Return (%)'})
            ax4.set_title('Monthly Returns Heatmap', fontsize=12, fontweight='bold')
            ax4.set_ylabel('Month')
            ax4.set_xlabel('Year')

        plt.tight_layout()
        plt.show()


# Example usage
def example_performance_analysis():
    """
    Demonstrate performance analysis.
    """
    import yfinance as yf

    print("Performance Analysis Example")
    print("=" * 70)

    # Download data and create simple equity curve
    data = yf.download('SPY', start='2020-01-01', end='2023-12-31', progress=False)

    # Simulate simple buy-and-hold
    initial_capital = 100000
    shares = initial_capital / data['Close'].iloc[0]
    equity_curve = data['Close'] * shares
    equity_curve.name = 'Portfolio Value'

    # Simulate some trades
    trades = np.random.normal(100, 500, 50).tolist()

    # Analyze performance
    analyzer = PerformanceAnalyzer(equity_curve, trades)
    metrics = analyzer.calculate_all_metrics()

    # Print report
    analyzer.print_report(metrics)

    # Plot analysis
    analyzer.plot_analysis()


if __name__ == "__main__":
    example_performance_analysis()
```

## Comparing Strategies

When comparing multiple strategies, consider:

1. **Risk-Adjusted Returns**: Sharpe/Sortino ratio
2. **Drawdown Characteristics**: Max DD and duration
3. **Consistency**: Win rate and profit factor
4. **Robustness**: Performance across different periods
5. **Practical Considerations**: Trade frequency, capital requirements

## Exercises

### Exercise 1: Calculate Metrics

Given an equity curve, calculate:
- Total and annualized returns
- Maximum drawdown
- Sharpe and Sortino ratios
- Calmar ratio

### Exercise 2: Compare Strategies

Compare two strategies:
- Strategy A: 15% return, 20% volatility, 10% max DD
- Strategy B: 12% return, 10% volatility, 5% max DD

Which is better? Why?

### Exercise 3: Trade Analysis

Analyze a list of 100 trades:
- Calculate win rate, profit factor, expectancy
- Identify longest winning/losing streaks
- Plot trade distribution

### Exercise 4: Rolling Metrics

Calculate rolling 252-day Sharpe ratio for SPY from 2015-2023. Plot how it changes over time.

## Summary

Comprehensive performance analysis requires multiple metrics:

- **Return Metrics**: Total, annualized, CAGR
- **Risk Metrics**: Volatility, max drawdown, VaR
- **Risk-Adjusted**: Sharpe, Sortino, Calmar, Omega
- **Trade Metrics**: Win rate, profit factor, expectancy

No single metric tells the complete story. Evaluate strategies using multiple metrics and consider your risk tolerance, capital, and trading style.

## Next Steps

In the next lesson, we'll explore parameter optimization techniques to find optimal strategy settings while avoiding overfitting.