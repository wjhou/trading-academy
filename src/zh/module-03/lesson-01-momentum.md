# 第 3.1 课：动量指标 - RSI（相对强弱指数）

**模块**：3 - 技术指标
**预计时间**：55 分钟
**难度**：中级

## 🎯 学习目标

在本课结束时，你将能够：
- 理解动量指标衡量的内容
- 学习 RSI 的计算和解读方法
- 识别超买和超卖状态
- 识别 RSI 背离
- 将 RSI 应用于交易策略

## 📖 什么是动量？

**动量**衡量价格变动的速率。它回答的问题是："价格移动的速度有多快？"

### 为什么动量很重要

- **领先指标**：可以在价格之前发出反转信号
- **强度衡量**：显示走势背后的信念
- **超买/超卖**：识别极端情况
- **背离检测**：发现趋势减弱

## 📊 RSI：相对强弱指数

**RSI** 是一个动量振荡器，在 0-100 的范围内衡量价格变化的速度和幅度。

### 开发者

J. Welles Wilder Jr. 于 1978 年开发（还创建了 ATR、ADX、抛物线 SAR）

### RSI 公式

```
RSI = 100 - (100 / (1 + RS))

其中：
RS = 平均涨幅 / 平均跌幅（在周期内，通常为 14 天）

平均涨幅 = 周期内涨幅总和 / 周期
平均跌幅 = 周期内跌幅总和 / 周期
```

### 计算示例

```
14 天周期：
上涨日：+2, +1, +3, +2, +1, +2, +1 = 总计 12
下跌日：-1, -2, -1, -2, -1, -1, -1 = 总计 9

平均涨幅 = 12 / 14 = 0.857
平均跌幅 = 9 / 14 = 0.643

RS = 0.857 / 0.643 = 1.333
RSI = 100 - (100 / (1 + 1.333)) = 57.14
```

## 📈 解读 RSI

### RSI 刻度

```
100 ─────────────── 极度超买
 80 ─────────────── 超买区域
 70 ─────────────── 超买阈值
 50 ─────────────── 中性
 30 ─────────────── 超卖阈值
 20 ─────────────── 超卖区域
  0 ─────────────── 极度超卖
```

### 解读

**RSI > 70**：超买
- 价格可能上涨过快
- 可能出现回调或反转
- **不能单独作为卖出信号！**强劲趋势可以保持超买状态

**RSI < 30**：超卖
- 价格可能下跌过快
- 可能出现反弹或反转
- **不能单独作为买入信号！**疲弱趋势可以保持超卖状态

**RSI = 50**：中性
- 买卖双方平衡
- 没有明确的动量方向

### 趋势中的 RSI

**上升趋势**：
- RSI 通常保持在 40-90 之间
- 很少跌破 30
- 回调至 40-50 是买入机会

**下降趋势**：
- RSI 通常保持在 10-60 之间
- 很少升破 70
- 反弹至 50-60 是卖出机会

```
强劲上升趋势的 RSI：
100 ─────────────
 70 ───╱─╲─╱─╲───
 50 ──╱───╲╱───╲─
 30 ─────────────
  0 ─────────────
（主要保持在 50 以上）

强劲下降趋势的 RSI：
100 ─────────────
 70 ─────────────
 50 ─╲───╱╲───╱─
 30 ───╲─╱──╲─╱──
  0 ─────────────
（主要保持在 50 以下）
```

## 🔄 RSI 背离

**背离**发生在价格和 RSI 向相反方向移动时 - 这是一个强大的反转信号。

### 看涨背离

**价格创新低，RSI 创更高的低点**

```
价格：
╲    ╱
 ╲  ╱
  ╲╱ ← 更低的低点

RSI：
╲  ╱
 ╲╱ ← 更高的低点
```

**解读**：卖压减弱，可能向上反转

### 看跌背离

**价格创新高，RSI 创更低的高点**

```
价格：
  ╱╲
 ╱  ╲
╱    ╲ ← 更高的高点

RSI：
╱╲
  ╲ ← 更低的高点
```

**解读**：买压减弱，可能向下反转

### 隐藏背离

**隐藏看涨背离**：价格创更高的低点，RSI 创更低的低点
- 上升趋势中的延续信号

**隐藏看跌背离**：价格创更低的高点，RSI 创更高的高点
- 下降趋势中的延续信号

## 💻 实现 RSI

### 基本 RSI 计算

```python
import yfinance as yf
import pandas as pd
import numpy as np

def calculate_rsi(df, period=14):
    """
    计算 RSI 指标
    """
    # 计算价格变化
    delta = df['Close'].diff()

    # 分离涨幅和跌幅
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    # 计算平均涨幅和跌幅
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    # 计算 RS 和 RSI
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return rsi

# 使用示例
df = yf.Ticker("AAPL").history(period="6mo")
df['RSI'] = calculate_rsi(df)

print(df[['Close', 'RSI']].tail())
```

### 使用 TA-Lib（更准确）

```python
import talib

# 使用 TA-Lib 计算 RSI
df['RSI'] = talib.RSI(df['Close'], timeperiod=14)
```

### 检测超买/超卖

```python
def detect_rsi_signals(df, overbought=70, oversold=30):
    """
    检测 RSI 超买/超卖状态
    """
    current_rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    signals = []

    # 超买
    if current_rsi > overbought:
        signals.append("OVERBOUGHT")
        if prev_rsi <= overbought:
            signals.append("ENTERING_OVERBOUGHT")

    # 超卖
    if current_rsi < oversold:
        signals.append("OVERSOLD")
        if prev_rsi >= oversold:
            signals.append("ENTERING_OVERSOLD")

    # 穿越 50
    if prev_rsi < 50 and current_rsi >= 50:
        signals.append("BULLISH_MOMENTUM")
    elif prev_rsi > 50 and current_rsi <= 50:
        signals.append("BEARISH_MOMENTUM")

    return signals if signals else ["NEUTRAL"]

# 示例
signals = detect_rsi_signals(df)
print(f"RSI 信号：{', '.join(signals)}")
```

### 检测背离

```python
def detect_rsi_divergence(df, lookback=14):
    """
    检测 RSI 背离
    """
    # 找到近期价格高点和低点
    price_highs = df['High'].rolling(lookback).max()
    price_lows = df['Low'].rolling(lookback).min()

    # 找到近期 RSI 高点和低点
    rsi_highs = df['RSI'].rolling(lookback).max()
    rsi_lows = df['RSI'].rolling(lookback).min()

    # 当前值
    curr_price_high = df['High'].iloc[-1]
    curr_price_low = df['Low'].iloc[-1]
    curr_rsi_high = df['RSI'].iloc[-1]
    curr_rsi_low = df['RSI'].iloc[-1]

    # 之前的值
    prev_price_high = price_highs.iloc[-lookback]
    prev_price_low = price_lows.iloc[-lookback]
    prev_rsi_high = rsi_highs.iloc[-lookback]
    prev_rsi_low = rsi_lows.iloc[-lookback]

    # 看涨背离：价格更低的低点，RSI 更高的低点
    if curr_price_low < prev_price_low and curr_rsi_low > prev_rsi_low:
        return "BULLISH_DIVERGENCE"

    # 看跌背离：价格更高的高点，RSI 更低的高点
    if curr_price_high > prev_price_high and curr_rsi_high < prev_rsi_high:
        return "BEARISH_DIVERGENCE"

    return "NO_DIVERGENCE"
```

## 🎯 RSI 交易策略

### 策略 1：超买/超卖

**简单方法**：超卖时买入，超买时卖出

```python
def rsi_overbought_oversold_strategy(df):
    rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    # 当 RSI 从下方穿越 30 时买入
    if prev_rsi < 30 and rsi >= 30:
        return "BUY"

    # 当 RSI 从上方穿越 70 时卖出
    if prev_rsi > 70 and rsi <= 70:
        return "SELL"

    return "HOLD"
```

**注意**：这在强劲趋势中可能失效！

### 策略 2：RSI 配合趋势

**更好的方法**：只顺势交易

```python
def rsi_trend_strategy(df):
    rsi = df['RSI'].iloc[-1]
    sma_50 = df['Close'].rolling(50).mean().iloc[-1]
    price = df['Close'].iloc[-1]

    # 确定趋势
    if price > sma_50:
        # 上升趋势：RSI 回调至 40-50 时买入
        if 40 <= rsi <= 50:
            return "BUY"
    else:
        # 下降趋势：RSI 反弹至 50-60 时卖出
        if 50 <= rsi <= 60:
            return "SELL"

    return "HOLD"
```

### 策略 3：RSI 背离

**高级方法**：交易背离

```python
def rsi_divergence_strategy(df):
    divergence = detect_rsi_divergence(df)
    rsi = df['RSI'].iloc[-1]

    if divergence == "BULLISH_DIVERGENCE":
        if rsi < 40:  # 确认超卖
            return "BUY"

    elif divergence == "BEARISH_DIVERGENCE":
        if rsi > 60:  # 确认超买
            return "SELL"

    return "HOLD"
```

### 策略 4：RSI 突破

**动量方法**：交易 RSI 水平突破

```python
def rsi_breakout_strategy(df):
    rsi = df['RSI'].iloc[-1]
    prev_rsi = df['RSI'].iloc[-2]

    # 看涨：RSI 突破 50
    if prev_rsi <= 50 and rsi > 50:
        if rsi < 70:  # 尚未超买
            return "BUY"

    # 看跌：RSI 跌破 50
    if prev_rsi >= 50 and rsi < 50:
        if rsi > 30:  # 尚未超卖
            return "SELL"

    return "HOLD"
```

## ⚙️ RSI 设置

### 周期选择

**14 天（默认）**：
- 平衡的灵敏度
- 适用于大多数时间框架
- Wilder 的原始设置

**9 天（更快）**：
- 更灵敏
- 更多信号（也有更多假信号）
- 更适合日内交易

**21 天（更慢）**：
- 不太灵敏
- 信号更少但更可靠
- 更适合波段交易

### 阈值调整

**标准**：70/30
**趋势市场**：80/20（避免假信号）
**区间震荡**：60/40（捕捉更多反转）

```python
# 自适应阈值
def get_rsi_thresholds(df):
    # 检查是否处于趋势
    sma_20 = df['Close'].rolling(20).mean()
    sma_50 = df['Close'].rolling(50).mean()

    if sma_20.iloc[-1] > sma_50.iloc[-1] * 1.05:
        # 强劲上升趋势
        return 80, 40
    elif sma_20.iloc[-1] < sma_50.iloc[-1] * 0.95:
        # 强劲下降趋势
        return 60, 20
    else:
        # 横盘
        return 70, 30
```

## ⚠️ RSI 的局限性

### 1. 趋势中的假信号

RSI 在强劲趋势中可能长时间保持超买/超卖状态。

**解决方案**：与趋势指标（MA、趋势线）一起使用

### 2. 震荡

在震荡市场中频繁穿越 70/30。

**解决方案**：等待确认，使用更宽的阈值

### 3. 滞后

RSI 基于过去的价格，可能较慢。

**解决方案**：使用更短的周期或结合价格行为

### 4. 不能单独使用

仅凭 RSI 不足以做出交易决策。

**解决方案**：结合支撑/阻力、成交量、形态

## 🎓 检查你的理解

1. RSI 衡量什么？
2. 什么被认为是超买和超卖？
3. 什么是看涨背离？
4. 为什么 RSI 在上升趋势中可以保持超买状态？
5. 在下降趋势中如何交易 RSI？

## 💻 实践练习

实现 RSI 分析：

```python
import yfinance as yf
import matplotlib.pyplot as plt

# 获取数据
ticker = "TSLA"
df = yf.Ticker(ticker).history(period="1y")

# 计算 RSI
df['RSI'] = calculate_rsi(df, period=14)

# 绘图
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

# 价格
ax1.plot(df.index, df['Close'])
ax1.set_title(f"{ticker} - 价格")
ax1.grid(True)

# RSI
ax2.plot(df.index, df['RSI'], label='RSI(14)')
ax2.axhline(y=70, color='r', linestyle='--', label='超买')
ax2.axhline(y=30, color='g', linestyle='--', label='超卖')
ax2.axhline(y=50, color='gray', linestyle='-', alpha=0.3)
ax2.fill_between(df.index, 70, 100, alpha=0.1, color='red')
ax2.fill_between(df.index, 0, 30, alpha=0.1, color='green')
ax2.set_title("RSI")
ax2.set_ylim(0, 100)
ax2.legend()
ax2.grid(True)

plt.show()

# 你的任务：识别背离和超买/超卖时期
```

## 📝 练习 3.1：RSI 分析

创建：`exercises/module-03/exercise-3.1-rsi.md`

1. 用 RSI 分析 3 只股票
2. 识别当前 RSI 水平和解读
3. 找出过去 3 个月的任何背离
4. 回测一个简单的 RSI 策略
5. 比较 RSI(9)、RSI(14) 和 RSI(21)

## 🚀 下一步

在下一课中，我们将学习 **MACD** - 一个趋势跟踪动量指标。

**预习问题**：
- MACD 代表什么？
- 它与 RSI 有何不同？
- 什么是 MACD 柱状图？

## 📚 其他资源

- [Investopedia: RSI](https://www.investopedia.com/terms/r/rsi.asp)
- [StockCharts: RSI](https://school.stockcharts.com/doku.php?id=technical_indicators:relative_strength_index_rsi)
- [TradingView: RSI](https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/)

## ✅ 答案

1. **RSI 衡量**：价格变动的速率和幅度；0-100 范围内的动量

2. **超买/超卖**：超买 > 70（价格可能上涨过快），超卖 < 30（价格可能下跌过快）

3. **看涨背离**：价格创更低的低点而 RSI 创更高的低点；表明卖压减弱，可能向上反转

4. **RSI 在上升趋势中保持超买**：强劲趋势具有持续的动量；超买并不意味着立即反转，只是价格上涨迅速

5. **在下降趋势中交易 RSI**：寻找 RSI 反弹至 50-60 作为卖出机会；避免在超卖状态买入，因为下降趋势可能继续；等待趋势反转确认

---

**完成本课？** ✓ 标记为完成并继续 [第 3.2 课：趋势指标（MACD）](lesson-02-trend.md)
