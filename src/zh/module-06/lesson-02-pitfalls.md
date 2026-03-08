# 第6.2课：避免常见陷阱

## 学习目标

在本课结束时，你将能够：
- 识别并避免回测中的前视偏差
- 认识并减轻幸存者偏差
- 理解过拟合及如何预防
- 实现正确的数据处理以避免偏差
- 应用技术确保现实的回测结果

## 简介

回测陷阱可能导致绩效预期大幅膨胀，并在实盘交易中造成毁灭性损失。许多交易者开发的策略在回测中看起来很出色，但在真实资金交易时却惨败。理解并避免这些陷阱对于开发稳健、盈利的策略至关重要。

回测陷阱最危险的方面是它们通常产生看起来好得令人难以置信的结果——而它们确实如此。本课将帮助你识别并避免最常见的错误。

## 前视偏差

### 什么是前视偏差？

前视偏差发生在你的回测使用了在交易时不可用的信息时。这是最常见和最危险的陷阱之一。

### 常见示例

1. **使用未来价格**
```python
# 错误：使用下一根K线的收盘价入场
if data['Close'].iloc[i] > data['MA'].iloc[i]:
    entry_price = data['Close'].iloc[i+1]  # 未来数据！
```

2. **指标计算错误**
```python
# 错误：在整个数据集上计算MA
data['MA'] = data['Close'].rolling(20).mean()

# 正确：增量计算
for i in range(20, len(data)):
    data.loc[i, 'MA'] = data['Close'].iloc[i-20:i].mean()
```

3. **日内决策使用日终数据**
```python
# 错误：在发生之前使用当天的最高/最低价
if current_price < data['Low'].iloc[i]:  # 还不知道最低价！
    buy()
```

### 如何避免前视偏差

```python
import pandas as pd
import numpy as np
from typing import Dict

class BiasFreeBacktest:
    """
    防止前视偏差的回测框架。
    """

    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        self.current_index = 0

    def get_historical_data(self, lookback: int = None) -> pd.DataFrame:
        """
        仅获取到当前点的历史数据。

        参数：
        -----------
        lookback : int, 可选
            回看的K线数量

        返回：
        --------
        pd.DataFrame : 仅历史数据
        """
        if lookback is None:
            return self.data.iloc[:self.current_index + 1]
        else:
            start_idx = max(0, self.current_index - lookback + 1)
            return self.data.iloc[start_idx:self.current_index + 1]

    def calculate_indicator(self, indicator_func, *args, **kwargs):
        """
        仅使用历史数据计算指标。

        参数：
        -----------
        indicator_func : callable
            计算指标的函数
        """
        historical_data = self.get_historical_data()
        return indicator_func(historical_data, *args, **kwargs)

    def advance(self):
        """移动到下一根K线。"""
        self.current_index += 1

    def is_complete(self) -> bool:
        """检查回测是否完成。"""
        return self.current_index >= len(self.data) - 1


# 示例：正确的指标计算
def calculate_sma_properly(data: pd.DataFrame, period: int) -> float:
    """
    仅使用可用数据计算SMA。

    参数：
    -----------
    data : pd.DataFrame
        历史数据
    period : int
        SMA周期

    返回：
    --------
    float : SMA值
    """
    if len(data) < period:
        return np.nan

    return data['Close'].iloc[-period:].mean()


# 使用示例
def example_bias_free():
    """演示无偏差回测。"""
    import yfinance as yf

    # 下载数据
    data = yf.download('AAPL', start='2023-01-01', end='2023-12-31', progress=False)

    # 初始化无偏差回测
    backtest = BiasFreeBacktest(data)

    signals = []

    # 处理每根K线
    while not backtest.is_complete():
        # 仅使用历史数据计算指标
        sma_20 = backtest.calculate_indicator(calculate_sma_properly, 20)
        sma_50 = backtest.calculate_indicator(calculate_sma_properly, 50)

        # 生成信号
        if not np.isnan(sma_20) and not np.isnan(sma_50):
            if sma_20 > sma_50:
                signals.append('BUY')
            else:
                signals.append('SELL')
        else:
            signals.append('HOLD')

        backtest.advance()

    print(f"生成了{len(signals)}个无前视偏差的信号")
```

## 幸存者偏差

### 什么是幸存者偏差？

幸存者偏差发生在回测仅包括存活到现在的股票，排除了退市、破产或合并的公司时。这会大幅高估回报。

### 幸存者偏差的影响

研究表明幸存者偏差可能每年膨胀回报1-3%：
- 排除了最差的表现者（破产）
- 过度代表成功的公司
- 错过尾部风险

### 示例

```python
# 错误：使用当前标普500成分股
sp500_current = ['AAPL', 'MSFT', 'GOOGL', ...]  # 当前成员
# 从2000-2024年回测这些股票

# 正确：使用历史成分股
# 包括在每个时间点在标普500中的公司
# 包括退市公司
```

### 如何避免幸存者偏差

1. **使用无幸存者偏差的数据集**
```python
# 使用包含退市股票的数据集
# 示例：Norgate Data、CSI Data、Sharadar
```

2. **时点成分股**
```python
def get_historical_constituents(index: str, date: str) -> list:
    """
    获取特定日期的指数成分股。

    参数：
    -----------
    index : str
        指数名称（例如'SP500'）
    date : str
        YYYY-MM-DD格式的日期

    返回：
    --------
    list : 该日期在指数中的股票代码
    """
    # 查询数据库获取历史成分股
    # 包括退市股票
    pass
```

3. **承认局限性**
```python
# 如果使用有幸存者偏差的数据，记录下来
print("警告：此回测使用有幸存者偏差的数据")
print("预期绩效膨胀：每年1-3%")
print("相应调整预期")
```

## 过拟合

### 什么是过拟合？

过拟合发生在策略在历史数据上过度优化，捕获噪音而非真实模式时。策略在样本内表现良好但在样本外失败。

### 过拟合的迹象

1. **参数过多**：超过3-5个可优化参数
2. **完美回测**：胜率>80%，没有亏损期
3. **复杂规则**：数十个条件和例外
4. **样本外绩效差**：样本外结果急剧下降
5. **参数敏感**：小变化导致大的绩效波动

### 过拟合示例

```python
# 过拟合策略（不要这样做！）
def overfitted_strategy(data):
    """
    参数过多的过拟合策略示例。
    """
    # 在历史数据上优化的15个参数
    rsi_buy = 31.7  # 为什么是31.7而不是30？
    rsi_sell = 68.3
    ma_short = 17   # 为什么是17而不是20？
    ma_long = 43
    volume_threshold = 1.23
    atr_multiplier = 2.17
    # ... 还有9个参数

    # 复杂条件
    if (data['RSI'] < rsi_buy and
        data['MA_Short'] > data['MA_Long'] and
        data['Volume'] > data['Volume_MA'] * volume_threshold and
        data['ATR'] > data['ATR_MA'] * atr_multiplier and
        data['Close'] > data['Open'] and
        data['High'] < data['High'].shift(1) * 1.02):
        # ... 还有10个条件
        return 'BUY'

    return 'HOLD'
```

### 如何避免过拟合

1. **限制参数**
```python
# 好：参数少的简单策略
def simple_strategy(data, ma_short=20, ma_long=50):
    """
    只有2个参数的简单策略。
    """
    signals = pd.DataFrame(index=data.index)
    signals['entry'] = data['MA_Short'] > data['MA_Long']
    signals['exit'] = data['MA_Short'] < data['MA_Long']
    return signals
```

2. **使用前向分析**
```python
def walk_forward_test(data, optimize_period=252, test_period=63):
    """
    前向分析以防止过拟合。

    参数：
    -----------
    data : pd.DataFrame
        价格数据
    optimize_period : int
        样本内优化期（天）
    test_period : int
        样本外测试期（天）

    返回：
    --------
    list : 样本外结果
    """
    results = []
    start = optimize_period

    while start + test_period < len(data):
        # 样本内优化
        is_data = data.iloc[start - optimize_period:start]
        best_params = optimize_parameters(is_data)

        # 样本外测试
        oos_data = data.iloc[start:start + test_period]
        oos_result = test_strategy(oos_data, best_params)
        results.append(oos_result)

        # 向前滚动
        start += test_period

    return results
```

3. **交叉验证**
```python
def cross_validate_strategy(data, n_splits=5):
    """
    在不同时间段交叉验证策略。

    参数：
    -----------
    data : pd.DataFrame
        价格数据
    n_splits : int
        分割数量

    返回：
    --------
    list : 每个分割的结果
    """
    split_size = len(data) // n_splits
    results = []

    for i in range(n_splits):
        # 在分割i上测试，在其他上训练
        test_start = i * split_size
        test_end = (i + 1) * split_size

        test_data = data.iloc[test_start:test_end]
        train_data = pd.concat([
            data.iloc[:test_start],
            data.iloc[test_end:]
        ])

        # 在训练数据上优化
        params = optimize_parameters(train_data)

        # 在测试数据上测试
        result = test_strategy(test_data, params)
        results.append(result)

    return results
```

4. **正则化**
```python
def penalize_complexity(performance, num_parameters):
    """
    惩罚参数过多的策略。

    参数：
    -----------
    performance : float
        策略绩效指标
    num_parameters : int
        参数数量

    返回：
    --------
    float : 调整后的绩效
    """
    # 赤池信息准则（AIC）风格惩罚
    penalty = 2 * num_parameters
    adjusted_performance = performance - penalty

    return adjusted_performance
```

## 数据窥探偏差

### 什么是数据窥探？

数据窥探发生在你在同一数据集上测试多个策略并只报告最好的一个时。这会产生选择偏差。

### 示例

```python
# 错误：测试100个策略，只报告最好的
strategies = []
for i in range(100):
    strategy = generate_random_strategy()
    result = backtest(strategy, data)
    strategies.append((strategy, result))

# 只报告最好的
best_strategy = max(strategies, key=lambda x: x[1]['return'])
print(f"找到了惊人的策略，回报率{best_strategy[1]['return']:.2%}！")
# 这很可能只是运气！
```

### 如何避免数据窥探

1. **保留留出数据**
```python
# 将数据分为开发集和验证集
train_data = data.iloc[:int(len(data) * 0.7)]
validation_data = data.iloc[int(len(data) * 0.7):]

# 仅在train_data上开发策略
# 在validation_data上测试最终策略一次
```

2. **调整多重测试**
```python
def bonferroni_correction(p_value, num_tests):
    """
    调整多重测试的p值。

    参数：
    -----------
    p_value : float
        原始p值
    num_tests : int
        执行的测试数量

    返回：
    --------
    float : 调整后的p值
    """
    return min(p_value * num_tests, 1.0)
```

3. **记录所有测试**
```python
# 保留所有测试策略的日志
test_log = []

def test_strategy(strategy, data):
    result = backtest(strategy, data)

    # 记录每个测试
    test_log.append({
        'strategy': strategy,
        'result': result,
        'timestamp': datetime.now()
    })

    return result

# 报告："测试了47个策略，3个显示正面结果"
```

## 现实执行建模

### 常见执行假设

许多回测假设不现实的执行：

1. **无滑点**：以确切的信号价格成交
2. **即时成交**：信号和执行之间无延迟
3. **无限流动性**：可以交易任何规模
4. **无市场影响**：大订单不会移动价格

### 现实执行模型

```python
class RealisticExecution:
    """
    模拟现实订单执行。
    """

    def __init__(self,
                 commission: float = 0.001,
                 slippage_pct: float = 0.0005,
                 min_commission: float = 1.0):
        self.commission = commission
        self.slippage_pct = slippage_pct
        self.min_commission = min_commission

    def calculate_slippage(self,
                          price: float,
                          shares: int,
                          avg_volume: float,
                          direction: str) -> float:
        """
        基于订单规模和流动性计算滑点。

        参数：
        -----------
        price : float
            订单价格
        shares : int
            股数
        avg_volume : float
            平均日成交量
        direction : str
            'buy'或'sell'

        返回：
        --------
        float : 每股滑点金额
        """
        # 基础滑点
        base_slippage = price * self.slippage_pct

        # 市场影响（更大的订单有更大的影响）
        order_pct = shares / avg_volume
        impact_multiplier = 1 + (order_pct * 10)  # 成交量的10%有10倍影响

        total_slippage = base_slippage * impact_multiplier

        # 方向很重要
        if direction == 'buy':
            return total_slippage  # 买入时支付更多
        else:
            return -total_slippage  # 卖出时收到更少

    def execute_order(self,
                     price: float,
                     shares: int,
                     avg_volume: float,
                     direction: str) -> Dict:
        """
        以现实成本执行订单。

        返回：
        --------
        Dict : 执行详情
        """
        # 计算滑点
        slippage_per_share = self.calculate_slippage(
            price, shares, avg_volume, direction
        )

        # 执行价格
        if direction == 'buy':
            execution_price = price + abs(slippage_per_share)
        else:
            execution_price = price - abs(slippage_per_share)

        # 佣金
        commission = max(
            price * shares * self.commission,
            self.min_commission
        )

        # 总成本
        if direction == 'buy':
            total_cost = (execution_price * shares) + commission
        else:
            total_cost = (execution_price * shares) - commission

        return {
            'execution_price': execution_price,
            'slippage': slippage_per_share * shares,
            'commission': commission,
            'total_cost': total_cost
        }
```

## 最佳实践检查清单

### 数据质量
- [ ] 使用干净、调整后的价格数据
- [ ] 如可能包括无幸存者偏差的数据
- [ ] 验证数据的错误和缺口
- [ ] 记录数据来源和局限性

### 偏差预防
- [ ] 确保指标中无前视偏差
- [ ] 仅使用时点数据
- [ ] 实现正确的操作顺序
- [ ] 用现实执行假设测试

### 过拟合预防
- [ ] 限制参数数量（<5）
- [ ] 使用前向分析
- [ ] 保留留出数据
- [ ] 在不同市场状态下测试

### 执行现实性
- [ ] 基于流动性建模滑点
- [ ] 包括佣金和费用
- [ ] 考虑市场影响
- [ ] 考虑订单延迟

### 文档
- [ ] 记录所有假设
- [ ] 记录所有策略测试
- [ ] 记录已知局限性
- [ ] 报告现实预期

## 练习

### 练习1：检测前视偏差

审查此代码并识别前视偏差：

```python
def buggy_strategy(data):
    data['MA'] = data['Close'].rolling(20).mean()
    signals = []

    for i in range(len(data)):
        if data['Close'].iloc[i] > data['MA'].iloc[i]:
            # 在下一根K线的最低价买入
            entry = data['Low'].iloc[i+1]
            signals.append(('BUY', entry))

    return signals
```

修复偏差并正确实现。

### 练习2：测量过拟合

创建两个策略：
1. 简单：2个参数
2. 复杂：10个参数

在2020-2022数据上优化两者，在2023数据上测试。比较样本内与样本外绩效下降。

### 练习3：现实执行

实现包含以下内容的回测：
- 0.1%佣金
- 基于订单规模的滑点
- 每笔交易最低$1佣金

将结果与无成本回测比较。

### 练习4：前向分析

实现包含以下内容的前向分析：
- 1年优化窗口
- 3个月测试窗口
- 每月向前滚动

在2015-2023年的SPY上测试。

## 总结

避免回测陷阱对于开发在实盘交易中有效的策略至关重要。要避免的主要陷阱是：

1. **前视偏差**：仅使用决策时可用的历史数据
2. **幸存者偏差**：包括退市股票或承认偏差
3. **过拟合**：限制参数并使用样本外测试
4. **数据窥探**：保留留出数据并记录所有测试
5. **不现实的执行**：建模滑点、佣金和市场影响

记住：如果回测结果看起来好得令人难以置信，它们很可能确实如此。在测试中要持怀疑、保守和彻底的态度。

## 下一步

在下一课中，我们将探索全面的绩效指标，以正确评估策略质量，超越简单的回报，包括风险调整指标、回撤分析和统计显著性测试。