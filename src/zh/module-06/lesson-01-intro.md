# 第6.1课：回测简介

## 学习目标

在本课结束时，你将能够：
- 理解什么是回测以及为什么它至关重要
- 识别回测框架的关键组成部分
- 认识样本内测试和样本外测试之间的区别
- 在Python中实现基本的回测引擎
- 使用历史数据评估策略表现

## 简介

回测是在历史数据上测试交易策略以评估其表现的过程，在冒真实资金风险之前进行。这是策略开发中最关键的步骤之一，允许交易者：

- 验证策略逻辑和假设
- 估计潜在收益和风险
- 识别弱点和边缘情况
- 在实盘交易前建立信心
- 客观地比较不同策略

然而，回测伴随着重大挑战和潜在陷阱，如果处理不当，可能导致过度自信和糟糕的实盘交易结果。

## 什么是回测？

回测通过以下方式模拟交易策略在过去的表现：

1. **加载历史数据**：价格、成交量和其他市场数据
2. **应用策略规则**：基于指标的入场和出场信号
3. **模拟交易**：以历史价格执行买入/卖出订单
4. **跟踪表现**：记录盈亏、回撤和其他指标
5. **分析结果**：评估风险调整后的收益

### 回测流程

```
历史数据 → 策略规则 → 交易模拟 → 表现分析 → 策略优化
```

## 回测系统的关键组成部分

### 1. 数据处理器

管理历史市场数据：
- 价格数据（OHLCV）
- 公司行为（拆股、分红）
- 数据清洗和验证
- 时间序列对齐

### 2. 策略逻辑

实现交易规则：
- 入场条件
- 出场条件
- 仓位大小
- 风险管理

### 3. 执行引擎

模拟订单执行：
- 订单类型（市价、限价、止损）
- 滑点建模
- 佣金和费用
- 成交假设

### 4. 投资组合管理器

跟踪投资组合状态：
- 当前持仓
- 现金余额
- 权益曲线
- 表现指标

### 5. 表现分析器

计算指标：
- 收益（总收益、年化收益、风险调整收益）
- 回撤
- 胜率和盈利因子
- 夏普比率、索提诺比率

## 样本内测试与样本外测试

### 样本内（IS）测试

开发和优化策略的训练期：
- 用于开发策略规则
- 优化参数
- 测试不同变体
- **风险**：对历史数据过度拟合

### 样本外（OOS）测试

使用未见数据的验证期：
- 在新数据上测试策略
- 验证策略的泛化能力
- 提供现实的表现估计
- **关键**：在开发期间绝不能使用

### 最佳实践：前进分析

结合IS和OOS测试：
1. 在IS期间优化
2. 在OOS期间测试
3. 向前滚动并重复
4. 汇总结果

## Python实现

让我们构建一个基本的回测框架：

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt

@dataclass
class Trade:
    """表示一笔完成的交易。"""
    entry_date: datetime
    exit_date: datetime
    entry_price: float
    exit_price: float
    shares: int
    pnl: float
    pnl_pct: float
    direction: str  # 'long' 或 'short'


class Backtest:
    """
    简单的回测框架。
    """

    def __init__(self,
                 initial_capital: float = 100000,
                 commission: float = 0.001,
                 slippage: float = 0.0005):
        """
        初始化回测。

        参数：
        -----------
        initial_capital : float
            起始资金
        commission : float
            佣金比例（0.001 = 0.1%）
        slippage : float
            滑点比例（0.0005 = 0.05%）
        """
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage

        # 投资组合状态
        self.cash = initial_capital
        self.position = 0  # 股票数量
        self.entry_price = 0.0
        self.entry_date = None

        # 表现跟踪
        self.trades: List[Trade] = []
        self.equity_curve = []
        self.dates = []

    def calculate_commission(self, price: float, shares: int) -> float:
        """计算交易佣金。"""
        return abs(price * shares * self.commission)

    def calculate_slippage(self, price: float, shares: int, direction: str) -> float:
        """计算滑点成本。"""
        slippage_price = price * self.slippage
        if direction == 'buy':
            return slippage_price * shares
        else:
            return slippage_price * shares

    def buy(self, date: datetime, price: float, shares: int) -> bool:
        """
        执行买入订单。

        参数：
        -----------
        date : datetime
            交易日期
        price : float
            执行价格
        shares : int
            股票数量

        返回：
        --------
        bool : 如果订单执行则返回True
        """
        if self.position != 0:
            return False  # 已有持仓

        # 计算成本
        execution_price = price * (1 + self.slippage)
        commission = self.calculate_commission(execution_price, shares)
        total_cost = (execution_price * shares) + commission

        if total_cost > self.cash:
            return False  # 资金不足

        # 执行交易
        self.cash -= total_cost
        self.position = shares
        self.entry_price = execution_price
        self.entry_date = date

        return True

    def sell(self, date: datetime, price: float) -> bool:
        """
        执行卖出订单。

        参数：
        -----------
        date : datetime
            交易日期
        price : float
            执行价格

        返回：
        --------
        bool : 如果订单执行则返回True
        """
        if self.position == 0:
            return False  # 没有持仓可平

        # 计算收益
        execution_price = price * (1 - self.slippage)
        commission = self.calculate_commission(execution_price, self.position)
        proceeds = (execution_price * self.position) - commission

        # 计算盈亏
        pnl = proceeds - (self.entry_price * self.position)
        pnl_pct = (execution_price - self.entry_price) / self.entry_price

        # 记录交易
        trade = Trade(
            entry_date=self.entry_date,
            exit_date=date,
            entry_price=self.entry_price,
            exit_price=execution_price,
            shares=self.position,
            pnl=pnl,
            pnl_pct=pnl_pct,
            direction='long'
        )
        self.trades.append(trade)

        # 更新投资组合
        self.cash += proceeds
        self.position = 0
        self.entry_price = 0.0
        self.entry_date = None

        return True

    def get_portfolio_value(self, current_price: float) -> float:
        """
        计算当前投资组合价值。

        参数：
        -----------
        current_price : float
            当前市场价格

        返回：
        --------
        float : 总投资组合价值
        """
        position_value = self.position * current_price if self.position > 0 else 0
        return self.cash + position_value

    def run(self, data: pd.DataFrame, strategy_func) -> Dict:
        """
        运行回测。

        参数：
        -----------
        data : pd.DataFrame
            包含OHLCV列的历史价格数据
        strategy_func : callable
            返回信号的策略函数

        返回：
        --------
        Dict : 回测结果
        """
        # 生成信号
        signals = strategy_func(data)

        # 模拟交易
        for i in range(len(data)):
            date = data.index[i]
            price = data['Close'].iloc[i]

            # 检查入场信号
            if signals['entry'].iloc[i] and self.position == 0:
                # 计算仓位大小（使用95%的资金）
                shares = int((self.cash * 0.95) / (price * (1 + self.slippage)))
                if shares > 0:
                    self.buy(date, price, shares)

            # 检查出场信号
            elif signals['exit'].iloc[i] and self.position > 0:
                self.sell(date, price)

            # 记录权益
            portfolio_value = self.get_portfolio_value(price)
            self.equity_curve.append(portfolio_value)
            self.dates.append(date)

        # 平掉任何未平仓位
        if self.position > 0:
            final_price = data['Close'].iloc[-1]
            self.sell(data.index[-1], final_price)

        # 计算表现指标
        results = self.calculate_metrics()

        return results

    def calculate_metrics(self) -> Dict:
        """计算表现指标。"""
        if not self.trades:
            return {'error': '没有执行交易'}

        # 基本指标
        total_trades = len(self.trades)
        winning_trades = len([t for t in self.trades if t.pnl > 0])
        losing_trades = len([t for t in self.trades if t.pnl < 0])

        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        # 盈亏指标
        total_pnl = sum(t.pnl for t in self.trades)
        avg_win = np.mean([t.pnl for t in self.trades if t.pnl > 0]) if winning_trades > 0 else 0
        avg_loss = np.mean([t.pnl for t in self.trades if t.pnl < 0]) if losing_trades > 0 else 0

        profit_factor = abs(sum(t.pnl for t in self.trades if t.pnl > 0) /
                           sum(t.pnl for t in self.trades if t.pnl < 0)) if losing_trades > 0 else float('inf')

        # 收益
        final_value = self.equity_curve[-1]
        total_return = (final_value - self.initial_capital) / self.initial_capital

        # 计算年化收益
        days = (self.dates[-1] - self.dates[0]).days
        years = days / 365.25
        annualized_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0

        # 回撤
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max
        max_drawdown = np.max(drawdowns)

        # 夏普比率
        returns = pd.Series(self.equity_curve).pct_change().dropna()
        sharpe_ratio = np.sqrt(252) * (returns.mean() / returns.std()) if returns.std() > 0 else 0

        metrics = {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor,
            'total_return': total_return,
            'annualized_return': annualized_return,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'final_value': final_value
        }

        return metrics

    def plot_results(self):
        """绘制回测结果。"""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

        # 权益曲线
        ax1.plot(self.dates, self.equity_curve, label='投资组合价值', linewidth=2)
        ax1.axhline(y=self.initial_capital, color='gray', linestyle='--', label='初始资金')
        ax1.set_ylabel('投资组合价值 ($)')
        ax1.set_title('权益曲线')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 回撤
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        ax2.fill_between(self.dates, 0, -drawdowns * 100, alpha=0.3, color='red')
        ax2.plot(self.dates, -drawdowns * 100, color='red', linewidth=2)
        ax2.set_ylabel('回撤 (%)')
        ax2.set_xlabel('日期')
        ax2.set_title('回撤')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()

    def print_results(self, metrics: Dict):
        """打印回测结果。"""
        print("\n" + "=" * 60)
        print("回测结果")
        print("=" * 60)

        print(f"\n初始资金:     ${self.initial_capital:,.2f}")
        print(f"最终价值:         ${metrics['final_value']:,.2f}")
        print(f"总收益:        {metrics['total_return']:+.2%}")
        print(f"年化收益:   {metrics['annualized_return']:+.2%}")
        print(f"最大回撤:        {metrics['max_drawdown']:.2%}")
        print(f"夏普比率:        {metrics['sharpe_ratio']:.2f}")

        print(f"\n总交易次数:        {metrics['total_trades']}")
        print(f"盈利交易:      {metrics['winning_trades']}")
        print(f"亏损交易:       {metrics['losing_trades']}")
        print(f"胜率:            {metrics['win_rate']:.2%}")

        print(f"\n总盈亏:           ${metrics['total_pnl']:,.2f}")
        print(f"平均盈利:         ${metrics['avg_win']:,.2f}")
        print(f"平均亏损:        ${metrics['avg_loss']:,.2f}")
        print(f"盈利因子:       {metrics['profit_factor']:.2f}")

        print("\n" + "=" * 60)


# 示例策略：移动平均交叉
def ma_crossover_strategy(data: pd.DataFrame) -> pd.DataFrame:
    """
    简单的移动平均交叉策略。

    参数：
    -----------
    data : pd.DataFrame
        包含Close列的价格数据

    返回：
    --------
    pd.DataFrame : 包含entry/exit列的信号
    """
    # 计算移动平均
    data['MA_Short'] = data['Close'].rolling(window=20).mean()
    data['MA_Long'] = data['Close'].rolling(window=50).mean()

    # 生成信号
    signals = pd.DataFrame(index=data.index)
    signals['entry'] = False
    signals['exit'] = False

    # 入场：短期MA上穿长期MA
    signals.loc[(data['MA_Short'] > data['MA_Long']) &
                (data['MA_Short'].shift(1) <= data['MA_Long'].shift(1)), 'entry'] = True

    # 出场：短期MA下穿长期MA
    signals.loc[(data['MA_Short'] < data['MA_Long']) &
                (data['MA_Short'].shift(1) >= data['MA_Long'].shift(1)), 'exit'] = True

    return signals


# 示例用法
def example_backtest():
    """
    演示回测框架。
    """
    print("回测框架示例")
    print("=" * 60)

    # 下载数据
    print("\n下载数据...")
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # 初始化回测
    backtest = Backtest(
        initial_capital=100000,
        commission=0.001,
        slippage=0.0005
    )

    # 运行回测
    print("运行回测...")
    results = backtest.run(data, ma_crossover_strategy)

    # 打印结果
    backtest.print_results(results)

    # 绘制结果
    backtest.plot_results()


if __name__ == "__main__":
    example_backtest()
```

## 基本回测的局限性

### 1. 前视偏差

在过去的决策中使用未来信息：
- 使用未来数据计算指标
- 窥视下一根K线的价格
- 使用日内决策的收盘数据

**解决方案**：确保所有计算仅使用过去的数据。

### 2. 幸存者偏差

仅在幸存的股票上测试：
- 忽略退市公司
- 高估收益
- 遗漏破产风险

**解决方案**：使用无幸存者偏差的数据集。

### 3. 过度拟合

对历史数据过度优化：
- 参数过多
- 对噪声进行曲线拟合
- 样本外表现差

**解决方案**：使用前进分析并限制参数。

### 4. 不现实的执行

假设完美成交：
- 无滑点
- 即时执行
- 无限流动性

**解决方案**：建模滑点、佣金和市场影响。

### 5. 数据质量问题

历史数据的问题：
- 数据缺失
- 价格错误
- 未调整拆股/分红

**解决方案**：彻底清洗和验证数据。

## 最佳实践

1. **使用高质量数据**：确保数据干净、调整过且完整
2. **现实地建模成本**：包括佣金、滑点和市场影响
3. **避免过度拟合**：限制参数并使用样本外测试
4. **测试稳健性**：改变参数并在不同时期测试
5. **考虑市场状态**：在牛市、熊市和横盘市场中测试
6. **记录假设**：记录所有假设和限制
7. **保守估计**：预期实盘结果比回测差
8. **持续验证**：监控实盘表现与回测的对比

## 练习

### 练习1：基本回测

实现并回测一个简单的RSI策略：
- 当RSI < 30时买入
- 当RSI > 70时卖出
- 在2015-2023年的SPY上测试

### 练习2：佣金影响

使用不同的佣金水平运行相同策略：
- 0%（无佣金）
- 每笔交易0.1%
- 每笔交易0.5%

分析佣金如何影响盈利能力。

### 练习3：参数敏感性

使用不同的MA周期测试MA交叉策略：
- (10, 30), (20, 50), (50, 200)

哪个组合表现最好？

### 练习4：多个标的

在以下标的上回测MA交叉策略：
- AAPL, MSFT, GOOGL, AMZN

比较不同标的的结果。

## 总结

回测对于策略开发至关重要，但必须谨慎进行以避免常见陷阱。一个好的回测框架包括：

- 干净、高质量的历史数据
- 现实的执行建模（滑点、佣金）
- 无前视偏差的适当信号生成
- 全面的表现指标
- 样本外验证

记住：回测显示的是可能发生的情况，而不是将要发生的情况。始终对回测结果持怀疑态度，并预期实盘交易的表现会比回测差。

## 下一步

在下一课中，我们将详细探讨常见的回测陷阱，并学习如何避免它们，确保我们的回测结果尽可能现实和可靠。
