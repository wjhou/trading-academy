# Lesson 6.2: Avoiding Common Pitfalls

## Learning Objectives

By the end of this lesson, you will be able to:
- Identify and avoid look-ahead bias in backtesting
- Recognize and mitigate survivorship bias
- Understand overfitting and how to prevent it
- Implement proper data handling to avoid bias
- Apply techniques to ensure realistic backtest results

## Introduction

Backtesting pitfalls can lead to dramatically inflated performance expectations and devastating losses in live trading. Many traders develop strategies that look excellent in backtests but fail miserably with real money. Understanding and avoiding these pitfalls is crucial for developing robust, profitable strategies.

The most dangerous aspect of backtesting pitfalls is that they often produce results that look too good to be true—and they are. This lesson will help you identify and avoid the most common mistakes.

## Look-Ahead Bias

### What is Look-Ahead Bias?

Look-ahead bias occurs when your backtest uses information that wouldn't have been available at the time of the trade. This is one of the most common and dangerous pitfalls.

### Common Examples

1. **Using Future Prices**
```python
# WRONG: Using next bar's close for entry
if data['Close'].iloc[i] > data['MA'].iloc[i]:
    entry_price = data['Close'].iloc[i+1]  # Future data!
```

2. **Indicator Calculation Errors**
```python
# WRONG: Calculating MA on entire dataset
data['MA'] = data['Close'].rolling(20).mean()

# RIGHT: Calculate incrementally
for i in range(20, len(data)):
    data.loc[i, 'MA'] = data['Close'].iloc[i-20:i].mean()
```

3. **End-of-Day Data for Intraday Decisions**
```python
# WRONG: Using day's high/low before they occur
if current_price < data['Low'].iloc[i]:  # Don't know low yet!
    buy()
```

### How to Avoid Look-Ahead Bias

```python
import pandas as pd
import numpy as np
from typing import Dict

class BiasFreeBacktest:
    """
    Backtest framework that prevents look-ahead bias.
    """

    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        self.current_index = 0

    def get_historical_data(self, lookback: int = None) -> pd.DataFrame:
        """
        Get only historical data up to current point.

        Parameters:
        -----------
        lookback : int, optional
            Number of bars to look back

        Returns:
        --------
        pd.DataFrame : Historical data only
        """
        if lookback is None:
            return self.data.iloc[:self.current_index + 1]
        else:
            start_idx = max(0, self.current_index - lookback + 1)
            return self.data.iloc[start_idx:self.current_index + 1]

    def calculate_indicator(self, indicator_func, *args, **kwargs):
        """
        Calculate indicator using only historical data.

        Parameters:
        -----------
        indicator_func : callable
            Function to calculate indicator
        """
        historical_data = self.get_historical_data()
        return indicator_func(historical_data, *args, **kwargs)

    def advance(self):
        """Move to next bar."""
        self.current_index += 1

    def is_complete(self) -> bool:
        """Check if backtest is complete."""
        return self.current_index >= len(self.data) - 1


# Example: Proper indicator calculation
def calculate_sma_properly(data: pd.DataFrame, period: int) -> float:
    """
    Calculate SMA using only available data.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical data
    period : int
        SMA period

    Returns:
    --------
    float : SMA value
    """
    if len(data) < period:
        return np.nan

    return data['Close'].iloc[-period:].mean()


# Example usage
def example_bias_free():
    """Demonstrate bias-free backtesting."""
    import yfinance as yf

    # Download data
    data = yf.download('AAPL', start='2023-01-01', end='2023-12-31', progress=False)

    # Initialize bias-free backtest
    backtest = BiasFreeBacktest(data)

    signals = []

    # Process each bar
    while not backtest.is_complete():
        # Calculate indicator using only historical data
        sma_20 = backtest.calculate_indicator(calculate_sma_properly, 20)
        sma_50 = backtest.calculate_indicator(calculate_sma_properly, 50)

        # Generate signal
        if not np.isnan(sma_20) and not np.isnan(sma_50):
            if sma_20 > sma_50:
                signals.append('BUY')
            else:
                signals.append('SELL')
        else:
            signals.append('HOLD')

        backtest.advance()

    print(f"Generated {len(signals)} signals without look-ahead bias")
```

## Survivorship Bias

### What is Survivorship Bias?

Survivorship bias occurs when backtests only include stocks that survived to the present, excluding delisted, bankrupt, or merged companies. This dramatically overestimates returns.

### Impact of Survivorship Bias

Studies show survivorship bias can inflate returns by 1-3% annually:
- Excludes worst performers (bankruptcies)
- Overrepresents successful companies
- Misses tail risk

### Example

```python
# WRONG: Using current S&P 500 constituents
sp500_current = ['AAPL', 'MSFT', 'GOOGL', ...]  # Current members
# Backtest on these from 2000-2024

# RIGHT: Use historical constituents
# Include companies that were in S&P 500 at each point in time
# Include delisted companies
```

### How to Avoid Survivorship Bias

1. **Use Survivorship-Bias-Free Datasets**
```python
# Use datasets that include delisted stocks
# Examples: Norgate Data, CSI Data, Sharadar
```

2. **Point-in-Time Constituents**
```python
def get_historical_constituents(index: str, date: str) -> list:
    """
    Get index constituents as of specific date.

    Parameters:
    -----------
    index : str
        Index name (e.g., 'SP500')
    date : str
        Date in YYYY-MM-DD format

    Returns:
    --------
    list : Symbols that were in index on that date
    """
    # Query database for historical constituents
    # Include delisted stocks
    pass
```

3. **Acknowledge Limitations**
```python
# If using survivorship-biased data, document it
print("WARNING: This backtest uses survivorship-biased data")
print("Expected performance inflation: 1-3% annually")
print("Adjust expectations accordingly")
```

## Overfitting

### What is Overfitting?

Overfitting occurs when a strategy is optimized too much on historical data, capturing noise rather than genuine patterns. The strategy performs well in-sample but fails out-of-sample.

### Signs of Overfitting

1. **Too Many Parameters**: More than 3-5 optimizable parameters
2. **Perfect Backtest**: Win rate > 80%, no losing periods
3. **Complex Rules**: Dozens of conditions and exceptions
4. **Poor OOS Performance**: Dramatic drop in out-of-sample results
5. **Parameter Sensitivity**: Small changes cause large performance swings

### Example of Overfitting

```python
# OVERFITTED STRATEGY (Don't do this!)
def overfitted_strategy(data):
    """
    Example of an overfitted strategy with too many parameters.
    """
    # 15 parameters optimized on historical data
    rsi_buy = 31.7  # Why 31.7 and not 30?
    rsi_sell = 68.3
    ma_short = 17   # Why 17 and not 20?
    ma_long = 43
    volume_threshold = 1.23
    atr_multiplier = 2.17
    # ... and 9 more parameters

    # Complex conditions
    if (data['RSI'] < rsi_buy and
        data['MA_Short'] > data['MA_Long'] and
        data['Volume'] > data['Volume_MA'] * volume_threshold and
        data['ATR'] > data['ATR_MA'] * atr_multiplier and
        data['Close'] > data['Open'] and
        data['High'] < data['High'].shift(1) * 1.02):
        # ... 10 more conditions
        return 'BUY'

    return 'HOLD'
```

### How to Avoid Overfitting

1. **Limit Parameters**
```python
# GOOD: Simple strategy with few parameters
def simple_strategy(data, ma_short=20, ma_long=50):
    """
    Simple strategy with only 2 parameters.
    """
    signals = pd.DataFrame(index=data.index)
    signals['entry'] = data['MA_Short'] > data['MA_Long']
    signals['exit'] = data['MA_Short'] < data['MA_Long']
    return signals
```

2. **Use Walk-Forward Analysis**
```python
def walk_forward_test(data, optimize_period=252, test_period=63):
    """
    Walk-forward analysis to prevent overfitting.

    Parameters:
    -----------
    data : pd.DataFrame
        Price data
    optimize_period : int
        In-sample optimization period (days)
    test_period : int
        Out-of-sample test period (days)

    Returns:
    --------
    list : Out-of-sample results
    """
    results = []
    start = optimize_period

    while start + test_period < len(data):
        # In-sample optimization
        is_data = data.iloc[start - optimize_period:start]
        best_params = optimize_parameters(is_data)

        # Out-of-sample testing
        oos_data = data.iloc[start:start + test_period]
        oos_result = test_strategy(oos_data, best_params)
        results.append(oos_result)

        # Roll forward
        start += test_period

    return results
```

3. **Cross-Validation**
```python
def cross_validate_strategy(data, n_splits=5):
    """
    Cross-validate strategy on different time periods.

    Parameters:
    -----------
    data : pd.DataFrame
        Price data
    n_splits : int
        Number of splits

    Returns:
    --------
    list : Results for each split
    """
    split_size = len(data) // n_splits
    results = []

    for i in range(n_splits):
        # Test on split i, train on others
        test_start = i * split_size
        test_end = (i + 1) * split_size

        test_data = data.iloc[test_start:test_end]
        train_data = pd.concat([
            data.iloc[:test_start],
            data.iloc[test_end:]
        ])

        # Optimize on training data
        params = optimize_parameters(train_data)

        # Test on test data
        result = test_strategy(test_data, params)
        results.append(result)

    return results
```

4. **Regularization**
```python
def penalize_complexity(performance, num_parameters):
    """
    Penalize strategies with too many parameters.

    Parameters:
    -----------
    performance : float
        Strategy performance metric
    num_parameters : int
        Number of parameters

    Returns:
    --------
    float : Adjusted performance
    """
    # Akaike Information Criterion (AIC) style penalty
    penalty = 2 * num_parameters
    adjusted_performance = performance - penalty

    return adjusted_performance
```

## Data Snooping Bias

### What is Data Snooping?

Data snooping occurs when you test multiple strategies on the same dataset and only report the best one. This creates selection bias.

### Example

```python
# WRONG: Testing 100 strategies, reporting only the best
strategies = []
for i in range(100):
    strategy = generate_random_strategy()
    result = backtest(strategy, data)
    strategies.append((strategy, result))

# Report only the best
best_strategy = max(strategies, key=lambda x: x[1]['return'])
print(f"Found amazing strategy with {best_strategy[1]['return']:.2%} return!")
# This is likely just luck!
```

### How to Avoid Data Snooping

1. **Reserve Holdout Data**
```python
# Split data into development and validation sets
train_data = data.iloc[:int(len(data) * 0.7)]
validation_data = data.iloc[int(len(data) * 0.7):]

# Develop strategy on train_data only
# Test final strategy on validation_data ONCE
```

2. **Adjust for Multiple Testing**
```python
def bonferroni_correction(p_value, num_tests):
    """
    Adjust p-value for multiple testing.

    Parameters:
    -----------
    p_value : float
        Original p-value
    num_tests : int
        Number of tests performed

    Returns:
    --------
    float : Adjusted p-value
    """
    return min(p_value * num_tests, 1.0)
```

3. **Document All Tests**
```python
# Keep a log of all strategies tested
test_log = []

def test_strategy(strategy, data):
    result = backtest(strategy, data)

    # Log every test
    test_log.append({
        'strategy': strategy,
        'result': result,
        'timestamp': datetime.now()
    })

    return result

# Report: "Tested 47 strategies, 3 showed positive results"
```

## Realistic Execution Modeling

### Common Execution Assumptions

Many backtests assume unrealistic execution:

1. **No Slippage**: Filled at exact signal price
2. **Instant Fills**: No delay between signal and execution
3. **Unlimited Liquidity**: Can trade any size
4. **No Market Impact**: Large orders don't move price

### Realistic Execution Model

```python
class RealisticExecution:
    """
    Model realistic order execution.
    """

    def __init__(self,
                 commission: float = 0.001,
                 slippage_pct: float = 0.0005,
                 min_commission: float = 1.0):
        self.commission = commission
        self.slippage_pct = slippage_pct
        self.min_commission = min_commission

    def calculate_slippage(self,
                          price: float,
                          shares: int,
                          avg_volume: float,
                          direction: str) -> float:
        """
        Calculate slippage based on order size and liquidity.

        Parameters:
        -----------
        price : float
            Order price
        shares : int
            Number of shares
        avg_volume : float
            Average daily volume
        direction : str
            'buy' or 'sell'

        Returns:
        --------
        float : Slippage amount per share
        """
        # Base slippage
        base_slippage = price * self.slippage_pct

        # Market impact (larger orders have more impact)
        order_pct = shares / avg_volume
        impact_multiplier = 1 + (order_pct * 10)  # 10x impact for 10% of volume

        total_slippage = base_slippage * impact_multiplier

        # Direction matters
        if direction == 'buy':
            return total_slippage  # Pay more when buying
        else:
            return -total_slippage  # Receive less when selling

    def execute_order(self,
                     price: float,
                     shares: int,
                     avg_volume: float,
                     direction: str) -> Dict:
        """
        Execute order with realistic costs.

        Returns:
        --------
        Dict : Execution details
        """
        # Calculate slippage
        slippage_per_share = self.calculate_slippage(
            price, shares, avg_volume, direction
        )

        # Execution price
        if direction == 'buy':
            execution_price = price + abs(slippage_per_share)
        else:
            execution_price = price - abs(slippage_per_share)

        # Commission
        commission = max(
            price * shares * self.commission,
            self.min_commission
        )

        # Total cost
        if direction == 'buy':
            total_cost = (execution_price * shares) + commission
        else:
            total_cost = (execution_price * shares) - commission

        return {
            'execution_price': execution_price,
            'slippage': slippage_per_share * shares,
            'commission': commission,
            'total_cost': total_cost
        }
```

## Best Practices Checklist

### Data Quality
- [ ] Use clean, adjusted price data
- [ ] Include survivorship-bias-free data if possible
- [ ] Validate data for errors and gaps
- [ ] Document data sources and limitations

### Bias Prevention
- [ ] Ensure no look-ahead bias in indicators
- [ ] Use point-in-time data only
- [ ] Implement proper order of operations
- [ ] Test with realistic execution assumptions

### Overfitting Prevention
- [ ] Limit number of parameters (< 5)
- [ ] Use walk-forward analysis
- [ ] Reserve holdout data
- [ ] Test across different market regimes

### Execution Realism
- [ ] Model slippage based on liquidity
- [ ] Include commissions and fees
- [ ] Account for market impact
- [ ] Consider order delays

### Documentation
- [ ] Record all assumptions
- [ ] Log all strategy tests
- [ ] Document known limitations
- [ ] Report realistic expectations

## Exercises

### Exercise 1: Detect Look-Ahead Bias

Review this code and identify the look-ahead bias:

```python
def buggy_strategy(data):
    data['MA'] = data['Close'].rolling(20).mean()
    signals = []

    for i in range(len(data)):
        if data['Close'].iloc[i] > data['MA'].iloc[i]:
            # Buy at next bar's low
            entry = data['Low'].iloc[i+1]
            signals.append(('BUY', entry))

    return signals
```

Fix the bias and implement properly.

### Exercise 2: Measure Overfitting

Create two strategies:
1. Simple: 2 parameters
2. Complex: 10 parameters

Optimize both on 2020-2022 data, test on 2023 data. Compare in-sample vs out-of-sample performance degradation.

### Exercise 3: Realistic Execution

Implement a backtest with:
- 0.1% commission
- Slippage based on order size
- Minimum $1 commission per trade

Compare results to a backtest with no costs.

### Exercise 4: Walk-Forward Analysis

Implement walk-forward analysis with:
- 1 year optimization window
- 3 month test window
- Rolling forward monthly

Test on SPY from 2015-2023.

## Summary

Avoiding backtesting pitfalls is crucial for developing strategies that work in live trading. The main pitfalls to avoid are:

1. **Look-Ahead Bias**: Use only historical data available at decision time
2. **Survivorship Bias**: Include delisted stocks or acknowledge bias
3. **Overfitting**: Limit parameters and use out-of-sample testing
4. **Data Snooping**: Reserve holdout data and document all tests
5. **Unrealistic Execution**: Model slippage, commissions, and market impact

Remember: If backtest results look too good to be true, they probably are. Be skeptical, conservative, and thorough in your testing.

## Next Steps

In the next lesson, we'll explore comprehensive performance metrics to properly evaluate strategy quality beyond simple returns, including risk-adjusted metrics, drawdown analysis, and statistical significance testing.