# Hands-On Project: Chart Analysis

**Module**: 2 - Technical Analysis Basics
**Estimated Time**: 2-3 hours
**Difficulty**: Beginner to Intermediate

## 🎯 Project Objectives

Apply all Module 2 concepts to analyze real stocks:
- Identify candlestick patterns
- Draw support and resistance levels
- Determine trend direction and strength
- Analyze moving averages
- Evaluate volume confirmation
- Create a complete trading plan

## 📋 Project Overview

You will perform a comprehensive technical analysis on 3 stocks and create detailed trading plans for each.

### Deliverables

1. **Chart Analysis Report** for each stock
2. **Trading Plan** with entry, exit, and risk management
3. **Python Analysis Script** automating the analysis
4. **Presentation** of your findings

## 🔍 Part 1: Stock Selection

### Choose 3 Stocks

Select stocks from different categories:

1. **Large Cap Tech** (e.g., AAPL, MSFT, GOOGL, NVDA)
2. **Financial** (e.g., JPM, BAC, GS, V)
3. **Consumer** (e.g., AMZN, WMT, NKE, SBUX)

### Why Different Sectors?

- Different volatility characteristics
- Different volume patterns
- Practice adapting analysis to various stocks

## 📊 Part 2: Technical Analysis Checklist

For each stock, complete this analysis:

### 1. Candlestick Analysis

```markdown
## Candlestick Patterns

### Recent Patterns (Last 20 Days)
- [ ] Identify any single-candle patterns (doji, hammer, shooting star, etc.)
- [ ] Identify any multi-candle patterns (engulfing, morning/evening star, etc.)
- [ ] Note the context (trend before pattern)
- [ ] Assess pattern reliability

### Example Format:
**Pattern Found**: Bullish Engulfing
**Date**: March 1, 2026
**Context**: After 5-day downtrend
**Reliability**: High (confirmed by volume)
**Outcome**: Price rose 3% next day
```

### 2. Support and Resistance

```markdown
## Support and Resistance Levels

### Resistance Levels
1. **$XXX.XX** - Reason: Previous high (Date), tested 3 times
2. **$XXX.XX** - Reason: Round number + 200-day MA
3. **$XXX.XX** - Reason: Recent swing high

### Support Levels
1. **$XXX.XX** - Reason: Previous low (Date), strong bounce
2. **$XXX.XX** - Reason: 50-day MA + trendline
3. **$XXX.XX** - Reason: Volume profile peak

### Current Price Position
- Price: $XXX.XX
- Nearest Support: $XXX.XX (X.X% below)
- Nearest Resistance: $XXX.XX (X.X% above)
```

### 3. Trend Analysis

```markdown
## Trend Identification

### Primary Trend (Daily Chart)
- **Direction**: Uptrend / Downtrend / Sideways
- **Strength**: Strong / Moderate / Weak
- **Evidence**:
  - Higher highs and higher lows (or opposite)
  - Trendline: [Draw and describe]
  - MA alignment: Price vs 20/50/200-day MAs

### Secondary Trend (Weekly Chart)
- **Direction**: [Same analysis on weekly timeframe]
- **Alignment**: Does daily trend align with weekly?

### Trend Quality
- [ ] Clean trend with few whipsaws
- [ ] Consistent higher highs/lows
- [ ] Volume confirms trend direction
- [ ] MAs properly aligned
```

### 4. Moving Average Analysis

```markdown
## Moving Averages

### Current MA Values
- **20-day SMA**: $XXX.XX
- **50-day SMA**: $XXX.XX
- **200-day SMA**: $XXX.XX
- **Current Price**: $XXX.XX

### MA Alignment
- Price position: Above/Below all MAs
- MA order: [e.g., Price > 20 > 50 > 200 = Strong uptrend]
- Slope: All rising / All falling / Mixed

### Recent Crossovers
- **Golden Cross**: [Date if occurred in last 6 months]
- **Death Cross**: [Date if occurred in last 6 months]
- **Fast/Slow Cross**: [Any recent 20/50 crosses]

### MA as Support/Resistance
- Which MA is price respecting? [e.g., bouncing off 50-day]
- Recent tests: [Dates when price touched MA]
```

### 5. Volume Analysis

```markdown
## Volume Analysis

### Average Volume
- **20-day Average**: XXX,XXX shares
- **Today's Volume**: XXX,XXX shares
- **Ratio**: X.Xx (Today / Average)

### Volume Patterns
- [ ] Higher volume on up days (bullish)
- [ ] Higher volume on down days (bearish)
- [ ] Volume declining (divergence warning)
- [ ] Volume spike (climax or breakout)

### Recent Volume Events
- **Date**: [Recent high volume day]
- **Volume**: XXX,XXX (X.Xx average)
- **Price Action**: [What happened to price]
- **Interpretation**: [Breakout / Climax / etc.]

### Volume Confirmation
- Does volume confirm current trend? Yes / No
- Any divergences? [Describe if present]
```

## 💻 Part 3: Python Analysis Script

Create a script that automates the analysis:

```python
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

class TechnicalAnalyzer:
    def __init__(self, ticker, period="1y"):
        self.ticker = ticker
        self.df = yf.Ticker(ticker).history(period=period)
        self.prepare_data()

    def prepare_data(self):
        """Calculate all technical indicators"""
        # Moving averages
        self.df['SMA_20'] = self.df['Close'].rolling(20).mean()
        self.df['SMA_50'] = self.df['Close'].rolling(50).mean()
        self.df['SMA_200'] = self.df['Close'].rolling(200).mean()

        # Volume
        self.df['Avg_Volume'] = self.df['Volume'].rolling(20).mean()
        self.df['Volume_Ratio'] = self.df['Volume'] / self.df['Avg_Volume']

    def identify_trend(self):
        """Identify current trend"""
        price = self.df['Close'].iloc[-1]
        sma20 = self.df['SMA_20'].iloc[-1]
        sma50 = self.df['SMA_50'].iloc[-1]
        sma200 = self.df['SMA_200'].iloc[-1]

        if price > sma20 > sma50 > sma200:
            return "STRONG UPTREND"
        elif price > sma20 and price > sma50 and price > sma200:
            return "UPTREND"
        elif price < sma20 < sma50 < sma200:
            return "STRONG DOWNTREND"
        elif price < sma20 and price < sma50 and price < sma200:
            return "DOWNTREND"
        else:
            return "SIDEWAYS"

    def find_support_resistance(self, lookback=60):
        """Find key support and resistance levels"""
        recent_data = self.df.tail(lookback)

        # Find local maxima (resistance)
        resistance_levels = []
        for i in range(1, len(recent_data) - 1):
            if (recent_data['High'].iloc[i] > recent_data['High'].iloc[i-1] and
                recent_data['High'].iloc[i] > recent_data['High'].iloc[i+1]):
                resistance_levels.append(recent_data['High'].iloc[i])

        # Find local minima (support)
        support_levels = []
        for i in range(1, len(recent_data) - 1):
            if (recent_data['Low'].iloc[i] < recent_data['Low'].iloc[i-1] and
                recent_data['Low'].iloc[i] < recent_data['Low'].iloc[i+1]):
                support_levels.append(recent_data['Low'].iloc[i])

        # Cluster nearby levels
        def cluster(levels, tolerance=0.02):
            if not levels:
                return []
            sorted_levels = sorted(levels)
            clusters = [sorted_levels[0]]
            for level in sorted_levels[1:]:
                if level > clusters[-1] * (1 + tolerance):
                    clusters.append(level)
                else:
                    clusters[-1] = (clusters[-1] + level) / 2
            return clusters

        return {
            'support': cluster(support_levels)[-3:],  # Top 3
            'resistance': cluster(resistance_levels)[-3:]  # Top 3
        }

    def analyze_volume(self):
        """Analyze recent volume patterns"""
        current_volume = self.df['Volume'].iloc[-1]
        avg_volume = self.df['Avg_Volume'].iloc[-1]
        ratio = current_volume / avg_volume

        if ratio > 2.0:
            classification = "EXTREMELY HIGH"
        elif ratio > 1.5:
            classification = "HIGH"
        elif ratio > 0.8:
            classification = "NORMAL"
        else:
            classification = "LOW"

        return {
            'current': current_volume,
            'average': avg_volume,
            'ratio': ratio,
            'classification': classification
        }

    def generate_report(self):
        """Generate complete analysis report"""
        current_price = self.df['Close'].iloc[-1]
        trend = self.identify_trend()
        sr_levels = self.find_support_resistance()
        volume_analysis = self.analyze_volume()

        report = f"""
{'='*60}
TECHNICAL ANALYSIS REPORT: {self.ticker}
{'='*60}
Date: {datetime.now().strftime('%Y-%m-%d')}

CURRENT PRICE: ${current_price:.2f}

TREND ANALYSIS:
- Trend: {trend}
- 20-day SMA: ${self.df['SMA_20'].iloc[-1]:.2f}
- 50-day SMA: ${self.df['SMA_50'].iloc[-1]:.2f}
- 200-day SMA: ${self.df['SMA_200'].iloc[-1]:.2f}

SUPPORT LEVELS:
"""
        for i, level in enumerate(sr_levels['support'], 1):
            distance = ((current_price - level) / level) * 100
            report += f"  {i}. ${level:.2f} ({distance:+.2f}% from current)\n"

        report += "\nRESISTANCE LEVELS:\n"
        for i, level in enumerate(sr_levels['resistance'], 1):
            distance = ((level - current_price) / current_price) * 100
            report += f"  {i}. ${level:.2f} ({distance:+.2f}% from current)\n"

        report += f"""
VOLUME ANALYSIS:
- Current Volume: {volume_analysis['current']:,.0f}
- Average Volume: {volume_analysis['average']:,.0f}
- Ratio: {volume_analysis['ratio']:.2f}x
- Classification: {volume_analysis['classification']}

{'='*60}
"""
        return report

    def plot_analysis(self):
        """Create comprehensive chart"""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10),
                                        gridspec_kw={'height_ratios': [3, 1]})

        # Price and MAs
        ax1.plot(self.df.index, self.df['Close'], label='Price', linewidth=2)
        ax1.plot(self.df.index, self.df['SMA_20'], label='20-day SMA', alpha=0.7)
        ax1.plot(self.df.index, self.df['SMA_50'], label='50-day SMA', alpha=0.7)
        ax1.plot(self.df.index, self.df['SMA_200'], label='200-day SMA', alpha=0.7)

        # Support and Resistance
        sr_levels = self.find_support_resistance()
        for level in sr_levels['support']:
            ax1.axhline(y=level, color='green', linestyle='--', alpha=0.5)
        for level in sr_levels['resistance']:
            ax1.axhline(y=level, color='red', linestyle='--', alpha=0.5)

        ax1.set_title(f'{self.ticker} - Technical Analysis')
        ax1.set_ylabel('Price ($)')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Volume
        colors = ['green' if self.df['Close'].iloc[i] > self.df['Open'].iloc[i]
                  else 'red' for i in range(len(self.df))]
        ax2.bar(self.df.index, self.df['Volume'], color=colors, alpha=0.5)
        ax2.plot(self.df.index, self.df['Avg_Volume'], color='blue',
                 label='20-day Avg', linewidth=2)
        ax2.set_ylabel('Volume')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(f'{self.ticker}_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()

# Usage
if __name__ == "__main__":
    # Analyze your 3 stocks
    tickers = ["AAPL", "JPM", "AMZN"]  # Replace with your choices

    for ticker in tickers:
        print(f"\nAnalyzing {ticker}...")
        analyzer = TechnicalAnalyzer(ticker)
        print(analyzer.generate_report())
        analyzer.plot_analysis()
```

## 📝 Part 4: Trading Plan

For each stock, create a detailed trading plan:

```markdown
# Trading Plan: [TICKER]

## Analysis Summary
- **Trend**: [Uptrend/Downtrend/Sideways]
- **Strength**: [Strong/Moderate/Weak]
- **Key Levels**: Support at $XXX, Resistance at $XXX
- **Volume**: [Confirming/Diverging]

## Trade Setup

### Entry Strategy
- **Type**: Long / Short
- **Entry Price**: $XXX.XX
- **Entry Trigger**: [e.g., Break above $XXX with volume]
- **Confirmation**: [e.g., Close above resistance, volume > 1.5x avg]

### Risk Management
- **Stop Loss**: $XXX.XX
- **Stop Reason**: [e.g., Below support level]
- **Risk per Share**: $X.XX
- **Position Size**: XXX shares (based on 1-2% account risk)

### Profit Targets
- **Target 1**: $XXX.XX (X% gain) - Take 50% profit
- **Target 2**: $XXX.XX (X% gain) - Take 30% profit
- **Target 3**: $XXX.XX (X% gain) - Let 20% run with trailing stop

### Risk-Reward Ratio
- **Risk**: $X.XX per share
- **Reward**: $X.XX per share (to Target 1)
- **Ratio**: 1:X.X

## Trade Management
- [ ] Set stop loss immediately after entry
- [ ] Move stop to breakeven after Target 1
- [ ] Trail stop under recent lows after Target 2
- [ ] Review daily for pattern changes

## Alternative Scenarios

### If Price Drops Before Entry
- Wait for support test
- Look for bullish reversal pattern
- Re-evaluate if breaks support

### If Price Gaps Up
- Don't chase
- Wait for pullback to entry level
- Consider smaller position if must enter

## Notes
[Any additional observations or concerns]
```

## 🎯 Part 5: Presentation

Create a summary presentation (slides or document):

### Slide 1: Overview
- 3 stocks analyzed
- Date range
- Key findings summary

### Slide 2-4: Individual Stock Analysis
For each stock:
- Chart with annotations
- Key patterns identified
- S/R levels marked
- Trend assessment
- Volume analysis

### Slide 5-7: Trading Plans
For each stock:
- Entry/exit strategy
- Risk management
- Expected outcomes

### Slide 8: Lessons Learned
- What worked well in analysis
- Challenges faced
- Skills improved

## ✅ Submission Checklist

- [ ] 3 stocks analyzed from different sectors
- [ ] Complete technical analysis for each (candlesticks, S/R, trend, MA, volume)
- [ ] Python script runs without errors
- [ ] Charts generated and saved
- [ ] Trading plans completed with all sections
- [ ] Risk-reward ratios calculated
- [ ] Presentation created
- [ ] All files organized in project folder

## 📁 Project Structure

```
module-02-project/
├── analysis/
│   ├── AAPL_analysis.md
│   ├── JPM_analysis.md
│   └── AMZN_analysis.md
├── trading_plans/
│   ├── AAPL_plan.md
│   ├── JPM_plan.md
│   └── AMZN_plan.md
├── charts/
│   ├── AAPL_analysis.png
│   ├── JPM_analysis.png
│   └── AMZN_analysis.png
├── scripts/
│   └── technical_analyzer.py
├── presentation/
│   └── module_02_project.pdf
└── README.md
```

## 🎓 Evaluation Criteria

Your project will be evaluated on:

1. **Completeness** (30%): All sections filled out
2. **Accuracy** (25%): Correct identification of patterns and levels
3. **Analysis Quality** (20%): Depth of insights
4. **Code Quality** (15%): Script works and is well-organized
5. **Trading Plan** (10%): Realistic and well-thought-out

## 🚀 Next Steps

After completing this project:

1. **Track Your Predictions**: Monitor the stocks for 2-4 weeks
2. **Compare Results**: Did price move as you predicted?
3. **Learn**: What worked? What didn't?
4. **Iterate**: Refine your analysis process

## 💡 Tips for Success

- **Take Your Time**: Quality over speed
- **Be Objective**: Don't force patterns that aren't there
- **Use Multiple Timeframes**: Check weekly and daily charts
- **Document Everything**: Write down your reasoning
- **Stay Organized**: Keep files well-structured
- **Ask Questions**: If stuck, review lessons or research

## 📚 Resources

- Module 2 Lessons (review as needed)
- [TradingView](https://www.tradingview.com) for charting
- [Yahoo Finance](https://finance.yahoo.com) for data
- [Investopedia](https://www.investopedia.com) for concepts

---

**Ready to start?** Create your project folder and begin with stock selection!

**Questions?** Review the relevant lessons or check the FAQ in resources.

**Completed the project?** ✓ Mark Module 2 complete and move to [Module 3: Technical Indicators](../module-03/lesson-01-momentum.md)
