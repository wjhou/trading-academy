# Lesson 4.4: Momentum Strategies - Riding Strong Moves

**Module**: 4 - Trading Strategies
**Estimated Time**: 45 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand momentum trading principles
- Implement relative strength strategies
- Use momentum indicators effectively
- Apply sector rotation strategies
- Manage momentum trade risks

## 📖 What is Momentum Trading?

**Momentum Trading** capitalizes on the continuation of existing price trends, based on the principle that "winners keep winning."

### Core Concepts

- **Relative Strength**: Outperforming stocks continue to outperform
- **Price Momentum**: Stocks moving up continue moving up
- **Earnings Momentum**: Positive surprises lead to more surprises
- **Sector Rotation**: Money flows into strong sectors

## 📊 Momentum Strategies

### 1. Relative Strength (RS) Strategy

```python
def relative_strength_strategy(tickers, benchmark="SPY", lookback=60, top_n=5):
    """
    Select top performers vs benchmark
    """
    import yfinance as yf

    # Get data
    data = {}
    for ticker in tickers:
        df = yf.Ticker(ticker).history(period="1y")
        data[ticker] = df

    benchmark_df = yf.Ticker(benchmark).history(period="1y")

    # Calculate relative strength
    rs_scores = {}
    for ticker, df in data.items():
        # Return over lookback period
        stock_return = (df['Close'].iloc[-1] / df['Close'].iloc[-lookback] - 1)
        bench_return = (benchmark_df['Close'].iloc[-1] / benchmark_df['Close'].iloc[-lookback] - 1)

        # Relative strength
        rs_scores[ticker] = stock_return - bench_return

    # Select top N
    sorted_stocks = sorted(rs_scores.items(), key=lambda x: x[1], reverse=True)
    top_stocks = [stock[0] for stock in sorted_stocks[:top_n]]

    return top_stocks, rs_scores
```

### 2. Dual Momentum Strategy

```python
def dual_momentum(df, lookback_short=60, lookback_long=252):
    """
    Combine absolute and relative momentum
    """
    # Absolute momentum (trend)
    df['Return_Short'] = df['Close'].pct_change(lookback_short)
    df['Return_Long'] = df['Close'].pct_change(lookback_long)

    # Signal
    df['Signal'] = 0

    # Buy if both short and long momentum positive
    df.loc[(df['Return_Short'] > 0) & (df['Return_Long'] > 0), 'Signal'] = 1

    # Sell if either turns negative
    df.loc[(df['Return_Short'] < 0) | (df['Return_Long'] < 0), 'Signal'] = 0

    return df
```

### 3. Momentum with RSI Filter

```python
def momentum_rsi_strategy(df, momentum_period=20, rsi_period=14):
    """
    Momentum strategy with RSI confirmation
    """
    # Calculate momentum
    df['Momentum'] = df['Close'].pct_change(momentum_period)

    # Calculate RSI
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0).rolling(rsi_period).mean()
    loss = -delta.where(delta < 0, 0).rolling(rsi_period).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # Signal
    df['Signal'] = 0

    # Buy: Strong momentum + RSI confirming (not overbought)
    df.loc[(df['Momentum'] > 0.05) & (df['RSI'] > 50) & (df['RSI'] < 70), 'Signal'] = 1

    # Sell: Momentum weakening or RSI overbought
    df.loc[(df['Momentum'] < 0) | (df['RSI'] > 75), 'Signal'] = 0

    return df
```

## 🎯 Complete Momentum System

```python
class MomentumSystem:
    def __init__(self, universe, rebalance_period=30):
        self.universe = universe
        self.rebalance_period = rebalance_period
        self.portfolio = []

    def calculate_momentum_score(self, df, periods=[20, 60, 120]):
        """
        Multi-period momentum score
        """
        scores = []
        for period in periods:
            ret = (df['Close'].iloc[-1] / df['Close'].iloc[-period] - 1)
            scores.append(ret)

        # Weighted average (recent periods weighted more)
        weights = [0.5, 0.3, 0.2]
        momentum_score = sum(s * w for s, w in zip(scores, weights))

        return momentum_score

    def rank_universe(self, data):
        """
        Rank all stocks by momentum
        """
        rankings = {}

        for ticker in self.universe:
            if ticker in data:
                df = data[ticker]
                score = self.calculate_momentum_score(df)
                rankings[ticker] = score

        # Sort by score
        sorted_rankings = sorted(rankings.items(), key=lambda x: x[1], reverse=True)

        return sorted_rankings

    def select_portfolio(self, rankings, top_n=10):
        """
        Select top N momentum stocks
        """
        # Filter positive momentum only
        positive_momentum = [(t, s) for t, s in rankings if s > 0]

        # Select top N
        selected = positive_momentum[:top_n]

        return [ticker for ticker, score in selected]

    def rebalance(self, data, current_day):
        """
        Rebalance portfolio
        """
        if current_day % self.rebalance_period == 0:
            rankings = self.rank_universe(data)
            self.portfolio = self.select_portfolio(rankings)

        return self.portfolio
```

## 📈 Sector Rotation Strategy

```python
def sector_rotation(sector_etfs, lookback=60):
    """
    Rotate into strongest sectors
    """
    import yfinance as yf

    # Sector ETFs
    sectors = {
        'XLK': 'Technology',
        'XLF': 'Financials',
        'XLV': 'Healthcare',
        'XLE': 'Energy',
        'XLI': 'Industrials',
        'XLP': 'Consumer Staples',
        'XLY': 'Consumer Discretionary',
        'XLU': 'Utilities',
        'XLRE': 'Real Estate'
    }

    # Calculate momentum for each sector
    momentum_scores = {}

    for etf, name in sectors.items():
        df = yf.Ticker(etf).history(period="1y")
        momentum = (df['Close'].iloc[-1] / df['Close'].iloc[-lookback] - 1)
        momentum_scores[etf] = {'name': name, 'momentum': momentum}

    # Sort by momentum
    sorted_sectors = sorted(momentum_scores.items(),
                           key=lambda x: x[1]['momentum'],
                           reverse=True)

    # Select top 3 sectors
    top_sectors = sorted_sectors[:3]

    return top_sectors
```

## 💰 Risk Management

### Position Sizing

```python
def momentum_position_sizing(portfolio_size, num_positions, volatility_adjust=True):
    """
    Equal weight with volatility adjustment
    """
    if not volatility_adjust:
        # Simple equal weight
        return portfolio_size / num_positions

    # Volatility-adjusted sizing
    # (Implementation would calculate ATR for each position)
    pass
```

### Stop Loss Strategy

```python
def momentum_stops(df, entry_price, atr_multiplier=2):
    """
    Trailing stop for momentum trades
    """
    atr = df['ATR'].iloc[-1]
    current_price = df['Close'].iloc[-1]

    # Initial stop
    initial_stop = entry_price - (atr_multiplier * atr)

    # Trailing stop (move up as price rises)
    trailing_stop = current_price - (atr_multiplier * atr)

    # Use higher of the two
    stop_loss = max(initial_stop, trailing_stop)

    return stop_loss
```

## 📊 Backtesting Momentum

```python
def backtest_momentum_strategy(universe, initial_capital=100000, top_n=10, rebalance_days=30):
    """
    Backtest momentum rotation strategy
    """
    import yfinance as yf
    import pandas as pd

    # Get data for all stocks
    data = {}
    for ticker in universe:
        df = yf.Ticker(ticker).history(period="2y")
        data[ticker] = df

    # Initialize
    system = MomentumSystem(universe, rebalance_days)
    capital = initial_capital
    portfolio_value = []

    # Simulate trading
    for day in range(120, len(data[universe[0]])):  # Start after 120 days
        # Rebalance if needed
        current_portfolio = system.rebalance(data, day)

        # Calculate portfolio value
        if current_portfolio:
            position_size = capital / len(current_portfolio)
            daily_returns = []

            for ticker in current_portfolio:
                if ticker in data:
                    ret = data[ticker]['Close'].iloc[day] / data[ticker]['Close'].iloc[day-1] - 1
                    daily_returns.append(ret)

            portfolio_return = sum(daily_returns) / len(daily_returns)
            capital *= (1 + portfolio_return)

        portfolio_value.append(capital)

    # Calculate metrics
    total_return = (capital - initial_capital) / initial_capital
    returns = pd.Series(portfolio_value).pct_change()
    sharpe = returns.mean() / returns.std() * (252 ** 0.5)

    return {
        'final_capital': capital,
        'total_return': total_return,
        'sharpe_ratio': sharpe,
        'portfolio_values': portfolio_value
    }
```

## ⚠️ Momentum Risks

1. **Momentum Crashes**: Sudden reversals in market stress
2. **Crowding**: Too many traders in same stocks
3. **High Turnover**: Frequent rebalancing = high costs
4. **Regime Changes**: Momentum fails in certain market conditions

**Mitigation**:
- Diversify across multiple momentum signals
- Use stop losses
- Reduce position sizes in high volatility
- Combine with other strategies

## 🎓 Check Your Understanding

1. What is relative strength?
2. How does dual momentum work?
3. What is sector rotation?
4. Why use trailing stops in momentum trading?
5. When does momentum trading fail?

## 💻 Exercise

```python
# Implement momentum system
universe = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
            'META', 'TSLA', 'JPM', 'V', 'WMT']

results = backtest_momentum_strategy(universe, top_n=5, rebalance_days=30)
print(f"Total Return: {results['total_return']:.2%}")
print(f"Sharpe Ratio: {results['sharpe_ratio']:.2f}")
```

## 📝 Exercise 4.4

Create: `exercises/module-04/exercise-4.4-momentum.md`

1. Implement relative strength strategy
2. Test sector rotation approach
3. Compare different rebalance periods (weekly, monthly, quarterly)
4. Analyze transaction costs impact
5. Document optimal parameters

## 📚 Resources

- [Investopedia: Momentum Trading](https://www.investopedia.com/trading/introduction-to-momentum-trading/)
- [AQR: Momentum](https://www.aqr.com/Insights/Research/White-Papers/Fact-Fiction-and-Momentum-Investing)

## ✅ Solutions

1. **Relative strength**: Performance of stock vs benchmark; stocks outperforming continue to outperform
2. **Dual momentum**: Combines absolute momentum (trend) and relative momentum (vs peers); requires both positive
3. **Sector rotation**: Investing in strongest performing sectors; rotate as leadership changes
4. **Trailing stops**: Lock in profits as momentum continues; exit when momentum reverses
5. **Momentum fails**: Market reversals, high volatility periods, regime changes, crowded trades

---

**Next**: [Lesson 4.5: Multi-Strategy Approaches](lesson-05-multi-strategy.md)
