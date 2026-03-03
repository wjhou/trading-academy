# Lesson 1.2: Order Types - How to Buy and Sell Stocks

**Module**: 1 - Trading Fundamentals
**Estimated Time**: 40 minutes
**Difficulty**: Beginner
**Prerequisites**: Lesson 1.1

## 🎯 Learning Objectives

- Understand different order types and when to use each
- Learn how market orders work and their risks
- Master limit orders for price control
- Understand stop-loss orders for risk management
- See how orders are implemented in stock-agent-system

## 📖 What is an Order?

An **order** is an instruction to your broker to buy or sell a stock.

Every order has:
- **Action**: BUY or SELL
- **Quantity**: Number of shares
- **Symbol**: Which stock (e.g., AAPL)
- **Order Type**: How to execute (market, limit, stop, etc.)
- **Duration**: How long the order is valid

## 1️⃣ Market Orders

### Definition

A **market order** executes immediately at the best available price.

### How It Works

```
You: "Buy 100 shares of AAPL at market price"
Broker: Finds best ask price → Executes immediately
Result: You own 100 AAPL shares at whatever price was available
```

### Advantages

✅ **Guaranteed execution** (in liquid markets)
✅ **Fast** - executes in milliseconds
✅ **Simple** - no price to specify

### Disadvantages

❌ **No price control** - might pay more than expected
❌ **Slippage** - price can move between order and execution
❌ **Dangerous in volatile markets** - can get terrible prices

### Example

```python
# In stock-agent-system: src/stock_agent/broker/models.py
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.MARKET,  # Market order
)
```

### When to Use

- ✅ Highly liquid stocks (AAPL, MSFT, etc.)
- ✅ Need to enter/exit quickly
- ✅ During regular market hours
- ❌ Low-volume stocks
- ❌ Pre-market or after-hours
- ❌ Volatile market conditions

## 2️⃣ Limit Orders

### Definition

A **limit order** only executes at your specified price or better.

### How It Works

```
You: "Buy 100 AAPL at $150 or less"
Broker: Waits until AAPL is at $150 or lower
Result: Either fills at $150 or better, or doesn't fill at all
```

### Advantages

✅ **Price control** - you set the maximum/minimum
✅ **No slippage** - get your price or better
✅ **Good for illiquid stocks** - avoid overpaying

### Disadvantages

❌ **May not fill** - if price doesn't reach your limit
❌ **Partial fills** - might only get some shares
❌ **Opportunity cost** - miss the move if too conservative

### Example

```python
# Buy limit order
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("150.00"),  # Won't pay more than $150
)

# Sell limit order
order = Order(
    symbol="AAPL",
    side=OrderSide.SELL,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("155.00"),  # Won't sell for less than $155
)
```

### When to Use

- ✅ Want specific entry/exit prices
- ✅ Not urgent to execute
- ✅ Illiquid or volatile stocks
- ✅ Placing orders outside market hours

## 3️⃣ Stop-Loss Orders

### Definition

A **stop-loss order** becomes a market order when the stock reaches a trigger price.

### How It Works

```
You own AAPL at $150
You: "Sell if price drops to $145" (stop-loss at $145)
Price drops to $145 → Order triggers → Sells at market price
Result: Limits your loss to about $5 per share
```

### Advantages

✅ **Automatic risk management** - protects against big losses
✅ **No monitoring needed** - works while you sleep
✅ **Emotional discipline** - forces you to cut losses

### Disadvantages

❌ **Can trigger on temporary dips** - "stop hunting"
❌ **Executes at market** - might get worse price than trigger
❌ **Gaps** - if stock gaps down, sells at much lower price

### Example

```python
# Stop-loss order (sell if price drops)
order = Order(
    symbol="AAPL",
    side=OrderSide.SELL,
    qty=Decimal("100"),
    order_type=OrderType.STOP,
    stop_price=Decimal("145.00"),  # Trigger at $145
)
```

### When to Use

- ✅ Protecting profits on winning trades
- ✅ Limiting losses on losing trades
- ✅ Can't monitor the market constantly
- ❌ Very volatile stocks (might trigger unnecessarily)

## 4️⃣ Stop-Limit Orders

### Definition

Combines stop and limit: triggers at stop price, but only fills at limit price or better.

### How It Works

```
Stop Price: $145 (trigger)
Limit Price: $144 (minimum acceptable)

Price drops to $145 → Triggers
Only sells if can get $144 or better
```

### Advantages

✅ **Price protection** after trigger
✅ **More control** than regular stop-loss

### Disadvantages

❌ **May not fill** - if price moves too fast
❌ **More complex** - need to set two prices

## 📊 Order Duration

### Time-in-Force Options

1. **Day Order**: Expires at end of trading day
2. **GTC (Good-Till-Canceled)**: Stays active until filled or canceled (usually 90 days)
3. **IOC (Immediate-or-Cancel)**: Fill immediately or cancel
4. **FOK (Fill-or-Kill)**: Fill entire order immediately or cancel

### In stock-agent-system

```python
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("150.00"),
    time_in_force=TimeInForce.GTC,  # Good till canceled
)
```

## 🎯 Choosing the Right Order Type

### Decision Tree

```
Need to execute immediately?
├─ YES → Market Order (if liquid stock)
└─ NO → Want specific price?
    ├─ YES → Limit Order
    └─ NO → Protecting position?
        └─ YES → Stop-Loss Order
```

### Real-World Scenarios

**Scenario 1**: You want to buy AAPL, currently at $150
- **Market Order**: Buy now at ~$150
- **Limit Order at $149**: Only buy if it dips to $149
- **Stop Order at $151**: Buy if it breaks above $151 (momentum)

**Scenario 2**: You own AAPL at $150, now at $160
- **Market Order**: Sell now at ~$160
- **Limit Order at $165**: Only sell if it rises to $165
- **Stop-Loss at $155**: Sell if it drops to $155 (protect profit)

## 💻 Hands-On: Explore stock-agent-system Orders

Let's look at how orders are implemented:

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system

# Read the order models
cat src/stock_agent/broker/models.py | grep -A 20 "class Order"

# Look at how the simulated broker handles orders
cat src/stock_agent/broker/simulated_broker.py | grep -A 30 "async def submit_order"
```

**Observe**:
- What fields does an Order have?
- How does the simulated broker execute market orders?
- What happens with limit orders?

## 📝 Exercise 1.2: Order Type Practice

Create a file: `exercises/module-01/exercise-1.2-orders.md`

For each scenario, specify the order type and parameters:

1. You want to buy TSLA immediately, don't care about exact price
2. You want to buy MSFT, but only if it drops to $380
3. You own GOOGL at $140, want to protect against drops below $135
4. You want to sell AAPL at $160 or better, willing to wait
5. You own NVDA at $500, want to sell if it breaks above $550 (take profit)

**Format**:
```
Scenario 1:
- Order Type: Market
- Action: BUY
- Reason: Need immediate execution
```

## 🧪 Practical Exercise: Paper Trading

Let's place your first simulated order!

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

# We'll create a simple script to place an order
python3 << 'EOF'
import asyncio
from decimal import Decimal
from stock_agent.broker.simulated_broker import SimulatedBroker
from stock_agent.broker.models import Order, OrderSide, OrderType

async def main():
    # Create simulated broker with $10,000
    broker = SimulatedBroker(initial_cash=Decimal("10000"))

    # Set current price for AAPL
    broker.set_price("AAPL", Decimal("150.00"))

    # Place a market buy order
    order = Order(
        symbol="AAPL",
        side=OrderSide.BUY,
        qty=Decimal("10"),
        order_type=OrderType.MARKET,
    )

    filled_order = await broker.submit_order(order)
    print(f"Order filled: {filled_order}")
    print(f"Bought {filled_order.qty} shares at ${filled_order.filled_avg_price}")

    # Check account
    account = await broker.get_account()
    print(f"Cash remaining: ${account.cash}")
    print(f"Buying power: ${account.buying_power}")

asyncio.run(main())
EOF
```

**Expected Output**:
```
Order filled: ...
Bought 10 shares at $150.00
Cash remaining: $8500.00
Buying power: $8500.00
```

## 🔑 Key Takeaways

1. **Market orders** = speed, no price control
2. **Limit orders** = price control, may not fill
3. **Stop-loss orders** = risk management, automatic
4. **Choose based on** urgency, price importance, and risk tolerance
5. **Always use limit orders** for illiquid stocks or volatile markets

## 🚀 Next Lesson

[Lesson 1.3: Reading Stock Prices and Charts](lesson-03-reading-charts.md)

You'll learn:
- How to read candlestick charts
- What OHLC (Open, High, Low, Close) means
- How to interpret price movements
- Basic chart patterns

---

**Completed?** ✓ Mark done and continue your journey!
