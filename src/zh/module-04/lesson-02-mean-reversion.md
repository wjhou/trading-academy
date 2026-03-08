# 第4.2课：均值回归 - 交易反弹

**模块**：4 - 交易策略
**预计时间**：55分钟
**难度**：中级

## 🎯 学习目标

- 理解均值回归原则
- 学习均值回归的统计度量
- 实现布林带均值回归策略
- 应用基于RSI的均值回归系统
- 管理均值回归交易中的风险

## 📖 什么是均值回归？

**均值回归**是指价格随时间趋向于回归其平均值的理论。

### 核心概念

> "涨得太高必然回落，跌得太深必然反弹"

**关键原则**：
- 极端波动是暂时的
- 价格围绕均值振荡
- 超买/超卖状况会反转
- 在区间市场中效果最好

### 均值回归为何有效

1. **获利了结**：赢家在极端位置获利了结
2. **价值买入**：逢低买入者购买下跌
3. **市场效率**：价格修正至公允价值
4. **心理因素**：恐惧和贪婪创造极端

## 📊 均值回归策略

### 1. 布林带均值回归

**概念**：在下轨买入，在上轨卖出

```python
def bollinger_mean_reversion(df, period=20, std_dev=2):
    """
    布林带均值回归策略
    """
    # 计算布林带
    df['BB_Middle'] = df['Close'].rolling(period).mean()
    df['BB_Std'] = df['Close'].rolling(period).std()
    df['BB_Upper'] = df['BB_Middle'] + (std_dev * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (std_dev * df['BB_Std'])

    # 计算%B（在带内的位置）
    df['Percent_B'] = (df['Close'] - df['BB_Lower']) / (df['BB_Upper'] - df['BB_Lower'])

    # 生成信号
    df['Signal'] = 0

    # 当价格触及下轨时买入（%B < 0.1）
    df.loc[df['Percent_B'] < 0.1, 'Signal'] = 1

    # 当价格触及上轨时卖出（%B > 0.9）
    df.loc[df['Percent_B'] > 0.9, 'Signal'] = -1

    # 在中轨退出
    df.loc[(df['Percent_B'] > 0.45) & (df['Percent_B'] < 0.55), 'Signal'] = 0

    return df

# 示例
import yfinance as yf
df = yf.Ticker("SPY").history(period="1y")
df = bollinger_mean_reversion(df)
```

**入场规则**：
- 买入：价格 < 下轨 + RSI < 30
- 卖出：价格 > 上轨 + RSI > 70

**出场规则**：
- 目标：中轨
- 止损：入场点外2倍ATR

### 2. RSI均值回归

**概念**：交易超卖/超买极端

```python
def rsi_mean_reversion(df, rsi_period=14, oversold=30, overbought=70):
    """
    RSI均值回归策略
    """
    # 计算RSI
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(rsi_period).mean()
    avg_loss = loss.rolling(rsi_period).mean()

    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # 生成信号
    df['Signal'] = 0

    # 当RSI向上穿越超卖线时买入
    df.loc[(df['RSI'].shift(1) < oversold) & (df['RSI'] >= oversold), 'Signal'] = 1

    # 当RSI向下穿越超买线时卖出
    df.loc[(df['RSI'].shift(1) > overbought) & (df['RSI'] <= overbought), 'Signal'] = -1

    return df
```

### 3. Z分数均值回归

**概念**：当价格显著偏离均值时交易

```python
def zscore_mean_reversion(df, lookback=20, entry_threshold=2, exit_threshold=0.5):
    """
    Z分数均值回归策略
    """
    # 计算滚动均值和标准差
    df['Mean'] = df['Close'].rolling(lookback).mean()
    df['Std'] = df['Close'].rolling(lookback).std()

    # 计算Z分数
    df['Z_Score'] = (df['Close'] - df['Mean']) / df['Std']

    # 生成信号
    df['Signal'] = 0
    df['Position'] = 0

    for i in range(lookback, len(df)):
        z = df['Z_Score'].iloc[i]
        pos = df['Position'].iloc[i-1]

        # 入场信号
        if z < -entry_threshold and pos == 0:  # 超卖
            df.loc[df.index[i], 'Signal'] = 1
            df.loc[df.index[i], 'Position'] = 1
        elif z > entry_threshold and pos == 0:  # 超买
            df.loc[df.index[i], 'Signal'] = -1
            df.loc[df.index[i], 'Position'] = -1

        # 出场信号
        elif abs(z) < exit_threshold and pos != 0:
            df.loc[df.index[i], 'Signal'] = 0
            df.loc[df.index[i], 'Position'] = 0
        else:
            df.loc[df.index[i], 'Position'] = pos

    return df
```

## 🎯 完整的均值回归系统

```python
class MeanReversionSystem:
    def __init__(self, bb_period=20, rsi_period=14, atr_period=14):
        self.bb_period = bb_period
        self.rsi_period = rsi_period
        self.atr_period = atr_period

    def calculate_indicators(self, df):
        # 布林带
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

        # 用于止损的ATR
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(self.atr_period).mean()

        return df

    def generate_entry_signal(self, df):
        """
        多重确认入场
        """
        current = df.iloc[-1]

        # 做多入场：布林带和RSI均超卖
        if current['Percent_B'] < 0.1 and current['RSI'] < 30:
            return "BUY"

        # 做空入场：布林带和RSI均超买
        elif current['Percent_B'] > 0.9 and current['RSI'] > 70:
            return "SELL"

        return "HOLD"

    def calculate_stops(self, df, entry_price, direction):
        """
        计算止损和止盈
        """
        atr = df['ATR'].iloc[-1]
        bb_middle = df['BB_Middle'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry_price - (1.5 * atr)
            take_profit = bb_middle  # 目标中轨
        else:  # SHORT
            stop_loss = entry_price + (1.5 * atr)
            take_profit = bb_middle

        return stop_loss, take_profit

    def should_exit(self, df, position, entry_price):
        """
        出场条件
        """
        current = df.iloc[-1]
        bb_middle = current['BB_Middle']
        stop_loss, take_profit = self.calculate_stops(df, entry_price, position)

        if position == "LONG":
            # 在中轨止盈
            if current['Close'] >= bb_middle:
                return True, "TARGET"

            # 止损
            if current['Close'] <= stop_loss:
                return True, "STOP_LOSS"

            # RSI超买（动量转变）
            if current['RSI'] > 70:
                return True, "MOMENTUM_SHIFT"

        elif position == "SHORT":
            # 在中轨止盈
            if current['Close'] <= bb_middle:
                return True, "TARGET"

            # 止损
            if current['Close'] >= stop_loss:
                return True, "STOP_LOSS"

            # RSI超卖（动量转变）
            if current['RSI'] < 30:
                return True, "MOMENTUM_SHIFT"

        return False, None
```

## 💰 风险管理

### 仓位大小

```python
def calculate_position_size(account_size, risk_percent, entry_price, stop_loss):
    """
    均值回归的仓位大小
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    # 限制仓位为账户的10%
    max_shares = int((account_size * 0.10) / entry_price)
    shares = min(shares, max_shares)

    return shares
```

### 交易管理

**规则**：
1. **加仓**：如果价格进一步不利，增加仓位（谨慎！）
2. **减仓**：在目标位置部分获利
3. **时间止损**：如果5-10天内没有回归则退出
4. **相关性**：避免多个相关的均值回归交易

## 📊 高级均值回归

### 配对交易

**概念**：交易相关资产之间的价差

```python
def pairs_trading(df1, df2, lookback=20, entry_z=2, exit_z=0.5):
    """
    配对交易策略
    """
    # 计算价差
    spread = df1['Close'] / df2['Close']

    # 计算价差的Z分数
    mean = spread.rolling(lookback).mean()
    std = spread.rolling(lookback).std()
    z_score = (spread - mean) / std

    # 生成信号
    signals = []
    position = 0

    for z in z_score:
        if z < -entry_z and position == 0:
            signals.append("LONG_SPREAD")  # 买入df1，卖出df2
            position = 1
        elif z > entry_z and position == 0:
            signals.append("SHORT_SPREAD")  # 卖出df1，买入df2
            position = -1
        elif abs(z) < exit_z and position != 0:
            signals.append("EXIT")
            position = 0
        else:
            signals.append("HOLD")

    return signals
```

### 统计套利

**概念**：交易多个均值回归工具

```python
class StatArbSystem:
    def __init__(self, universe, lookback=60):
        self.universe = universe
        self.lookback = lookback

    def find_opportunities(self, data):
        """
        在整个范围内寻找均值回归机会
        """
        opportunities = []

        for ticker in self.universe:
            df = data[ticker]

            # 计算Z分数
            mean = df['Close'].rolling(self.lookback).mean()
            std = df['Close'].rolling(self.lookback).std()
            z_score = (df['Close'].iloc[-1] - mean.iloc[-1]) / std.iloc[-1]

            # 检查极端偏离
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

        # 按预期回报排序
        opportunities.sort(key=lambda x: x['expected_return'], reverse=True)

        return opportunities[:5]  # 前5个机会
```

## ⚠️ 均值回归失效的情况

### 趋势市场

均值回归在强趋势中失效：
- 不要逆势而为
- 使用趋势过滤器（MA、ADX）
- 在趋势市场中减少仓位大小

### 结构性变化

均值回归假设均值是稳定的：
- 公司基本面变化
- 市场机制转变
- 黑天鹅事件

**解决方案**：使用较短的回溯期，监控基本面

## 🎓 检查您的理解

1. 什么是均值回归？
2. 如何使用布林带进行均值回归？
3. 什么是Z分数，如何使用？
4. 均值回归在什么时候效果最好？
5. 什么是配对交易？

## 💻 实践练习

```python
# 实现并测试均值回归系统
system = MeanReversionSystem()

# 在区间震荡股票上测试
tickers = ["XLE", "XLU", "XLP"]  # 防御性板块

for ticker in tickers:
    df = yf.Ticker(ticker).history(period="2y")
    df = system.calculate_indicators(df)

    # 回测
    results = backtest_mean_reversion(df, system)
    print(f"\n{ticker}:")
    print(f"胜率：{results['win_rate']:.2%}")
    print(f"平均交易：{results['avg_trade']:.2%}")
```

## 📝 练习4.2

创建：`exercises/module-04/exercise-4.2-mean-reversion.md`

1. 实现布林带均值回归系统
2. 实现RSI均值回归系统
3. 比较5只股票的表现
4. 在趋势市场与区间市场中测试
5. 记录哪些条件效果最好

## 📚 资源

- [Investopedia: Mean Reversion](https://www.investopedia.com/terms/m/meanreversion.asp)
- [Quantpedia: Mean Reversion Strategies](https://quantpedia.com/strategies/mean-reversion/)
- [Ernest Chan: Algorithmic Trading](https://www.amazon.com/Algorithmic-Trading-Winning-Strategies-Rationale/dp/1118460146)

## ✅ 答案

1. **均值回归**：价格随时间回归平均值的理论；极端波动是暂时的
2. **布林带均值回归**：当价格触及下轨（超卖）时买入，在上轨（超买）时卖出，在中轨退出
3. **Z分数**：衡量与均值的标准差距离；Z > 2或< -2表示极端偏离，可能回归
4. **效果最好**：区间震荡市场、稳定股票、短时间框架；在强趋势中失效
5. **配对交易**：交易两个相关资产之间的价差；当价差回归均值时获利

---

**下一课**：[第4.3课：突破策略](lesson-03-breakout.md)
