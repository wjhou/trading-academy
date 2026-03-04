# Lesson 4.5: Multi-Strategy Approaches - Diversifying Your Edge

**Module**: 4 - Trading Strategies
**Estimated Time**: 50 minutes
**Difficulty**: Advanced

## 🎯 Learning Objectives

- Understand benefits of multi-strategy trading
- Learn strategy correlation and diversification
- Implement portfolio of strategies
- Allocate capital across strategies
- Monitor and rebalance strategy portfolio

## 📖 Why Multiple Strategies?

**Multi-Strategy Approach** combines different trading strategies to create more consistent returns.

### Benefits

1. **Reduced Drawdowns**: Strategies perform differently in various conditions
2. **Smoother Equity Curve**: Diversification reduces volatility
3. **Market Adaptability**: Always have strategies working
4. **Risk Management**: Don't rely on single approach

## 📊 Strategy Combinations

### 1. Trend + Mean Reversion

**Concept**: Trend following for trends, mean reversion for ranges

```python
class HybridStrategy:
    def __init__(self):
        self.trend_system = TrendFollowingSystem()
        self.mean_reversion_system = MeanReversionSystem()

    def determine_market_regime(self, df):
        """
        Identify if market is trending or ranging
        """
        # Calculate ADX
        adx = self.calculate_adx(df)

        if adx > 25:
            return "TRENDING"
        else:
            return "RANGING"

    def generate_signal(self, df):
        """
        Route to appropriate strategy based on regime
        """
        regime = self.determine_market_regime(df)

        if regime == "TRENDING":
            return self.trend_system.generate_signal(df)
        else:
            return self.mean_reversion_system.generate_signal(df)
```

### 2. Multiple Timeframes

**Concept**: Trade different timeframes simultaneously

```python
def multi_timeframe_strategy(ticker):
    """
    Combine daily, weekly, and monthly signals
    """
    import yfinance as yf

    # Get data for different timeframes
    daily = yf.Ticker(ticker).history(period="1y", interval="1d")
    weekly = yf.Ticker(ticker).history(period="2y", interval="1wk")
    monthly = yf.Ticker(ticker).history(period="5y", interval="1mo")

    # Calculate signals for each timeframe
    daily_signal = calculate_signal(daily, "short_term")
    weekly_signal = calculate_signal(weekly, "medium_term")
    monthly_signal = calculate_signal(monthly, "long_term")

    # Combine signals (weighted by timeframe)
    combined_score = (daily_signal * 0.3 +
                     weekly_signal * 0.4 +
                     monthly_signal * 0.3)

    if combined_score > 0.5:
        return "BUY"
    elif combined_score < -0.5:
        return "SELL"
    else:
        return "HOLD"
```

### 3. Strategy Portfolio

**Concept**: Run multiple independent strategies

```python
class StrategyPortfolio:
    def __init__(self, strategies, allocations):
        """
        strategies: list of strategy objects
        allocations: dict of strategy -> allocation percentage
        """
        self.strategies = strategies
        self.allocations = allocations

    def generate_signals(self, df):
        """
        Get signals from all strategies
        """
        signals = {}

        for name, strategy in self.strategies.items():
            signal = strategy.generate_signal(df)
            signals[name] = signal

        return signals

    def calculate_position_size(self, total_capital, signals):
        """
        Allocate capital based on strategy signals and allocations
        """
        positions = {}

        for strategy_name, signal in signals.items():
            if signal in ["BUY", "SELL"]:
                allocation = self.allocations[strategy_name]
                capital_for_strategy = total_capital * allocation
                positions[strategy_name] = {
                    'signal': signal,
                    'capital': capital_for_strategy
                }

        return positions

# Example usage
strategies = {
    'trend_following': TrendFollowingSystem(),
    'mean_reversion': MeanReversionSystem(),
    'momentum': MomentumSystem(),
    'breakout': BreakoutSystem()
}

allocations = {
    'trend_following': 0.30,
    'mean_reversion': 0.25,
    'momentum': 0.25,
    'breakout': 0.20
}

portfolio = StrategyPortfolio(strategies, allocations)
```

## 🎯 Strategy Correlation Analysis

```python
def analyze_strategy_correlation(strategies, data, period="2y"):
    """
    Calculate correlation between strategy returns
    """
    import pandas as pd
    import numpy as np

    # Get returns for each strategy
    strategy_returns = {}

    for name, strategy in strategies.items():
        # Backtest strategy
        results = backtest_strategy(data, strategy)
        strategy_returns[name] = results['daily_returns']

    # Create DataFrame
    returns_df = pd.DataFrame(strategy_returns)

    # Calculate correlation matrix
    correlation_matrix = returns_df.corr()

    print("Strategy Correlation Matrix:")
    print(correlation_matrix)

    # Visualize
    import seaborn as sns
    import matplotlib.pyplot as plt

    plt.figure(figsize=(10, 8))
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Strategy Correlation Matrix')
    plt.show()

    return correlation_matrix
```

## 💰 Capital Allocation

### 1. Equal Weight

```python
def equal_weight_allocation(strategies):
    """
    Allocate equally across all strategies
    """
    n = len(strategies)
    return {name: 1/n for name in strategies.keys()}
```

### 2. Risk Parity

```python
def risk_parity_allocation(strategies, returns_data):
    """
    Allocate based on inverse volatility
    """
    import numpy as np

    # Calculate volatility for each strategy
    volatilities = {}
    for name in strategies.keys():
        vol = np.std(returns_data[name]) * np.sqrt(252)
        volatilities[name] = vol

    # Inverse volatility weights
    inv_vol = {name: 1/vol for name, vol in volatilities.items()}
    total_inv_vol = sum(inv_vol.values())

    # Normalize to sum to 1
    allocations = {name: weight/total_inv_vol for name, weight in inv_vol.items()}

    return allocations
```

### 3. Performance-Based

```python
def performance_based_allocation(strategies, returns_data, lookback=60):
    """
    Allocate more to better performing strategies
    """
    # Calculate Sharpe ratio for each strategy
    sharpe_ratios = {}

    for name in strategies.keys():
        returns = returns_data[name].iloc[-lookback:]
        sharpe = returns.mean() / returns.std() * np.sqrt(252)
        sharpe_ratios[name] = max(sharpe, 0)  # No negative allocations

    # Normalize
    total_sharpe = sum(sharpe_ratios.values())

    if total_sharpe > 0:
        allocations = {name: sharpe/total_sharpe for name, sharpe in sharpe_ratios.items()}
    else:
        # Fall back to equal weight if all negative
        allocations = equal_weight_allocation(strategies)

    return allocations
```

## 📊 Portfolio Rebalancing

```python
class StrategyRebalancer:
    def __init__(self, rebalance_frequency='monthly'):
        self.rebalance_frequency = rebalance_frequency
        self.last_rebalance = None

    def should_rebalance(self, current_date):
        """
        Check if it's time to rebalance
        """
        if self.last_rebalance is None:
            return True

        if self.rebalance_frequency == 'daily':
            return True
        elif self.rebalance_frequency == 'weekly':
            return (current_date - self.last_rebalance).days >= 7
        elif self.rebalance_frequency == 'monthly':
            return (current_date - self.last_rebalance).days >= 30
        elif self.rebalance_frequency == 'quarterly':
            return (current_date - self.last_rebalance).days >= 90

        return False

    def rebalance_portfolio(self, current_allocations, target_allocations, total_capital):
        """
        Rebalance to target allocations
        """
        trades = {}

        for strategy, target_pct in target_allocations.items():
            current_pct = current_allocations.get(strategy, 0)
            target_capital = total_capital * target_pct
            current_capital = total_capital * current_pct

            difference = target_capital - current_capital

            if abs(difference) > total_capital * 0.05:  # 5% threshold
                trades[strategy] = difference

        return trades
```

## 🎯 Complete Multi-Strategy System

```python
class MultiStrategySystem:
    def __init__(self, strategies, allocation_method='risk_parity'):
        self.strategies = strategies
        self.allocation_method = allocation_method
        self.allocations = {}
        self.performance_history = {name: [] for name in strategies.keys()}

    def update_allocations(self, returns_data):
        """
        Update strategy allocations based on method
        """
        if self.allocation_method == 'equal_weight':
            self.allocations = equal_weight_allocation(self.strategies)

        elif self.allocation_method == 'risk_parity':
            self.allocations = risk_parity_allocation(self.strategies, returns_data)

        elif self.allocation_method == 'performance_based':
            self.allocations = performance_based_allocation(self.strategies, returns_data)

        return self.allocations

    def execute_strategies(self, df, total_capital):
        """
        Execute all strategies and combine results
        """
        positions = {}

        for name, strategy in self.strategies.items():
            signal = strategy.generate_signal(df)

            if signal in ["BUY", "SELL"]:
                allocation = self.allocations.get(name, 0)
                capital = total_capital * allocation

                positions[name] = {
                    'signal': signal,
                    'capital': capital,
                    'strategy': strategy
                }

        return positions

    def calculate_portfolio_metrics(self):
        """
        Calculate overall portfolio performance
        """
        # Combine returns from all strategies
        total_returns = []

        for name, returns in self.performance_history.items():
            allocation = self.allocations.get(name, 0)
            weighted_returns = [r * allocation for r in returns]
            total_returns.append(weighted_returns)

        # Sum across strategies
        portfolio_returns = [sum(x) for x in zip(*total_returns)]

        # Calculate metrics
        total_return = (1 + sum(portfolio_returns)) - 1
        volatility = np.std(portfolio_returns) * np.sqrt(252)
        sharpe = (np.mean(portfolio_returns) / np.std(portfolio_returns)) * np.sqrt(252)

        return {
            'total_return': total_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe
        }
```

## 📈 Monitoring and Adjustment

```python
def monitor_strategy_performance(portfolio, lookback=30):
    """
    Monitor individual strategy performance
    """
    for name, strategy in portfolio.strategies.items():
        recent_returns = portfolio.performance_history[name][-lookback:]

        if len(recent_returns) >= lookback:
            # Calculate metrics
            win_rate = len([r for r in recent_returns if r > 0]) / len(recent_returns)
            avg_return = np.mean(recent_returns)
            sharpe = (np.mean(recent_returns) / np.std(recent_returns)) * np.sqrt(252)

            print(f"\n{name}:")
            print(f"  Win Rate: {win_rate:.2%}")
            print(f"  Avg Return: {avg_return:.4f}")
            print(f"  Sharpe: {sharpe:.2f}")

            # Alert if underperforming
            if sharpe < 0.5:
                print(f"  ⚠️  WARNING: {name} underperforming!")
```

## ⚠️ Common Pitfalls

1. **Over-Diversification**: Too many strategies dilute returns
2. **Strategy Overlap**: Similar strategies = not truly diversified
3. **Ignoring Correlations**: Strategies moving together = no benefit
4. **Complexity**: Hard to manage and debug
5. **Over-Optimization**: Fitting to past data

## 🎓 Check Your Understanding

1. Why use multiple strategies?
2. What is strategy correlation?
3. How do you allocate capital across strategies?
4. When should you rebalance?
5. What is risk parity allocation?

## 💻 Exercise

```python
# Build multi-strategy system
strategies = {
    'trend': TrendFollowingSystem(),
    'mean_rev': MeanReversionSystem(),
    'momentum': MomentumSystem()
}

system = MultiStrategySystem(strategies, allocation_method='risk_parity')

# Backtest
results = backtest_multi_strategy(system, initial_capital=100000)
print(f"Portfolio Sharpe: {results['sharpe_ratio']:.2f}")
```

## 📝 Exercise 4.5

Create: `exercises/module-04/exercise-4.5-multi-strategy.md`

1. Implement 3 different strategies
2. Calculate correlation between them
3. Test different allocation methods
4. Compare single vs multi-strategy performance
5. Document optimal combination

## 📚 Resources

- [Investopedia: Multi-Strategy](https://www.investopedia.com/terms/m/multi-strategy-fund.asp)
- [Portfolio Visualizer](https://www.portfoliovisualizer.com/)

## ✅ Solutions

1. **Multiple strategies**: Reduce drawdowns, smoother returns, adapt to different market conditions, diversify risk
2. **Strategy correlation**: How strategies move together; want low/negative correlation for diversification
3. **Capital allocation**: Equal weight, risk parity (inverse volatility), performance-based, or optimization
4. **Rebalance timing**: Monthly/quarterly, or when allocations drift >5% from target
5. **Risk parity**: Allocate inversely to volatility; lower vol strategies get more capital for equal risk contribution

---

**Next**: [Lesson 4.6: Strategy Design Principles](lesson-06-design.md)
