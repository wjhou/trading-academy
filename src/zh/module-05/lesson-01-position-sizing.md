# 第5.1课：仓位规模 - 风险多少

**模块**：5 - 风险管理
**预计时间**：60分钟
**难度**：中级

## 🎯 学习目标

在本课结束时，您将能够：
- 理解为什么仓位规模至关重要
- 学习不同的仓位规模方法
- 计算最优仓位规模
- 在交易中实施仓位规模
- 避免常见的仓位规模错误

## 📖 什么是仓位规模？

**仓位规模**根据您的风险承受能力和账户规模确定交易多少股票/合约。

### 为什么它至关重要

> "仓位规模是交易中唯一的免费午餐" - Van K. Tharp

**影响**：
- 太大：一次糟糕的交易就会让您破产
- 太小：无法获得有意义的利润
- 恰到好处：持续增长，可管理的风险

### 数学计算

```
如果每笔交易风险10%：
- 连续10次亏损 = -65%账户损失
- 需要+186%才能恢复

如果每笔交易风险2%：
- 连续10次亏损 = -18%账户损失
- 需要+22%才能恢复
```

## 📊 仓位规模方法

### 1. 固定美元金额

**概念**：每笔交易风险相同的美元金额

```python
def fixed_dollar_sizing(account_size, risk_amount, entry_price, stop_loss):
    """
    每笔交易风险固定美元金额

    示例：每笔交易总是风险$1,000
    """
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    return shares

# 示例
account = 100000
risk = 1000  # 每笔交易风险$1,000
entry = 150
stop = 145

shares = fixed_dollar_sizing(account, risk, entry, stop)
print(f"仓位规模：{shares}股")
print(f"总仓位：${shares * entry:,.2f}")
print(f"风险：${shares * (entry - stop):,.2f}")
```

**优点**：简单，一致的美元风险
**缺点**：不随账户增长而扩展

### 2. 固定百分比（最常见）

**概念**：每笔交易风险账户的固定百分比

```python
def fixed_percentage_sizing(account_size, risk_percent, entry_price, stop_loss):
    """
    风险账户的固定百分比

    常见：每笔交易1-2%
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    # 确保不超过账户
    max_shares = int(account_size / entry_price)
    shares = min(shares, max_shares)

    return shares

# 示例
account = 100000
risk_pct = 0.02  # 2%风险
entry = 150
stop = 145

shares = fixed_percentage_sizing(account, risk_pct, entry, stop)
print(f"仓位规模：{shares}股")
print(f"仓位价值：${shares * entry:,.2f}")
print(f"风险金额：${shares * (entry - stop):,.2f} ({risk_pct:.1%})")
```

**优点**：随账户扩展，一致的风险
**缺点**：在低波动性股票中可能导致大仓位

### 3. 基于波动性（ATR）

**概念**：根据股票波动性调整仓位规模

```python
def atr_based_sizing(account_size, risk_percent, entry_price, atr, atr_multiplier=2):
    """
    基于ATR（平均真实范围）的仓位规模

    止损 = 入场 - (ATR × 乘数)
    """
    stop_loss = entry_price - (atr * atr_multiplier)
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    return shares, stop_loss

# 示例
account = 100000
risk_pct = 0.02
entry = 150
atr = 3.5  # 股票的ATR

shares, stop = atr_based_sizing(account, risk_pct, entry, atr, atr_multiplier=2)
print(f"仓位规模：{shares}股")
print(f"止损：${stop:.2f}")
print(f"每股风险：${entry - stop:.2f}")
```

**优点**：适应波动性，不同股票间风险一致
**缺点**：更复杂，需要ATR计算

### 4. 凯利准则

**概念**：基于胜率和盈亏比的最优仓位规模

```python
def kelly_criterion(win_rate, avg_win, avg_loss):
    """
    使用凯利准则计算最优仓位规模

    凯利% = W - [(1 - W) / R]
    其中：
        W = 胜率
        R = 平均盈利 / 平均亏损
    """
    if avg_loss == 0:
        return 0

    win_loss_ratio = abs(avg_win / avg_loss)
    kelly_pct = win_rate - ((1 - win_rate) / win_loss_ratio)

    # 使用分数凯利（更安全）
    fractional_kelly = kelly_pct * 0.5  # 半凯利

    return max(0, fractional_kelly)

# 示例
win_rate = 0.55  # 55%胜率
avg_win = 500
avg_loss = -300

kelly = kelly_criterion(win_rate, avg_win, avg_loss)
print(f"凯利准则：{kelly:.2%}")
print(f"半凯利（推荐）：{kelly * 0.5:.2%}")
```

**优点**：数学上最优增长
**缺点**：激进，需要准确的胜率/盈亏数据

### 5. 固定比率

**概念**：达到利润目标后增加仓位规模

```python
class FixedRatioSizing:
    """
    随着账户增长增加仓位规模

    Delta = 增加1个合约所需的金额
    """
    def __init__(self, initial_contracts=1, delta=5000):
        self.contracts = initial_contracts
        self.delta = delta
        self.profit_target = delta

    def update(self, current_profit):
        """
        根据利润更新仓位规模
        """
        if current_profit >= self.profit_target:
            self.contracts += 1
            self.profit_target += self.delta
            print(f"增加到{self.contracts}个合约")

        return self.contracts

# 示例
sizer = FixedRatioSizing(initial_contracts=1, delta=5000)
profits = [2000, 3000, 6000, 8000]

for profit in profits:
    contracts = sizer.update(profit)
    print(f"利润：${profit}，合约：{contracts}")
```

**优点**：保守增长，保护资本
**缺点**：扩展缓慢

## 🎯 完整的仓位规模系统

```python
class PositionSizer:
    """
    完整的仓位规模系统
    """
    def __init__(self, account_size, method='fixed_percentage'):
        self.account_size = account_size
        self.method = method
        self.max_position_pct = 0.20  # 每个仓位最多20%
        self.max_risk_pct = 0.02  # 每笔交易最多2%风险

    def calculate_position(self, entry_price, stop_loss, atr=None):
        """
        根据方法计算仓位规模
        """
        if self.method == 'fixed_percentage':
            shares = self._fixed_percentage(entry_price, stop_loss)

        elif self.method == 'atr_based':
            if atr is None:
                raise ValueError("ATR方法需要ATR")
            shares = self._atr_based(entry_price, atr)

        elif self.method == 'fixed_dollar':
            shares = self._fixed_dollar(entry_price, stop_loss)

        else:
            raise ValueError(f"未知方法：{self.method}")

        # 应用最大仓位规模限制
        max_shares = int((self.account_size * self.max_position_pct) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def _fixed_percentage(self, entry_price, stop_loss):
        """固定百分比方法"""
        risk_amount = self.account_size * self.max_risk_pct
        risk_per_share = abs(entry_price - stop_loss)
        return int(risk_amount / risk_per_share)

    def _atr_based(self, entry_price, atr, multiplier=2):
        """基于ATR的方法"""
        stop_loss = entry_price - (atr * multiplier)
        return self._fixed_percentage(entry_price, stop_loss)

    def _fixed_dollar(self, entry_price, stop_loss, risk_amount=2000):
        """固定美元方法"""
        risk_per_share = abs(entry_price - stop_loss)
        return int(risk_amount / risk_per_share)

    def validate_position(self, shares, entry_price):
        """
        验证仓位不违反限制
        """
        position_value = shares * entry_price
        position_pct = position_value / self.account_size

        checks = {
            'within_max_position': position_pct <= self.max_position_pct,
            'sufficient_capital': position_value <= self.account_size,
            'positive_shares': shares > 0
        }

        return all(checks.values()), checks

# 使用示例
sizer = PositionSizer(account_size=100000, method='fixed_percentage')

# 计算仓位
entry = 150
stop = 145
shares = sizer.calculate_position(entry, stop)

# 验证
valid, checks = sizer.validate_position(shares, entry)
print(f"仓位规模：{shares}股")
print(f"有效：{valid}")
print(f"检查：{checks}")
```

## 💰 仓位规模规则

### 规则1：每笔交易风险不超过2%

```python
def check_risk_limit(account_size, shares, entry_price, stop_loss, max_risk=0.02):
    """
    确保交易不超过风险限制
    """
    risk_amount = shares * abs(entry_price - stop_loss)
    risk_pct = risk_amount / account_size

    if risk_pct > max_risk:
        print(f"⚠️  风险过高：{risk_pct:.2%} > {max_risk:.2%}")
        # 减少仓位规模
        adjusted_shares = int((account_size * max_risk) / abs(entry_price - stop_loss))
        return adjusted_shares

    return shares
```

### 规则2：限制总投资组合风险

```python
def check_portfolio_risk(positions, account_size, max_portfolio_risk=0.06):
    """
    确保总投资组合风险不超过限制
    """
    total_risk = sum(pos['risk_amount'] for pos in positions)
    portfolio_risk_pct = total_risk / account_size

    if portfolio_risk_pct > max_portfolio_risk:
        print(f"⚠️  投资组合风险过高：{portfolio_risk_pct:.2%}")
        return False

    return True
```

### 规则3：根据信心调整仓位规模

```python
def confidence_adjusted_sizing(base_shares, confidence_level):
    """
    根据设置质量调整仓位规模

    confidence_level：0.5到1.5
        0.5 = 低信心（半仓）
        1.0 = 正常信心（全仓）
        1.5 = 高信心（1.5倍仓）
    """
    adjusted_shares = int(base_shares * confidence_level)
    return adjusted_shares

# 示例
base_shares = 100
high_confidence = confidence_adjusted_sizing(base_shares, 1.5)  # 150股
low_confidence = confidence_adjusted_sizing(base_shares, 0.5)   # 50股
```

## 📊 实践中的仓位规模

### 交易工作流程示例

```python
def execute_trade_with_sizing(ticker, entry_price, stop_loss, account_size):
    """
    带仓位规模的完整交易执行
    """
    # 1. 计算仓位规模
    sizer = PositionSizer(account_size, method='fixed_percentage')
    shares = sizer.calculate_position(entry_price, stop_loss)

    # 2. 验证仓位
    valid, checks = sizer.validate_position(shares, entry_price)

    if not valid:
        print(f"❌ 仓位无效：{checks}")
        return None

    # 3. 计算交易详情
    position_value = shares * entry_price
    risk_amount = shares * abs(entry_price - stop_loss)
    risk_pct = risk_amount / account_size

    # 4. 显示交易计划
    print(f"\n{'='*50}")
    print(f"交易计划：{ticker}")
    print(f"{'='*50}")
    print(f"入场价格：    ${entry_price:.2f}")
    print(f"止损：        ${stop_loss:.2f}")
    print(f"仓位规模：    {shares}股")
    print(f"仓位价值：    ${position_value:,.2f}")
    print(f"风险金额：    ${risk_amount:,.2f}")
    print(f"风险百分比：  {risk_pct:.2%}")
    print(f"{'='*50}\n")

    return {
        'ticker': ticker,
        'shares': shares,
        'entry': entry_price,
        'stop': stop_loss,
        'risk': risk_amount
    }

# 示例
trade = execute_trade_with_sizing('AAPL', 150, 145, 100000)
```

## ⚠️ 常见错误

1. **风险过大**："我很有信心，我会风险10%"
2. **忽略相关性**：多个相关仓位 = 集中风险
3. **不根据波动性调整**：所有股票相同规模
4. **复仇交易**：亏损后加倍仓位
5. **没有最大仓位规模**：一个仓位 = 账户的50%

## 🎓 检查您的理解

1. 为什么推荐每笔交易2%风险？
2. 仓位规模和风险金额有什么区别？
3. 基于ATR的规模如何工作？
4. 什么是凯利准则？
5. 为什么要限制最大仓位规模？

## 💻 实践练习

```python
# 计算不同场景的仓位规模
account = 100000

scenarios = [
    {'entry': 150, 'stop': 145, 'name': '紧止损'},
    {'entry': 150, 'stop': 140, 'name': '宽止损'},
    {'entry': 50, 'stop': 48, 'name': '低价'},
    {'entry': 500, 'stop': 490, 'name': '高价'}
]

sizer = PositionSizer(account, method='fixed_percentage')

for scenario in scenarios:
    shares = sizer.calculate_position(scenario['entry'], scenario['stop'])
    value = shares * scenario['entry']
    print(f"{scenario['name']:15s}：{shares:4d}股，${value:8,.0f}")
```

## 📝 练习5.1

创建：`exercises/module-05/exercise-5.1-position-sizing.md`

1. 实施所有仓位规模方法
2. 计算5笔不同交易的仓位
3. 比较方法（固定%、ATR、凯利）
4. 分析不同风险水平的影响（1%、2%、5%）
5. 记录哪种方法最适合您的风格

## 📚 资源

- [Van Tharp: Position Sizing](https://www.vantharp.com/position-sizing)
- [Investopedia: Position Sizing](https://www.investopedia.com/terms/p/positionsizing.asp)
- [Kelly Criterion Explained](https://www.investopedia.com/articles/trading/04/091504.asp)

## ✅ 解决方案

1. **2%风险**：允许50次连续亏损才会清零账户；可管理的回撤；心理舒适

2. **仓位规模vs风险**：仓位规模是总股数/价值；风险金额是止损触发时的损失；如果止损紧，可以有大仓位小风险

3. **基于ATR的规模**：使用平均真实范围设置止损距离；波动性大的股票获得较小仓位；不同波动性水平间风险一致

4. **凯利准则**：基于胜率和盈亏比的最优仓位规模数学公式；最大化长期增长；通常使用半凯利或四分之一凯利以安全

5. **最大仓位规模**：防止过度集中；一次糟糕的交易不会摧毁账户；保持多样化；减少情绪压力

---

**下一课**：[第5.2课：止损策略](lesson-02-stop-loss.md)
