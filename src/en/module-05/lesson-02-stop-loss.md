# Lesson 5.2: Stop-Loss Strategies - Protecting Your Capital

**Module**: 5 - Risk Management
**Estimated Time**: 55 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand different types of stop losses
- Learn when and where to place stops
- Implement trailing stops
- Avoid common stop-loss mistakes
- Master stop-loss psychology

## 📖 What is a Stop Loss?

**Stop Loss** is a predetermined price level at which you exit a losing trade to limit losses.

### Why Stop Losses Are Essential

> "The first loss is the best loss"

**Without stops**:
- Small loss becomes big loss
- Emotional decision-making
- Account blow-up risk
- No risk management

**With stops**:
- Limited, known risk
- Objective exits
- Capital preservation
- Peace of mind

## 📊 Types of Stop Losses

### 1. Fixed Dollar/Percentage Stop

**Concept**: Exit when loss reaches fixed amount

```python
def fixed_stop_loss(entry_price, stop_percent, direction='LONG'):
    """
    Calculate stop loss at fixed percentage from entry

    Common: 2-5% for stocks, 1-2% for volatile assets
    """
    if direction == 'LONG':
        stop = entry_price * (1 - stop_percent)
    else:  # SHORT
        stop = entry_price * (1 + stop_percent)

    return stop

# Example
entry = 150
stop_pct = 0.02  # 2%

stop = fixed_stop_loss(entry, stop_pct, 'LONG')
print(f"Entry: ${entry}")
print(f"Stop: ${stop:.2f}")
print(f"Risk: ${entry - stop:.2f} ({stop_pct:.1%})")
```

**Pros**: Simple, consistent
**Cons**: Ignores market structure, may be too tight/wide

### 2. Support/Resistance Stop

**Concept**: Place stop beyond key S/R levels

```python
def support_resistance_stop(entry_price, support_level, buffer=0.5, direction='LONG'):
    """
    Place stop below support (or above resistance for shorts)

    buffer: percentage buffer beyond S/R
    """
    if direction == 'LONG':
        stop = support_level * (1 - buffer/100)
    else:  # SHORT
        stop = support_level * (1 + buffer/100)

    return stop

# Example
entry = 150
support = 145

stop = support_resistance_stop(entry, support, buffer=0.5)
print(f"Entry: ${entry}")
print(f"Support: ${support}")
print(f"Stop: ${stop:.2f} (0.5% below support)")
```

**Pros**: Respects market structure, logical placement
**Cons**: May result in large risk if S/R far from entry

### 3. ATR-Based Stop

**Concept**: Use Average True Range for volatility-adjusted stops

```python
def atr_stop_loss(entry_price, atr, multiplier=2, direction='LONG'):
    """
    Calculate stop based on ATR

    multiplier: 1.5-3x ATR typical
        1.5x = Tight (more stops)
        2.0x = Standard
        3.0x = Wide (fewer stops)
    """
    if direction == 'LONG':
        stop = entry_price - (atr * multiplier)
    else:  # SHORT
        stop = entry_price + (atr * multiplier)

    return stop

# Example
entry = 150
atr = 3.5

for mult in [1.5, 2.0, 3.0]:
    stop = atr_stop_loss(entry, atr, mult)
    risk = entry - stop
    print(f"{mult}x ATR: Stop ${stop:.2f}, Risk ${risk:.2f}")
```

**Pros**: Adapts to volatility, consistent across stocks
**Cons**: Requires ATR calculation

### 4. Chandelier Stop

**Concept**: Trailing stop based on highest high minus ATR

```python
def chandelier_stop(df, atr_period=14, atr_multiplier=3):
    """
    Chandelier Exit (trailing stop)

    Stop = Highest High - (ATR × Multiplier)
    """
    # Calculate ATR
    df['TR'] = df[['High', 'Low', 'Close']].apply(
        lambda x: max(x['High'] - x['Low'],
                     abs(x['High'] - x['Close']),
                     abs(x['Low'] - x['Close'])), axis=1)
    df['ATR'] = df['TR'].rolling(atr_period).mean()

    # Calculate highest high over period
    df['Highest_High'] = df['High'].rolling(atr_period).max()

    # Chandelier stop
    df['Chandelier_Stop'] = df['Highest_High'] - (df['ATR'] * atr_multiplier)

    return df

# Example
import yfinance as yf
df = yf.Ticker("AAPL").history(period="3mo")
df = chandelier_stop(df)

print(df[['Close', 'Chandelier_Stop']].tail())
```

**Pros**: Trails price, adapts to volatility
**Cons**: Can be whipsawed in choppy markets

### 5. Time-Based Stop

**Concept**: Exit after fixed time period regardless of price

```python
def time_stop(entry_date, current_date, max_days=30):
    """
    Exit if trade hasn't worked out in X days
    """
    days_in_trade = (current_date - entry_date).days

    if days_in_trade >= max_days:
        return True, "TIME_STOP"

    return False, None

# Example
from datetime import datetime, timedelta

entry = datetime(2024, 1, 1)
current = datetime(2024, 2, 5)

should_exit, reason = time_stop(entry, current, max_days=30)
print(f"Days in trade: {(current - entry).days}")
print(f"Exit: {should_exit}, Reason: {reason}")
```

**Pros**: Frees capital from dead trades
**Cons**: May exit before trade works

## 🎯 Trailing Stops

### 1. Percentage Trailing Stop

```python
class PercentageTrailingStop:
    """
    Trail stop by fixed percentage from highest price
    """
    def __init__(self, trail_percent=0.05):
        self.trail_percent = trail_percent
        self.highest_price = 0
        self.stop_price = 0

    def update(self, current_price, entry_price):
        """
        Update trailing stop
        """
        # Initialize on first call
        if self.highest_price == 0:
            self.highest_price = entry_price
            self.stop_price = entry_price * (1 - self.trail_percent)

        # Update highest price
        if current_price > self.highest_price:
            self.highest_price = current_price
            new_stop = current_price * (1 - self.trail_percent)

            # Only move stop up, never down
            self.stop_price = max(self.stop_price, new_stop)

        return self.stop_price

# Example
trail_stop = PercentageTrailingStop(trail_percent=0.05)  # 5% trail

prices = [150, 155, 160, 158, 165, 162]
entry = 150

for price in prices:
    stop = trail_stop.update(price, entry)
    print(f"Price: ${price}, Stop: ${stop:.2f}, Profit: ${price - entry:.2f}")
```

### 2. ATR Trailing Stop

```python
class ATRTrailingStop:
    """
    Trail stop using ATR
    """
    def __init__(self, atr_multiplier=2):
        self.atr_multiplier = atr_multiplier
        self.stop_price = 0

    def update(self, current_price, atr, entry_price):
        """
        Update ATR-based trailing stop
        """
        # Calculate new stop
        new_stop = current_price - (atr * self.atr_multiplier)

        # Initialize or update
        if self.stop_price == 0:
            self.stop_price = entry_price - (atr * self.atr_multiplier)
        else:
            # Only move stop up
            self.stop_price = max(self.stop_price, new_stop)

        return self.stop_price
```

### 3. Parabolic SAR

```python
def parabolic_sar(df, af_start=0.02, af_increment=0.02, af_max=0.2):
    """
    Parabolic SAR trailing stop

    af = acceleration factor
    """
    df['SAR'] = df['Close'].iloc[0]
    df['EP'] = df['High'].iloc[0]  # Extreme Point
    df['AF'] = af_start
    trend = 1  # 1 = uptrend, -1 = downtrend

    for i in range(1, len(df)):
        # Calculate SAR
        sar = df['SAR'].iloc[i-1] + df['AF'].iloc[i-1] * (df['EP'].iloc[i-1] - df['SAR'].iloc[i-1])

        # Check for reversal
        if trend == 1:  # Uptrend
            if df['Low'].iloc[i] < sar:
                # Reverse to downtrend
                trend = -1
                sar = df['EP'].iloc[i-1]
                df.loc[df.index[i], 'EP'] = df['Low'].iloc[i]
                df.loc[df.index[i], 'AF'] = af_start
            else:
                # Continue uptrend
                if df['High'].iloc[i] > df['EP'].iloc[i-1]:
                    df.loc[df.index[i], 'EP'] = df['High'].iloc[i]
                    df.loc[df.index[i], 'AF'] = min(df['AF'].iloc[i-1] + af_increment, af_max)
                else:
                    df.loc[df.index[i], 'EP'] = df['EP'].iloc[i-1]
                    df.loc[df.index[i], 'AF'] = df['AF'].iloc[i-1]

        df.loc[df.index[i], 'SAR'] = sar

    return df
```

## 💰 Stop-Loss Placement Rules

### Rule 1: Never Move Stop Against You

```python
def validate_stop_adjustment(old_stop, new_stop, direction='LONG'):
    """
    Ensure stop only moves in favorable direction
    """
    if direction == 'LONG':
        if new_stop < old_stop:
            print("❌ Cannot move stop down in long position")
            return False
    else:  # SHORT
        if new_stop > old_stop:
            print("❌ Cannot move stop up in short position")
            return False

    return True
```

### Rule 2: Give Trade Room to Breathe

```python
def check_stop_distance(entry, stop, min_distance_pct=0.02):
    """
    Ensure stop isn't too tight
    """
    distance_pct = abs(entry - stop) / entry

    if distance_pct < min_distance_pct:
        print(f"⚠️  Stop too tight: {distance_pct:.2%} < {min_distance_pct:.2%}")
        return False

    return True
```

### Rule 3: Consider Volatility

```python
def volatility_adjusted_stop(entry, atr, min_atr_mult=1.5):
    """
    Ensure stop accounts for normal volatility
    """
    min_stop_distance = atr * min_atr_mult
    stop = entry - min_stop_distance

    return stop
```

## 📊 Complete Stop-Loss System

```python
class StopLossManager:
    """
    Comprehensive stop-loss management
    """
    def __init__(self, method='atr', **params):
        self.method = method
        self.params = params
        self.stops = {}  # ticker -> stop_price

    def calculate_initial_stop(self, ticker, entry_price, atr=None, support=None):
        """
        Calculate initial stop loss
        """
        if self.method == 'atr':
            if atr is None:
                raise ValueError("ATR required")
            multiplier = self.params.get('atr_multiplier', 2.0)
            stop = atr_stop_loss(entry_price, atr, multiplier)

        elif self.method == 'support':
            if support is None:
                raise ValueError("Support level required")
            buffer = self.params.get('buffer', 0.5)
            stop = support_resistance_stop(entry_price, support, buffer)

        elif self.method == 'fixed':
            stop_pct = self.params.get('stop_percent', 0.02)
            stop = fixed_stop_loss(entry_price, stop_pct)

        else:
            raise ValueError(f"Unknown method: {self.method}")

        self.stops[ticker] = stop
        return stop

    def update_trailing_stop(self, ticker, current_price, atr=None):
        """
        Update trailing stop
        """
        if ticker not in self.stops:
            raise ValueError(f"No stop set for {ticker}")

        old_stop = self.stops[ticker]

        if self.method == 'atr':
            multiplier = self.params.get('atr_multiplier', 2.0)
            new_stop = current_price - (atr * multiplier)
        else:
            trail_pct = self.params.get('trail_percent', 0.05)
            new_stop = current_price * (1 - trail_pct)

        # Only move stop up
        self.stops[ticker] = max(old_stop, new_stop)

        return self.stops[ticker]

    def check_stop_hit(self, ticker, current_price):
        """
        Check if stop loss hit
        """
        if ticker not in self.stops:
            return False

        return current_price <= self.stops[ticker]

# Example usage
manager = StopLossManager(method='atr', atr_multiplier=2.0)

# Set initial stop
entry = 150
atr = 3.5
stop = manager.calculate_initial_stop('AAPL', entry, atr=atr)
print(f"Initial stop: ${stop:.2f}")

# Update as price moves
prices = [152, 155, 158, 156]
for price in prices:
    new_stop = manager.update_trailing_stop('AAPL', price, atr=atr)
    hit = manager.check_stop_hit('AAPL', price)
    print(f"Price: ${price}, Stop: ${new_stop:.2f}, Hit: {hit}")
```

## ⚠️ Common Mistakes

1. **No Stop Loss**: "I'll just wait it out"
2. **Moving Stop Away**: Turning small loss into big loss
3. **Stop Too Tight**: Getting stopped out by noise
4. **Stop at Round Numbers**: Where everyone else's stops are
5. **Mental Stops**: Not actually placing the order

## 🎓 Check Your Understanding

1. Why are stop losses essential?
2. What's the difference between fixed and ATR stops?
3. How do trailing stops work?
4. Where should you NOT place stops?
5. What is a time-based stop?

## 💻 Exercise

```python
# Implement stop-loss system
manager = StopLossManager(method='atr', atr_multiplier=2.0)

# Simulate trade
entry = 150
atr = 3.5
stop = manager.calculate_initial_stop('AAPL', entry, atr=atr)

# Simulate price movement
import numpy as np
prices = np.random.normal(155, 5, 20)  # Random prices

for i, price in enumerate(prices):
    stop = manager.update_trailing_stop('AAPL', price, atr=atr)
    hit = manager.check_stop_hit('AAPL', price)

    if hit:
        print(f"Day {i}: STOPPED OUT at ${price:.2f}")
        break
    else:
        profit = price - entry
        print(f"Day {i}: Price ${price:.2f}, Stop ${stop:.2f}, P&L ${profit:.2f}")
```

## 📝 Exercise 5.2

Create: `exercises/module-05/exercise-5.2-stop-loss.md`

1. Implement all stop-loss types
2. Backtest each method on same stock
3. Compare stop-out rates and profitability
4. Test different ATR multipliers (1.5x, 2x, 3x)
5. Document optimal stop strategy

## 📚 Resources

- [Investopedia: Stop-Loss Orders](https://www.investopedia.com/terms/s/stop-lossorder.asp)
- [Elder: Come Into My Trading Room](https://www.amazon.com/Come-Into-My-Trading-Room/dp/0471225347)

## ✅ Solutions

1. **Why essential**: Limit losses, remove emotion, preserve capital, enable consistent risk management

2. **Fixed vs ATR**: Fixed uses percentage from entry (same for all stocks); ATR adjusts for volatility (volatile stocks get wider stops)

3. **Trailing stops**: Move stop in profitable direction as price moves favorably; locks in profits; never moves against you

4. **Where NOT to place**: At round numbers (100, 150, 200), at obvious support/resistance (everyone's stops there), too close to entry (noise stops you out)

5. **Time-based stop**: Exit after X days regardless of price; frees capital from stagnant trades; prevents holding losers too long

---

**Next**: [Lesson 5.3: Risk-Reward Ratios](lesson-03-risk-reward.md)
