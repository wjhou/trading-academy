# 第5.6课：凯利准则

## 学习目标

在本课结束时，您将能够：
- 理解凯利准则公式及其理论基础
- 使用凯利准则计算最优仓位规模
- 实施分数凯利进行实际交易
- 认识凯利规模的局限性和风险
- 将凯利准则与其他风险管理技术结合应用

## 简介

凯利准则是一个数学公式，用于确定一系列投注或投资的最优规模，以最大化长期增长。由约翰·凯利于1956年开发，它提供了一种基于您的优势和成功概率的系统化仓位规模方法。

虽然理论上最优化对数财富增长，但由于其激进性和对估计误差的敏感性，凯利准则在交易中需要谨慎应用。

## 凯利公式

### 基本公式

对于具有二元结果（赢或输）的简单投注：

```
f* = (bp - q) / b
```

其中：
- f* = 投注资本的分数（凯利百分比）
- b = 投注获得的赔率（净赔率，例如2:1赔率为2）
- p = 获胜概率
- q = 失败概率（1 - p）

### 交易应用

对于交易，我们调整公式以考虑平均盈亏比：

```
f* = (W × P - L × (1 - P)) / W
```

其中：
- W = 平均盈利规模（作为分数）
- L = 平均亏损规模（作为分数）
- P = 胜率（获胜交易的概率）

或者，使用胜率和盈亏比：

```
f* = P - (1 - P) / R
```

其中：
- P = 胜率
- R = 平均盈利/平均亏损比率

## 完全凯利vs分数凯利

### 完全凯利

完全凯利（f*）最大化长期增长率，但可能导致：
- 大回撤（可能50%或更多）
- 账户权益高波动性
- 显著的心理压力
- 对估计误差的敏感性

### 分数凯利

大多数专业交易者使用分数凯利，通常为1/4到1/2凯利：

```
仓位规模 = f* × 分数
```

常见分数：
- **半凯利（0.5）**：显著降低波动性，同时保持约75%的增长率
- **四分之一凯利（0.25）**：保守方法，更平滑的权益曲线
- **三分之一凯利（0.33）**：增长和稳定性之间的平衡方法

## Python实现

让我们实现一个综合的凯利准则计算器：

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import yfinance as yf

class KellyCriterion:
    """
    凯利准则仓位规模计算器。
    """

    def __init__(self, kelly_fraction: float = 0.5):
        """
        初始化凯利计算器。

        参数：
        -----------
        kelly_fraction : float
            使用的凯利分数（0.25到1.0）
        """
        self.kelly_fraction = kelly_fraction
        self.trade_history = []

    def calculate_kelly_simple(self, win_rate: float,
                               avg_win: float,
                               avg_loss: float) -> float:
        """
        使用胜率和平均盈亏计算凯利百分比。

        参数：
        -----------
        win_rate : float
            获胜概率（0到1）
        avg_win : float
            平均获胜交易规模（作为分数）
        avg_loss : float
            平均亏损交易规模（作为分数）

        返回：
        --------
        float : 凯利百分比
        """
        if avg_loss == 0:
            return 0.0

        win_loss_ratio = avg_win / avg_loss
        kelly = win_rate - ((1 - win_rate) / win_loss_ratio)

        # 应用分数凯利
        kelly = kelly * self.kelly_fraction

        # 确保非负
        return max(0.0, kelly)

    def calculate_kelly_from_trades(self, returns: List[float]) -> float:
        """
        从历史交易收益计算凯利百分比。

        参数：
        -----------
        returns : List[float]
            交易收益列表（作为分数，例如0.02表示2%收益）

        返回：
        --------
        float : 凯利百分比
        """
        if not returns:
            return 0.0

        returns_array = np.array(returns)

        # 分离盈利和亏损
        wins = returns_array[returns_array > 0]
        losses = returns_array[returns_array < 0]

        if len(wins) == 0 or len(losses) == 0:
            return 0.0

        # 计算统计
        win_rate = len(wins) / len(returns_array)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        return self.calculate_kelly_simple(win_rate, avg_win, avg_loss)

    def calculate_position_size(self, capital: float,
                                win_rate: float,
                                avg_win: float,
                                avg_loss: float,
                                price: float) -> int:
        """
        使用凯利准则计算股票仓位规模。

        参数：
        -----------
        capital : float
            总交易资本
        win_rate : float
            获胜概率
        avg_win : float
            平均盈利作为分数
        avg_loss : float
            平均亏损作为分数
        price : float
            每股当前价格

        返回：
        --------
        int : 要购买的股数
        """
        kelly_pct = self.calculate_kelly_simple(win_rate, avg_win, avg_loss)

        # 计算风险的美元金额
        position_value = capital * kelly_pct

        # 转换为股数
        shares = int(position_value / price)

        return shares

    def rolling_kelly(self, returns: List[float],
                     window: int = 20) -> List[float]:
        """
        计算随时间变化的滚动凯利百分比。

        参数：
        -----------
        returns : List[float]
            交易收益列表
        window : int
            滚动窗口大小

        返回：
        --------
        List[float] : 滚动凯利百分比
        """
        if len(returns) < window:
            return []

        kelly_values = []

        for i in range(window, len(returns) + 1):
            window_returns = returns[i-window:i]
            kelly = self.calculate_kelly_from_trades(window_returns)
            kelly_values.append(kelly)

        return kelly_values

    def add_trade(self, return_pct: float):
        """
        添加交易到历史。

        参数：
        -----------
        return_pct : float
            交易收益作为分数
        """
        self.trade_history.append(return_pct)

    def get_current_kelly(self) -> float:
        """
        基于交易历史获取当前凯利百分比。

        返回：
        --------
        float : 当前凯利百分比
        """
        if not self.trade_history:
            return 0.0

        return self.calculate_kelly_from_trades(self.trade_history)

    def simulate_kelly_growth(self, returns: List[float],
                             initial_capital: float = 10000,
                             kelly_fractions: List[float] = None) -> pd.DataFrame:
        """
        使用不同的凯利分数模拟投资组合增长。

        参数：
        -----------
        returns : List[float]
            交易收益列表
        initial_capital : float
            起始资本
        kelly_fractions : List[float]
            要测试的凯利分数列表

        返回：
        --------
        pd.DataFrame : 模拟结果
        """
        if kelly_fractions is None:
            kelly_fractions = [0.25, 0.5, 0.75, 1.0]

        results = {'Trade': list(range(len(returns)))}

        for fraction in kelly_fractions:
            capital = initial_capital
            equity_curve = [capital]

            # 计算凯利百分比
            kelly_pct = self.calculate_kelly_from_trades(returns)

            for ret in returns:
                # 基于凯利分数的仓位规模
                position_size = capital * kelly_pct * fraction

                # 计算盈亏
                pnl = position_size * ret

                # 更新资本
                capital += pnl
                equity_curve.append(capital)

            results[f'Kelly_{fraction}'] = equity_curve[1:]

        return pd.DataFrame(results)


# 使用示例
def example_kelly_calculation():
    """
    演示凯利准则计算。
    """
    print("凯利准则仓位规模")
    print("=" * 50)

    # 使用半凯利初始化凯利计算器
    kelly = KellyCriterion(kelly_fraction=0.5)

    # 示例1：简单计算
    print("\n示例1：简单凯利计算")
    print("-" * 50)

    win_rate = 0.55  # 55%胜率
    avg_win = 0.02   # 2%平均盈利
    avg_loss = 0.01  # 1%平均亏损

    kelly_pct = kelly.calculate_kelly_simple(win_rate, avg_win, avg_loss)

    print(f"胜率：{win_rate:.1%}")
    print(f"平均盈利：{avg_win:.1%}")
    print(f"平均亏损：{avg_loss:.1%}")
    print(f"盈亏比：{avg_win/avg_loss:.2f}")
    print(f"凯利百分比（半凯利）：{kelly_pct:.2%}")

    # 示例2：仓位规模
    print("\n示例2：仓位规模")
    print("-" * 50)

    capital = 100000
    price = 150

    shares = kelly.calculate_position_size(
        capital, win_rate, avg_win, avg_loss, price
    )

    position_value = shares * price

    print(f"资本：${capital:,.2f}")
    print(f"股票价格：${price:.2f}")
    print(f"要购买的股数：{shares}")
    print(f"仓位价值：${position_value:,.2f}")
    print(f"占资本百分比：{position_value/capital:.2%}")

    # 示例3：历史交易
    print("\n示例3：从交易历史计算凯利")
    print("-" * 50)

    # 模拟交易收益
    np.random.seed(42)
    trade_returns = []

    for _ in range(100):
        if np.random.random() < win_rate:
            trade_returns.append(np.random.uniform(0.01, 0.03))
        else:
            trade_returns.append(np.random.uniform(-0.02, -0.005))

    kelly_from_history = kelly.calculate_kelly_from_trades(trade_returns)

    print(f"交易数量：{len(trade_returns)}")
    print(f"实际胜率：{len([r for r in trade_returns if r > 0])/len(trade_returns):.2%}")
    print(f"凯利百分比：{kelly_from_history:.2%}")

    # 示例4：比较凯利分数
    print("\n示例4：比较凯利分数")
    print("-" * 50)

    simulation = kelly.simulate_kelly_growth(
        trade_returns[:50],
        initial_capital=10000,
        kelly_fractions=[0.25, 0.5, 0.75, 1.0]
    )

    print("\n按凯利分数的最终资本：")
    for col in simulation.columns:
        if col != 'Trade':
            final_value = simulation[col].iloc[-1]
            total_return = (final_value - 10000) / 10000
            print(f"{col}：${final_value:,.2f}（{total_return:+.2%}）")


if __name__ == "__main__":
    example_kelly_calculation()
```

## 实际考虑

### 估计误差

凯利准则对输入参数高度敏感：

1. **胜率高估**：即使胜率估计的小误差也可能导致显著的过度投注
2. **盈亏比误差**：低估平均亏损或高估平均盈利会增加风险
3. **样本量**：小样本量导致不可靠的估计

**解决方案**：使用分数凯利（1/4到1/2）提供安全边际。

### 非平稳市场

交易参数随时间变化：
- 市场条件演变
- 策略有效性变化
- 历史表现可能无法预测未来结果

**解决方案**：使用滚动窗口定期重新计算凯利百分比。

### 多个同时仓位

凯利准则假设一次一个投注。对于多个仓位：
- 仓位之间的相关性很重要
- 总投资组合凯利可能超过单个仓位凯利
- 过度杠杆风险增加

**解决方案**：将凯利应用于总投资组合风险，而不是单个仓位。

### 回撤风险

完全凯利可能产生50%或更多的回撤：
- 心理上难以维持
- 可能在最糟糕的时候被迫清算
- 从大回撤中恢复具有挑战性

**解决方案**：使用分数凯利并结合最大回撤限制。

## 将凯利与其他风险管理结合

### 凯利+固定风险限制

```python
def kelly_with_max_risk(kelly_pct: float, max_risk: float = 0.02) -> float:
    """
    将凯利与最大风险限制结合。
    """
    return min(kelly_pct, max_risk)
```

### 凯利+波动性调整

```python
def kelly_volatility_adjusted(kelly_pct: float,
                              current_vol: float,
                              target_vol: float) -> float:
    """
    根据当前波动性调整凯利。
    """
    vol_scalar = target_vol / current_vol
    return kelly_pct * vol_scalar
```

### 凯利+回撤减少

```python
def kelly_drawdown_adjusted(kelly_pct: float,
                           current_dd: float,
                           max_dd: float = 0.20) -> float:
    """
    在回撤期间减少凯利。
    """
    if current_dd >= max_dd:
        return 0.0

    dd_scalar = 1 - (current_dd / max_dd)
    return kelly_pct * dd_scalar
```

## 优点和缺点

### 优点

1. **数学最优**：最大化长期增长率
2. **系统化**：从仓位规模中消除情绪
3. **自适应**：调整以适应变化的胜率和比率
4. **基于优势**：优势越大，仓位越大

### 缺点

1. **高波动性**：完全凯利产生大幅波动
2. **估计敏感性**：小误差有大影响
3. **假设准确性**：需要准确的概率估计
4. **心理困难**：大回撤压力大
5. **单一投注假设**：不自然地处理多个仓位

## 最佳实践

1. **使用分数凯利**：从1/4到1/2凯利开始
2. **定期重新计算**：每月或每季度更新参数
3. **足够的样本量**：至少使用30-50笔交易进行估计
4. **保守估计**：在参数方面谨慎行事
5. **结合限制**：使用最大仓位规模和风险限制
6. **监控回撤**：在显著回撤期间减少规模
7. **考虑相关性**：考虑投资组合级别的风险
8. **压力测试**：在各种场景下模拟表现

## 练习

### 练习1：凯利计算

计算具有以下特征的策略的凯利百分比：
- 胜率：60%
- 平均盈利：3%
- 平均亏损：2%

完全凯利和半凯利百分比是多少？

### 练习2：敏感性分析

使用KellyCriterion类，分析凯利百分比如何变化：
- 胜率从50%到70%变化
- 盈亏比从1.0到3.0变化

创建显示凯利百分比的热图。

### 练习3：历史分析

下载股票的历史数据并：
1. 实施简单的移动平均交叉策略
2. 计算每笔交易的收益
3. 从交易历史计算凯利百分比
4. 比较使用不同凯利分数的表现

### 练习4：风险整合

创建一个结合以下内容的仓位规模系统：
- 凯利准则
- 每笔交易最多2%风险
- 波动性调整
- 回撤减少

在历史数据上测试并与固定仓位规模比较。

## 总结

凯利准则提供了一个基于您的交易优势的最优仓位规模数学框架。虽然理论上最优化增长，但实际应用需要：

- 使用分数凯利（通常为1/4到1/2）以降低波动性
- 随着市场条件变化定期重新计算
- 保守的参数估计以考虑不确定性
- 与其他风险管理技术整合
- 意识到波动性带来的心理挑战

当适当应用适当的保障措施时，凯利准则可以显著改善风险调整后的回报，同时保持有纪律的仓位规模。

## 下一步

在下一个模块中，我们将把所有风险管理概念整合到一个综合的风险管理系统项目中，将仓位规模、止损、风险回报分析、多样化、回撤管理和凯利准则结合到一个统一的框架中。
