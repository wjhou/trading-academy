# Frequently Asked Questions (FAQ)

Common questions about algorithmic trading and this book.

## Getting Started

### Q: Do I need programming experience to use this book?

**A**: Basic Python knowledge is recommended. If you're new to Python, start with the Python Basics appendix. You don't need to be an expert programmer—the book teaches you what you need as you go.

### Q: How much capital do I need to start trading?

**A**: For learning and paper trading, you need $0. For live trading, start with at least $5,000-$10,000 to properly diversify and manage risk. Many brokers allow you to start with less, but proper position sizing becomes difficult with very small accounts.

### Q: Can I really make money with algorithmic trading?

**A**: Yes, but it's not easy or guaranteed. Successful algo trading requires:
- Solid strategies with genuine edge
- Rigorous testing and validation
- Proper risk management
- Continuous monitoring and adaptation
- Realistic expectations

Most retail traders lose money. This book teaches you how to avoid common pitfalls and build robust systems.

### Q: How long does it take to become profitable?

**A**: Typically 1-3 years of serious study and practice. The learning path:
- Months 1-3: Learn basics, paper trade
- Months 4-12: Develop and test strategies
- Year 2: Refine systems, small live trading
- Year 3+: Scale up if consistently profitable

There are no shortcuts. Anyone promising quick riches is lying.

## Technical Questions

### Q: What programming language should I use?

**A**: Python is recommended for beginners and most strategies because:
- Easy to learn and read
- Excellent libraries (pandas, numpy, scikit-learn)
- Large trading community
- Good for research and backtesting

For high-frequency trading, consider C++ or Rust for speed. But start with Python.

### Q: What broker should I use?

**A**: Popular choices for algo trading:
- **Interactive Brokers**: Professional features, API access, low costs
- **Alpaca**: Commission-free, good API, US stocks only
- **TD Ameritrade**: thinkorswim platform, good for learning
- **TradeStation**: Built for algo trading, higher costs

Choose based on your needs, location, and asset classes.

### Q: Do I need expensive data?

**A**: No, not initially. Free sources like:
- yfinance (Yahoo Finance)
- Alpha Vantage
- Quandl (some free data)

Are sufficient for learning and many strategies. Professional data becomes important for HFT or specific strategies.

### Q: What computer do I need?

**A**: For learning and most strategies:
- Any modern laptop (8GB+ RAM)
- No special hardware needed
- Cloud computing (AWS, Google Cloud) for heavy backtesting

HFT requires specialized infrastructure, but that's advanced.

## Strategy Development

### Q: Where do I find trading ideas?

**A**: Sources for strategy ideas:
- Academic papers (SSRN, arXiv)
- Trading books and blogs
- Market observations
- Combining existing indicators
- Your own hypotheses

Always test ideas rigorously before trading them.

### Q: How do I know if my strategy is good?

**A**: Key metrics to evaluate:
- **Sharpe Ratio**: >1.5 is good, >2 is excellent
- **Win Rate**: 50%+ for trend following, 60%+ for mean reversion
- **Max Drawdown**: <20% ideally
- **Consistency**: Profitable across different market conditions
- **Out-of-sample performance**: Similar to in-sample

No single metric tells the whole story. Look at the complete picture.

### Q: My backtest shows 100% win rate. Is this good?

**A**: No, it's a red flag! This indicates:
- Overfitting to historical data
- Look-ahead bias
- Data snooping
- Unrealistic assumptions

Real strategies have losses. A 100% win rate means your backtest is flawed.

### Q: How many strategies should I trade?

**A**: Start with 1-2 well-tested strategies. As you gain experience:
- 3-5 strategies for diversification
- Different timeframes and asset classes
- Uncorrelated approaches

More isn't always better. Quality over quantity.

## Risk Management

### Q: How much should I risk per trade?

**A**: General guidelines:
- **Conservative**: 0.5-1% of capital per trade
- **Moderate**: 1-2% per trade
- **Aggressive**: 2-3% per trade (not recommended)

Never risk more than you can afford to lose. Use the Kelly Criterion for optimal sizing.

### Q: Should I use stop-losses?

**A**: Yes, almost always. Stop-losses:
- Limit losses on individual trades
- Protect against catastrophic events
- Enforce discipline

Some mean-reversion strategies use time-based exits instead, but most strategies need stop-losses.

### Q: How do I handle drawdowns?

**A**: When experiencing drawdowns:
1. Don't panic—drawdowns are normal
2. Review your strategy (is it still valid?)
3. Check for implementation errors
4. Consider reducing position sizes
5. Don't abandon a good strategy too quickly

Have a plan before drawdowns occur.

## Backtesting

### Q: How much historical data do I need?

**A**: Minimum recommendations:
- **Daily strategies**: 5-10 years
- **Intraday strategies**: 2-3 years
- **HFT strategies**: 6-12 months

More data is better, but ensure it's relevant to current market conditions.

### Q: Should I include transaction costs?

**A**: Absolutely! Always include:
- Commissions
- Slippage (0.05-0.1% per trade)
- Spread costs
- Market impact (for large orders)

Ignoring costs makes strategies look better than they are.

### Q: What is walk-forward analysis?

**A**: A robust testing method:
1. Optimize on period 1
2. Test on period 2
3. Optimize on periods 1-2
4. Test on period 3
5. Repeat...

This prevents overfitting and gives realistic performance estimates.

## Live Trading

### Q: When should I start live trading?

**A**: Start live trading when:
- Strategy is profitable in backtests
- Passed walk-forward analysis
- Paper traded successfully for 3+ months
- You understand all risks
- You have proper risk management
- You can handle losses emotionally

Don't rush. Paper trade until you're confident.

### Q: How do I transition from paper to live trading?

**A**: Gradual approach:
1. Start with minimum position sizes
2. Trade one strategy at a time
3. Monitor closely for 1-2 months
4. Gradually increase size if performing well
5. Add more strategies slowly

Expect some performance degradation from paper to live.

### Q: My live results don't match my backtest. Why?

**A**: Common reasons:
- Slippage and transaction costs
- Different execution prices
- Market conditions changed
- Implementation bugs
- Psychological factors
- Overfitting in backtest

This is normal. Live performance is usually 20-30% worse than backtests.

## Advanced Topics

### Q: Should I use machine learning?

**A**: ML can help, but:
- Not necessary for profitable trading
- Easy to overfit
- Requires more data and expertise
- Traditional methods often work better

Start with simple strategies. Add ML later if needed.

### Q: Is high-frequency trading accessible to retail traders?

**A**: Technically yes, practically difficult:
- Requires significant capital
- Expensive infrastructure
- Co-location costs
- Competing with professionals
- Regulatory considerations

Focus on longer timeframes (minutes to days) as a retail trader.

### Q: Should I trade options?

**A**: Options add complexity but offer:
- Leverage
- Defined risk strategies
- Volatility trading
- Income generation

Learn stocks first, then add options if interested.

## This Book

### Q: In what order should I read the modules?

**A**: Follow the sequential order:
1. Modules 1-2: Foundations
2. Modules 3-4: Strategies
3. Modules 5-6: Risk and testing
4. Modules 7-8: Advanced topics

Each module builds on previous ones.

### Q: Should I complete all exercises?

**A**: Yes! Exercises are crucial for:
- Hands-on practice
- Reinforcing concepts
- Building real skills
- Portfolio projects

Don't skip them. Learning by doing is essential.

### Q: How long does it take to complete the book?

**A**: Typical timeline:
- **Fast pace**: 3-4 months (20+ hours/week)
- **Moderate pace**: 6-8 months (10-15 hours/week)
- **Slow pace**: 12+ months (5-10 hours/week)

Quality matters more than speed. Take your time.

### Q: What should I do after finishing the book?

**A**: Next steps:
1. Build your own trading system
2. Paper trade for 3-6 months
3. Read advanced books and papers
4. Join trading communities
5. Consider live trading (small size)
6. Keep learning and improving

Trading is a lifelong learning journey.

## Getting Help

### Q: Where can I get help if I'm stuck?

**A**: Resources for help:
- GitHub Issues for this book
- Trading forums (QuantConnect, Elite Trader)
- Stack Overflow for coding questions
- Reddit (r/algotrading)
- Discord trading communities

Always show what you've tried before asking for help.

### Q: Can I contact the author?

**A**: For book-related questions:
- Open a GitHub issue
- Check existing discussions
- Contribute improvements via pull requests

For general trading questions, use community forums.

---

**Still have questions?** Open an issue on the GitHub repository or check the community discussions.

**Remember**: There are no stupid questions. Everyone starts as a beginner. Ask, learn, and grow!
