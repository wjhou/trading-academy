# 第6.6课：蒙特卡洛模拟

## 学习目标

完成本课后，你将能够：
- 理解蒙特卡洛模拟及其在交易中的应用
- 实现用于策略评估的蒙特卡洛分析
- 评估不同结果的概率
- 计算性能指标的置信区间
- 使用蒙特卡洛对交易策略进行压力测试

## 引言

蒙特卡洛模拟是一种强大的技术，使用随机采样来理解交易策略可能结果的范围。与依赖单一回测结果不同，蒙特卡洛分析生成数千种可能的场景来回答以下问题：

- 20%回撤的概率是多少？
- 我可以以95%的置信度期待什么范围的收益？
- 我实现利润目标的可能性有多大？
- 我应该为最坏情况做什么准备？

这种概率方法比单独的确定性回测提供了更完整的策略风险和潜在结果图景。

## 蒙特卡洛模拟的类型

### 1. 交易重采样

随机重新排序历史交易以生成替代权益曲线：

```python
import numpy as np
import pandas as pd
from typing import List, Dict
import matplotlib.pyplot as plt

def monte_carlo_trade_resampling(trades: List[float],
                                initial_capital: float = 100000,
                                n_simulations: int = 1000) -> Dict:
    """
    通过重采样交易进行蒙特卡洛模拟。

    参数：
    -----------
    trades : List[float]
        交易盈亏列表
    initial_capital : float
        起始资本
    n_simulations : int
        模拟次数

    返回：
    --------
    Dict : 模拟结果
    """
    print(f"运行 {n_simulations} 次蒙特卡洛模拟...")

    equity_curves = []
    final_values = []
    max_drawdowns = []
    sharpe_ratios = []

    for sim in range(n_simulations):
        # 随机重采样交易（有放回）
        resampled_trades = np.random.choice(trades, size=len(trades), replace=True)

        # 计算权益曲线
        capital = initial_capital
        equity = [capital]

        for trade in resampled_trades:
            capital += trade
            equity.append(capital)

        equity_curves.append(equity)
        final_values.append(capital)

        # 计算最大回撤
        equity_array = np.array(equity)
        running_max = np.maximum.accumulate(equity_array)
        drawdowns = (running_max - equity_array) / running_max
        max_dd = np.max(drawdowns)
        max_drawdowns.append(max_dd)

        # 计算夏普比率
        returns = pd.Series(equity).pct_change().dropna()
        if returns.std() > 0:
            sharpe = np.sqrt(252) * (returns.mean() / returns.std())
        else:
            sharpe = 0
        sharpe_ratios.append(sharpe)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'sharpe_ratios': sharpe_ratios,
        'initial_capital': initial_capital
    }


def analyze_monte_carlo_results(results: Dict) -> Dict:
    """
    分析蒙特卡洛模拟结果。

    参数：
    -----------
    results : Dict
        蒙特卡洛结果

    返回：
    --------
    Dict : 统计分析
    """
    final_values = np.array(results['final_values'])
    max_drawdowns = np.array(results['max_drawdowns'])
    sharpe_ratios = np.array(results['sharpe_ratios'])
    initial_capital = results['initial_capital']

    # 计算收益
    returns = (final_values - initial_capital) / initial_capital

    analysis = {
        # 收益统计
        'mean_return': np.mean(returns),
        'median_return': np.median(returns),
        'std_return': np.std(returns),
        'return_5th_percentile': np.percentile(returns, 5),
        'return_95th_percentile': np.percentile(returns, 95),

        # 最终价值统计
        'mean_final_value': np.mean(final_values),
        'median_final_value': np.median(final_values),
        'final_value_5th': np.percentile(final_values, 5),
        'final_value_95th': np.percentile(final_values, 95),

        # 回撤统计
        'mean_max_dd': np.mean(max_drawdowns),
        'median_max_dd': np.median(max_drawdowns),
        'max_dd_95th_percentile': np.percentile(max_drawdowns, 95),

        # 夏普统计
        'mean_sharpe': np.mean(sharpe_ratios),
        'median_sharpe': np.median(sharpe_ratios),

        # 概率指标
        'prob_profit': np.sum(returns > 0) / len(returns),
        'prob_loss': np.sum(returns < 0) / len(returns),
        'prob_dd_over_20': np.sum(max_drawdowns > 0.20) / len(max_drawdowns),
        'prob_dd_over_30': np.sum(max_drawdowns > 0.30) / len(max_drawdowns),
    }

    return analysis


def plot_monte_carlo_results(results: Dict, analysis: Dict):
    """
    绘制蒙特卡洛模拟结果。

    参数：
    -----------
    results : Dict
        蒙特卡洛结果
    analysis : Dict
        统计分析
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))

    # 图1: 权益曲线
    ax1 = axes[0, 0]
    equity_curves = results['equity_curves']

    # 绘制权益曲线样本
    sample_size = min(100, len(equity_curves))
    sample_indices = np.random.choice(len(equity_curves), sample_size, replace=False)

    for idx in sample_indices:
        ax1.plot(equity_curves[idx], alpha=0.1, color='blue')

    # 绘制平均权益曲线
    mean_equity = np.mean(equity_curves, axis=0)
    ax1.plot(mean_equity, color='red', linewidth=2, label='平均')

    # 绘制百分位数
    percentile_5 = np.percentile(equity_curves, 5, axis=0)
    percentile_95 = np.percentile(equity_curves, 95, axis=0)
    ax1.plot(percentile_5, color='orange', linewidth=2, linestyle='--', label='第5百分位')
    ax1.plot(percentile_95, color='green', linewidth=2, linestyle='--', label='第95百分位')

    ax1.axhline(y=results['initial_capital'], color='black', linestyle='--', alpha=0.5)
    ax1.set_xlabel('交易编号')
    ax1.set_ylabel('投资组合价值（$）')
    ax1.set_title('蒙特卡洛权益曲线', fontsize=12, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # 图2: 最终价值分布
    ax2 = axes[0, 1]
    final_values = results['final_values']
    ax2.hist(final_values, bins=50, alpha=0.7, edgecolor='black')
    ax2.axvline(x=analysis['mean_final_value'], color='red', linestyle='--',
               linewidth=2, label=f"平均: ${analysis['mean_final_value']:,.0f}")
    ax2.axvline(x=analysis['final_value_5th'], color='orange', linestyle='--',
               linewidth=2, label=f"第5: ${analysis['final_value_5th']:,.0f}")
    ax2.axvline(x=analysis['final_value_95th'], color='green', linestyle='--',
               linewidth=2, label=f"第95: ${analysis['final_value_95th']:,.0f}")
    ax2.set_xlabel('最终投资组合价值（$）')
    ax2.set_ylabel('频率')
    ax2.set_title('最终价值分布', fontsize=12, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3, axis='y')

    # 图3: 最大回撤分布
    ax3 = axes[1, 0]
    max_drawdowns = results['max_drawdowns']
    ax3.hist(max_drawdowns * 100, bins=50, alpha=0.7, edgecolor='black', color='red')
    ax3.axvline(x=analysis['mean_max_dd'] * 100, color='darkred', linestyle='--',
               linewidth=2, label=f"平均: {analysis['mean_max_dd']:.1%}")
    ax3.axvline(x=analysis['max_dd_95th_percentile'] * 100, color='orange', linestyle='--',
               linewidth=2, label=f"第95: {analysis['max_dd_95th_percentile']:.1%}")
    ax3.set_xlabel('最大回撤（%）')
    ax3.set_ylabel('频率')
    ax3.set_title('最大回撤分布', fontsize=12, fontweight='bold')
    ax3.legend()
    ax3.grid(True, alpha=0.3, axis='y')

    # 图4: 收益分布
    ax4 = axes[1, 1]
    returns = (np.array(final_values) - results['initial_capital']) / results['initial_capital']
    ax4.hist(returns * 100, bins=50, alpha=0.7, edgecolor='black', color='green')
    ax4.axvline(x=0, color='red', linestyle='-', linewidth=2)
    ax4.axvline(x=analysis['mean_return'] * 100, color='darkgreen', linestyle='--',
               linewidth=2, label=f"平均: {analysis['mean_return']:.1%}")
    ax4.set_xlabel('收益（%）')
    ax4.set_ylabel('频率')
    ax4.set_title('收益分布', fontsize=12, fontweight='bold')
    ax4.legend()
    ax4.grid(True, alpha=0.3, axis='y')

    plt.tight_layout()
    plt.show()


def print_monte_carlo_analysis(analysis: Dict):
    """打印蒙特卡洛分析结果。"""
    print("\n" + "=" * 70)
    print("蒙特卡洛模拟分析")
    print("=" * 70)

    print("\n收益统计")
    print("-" * 70)
    print(f"平均收益:           {analysis['mean_return']:+.2%}")
    print(f"中位数收益:         {analysis['median_return']:+.2%}")
    print(f"标准差:               {analysis['std_return']:.2%}")
    print(f"第5百分位:        {analysis['return_5th_percentile']:+.2%}")
    print(f"第95百分位:       {analysis['return_95th_percentile']:+.2%}")

    print("\n最终价值统计")
    print("-" * 70)
    print(f"平均最终价值:      ${analysis['mean_final_value']:,.2f}")
    print(f"中位数最终价值:    ${analysis['median_final_value']:,.2f}")
    print(f"第5百分位:        ${analysis['final_value_5th']:,.2f}")
    print(f"第95百分位:       ${analysis['final_value_95th']:,.2f}")

    print("\n回撤统计")
    print("-" * 70)
    print(f"平均最大回撤:     {analysis['mean_max_dd']:.2%}")
    print(f"中位数最大回撤:   {analysis['median_max_dd']:.2%}")
    print(f"第95百分位回撤:    {analysis['max_dd_95th_percentile']:.2%}")

    print("\n夏普比率统计")
    print("-" * 70)
    print(f"平均夏普比率:     {analysis['mean_sharpe']:.2f}")
    print(f"中位数夏普比率:   {analysis['median_sharpe']:.2f}")

    print("\n概率指标")
    print("-" * 70)
    print(f"盈利概率:     {analysis['prob_profit']:.1%}")
    print(f"亏损概率:       {analysis['prob_loss']:.1%}")
    print(f"回撤 > 20%的概率:          {analysis['prob_dd_over_20']:.1%}")
    print(f"回撤 > 30%的概率:          {analysis['prob_dd_over_30']:.1%}")

    print("\n" + "=" * 70)
```

### 2. 收益重采样

重采样收益而不是交易：

```python
def monte_carlo_return_resampling(returns: pd.Series,
                                 initial_capital: float = 100000,
                                 n_simulations: int = 1000,
                                 n_periods: int = None) -> Dict:
    """
    通过重采样收益进行蒙特卡洛模拟。

    参数：
    -----------
    returns : pd.Series
        历史收益
    initial_capital : float
        起始资本
    n_simulations : int
        模拟次数
    n_periods : int, optional
        要模拟的时期数（默认：收益长度）

    返回：
    --------
    Dict : 模拟结果
    """
    if n_periods is None:
        n_periods = len(returns)

    print(f"运行 {n_simulations} 次收益重采样模拟...")

    equity_curves = []
    final_values = []
    max_drawdowns = []

    for sim in range(n_simulations):
        # 随机重采样收益
        resampled_returns = np.random.choice(returns.dropna(), size=n_periods, replace=True)

        # 计算权益曲线
        equity = initial_capital * (1 + pd.Series(resampled_returns)).cumprod()
        equity = pd.concat([pd.Series([initial_capital]), equity]).reset_index(drop=True)

        equity_curves.append(equity.values)
        final_values.append(equity.iloc[-1])

        # 计算最大回撤
        running_max = equity.expanding().max()
        drawdowns = (equity - running_max) / running_max
        max_dd = abs(drawdowns.min())
        max_drawdowns.append(max_dd)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'initial_capital': initial_capital
    }
```

### 3. 参数化模拟

从统计分布生成收益：

```python
def monte_carlo_parametric(mean_return: float,
                          std_return: float,
                          initial_capital: float = 100000,
                          n_periods: int = 252,
                          n_simulations: int = 1000) -> Dict:
    """
    使用参数化方法进行蒙特卡洛模拟。

    参数：
    -----------
    mean_return : float
        平均日收益
    std_return : float
        日收益标准差
    initial_capital : float
        起始资本
    n_periods : int
        要模拟的时期数
    n_simulations : int
        模拟次数

    返回：
    --------
    Dict : 模拟结果
    """
    print(f"运行 {n_simulations} 次参数化模拟...")

    equity_curves = []
    final_values = []
    max_drawdowns = []

    for sim in range(n_simulations):
        # 从正态分布生成随机收益
        returns = np.random.normal(mean_return, std_return, n_periods)

        # 计算权益曲线
        equity = initial_capital * (1 + pd.Series(returns)).cumprod()
        equity = pd.concat([pd.Series([initial_capital]), equity]).reset_index(drop=True)

        equity_curves.append(equity.values)
        final_values.append(equity.iloc[-1])

        # 计算最大回撤
        running_max = equity.expanding().max()
        drawdowns = (equity - running_max) / running_max
        max_dd = abs(drawdowns.min())
        max_drawdowns.append(max_dd)

    return {
        'equity_curves': equity_curves,
        'final_values': final_values,
        'max_drawdowns': max_drawdowns,
        'initial_capital': initial_capital
    }
```

## 高级应用

### 1. 仓位规模优化

使用蒙特卡洛找到最优仓位大小：

```python
def optimize_position_size_monte_carlo(trades: List[float],
                                      initial_capital: float = 100000,
                                      position_sizes: List[float] = None,
                                      n_simulations: int = 1000) -> Dict:
    """
    使用蒙特卡洛优化仓位大小。

    参数：
    -----------
    trades : List[float]
        交易收益列表（作为分数）
    initial_capital : float
        起始资本
    position_sizes : List[float]
        要测试的仓位大小（作为资本的分数）
    n_simulations : int
        每个仓位大小的模拟次数

    返回：
    --------
    Dict : 优化结果
    """
    if position_sizes is None:
        position_sizes = [0.01, 0.02, 0.05, 0.10, 0.15, 0.20]

    results = {}

    for pos_size in position_sizes:
        print(f"测试仓位大小: {pos_size:.1%}")

        # 按仓位大小缩放交易
        scaled_trades = [t * pos_size * initial_capital for t in trades]

        # 运行蒙特卡洛
        mc_results = monte_carlo_trade_resampling(
            scaled_trades, initial_capital, n_simulations
        )

        analysis = analyze_monte_carlo_results(mc_results)

        results[pos_size] = {
            'mean_return': analysis['mean_return'],
            'std_return': analysis['std_return'],
            'mean_max_dd': analysis['mean_max_dd'],
            'sharpe': analysis['mean_sharpe'],
            'prob_profit': analysis['prob_profit']
        }

    return results


def plot_position_size_optimization(results: Dict):
    """绘制仓位大小优化结果。"""
    position_sizes = list(results.keys())
    mean_returns = [results[ps]['mean_return'] for ps in position_sizes]
    std_returns = [results[ps]['std_return'] for ps in position_sizes]
    max_dds = [results[ps]['mean_max_dd'] for ps in position_sizes]
    sharpes = [results[ps]['sharpe'] for ps in position_sizes]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # 平均收益 vs 仓位大小
    ax1 = axes[0, 0]
    ax1.plot([ps * 100 for ps in position_sizes], [r * 100 for r in mean_returns],
            'o-', linewidth=2, markersize=8)
    ax1.set_xlabel('仓位大小（%）')
    ax1.set_ylabel('平均收益（%）')
    ax1.set_title('平均收益 vs 仓位大小')
    ax1.grid(True, alpha=0.3)

    # 风险（标准差）vs 仓位大小
    ax2 = axes[0, 1]
    ax2.plot([ps * 100 for ps in position_sizes], [s * 100 for s in std_returns],
            'o-', linewidth=2, markersize=8, color='orange')
    ax2.set_xlabel('仓位大小（%）')
    ax2.set_ylabel('标准差（%）')
    ax2.set_title('风险 vs 仓位大小')
    ax2.grid(True, alpha=0.3)

    # 最大回撤 vs 仓位大小
    ax3 = axes[1, 0]
    ax3.plot([ps * 100 for ps in position_sizes], [dd * 100 for dd in max_dds],
            'o-', linewidth=2, markersize=8, color='red')
    ax3.set_xlabel('仓位大小（%）')
    ax3.set_ylabel('平均最大回撤（%）')
    ax3.set_title('回撤 vs 仓位大小')
    ax3.grid(True, alpha=0.3)

    # 夏普比率 vs 仓位大小
    ax4 = axes[1, 1]
    ax4.plot([ps * 100 for ps in position_sizes], sharpes,
            'o-', linewidth=2, markersize=8, color='green')
    ax4.set_xlabel('仓位大小（%）')
    ax4.set_ylabel('夏普比率')
    ax4.set_title('夏普比率 vs 仓位大小')
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
```

### 2. 置信区间

计算性能指标的置信区间：

```python
def calculate_confidence_intervals(results: Dict,
                                  confidence_level: float = 0.95) -> Dict:
    """
    从蒙特卡洛结果计算置信区间。

    参数：
    -----------
    results : Dict
        蒙特卡洛结果
    confidence_level : float
        置信水平（例如，0.95表示95%）

    返回：
    --------
    Dict : 置信区间
    """
    alpha = 1 - confidence_level
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100

    final_values = np.array(results['final_values'])
    initial_capital = results['initial_capital']
    returns = (final_values - initial_capital) / initial_capital

    max_drawdowns = np.array(results['max_drawdowns'])

    ci = {
        'confidence_level': confidence_level,
        'return_ci': (
            np.percentile(returns, lower_percentile),
            np.percentile(returns, upper_percentile)
        ),
        'final_value_ci': (
            np.percentile(final_values, lower_percentile),
            np.percentile(final_values, upper_percentile)
        ),
        'max_dd_ci': (
            np.percentile(max_drawdowns, lower_percentile),
            np.percentile(max_drawdowns, upper_percentile)
        )
    }

    return ci


def print_confidence_intervals(ci: Dict):
    """打印置信区间。"""
    print(f"\n{ci['confidence_level']:.0%} 置信区间")
    print("-" * 70)
    print(f"收益:       {ci['return_ci'][0]:+.2%} 到 {ci['return_ci'][1]:+.2%}")
    print(f"最终价值:  ${ci['final_value_ci'][0]:,.2f} 到 ${ci['final_value_ci'][1]:,.2f}")
    print(f"最大回撤: {ci['max_dd_ci'][0]:.2%} 到 {ci['max_dd_ci'][1]:.2%}")
```

## 使用示例

```python
def example_monte_carlo():
    """
    综合蒙特卡洛模拟示例。
    """
    import yfinance as yf

    print("蒙特卡洛模拟示例")
    print("=" * 70)

    # 下载数据并运行简单回测
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # 计算简单的MA交叉收益
    data['MA_Short'] = data['Close'].rolling(20).mean()
    data['MA_Long'] = data['Close'].rolling(50).mean()
    data['Signal'] = (data['MA_Short'] > data['MA_Long']).astype(int)

    returns = data['Close'].pct_change()
    strategy_returns = returns * data['Signal'].shift(1)
    strategy_returns = strategy_returns.dropna()

    # 模拟交易（分组连续信号）
    trades = []
    current_trade = 0

    for ret in strategy_returns:
        if ret != 0:
            current_trade += ret
        else:
            if current_trade != 0:
                trades.append(current_trade * 100000)  # 缩放到美元金额
                current_trade = 0

    if current_trade != 0:
        trades.append(current_trade * 100000)

    print(f"从回测生成 {len(trades)} 笔交易")

    # 运行蒙特卡洛模拟
    mc_results = monte_carlo_trade_resampling(
        trades=trades,
        initial_capital=100000,
        n_simulations=1000
    )

    # 分析结果
    analysis = analyze_monte_carlo_results(mc_results)
    print_monte_carlo_analysis(analysis)

    # 计算置信区间
    ci = calculate_confidence_intervals(mc_results, confidence_level=0.95)
    print_confidence_intervals(ci)

    # 绘制结果
    plot_monte_carlo_results(mc_results, analysis)


if __name__ == "__main__":
    example_monte_carlo()
```

## 最佳实践

1. **使用足够的模拟**：至少1,000次模拟，最好10,000次
2. **选择适当的方法**：离散策略使用交易重采样，连续策略使用收益重采样
3. **考虑假设**：蒙特卡洛假设过去的模式会继续
4. **与其他方法结合**：与前进分析一起使用
5. **关注风险指标**：注意回撤概率
6. **设定现实预期**：使用置信区间，而不仅仅是平均值
7. **测试敏感性**：改变假设并查看结果如何变化

## 练习

### 练习1：基本蒙特卡洛

对50笔交易列表运行蒙特卡洛模拟。计算：
- 最终价值的95%置信区间
- 20%回撤的概率
- 平均和中位数收益

### 练习2：方法比较

在同一策略上比较交易重采样 vs 收益重采样 vs 参数化模拟。结果有何不同？

### 练习3：仓位规模

使用蒙特卡洛为策略找到最优仓位大小。测试从资本的1%到20%的大小。

### 练习4：风险评估

计算以下概率：
- 1年内亏损
- 经历30%回撤
- 实现20%收益

## 总结

蒙特卡洛模拟提供交易策略的概率分析：

- **交易重采样**：随机重新排序历史交易
- **收益重采样**：随机重采样收益
- **参数化**：从统计分布生成收益

主要好处：
- 理解可能结果的范围
- 计算置信区间
- 评估特定场景的概率
- 优化仓位规模
- 压力测试策略

使用蒙特卡洛：
- 设定现实预期
- 理解最坏情况
- 做出明智的风险管理决策
- 向利益相关者传达不确定性

记住：蒙特卡洛显示基于历史模式可能发生什么，而不是将会发生什么。市场的行为可能与过去不同。

## 下一步

在本模块的最终项目中，你将整合所有回测概念——正确的数据处理、性能指标、优化、前进分析和蒙特卡洛模拟——到一个综合的回测框架中。