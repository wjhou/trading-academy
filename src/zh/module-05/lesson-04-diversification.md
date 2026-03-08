# 第5.4课：投资组合多样化 - 不要把所有鸡蛋放在一个篮子里

**模块**：5 - 风险管理
**预计时间**：40分钟
**难度**：中级

## 🎯 学习目标

- 理解多样化原则
- 学习相关性及其影响
- 实施投资组合配置策略
- 平衡多样化与集中
- 监控投资组合风险

## 📖 什么是多样化？

**多样化**将风险分散到多个不相关的资产上。

### 为什么要多样化？

- **降低波动性**：平滑权益曲线
- **限制单一股票风险**：一次糟糕的交易不会摧毁账户
- **捕获更多机会**：多种策略/行业
- **睡得更好**：减少集中带来的压力

## 📊 相关性

```python
def calculate_correlation(returns1, returns2):
    """
    计算两个资产之间的相关性

    -1.0 = 完全负相关
     0.0 = 无相关
    +1.0 = 完全正相关
    """
    import numpy as np
    correlation = np.corrcoef(returns1, returns2)[0, 1]
    return correlation

# 示例
import yfinance as yf

# 获取数据
aapl = yf.Ticker("AAPL").history(period="1y")['Close'].pct_change()
msft = yf.Ticker("MSFT").history(period="1y")['Close'].pct_change()
gld = yf.Ticker("GLD").history(period="1y")['Close'].pct_change()

# 计算相关性
corr_aapl_msft = calculate_correlation(aapl.dropna(), msft.dropna())
corr_aapl_gld = calculate_correlation(aapl.dropna(), gld.dropna())

print(f"AAPL-MSFT相关性：{corr_aapl_msft:.2f}")
print(f"AAPL-GLD相关性：{corr_aapl_gld:.2f}")
```

## 🎯 多样化策略

### 1. 行业多样化

```python
def check_sector_diversification(portfolio, max_sector_pct=0.30):
    """
    确保没有行业超过限制
    """
    sector_exposure = {}

    for position in portfolio:
        sector = position['sector']
        value = position['value']
        sector_exposure[sector] = sector_exposure.get(sector, 0) + value

    total_value = sum(sector_exposure.values())

    for sector, value in sector_exposure.items():
        pct = value / total_value
        if pct > max_sector_pct:
            print(f"⚠️  {sector}：{pct:.1%} > {max_sector_pct:.1%}")
            return False

    return True
```

### 2. 资产类别多样化

```python
def allocate_across_assets(total_capital):
    """
    跨资产类别配置
    """
    allocation = {
        'stocks': 0.60,      # 60%股票
        'bonds': 0.20,       # 20%债券
        'commodities': 0.10, # 10%商品
        'cash': 0.10         # 10%现金
    }

    amounts = {asset: total_capital * pct
               for asset, pct in allocation.items()}

    return amounts
```

### 3. 策略多样化

```python
def multi_strategy_allocation(capital):
    """
    跨不同策略配置
    """
    strategies = {
        'trend_following': 0.30,
        'mean_reversion': 0.25,
        'momentum': 0.25,
        'breakout': 0.20
    }

    return {strat: capital * pct for strat, pct in strategies.items()}
```

## 💰 仓位限制

```python
class PortfolioRiskManager:
    """
    管理投资组合级别的风险
    """
    def __init__(self, total_capital):
        self.total_capital = total_capital
        self.positions = {}

        # 限制
        self.max_position_pct = 0.15  # 每个仓位15%
        self.max_sector_pct = 0.30    # 每个行业30%
        self.max_correlated_positions = 3
        self.max_total_risk = 0.06    # 6%总投资组合风险

    def can_add_position(self, ticker, value, sector, risk_amount):
        """
        检查是否可以添加新仓位
        """
        # 检查仓位规模限制
        if value > self.total_capital * self.max_position_pct:
            return False, "仓位太大"

        # 检查行业限制
        sector_value = sum(p['value'] for p in self.positions.values()
                          if p['sector'] == sector)
        if (sector_value + value) > self.total_capital * self.max_sector_pct:
            return False, "超过行业限制"

        # 检查总风险
        total_risk = sum(p['risk'] for p in self.positions.values())
        if (total_risk + risk_amount) > self.total_capital * self.max_total_risk:
            return False, "超过总风险限制"

        return True, "OK"

    def add_position(self, ticker, value, sector, risk_amount):
        """
        添加仓位到投资组合
        """
        can_add, reason = self.can_add_position(ticker, value, sector, risk_amount)

        if not can_add:
            print(f"❌ 无法添加{ticker}：{reason}")
            return False

        self.positions[ticker] = {
            'value': value,
            'sector': sector,
            'risk': risk_amount
        }

        print(f"✓ 已添加{ticker}")
        return True

    def get_portfolio_stats(self):
        """
        计算投资组合统计
        """
        total_value = sum(p['value'] for p in self.positions.values())
        total_risk = sum(p['risk'] for p in self.positions.values())

        return {
            'num_positions': len(self.positions),
            'total_value': total_value,
            'total_risk': total_risk,
            'risk_pct': total_risk / self.total_capital,
            'invested_pct': total_value / self.total_capital
        }

# 示例
manager = PortfolioRiskManager(total_capital=100000)

# 尝试添加仓位
positions = [
    {'ticker': 'AAPL', 'value': 10000, 'sector': 'Tech', 'risk': 500},
    {'ticker': 'MSFT', 'value': 12000, 'sector': 'Tech', 'risk': 600},
    {'ticker': 'GOOGL', 'value': 11000, 'sector': 'Tech', 'risk': 550},
    {'ticker': 'JPM', 'value': 9000, 'sector': 'Finance', 'risk': 450},
]

for pos in positions:
    manager.add_position(**pos)

stats = manager.get_portfolio_stats()
print(f"\n投资组合统计：")
for key, value in stats.items():
    print(f"  {key}：{value}")
```

## 📊 最优仓位数量

```python
def calculate_optimal_positions(account_size, risk_per_trade=0.02):
    """
    计算最优仓位数量

    经验法则：大多数交易者5-15个仓位
    """
    # 最大并发仓位
    max_positions = int(1 / risk_per_trade)  # 2%风险 = 最多50个仓位

    # 实际限制
    if account_size < 10000:
        recommended = "3-5"
    elif account_size < 50000:
        recommended = "5-8"
    elif account_size < 100000:
        recommended = "8-12"
    else:
        recommended = "10-15"

    return recommended
```

## ⚠️ 过度多样化

**太多仓位**：
- 稀释回报
- 难以监控
- 增加成本
- "恶化多样化"

**最佳点**：大多数交易者5-15个仓位

## 🎓 检查您的理解

1. 什么是相关性？
2. 为什么要跨行业多样化？
3. 最优仓位数量是多少？
4. 什么是过度多样化？
5. 如何限制投资组合风险？

## 💻 练习

```python
# 构建多样化投资组合
manager = PortfolioRiskManager(100000)

# 您的任务：添加8-10个跨不同行业的仓位
# 确保适当的多样化
```

## 📝 练习5.4

创建：`exercises/module-05/exercise-5.4-diversification.md`

1. 构建10个仓位的投资组合
2. 计算行业敞口
3. 检查仓位之间的相关性
4. 确保没有行业>30%
5. 记录多样化策略

## 📚 资源

- [Investopedia: Diversification](https://www.investopedia.com/terms/d/diversification.asp)
- [Modern Portfolio Theory](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)

## ✅ 解决方案

1. **相关性**：衡量两个资产如何一起移动；+1 = 同方向，-1 = 相反，0 = 独立

2. **行业多样化**：减少行业特定事件的影响；不同行业在各种经济条件下表现不同

3. **最优仓位**：大多数交易者5-15个；足够多样化，足够少以有效监控

4. **过度多样化**：太多仓位稀释回报，增加成本，变得难以管理；"恶化多样化"

5. **限制投资组合风险**：设置最大总风险（例如6%），限制每个仓位（15%），限制每个行业（30%），监控相关性

---

**下一课**：[第5.5课：回撤管理](lesson-05-drawdown.md)
