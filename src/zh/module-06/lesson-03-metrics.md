# 第6.3课：绩效指标

## 学习目标

在本课结束时，你将能够：
- 计算和解释全面的绩效指标
- 理解风险调整回报度量
- 评估超越简单回报的策略质量
- 使用多个指标比较策略
- 识别哪些指标对不同交易风格最重要

## 简介

总回报不足以评估交易策略。两个具有相同回报的策略可能有截然不同的风险特征、回撤和一致性。全面的绩效指标帮助你理解策略的真实质量，并客观地比较不同方法。

专业交易者关注风险调整回报——你每承担一单位风险产生多少回报。本课涵盖量化交易中使用的基本指标。

## 回报指标

### 总回报

最简单的指标——百分比收益或损失：

```python
def calculate_total_return(initial_capital: float, final_capital: float) -> float:
    """
    计算总回报。

    参数：
    -----------
    initial_capital : float
        起始资金
    final_capital : float
        结束资金

    返回：
    --------
    float : 总回报（分数形式）
    """
    return (final_capital - initial_capital) / initial_capital
```

### 年化回报

将回报标准化为年度基础以便比较：

```python
def calculate_annualized_return(total_return: float, days: int) -> float:
    """
    计算年化回报。

    参数：
    -----------
    total_return : float
        总回报（分数形式）
    days : int
        天数

    返回：
    --------
    float : 年化回报
    """
    years = days / 365.25
    if years <= 0:
        return 0.0

    annualized = (1 + total_return) ** (1 / years) - 1
    return annualized
```

### 复合年增长率（CAGR）

类似于年化回报，强调复利：

```python
def calculate_cagr(initial_capital: float,
                   final_capital: float,
                   years: float) -> float:
    """
    计算CAGR。

    参数：
    -----------
    initial_capital : float
        起始资金
    final_capital : float
        结束资金
    years : float
        年数

    返回：
    --------
    float : CAGR
    """
    if years <= 0 or initial_capital <= 0:
        return 0.0

    cagr = (final_capital / initial_capital) ** (1 / years) - 1
    return cagr
```

## 风险指标

### 波动率（标准差）

衡量回报变异性：

```python
import numpy as np
import pandas as pd

def calculate_volatility(returns: pd.Series, annualize: bool = True) -> float:
    """
    计算波动率。

    参数：
    -----------
    returns : pd.Series
        回报序列
    annualize : bool
        是否年化

    返回：
    --------
    float : 波动率
    """
    vol = returns.std()

    if annualize:
        vol = vol * np.sqrt(252)  # 假设日回报

    return vol
```

### 最大回撤

最大的峰谷下降：

```python
def calculate_max_drawdown(equity_curve: pd.Series) -> float:
    """
    计算最大回撤。

    参数：
    -----------
    equity_curve : pd.Series
        权益曲线值

    返回：
    --------
    float : 最大回撤（分数形式）
    """
    running_max = equity_curve.expanding().max()
    drawdowns = (equity_curve - running_max) / running_max
    max_dd = drawdowns.min()

    return abs(max_dd)


def calculate_drawdown_duration(equity_curve: pd.Series) -> int:
    """
    计算最长回撤持续时间（天）。

    参数：
    -----------
    equity_curve : pd.Series
        带日期时间索引的权益曲线

    返回：
    --------
    int : 最长回撤持续时间（天）
    """
    running_max = equity_curve.expanding().max()
    is_drawdown = equity_curve < running_max

    # 查找回撤期
    drawdown_periods = []
    start = None

    for i, in_dd in enumerate(is_drawdown):
        if in_dd and start is None:
            start = i
        elif not in_dd and start is not None:
            drawdown_periods.append((start, i))
            start = None

    if start is not None:
        drawdown_periods.append((start, len(equity_curve)))

    # 计算持续时间
    if not drawdown_periods:
        return 0

    max_duration = 0
    for start, end in drawdown_periods:
        duration = (equity_curve.index[end-1] - equity_curve.index[start]).days
        max_duration = max(max_duration, duration)

    return max_duration
```

### 风险价值（VaR）

给定置信水平下的最大预期损失：

```python
def calculate_var(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    计算风险价值。

    参数：
    -----------
    returns : pd.Series
        回报序列
    confidence : float
        置信水平（0.95 = 95%）

    返回：
    --------
    float : VaR（分数形式）
    """
    var = returns.quantile(1 - confidence)
    return abs(var)


def calculate_cvar(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    计算条件风险价值（预期缺口）。

    参数：
    -----------
    returns : pd.Series
        回报序列
    confidence : float
        置信水平

    返回：
    --------
    float : CVaR（分数形式）
    """
    var = calculate_var(returns, confidence)
    cvar = returns[returns <= -var].mean()
    return abs(cvar)
```

## 风险调整回报指标

### 夏普比率

最广泛使用的风险调整指标：

```python
def calculate_sharpe_ratio(returns: pd.Series,
                          risk_free_rate: float = 0.02,
                          periods_per_year: int = 252) -> float:
    """
    计算夏普比率。

    参数：
    -----------
    returns : pd.Series
        回报序列
    risk_free_rate : float
        年度无风险利率
    periods_per_year : int
        每年期数（日线为252）

    返回：
    --------
    float : 夏普比率
    """
    # 将年度无风险利率转换为期间利率
    rf_period = risk_free_rate / periods_per_year

    # 计算超额回报
    excess_returns = returns - rf_period

    # 计算夏普比率
    if excess_returns.std() == 0:
        return 0.0

    sharpe = excess_returns.mean() / excess_returns.std()

    # 年化
    sharpe = sharpe * np.sqrt(periods_per_year)

    return sharpe
```

**解释：**
- < 1.0：差
- 1.0 - 2.0：好
- 2.0 - 3.0：很好
- > 3.0：优秀（但要验证错误！）

### 索提诺比率

类似夏普比率但只惩罚下行波动率：

```python
def calculate_sortino_ratio(returns: pd.Series,
                           risk_free_rate: float = 0.02,
                           periods_per_year: int = 252) -> float:
    """
    计算索提诺比率。

    参数：
    -----------
    returns : pd.Series
        回报序列
    risk_free_rate : float
        年度无风险利率
    periods_per_year : int
        每年期数

    返回：
    --------
    float : 索提诺比率
    """
    rf_period = risk_free_rate / periods_per_year
    excess_returns = returns - rf_period

    # 下行偏差（仅负回报）
    downside_returns = excess_returns[excess_returns < 0]

    if len(downside_returns) == 0 or downside_returns.std() == 0:
        return 0.0

    sortino = excess_returns.mean() / downside_returns.std()
    sortino = sortino * np.sqrt(periods_per_year)

    return sortino
```

### 卡玛比率

回报除以最大回撤：

```python
def calculate_calmar_ratio(annualized_return: float,
                          max_drawdown: float) -> float:
    """
    计算卡玛比率。

    参数：
    -----------
    annualized_return : float
        年化回报
    max_drawdown : float
        最大回撤（分数形式）

    返回：
    --------
    float : 卡玛比率
    """
    if max_drawdown == 0:
        return 0.0

    return annualized_return / max_drawdown
```

**解释：**
- < 1.0：差
- 1.0 - 3.0：好
- 3.0 - 5.0：很好
- > 5.0：优秀

### 欧米茄比率

收益与损失的概率加权比率：

```python
def calculate_omega_ratio(returns: pd.Series, threshold: float = 0.0) -> float:
    """
    计算欧米茄比率。

    参数：
    -----------
    returns : pd.Series
        回报序列
    threshold : float
        阈值回报（通常为0）

    返回：
    --------
    float : 欧米茄比率
    """
    excess_returns = returns - threshold

    gains = excess_returns[excess_returns > 0].sum()
    losses = abs(excess_returns[excess_returns < 0].sum())

    if losses == 0:
        return float('inf') if gains > 0 else 0.0

    return gains / losses
```

## 交易级指标

### 胜率

获胜交易的百分比：

```python
def calculate_win_rate(trades: list) -> float:
    """
    计算胜率。

    参数：
    -----------
    trades : list
        交易盈亏列表

    返回：
    --------
    float : 胜率（分数形式）
    """
    if not trades:
        return 0.0

    winning_trades = len([t for t in trades if t > 0])
    return winning_trades / len(trades)
```

### 盈利因子

总盈利除以总亏损：

```python
def calculate_profit_factor(trades: list) -> float:
    """
    计算盈利因子。

    参数：
    -----------
    trades : list
        交易盈亏列表

    返回：
    --------
    float : 盈利因子
    """
    gross_profit = sum([t for t in trades if t > 0])
    gross_loss = abs(sum([t for t in trades if t < 0]))

    if gross_loss == 0:
        return float('inf') if gross_profit > 0 else 0.0

    return gross_profit / gross_loss
```

**解释：**
- < 1.0：亏损策略
- 1.0 - 1.5：边际
- 1.5 - 2.0：好
- > 2.0：优秀

### 期望值

每笔交易的平均预期利润：

```python
def calculate_expectancy(trades: list) -> float:
    """
    计算期望值。

    参数：
    -----------
    trades : list
        交易盈亏列表

    返回：
    --------
    float : 期望值
    """
    if not trades:
        return 0.0

    wins = [t for t in trades if t > 0]
    losses = [t for t in trades if t < 0]

    if not wins or not losses:
        return 0.0

    win_rate = len(wins) / len(trades)
    avg_win = np.mean(wins)
    avg_loss = abs(np.mean(losses))

    expectancy = (win_rate * avg_win) - ((1 - win_rate) * avg_loss)

    return expectancy
```

### 平均盈亏比

```python
def calculate_win_loss_ratio(trades: list) -> float:
    """
    计算平均盈利与平均亏损比率。

    参数：
    -----------
    trades : list
        交易盈亏列表

    返回：
    --------
    float : 盈亏比
    """
    wins = [t for t in trades if t > 0]
    losses = [t for t in trades if t < 0]

    if not wins or not losses:
        return 0.0

    avg_win = np.mean(wins)
    avg_loss = abs(np.mean(losses))

    return avg_win / avg_loss if avg_loss != 0 else 0.0
```

## 总结

全面的绩效分析需要多个指标：

- **回报指标**：总回报、年化回报、CAGR
- **风险指标**：波动率、最大回撤、VaR
- **风险调整**：夏普、索提诺、卡玛、欧米茄
- **交易指标**：胜率、盈利因子、期望值

没有单一指标能讲述完整故事。使用多个指标评估策略，并考虑你的风险承受能力、资金和交易风格。

## 下一步

在下一课中，我们将探索参数优化技术，以找到最优策略设置，同时避免过拟合。