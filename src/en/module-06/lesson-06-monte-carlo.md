# Lesson 6.6: Monte Carlo Simulation

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand Monte Carlo simulation and its applications in trading
- Implement Monte Carlo analysis for strategy evaluation
- Assess the probability of different outcomes
- Calculate confidence intervals for performance metrics
- Use Monte Carlo to stress-test trading strategies

## Introduction

Monte Carlo simulation is a powerful technique that uses random sampling to understand the range of possible outcomes for a trading strategy. Instead of relying on a single backtest result, Monte Carlo analysis generates thousands of possible scenarios to answer questions like:

- What's the probability of a 20% drawdown?
- What range of returns can I expect with 95% confidence?
- How likely am I to achieve my profit target?
- What's the worst-case scenario I should prepare for?

This probabilistic approach provides a more complete picture of strategy risk and potential outcomes than deterministic backtesting alone.

## Types of Monte Carlo Simulation

### 1. Trade Resampling

Randomly reorder historical trades to generate alternative equity curves:

```python
import numpy as np
import pandas as pd
from typing import List, Dict
import matplotlib.pyplot as plt

def monte_carlo_trade_resampling(trades: List[float],
                                initial_capital: float = 100000,
                                n_simulations: int = 1000) -> Dict:
    """
    Monte Carlo simulation by resampling trades.

    Parameters:
    -----------
    trades : List[float]
        List of trade P&Ls
    initial_capital : float
        Starting capital
    n_simulations : int
        Number of simulations

    Returns:
    --------
    Dict : Simulation results
    """
    print(f"Running {n_simulations} Monte Carlo simulations...")

    equity_curves = []
    final_values = []
    max_drawdowns = []
    sharpe_ratios = []

    for sim in range(n_simulations):
        # Randomly resample trades with replacement
        resampled_trades = np.random.choice(trades, size=len(trades), replace=True)

        # Calculate equity curve
        capital = initial_capital
        equity = [capital]

        for trade in resampled_trades:
            capital += trade
            equity.append(capital)

        equity_curves.append(equity)
        final_values.append(capital)

        # Calculate max drawdown
        equity_array = np.array(equity)
        running_max = np.maximum.accumulate(equity_array)
        drawdowns = (running_max - equity_array) / running_max
        max_dd = np.max(drawdowns)
        max_drawdowns.append(max_dd)

        # Calculate Sharpe ratio
        returns = pd.Series(equity).pct_change().dropna()
        if returns.std() > 0:
            sharpe = np.sqrt(252) * (returns.mean() / returns.std())
        else:
            sharpe = 0
        sharpe_ratios.append(sharpe)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'sharpe_ratios': sharpe_ratios,
        'initial_capital': initial_capital
    }


def analyze_monte_carlo_results(results: Dict) -> Dict:
    """
    Analyze Monte Carlo simulation results.

    Parameters:
    -----------
    results : Dict
        Monte Carlo results

    Returns:
    --------
    Dict : Statistical analysis
    """
    final_values = np.array(results['final_values'])
    max_drawdowns = np.array(results['max_drawdowns'])
    sharpe_ratios = np.array(results['sharpe_ratios'])
    initial_capital = results['initial_capital']

    # Calculate returns
    returns = (final_values - initial_capital) / initial_capital

    analysis = {
        # Return statistics
        'mean_return': np.mean(returns),
        'median_return': np.median(returns),
        'std_return': np.std(returns),
        'return_5th_percentile': np.percentile(returns, 5),
        'return_95th_percentile': np.percentile(returns, 95),

        # Final value statistics
        'mean_final_value': np.mean(final_values),
        'median_final_value': np.median(final_values),
        'final_value_5th': np.percentile(final_values, 5),
        'final_value_95th': np.percentile(final_values, 95),

        # Drawdown statistics
        'mean_max_dd': np.mean(max_drawdowns),
        'median_max_dd': np.median(max_drawdowns),
        'max_dd_95th_percentile': np.percentile(max_drawdowns, 95),

        # Sharpe statistics
        'mean_sharpe': np.mean(sharpe_ratios),
        'median_sharpe': np.median(sharpe_ratios),

        # Probability metrics
        'prob_profit': np.sum(returns > 0) / len(returns),
        'prob_loss': np.sum(returns < 0) / len(returns),
        'prob_dd_over_20': np.sum(max_drawdowns > 0.20) / len(max_drawdowns),
        'prob_dd_over_30': np.sum(max_drawdowns > 0.30) / len(max_drawdowns),
    }

    return analysis


def plot_monte_carlo_results(results: Dict, analysis: Dict):
    """
    Plot Monte Carlo simulation results.

    Parameters:
    -----------
    results : Dict
        Monte Carlo results
    analysis : Dict
        Statistical analysis
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))

    # Plot 1: Equity curves
    ax1 = axes[0, 0]
    equity_curves = results['equity_curves']

    # Plot sample of equity curves
    sample_size = min(100, len(equity_curves))
    sample_indices = np.random.choice(len(equity_curves), sample_size, replace=False)

    for idx in sample_indices:
        ax1.plot(equity_curves[idx], alpha=0.1, color='blue')

    # Plot mean equity curve
    mean_equity = np.mean(equity_curves, axis=0)
    ax1.plot(mean_equity, color='red', linewidth=2, label='Mean')

    # Plot percentiles
    percentile_5 = np.percentile(equity_curves, 5, axis=0)
    percentile_95 = np.percentile(equity_curves, 95, axis=0)
    ax1.plot(percentile_5, color='orange', linewidth=2, linestyle='--', label='5th Percentile')
    ax1.plot(percentile_95, color='green', linewidth=2, linestyle='--', label='95th Percentile')

    ax1.axhline(y=results['initial_capital'], color='black', linestyle='--', alpha=0.5)
    ax1.set_xlabel('Trade Number')
    ax1.set_ylabel('Portfolio Value ($)')
    ax1.set_title('Monte Carlo Equity Curves', fontsize=12, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Plot 2: Final value distribution
    ax2 = axes[0, 1]
    final_values = results['final_values']
    ax2.hist(final_values, bins=50, alpha=0.7, edgecolor='black')
    ax2.axvline(x=analysis['mean_final_value'], color='red', linestyle='--',
               linewidth=2, label=f"Mean: ${analysis['mean_final_value']:,.0f}")
    ax2.axvline(x=analysis['final_value_5th'], color='orange', linestyle='--',
               linewidth=2, label=f"5th: ${analysis['final_value_5th']:,.0f}")
    ax2.axvline(x=analysis['final_value_95th'], color='green', linestyle='--',
               linewidth=2, label=f"95th: ${analysis['final_value_95th']:,.0f}")
    ax2.set_xlabel('Final Portfolio Value ($)')
    ax2.set_ylabel('Frequency')
    ax2.set_title('Distribution of Final Values', fontsize=12, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3, axis='y')

    # Plot 3: Max drawdown distribution
    ax3 = axes[1, 0]
    max_drawdowns = results['max_drawdowns']
    ax3.hist(max_drawdowns * 100, bins=50, alpha=0.7, edgecolor='black', color='red')
    ax3.axvline(x=analysis['mean_max_dd'] * 100, color='darkred', linestyle='--',
               linewidth=2, label=f"Mean: {analysis['mean_max_dd']:.1%}")
    ax3.axvline(x=analysis['max_dd_95th_percentile'] * 100, color='orange', linestyle='--',
               linewidth=2, label=f"95th: {analysis['max_dd_95th_percentile']:.1%}")
    ax3.set_xlabel('Maximum Drawdown (%)')
    ax3.set_ylabel('Frequency')
    ax3.set_title('Distribution of Maximum Drawdowns', fontsize=12, fontweight='bold')
    ax3.legend()
    ax3.grid(True, alpha=0.3, axis='y')

    # Plot 4: Return distribution
    ax4 = axes[1, 1]
    returns = (np.array(final_values) - results['initial_capital']) / results['initial_capital']
    ax4.hist(returns * 100, bins=50, alpha=0.7, edgecolor='black', color='green')
    ax4.axvline(x=0, color='red', linestyle='-', linewidth=2)
    ax4.axvline(x=analysis['mean_return'] * 100, color='darkgreen', linestyle='--',
               linewidth=2, label=f"Mean: {analysis['mean_return']:.1%}")
    ax4.set_xlabel('Return (%)')
    ax4.set_ylabel('Frequency')
    ax4.set_title('Distribution of Returns', fontsize=12, fontweight='bold')
    ax4.legend()
    ax4.grid(True, alpha=0.3, axis='y')

    plt.tight_layout()
    plt.show()


def print_monte_carlo_analysis(analysis: Dict):
    """Print Monte Carlo analysis results."""
    print("\n" + "=" * 70)
    print("MONTE CARLO SIMULATION ANALYSIS")
    print("=" * 70)

    print("\nRETURN STATISTICS")
    print("-" * 70)
    print(f"Mean Return:           {analysis['mean_return']:+.2%}")
    print(f"Median Return:         {analysis['median_return']:+.2%}")
    print(f"Std Dev:               {analysis['std_return']:.2%}")
    print(f"5th Percentile:        {analysis['return_5th_percentile']:+.2%}")
    print(f"95th Percentile:       {analysis['return_95th_percentile']:+.2%}")

    print("\nFINAL VALUE STATISTICS")
    print("-" * 70)
    print(f"Mean Final Value:      ${analysis['mean_final_value']:,.2f}")
    print(f"Median Final Value:    ${analysis['median_final_value']:,.2f}")
    print(f"5th Percentile:        ${analysis['final_value_5th']:,.2f}")
    print(f"95th Percentile:       ${analysis['final_value_95th']:,.2f}")

    print("\nDRAWDOWN STATISTICS")
    print("-" * 70)
    print(f"Mean Max Drawdown:     {analysis['mean_max_dd']:.2%}")
    print(f"Median Max Drawdown:   {analysis['median_max_dd']:.2%}")
    print(f"95th Percentile DD:    {analysis['max_dd_95th_percentile']:.2%}")

    print("\nSHARPE RATIO STATISTICS")
    print("-" * 70)
    print(f"Mean Sharpe Ratio:     {analysis['mean_sharpe']:.2f}")
    print(f"Median Sharpe Ratio:   {analysis['median_sharpe']:.2f}")

    print("\nPROBABILITY METRICS")
    print("-" * 70)
    print(f"Probability of Profit:     {analysis['prob_profit']:.1%}")
    print(f"Probability of Loss:       {analysis['prob_loss']:.1%}")
    print(f"Prob of DD > 20%:          {analysis['prob_dd_over_20']:.1%}")
    print(f"Prob of DD > 30%:          {analysis['prob_dd_over_30']:.1%}")

    print("\n" + "=" * 70)
```

### 2. Return Resampling

Resample returns instead of trades:

```python
def monte_carlo_return_resampling(returns: pd.Series,
                                 initial_capital: float = 100000,
                                 n_simulations: int = 1000,
                                 n_periods: int = None) -> Dict:
    """
    Monte Carlo simulation by resampling returns.

    Parameters:
    -----------
    returns : pd.Series
        Historical returns
    initial_capital : float
        Starting capital
    n_simulations : int
        Number of simulations
    n_periods : int, optional
        Number of periods to simulate (default: length of returns)

    Returns:
    --------
    Dict : Simulation results
    """
    if n_periods is None:
        n_periods = len(returns)

    print(f"Running {n_simulations} return resampling simulations...")

    equity_curves = []
    final_values = []
    max_drawdowns = []

    for sim in range(n_simulations):
        # Randomly resample returns
        resampled_returns = np.random.choice(returns.dropna(), size=n_periods, replace=True)

        # Calculate equity curve
        equity = initial_capital * (1 + pd.Series(resampled_returns)).cumprod()
        equity = pd.concat([pd.Series([initial_capital]), equity]).reset_index(drop=True)

        equity_curves.append(equity.values)
        final_values.append(equity.iloc[-1])

        # Calculate max drawdown
        running_max = equity.expanding().max()
        drawdowns = (equity - running_max) / running_max
        max_dd = abs(drawdowns.min())
        max_drawdowns.append(max_dd)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'initial_capital': initial_capital
    }
```

### 3. Parametric Simulation

Generate returns from statistical distribution:

```python
def monte_carlo_parametric(mean_return: float,
                          std_return: float,
                          initial_capital: float = 100000,
                          n_periods: int = 252,
                          n_simulations: int = 1000) -> Dict:
    """
    Monte Carlo simulation using parametric approach.

    Parameters:
    -----------
    mean_return : float
        Mean daily return
    std_return : float
        Standard deviation of daily returns
    initial_capital : float
        Starting capital
    n_periods : int
        Number of periods to simulate
    n_simulations : int
        Number of simulations

    Returns:
    --------
    Dict : Simulation results
    """
    print(f"Running {n_simulations} parametric simulations...")

    equity_curves = []
    final_values = []
    max_drawdowns = []

    for sim in range(n_simulations):
        # Generate random returns from normal distribution
        returns = np.random.normal(mean_return, std_return, n_periods)

        # Calculate equity curve
        equity = initial_capital * (1 + pd.Series(returns)).cumprod()
        equity = pd.concat([pd.Series([initial_capital]), equity]).reset_index(drop=True)

        equity_curves.append(equity.values)
        final_values.append(equity.iloc[-1])

        # Calculate max drawdown
        running_max = equity.expanding().max()
        drawdowns = (equity - running_max) / running_max
        max_dd = abs(drawdowns.min())
        max_drawdowns.append(max_dd)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'initial_capital': initial_capital
    }
```

## Advanced Applications

### 1. Position Sizing Optimization

Use Monte Carlo to find optimal position size:

```python
def optimize_position_size_monte_carlo(trades: List[float],
                                      initial_capital: float = 100000,
                                      position_sizes: List[float] = None,
                                      n_simulations: int = 1000) -> Dict:
    """
    Optimize position size using Monte Carlo.

    Parameters:
    -----------
    trades : List[float]
        List of trade returns (as fractions)
    initial_capital : float
        Starting capital
    position_sizes : List[float]
        Position sizes to test (as fractions of capital)
    n_simulations : int
        Number of simulations per position size

    Returns:
    --------
    Dict : Optimization results
    """
    if position_sizes is None:
        position_sizes = [0.01, 0.02, 0.05, 0.10, 0.15, 0.20]

    results = {}

    for pos_size in position_sizes:
        print(f"Testing position size: {pos_size:.1%}")

        # Scale trades by position size
        scaled_trades = [t * pos_size * initial_capital for t in trades]

        # Run Monte Carlo
        mc_results = monte_carlo_trade_resampling(
            scaled_trades, initial_capital, n_simulations
        )

        analysis = analyze_monte_carlo_results(mc_results)

        results[pos_size] = {
            'mean_return': analysis['mean_return'],
            'std_return': analysis['std_return'],
            'mean_max_dd': analysis['mean_max_dd'],
            'sharpe': analysis['mean_sharpe'],
            'prob_profit': analysis['prob_profit']
        }

    return results


def plot_position_size_optimization(results: Dict):
    """Plot position size optimization results."""
    position_sizes = list(results.keys())
    mean_returns = [results[ps]['mean_return'] for ps in position_sizes]
    std_returns = [results[ps]['std_return'] for ps in position_sizes]
    max_dds = [results[ps]['mean_max_dd'] for ps in position_sizes]
    sharpes = [results[ps]['sharpe'] for ps in position_sizes]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Mean return vs position size
    ax1 = axes[0, 0]
    ax1.plot([ps * 100 for ps in position_sizes], [r * 100 for r in mean_returns],
            'o-', linewidth=2, markersize=8)
    ax1.set_xlabel('Position Size (%)')
    ax1.set_ylabel('Mean Return (%)')
    ax1.set_title('Mean Return vs Position Size')
    ax1.grid(True, alpha=0.3)

    # Risk (std) vs position size
    ax2 = axes[0, 1]
    ax2.plot([ps * 100 for ps in position_sizes], [s * 100 for s in std_returns],
            'o-', linewidth=2, markersize=8, color='orange')
    ax2.set_xlabel('Position Size (%)')
    ax2.set_ylabel('Std Dev (%)')
    ax2.set_title('Risk vs Position Size')
    ax2.grid(True, alpha=0.3)

    # Max drawdown vs position size
    ax3 = axes[1, 0]
    ax3.plot([ps * 100 for ps in position_sizes], [dd * 100 for dd in max_dds],
            'o-', linewidth=2, markersize=8, color='red')
    ax3.set_xlabel('Position Size (%)')
    ax3.set_ylabel('Mean Max Drawdown (%)')
    ax3.set_title('Drawdown vs Position Size')
    ax3.grid(True, alpha=0.3)

    # Sharpe ratio vs position size
    ax4 = axes[1, 1]
    ax4.plot([ps * 100 for ps in position_sizes], sharpes,
            'o-', linewidth=2, markersize=8, color='green')
    ax4.set_xlabel('Position Size (%)')
    ax4.set_ylabel('Sharpe Ratio')
    ax4.set_title('Sharpe Ratio vs Position Size')
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
```

### 2. Confidence Intervals

Calculate confidence intervals for performance metrics:

```python
def calculate_confidence_intervals(results: Dict,
                                  confidence_level: float = 0.95) -> Dict:
    """
    Calculate confidence intervals from Monte Carlo results.

    Parameters:
    -----------
    results : Dict
        Monte Carlo results
    confidence_level : float
        Confidence level (e.g., 0.95 for 95%)

    Returns:
    --------
    Dict : Confidence intervals
    """
    alpha = 1 - confidence_level
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100

    final_values = np.array(results['final_values'])
    initial_capital = results['initial_capital']
    returns = (final_values - initial_capital) / initial_capital

    max_drawdowns = np.array(results['max_drawdowns'])

    ci = {
        'confidence_level': confidence_level,
        'return_ci': (
            np.percentile(returns, lower_percentile),
            np.percentile(returns, upper_percentile)
        ),
        'final_value_ci': (
            np.percentile(final_values, lower_percentile),
            np.percentile(final_values, upper_percentile)
        ),
        'max_dd_ci': (
            np.percentile(max_drawdowns, lower_percentile),
            np.percentile(max_drawdowns, upper_percentile)
        )
    }

    return ci


def print_confidence_intervals(ci: Dict):
    """Print confidence intervals."""
    print(f"\n{ci['confidence_level']:.0%} Confidence Intervals")
    print("-" * 70)
    print(f"Return:       {ci['return_ci'][0]:+.2%} to {ci['return_ci'][1]:+.2%}")
    print(f"Final Value:  ${ci['final_value_ci'][0]:,.2f} to ${ci['final_value_ci'][1]:,.2f}")
    print(f"Max Drawdown: {ci['max_dd_ci'][0]:.2%} to {ci['max_dd_ci'][1]:.2%}")
```

## Example Usage

```python
def example_monte_carlo():
    """
    Comprehensive Monte Carlo simulation example.
    """
    import yfinance as yf

    print("Monte Carlo Simulation Example")
    print("=" * 70)

    # Download data and run simple backtest
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Calculate simple MA crossover returns
    data['MA_Short'] = data['Close'].rolling(20).mean()
    data['MA_Long'] = data['Close'].rolling(50).mean()
    data['Signal'] = (data['MA_Short'] > data['MA_Long']).astype(int)

    returns = data['Close'].pct_change()
    strategy_returns = returns * data['Signal'].shift(1)
    strategy_returns = strategy_returns.dropna()

    # Simulate trades (group consecutive signals)
    trades = []
    current_trade = 0

    for ret in strategy_returns:
        if ret != 0:
            current_trade += ret
        else:
            if current_trade != 0:
                trades.append(current_trade * 100000)  # Scale to dollar amount
                current_trade = 0

    if current_trade != 0:
        trades.append(current_trade * 100000)

    print(f"Generated {len(trades)} trades from backtest")

    # Run Monte Carlo simulation
    mc_results = monte_carlo_trade_resampling(
        trades=trades,
        initial_capital=100000,
        n_simulations=1000
    )

    # Analyze results
    analysis = analyze_monte_carlo_results(mc_results)
    print_monte_carlo_analysis(analysis)

    # Calculate confidence intervals
    ci = calculate_confidence_intervals(mc_results, confidence_level=0.95)
    print_confidence_intervals(ci)

    # Plot results
    plot_monte_carlo_results(mc_results, analysis)


if __name__ == "__main__":
    example_monte_carlo()
```

## Best Practices

1. **Use Sufficient Simulations**: At least 1,000 simulations, preferably 10,000
2. **Choose Appropriate Method**: Trade resampling for discrete strategies, return resampling for continuous
3. **Consider Assumptions**: Monte Carlo assumes past patterns continue
4. **Combine with Other Methods**: Use alongside walk-forward analysis
5. **Focus on Risk Metrics**: Pay attention to drawdown probabilities
6. **Set Realistic Expectations**: Use confidence intervals, not just means
7. **Test Sensitivity**: Vary assumptions and see how results change

## Exercises

### Exercise 1: Basic Monte Carlo

Run Monte Carlo simulation on a list of 50 trades. Calculate:
- 95% confidence interval for final value
- Probability of 20% drawdown
- Mean and median returns

### Exercise 2: Method Comparison

Compare trade resampling vs return resampling vs parametric simulation on the same strategy. How do results differ?

### Exercise 3: Position Sizing

Use Monte Carlo to find optimal position size for a strategy. Test sizes from 1% to 20% of capital.

### Exercise 4: Risk Assessment

Calculate the probability of:
- Losing money over 1 year
- Experiencing a 30% drawdown
- Achieving 20% return

## Summary

Monte Carlo simulation provides probabilistic analysis of trading strategies:

- **Trade Resampling**: Randomly reorder historical trades
- **Return Resampling**: Randomly resample returns
- **Parametric**: Generate returns from statistical distribution

Key benefits:
- Understand range of possible outcomes
- Calculate confidence intervals
- Assess probability of specific scenarios
- Optimize position sizing
- Stress-test strategies

Use Monte Carlo to:
- Set realistic expectations
- Understand worst-case scenarios
- Make informed risk management decisions
- Communicate uncertainty to stakeholders

Remember: Monte Carlo shows what could happen based on historical patterns, not what will happen. Markets can behave differently than the past.

## Next Steps

In the final project for this module, you'll integrate all backtesting concepts—proper data handling, performance metrics, optimization, walk-forward analysis, and Monte Carlo simulation—into a comprehensive backtesting framework.