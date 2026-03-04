# Lesson 4.6: Strategy Design Principles - Building Robust Systems

**Module**: 4 - Trading Strategies
**Estimated Time**: 55 minutes
**Difficulty**: Advanced

## 🎯 Learning Objectives

- Learn principles of robust strategy design
- Avoid common strategy development pitfalls
- Implement proper testing methodology
- Build strategies that work in live trading
- Understand the complete strategy development lifecycle

## 📖 Strategy Development Lifecycle

```
1. Idea Generation → 2. Research → 3. Design → 4. Backtest →
5. Validate → 6. Paper Trade → 7. Live Trade → 8. Monitor → 9. Improve
```

## 🎯 Core Design Principles

### 1. Simplicity

**Principle**: Simple strategies are more robust than complex ones

```python
# GOOD: Simple and clear
def simple_ma_crossover(df):
    if df['MA_50'].iloc[-1] > df['MA_200'].iloc[-1]:
        return "BUY"
    return "SELL"

# BAD: Overly complex
def complex_strategy(df):
    if (df['MA_50'].iloc[-1] > df['MA_200'].iloc[-1] and
        df['RSI'].iloc[-1] > 50 and df['RSI'].iloc[-1] < 70 and
        df['MACD'].iloc[-1] > df['MACD_Signal'].iloc[-1] and
        df['Volume'].iloc[-1] > df['Volume'].rolling(20).mean().iloc[-1] * 1.5 and
        df['ADX'].iloc[-1] > 25 and
        df['Stoch_K'].iloc[-1] > df['Stoch_D'].iloc[-1]):
        return "BUY"
    return "SELL"
```

**Why**: More parameters = more overfitting, harder to debug, less robust

### 2. Economic Rationale

**Principle**: Strategy must have logical reason for working

**Good Rationale**:
- "Buy oversold stocks because mean reversion"
- "Follow trends because momentum persists"
- "Buy breakouts because new information drives trends"

**Bad Rationale**:
- "Buy when RSI is 37.3 because backtest says so"
- "This pattern worked in 2020"

### 3. Robustness

**Principle**: Strategy should work across different:
- Time periods
- Market conditions
- Instruments
- Parameter values

```python
def test_robustness(strategy, data, param_ranges):
    """
    Test strategy across parameter ranges
    """
    results = []

    for params in param_ranges:
        result = backtest_strategy(data, strategy, params)
        results.append({
            'params': params,
            'sharpe': result['sharpe'],
            'return': result['return']
        })

    # Check consistency
    sharpe_values = [r['sharpe'] for r in results]
    sharpe_std = np.std(sharpe_values)

    if sharpe_std < 0.3:  # Low variation
        print("✓ Strategy is robust across parameters")
    else:
        print("✗ Strategy is sensitive to parameters")

    return results
```

### 4. Risk Management First

**Principle**: Define risk before defining returns

```python
class StrategyWithRisk:
    def __init__(self, max_risk_per_trade=0.02, max_portfolio_risk=0.06):
        self.max_risk_per_trade = max_risk_per_trade
        self.max_portfolio_risk = max_portfolio_risk

    def can_take_trade(self, account_value, current_positions):
        """
        Check if we can take another trade
        """
        # Calculate current portfolio risk
        current_risk = sum(pos['risk'] for pos in current_positions)

        # Check if adding trade exceeds limits
        if current_risk >= account_value * self.max_portfolio_risk:
            return False

        return True

    def calculate_position_size(self, account_value, entry, stop):
        """
        Size position based on risk
        """
        risk_amount = account_value * self.max_risk_per_trade
        risk_per_share = abs(entry - stop)
        shares = int(risk_amount / risk_per_share)

        return shares
```

## 🔍 Avoiding Overfitting

### 1. Out-of-Sample Testing

```python
def walk_forward_test(data, strategy, train_period=252, test_period=63):
    """
    Walk-forward optimization
    """
    results = []

    for i in range(train_period, len(data) - test_period, test_period):
        # Train on in-sample data
        train_data = data.iloc[i-train_period:i]
        optimal_params = optimize_strategy(train_data, strategy)

        # Test on out-of-sample data
        test_data = data.iloc[i:i+test_period]
        test_result = backtest_strategy(test_data, strategy, optimal_params)

        results.append(test_result)

    return results
```

### 2. Parameter Stability

```python
def test_parameter_stability(data, strategy, param_name, param_range):
    """
    Test how sensitive strategy is to parameter changes
    """
    results = []

    for param_value in param_range:
        params = {param_name: param_value}
        result = backtest_strategy(data, strategy, params)
        results.append((param_value, result['sharpe']))

    # Plot results
    import matplotlib.pyplot as plt
    plt.plot([r[0] for r in results], [r[1] for r in results])
    plt.xlabel(param_name)
    plt.ylabel('Sharpe Ratio')
    plt.title(f'Parameter Sensitivity: {param_name}')
    plt.show()

    return results
```

### 3. Multiple Markets

```python
def test_across_markets(strategy, tickers):
    """
    Test strategy on different instruments
    """
    results = {}

    for ticker in tickers:
        df = yf.Ticker(ticker).history(period="5y")
        result = backtest_strategy(df, strategy)
        results[ticker] = result

    # Check consistency
    sharpe_values = [r['sharpe'] for r in results.values()]
    avg_sharpe = np.mean(sharpe_values)

    print(f"Average Sharpe across markets: {avg_sharpe:.2f}")

    return results
```

## 📊 Strategy Evaluation Framework

```python
class StrategyEvaluator:
    def __init__(self, strategy):
        self.strategy = strategy

    def evaluate(self, data):
        """
        Comprehensive strategy evaluation
        """
        results = backtest_strategy(data, self.strategy)

        metrics = {
            # Returns
            'total_return': results['total_return'],
            'cagr': results['cagr'],

            # Risk
            'volatility': results['volatility'],
            'max_drawdown': results['max_drawdown'],
            'sharpe_ratio': results['sharpe'],
            'sortino_ratio': results['sortino'],

            # Trading
            'win_rate': results['win_rate'],
            'profit_factor': results['profit_factor'],
            'avg_trade': results['avg_trade'],
            'num_trades': results['num_trades'],

            # Consistency
            'best_month': results['best_month'],
            'worst_month': results['worst_month'],
            'positive_months': results['positive_months_pct']
        }

        return metrics

    def grade_strategy(self, metrics):
        """
        Grade strategy A-F
        """
        score = 0

        # Sharpe ratio (40 points)
        if metrics['sharpe_ratio'] > 2.0:
            score += 40
        elif metrics['sharpe_ratio'] > 1.5:
            score += 30
        elif metrics['sharpe_ratio'] > 1.0:
            score += 20
        elif metrics['sharpe_ratio'] > 0.5:
            score += 10

        # Max drawdown (30 points)
        if metrics['max_drawdown'] > -10:
            score += 30
        elif metrics['max_drawdown'] > -20:
            score += 20
        elif metrics['max_drawdown'] > -30:
            score += 10

        # Win rate (15 points)
        if metrics['win_rate'] > 0.6:
            score += 15
        elif metrics['win_rate'] > 0.5:
            score += 10
        elif metrics['win_rate'] > 0.4:
            score += 5

        # Consistency (15 points)
        if metrics['positive_months'] > 0.7:
            score += 15
        elif metrics['positive_months'] > 0.6:
            score += 10
        elif metrics['positive_months'] > 0.5:
            score += 5

        # Assign grade
        if score >= 85:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 55:
            return 'C'
        elif score >= 40:
            return 'D'
        else:
            return 'F'
```

## 🎯 Strategy Checklist

Before deploying a strategy, verify:

```python
def strategy_checklist(strategy, data):
    """
    Pre-deployment checklist
    """
    checks = {}

    # 1. Positive expectancy
    results = backtest_strategy(data, strategy)
    checks['positive_expectancy'] = results['avg_trade'] > 0

    # 2. Sufficient trades
    checks['enough_trades'] = results['num_trades'] > 30

    # 3. Acceptable drawdown
    checks['acceptable_drawdown'] = results['max_drawdown'] > -30

    # 4. Positive Sharpe
    checks['positive_sharpe'] = results['sharpe'] > 0.5

    # 5. Works out-of-sample
    oos_results = walk_forward_test(data, strategy)
    checks['oos_positive'] = np.mean([r['return'] for r in oos_results]) > 0

    # 6. Parameter stability
    param_test = test_parameter_stability(data, strategy, 'period', range(10, 50, 5))
    sharpe_std = np.std([r[1] for r in param_test])
    checks['parameter_stable'] = sharpe_std < 0.5

    # Print results
    print("\nStrategy Checklist:")
    print("-" * 40)
    for check, passed in checks.items():
        status = "✓" if passed else "✗"
        print(f"{status} {check}")

    all_passed = all(checks.values())
    print("-" * 40)
    print(f"Overall: {'PASS' if all_passed else 'FAIL'}")

    return checks
```

## ⚠️ Common Mistakes

### 1. Data Snooping

**Problem**: Testing many strategies on same data
**Solution**: Use separate validation set

### 2. Survivorship Bias

**Problem**: Only testing on stocks that still exist
**Solution**: Include delisted stocks in backtest

### 3. Look-Ahead Bias

**Problem**: Using future information
**Solution**: Careful data handling, shift indicators

```python
# BAD: Look-ahead bias
df['Signal'] = df['Close'] > df['Close'].rolling(20).mean()

# GOOD: Proper shift
df['MA'] = df['Close'].rolling(20).mean()
df['Signal'] = df['Close'].shift(1) > df['MA'].shift(1)
```

### 4. Ignoring Costs

**Problem**: Not accounting for commissions and slippage
**Solution**: Include realistic transaction costs

```python
def apply_transaction_costs(trades, commission=0.001, slippage=0.0005):
    """
    Apply realistic costs to backtest
    """
    for trade in trades:
        # Commission (0.1%)
        trade['pnl'] -= abs(trade['value']) * commission

        # Slippage (0.05%)
        trade['pnl'] -= abs(trade['value']) * slippage

    return trades
```

## 🎓 Check Your Understanding

1. What makes a strategy robust?
2. Why is simplicity important?
3. What is overfitting?
4. How do you test for parameter stability?
5. What is look-ahead bias?

## 💻 Exercise

```python
# Evaluate your strategy
evaluator = StrategyEvaluator(your_strategy)
metrics = evaluator.evaluate(data)
grade = evaluator.grade_strategy(metrics)

print(f"Strategy Grade: {grade}")

# Run checklist
checks = strategy_checklist(your_strategy, data)
```

## 📝 Exercise 4.6

Create: `exercises/module-04/exercise-4.6-design.md`

1. Design a strategy from scratch
2. Document economic rationale
3. Test robustness across parameters
4. Perform walk-forward analysis
5. Complete strategy checklist
6. Grade your strategy

## 📚 Resources

- [Pardo: Design, Testing, and Optimization of Trading Systems](https://www.amazon.com/Design-Testing-Optimization-Trading-Systems/dp/0471554464)
- [Aronson: Evidence-Based Technical Analysis](https://www.amazon.com/Evidence-Based-Technical-Analysis-Scientific-Statistical/dp/0470008741)

## ✅ Solutions

1. **Robust strategy**: Works across time periods, markets, parameters; has economic rationale; simple design
2. **Simplicity important**: Fewer parameters = less overfitting, easier to understand and debug, more likely to work live
3. **Overfitting**: Optimizing strategy to past data so well it doesn't work on new data; curve-fitting
4. **Parameter stability**: Test strategy with range of parameter values; if performance consistent, parameters are stable
5. **Look-ahead bias**: Using information not available at time of trade; causes unrealistic backtest results

---

**Completed Module 4?** ✓ Move to [Hands-On Project: Build Your Strategy](project-build-strategy.md)
