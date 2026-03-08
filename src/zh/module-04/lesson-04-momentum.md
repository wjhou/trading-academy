# 第4.4课：动量策略 - 驾驭强势波动

**模块**：4 - 交易策略
**预计时间**：45分钟
**难度**：中级

## 🎯 学习目标

- 理解动量交易原则
- 实现相对强度策略
- 有效使用动量指标
- 应用板块轮动策略
- 管理动量交易风险

## 📖 什么是动量交易？

**动量交易**利用现有价格趋势的延续，基于"赢家继续赢"的原则。

### 核心概念

- **相对强度**：表现优异的股票继续表现优异
- **价格动量**：上涨的股票继续上涨
- **盈利动量**：正面惊喜导致更多惊喜
- **板块轮动**：资金流入强势板块

## 📊 动量策略

### 1. 相对强度（RS）策略

```python
def relative_strength_strategy(tickers, benchmark="SPY", lookback=60, top_n=5):
    """
    选择相对基准的顶级表现者
    """
    import yfinance as yf

    # 获取数据
    data = {}
    for ticker in tickers:
        df = yf.Ticker(ticker).history(period="1y")
        data[ticker] = df

    benchmark_df = yf.Ticker(benchmark).history(period="1y")

    # 计算相对强度
    rs_scores = {}
    for ticker, df in data.items():
        # 回溯期内的回报
        stock_return = (df['Close'].iloc[-1] / df['Close'].iloc[-lookback] - 1)
        bench_return = (benchmark_df['Close'].iloc[-1] / benchmark_df['Close'].iloc[-lookback] - 1)

        # 相对强度
        rs_scores[ticker] = stock_return - bench_return

    # 选择前N名
    sorted_stocks = sorted(rs_scores.items(), key=lambda x: x[1], reverse=True)
    top_stocks = [stock[0] for stock in sorted_stocks[:top_n]]

    return top_stocks, rs_scores
```

### 2. 双重动量策略

```python
def dual_momentum(df, lookback_short=60, lookback_long=252):
    """
    结合绝对动量和相对动量
    """
    # 绝对动量（趋势）
    df['Return_Short'] = df['Close'].pct_change(lookback_short)
    df['Return_Long'] = df['Close'].pct_change(lookback_long)

    # 信号
    df['Signal'] = 0

    # 如果短期和长期动量都为正则买入
    df.loc[(df['Return_Short'] > 0) & (df['Return_Long'] > 0), 'Signal'] = 1

    # 如果任一转为负则卖出
    df.loc[(df['Return_Short'] < 0) | (df['Return_Long'] < 0), 'Signal'] = 0

    return df
```

### 3. 带RSI过滤的动量策略

```python
def momentum_rsi_strategy(df, momentum_period=20, rsi_period=14):
    """
    带RSI确认的动量策略
    """
    # 计算动量
    df['Momentum'] = df['Close'].pct_change(momentum_period)

    # 计算RSI
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0).rolling(rsi_period).mean()
    loss = -delta.where(delta < 0, 0).rolling(rsi_period).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # 信号
    df['Signal'] = 0

    # 买入：强劲动量 + RSI确认（未超买）
    df.loc[(df['Momentum'] > 0.05) & (df['RSI'] > 50) & (df['RSI'] < 70), 'Signal'] = 1

    # 卖出：动量减弱或RSI超买
    df.loc[(df['Momentum'] < 0) | (df['RSI'] > 75), 'Signal'] = 0

    return df
```

## 🎯 完整的动量系统

```python
class MomentumSystem:
    def __init__(self, universe, rebalance_period=30):
        self.universe = universe
        self.rebalance_period = rebalance_period
        self.portfolio = []

    def calculate_momentum_score(self, df, periods=[20, 60, 120]):
        """
        多周期动量评分
        """
        scores = []
        for period in periods:
            ret = (df['Close'].iloc[-1] / df['Close'].iloc[-period] - 1)
            scores.append(ret)

        # 加权平均（近期周期权重更高）
        weights = [0.5, 0.3, 0.2]
        momentum_score = sum(s * w for s, w in zip(scores, weights))

        return momentum_score

    def rank_universe(self, data):
        """
        按动量对所有股票排名
        """
        rankings = {}

        for ticker in self.universe:
            if ticker in data:
                df = data[ticker]
                score = self.calculate_momentum_score(df)
                rankings[ticker] = score

        # 按评分排序
        sorted_rankings = sorted(rankings.items(), key=lambda x: x[1], reverse=True)

        return sorted_rankings

    def select_portfolio(self, rankings, top_n=10):
        """
        选择前N名动量股票
        """
        # 仅过滤正动量
        positive_momentum = [(t, s) for t, s in rankings if s > 0]

        # 选择前N名
        selected = positive_momentum[:top_n]

        return [ticker for ticker, score in selected]

    def rebalance(self, data, current_day):
        """
        重新平衡投资组合
        """
        if current_day % self.rebalance_period == 0:
            rankings = self.rank_universe(data)
            self.portfolio = self.select_portfolio(rankings)

        return self.portfolio
```

## 📈 板块轮动策略

```python
def sector_rotation(sector_etfs, lookback=60):
    """
    轮动到最强板块
    """
    import yfinance as yf

    # 板块ETF
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

    # 计算每个板块的动量
    momentum_scores = {}

    for etf, name in sectors.items():
        df = yf.Ticker(etf).history(period="1y")
        momentum = (df['Close'].iloc[-1] / df['Close'].iloc[-lookback] - 1)
        momentum_scores[etf] = {'name': name, 'momentum': momentum}

    # 按动量排序
    sorted_sectors = sorted(momentum_scores.items(),
                           key=lambda x: x[1]['momentum'],
                           reverse=True)

    # 选择前3个板块
    top_sectors = sorted_sectors[:3]

    return top_sectors
```

## 💰 风险管理

### 仓位大小

```python
def momentum_position_sizing(portfolio_size, num_positions, volatility_adjust=True):
    """
    带波动率调整的等权重
    """
    if not volatility_adjust:
        # 简单等权重
        return portfolio_size / num_positions

    # 波动率调整的仓位
    # （实现将为每个仓位计算ATR）
    pass
```

### 止损策略

```python
def momentum_stops(df, entry_price, atr_multiplier=2):
    """
    动量交易的跟踪止损
    """
    atr = df['ATR'].iloc[-1]
    current_price = df['Close'].iloc[-1]

    # 初始止损
    initial_stop = entry_price - (atr_multiplier * atr)

    # 跟踪止损（随价格上涨而上移）
    trailing_stop = current_price - (atr_multiplier * atr)

    # 使用两者中较高的
    stop_loss = max(initial_stop, trailing_stop)

    return stop_loss
```

## 📊 回测动量策略

```python
def backtest_momentum_strategy(universe, initial_capital=100000, top_n=10, rebalance_days=30):
    """
    回测动量轮动策略
    """
    import yfinance as yf
    import pandas as pd

    # 获取所有股票的数据
    data = {}
    for ticker in universe:
        df = yf.Ticker(ticker).history(period="2y")
        data[ticker] = df

    # 初始化
    system = MomentumSystem(universe, rebalance_days)
    capital = initial_capital
    portfolio_value = []

    # 模拟交易
    for day in range(120, len(data[universe[0]])):  # 120天后开始
        # 如需要则重新平衡
        current_portfolio = system.rebalance(data, day)

        # 计算投资组合价值
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

    # 计算指标
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

## ⚠️ 动量风险

1. **动量崩溃**：市场压力下的突然反转
2. **拥挤**：太多交易者在同一股票中
3. **高换手率**：频繁重新平衡 = 高成本
4. **机制变化**：动量在某些市场条件下失效

**缓解措施**：
- 跨多个动量信号分散
- 使用止损
- 在高波动率时减少仓位
- 与其他策略结合

## 🎓 检查您的理解

1. 什么是相对强度？
2. 双重动量如何运作？
3. 什么是板块轮动？
4. 为什么在动量交易中使用跟踪止损？
5. 动量交易何时失效？

## 💻 实践练习

```python
# 实现动量系统
universe = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
            'META', 'TSLA', 'JPM', 'V', 'WMT']

results = backtest_momentum_strategy(universe, top_n=5, rebalance_days=30)
print(f"总回报：{results['total_return']:.2%}")
print(f"夏普比率：{results['sharpe_ratio']:.2f}")
```

## 📝 练习4.4

创建：`exercises/module-04/exercise-4.4-momentum.md`

1. 实现相对强度策略
2. 测试板块轮动方法
3. 比较不同的重新平衡周期（每周、每月、每季度）
4. 分析交易成本影响
5. 记录最优参数

## 📚 资源

- [Investopedia: Momentum Trading](https://www.investopedia.com/trading/introduction-to-momentum-trading/)
- [AQR: Momentum](https://www.aqr.com/Insights/Research/White-Papers/Fact-Fiction-and-Momentum-Investing)

## ✅ 答案

1. **相对强度**：股票相对基准的表现；表现优异的股票继续表现优异
2. **双重动量**：结合绝对动量（趋势）和相对动量（相对同行）；两者都需要为正
3. **板块轮动**：投资于表现最强的板块；随着领导地位变化而轮动
4. **跟踪止损**：随着动量继续锁定利润；当动量反转时退出
5. **动量失效**：市场反转、高波动期、机制变化、拥挤交易

---

**下一课**：[第4.5课：多策略方法](lesson-05-multi-strategy.md)
