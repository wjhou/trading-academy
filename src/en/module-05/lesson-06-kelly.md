# Lesson 5.6: Kelly Criterion

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand the Kelly Criterion formula and its theoretical foundation
- Calculate optimal position sizes using Kelly Criterion
- Implement fractional Kelly for practical trading
- Recognize the limitations and risks of Kelly sizing
- Apply Kelly Criterion in combination with other risk management techniques

## Introduction

The Kelly Criterion is a mathematical formula used to determine the optimal size of a series of bets or investments to maximize long-term growth. Developed by John Kelly in 1956, it provides a systematic approach to position sizing based on your edge and the odds of success.

While theoretically optimal for maximizing logarithmic wealth growth, the Kelly Criterion requires careful application in trading due to its aggressive nature and sensitivity to estimation errors.

## The Kelly Formula

### Basic Formula

For a simple bet with binary outcomes (win or lose):

```
f* = (bp - q) / b
```

Where:
- f* = fraction of capital to bet (Kelly percentage)
- b = odds received on the bet (net odds, e.g., 2 for 2:1 odds)
- p = probability of winning
- q = probability of losing (1 - p)

### Trading Application

For trading, we adapt the formula to account for average win/loss ratios:

```
f* = (W × P - L × (1 - P)) / W
```

Where:
- W = average win size (as a fraction)
- L = average loss size (as a fraction)
- P = win rate (probability of winning trade)

Alternatively, using win rate and win/loss ratio:

```
f* = P - (1 - P) / R
```

Where:
- P = win rate
- R = average win / average loss ratio

## Full Kelly vs Fractional Kelly

### Full Kelly

Full Kelly (f*) maximizes long-term growth rate but can lead to:
- Large drawdowns (potentially 50% or more)
- High volatility in account equity
- Significant psychological stress
- Sensitivity to estimation errors

### Fractional Kelly

Most professional traders use fractional Kelly, typically 1/4 to 1/2 Kelly:

```
Position Size = f* × Fraction
```

Common fractions:
- **Half Kelly (0.5)**: Reduces volatility significantly while maintaining ~75% of growth rate
- **Quarter Kelly (0.25)**: Conservative approach, smoother equity curve
- **Third Kelly (0.33)**: Balanced approach between growth and stability

## Python Implementation

Let's implement a comprehensive Kelly Criterion calculator:

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import yfinance as yf

class KellyCriterion:
    """
    Kelly Criterion position sizing calculator.
    """

    def __init__(self, kelly_fraction: float = 0.5):
        """
        Initialize Kelly calculator.

        Parameters:
        -----------
        kelly_fraction : float
            Fraction of Kelly to use (0.25 to 1.0)
        """
        self.kelly_fraction = kelly_fraction
        self.trade_history = []

    def calculate_kelly_simple(self, win_rate: float,
                               avg_win: float,
                               avg_loss: float) -> float:
        """
        Calculate Kelly percentage using win rate and avg win/loss.

        Parameters:
        -----------
        win_rate : float
            Probability of winning (0 to 1)
        avg_win : float
            Average winning trade size (as fraction)
        avg_loss : float
            Average losing trade size (as fraction)

        Returns:
        --------
        float : Kelly percentage
        """
        if avg_loss == 0:
            return 0.0

        win_loss_ratio = avg_win / avg_loss
        kelly = win_rate - ((1 - win_rate) / win_loss_ratio)

        # Apply fractional Kelly
        kelly = kelly * self.kelly_fraction

        # Ensure non-negative
        return max(0.0, kelly)

    def calculate_kelly_from_trades(self, returns: List[float]) -> float:
        """
        Calculate Kelly percentage from historical trade returns.

        Parameters:
        -----------
        returns : List[float]
            List of trade returns (as fractions, e.g., 0.02 for 2% gain)

        Returns:
        --------
        float : Kelly percentage
        """
        if not returns:
            return 0.0

        returns_array = np.array(returns)

        # Separate wins and losses
        wins = returns_array[returns_array > 0]
        losses = returns_array[returns_array < 0]

        if len(wins) == 0 or len(losses) == 0:
            return 0.0

        # Calculate statistics
        win_rate = len(wins) / len(returns_array)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        return self.calculate_kelly_simple(win_rate, avg_win, avg_loss)

    def calculate_position_size(self, capital: float,
                                win_rate: float,
                                avg_win: float,
                                avg_loss: float,
                                price: float) -> int:
        """
        Calculate position size in shares using Kelly Criterion.

        Parameters:
        -----------
        capital : float
            Total trading capital
        win_rate : float
            Probability of winning
        avg_win : float
            Average win as fraction
        avg_loss : float
            Average loss as fraction
        price : float
            Current price per share

        Returns:
        --------
        int : Number of shares to buy
        """
        kelly_pct = self.calculate_kelly_simple(win_rate, avg_win, avg_loss)

        # Calculate dollar amount to risk
        position_value = capital * kelly_pct

        # Convert to shares
        shares = int(position_value / price)

        return shares

    def rolling_kelly(self, returns: List[float],
                     window: int = 20) -> List[float]:
        """
        Calculate rolling Kelly percentage over time.

        Parameters:
        -----------
        returns : List[float]
            List of trade returns
        window : int
            Rolling window size

        Returns:
        --------
        List[float] : Rolling Kelly percentages
        """
        if len(returns) < window:
            return []

        kelly_values = []

        for i in range(window, len(returns) + 1):
            window_returns = returns[i-window:i]
            kelly = self.calculate_kelly_from_trades(window_returns)
            kelly_values.append(kelly)

        return kelly_values

    def add_trade(self, return_pct: float):
        """
        Add a trade to history.

        Parameters:
        -----------
        return_pct : float
            Trade return as fraction
        """
        self.trade_history.append(return_pct)

    def get_current_kelly(self) -> float:
        """
        Get current Kelly percentage based on trade history.

        Returns:
        --------
        float : Current Kelly percentage
        """
        if not self.trade_history:
            return 0.0

        return self.calculate_kelly_from_trades(self.trade_history)

    def simulate_kelly_growth(self, returns: List[float],
                             initial_capital: float = 10000,
                             kelly_fractions: List[float] = None) -> pd.DataFrame:
        """
        Simulate portfolio growth using different Kelly fractions.

        Parameters:
        -----------
        returns : List[float]
            List of trade returns
        initial_capital : float
            Starting capital
        kelly_fractions : List[float]
            List of Kelly fractions to test

        Returns:
        --------
        pd.DataFrame : Simulation results
        """
        if kelly_fractions is None:
            kelly_fractions = [0.25, 0.5, 0.75, 1.0]

        results = {'Trade': list(range(len(returns)))}

        for fraction in kelly_fractions:
            capital = initial_capital
            equity_curve = [capital]

            # Calculate Kelly percentage
            kelly_pct = self.calculate_kelly_from_trades(returns)

            for ret in returns:
                # Position size based on Kelly fraction
                position_size = capital * kelly_pct * fraction

                # Calculate P&L
                pnl = position_size * ret

                # Update capital
                capital += pnl
                equity_curve.append(capital)

            results[f'Kelly_{fraction}'] = equity_curve[1:]

        return pd.DataFrame(results)


# Example usage
def example_kelly_calculation():
    """
    Demonstrate Kelly Criterion calculations.
    """
    print("Kelly Criterion Position Sizing")
    print("=" * 50)

    # Initialize Kelly calculator with half-Kelly
    kelly = KellyCriterion(kelly_fraction=0.5)

    # Example 1: Simple calculation
    print("\nExample 1: Simple Kelly Calculation")
    print("-" * 50)

    win_rate = 0.55  # 55% win rate
    avg_win = 0.02   # 2% average win
    avg_loss = 0.01  # 1% average loss

    kelly_pct = kelly.calculate_kelly_simple(win_rate, avg_win, avg_loss)

    print(f"Win Rate: {win_rate:.1%}")
    print(f"Average Win: {avg_win:.1%}")
    print(f"Average Loss: {avg_loss:.1%}")
    print(f"Win/Loss Ratio: {avg_win/avg_loss:.2f}")
    print(f"Kelly Percentage (Half-Kelly): {kelly_pct:.2%}")

    # Example 2: Position sizing
    print("\nExample 2: Position Sizing")
    print("-" * 50)

    capital = 100000
    price = 150

    shares = kelly.calculate_position_size(
        capital, win_rate, avg_win, avg_loss, price
    )

    position_value = shares * price

    print(f"Capital: ${capital:,.2f}")
    print(f"Stock Price: ${price:.2f}")
    print(f"Shares to Buy: {shares}")
    print(f"Position Value: ${position_value:,.2f}")
    print(f"Position as % of Capital: {position_value/capital:.2%}")

    # Example 3: Historical trades
    print("\nExample 3: Kelly from Trade History")
    print("-" * 50)

    # Simulate trade returns
    np.random.seed(42)
    trade_returns = []

    for _ in range(100):
        if np.random.random() < win_rate:
            trade_returns.append(np.random.uniform(0.01, 0.03))
        else:
            trade_returns.append(np.random.uniform(-0.02, -0.005))

    kelly_from_history = kelly.calculate_kelly_from_trades(trade_returns)

    print(f"Number of Trades: {len(trade_returns)}")
    print(f"Actual Win Rate: {len([r for r in trade_returns if r > 0])/len(trade_returns):.2%}")
    print(f"Kelly Percentage: {kelly_from_history:.2%}")

    # Example 4: Compare Kelly fractions
    print("\nExample 4: Comparing Kelly Fractions")
    print("-" * 50)

    simulation = kelly.simulate_kelly_growth(
        trade_returns[:50],
        initial_capital=10000,
        kelly_fractions=[0.25, 0.5, 0.75, 1.0]
    )

    print("\nFinal Capital by Kelly Fraction:")
    for col in simulation.columns:
        if col != 'Trade':
            final_value = simulation[col].iloc[-1]
            total_return = (final_value - 10000) / 10000
            print(f"{col}: ${final_value:,.2f} ({total_return:+.2%})")


if __name__ == "__main__":
    example_kelly_calculation()
```

## Practical Considerations

### Estimation Error

Kelly Criterion is highly sensitive to input parameters:

1. **Win Rate Overestimation**: Even small errors in win rate estimation can lead to significant overbetting
2. **Win/Loss Ratio Errors**: Underestimating average losses or overestimating average wins increases risk
3. **Sample Size**: Small sample sizes lead to unreliable estimates

**Solution**: Use fractional Kelly (1/4 to 1/2) to provide margin of safety.

### Non-Stationary Markets

Trading parameters change over time:
- Market conditions evolve
- Strategy effectiveness varies
- Historical performance may not predict future results

**Solution**: Use rolling windows to recalculate Kelly percentage periodically.

### Multiple Simultaneous Positions

Kelly Criterion assumes single bet at a time. With multiple positions:
- Correlations between positions matter
- Total portfolio Kelly may exceed individual position Kelly
- Risk of over-leveraging increases

**Solution**: Apply Kelly to total portfolio risk, not individual positions.

### Drawdown Risk

Full Kelly can produce drawdowns of 50% or more:
- Psychologically difficult to maintain
- May force liquidation at worst times
- Recovery from large drawdowns is challenging

**Solution**: Use fractional Kelly and combine with maximum drawdown limits.

## Combining Kelly with Other Risk Management

### Kelly + Fixed Risk Limit

```python
def kelly_with_max_risk(kelly_pct: float, max_risk: float = 0.02) -> float:
    """
    Combine Kelly with maximum risk limit.
    """
    return min(kelly_pct, max_risk)
```

### Kelly + Volatility Adjustment

```python
def kelly_volatility_adjusted(kelly_pct: float,
                              current_vol: float,
                              target_vol: float) -> float:
    """
    Adjust Kelly for current volatility.
    """
    vol_scalar = target_vol / current_vol
    return kelly_pct * vol_scalar
```

### Kelly + Drawdown Reduction

```python
def kelly_drawdown_adjusted(kelly_pct: float,
                           current_dd: float,
                           max_dd: float = 0.20) -> float:
    """
    Reduce Kelly during drawdowns.
    """
    if current_dd >= max_dd:
        return 0.0

    dd_scalar = 1 - (current_dd / max_dd)
    return kelly_pct * dd_scalar
```

## Advantages and Disadvantages

### Advantages

1. **Mathematically Optimal**: Maximizes long-term growth rate
2. **Systematic**: Removes emotion from position sizing
3. **Adaptive**: Adjusts to changing win rates and ratios
4. **Edge-Based**: Larger positions when edge is greater

### Disadvantages

1. **High Volatility**: Full Kelly produces large swings
2. **Estimation Sensitivity**: Small errors have large impact
3. **Assumes Accuracy**: Requires accurate probability estimates
4. **Psychological Difficulty**: Large drawdowns are stressful
5. **Single Bet Assumption**: Doesn't naturally handle multiple positions

## Best Practices

1. **Use Fractional Kelly**: Start with 1/4 to 1/2 Kelly
2. **Regular Recalculation**: Update parameters monthly or quarterly
3. **Sufficient Sample Size**: Use at least 30-50 trades for estimates
4. **Conservative Estimates**: Err on side of caution with parameters
5. **Combine with Limits**: Use maximum position size and risk limits
6. **Monitor Drawdowns**: Reduce sizing during significant drawdowns
7. **Account for Correlations**: Consider portfolio-level risk
8. **Stress Test**: Simulate performance under various scenarios

## Exercises

### Exercise 1: Kelly Calculation

Calculate the Kelly percentage for a strategy with:
- Win rate: 60%
- Average win: 3%
- Average loss: 2%

What is the full Kelly and half-Kelly percentage?

### Exercise 2: Sensitivity Analysis

Using the KellyCriterion class, analyze how Kelly percentage changes when:
- Win rate varies from 50% to 70%
- Win/loss ratio varies from 1.0 to 3.0

Create a heatmap showing Kelly percentages.

### Exercise 3: Historical Analysis

Download historical data for a stock and:
1. Implement a simple moving average crossover strategy
2. Calculate returns for each trade
3. Compute Kelly percentage from trade history
4. Compare performance using different Kelly fractions

### Exercise 4: Risk Integration

Create a position sizing system that combines:
- Kelly Criterion
- Maximum 2% risk per trade
- Volatility adjustment
- Drawdown reduction

Test on historical data and compare to fixed position sizing.

## Summary

The Kelly Criterion provides a mathematical framework for optimal position sizing based on your trading edge. While theoretically optimal for maximizing growth, practical application requires:

- Using fractional Kelly (typically 1/4 to 1/2) to reduce volatility
- Regular recalculation as market conditions change
- Conservative parameter estimation to account for uncertainty
- Integration with other risk management techniques
- Awareness of psychological challenges from volatility

When properly applied with appropriate safeguards, Kelly Criterion can significantly improve risk-adjusted returns while maintaining disciplined position sizing.

## Next Steps

In the next module, we'll integrate all risk management concepts into a comprehensive risk management system project, combining position sizing, stop-losses, risk-reward analysis, diversification, drawdown management, and Kelly Criterion into a unified framework.
