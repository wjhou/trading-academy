# Lesson 5.1: Position Sizing - How Much to Risk

**Module**: 5 - Risk Management
**Estimated Time**: 60 minutes
**Difficulty**: Intermediate

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand why position sizing is critical
- Learn different position sizing methods
- Calculate optimal position sizes
- Implement position sizing in your trading
- Avoid common position sizing mistakes

## 📖 What is Position Sizing?

**Position Sizing** determines how many shares/contracts to trade based on your risk tolerance and account size.

### Why It's Critical

> "Position sizing is the only free lunch in trading" - Van K. Tharp

**Impact**:
- Too large: One bad trade wipes you out
- Too small: Can't make meaningful profits
- Just right: Consistent growth, manageable risk

### The Math

```
If you risk 10% per trade:
- 10 losing trades in a row = -65% account loss
- Need +186% to recover

If you risk 2% per trade:
- 10 losing trades in a row = -18% account loss
- Need +22% to recover
```

## 📊 Position Sizing Methods

### 1. Fixed Dollar Amount

**Concept**: Risk same dollar amount per trade

```python
def fixed_dollar_sizing(account_size, risk_amount, entry_price, stop_loss):
    """
    Risk fixed dollar amount per trade

    Example: Always risk $1,000 per trade
    """
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    return shares

# Example
account = 100000
risk = 1000  # Risk $1,000 per trade
entry = 150
stop = 145

shares = fixed_dollar_sizing(account, risk, entry, stop)
print(f"Position size: {shares} shares")
print(f"Total position: ${shares * entry:,.2f}")
print(f"Risk: ${shares * (entry - stop):,.2f}")
```

**Pros**: Simple, consistent dollar risk
**Cons**: Doesn't scale with account growth

### 2. Fixed Percentage (Most Common)

**Concept**: Risk fixed percentage of account per trade

```python
def fixed_percentage_sizing(account_size, risk_percent, entry_price, stop_loss):
    """
    Risk fixed percentage of account

    Common: 1-2% per trade
    """
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    # Ensure we don't exceed account
    max_shares = int(account_size / entry_price)
    shares = min(shares, max_shares)

    return shares

# Example
account = 100000
risk_pct = 0.02  # 2% risk
entry = 150
stop = 145

shares = fixed_percentage_sizing(account, risk_pct, entry, stop)
print(f"Position size: {shares} shares")
print(f"Position value: ${shares * entry:,.2f}")
print(f"Risk amount: ${shares * (entry - stop):,.2f} ({risk_pct:.1%})")
```

**Pros**: Scales with account, consistent risk
**Cons**: Can lead to large positions in low-volatility stocks

### 3. Volatility-Based (ATR)

**Concept**: Adjust position size based on stock volatility

```python
def atr_based_sizing(account_size, risk_percent, entry_price, atr, atr_multiplier=2):
    """
    Size position based on ATR (Average True Range)

    Stop loss = entry - (ATR × multiplier)
    """
    stop_loss = entry_price - (atr * atr_multiplier)
    risk_amount = account_size * risk_percent
    risk_per_share = abs(entry_price - stop_loss)
    shares = int(risk_amount / risk_per_share)

    return shares, stop_loss

# Example
account = 100000
risk_pct = 0.02
entry = 150
atr = 3.5  # Stock's ATR

shares, stop = atr_based_sizing(account, risk_pct, entry, atr, atr_multiplier=2)
print(f"Position size: {shares} shares")
print(f"Stop loss: ${stop:.2f}")
print(f"Risk per share: ${entry - stop:.2f}")
```

**Pros**: Adapts to volatility, consistent risk across different stocks
**Cons**: More complex, requires ATR calculation

### 4. Kelly Criterion

**Concept**: Optimal position size based on win rate and payoff ratio

```python
def kelly_criterion(win_rate, avg_win, avg_loss):
    """
    Calculate optimal position size using Kelly Criterion

    Kelly % = W - [(1 - W) / R]
    where:
        W = Win rate
        R = Avg Win / Avg Loss
    """
    if avg_loss == 0:
        return 0

    win_loss_ratio = abs(avg_win / avg_loss)
    kelly_pct = win_rate - ((1 - win_rate) / win_loss_ratio)

    # Use fractional Kelly (safer)
    fractional_kelly = kelly_pct * 0.5  # Half Kelly

    return max(0, fractional_kelly)

# Example
win_rate = 0.55  # 55% win rate
avg_win = 500
avg_loss = -300

kelly = kelly_criterion(win_rate, avg_win, avg_loss)
print(f"Kelly Criterion: {kelly:.2%}")
print(f"Half Kelly (recommended): {kelly * 0.5:.2%}")
```

**Pros**: Mathematically optimal for growth
**Cons**: Aggressive, requires accurate win rate/payoff data

### 5. Fixed Ratio

**Concept**: Increase position size after reaching profit targets

```python
class FixedRatioSizing:
    """
    Increase position size as account grows

    Delta = Amount needed to add 1 contract
    """
    def __init__(self, initial_contracts=1, delta=5000):
        self.contracts = initial_contracts
        self.delta = delta
        self.profit_target = delta

    def update(self, current_profit):
        """
        Update position size based on profit
        """
        if current_profit >= self.profit_target:
            self.contracts += 1
            self.profit_target += self.delta
            print(f"Increased to {self.contracts} contracts")

        return self.contracts

# Example
sizer = FixedRatioSizing(initial_contracts=1, delta=5000)
profits = [2000, 3000, 6000, 8000]

for profit in profits:
    contracts = sizer.update(profit)
    print(f"Profit: ${profit}, Contracts: {contracts}")
```

**Pros**: Conservative growth, protects capital
**Cons**: Slow to scale up

## 🎯 Complete Position Sizing System

```python
class PositionSizer:
    """
    Complete position sizing system
    """
    def __init__(self, account_size, method='fixed_percentage'):
        self.account_size = account_size
        self.method = method
        self.max_position_pct = 0.20  # Max 20% per position
        self.max_risk_pct = 0.02  # Max 2% risk per trade

    def calculate_position(self, entry_price, stop_loss, atr=None):
        """
        Calculate position size based on method
        """
        if self.method == 'fixed_percentage':
            shares = self._fixed_percentage(entry_price, stop_loss)

        elif self.method == 'atr_based':
            if atr is None:
                raise ValueError("ATR required for ATR-based sizing")
            shares = self._atr_based(entry_price, atr)

        elif self.method == 'fixed_dollar':
            shares = self._fixed_dollar(entry_price, stop_loss)

        else:
            raise ValueError(f"Unknown method: {self.method}")

        # Apply maximum position size limit
        max_shares = int((self.account_size * self.max_position_pct) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def _fixed_percentage(self, entry_price, stop_loss):
        """Fixed percentage method"""
        risk_amount = self.account_size * self.max_risk_pct
        risk_per_share = abs(entry_price - stop_loss)
        return int(risk_amount / risk_per_share)

    def _atr_based(self, entry_price, atr, multiplier=2):
        """ATR-based method"""
        stop_loss = entry_price - (atr * multiplier)
        return self._fixed_percentage(entry_price, stop_loss)

    def _fixed_dollar(self, entry_price, stop_loss, risk_amount=2000):
        """Fixed dollar method"""
        risk_per_share = abs(entry_price - stop_loss)
        return int(risk_amount / risk_per_share)

    def validate_position(self, shares, entry_price):
        """
        Validate position doesn't violate limits
        """
        position_value = shares * entry_price
        position_pct = position_value / self.account_size

        checks = {
            'within_max_position': position_pct <= self.max_position_pct,
            'sufficient_capital': position_value <= self.account_size,
            'positive_shares': shares > 0
        }

        return all(checks.values()), checks

# Example usage
sizer = PositionSizer(account_size=100000, method='fixed_percentage')

# Calculate position
entry = 150
stop = 145
shares = sizer.calculate_position(entry, stop)

# Validate
valid, checks = sizer.validate_position(shares, entry)
print(f"Position size: {shares} shares")
print(f"Valid: {valid}")
print(f"Checks: {checks}")
```

## 💰 Position Sizing Rules

### Rule 1: Never Risk More Than 2% Per Trade

```python
def check_risk_limit(account_size, shares, entry_price, stop_loss, max_risk=0.02):
    """
    Ensure trade doesn't exceed risk limit
    """
    risk_amount = shares * abs(entry_price - stop_loss)
    risk_pct = risk_amount / account_size

    if risk_pct > max_risk:
        print(f"⚠️  Risk too high: {risk_pct:.2%} > {max_risk:.2%}")
        # Reduce position size
        adjusted_shares = int((account_size * max_risk) / abs(entry_price - stop_loss))
        return adjusted_shares

    return shares
```

### Rule 2: Limit Total Portfolio Risk

```python
def check_portfolio_risk(positions, account_size, max_portfolio_risk=0.06):
    """
    Ensure total portfolio risk doesn't exceed limit
    """
    total_risk = sum(pos['risk_amount'] for pos in positions)
    portfolio_risk_pct = total_risk / account_size

    if portfolio_risk_pct > max_portfolio_risk:
        print(f"⚠️  Portfolio risk too high: {portfolio_risk_pct:.2%}")
        return False

    return True
```

### Rule 3: Scale Position Size with Confidence

```python
def confidence_adjusted_sizing(base_shares, confidence_level):
    """
    Adjust position size based on setup quality

    confidence_level: 0.5 to 1.5
        0.5 = Low confidence (half size)
        1.0 = Normal confidence (full size)
        1.5 = High confidence (1.5x size)
    """
    adjusted_shares = int(base_shares * confidence_level)
    return adjusted_shares

# Example
base_shares = 100
high_confidence = confidence_adjusted_sizing(base_shares, 1.5)  # 150 shares
low_confidence = confidence_adjusted_sizing(base_shares, 0.5)   # 50 shares
```

## 📊 Position Sizing in Practice

### Example Trade Workflow

```python
def execute_trade_with_sizing(ticker, entry_price, stop_loss, account_size):
    """
    Complete trade execution with position sizing
    """
    # 1. Calculate position size
    sizer = PositionSizer(account_size, method='fixed_percentage')
    shares = sizer.calculate_position(entry_price, stop_loss)

    # 2. Validate position
    valid, checks = sizer.validate_position(shares, entry_price)

    if not valid:
        print(f"❌ Position invalid: {checks}")
        return None

    # 3. Calculate trade details
    position_value = shares * entry_price
    risk_amount = shares * abs(entry_price - stop_loss)
    risk_pct = risk_amount / account_size

    # 4. Display trade plan
    print(f"\n{'='*50}")
    print(f"TRADE PLAN: {ticker}")
    print(f"{'='*50}")
    print(f"Entry Price:     ${entry_price:.2f}")
    print(f"Stop Loss:       ${stop_loss:.2f}")
    print(f"Position Size:   {shares} shares")
    print(f"Position Value:  ${position_value:,.2f}")
    print(f"Risk Amount:     ${risk_amount:,.2f}")
    print(f"Risk Percent:    {risk_pct:.2%}")
    print(f"{'='*50}\n")

    return {
        'ticker': ticker,
        'shares': shares,
        'entry': entry_price,
        'stop': stop_loss,
        'risk': risk_amount
    }

# Example
trade = execute_trade_with_sizing('AAPL', 150, 145, 100000)
```

## ⚠️ Common Mistakes

1. **Risking Too Much**: "I'm confident, I'll risk 10%"
2. **Ignoring Correlation**: Multiple correlated positions = concentrated risk
3. **Not Adjusting for Volatility**: Same size for all stocks
4. **Revenge Trading**: Doubling position after loss
5. **No Maximum Position Size**: One position = 50% of account

## 🎓 Check Your Understanding

1. Why is 2% risk per trade recommended?
2. What's the difference between position size and risk amount?
3. How does ATR-based sizing work?
4. What is the Kelly Criterion?
5. Why limit maximum position size?

## 💻 Hands-On Exercise

```python
# Calculate position sizes for different scenarios
account = 100000

scenarios = [
    {'entry': 150, 'stop': 145, 'name': 'Tight stop'},
    {'entry': 150, 'stop': 140, 'name': 'Wide stop'},
    {'entry': 50, 'stop': 48, 'name': 'Low price'},
    {'entry': 500, 'stop': 490, 'name': 'High price'}
]

sizer = PositionSizer(account, method='fixed_percentage')

for scenario in scenarios:
    shares = sizer.calculate_position(scenario['entry'], scenario['stop'])
    value = shares * scenario['entry']
    print(f"{scenario['name']:15s}: {shares:4d} shares, ${value:8,.0f}")
```

## 📝 Exercise 5.1

Create: `exercises/module-05/exercise-5.1-position-sizing.md`

1. Implement all position sizing methods
2. Calculate positions for 5 different trades
3. Compare methods (fixed %, ATR, Kelly)
4. Analyze impact of different risk levels (1%, 2%, 5%)
5. Document which method works best for your style

## 📚 Resources

- [Van Tharp: Position Sizing](https://www.vantharp.com/position-sizing)
- [Investopedia: Position Sizing](https://www.investopedia.com/terms/p/positionsizing.asp)
- [Kelly Criterion Explained](https://www.investopedia.com/articles/trading/04/091504.asp)

## ✅ Solutions

1. **2% risk**: Allows 50 consecutive losses before account wipes out; manageable drawdowns; psychological comfort

2. **Position size vs risk**: Position size is total shares/value; risk amount is what you lose if stop hit; can have large position with small risk if tight stop

3. **ATR-based sizing**: Uses Average True Range to set stop distance; volatile stocks get smaller positions; consistent risk across different volatility levels

4. **Kelly Criterion**: Mathematical formula for optimal position size based on win rate and win/loss ratio; maximizes long-term growth; often used at half or quarter Kelly for safety

5. **Maximum position size**: Prevents over-concentration; one bad trade can't destroy account; maintains diversification; reduces emotional pressure

---

**Next**: [Lesson 5.2: Stop-Loss Strategies](lesson-02-stop-loss.md)
