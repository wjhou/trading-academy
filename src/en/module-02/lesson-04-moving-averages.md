# Lesson 2.4: Moving Averages - Smoothing Price Action

**Module**: 2 - Technical Analysis Basics
**Estimated Time**: 50 minutes
**Difficulty**: Beginner

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what moving averages are and how they work
- Learn the difference between SMA and EMA
- Know which moving averages to use for different timeframes
- Apply MA crossovers for trading signals
- Use MAs as dynamic support and resistance

## 📖 What is a Moving Average?

A **Moving Average (MA)** is the average price of a stock over a specific number of periods, recalculated as new data comes in.

### Purpose

- **Smooth out noise**: Filter out short-term price fluctuations
- **Identify trend**: Show the overall direction
- **Support/Resistance**: Act as dynamic price levels
- **Generate signals**: Crossovers indicate potential trades

### Example

```
10-day MA of closing prices:
Day 1-10 average: $150
Day 2-11 average: $151 (drop day 1, add day 11)
Day 3-12 average: $152 (drop day 2, add day 12)
...and so on
```

## 📊 Types of Moving Averages

### 1. Simple Moving Average (SMA)

**Formula**: Sum of prices / Number of periods

```
SMA = (P1 + P2 + P3 + ... + Pn) / n
```

**Example** (5-day SMA):
```
Day 1: $100
Day 2: $102
Day 3: $101
Day 4: $103
Day 5: $104

SMA = (100 + 102 + 101 + 103 + 104) / 5 = $102
```

**Characteristics**:
- Equal weight to all periods
- Slower to react to price changes
- Smoother line
- Better for longer-term trends

### 2. Exponential Moving Average (EMA)

**Formula**: Weighted average giving more weight to recent prices

```
EMA = (Price_today × K) + (EMA_yesterday × (1 - K))
where K = 2 / (n + 1)
```

**Characteristics**:
- More weight to recent prices
- Faster to react to price changes
- More responsive to trends
- Better for shorter-term trading

### SMA vs EMA Comparison

```
Price spikes up:

SMA: ────────╱─────  (slower reaction)
EMA: ───────╱──────  (faster reaction)
Price: ────╱────────
```

**When to use**:
- **SMA**: Long-term trends, less noise, institutional levels
- **EMA**: Short-term trading, quick reactions, day trading

## 🔢 Common Moving Average Periods

### Short-Term (Fast)

- **10-day MA**: Very responsive, day trading
- **20-day MA**: Swing trading, short-term trends
- **21-day MA**: Approximates one trading month

### Medium-Term

- **50-day MA**: Popular intermediate trend indicator
- **100-day MA**: Medium-term trend

### Long-Term (Slow)

- **200-day MA**: Most important long-term indicator
- **Institutional level**: Banks and funds watch this

### Multiple MA Strategy

Use 2-3 MAs together:
- **Fast**: 10 or 20-day
- **Medium**: 50-day
- **Slow**: 200-day

## 📈 Using Moving Averages

### 1. Trend Identification

**Price above MA = Uptrend**
```
Price: ─────────────╱─────
MA:    ────────────╱──────
```

**Price below MA = Downtrend**
```
MA:    ────────────╲──────
Price: ─────────────╲─────
```

**Price crossing MA = Potential trend change**

### 2. Dynamic Support and Resistance

MAs act as support in uptrends:
```
Price bounces off MA:
    ╱╲    ╱╲
   ╱  ╲  ╱  ╲
  ╱    ╲╱    ╲
 ╱            ╲
╱──────────────╲─── MA (support)
```

MAs act as resistance in downtrends:
```
MA (resistance) ────────────
╲            ╱
 ╲    ╱╲    ╱
  ╲  ╱  ╲  ╱
   ╲╱    ╲╱
```

**Trading Strategy**:
- **Uptrend**: Buy when price pulls back to MA
- **Downtrend**: Sell when price rallies to MA

### 3. Moving Average Crossovers

#### Golden Cross (Bullish)

**50-day MA crosses above 200-day MA**

```
50-day MA: ────────╱───────
200-day MA: ──────────────
                  ↑
            Golden Cross
```

**Signal**: Strong bullish signal, major uptrend starting

#### Death Cross (Bearish)

**50-day MA crosses below 200-day MA**

```
200-day MA: ──────────────
50-day MA: ────────╲───────
                  ↓
            Death Cross
```

**Signal**: Strong bearish signal, major downtrend starting

#### Fast/Slow MA Crossovers

**Example**: 10-day and 50-day MA

```
Buy Signal:
10-day crosses above 50-day

Sell Signal:
10-day crosses below 50-day
```

### 4. MA Ribbon

**Multiple MAs** (e.g., 10, 20, 30, 40, 50-day) create a "ribbon"

```
Strong Uptrend:
10-day ────────────────
20-day ───────────────
30-day ──────────────
40-day ─────────────
50-day ────────────
(All separated, in order)

Weak/Sideways:
All MAs ≈≈≈≈≈≈≈≈≈≈≈≈≈
(Tangled together)
```

**Interpretation**:
- **Separated and ordered**: Strong trend
- **Tangled**: Weak trend or sideways
- **Expanding**: Trend strengthening
- **Contracting**: Trend weakening

## 💻 Implementing Moving Averages

### Basic Calculation

```python
import yfinance as yf
import pandas as pd

# Get data
df = yf.Ticker("AAPL").history(period="1y")

# Calculate MAs
df['SMA_20'] = df['Close'].rolling(window=20).mean()
df['SMA_50'] = df['Close'].rolling(window=50).mean()
df['SMA_200'] = df['Close'].rolling(window=200).mean()

# Calculate EMAs
df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()

print(df[['Close', 'SMA_20', 'SMA_50', 'EMA_20']].tail())
```

### Detecting Crossovers

```python
def detect_crossover(df, fast_col, slow_col):
    """
    Detect MA crossovers
    Returns: 'golden' for bullish, 'death' for bearish, None otherwise
    """
    # Current and previous values
    fast_curr = df[fast_col].iloc[-1]
    fast_prev = df[fast_col].iloc[-2]
    slow_curr = df[slow_col].iloc[-1]
    slow_prev = df[slow_col].iloc[-2]

    # Golden cross: fast crosses above slow
    if fast_prev <= slow_prev and fast_curr > slow_curr:
        return 'golden'

    # Death cross: fast crosses below slow
    elif fast_prev >= slow_prev and fast_curr < slow_curr:
        return 'death'

    return None

# Example usage
crossover = detect_crossover(df, 'SMA_50', 'SMA_200')
if crossover == 'golden':
    print("Golden Cross detected! Bullish signal")
elif crossover == 'death':
    print("Death Cross detected! Bearish signal")
```

### MA-Based Trading Strategy

```python
class MovingAverageStrategy:
    def __init__(self, fast_period=20, slow_period=50):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signal(self, df):
        # Calculate MAs
        df['MA_fast'] = df['Close'].rolling(self.fast_period).mean()
        df['MA_slow'] = df['Close'].rolling(self.slow_period).mean()

        current_price = df['Close'].iloc[-1]
        ma_fast = df['MA_fast'].iloc[-1]
        ma_slow = df['MA_slow'].iloc[-1]

        # Trend determination
        if ma_fast > ma_slow:
            trend = "UPTREND"
        else:
            trend = "DOWNTREND"

        # Signal generation
        if trend == "UPTREND":
            # Buy pullback to fast MA
            if current_price <= ma_fast * 1.01:  # Within 1% of MA
                return "BUY"

        elif trend == "DOWNTREND":
            # Sell rally to fast MA
            if current_price >= ma_fast * 0.99:  # Within 1% of MA
                return "SELL"

        return "HOLD"

    def backtest(self, df):
        signals = []
        for i in range(self.slow_period, len(df)):
            signal = self.generate_signal(df.iloc[:i+1])
            signals.append(signal)
        return signals
```

## 🎯 MA Trading Strategies

### Strategy 1: MA Bounce

**Setup**: Buy when price bounces off MA in uptrend

```python
def ma_bounce_strategy(df, ma_period=50):
    df['MA'] = df['Close'].rolling(ma_period).mean()

    # Check if in uptrend
    if df['Close'].iloc[-1] > df['MA'].iloc[-1]:
        # Check if price touched MA
        if df['Low'].iloc[-1] <= df['MA'].iloc[-1] * 1.005:
            # Check if bouncing (closing above MA)
            if df['Close'].iloc[-1] > df['MA'].iloc[-1]:
                return "BUY"

    return "HOLD"
```

### Strategy 2: MA Crossover

**Setup**: Buy when fast MA crosses above slow MA

```python
def ma_crossover_strategy(df, fast=20, slow=50):
    df['MA_fast'] = df['Close'].rolling(fast).mean()
    df['MA_slow'] = df['Close'].rolling(slow).mean()

    # Golden cross
    if df['MA_fast'].iloc[-2] <= df['MA_slow'].iloc[-2] and \
       df['MA_fast'].iloc[-1] > df['MA_slow'].iloc[-1]:
        return "BUY"

    # Death cross
    elif df['MA_fast'].iloc[-2] >= df['MA_slow'].iloc[-2] and \
         df['MA_fast'].iloc[-1] < df['MA_slow'].iloc[-1]:
        return "SELL"

    return "HOLD"
```

### Strategy 3: Triple MA

**Setup**: Use 3 MAs for trend confirmation

```python
def triple_ma_strategy(df):
    df['MA_10'] = df['Close'].rolling(10).mean()
    df['MA_50'] = df['Close'].rolling(50).mean()
    df['MA_200'] = df['Close'].rolling(200).mean()

    ma10 = df['MA_10'].iloc[-1]
    ma50 = df['MA_50'].iloc[-1]
    ma200 = df['MA_200'].iloc[-1]
    price = df['Close'].iloc[-1]

    # Strong uptrend: all aligned
    if price > ma10 > ma50 > ma200:
        return "STRONG_BUY"

    # Uptrend: price above all MAs
    elif price > ma10 and price > ma50 and price > ma200:
        return "BUY"

    # Strong downtrend: all aligned
    elif price < ma10 < ma50 < ma200:
        return "STRONG_SELL"

    # Downtrend: price below all MAs
    elif price < ma10 and price < ma50 and price < ma200:
        return "SELL"

    return "HOLD"
```

## ⚠️ Limitations and Pitfalls

### 1. Lagging Indicator

MAs are based on past prices, so they lag:
- **Problem**: Late entries and exits
- **Solution**: Use with leading indicators (RSI, MACD)

### 2. Whipsaws in Sideways Markets

MAs generate false signals when price is ranging:
```
False signals in range:
Resistance ─────────────
    ╱╲  ╱╲  ╱╲  ╱╲
   ╱  ╲╱  ╲╱  ╲╱  ╲
  ╱              ╲
Support ─────────────
```

**Solution**: Avoid MA strategies in sideways markets

### 3. Choosing the Right Period

- Too short: Too many signals, whipsaws
- Too long: Too slow, miss opportunities

**Solution**: Test different periods for your timeframe

### 4. Not a Standalone System

MAs work best combined with:
- Volume analysis
- Support/Resistance
- Candlestick patterns
- Other indicators

## 🎓 Check Your Understanding

1. What's the difference between SMA and EMA?
2. What is a Golden Cross?
3. How do MAs act as support and resistance?
4. What are the limitations of MA crossover strategies?
5. Which MA is most important for long-term trends?

## 💻 Hands-On Exercise

Implement and test MA strategies:

```python
import yfinance as yf
import matplotlib.pyplot as plt

# Get data
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="2y")

# Calculate MAs
df['SMA_50'] = df['Close'].rolling(50).mean()
df['SMA_200'] = df['Close'].rolling(200).mean()

# Plot
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Close'], label='Price', linewidth=2)
plt.plot(df.index, df['SMA_50'], label='50-day SMA', linewidth=1.5)
plt.plot(df.index, df['SMA_200'], label='200-day SMA', linewidth=1.5)

# Mark crossovers
# Your task: Add markers for golden and death crosses

plt.title(f"{ticker} - Moving Averages")
plt.legend()
plt.grid(True)
plt.show()
```

## 📝 Exercise 2.4: MA Analysis

Create: `exercises/module-02/exercise-2.4-moving-averages.md`

1. Choose 3 stocks from different sectors
2. Calculate 20, 50, and 200-day SMAs
3. Identify current trend based on MA alignment
4. Find any recent crossovers
5. Suggest entry points based on MA bounces

## 🚀 Next Steps

In the next lesson, we'll learn about **Volume Analysis** - understanding the force behind price movements.

**Preview Questions**:
- Why is volume important?
- What does high volume on a breakout mean?
- How do you spot volume divergence?

## 📚 Additional Resources

- [Investopedia: Moving Averages](https://www.investopedia.com/terms/m/movingaverage.asp)
- [StockCharts: Moving Averages](https://school.stockcharts.com/doku.php?id=technical_indicators:moving_averages)
- [TradingView: MA Strategies](https://www.tradingview.com/support/solutions/43000502017-moving-average-ma/)

## ✅ Solutions

1. **SMA vs EMA**: SMA gives equal weight to all periods, slower to react; EMA gives more weight to recent prices, faster to react to changes

2. **Golden Cross**: When 50-day MA crosses above 200-day MA; strong bullish signal indicating potential major uptrend

3. **MAs as S/R**: In uptrends, price tends to bounce off MA (support); in downtrends, price gets rejected at MA (resistance); traders watch these levels creating self-fulfilling prophecy

4. **MA crossover limitations**: Lagging indicator (late signals), generates false signals in sideways markets (whipsaws), works best in trending markets only

5. **Most important long-term MA**: 200-day MA; widely watched by institutions, defines bull/bear market, acts as major support/resistance

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 2.5: Volume Analysis](lesson-05-volume-analysis.md)
