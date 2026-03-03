# Exercise 1.2: Order Types Practice

**Objective**: Understand when to use different order types

## Instructions

For each scenario below, specify:
1. Order type (Market, Limit, Stop-Loss, Stop-Limit)
2. Order parameters (prices, quantities)
3. Reasoning

## Scenarios

### Scenario 1: Immediate Entry
**Situation**: You want to buy TSLA immediately. Current price is $200. You don't care about getting exactly $200, you just want to own the stock now.

- **Order Type**: ___________
- **Action**: BUY / SELL
- **Quantity**: ___________ shares
- **Price (if applicable)**: $___________
- **Reasoning**:

### Scenario 2: Patient Entry
**Situation**: MSFT is currently at $380, but you think it's too expensive. You're willing to wait and only buy if it drops to $370 or below.

- **Order Type**: ___________
- **Action**: BUY / SELL
- **Quantity**: ___________ shares
- **Limit Price**: $___________
- **Reasoning**:

### Scenario 3: Protect Profits
**Situation**: You bought GOOGL at $140 and it's now at $150. You want to protect your $10/share profit. If it drops to $145, you want to sell automatically.

- **Order Type**: ___________
- **Action**: BUY / SELL
- **Quantity**: ___________ shares
- **Stop Price**: $___________
- **Reasoning**:

### Scenario 4: Sell at Target
**Situation**: You own AAPL at $150. You want to sell when it reaches $160, but you're willing to wait. You want to make sure you get at least $160.

- **Order Type**: ___________
- **Action**: BUY / SELL
- **Quantity**: ___________ shares
- **Limit Price**: $___________
- **Reasoning**:

### Scenario 5: Breakout Entry
**Situation**: NVDA is trading at $500 and has been stuck there for weeks. You think if it breaks above $550, it will go much higher. You want to buy automatically if it hits $550.

- **Order Type**: ___________
- **Action**: BUY / SELL
- **Quantity**: ___________ shares
- **Stop Price**: $___________
- **Reasoning**:

## Practical Exercise

Run the order simulation script from Lesson 1.2:

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate
# Run the script from the lesson
```

**Results**:
- Did the market order execute immediately? ___________
- What price did you get? $___________
- How much cash remained? $___________

## Reflection Questions

1. **When would you use a market order?**

2. **When would you use a limit order?**

3. **What's the main risk of using market orders?**

4. **What's the main risk of using limit orders?**

5. **Why are stop-loss orders important?**

## Submission

Save your answers and mark complete:
```bash
python track_progress.py exercise module-01 2
```
