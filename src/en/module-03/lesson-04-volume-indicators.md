# Lesson 3.4: Volume Indicators - OBV, VWAP, and More

**Module**: 3 - Technical Indicators
**Estimated Time**: 45 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand volume-based indicators
- Learn OBV (On-Balance Volume)
- Master VWAP (Volume-Weighted Average Price)
- Apply volume indicators to trading
- Combine volume with price action

## 📖 Volume Indicators Overview

Volume indicators use trading volume to confirm price movements and identify potential reversals.

### Why Volume Indicators Matter

- **Confirm trends**: High volume validates price moves
- **Spot divergences**: Volume/price disagreement signals reversals
- **Identify accumulation/distribution**: Smart money activity
- **Measure conviction**: Strength behind moves

## 📊 On-Balance Volume (OBV)

### What is OBV?

Cumulative volume indicator that adds volume on up days and subtracts on down days.

### Formula

```
If Close > Previous Close: OBV = Previous OBV + Volume
If Close < Previous Close: OBV = Previous OBV - Volume
If Close = Previous Close: OBV = Previous OBV
```

### Implementation

```python
def calculate_obv(df):
    obv = [0]
    for i in range(1, len(df)):
        if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
            obv.append(obv[-1] + df['Volume'].iloc[i])
        elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
            obv.append(obv[-1] - df['Volume'].iloc[i])
        else:
            obv.append(obv[-1])
    df['OBV'] = obv
    return df
```

### Reading OBV

**Rising OBV**: Accumulation, bullish
**Falling OBV**: Distribution, bearish
**OBV Divergence**: Price/OBV disagreement, reversal signal

### OBV Strategy

```python
def obv_strategy(df):
    # Calculate OBV trend
    obv_ma = df['OBV'].rolling(20).mean()
    obv_curr = df['OBV'].iloc[-1]
    obv_prev = df['OBV'].iloc[-2]

    # Buy when OBV crosses above MA
    if obv_prev <= obv_ma.iloc[-2] and obv_curr > obv_ma.iloc[-1]:
        return "BUY"
    # Sell when OBV crosses below MA
    elif obv_prev >= obv_ma.iloc[-2] and obv_curr < obv_ma.iloc[-1]:
        return "SELL"
    return "HOLD"
```

## 📈 VWAP (Volume-Weighted Average Price)

### What is VWAP?

Average price weighted by volume - shows the "fair value" for the day.

### Formula

```
VWAP = Σ(Price × Volume) / Σ(Volume)

where Price = (High + Low + Close) / 3
```

### Implementation

```python
def calculate_vwap(df):
    df['Typical_Price'] = (df['High'] + df['Low'] + df['Close']) / 3
    df['TP_Volume'] = df['Typical_Price'] * df['Volume']
    df['VWAP'] = df['TP_Volume'].cumsum() / df['Volume'].cumsum()
    return df
```

### Reading VWAP

**Price > VWAP**: Bullish, buyers in control
**Price < VWAP**: Bearish, sellers in control
**Price at VWAP**: Fair value, support/resistance

### VWAP Strategy

```python
def vwap_strategy(df):
    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]

    # Buy when price crosses above VWAP
    if df['Close'].iloc[-2] <= df['VWAP'].iloc[-2] and price > vwap:
        return "BUY"
    # Sell when price crosses below VWAP
    elif df['Close'].iloc[-2] >= df['VWAP'].iloc[-2] and price < vwap:
        return "SELL"
    return "HOLD"
```

## 📊 Other Volume Indicators

### 1. Accumulation/Distribution Line (A/D)

Similar to OBV but considers where price closes within the range.

```python
def calculate_ad_line(df):
    clv = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
    df['AD_Line'] = (clv * df['Volume']).cumsum()
    return df
```

### 2. Chaikin Money Flow (CMF)

Measures buying/selling pressure over a period.

```python
def calculate_cmf(df, period=20):
    clv = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
    mfv = clv * df['Volume']
    df['CMF'] = mfv.rolling(period).sum() / df['Volume'].rolling(period).sum()
    return df
```

**Reading**: CMF > 0 = Buying pressure, CMF < 0 = Selling pressure

### 3. Volume Rate of Change (VROC)

Measures rate of change in volume.

```python
def calculate_vroc(df, period=14):
    df['VROC'] = ((df['Volume'] - df['Volume'].shift(period)) /
                   df['Volume'].shift(period)) * 100
    return df
```

## 🎯 Combined Volume Strategies

### Strategy 1: OBV + Price Divergence

```python
def obv_divergence_strategy(df, lookback=20):
    # Find price and OBV highs/lows
    price_high = df['High'].iloc[-lookback:].max()
    price_low = df['Low'].iloc[-lookback:].min()
    obv_high = df['OBV'].iloc[-lookback:].max()
    obv_low = df['OBV'].iloc[-lookback:].min()

    curr_price = df['Close'].iloc[-1]
    curr_obv = df['OBV'].iloc[-1]

    # Bullish divergence: price lower low, OBV higher low
    if curr_price < price_low and curr_obv > obv_low:
        return "BUY"
    # Bearish divergence: price higher high, OBV lower high
    elif curr_price > price_high and curr_obv < obv_high:
        return "SELL"
    return "HOLD"
```

### Strategy 2: VWAP + Volume Spike

```python
def vwap_volume_strategy(df):
    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]
    volume = df['Volume'].iloc[-1]
    avg_volume = df['Volume'].rolling(20).mean().iloc[-1]

    # Buy: Price crosses above VWAP with high volume
    if price > vwap and volume > avg_volume * 1.5:
        if df['Close'].iloc[-2] <= df['VWAP'].iloc[-2]:
            return "BUY"

    # Sell: Price crosses below VWAP with high volume
    elif price < vwap and volume > avg_volume * 1.5:
        if df['Close'].iloc[-2] >= df['VWAP'].iloc[-2]:
            return "SELL"

    return "HOLD"
```

### Strategy 3: Multi-Volume Confirmation

```python
def multi_volume_strategy(df):
    # Calculate all indicators
    df = calculate_obv(df)
    df = calculate_vwap(df)
    df = calculate_cmf(df)

    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]
    obv_trend = df['OBV'].iloc[-1] > df['OBV'].iloc[-20]
    cmf = df['CMF'].iloc[-1]

    # Strong buy: All volume indicators bullish
    if price > vwap and obv_trend and cmf > 0.1:
        return "STRONG_BUY"

    # Strong sell: All volume indicators bearish
    elif price < vwap and not obv_trend and cmf < -0.1:
        return "STRONG_SELL"

    return "HOLD"
```

## 💻 Practical Application

### Complete Volume Analysis

```python
import yfinance as yf
import matplotlib.pyplot as plt

def analyze_volume_indicators(ticker, period="6mo"):
    # Get data
    df = yf.Ticker(ticker).history(period=period)

    # Calculate indicators
    df = calculate_obv(df)
    df = calculate_vwap(df)
    df = calculate_cmf(df)

    # Plot
    fig, axes = plt.subplots(4, 1, figsize=(14, 12), sharex=True)

    # Price
    axes[0].plot(df.index, df['Close'], label='Price')
    axes[0].plot(df.index, df['VWAP'], label='VWAP', alpha=0.7)
    axes[0].set_title(f"{ticker} - Price and VWAP")
    axes[0].legend()
    axes[0].grid(True)

    # Volume
    axes[1].bar(df.index, df['Volume'], alpha=0.5)
    axes[1].set_title("Volume")
    axes[1].grid(True)

    # OBV
    axes[2].plot(df.index, df['OBV'])
    axes[2].set_title("On-Balance Volume (OBV)")
    axes[2].grid(True)

    # CMF
    axes[3].plot(df.index, df['CMF'])
    axes[3].axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    axes[3].fill_between(df.index, 0, df['CMF'], where=df['CMF']>=0, alpha=0.3, color='green')
    axes[3].fill_between(df.index, 0, df['CMF'], where=df['CMF']<0, alpha=0.3, color='red')
    axes[3].set_title("Chaikin Money Flow (CMF)")
    axes[3].grid(True)

    plt.tight_layout()
    plt.show()

    return df

# Example
df = analyze_volume_indicators("AAPL")
```

## ⚠️ Limitations

- **OBV**: Absolute values meaningless, only trend matters
- **VWAP**: Resets daily, not useful for multi-day analysis
- **Volume indicators**: Lag price, need confirmation
- **False signals**: Can occur in low-volume stocks

## 🎓 Check Your Understanding

1. What does OBV measure?
2. How is VWAP calculated?
3. What is a bullish OBV divergence?
4. When is VWAP most useful?
5. How do you combine volume indicators with price action?

## 📝 Exercise 3.4

Create: `exercises/module-03/exercise-3.4-volume-indicators.md`

1. Calculate OBV, VWAP, and CMF for 3 stocks
2. Identify any OBV divergences
3. Analyze price behavior around VWAP
4. Compare volume indicator signals
5. Backtest a volume-based strategy

## 📚 Resources

- [Investopedia: OBV](https://www.investopedia.com/terms/o/onbalancevolume.asp)
- [Investopedia: VWAP](https://www.investopedia.com/terms/v/vwap.asp)
- [StockCharts: Volume Indicators](https://school.stockcharts.com/doku.php?id=technical_indicators:introduction_to_volume)

## ✅ Solutions

1. **OBV measures**: Cumulative buying/selling pressure by adding volume on up days and subtracting on down days
2. **VWAP calculation**: Sum of (price × volume) divided by total volume, where price is typical price (H+L+C)/3
3. **Bullish OBV divergence**: Price makes lower low while OBV makes higher low, indicating accumulation despite price decline
4. **VWAP most useful**: Intraday trading, institutional benchmarking, identifying fair value and support/resistance
5. **Combining volume with price**: Use volume to confirm breakouts, validate trends, spot divergences; high volume strengthens price signals

---

**Next**: [Lesson 3.5: Combining Indicators](lesson-05-combining.md)
