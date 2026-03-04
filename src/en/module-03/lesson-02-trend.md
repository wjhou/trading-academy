# Lesson 3.2: Trend Indicators - MACD (Moving Average Convergence Divergence)

**Module**: 3 - Technical Indicators
**Estimated Time**: 55 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what MACD is and how it works
- Learn to interpret MACD line, signal line, and histogram
- Recognize MACD crossovers and divergences
- Apply MACD to identify trend changes
- Combine MACD with other indicators

## 📖 What is MACD?

**MACD (Moving Average Convergence Divergence)** is a trend-following momentum indicator that shows the relationship between two moving averages of a stock's price.

### Developed By

Gerald Appel in the late 1970s

### Why MACD is Popular

- **Versatile**: Shows trend, momentum, and potential reversals
- **Clear signals**: Easy to interpret crossovers
- **Widely used**: Institutional and retail traders
- **Works on all timeframes**: From intraday to monthly

## 📊 MACD Components

MACD consists of three elements:

### 1. MACD Line

**Formula**: 12-period EMA - 26-period EMA

```
MACD Line = EMA(12) - EMA(26)
```

**Interpretation**:
- Positive MACD: 12 EMA above 26 EMA (bullish)
- Negative MACD: 12 EMA below 26 EMA (bearish)
- Rising MACD: Upward momentum increasing
- Falling MACD: Downward momentum increasing

### 2. Signal Line

**Formula**: 9-period EMA of MACD Line

```
Signal Line = EMA(MACD Line, 9)
```

**Purpose**: Smooths MACD line, generates trading signals

### 3. MACD Histogram

**Formula**: MACD Line - Signal Line

```
Histogram = MACD Line - Signal Line
```

**Interpretation**:
- Positive histogram: MACD above signal (bullish)
- Negative histogram: MACD below signal (bearish)
- Growing histogram: Momentum accelerating
- Shrinking histogram: Momentum decelerating

### Visual Representation

```
MACD Chart:
  2 ─────────────────────
  1 ───╱─╲───────────────  MACD Line
  0 ──╱───╲──╱─╲─────────  Signal Line
 -1 ─╱─────╲╱───╲────────  Zero Line
 -2 ─────────────╲───────

Histogram:
  ║ ║║║ ║ ║║ ║
  ═══════════════════════  Zero Line
      ║ ║║║ ║
```

## 🔍 Reading MACD

### MACD Position

**Above Zero Line**:
- Short-term average above long-term average
- Bullish momentum
- Uptrend likely

**Below Zero Line**:
- Short-term average below long-term average
- Bearish momentum
- Downtrend likely

**Crossing Zero Line**:
- MACD crosses above zero: Bullish signal
- MACD crosses below zero: Bearish signal

### MACD vs Signal Line

**MACD Above Signal**:
- Bullish momentum
- Histogram positive
- Consider buying

**MACD Below Signal**:
- Bearish momentum
- Histogram negative
- Consider selling

## 🎯 MACD Trading Signals

### 1. MACD Crossovers

#### Bullish Crossover

**MACD line crosses above signal line**

```
Signal Line: ─────────────
MACD Line:   ────╱────────
                ↑
         Bullish Crossover
```

**Interpretation**: Buy signal, upward momentum starting

**Best when**:
- Occurs below zero line (stronger signal)
- Histogram turning positive
- Price above key support

#### Bearish Crossover

**MACD line crosses below signal line**

```
MACD Line:   ────╲────────
Signal Line: ─────────────
                ↓
         Bearish Crossover
```

**Interpretation**: Sell signal, downward momentum starting

**Best when**:
- Occurs above zero line (stronger signal)
- Histogram turning negative
- Price below key resistance

### 2. Zero Line Crossovers

#### Bullish Zero Cross

**MACD crosses above zero line**

```
Zero Line:   ═════════════
MACD:        ───╱─────────
               ↑
        Strong Bullish Signal
```

**Interpretation**: Major trend change to uptrend

#### Bearish Zero Cross

**MACD crosses below zero line**

```
MACD:        ───╲─────────
Zero Line:   ═════════════
               ↓
        Strong Bearish Signal
```

**Interpretation**: Major trend change to downtrend

### 3. Histogram Signals

#### Histogram Reversal

**Histogram changes direction**

```
Growing → Shrinking:
║║║║ ║║ ║  ← Momentum slowing
═══════════

Shrinking → Growing:
  ║ ║║ ║║║ ← Momentum accelerating
═══════════
```

**Interpretation**: Early warning of potential crossover

#### Histogram Divergence

**Price and histogram move in opposite directions**

See divergence section below.

## 🔄 MACD Divergences

### Bullish Divergence

**Price makes lower low, MACD makes higher low**

```
Price:
╲    ╱
 ╲  ╱
  ╲╱ ← Lower Low

MACD:
╲  ╱
 ╲╱ ← Higher Low
```

**Interpretation**: Downtrend losing momentum, potential reversal up

### Bearish Divergence

**Price makes higher high, MACD makes lower high**

```
Price:
  ╱╲
 ╱  ╲
╱    ╲ ← Higher High

MACD:
╱╲
  ╲ ← Lower High
```

**Interpretation**: Uptrend losing momentum, potential reversal down

### Hidden Divergences

**Hidden Bullish**: Price higher low, MACD lower low
- Continuation signal in uptrend

**Hidden Bearish**: Price lower high, MACD higher high
- Continuation signal in downtrend

## 💻 Implementing MACD

### Basic MACD Calculation

```python
import yfinance as yf
import pandas as pd
import numpy as np

def calculate_macd(df, fast=12, slow=26, signal=9):
    """
    Calculate MACD indicator
    """
    # Calculate EMAs
    ema_fast = df['Close'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['Close'].ewm(span=slow, adjust=False).mean()

    # MACD line
    macd_line = ema_fast - ema_slow

    # Signal line
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()

    # Histogram
    histogram = macd_line - signal_line

    return macd_line, signal_line, histogram

# Example usage
df = yf.Ticker("AAPL").history(period="1y")
df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

print(df[['Close', 'MACD', 'Signal', 'Histogram']].tail())
```

### Using TA-Lib

```python
import talib

# Calculate MACD using TA-Lib
macd, signal, histogram = talib.MACD(df['Close'],
                                      fastperiod=12,
                                      slowperiod=26,
                                      signalperiod=9)

df['MACD'] = macd
df['Signal'] = signal
df['Histogram'] = histogram
```

### Detecting Crossovers

```python
def detect_macd_crossover(df):
    """
    Detect MACD crossovers
    """
    macd_curr = df['MACD'].iloc[-1]
    macd_prev = df['MACD'].iloc[-2]
    signal_curr = df['Signal'].iloc[-1]
    signal_prev = df['Signal'].iloc[-2]

    # Bullish crossover
    if macd_prev <= signal_prev and macd_curr > signal_curr:
        return "BULLISH_CROSSOVER"

    # Bearish crossover
    elif macd_prev >= signal_prev and macd_curr < signal_curr:
        return "BEARISH_CROSSOVER"

    # Zero line crossovers
    if macd_prev <= 0 and macd_curr > 0:
        return "BULLISH_ZERO_CROSS"
    elif macd_prev >= 0 and macd_curr < 0:
        return "BEARISH_ZERO_CROSS"

    return "NO_CROSSOVER"

# Example
crossover = detect_macd_crossover(df)
print(f"MACD Signal: {crossover}")
```

### Detecting Divergences

```python
def detect_macd_divergence(df, lookback=20):
    """
    Detect MACD divergences
    """
    # Find recent highs and lows
    price_high_idx = df['High'].iloc[-lookback:].idxmax()
    price_low_idx = df['Low'].iloc[-lookback:].idxmin()

    macd_high_idx = df['MACD'].iloc[-lookback:].idxmax()
    macd_low_idx = df['MACD'].iloc[-lookback:].idxmin()

    # Get previous highs/lows
    prev_price_high_idx = df['High'].iloc[-lookback*2:-lookback].idxmax()
    prev_price_low_idx = df['Low'].iloc[-lookback*2:-lookback].idxmin()

    prev_macd_high_idx = df['MACD'].iloc[-lookback*2:-lookback].idxmax()
    prev_macd_low_idx = df['MACD'].iloc[-lookback*2:-lookback].idxmin()

    # Bullish divergence
    if (df.loc[price_low_idx, 'Low'] < df.loc[prev_price_low_idx, 'Low'] and
        df.loc[macd_low_idx, 'MACD'] > df.loc[prev_macd_low_idx, 'MACD']):
        return "BULLISH_DIVERGENCE"

    # Bearish divergence
    if (df.loc[price_high_idx, 'High'] > df.loc[prev_price_high_idx, 'High'] and
        df.loc[macd_high_idx, 'MACD'] < df.loc[prev_macd_high_idx, 'MACD']):
        return "BEARISH_DIVERGENCE"

    return "NO_DIVERGENCE"
```

## 🎯 MACD Trading Strategies

### Strategy 1: Basic Crossover

```python
def macd_crossover_strategy(df):
    """
    Trade MACD crossovers
    """
    crossover = detect_macd_crossover(df)

    if crossover == "BULLISH_CROSSOVER":
        return "BUY"
    elif crossover == "BEARISH_CROSSOVER":
        return "SELL"

    return "HOLD"
```

### Strategy 2: Zero Line Strategy

```python
def macd_zero_line_strategy(df):
    """
    Trade zero line crossovers with confirmation
    """
    macd = df['MACD'].iloc[-1]
    prev_macd = df['MACD'].iloc[-2]
    histogram = df['Histogram'].iloc[-1]

    # Bullish: MACD crosses above zero with positive histogram
    if prev_macd <= 0 and macd > 0 and histogram > 0:
        return "BUY"

    # Bearish: MACD crosses below zero with negative histogram
    elif prev_macd >= 0 and macd < 0 and histogram < 0:
        return "SELL"

    return "HOLD"
```

### Strategy 3: Histogram Reversal

```python
def macd_histogram_strategy(df):
    """
    Trade histogram reversals
    """
    hist_curr = df['Histogram'].iloc[-1]
    hist_prev = df['Histogram'].iloc[-2]
    hist_prev2 = df['Histogram'].iloc[-3]

    # Bullish: Histogram bottoming (was decreasing, now increasing)
    if hist_prev2 > hist_prev and hist_curr > hist_prev and hist_curr < 0:
        return "BUY"

    # Bearish: Histogram topping (was increasing, now decreasing)
    elif hist_prev2 < hist_prev and hist_curr < hist_prev and hist_curr > 0:
        return "SELL"

    return "HOLD"
```

### Strategy 4: MACD with Trend Filter

```python
def macd_trend_strategy(df):
    """
    Trade MACD only in direction of trend
    """
    # Calculate trend
    sma_50 = df['Close'].rolling(50).mean().iloc[-1]
    price = df['Close'].iloc[-1]

    crossover = detect_macd_crossover(df)

    # Only buy in uptrend
    if price > sma_50 and crossover == "BULLISH_CROSSOVER":
        return "BUY"

    # Only sell in downtrend
    elif price < sma_50 and crossover == "BEARISH_CROSSOVER":
        return "SELL"

    return "HOLD"
```

### Strategy 5: MACD Divergence

```python
def macd_divergence_strategy(df):
    """
    Trade MACD divergences
    """
    divergence = detect_macd_divergence(df)
    macd = df['MACD'].iloc[-1]

    if divergence == "BULLISH_DIVERGENCE":
        # Wait for MACD to turn up
        if df['MACD'].iloc[-1] > df['MACD'].iloc[-2]:
            return "BUY"

    elif divergence == "BEARISH_DIVERGENCE":
        # Wait for MACD to turn down
        if df['MACD'].iloc[-1] < df['MACD'].iloc[-2]:
            return "SELL"

    return "HOLD"
```

## ⚙️ MACD Settings

### Standard Settings (12, 26, 9)

- **Fast EMA**: 12 periods
- **Slow EMA**: 26 periods
- **Signal**: 9 periods

**Best for**: Daily charts, swing trading

### Faster Settings (5, 35, 5)

- More sensitive
- More signals (more false signals)
- Better for day trading

### Slower Settings (19, 39, 9)

- Less sensitive
- Fewer but more reliable signals
- Better for position trading

### Custom Settings

```python
def optimize_macd_settings(df, fast_range, slow_range, signal_range):
    """
    Test different MACD settings
    """
    best_return = -float('inf')
    best_settings = None

    for fast in fast_range:
        for slow in slow_range:
            if fast >= slow:
                continue
            for signal in signal_range:
                # Calculate MACD with these settings
                macd, sig, hist = calculate_macd(df, fast, slow, signal)

                # Backtest strategy
                returns = backtest_macd_strategy(df, macd, sig, hist)

                if returns > best_return:
                    best_return = returns
                    best_settings = (fast, slow, signal)

    return best_settings, best_return
```

## 📊 MACD with Other Indicators

### MACD + RSI

```python
def macd_rsi_strategy(df):
    """
    Combine MACD and RSI
    """
    # Calculate indicators
    df['RSI'] = calculate_rsi(df)
    crossover = detect_macd_crossover(df)

    rsi = df['RSI'].iloc[-1]

    # Buy: MACD bullish crossover + RSI not overbought
    if crossover == "BULLISH_CROSSOVER" and rsi < 70:
        return "BUY"

    # Sell: MACD bearish crossover + RSI not oversold
    elif crossover == "BEARISH_CROSSOVER" and rsi > 30:
        return "SELL"

    return "HOLD"
```

### MACD + Moving Averages

```python
def macd_ma_strategy(df):
    """
    MACD with MA trend filter
    """
    df['MA_50'] = df['Close'].rolling(50).mean()
    df['MA_200'] = df['Close'].rolling(200).mean()

    crossover = detect_macd_crossover(df)
    price = df['Close'].iloc[-1]
    ma_50 = df['MA_50'].iloc[-1]
    ma_200 = df['MA_200'].iloc[-1]

    # Strong uptrend: Price > MA50 > MA200
    if price > ma_50 > ma_200:
        if crossover == "BULLISH_CROSSOVER":
            return "BUY"

    # Strong downtrend: Price < MA50 < MA200
    elif price < ma_50 < ma_200:
        if crossover == "BEARISH_CROSSOVER":
            return "SELL"

    return "HOLD"
```

## ⚠️ MACD Limitations

### 1. Lagging Indicator

MACD is based on moving averages, so it lags price.

**Solution**: Use histogram for earlier signals

### 2. Whipsaws in Sideways Markets

Generates false signals when price is ranging.

**Solution**: Avoid trading MACD in choppy markets

### 3. Late Entries

Crossovers can occur after significant price movement.

**Solution**: Use histogram divergence for earlier entry

### 4. No Price Levels

MACD doesn't show support/resistance.

**Solution**: Combine with price action analysis

## 🎓 Check Your Understanding

1. What are the three components of MACD?
2. What does a bullish MACD crossover indicate?
3. What is a MACD divergence?
4. When is a zero line crossover most significant?
5. How would you combine MACD with trend analysis?

## 💻 Hands-On Exercise

```python
import yfinance as yf
import matplotlib.pyplot as plt

# Get data
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="1y")

# Calculate MACD
df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

# Plot
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10),
                                gridspec_kw={'height_ratios': [2, 1]},
                                sharex=True)

# Price
ax1.plot(df.index, df['Close'], label='Price')
ax1.set_title(f"{ticker} - Price and MACD")
ax1.legend()
ax1.grid(True)

# MACD
ax2.plot(df.index, df['MACD'], label='MACD', linewidth=2)
ax2.plot(df.index, df['Signal'], label='Signal', linewidth=2)
ax2.bar(df.index, df['Histogram'], label='Histogram', alpha=0.3)
ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
ax2.set_title("MACD")
ax2.legend()
ax2.grid(True)

plt.tight_layout()
plt.show()

# Your task: Identify crossovers and divergences
```

## 📝 Exercise 3.2: MACD Analysis

Create: `exercises/module-03/exercise-3.2-macd.md`

1. Analyze 3 stocks with MACD
2. Identify recent crossovers and their outcomes
3. Find any divergences
4. Compare standard (12,26,9) vs faster (5,35,5) settings
5. Backtest a MACD strategy

## 🚀 Next Steps

Next lesson: **Bollinger Bands** - volatility indicators

**Preview**:
- What are Bollinger Bands?
- How to trade band squeezes and expansions
- Bollinger Band strategies

## 📚 Additional Resources

- [Investopedia: MACD](https://www.investopedia.com/terms/m/macd.asp)
- [StockCharts: MACD](https://school.stockcharts.com/doku.php?id=technical_indicators:moving_average_convergence_divergence_macd)
- [TradingView: MACD](https://www.tradingview.com/support/solutions/43000502344-macd-moving-average-convergence-divergence/)

## ✅ Solutions

1. **Three components**: MACD line (12 EMA - 26 EMA), Signal line (9 EMA of MACD), Histogram (MACD - Signal)

2. **Bullish crossover**: MACD line crosses above signal line; indicates upward momentum starting, potential buy signal

3. **MACD divergence**: When price and MACD move in opposite directions; price makes new high/low but MACD doesn't confirm, suggesting trend weakness

4. **Zero line crossover significance**: Most significant when confirmed by strong histogram and occurs after extended move in opposite direction; indicates major trend change

5. **MACD with trend**: Use MACD crossovers only in direction of higher timeframe trend; filter signals with moving averages; avoid counter-trend MACD signals

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 3.3: Volatility Indicators (Bollinger Bands)](lesson-03-volatility.md)
