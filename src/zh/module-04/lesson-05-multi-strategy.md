# 第4.5课：多策略方法 - 分散你的优势

**模块**：4 - 交易策略
**预计时间**：50分钟
**难度**：高级

## 🎯 学习目标

- 理解多策略交易的好处
- 学习策略相关性和分散化
- 实现策略组合
- 在策略间分配资金
- 监控和再平衡策略组合

## 📖 为什么使用多个策略？

**多策略方法**结合不同的交易策略以创造更稳定的回报。

### 好处

1. **减少回撤**：策略在不同条件下表现不同
2. **更平滑的权益曲线**：分散化降低波动性
3. **市场适应性**：始终有策略在运作
4. **风险管理**：不依赖单一方法

## 📊 策略组合

### 1. 趋势 + 均值回归

**概念**：趋势跟随用于趋势，均值回归用于区间

```python
class HybridStrategy:
    def __init__(self):
        self.trend_system = TrendFollowingSystem()
        self.mean_reversion_system = MeanReversionSystem()

    def determine_market_regime(self, df):
        """
        识别市场是趋势还是区间
        """
        # 计算ADX
        adx = self.calculate_adx(df)

        if adx > 25:
            return "TRENDING"
        else:
            return "RANGING"

    def generate_signal(self, df):
        """
        根据市场状态路由到适当的策略
        """
        regime = self.determine_market_regime(df)

        if regime == "TRENDING":
            return self.trend_system.generate_signal(df)
        else:
            return self.mean_reversion_system.generate_signal(df)
```

### 2. 多时间框架

**概念**：同时交易不同的时间框架

```python
def multi_timeframe_strategy(ticker):
    """
    结合日线、周线和月线信号
    """
    import yfinance as yf

    # 获取不同时间框架的数据
    daily = yf.Ticker(ticker).history(period="1y", interval="1d")
    weekly = yf.Ticker(ticker).history(period="2y", interval="1wk")
    monthly = yf.Ticker(ticker).history(period="5y", interval="1mo")

    # 计算每个时间框架的信号
    daily_signal = calculate_signal(daily, "short_term")
    weekly_signal = calculate_signal(weekly, "medium_term")
    monthly_signal = calculate_signal(monthly, "long_term")

    # 组合信号（按时间框架加权）
    combined_score = (daily_signal * 0.3 +
                     weekly_signal * 0.4 +
                     monthly_signal * 0.3)

    if combined_score > 0.5:
        return "BUY"
    elif combined_score < -0.5:
        return "SELL"
    else:
        return "HOLD"
```

### 3. 策略组合

**概念**：运行多个独立策略

```python
class StrategyPortfolio:
    def __init__(self, strategies, allocations):
        """
        strategies: 策略对象列表
        allocations: 策略 -> 分配百分比的字典
        """
        self.strategies = strategies
        self.allocations = allocations

    def generate_signals(self, df):
        """
        从所有策略获取信号
        """
        signals = {}

        for name, strategy in self.strategies.items():
            signal = strategy.generate_signal(df)
            signals[name] = signal

        return signals

    def calculate_position_size(self, total_capital, signals):
        """
        根据策略信号和分配比例分配资金
        """
        positions = {}

        for strategy_name, signal in signals.items():
            if signal in ["BUY", "SELL"]:
                allocation = self.allocations[strategy_name]
                capital_for_strategy = total_capital * allocation
                positions[strategy_name] = {
                    'signal': signal,
                    'capital': capital_for_strategy
                }

        return positions

# 使用示例
strategies = {
    'trend_following': TrendFollowingSystem(),
    'mean_reversion': MeanReversionSystem(),
    'momentum': MomentumSystem(),
    'breakout': BreakoutSystem()
}

allocations = {
    'trend_following': 0.30,
    'mean_reversion': 0.25,
    'momentum': 0.25,
    'breakout': 0.20
}

portfolio = StrategyPortfolio(strategies, allocations)
```

## 🎯 策略相关性分析

```python
def analyze_strategy_correlation(strategies, data, period="2y"):
    """
    计算策略回报之间的相关性
    """
    import pandas as pd
    import numpy as np

    # 获取每个策略的回报
    strategy_returns = {}

    for name, strategy in strategies.items():
        # 回测策略
        results = backtest_strategy(data, strategy)
        strategy_returns[name] = results['daily_returns']

    # 创建DataFrame
    returns_df = pd.DataFrame(strategy_returns)

    # 计算相关性矩阵
    correlation_matrix = returns_df.corr()

    print("策略相关性矩阵：")
    print(correlation_matrix)

    # 可视化
    import seaborn as sns
    import matplotlib.pyplot as plt

    plt.figure(figsize=(10, 8))
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('策略相关性矩阵')
    plt.show()

    return correlation_matrix
```

## 💰 资金分配

### 1. 等权重

```python
def equal_weight_allocation(strategies):
    """
    在所有策略间平均分配
    """
    n = len(strategies)
    return {name: 1/n for name in strategies.keys()}
```

### 2. 风险平价

```python
def risk_parity_allocation(strategies, returns_data):
    """
    基于逆波动率分配
    """
    import numpy as np

    # 计算每个策略的波动率
    volatilities = {}
    for name in strategies.keys():
        vol = np.std(returns_data[name]) * np.sqrt(252)
        volatilities[name] = vol

    # 逆波动率权重
    inv_vol = {name: 1/vol for name, vol in volatilities.items()}
    total_inv_vol = sum(inv_vol.values())

    # 归一化使总和为1
    allocations = {name: weight/total_inv_vol for name, weight in inv_vol.items()}

    return allocations
```

### 3. 基于绩效

```python
def performance_based_allocation(strategies, returns_data, lookback=60):
    """
    向表现更好的策略分配更多资金
    """
    # 计算每个策略的夏普比率
    sharpe_ratios = {}

    for name in strategies.keys():
        returns = returns_data[name].iloc[-lookback:]
        sharpe = returns.mean() / returns.std() * np.sqrt(252)
        sharpe_ratios[name] = max(sharpe, 0)  # 不允许负分配

    # 归一化
    total_sharpe = sum(sharpe_ratios.values())

    if total_sharpe > 0:
        allocations = {name: sharpe/total_sharpe for name, sharpe in sharpe_ratios.items()}
    else:
        # 如果全部为负，回退到等权重
        allocations = equal_weight_allocation(strategies)

    return allocations
```

## 📊 组合再平衡

```python
class StrategyRebalancer:
    def __init__(self, rebalance_frequency='monthly'):
        self.rebalance_frequency = rebalance_frequency
        self.last_rebalance = None

    def should_rebalance(self, current_date):
        """
        检查是否到了再平衡时间
        """
        if self.last_rebalance is None:
            return True

        if self.rebalance_frequency == 'daily':
            return True
        elif self.rebalance_frequency == 'weekly':
            return (current_date - self.last_rebalance).days >= 7
        elif self.rebalance_frequency == 'monthly':
            return (current_date - self.last_rebalance).days >= 30
        elif self.rebalance_frequency == 'quarterly':
            return (current_date - self.last_rebalance).days >= 90

        return False

    def rebalance_portfolio(self, current_allocations, target_allocations, total_capital):
        """
        再平衡到目标分配
        """
        trades = {}

        for strategy, target_pct in target_allocations.items():
            current_pct = current_allocations.get(strategy, 0)
            target_capital = total_capital * target_pct
            current_capital = total_capital * current_pct

            difference = target_capital - current_capital

            if abs(difference) > total_capital * 0.05:  # 5%阈值
                trades[strategy] = difference

        return trades
```

## 🎯 完整的多策略系统

```python
class MultiStrategySystem:
    def __init__(self, strategies, allocation_method='risk_parity'):
        self.strategies = strategies
        self.allocation_method = allocation_method
        self.allocations = {}
        self.performance_history = {name: [] for name in strategies.keys()}

    def update_allocations(self, returns_data):
        """
        根据方法更新策略分配
        """
        if self.allocation_method == 'equal_weight':
            self.allocations = equal_weight_allocation(self.strategies)

        elif self.allocation_method == 'risk_parity':
            self.allocations = risk_parity_allocation(self.strategies, returns_data)

        elif self.allocation_method == 'performance_based':
            self.allocations = performance_based_allocation(self.strategies, returns_data)

        return self.allocations

    def execute_strategies(self, df, total_capital):
        """
        执行所有策略并组合结果
        """
        positions = {}

        for name, strategy in self.strategies.items():
            signal = strategy.generate_signal(df)

            if signal in ["BUY", "SELL"]:
                allocation = self.allocations.get(name, 0)
                capital = total_capital * allocation

                positions[name] = {
                    'signal': signal,
                    'capital': capital,
                    'strategy': strategy
                }

        return positions

    def calculate_portfolio_metrics(self):
        """
        计算整体组合绩效
        """
        # 组合所有策略的回报
        total_returns = []

        for name, returns in self.performance_history.items():
            allocation = self.allocations.get(name, 0)
            weighted_returns = [r * allocation for r in returns]
            total_returns.append(weighted_returns)

        # 跨策略求和
        portfolio_returns = [sum(x) for x in zip(*total_returns)]

        # 计算指标
        total_return = (1 + sum(portfolio_returns)) - 1
        volatility = np.std(portfolio_returns) * np.sqrt(252)
        sharpe = (np.mean(portfolio_returns) / np.std(portfolio_returns)) * np.sqrt(252)

        return {
            'total_return': total_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe
        }
```

## 📈 监控和调整

```python
def monitor_strategy_performance(portfolio, lookback=30):
    """
    监控单个策略绩效
    """
    for name, strategy in portfolio.strategies.items():
        recent_returns = portfolio.performance_history[name][-lookback:]

        if len(recent_returns) >= lookback:
            # 计算指标
            win_rate = len([r for r in recent_returns if r > 0]) / len(recent_returns)
            avg_return = np.mean(recent_returns)
            sharpe = (np.mean(recent_returns) / np.std(recent_returns)) * np.sqrt(252)

            print(f"\n{name}:")
            print(f"  胜率: {win_rate:.2%}")
            print(f"  平均回报: {avg_return:.4f}")
            print(f"  夏普比率: {sharpe:.2f}")

            # 如果表现不佳则发出警报
            if sharpe < 0.5:
                print(f"  ⚠️  警告: {name} 表现不佳！")
```

## ⚠️ 常见陷阱

1. **过度分散**：太多策略会稀释回报
2. **策略重叠**：相似的策略 = 没有真正分散
3. **忽略相关性**：策略同向移动 = 没有好处
4. **复杂性**：难以管理和调试
5. **过度优化**：拟合历史数据

## 🎓 检查你的理解

1. 为什么使用多个策略？
2. 什么是策略相关性？
3. 如何在策略间分配资金？
4. 何时应该再平衡？
5. 什么是风险平价分配？

## 💻 练习

```python
# 构建多策略系统
strategies = {
    'trend': TrendFollowingSystem(),
    'mean_rev': MeanReversionSystem(),
    'momentum': MomentumSystem()
}

system = MultiStrategySystem(strategies, allocation_method='risk_parity')

# 回测
results = backtest_multi_strategy(system, initial_capital=100000)
print(f"组合夏普比率: {results['sharpe_ratio']:.2f}")
```

## 📝 练习4.5

创建：`exercises/module-04/exercise-4.5-multi-strategy.md`

1. 实现3个不同的策略
2. 计算它们之间的相关性
3. 测试不同的分配方法
4. 比较单策略与多策略绩效
5. 记录最优组合

## 📚 资源

- [Investopedia: Multi-Strategy](https://www.investopedia.com/terms/m/multi-strategy-fund.asp)
- [Portfolio Visualizer](https://www.portfoliovisualizer.com/)

## ✅ 答案

1. **多个策略**：减少回撤，更平滑的回报，适应不同市场条件，分散风险
2. **策略相关性**：策略如何一起移动；希望低/负相关性以实现分散化
3. **资金分配**：等权重、风险平价（逆波动率）、基于绩效或优化
4. **再平衡时机**：每月/每季度，或当分配偏离目标>5%时
5. **风险平价**：与波动率成反比分配；低波动率策略获得更多资金以实现相等的风险贡献

---

**下一课**：[第4.6课：策略设计原则](lesson-06-design.md)
