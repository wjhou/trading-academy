# Hands-On Project: Implement Technical Indicators

**Module**: 3 - Technical Indicators
**Estimated Time**: 3-4 hours
**Difficulty**: Intermediate

## 🎯 Project Objectives

Build a complete technical indicator library and trading system:
- Implement all major indicators from scratch
- Create a multi-indicator analysis dashboard
- Build and backtest a trading strategy
- Compare indicator performance
- Generate trading signals

## 📋 Project Overview

You will create a Python library that calculates technical indicators, analyzes stocks, and generates trading signals.

### Deliverables

1. **Indicator Library** (`indicators.py`)
2. **Trading Strategy** (`strategy.py`)
3. **Backtesting Engine** (`backtest.py`)
4. **Analysis Dashboard** (visualizations)
5. **Performance Report** (markdown document)

## 🔧 Part 1: Build Indicator Library

Create `indicators.py` with all indicators:

```python
import pandas as pd
import numpy as np

class TechnicalIndicators:
    """
    Complete technical indicator library
    """

    @staticmethod
    def sma(df, period=20, column='Close'):
        """Simple Moving Average"""
        return df[column].rolling(window=period).mean()

    @staticmethod
    def ema(df, period=20, column='Close'):
        """Exponential Moving Average"""
        return df[column].ewm(span=period, adjust=False).mean()

    @staticmethod
    def rsi(df, period=14, column='Close'):
        """Relative Strength Index"""
        delta = df[column].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)

        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @staticmethod
    def macd(df, fast=12, slow=26, signal=9, column='Close'):
        """MACD Indicator"""
        ema_fast = df[column].ewm(span=fast, adjust=False).mean()
        ema_slow = df[column].ewm(span=slow, adjust=False).mean()

        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line

        return macd_line, signal_line, histogram

    @staticmethod
    def bollinger_bands(df, period=20, std_dev=2, column='Close'):
        """Bollinger Bands"""
        middle = df[column].rolling(window=period).mean()
        std = df[column].rolling(window=period).std()

        upper = middle + (std_dev * std)
        lower = middle - (std_dev * std)

        return upper, middle, lower

    @staticmethod
    def obv(df):
        """On-Balance Volume"""
        obv = [0]
        for i in range(1, len(df)):
            if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
                obv.append(obv[-1] + df['Volume'].iloc[i])
            elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
                obv.append(obv[-1] - df['Volume'].iloc[i])
            else:
                obv.append(obv[-1])
        return pd.Series(obv, index=df.index)

    @staticmethod
    def vwap(df):
        """Volume-Weighted Average Price"""
        typical_price = (df['High'] + df['Low'] + df['Close']) / 3
        return (typical_price * df['Volume']).cumsum() / df['Volume'].cumsum()

    @staticmethod
    def atr(df, period=14):
        """Average True Range"""
        high_low = df['High'] - df['Low']
        high_close = abs(df['High'] - df['Close'].shift())
        low_close = abs(df['Low'] - df['Close'].shift())

        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr

    @staticmethod
    def stochastic(df, period=14):
        """Stochastic Oscillator"""
        low_min = df['Low'].rolling(window=period).min()
        high_max = df['High'].rolling(window=period).max()

        k = 100 * (df['Close'] - low_min) / (high_max - low_min)
        d = k.rolling(window=3).mean()

        return k, d

    @staticmethod
    def add_all_indicators(df):
        """Add all indicators to dataframe"""
        # Moving Averages
        df['SMA_20'] = TechnicalIndicators.sma(df, 20)
        df['SMA_50'] = TechnicalIndicators.sma(df, 50)
        df['SMA_200'] = TechnicalIndicators.sma(df, 200)
        df['EMA_12'] = TechnicalIndicators.ema(df, 12)
        df['EMA_26'] = TechnicalIndicators.ema(df, 26)

        # RSI
        df['RSI'] = TechnicalIndicators.rsi(df)

        # MACD
        df['MACD'], df['MACD_Signal'], df['MACD_Hist'] = \
            TechnicalIndicators.macd(df)

        # Bollinger Bands
        df['BB_Upper'], df['BB_Middle'], df['BB_Lower'] = \
            TechnicalIndicators.bollinger_bands(df)

        # Volume Indicators
        df['OBV'] = TechnicalIndicators.obv(df)
        df['VWAP'] = TechnicalIndicators.vwap(df)

        # Volatility
        df['ATR'] = TechnicalIndicators.atr(df)

        # Stochastic
        df['Stoch_K'], df['Stoch_D'] = TechnicalIndicators.stochastic(df)

        return df
```

## 📊 Part 2: Build Trading Strategy

Create `strategy.py`:

```python
import pandas as pd
from indicators import TechnicalIndicators

class MultiIndicatorStrategy:
    """
    Trading strategy using multiple indicators
    """

    def __init__(self, name="Multi-Indicator Strategy"):
        self.name = name
        self.indicators = TechnicalIndicators()

    def generate_signals(self, df):
        """
        Generate buy/sell signals
        """
        # Add all indicators
        df = self.indicators.add_all_indicators(df)

        # Initialize signals
        df['Signal'] = 0  # 0 = hold, 1 = buy, -1 = sell

        for i in range(200, len(df)):  # Start after 200-day MA is available
            # Get current values
            price = df['Close'].iloc[i]
            sma_50 = df['SMA_50'].iloc[i]
            sma_200 = df['SMA_200'].iloc[i]
            rsi = df['RSI'].iloc[i]
            macd = df['MACD'].iloc[i]
            macd_signal = df['MACD_Signal'].iloc[i]
            obv = df['OBV'].iloc[i]
            obv_ma = df['OBV'].iloc[i-20:i].mean()

            # BUY CONDITIONS
            if (price > sma_50 > sma_200 and  # Uptrend
                30 < rsi < 60 and  # Not overbought
                macd > macd_signal and  # Bullish momentum
                obv > obv_ma):  # Volume confirming
                df.loc[df.index[i], 'Signal'] = 1

            # SELL CONDITIONS
            elif (price < sma_50 < sma_200 and  # Downtrend
                  40 < rsi < 70 and  # Not oversold
                  macd < macd_signal and  # Bearish momentum
                  obv < obv_ma):  # Volume confirming
                df.loc[df.index[i], 'Signal'] = -1

        return df

    def calculate_positions(self, df):
        """
        Calculate actual positions from signals
        """
        df['Position'] = df['Signal'].replace(0, method='ffill')
        df['Position'] = df['Position'].fillna(0)
        return df
```

## 🧪 Part 3: Backtesting Engine

Create `backtest.py`:

```python
import pandas as pd
import numpy as np

class Backtester:
    """
    Backtest trading strategies
    """

    def __init__(self, initial_capital=10000, commission=0.001):
        self.initial_capital = initial_capital
        self.commission = commission

    def run(self, df, strategy):
        """
        Run backtest
        """
        # Generate signals
        df = strategy.generate_signals(df)
        df = strategy.calculate_positions(df)

        # Calculate returns
        df['Returns'] = df['Close'].pct_change()
        df['Strategy_Returns'] = df['Position'].shift(1) * df['Returns']

        # Apply commission
        df['Trades'] = df['Position'].diff().abs()
        df['Commission'] = df['Trades'] * self.commission
        df['Strategy_Returns'] = df['Strategy_Returns'] - df['Commission']

        # Calculate cumulative returns
        df['Cumulative_Returns'] = (1 + df['Returns']).cumprod()
        df['Cumulative_Strategy_Returns'] = (1 + df['Strategy_Returns']).cumprod()

        # Calculate portfolio value
        df['Portfolio_Value'] = self.initial_capital * df['Cumulative_Strategy_Returns']

        return df

    def calculate_metrics(self, df):
        """
        Calculate performance metrics
        """
        # Total return
        total_return = df['Cumulative_Strategy_Returns'].iloc[-1] - 1

        # Annualized return
        days = (df.index[-1] - df.index[0]).days
        years = days / 365.25
        annualized_return = (1 + total_return) ** (1 / years) - 1

        # Volatility
        volatility = df['Strategy_Returns'].std() * np.sqrt(252)

        # Sharpe ratio
        sharpe_ratio = annualized_return / volatility if volatility > 0 else 0

        # Maximum drawdown
        cumulative = df['Cumulative_Strategy_Returns']
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()

        # Win rate
        winning_trades = df[df['Strategy_Returns'] > 0]['Strategy_Returns'].count()
        total_trades = df[df['Trades'] > 0]['Trades'].count()
        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        return {
            'Total Return': f"{total_return:.2%}",
            'Annualized Return': f"{annualized_return:.2%}",
            'Volatility': f"{volatility:.2%}",
            'Sharpe Ratio': f"{sharpe_ratio:.2f}",
            'Max Drawdown': f"{max_drawdown:.2%}",
            'Win Rate': f"{win_rate:.2%}",
            'Total Trades': int(total_trades)
        }
```

## 📈 Part 4: Analysis Dashboard

Create `dashboard.py`:

```python
import matplotlib.pyplot as plt
import seaborn as sns

class Dashboard:
    """
    Visualization dashboard
    """

    @staticmethod
    def plot_full_analysis(df, ticker):
        """
        Create comprehensive analysis dashboard
        """
        fig = plt.figure(figsize=(16, 12))
        gs = fig.add_gridspec(5, 2, hspace=0.3, wspace=0.3)

        # 1. Price and Moving Averages
        ax1 = fig.add_subplot(gs[0, :])
        ax1.plot(df.index, df['Close'], label='Price', linewidth=2)
        ax1.plot(df.index, df['SMA_50'], label='SMA 50', alpha=0.7)
        ax1.plot(df.index, df['SMA_200'], label='SMA 200', alpha=0.7)
        ax1.set_title(f'{ticker} - Price and Moving Averages')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 2. RSI
        ax2 = fig.add_subplot(gs[1, 0])
        ax2.plot(df.index, df['RSI'])
        ax2.axhline(y=70, color='r', linestyle='--', alpha=0.5)
        ax2.axhline(y=30, color='g', linestyle='--', alpha=0.5)
        ax2.fill_between(df.index, 70, 100, alpha=0.1, color='red')
        ax2.fill_between(df.index, 0, 30, alpha=0.1, color='green')
        ax2.set_title('RSI')
        ax2.set_ylim(0, 100)
        ax2.grid(True, alpha=0.3)

        # 3. MACD
        ax3 = fig.add_subplot(gs[1, 1])
        ax3.plot(df.index, df['MACD'], label='MACD')
        ax3.plot(df.index, df['MACD_Signal'], label='Signal')
        ax3.bar(df.index, df['MACD_Hist'], alpha=0.3, label='Histogram')
        ax3.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
        ax3.set_title('MACD')
        ax3.legend()
        ax3.grid(True, alpha=0.3)

        # 4. Bollinger Bands
        ax4 = fig.add_subplot(gs[2, 0])
        ax4.plot(df.index, df['Close'], label='Price')
        ax4.plot(df.index, df['BB_Upper'], 'r--', alpha=0.5)
        ax4.plot(df.index, df['BB_Middle'], 'g-', alpha=0.5)
        ax4.plot(df.index, df['BB_Lower'], 'r--', alpha=0.5)
        ax4.fill_between(df.index, df['BB_Upper'], df['BB_Lower'], alpha=0.1)
        ax4.set_title('Bollinger Bands')
        ax4.legend()
        ax4.grid(True, alpha=0.3)

        # 5. Volume and OBV
        ax5 = fig.add_subplot(gs[2, 1])
        ax5_twin = ax5.twinx()
        ax5.bar(df.index, df['Volume'], alpha=0.3, label='Volume')
        ax5_twin.plot(df.index, df['OBV'], 'r-', label='OBV')
        ax5.set_title('Volume and OBV')
        ax5.legend(loc='upper left')
        ax5_twin.legend(loc='upper right')
        ax5.grid(True, alpha=0.3)

        # 6. Trading Signals
        ax6 = fig.add_subplot(gs[3, :])
        ax6.plot(df.index, df['Close'], label='Price', alpha=0.5)
        buy_signals = df[df['Signal'] == 1]
        sell_signals = df[df['Signal'] == -1]
        ax6.scatter(buy_signals.index, buy_signals['Close'],
                   marker='^', color='g', s=100, label='Buy', zorder=5)
        ax6.scatter(sell_signals.index, sell_signals['Close'],
                   marker='v', color='r', s=100, label='Sell', zorder=5)
        ax6.set_title('Trading Signals')
        ax6.legend()
        ax6.grid(True, alpha=0.3)

        # 7. Portfolio Value
        ax7 = fig.add_subplot(gs[4, :])
        ax7.plot(df.index, df['Portfolio_Value'], label='Strategy', linewidth=2)
        ax7.plot(df.index, df['Cumulative_Returns'] * 10000,
                label='Buy & Hold', linewidth=2, alpha=0.7)
        ax7.set_title('Portfolio Value')
        ax7.legend()
        ax7.grid(True, alpha=0.3)

        plt.suptitle(f'{ticker} - Complete Technical Analysis', fontsize=16, y=0.995)
        plt.savefig(f'{ticker}_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
```

## 🎯 Part 5: Main Analysis Script

Create `main.py`:

```python
import yfinance as yf
from indicators import TechnicalIndicators
from strategy import MultiIndicatorStrategy
from backtest import Backtester
from dashboard import Dashboard

def analyze_stock(ticker, period="2y"):
    """
    Complete stock analysis
    """
    print(f"\n{'='*60}")
    print(f"Analyzing {ticker}")
    print(f"{'='*60}\n")

    # Get data
    df = yf.Ticker(ticker).history(period=period)

    # Initialize components
    strategy = MultiIndicatorStrategy()
    backtester = Backtester(initial_capital=10000)
    dashboard = Dashboard()

    # Run backtest
    df = backtester.run(df, strategy)

    # Calculate metrics
    metrics = backtester.calculate_metrics(df)

    # Print results
    print("Performance Metrics:")
    print("-" * 40)
    for key, value in metrics.items():
        print(f"{key:20s}: {value}")

    # Create visualizations
    dashboard.plot_full_analysis(df, ticker)

    return df, metrics

if __name__ == "__main__":
    # Analyze multiple stocks
    tickers = ["AAPL", "MSFT", "GOOGL"]

    results = {}
    for ticker in tickers:
        df, metrics = analyze_stock(ticker)
        results[ticker] = metrics

    # Compare results
    print("\n" + "="*60)
    print("COMPARISON")
    print("="*60)
    import pandas as pd
    comparison = pd.DataFrame(results).T
    print(comparison)
```

## ✅ Project Checklist

- [ ] Implement all indicators in `indicators.py`
- [ ] Create trading strategy in `strategy.py`
- [ ] Build backtesting engine in `backtest.py`
- [ ] Create visualization dashboard in `dashboard.py`
- [ ] Write main analysis script in `main.py`
- [ ] Test on 3+ stocks
- [ ] Generate performance reports
- [ ] Document findings

## 📝 Deliverable: Performance Report

Create `PROJECT_REPORT.md`:

```markdown
# Module 3 Project Report

## Strategy Description
[Describe your multi-indicator strategy]

## Indicators Used
1. **Trend**: [Which indicators and why]
2. **Momentum**: [Which indicators and why]
3. **Volume**: [Which indicators and why]

## Entry Rules
[List all conditions for entry]

## Exit Rules
[List all conditions for exit]

## Backtest Results

### Stock 1: [TICKER]
- Total Return: X%
- Sharpe Ratio: X.XX
- Max Drawdown: X%
- Win Rate: X%

### Stock 2: [TICKER]
[Same metrics]

### Stock 3: [TICKER]
[Same metrics]

## Analysis
[What worked well? What didn't? Why?]

## Lessons Learned
[Key takeaways from the project]

## Future Improvements
[How would you improve the strategy?]
```

## 🎓 Evaluation Criteria

1. **Code Quality** (30%): Clean, documented, working code
2. **Strategy Logic** (25%): Sound indicator combination
3. **Backtest Results** (20%): Realistic performance
4. **Analysis** (15%): Insightful interpretation
5. **Visualization** (10%): Clear, informative charts

## 🚀 Next Steps

After completing this project:
1. Test on different market conditions
2. Optimize parameters
3. Add more indicators
4. Implement risk management
5. Move to Module 4: Trading Strategies

---

**Completed Module 3?** ✓ Move to [Module 4: Trading Strategies](../module-04/lesson-01-trend-following.md)
