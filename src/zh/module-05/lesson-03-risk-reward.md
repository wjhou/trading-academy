# 第5.3课：风险回报比 - 盈利交易的数学

**模块**：5 - 风险管理
**预计时间**：45分钟
**难度**：中级

## 🎯 学习目标

- 理解风险回报比
- 计算所需的最低胜率
- 有效设置利润目标
- 将R倍数应用于交易
- 构建正期望系统

## 📖 什么是风险回报比？

**风险回报比**比较潜在利润与潜在损失。

```
风险回报比 = 潜在利润 / 潜在损失

示例：
入场：$100
止损：$95（风险$5）
目标：$110（回报$10）
风险回报 = $10 / $5 = 2:1
```

### 为什么重要

> "你可以只有40%的正确率，但通过良好的风险回报仍然赚钱"

## 📊 计算风险回报

```python
def calculate_risk_reward(entry, stop, target):
    """
    计算风险回报比
    """
    risk = abs(entry - stop)
    reward = abs(target - entry)
    ratio = reward / risk

    return {
        'risk': risk,
        'reward': reward,
        'ratio': ratio,
        'ratio_str': f"{ratio:.1f}:1"
    }

# 示例
entry = 150
stop = 145
target = 160

rr = calculate_risk_reward(entry, stop, target)
print(f"风险：${rr['risk']}")
print(f"回报：${rr['reward']}")
print(f"比率：{rr['ratio_str']}")
```

## 🎯 所需的最低胜率

```python
def minimum_win_rate(risk_reward_ratio):
    """
    计算盈亏平衡胜率

    公式：胜率 = 1 / (1 + 风险回报)
    """
    min_wr = 1 / (1 + risk_reward_ratio)
    return min_wr

# 示例
for rr in [1, 1.5, 2, 3]:
    min_wr = minimum_win_rate(rr)
    print(f"{rr}:1风险回报需要{min_wr:.1%}胜率才能盈亏平衡")
```

**输出**：
```
1:1风险回报需要50.0%胜率
1.5:1风险回报需要40.0%胜率
2:1风险回报需要33.3%胜率
3:1风险回报需要25.0%胜率
```

## 💰 期望公式

```python
def calculate_expectancy(win_rate, avg_win, avg_loss):
    """
    计算系统期望

    期望 = (胜率 × 平均盈利) - (亏损率 × 平均亏损)
    """
    loss_rate = 1 - win_rate
    expectancy = (win_rate * avg_win) - (loss_rate * abs(avg_loss))

    return expectancy

# 示例
win_rate = 0.45  # 45%
avg_win = 1000
avg_loss = -500

exp = calculate_expectancy(win_rate, avg_win, avg_loss)
print(f"期望：每笔交易${exp:.2f}")

if exp > 0:
    print("✓ 正期望系统")
else:
    print("✗ 负期望系统")
```

## 🎯 设置利润目标

### 方法1：固定R倍数

```python
def set_target_by_r_multiple(entry, stop, r_multiple=2):
    """
    将目标设置为风险的R倍数

    常见：2R（2:1）、3R（3:1）
    """
    risk = abs(entry - stop)
    target = entry + (risk * r_multiple)

    return target

# 示例
entry = 150
stop = 145
target = set_target_by_r_multiple(entry, stop, r_multiple=2)
print(f"2R目标：${target}")
```

### 方法2：支撑/阻力

```python
def set_target_at_resistance(entry, stop, resistance):
    """
    使用下一个阻力位作为目标
    """
    risk = abs(entry - stop)
    reward = abs(resistance - entry)
    rr_ratio = reward / risk

    if rr_ratio < 1.5:
        print(f"⚠️  风险回报差（{rr_ratio:.1f}:1），考虑跳过交易")

    return resistance, rr_ratio
```

### 方法3：基于ATR

```python
def set_target_by_atr(entry, atr, atr_multiple=3):
    """
    将目标设置为距离入场的ATR倍数
    """
    target = entry + (atr * atr_multiple)
    return target
```

## 📊 R倍数

**R倍数** = 实际利润或损失 / 初始风险

```python
def calculate_r_multiple(entry, stop, exit_price):
    """
    计算已平仓交易的R倍数
    """
    initial_risk = abs(entry - stop)
    actual_pnl = exit_price - entry
    r_multiple = actual_pnl / initial_risk

    return r_multiple

# 示例
entry = 150
stop = 145  # 风险 = $5

exits = [160, 155, 152, 145, 140]

for exit_price in exits:
    r = calculate_r_multiple(entry, stop, exit_price)
    pnl = exit_price - entry
    print(f"退出${exit_price}：盈亏${pnl:+.0f}，R倍数：{r:+.1f}R")
```

## 🎯 完整的风险回报系统

```python
class RiskRewardManager:
    """
    管理交易的风险回报
    """
    def __init__(self, min_rr_ratio=1.5):
        self.min_rr_ratio = min_rr_ratio
        self.trades = []

    def evaluate_trade(self, entry, stop, target):
        """
        评估交易是否符合风险回报标准
        """
        rr = calculate_risk_reward(entry, stop, target)

        if rr['ratio'] < self.min_rr_ratio:
            return False, f"风险回报太低：{rr['ratio']:.1f}:1 < {self.min_rr_ratio}:1"

        return True, f"良好的风险回报：{rr['ratio']:.1f}:1"

    def record_trade(self, entry, stop, exit_price):
        """
        记录已完成的交易
        """
        r_mult = calculate_r_multiple(entry, stop, exit_price)
        self.trades.append(r_mult)

        return r_mult

    def calculate_system_expectancy(self):
        """
        计算整体系统期望（以R为单位）
        """
        if not self.trades:
            return 0

        avg_r = sum(self.trades) / len(self.trades)
        return avg_r

# 示例
manager = RiskRewardManager(min_rr_ratio=2.0)

# 评估潜在交易
entry = 150
stop = 145
target = 160

valid, msg = manager.evaluate_trade(entry, stop, target)
print(f"交易有效：{valid}，{msg}")

# 记录交易
exits = [160, 155, 145, 165, 140]
for exit_price in exits:
    r = manager.record_trade(entry, stop, exit_price)
    print(f"在${exit_price}平仓交易：{r:+.1f}R")

# 系统期望
exp = manager.calculate_system_expectancy()
print(f"\n系统期望：每笔交易{exp:+.2f}R")
```

## 📊 分批退出策略

```python
def scaling_out_plan(entry, stop, risk_reward_ratios=[1.5, 2.5, 3.5]):
    """
    创建具有多个目标的分批退出计划
    """
    risk = abs(entry - stop)
    targets = []

    for rr in risk_reward_ratios:
        target = entry + (risk * rr)
        targets.append({
            'target': target,
            'rr_ratio': rr,
            'percent_to_sell': 33.3  # 在每个目标卖出1/3
        })

    return targets

# 示例
entry = 150
stop = 145

plan = scaling_out_plan(entry, stop)
print("分批退出计划：")
for i, level in enumerate(plan, 1):
    print(f"目标{i}：${level['target']:.2f}（{level['rr_ratio']}:1）- 卖出{level['percent_to_sell']:.0f}%")
```

## ⚠️ 常见错误

1. **追求高风险回报**：永远无法达到的不切实际目标
2. **忽略胜率**：10%胜率的5:1风险回报毫无用处
3. **移动目标**：贪婪阻止获利
4. **没有最低风险回报**：接受1:1或更差的交易
5. **忘记成本**：不考虑佣金/滑点

## 🎓 检查您的理解

1. 什么是2:1风险回报比？
2. 2:1风险回报需要什么胜率才能盈亏平衡？
3. 什么是期望？
4. 什么是R倍数？
5. 为什么要设置最低风险回报要求？

## 💻 练习

```python
# 分析您的交易系统
trades = [
    {'entry': 100, 'stop': 95, 'exit': 110},  # 盈利
    {'entry': 150, 'stop': 145, 'exit': 145}, # 亏损
    {'entry': 200, 'stop': 195, 'exit': 215}, # 盈利
    {'entry': 50, 'stop': 48, 'exit': 48},    # 亏损
    {'entry': 75, 'stop': 72, 'exit': 84},    # 盈利
]

r_multiples = []
for trade in trades:
    r = calculate_r_multiple(trade['entry'], trade['stop'], trade['exit'])
    r_multiples.append(r)
    print(f"交易：{r:+.1f}R")

avg_r = sum(r_multiples) / len(r_multiples)
print(f"\n平均R：{avg_r:+.2f}R")
print(f"期望：{'正' if avg_r > 0 else '负'}")
```

## 📝 练习5.3

创建：`exercises/module-05/exercise-5.3-risk-reward.md`

1. 计算10笔历史交易的风险回报
2. 确定您系统的平均R倍数
3. 计算所需的最低胜率
4. 测试不同的风险回报要求（1.5:1、2:1、3:1）
5. 记录您策略的最优风险回报

## 📚 资源

- [Van Tharp: Trade Your Way to Financial Freedom](https://www.amazon.com/Trade-Your-Way-Financial-Freedom/dp/007147871X)
- [Investopedia: Risk-Reward Ratio](https://www.investopedia.com/terms/r/riskrewardratio.asp)

## ✅ 解决方案

1. **2:1风险回报**：每风险$1，目标$2利润；如果风险$5，目标$10利润

2. **2:1的胜率**：33.3%盈亏平衡；高于33.3% = 盈利系统

3. **期望**：每笔交易平均盈亏金额；（胜率% × 平均盈利）-（亏损率% × 平均亏损）

4. **R倍数**：以初始风险的倍数表示的利润或损失；+2R = 赚了2倍风险，-1R = 损失全部风险

5. **最低风险回报**：确保有利的赔率；过滤低质量设置；允许以较低胜率盈利；防止小盈利/大亏损

---

**下一课**：[第5.4课：投资组合多样化](lesson-04-diversification.md)
