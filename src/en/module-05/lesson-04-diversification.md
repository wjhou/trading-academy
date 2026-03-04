# Lesson 5.4: Portfolio Diversification - Don't Put All Eggs in One Basket

**Module**: 5 - Risk Management
**Estimated Time**: 40 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

- Understand diversification principles
- Learn correlation and its impact
- Implement portfolio allocation strategies
- Balance diversification vs concentration
- Monitor portfolio risk

## 📖 What is Diversification?

**Diversification** spreads risk across multiple uncorrelated assets.

### Why Diversify?

- **Reduce volatility**: Smooth equity curve
- **Limit single-stock risk**: One bad trade won't destroy account
- **Capture more opportunities**: Multiple strategies/sectors
- **Sleep better**: Less stress from concentration

## 📊 Correlation

```python
def calculate_correlation(returns1, returns2):
    """
    Calculate correlation between two assets

    -1.0 = Perfect negative correlation
     0.0 = No correlation
    +1.0 = Perfect positive correlation
    """
    import numpy as np
    correlation = np.corrcoef(returns1, returns2)[0, 1]
    return correlation

# Example
import yfinance as yf

# Get data
aapl = yf.Ticker("AAPL").history(period="1y")['Close'].pct_change()
msft = yf.Ticker("MSFT").history(period="1y")['Close'].pct_change()
gld = yf.Ticker("GLD").history(period="1y")['Close'].pct_change()

# Calculate correlations
corr_aapl_msft = calculate_correlation(aapl.dropna(), msft.dropna())
corr_aapl_gld = calculate_correlation(aapl.dropna(), gld.dropna())

print(f"AAPL-MSFT correlation: {corr_aapl_msft:.2f}")
print(f"AAPL-GLD correlation: {corr_aapl_gld:.2f}")
```

## 🎯 Diversification Strategies

### 1. Sector Diversification

```python
def check_sector_diversification(portfolio, max_sector_pct=0.30):
    """
    Ensure no sector exceeds limit
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
            print(f"⚠️  {sector}: {pct:.1%} > {max_sector_pct:.1%}")
            return False

    return True
```

### 2. Asset Class Diversification

```python
def allocate_across_assets(total_capital):
    """
    Allocate across asset classes
    """
    allocation = {
        'stocks': 0.60,      # 60% stocks
        'bonds': 0.20,       # 20% bonds
        'commodities': 0.10, # 10% commodities
        'cash': 0.10         # 10% cash
    }

    amounts = {asset: total_capital * pct
               for asset, pct in allocation.items()}

    return amounts
```

### 3. Strategy Diversification

```python
def multi_strategy_allocation(capital):
    """
    Allocate across different strategies
    """
    strategies = {
        'trend_following': 0.30,
        'mean_reversion': 0.25,
        'momentum': 0.25,
        'breakout': 0.20
    }

    return {strat: capital * pct for strat, pct in strategies.items()}
```

## 💰 Position Limits

```python
class PortfolioRiskManager:
    """
    Manage portfolio-level risk
    """
    def __init__(self, total_capital):
        self.total_capital = total_capital
        self.positions = {}

        # Limits
        self.max_position_pct = 0.15  # 15% per position
        self.max_sector_pct = 0.30    # 30% per sector
        self.max_correlated_positions = 3
        self.max_total_risk = 0.06    # 6% total portfolio risk

    def can_add_position(self, ticker, value, sector, risk_amount):
        """
        Check if can add new position
        """
        # Check position size limit
        if value > self.total_capital * self.max_position_pct:
            return False, "Position too large"

        # Check sector limit
        sector_value = sum(p['value'] for p in self.positions.values()
                          if p['sector'] == sector)
        if (sector_value + value) > self.total_capital * self.max_sector_pct:
            return False, "Sector limit exceeded"

        # Check total risk
        total_risk = sum(p['risk'] for p in self.positions.values())
        if (total_risk + risk_amount) > self.total_capital * self.max_total_risk:
            return False, "Total risk limit exceeded"

        return True, "OK"

    def add_position(self, ticker, value, sector, risk_amount):
        """
        Add position to portfolio
        """
        can_add, reason = self.can_add_position(ticker, value, sector, risk_amount)

        if not can_add:
            print(f"❌ Cannot add {ticker}: {reason}")
            return False

        self.positions[ticker] = {
            'value': value,
            'sector': sector,
            'risk': risk_amount
        }

        print(f"✓ Added {ticker}")
        return True

    def get_portfolio_stats(self):
        """
        Calculate portfolio statistics
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

# Example
manager = PortfolioRiskManager(total_capital=100000)

# Try to add positions
positions = [
    {'ticker': 'AAPL', 'value': 10000, 'sector': 'Tech', 'risk': 500},
    {'ticker': 'MSFT', 'value': 12000, 'sector': 'Tech', 'risk': 600},
    {'ticker': 'GOOGL', 'value': 11000, 'sector': 'Tech', 'risk': 550},
    {'ticker': 'JPM', 'value': 9000, 'sector': 'Finance', 'risk': 450},
]

for pos in positions:
    manager.add_position(**pos)

stats = manager.get_portfolio_stats()
print(f"\nPortfolio Stats:")
for key, value in stats.items():
    print(f"  {key}: {value}")
```

## 📊 Optimal Number of Positions

```python
def calculate_optimal_positions(account_size, risk_per_trade=0.02):
    """
    Calculate optimal number of positions

    Rule of thumb: 5-15 positions for most traders
    """
    # Maximum concurrent positions
    max_positions = int(1 / risk_per_trade)  # 2% risk = max 50 positions

    # Practical limits
    if account_size < 10000:
        recommended = 3-5
    elif account_size < 50000:
        recommended = 5-8
    elif account_size < 100000:
        recommended = 8-12
    else:
        recommended = 10-15

    return min(max_positions, recommended)
```

## ⚠️ Over-Diversification

**Too many positions**:
- Diluted returns
- Hard to monitor
- Increased costs
- "Diworsification"

**Sweet spot**: 5-15 positions for most traders

## 🎓 Check Your Understanding

1. What is correlation?
2. Why diversify across sectors?
3. What's the optimal number of positions?
4. What is over-diversification?
5. How do you limit portfolio risk?

## 💻 Exercise

```python
# Build diversified portfolio
manager = PortfolioRiskManager(100000)

# Your task: Add 8-10 positions across different sectors
# Ensure proper diversification
```

## 📝 Exercise 5.4

Create: `exercises/module-05/exercise-5.4-diversification.md`

1. Build a 10-position portfolio
2. Calculate sector exposures
3. Check correlations between positions
4. Ensure no sector > 30%
5. Document diversification strategy

## 📚 Resources

- [Investopedia: Diversification](https://www.investopedia.com/terms/d/diversification.asp)
- [Modern Portfolio Theory](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)

## ✅ Solutions

1. **Correlation**: Measure of how two assets move together; +1 = same direction, -1 = opposite, 0 = independent

2. **Sector diversification**: Reduces impact of sector-specific events; different sectors perform differently in various economic conditions

3. **Optimal positions**: 5-15 for most traders; enough for diversification, few enough to monitor effectively

4. **Over-diversification**: Too many positions dilute returns, increase costs, become hard to manage; "diworsification"

5. **Limit portfolio risk**: Set maximum total risk (e.g., 6%), limit per position (15%), limit per sector (30%), monitor correlations

---

**Next**: [Lesson 5.5: Drawdown Management](lesson-05-drawdown.md)
