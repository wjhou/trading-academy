# Lesson 4.1: Trend Following - Riding the Wave

**Module**: 4 - Trading Strategies
**Estimated Time**: 60 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand trend following philosophy and principles
- Learn classic trend following strategies
- Implement moving average crossover systems
- Apply breakout trend following methods
- Manage risk in trend following trades

## 📖 What is Trend Following?

**Trend Following** is a trading strategy that attempts to capture gains by riding established market trends.

### Core Philosophy

> "The trend is your friend until it ends"

**Key Principles**:
- Markets trend more often than they reverse
- Trends persist longer than expected
- Cut losses short, let winners run
- Don't predict, react to price action

### Why Trend Following Works

1. **Market Psychology**: Herding behavior extends trends
2. **Momentum**: Moving objects tend to stay in motion
3. **Information Flow**: News takes time to be fully priced in
4. **Risk Management**: Small losses, large gains

## 📊 Types of Trend Following Strategies

### 1. Moving Average Crossover

**Concept**: Trade when fast MA crosses slow MA

**Classic Setup**:
- Fast MA: 50-day
- Slow MA: 200-day
- Buy: Golden Cross (50 > 200)
- Sell: Death Cross (50 < 200)

```python
def ma_crossover_strategy(df, fast=50, slow=200):
    """
    Moving Average Crossover Strategy
    """
    df['MA_Fast'] = df['Close'].rolling(fast).mean()
    df['MA_Slow'] = df['Close'].rolling(slow).mean()

    # Generate signals
    df['Signal'] = 0
    df.loc[df['MA_Fast'] > df['MA_Slow'], 'Signal'] = 1  # Long
    df.loc[df['MA_Fast'] < df['MA_Slow'], 'Signal'] = -1  # Short

    # Detect crossovers
    df['Position'] = df['Signal'].diff()

    return df

# Example
import yfinance as yf
df = yf.Ticker("SPY").history(period="5y")
df = ma_crossover_strategy(df)

# Find recent crossovers
crossovers = df[df['Position'] != 0][['Close', 'MA_Fast', 'MA_Slow', 'Position']]
print(crossovers.tail())
```

**Pros**:
- Simple and objective
- Works in strong trends
- Easy to automate

**Cons**:
- Late entries/exits
- Whipsaws in sideways markets
- Gives back profits in reversals

### 2. Breakout Trend Following

**Concept**: Enter when price breaks to new highs/lows

**Donchian Channel Strategy**:
```python
def donchian_breakout(df, period=20):
    """
    Donchian Channel Breakout
    """
    # Calculate channels
    df['Upper'] = df['High'].rolling(period).max()
    df['Lower'] = df['Low'].rolling(period).min()
    df['Middle'] = (df['Upper'] + df['Lower']) / 2

    # Generate signals
    df['Signal'] = 0

    # Buy on upper channel breakout
    df.loc[df['Close'] > df['Upper'].shift(1), 'Signal'] = 1

    # Sell on lower channel breakout
    df.loc[df['Close'] < df['Lower'].shift(1), 'Signal'] = -1

    return df

# Example
df = donchian_breakout(df, period=20)
```

**Pros**:
- Catches trends early
- Clear entry signals
- Objective rules

**Cons**:
- False breakouts
- Requires discipline
- Can be choppy

### 3. Trend Following with Filters

**Concept**: Add filters to reduce false signals

**ADX Filter Strategy**:
```python
def trend_following_with_adx(df, ma_period=50, adx_period=14, adx_threshold=25):
    """
    Trend following with ADX filter
    """
    # Calculate MA
    df['MA'] = df['Close'].rolling(ma_period).mean()

    # Calculate ADX (simplified)
    df['TR'] = df[['High', 'Low', 'Close']].apply(
        lambda x: max(x['High'] - x['Low'],
                     abs(x['High'] - x['Close']),
                     abs(x['Low'] - x['Close'])), axis=1)

    df['ATR'] = df['TR'].rolling(adx_period).mean()

    # Directional movement
    df['Plus_DM'] = df['High'].diff()
    df['Minus_DM'] = -df['Low'].diff()

    df['Plus_DM'] = df['Plus_DM'].where(
        (df['Plus_DM'] > df['Minus_DM']) & (df['Plus_DM'] > 0), 0)
    df['Minus_DM'] = df['Minus_DM'].where(
        (df['Minus_DM'] > df['Plus_DM']) & (df['Minus_DM'] > 0), 0)

    df['Plus_DI'] = 100 * (df['Plus_DM'].rolling(adx_period).mean() / df['ATR'])
    df['Minus_DI'] = 100 * (df['Minus_DM'].rolling(adx_period).mean() / df['ATR'])

    df['DX'] = 100 * abs(df['Plus_DI'] - df['Minus_DI']) / (df['Plus_DI'] + df['Minus_DI'])
    df['ADX'] = df['DX'].rolling(adx_period).mean()

    # Generate signals only when ADX > threshold (trending market)
    df['Signal'] = 0
    df.loc[(df['Close'] > df['MA']) & (df['ADX'] > adx_threshold), 'Signal'] = 1
    df.loc[(df['Close'] < df['MA']) & (df['ADX'] > adx_threshold), 'Signal'] = -1

    return df
```

**Pros**:
- Filters out ranging markets
- Higher quality signals
- Better risk-adjusted returns

**Cons**:
- More complex
- Misses some trends
- Requires parameter tuning

## 🎯 Complete Trend Following System

### Entry Rules

```python
class TrendFollowingSystem:
    def __init__(self, fast_ma=50, slow_ma=200, atr_period=14):
        self.fast_ma = fast_ma
        self.slow_ma = slow_ma
        self.atr_period = atr_period

    def calculate_indicators(self, df):
        # Moving averages
        df['MA_Fast'] = df['Close'].rolling(self.fast_ma).mean()
        df['MA_Slow'] = df['Close'].rolling(self.slow_ma).mean()

        # ATR for stops
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(self.atr_period).mean()

        return df

    def generate_entry_signal(self, df):
        """
        Entry conditions
        """
        current = df.iloc[-1]
        previous = df.iloc[-2]

        # Long entry: Golden cross
        if (previous['MA_Fast'] <= previous['MA_Slow'] and
            current['MA_Fast'] > current['MA_Slow']):
            return "BUY"

        # Short entry: Death cross
        elif (previous['MA_Fast'] >= previous['MA_Slow'] and
              current['MA_Fast'] < current['MA_Slow']):
            return "SELL"

        return "HOLD"

    def calculate_position_size(self, df, account_size, risk_per_trade=0.02):
        """
        Position sizing based on ATR
        """
        current = df.iloc[-1]
        atr = current['ATR']
        price = current['Close']

        # Risk amount
        risk_amount = account_size * risk_per_trade

        # Stop distance (2 ATR)
        stop_distance = 2 * atr

        # Position size
        shares = int(risk_amount / stop_distance)

        return shares

    def calculate_stops(self, df, entry_price, direction):
        """
        Calculate stop loss and take profit
        """
        atr = df['ATR'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry_price - (2 * atr)
            take_profit = entry_price + (4 * atr)  # 2:1 reward:risk
        else:  # SHORT
            stop_loss = entry_price + (2 * atr)
            take_profit = entry_price - (4 * atr)

        return stop_loss, take_profit

    def trailing_stop(self, df, entry_price, direction, atr_multiplier=2):
        """
        Trailing stop based on ATR
        """
        current_price = df['Close'].iloc[-1]
        atr = df['ATR'].iloc[-1]

        if direction == "LONG":
            trailing_stop = current_price - (atr_multiplier * atr)
            return max(trailing_stop, entry_price - (2 * atr))  # Never worse than initial stop
        else:  # SHORT
            trailing_stop = current_price + (atr_multiplier * atr)
            return min(trailing_stop, entry_price + (2 * atr))
```

### Exit Rules

**Exit Conditions**:
1. **Stop Loss Hit**: 2 ATR from entry
2. **Trend Reversal**: MA crossover in opposite direction
3. **Trailing Stop**: Lock in profits as trend continues
4. **Time Stop**: Exit after X days if no progress

```python
def should_exit(self, df, position, entry_price, entry_date):
    """
    Exit logic
    """
    current = df.iloc[-1]
    days_in_trade = (current.name - entry_date).days

    if position == "LONG":
        # Stop loss
        stop_loss, _ = self.calculate_stops(df, entry_price, "LONG")
        if current['Close'] <= stop_loss:
            return True, "STOP_LOSS"

        # Trend reversal
        if current['MA_Fast'] < current['MA_Slow']:
            return True, "TREND_REVERSAL"

        # Time stop (30 days with no profit)
        if days_in_trade > 30 and current['Close'] <= entry_price:
            return True, "TIME_STOP"

    elif position == "SHORT":
        # Stop loss
        stop_loss, _ = self.calculate_stops(df, entry_price, "SHORT")
        if current['Close'] >= stop_loss:
            return True, "STOP_LOSS"

        # Trend reversal
        if current['MA_Fast'] > current['MA_Slow']:
            return True, "TREND_REVERSAL"

        # Time stop
        if days_in_trade > 30 and current['Close'] >= entry_price:
            return True, "TIME_STOP"

    return False, None
```

## 💰 Risk Management for Trend Following

### Position Sizing

**Fixed Fractional Method**:
```python
def fixed_fractional_sizing(account_size, risk_percent, entry_price, stop_loss):
    """
    Risk fixed percentage of account per trade
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)
    return shares

# Example
account = 100000
risk = 0.02  # 2% per trade
entry = 150
stop = 145

shares = fixed_fractional_sizing(account, risk, entry, stop)
print(f"Position size: {shares} shares")
print(f"Total position value: ${shares * entry:,.2f}")
print(f"Risk amount: ${shares * (entry - stop):,.2f}")
```

### Portfolio Allocation

**Diversification Rules**:
- Maximum 20% per position
- Maximum 5 correlated positions
- Keep 20% cash reserve

```python
def check_portfolio_limits(portfolio, new_position_value, total_portfolio_value):
    """
    Check if new position violates limits
    """
    # Check position size limit (20%)
    if new_position_value > total_portfolio_value * 0.20:
        return False, "Position too large"

    # Check number of positions
    if len(portfolio) >= 10:
        return False, "Too many positions"

    # Check cash reserve
    cash = total_portfolio_value - sum(p['value'] for p in portfolio.values())
    if cash < total_portfolio_value * 0.20:
        return False, "Insufficient cash reserve"

    return True, "OK"
```

## 📊 Backtesting Trend Following

```python
def backtest_trend_following(df, initial_capital=100000):
    """
    Backtest trend following strategy
    """
    system = TrendFollowingSystem()
    df = system.calculate_indicators(df)

    capital = initial_capital
    position = None
    entry_price = 0
    entry_date = None
    trades = []

    for i in range(system.slow_ma, len(df)):
        current_df = df.iloc[:i+1]
        current = current_df.iloc[-1]

        # Check for exit if in position
        if position:
            should_exit_trade, exit_reason = system.should_exit(
                current_df, position, entry_price, entry_date)

            if should_exit_trade:
                # Calculate P&L
                if position == "LONG":
                    pnl = (current['Close'] - entry_price) * shares
                else:  # SHORT
                    pnl = (entry_price - current['Close']) * shares

                capital += pnl

                trades.append({
                    'entry_date': entry_date,
                    'exit_date': current.name,
                    'direction': position,
                    'entry_price': entry_price,
                    'exit_price': current['Close'],
                    'shares': shares,
                    'pnl': pnl,
                    'exit_reason': exit_reason
                })

                position = None

        # Check for entry if not in position
        if not position:
            signal = system.generate_entry_signal(current_df)

            if signal in ["BUY", "SELL"]:
                position = "LONG" if signal == "BUY" else "SHORT"
                entry_price = current['Close']
                entry_date = current.name
                shares = system.calculate_position_size(current_df, capital)

    # Calculate metrics
    total_trades = len(trades)
    winning_trades = len([t for t in trades if t['pnl'] > 0])
    win_rate = winning_trades / total_trades if total_trades > 0 else 0

    total_pnl = sum(t['pnl'] for t in trades)
    final_capital = capital
    total_return = (final_capital - initial_capital) / initial_capital

    return {
        'trades': trades,
        'total_trades': total_trades,
        'win_rate': win_rate,
        'total_pnl': total_pnl,
        'final_capital': final_capital,
        'total_return': total_return
    }

# Example
results = backtest_trend_following(df)
print(f"Total Trades: {results['total_trades']}")
print(f"Win Rate: {results['win_rate']:.2%}")
print(f"Total Return: {results['total_return']:.2%}")
```

## ⚠️ Common Mistakes

1. **Exiting Too Early**: Let winners run
2. **Not Using Stops**: Protect capital
3. **Trading Against Trend**: Wait for confirmation
4. **Over-Trading**: Be patient for setups
5. **Ignoring Risk Management**: Size positions properly

## 🎓 Check Your Understanding

1. What is the core principle of trend following?
2. What is a golden cross?
3. How do you calculate position size using ATR?
4. When should you exit a trend following trade?
5. Why use ADX as a filter?

## 💻 Hands-On Exercise

Implement and test a trend following system:

```python
# Your task: Complete this system
system = TrendFollowingSystem(fast_ma=50, slow_ma=200)

# Test on multiple stocks
tickers = ["SPY", "QQQ", "IWM"]
for ticker in tickers:
    df = yf.Ticker(ticker).history(period="5y")
    results = backtest_trend_following(df)
    print(f"\n{ticker} Results:")
    print(f"Win Rate: {results['win_rate']:.2%}")
    print(f"Total Return: {results['total_return']:.2%}")
```

## 📝 Exercise 4.1

Create: `exercises/module-04/exercise-4.1-trend-following.md`

1. Implement a complete trend following system
2. Backtest on 5 different stocks
3. Compare different MA periods (20/50, 50/200, 100/200)
4. Analyze which markets work best
5. Document your findings

## 📚 Resources

- [Investopedia: Trend Following](https://www.investopedia.com/articles/trading/06/trendtrading.asp)
- [Covel: Trend Following](https://www.trendfollowing.com/)
- [Turtle Trading Rules](https://www.tradingblox.com/originalturtles/originalturtlerules.htm)

## ✅ Solutions

1. **Core principle**: Follow established trends, don't predict; cut losses short, let winners run
2. **Golden cross**: When fast MA (50-day) crosses above slow MA (200-day); bullish signal
3. **Position size with ATR**: Risk amount / (ATR × multiplier); ensures consistent risk per trade
4. **Exit conditions**: Stop loss hit, trend reversal (MA crossover), trailing stop, or time stop
5. **ADX filter**: Measures trend strength; only trade when ADX > 25 to avoid ranging markets

---

**Next**: [Lesson 4.2: Mean Reversion](lesson-02-mean-reversion.md)
