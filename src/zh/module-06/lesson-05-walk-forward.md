# 第6.5课：前进分析

## 学习目标

完成本课后，你将能够：
- 理解前进分析的概念和好处
- 实现前进优化和测试
- 解释前进分析结果
- 使用前进测试识别稳健与过拟合策略
- 将前进分析应用于实际交易策略

## 引言

前进分析（WFA）是验证交易策略和避免过拟合的最强大技术之一。与简单的训练/测试分割不同，WFA模拟策略实际交易的方式——定期重新优化参数并在未见的未来数据上测试。

这种方法提供了策略在实盘交易中表现的现实估计，在实盘交易中，你会持续适应不断变化的市场条件，同时在新的、未见的数据上交易。

## 什么是前进分析？

前进分析将历史数据分成多个时期，并遵循以下过程：

1. **优化**样本内（IS）时期
2. **测试**样本外（OOS）时期
3. **向前滚动**到下一个时期
4. **重复**直到覆盖所有数据

```
数据: |----IS----|--OOS--|----IS----|--OOS--|----IS----|--OOS--|
      优化1      测试1    优化2      测试2    优化3      测试3
```

### 关键概念

- **样本内时期**：用于优化的训练数据
- **样本外时期**：测试数据（优化期间从未见过）
- **锚定与滚动**：IS窗口是增长还是保持固定
- **重新优化频率**：多久重新优化一次参数

## Python实现

让我们构建一个全面的前进分析框架：

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Callable
from dataclasses import dataclass
import matplotlib.pyplot as plt

@dataclass
class WFAResult:
    """单个前进时期的结果。"""
    period: int
    is_start: str
    is_end: str
    oos_start: str
    oos_end: str
    best_params: Dict
    is_performance: float
    oos_performance: float
    degradation: float


class WalkForwardAnalyzer:
    """
    前进分析框架。
    """

    def __init__(self,
                 data: pd.DataFrame,
                 strategy_func: Callable,
                 optimizer_func: Callable,
                 param_grid: Dict,
                 is_period_days: int = 252,
                 oos_period_days: int = 63,
                 anchored: bool = False,
                 metric: str = 'sharpe_ratio'):
        """
        初始化前进分析器。

        参数：
        -----------
        data : pd.DataFrame
            历史价格数据
        strategy_func : Callable
            要测试的策略函数
        optimizer_func : Callable
            优化函数
        param_grid : Dict
            优化的参数网格
        is_period_days : int
            样本内时期长度（天）
        oos_period_days : int
            样本外时期长度（天）
        anchored : bool
            如果为True，IS窗口增长；如果为False，它滚动
        metric : str
            要优化的性能指标
        """
        self.data = data
        self.strategy_func = strategy_func
        self.optimizer_func = optimizer_func
        self.param_grid = param_grid
        self.is_period_days = is_period_days
        self.oos_period_days = oos_period_days
        self.anchored = anchored
        self.metric = metric

        self.results: List[WFAResult] = []

    def run(self) -> List[WFAResult]:
        """
        运行前进分析。

        返回：
        --------
        List[WFAResult] : 每个时期的结果
        """
        print("开始前进分析")
        print("=" * 70)
        print(f"IS时期: {self.is_period_days} 天")
        print(f"OOS时期: {self.oos_period_days} 天")
        print(f"模式: {'锚定' if self.anchored else '滚动'}")
        print("=" * 70)

        # 计算时期数
        total_days = len(self.data)
        start_idx = self.is_period_days

        period = 1

        while start_idx + self.oos_period_days <= total_days:
            print(f"\n时期 {period}")
            print("-" * 70)

            # 定义IS时期
            if self.anchored:
                is_start_idx = 0
            else:
                is_start_idx = start_idx - self.is_period_days

            is_end_idx = start_idx
            is_data = self.data.iloc[is_start_idx:is_end_idx]

            # 定义OOS时期
            oos_start_idx = start_idx
            oos_end_idx = min(start_idx + self.oos_period_days, total_days)
            oos_data = self.data.iloc[oos_start_idx:oos_end_idx]

            print(f"IS:  {is_data.index[0].date()} 到 {is_data.index[-1].date()} ({len(is_data)} 天)")
            print(f"OOS: {oos_data.index[0].date()} 到 {oos_data.index[-1].date()} ({len(oos_data)} 天)")

            # 在IS数据上优化
            print("优化中...")
            opt_result = self.optimizer_func(
                is_data,
                self.strategy_func,
                self.param_grid,
                self.metric
            )

            best_params = opt_result['best_params']
            is_performance = opt_result['best_score']

            print(f"最佳参数: {best_params}")
            print(f"IS性能: {is_performance:.3f}")

            # 在OOS数据上测试
            print("在OOS数据上测试...")
            oos_result = self.strategy_func(oos_data, **best_params)
            oos_performance = oos_result.get(self.metric, 0)

            degradation = is_performance - oos_performance

            print(f"OOS性能: {oos_performance:.3f}")
            print(f"退化: {degradation:.3f} ({degradation/is_performance*100:.1f}%)")

            # 存储结果
            wfa_result = WFAResult(
                period=period,
                is_start=str(is_data.index[0].date()),
                is_end=str(is_data.index[-1].date()),
                oos_start=str(oos_data.index[0].date()),
                oos_end=str(oos_data.index[-1].date()),
                best_params=best_params,
                is_performance=is_performance,
                oos_performance=oos_performance,
                degradation=degradation
            )

            self.results.append(wfa_result)

            # 移动到下一个时期
            start_idx += self.oos_period_days
            period += 1

        print("\n" + "=" * 70)
        print("前进分析完成")
        print("=" * 70)

        return self.results

    def calculate_summary_statistics(self) -> Dict:
        """
        从WFA结果计算汇总统计。

        返回：
        --------
        Dict : 汇总统计
        """
        if not self.results:
            return {}

        is_scores = [r.is_performance for r in self.results]
        oos_scores = [r.oos_performance for r in self.results]
        degradations = [r.degradation for r in self.results]

        # 计算效率（OOS / IS）
        efficiencies = [oos / is_perf if is_perf != 0 else 0
                       for oos, is_perf in zip(oos_scores, is_scores)]

        summary = {
            'num_periods': len(self.results),
            'avg_is_performance': np.mean(is_scores),
            'avg_oos_performance': np.mean(oos_scores),
            'avg_degradation': np.mean(degradations),
            'avg_efficiency': np.mean(efficiencies),
            'std_oos_performance': np.std(oos_scores),
            'min_oos_performance': np.min(oos_scores),
            'max_oos_performance': np.max(oos_scores),
            'positive_oos_periods': sum(1 for s in oos_scores if s > 0),
            'negative_oos_periods': sum(1 for s in oos_scores if s <= 0)
        }

        return summary

    def print_summary(self):
        """打印WFA结果摘要。"""
        summary = self.calculate_summary_statistics()

        print("\n" + "=" * 70)
        print("前进分析摘要")
        print("=" * 70)

        print(f"\n时期数: {summary['num_periods']}")
        print(f"\n平均IS性能:  {summary['avg_is_performance']:.3f}")
        print(f"平均OOS性能: {summary['avg_oos_performance']:.3f}")
        print(f"平均退化:     {summary['avg_degradation']:.3f}")
        print(f"平均效率:      {summary['avg_efficiency']:.2%}")

        print(f"\nOOS性能统计:")
        print(f"  标准差:  {summary['std_oos_performance']:.3f}")
        print(f"  最小值:      {summary['min_oos_performance']:.3f}")
        print(f"  最大值:      {summary['max_oos_performance']:.3f}")

        print(f"\nOOS时期结果:")
        print(f"  正值: {summary['positive_oos_periods']}")
        print(f"  负值: {summary['negative_oos_periods']}")
        print(f"  胜率: {summary['positive_oos_periods']/summary['num_periods']:.1%}")

        print("\n" + "=" * 70)

        # 解释
        print("\n解释:")
        if summary['avg_efficiency'] > 0.7:
            print("✓ 良好: 策略显示稳健性能（效率 > 70%）")
        elif summary['avg_efficiency'] > 0.5:
            print("⚠ 中等: 一些性能退化（效率 50-70%）")
        else:
            print("✗ 差: 检测到显著过拟合（效率 < 50%）")

        if summary['positive_oos_periods'] / summary['num_periods'] > 0.7:
            print("✓ 良好: 一致的正OOS性能")
        else:
            print("⚠ 警告: OOS性能不一致")

    def plot_results(self):
        """绘制前进分析结果。"""
        if not self.results:
            print("没有结果可绘制")
            return

        fig, axes = plt.subplots(3, 1, figsize=(14, 10))

        periods = [r.period for r in self.results]
        is_scores = [r.is_performance for r in self.results]
        oos_scores = [r.oos_performance for r in self.results]
        degradations = [r.degradation for r in self.results]

        # 图1: IS vs OOS性能
        ax1 = axes[0]
        ax1.plot(periods, is_scores, 'o-', label='样本内', linewidth=2, markersize=8)
        ax1.plot(periods, oos_scores, 's-', label='样本外', linewidth=2, markersize=8)
        ax1.axhline(y=0, color='red', linestyle='--', alpha=0.5)
        ax1.set_ylabel('性能（夏普比率）')
        ax1.set_title('前进分析: IS vs OOS性能', fontsize=14, fontweight='bold')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 图2: 退化
        ax2 = axes[1]
        colors = ['red' if d > 0 else 'green' for d in degradations]
        ax2.bar(periods, degradations, color=colors, alpha=0.6)
        ax2.axhline(y=0, color='black', linestyle='-', linewidth=1)
        ax2.set_ylabel('退化')
        ax2.set_title('性能退化（IS - OOS）', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3, axis='y')

        # 图3: 效率
        ax3 = axes[2]
        efficiencies = [oos / is_perf * 100 if is_perf != 0 else 0
                       for oos, is_perf in zip(oos_scores, is_scores)]
        ax3.bar(periods, efficiencies, alpha=0.6, color='steelblue')
        ax3.axhline(y=100, color='green', linestyle='--', label='100%效率')
        ax3.axhline(y=70, color='orange', linestyle='--', label='70%阈值')
        ax3.set_xlabel('时期')
        ax3.set_ylabel('效率（%）')
        ax3.set_title('OOS效率（OOS / IS * 100%）', fontsize=14, fontweight='bold')
        ax3.legend()
        ax3.grid(True, alpha=0.3, axis='y')

        plt.tight_layout()
        plt.show()

    def plot_parameter_evolution(self, param_name: str):
        """
        绘制特定参数随时间的演化。

        参数：
        -----------
        param_name : str
            要绘制的参数名称
        """
        if not self.results:
            print("没有结果可绘制")
            return

        periods = [r.period for r in self.results]
        param_values = [r.best_params.get(param_name, np.nan) for r in self.results]

        plt.figure(figsize=(12, 6))
        plt.plot(periods, param_values, 'o-', linewidth=2, markersize=10)
        plt.xlabel('时期')
        plt.ylabel(f'{param_name} 值')
        plt.title(f'参数演化: {param_name}', fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)
        plt.show()


# 使用示例
def example_walk_forward():
    """
    演示前进分析。
    """
    import yfinance as yf

    print("前进分析示例")
    print("=" * 70)

    # 下载数据
    data = yf.download('AAPL', start='2018-01-01', end='2023-12-31', progress=False)

    # 定义策略函数
    def ma_crossover_strategy(data, ma_short, ma_long):
        """简单的MA交叉策略。"""
        data = data.copy()
        data['MA_Short'] = data['Close'].rolling(int(ma_short)).mean()
        data['MA_Long'] = data['Close'].rolling(int(ma_long)).mean()

        # 生成信号
        signals = data['MA_Short'] > data['MA_Long']

        # 计算收益
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        # 计算夏普比率
        if strategy_returns.std() == 0:
            sharpe = 0
        else:
            sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe, 'returns': strategy_returns}

    # 定义简单的网格搜索优化器
    def simple_optimizer(data, strategy_func, param_grid, metric):
        """简单的网格搜索优化器。"""
        from itertools import product

        param_names = list(param_grid.keys())
        param_values = list(param_grid.values())
        combinations = list(product(*param_values))

        best_score = -np.inf
        best_params = None

        for combo in combinations:
            params = dict(zip(param_names, combo))

            # 跳过无效组合
            if params['ma_short'] >= params['ma_long']:
                continue

            try:
                result = strategy_func(data, **params)
                score = result.get(metric, -np.inf)

                if score > best_score:
                    best_score = score
                    best_params = params
            except:
                continue

        return {'best_params': best_params, 'best_score': best_score}

    # 定义参数网格
    param_grid = {
        'ma_short': [10, 20, 30, 40],
        'ma_long': [50, 100, 150, 200]
    }

    # 运行前进分析
    wfa = WalkForwardAnalyzer(
        data=data,
        strategy_func=ma_crossover_strategy,
        optimizer_func=simple_optimizer,
        param_grid=param_grid,
        is_period_days=504,  # 2年
        oos_period_days=126,  # 6个月
        anchored=False,
        metric='sharpe_ratio'
    )

    results = wfa.run()

    # 打印摘要
    wfa.print_summary()

    # 绘制结果
    wfa.plot_results()

    # 绘制参数演化
    wfa.plot_parameter_evolution('ma_short')
    wfa.plot_parameter_evolution('ma_long')


if __name__ == "__main__":
    example_walk_forward()
```

## 解释WFA结果

### 关键指标

1. **平均OOS性能**：预期的实盘交易性能
2. **效率比率**：OOS / IS性能（应 > 70%）
3. **OOS一致性**：正OOS时期的百分比
4. **退化**：性能从IS到OOS下降多少

### 危险信号

- **高退化**：IS性能远好于OOS（过拟合）
- **低效率**：OOS < IS性能的50%
- **不一致的OOS**：许多负OOS时期
- **不稳定的参数**：参数在时期之间变化剧烈

### 良好迹象

- **一致的OOS**：大多数时期显示正性能
- **高效率**：OOS > IS性能的70%
- **稳定的参数**：参数不会剧烈变化
- **跨制度稳健**：在不同市场条件下有效

## 锚定与滚动窗口

### 锚定前进

IS窗口随时间增长：

```
时期1: |----IS----|--OOS--|
时期2: |--------IS--------|--OOS--|
时期3: |------------IS------------|--OOS--|
```

**优点：**
- 更多数据用于优化
- 捕获长期模式

**缺点：**
- 适应制度变化较慢
- 旧数据可能不相关

### 滚动前进

IS窗口保持固定：

```
时期1: |----IS----|--OOS--|
时期2:       |----IS----|--OOS--|
时期3:             |----IS----|--OOS--|
```

**优点：**
- 适应最近的市场条件
- 丢弃旧的、不相关的数据

**缺点：**
- 优化数据较少
- 可能错过长期模式

## 最佳实践

1. **选择适当的时期**：
   - IS：1-3年数据
   - OOS：3-6个月
   - 每季度或半年重新优化

2. **使用现实成本**：
   - 包括佣金和滑点
   - 考虑重新优化成本

3. **测试多种配置**：
   - 尝试不同的IS/OOS比率
   - 测试锚定和滚动
   - 比较结果

4. **监控参数稳定性**：
   - 参数不应剧烈变化
   - 稳定的参数表明稳健性

5. **要求最低性能**：
   - 设置最低OOS性能阈值
   - 拒绝持续失败的策略

6. **考虑交易成本**：
   - 频繁的重新优化可能改变参数
   - 参数变化可能需要再平衡

## 练习

### 练习1：基本WFA

为简单的RSI策略实现前进分析：
- IS时期：1年
- OOS时期：3个月
- 在SPY 2018-2023上测试

计算效率比率和OOS一致性。

### 练习2：锚定与滚动

在同一策略上比较锚定与滚动前进。哪个表现更好？为什么？

### 练习3：参数稳定性

分析WFA中参数随时间的演化。它们是稳定的还是不稳定的？这告诉你关于策略的什么？

### 练习4：制度分析

执行WFA并识别哪些市场制度（牛市/熊市/横盘）产生最佳/最差的OOS结果。

## 总结

前进分析是策略验证的黄金标准：

- **模拟真实交易**：在新数据上定期重新优化
- **检测过拟合**：差的OOS性能揭示过拟合策略
- **提供现实预期**：OOS结果估计实盘性能
- **测试适应性**：显示策略是否适应变化的市场

评估的关键指标：
- 平均OOS性能
- 效率比率（OOS/IS）
- OOS一致性
- 参数稳定性

一个好的策略应该显示：
- 效率 > 70%
- 一致的正OOS时期
- 稳定的参数
- 合理的退化

## 下一步

在下一课中，我们将探索蒙特卡洛模拟，这是一种强大的技术，用于理解可能结果的范围并在不确定性下评估策略稳健性。