# 课程 2.4：移动平均线 - 平滑价格走势

**模块**：2 - 技术分析基础
**预计时间**：50分钟
**难度**：初级

## 🎯 学习目标

完成本课程后，你将能够：
- 理解什么是移动平均线以及它们如何工作
- 学习SMA和EMA之间的区别
- 知道在不同时间框架使用哪些移动平均线
- 应用MA交叉进行交易信号
- 使用MA作为动态支撑和阻力

## 📖 什么是移动平均线？

**移动平均线（MA）**是股票在特定周期数内的平均价格，随着新数据的到来重新计算。

### 目的

- **平滑噪音**：过滤短期价格波动
- **识别趋势**：显示总体方向
- **支撑/阻力**：充当动态价格水平
- **生成信号**：交叉表明潜在交易

### 示例

```
10日MA收盘价：
第1-10天平均：$150
第2-11天平均：$151（去掉第1天，加上第11天）
第3-12天平均：$152（去掉第2天，加上第12天）
...以此类推
```

## 📊 移动平均线类型

### 1. 简单移动平均线（SMA）

**公式**：价格总和 / 周期数

```
SMA = (P1 + P2 + P3 + ... + Pn) / n
```

**示例**（5日SMA）：
```
第1天：$100
第2天：$102
第3天：$101
第4天：$103
第5天：$104

SMA = (100 + 102 + 101 + 103 + 104) / 5 = $102
```

**特征**：
- 所有周期权重相等
- 对价格变化反应较慢
- 线条更平滑
- 更适合长期趋势

### 2. 指数移动平均线（EMA）

**公式**：加权平均，给予近期价格更多权重

```
EMA = (Price_today × K) + (EMA_yesterday × (1 - K))
其中 K = 2 / (n + 1)
```

**特征**：
- 近期价格权重更大
- 对价格变化反应更快
- 对趋势更敏感
- 更适合短期交易

### SMA vs EMA 比较

```
价格飙升：

SMA: ────────╱─────  （反应较慢）
EMA: ───────╱──────  （反应较快）
价格: ────╱────────
```

**何时使用**：
- **SMA**：长期趋势、噪音少、机构水平
- **EMA**：短期交易、快速反应、日内交易

## 🔢 常见移动平均线周期

### 短期（快速）

- **10日MA**：非常敏感，日内交易
- **20日MA**：波段交易，短期趋势
- **21日MA**：约等于一个交易月

### 中期

- **50日MA**：流行的中期趋势指标
- **100日MA**：中期趋势

### 长期（慢速）

- **200日MA**：最重要的长期指标
- **机构水平**：银行和基金关注这个

### 多MA策略

同时使用2-3个MA：
- **快速**：10或20日
- **中速**：50日
- **慢速**：200日

## 📈 使用移动平均线

### 1. 趋势识别

**价格在MA上方 = 上升趋势**
```
价格: ─────────────╱─────
MA:    ────────────╱──────
```

**价格在MA下方 = 下降趋势**
```
MA:    ────────────╲──────
价格: ─────────────╲─────
```

**价格穿越MA = 潜在趋势变化**

### 2. 动态支撑和阻力

MA在上升趋势中充当支撑：
```
价格从MA反弹：
    ╱╲    ╱╲
   ╱  ╲  ╱  ╲
  ╱    ╲╱    ╲
 ╱            ╲
╱──────────────╲─── MA（支撑）
```

MA在下降趋势中充当阻力：
```
MA（阻力）────────────
╲            ╱
 ╲    ╱╲    ╱
  ╲  ╱  ╲  ╱
   ╲╱    ╲╱
```

**交易策略**：
- **上升趋势**：当价格回调到MA时买入
- **下降趋势**：当价格反弹到MA时卖出

### 3. 移动平均线交叉

#### 黄金交叉（看涨）

**50日MA向上穿越200日MA**

```
50日MA: ────────╱───────
200日MA: ──────────────
                  ↑
            黄金交叉
```

**信号**：强烈看涨信号，主要上升趋势开始

#### 死亡交叉（看跌）

**50日MA向下穿越200日MA**

```
200日MA: ──────────────
50日MA: ────────╲───────
                  ↓
            死亡交叉
```

**信号**：强烈看跌信号，主要下降趋势开始

#### 快速/慢速MA交叉

**示例**：10日和50日MA

```
买入信号：
10日向上穿越50日

卖出信号：
10日向下穿越50日
```

### 4. MA带

**多个MA**（例如10、20、30、40、50日）创建一个"带"

```
强上升趋势：
10日 ────────────────
20日 ───────────────
30日 ──────────────
40日 ─────────────
50日 ────────────
（全部分离，按顺序）

弱/横盘：
所有MA ≈≈≈≈≈≈≈≈≈≈≈≈≈
（纠缠在一起）
```

**解释**：
- **分离且有序**：强趋势
- **纠缠**：弱趋势或横盘
- **扩张**：趋势加强
- **收缩**：趋势减弱

## 💻 实现移动平均线

### 基本计算

```python
import yfinance as yf
import pandas as pd

# 获取数据
df = yf.Ticker("AAPL").history(period="1y")

# 计算MA
df['SMA_20'] = df['Close'].rolling(window=20).mean()
df['SMA_50'] = df['Close'].rolling(window=50).mean()
df['SMA_200'] = df['Close'].rolling(window=200).mean()

# 计算EMA
df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()

print(df[['Close', 'SMA_20', 'SMA_50', 'EMA_20']].tail())
```

### 检测交叉

```python
def detect_crossover(df, fast_col, slow_col):
    """
    检测MA交叉
    返回：'golden'表示看涨，'death'表示看跌，否则返回None
    """
    # 当前和之前的值
    fast_curr = df[fast_col].iloc[-1]
    fast_prev = df[fast_col].iloc[-2]
    slow_curr = df[slow_col].iloc[-1]
    slow_prev = df[slow_col].iloc[-2]

    # 黄金交叉：快速向上穿越慢速
    if fast_prev <= slow_prev and fast_curr > slow_curr:
        return 'golden'

    # 死亡交叉：快速向下穿越慢速
    elif fast_prev >= slow_prev and fast_curr < slow_curr:
        return 'death'

    return None

# 使用示例
crossover = detect_crossover(df, 'SMA_50', 'SMA_200')
if crossover == 'golden':
    print("检测到黄金交叉！看涨信号")
elif crossover == 'death':
    print("检测到死亡交叉！看跌信号")
```

### 基于MA的交易策略

```python
class MovingAverageStrategy:
    def __init__(self, fast_period=20, slow_period=50):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signal(self, df):
        # 计算MA
        df['MA_fast'] = df['Close'].rolling(self.fast_period).mean()
        df['MA_slow'] = df['Close'].rolling(self.slow_period).mean()

        current_price = df['Close'].iloc[-1]
        ma_fast = df['MA_fast'].iloc[-1]
        ma_slow = df['MA_slow'].iloc[-1]

        # 趋势判断
        if ma_fast > ma_slow:
            trend = "UPTREND"
        else:
            trend = "DOWNTREND"

        # 信号生成
        if trend == "UPTREND":
            # 买入回调到快速MA
            if current_price <= ma_fast * 1.01:  # MA的1%以内
                return "BUY"

        elif trend == "DOWNTREND":
            # 卖出反弹到快速MA
            if current_price >= ma_fast * 0.99:  # MA的1%以内
                return "SELL"

        return "HOLD"

    def backtest(self, df):
        signals = []
        for i in range(self.slow_period, len(df)):
            signal = self.generate_signal(df.iloc[:i+1])
            signals.append(signal)
        return signals
```

## 🎯 MA交易策略

### 策略1：MA反弹

**设置**：在上升趋势中价格从MA反弹时买入

```python
def ma_bounce_strategy(df, ma_period=50):
    df['MA'] = df['Close'].rolling(ma_period).mean()

    # 检查是否处于上升趋势
    if df['Close'].iloc[-1] > df['MA'].iloc[-1]:
        # 检查价格是否触及MA
        if df['Low'].iloc[-1] <= df['MA'].iloc[-1] * 1.005:
            # 检查是否反弹（收盘在MA上方）
            if df['Close'].iloc[-1] > df['MA'].iloc[-1]:
                return "BUY"

    return "HOLD"
```

### 策略2：MA交叉

**设置**：当快速MA向上穿越慢速MA时买入

```python
def ma_crossover_strategy(df, fast=20, slow=50):
    df['MA_fast'] = df['Close'].rolling(fast).mean()
    df['MA_slow'] = df['Close'].rolling(slow).mean()

    # 黄金交叉
    if df['MA_fast'].iloc[-2] <= df['MA_slow'].iloc[-2] and \
       df['MA_fast'].iloc[-1] > df['MA_slow'].iloc[-1]:
        return "BUY"

    # 死亡交叉
    elif df['MA_fast'].iloc[-2] >= df['MA_slow'].iloc[-2] and \
         df['MA_fast'].iloc[-1] < df['MA_slow'].iloc[-1]:
        return "SELL"

    return "HOLD"
```

### 策略3：三重MA

**设置**：使用3个MA进行趋势确认

```python
def triple_ma_strategy(df):
    df['MA_10'] = df['Close'].rolling(10).mean()
    df['MA_50'] = df['Close'].rolling(50).mean()
    df['MA_200'] = df['Close'].rolling(200).mean()

    ma10 = df['MA_10'].iloc[-1]
    ma50 = df['MA_50'].iloc[-1]
    ma200 = df['MA_200'].iloc[-1]
    price = df['Close'].iloc[-1]

    # 强上升趋势：全部对齐
    if price > ma10 > ma50 > ma200:
        return "STRONG_BUY"

    # 上升趋势：价格在所有MA上方
    elif price > ma10 and price > ma50 and price > ma200:
        return "BUY"

    # 强下降趋势：全部对齐
    elif price < ma10 < ma50 < ma200:
        return "STRONG_SELL"

    # 下降趋势：价格在所有MA下方
    elif price < ma10 and price < ma50 and price < ma200:
        return "SELL"

    return "HOLD"
```

## ⚠️ 局限性和陷阱

### 1. 滞后指标

MA基于过去的价格，因此会滞后：
- **问题**：入场和出场较晚
- **解决方案**：与领先指标（RSI、MACD）一起使用

### 2. 横盘市场中的假信号

当价格在区间内时，MA会产生虚假信号：
```
区间内的虚假信号：
阻力 ─────────────
    ╱╲  ╱╲  ╱╲  ╱╲
   ╱  ╲╱  ╲╱  ╲╱  ╲
  ╱              ╲
支撑 ─────────────
```

**解决方案**：在横盘市场避免使用MA策略

### 3. 选择正确的周期

- 太短：信号太多，假信号
- 太长：太慢，错过机会

**解决方案**：为你的时间框架测试不同周期

### 4. 不是独立系统

MA最好与以下结合使用：
- 成交量分析
- 支撑/阻力
- K线形态
- 其他指标

## 🎓 检查你的理解

1. SMA和EMA有什么区别？
2. 什么是黄金交叉？
3. MA如何充当支撑和阻力？
4. MA交叉策略的局限性是什么？
5. 哪个MA对长期趋势最重要？

## 💻 实践练习

实现和测试MA策略：

```python
import yfinance as yf
import matplotlib.pyplot as plt

# 获取数据
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="2y")

# 计算MA
df['SMA_50'] = df['Close'].rolling(50).mean()
df['SMA_200'] = df['Close'].rolling(200).mean()

# 绘图
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Close'], label='价格', linewidth=2)
plt.plot(df.index, df['SMA_50'], label='50日SMA', linewidth=1.5)
plt.plot(df.index, df['SMA_200'], label='200日SMA', linewidth=1.5)

# 标记交叉
# 你的任务：为黄金交叉和死亡交叉添加标记

plt.title(f"{ticker} - 移动平均线")
plt.legend()
plt.grid(True)
plt.show()
```

## 📝 练习2.4：MA分析

创建：`exercises/module-02/exercise-2.4-moving-averages.md`

1. 从不同行业选择3只股票
2. 计算20、50和200日SMA
3. 根据MA对齐识别当前趋势
4. 查找任何最近的交叉
5. 根据MA反弹建议入场点

## 🚀 下一步

在下一课中，我们将学习**成交量分析** - 理解价格运动背后的力量。

**预习问题**：
- 为什么成交量重要？
- 突破时的高成交量意味着什么？
- 如何发现成交量背离？

## 📚 额外资源

- [Investopedia: Moving Averages](https://www.investopedia.com/terms/m/movingaverage.asp)
- [StockCharts: Moving Averages](https://school.stockcharts.com/doku.php?id=technical_indicators:moving_averages)
- [TradingView: MA Strategies](https://www.tradingview.com/support/solutions/43000502017-moving-average-ma/)

## ✅ 答案

1. **SMA vs EMA**：SMA给所有周期相等权重，反应较慢；EMA给近期价格更多权重，对变化反应更快

2. **黄金交叉**：当50日MA向上穿越200日MA；强烈看涨信号，表明潜在的主要上升趋势

3. **MA作为支撑/阻力**：在上升趋势中，价格倾向于从MA反弹（支撑）；在下降趋势中，价格在MA处被拒绝（阻力）；交易者关注这些水平创造自我实现的预言

4. **MA交叉局限性**：滞后指标（信号延迟），在横盘市场产生虚假信号（假信号），仅在趋势市场中效果最好

5. **最重要的长期MA**：200日MA；被机构广泛关注，定义牛市/熊市，充当主要支撑/阻力

---

**完成本课程了吗？** ✓ 标记为完成并继续[课程2.5：成交量分析](lesson-05-volume-analysis.md)

