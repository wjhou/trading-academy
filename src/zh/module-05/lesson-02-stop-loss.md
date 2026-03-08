# 第5.2课：止损策略 - 保护您的资本

**模块**：5 - 风险管理
**预计时间**：55分钟
**难度**：中级

## 🎯 学习目标

- 理解不同类型的止损
- 学习何时以及在哪里设置止损
- 实施追踪止损
- 避免常见的止损错误
- 掌握止损心理

## 📖 什么是止损？

**止损**是预先确定的价格水平，在该水平退出亏损交易以限制损失。

### 为什么止损至关重要

> "第一次损失是最好的损失"

**没有止损**：
- 小损失变成大损失
- 情绪化决策
- 账户爆仓风险
- 没有风险管理

**有止损**：
- 有限的、已知的风险
- 客观的退出
- 资本保护
- 内心平静

## 📊 止损类型

### 1. 固定美元/百分比止损

**概念**：当损失达到固定金额时退出

```python
def fixed_stop_loss(entry_price, stop_percent, direction='LONG'):
    """
    计算距离入场固定百分比的止损

    常见：股票2-5%，波动性资产1-2%
    """
    if direction == 'LONG':
        stop = entry_price * (1 - stop_percent)
    else:  # SHORT
        stop = entry_price * (1 + stop_percent)

    return stop

# 示例
entry = 150
stop_pct = 0.02  # 2%

stop = fixed_stop_loss(entry, stop_pct, 'LONG')
print(f"入场：${entry}")
print(f"止损：${stop:.2f}")
print(f"风险：${entry - stop:.2f} ({stop_pct:.1%})")
```

**优点**：简单，一致
**缺点**：忽略市场结构，可能太紧/太宽

### 2. 支撑/阻力止损

**概念**：将止损设置在关键支撑/阻力位之外

```python
def support_resistance_stop(entry_price, support_level, buffer=0.5, direction='LONG'):
    """
    将止损设置在支撑位下方（或做空时在阻力位上方）

    buffer：超出支撑/阻力的百分比缓冲
    """
    if direction == 'LONG':
        stop = support_level * (1 - buffer/100)
    else:  # SHORT
        stop = support_level * (1 + buffer/100)

    return stop

# 示例
entry = 150
support = 145

stop = support_resistance_stop(entry, support, buffer=0.5)
print(f"入场：${entry}")
print(f"支撑：${support}")
print(f"止损：${stop:.2f}（支撑下方0.5%）")
```

**优点**：尊重市场结构，逻辑放置
**缺点**：如果支撑/阻力远离入场，可能导致大风险

### 3. 基于ATR的止损

**概念**：使用平均真实范围进行波动性调整的止损

```python
def atr_stop_loss(entry_price, atr, multiplier=2, direction='LONG'):
    """
    基于ATR计算止损

    multiplier：典型1.5-3倍ATR
        1.5x = 紧（更多止损）
        2.0x = 标准
        3.0x = 宽（更少止损）
    """
    if direction == 'LONG':
        stop = entry_price - (atr * multiplier)
    else:  # SHORT
        stop = entry_price + (atr * multiplier)

    return stop

# 示例
entry = 150
atr = 3.5

for mult in [1.5, 2.0, 3.0]:
    stop = atr_stop_loss(entry, atr, mult)
    risk = entry - stop
    print(f"{mult}x ATR：止损${stop:.2f}，风险${risk:.2f}")
```

**优点**：适应波动性，跨股票一致
**缺点**：需要ATR计算

### 4. 吊灯止损

**概念**：基于最高价减去ATR的追踪止损

```python
def chandelier_stop(df, atr_period=14, atr_multiplier=3):
    """
    吊灯退出（追踪止损）

    止损 = 最高价 - (ATR × 乘数)
    """
    # 计算ATR
    df['TR'] = df[['High', 'Low', 'Close']].apply(
        lambda x: max(x['High'] - x['Low'],
                     abs(x['High'] - x['Close']),
                     abs(x['Low'] - x['Close'])), axis=1)
    df['ATR'] = df['TR'].rolling(atr_period).mean()

    # 计算周期内的最高价
    df['Highest_High'] = df['High'].rolling(atr_period).max()

    # 吊灯止损
    df['Chandelier_Stop'] = df['Highest_High'] - (df['ATR'] * atr_multiplier)

    return df

# 示例
import yfinance as yf
df = yf.Ticker("AAPL").history(period="3mo")
df = chandelier_stop(df)

print(df[['Close', 'Chandelier_Stop']].tail())
```

**优点**：追踪价格，适应波动性
**缺点**：在震荡市场中可能被反复触发

### 5. 基于时间的止损

**概念**：无论价格如何，在固定时间段后退出

```python
def time_stop(entry_date, current_date, max_days=30):
    """
    如果交易在X天内没有成功则退出
    """
    days_in_trade = (current_date - entry_date).days

    if days_in_trade >= max_days:
        return True, "TIME_STOP"

    return False, None

# 示例
from datetime import datetime, timedelta

entry = datetime(2024, 1, 1)
current = datetime(2024, 2, 5)

should_exit, reason = time_stop(entry, current, max_days=30)
print(f"交易天数：{(current - entry).days}")
print(f"退出：{should_exit}，原因：{reason}")
```

**优点**：从死交易中释放资本
**缺点**：可能在交易成功前退出

## 🎯 追踪止损

### 1. 百分比追踪止损

```python
class PercentageTrailingStop:
    """
    从最高价追踪固定百分比的止损
    """
    def __init__(self, trail_percent=0.05):
        self.trail_percent = trail_percent
        self.highest_price = 0
        self.stop_price = 0

    def update(self, current_price, entry_price):
        """
        更新追踪止损
        """
        # 首次调用时初始化
        if self.highest_price == 0:
            self.highest_price = entry_price
            self.stop_price = entry_price * (1 - self.trail_percent)

        # 更新最高价
        if current_price > self.highest_price:
            self.highest_price = current_price
            new_stop = current_price * (1 - self.trail_percent)

            # 只向上移动止损，永不向下
            self.stop_price = max(self.stop_price, new_stop)

        return self.stop_price

# 示例
trail_stop = PercentageTrailingStop(trail_percent=0.05)  # 5%追踪

prices = [150, 155, 160, 158, 165, 162]
entry = 150

for price in prices:
    stop = trail_stop.update(price, entry)
    print(f"价格：${price}，止损：${stop:.2f}，利润：${price - entry:.2f}")
```

### 2. ATR追踪止损

```python
class ATRTrailingStop:
    """
    使用ATR的追踪止损
    """
    def __init__(self, atr_multiplier=2):
        self.atr_multiplier = atr_multiplier
        self.stop_price = 0

    def update(self, current_price, atr, entry_price):
        """
        更新基于ATR的追踪止损
        """
        # 计算新止损
        new_stop = current_price - (atr * self.atr_multiplier)

        # 初始化或更新
        if self.stop_price == 0:
            self.stop_price = entry_price - (atr * self.atr_multiplier)
        else:
            # 只向上移动止损
            self.stop_price = max(self.stop_price, new_stop)

        return self.stop_price
```

### 3. 抛物线SAR

```python
def parabolic_sar(df, af_start=0.02, af_increment=0.02, af_max=0.2):
    """
    抛物线SAR追踪止损

    af = 加速因子
    """
    df['SAR'] = df['Close'].iloc[0]
    df['EP'] = df['High'].iloc[0]  # 极值点
    df['AF'] = af_start
    trend = 1  # 1 = 上升趋势，-1 = 下降趋势

    for i in range(1, len(df)):
        # 计算SAR
        sar = df['SAR'].iloc[i-1] + df['AF'].iloc[i-1] * (df['EP'].iloc[i-1] - df['SAR'].iloc[i-1])

        # 检查反转
        if trend == 1:  # 上升趋势
            if df['Low'].iloc[i] < sar:
                # 反转到下降趋势
                trend = -1
                sar = df['EP'].iloc[i-1]
                df.loc[df.index[i], 'EP'] = df['Low'].iloc[i]
                df.loc[df.index[i], 'AF'] = af_start
            else:
                # 继续上升趋势
                if df['High'].iloc[i] > df['EP'].iloc[i-1]:
                    df.loc[df.index[i], 'EP'] = df['High'].iloc[i]
                    df.loc[df.index[i], 'AF'] = min(df['AF'].iloc[i-1] + af_increment, af_max)
                else:
                    df.loc[df.index[i], 'EP'] = df['EP'].iloc[i-1]
                    df.loc[df.index[i], 'AF'] = df['AF'].iloc[i-1]

        df.loc[df.index[i], 'SAR'] = sar

    return df
```

## 💰 止损设置规则

### 规则1：永不向不利方向移动止损

```python
def validate_stop_adjustment(old_stop, new_stop, direction='LONG'):
    """
    确保止损只向有利方向移动
    """
    if direction == 'LONG':
        if new_stop < old_stop:
            print("❌ 不能在多头仓位中向下移动止损")
            return False
    else:  # SHORT
        if new_stop > old_stop:
            print("❌ 不能在空头仓位中向上移动止损")
            return False

    return True
```

### 规则2：给交易留出呼吸空间

```python
def check_stop_distance(entry, stop, min_distance_pct=0.02):
    """
    确保止损不太紧
    """
    distance_pct = abs(entry - stop) / entry

    if distance_pct < min_distance_pct:
        print(f"⚠️  止损太紧：{distance_pct:.2%} < {min_distance_pct:.2%}")
        return False

    return True
```

### 规则3：考虑波动性

```python
def volatility_adjusted_stop(entry, atr, min_atr_mult=1.5):
    """
    确保止损考虑正常波动性
    """
    min_stop_distance = atr * min_atr_mult
    stop = entry - min_stop_distance

    return stop
```

## 📊 完整的止损系统

```python
class StopLossManager:
    """
    综合止损管理
    """
    def __init__(self, method='atr', **params):
        self.method = method
        self.params = params
        self.stops = {}  # ticker -> stop_price

    def calculate_initial_stop(self, ticker, entry_price, atr=None, support=None):
        """
        计算初始止损
        """
        if self.method == 'atr':
            if atr is None:
                raise ValueError("需要ATR")
            multiplier = self.params.get('atr_multiplier', 2.0)
            stop = atr_stop_loss(entry_price, atr, multiplier)

        elif self.method == 'support':
            if support is None:
                raise ValueError("需要支撑位")
            buffer = self.params.get('buffer', 0.5)
            stop = support_resistance_stop(entry_price, support, buffer)

        elif self.method == 'fixed':
            stop_pct = self.params.get('stop_percent', 0.02)
            stop = fixed_stop_loss(entry_price, stop_pct)

        else:
            raise ValueError(f"未知方法：{self.method}")

        self.stops[ticker] = stop
        return stop

    def update_trailing_stop(self, ticker, current_price, atr=None):
        """
        更新追踪止损
        """
        if ticker not in self.stops:
            raise ValueError(f"未设置{ticker}的止损")

        old_stop = self.stops[ticker]

        if self.method == 'atr':
            multiplier = self.params.get('atr_multiplier', 2.0)
            new_stop = current_price - (atr * multiplier)
        else:
            trail_pct = self.params.get('trail_percent', 0.05)
            new_stop = current_price * (1 - trail_pct)

        # 只向上移动止损
        self.stops[ticker] = max(old_stop, new_stop)

        return self.stops[ticker]

    def check_stop_hit(self, ticker, current_price):
        """
        检查是否触及止损
        """
        if ticker not in self.stops:
            return False

        return current_price <= self.stops[ticker]

# 使用示例
manager = StopLossManager(method='atr', atr_multiplier=2.0)

# 设置初始止损
entry = 150
atr = 3.5
stop = manager.calculate_initial_stop('AAPL', entry, atr=atr)
print(f"初始止损：${stop:.2f}")

# 随价格移动更新
prices = [152, 155, 158, 156]
for price in prices:
    new_stop = manager.update_trailing_stop('AAPL', price, atr=atr)
    hit = manager.check_stop_hit('AAPL', price)
    print(f"价格：${price}，止损：${new_stop:.2f}，触及：{hit}")
```

## ⚠️ 常见错误

1. **没有止损**："我就等着"
2. **向不利方向移动止损**：将小损失变成大损失
3. **止损太紧**：被噪音止损
4. **止损在整数位**：所有人的止损都在那里
5. **心理止损**：实际上没有下单

## 🎓 检查您的理解

1. 为什么止损至关重要？
2. 固定止损和ATR止损有什么区别？
3. 追踪止损如何工作？
4. 不应该在哪里设置止损？
5. 什么是基于时间的止损？

## 💻 练习

```python
# 实施止损系统
manager = StopLossManager(method='atr', atr_multiplier=2.0)

# 模拟交易
entry = 150
atr = 3.5
stop = manager.calculate_initial_stop('AAPL', entry, atr=atr)

# 模拟价格变动
import numpy as np
prices = np.random.normal(155, 5, 20)  # 随机价格

for i, price in enumerate(prices):
    stop = manager.update_trailing_stop('AAPL', price, atr=atr)
    hit = manager.check_stop_hit('AAPL', price)

    if hit:
        print(f"第{i}天：在${price:.2f}止损")
        break
    else:
        profit = price - entry
        print(f"第{i}天：价格${price:.2f}，止损${stop:.2f}，盈亏${profit:.2f}")
```

## 📝 练习5.2

创建：`exercises/module-05/exercise-5.2-stop-loss.md`

1. 实施所有止损类型
2. 在同一股票上回测每种方法
3. 比较止损率和盈利能力
4. 测试不同的ATR乘数（1.5x、2x、3x）
5. 记录最优止损策略

## 📚 资源

- [Investopedia: Stop-Loss Orders](https://www.investopedia.com/terms/s/stop-lossorder.asp)
- [Elder: Come Into My Trading Room](https://www.amazon.com/Come-Into-My-Trading-Room/dp/0471225347)

## ✅ 解决方案

1. **为什么至关重要**：限制损失，消除情绪，保护资本，实现一致的风险管理

2. **固定vs ATR**：固定使用距离入场的百分比（所有股票相同）；ATR根据波动性调整（波动性大的股票获得更宽的止损）

3. **追踪止损**：随着价格向有利方向移动而移动止损；锁定利润；永不向不利方向移动

4. **不应该设置的地方**：在整数位（100、150、200），在明显的支撑/阻力位（所有人的止损都在那里），太接近入场（噪音止损）

5. **基于时间的止损**：无论价格如何，X天后退出；从停滞交易中释放资本；防止持有亏损太久

---

**下一课**：[第5.3课：风险回报比](lesson-03-risk-reward.md)
