# Lesson 3.1: Momentum Indicators - RSI (Relative Strength Index)

**Module**: 3 - Technical Indicators
**Estimated Time**: 55 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what momentum indicators measure
- Learn how RSI is calculated and interpreted
- Identify overbought and oversold conditions
- Recognize RSI divergences
- Apply RSI to trading strategies

## 📖 What is Momentum?

**Momentum** measures the rate of change in price movements. It answers: "How fast is the price moving?"

### Why Momentum Matters

- **Leading indicator**: Can signal reversals before price
- **Strength measurement**: Shows conviction behind moves
- **Overbought/Oversold**: Identifies extremes
- **Divergence detection**: Spots weakening trends

## 📊 RSI: Relative Strength Index

**RSI** is a momentum oscillator that measures the speed and magnitude of price changes on a scale of 0-100.

### Developed By

J. Welles Wilder Jr. in 1978 (also created ATR, ADX, Parabolic SAR)

### RSI Formula

```
RSI = 100 - (100 / (1 + RS))

where:
RS = Average Gain / Average Loss (over period, typically 14 days)

Average Gain = Sum of gains over period / period
Average Loss = Sum of losses over period / period
```

### Example Calculation

```
14-day period:
Days with gains: +2, +1, +3, +2, +1, +2, +1 = 12 total
Days with losses: -1, -2, -1, -2, -1, -1, -1 = 9 total

Average Gain = 12 / 14 = 0.857
Average Loss = 9 / 14 = 0.643

RS = 0.857 / 0.643 = 1.333
RSI = 100 - (100 / (1 + 1.333)) = 57.14
```

## 📈 Reading RSI

### RSI Scale

```
100 ─────────────── Extremely Overbought
 80 ─────────────── Overbought Zone
 70 ─────────────── Overbought Threshold
 50 ─────────────── Neutral
 30 ─────────────── Oversold Threshold
 20 ─────────────── Oversold Zone
  0 ─────────────── Extremely Oversold
```

### Interpretation

**RSI > 70**: Overbought
- Price may have risen too fast
- Potential for pullback or reversal
- **Not a sell signal alone!** Strong trends can stay overbought

**RSI < 30**: Oversold
- Price may have fallen too fast
- Potential for bounce or reversal
- **Not a buy signal alone!** Weak trends can stay oversold

**RSI = 50**: Neutral
- Balance between buyers and sellers
- No clear momentum direction

### RSI in Trends

**Uptrend**:
- RSI typically stays between 40-90
- Rarely drops below 30
- Pullbacks to 40-50 are buying opportunities

**Downtrend**:
- RSI typically stays between 10-60
- Rarely rises above 70
- Rallies to 50-60 are selling opportunities

```
Strong Uptrend RSI:
100 ─────────────
 70 ───╱─╲─╱─╲───
 50 ──╱───╲╱───╲─
 30 ─────────────
  0 ─────────────
(Stays mostly above 50)

Strong Downtrend RSI:
100 ─────────────
 70 ─────────────
 50 ─╲───╱╲───╱─
 30 ───╲─╱──╲─╱──
  0 ─────────────
(Stays mostly below 50)
```

## 🔄 RSI Divergences

**Divergence** occurs when price and RSI move in opposite directions - a powerful reversal signal.

### Bullish Divergence

**Price makes lower low, RSI makes higher low**

```
Price:
╲    ╱
 ╲  ╱
  ╲╱ ← Lower Low

RSI:
╲  ╱
 ╲╱ ← Higher Low
```

**Interpretation**: Selling pressure weakening, potential reversal up

### Bearish Divergence

**Price makes higher high, RSI makes lower high**

```
Price:
  ╱╲
 ╱  ╲
╱    ╲ ← Higher High

RSI:
╱╲
  ╲ ← Lower High
```

**Interpretation**: Buying pressure weakening, potential reversal down

### Hidden Divergences

**Hidden Bullish**: Price makes higher low, RSI makes lower low
- Continuation signal in uptrend

**Hidden Bearish**: Price makes lower high, RSI makes higher high
- Continuation signal in downtrend

## 💻 Implementing RSI

### Basic RSI Calculation

```python
import yfinance as yf
import pandas as pd
import numpy as np

def calculate_rsi(df, period=14):
    """
    Calculate RSI indicator
    """
    # Calculate price changes
    delta = df['Close'].diff()

    # Separate gains and losses
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    # Calculate average gain and loss
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    # Calculate RS and RSI
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return rsi

# Example usage
df = yf.Ticker("AAPL").history(period="6mo")
df['RSI'] = calculate_rsi(df)

print(df[['Close', 'RSI']].tail())
```

### Using TA-Lib (More Accurate)

```python
import talib

# Calculate RSI using TA-Lib
df['RSI'] = talib.RSI(df['Close'], timeperiod=14)
```

### Detecting Overbought/Oversold

```python
def detect_rsi_signals(df, overbought=70, oversold=30):
    """
    Detect RSI overbought/oversold conditions
    """
    current_rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    signals = []

    # Overbought
    if current_rsi > overbought:
        signals.append("OVERBOUGHT")
        if prev_rsi <= overbought:
            signals.append("ENTERING_OVERBOUGHT")

    # Oversold
    if current_rsi < oversold:
        signals.append("OVERSOLD")
        if prev_rsi >= oversold:
            signals.append("ENTERING_OVERSOLD")

    # Crossing 50
    if prev_rsi < 50 and current_rsi >= 50:
        signals.append("BULLISH_MOMENTUM")
    elif prev_rsi > 50 and current_rsi <= 50:
        signals.append("BEARISH_MOMENTUM")

    return signals if signals else ["NEUTRAL"]

# Example
signals = detect_rsi_signals(df)
print(f"RSI Signals: {', '.join(signals)}")
```

### Detecting Divergences

```python
def detect_rsi_divergence(df, lookback=14):
    """
    Detect RSI divergences
    """
    # Find recent price highs and lows
    price_highs = df['High'].rolling(lookback).max()
    price_lows = df['Low'].rolling(lookback).min()

    # Find recent RSI highs and lows
    rsi_highs = df['RSI'].rolling(lookback).max()
    rsi_lows = df['RSI'].rolling(lookback).min()

    # Current values
    curr_price_high = df['High'].iloc[-1]
    curr_price_low = df['Low'].iloc[-1]
    curr_rsi_high = df['RSI'].iloc[-1]
    curr_rsi_low = df['RSI'].iloc[-1]

    # Previous values
    prev_price_high = price_highs.iloc[-lookback]
    prev_price_low = price_lows.iloc[-lookback]
    prev_rsi_high = rsi_highs.iloc[-lookback]
    prev_rsi_low = rsi_lows.iloc[-lookback]

    # Bullish divergence: price lower low, RSI higher low
    if curr_price_low < prev_price_low and curr_rsi_low > prev_rsi_low:
        return "BULLISH_DIVERGENCE"

    # Bearish divergence: price higher high, RSI lower high
    if curr_price_high > prev_price_high and curr_rsi_high < prev_rsi_high:
        return "BEARISH_DIVERGENCE"

    return "NO_DIVERGENCE"
```

## 🎯 RSI Trading Strategies

### Strategy 1: Overbought/Oversold

**Simple approach**: Buy oversold, sell overbought

```python
def rsi_overbought_oversold_strategy(df):
    rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    # Buy when RSI crosses above 30 from below
    if prev_rsi < 30 and rsi >= 30:
        return "BUY"

    # Sell when RSI crosses below 70 from above
    if prev_rsi > 70 and rsi <= 70:
        return "SELL"

    return "HOLD"
```

**Caution**: This can fail in strong trends!

### Strategy 2: RSI with Trend

**Better approach**: Only trade with the trend

```python
def rsi_trend_strategy(df):
    rsi = df['RSI'].iloc[-1]
    sma_50 = df['Close'].rolling(50).mean().iloc[-1]
    price = df['Close'].iloc[-1]

    # Determine trend
    if price > sma_50:
        # Uptrend: Buy on RSI pullback to 40-50
        if 40 <= rsi <= 50:
            return "BUY"
    else:
        # Downtrend: Sell on RSI rally to 50-60
        if 50 <= rsi <= 60:
            return "SELL"

    return "HOLD"
```

### Strategy 3: RSI Divergence

**Advanced approach**: Trade divergences

```python
def rsi_divergence_strategy(df):
    divergence = detect_rsi_divergence(df)
    rsi = df['RSI'].iloc[-1]

    if divergence == "BULLISH_DIVERGENCE":
        if rsi < 40:  # Confirm oversold
            return "BUY"

    elif divergence == "BEARISH_DIVERGENCE":
        if rsi > 60:  # Confirm overbought
            return "SELL"

    return "HOLD"
```

### Strategy 4: RSI Breakout

**Momentum approach**: Trade RSI level breaks

```python
def rsi_breakout_strategy(df):
    rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    # Bullish: RSI breaks above 50
    if prev_rsi <= 50 and rsi > 50:
        if rsi < 70:  # Not yet overbought
            return "BUY"

    # Bearish: RSI breaks below 50
    if prev_rsi >= 50 and rsi < 50:
        if rsi > 30:  # Not yet oversold
            return "SELL"

    return "HOLD"
```

## ⚙️ RSI Settings

### Period Selection

**14-day (Default)**:
- Balanced sensitivity
- Works for most timeframes
- Wilder's original setting

**9-day (Faster)**:
- More sensitive
- More signals (more false signals too)
- Better for day trading

**21-day (Slower)**:
- Less sensitive
- Fewer but more reliable signals
- Better for swing trading

### Threshold Adjustment

**Standard**: 70/30
**Trending Markets**: 80/20 (avoid false signals)
**Range-Bound**: 60/40 (catch more reversals)

```python
# Adaptive thresholds
def get_rsi_thresholds(df):
    # Check if trending
    sma_20 = df['Close'].rolling(20).mean()
    sma_50 = df['Close'].rolling(50).mean()

    if sma_20.iloc[-1] > sma_50.iloc[-1] * 1.05:
        # Strong uptrend
        return 80, 40
    elif sma_20.iloc[-1] < sma_50.iloc[-1] * 0.95:
        # Strong downtrend
        return 60, 20
    else:
        # Sideways
        return 70, 30
```

## ⚠️ RSI Limitations

### 1. False Signals in Trends

RSI can stay overbought/oversold for extended periods in strong trends.

**Solution**: Use with trend indicators (MA, trendlines)

### 2. Whipsaws

Frequent crosses of 70/30 in choppy markets.

**Solution**: Wait for confirmation, use wider thresholds

### 3. Lagging

RSI is based on past prices, can be slow.

**Solution**: Use shorter periods or combine with price action

### 4. Not Standalone

RSI alone is not enough for trading decisions.

**Solution**: Combine with support/resistance, volume, patterns

## 🎓 Check Your Understanding

1. What does RSI measure?
2. What is considered overbought and oversold?
3. What is a bullish divergence?
4. Why can RSI stay overbought in an uptrend?
5. How would you trade RSI in a downtrend?

## 💻 Hands-On Exercise

Implement RSI analysis:

```python
import yfinance as yf
import matplotlib.pyplot as plt

# Get data
ticker = "TSLA"
df = yf.Ticker(ticker).history(period="1y")

# Calculate RSI
df['RSI'] = calculate_rsi(df, period=14)

# Plot
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

# Price
ax1.plot(df.index, df['Close'])
ax1.set_title(f"{ticker} - Price")
ax1.grid(True)

# RSI
ax2.plot(df.index, df['RSI'], label='RSI(14)')
ax2.axhline(y=70, color='r', linestyle='--', label='Overbought')
ax2.axhline(y=30, color='g', linestyle='--', label='Oversold')
ax2.axhline(y=50, color='gray', linestyle='-', alpha=0.3)
ax2.fill_between(df.index, 70, 100, alpha=0.1, color='red')
ax2.fill_between(df.index, 0, 30, alpha=0.1, color='green')
ax2.set_title("RSI")
ax2.set_ylim(0, 100)
ax2.legend()
ax2.grid(True)

plt.show()

# Your task: Identify divergences and overbought/oversold periods
```

## 📝 Exercise 3.1: RSI Analysis

Create: `exercises/module-03/exercise-3.1-rsi.md`

1. Analyze 3 stocks with RSI
2. Identify current RSI levels and interpretation
3. Find any divergences in the last 3 months
4. Backtest a simple RSI strategy
5. Compare RSI(9), RSI(14), and RSI(21)

## 🚀 Next Steps

In the next lesson, we'll learn about **MACD** - a trend-following momentum indicator.

**Preview Questions**:
- What does MACD stand for?
- How is it different from RSI?
- What is a MACD histogram?

## 📚 Additional Resources

- [Investopedia: RSI](https://www.investopedia.com/terms/r/rsi.asp)
- [StockCharts: RSI](https://school.stockcharts.com/doku.php?id=technical_indicators:relative_strength_index_rsi)
- [TradingView: RSI](https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/)

## ✅ Solutions

1. **What RSI measures**: Rate of change and magnitude of price movements; momentum on a 0-100 scale

2. **Overbought/Oversold**: Overbought > 70 (price may have risen too fast), Oversold < 30 (price may have fallen too fast)

3. **Bullish divergence**: Price makes lower low while RSI makes higher low; indicates selling pressure weakening, potential reversal up

4. **RSI stays overbought in uptrend**: Strong trends have sustained momentum; overbought doesn't mean immediate reversal, just that price has risen quickly

5. **Trading RSI in downtrend**: Look for RSI rallies to 50-60 as selling opportunities; avoid buying oversold conditions as downtrend can continue; wait for trend reversal confirmation

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 3.2: Trend Indicators (MACD)](lesson-02-trend.md)
