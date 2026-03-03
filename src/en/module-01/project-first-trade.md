# Module 1 Project: Your First Paper Trade

**Project Goal**: Execute your first simulated trade using stock-agent-system

**Estimated Time**: 1-2 hours
**Difficulty**: Beginner
**Prerequisites**: Complete all Module 1 lessons

## 🎯 Project Objectives

By completing this project, you will:
- Set up and configure stock-agent-system for paper trading
- Research and select a stock to trade
- Plan a trade with entry, exit, and stop-loss
- Execute the trade using the system
- Monitor and close the position
- Analyze the results

## 📋 Project Steps

### Step 1: Set Up Paper Trading Environment

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

# Verify installation
stock-agent --help
stock-agent strategies
```

### Step 2: Research and Select a Stock

Choose ONE stock from the default watchlist:
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Google)
- AMZN (Amazon)
- TSLA (Tesla)

**Research Questions** (document your answers):
1. What does the company do?
2. What's the current price?
3. What's the average daily volume?
4. Is it in an uptrend or downtrend?
5. Why do you want to trade it?

### Step 3: Plan Your Trade

Create a trading plan:

```
Stock: ___________
Entry Price: $___________
Position Size: ___________ shares
Stop-Loss: $___________ (5% below entry)
Take-Profit: $___________ (10% above entry)
Risk: $___________ (entry - stop-loss) × shares
Reward: $___________ (take-profit - entry) × shares
Risk-Reward Ratio: ___________
```

**Example**:
```
Stock: AAPL
Entry Price: $150.00
Position Size: 10 shares
Stop-Loss: $142.50 (5% below)
Take-Profit: $165.00 (10% above)
Risk: $75 ($7.50 × 10 shares)
Reward: $150 ($15.00 × 10 shares)
Risk-Reward Ratio: 1:2 (good!)
```

### Step 4: Execute the Trade

Create a script to execute your trade:

```python
# save as: my_first_trade.py
import asyncio
from decimal import Decimal
from datetime import datetime
from stock_agent.broker.simulated_broker import SimulatedBroker
from stock_agent.broker.models import Order, OrderSide, OrderType

async def my_first_trade():
    # Initialize broker with $10,000
    broker = SimulatedBroker(initial_cash=Decimal("10000"))

    # Set current price (use real price from research)
    symbol = "AAPL"
    entry_price = Decimal("150.00")  # Change to real price
    broker.set_price(symbol, entry_price)

    print(f"\n{'='*60}")
    print(f"MY FIRST PAPER TRADE - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    # Check account
    account = await broker.get_account()
    print(f"Starting Cash: ${account.cash:,.2f}")
    print(f"Buying Power: ${account.buying_power:,.2f}\n")

    # Place buy order
    print(f"Placing BUY order for {symbol}...")
    buy_order = Order(
        symbol=symbol,
        side=OrderSide.BUY,
        qty=Decimal("10"),  # Change to your position size
        order_type=OrderType.MARKET,
    )

    filled_order = await broker.submit_order(buy_order)
    print(f"✓ Order filled!")
    print(f"  Bought: {filled_order.qty} shares")
    print(f"  Price: ${filled_order.filled_avg_price}")
    print(f"  Total: ${float(filled_order.qty) * float(filled_order.filled_avg_price):,.2f}\n")

    # Check position
    positions = await broker.get_positions()
    if positions:
        pos = positions[0]
        print(f"Current Position:")
        print(f"  Symbol: {pos.symbol}")
        print(f"  Quantity: {pos.qty}")
        print(f"  Avg Price: ${pos.avg_entry_price}")
        print(f"  Current Price: ${pos.current_price}")
        print(f"  Market Value: ${pos.market_value:,.2f}")
        print(f"  Unrealized P&L: ${pos.unrealized_pl:,.2f}\n")

    # Check account after trade
    account = await broker.get_account()
    print(f"After Trade:")
    print(f"  Cash: ${account.cash:,.2f}")
    print(f"  Portfolio Value: ${account.portfolio_value:,.2f}")

    print(f"\n{'='*60}")
    print("Trade executed successfully!")
    print(f"{'='*60}\n")

    # Calculate stop-loss and take-profit
    stop_loss = float(entry_price) * 0.95  # 5% below
    take_profit = float(entry_price) * 1.10  # 10% above

    print(f"Trade Plan:")
    print(f"  Entry: ${entry_price}")
    print(f"  Stop-Loss: ${stop_loss:.2f}")
    print(f"  Take-Profit: ${take_profit:.2f}")
    print(f"  Risk: ${(float(entry_price) - stop_loss) * 10:.2f}")
    print(f"  Reward: ${(take_profit - float(entry_price)) * 10:.2f}")

if __name__ == "__main__":
    asyncio.run(my_first_trade())
```

Run it:
```bash
python my_first_trade.py
```

### Step 5: Monitor the Position

In a real scenario, you would:
1. Check the price regularly
2. Adjust stop-loss if needed (trailing stop)
3. Watch for exit signals
4. Close when stop-loss or take-profit is hit

For this project, simulate a price change:

```python
# Add to your script after the trade
print("\n--- Simulating Price Movement ---\n")

# Scenario 1: Price goes up 5%
new_price = float(entry_price) * 1.05
broker.set_price(symbol, Decimal(str(new_price)))

positions = await broker.get_positions()
if positions:
    pos = positions[0]
    print(f"Price moved to: ${new_price:.2f}")
    print(f"Unrealized P&L: ${pos.unrealized_pl:,.2f}")
    print(f"Return: {(pos.unrealized_pl / (float(entry_price) * 10)) * 100:.2f}%")
```

### Step 6: Close the Position

```python
# Add to your script
print("\n--- Closing Position ---\n")

sell_order = Order(
    symbol=symbol,
    side=OrderSide.SELL,
    qty=Decimal("10"),
    order_type=OrderType.MARKET,
)

filled_sell = await broker.submit_order(sell_order)
print(f"✓ Position closed!")
print(f"  Sold: {filled_sell.qty} shares")
print(f"  Price: ${filled_sell.filled_avg_price}")
print(f"  Total: ${float(filled_sell.qty) * float(filled_sell.filled_avg_price):,.2f}")

# Final account status
account = await broker.get_account()
profit = float(account.cash) - 10000
print(f"\nFinal Results:")
print(f"  Starting Cash: $10,000.00")
print(f"  Ending Cash: ${account.cash:,.2f}")
print(f"  Profit/Loss: ${profit:,.2f}")
print(f"  Return: {(profit / 10000) * 100:.2f}%")
```

### Step 7: Document Your Trade

Create: `exercises/module-01/my-first-trade-report.md`

```markdown
# My First Paper Trade Report

## Trade Details
- Date: YYYY-MM-DD
- Stock: SYMBOL
- Entry Price: $XXX.XX
- Exit Price: $XXX.XX
- Position Size: XX shares
- Duration: X hours/days

## Trade Plan
- Entry Reason: Why I entered
- Stop-Loss: $XXX.XX
- Take-Profit: $XXX.XX
- Risk-Reward: X:X

## Results
- Profit/Loss: $XXX.XX
- Return: XX.XX%
- What went well:
- What could improve:

## Lessons Learned
1. Lesson 1
2. Lesson 2
3. Lesson 3
```

## ✅ Project Checklist

- [ ] Set up paper trading environment
- [ ] Researched and selected a stock
- [ ] Created a trading plan
- [ ] Executed the buy order
- [ ] Monitored the position
- [ ] Closed the position
- [ ] Documented the trade
- [ ] Analyzed results and lessons learned

## 🎓 Evaluation Criteria

Your project is complete when you can answer YES to all:

1. Did you execute a complete trade (buy and sell)?
2. Did you have a plan before entering?
3. Did you calculate risk and reward?
4. Did you document the trade?
5. Did you learn something from the experience?

## 🚀 Next Steps

After completing this project:

1. **Try different scenarios**: What if price went down? What if you used a limit order?
2. **Experiment with position sizing**: Trade 5 shares vs 20 shares
3. **Test stop-losses**: Simulate hitting your stop-loss
4. **Move to Module 2**: Learn technical analysis to improve your entries

## 💡 Tips

- **Start small**: 10 shares is fine for learning
- **Follow your plan**: Don't change stop-loss mid-trade
- **Document everything**: You'll learn more by writing it down
- **Don't worry about profit**: Focus on process, not results
- **Paper trade first**: Never use real money until consistently profitable

---

**Completed?** ✓ Mark done: `python track_progress.py exercise module-01 project`

**Congratulations on your first trade!** 🎉

Now you're ready for [Module 2: Technical Analysis](../module-02/lesson-01-candlesticks.md)
