# Lesson 3.5: Combining Indicators - Building a Complete System

**Module**: 3 - Technical Indicators
**Estimated Time**: 60 minutes
**Difficulty**: Intermediate to Advanced

## 🎯 Learning Objectives

- Learn how to combine multiple indicators effectively
- Understand indicator categories and complementary pairs
- Build multi-indicator trading systems
- Avoid common pitfalls of indicator overload
- Create robust confirmation strategies

## 📖 Why Combine Indicators?

Single indicators have limitations. Combining them provides:

- **Confirmation**: Multiple signals reduce false positives
- **Complementary information**: Different aspects of market
- **Reduced whipsaws**: Filter out noise
- **Higher probability setups**: Confluence increases success rate

### The Problem with Too Many Indicators

**Indicator overload** leads to:
- Analysis paralysis
- Conflicting signals
- Curve-fitting (works on past data only)
- Missed opportunities

**Rule of thumb**: Use 3-5 indicators maximum

## 📊 Indicator Categories

### 1. Trend Indicators

**What they show**: Direction and strength of trend

**Examples**:
- Moving Averages (SMA, EMA)
- MACD
- ADX (Average Directional Index)

**Use for**: Identifying trend direction

### 2. Momentum Indicators

**What they show**: Speed of price changes

**Examples**:
- RSI
- Stochastic Oscillator
- Rate of Change (ROC)

**Use for**: Overbought/oversold, divergences

### 3. Volatility Indicators

**What they show**: Price fluctuation range

**Examples**:
- Bollinger Bands
- ATR (Average True Range)
- Keltner Channels

**Use for**: Breakouts, stop-loss placement

### 4. Volume Indicators

**What they show**: Trading activity and conviction

**Examples**:
- OBV
- VWAP
- CMF

**Use for**: Confirming price moves

## 🎯 Effective Indicator Combinations

### Combination 1: Trend + Momentum

**Purpose**: Trade pullbacks in trends

**Indicators**:
- 50-day MA (trend)
- RSI (momentum)

**Strategy**:
```python
def trend_momentum_strategy(df):
    price = df['Close'].iloc[-1]
    ma_50 = df['Close'].rolling(50).mean().iloc[-1]
    rsi = calculate_rsi(df).iloc[-1]

    # Uptrend + oversold = buy
    if price > ma_50 and 30 < rsi < 40:
        return "BUY"

    # Downtrend + overbought = sell
    elif price < ma_50 and 60 < rsi < 70:
        return "SELL"

    return "HOLD"
```

### Combination 2: Trend + Volatility

**Purpose**: Trade breakouts from consolidation

**Indicators**:
- MACD (trend)
- Bollinger Bands (volatility)

**Strategy**:
```python
def trend_volatility_strategy(df):
    df = calculate_macd(df)
    df = calculate_bollinger_bands(df)

    macd = df['MACD'].iloc[-1]
    signal = df['Signal'].iloc[-1]
    bb_width = df['BB_Width'].iloc[-1]
    bb_width_avg = df['BB_Width'].rolling(50).mean().iloc[-1]
    price = df['Close'].iloc[-1]
    bb_upper = df['BB_Upper'].iloc[-1]

    # Squeeze + bullish MACD crossover + breakout
    if bb_width < bb_width_avg * 0.6:  # Squeeze
        if macd > signal and price > bb_upper:  # Bullish breakout
            return "BUY"

    return "HOLD"
```

### Combination 3: Momentum + Volume

**Purpose**: Confirm momentum with volume

**Indicators**:
- RSI (momentum)
- OBV (volume)

**Strategy**:
```python
def momentum_volume_strategy(df):
    df['RSI'] = calculate_rsi(df)
    df = calculate_obv(df)

    rsi = df['RSI'].iloc[-1]
    rsi_prev = df['RSI'].iloc[-2]
    obv_trend = df['OBV'].iloc[-1] > df['OBV'].rolling(20).mean().iloc[-1]

    # RSI crossing 50 + OBV confirming
    if rsi_prev < 50 and rsi >= 50 and obv_trend:
        return "BUY"
    elif rsi_prev > 50 and rsi <= 50 and not obv_trend:
        return "SELL"

    return "HOLD"
```

### Combination 4: Triple Confirmation

**Purpose**: High-probability setups

**Indicators**:
- MA (trend)
- MACD (momentum)
- Volume (confirmation)

**Strategy**:
```python
def triple_confirmation_strategy(df):
    # Calculate indicators
    df['MA_50'] = df['Close'].rolling(50).mean()
    df = calculate_macd(df)

    price = df['Close'].iloc[-1]
    ma_50 = df['MA_50'].iloc[-1]
    macd = df['MACD'].iloc[-1]
    signal = df['Signal'].iloc[-1]
    volume = df['Volume'].iloc[-1]
    avg_volume = df['Volume'].rolling(20).mean().iloc[-1]

    # All three confirm bullish
    if (price > ma_50 and  # Trend
        macd > signal and  # Momentum
        volume > avg_volume * 1.3):  # Volume
        return "BUY"

    # All three confirm bearish
    elif (price < ma_50 and
          macd < signal and
          volume > avg_volume * 1.3):
        return "SELL"

    return "HOLD"
```

## 🏗️ Building a Complete Trading System

### Step 1: Define Your Timeframe

- **Day trading**: 5-min, 15-min charts
- **Swing trading**: Daily charts
- **Position trading**: Weekly charts

### Step 2: Choose Complementary Indicators

Pick one from each category:
1. **Trend**: MA or MACD
2. **Momentum**: RSI or Stochastic
3. **Volume**: OBV or VWAP
4. **Optional Volatility**: Bollinger Bands or ATR

### Step 3: Define Entry Rules

All conditions must be met:

```python
class TradingSystem:
    def __init__(self):
        self.indicators = {}

    def calculate_indicators(self, df):
        # Trend
        df['MA_50'] = df['Close'].rolling(50).mean()
        df['MA_200'] = df['Close'].rolling(200).mean()

        # Momentum
        df['RSI'] = calculate_rsi(df)

        # Trend/Momentum
        df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

        # Volume
        df = calculate_obv(df)

        # Volatility
        df = calculate_bollinger_bands(df)

        return df

    def generate_signal(self, df):
        df = self.calculate_indicators(df)

        # Current values
        price = df['Close'].iloc[-1]
        ma_50 = df['MA_50'].iloc[-1]
        ma_200 = df['MA_200'].iloc[-1]
        rsi = df['RSI'].iloc[-1]
        macd = df['MACD'].iloc[-1]
        signal = df['Signal'].iloc[-1]
        obv_ma = df['OBV'].rolling(20).mean().iloc[-1]
        obv = df['OBV'].iloc[-1]

        # LONG ENTRY CONDITIONS
        if (price > ma_50 > ma_200 and  # Strong uptrend
            30 < rsi < 60 and  # Not overbought
            macd > signal and  # Bullish momentum
            obv > obv_ma):  # Volume confirming
            return "BUY"

        # SHORT ENTRY CONDITIONS
        elif (price < ma_50 < ma_200 and  # Strong downtrend
              40 < rsi < 70 and  # Not oversold
              macd < signal and  # Bearish momentum
              obv < obv_ma):  # Volume confirming
            return "SELL"

        return "HOLD"

    def get_stop_loss(self, df, entry_price, direction):
        """Calculate stop loss using ATR"""
        atr = calculate_atr(df, period=14).iloc[-1]

        if direction == "LONG":
            return entry_price - (2 * atr)
        else:  # SHORT
            return entry_price + (2 * atr)

    def get_take_profit(self, df, entry_price, stop_loss, direction):
        """Calculate take profit for 2:1 risk-reward"""
        risk = abs(entry_price - stop_loss)

        if direction == "LONG":
            return entry_price + (2 * risk)
        else:  # SHORT
            return entry_price - (2 * risk)
```

### Step 4: Define Exit Rules

```python
def should_exit(self, df, position):
    """
    Exit conditions
    """
    price = df['Close'].iloc[-1]
    rsi = df['RSI'].iloc[-1]
    macd = df['MACD'].iloc[-1]
    signal = df['Signal'].iloc[-1]

    if position == "LONG":
        # Exit long if:
        if (rsi > 70 or  # Overbought
            macd < signal or  # Momentum turning
            price < df['MA_50'].iloc[-1]):  # Trend broken
            return True

    elif position == "SHORT":
        # Exit short if:
        if (rsi < 30 or  # Oversold
            macd > signal or  # Momentum turning
            price > df['MA_50'].iloc[-1]):  # Trend broken
            return True

    return False
```

## 📊 Advanced Combinations

### The "Three Screens" System (by Dr. Alexander Elder)

**Screen 1**: Weekly trend (MA or MACD)
**Screen 2**: Daily oscillator (RSI or Stochastic)
**Screen 3**: Intraday entry (price action)

```python
def three_screens_system(df_weekly, df_daily, df_hourly):
    # Screen 1: Weekly trend
    weekly_trend = "UP" if df_weekly['MA_50'].iloc[-1] > df_weekly['MA_200'].iloc[-1] else "DOWN"

    # Screen 2: Daily oscillator
    daily_rsi = calculate_rsi(df_daily).iloc[-1]

    # Screen 3: Hourly entry
    hourly_price = df_hourly['Close'].iloc[-1]
    hourly_ma = df_hourly['Close'].rolling(20).mean().iloc[-1]

    # Buy setup
    if weekly_trend == "UP" and daily_rsi < 40:
        if hourly_price > hourly_ma:
            return "BUY"

    # Sell setup
    elif weekly_trend == "DOWN" and daily_rsi > 60:
        if hourly_price < hourly_ma:
            return "SELL"

    return "HOLD"
```

### The "Confluence" System

Look for multiple indicators agreeing at key price levels:

```python
def confluence_system(df):
    """
    Find confluence of multiple factors
    """
    price = df['Close'].iloc[-1]

    # Find support/resistance
    support_levels = find_support_levels(df)
    resistance_levels = find_resistance_levels(df)

    # Check indicators
    ma_50 = df['MA_50'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]

    # Count bullish confluences
    bullish_confluence = 0

    # Price near support
    for support in support_levels:
        if abs(price - support) / support < 0.02:
            bullish_confluence += 1

    # Price near MA support
    if abs(price - ma_50) / ma_50 < 0.01:
        bullish_confluence += 1

    # Price near BB lower
    if abs(price - bb_lower) / bb_lower < 0.01:
        bullish_confluence += 1

    # Price near VWAP
    if abs(price - vwap) / vwap < 0.01:
        bullish_confluence += 1

    # Strong confluence (3+ factors)
    if bullish_confluence >= 3:
        return "STRONG_BUY_ZONE"

    return "NEUTRAL"
```

## ⚠️ Common Mistakes to Avoid

### 1. Using Correlated Indicators

**Problem**: RSI + Stochastic + CCI all measure momentum
**Solution**: Use indicators from different categories

### 2. Ignoring Timeframes

**Problem**: Daily signal contradicts weekly trend
**Solution**: Align with higher timeframe

### 3. Over-Optimization

**Problem**: System works perfectly on past data, fails live
**Solution**: Keep it simple, test on out-of-sample data

### 4. No Risk Management

**Problem**: Great signals but no stop-loss
**Solution**: Always define risk before entry

### 5. Waiting for Perfect Setup

**Problem**: All 5 indicators must align = miss trades
**Solution**: Define minimum requirements (e.g., 3 out of 4)

## 🎓 Check Your Understanding

1. Why combine indicators from different categories?
2. What is the "three screens" approach?
3. How many indicators should you use?
4. What is confluence trading?
5. What's the difference between confirmation and correlation?

## 💻 Hands-On Exercise

Build your own trading system:

```python
# Create a complete trading system
class MyTradingSystem:
    def __init__(self, trend_indicator, momentum_indicator, volume_indicator):
        self.trend = trend_indicator
        self.momentum = momentum_indicator
        self.volume = volume_indicator

    def analyze(self, ticker, period="1y"):
        df = yf.Ticker(ticker).history(period=period)

        # Calculate your chosen indicators
        # Define entry/exit rules
        # Backtest the system

        return results

# Example
system = MyTradingSystem(
    trend_indicator="MA_50_200",
    momentum_indicator="RSI",
    volume_indicator="OBV"
)

results = system.analyze("AAPL")
```

## 📝 Exercise 3.5

Create: `exercises/module-03/exercise-3.5-combining.md`

1. Design a 3-indicator trading system
2. Define clear entry and exit rules
3. Backtest on 3 different stocks
4. Compare performance vs single indicators
5. Document what works and what doesn't

## 📚 Resources

- [Investopedia: Technical Indicators](https://www.investopedia.com/terms/t/technicalindicator.asp)
- [Elder: Come Into My Trading Room](https://www.amazon.com/Come-Into-My-Trading-Room/dp/0471225347)
- [Pring: Technical Analysis Explained](https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177)

## ✅ Solutions

1. **Different categories**: Each category provides unique information (trend direction, momentum speed, volatility range, volume confirmation); combining reduces false signals

2. **Three screens**: Multi-timeframe approach - weekly for trend, daily for timing, intraday for entry; ensures trading with larger trend

3. **How many indicators**: 3-5 maximum; one from each category; more creates confusion and conflicting signals

4. **Confluence trading**: Multiple technical factors (indicators, support/resistance, MAs) aligning at same price level; increases probability of successful trade

5. **Confirmation vs correlation**: Confirmation is different indicators agreeing on direction; correlation is indicators measuring same thing (redundant); want confirmation, avoid correlation

---

**Completed Module 3?** ✓ Move to [Hands-On Project: Implement Indicators](project-indicators.md)
