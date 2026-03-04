# Lesson 5.5: Drawdown Management - Surviving the Tough Times

**Module**: 5 - Risk Management
**Estimated Time**: 40 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand drawdowns and their impact
- Calculate and monitor drawdowns
- Implement drawdown limits
- Recover from drawdowns effectively
- Build psychological resilience

## 📖 What is a Drawdown?

**Drawdown** is the peak-to-trough decline in account value.

```
Peak: $100,000
Trough: $85,000
Drawdown: -15% or -$15,000
```

### Why Drawdowns Matter

**Recovery Math**:
```
-10% loss requires +11% gain to recover
-20% loss requires +25% gain to recover
-30% loss requires +43% gain to recover
-50% loss requires +100% gain to recover
```

## 📊 Calculating Drawdowns

```python
def calculate_drawdown(equity_curve):
    """
    Calculate drawdown series
    """
    import pandas as pd
    import numpy as np

    # Convert to Series if needed
    if isinstance(equity_curve, list):
        equity_curve = pd.Series(equity_curve)

    # Calculate running maximum
    running_max = equity_curve.expanding().max()

    # Calculate drawdown
    drawdown = (equity_curve - running_max) / running_max

    # Calculate metrics
    max_dd = drawdown.min()
    max_dd_duration = calculate_dd_duration(drawdown)

    return {
        'drawdown_series': drawdown,
        'max_drawdown': max_dd,
        'max_dd_duration': max_dd_duration,
        'current_drawdown': drawdown.iloc[-1]
    }

def calculate_dd_duration(drawdown_series):
    """
    Calculate longest drawdown duration
    """
    in_drawdown = drawdown_series < 0
    dd_periods = []
    current_period = 0

    for is_dd in in_drawdown:
        if is_dd:
            current_period += 1
        else:
            if current_period > 0:
                dd_periods.append(current_period)
            current_period = 0

    return max(dd_periods) if dd_periods else 0

# Example
equity = [100000, 102000, 98000, 95000, 97000, 103000, 101000]
dd_stats = calculate_drawdown(equity)

print(f"Max Drawdown: {dd_stats['max_drawdown']:.2%}")
print(f"Current Drawdown: {dd_stats['current_drawdown']:.2%}")
print(f"Max DD Duration: {dd_stats['max_dd_duration']} periods")
```

## 🎯 Drawdown Limits

```python
class DrawdownManager:
    """
    Monitor and manage drawdowns
    """
    def __init__(self, initial_capital, max_dd_pct=0.20, daily_limit_pct=0.03):
        self.initial_capital = initial_capital
        self.peak_capital = initial_capital
        self.current_capital = initial_capital

        # Limits
        self.max_dd_pct = max_dd_pct
        self.daily_limit_pct = daily_limit_pct

        # Tracking
        self.equity_curve = [initial_capital]
        self.daily_returns = []

    def update(self, new_capital):
        """
        Update capital and check limits
        """
        # Calculate daily return
        daily_return = (new_capital - self.current_capital) / self.current_capital
        self.daily_returns.append(daily_return)

        # Update capital
        self.current_capital = new_capital
        self.equity_curve.append(new_capital)

        # Update peak
        if new_capital > self.peak_capital:
            self.peak_capital = new_capital

        # Check limits
        warnings = []

        # Check drawdown limit
        current_dd = (self.current_capital - self.peak_capital) / self.peak_capital
        if current_dd < -self.max_dd_pct:
            warnings.append(f"⚠️  Max drawdown exceeded: {current_dd:.2%}")

        # Check daily limit
        if daily_return < -self.daily_limit_pct:
            warnings.append(f"⚠️  Daily loss limit hit: {daily_return:.2%}")

        return warnings

    def should_stop_trading(self):
        """
        Determine if should stop trading
        """
        current_dd = (self.current_capital - self.peak_capital) / self.peak_capital

        if current_dd < -self.max_dd_pct:
            return True, "Maximum drawdown exceeded"

        # Check for consecutive losing days
        if len(self.daily_returns) >= 5:
            recent_returns = self.daily_returns[-5:]
            if all(r < 0 for r in recent_returns):
                return True, "5 consecutive losing days"

        return False, None

    def get_stats(self):
        """
        Get drawdown statistics
        """
        dd_stats = calculate_drawdown(self.equity_curve)

        return {
            'current_capital': self.current_capital,
            'peak_capital': self.peak_capital,
            'current_dd': (self.current_capital - self.peak_capital) / self.peak_capital,
            'max_dd': dd_stats['max_drawdown'],
            'total_return': (self.current_capital - self.initial_capital) / self.initial_capital
        }

# Example
manager = DrawdownManager(initial_capital=100000, max_dd_pct=0.20)

# Simulate trading
daily_capitals = [100000, 98000, 96000, 97000, 95000, 93000, 94000]

for capital in daily_capitals:
    warnings = manager.update(capital)

    if warnings:
        for warning in warnings:
            print(warning)

    should_stop, reason = manager.should_stop_trading()
    if should_stop:
        print(f"🛑 STOP TRADING: {reason}")
        break

stats = manager.get_stats()
print(f"\nStats:")
for key, value in stats.items():
    if 'dd' in key or 'return' in key:
        print(f"  {key}: {value:.2%}")
    else:
        print(f"  {key}: ${value:,.0f}")
```

## 💰 Recovery Strategies

### 1. Reduce Position Size

```python
def adjust_size_for_drawdown(base_size, current_dd, max_dd=0.20):
    """
    Reduce position size during drawdown

    At 10% DD: 75% size
    At 15% DD: 50% size
    At 20% DD: 25% size
    """
    dd_pct = abs(current_dd)
    reduction_factor = 1 - (dd_pct / max_dd)
    adjusted_size = base_size * max(reduction_factor, 0.25)  # Min 25%

    return int(adjusted_size)

# Example
base_size = 100
for dd in [-0.05, -0.10, -0.15, -0.20]:
    adjusted = adjust_size_for_drawdown(base_size, dd)
    print(f"DD {dd:.0%}: Size {adjusted} shares ({adjusted/base_size:.0%})")
```

### 2. Take a Break

```python
def should_take_break(consecutive_losses, max_losses=5):
    """
    Take break after consecutive losses
    """
    if consecutive_losses >= max_losses:
        return True, f"Take 1-2 week break after {consecutive_losses} losses"

    return False, None
```

### 3. Review and Adjust

```python
def drawdown_review_checklist():
    """
    Questions to ask during drawdown
    """
    questions = [
        "Is my strategy still valid in current market conditions?",
        "Am I following my rules or deviating?",
        "Have I increased position sizes inappropriately?",
        "Am I overtrading or revenge trading?",
        "Do I need to adjust parameters?",
        "Should I reduce risk per trade?",
        "Am I emotionally compromised?"
    ]

    return questions
```

## 📊 Preventing Large Drawdowns

```python
class DrawdownPrevention:
    """
    Proactive drawdown prevention
    """
    def __init__(self):
        self.rules = {
            'max_risk_per_trade': 0.02,
            'max_portfolio_risk': 0.06,
            'max_correlated_positions': 3,
            'max_position_size': 0.15,
            'daily_loss_limit': 0.03,
            'weekly_loss_limit': 0.08
        }

    def check_all_rules(self, portfolio_state):
        """
        Check all risk rules
        """
        violations = []

        # Check each rule
        for rule, limit in self.rules.items():
            if rule in portfolio_state:
                if portfolio_state[rule] > limit:
                    violations.append(f"{rule}: {portfolio_state[rule]:.2%} > {limit:.2%}")

        return violations

# Example
prevention = DrawdownPrevention()

portfolio = {
    'max_risk_per_trade': 0.025,  # Violation
    'max_portfolio_risk': 0.05,
    'daily_loss_limit': 0.04      # Violation
}

violations = prevention.check_all_rules(portfolio)
if violations:
    print("⚠️  Rule Violations:")
    for v in violations:
        print(f"  - {v}")
```

## ⚠️ Psychological Impact

**Emotional Stages**:
1. **Denial**: "It's just temporary"
2. **Anger**: "This is unfair"
3. **Bargaining**: "Just one more trade"
4. **Depression**: "I can't do this"
5. **Acceptance**: "Time to adjust"

**Coping Strategies**:
- Follow predetermined rules
- Reduce size, don't increase
- Take breaks
- Review objectively
- Seek support

## 🎓 Check Your Understanding

1. What is a drawdown?
2. Why is -50% drawdown so dangerous?
3. What should you do during a drawdown?
4. How do you prevent large drawdowns?
5. When should you stop trading?

## 💻 Exercise

```python
# Simulate drawdown management
manager = DrawdownManager(100000, max_dd_pct=0.15)

# Simulate losing streak
import numpy as np
np.random.seed(42)

for day in range(30):
    # Random daily return (-3% to +3%)
    daily_return = np.random.normal(-0.005, 0.02)
    new_capital = manager.current_capital * (1 + daily_return)

    warnings = manager.update(new_capital)

    if warnings:
        print(f"Day {day}: {warnings}")

    should_stop, reason = manager.should_stop_trading()
    if should_stop:
        print(f"Day {day}: STOPPED - {reason}")
        break

print(f"\nFinal Stats: {manager.get_stats()}")
```

## 📝 Exercise 5.5

Create: `exercises/module-05/exercise-5.5-drawdown.md`

1. Calculate max drawdown for your past trades
2. Implement drawdown monitoring system
3. Test position size reduction during DD
4. Create recovery plan
5. Document lessons learned

## 📚 Resources

- [Investopedia: Drawdown](https://www.investopedia.com/terms/d/drawdown.asp)
- [Maximum Drawdown](https://www.investopedia.com/terms/m/maximum-drawdown-mdd.asp)

## ✅ Solutions

1. **Drawdown**: Peak-to-trough decline in account value; measures largest loss from highest point

2. **-50% dangerous**: Requires +100% gain to recover; psychologically devastating; may force account closure

3. **During drawdown**: Reduce position sizes, review strategy, take break if needed, don't revenge trade, follow rules strictly

4. **Prevent large DD**: Limit risk per trade (2%), limit total portfolio risk (6%), use stops, diversify, have daily/weekly loss limits

5. **Stop trading when**: Hit max drawdown limit (e.g., -20%), 5+ consecutive losses, emotionally compromised, strategy clearly broken

---

**Next**: [Lesson 5.6: Kelly Criterion](lesson-06-kelly.md)
