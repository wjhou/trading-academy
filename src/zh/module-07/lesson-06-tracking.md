# 第7.6课：性能跟踪

## 学习目标

在本课结束时，你将能够：
- 实时跟踪交易系统性能
- 计算关键性能指标
- 比较实盘与回测性能
- 识别性能退化
- 生成性能报告

## 简介

性能跟踪对于了解交易系统在实盘市场中的表现至关重要。本课涵盖跟踪、分析和报告系统性能。

## 实时性能跟踪器

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class PerformanceSnapshot:
    """某个时间点的性能快照。"""
    timestamp: datetime
    total_value: float
    cash: float
    positions_value: float
    daily_pnl: float
    total_pnl: float
    num_trades: int
    win_rate: float
    sharpe_ratio: float
    max_drawdown: float

class PerformanceTracker:
    """
    实时跟踪交易系统性能。
    """

    def __init__(self, initial_capital: float):
        """
        初始化性能跟踪器。

        参数：
        -----------
        initial_capital : float
            起始资金
        """
        self.initial_capital = initial_capital
        self.equity_curve = [initial_capital]
        self.equity_dates = [datetime.now()]
        self.trades = []
        self.daily_returns = []

    def update(self, portfolio_value: float, trades: List[Dict] = None):
        """
        更新性能指标。

        参数：
        -----------
        portfolio_value : float
            当前投资组合价值
        trades : List[Dict], optional
            自上次更新以来的新交易
        """
        now = datetime.now()

        # 更新权益曲线
        self.equity_curve.append(portfolio_value)
        self.equity_dates.append(now)

        # 更新交易
        if trades:
            self.trades.extend(trades)

        # 计算日收益率
        if len(self.equity_curve) > 1:
            daily_return = (portfolio_value - self.equity_curve[-2]) / self.equity_curve[-2]
            self.daily_returns.append(daily_return)

    def get_current_metrics(self) -> Dict:
        """
        获取当前性能指标。

        返回：
        --------
        Dict : 性能指标
        """
        if len(self.equity_curve) < 2:
            return {}

        current_value = self.equity_curve[-1]

        # 总收益率
        total_return = (current_value - self.initial_capital) / self.initial_capital

        # 计算收益率
        returns = pd.Series(self.equity_curve).pct_change().dropna()

        # 夏普比率
        if len(returns) > 0 and returns.std() > 0:
            sharpe = np.sqrt(252) * (returns.mean() / returns.std())
        else:
            sharpe = 0

        # 最大回撤
        equity_array = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity_array)
        drawdowns = (running_max - equity_array) / running_max
        max_dd = np.max(drawdowns)

        # 交易统计
        if self.trades:
            winning_trades = [t for t in self.trades if t.get('pnl', 0) > 0]
            win_rate = len(winning_trades) / len(self.trades)

            total_pnl = sum(t.get('pnl', 0) for t in self.trades)
        else:
            win_rate = 0
            total_pnl = 0

        return {
            'current_value': current_value,
            'total_return': total_return,
            'total_pnl': total_pnl,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_dd,
            'num_trades': len(self.trades),
            'win_rate': win_rate,
            'days_trading': len(self.equity_curve) - 1
        }

    def get_snapshot(self, cash: float, positions_value: float) -> PerformanceSnapshot:
        """
        获取性能快照。

        参数：
        -----------
        cash : float
            当前现金
        positions_value : float
            当前持仓价值

        返回：
        --------
        PerformanceSnapshot : 当前快照
        """
        metrics = self.get_current_metrics()
        total_value = cash + positions_value

        # 日盈亏
        if len(self.equity_curve) > 1:
            daily_pnl = total_value - self.equity_curve[-2]
        else:
            daily_pnl = 0

        return PerformanceSnapshot(
            timestamp=datetime.now(),
            total_value=total_value,
            cash=cash,
            positions_value=positions_value,
            daily_pnl=daily_pnl,
            total_pnl=metrics.get('total_pnl', 0),
            num_trades=metrics.get('num_trades', 0),
            win_rate=metrics.get('win_rate', 0),
            sharpe_ratio=metrics.get('sharpe_ratio', 0),
            max_drawdown=metrics.get('max_drawdown', 0)
        )
```

## 实盘与回测比较

```python
class PerformanceComparator:
    """
    比较实盘性能与回测。
    """

    def __init__(self, backtest_results: Dict):
        """
        初始化比较器。

        参数：
        -----------
        backtest_results : Dict
            回测性能指标
        """
        self.backtest_results = backtest_results

    def compare(self, live_metrics: Dict) -> Dict:
        """
        比较实盘与回测性能。

        参数：
        -----------
        live_metrics : Dict
            实盘性能指标

        返回：
        --------
        Dict : 比较结果
        """
        comparison = {}

        metrics_to_compare = [
            'total_return',
            'sharpe_ratio',
            'max_drawdown',
            'win_rate'
        ]

        for metric in metrics_to_compare:
            backtest_value = self.backtest_results.get(metric, 0)
            live_value = live_metrics.get(metric, 0)

            if backtest_value != 0:
                difference = live_value - backtest_value
                pct_difference = (difference / abs(backtest_value)) * 100
            else:
                difference = live_value
                pct_difference = 0

            comparison[metric] = {
                'backtest': backtest_value,
                'live': live_value,
                'difference': difference,
                'pct_difference': pct_difference
            }

        return comparison

    def print_comparison(self, comparison: Dict):
        """打印比较报告。"""
        print("\n" + "=" * 70)
        print("实盘与回测比较")
        print("=" * 70)

        for metric, values in comparison.items():
            print(f"\n{metric.replace('_', ' ').title()}:")
            print(f"  回测:     {values['backtest']:.4f}")
            print(f"  实盘:     {values['live']:.4f}")
            print(f"  差异:     {values['difference']:+.4f} ({values['pct_difference']:+.1f}%)")

            # 标记显著差异
            if abs(values['pct_difference']) > 20:
                print(f"  ⚠ 警告: 检测到显著差异!")

        print("\n" + "=" * 70)
```

## 性能退化检测

```python
class DegradationDetector:
    """
    检测性能退化。
    """

    def __init__(self, baseline_sharpe: float,
                 baseline_win_rate: float):
        """
        初始化检测器。

        参数：
        -----------
        baseline_sharpe : float
            预期夏普比率
        baseline_win_rate : float
            预期胜率
        """
        self.baseline_sharpe = baseline_sharpe
        self.baseline_win_rate = baseline_win_rate

    def check_degradation(self, current_metrics: Dict) -> List[str]:
        """
        检查性能退化。

        参数：
        -----------
        current_metrics : Dict
            当前性能指标

        返回：
        --------
        List[str] : 警告列表
        """
        warnings = []

        # 检查夏普比率
        current_sharpe = current_metrics.get('sharpe_ratio', 0)
        if current_sharpe < self.baseline_sharpe * 0.7:
            warnings.append(
                f"夏普比率退化: {current_sharpe:.2f} "
                f"(预期: {self.baseline_sharpe:.2f})"
            )

        # 检查胜率
        current_win_rate = current_metrics.get('win_rate', 0)
        if current_win_rate < self.baseline_win_rate * 0.8:
            warnings.append(
                f"胜率退化: {current_win_rate:.2%} "
                f"(预期: {self.baseline_win_rate:.2%})"
            )

        # 检查回撤
        max_dd = current_metrics.get('max_drawdown', 0)
        if max_dd > 0.20:
            warnings.append(
                f"高回撤: {max_dd:.2%}"
            )

        return warnings
```

## 性能报告

```python
class PerformanceReporter:
    """
    生成性能报告。
    """

    def __init__(self, tracker: PerformanceTracker):
        """
        初始化报告器。

        参数：
        -----------
        tracker : PerformanceTracker
            性能跟踪器
        """
        self.tracker = tracker

    def generate_daily_report(self) -> str:
        """
        生成每日性能报告。

        返回：
        --------
        str : 报告文本
        """
        metrics = self.tracker.get_current_metrics()

        report = []
        report.append("=" * 70)
        report.append("每日性能报告")
        report.append("=" * 70)
        report.append(f"日期: {datetime.now().strftime('%Y-%m-%d')}")
        report.append("")

        report.append("投资组合")
        report.append("-" * 70)
        report.append(f"当前价值:    ${metrics['current_value']:,.2f}")
        report.append(f"总收益率:     {metrics['total_return']:+.2%}")
        report.append(f"总盈亏:        ${metrics['total_pnl']:+,.2f}")
        report.append("")

        report.append("性能指标")
        report.append("-" * 70)
        report.append(f"夏普比率:     {metrics['sharpe_ratio']:.2f}")
        report.append(f"最大回撤:     {metrics['max_drawdown']:.2%}")
        report.append(f"交易天数:     {metrics['days_trading']}")
        report.append("")

        report.append("交易活动")
        report.append("-" * 70)
        report.append(f"总交易次数:     {metrics['num_trades']}")
        report.append(f"胜率:         {metrics['win_rate']:.2%}")
        report.append("")

        report.append("=" * 70)

        return "\n".join(report)

    def generate_monthly_report(self) -> str:
        """生成月度性能报告。"""
        # 计算月度统计
        equity_series = pd.Series(
            self.tracker.equity_curve,
            index=self.tracker.equity_dates
        )

        monthly_returns = equity_series.resample('M').last().pct_change()

        report = []
        report.append("=" * 70)
        report.append("月度性能报告")
        report.append("=" * 70)
        report.append("")

        report.append("月度收益率")
        report.append("-" * 70)
        for date, ret in monthly_returns.items():
            if not pd.isna(ret):
                report.append(f"{date.strftime('%Y-%m')}: {ret:+.2%}")

        report.append("")
        report.append("=" * 70)

        return "\n".join(report)

    def save_report(self, report: str, filename: str):
        """
        保存报告到文件。

        参数：
        -----------
        report : str
            报告文本
        filename : str
            输出文件名
        """
        with open(filename, 'w') as f:
            f.write(report)

        print(f"报告已保存到 {filename}")
```

## 交易分析

```python
class TradeAnalyzer:
    """
    分析单个交易。
    """

    def analyze_trades(self, trades: List[Dict]) -> Dict:
        """
        分析交易性能。

        参数：
        -----------
        trades : List[Dict]
            交易列表

        返回：
        --------
        Dict : 交易分析
        """
        if not trades:
            return {}

        # 分离盈利和亏损交易
        wins = [t for t in trades if t.get('pnl', 0) > 0]
        losses = [t for t in trades if t.get('pnl', 0) < 0]

        # 计算统计数据
        total_pnl = sum(t.get('pnl', 0) for t in trades)
        avg_pnl = total_pnl / len(trades)

        if wins:
            avg_win = sum(t['pnl'] for t in wins) / len(wins)
            max_win = max(t['pnl'] for t in wins)
        else:
            avg_win = 0
            max_win = 0

        if losses:
            avg_loss = sum(t['pnl'] for t in losses) / len(losses)
            max_loss = min(t['pnl'] for t in losses)
        else:
            avg_loss = 0
            max_loss = 0

        # 盈利因子
        gross_profit = sum(t['pnl'] for t in wins)
        gross_loss = abs(sum(t['pnl'] for t in losses))

        if gross_loss > 0:
            profit_factor = gross_profit / gross_loss
        else:
            profit_factor = float('inf') if gross_profit > 0 else 0

        return {
            'total_trades': len(trades),
            'winning_trades': len(wins),
            'losing_trades': len(losses),
            'win_rate': len(wins) / len(trades),
            'total_pnl': total_pnl,
            'avg_pnl': avg_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'max_win': max_win,
            'max_loss': max_loss,
            'profit_factor': profit_factor
        }

    def print_analysis(self, analysis: Dict):
        """打印交易分析。"""
        print("\n" + "=" * 70)
        print("交易分析")
        print("=" * 70)

        print(f"\n总交易次数:      {analysis['total_trades']}")
        print(f"盈利交易:    {analysis['winning_trades']}")
        print(f"亏损交易:     {analysis['losing_trades']}")
        print(f"胜率:          {analysis['win_rate']:.2%}")

        print(f"\n总盈亏:         ${analysis['total_pnl']:,.2f}")
        print(f"平均盈亏:       ${analysis['avg_pnl']:,.2f}")
        print(f"平均盈利:       ${analysis['avg_win']:,.2f}")
        print(f"平均亏损:      ${analysis['avg_loss']:,.2f}")
        print(f"最大盈利:           ${analysis['max_win']:,.2f}")
        print(f"最大亏损:          ${analysis['max_loss']:,.2f}")
        print(f"盈利因子:     {analysis['profit_factor']:.2f}")

        print("\n" + "=" * 70)
```

## 最佳实践

1. **跟踪一切**：所有交易、订单、指标
2. **实时更新**：持续更新指标
3. **与基准比较**：监控与回测/预期的对比
4. **检测退化**：对性能问题发出警报
5. **生成报告**：每日、每周、每月
6. **分析交易**：了解什么有效
7. **存储历史**：保留长期记录

## 练习

### 练习1：性能跟踪器

实现一个性能跟踪器，它：
- 实时更新
- 计算关键指标
- 存储权益曲线
- 跟踪所有交易

### 练习2：比较工具

创建一个比较工具：
- 实盘与回测性能
- 当前与历史性能
- 多个策略

### 练习3：退化检测器

构建一个检测器，识别：
- 夏普比率下降
- 回撤增加
- 胜率下降
- 异常模式

### 练习4：报告系统

创建一个自动报告系统：
- 生成每日报告
- 发送每周摘要邮件
- 创建月度分析
- 生成可视化

## 总结

有效的性能跟踪需要：

- **实时指标**：持续计算
- **比较**：实盘与回测
- **退化检测**：早期预警系统
- **全面报告**：定期分析
- **交易分析**：了解性能驱动因素

良好的跟踪：
- 及早发现问题
- 验证策略有效性
- 指导改进
- 记录性能

## 下一步

在本模块的最终项目中，你将把所有组件集成到一个完整的自动化交易系统中，准备好进行部署。
