# Lesson 3.3: Volatility Indicators - Bollinger Bands

**Module**: 3 - Technical Indicators
**Estimated Time**: 50 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand what Bollinger Bands measure
- Learn to interpret band width and price position
- Recognize squeeze and expansion patterns
- Apply Bollinger Band trading strategies
- Combine with other indicators

## 📖 What are Bollinger Bands?

**Bollinger Bands** are volatility bands placed above and below a moving average, expanding and contracting based on market volatility.

### Developed By

John Bollinger in the 1980s

### Components

1. **Middle Band**: 20-period SMA
2. **Upper Band**: Middle Band + (2 × Standard Deviation)
3. **Lower Band**: Middle Band - (2 × Standard Deviation)

```
Upper Band ─────────────── (SMA + 2σ)
Middle Band ───────────── (20 SMA)
Lower Band ─────────────── (SMA - 2σ)
```

### What They Show

- **Band Width**: Market volatility
- **Price Position**: Relative price level
- **Trend**: Direction of middle band
- **Reversals**: Price touching bands

## 📊 Reading Bollinger Bands

### Price Position

**At Upper Band**: Overbought, strong uptrend
**At Lower Band**: Oversold, strong downtrend
**At Middle Band**: Fair value, potential support/resistance

### Band Width

**Wide Bands**: High volatility, strong trends
**Narrow Bands**: Low volatility, consolidation
**Expanding**: Volatility increasing
**Contracting**: Volatility decreasing (squeeze)

## 💻 Implementation

```python
def calculate_bollinger_bands(df, period=20, std_dev=2):
    df['BB_Middle'] = df['Close'].rolling(period).mean()
    df['BB_Std'] = df['Close'].rolling(period).std()
    df['BB_Upper'] = df['BB_Middle'] + (std_dev * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (std_dev * df['BB_Std'])
    df['BB_Width'] = df['BB_Upper'] - df['BB_Lower']
    return df
```

## 🎯 Trading Strategies

### 1. Bollinger Bounce

Buy at lower band, sell at upper band in ranging markets.

```python
def bollinger_bounce_strategy(df):
    price = df['Close'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    bb_upper = df['BB_Upper'].iloc[-1]

    if price <= bb_lower:
        return "BUY"
    elif price >= bb_upper:
        return "SELL"
    return "HOLD"
```

### 2. Bollinger Squeeze

Trade breakouts after low volatility periods.

```python
def bollinger_squeeze_strategy(df):
    bb_width = df['BB_Width'].iloc[-1]
    bb_width_avg = df['BB_Width'].rolling(50).mean().iloc[-1]

    # Squeeze: width < 50% of average
    if bb_width < bb_width_avg * 0.5:
        # Wait for breakout
        if df['Close'].iloc[-1] > df['BB_Upper'].iloc[-1]:
            return "BUY"
        elif df['Close'].iloc[-1] < df['BB_Lower'].iloc[-1]:
            return "SELL"
    return "HOLD"
```

### 3. Bollinger Trend

Ride trends when price walks the band.

```python
def bollinger_trend_strategy(df):
    price = df['Close'].iloc[-1]
    bb_upper = df['BB_Upper'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    bb_middle = df['BB_Middle'].iloc[-1]

    # Strong uptrend: price above middle, touching upper
    if price > bb_middle and price >= bb_upper * 0.98:
        return "HOLD_LONG"  # Stay in trade

    # Strong downtrend: price below middle, touching lower
    elif price < bb_middle and price <= bb_lower * 1.02:
        return "HOLD_SHORT"

    return "EXIT"
```

## 🔑 Key Patterns

### The Squeeze

Narrowest band width in 6 months → Big move coming

### Walking the Band

Price consistently touching upper/lower band → Strong trend

### Double Bottom/Top

Price touches band twice without breaking → Reversal

### Band Break

Price closes outside band → Continuation likely

## ⚠️ Limitations

- Not predictive of direction after squeeze
- Can give false signals in strong trends
- Requires confirmation from other indicators
- Standard settings may not fit all stocks

## 🎓 Check Your Understanding

1. What do Bollinger Bands measure?
2. What is a Bollinger Squeeze?
3. When should you use bounce vs breakout strategy?
4. What does "walking the band" indicate?
5. How do you combine Bollinger Bands with RSI?

## 💻 Exercise

```python
# Analyze Bollinger Band patterns
df = yf.Ticker("NVDA").history(period="1y")
df = calculate_bollinger_bands(df)

# Plot
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Close'], label='Price', linewidth=2)
plt.plot(df.index, df['BB_Upper'], 'r--', label='Upper Band')
plt.plot(df.index, df['BB_Middle'], 'g-', label='Middle Band')
plt.plot(df.index, df['BB_Lower'], 'r--', label='Lower Band')
plt.fill_between(df.index, df['BB_Upper'], df['BB_Lower'], alpha=0.1)
plt.legend()
plt.show()
```

## 📝 Exercise 3.3

Create: `exercises/module-03/exercise-3.3-bollinger.md`

1. Find 3 stocks with recent squeezes
2. Identify current band width percentile
3. Analyze price position relative to bands
4. Backtest bounce vs breakout strategies
5. Combine with MACD for confirmation

## 📚 Resources

- [Investopedia: Bollinger Bands](https://www.investopedia.com/terms/b/bollingerbands.asp)
- [StockCharts: Bollinger Bands](https://school.stockcharts.com/doku.php?id=technical_indicators:bollinger_bands)
- [John Bollinger's Website](https://www.bollingerbands.com/)

## ✅ Solutions

1. **Measure**: Volatility and relative price levels using standard deviation
2. **Squeeze**: When bands narrow to unusually tight width, indicating low volatility before big move
3. **Bounce vs Breakout**: Use bounce in ranging markets, breakout after squeezes or in trending markets
4. **Walking the band**: Strong trend when price consistently touches upper (uptrend) or lower (downtrend) band
5. **BB + RSI**: Use RSI to confirm overbought/oversold at bands; buy at lower band when RSI < 30, sell at upper when RSI > 70

---

**Next**: [Lesson 3.4: Volume Indicators](lesson-04-volume-indicators.md)
