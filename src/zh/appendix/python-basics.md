# Python 交易编程

算法交易的基本 Python 概念。

## 为什么使用 Python 进行交易？

Python 是算法交易最流行的语言，因为：
- **易于学习**：清晰、可读的语法
- **丰富的库**：pandas、numpy、scikit-learn
- **庞大的社区**：大量资源和帮助
- **多功能**：研究、回测和实盘交易
- **集成性**：与大多数经纪商和数据源兼容

## Python 基础

### 变量和数据类型

```python
# 数字
price = 150.50          # float
shares = 100            # int
profit = price * shares # 15050.0

# 字符串
symbol = "AAPL"
message = f"{symbol} price is ${price}"  # f-string 格式化

# 布尔值
is_profitable = True
should_buy = False

# None（空值）
stop_loss = None
```

### 列表（数组）

```python
# 创建列表
prices = [150.0, 151.5, 149.8, 152.3]

# 访问元素
first_price = prices[0]      # 150.0
last_price = prices[-1]      # 152.3

# 切片
first_two = prices[0:2]      # [150.0, 151.5]
last_two = prices[-2:]       # [149.8, 152.3]

# 添加元素
prices.append(153.0)

# 列表推导式
returns = [(prices[i] - prices[i-1]) / prices[i-1]
           for i in range(1, len(prices))]
```

### 字典（键值对）

```python
# 创建字典
position = {
    'symbol': 'AAPL',
    'shares': 100,
    'entry_price': 150.0,
    'current_price': 152.0
}

# 访问值
symbol = position['symbol']           # 'AAPL'
shares = position.get('shares', 0)    # 100（带默认值）

# 添加/更新
position['stop_loss'] = 145.0

# 迭代
for key, value in position.items():
    print(f"{key}: {value}")
```

### 控制流

```python
# If 语句
if price > 150:
    action = "sell"
elif price < 140:
    action = "buy"
else:
    action = "hold"

# For 循环
for price in prices:
    if price > 150:
        print(f"高价: {price}")

# While 循环
while portfolio_value < target:
    # 继续交易
    pass

# 列表推导式（Pythonic 方式）
high_prices = [p for p in prices if p > 150]
```

### 函数

```python
# 基本函数
def calculate_return(entry, exit):
    return (exit - entry) / entry

# 带类型提示
def calculate_return(entry: float, exit: float) -> float:
    """计算百分比收益率。"""
    return (exit - entry) / entry

# 带默认参数
def calculate_position_size(capital, risk_pct=0.02):
    return capital * risk_pct

# 多个返回值
def get_stats(prices):
    return min(prices), max(prices), sum(prices) / len(prices)

min_price, max_price, avg_price = get_stats(prices)
```

## 交易必备库

### NumPy（数值计算）

```python
import numpy as np

# 创建数组
prices = np.array([150.0, 151.5, 149.8, 152.3])
returns = np.array([0.01, -0.011, 0.017])

# 数学运算
mean_return = np.mean(returns)
std_return = np.std(returns)
cumulative_return = np.prod(1 + returns) - 1

# 数组运算（向量化 - 快速！）
normalized_prices = (prices - np.mean(prices)) / np.std(prices)

# 有用的函数
max_price = np.max(prices)
min_price = np.min(prices)
price_range = np.ptp(prices)  # peak-to-peak
```

### Pandas（数据分析）

```python
import pandas as pd

# 创建 DataFrame
data = pd.DataFrame({
    'date': ['2024-01-01', '2024-01-02', '2024-01-03'],
    'open': [150.0, 151.0, 149.5],
    'high': [152.0, 152.5, 151.0],
    'low': [149.5, 150.0, 148.5],
    'close': [151.5, 149.8, 150.5],
    'volume': [1000000, 1200000, 950000]
})

# 设置索引
data['date'] = pd.to_datetime(data['date'])
data.set_index('date', inplace=True)

# 访问列
closes = data['close']
highs_lows = data[['high', 'low']]

# 计算收益率
data['returns'] = data['close'].pct_change()

# 滚动计算
data['sma_20'] = data['close'].rolling(20).mean()
data['std_20'] = data['close'].rolling(20).std()

# 布尔索引
high_volume_days = data[data['volume'] > 1000000]

# 应用自定义函数
data['range'] = data.apply(lambda row: row['high'] - row['low'], axis=1)
```

### Matplotlib（可视化）

```python
import matplotlib.pyplot as plt

# 简单线图
plt.figure(figsize=(12, 6))
plt.plot(data.index, data['close'], label='收盘价')
plt.plot(data.index, data['sma_20'], label='20日均线')
plt.xlabel('日期')
plt.ylabel('价格')
plt.title('股票价格和移动平均线')
plt.legend()
plt.grid(True)
plt.show()

# 多个子图
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# 价格图
ax1.plot(data.index, data['close'])
ax1.set_title('价格')

# 成交量图
ax2.bar(data.index, data['volume'])
ax2.set_title('成交量')

plt.tight_layout()
plt.show()
```

## 常见交易模式

### 加载市场数据

```python
import yfinance as yf

# 下载数据
data = yf.download('AAPL', start='2024-01-01', end='2024-12-31')

# 多个股票代码
data = yf.download(['AAPL', 'GOOGL', 'MSFT'],
                   start='2024-01-01',
                   end='2024-12-31')

# 访问特定股票
aapl_close = data['Close']['AAPL']
```

### 计算指标

```python
def calculate_sma(prices, period):
    """计算简单移动平均线。"""
    return prices.rolling(window=period).mean()

def calculate_rsi(prices, period=14):
    """计算相对强弱指标。"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# 使用函数
data['SMA_20'] = calculate_sma(data['Close'], 20)
data['RSI'] = calculate_rsi(data['Close'])
```

### 生成信号

```python
def generate_signals(data):
    """生成买入/卖出信号。"""
    signals = pd.DataFrame(index=data.index)
    signals['price'] = data['Close']
    signals['signal'] = 0.0

    # 当价格上穿均线时买入
    signals['signal'][data['Close'] > data['SMA_20']] = 1.0

    # 当价格下穿均线时卖出
    signals['signal'][data['Close'] < data['SMA_20']] = -1.0

    # 生成交易订单
    signals['positions'] = signals['signal'].diff()

    return signals

signals = generate_signals(data)
```

### 回测

```python
def backtest_strategy(data, signals, initial_capital=100000):
    """简单回测。"""
    positions = pd.DataFrame(index=signals.index).fillna(0.0)
    positions['stock'] = 100 * signals['signal']  # 每个信号 100 股

    portfolio = positions.multiply(data['Close'], axis=0)
    pos_diff = positions.diff()

    portfolio['holdings'] = (positions.multiply(data['Close'], axis=0)).sum(axis=1)
    portfolio['cash'] = initial_capital - (pos_diff.multiply(data['Close'], axis=0)).sum(axis=1).cumsum()
    portfolio['total'] = portfolio['cash'] + portfolio['holdings']
    portfolio['returns'] = portfolio['total'].pct_change()

    return portfolio

portfolio = backtest_strategy(data, signals)
```

## 面向对象编程

### 交易类

```python
class TradingStrategy:
    """交易策略基类。"""

    def __init__(self, symbol, capital=100000):
        self.symbol = symbol
        self.capital = capital
        self.positions = []

    def generate_signal(self, data):
        """在子类中重写此方法。"""
        raise NotImplementedError

    def execute_trade(self, signal, price, quantity):
        """执行交易。"""
        if signal == 'buy':
            cost = price * quantity
            if cost <= self.capital:
                self.capital -= cost
                self.positions.append({
                    'type': 'buy',
                    'price': price,
                    'quantity': quantity
                })
                return True
        return False

    def get_portfolio_value(self, current_price):
        """计算当前投资组合价值。"""
        stock_value = sum(p['quantity'] for p in self.positions) * current_price
        return self.capital + stock_value

# 子类示例
class MovingAverageCrossover(TradingStrategy):
    """均线交叉策略。"""

    def __init__(self, symbol, short_window=20, long_window=50):
        super().__init__(symbol)
        self.short_window = short_window
        self.long_window = long_window

    def generate_signal(self, data):
        """基于均线交叉生成信号。"""
        short_ma = data['Close'].rolling(self.short_window).mean()
        long_ma = data['Close'].rolling(self.long_window).mean()

        if short_ma.iloc[-1] > long_ma.iloc[-1]:
            return 'buy'
        elif short_ma.iloc[-1] < long_ma.iloc[-1]:
            return 'sell'
        return 'hold'
```

## 错误处理

```python
try:
    data = yf.download('INVALID', start='2024-01-01')
    if data.empty:
        raise ValueError("未下载到数据")
except Exception as e:
    print(f"下载数据时出错: {e}")
    # 优雅地处理错误
    data = None

# 上下文管理器（自动清理）
with open('trades.csv', 'w') as f:
    f.write('symbol,price,quantity\n')
    f.write('AAPL,150.0,100\n')
# 文件自动关闭
```

## 最佳实践

### 1. 使用类型提示

```python
from typing import List, Dict, Optional

def calculate_returns(prices: List[float]) -> List[float]:
    """从价格列表计算收益率。"""
    return [(prices[i] - prices[i-1]) / prices[i-1]
            for i in range(1, len(prices))]
```

### 2. 编写文档字符串

```python
def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """
    计算夏普比率。

    参数：
    -----------
    returns : pd.Series
        收益率序列
    risk_free_rate : float
        年化无风险利率（默认：0.02）

    返回：
    --------
    float
        夏普比率
    """
    excess_returns = returns - risk_free_rate / 252
    return np.sqrt(252) * excess_returns.mean() / excess_returns.std()
```

### 3. 使用列表/字典推导式

```python
# 而不是：
squares = []
for x in range(10):
    squares.append(x**2)

# 使用：
squares = [x**2 for x in range(10)]

# 字典推导式
price_dict = {symbol: get_price(symbol) for symbol in ['AAPL', 'GOOGL']}
```

### 4. 利用 Pandas 向量化

```python
# 慢（循环）：
for i in range(len(data)):
    data.loc[i, 'return'] = (data.loc[i, 'close'] - data.loc[i-1, 'close']) / data.loc[i-1, 'close']

# 快（向量化）：
data['return'] = data['close'].pct_change()
```

## 快速参考

### 常见操作

```python
# 读取 CSV
data = pd.read_csv('prices.csv', index_col='date', parse_dates=True)

# 写入 CSV
data.to_csv('output.csv')

# 过滤数据
recent_data = data[data.index > '2024-01-01']

# 分组
monthly_returns = data.groupby(pd.Grouper(freq='M'))['returns'].sum()

# 合并数据框
combined = pd.merge(df1, df2, on='date', how='inner')

# 处理缺失数据
data.fillna(method='ffill', inplace=True)  # 前向填充
data.dropna(inplace=True)  # 删除 NaN 行
```

## 下一步

1. 通过模块 1 中的练习练习这些概念
2. 构建简单的脚本来下载和分析数据
3. 实现基本指标
4. 创建您的第一个简单策略

## 资源

- [官方 Python 教程](https://docs.python.org/3/tutorial/)
- [Pandas 文档](https://pandas.pydata.org/docs/)
- [NumPy 文档](https://numpy.org/doc/)
- [Real Python](https://realpython.com/) - 优秀的教程

---

**记住**：您不需要成为 Python 专家就可以开始交易。边学边做，首先专注于与交易相关的概念。
