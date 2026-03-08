# 课程 3.5：组合指标 - 构建完整系统

**模块**：3 - 技术指标
**预计时间**：60 分钟
**难度**：中级到高级

## 🎯 学习目标

- 学习如何有效组合多个指标
- 理解指标类别和互补配对
- 构建多指标交易系统
- 避免指标过载的常见陷阱
- 创建稳健的确认策略

## 📖 为什么要组合指标？

单一指标有局限性。组合它们可以提供：

- **确认**：多个信号减少假阳性
- **互补信息**：市场的不同方面
- **减少震荡**：过滤噪音
- **更高概率设置**：汇合增加成功率

### 过多指标的问题

**指标过载**导致：
- 分析瘫痪
- 信号冲突
- 曲线拟合（仅适用于历史数据）
- 错过机会

**经验法则**：最多使用 3-5 个指标

## 📊 指标类别

### 1. 趋势指标

**显示内容**：趋势的方向和强度

**示例**：
- 移动平均线（SMA、EMA）
- MACD
- ADX（平均趋向指数）

**用途**：识别趋势方向

### 2. 动量指标

**显示内容**：价格变化的速度

**示例**：
- RSI
- 随机振荡器
- 变化率（ROC）

**用途**：超买/超卖，背离

### 3. 波动率指标

**显示内容**：价格波动范围

**示例**：
- 布林带
- ATR（平均真实波幅）
- 肯特纳通道

**用途**：突破，止损设置

### 4. 成交量指标

**显示内容**：交易活动和信念

**示例**：
- OBV
- VWAP
- CMF

**用途**：确认价格走势

## 🎯 有效的指标组合

### 组合 1：趋势 + 动量

**目的**：在趋势中交易回调

**指标**：
- 50 日 MA（趋势）
- RSI（动量）

**策略**：
```python
def trend_momentum_strategy(df):
    price = df['Close'].iloc[-1]
    ma_50 = df['Close'].rolling(50).mean().iloc[-1]
    rsi = calculate_rsi(df).iloc[-1]

    # 上升趋势 + 超卖 = 买入
    if price > ma_50 and 30 < rsi < 40:
        return "BUY"

    # 下降趋势 + 超买 = 卖出
    elif price < ma_50 and 60 < rsi < 70:
        return "SELL"

    return "HOLD"
```

### 组合 2：趋势 + 波动率

**目的**：从盘整中交易突破

**指标**：
- MACD（趋势）
- 布林带（波动率）

**策略**：
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

    # 收缩 + 看涨 MACD 交叉 + 突破
    if bb_width < bb_width_avg * 0.6:  # 收缩
        if macd > signal and price > bb_upper:  # 看涨突破
            return "BUY"

    return "HOLD"
```

### 组合 3：动量 + 成交量

**目的**：用成交量确认动量

**指标**：
- RSI（动量）
- OBV（成交量）

**策略**：
```python
def momentum_volume_strategy(df):
    df['RSI'] = calculate_rsi(df)
    df = calculate_obv(df)

    rsi = df['RSI'].iloc[-1]
    rsi_prev = df['RSI'].iloc[-2]
    obv_trend = df['OBV'].iloc[-1] > df['OBV'].rolling(20).mean().iloc[-1]

    # RSI 穿越 50 + OBV 确认
    if rsi_prev < 50 and rsi >= 50 and obv_trend:
        return "BUY"
    elif rsi_prev > 50 and rsi <= 50 and not obv_trend:
        return "SELL"

    return "HOLD"
```

### 组合 4：三重确认

**目的**：高概率设置

**指标**：
- MA（趋势）
- MACD（动量）
- 成交量（确认）

**策略**：
```python
def triple_confirmation_strategy(df):
    # 计算指标
    df['MA_50'] = df['Close'].rolling(50).mean()
    df = calculate_macd(df)

    price = df['Close'].iloc[-1]
    ma_50 = df['MA_50'].iloc[-1]
    macd = df['MACD'].iloc[-1]
    signal = df['Signal'].iloc[-1]
    volume = df['Volume'].iloc[-1]
    avg_volume = df['Volume'].rolling(20).mean().iloc[-1]

    # 三者都确认看涨
    if (price > ma_50 and  # 趋势
        macd > signal and  # 动量
        volume > avg_volume * 1.3):  # 成交量
        return "BUY"

    # 三者都确认看跌
    elif (price < ma_50 and
          macd < signal and
          volume > avg_volume * 1.3):
        return "SELL"

    return "HOLD"
```

## 🏗️ 构建完整交易系统

### 步骤 1：定义您的时间框架

- **日内交易**：5 分钟、15 分钟图表
- **波段交易**：日线图
- **持仓交易**：周线图

### 步骤 2：选择互补指标

从每个类别中选择一个：
1. **趋势**：MA 或 MACD
2. **动量**：RSI 或随机指标
3. **成交量**：OBV 或 VWAP
4. **可选波动率**：布林带或 ATR

### 步骤 3：定义入场规则

必须满足所有条件：

```python
class TradingSystem:
    def __init__(self):
        self.indicators = {}

    def calculate_indicators(self, df):
        # 趋势
        df['MA_50'] = df['Close'].rolling(50).mean()
        df['MA_200'] = df['Close'].rolling(200).mean()

        # 动量
        df['RSI'] = calculate_rsi(df)

        # 趋势/动量
        df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

        # 成交量
        df = calculate_obv(df)

        # 波动率
        df = calculate_bollinger_bands(df)

        return df

    def generate_signal(self, df):
        df = self.calculate_indicators(df)

        # 当前值
        price = df['Close'].iloc[-1]
        ma_50 = df['MA_50'].iloc[-1]
        ma_200 = df['MA_200'].iloc[-1]
        rsi = df['RSI'].iloc[-1]
        macd = df['MACD'].iloc[-1]
        signal = df['Signal'].iloc[-1]
        obv_ma = df['OBV'].rolling(20).mean().iloc[-1]
        obv = df['OBV'].iloc[-1]

        # 做多入场条件
        if (price > ma_50 > ma_200 and  # 强劲上升趋势
            30 < rsi < 60 and  # 未超买
            macd > signal and  # 看涨动量
            obv > obv_ma):  # 成交量确认
            return "BUY"

        # 做空入场条件
        elif (price < ma_50 < ma_200 and  # 强劲下降趋势
              40 < rsi < 70 and  # 未超卖
              macd < signal and  # 看跌动量
              obv < obv_ma):  # 成交量确认
            return "SELL"

        return "HOLD"

    def get_stop_loss(self, df, entry_price, direction):
        """使用 ATR 计算止损"""
        atr = calculate_atr(df, period=14).iloc[-1]

        if direction == "LONG":
            return entry_price - (2 * atr)
        else:  # SHORT
            return entry_price + (2 * atr)

    def get_take_profit(self, df, entry_price, stop_loss, direction):
        """计算 2:1 风险回报的止盈"""
        risk = abs(entry_price - stop_loss)

        if direction == "LONG":
            return entry_price + (2 * risk)
        else:  # SHORT
            return entry_price - (2 * risk)
```

### 步骤 4：定义出场规则

```python
def should_exit(self, df, position):
    """
    出场条件
    """
    price = df['Close'].iloc[-1]
    rsi = df['RSI'].iloc[-1]
    macd = df['MACD'].iloc[-1]
    signal = df['Signal'].iloc[-1]

    if position == "LONG":
        # 如果以下情况退出多头：
        if (rsi > 70 or  # 超买
            macd < signal or  # 动量转向
            price < df['MA_50'].iloc[-1]):  # 趋势破坏
            return True

    elif position == "SHORT":
        # 如果以下情况退出空头：
        if (rsi < 30 or  # 超卖
            macd > signal or  # 动量转向
            price > df['MA_50'].iloc[-1]):  # 趋势破坏
            return True

    return False
```

## 📊 高级组合

### "三屏"系统（Dr. Alexander Elder）

**屏幕 1**：周线趋势（MA 或 MACD）
**屏幕 2**：日线振荡器（RSI 或随机指标）
**屏幕 3**：日内入场（价格行为）

```python
def three_screens_system(df_weekly, df_daily, df_hourly):
    # 屏幕 1：周线趋势
    weekly_trend = "UP" if df_weekly['MA_50'].iloc[-1] > df_weekly['MA_200'].iloc[-1] else "DOWN"

    # 屏幕 2：日线振荡器
    daily_rsi = calculate_rsi(df_daily).iloc[-1]

    # 屏幕 3：小时入场
    hourly_price = df_hourly['Close'].iloc[-1]
    hourly_ma = df_hourly['Close'].rolling(20).mean().iloc[-1]

    # 买入设置
    if weekly_trend == "UP" and daily_rsi < 40:
        if hourly_price > hourly_ma:
            return "BUY"

    # 卖出设置
    elif weekly_trend == "DOWN" and daily_rsi > 60:
        if hourly_price < hourly_ma:
            return "SELL"

    return "HOLD"
```

### "汇合"系统

在关键价格水平寻找多个指标的一致：

```python
def confluence_system(df):
    """
    找到多个因素的汇合
    """
    price = df['Close'].iloc[-1]

    # 找到支撑/阻力
    support_levels = find_support_levels(df)
    resistance_levels = find_resistance_levels(df)

    # 检查指标
    ma_50 = df['MA_50'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]

    # 计算看涨汇合
    bullish_confluence = 0

    # 价格接近支撑
    for support in support_levels:
        if abs(price - support) / support < 0.02:
            bullish_confluence += 1

    # 价格接近 MA 支撑
    if abs(price - ma_50) / ma_50 < 0.01:
        bullish_confluence += 1

    # 价格接近 BB 下轨
    if abs(price - bb_lower) / bb_lower < 0.01:
        bullish_confluence += 1

    # 价格接近 VWAP
    if abs(price - vwap) / vwap < 0.01:
        bullish_confluence += 1

    # 强汇合（3+ 因素）
    if bullish_confluence >= 3:
        return "STRONG_BUY_ZONE"

    return "NEUTRAL"
```

## ⚠️ 要避免的常见错误

### 1. 使用相关指标

**问题**：RSI + 随机指标 + CCI 都衡量动量
**解决方案**：使用不同类别的指标

### 2. 忽略时间框架

**问题**：日线信号与周线趋势矛盾
**解决方案**：与更高时间框架对齐

### 3. 过度优化

**问题**：系统在历史数据上完美运行，实盘失败
**解决方案**：保持简单，在样本外数据上测试

### 4. 没有风险管理

**问题**：信号很好但没有止损
**解决方案**：在入场前始终定义风险

### 5. 等待完美设置

**问题**：所有 5 个指标必须对齐 = 错过交易
**解决方案**：定义最低要求（例如，4 个中的 3 个）

## 🎓 检查您的理解

1. 为什么要组合不同类别的指标？
2. 什么是"三屏"方法？
3. 应该使用多少个指标？
4. 什么是汇合交易？
5. 确认和相关性有什么区别？

## 💻 实践练习

构建您自己的交易系统：

```python
# 创建完整的交易系统
class MyTradingSystem:
    def __init__(self, trend_indicator, momentum_indicator, volume_indicator):
        self.trend = trend_indicator
        self.momentum = momentum_indicator
        self.volume = volume_indicator

    def analyze(self, ticker, period="1y"):
        df = yf.Ticker(ticker).history(period=period)

        # 计算您选择的指标
        # 定义入场/出场规则
        # 回测系统

        return results

# 示例
system = MyTradingSystem(
    trend_indicator="MA_50_200",
    momentum_indicator="RSI",
    volume_indicator="OBV"
)

results = system.analyze("AAPL")
```

## 📝 练习 3.5

创建：`exercises/module-03/exercise-3.5-combining.md`

1. 设计一个 3 指标交易系统
2. 定义清晰的入场和出场规则
3. 在 3 只不同股票上回测
4. 比较与单一指标的表现
5. 记录什么有效，什么无效

## 📚 资源

- [Investopedia: 技术指标](https://www.investopedia.com/terms/t/technicalindicator.asp)
- [Elder: Come Into My Trading Room](https://www.amazon.com/Come-Into-My-Trading-Room/dp/0471225347)
- [Pring: Technical Analysis Explained](https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177)

## ✅ 答案

1. **不同类别**：每个类别提供独特信息（趋势方向、动量速度、波动率范围、成交量确认）；组合减少假信号

2. **三屏**：多时间框架方法 - 周线看趋势，日线看时机，日内看入场；确保顺着更大趋势交易

3. **多少指标**：最多 3-5 个；每个类别一个；更多会造成混乱和信号冲突

4. **汇合交易**：多个技术因素（指标、支撑/阻力、MA）在同一价格水平对齐；增加成功交易的概率

5. **确认 vs 相关性**：确认是不同指标在方向上达成一致；相关性是指标衡量相同内容（冗余）；需要确认，避免相关性

---

**完成模块 3 了吗？** ✓ 继续[实践项目：实现指标](project-indicators.md)
