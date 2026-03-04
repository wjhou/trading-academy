# Hands-On Project: Build Your Trading Strategy

**Module**: 4 - Trading Strategies
**Estimated Time**: 4-5 hours
**Difficulty**: Intermediate to Advanced

## 🎯 Project Objectives

Design, implement, and validate a complete trading strategy:
- Choose strategy type based on market analysis
- Implement entry and exit rules
- Add risk management
- Backtest thoroughly
- Validate robustness
- Document complete system

## 📋 Project Overview

You will create a production-ready trading strategy from scratch, following professional development practices.

### Deliverables

1. **Strategy Document** (`STRATEGY.md`)
2. **Implementation** (`strategy.py`)
3. **Backtest Results** (`backtest_results.py`)
4. **Validation Report** (`VALIDATION.md`)
5. **Live Trading Plan** (`DEPLOYMENT.md`)

## 🎯 Part 1: Strategy Selection

Choose ONE strategy type to implement:

### Option A: Trend Following
- Moving average crossover with filters
- Donchian channel breakout
- ADX-based trend system

### Option B: Mean Reversion
- Bollinger Band bounce
- RSI oversold/overbought
- Z-score reversion

### Option C: Momentum
- Relative strength rotation
- Breakout momentum
- Sector rotation

### Option D: Hybrid
- Combine 2-3 approaches
- Market regime switching
- Multi-timeframe system

## 📝 Part 2: Strategy Document

Create `STRATEGY.md`:

```markdown
# [Your Strategy Name]

## Executive Summary
[2-3 sentence description of strategy]

## Economic Rationale
**Why this strategy should work:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

## Market Conditions
**Works best in:**
- [Condition 1]
- [Condition 2]

**Avoid in:**
- [Condition 1]
- [Condition 2]

## Entry Rules
1. [Rule 1]
2. [Rule 2]
3. [Rule 3]

**Entry Confirmation:**
- [Confirmation 1]
- [Confirmation 2]

## Exit Rules

### Profit Targets
- Target 1: [X%] - Take [Y%] profit
- Target 2: [X%] - Take [Y%] profit
- Trailing stop: [Description]

### Stop Loss
- Initial stop: [Method]
- Trailing stop: [Method]
- Time stop: [X days]

## Position Sizing
- Risk per trade: [X%]
- Maximum position: [X%]
- Method: [Fixed fractional / ATR-based / etc]

## Risk Management
- Maximum drawdown: [X%]
- Maximum concurrent positions: [X]
- Correlation limits: [Description]

## Parameters
| Parameter | Value | Range Tested |
|-----------|-------|--------------|
| MA Fast   | 50    | 20-100       |
| MA Slow   | 200   | 100-300      |
| RSI Period| 14    | 7-21         |
| ...       | ...   | ...          |

## Expected Performance
- Target Sharpe: [X]
- Target Win Rate: [X%]
- Target CAGR: [X%]
- Maximum Drawdown: [X%]
```

## 💻 Part 3: Implementation

Create `strategy.py`:

```python
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime

class MyTradingStrategy:
    """
    [Your Strategy Name]

    Description: [Brief description]
    """

    def __init__(self, **params):
        """
        Initialize strategy with parameters
        """
        # Strategy parameters
        self.params = params

        # State
        self.positions = {}
        self.trades = []
        self.equity_curve = []

    def calculate_indicators(self, df):
        """
        Calculate all technical indicators
        """
        # Example: Moving averages
        df['MA_Fast'] = df['Close'].rolling(self.params['ma_fast']).mean()
        df['MA_Slow'] = df['Close'].rolling(self.params['ma_slow']).mean()

        # Add your indicators here
        # ...

        return df

    def generate_entry_signal(self, df):
        """
        Generate entry signals

        Returns:
            str: 'BUY', 'SELL', or 'HOLD'
        """
        current = df.iloc[-1]

        # Implement your entry logic
        # Example:
        if current['MA_Fast'] > current['MA_Slow']:
            # Add additional filters
            if self._confirm_entry(df):
                return 'BUY'

        elif current['MA_Fast'] < current['MA_Slow']:
            if self._confirm_entry(df):
                return 'SELL'

        return 'HOLD'

    def _confirm_entry(self, df):
        """
        Additional entry confirmation filters
        """
        # Add your confirmation logic
        # Example: volume, RSI, etc.
        return True

    def calculate_position_size(self, df, account_value, entry_price):
        """
        Calculate position size based on risk
        """
        # Calculate stop loss
        stop_loss = self.calculate_stop_loss(df, entry_price, 'LONG')

        # Risk amount
        risk_amount = account_value * self.params['risk_per_trade']

        # Risk per share
        risk_per_share = abs(entry_price - stop_loss)

        # Position size
        shares = int(risk_amount / risk_per_share)

        # Limit to maximum position size
        max_shares = int((account_value * self.params['max_position_pct']) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def calculate_stop_loss(self, df, entry_price, direction):
        """
        Calculate stop loss level
        """
        # Implement your stop loss logic
        # Example: ATR-based
        atr = self.calculate_atr(df)
        multiplier = self.params['atr_stop_multiplier']

        if direction == 'LONG':
            stop = entry_price - (multiplier * atr)
        else:
            stop = entry_price + (multiplier * atr)

        return stop

    def calculate_atr(self, df, period=14):
        """
        Calculate Average True Range
        """
        high_low = df['High'] - df['Low']
        high_close = abs(df['High'] - df['Close'].shift())
        low_close = abs(df['Low'] - df['Close'].shift())

        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(period).mean()

        return atr.iloc[-1]

    def should_exit(self, df, position):
        """
        Check if should exit position

        Args:
            df: DataFrame with price data
            position: dict with position info

        Returns:
            tuple: (should_exit: bool, reason: str)
        """
        current_price = df['Close'].iloc[-1]

        # Stop loss
        if position['direction'] == 'LONG':
            if current_price <= position['stop_loss']:
                return True, 'STOP_LOSS'

            # Take profit
            if current_price >= position['take_profit']:
                return True, 'TAKE_PROFIT'

        # Add more exit conditions
        # ...

        return False, None

    def backtest(self, df, initial_capital=100000):
        """
        Backtest strategy on historical data
        """
        df = self.calculate_indicators(df)

        capital = initial_capital
        position = None

        for i in range(self.params['ma_slow'], len(df)):
            current_df = df.iloc[:i+1]
            current = current_df.iloc[-1]

            # Check exit if in position
            if position:
                should_exit, reason = self.should_exit(current_df, position)

                if should_exit:
                    # Calculate P&L
                    if position['direction'] == 'LONG':
                        pnl = (current['Close'] - position['entry_price']) * position['shares']
                    else:
                        pnl = (position['entry_price'] - current['Close']) * position['shares']

                    capital += pnl

                    # Record trade
                    self.trades.append({
                        'entry_date': position['entry_date'],
                        'exit_date': current.name,
                        'direction': position['direction'],
                        'entry_price': position['entry_price'],
                        'exit_price': current['Close'],
                        'shares': position['shares'],
                        'pnl': pnl,
                        'pnl_pct': pnl / (position['entry_price'] * position['shares']),
                        'exit_reason': reason
                    })

                    position = None

            # Check entry if not in position
            if not position:
                signal = self.generate_entry_signal(current_df)

                if signal in ['BUY', 'SELL']:
                    entry_price = current['Close']
                    shares = self.calculate_position_size(current_df, capital, entry_price)

                    if shares > 0:
                        position = {
                            'direction': 'LONG' if signal == 'BUY' else 'SHORT',
                            'entry_date': current.name,
                            'entry_price': entry_price,
                            'shares': shares,
                            'stop_loss': self.calculate_stop_loss(current_df, entry_price, 'LONG' if signal == 'BUY' else 'SHORT'),
                            'take_profit': entry_price * 1.10  # Example: 10% profit target
                        }

            # Record equity
            equity = capital
            if position:
                if position['direction'] == 'LONG':
                    equity += (current['Close'] - position['entry_price']) * position['shares']
                else:
                    equity += (position['entry_price'] - current['Close']) * position['shares']

            self.equity_curve.append({
                'date': current.name,
                'equity': equity
            })

        return self.calculate_metrics(initial_capital)

    def calculate_metrics(self, initial_capital):
        """
        Calculate performance metrics
        """
        if not self.trades:
            return {}

        # Convert to DataFrame
        trades_df = pd.DataFrame(self.trades)
        equity_df = pd.DataFrame(self.equity_curve)

        # Calculate metrics
        total_trades = len(trades_df)
        winning_trades = len(trades_df[trades_df['pnl'] > 0])
        losing_trades = len(trades_df[trades_df['pnl'] < 0])

        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        total_pnl = trades_df['pnl'].sum()
        final_capital = equity_df['equity'].iloc[-1]
        total_return = (final_capital - initial_capital) / initial_capital

        # Calculate Sharpe ratio
        equity_df['returns'] = equity_df['equity'].pct_change()
        sharpe = (equity_df['returns'].mean() / equity_df['returns'].std()) * np.sqrt(252)

        # Maximum drawdown
        equity_df['cummax'] = equity_df['equity'].cummax()
        equity_df['drawdown'] = (equity_df['equity'] - equity_df['cummax']) / equity_df['cummax']
        max_drawdown = equity_df['drawdown'].min()

        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'total_return': total_return,
            'final_capital': final_capital,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_drawdown,
            'avg_win': trades_df[trades_df['pnl'] > 0]['pnl'].mean() if winning_trades > 0 else 0,
            'avg_loss': trades_df[trades_df['pnl'] < 0]['pnl'].mean() if losing_trades > 0 else 0
        }

# Example usage
if __name__ == "__main__":
    # Define parameters
    params = {
        'ma_fast': 50,
        'ma_slow': 200,
        'risk_per_trade': 0.02,
        'max_position_pct': 0.10,
        'atr_stop_multiplier': 2.0
    }

    # Initialize strategy
    strategy = MyTradingStrategy(**params)

    # Get data
    df = yf.Ticker("SPY").history(period="5y")

    # Backtest
    results = strategy.backtest(df)

    # Print results
    print("\nBacktest Results:")
    print("-" * 50)
    for key, value in results.items():
        if isinstance(value, float):
            if 'rate' in key or 'return' in key or 'drawdown' in key:
                print(f"{key:20s}: {value:.2%}")
            else:
                print(f"{key:20s}: {value:.2f}")
        else:
            print(f"{key:20s}: {value}")
```

## 📊 Part 4: Validation

Create `VALIDATION.md`:

```markdown
# Strategy Validation Report

## 1. Backtest Results

### Performance Metrics
- Total Return: [X%]
- CAGR: [X%]
- Sharpe Ratio: [X]
- Max Drawdown: [X%]
- Win Rate: [X%]
- Profit Factor: [X]

### Trade Statistics
- Total Trades: [X]
- Average Trade: [X%]
- Best Trade: [X%]
- Worst Trade: [X%]

## 2. Robustness Tests

### Parameter Sensitivity
[Table showing performance across parameter ranges]

### Out-of-Sample Performance
- In-sample (2019-2021): [Results]
- Out-of-sample (2022-2024): [Results]

### Multiple Markets
[Results on different stocks/ETFs]

## 3. Walk-Forward Analysis
[Results from walk-forward optimization]

## 4. Monte Carlo Simulation
[Results from Monte Carlo analysis]

## 5. Checklist
- [ ] Positive expectancy
- [ ] Sufficient trades (>30)
- [ ] Acceptable drawdown (<30%)
- [ ] Positive Sharpe (>0.5)
- [ ] Works out-of-sample
- [ ] Parameter stable
- [ ] Economic rationale sound

## 6. Conclusion
[Pass/Fail and reasoning]
```

## 🚀 Part 5: Deployment Plan

Create `DEPLOYMENT.md`:

```markdown
# Live Trading Deployment Plan

## Pre-Deployment

### 1. Paper Trading
- Duration: [X weeks/months]
- Platform: [Platform name]
- Success criteria: [Metrics]

### 2. Risk Limits
- Maximum account risk: [X%]
- Maximum position size: [X%]
- Daily loss limit: [X%]

### 3. Monitoring
- Check frequency: [Daily/Weekly]
- Key metrics to watch: [List]
- Alert thresholds: [List]

## Deployment

### Phase 1: Small Capital
- Capital: [$X]
- Duration: [X months]
- Review: [Schedule]

### Phase 2: Scale Up
- Conditions for scaling: [List]
- Target capital: [$X]

## Ongoing Management

### Daily Tasks
- [ ] Check positions
- [ ] Review alerts
- [ ] Update stops

### Weekly Tasks
- [ ] Review performance
- [ ] Check for regime changes
- [ ] Rebalance if needed

### Monthly Tasks
- [ ] Full performance review
- [ ] Parameter check
- [ ] Strategy adjustment if needed

## Emergency Procedures
- Market crash: [Action]
- System failure: [Action]
- Unexpected loss: [Action]
```

## ✅ Project Checklist

- [ ] Strategy document complete
- [ ] Code implemented and tested
- [ ] Backtest shows positive results
- [ ] Robustness tests passed
- [ ] Validation report complete
- [ ] Deployment plan ready
- [ ] All code documented
- [ ] Results visualized

## 🎓 Evaluation Criteria

1. **Strategy Design** (25%): Clear rationale, well-defined rules
2. **Implementation** (25%): Clean code, proper structure
3. **Testing** (25%): Thorough backtesting and validation
4. **Documentation** (15%): Complete and clear
5. **Results** (10%): Realistic and achievable

## 📚 Submission

Submit in folder: `module-04-project/`

```
module-04-project/
├── STRATEGY.md
├── strategy.py
├── backtest_results.py
├── VALIDATION.md
├── DEPLOYMENT.md
├── charts/
│   ├── equity_curve.png
│   ├── drawdown.png
│   └── parameter_sensitivity.png
└── README.md
```

---

**Completed Module 4?** ✓ Move to [Module 5: Risk Management](../module-05/lesson-01-position-sizing.md)
