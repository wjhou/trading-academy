# 第4.1课：趋势跟踪 - 顺势而为

**模块**：4 - 交易策略
**预计时间**：60分钟
**难度**：中级

## 🎯 学习目标

在本课结束时，您将能够：
- 理解趋势跟踪的理念和原则
- 学习经典的趋势跟踪策略
- 实现移动平均线交叉系统
- 应用突破趋势跟踪方法
- 管理趋势跟踪交易中的风险

## 📖 什么是趋势跟踪？

**趋势跟踪**是一种交易策略，试图通过跟随已建立的市场趋势来获取收益。

### 核心理念

> "趋势是你的朋友，直到它结束"

**关键原则**：
- 市场趋势的频率高于反转
- 趋势持续时间比预期更长
- 快速止损，让盈利奔跑
- 不要预测，对价格行为做出反应

### 趋势跟踪为何有效

1. **市场心理**：羊群行为延长趋势
2. **动量**：运动中的物体倾向于保持运动
3. **信息流**：新闻需要时间才能完全反映在价格中
4. **风险管理**：小额亏损，大额收益

## 📊 趋势跟踪策略类型

### 1. 移动平均线交叉

**概念**：当快速均线穿越慢速均线时交易

**经典设置**：
- 快速均线：50日
- 慢速均线：200日
- 买入：金叉（50 > 200）
- 卖出：死叉（50 < 200）

```python
def ma_crossover_strategy(df, fast=50, slow=200):
    """
    移动平均线交叉策略
    """
    df['MA_Fast'] = df['Close'].rolling(fast).mean()
    df['MA_Slow'] = df['Close'].rolling(slow).mean()

    # 生成信号
    df['Signal'] = 0
    df.loc[df['MA_Fast'] > df['MA_Slow'], 'Signal'] = 1  # 做多
    df.loc[df['MA_Fast'] < df['MA_Slow'], 'Signal'] = -1  # 做空

    # 检测交叉
    df['Position'] = df['Signal'].diff()

    return df

# 示例
import yfinance as yf
df = yf.Ticker("SPY").history(period="5y")
df = ma_crossover_strategy(df)

# 查找最近的交叉
crossovers = df[df['Position'] != 0][['Close', 'MA_Fast', 'MA_Slow', 'Position']]
print(crossovers.tail())
```

**优点**：
- 简单且客观
- 在强趋势中有效
- 易于自动化

**缺点**：
- 进出场较晚
- 在横盘市场中产生假信号
- 在反转时回吐利润

### 2. 突破趋势跟踪

**概念**：当价格突破至新高/新低时入场

**唐奇安通道策略**：
```python
def donchian_breakout(df, period=20):
    """
    唐奇安通道突破
    """
    # 计算通道
    df['Upper'] = df['High'].rolling(period).max()
    df['Lower'] = df['Low'].rolling(period).min()
    df['Middle'] = (df['Upper'] + df['Lower']) / 2

    # 生成信号
    df['Signal'] = 0

    # 上通道突破时买入
    df.loc[df['Close'] > df['Upper'].shift(1), 'Signal'] = 1

    # 下通道突破时卖出
    df.loc[df['Close'] < df['Lower'].shift(1), 'Signal'] = -1

    return df

# 示例
df = donchian_breakout(df, period=20)
```

**优点**：
- 早期捕捉趋势
- 明确的入场信号
- 客观规则

**缺点**：
- 假突破
- 需要纪律
- 可能波动较大

### 3. 带过滤器的趋势跟踪

**概念**：添加过滤器以减少假信号

**ADX过滤策略**：
```python
def trend_following_with_adx(df, ma_period=50, adx_period=14, adx_threshold=25):
    """
    带ADX过滤的趋势跟踪
    """
    # 计算均线
    df['MA'] = df['Close'].rolling(ma_period).mean()

    # 计算ADX（简化版）
    df['TR'] = df[['High', 'Low', 'Close']].apply(
        lambda x: max(x['High'] - x['Low'],
                     abs(x['High'] - x['Close']),
                     abs(x['Low'] - x['Close'])), axis=1)

    df['ATR'] = df['TR'].rolling(adx_period).mean()

    # 方向性运动
    df['Plus_DM'] = df['High'].diff()
    df['Minus_DM'] = -df['Low'].diff()

    df['Plus_DM'] = df['Plus_DM'].where(
        (df['Plus_DM'] > df['Minus_DM']) & (df['Plus_DM'] > 0), 0)
    df['Minus_DM'] = df['Minus_DM'].where(
        (df['Minus_DM'] > df['Plus_DM']) & (df['Minus_DM'] > 0), 0)

    df['Plus_DI'] = 100 * (df['Plus_DM'].rolling(adx_period).mean() / df['ATR'])
    df['Minus_DI'] = 100 * (df['Minus_DM'].rolling(adx_period).mean() / df['ATR'])

    df['DX'] = 100 * abs(df['Plus_DI'] - df['Minus_DI']) / (df['Plus_DI'] + df['Minus_DI'])
    df['ADX'] = df['DX'].rolling(adx_period).mean()

    # 仅在ADX > 阈值时生成信号（趋势市场）
    df['Signal'] = 0
    df.loc[(df['Close'] > df['MA']) & (df['ADX'] > adx_threshold), 'Signal'] = 1
    df.loc[(df['Close'] < df['MA']) & (df['ADX'] > adx_threshold), 'Signal'] = -1

    return df
```

**优点**：
- 过滤掉区间市场
- 更高质量的信号
- 更好的风险调整回报

**缺点**：
- 更复杂
- 错过一些趋势
- 需要参数调整

## 🎯 完整的趋势跟踪系统

### 入场规则

```python
class TrendFollowingSystem:
    def __init__(self, fast_ma=50, slow_ma=200, atr_period=14):
        self.fast_ma = fast_ma
        self.slow_ma = slow_ma
        self.atr_period = atr_period

    def calculate_indicators(self, df):
        # 移动平均线
        df['MA_Fast'] = df['Close'].rolling(self.fast_ma).mean()
        df['MA_Slow'] = df['Close'].rolling(self.slow_ma).mean()

        # 用于止损的ATR
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(self.atr_period).mean()

        return df

    def generate_entry_signal(self, df):
        """
        入场条件
        """
        current = df.iloc[-1]
        previous = df.iloc[-2]

        # 做多入场：金叉
        if (previous['MA_Fast'] <= previous['MA_Slow'] and
            current['MA_Fast'] > current['MA_Slow']):
            return "BUY"

        # 做空入场：死叉
        elif (previous['MA_Fast'] >= previous['MA_Slow'] and
              current['MA_Fast'] < current['MA_Slow']):
            return "SELL"

        return "HOLD"

    def calculate_position_size(self, df, account_size, risk_per_trade=0.02):
        """
        基于ATR的仓位大小
        """
        current = df.iloc[-1]
        atr = current['ATR']
        price = current['Close']

        # 风险金额
        risk_amount = account_size * risk_per_trade

        # 止损距离（2倍ATR）
        stop_distance = 2 * atr

        # 仓位大小
        shares = int(risk_amount / stop_distance)

        return shares

    def calculate_stops(self, df, entry_price, direction):
        """
        计算止损和止盈
        """
        atr = df['ATR'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry_price - (2 * atr)
            take_profit = entry_price + (4 * atr)  # 2:1 盈亏比
        else:  # SHORT
            stop_loss = entry_price + (2 * atr)
            take_profit = entry_price - (4 * atr)

        return stop_loss, take_profit

    def trailing_stop(self, df, entry_price, direction, atr_multiplier=2):
        """
        基于ATR的跟踪止损
        """
        current_price = df['Close'].iloc[-1]
        atr = df['ATR'].iloc[-1]

        if direction == "LONG":
            trailing_stop = current_price - (atr_multiplier * atr)
            return max(trailing_stop, entry_price - (2 * atr))  # 永远不会比初始止损更差
        else:  # SHORT
            trailing_stop = current_price + (atr_multiplier * atr)
            return min(trailing_stop, entry_price + (2 * atr))
```

### 出场规则

**出场条件**：
1. **触及止损**：距离入场价2倍ATR
2. **趋势反转**：均线向相反方向交叉
3. **跟踪止损**：随着趋势继续锁定利润
4. **时间止损**：如果X天内没有进展则退出

```python
def should_exit(self, df, position, entry_price, entry_date):
    """
    出场逻辑
    """
    current = df.iloc[-1]
    days_in_trade = (current.name - entry_date).days

    if position == "LONG":
        # 止损
        stop_loss, _ = self.calculate_stops(df, entry_price, "LONG")
        if current['Close'] <= stop_loss:
            return True, "STOP_LOSS"

        # 趋势反转
        if current['MA_Fast'] < current['MA_Slow']:
            return True, "TREND_REVERSAL"

        # 时间止损（30天无盈利）
        if days_in_trade > 30 and current['Close'] <= entry_price:
            return True, "TIME_STOP"

    elif position == "SHORT":
        # 止损
        stop_loss, _ = self.calculate_stops(df, entry_price, "SHORT")
        if current['Close'] >= stop_loss:
            return True, "STOP_LOSS"

        # 趋势反转
        if current['MA_Fast'] > current['MA_Slow']:
            return True, "TREND_REVERSAL"

        # 时间止损
        if days_in_trade > 30 and current['Close'] >= entry_price:
            return True, "TIME_STOP"

    return False, None
```

## 💰 趋势跟踪的风险管理

### 仓位大小

**固定比例法**：
```python
def fixed_fractional_sizing(account_size, risk_percent, entry_price, stop_loss):
    """
    每笔交易风险固定百分比的账户资金
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)
    return shares

# 示例
account = 100000
risk = 0.02  # 每笔交易2%
entry = 150
stop = 145

shares = fixed_fractional_sizing(account, risk, entry, stop)
print(f"仓位大小：{shares}股")
print(f"总仓位价值：${shares * entry:,.2f}")
print(f"风险金额：${shares * (entry - stop):,.2f}")
```

### 投资组合配置

**分散化规则**：
- 每个仓位最多20%
- 最多5个相关仓位
- 保留20%现金储备

```python
def check_portfolio_limits(portfolio, new_position_value, total_portfolio_value):
    """
    检查新仓位是否违反限制
    """
    # 检查仓位大小限制（20%）
    if new_position_value > total_portfolio_value * 0.20:
        return False, "仓位过大"

    # 检查仓位数量
    if len(portfolio) >= 10:
        return False, "仓位过多"

    # 检查现金储备
    cash = total_portfolio_value - sum(p['value'] for p in portfolio.values())
    if cash < total_portfolio_value * 0.20:
        return False, "现金储备不足"

    return True, "OK"
```

## 📊 回测趋势跟踪

```python
def backtest_trend_following(df, initial_capital=100000):
    """
    回测趋势跟踪策略
    """
    system = TrendFollowingSystem()
    df = system.calculate_indicators(df)

    capital = initial_capital
    position = None
    entry_price = 0
    entry_date = None
    trades = []

    for i in range(system.slow_ma, len(df)):
        current_df = df.iloc[:i+1]
        current = current_df.iloc[-1]

        # 如果持有仓位，检查出场
        if position:
            should_exit_trade, exit_reason = system.should_exit(
                current_df, position, entry_price, entry_date)

            if should_exit_trade:
                # 计算盈亏
                if position == "LONG":
                    pnl = (current['Close'] - entry_price) * shares
                else:  # SHORT
                    pnl = (entry_price - current['Close']) * shares

                capital += pnl

                trades.append({
                    'entry_date': entry_date,
                    'exit_date': current.name,
                    'direction': position,
                    'entry_price': entry_price,
                    'exit_price': current['Close'],
                    'shares': shares,
                    'pnl': pnl,
                    'exit_reason': exit_reason
                })

                position = None

        # 如果未持有仓位，检查入场
        if not position:
            signal = system.generate_entry_signal(current_df)

            if signal in ["BUY", "SELL"]:
                position = "LONG" if signal == "BUY" else "SHORT"
                entry_price = current['Close']
                entry_date = current.name
                shares = system.calculate_position_size(current_df, capital)

    # 计算指标
    total_trades = len(trades)
    winning_trades = len([t for t in trades if t['pnl'] > 0])
    win_rate = winning_trades / total_trades if total_trades > 0 else 0

    total_pnl = sum(t['pnl'] for t in trades)
    final_capital = capital
    total_return = (final_capital - initial_capital) / initial_capital

    return {
        'trades': trades,
        'total_trades': total_trades,
        'win_rate': win_rate,
        'total_pnl': total_pnl,
        'final_capital': final_capital,
        'total_return': total_return
    }

# 示例
results = backtest_trend_following(df)
print(f"总交易次数：{results['total_trades']}")
print(f"胜率：{results['win_rate']:.2%}")
print(f"总回报：{results['total_return']:.2%}")
```

## ⚠️ 常见错误

1. **过早退出**：让盈利奔跑
2. **不使用止损**：保护资本
3. **逆势交易**：等待确认
4. **过度交易**：耐心等待设置
5. **忽视风险管理**：正确调整仓位大小

## 🎓 检查您的理解

1. 趋势跟踪的核心原则是什么？
2. 什么是金叉？
3. 如何使用ATR计算仓位大小？
4. 何时应该退出趋势跟踪交易？
5. 为什么使用ADX作为过滤器？

## 💻 实践练习

实现并测试趋势跟踪系统：

```python
# 您的任务：完成此系统
system = TrendFollowingSystem(fast_ma=50, slow_ma=200)

# 在多只股票上测试
tickers = ["SPY", "QQQ", "IWM"]
for ticker in tickers:
    df = yf.Ticker(ticker).history(period="5y")
    results = backtest_trend_following(df)
    print(f"\n{ticker}结果：")
    print(f"胜率：{results['win_rate']:.2%}")
    print(f"总回报：{results['total_return']:.2%}")
```

## 📝 练习4.1

创建：`exercises/module-04/exercise-4.1-trend-following.md`

1. 实现完整的趋势跟踪系统
2. 在5只不同股票上回测
3. 比较不同的均线周期（20/50、50/200、100/200）
4. 分析哪些市场效果最好
5. 记录您的发现

## 📚 资源

- [Investopedia: Trend Following](https://www.investopedia.com/articles/trading/06/trendtrading.asp)
- [Covel: Trend Following](https://www.trendfollowing.com/)
- [Turtle Trading Rules](https://www.tradingblox.com/originalturtles/originalturtlerules.htm)

## ✅ 答案

1. **核心原则**：跟随已建立的趋势，不要预测；快速止损，让盈利奔跑
2. **金叉**：当快速均线（50日）向上穿越慢速均线（200日）；看涨信号
3. **使用ATR计算仓位大小**：风险金额 / (ATR × 倍数)；确保每笔交易的风险一致
4. **出场条件**：触及止损、趋势反转（均线交叉）、跟踪止损或时间止损
5. **ADX过滤器**：衡量趋势强度；仅在ADX > 25时交易以避免区间市场

---

**下一课**：[第4.2课：均值回归](lesson-02-mean-reversion.md)
