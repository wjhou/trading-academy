# 第4.3课：突破策略 - 捕捉新趋势

**模块**：4 - 交易策略
**预计时间**：50分钟
**难度**：中级

## 🎯 学习目标

- 理解突破交易原则
- 识别有效的突破设置
- 实现区间和形态突破
- 过滤假突破
- 有效管理突破交易

## 📖 什么是突破？

**突破**是指价格以增强的动量突破定义的支撑或阻力位。

### 突破类型

1. **区间突破**：价格突破盘整区间
2. **形态突破**：价格突破图表形态（三角形、旗形）
3. **新高/新低**：价格达到52周高点/低点
4. **波动率突破**：价格从低波动率扩张

## 📊 突破策略

### 1. 区间突破

```python
def range_breakout(df, lookback=20, volume_multiplier=1.5):
    """
    交易盘整区间的突破
    """
    # 识别区间
    df['Range_High'] = df['High'].rolling(lookback).max()
    df['Range_Low'] = df['Low'].rolling(lookback).min()
    df['Range_Width'] = df['Range_High'] - df['Range_Low']

    # 平均成交量
    df['Avg_Volume'] = df['Volume'].rolling(lookback).mean()

    # 信号
    df['Signal'] = 0

    # 看涨突破
    df.loc[(df['Close'] > df['Range_High'].shift(1)) &
           (df['Volume'] > df['Avg_Volume'] * volume_multiplier), 'Signal'] = 1

    # 看跌突破
    df.loc[(df['Close'] < df['Range_Low'].shift(1)) &
           (df['Volume'] > df['Avg_Volume'] * volume_multiplier), 'Signal'] = -1

    return df
```

### 2. 波动率突破（布林带挤压）

```python
def volatility_breakout(df, bb_period=20, squeeze_threshold=0.5):
    """
    波动率收缩后交易突破
    """
    # 布林带
    df['BB_Middle'] = df['Close'].rolling(bb_period).mean()
    df['BB_Std'] = df['Close'].rolling(bb_period).std()
    df['BB_Upper'] = df['BB_Middle'] + (2 * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (2 * df['BB_Std'])
    df['BB_Width'] = (df['BB_Upper'] - df['BB_Lower']) / df['BB_Middle']

    # 识别挤压
    df['BB_Width_Avg'] = df['BB_Width'].rolling(50).mean()
    df['Squeeze'] = df['BB_Width'] < (df['BB_Width_Avg'] * squeeze_threshold)

    # 突破信号
    df['Signal'] = 0

    # 挤压后向上突破时买入
    df.loc[df['Squeeze'].shift(1) & (df['Close'] > df['BB_Upper']), 'Signal'] = 1

    # 挤压后向下突破时卖出
    df.loc[df['Squeeze'].shift(1) & (df['Close'] < df['BB_Lower']), 'Signal'] = -1

    return df
```

### 3. 新高/新低突破

```python
def new_high_breakout(df, period=252):  # 252 = 1年
    """
    交易52周高点/低点突破
    """
    df['Period_High'] = df['High'].rolling(period).max()
    df['Period_Low'] = df['Low'].rolling(period).min()

    df['Signal'] = 0

    # 伴随成交量的新高
    df.loc[(df['Close'] >= df['Period_High'].shift(1)) &
           (df['Volume'] > df['Volume'].rolling(20).mean()), 'Signal'] = 1

    # 伴随成交量的新低
    df.loc[(df['Close'] <= df['Period_Low'].shift(1)) &
           (df['Volume'] > df['Volume'].rolling(20).mean()), 'Signal'] = -1

    return df
```

## 🎯 完整的突破系统

```python
class BreakoutSystem:
    def __init__(self, lookback=20, volume_mult=1.5):
        self.lookback = lookback
        self.volume_mult = volume_mult

    def identify_consolidation(self, df):
        """
        寻找盘整期
        """
        # 计算ATR
        df['TR'] = df[['High', 'Low', 'Close']].apply(
            lambda x: max(x['High'] - x['Low'],
                         abs(x['High'] - x['Close']),
                         abs(x['Low'] - x['Close'])), axis=1)
        df['ATR'] = df['TR'].rolling(14).mean()

        # 窄幅区间（ATR下降）
        df['ATR_Slope'] = df['ATR'].diff(5)
        df['Consolidating'] = df['ATR_Slope'] < 0

        return df

    def validate_breakout(self, df):
        """
        确认突破有效性
        """
        current = df.iloc[-1]
        prev = df.iloc[-2]

        # 成交量确认
        volume_ok = current['Volume'] > current['Avg_Volume'] * self.volume_mult

        # 价格行为（强势收盘）
        close_strength = (current['Close'] - current['Low']) / (current['High'] - current['Low'])
        strong_close = close_strength > 0.7

        # 动量（RSI未超买）
        rsi_ok = 30 < current['RSI'] < 70

        return volume_ok and strong_close and rsi_ok

    def calculate_entry(self, df, direction):
        """
        入场价格和时机
        """
        if direction == "LONG":
            # 突破阻力位时入场
            entry = df['Range_High'].iloc[-1]
        else:
            # 跌破支撑位时入场
            entry = df['Range_Low'].iloc[-1]

        return entry

    def calculate_stops(self, df, entry, direction):
        """
        止损和目标
        """
        atr = df['ATR'].iloc[-1]
        range_width = df['Range_Width'].iloc[-1]

        if direction == "LONG":
            stop_loss = entry - (1.5 * atr)
            target1 = entry + range_width  # 区间投影
            target2 = entry + (2 * range_width)
        else:
            stop_loss = entry + (1.5 * atr)
            target1 = entry - range_width
            target2 = entry - (2 * range_width)

        return stop_loss, target1, target2
```

## 🔍 过滤假突破

### 1. 成交量过滤器

**规则**：成交量必须是平均值的1.5-2倍

```python
def volume_filter(df, multiplier=1.5):
    avg_vol = df['Volume'].rolling(20).mean().iloc[-1]
    current_vol = df['Volume'].iloc[-1]
    return current_vol > avg_vol * multiplier
```

### 2. 盘整持续时间

**规则**：最少10-20天的盘整

```python
def consolidation_filter(df, min_days=10):
    # 检查区间是否稳定
    range_high = df['High'].rolling(min_days).max()
    range_low = df['Low'].rolling(min_days).min()
    range_width = range_high - range_low

    # 如果宽度变化不大则稳定
    width_change = range_width.diff(min_days).abs()
    stable = width_change.iloc[-1] < range_width.iloc[-1] * 0.2

    return stable
```

### 3. 趋势背景

**规则**：沿着更大趋势方向交易突破

```python
def trend_filter(df):
    ma_50 = df['Close'].rolling(50).mean().iloc[-1]
    ma_200 = df['Close'].rolling(200).mean().iloc[-1]

    if ma_50 > ma_200:
        return "UPTREND"  # 仅做多突破
    elif ma_50 < ma_200:
        return "DOWNTREND"  # 仅做空突破
    else:
        return "NEUTRAL"  # 双向

## 💰 风险管理

### 仓位大小

```python
def breakout_position_size(account, risk_pct, entry, stop, max_position_pct=0.15):
    """
    突破交易的仓位大小
    """
    # 基于风险的仓位
    risk_amount = account * risk_pct
    risk_per_share = abs(entry - stop)
    shares = int(risk_amount / risk_per_share)

    # 限制最大仓位
    max_shares = int((account * max_position_pct) / entry)
    shares = min(shares, max_shares)

    return shares
```

### 加仓策略

```python
def scale_into_breakout(entry, target1, target2):
    """
    随着突破确认逐步加仓
    """
    return {
        'entry_1': entry,  # 50%仓位
        'entry_2': entry + (target1 - entry) * 0.3,  # 再加30%
        'entry_3': entry + (target1 - entry) * 0.6,  # 再加20%
    }
```

## 📊 回测突破策略

```python
def backtest_breakout_strategy(df, system):
    """
    回测突破系统
    """
    df = system.identify_consolidation(df)
    df = range_breakout(df)

    trades = []
    position = None

    for i in range(system.lookback, len(df)):
        current_df = df.iloc[:i+1]

        if position:
            # 检查出场
            current_price = current_df['Close'].iloc[-1]

            if position['direction'] == "LONG":
                if current_price >= position['target1']:
                    # 止盈
                    pnl = (current_price - position['entry']) * position['shares']
                    trades.append({'pnl': pnl, 'exit_reason': 'TARGET'})
                    position = None
                elif current_price <= position['stop']:
                    # 止损
                    pnl = (current_price - position['entry']) * position['shares']
                    trades.append({'pnl': pnl, 'exit_reason': 'STOP'})
                    position = None

        else:
            # 检查入场
            signal = current_df['Signal'].iloc[-1]

            if signal != 0 and system.validate_breakout(current_df):
                direction = "LONG" if signal == 1 else "SHORT"
                entry = current_df['Close'].iloc[-1]
                stop, target1, target2 = system.calculate_stops(current_df, entry, direction)

                position = {
                    'direction': direction,
                    'entry': entry,
                    'stop': stop,
                    'target1': target1,
                    'shares': 100  # 简化
                }

    return trades
```

## ⚠️ 常见错误

1. **追逐突破**：在大幅波动后入场太晚
2. **忽视成交量**：在没有成交量确认的情况下交易突破
3. **没有止损**：希望失败的突破反转
4. **错误的背景**：逆更大趋势交易
5. **过度交易**：不加过滤地接受每个突破

## 🎓 检查您的理解

1. 什么定义了有效的突破？
2. 为什么成交量在突破中很重要？
3. 什么是假突破？
4. 如何计算突破目标？
5. 何时应该避免突破交易？

## 💻 实践练习

```python
# 实现突破系统
system = BreakoutSystem(lookback=20)

# 在波动性股票上测试
tickers = ["TSLA", "NVDA", "AMD"]

for ticker in tickers:
    df = yf.Ticker(ticker).history(period="2y")
    trades = backtest_breakout_strategy(df, system)

    win_rate = len([t for t in trades if t['pnl'] > 0]) / len(trades)
    print(f"{ticker} 胜率：{win_rate:.2%}")
```

## 📝 练习4.3

创建：`exercises/module-04/exercise-4.3-breakout.md`

1. 实现区间突破系统
2. 添加成交量和盘整过滤器
3. 在5只股票上回测
4. 比较有无过滤器的结果
5. 分析假突破率

## 📚 资源

- [Investopedia: Breakout Trading](https://www.investopedia.com/articles/trading/08/trading-breakouts.asp)
- [StockCharts: Breakout Patterns](https://school.stockcharts.com/doku.php?id=chart_analysis:chart_patterns)

## ✅ 答案

1. **有效突破**：价格以高成交量、强势收盘突破支撑/阻力位，在盘整期后
2. **成交量重要性**：确认真实兴趣；低成交量突破通常失败（假突破）
3. **假突破**：价格短暂突破水平后反转；由止损猎杀或缺乏信念引起
4. **突破目标**：从突破点投影区间宽度；或使用斐波那契扩展
5. **避免突破**：在震荡/区间市场中，逆主要趋势，没有成交量确认

---

**下一课**：[第4.4课：动量策略](lesson-04-momentum.md)
