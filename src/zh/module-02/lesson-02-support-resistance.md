# 课程 2.2：支撑和阻力 - 关键价格水平

**模块**：2 - 技术分析基础
**预计时间**：50分钟
**难度**：初级

## 🎯 学习目标

完成本课程后，你将能够：
- 理解什么是支撑和阻力水平
- 学会在图表上识别这些水平
- 认识支撑和阻力背后的心理
- 知道如何交易反弹和突破
- 将支撑/阻力应用于风险管理

## 📖 什么是支撑和阻力？

**支撑**和**阻力**是买入或卖出压力足够强大以防止价格进一步移动的价格水平。

### 支撑

**支撑**是买入压力足够强大以防止价格进一步下跌的价格水平。

```
价格
  ↑
  │     ╱╲
  │    ╱  ╲    ╱╲
  │   ╱    ╲  ╱  ╲
  │  ╱      ╲╱    ╲
  │ ╱              ╲
  │╱________________╲_____ ← 支撑水平
  └────────────────────→ 时间
     在这里反弹
```

**把它想象成地板** - 价格像球从地面反弹一样从它反弹。

### 阻力

**阻力**是卖出压力足够强大以防止价格进一步上涨的价格水平。

```
价格
  ↑  _____________________ ← 阻力水平
  │  ╲                ╱
  │   ╲    ╱╲    ╱╲  ╱
  │    ╲  ╱  ╲  ╱  ╲╱
  │     ╲╱    ╲╱
  │
  └────────────────────→ 时间
     在这里被拒绝
```

**把它想象成天花板** - 当价格达到这个水平时被推回。

## 🧠 支撑/阻力背后的心理

### 为什么支撑有效

在支撑水平：
1. **之前的买家**记得在这个价格买入并继续买入
2. **后悔的卖家**在这里卖出后想要买回
3. **新买家**将其视为良好的入场点
4. **空头**获利了结（买入平仓）

**结果**：增加的买入压力阻止进一步下跌

### 为什么阻力有效

在阻力水平：
1. **之前的买家**在盈亏平衡时想要卖出
2. **后悔的买家**在更高价位买入后想要退出
3. **新卖家**认为价格被高估
4. **空头**进入仓位

**结果**：增加的卖出压力阻止进一步上涨

## 🔍 识别支撑和阻力

### 方法1：历史价格水平

寻找价格多次反弹或被拒绝的区域。

```
AAPL 示例：
$160 ─────────────── 阻力（被拒绝3次）
$155
$150 ─────────────── 支撑（反弹4次）
$145
```

**规则**：
- 触碰次数越多 = 水平越强
- 最近的触碰比旧的更重要
- 精确价格不如区域重要

### 方法2：整数关口

心理水平通常充当支撑/阻力：
- $100、$150、$200（整数）
- $149.99、$199.99（略低于整数）

**原因**：人类心理、期权行权价、机构订单

### 方法3：之前的高点和低点

- **摆动高点**：局部峰值通常成为阻力
- **摆动低点**：局部谷底通常成为支撑

```
     峰值1（现在是阻力）
       ↓
      ╱╲
     ╱  ╲    ╱╲
    ╱    ╲  ╱  ╲
   ╱      ╲╱    ╲
  ╱              ╲
 ╱                ╲
╱                  ╲
                    ↑
              谷底（现在是支撑）
```

### 方法4：移动平均线

常见的MA充当动态支撑/阻力：
- 50日MA
- 200日MA
- 20日MA（用于较短时间框架）

**优势**：随价格调整，不是静态的

### 方法5：趋势线

连接高点或低点的对角线：

```
上升趋势支撑：
    ╱
   ╱ ╱
  ╱ ╱
 ╱ ╱
╱ ╱
 ╱ ← 趋势线支撑
```

## 🎯 支撑和阻力区域

**重要**：支撑/阻力不是精确价格，而是区域！

```
不要这样想：              而要这样想：
$150.00 ─────           $150.50 ┐
                        $150.00 │ 阻力区域
                        $149.50 ┘
```

**为什么是区域？**：
- 不同交易者看到略有不同的水平
- 点差和滑点
- 心理范围
- 机构订单分散在范围内

**实用提示**：对于100美元以下的股票使用$0.50 - $1.00区域，对于价格更高的股票使用更宽的区域

## 🔄 角色反转

**关键概念**：当支撑被突破时，它通常会成为阻力（反之亦然）

```
阶段1：支撑保持
$50 ─────────────── 支撑
    ╲  ╱╲  ╱╲  ╱
     ╲╱  ╲╱  ╲╱

阶段2：支撑被突破
$50 ─────────────── 向下突破！
    ╲
     ╲
      ╲

阶段3：旧支撑成为阻力
$50 ─────────────── 现在是阻力！
         ╱╲
        ╱  ╲
       ╱    ╲
```

**原因**：之前的买家现在处于亏损状态，想在盈亏平衡时卖出

## 📊 交易支撑和阻力

### 策略1：反弹交易

**设置**：在支撑买入，在阻力卖出

```python
# 伪代码
if price_near_support() and showing_bullish_signals():
    buy()
    set_stop_loss(below_support)
    set_target(at_resistance)

if price_near_resistance() and showing_bearish_signals():
    sell_or_short()
    set_stop_loss(above_resistance)
    set_target(at_support)
```

**风险管理**：
- 止损设在支撑/阻力水平之外
- 目标设在相反的支撑/阻力水平
- 风险回报比至少1:2

### 策略2：突破交易

**设置**：当价格突破支撑/阻力时交易

```
阻力突破：
$155 ─────────────── 旧阻力
         ↑
         │ 突破！
         │
    ╱╲  ╱│
   ╱  ╲╱ │
  ╱       │
```

**要求**：
1. **强劲动能**：快速、果断的突破
2. **成交量增加**：确认真正的突破
3. **回测**：价格回来测试旧阻力（现在是支撑）

**入场点**：
- **激进**：在突破时入场
- **保守**：等待回测和反弹

### 策略3：假突破交易

**设置**：交易假突破

```
假突破：
$155 ─────────────── 阻力
         ╱╲
        ╱  ╲ ← 突破上方，然后失败
       ╱    ╲
      ╱      ╲
```

**信号**：
- 低成交量突破
- 快速反转回水平以下
- 长上影线（射击之星）

**交易**：当价格失败并返回阻力下方时做空

## 🔢 支撑/阻力水平的强度

并非所有支撑/阻力水平都相同。更强的水平具有：

1. **更多触碰**：3次以上反弹比1次强
2. **最近活动**：上个月 > 去年
3. **高成交量**：更多参与者 = 更强水平
4. **整数关口**：$100、$150、$200
5. **多个时间框架**：在日线和周线图上都有效
6. **汇合**：多个因素（MA + 趋势线 + 之前的高点）

### 示例：强阻力

```
AAPL在$150：
✓ 过去2个月被拒绝4次
✓ 整数关口（$150.00）
✓ 与200日MA重合
✓ 之前的历史高点
✓ 该水平成交量高

→ 非常强的阻力！
```

## 💻 实际实现

### 使用Python查找支撑/阻力

```python
import yfinance as yf
import pandas as pd
import numpy as np

def find_support_resistance(ticker, period="6mo"):
    # 获取数据
    df = yf.Ticker(ticker).history(period=period)

    # 查找局部最大值（阻力）
    df['resistance'] = df['High'][(df['High'].shift(1) < df['High']) &
                                    (df['High'].shift(-1) < df['High'])]

    # 查找局部最小值（支撑）
    df['support'] = df['Low'][(df['Low'].shift(1) > df['Low']) &
                               (df['Low'].shift(-1) > df['Low'])]

    # 获取重要水平（多次出现）
    resistance_levels = df['resistance'].dropna()
    support_levels = df['support'].dropna()

    # 聚类附近的水平（2%以内）
    def cluster_levels(levels, tolerance=0.02):
        clusters = []
        for level in sorted(levels):
            if not clusters or level > clusters[-1] * (1 + tolerance):
                clusters.append(level)
            else:
                # 与现有聚类平均
                clusters[-1] = (clusters[-1] + level) / 2
        return clusters

    resistance = cluster_levels(resistance_levels)
    support = cluster_levels(support_levels)

    return support, resistance

# 使用示例
support, resistance = find_support_resistance("AAPL")
print(f"支撑水平：{support}")
print(f"阻力水平：{resistance}")
```

### 与stock-agent-system集成

```python
# 在你的策略中
class SupportResistanceStrategy:
    def __init__(self):
        self.support_levels = []
        self.resistance_levels = []

    def update_levels(self, df):
        self.support_levels, self.resistance_levels = \
            find_support_resistance_from_df(df)

    def generate_signal(self, current_price):
        # 检查是否接近支撑
        for support in self.support_levels:
            if abs(current_price - support) / support < 0.01:  # 1%以内
                if self.bullish_confirmation():
                    return "BUY"

        # 检查是否接近阻力
        for resistance in self.resistance_levels:
            if abs(current_price - resistance) / resistance < 0.01:
                if self.bearish_confirmation():
                    return "SELL"

        return "HOLD"
```

## 🎓 检查你的理解

1. 支撑和阻力有什么区别？
2. 为什么整数关口通常充当支撑/阻力水平？
3. 当支撑被突破时会发生什么？
4. 识别支撑水平的三种方法是什么？
5. 你会如何交易突破阻力上方的情况？

## 💻 实践练习

分析一只真实股票：

```python
import yfinance as yf
import matplotlib.pyplot as plt

# 获取数据
ticker = "MSFT"
df = yf.Ticker(ticker).history(period="1y")

# 绘图
plt.figure(figsize=(12, 6))
plt.plot(df.index, df['Close'])
plt.title(f"{ticker} - 识别支撑和阻力")
plt.xlabel("日期")
plt.ylabel("价格")
plt.grid(True)
plt.show()

# 你的任务：手动识别2-3个支撑和2-3个阻力水平
```

## 📝 练习2.2：支撑/阻力分析

创建：`exercises/module-02/exercise-2.2-support-resistance.md`

1. 从不同行业选择3只股票
2. 为每只股票识别2个支撑和2个阻力水平
3. 解释每个水平为何重要
4. 注明当前价格相对于这些水平的位置
5. 为每只股票建议一个潜在的交易设置

## 🚀 下一步

在下一课中，我们将学习**趋势识别** - 如何确定股票是处于上升趋势、下降趋势还是横盘。

**预习问题**：
- 什么定义了上升趋势？
- 如何发现趋势反转？
- 修正和反转有什么区别？

## 📚 额外资源

- [Investopedia: Support and Resistance](https://www.investopedia.com/trading/support-and-resistance-basics/)
- [BabyPips: Support and Resistance](https://www.babypips.com/learn/forex/support-and-resistance)
- [TradingView: Drawing Support and Resistance](https://www.tradingview.com/support/solutions/43000474104-support-and-resistance/)

## ✅ 答案

1. **支撑 vs 阻力**：支撑是买入压力阻止进一步下跌的价格水平（地板）；阻力是卖出压力阻止进一步上涨的价格水平（天花板）

2. **整数关口**：人类心理使我们以整数思考；机构订单通常聚集在这些水平；期权行权价在整数关口

3. **当支撑被突破时**：价格通常继续下跌；旧支撑通常成为新阻力（角色反转）；表明趋势变化或加速

4. **识别支撑的三种方法**：（1）价格多次反弹的历史价格水平，（2）之前的摆动低点，（3）整数关口或移动平均线

5. **交易阻力突破**：等待高成交量的果断突破；在突破时入场或等待回测；将止损设在旧阻力（现在是支撑）下方；目标设在下一个阻力水平或使用跟踪止损

---

**完成本课程了吗？** ✓ 标记为完成并继续[课程2.3：趋势识别](lesson-03-trends.md)