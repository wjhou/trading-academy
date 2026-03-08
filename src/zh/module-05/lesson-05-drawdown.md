# 第5.5课：回撤管理 - 度过艰难时期

**模块**：5 - 风险管理
**预计时间**：40分钟
**难度**：中级

## 🎯 学习目标

- 理解回撤及其影响
- 计算和监控回撤
- 实施回撤限制
- 有效地从回撤中恢复
- 建立心理韧性

## 📖 什么是回撤？

**回撤**是账户价值从峰值到谷底的下降。

```
峰值：$100,000
谷底：$85,000
回撤：-15%或-$15,000
```

### 为什么回撤重要

**恢复数学**：
```
-10%损失需要+11%收益才能恢复
-20%损失需要+25%收益才能恢复
-30%损失需要+43%收益才能恢复
-50%损失需要+100%收益才能恢复
```

## 📊 计算回撤

```python
def calculate_drawdown(equity_curve):
    """
    计算回撤序列
    """
    import pandas as pd
    import numpy as np

    # 如果需要，转换为Series
    if isinstance(equity_curve, list):
        equity_curve = pd.Series(equity_curve)

    # 计算运行最大值
    running_max = equity_curve.expanding().max()

    # 计算回撤
    drawdown = (equity_curve - running_max) / running_max

    # 计算指标
    max_dd = drawdown.min()
    max_dd_duration = calculate_dd_duration(drawdown)

    return {
        'drawdown_series': drawdown,
        'max_drawdown': max_dd,
        'max_dd_duration': max_dd_duration,
        'current_drawdown': drawdown.iloc[-1]
    }

def calculate_dd_duration(drawdown_series):
    """
    计算最长回撤持续时间
    """
    in_drawdown = drawdown_series < 0
    dd_periods = []
    current_period = 0

    for is_dd in in_drawdown:
        if is_dd:
            current_period += 1
        else:
            if current_period > 0:
                dd_periods.append(current_period)
            current_period = 0

    return max(dd_periods) if dd_periods else 0

# 示例
equity = [100000, 102000, 98000, 95000, 97000, 103000, 101000]
dd_stats = calculate_drawdown(equity)

print(f"最大回撤：{dd_stats['max_drawdown']:.2%}")
print(f"当前回撤：{dd_stats['current_drawdown']:.2%}")
print(f"最大回撤持续时间：{dd_stats['max_dd_duration']}个周期")
```

## 🎯 回撤限制

```python
class DrawdownManager:
    """
    监控和管理回撤
    """
    def __init__(self, initial_capital, max_dd_pct=0.20, daily_limit_pct=0.03):
        self.initial_capital = initial_capital
        self.peak_capital = initial_capital
        self.current_capital = initial_capital

        # 限制
        self.max_dd_pct = max_dd_pct
        self.daily_limit_pct = daily_limit_pct

        # 跟踪
        self.equity_curve = [initial_capital]
        self.daily_returns = []

    def update(self, new_capital):
        """
        更新资本并检查限制
        """
        # 计算日收益
        daily_return = (new_capital - self.current_capital) / self.current_capital
        self.daily_returns.append(daily_return)

        # 更新资本
        self.current_capital = new_capital
        self.equity_curve.append(new_capital)

        # 更新峰值
        if new_capital > self.peak_capital:
            self.peak_capital = new_capital

        # 检查限制
        warnings = []

        # 检查回撤限制
        current_dd = (self.current_capital - self.peak_capital) / self.peak_capital
        if current_dd < -self.max_dd_pct:
            warnings.append(f"⚠️  超过最大回撤：{current_dd:.2%}")

        # 检查日限制
        if daily_return < -self.daily_limit_pct:
            warnings.append(f"⚠️  触及日亏损限制：{daily_return:.2%}")

        return warnings

    def should_stop_trading(self):
        """
        确定是否应该停止交易
        """
        current_dd = (self.current_capital - self.peak_capital) / self.peak_capital

        if current_dd < -self.max_dd_pct:
            return True, "超过最大回撤"

        # 检查连续亏损天数
        if len(self.daily_returns) >= 5:
            recent_returns = self.daily_returns[-5:]
            if all(r < 0 for r in recent_returns):
                return True, "连续5天亏损"

        return False, None

    def get_stats(self):
        """
        获取回撤统计
        """
        dd_stats = calculate_drawdown(self.equity_curve)

        return {
            'current_capital': self.current_capital,
            'peak_capital': self.peak_capital,
            'current_dd': (self.current_capital - self.peak_capital) / self.peak_capital,
            'max_dd': dd_stats['max_drawdown'],
            'total_return': (self.current_capital - self.initial_capital) / self.initial_capital
        }

# 示例
manager = DrawdownManager(initial_capital=100000, max_dd_pct=0.20)

# 模拟交易
daily_capitals = [100000, 98000, 96000, 97000, 95000, 93000, 94000]

for capital in daily_capitals:
    warnings = manager.update(capital)

    if warnings:
        for warning in warnings:
            print(warning)

    should_stop, reason = manager.should_stop_trading()
    if should_stop:
        print(f"🛑 停止交易：{reason}")
        break

stats = manager.get_stats()
print(f"\n统计：")
for key, value in stats.items():
    if 'dd' in key or 'return' in key:
        print(f"  {key}：{value:.2%}")
    else:
        print(f"  {key}：${value:,.0f}")
```

## 💰 恢复策略

### 1. 减少仓位规模

```python
def adjust_size_for_drawdown(base_size, current_dd, max_dd=0.20):
    """
    在回撤期间减少仓位规模

    10%回撤：75%规模
    15%回撤：50%规模
    20%回撤：25%规模
    """
    dd_pct = abs(current_dd)
    reduction_factor = 1 - (dd_pct / max_dd)
    adjusted_size = base_size * max(reduction_factor, 0.25)  # 最小25%

    return int(adjusted_size)

# 示例
base_size = 100
for dd in [-0.05, -0.10, -0.15, -0.20]:
    adjusted = adjust_size_for_drawdown(base_size, dd)
    print(f"回撤{dd:.0%}：规模{adjusted}股（{adjusted/base_size:.0%}）")
```

### 2. 休息一下

```python
def should_take_break(consecutive_losses, max_losses=5):
    """
    连续亏损后休息
    """
    if consecutive_losses >= max_losses:
        return True, f"连续{consecutive_losses}次亏损后休息1-2周"

    return False, None
```

### 3. 审查和调整

```python
def drawdown_review_checklist():
    """
    回撤期间要问的问题
    """
    questions = [
        "我的策略在当前市场条件下仍然有效吗？",
        "我是在遵循规则还是偏离？",
        "我是否不适当地增加了仓位规模？",
        "我是否过度交易或复仇交易？",
        "我需要调整参数吗？",
        "我应该降低每笔交易的风险吗？",
        "我在情绪上受到影响了吗？"
    ]

    return questions
```

## 📊 防止大回撤

```python
class DrawdownPrevention:
    """
    主动回撤预防
    """
    def __init__(self):
        self.rules = {
            'max_risk_per_trade': 0.02,
            'max_portfolio_risk': 0.06,
            'max_correlated_positions': 3,
            'max_position_size': 0.15,
            'daily_loss_limit': 0.03,
            'weekly_loss_limit': 0.08
        }

    def check_all_rules(self, portfolio_state):
        """
        检查所有风险规则
        """
        violations = []

        # 检查每条规则
        for rule, limit in self.rules.items():
            if rule in portfolio_state:
                if portfolio_state[rule] > limit:
                    violations.append(f"{rule}：{portfolio_state[rule]:.2%} > {limit:.2%}")

        return violations

# 示例
prevention = DrawdownPrevention()

portfolio = {
    'max_risk_per_trade': 0.025,  # 违规
    'max_portfolio_risk': 0.05,
    'daily_loss_limit': 0.04      # 违规
}

violations = prevention.check_all_rules(portfolio)
if violations:
    print("⚠️  规则违规：")
    for v in violations:
        print(f"  - {v}")
```

## ⚠️ 心理影响

**情绪阶段**：
1. **否认**："这只是暂时的"
2. **愤怒**："这不公平"
3. **讨价还价**："再做一笔交易"
4. **沮丧**："我做不到"
5. **接受**："是时候调整了"

**应对策略**：
- 遵循预定规则
- 减少规模，不要增加
- 休息
- 客观审查
- 寻求支持

## 🎓 检查您的理解

1. 什么是回撤？
2. 为什么-50%回撤如此危险？
3. 在回撤期间应该做什么？
4. 如何防止大回撤？
5. 何时应该停止交易？

## 💻 练习

```python
# 模拟回撤管理
manager = DrawdownManager(100000, max_dd_pct=0.15)

# 模拟连败
import numpy as np
np.random.seed(42)

for day in range(30):
    # 随机日收益（-3%到+3%）
    daily_return = np.random.normal(-0.005, 0.02)
    new_capital = manager.current_capital * (1 + daily_return)

    warnings = manager.update(new_capital)

    if warnings:
        print(f"第{day}天：{warnings}")

    should_stop, reason = manager.should_stop_trading()
    if should_stop:
        print(f"第{day}天：停止 - {reason}")
        break

print(f"\n最终统计：{manager.get_stats()}")
```

## 📝 练习5.5

创建：`exercises/module-05/exercise-5.5-drawdown.md`

1. 计算您过去交易的最大回撤
2. 实施回撤监控系统
3. 测试回撤期间的仓位规模减少
4. 创建恢复计划
5. 记录经验教训

## 📚 资源

- [Investopedia: Drawdown](https://www.investopedia.com/terms/d/drawdown.asp)
- [Maximum Drawdown](https://www.investopedia.com/terms/m/maximum-drawdown-mdd.asp)

## ✅ 解决方案

1. **回撤**：账户价值从峰值到谷底的下降；衡量从最高点的最大损失

2. **-50%危险**：需要+100%收益才能恢复；心理上毁灭性；可能迫使账户关闭

3. **回撤期间**：减少仓位规模，审查策略，如果需要休息，不要复仇交易，严格遵守规则

4. **防止大回撤**：限制每笔交易风险（2%），限制总投资组合风险（6%），使用止损，多样化，设置日/周亏损限制

5. **停止交易时机**：触及最大回撤限制（例如-20%），5次以上连续亏损，情绪受损，策略明显失效

---

**下一课**：[第5.6课：凯利准则](lesson-06-kelly.md)
