# Lesson 6.5: Walk-Forward Analysis

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand the concept and benefits of walk-forward analysis
- Implement walk-forward optimization and testing
- Interpret walk-forward analysis results
- Identify robust vs overfit strategies using walk-forward testing
- Apply walk-forward analysis to real trading strategies

## Introduction

Walk-forward analysis (WFA) is one of the most powerful techniques for validating trading strategies and avoiding overfitting. Unlike simple train/test splits, WFA simulates how a strategy would actually be traded—periodically reoptimizing parameters and testing on unseen future data.

This approach provides a realistic estimate of how a strategy will perform in live trading, where you continuously adapt to changing market conditions while trading on new, unseen data.

## What is Walk-Forward Analysis?

Walk-forward analysis divides historical data into multiple periods and follows this process:

1. **Optimize** on in-sample (IS) period
2. **Test** on out-of-sample (OOS) period
3. **Roll forward** to next period
4. **Repeat** until all data is covered

```
Data: |----IS----|--OOS--|----IS----|--OOS--|----IS----|--OOS--|
      Optimize 1  Test 1  Optimize 2  Test 2  Optimize 3  Test 3
```

### Key Concepts

- **In-Sample Period**: Training data for optimization
- **Out-of-Sample Period**: Testing data (never seen during optimization)
- **Anchored vs Rolling**: Whether IS window grows or stays fixed
- **Reoptimization Frequency**: How often to reoptimize parameters

## Python Implementation

Let's build a comprehensive walk-forward analysis framework:

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Callable
from dataclasses import dataclass
import matplotlib.pyplot as plt

@dataclass
class WFAResult:
    """Results from a single walk-forward period."""
    period: int
    is_start: str
    is_end: str
    oos_start: str
    oos_end: str
    best_params: Dict
    is_performance: float
    oos_performance: float
    degradation: float


class WalkForwardAnalyzer:
    """
    Walk-forward analysis framework.
    """

    def __init__(self,
                 data: pd.DataFrame,
                 strategy_func: Callable,
                 optimizer_func: Callable,
                 param_grid: Dict,
                 is_period_days: int = 252,
                 oos_period_days: int = 63,
                 anchored: bool = False,
                 metric: str = 'sharpe_ratio'):
        """
        Initialize walk-forward analyzer.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical price data
        strategy_func : Callable
            Strategy function to test
        optimizer_func : Callable
            Optimization function
        param_grid : Dict
            Parameter grid for optimization
        is_period_days : int
            In-sample period length in days
        oos_period_days : int
            Out-of-sample period length in days
        anchored : bool
            If True, IS window grows; if False, it rolls
        metric : str
            Performance metric to optimize
        """
        self.data = data
        self.strategy_func = strategy_func
        self.optimizer_func = optimizer_func
        self.param_grid = param_grid
        self.is_period_days = is_period_days
        self.oos_period_days = oos_period_days
        self.anchored = anchored
        self.metric = metric

        self.results: List[WFAResult] = []

    def run(self) -> List[WFAResult]:
        """
        Run walk-forward analysis.

        Returns:
        --------
        List[WFAResult] : Results for each period
        """
        print("Starting Walk-Forward Analysis")
        print("=" * 70)
        print(f"IS Period: {self.is_period_days} days")
        print(f"OOS Period: {self.oos_period_days} days")
        print(f"Mode: {'Anchored' if self.anchored else 'Rolling'}")
        print("=" * 70)

        # Calculate number of periods
        total_days = len(self.data)
        start_idx = self.is_period_days

        period = 1

        while start_idx + self.oos_period_days <= total_days:
            print(f"\nPeriod {period}")
            print("-" * 70)

            # Define IS period
            if self.anchored:
                is_start_idx = 0
            else:
                is_start_idx = start_idx - self.is_period_days

            is_end_idx = start_idx
            is_data = self.data.iloc[is_start_idx:is_end_idx]

            # Define OOS period
            oos_start_idx = start_idx
            oos_end_idx = min(start_idx + self.oos_period_days, total_days)
            oos_data = self.data.iloc[oos_start_idx:oos_end_idx]

            print(f"IS:  {is_data.index[0].date()} to {is_data.index[-1].date()} ({len(is_data)} days)")
            print(f"OOS: {oos_data.index[0].date()} to {oos_data.index[-1].date()} ({len(oos_data)} days)")

            # Optimize on IS data
            print("Optimizing...")
            opt_result = self.optimizer_func(
                is_data,
                self.strategy_func,
                self.param_grid,
                self.metric
            )

            best_params = opt_result['best_params']
            is_performance = opt_result['best_score']

            print(f"Best Parameters: {best_params}")
            print(f"IS Performance: {is_performance:.3f}")

            # Test on OOS data
            print("Testing on OOS data...")
            oos_result = self.strategy_func(oos_data, **best_params)
            oos_performance = oos_result.get(self.metric, 0)

            degradation = is_performance - oos_performance

            print(f"OOS Performance: {oos_performance:.3f}")
            print(f"Degradation: {degradation:.3f} ({degradation/is_performance*100:.1f}%)")

            # Store results
            wfa_result = WFAResult(
                period=period,
                is_start=str(is_data.index[0].date()),
                is_end=str(is_data.index[-1].date()),
                oos_start=str(oos_data.index[0].date()),
                oos_end=str(oos_data.index[-1].date()),
                best_params=best_params,
                is_performance=is_performance,
                oos_performance=oos_performance,
                degradation=degradation
            )

            self.results.append(wfa_result)

            # Move to next period
            start_idx += self.oos_period_days
            period += 1

        print("\n" + "=" * 70)
        print("Walk-Forward Analysis Complete")
        print("=" * 70)

        return self.results

    def calculate_summary_statistics(self) -> Dict:
        """
        Calculate summary statistics from WFA results.

        Returns:
        --------
        Dict : Summary statistics
        """
        if not self.results:
            return {}

        is_scores = [r.is_performance for r in self.results]
        oos_scores = [r.oos_performance for r in self.results]
        degradations = [r.degradation for r in self.results]

        # Calculate efficiency (OOS / IS)
        efficiencies = [oos / is_perf if is_perf != 0 else 0
                       for oos, is_perf in zip(oos_scores, is_scores)]

        summary = {
            'num_periods': len(self.results),
            'avg_is_performance': np.mean(is_scores),
            'avg_oos_performance': np.mean(oos_scores),
            'avg_degradation': np.mean(degradations),
            'avg_efficiency': np.mean(efficiencies),
            'std_oos_performance': np.std(oos_scores),
            'min_oos_performance': np.min(oos_scores),
            'max_oos_performance': np.max(oos_scores),
            'positive_oos_periods': sum(1 for s in oos_scores if s > 0),
            'negative_oos_periods': sum(1 for s in oos_scores if s <= 0)
        }

        return summary

    def print_summary(self):
        """Print summary of WFA results."""
        summary = self.calculate_summary_statistics()

        print("\n" + "=" * 70)
        print("WALK-FORWARD ANALYSIS SUMMARY")
        print("=" * 70)

        print(f"\nNumber of Periods: {summary['num_periods']}")
        print(f"\nAverage IS Performance:  {summary['avg_is_performance']:.3f}")
        print(f"Average OOS Performance: {summary['avg_oos_performance']:.3f}")
        print(f"Average Degradation:     {summary['avg_degradation']:.3f}")
        print(f"Average Efficiency:      {summary['avg_efficiency']:.2%}")

        print(f"\nOOS Performance Statistics:")
        print(f"  Std Dev:  {summary['std_oos_performance']:.3f}")
        print(f"  Min:      {summary['min_oos_performance']:.3f}")
        print(f"  Max:      {summary['max_oos_performance']:.3f}")

        print(f"\nOOS Period Results:")
        print(f"  Positive: {summary['positive_oos_periods']}")
        print(f"  Negative: {summary['negative_oos_periods']}")
        print(f"  Win Rate: {summary['positive_oos_periods']/summary['num_periods']:.1%}")

        print("\n" + "=" * 70)

        # Interpretation
        print("\nINTERPRETATION:")
        if summary['avg_efficiency'] > 0.7:
            print("✓ Good: Strategy shows robust performance (efficiency > 70%)")
        elif summary['avg_efficiency'] > 0.5:
            print("⚠ Moderate: Some performance degradation (efficiency 50-70%)")
        else:
            print("✗ Poor: Significant overfitting detected (efficiency < 50%)")

        if summary['positive_oos_periods'] / summary['num_periods'] > 0.7:
            print("✓ Good: Consistent positive OOS performance")
        else:
            print("⚠ Warning: Inconsistent OOS performance")

    def plot_results(self):
        """Plot walk-forward analysis results."""
        if not self.results:
            print("No results to plot")
            return

        fig, axes = plt.subplots(3, 1, figsize=(14, 10))

        periods = [r.period for r in self.results]
        is_scores = [r.is_performance for r in self.results]
        oos_scores = [r.oos_performance for r in self.results]
        degradations = [r.degradation for r in self.results]

        # Plot 1: IS vs OOS Performance
        ax1 = axes[0]
        ax1.plot(periods, is_scores, 'o-', label='In-Sample', linewidth=2, markersize=8)
        ax1.plot(periods, oos_scores, 's-', label='Out-of-Sample', linewidth=2, markersize=8)
        ax1.axhline(y=0, color='red', linestyle='--', alpha=0.5)
        ax1.set_ylabel('Performance (Sharpe Ratio)')
        ax1.set_title('Walk-Forward Analysis: IS vs OOS Performance', fontsize=14, fontweight='bold')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Plot 2: Degradation
        ax2 = axes[1]
        colors = ['red' if d > 0 else 'green' for d in degradations]
        ax2.bar(periods, degradations, color=colors, alpha=0.6)
        ax2.axhline(y=0, color='black', linestyle='-', linewidth=1)
        ax2.set_ylabel('Degradation')
        ax2.set_title('Performance Degradation (IS - OOS)', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3, axis='y')

        # Plot 3: Efficiency
        ax3 = axes[2]
        efficiencies = [oos / is_perf * 100 if is_perf != 0 else 0
                       for oos, is_perf in zip(oos_scores, is_scores)]
        ax3.bar(periods, efficiencies, alpha=0.6, color='steelblue')
        ax3.axhline(y=100, color='green', linestyle='--', label='100% Efficiency')
        ax3.axhline(y=70, color='orange', linestyle='--', label='70% Threshold')
        ax3.set_xlabel('Period')
        ax3.set_ylabel('Efficiency (%)')
        ax3.set_title('OOS Efficiency (OOS / IS * 100%)', fontsize=14, fontweight='bold')
        ax3.legend()
        ax3.grid(True, alpha=0.3, axis='y')

        plt.tight_layout()
        plt.show()

    def plot_parameter_evolution(self, param_name: str):
        """
        Plot how a specific parameter evolves over time.

        Parameters:
        -----------
        param_name : str
            Name of parameter to plot
        """
        if not self.results:
            print("No results to plot")
            return

        periods = [r.period for r in self.results]
        param_values = [r.best_params.get(param_name, np.nan) for r in self.results]

        plt.figure(figsize=(12, 6))
        plt.plot(periods, param_values, 'o-', linewidth=2, markersize=10)
        plt.xlabel('Period')
        plt.ylabel(f'{param_name} Value')
        plt.title(f'Parameter Evolution: {param_name}', fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)
        plt.show()


# Example usage
def example_walk_forward():
    """
    Demonstrate walk-forward analysis.
    """
    import yfinance as yf

    print("Walk-Forward Analysis Example")
    print("=" * 70)

    # Download data
    data = yf.download('AAPL', start='2018-01-01', end='2023-12-31', progress=False)

    # Define strategy function
    def ma_crossover_strategy(data, ma_short, ma_long):
        """Simple MA crossover strategy."""
        data = data.copy()
        data['MA_Short'] = data['Close'].rolling(int(ma_short)).mean()
        data['MA_Long'] = data['Close'].rolling(int(ma_long)).mean()

        # Generate signals
        signals = data['MA_Short'] > data['MA_Long']

        # Calculate returns
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        # Calculate Sharpe ratio
        if strategy_returns.std() == 0:
            sharpe = 0
        else:
            sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe, 'returns': strategy_returns}

    # Define simple grid search optimizer
    def simple_optimizer(data, strategy_func, param_grid, metric):
        """Simple grid search optimizer."""
        from itertools import product

        param_names = list(param_grid.keys())
        param_values = list(param_grid.values())
        combinations = list(product(*param_values))

        best_score = -np.inf
        best_params = None

        for combo in combinations:
            params = dict(zip(param_names, combo))

            # Skip invalid combinations
            if params['ma_short'] >= params['ma_long']:
                continue

            try:
                result = strategy_func(data, **params)
                score = result.get(metric, -np.inf)

                if score > best_score:
                    best_score = score
                    best_params = params
            except:
                continue

        return {'best_params': best_params, 'best_score': best_score}

    # Define parameter grid
    param_grid = {
        'ma_short': [10, 20, 30, 40],
        'ma_long': [50, 100, 150, 200]
    }

    # Run walk-forward analysis
    wfa = WalkForwardAnalyzer(
        data=data,
        strategy_func=ma_crossover_strategy,
        optimizer_func=simple_optimizer,
        param_grid=param_grid,
        is_period_days=504,  # 2 years
        oos_period_days=126,  # 6 months
        anchored=False,
        metric='sharpe_ratio'
    )

    results = wfa.run()

    # Print summary
    wfa.print_summary()

    # Plot results
    wfa.plot_results()

    # Plot parameter evolution
    wfa.plot_parameter_evolution('ma_short')
    wfa.plot_parameter_evolution('ma_long')


if __name__ == "__main__":
    example_walk_forward()
```

## Interpreting WFA Results

### Key Metrics

1. **Average OOS Performance**: Expected live trading performance
2. **Efficiency Ratio**: OOS / IS performance (should be > 70%)
3. **OOS Consistency**: Percentage of positive OOS periods
4. **Degradation**: How much performance drops from IS to OOS

### Red Flags

- **High Degradation**: IS performance much better than OOS (overfitting)
- **Low Efficiency**: OOS < 50% of IS performance
- **Inconsistent OOS**: Many negative OOS periods
- **Unstable Parameters**: Parameters change dramatically between periods

### Good Signs

- **Consistent OOS**: Most periods show positive performance
- **High Efficiency**: OOS > 70% of IS performance
- **Stable Parameters**: Parameters don't vary wildly
- **Robust Across Regimes**: Works in different market conditions

## Anchored vs Rolling Windows

### Anchored Walk-Forward

IS window grows over time:

```
Period 1: |----IS----|--OOS--|
Period 2: |--------IS--------|--OOS--|
Period 3: |------------IS------------|--OOS--|
```

**Advantages:**
- More data for optimization
- Captures long-term patterns

**Disadvantages:**
- Slower to adapt to regime changes
- Old data may not be relevant

### Rolling Walk-Forward

IS window stays fixed:

```
Period 1: |----IS----|--OOS--|
Period 2:       |----IS----|--OOS--|
Period 3:             |----IS----|--OOS--|
```

**Advantages:**
- Adapts to recent market conditions
- Discards old, irrelevant data

**Disadvantages:**
- Less data for optimization
- May miss long-term patterns

## Best Practices

1. **Choose Appropriate Periods**:
   - IS: 1-3 years of data
   - OOS: 3-6 months
   - Reoptimize quarterly or semi-annually

2. **Use Realistic Costs**:
   - Include commissions and slippage
   - Account for reoptimization costs

3. **Test Multiple Configurations**:
   - Try different IS/OOS ratios
   - Test both anchored and rolling
   - Compare results

4. **Monitor Parameter Stability**:
   - Parameters shouldn't change drastically
   - Stable parameters indicate robustness

5. **Require Minimum Performance**:
   - Set minimum OOS performance threshold
   - Reject strategies that fail consistently

6. **Consider Transaction Costs**:
   - Frequent reoptimization may change parameters
   - Parameter changes may require rebalancing

## Exercises

### Exercise 1: Basic WFA

Implement walk-forward analysis for a simple RSI strategy:
- IS period: 1 year
- OOS period: 3 months
- Test on SPY 2018-2023

Calculate efficiency ratio and OOS consistency.

### Exercise 2: Anchored vs Rolling

Compare anchored vs rolling walk-forward on the same strategy. Which performs better? Why?

### Exercise 3: Parameter Stability

Analyze how parameters evolve over time in your WFA. Are they stable or erratic? What does this tell you about the strategy?

### Exercise 4: Regime Analysis

Perform WFA and identify which market regimes (bull/bear/sideways) produce best/worst OOS results.

## Summary

Walk-forward analysis is the gold standard for strategy validation:

- **Simulates Real Trading**: Periodic reoptimization on new data
- **Detects Overfitting**: Poor OOS performance reveals overfit strategies
- **Provides Realistic Expectations**: OOS results estimate live performance
- **Tests Adaptability**: Shows if strategy adapts to changing markets

Key metrics to evaluate:
- Average OOS performance
- Efficiency ratio (OOS/IS)
- OOS consistency
- Parameter stability

A good strategy should show:
- Efficiency > 70%
- Consistent positive OOS periods
- Stable parameters
- Reasonable degradation

## Next Steps

In the next lesson, we'll explore Monte Carlo simulation, a powerful technique for understanding the range of possible outcomes and assessing strategy robustness under uncertainty.