# Lesson 1.3: Reading Stock Prices and Charts

**Module**: 1 - Trading Fundamentals
**Estimated Time**: 50 minutes
**Difficulty**: Beginner
**Prerequisites**: Lessons 1.1, 1.2

## 🎯 Learning Objectives

- Understand OHLC (Open, High, Low, Close) data
- Learn to read candlestick charts
- Identify basic candlestick patterns
- Understand timeframes and their importance
- Use stock-agent-system to visualize price data

## 📊 What is Price Data?

Every trading period (minute, hour, day) has four key prices:

### OHLC - The Four Prices

**Open**: First price when the period starts
**High**: Highest price during the period
**Low**: Lowest price during the period
**Close**: Last price when the period ends

### Example: Daily OHLC for AAPL

```
Date: 2024-01-15
Open:  $150.00  (9:30 AM)
High:  $153.50  (2:15 PM)
Low:   $149.25  (10:00 AM)
Close: $152.75  (4:00 PM)
```

**What this tells us**:
- Stock opened at $150
- Reached a high of $153.50 (buyers pushed it up)
- Dropped to $149.25 at one point (sellers pushed it down)
- Ended the day at $152.75 (net gain of $2.75)

## 🕯️ Candlestick Charts

Candlesticks visualize OHLC data in an intuitive way.

### Anatomy of a Candlestick

```
        |  <- Upper Shadow (High)
        |
    ┌───────┐
    │       │  <- Body (Open to Close)
    │       │
    └───────┘
        |
        |  <- Lower Shadow (Low)
```

### Bullish Candle (Price Up)

```
Close: $155  |
         ┌───────┐
         │ GREEN │  Body = Close > Open
         │       │
         └───────┘
Open: $150   |
```

- **Body**: Open to Close (filled green/white)
- **Upper Shadow**: High above Close
- **Lower Shadow**: Low below Open
- **Meaning**: Buyers won, price went up

### Bearish Candle (Price Down)

```
Open: $155   |
         ┌───────┐
         │  RED  │  Body = Close < Open
         │       │
         └───────┘
Close: $150  |
```

- **Body**: Open to Close (filled red/black)
- **Upper Shadow**: High above Open
- **Lower Shadow**: Low below Close
- **Meaning**: Sellers won, price went down

## 📈 Reading Candlestick Patterns

### Long Body = Strong Movement

```
    |
┌───────┐
│       │  <- Long green body
│       │     Strong buying pressure
│       │
└───────┘
    |
```

### Short Body = Indecision

```
    |
    |
  ┌─┐  <- Short body
  └─┘     Buyers and sellers balanced
    |
    |
```

### Long Shadows = Rejection

```
    |
    |  <- Long upper shadow
  ┌─┐     Price rejected at high
  └─┘
    |  <- Long lower shadow
    |     Price rejected at low
```

## 🔍 Common Candlestick Patterns

### 1. Doji - Indecision

```
    |
    |
    +  <- Open = Close
    |
    |
```

**Meaning**: Buyers and sellers are equal, potential reversal

### 2. Hammer - Bullish Reversal

```

  ┌─┐
  └─┘
    |
    |  <- Long lower shadow
    |
```

**Meaning**: Sellers pushed down, buyers pushed back up strongly

### 3. Shooting Star - Bearish Reversal

```
    |
    |  <- Long upper shadow
    |
  ┌─┐
  └─┘
```

**Meaning**: Buyers pushed up, sellers pushed back down strongly

### 4. Engulfing Pattern

**Bullish Engulfing**:
```
  ┌─┐ ┌───────┐
  │R│ │ GREEN │  <- Green candle engulfs red
  └─┘ │       │
      └───────┘
```

**Bearish Engulfing**:
```
┌───────┐ ┌─┐
│ GREEN │ │R│  <- Red candle engulfs green
│       │ └─┘
└───────┘
```

## ⏰ Timeframes

The same stock looks different on different timeframes!

### Common Timeframes

- **1-minute**: Each candle = 1 minute (day traders)
- **5-minute**: Each candle = 5 minutes (scalpers)
- **15-minute**: Each candle = 15 minutes (intraday)
- **1-hour**: Each candle = 1 hour (swing traders)
- **Daily**: Each candle = 1 day (position traders)
- **Weekly**: Each candle = 1 week (long-term)

### Example: AAPL on Different Timeframes

**1-minute chart**: Shows every tiny movement, very noisy
**Daily chart**: Shows overall trend, filters out noise
**Weekly chart**: Shows long-term direction, very smooth

**Rule**: Higher timeframes = more reliable signals

## 💻 Hands-On: Visualize with stock-agent-system

Let's generate a price chart with candlesticks!

```python
# Create a script to visualize price data
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

python3 << 'EOF'
import asyncio
from datetime import datetime, timedelta
from stock_agent.core.config import load_config
from stock_agent.data.aggregator import DataAggregator
from stock_agent.core.types import TimeFrame, Market

async def main():
    config = load_config("configs/default.yaml")
    aggregator = DataAggregator.from_config(config)

    # Fetch 30 days of daily data
    symbol = "AAPL"
    end = datetime.now()
    start = end - timedelta(days=30)

    bars = await aggregator.get_historical_bars(
        symbol=symbol,
        timeframe=TimeFrame.DAILY,
        start=start,
        end=end,
        market=Market.US,
    )

    print(f"\n{symbol} - Last 10 Days:")
    print("-" * 80)
    print(f"{'Date':<12} {'Open':>8} {'High':>8} {'Low':>8} {'Close':>8} {'Volume':>12}")
    print("-" * 80)

    for bar in bars[-10:]:
        date_str = bar.timestamp.strftime("%Y-%m-%d")
        print(f"{date_str:<12} {bar.open:>8.2f} {bar.high:>8.2f} "
              f"{bar.low:>8.2f} {bar.close:>8.2f} {bar.volume:>12,.0f}")

    await aggregator.close()

asyncio.run(main())
EOF
```

**Expected Output**:
```
AAPL - Last 10 Days:
--------------------------------------------------------------------------------
Date         Open     High      Low    Close       Volume
--------------------------------------------------------------------------------
2024-02-20  150.00   153.50   149.25   152.75   45,234,567
2024-02-21  152.80   154.20   151.50   153.90   38,456,789
...
```

## 📝 Exercise 1.3: Chart Reading Practice

Create: `exercises/module-01/exercise-1.3-chart-reading.md`

For each candlestick pattern, identify:

1. **Pattern A**:
   ```
       |
       |
     ┌─┐
     └─┘
       |
       |
       |
   ```
   - Pattern name?
   - Bullish or bearish?
   - What does it mean?

2. **Pattern B**:
   ```
   ┌───────┐
   │ GREEN │
   │       │
   └───────┘
       |
   ```
   - What type of candle?
   - Strong or weak movement?
   - What happened during this period?

3. **Real Data Analysis**:
   - Run the visualization script above
   - Pick one day with a large price range (High - Low)
   - Describe what happened that day

## 🎯 Reading a Chart: Step-by-Step

### Step 1: Identify the Timeframe
- Daily? Hourly? 5-minute?
- This determines what each candle represents

### Step 2: Look at the Overall Trend
- Are prices generally going up, down, or sideways?
- Don't focus on individual candles yet

### Step 3: Examine Individual Candles
- Long bodies = strong moves
- Long shadows = rejection/indecision
- Color = who won (buyers or sellers)

### Step 4: Look for Patterns
- Dojis at tops/bottoms
- Engulfing patterns
- Hammers and shooting stars

### Step 5: Consider Volume
- High volume = strong conviction
- Low volume = weak move, may reverse

## 🔑 Key Takeaways

1. **OHLC** = Open, High, Low, Close (the four key prices)
2. **Candlesticks** visualize OHLC data intuitively
3. **Green/White** = bullish (close > open)
4. **Red/Black** = bearish (close < open)
5. **Body size** = strength of movement
6. **Shadows** = rejection and indecision
7. **Timeframe matters** = higher timeframes more reliable
8. **Patterns** give clues about future direction

## 🧪 Practical Exercise: Generate Your First Chart

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

# Generate a chart with indicators
python scripts/generate_chart.py
```

This creates a chart with:
- Price candlesticks
- Moving averages
- Volume bars
- Buy/sell signals

**Study the chart**:
- Can you identify bullish and bearish candles?
- Where are the long shadows?
- What patterns do you see?

## 🚀 Next Lesson

[Lesson 1.4: Understanding Volume and Liquidity](lesson-04-volume-liquidity.md)

You'll learn:
- What volume means and why it matters
- How to interpret volume patterns
- What liquidity is and why it's important
- How to avoid illiquid stocks

---

**Completed?** ✓ Mark done: `python track_progress.py lesson module-01 3`
