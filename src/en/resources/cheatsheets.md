# Trading Cheat Sheets

Quick reference guides for common trading concepts and formulas.

## Technical Indicators Quick Reference

### Momentum Indicators

**RSI (Relative Strength Index)**
```
RS = Average Gain / Average Loss
RSI = 100 - (100 / (1 + RS))

Interpretation:
- RSI > 70: Overbought
- RSI < 30: Oversold
- RSI = 50: Neutral
```

**MACD (Moving Average Convergence Divergence)**
```
MACD Line = EMA(12) - EMA(26)
Signal Line = EMA(9) of MACD
Histogram = MACD - Signal

Signals:
- MACD crosses above Signal: Bullish
- MACD crosses below Signal: Bearish
```

### Trend Indicators

**Moving Averages**
```
SMA = Sum of prices / N
EMA = Price × (2/(N+1)) + EMA_prev × (1 - 2/(N+1))

Common periods: 10, 20, 50, 100, 200
```

### Volatility Indicators

**Bollinger Bands**
```
Middle Band = SMA(20)
Upper Band = SMA(20) + 2 × StdDev
Lower Band = SMA(20) - 2 × StdDev
```

**ATR (Average True Range)**
```
TR = max(High - Low, |High - Close_prev|, |Low - Close_prev|)
ATR = EMA(TR, 14)
```

## Risk Management Formulas

### Position Sizing

**Fixed Fractional**
```
Position Size = (Account × Risk%) / (Entry - Stop Loss)
```

**Kelly Criterion**
```
f = (p × b - q) / b
Where: p = win probability, b = win/loss ratio, q = 1-p
```

### Risk Metrics

**Sharpe Ratio**
```
Sharpe = (Return - Risk-Free Rate) / Standard Deviation
```

**Maximum Drawdown**
```
MDD = (Trough - Peak) / Peak
```

**Expectancy**
```
Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
```

## Common Chart Patterns

### Reversal Patterns
- Head and Shoulders
- Double Top/Bottom
- Triple Top/Bottom

### Continuation Patterns
- Flags and Pennants
- Triangles (Ascending, Descending, Symmetrical)
- Rectangles

## Candlestick Patterns

### Bullish
- Hammer
- Bullish Engulfing
- Morning Star
- Piercing Pattern

### Bearish
- Shooting Star
- Bearish Engulfing
- Evening Star
- Dark Cloud Cover

## Pre-Trade Checklist

- [ ] Strategy signal confirmed
- [ ] Position size calculated
- [ ] Stop-loss level set
- [ ] Risk-reward ratio > 2:1
- [ ] Total portfolio risk within limits
- [ ] Market conditions suitable

---

**Tip**: Keep this cheat sheet handy while trading for quick reference.

