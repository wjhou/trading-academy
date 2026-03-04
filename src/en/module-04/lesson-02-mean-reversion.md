# Lesson 4.2: Mean Reversion - Trading the Bounce

**Module**: 4 - Trading Strategies
**Estimated Time**: 55 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand mean reversion principles
- Learn statistical measures for mean reversion
- Implement Bollinger Band mean reversion strategies
- Apply RSI-based mean reversion systems
- Manage risk in mean reversion trading

## 📖 What is Mean Reversion?

**Mean Reversion** is the theory that prices tend to return to their average over time.

### Core Concept

> "What goes up must come down, and vice versa"

**Key Principles**:
- Extreme moves are temporary
- Prices oscillate around a mean
- Overbought/oversold conditions reverse
- Works best in ranging markets

### Why Mean Reversion Works

1. **Profit Taking**: Winners take profits at extremes
2. **Value Buying**: Bargain hunters buy dips
3. **Market Efficiency**: Prices correct to fair value
4. **Psychology**: Fear and greed create extremes

## 📊 Mean Reversion Strategies

### 1. Bollinger Band Mean Reversion

**Concept**: Buy at lower band, sell at upper band

```python
def bollinger_mean_reversion(df, period=20, std_dev=2):
    """
    Bollinger Band Mean Reversion Strategy
    """
    # Calculate Bollinger Bands
    df['BB_Middle'] = df['Close'].rolling(period).mean()
    df['BB_Std'] = df['Close'].rolling(period).std()
    df['BB_Upper'] = df['BB_Middle'] + (std_dev * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (std_dev * df['BB_Std'])

    # Calculate %B (position within bands)
    df['Percent_B'] = (df['Close'] - df['BB_Lower']) / (df['BB_Upper'] - df['BB_Lower'])

    # Generate signals
    df['Signal'] = 0

    # Buy when price touches lower band (%B < 0.1)
    df.loc[df['Percent_B'] < 0.1, 'Signal'] = 1

    # Sell when price touches upper band (%B > 0.9)
    df.loc[df['Percent_B'] > 0.9, 'Signal'] = -1

    # Exit at middle band
    df.loc[(df['Percent_B'] > 0.45) & (df['Percent_B'] < 0.55), 'Signal'] = 0

    return df

# Example
import yfinance as yf
df = yf.Ticker("SPY").history(period="1y")
df = bollinger_mean_reversion(df)
```

**Entry Rules**:
- Buy: Price < Lower Band + RSI < 30
- Sell: Price > Upper Band + RSI > 70

**Exit Rules**:
- Target: Middle Band
- Stop: 2 ATR beyond entry

### 2. RSI Mean Reversion

**Concept**: Trade oversold/overbought extremes

```python
def rsi_mean_reversion(df, rsi_period=14, oversold=30, overbought=70):
    """
    RSI Mean Reversion Strategy
    """
    # Calculate RSI
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(rsi_period).mean()
    avg_loss = loss.rolling(rsi_period).mean()

    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # Generate signals
    df['Signal'] = 0

    # Buy when RSI crosses above oversold
    df.loc[(df['RSI'].shift(1) < oversold) & (df['RSI'] >= oversold), 'Signal'] = 1

    # Sell when RSI crosses below overbought
    df.loc[(df['RSI'].shift(1) > overbought) & (df['RSI'] <= overbought), 'Signal'] = -1

    return df
```

### 3. Z-Score Mean Reversion

**Concept**: Trade when price deviates significantly from mean

```python
def zscore_mean_reversion(df, lookback=20, entry_threshold=2, exit_threshold=0.5):
    """
    Z-Score Mean Reversion Strategy
    """
    # Calculate rolling mean and std
    df['Mean'] = df['Close'].rolling(lookback).mean()
    df['Std'] = df['Close'].rolling(lookback).std()

    # Calculate Z-Score
    df['Z_Score'] = (df['Close'] - df['Mean']) / df['Std']

    # Generate signals
    df['Signal'] = 0
    df['Position'] = 0

    for i in range(lookback, len(df)):
        z = df['Z_Score'].iloc[i]
        pos = df['Position'].iloc[i-1]

        # Entry signals
        if z < -entry_threshold and pos == 0:  # Oversold
            df.loc[df.index[i], 'Signal'] = 1
            df.loc[df.index[i], 'Position'] = 1
        elif z > entry_threshold and pos == 0:  # Overbought
            df.loc[df.index[i], 'Signal'] = -1
            df.loc[df.index[i], 'Position'] = -1

        # Exit signals
        elif abs(z) < exit_threshold and pos != 0:
            df.loc[df.index[i], 'Signal'] = 0
            df.loc[df.index[i], 'Position'] = 0
        else:
            df.loc[df.index[i], 'Position'] = pos

    return df
```

## 🎯 Complete Mean Reversion System

```python
class MeanReversionSystem:
    def __init__(self, bb_period=20, rsi_period=14, atr_period=14):
        self.bb_period = bb_period
        self.rsi_period = rsi_period
        self.atr_period = atr_period

    def calculate_indicators(self, df):
        # Bollinger Bands
        df['BB_Middle'] = df['Close'].rolling(self.bb_period).mean()
        df['BB_Std'] = df['Close'].rolling(self.bb_period).std()
        df['BB_Upper'] = df['BB_Middle'] + (2 * df['BB_Std'])
        df['BB_Lower'] = df['BB_Middle'] - (2 * df['BB_Std'])
        df['Percent_B'] = (df['Close'] - df['BB_Lower']) / (df['BB_Upper'] - df['BB_Lower'])

        # RSI
        delta = df['Close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(self.rsi_period).mean()
        avg_loss = loss.rolling(self.rsi_period).mean()
        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # ATR for stops
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(self.atr_period).mean()

        return df

    def generate_entry_signal(self, df):
        """
        Entry with multiple confirmations
        """
        current = df.iloc[-1]

        # Long entry: Oversold on both BB and RSI
        if current['Percent_B'] < 0.1 and current['RSI'] < 30:
            return "BUY"

        # Short entry: Overbought on both BB and RSI
        elif current['Percent_B'] > 0.9 and current['RSI'] > 70:
            return "SELL"

        return "HOLD"

    def calculate_stops(self, df, entry_price, direction):
        """
        Calculate stop loss and take profit
        """
        atr = df['ATR'].iloc[-1]
        bb_middle = df['BB_Middle'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry_price - (1.5 * atr)
            take_profit = bb_middle  # Target middle band
        else:  # SHORT
            stop_loss = entry_price + (1.5 * atr)
            take_profit = bb_middle

        return stop_loss, take_profit

    def should_exit(self, df, position, entry_price):
        """
        Exit conditions
        """
        current = df.iloc[-1]
        bb_middle = current['BB_Middle']
        stop_loss, take_profit = self.calculate_stops(df, entry_price, position)

        if position == "LONG":
            # Take profit at middle band
            if current['Close'] >= bb_middle:
                return True, "TARGET"

            # Stop loss
            if current['Close'] <= stop_loss:
                return True, "STOP_LOSS"

            # RSI overbought (momentum shift)
            if current['RSI'] > 70:
                return True, "MOMENTUM_SHIFT"

        elif position == "SHORT":
            # Take profit at middle band
            if current['Close'] <= bb_middle:
                return True, "TARGET"

            # Stop loss
            if current['Close'] >= stop_loss:
                return True, "STOP_LOSS"

            # RSI oversold (momentum shift)
            if current['RSI'] < 30:
                return True, "MOMENTUM_SHIFT"

        return False, None
```

## 💰 Risk Management

### Position Sizing

```python
def calculate_position_size(account_size, risk_percent, entry_price, stop_loss):
    """
    Position sizing for mean reversion
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    # Limit position to 10% of account
    max_shares = int((account_size * 0.10) / entry_price)
    shares = min(shares, max_shares)

    return shares
```

### Trade Management

**Rules**:
1. **Scale In**: Add to position if moves further against you (carefully!)
2. **Scale Out**: Take partial profits at targets
3. **Time Stop**: Exit if no reversion in 5-10 days
4. **Correlation**: Avoid multiple correlated mean reversion trades

## 📊 Advanced Mean Reversion

### Pairs Trading

**Concept**: Trade spread between correlated assets

```python
def pairs_trading(df1, df2, lookback=20, entry_z=2, exit_z=0.5):
    """
    Pairs trading strategy
    """
    # Calculate spread
    spread = df1['Close'] / df2['Close']

    # Calculate Z-score of spread
    mean = spread.rolling(lookback).mean()
    std = spread.rolling(lookback).std()
    z_score = (spread - mean) / std

    # Generate signals
    signals = []
    position = 0

    for z in z_score:
        if z < -entry_z and position == 0:
            signals.append("LONG_SPREAD")  # Buy df1, Sell df2
            position = 1
        elif z > entry_z and position == 0:
            signals.append("SHORT_SPREAD")  # Sell df1, Buy df2
            position = -1
        elif abs(z) < exit_z and position != 0:
            signals.append("EXIT")
            position = 0
        else:
            signals.append("HOLD")

    return signals
```

### Statistical Arbitrage

**Concept**: Trade multiple mean reverting instruments

```python
class StatArbSystem:
    def __init__(self, universe, lookback=60):
        self.universe = universe
        self.lookback = lookback

    def find_opportunities(self, data):
        """
        Find mean reverting opportunities across universe
        """
        opportunities = []

        for ticker in self.universe:
            df = data[ticker]

            # Calculate Z-score
            mean = df['Close'].rolling(self.lookback).mean()
            std = df['Close'].rolling(self.lookback).std()
            z_score = (df['Close'].iloc[-1] - mean.iloc[-1]) / std.iloc[-1]

            # Check for extreme deviation
            if z_score < -2:
                opportunities.append({
                    'ticker': ticker,
                    'direction': 'LONG',
                    'z_score': z_score,
                    'expected_return': abs(z_score) * std.iloc[-1]
                })
            elif z_score > 2:
                opportunities.append({
                    'ticker': ticker,
                    'direction': 'SHORT',
                    'z_score': z_score,
                    'expected_return': abs(z_score) * std.iloc[-1]
                })

        # Sort by expected return
        opportunities.sort(key=lambda x: x['expected_return'], reverse=True)

        return opportunities[:5]  # Top 5 opportunities
```

## ⚠️ When Mean Reversion Fails

### Trending Markets

Mean reversion fails in strong trends:
- Don't fight the trend
- Use trend filter (MA, ADX)
- Reduce position size in trending markets

### Structural Changes

Mean reversion assumes stationary mean:
- Company fundamentals change
- Market regime shifts
- Black swan events

**Solution**: Use shorter lookback periods, monitor fundamentals

## 🎓 Check Your Understanding

1. What is mean reversion?
2. How do you use Bollinger Bands for mean reversion?
3. What is a Z-score and how is it used?
4. When does mean reversion work best?
5. What is pairs trading?

## 💻 Hands-On Exercise

```python
# Implement and test mean reversion system
system = MeanReversionSystem()

# Test on range-bound stocks
tickers = ["XLE", "XLU", "XLP"]  # Defensive sectors

for ticker in tickers:
    df = yf.Ticker(ticker).history(period="2y")
    df = system.calculate_indicators(df)

    # Backtest
    results = backtest_mean_reversion(df, system)
    print(f"\n{ticker}:")
    print(f"Win Rate: {results['win_rate']:.2%}")
    print(f"Avg Trade: {results['avg_trade']:.2%}")
```

## 📝 Exercise 4.2

Create: `exercises/module-04/exercise-4.2-mean-reversion.md`

1. Implement Bollinger Band mean reversion system
2. Implement RSI mean reversion system
3. Compare performance on 5 stocks
4. Test in trending vs ranging markets
5. Document which conditions work best

## 📚 Resources

- [Investopedia: Mean Reversion](https://www.investopedia.com/terms/m/meanreversion.asp)
- [Quantpedia: Mean Reversion Strategies](https://quantpedia.com/strategies/mean-reversion/)
- [Ernest Chan: Algorithmic Trading](https://www.amazon.com/Algorithmic-Trading-Winning-Strategies-Rationale/dp/1118460146)

## ✅ Solutions

1. **Mean reversion**: Theory that prices return to average over time; extreme moves are temporary
2. **BB mean reversion**: Buy when price touches lower band (oversold), sell at upper band (overbought), exit at middle band
3. **Z-score**: Measures standard deviations from mean; Z > 2 or < -2 indicates extreme deviation, likely to revert
4. **Works best**: Range-bound markets, stable stocks, short timeframes; fails in strong trends
5. **Pairs trading**: Trade spread between two correlated assets; profit when spread reverts to mean

---

**Next**: [Lesson 4.3: Breakout Strategies](lesson-03-breakout.md)
