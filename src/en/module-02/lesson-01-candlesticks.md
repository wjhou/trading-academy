# Lesson 2.1: Candlestick Patterns - Reading Price Action

**Module**: 2 - Technical Analysis Basics
**Estimated Time**: 60 minutes
**Difficulty**: Beginner

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what candlestick charts are and why they're useful
- Learn to read individual candlestick components
- Recognize common single-candle patterns
- Identify multi-candle patterns and their significance
- Apply candlestick analysis to real trading decisions

## 📖 What are Candlestick Charts?

**Candlestick charts** are a visual representation of price movements that show four key data points for each time period: Open, High, Low, and Close (OHLC).

### History

- Developed by Japanese rice traders in the 1700s
- Introduced to Western markets by Steve Nison in the 1990s
- Now the most popular chart type among traders

### Why Candlesticks?

Compared to line charts or bar charts, candlesticks:
- Show more information at a glance
- Reveal market psychology and sentiment
- Make patterns easier to spot
- Provide visual clarity of price action

## 🕯️ Anatomy of a Candlestick

Each candlestick has several components:

```
     High (Wick/Shadow)
          |
    ┌─────────┐
    │         │  ← Body (Open to Close)
    │  BODY   │
    └─────────┘
          |
     Low (Wick/Shadow)
```

### Components

1. **Body**: Rectangle between open and close prices
   - **Green/White**: Close > Open (bullish)
   - **Red/Black**: Close < Open (bearish)

2. **Upper Wick (Shadow)**: Line from body to high
   - Shows rejection of higher prices

3. **Lower Wick (Shadow)**: Line from body to low
   - Shows rejection of lower prices

### Example

```
AAPL Daily Candle (March 4, 2026):
Open:  $150.00
High:  $153.50  ← Upper wick to here
Close: $152.00  ← Top of green body
Low:   $149.00  ← Lower wick to here

Result: Bullish candle (closed higher than opened)
```

## 📊 Single Candlestick Patterns

### 1. Doji

**Appearance**: Very small body, open ≈ close

```
    |
    ─  ← Tiny body
    |
```

**Meaning**: Indecision, potential reversal
**Context**: Most significant at trend extremes

**Types**:
- **Long-Legged Doji**: Long wicks both sides (high volatility)
- **Dragonfly Doji**: Long lower wick, no upper wick (bullish)
- **Gravestone Doji**: Long upper wick, no lower wick (bearish)

### 2. Hammer

**Appearance**: Small body at top, long lower wick (2x+ body size)

```
    ┌──┐
    └──┘
      |
      |
      |
```

**Meaning**: Bullish reversal after downtrend
**Psychology**: Sellers pushed price down, but buyers regained control

**Requirements**:
- Appears after downtrend
- Lower wick at least 2x body length
- Little to no upper wick
- Body color less important (green preferred)

### 3. Inverted Hammer

**Appearance**: Small body at bottom, long upper wick

```
      |
      |
      |
    ┌──┐
    └──┘
```

**Meaning**: Potential bullish reversal
**Psychology**: Buyers tried to push up, failed, but shows buying interest

### 4. Shooting Star

**Appearance**: Small body at bottom, long upper wick (bearish version of inverted hammer)

```
      |
      |
      |
    ┌──┐
    └──┘
```

**Meaning**: Bearish reversal after uptrend
**Psychology**: Bulls pushed high, bears took control

**Requirements**:
- Appears after uptrend
- Upper wick at least 2x body length
- Little to no lower wick

### 5. Hanging Man

**Appearance**: Small body at top, long lower wick (bearish version of hammer)

```
    ┌──┐
    └──┘
      |
      |
      |
```

**Meaning**: Bearish reversal after uptrend
**Psychology**: Despite buying pressure, sellers are emerging

### 6. Marubozu

**Appearance**: Long body, no wicks (or very small)

```
Bullish:        Bearish:
┌────────┐      ┌────────┐
│        │      │        │
│        │      │        │
│        │      │        │
└────────┘      └────────┘
(green)         (red)
```

**Meaning**: Strong conviction in one direction
**Bullish Marubozu**: Strong buying, no rejection
**Bearish Marubozu**: Strong selling, no rejection

### 7. Spinning Top

**Appearance**: Small body, long wicks on both sides

```
      |
    ┌──┐
    └──┘
      |
```

**Meaning**: Indecision, balance between buyers and sellers
**Context**: Can signal trend weakening

## 🔄 Multi-Candlestick Patterns

### 1. Engulfing Pattern

**Bullish Engulfing**:
```
Day 1    Day 2
 ┌─┐    ┌─────┐
 └─┘    │     │
(red)   │     │
        └─────┘
        (green)
```

**Requirements**:
- Downtrend before pattern
- Day 2 body completely engulfs Day 1 body
- Day 2 opens lower, closes higher than Day 1

**Meaning**: Strong reversal signal, bulls overpowering bears

**Bearish Engulfing**: Opposite (green then red)

### 2. Piercing Pattern

```
Day 1      Day 2
┌─────┐    ┌────┐
│     │    │    │
│     │  ┌─┘    │
└─────┘  │      │
(red)    └──────┘
         (green)
```

**Requirements**:
- Downtrend before pattern
- Day 2 opens below Day 1 low
- Day 2 closes above 50% of Day 1 body

**Meaning**: Bullish reversal, buyers stepping in

### 3. Dark Cloud Cover

```
Day 1      Day 2
┌──────┐   ┌────┐
│      │   │    │
│      │   │    └─┐
└──────┘   │      │
(green)    └──────┘
           (red)
```

**Requirements**:
- Uptrend before pattern
- Day 2 opens above Day 1 high
- Day 2 closes below 50% of Day 1 body

**Meaning**: Bearish reversal, sellers taking control

### 4. Morning Star (Bullish)

```
Day 1    Day 2   Day 3
┌────┐    ─     ┌────┐
│    │   ─ ─    │    │
│    │    ─     │    │
└────┘          └────┘
(red)  (doji)  (green)
```

**Requirements**:
- Downtrend before pattern
- Day 1: Large bearish candle
- Day 2: Small body (doji/spinning top), gaps down
- Day 3: Large bullish candle, closes above Day 1 midpoint

**Meaning**: Strong bullish reversal

### 5. Evening Star (Bearish)

Opposite of Morning Star - signals bearish reversal after uptrend

### 6. Three White Soldiers

```
Day 1   Day 2   Day 3
┌───┐   ┌───┐   ┌───┐
│   │   │   │   │   │
│   │   │   │   │   │
└───┘   └───┘   └───┘
(green) (green) (green)
```

**Requirements**:
- Three consecutive bullish candles
- Each opens within previous body
- Each closes near its high
- Steady progression upward

**Meaning**: Strong bullish continuation

### 7. Three Black Crows

Opposite of Three White Soldiers - bearish continuation

## 💻 Practical Application

### Using Candlesticks in Trading

1. **Identify the Trend**
   - Patterns mean different things in different contexts
   - Reversal patterns need a trend to reverse

2. **Look for Confirmation**
   - Don't trade on pattern alone
   - Wait for next candle to confirm
   - Use with volume and other indicators

3. **Consider the Timeframe**
   - Daily candles: More reliable, slower signals
   - Hourly candles: Faster signals, more noise
   - 5-minute candles: Very noisy, less reliable

### Example Trade Setup

```python
# Pseudocode for detecting hammer pattern
def is_hammer(candle):
    body = abs(candle.close - candle.open)
    lower_wick = min(candle.open, candle.close) - candle.low
    upper_wick = candle.high - max(candle.open, candle.close)

    # Hammer requirements
    if lower_wick >= 2 * body:  # Long lower wick
        if upper_wick <= 0.1 * body:  # Small upper wick
            if in_downtrend():  # After downtrend
                return True
    return False

# Wait for confirmation
if is_hammer(yesterday) and today.close > yesterday.high:
    # Consider buying
    enter_long_position()
```

## 🎓 Check Your Understanding

1. What are the four price points shown in a candlestick?
2. What does a long lower wick indicate?
3. What's the difference between a hammer and a hanging man?
4. Why is a doji significant at trend extremes?
5. What confirmation would you want before trading an engulfing pattern?

## 💻 Hands-On Exercise

Let's analyze real candlestick patterns:

```python
# In your stock-agent-system
import yfinance as yf
import pandas as pd

# Get recent data
ticker = yf.Ticker("AAPL")
df = ticker.history(period="1mo")

# Identify doji candles
df['body'] = abs(df['Close'] - df['Open'])
df['range'] = df['High'] - df['Low']
df['is_doji'] = df['body'] / df['range'] < 0.1

print("Doji candles found:")
print(df[df['is_doji']][['Open', 'High', 'Low', 'Close']])
```

**Your Task**:
1. Run this code for 3 different stocks
2. Identify any hammer or shooting star patterns
3. Check if they led to reversals
4. Document your findings

## 📝 Exercise 2.1: Pattern Recognition

Create a file: `exercises/module-02/exercise-2.1-patterns.md`

For each of these scenarios, identify the pattern:

1. After a downtrend, a red candle followed by a larger green candle that opens lower and closes above the red candle's open
2. A candle with a tiny body and long wicks on both sides
3. Three consecutive green candles, each opening within the previous body
4. After an uptrend, a small-bodied candle at the top with a long lower wick

## 🚀 Next Steps

In the next lesson, we'll learn about **Support and Resistance** - key price levels where stocks tend to bounce or break through.

**Preview Questions**:
- What makes a price level "support"?
- How do you identify resistance zones?
- What happens when support breaks?

## 📚 Additional Resources

- [Investopedia: Candlestick Patterns](https://www.investopedia.com/trading/candlestick-charting-what-is-it/)
- [BabyPips: Candlestick School](https://www.babypips.com/learn/forex/japanese-candlesticks)
- [TradingView: Candlestick Patterns](https://www.tradingview.com/support/solutions/43000502046-candlestick-patterns/)

## ✅ Solutions

1. **Four price points**: Open, High, Low, Close (OHLC)
2. **Long lower wick**: Sellers pushed price down, but buyers rejected lower prices and pushed back up
3. **Hammer vs Hanging Man**: Same appearance (small body, long lower wick), but hammer appears after downtrend (bullish), hanging man after uptrend (bearish)
4. **Doji at extremes**: Shows indecision after strong move, suggests trend may be exhausted and ready to reverse
5. **Engulfing confirmation**: Wait for next candle to close in direction of pattern, check volume increase, look for break of nearby support/resistance

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 2.2: Support and Resistance](lesson-02-support-resistance.md)
