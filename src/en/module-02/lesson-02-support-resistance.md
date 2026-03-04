# Lesson 2.2: Support and Resistance - Key Price Levels

**Module**: 2 - Technical Analysis Basics
**Estimated Time**: 50 minutes
**Difficulty**: Beginner

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what support and resistance levels are
- Learn how to identify these levels on charts
- Recognize the psychology behind support and resistance
- Know how to trade bounces and breakouts
- Apply support/resistance to risk management

## 📖 What are Support and Resistance?

**Support** and **Resistance** are price levels where buying or selling pressure is strong enough to prevent the price from moving further.

### Support

**Support** is a price level where buying pressure is strong enough to prevent the price from falling further.

```
Price
  ↑
  │     ╱╲
  │    ╱  ╲    ╱╲
  │   ╱    ╲  ╱  ╲
  │  ╱      ╲╱    ╲
  │ ╱              ╲
  │╱________________╲_____ ← Support Level
  └────────────────────→ Time
     Bounces here
```

**Think of it as a floor** - price bounces off it like a ball bouncing off the ground.

### Resistance

**Resistance** is a price level where selling pressure is strong enough to prevent the price from rising further.

```
Price
  ↑  _____________________ ← Resistance Level
  │  ╲                ╱
  │   ╲    ╱╲    ╱╲  ╱
  │    ╲  ╱  ╲  ╱  ╲╱
  │     ╲╱    ╲╱
  │
  └────────────────────→ Time
     Rejected here
```

**Think of it as a ceiling** - price gets pushed back down when it reaches this level.

## 🧠 The Psychology Behind S/R

### Why Support Works

At support levels:
1. **Previous Buyers** remember buying at this price and buy more
2. **Regretful Sellers** who sold here want to buy back
3. **New Buyers** see it as a good entry point
4. **Short Sellers** take profits (buy to close)

**Result**: Increased buying pressure prevents further decline

### Why Resistance Works

At resistance levels:
1. **Previous Buyers** who are breakeven want to sell
2. **Regretful Buyers** who bought higher want to exit
3. **New Sellers** see it as overvalued
4. **Short Sellers** enter positions

**Result**: Increased selling pressure prevents further rise

## 🔍 Identifying Support and Resistance

### Method 1: Historical Price Levels

Look for areas where price has bounced or been rejected multiple times.

```
AAPL Example:
$160 ─────────────── Resistance (rejected 3 times)
$155
$150 ─────────────── Support (bounced 4 times)
$145
```

**Rules**:
- More touches = stronger level
- Recent touches more important than old ones
- Exact prices less important than zones

### Method 2: Round Numbers

Psychological levels often act as S/R:
- $100, $150, $200 (whole numbers)
- $149.99, $199.99 (just below round numbers)

**Why**: Human psychology, option strike prices, institutional orders

### Method 3: Previous Highs and Lows

- **Swing Highs**: Local peaks often become resistance
- **Swing Lows**: Local troughs often become support

```
     Peak 1 (now resistance)
       ↓
      ╱╲
     ╱  ╲    ╱╲
    ╱    ╲  ╱  ╲
   ╱      ╲╱    ╲
  ╱              ╲
 ╱                ╲
╱                  ╲
                    ↑
              Trough (now support)
```

### Method 4: Moving Averages

Common MAs act as dynamic S/R:
- 50-day MA
- 200-day MA
- 20-day MA (for shorter timeframes)

**Advantage**: Adjusts with price, not static

### Method 5: Trendlines

Diagonal lines connecting highs or lows:

```
Uptrend Support:
    ╱
   ╱ ╱
  ╱ ╱
 ╱ ╱
╱ ╱
 ╱ ← Trendline support
```

## 🎯 Support and Resistance Zones

**Important**: S/R are not exact prices, but zones!

```
Instead of:              Think:
$150.00 ─────           $150.50 ┐
                        $150.00 │ Resistance Zone
                        $149.50 ┘
```

**Why zones?**:
- Different traders see slightly different levels
- Spreads and slippage
- Psychological ranges
- Institutional orders spread across range

**Practical tip**: Use $0.50 - $1.00 zones for stocks under $100, wider for higher-priced stocks

## 🔄 Role Reversal

**Key Concept**: When support breaks, it often becomes resistance (and vice versa)

```
Phase 1: Support holds
$50 ─────────────── Support
    ╲  ╱╲  ╱╲  ╱
     ╲╱  ╲╱  ╲╱

Phase 2: Support breaks
$50 ─────────────── Breaks down!
    ╲
     ╲
      ╲

Phase 3: Old support becomes resistance
$50 ─────────────── Now Resistance!
         ╱╲
        ╱  ╲
       ╱    ╲
```

**Why**: Previous buyers who are now underwater want to sell at breakeven

## 📊 Trading Support and Resistance

### Strategy 1: Bounce Trading

**Setup**: Buy at support, sell at resistance

```python
# Pseudocode
if price_near_support() and showing_bullish_signals():
    buy()
    set_stop_loss(below_support)
    set_target(at_resistance)

if price_near_resistance() and showing_bearish_signals():
    sell_or_short()
    set_stop_loss(above_resistance)
    set_target(at_support)
```

**Risk Management**:
- Stop loss just beyond S/R level
- Target at opposite S/R level
- Risk-reward ratio at least 1:2

### Strategy 2: Breakout Trading

**Setup**: Trade when price breaks through S/R

```
Resistance Breakout:
$155 ─────────────── Old Resistance
         ↑
         │ Breakout!
         │
    ╱╲  ╱│
   ╱  ╲╱ │
  ╱       │
```

**Requirements**:
1. **Strong momentum**: Fast, decisive break
2. **Volume increase**: Confirms genuine breakout
3. **Retest**: Price comes back to test old resistance (now support)

**Entry Points**:
- **Aggressive**: Enter on breakout
- **Conservative**: Wait for retest and bounce

### Strategy 3: Fakeout Trading

**Setup**: Trade against false breakouts

```
False Breakout:
$155 ─────────────── Resistance
         ╱╲
        ╱  ╲ ← Breaks above, then fails
       ╱    ╲
      ╱      ╲
```

**Signals**:
- Breakout on low volume
- Quick reversal back below level
- Long upper wick (shooting star)

**Trade**: Short when price fails and returns below resistance

## 🔢 Strength of S/R Levels

Not all S/R levels are equal. Stronger levels have:

1. **More Touches**: 3+ bounces stronger than 1
2. **Recent Activity**: Last month > last year
3. **High Volume**: More participants = stronger level
4. **Round Numbers**: $100, $150, $200
5. **Multiple Timeframes**: Works on daily AND weekly charts
6. **Confluence**: Multiple factors (MA + trendline + previous high)

### Example: Strong Resistance

```
AAPL at $150:
✓ Rejected 4 times in past 2 months
✓ Round number ($150.00)
✓ Coincides with 200-day MA
✓ Previous all-time high
✓ High volume at this level

→ Very strong resistance!
```

## 💻 Practical Implementation

### Finding S/R with Python

```python
import yfinance as yf
import pandas as pd
import numpy as np

def find_support_resistance(ticker, period="6mo"):
    # Get data
    df = yf.Ticker(ticker).history(period=period)

    # Find local maxima (resistance)
    df['resistance'] = df['High'][(df['High'].shift(1) < df['High']) &
                                    (df['High'].shift(-1) < df['High'])]

    # Find local minima (support)
    df['support'] = df['Low'][(df['Low'].shift(1) > df['Low']) &
                               (df['Low'].shift(-1) > df['Low'])]

    # Get significant levels (appeared multiple times)
    resistance_levels = df['resistance'].dropna()
    support_levels = df['support'].dropna()

    # Cluster nearby levels (within 2%)
    def cluster_levels(levels, tolerance=0.02):
        clusters = []
        for level in sorted(levels):
            if not clusters or level > clusters[-1] * (1 + tolerance):
                clusters.append(level)
            else:
                # Average with existing cluster
                clusters[-1] = (clusters[-1] + level) / 2
        return clusters

    resistance = cluster_levels(resistance_levels)
    support = cluster_levels(support_levels)

    return support, resistance

# Example usage
support, resistance = find_support_resistance("AAPL")
print(f"Support levels: {support}")
print(f"Resistance levels: {resistance}")
```

### Integrating with stock-agent-system

```python
# In your strategy
class SupportResistanceStrategy:
    def __init__(self):
        self.support_levels = []
        self.resistance_levels = []

    def update_levels(self, df):
        self.support_levels, self.resistance_levels = \
            find_support_resistance_from_df(df)

    def generate_signal(self, current_price):
        # Check if near support
        for support in self.support_levels:
            if abs(current_price - support) / support < 0.01:  # Within 1%
                if self.bullish_confirmation():
                    return "BUY"

        # Check if near resistance
        for resistance in self.resistance_levels:
            if abs(current_price - resistance) / resistance < 0.01:
                if self.bearish_confirmation():
                    return "SELL"

        return "HOLD"
```

## 🎓 Check Your Understanding

1. What is the difference between support and resistance?
2. Why do round numbers often act as S/R levels?
3. What happens when support breaks?
4. What are three ways to identify support levels?
5. How would you trade a breakout above resistance?

## 💻 Hands-On Exercise

Analyze a real stock:

```python
import yfinance as yf
import matplotlib.pyplot as plt

# Get data
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="1y")

# Plot
plt.figure(figsize=(12, 6))
plt.plot(df.index, df['Close'])
plt.title(f"{ticker} - Identify Support and Resistance")
plt.xlabel("Date")
plt.ylabel("Price")
plt.grid(True)
plt.show()

# Your task: Manually identify 2-3 support and 2-3 resistance levels
```

## 📝 Exercise 2.2: S/R Analysis

Create: `exercises/module-02/exercise-2.2-support-resistance.md`

1. Choose 3 stocks from different sectors
2. Identify 2 support and 2 resistance levels for each
3. Explain why each level is significant
4. Note the current price relative to these levels
5. Suggest a potential trade setup for each

## 🚀 Next Steps

In the next lesson, we'll learn about **Trend Identification** - how to determine if a stock is in an uptrend, downtrend, or sideways.

**Preview Questions**:
- What defines an uptrend?
- How do you spot trend reversals?
- What's the difference between a correction and a reversal?

## 📚 Additional Resources

- [Investopedia: Support and Resistance](https://www.investopedia.com/trading/support-and-resistance-basics/)
- [BabyPips: Support and Resistance](https://www.babypips.com/learn/forex/support-and-resistance)
- [TradingView: Drawing Support and Resistance](https://www.tradingview.com/support/solutions/43000474104-support-and-resistance/)

## ✅ Solutions

1. **Support vs Resistance**: Support is a price level where buying pressure prevents further decline (floor); resistance is where selling pressure prevents further rise (ceiling)

2. **Round numbers**: Human psychology makes us think in round numbers; institutional orders often cluster at these levels; option strikes are at round numbers

3. **When support breaks**: Price usually continues lower; old support often becomes new resistance (role reversal); signals trend change or acceleration

4. **Three ways to identify support**: (1) Historical price levels where price bounced multiple times, (2) Previous swing lows, (3) Round numbers or moving averages

5. **Trading resistance breakout**: Wait for decisive break above resistance with high volume; enter on breakout or wait for retest; set stop loss below old resistance (now support); target next resistance level or use trailing stop

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 2.3: Trend Identification](lesson-03-trends.md)
