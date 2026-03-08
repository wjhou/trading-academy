# 课程 3.3：波动率指标 - 布林带

**模块**：3 - 技术指标
**预计时间**：50 分钟
**难度**：中级

## 🎯 学习目标

- 理解布林带衡量什么
- 学习解读带宽和价格位置
- 识别收缩和扩张形态
- 应用布林带交易策略
- 与其他指标结合使用

## 📖 什么是布林带？

**布林带**是放置在移动平均线上方和下方的波动率带，根据市场波动率扩张和收缩。

### 开发者

John Bollinger 于 1980 年代开发

### 组成部分

1. **中轨**：20 周期 SMA
2. **上轨**：中轨 + (2 × 标准差)
3. **下轨**：中轨 - (2 × 标准差)

```
上轨 ─────────────── (SMA + 2σ)
中轨 ───────────── (20 SMA)
下轨 ─────────────── (SMA - 2σ)
```

### 它们显示什么

- **带宽**：市场波动率
- **价格位置**：相对价格水平
- **趋势**：中轨方向
- **反转**：价格触及带状

## 📊 解读布林带

### 价格位置

**在上轨**：超买，强劲上升趋势
**在下轨**：超卖，强劲下降趋势
**在中轨**：公允价值，潜在支撑/阻力

### 带宽

**宽带**：高波动率，强劲趋势
**窄带**：低波动率，盘整
**扩张**：波动率增加
**收缩**：波动率减少（收缩）

## 💻 实现

```python
def calculate_bollinger_bands(df, period=20, std_dev=2):
    df['BB_Middle'] = df['Close'].rolling(period).mean()
    df['BB_Std'] = df['Close'].rolling(period).std()
    df['BB_Upper'] = df['BB_Middle'] + (std_dev * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (std_dev * df['BB_Std'])
    df['BB_Width'] = df['BB_Upper'] - df['BB_Lower']
    return df
```

## 🎯 交易策略

### 1. 布林带反弹

在区间市场中，在下轨买入，在上轨卖出。

```python
def bollinger_bounce_strategy(df):
    price = df['Close'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    bb_upper = df['BB_Upper'].iloc[-1]

    if price <= bb_lower:
        return "BUY"
    elif price >= bb_upper:
        return "SELL"
    return "HOLD"
```

### 2. 布林带收缩

在低波动率期后交易突破。

```python
def bollinger_squeeze_strategy(df):
    bb_width = df['BB_Width'].iloc[-1]
    bb_width_avg = df['BB_Width'].rolling(50).mean().iloc[-1]

    # 收缩：宽度 < 平均值的 50%
    if bb_width < bb_width_avg * 0.5:
        # 等待突破
        if df['Close'].iloc[-1] > df['BB_Upper'].iloc[-1]:
            return "BUY"
        elif df['Close'].iloc[-1] < df['BB_Lower'].iloc[-1]:
            return "SELL"
    return "HOLD"
```

### 3. 布林带趋势

当价格沿着带状走时顺势而为。

```python
def bollinger_trend_strategy(df):
    price = df['Close'].iloc[-1]
    bb_upper = df['BB_Upper'].iloc[-1]
    bb_lower = df['BB_Lower'].iloc[-1]
    bb_middle = df['BB_Middle'].iloc[-1]

    # 强劲上升趋势：价格在中轨上方，触及上轨
    if price > bb_middle and price >= bb_upper * 0.98:
        return "HOLD_LONG"  # 保持交易

    # 强劲下降趋势：价格在中轨下方，触及下轨
    elif price < bb_middle and price <= bb_lower * 1.02:
        return "HOLD_SHORT"

    return "EXIT"
```

## 🔑 关键形态

### 收缩

6 个月内最窄的带宽 → 大行情即将来临

### 沿带走

价格持续触及上轨/下轨 → 强劲趋势

### 双底/双顶

价格两次触及带状而未突破 → 反转

### 带状突破

价格收盘在带外 → 可能延续

## ⚠️ 局限性

- 不能预测收缩后的方向
- 在强劲趋势中可能给出假信号
- 需要其他指标确认
- 标准设置可能不适合所有股票

## 🎓 检查您的理解

1. 布林带衡量什么？
2. 什么是布林带收缩？
3. 何时应使用反弹策略与突破策略？
4. "沿带走"表示什么？
5. 如何将布林带与 RSI 结合？

## 💻 练习

```python
# 分析布林带形态
df = yf.Ticker("NVDA").history(period="1y")
df = calculate_bollinger_bands(df)

# 绘图
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Close'], label='价格', linewidth=2)
plt.plot(df.index, df['BB_Upper'], 'r--', label='上轨')
plt.plot(df.index, df['BB_Middle'], 'g-', label='中轨')
plt.plot(df.index, df['BB_Lower'], 'r--', label='下轨')
plt.fill_between(df.index, df['BB_Upper'], df['BB_Lower'], alpha=0.1)
plt.legend()
plt.show()
```

## 📝 练习 3.3

创建：`exercises/module-03/exercise-3.3-bollinger.md`

1. 找出 3 只近期收缩的股票
2. 识别当前带宽百分位
3. 分析价格相对于带状的位置
4. 回测反弹策略与突破策略
5. 与 MACD 结合确认

## 📚 资源

- [Investopedia: 布林带](https://www.investopedia.com/terms/b/bollingerbands.asp)
- [StockCharts: 布林带](https://school.stockcharts.com/doku.php?id=technical_indicators:bollinger_bands)
- [John Bollinger 网站](https://www.bollingerbands.com/)

## ✅ 答案

1. **衡量**：使用标准差衡量波动率和相对价格水平
2. **收缩**：带状收窄至异常紧密的宽度，表示大行情前的低波动率
3. **反弹 vs 突破**：在区间市场使用反弹，在收缩后或趋势市场使用突破
4. **沿带走**：价格持续触及上轨（上升趋势）或下轨（下降趋势）时的强劲趋势
5. **BB + RSI**：使用 RSI 确认带状处的超买/超卖；在下轨且 RSI < 30 时买入，在上轨且 RSI > 70 时卖出

---

**下一步**：[课程 3.4：成交量指标](lesson-04-volume-indicators.md)
