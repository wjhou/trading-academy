# 课程 3.2：趋势指标 - MACD（移动平均收敛散度）

**模块**：3 - 技术指标
**预计时间**：55 分钟
**难度**：中级

## 🎯 学习目标

在本课程结束时，您将：
- 理解什么是 MACD 及其工作原理
- 学习解读 MACD 线、信号线和柱状图
- 识别 MACD 交叉和背离
- 应用 MACD 识别趋势变化
- 将 MACD 与其他指标结合使用

## 📖 什么是 MACD？

**MACD（移动平均收敛散度）**是一个趋势跟踪动量指标，显示股票价格两条移动平均线之间的关系。

### 开发者

Gerald Appel 于 1970 年代后期开发

### 为什么 MACD 受欢迎

- **多功能**：显示趋势、动量和潜在反转
- **信号清晰**：交叉易于解读
- **广泛使用**：机构和散户交易者都在使用
- **适用所有时间框架**：从日内到月线

## 📊 MACD 组成部分

MACD 由三个元素组成：

### 1. MACD 线

**公式**：12 周期 EMA - 26 周期 EMA

```
MACD 线 = EMA(12) - EMA(26)
```

**解释**：
- 正 MACD：12 EMA 在 26 EMA 上方（看涨）
- 负 MACD：12 EMA 在 26 EMA 下方（看跌）
- 上升 MACD：上行动量增强
- 下降 MACD：下行动量增强

### 2. 信号线

**公式**：MACD 线的 9 周期 EMA

```
信号线 = EMA(MACD 线, 9)
```

**目的**：平滑 MACD 线，生成交易信号

### 3. MACD 柱状图

**公式**：MACD 线 - 信号线

```
柱状图 = MACD 线 - 信号线
```

**解释**：
- 正柱状图：MACD 在信号线上方（看涨）
- 负柱状图：MACD 在信号线下方（看跌）
- 柱状图增长：动量加速
- 柱状图收缩：动量减速

### 视觉表示

```
MACD 图表：
  2 ─────────────────────
  1 ───╱─╲───────────────  MACD 线
  0 ──╱───╲──╱─╲─────────  信号线
 -1 ─╱─────╲╱───╲────────  零线
 -2 ─────────────╲───────

柱状图：
  ║ ║║║ ║ ║║ ║
  ═══════════════════════  零线
      ║ ║║║ ║
```

## 🔍 解读 MACD

### MACD 位置

**零线上方**：
- 短期平均线在长期平均线上方
- 看涨动量
- 可能处于上升趋势

**零线下方**：
- 短期平均线在长期平均线下方
- 看跌动量
- 可能处于下降趋势

**穿越零线**：
- MACD 向上穿越零线：看涨信号
- MACD 向下穿越零线：看跌信号

### MACD 与信号线

**MACD 在信号线上方**：
- 看涨动量
- 柱状图为正
- 考虑买入

**MACD 在信号线下方**：
- 看跌动量
- 柱状图为负
- 考虑卖出

## 🎯 MACD 交易信号

### 1. MACD 交叉

#### 看涨交叉

**MACD 线向上穿越信号线**

```
信号线： ─────────────
MACD 线：  ────╱────────
                ↑
         看涨交叉
```

**解释**：买入信号，上行动量开始

**最佳时机**：
- 发生在零线下方（更强信号）
- 柱状图转为正值
- 价格在关键支撑上方

#### 看跌交叉

**MACD 线向下穿越信号线**

```
MACD 线：  ────╲────────
信号线： ─────────────
                ↓
         看跌交叉
```

**解释**：卖出信号，下行动量开始

**最佳时机**：
- 发生在零线上方（更强信号）
- 柱状图转为负值
- 价格在关键阻力下方

### 2. 零线交叉

#### 看涨零线交叉

**MACD 向上穿越零线**

```
零线：    ═════════════
MACD：     ───╱─────────
               ↑
        强看涨信号
```

**解释**：主要趋势转为上升趋势

#### 看跌零线交叉

**MACD 向下穿越零线**

```
MACD：     ───╲─────────
零线：    ═════════════
               ↓
        强看跌信号
```

**解释**：主要趋势转为下降趋势

### 3. 柱状图信号

#### 柱状图反转

**柱状图改变方向**

```
增长 → 收缩：
║║║║ ║║ ║  ← 动量减弱
═══════════

收缩 → 增长：
  ║ ║║ ║║║ ← 动量加速
═══════════
```

**解释**：潜在交叉的早期警告

#### 柱状图背离

**价格和柱状图向相反方向移动**

见下面的背离部分。

## 🔄 MACD 背离

### 看涨背离

**价格创新低，MACD 创更高低点**

```
价格：
╲    ╱
 ╲  ╱
  ╲╱ ← 更低的低点

MACD：
╲  ╱
 ╲╱ ← 更高的低点
```

**解释**：下降趋势失去动量，可能向上反转

### 看跌背离

**价格创新高，MACD 创更低高点**

```
价格：
  ╱╲
 ╱  ╲
╱    ╲ ← 更高的高点

MACD：
╱╲
  ╲ ← 更低的高点
```

**解释**：上升趋势失去动量，可能向下反转

### 隐藏背离

**隐藏看涨背离**：价格更高低点，MACD 更低低点
- 上升趋势中的延续信号

**隐藏看跌背离**：价格更低高点，MACD 更高高点
- 下降趋势中的延续信号

## 💻 实现 MACD

### 基本 MACD 计算

```python
import yfinance as yf
import pandas as pd
import numpy as np

def calculate_macd(df, fast=12, slow=26, signal=9):
    """
    计算 MACD 指标
    """
    # 计算 EMA
    ema_fast = df['Close'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['Close'].ewm(span=slow, adjust=False).mean()

    # MACD 线
    macd_line = ema_fast - ema_slow

    # 信号线
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()

    # 柱状图
    histogram = macd_line - signal_line

    return macd_line, signal_line, histogram

# 使用示例
df = yf.Ticker("AAPL").history(period="1y")
df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

print(df[['Close', 'MACD', 'Signal', 'Histogram']].tail())
```

### 使用 TA-Lib

```python
import talib

# 使用 TA-Lib 计算 MACD
macd, signal, histogram = talib.MACD(df['Close'],
                                      fastperiod=12,
                                      slowperiod=26,
                                      signalperiod=9)

df['MACD'] = macd
df['Signal'] = signal
df['Histogram'] = histogram
```

### 检测交叉

```python
def detect_macd_crossover(df):
    """
    检测 MACD 交叉
    """
    macd_curr = df['MACD'].iloc[-1]
    macd_prev = df['MACD'].iloc[-2]
    signal_curr = df['Signal'].iloc[-1]
    signal_prev = df['Signal'].iloc[-2]

    # 看涨交叉
    if macd_prev <= signal_prev and macd_curr > signal_curr:
        return "BULLISH_CROSSOVER"

    # 看跌交叉
    elif macd_prev >= signal_prev and macd_curr < signal_curr:
        return "BEARISH_CROSSOVER"

    # 零线交叉
    if macd_prev <= 0 and macd_curr > 0:
        return "BULLISH_ZERO_CROSS"
    elif macd_prev >= 0 and macd_curr < 0:
        return "BEARISH_ZERO_CROSS"

    return "NO_CROSSOVER"

# 示例
crossover = detect_macd_crossover(df)
print(f"MACD 信号：{crossover}")
```

### 检测背离

```python
def detect_macd_divergence(df, lookback=20):
    """
    检测 MACD 背离
    """
    # 找到近期高点和低点
    price_high_idx = df['High'].iloc[-lookback:].idxmax()
    price_low_idx = df['Low'].iloc[-lookback:].idxmin()

    macd_high_idx = df['MACD'].iloc[-lookback:].idxmax()
    macd_low_idx = df['MACD'].iloc[-lookback:].idxmin()

    # 获取之前的高点/低点
    prev_price_high_idx = df['High'].iloc[-lookback*2:-lookback].idxmax()
    prev_price_low_idx = df['Low'].iloc[-lookback*2:-lookback].idxmin()

    prev_macd_high_idx = df['MACD'].iloc[-lookback*2:-lookback].idxmax()
    prev_macd_low_idx = df['MACD'].iloc[-lookback*2:-lookback].idxmin()

    # 看涨背离
    if (df.loc[price_low_idx, 'Low'] < df.loc[prev_price_low_idx, 'Low'] and
        df.loc[macd_low_idx, 'MACD'] > df.loc[prev_macd_low_idx, 'MACD']):
        return "BULLISH_DIVERGENCE"

    # 看跌背离
    if (df.loc[price_high_idx, 'High'] > df.loc[prev_price_high_idx, 'High'] and
        df.loc[macd_high_idx, 'MACD'] < df.loc[prev_macd_high_idx, 'MACD']):
        return "BEARISH_DIVERGENCE"

    return "NO_DIVERGENCE"
```

## 🎯 MACD 交易策略

### 策略 1：基本交叉

```python
def macd_crossover_strategy(df):
    """
    交易 MACD 交叉
    """
    crossover = detect_macd_crossover(df)

    if crossover == "BULLISH_CROSSOVER":
        return "BUY"
    elif crossover == "BEARISH_CROSSOVER":
        return "SELL"

    return "HOLD"
```

### 策略 2：零线策略

```python
def macd_zero_line_strategy(df):
    """
    交易零线交叉并确认
    """
    macd = df['MACD'].iloc[-1]
    prev_macd = df['MACD'].iloc[-2]
    histogram = df['Histogram'].iloc[-1]

    # 看涨：MACD 向上穿越零线且柱状图为正
    if prev_macd <= 0 and macd > 0 and histogram > 0:
        return "BUY"

    # 看跌：MACD 向下穿越零线且柱状图为负
    elif prev_macd >= 0 and macd < 0 and histogram < 0:
        return "SELL"

    return "HOLD"
```

### 策略 3：柱状图反转

```python
def macd_histogram_strategy(df):
    """
    交易柱状图反转
    """
    hist_curr = df['Histogram'].iloc[-1]
    hist_prev = df['Histogram'].iloc[-2]
    hist_prev2 = df['Histogram'].iloc[-3]

    # 看涨：柱状图触底（之前下降，现在上升）
    if hist_prev2 > hist_prev and hist_curr > hist_prev and hist_curr < 0:
        return "BUY"

    # 看跌：柱状图见顶（之前上升，现在下降）
    elif hist_prev2 < hist_prev and hist_curr < hist_prev and hist_curr > 0:
        return "SELL"

    return "HOLD"
```

### 策略 4：MACD 配合趋势过滤

```python
def macd_trend_strategy(df):
    """
    只在趋势方向交易 MACD
    """
    # 计算趋势
    sma_50 = df['Close'].rolling(50).mean().iloc[-1]
    price = df['Close'].iloc[-1]

    crossover = detect_macd_crossover(df)

    # 只在上升趋势中买入
    if price > sma_50 and crossover == "BULLISH_CROSSOVER":
        return "BUY"

    # 只在下降趋势中卖出
    elif price < sma_50 and crossover == "BEARISH_CROSSOVER":
        return "SELL"

    return "HOLD"
```

### 策略 5：MACD 背离

```python
def macd_divergence_strategy(df):
    """
    交易 MACD 背离
    """
    divergence = detect_macd_divergence(df)
    macd = df['MACD'].iloc[-1]

    if divergence == "BULLISH_DIVERGENCE":
        # 等待 MACD 向上转
        if df['MACD'].iloc[-1] > df['MACD'].iloc[-2]:
            return "BUY"

    elif divergence == "BEARISH_DIVERGENCE":
        # 等待 MACD 向下转
        if df['MACD'].iloc[-1] < df['MACD'].iloc[-2]:
            return "SELL"

    return "HOLD"
```

## ⚙️ MACD 设置

### 标准设置 (12, 26, 9)

- **快速 EMA**：12 周期
- **慢速 EMA**：26 周期
- **信号线**：9 周期

**最适合**：日线图，波段交易

### 更快设置 (5, 35, 5)

- 更敏感
- 更多信号（更多假信号）
- 更适合日内交易

### 更慢设置 (19, 39, 9)

- 不太敏感
- 信号更少但更可靠
- 更适合持仓交易

### 自定义设置

```python
def optimize_macd_settings(df, fast_range, slow_range, signal_range):
    """
    测试不同的 MACD 设置
    """
    best_return = -float('inf')
    best_settings = None

    for fast in fast_range:
        for slow in slow_range:
            if fast >= slow:
                continue
            for signal in signal_range:
                # 使用这些设置计算 MACD
                macd, sig, hist = calculate_macd(df, fast, slow, signal)

                # 回测策略
                returns = backtest_macd_strategy(df, macd, sig, hist)

                if returns > best_return:
                    best_return = returns
                    best_settings = (fast, slow, signal)

    return best_settings, best_return
```

## 📊 MACD 与其他指标

### MACD + RSI

```python
def macd_rsi_strategy(df):
    """
    结合 MACD 和 RSI
    """
    # 计算指标
    df['RSI'] = calculate_rsi(df)
    crossover = detect_macd_crossover(df)

    rsi = df['RSI'].iloc[-1]

    # 买入：MACD 看涨交叉 + RSI 未超买
    if crossover == "BULLISH_CROSSOVER" and rsi < 70:
        return "BUY"

    # 卖出：MACD 看跌交叉 + RSI 未超卖
    elif crossover == "BEARISH_CROSSOVER" and rsi > 30:
        return "SELL"

    return "HOLD"
```

### MACD + 移动平均线

```python
def macd_ma_strategy(df):
    """
    MACD 配合 MA 趋势过滤
    """
    df['MA_50'] = df['Close'].rolling(50).mean()
    df['MA_200'] = df['Close'].rolling(200).mean()

    crossover = detect_macd_crossover(df)
    price = df['Close'].iloc[-1]
    ma_50 = df['MA_50'].iloc[-1]
    ma_200 = df['MA_200'].iloc[-1]

    # 强劲上升趋势：价格 > MA50 > MA200
    if price > ma_50 > ma_200:
        if crossover == "BULLISH_CROSSOVER":
            return "BUY"

    # 强劲下降趋势：价格 < MA50 < MA200
    elif price < ma_50 < ma_200:
        if crossover == "BEARISH_CROSSOVER":
            return "SELL"

    return "HOLD"
```

## ⚠️ MACD 局限性

### 1. 滞后指标

MACD 基于移动平均线，因此滞后于价格。

**解决方案**：使用柱状图获取更早信号

### 2. 横盘市场中的震荡

价格区间震荡时产生假信号。

**解决方案**：避免在震荡市场交易 MACD

### 3. 入场较晚

交叉可能在价格大幅波动后才出现。

**解决方案**：使用柱状图背离提前入场

### 4. 没有价格水平

MACD 不显示支撑/阻力。

**解决方案**：与价格行为分析结合

## 🎓 检查您的理解

1. MACD 的三个组成部分是什么？
2. 看涨 MACD 交叉表示什么？
3. 什么是 MACD 背离？
4. 零线交叉何时最重要？
5. 您如何将 MACD 与趋势分析结合？

## 💻 实践练习

```python
import yfinance as yf
import matplotlib.pyplot as plt

# 获取数据
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="1y")

# 计算 MACD
df['MACD'], df['Signal'], df['Histogram'] = calculate_macd(df)

# 绘图
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10),
                                gridspec_kw={'height_ratios': [2, 1]},
                                sharex=True)

# 价格
ax1.plot(df.index, df['Close'], label='价格')
ax1.set_title(f"{ticker} - 价格和 MACD")
ax1.legend()
ax1.grid(True)

# MACD
ax2.plot(df.index, df['MACD'], label='MACD', linewidth=2)
ax2.plot(df.index, df['Signal'], label='信号线', linewidth=2)
ax2.bar(df.index, df['Histogram'], label='柱状图', alpha=0.3)
ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
ax2.set_title("MACD")
ax2.legend()
ax2.grid(True)

plt.tight_layout()
plt.show()

# 您的任务：识别交叉和背离
```

## 📝 练习 3.2：MACD 分析

创建：`exercises/module-03/exercise-3.2-macd.md`

1. 用 MACD 分析 3 只股票
2. 识别近期交叉及其结果
3. 找出任何背离
4. 比较标准 (12,26,9) 与更快 (5,35,5) 设置
5. 回测 MACD 策略

## 🚀 下一步

下一课：**布林带** - 波动率指标

**预习**：
- 什么是布林带？
- 如何交易带状收缩和扩张
- 布林带策略

## 📚 其他资源

- [Investopedia: MACD](https://www.investopedia.com/terms/m/macd.asp)
- [StockCharts: MACD](https://school.stockcharts.com/doku.php?id=technical_indicators:moving_average_convergence_divergence_macd)
- [TradingView: MACD](https://www.tradingview.com/support/solutions/43000502344-macd-moving-average-convergence-divergence/)

## ✅ 答案

1. **三个组成部分**：MACD 线（12 EMA - 26 EMA）、信号线（MACD 的 9 EMA）、柱状图（MACD - 信号线）

2. **看涨交叉**：MACD 线向上穿越信号线；表示上行动量开始，潜在买入信号

3. **MACD 背离**：价格和 MACD 向相反方向移动；价格创新高/低但 MACD 未确认，表明趋势减弱

4. **零线交叉重要性**：当被强柱状图确认且在相反方向的延长走势后发生时最重要；表示主要趋势变化

5. **MACD 配合趋势**：仅在更高时间框架趋势方向使用 MACD 交叉；用移动平均线过滤信号；避免逆趋势 MACD 信号

---

**完成本课程了吗？** ✓ 标记为完成并继续学习[课程 3.3：波动率指标（布林带）](lesson-03-volatility.md)
