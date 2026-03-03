# Lesson 1.1: What is Trading? Stocks, Markets, and Exchanges

**Module**: 1 - Trading Fundamentals
**Estimated Time**: 45 minutes
**Difficulty**: Beginner

## 🎯 Learning Objectives

By the end of this lesson, you will:
- Understand what trading is and how it differs from investing
- Know what stocks are and why companies issue them
- Learn how stock markets and exchanges work
- Understand the role of brokers in trading
- Be able to explain basic market mechanics

## 📖 What is Trading?

**Trading** is the act of buying and selling financial instruments (like stocks, bonds, currencies) with the goal of making a profit from price movements.

### Trading vs Investing

| Trading | Investing |
|---------|-----------|
| Short to medium term (days to months) | Long term (years to decades) |
| Profit from price movements | Profit from company growth + dividends |
| Active management required | Passive, buy and hold |
| Higher risk, higher potential returns | Lower risk, steady returns |
| Technical analysis focused | Fundamental analysis focused |

**Example**:
- **Investor**: Buys Apple stock at $150, holds for 10 years, sells at $300
- **Trader**: Buys Apple at $150, sells at $155 next week, repeats many times

## 📈 What are Stocks?

**Stocks** (also called shares or equities) represent ownership in a company.

### Why Companies Issue Stocks

1. **Raise Capital**: Get money to grow the business without taking loans
2. **Liquidity**: Founders and early investors can sell their shares
3. **Employee Compensation**: Offer stock options to attract talent
4. **Public Valuation**: Establish a market price for the company

### Types of Stocks

- **Common Stock**: Voting rights, dividends (if company pays them), last in line if company fails
- **Preferred Stock**: No voting rights, fixed dividends, priority over common stock

### Stock Symbols (Tickers)

Every stock has a unique identifier:
- **AAPL** = Apple Inc.
- **MSFT** = Microsoft Corporation
- **GOOGL** = Alphabet Inc. (Google)
- **TSLA** = Tesla, Inc.

## 🏛️ Stock Markets and Exchanges

A **stock exchange** is a marketplace where stocks are bought and sold.

### Major US Exchanges

1. **NYSE (New York Stock Exchange)**
   - Oldest and largest exchange
   - Traditional "floor trading" + electronic
   - Blue-chip companies (IBM, Coca-Cola, etc.)

2. **NASDAQ**
   - Fully electronic exchange
   - Tech-heavy (Apple, Microsoft, Amazon)
   - Faster execution

3. **Other Exchanges**
   - AMEX, BATS, IEX, etc.

### How Exchanges Work

```
Buyer wants AAPL @ $150  ←→  Exchange  ←→  Seller has AAPL @ $150
                                ↓
                         Trade Executed!
                                ↓
                    Buyer gets stock, Seller gets money
```

### Market Hours

- **Regular Hours**: 9:30 AM - 4:00 PM EST (Monday-Friday)
- **Pre-Market**: 4:00 AM - 9:30 AM EST
- **After-Hours**: 4:00 PM - 8:00 PM EST

**Note**: Most trading happens during regular hours. Pre/after-hours have lower volume and wider spreads.

## 🤝 The Role of Brokers

You can't directly access exchanges - you need a **broker**.

### What Brokers Do

1. **Execute Orders**: Send your buy/sell orders to exchanges
2. **Hold Your Assets**: Keep your stocks and cash in an account
3. **Provide Tools**: Charts, research, analysis tools
4. **Margin/Leverage**: Lend you money to trade (advanced)

### Types of Brokers

- **Full-Service**: Personal advice, research, high fees (e.g., Morgan Stanley)
- **Discount**: Self-directed, low fees (e.g., Alpaca, Interactive Brokers)
- **Robo-Advisors**: Automated investing (e.g., Betterment, Wealthfront)

### In stock-agent-system

Your stock-agent-system supports multiple brokers:
- **Alpaca**: US stocks, paper and live trading
- **Simulated Broker**: Practice without real money
- **QMT/easytrader**: China A-shares

## 💰 How Trading Makes Money

### The Basic Concept

**Buy Low, Sell High**

```
Buy AAPL at $150  →  Price goes to $160  →  Sell at $160  →  Profit: $10 per share
```

### Example Trade

```
1. You have $10,000 in your account
2. Buy 100 shares of AAPL at $150 = $15,000 spent (using margin)
3. AAPL rises to $155
4. Sell 100 shares at $155 = $15,500 received
5. Profit: $500 (minus fees)
6. Return: 3.3% in one trade
```

### The Reality

- Not every trade is profitable
- Fees and taxes reduce profits
- Timing is difficult
- Emotions can lead to bad decisions
- Risk management is crucial

## 🔑 Key Concepts

### Bid and Ask

- **Bid**: Highest price buyers are willing to pay
- **Ask**: Lowest price sellers are willing to accept
- **Spread**: Difference between bid and ask

Example:
```
AAPL Bid: $149.95
AAPL Ask: $150.05
Spread: $0.10
```

### Market Makers

- Provide liquidity by always offering to buy and sell
- Make money from the spread
- Ensure you can always trade

### Volume

- Number of shares traded in a period
- High volume = more liquidity, easier to trade
- Low volume = harder to buy/sell, wider spreads

## 🎓 Check Your Understanding

Answer these questions (solutions at the end):

1. What's the main difference between trading and investing?
2. What does it mean to own a stock?
3. Why can't you trade stocks directly on an exchange?
4. If you buy 50 shares at $100 and sell at $105, what's your profit (ignoring fees)?
5. What is the "spread" and why does it matter?

## 💻 Hands-On Exercise

Let's explore real market data using stock-agent-system:

```bash
# Navigate to your stock-agent-system
cd /Users/houwenjun/Desktop/Projects/stock-agent-system

# Activate the environment
source .venv/bin/activate

# List available strategies (we'll learn about these later)
stock-agent strategies

# Check the default configuration
cat configs/default.yaml
```

**Observe**:
- What stocks are in the default watchlist?
- What trading mode is configured?
- What strategies are enabled?

## 📝 Exercise 1.1: Research a Stock

Pick a stock you're interested in (AAPL, MSFT, TSLA, etc.) and research:

1. What does the company do?
2. What's its current stock price?
3. What exchange is it listed on?
4. What's its average daily volume?
5. Who are its main competitors?

Write your findings in: `exercises/module-01/exercise-1.1-stock-research.md`

## 🚀 Next Steps

In the next lesson, we'll learn about **Order Types** - the different ways you can buy and sell stocks.

**Preview Questions**:
- What's the difference between a market order and a limit order?
- When would you use a stop-loss order?
- What happens if your order doesn't get filled?

## 📚 Additional Resources

- [Investopedia: Stock Basics](https://www.investopedia.com/terms/s/stock.asp)
- [SEC: What are stocks?](https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks)
- [Khan Academy: Stocks and Bonds](https://www.khanacademy.org/economics-finance-domain/core-finance/stock-and-bonds)

## ✅ Solutions

1. **Trading vs Investing**: Trading is short-term, focused on price movements; investing is long-term, focused on company growth
2. **Owning stock**: You own a small piece of the company and have rights to profits (dividends) and voting
3. **Why need a broker**: Exchanges only allow licensed brokers to trade; individuals must go through brokers
4. **Profit calculation**: 50 shares × ($105 - $100) = $250 profit
5. **Spread**: Difference between bid and ask price; matters because you "lose" the spread when you trade (buy at ask, sell at bid)

---

**Completed this lesson?** ✓ Mark it done and move to [Lesson 1.2: Order Types](lesson-02-order-types.md)
