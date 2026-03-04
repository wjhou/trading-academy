# Lesson 4.3: Breakout Strategies - Catching New Trends

**Module**: 4 - Trading Strategies
**Estimated Time**: 50 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand breakout trading principles
- Identify valid breakout setups
- Implement range and pattern breakouts
- Filter false breakouts
- Manage breakout trades effectively

## 📖 What is a Breakout?

**Breakout** occurs when price moves beyond a defined support or resistance level with increased momentum.

### Types of Breakouts

1. **Range Breakout**: Price exits consolidation range
2. **Pattern Breakout**: Price breaks chart patterns (triangles, flags)
3. **New High/Low**: Price reaches 52-week high/low
4. **Volatility Breakout**: Price expands from low volatility

## 📊 Breakout Strategies

### 1. Range Breakout

```python
def range_breakout(df, lookback=20, volume_multiplier=1.5):
    """
    Trade breakouts from consolidation ranges
    """
    # Identify range
    df['Range_High'] = df['High'].rolling(lookback).max()
    df['Range_Low'] = df['Low'].rolling(lookback).min()
    df['Range_Width'] = df['Range_High'] - df['Range_Low']

    # Average volume
    df['Avg_Volume'] = df['Volume'].rolling(lookback).mean()

    # Signals
    df['Signal'] = 0

    # Bullish breakout
    df.loc[(df['Close'] > df['Range_High'].shift(1)) &
           (df['Volume'] > df['Avg_Volume'] * volume_multiplier), 'Signal'] = 1

    # Bearish breakdown
    df.loc[(df['Close'] < df['Range_Low'].shift(1)) &
           (df['Volume'] > df['Avg_Volume'] * volume_multiplier), 'Signal'] = -1

    return df
```

### 2. Volatility Breakout (Bollinger Squeeze)

```python
def volatility_breakout(df, bb_period=20, squeeze_threshold=0.5):
    """
    Trade breakouts after volatility contraction
    """
    # Bollinger Bands
    df['BB_Middle'] = df['Close'].rolling(bb_period).mean()
    df['BB_Std'] = df['Close'].rolling(bb_period).std()
    df['BB_Upper'] = df['BB_Middle'] + (2 * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (2 * df['BB_Std'])
    df['BB_Width'] = (df['BB_Upper'] - df['BB_Lower']) / df['BB_Middle']

    # Identify squeeze
    df['BB_Width_Avg'] = df['BB_Width'].rolling(50).mean()
    df['Squeeze'] = df['BB_Width'] < (df['BB_Width_Avg'] * squeeze_threshold)

    # Breakout signals
    df['Signal'] = 0

    # Buy on upside breakout from squeeze
    df.loc[df['Squeeze'].shift(1) & (df['Close'] > df['BB_Upper']), 'Signal'] = 1

    # Sell on downside breakout from squeeze
    df.loc[df['Squeeze'].shift(1) & (df['Close'] < df['BB_Lower']), 'Signal'] = -1

    return df
```

### 3. New High/Low Breakout

```python
def new_high_breakout(df, period=252):  # 252 = 1 year
    """
    Trade 52-week high/low breakouts
    """
    df['Period_High'] = df['High'].rolling(period).max()
    df['Period_Low'] = df['Low'].rolling(period).min()

    df['Signal'] = 0

    # New high with volume
    df.loc[(df['Close'] >= df['Period_High'].shift(1)) &
           (df['Volume'] > df['Volume'].rolling(20).mean()), 'Signal'] = 1

    # New low with volume
    df.loc[(df['Close'] <= df['Period_Low'].shift(1)) &
           (df['Volume'] > df['Volume'].rolling(20).mean()), 'Signal'] = -1

    return df
```

## 🎯 Complete Breakout System

```python
class BreakoutSystem:
    def __init__(self, lookback=20, volume_mult=1.5):
        self.lookback = lookback
        self.volume_mult = volume_mult

    def identify_consolidation(self, df):
        """
        Find consolidation periods
        """
        # Calculate ATR
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(14).mean()

        # Narrow range (ATR declining)
        df['ATR_Slope'] = df['ATR'].diff(5)
        df['Consolidating'] = df['ATR_Slope'] < 0

        return df

    def validate_breakout(self, df):
        """
        Confirm breakout validity
        """
        current = df.iloc[-1]
        prev = df.iloc[-2]

        # Volume confirmation
        volume_ok = current['Volume'] > current['Avg_Volume'] * self.volume_mult

        # Price action (strong close)
        close_strength = (current['Close'] - current['Low']) / (current['High'] - current['Low'])
        strong_close = close_strength > 0.7

        # Momentum (RSI not overbought)
        rsi_ok = 30 < current['RSI'] < 70

        return volume_ok and strong_close and rsi_ok

    def calculate_entry(self, df, direction):
        """
        Entry price and timing
        """
        if direction == "LONG":
            # Enter on break above resistance
            entry = df['Range_High'].iloc[-1]
        else:
            # Enter on break below support
            entry = df['Range_Low'].iloc[-1]

        return entry

    def calculate_stops(self, df, entry, direction):
        """
        Stop loss and targets
        """
        atr = df['ATR'].iloc[-1]
        range_width = df['Range_Width'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry - (1.5 * atr)
            target1 = entry + range_width  # Range projection
            target2 = entry + (2 * range_width)
        else:
            stop_loss = entry + (1.5 * atr)
            target1 = entry - range_width
            target2 = entry - (2 * range_width)

        return stop_loss, target1, target2
```

## 🔍 Filtering False Breakouts

### 1. Volume Filter

**Rule**: Volume must be 1.5-2x average

```python
def volume_filter(df, multiplier=1.5):
    avg_vol = df['Volume'].rolling(20).mean().iloc[-1]
    current_vol = df['Volume'].iloc[-1]
    return current_vol > avg_vol * multiplier
```

### 2. Consolidation Duration

**Rule**: Minimum 10-20 days consolidation

```python
def consolidation_filter(df, min_days=10):
    # Check if range has been stable
    range_high = df['High'].rolling(min_days).max()
    range_low = df['Low'].rolling(min_days).min()
    range_width = range_high - range_low

    # Stable if width hasn't changed much
    width_change = range_width.diff(min_days).abs()
    stable = width_change.iloc[-1] < range_width.iloc[-1] * 0.2

    return stable
```

### 3. Trend Context

**Rule**: Trade breakouts in direction of larger trend

```python
def trend_filter(df):
    ma_50 = df['Close'].rolling(50).mean().iloc[-1]
    ma_200 = df['Close'].rolling(200).mean().iloc[-1]

    if ma_50 > ma_200:
        return "UPTREND"  # Only long breakouts
    elif ma_50 < ma_200:
        return "DOWNTREND"  # Only short breakouts
    else:
        return "NEUTRAL"  # Both directions
```

## 💰 Risk Management

### Position Sizing

```python
def breakout_position_size(account, risk_pct, entry, stop, max_position_pct=0.15):
    """
    Size position for breakout trade
    """
    # Risk-based sizing
    risk_amount = account * risk_pct
    risk_per_share = abs(entry - stop)
    shares = int(risk_amount / risk_per_share)

    # Limit to max position size
    max_shares = int((account * max_position_pct) / entry)
    shares = min(shares, max_shares)

    return shares
```

### Scaling Strategy

```python
def scale_into_breakout(entry, target1, target2):
    """
    Scale into position as breakout confirms
    """
    return {
        'entry_1': entry,  # 50% position
        'entry_2': entry + (target1 - entry) * 0.3,  # 30% more
        'entry_3': entry + (target1 - entry) * 0.6,  # 20% more
    }
```

## 📊 Backtesting Breakouts

```python
def backtest_breakout_strategy(df, system):
    """
    Backtest breakout system
    """
    df = system.identify_consolidation(df)
    df = range_breakout(df)

    trades = []
    position = None

    for i in range(system.lookback, len(df)):
        current_df = df.iloc[:i+1]

        if position:
            # Check exit
            current_price = current_df['Close'].iloc[-1]

            if position['direction'] == "LONG":
                if current_price >= position['target1']:
                    # Take profit
                    pnl = (current_price - position['entry']) * position['shares']
                    trades.append({'pnl': pnl, 'exit_reason': 'TARGET'})
                    position = None
                elif current_price <= position['stop']:
                    # Stop loss
                    pnl = (current_price - position['entry']) * position['shares']
                    trades.append({'pnl': pnl, 'exit_reason': 'STOP'})
                    position = None

        else:
            # Check entry
            signal = current_df['Signal'].iloc[-1]

            if signal != 0 and system.validate_breakout(current_df):
                direction = "LONG" if signal == 1 else "SHORT"
                entry = current_df['Close'].iloc[-1]
                stop, target1, target2 = system.calculate_stops(current_df, entry, direction)

                position = {
                    'direction': direction,
                    'entry': entry,
                    'stop': stop,
                    'target1': target1,
                    'shares': 100  # Simplified
                }

    return trades
```

## ⚠️ Common Mistakes

1. **Chasing Breakouts**: Enter too late after big move
2. **Ignoring Volume**: Trade breakouts without volume confirmation
3. **No Stop Loss**: Hope failed breakout reverses
4. **Wrong Context**: Trade against larger trend
5. **Overtrading**: Take every breakout without filters

## 🎓 Check Your Understanding

1. What defines a valid breakout?
2. Why is volume important in breakouts?
3. What is a false breakout?
4. How do you calculate breakout targets?
5. When should you avoid breakout trading?

## 💻 Exercise

```python
# Implement breakout system
system = BreakoutSystem(lookback=20)

# Test on volatile stocks
tickers = ["TSLA", "NVDA", "AMD"]

for ticker in tickers:
    df = yf.Ticker(ticker).history(period="2y")
    trades = backtest_breakout_strategy(df, system)

    win_rate = len([t for t in trades if t['pnl'] > 0]) / len(trades)
    print(f"{ticker} Win Rate: {win_rate:.2%}")
```

## 📝 Exercise 4.3

Create: `exercises/module-04/exercise-4.3-breakout.md`

1. Implement range breakout system
2. Add volume and consolidation filters
3. Backtest on 5 stocks
4. Compare with and without filters
5. Analyze false breakout rate

## 📚 Resources

- [Investopedia: Breakout Trading](https://www.investopedia.com/articles/trading/08/trading-breakouts.asp)
- [StockCharts: Breakout Patterns](https://school.stockcharts.com/doku.php?id=chart_analysis:chart_patterns)

## ✅ Solutions

1. **Valid breakout**: Price moves beyond S/R with high volume, strong close, after consolidation period
2. **Volume importance**: Confirms genuine interest; low volume breakouts often fail (false breakouts)
3. **False breakout**: Price briefly breaks level then reverses; caused by stop hunting or lack of conviction
4. **Breakout targets**: Project range width from breakout point; or use Fibonacci extensions
5. **Avoid breakouts**: In choppy/ranging markets, against major trend, without volume confirmation

---

**Next**: [Lesson 4.4: Momentum Strategies](lesson-04-momentum.md)
