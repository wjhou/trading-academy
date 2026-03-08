# 课程 3.4：成交量指标 - OBV、VWAP 等

**模块**：3 - 技术指标
**预计时间**：45 分钟
**难度**：中级

## 🎯 学习目标

- 理解基于成交量的指标
- 学习 OBV（能量潮）
- 掌握 VWAP（成交量加权平均价）
- 将成交量指标应用于交易
- 将成交量与价格行为结合

## 📖 成交量指标概述

成交量指标使用交易量来确认价格走势并识别潜在反转。

### 为什么成交量指标重要

- **确认趋势**：高成交量验证价格走势
- **发现背离**：成交量/价格不一致发出反转信号
- **识别吸筹/派发**：聪明资金活动
- **衡量信念**：走势背后的力量

## 📊 能量潮（OBV）

### 什么是 OBV？

累积成交量指标，在上涨日加上成交量，在下跌日减去成交量。

### 公式

```
如果收盘价 > 前收盘价：OBV = 前 OBV + 成交量
如果收盘价 < 前收盘价：OBV = 前 OBV - 成交量
如果收盘价 = 前收盘价：OBV = 前 OBV
```

### 实现

```python
def calculate_obv(df):
    obv = [0]
    for i in range(1, len(df)):
        if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
            obv.append(obv[-1] + df['Volume'].iloc[i])
        elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
            obv.append(obv[-1] - df['Volume'].iloc[i])
        else:
            obv.append(obv[-1])
    df['OBV'] = obv
    return df
```

### 解读 OBV

**上升 OBV**：吸筹，看涨
**下降 OBV**：派发，看跌
**OBV 背离**：价格/OBV 不一致，反转信号

### OBV 策略

```python
def obv_strategy(df):
    # 计算 OBV 趋势
    obv_ma = df['OBV'].rolling(20).mean()
    obv_curr = df['OBV'].iloc[-1]
    obv_prev = df['OBV'].iloc[-2]

    # 当 OBV 向上穿越 MA 时买入
    if obv_prev <= obv_ma.iloc[-2] and obv_curr > obv_ma.iloc[-1]:
        return "BUY"
    # 当 OBV 向下穿越 MA 时卖出
    elif obv_prev >= obv_ma.iloc[-2] and obv_curr < obv_ma.iloc[-1]:
        return "SELL"
    return "HOLD"
```

## 📈 VWAP（成交量加权平均价）

### 什么是 VWAP？

按成交量加权的平均价格 - 显示当天的"公允价值"。

### 公式

```
VWAP = Σ(价格 × 成交量) / Σ(成交量)

其中价格 = (最高价 + 最低价 + 收盘价) / 3
```

### 实现

```python
def calculate_vwap(df):
    df['Typical_Price'] = (df['High'] + df['Low'] + df['Close']) / 3
    df['TP_Volume'] = df['Typical_Price'] * df['Volume']
    df['VWAP'] = df['TP_Volume'].cumsum() / df['Volume'].cumsum()
    return df
```

### 解读 VWAP

**价格 > VWAP**：看涨，买方控制
**价格 < VWAP**：看跌，卖方控制
**价格在 VWAP**：公允价值，支撑/阻力

### VWAP 策略

```python
def vwap_strategy(df):
    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]

    # 当价格向上穿越 VWAP 时买入
    if df['Close'].iloc[-2] <= df['VWAP'].iloc[-2] and price > vwap:
        return "BUY"
    # 当价格向下穿越 VWAP 时卖出
    elif df['Close'].iloc[-2] >= df['VWAP'].iloc[-2] and price < vwap:
        return "SELL"
    return "HOLD"
```

## 📊 其他成交量指标

### 1. 累积/派发线（A/D）

类似于 OBV，但考虑价格在区间内的收盘位置。

```python
def calculate_ad_line(df):
    clv = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
    df['AD_Line'] = (clv * df['Volume']).cumsum()
    return df
```

### 2. 蔡金资金流（CMF）

衡量一段时间内的买卖压力。

```python
def calculate_cmf(df, period=20):
    clv = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
    mfv = clv * df['Volume']
    df['CMF'] = mfv.rolling(period).sum() / df['Volume'].rolling(period).sum()
    return df
```

**解读**：CMF > 0 = 买压，CMF < 0 = 卖压

### 3. 成交量变化率（VROC）

衡量成交量的变化率。

```python
def calculate_vroc(df, period=14):
    df['VROC'] = ((df['Volume'] - df['Volume'].shift(period)) /
                   df['Volume'].shift(period)) * 100
    return df
```

## 🎯 组合成交量策略

### 策略 1：OBV + 价格背离

```python
def obv_divergence_strategy(df, lookback=20):
    # 找到价格和 OBV 的高点/低点
    price_high = df['High'].iloc[-lookback:].max()
    price_low = df['Low'].iloc[-lookback:].min()
    obv_high = df['OBV'].iloc[-lookback:].max()
    obv_low = df['OBV'].iloc[-lookback:].min()

    curr_price = df['Close'].iloc[-1]
    curr_obv = df['OBV'].iloc[-1]

    # 看涨背离：价格更低低点，OBV 更高低点
    if curr_price < price_low and curr_obv > obv_low:
        return "BUY"
    # 看跌背离：价格更高高点，OBV 更低高点
    elif curr_price > price_high and curr_obv < obv_high:
        return "SELL"
    return "HOLD"
```

### 策略 2：VWAP + 成交量激增

```python
def vwap_volume_strategy(df):
    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]
    volume = df['Volume'].iloc[-1]
    avg_volume = df['Volume'].rolling(20).mean().iloc[-1]

    # 买入：价格向上穿越 VWAP 且成交量大
    if price > vwap and volume > avg_volume * 1.5:
        if df['Close'].iloc[-2] <= df['VWAP'].iloc[-2]:
            return "BUY"

    # 卖出：价格向下穿越 VWAP 且成交量大
    elif price < vwap and volume > avg_volume * 1.5:
        if df['Close'].iloc[-2] >= df['VWAP'].iloc[-2]:
            return "SELL"

    return "HOLD"
```

### 策略 3：多成交量确认

```python
def multi_volume_strategy(df):
    # 计算所有指标
    df = calculate_obv(df)
    df = calculate_vwap(df)
    df = calculate_cmf(df)

    price = df['Close'].iloc[-1]
    vwap = df['VWAP'].iloc[-1]
    obv_trend = df['OBV'].iloc[-1] > df['OBV'].iloc[-20]
    cmf = df['CMF'].iloc[-1]

    # 强买入：所有成交量指标看涨
    if price > vwap and obv_trend and cmf > 0.1:
        return "STRONG_BUY"

    # 强卖出：所有成交量指标看跌
    elif price < vwap and not obv_trend and cmf < -0.1:
        return "STRONG_SELL"

    return "HOLD"
```

## 💻 实际应用

### 完整成交量分析

```python
import yfinance as yf
import matplotlib.pyplot as plt

def analyze_volume_indicators(ticker, period="6mo"):
    # 获取数据
    df = yf.Ticker(ticker).history(period=period)

    # 计算指标
    df = calculate_obv(df)
    df = calculate_vwap(df)
    df = calculate_cmf(df)

    # 绘图
    fig, axes = plt.subplots(4, 1, figsize=(14, 12), sharex=True)

    # 价格
    axes[0].plot(df.index, df['Close'], label='价格')
    axes[0].plot(df.index, df['VWAP'], label='VWAP', alpha=0.7)
    axes[0].set_title(f"{ticker} - 价格和 VWAP")
    axes[0].legend()
    axes[0].grid(True)

    # 成交量
    axes[1].bar(df.index, df['Volume'], alpha=0.5)
    axes[1].set_title("成交量")
    axes[1].grid(True)

    # OBV
    axes[2].plot(df.index, df['OBV'])
    axes[2].set_title("能量潮（OBV）")
    axes[2].grid(True)

    # CMF
    axes[3].plot(df.index, df['CMF'])
    axes[3].axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    axes[3].fill_between(df.index, 0, df['CMF'], where=df['CMF']>=0, alpha=0.3, color='green')
    axes[3].fill_between(df.index, 0, df['CMF'], where=df['CMF']<0, alpha=0.3, color='red')
    axes[3].set_title("蔡金资金流（CMF）")
    axes[3].grid(True)

    plt.tight_layout()
    plt.show()

    return df

# 示例
df = analyze_volume_indicators("AAPL")
```

## ⚠️ 局限性

- **OBV**：绝对值无意义，只有趋势重要
- **VWAP**：每日重置，不适用于多日分析
- **成交量指标**：滞后于价格，需要确认
- **假信号**：在低成交量股票中可能出现

## 🎓 检查您的理解

1. OBV 衡量什么？
2. VWAP 如何计算？
3. 什么是看涨 OBV 背离？
4. VWAP 何时最有用？
5. 如何将成交量指标与价格行为结合？

## 📝 练习 3.4

创建：`exercises/module-03/exercise-3.4-volume-indicators.md`

1. 为 3 只股票计算 OBV、VWAP 和 CMF
2. 识别任何 OBV 背离
3. 分析 VWAP 附近的价格行为
4. 比较成交量指标信号
5. 回测基于成交量的策略

## 📚 资源

- [Investopedia: OBV](https://www.investopedia.com/terms/o/onbalancevolume.asp)
- [Investopedia: VWAP](https://www.investopedia.com/terms/v/vwap.asp)
- [StockCharts: 成交量指标](https://school.stockcharts.com/doku.php?id=technical_indicators:introduction_to_volume)

## ✅ 答案

1. **OBV 衡量**：通过在上涨日加上成交量、在下跌日减去成交量来衡量累积买卖压力
2. **VWAP 计算**：(价格 × 成交量) 之和除以总成交量，其中价格为典型价格 (H+L+C)/3
3. **看涨 OBV 背离**：价格创更低低点而 OBV 创更高低点，表示尽管价格下跌但在吸筹
4. **VWAP 最有用**：日内交易、机构基准、识别公允价值和支撑/阻力
5. **结合成交量与价格**：使用成交量确认突破、验证趋势、发现背离；高成交量增强价格信号

---

**下一步**：[课程 3.5：组合指标](lesson-05-combining.md)
