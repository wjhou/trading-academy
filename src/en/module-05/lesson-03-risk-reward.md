# Lesson 5.3: Risk-Reward Ratios - The Math of Profitable Trading

**Module**: 5 - Risk Management
**Estimated Time**: 45 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand risk-reward ratios
- Calculate minimum win rates needed
- Set profit targets effectively
- Apply R-multiples to trading
- Build positive expectancy systems

## 📖 What is Risk-Reward Ratio?

**Risk-Reward Ratio** compares potential profit to potential loss.

```
Risk-Reward Ratio = Potential Profit / Potential Loss

Example:
Entry: $100
Stop: $95 (risk $5)
Target: $110 (reward $10)
R:R = $10 / $5 = 2:1
```

### Why It Matters

> "You can be right 40% of the time and still make money with good risk-reward"

## 📊 Calculating Risk-Reward

```python
def calculate_risk_reward(entry, stop, target):
    """
    Calculate risk-reward ratio
    """
    risk = abs(entry - stop)
    reward = abs(target - entry)
    ratio = reward / risk

    return {
        'risk': risk,
        'reward': reward,
        'ratio': ratio,
        'ratio_str': f"{ratio:.1f}:1"
    }

# Example
entry = 150
stop = 145
target = 160

rr = calculate_risk_reward(entry, stop, target)
print(f"Risk: ${rr['risk']}")
print(f"Reward: ${rr['reward']}")
print(f"Ratio: {rr['ratio_str']}")
```

## 🎯 Minimum Win Rate Required

```python
def minimum_win_rate(risk_reward_ratio):
    """
    Calculate breakeven win rate

    Formula: Win Rate = 1 / (1 + R:R)
    """
    min_wr = 1 / (1 + risk_reward_ratio)
    return min_wr

# Examples
for rr in [1, 1.5, 2, 3]:
    min_wr = minimum_win_rate(rr)
    print(f"{rr}:1 R:R requires {min_wr:.1%} win rate to break even")
```

**Output**:
```
1:1 R:R requires 50.0% win rate
1.5:1 R:R requires 40.0% win rate
2:1 R:R requires 33.3% win rate
3:1 R:R requires 25.0% win rate
```

## 💰 Expectancy Formula

```python
def calculate_expectancy(win_rate, avg_win, avg_loss):
    """
    Calculate system expectancy

    Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
    """
    loss_rate = 1 - win_rate
    expectancy = (win_rate * avg_win) - (loss_rate * abs(avg_loss))

    return expectancy

# Example
win_rate = 0.45  # 45%
avg_win = 1000
avg_loss = -500

exp = calculate_expectancy(win_rate, avg_win, avg_loss)
print(f"Expectancy: ${exp:.2f} per trade")

if exp > 0:
    print("✓ Positive expectancy system")
else:
    print("✗ Negative expectancy system")
```

## 🎯 Setting Profit Targets

### Method 1: Fixed R-Multiple

```python
def set_target_by_r_multiple(entry, stop, r_multiple=2):
    """
    Set target at R-multiple of risk

    Common: 2R (2:1), 3R (3:1)
    """
    risk = abs(entry - stop)
    target = entry + (risk * r_multiple)

    return target

# Example
entry = 150
stop = 145
target = set_target_by_r_multiple(entry, stop, r_multiple=2)
print(f"2R target: ${target}")
```

### Method 2: Support/Resistance

```python
def set_target_at_resistance(entry, stop, resistance):
    """
    Use next resistance as target
    """
    risk = abs(entry - stop)
    reward = abs(resistance - entry)
    rr_ratio = reward / risk

    if rr_ratio < 1.5:
        print(f"⚠️  Poor R:R ({rr_ratio:.1f}:1), consider skipping trade")

    return resistance, rr_ratio
```

### Method 3: ATR-Based

```python
def set_target_by_atr(entry, atr, atr_multiple=3):
    """
    Set target at ATR multiple from entry
    """
    target = entry + (atr * atr_multiple)
    return target
```

## 📊 R-Multiples

**R-Multiple** = Actual Profit or Loss / Initial Risk

```python
def calculate_r_multiple(entry, stop, exit_price):
    """
    Calculate R-multiple for closed trade
    """
    initial_risk = abs(entry - stop)
    actual_pnl = exit_price - entry
    r_multiple = actual_pnl / initial_risk

    return r_multiple

# Examples
entry = 150
stop = 145  # Risk = $5

exits = [160, 155, 152, 145, 140]

for exit_price in exits:
    r = calculate_r_multiple(entry, stop, exit_price)
    pnl = exit_price - entry
    print(f"Exit ${exit_price}: P&L ${pnl:+.0f}, R-multiple: {r:+.1f}R")
```

## 🎯 Complete Risk-Reward System

```python
class RiskRewardManager:
    """
    Manage risk-reward for trades
    """
    def __init__(self, min_rr_ratio=1.5):
        self.min_rr_ratio = min_rr_ratio
        self.trades = []

    def evaluate_trade(self, entry, stop, target):
        """
        Evaluate if trade meets R:R criteria
        """
        rr = calculate_risk_reward(entry, stop, target)

        if rr['ratio'] < self.min_rr_ratio:
            return False, f"R:R too low: {rr['ratio']:.1f}:1 < {self.min_rr_ratio}:1"

        return True, f"Good R:R: {rr['ratio']:.1f}:1"

    def record_trade(self, entry, stop, exit_price):
        """
        Record completed trade
        """
        r_mult = calculate_r_multiple(entry, stop, exit_price)
        self.trades.append(r_mult)

        return r_mult

    def calculate_system_expectancy(self):
        """
        Calculate overall system expectancy in R
        """
        if not self.trades:
            return 0

        avg_r = sum(self.trades) / len(self.trades)
        return avg_r

# Example
manager = RiskRewardManager(min_rr_ratio=2.0)

# Evaluate potential trade
entry = 150
stop = 145
target = 160

valid, msg = manager.evaluate_trade(entry, stop, target)
print(f"Trade valid: {valid}, {msg}")

# Record trades
exits = [160, 155, 145, 165, 140]
for exit_price in exits:
    r = manager.record_trade(entry, stop, exit_price)
    print(f"Trade closed at ${exit_price}: {r:+.1f}R")

# System expectancy
exp = manager.calculate_system_expectancy()
print(f"\nSystem expectancy: {exp:+.2f}R per trade")
```

## 📊 Scaling Out Strategy

```python
def scaling_out_plan(entry, stop, risk_reward_ratios=[1.5, 2.5, 3.5]):
    """
    Create scaling out plan with multiple targets
    """
    risk = abs(entry - stop)
    targets = []

    for rr in risk_reward_ratios:
        target = entry + (risk * rr)
        targets.append({
            'target': target,
            'rr_ratio': rr,
            'percent_to_sell': 33.3  # Sell 1/3 at each target
        })

    return targets

# Example
entry = 150
stop = 145

plan = scaling_out_plan(entry, stop)
print("Scaling Out Plan:")
for i, level in enumerate(plan, 1):
    print(f"Target {i}: ${level['target']:.2f} ({level['rr_ratio']}:1) - Sell {level['percent_to_sell']:.0f}%")
```

## ⚠️ Common Mistakes

1. **Chasing High R:R**: Unrealistic targets that never hit
2. **Ignoring Win Rate**: 5:1 R:R useless with 10% win rate
3. **Moving Targets**: Greed prevents taking profits
4. **No Minimum R:R**: Taking 1:1 or worse trades
5. **Forgetting Costs**: Not accounting for commissions/slippage

## 🎓 Check Your Understanding

1. What is a 2:1 risk-reward ratio?
2. What win rate is needed for 2:1 R:R to break even?
3. What is expectancy?
4. What is an R-multiple?
5. Why set minimum R:R requirements?

## 💻 Exercise

```python
# Analyze your trading system
trades = [
    {'entry': 100, 'stop': 95, 'exit': 110},  # Win
    {'entry': 150, 'stop': 145, 'exit': 145}, # Loss
    {'entry': 200, 'stop': 195, 'exit': 215}, # Win
    {'entry': 50, 'stop': 48, 'exit': 48},    # Loss
    {'entry': 75, 'stop': 72, 'exit': 84},    # Win
]

r_multiples = []
for trade in trades:
    r = calculate_r_multiple(trade['entry'], trade['stop'], trade['exit'])
    r_multiples.append(r)
    print(f"Trade: {r:+.1f}R")

avg_r = sum(r_multiples) / len(r_multiples)
print(f"\nAverage R: {avg_r:+.2f}R")
print(f"Expectancy: {'Positive' if avg_r > 0 else 'Negative'}")
```

## 📝 Exercise 5.3

Create: `exercises/module-05/exercise-5.3-risk-reward.md`

1. Calculate R:R for 10 historical trades
2. Determine your system's average R-multiple
3. Calculate minimum win rate needed
4. Test different R:R requirements (1.5:1, 2:1, 3:1)
5. Document optimal R:R for your strategy

## 📚 Resources

- [Van Tharp: Trade Your Way to Financial Freedom](https://www.amazon.com/Trade-Your-Way-Financial-Freedom/dp/007147871X)
- [Investopedia: Risk-Reward Ratio](https://www.investopedia.com/terms/r/riskrewardratio.asp)

## ✅ Solutions

1. **2:1 R:R**: For every $1 risked, target $2 profit; if risk $5, target $10 profit

2. **Win rate for 2:1**: 33.3% breakeven; above 33.3% = profitable system

3. **Expectancy**: Average amount won/lost per trade; (Win% × AvgWin) - (Loss% × AvgLoss)

4. **R-multiple**: Profit or loss expressed as multiple of initial risk; +2R = made 2× risk, -1R = lost full risk

5. **Minimum R:R**: Ensures favorable odds; filters low-quality setups; allows profitability with lower win rates; protects against small wins/big losses

---

**Next**: [Lesson 5.4: Portfolio Diversification](lesson-04-diversification.md)
