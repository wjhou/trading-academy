# Lesson 8.4: High-Frequency Trading Fundamentals

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the principles and infrastructure of high-frequency trading
- Implement market microstructure analysis
- Build latency-optimized order execution systems
- Create market making and arbitrage strategies
- Measure and optimize execution performance

## Introduction

High-Frequency Trading (HFT) involves executing a large number of orders at extremely high speeds, often holding positions for seconds or milliseconds. HFT strategies rely on:

1. **Speed**: Microsecond-level execution latency
2. **Technology**: Optimized hardware and software infrastructure
3. **Market Microstructure**: Understanding order book dynamics
4. **Statistical Edge**: Small but consistent profit per trade

**Important Note**: True HFT requires specialized infrastructure (co-location, FPGA, direct market access). This lesson focuses on the concepts and strategies that can be implemented in Python for educational purposes.

## Market Microstructure Analysis

Understanding order book dynamics is fundamental to HFT:

```python
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from collections import deque
import time

class OrderBook:
    """Simulate and analyze order book dynamics."""

    def __init__(self, symbol: str):
        self.symbol = symbol
        self.bids = {}  # price -> quantity
        self.asks = {}  # price -> quantity
        self.trade_history = []
        self.book_updates = []

    def update_bid(self, price: float, quantity: float):
        """Update bid side of order book."""
        if quantity == 0:
            self.bids.pop(price, None)
        else:
            self.bids[price] = quantity
        self.book_updates.append(('bid', price, quantity, time.time()))

    def update_ask(self, price: float, quantity: float):
        """Update ask side of order book."""
        if quantity == 0:
            self.asks.pop(price, None)
        else:
            self.asks[price] = quantity
        self.book_updates.append(('ask', price, quantity, time.time()))

    def get_best_bid(self) -> Tuple[float, float]:
        """Get best bid price and quantity."""
        if not self.bids:
            return None, 0
        best_price = max(self.bids.keys())
        return best_price, self.bids[best_price]

    def get_best_ask(self) -> Tuple[float, float]:
        """Get best ask price and quantity."""
        if not self.asks:
            return None, 0
        best_price = min(self.asks.keys())
        return best_price, self.asks[best_price]

    def get_spread(self) -> float:
        """Calculate bid-ask spread."""
        bid_price, _ = self.get_best_bid()
        ask_price, _ = self.get_best_ask()
        if bid_price and ask_price:
            return ask_price - bid_price
        return 0

    def get_mid_price(self) -> float:
        """Calculate mid price."""
        bid_price, _ = self.get_best_bid()
        ask_price, _ = self.get_best_ask()
        if bid_price and ask_price:
            return (bid_price + ask_price) / 2
        return 0

    def get_depth(self, levels: int = 5) -> Dict:
        """Get order book depth."""
        sorted_bids = sorted(self.bids.items(), reverse=True)[:levels]
        sorted_asks = sorted(self.asks.items())[:levels]

        return {
            'bids': sorted_bids,
            'asks': sorted_asks,
            'bid_volume': sum(q for _, q in sorted_bids),
            'ask_volume': sum(q for _, q in sorted_asks)
        }

    def calculate_imbalance(self, levels: int = 5) -> float:
        """Calculate order book imbalance."""
        depth = self.get_depth(levels)
        bid_vol = depth['bid_volume']
        ask_vol = depth['ask_volume']

        if bid_vol + ask_vol == 0:
            return 0
        return (bid_vol - ask_vol) / (bid_vol + ask_vol)


class MicrostructureAnalyzer:
    """Analyze market microstructure patterns."""

    def __init__(self, order_book: OrderBook):
        self.book = order_book
        self.spread_history = deque(maxlen=1000)
        self.imbalance_history = deque(maxlen=1000)

    def update_metrics(self):
        """Update microstructure metrics."""
        spread = self.book.get_spread()
        imbalance = self.book.calculate_imbalance()

        self.spread_history.append(spread)
        self.imbalance_history.append(imbalance)

    def get_spread_statistics(self) -> Dict:
        """Calculate spread statistics."""
        if not self.spread_history:
            return {}

        spreads = list(self.spread_history)
        return {
            'mean': np.mean(spreads),
            'std': np.std(spreads),
            'min': np.min(spreads),
            'max': np.max(spreads),
            'current': spreads[-1]
        }

    def detect_liquidity_event(self, threshold: float = 2.0) -> bool:
        """Detect unusual liquidity events."""
        if len(self.spread_history) < 100:
            return False

        current_spread = self.spread_history[-1]
        mean_spread = np.mean(list(self.spread_history)[:-1])
        std_spread = np.std(list(self.spread_history)[:-1])

        # Detect if spread is unusually wide
        z_score = (current_spread - mean_spread) / std_spread if std_spread > 0 else 0
        return abs(z_score) > threshold

    def predict_short_term_direction(self) -> int:
        """Predict short-term price direction based on order book."""
        imbalance = self.book.calculate_imbalance()

        # Strong buy pressure
        if imbalance > 0.3:
            return 1
        # Strong sell pressure
        elif imbalance < -0.3:
            return -1
        # Neutral
        return 0
```

## Market Making Strategy

Market making involves providing liquidity by placing both buy and sell orders:

```python
class MarketMaker:
    """Simple market making strategy."""

    def __init__(self, symbol: str, inventory_limit: int = 100):
        self.symbol = symbol
        self.inventory = 0
        self.inventory_limit = inventory_limit
        self.position_value = 0
        self.pnl = 0

    def calculate_quotes(self, mid_price: float, spread: float,
                        inventory: int) -> Tuple[float, float]:
        """Calculate bid and ask quotes based on inventory."""
        # Base spread
        half_spread = spread / 2

        # Inventory skew: adjust quotes to reduce inventory risk
        inventory_ratio = inventory / self.inventory_limit
        skew = inventory_ratio * (spread * 0.5)

        bid_price = mid_price - half_spread - skew
        ask_price = mid_price + half_spread - skew

        return bid_price, ask_price

    def should_quote(self, order_book: OrderBook) -> bool:
        """Determine if we should provide quotes."""
        # Don't quote if inventory is at limit
        if abs(self.inventory) >= self.inventory_limit:
            return False

        # Don't quote if spread is too wide (illiquid market)
        spread = order_book.get_spread()
        mid_price = order_book.get_mid_price()
        if spread / mid_price > 0.01:  # 1% spread threshold
            return False

        return True

    def generate_orders(self, order_book: OrderBook,
                       quote_size: int = 10) -> List[Dict]:
        """Generate market making orders."""
        if not self.should_quote(order_book):
            return []

        mid_price = order_book.get_mid_price()
        spread = order_book.get_spread()

        bid_price, ask_price = self.calculate_quotes(mid_price, spread, self.inventory)

        orders = []

        # Place bid if we can buy more
        if self.inventory < self.inventory_limit:
            orders.append({
                'side': 'buy',
                'price': bid_price,
                'quantity': quote_size,
                'type': 'limit'
            })

        # Place ask if we can sell more
        if self.inventory > -self.inventory_limit:
            orders.append({
                'side': 'sell',
                'price': ask_price,
                'quantity': quote_size,
                'type': 'limit'
            })

        return orders

    def update_inventory(self, side: str, quantity: int, price: float):
        """Update inventory after trade execution."""
        if side == 'buy':
            self.inventory += quantity
            self.position_value -= quantity * price
        else:  # sell
            self.inventory -= quantity
            self.position_value += quantity * price

        self.pnl = self.position_value + (self.inventory * price)


class StatisticalArbitrage:
    """Statistical arbitrage strategy for HFT."""

    def __init__(self, symbol1: str, symbol2: str):
        self.symbol1 = symbol1
        self.symbol2 = symbol2
        self.spread_history = deque(maxlen=1000)
        self.position1 = 0
        self.position2 = 0

    def calculate_spread(self, price1: float, price2: float) -> float:
        """Calculate normalized spread between two assets."""
        return price1 - price2

    def update_spread(self, price1: float, price2: float):
        """Update spread history."""
        spread = self.calculate_spread(price1, price2)
        self.spread_history.append(spread)

    def get_z_score(self) -> float:
        """Calculate z-score of current spread."""
        if len(self.spread_history) < 50:
            return 0

        spreads = list(self.spread_history)
        current_spread = spreads[-1]
        mean_spread = np.mean(spreads[:-1])
        std_spread = np.std(spreads[:-1])

        if std_spread == 0:
            return 0

        return (current_spread - mean_spread) / std_spread

    def generate_signals(self, entry_threshold: float = 2.0,
                        exit_threshold: float = 0.5) -> Dict:
        """Generate trading signals based on spread."""
        z_score = self.get_z_score()

        signal = {
            'action': 'hold',
            'symbol1_side': None,
            'symbol2_side': None
        }

        # Entry signals
        if abs(z_score) > entry_threshold:
            if z_score > 0:  # Spread too high
                signal['action'] = 'enter'
                signal['symbol1_side'] = 'sell'  # Sell expensive
                signal['symbol2_side'] = 'buy'   # Buy cheap
            else:  # Spread too low
                signal['action'] = 'enter'
                signal['symbol1_side'] = 'buy'
                signal['symbol2_side'] = 'sell'

        # Exit signals
        elif abs(z_score) < exit_threshold and (self.position1 != 0 or self.position2 != 0):
            signal['action'] = 'exit'
            # Close positions
            if self.position1 > 0:
                signal['symbol1_side'] = 'sell'
            elif self.position1 < 0:
                signal['symbol1_side'] = 'buy'

            if self.position2 > 0:
                signal['symbol2_side'] = 'sell'
            elif self.position2 < 0:
                signal['symbol2_side'] = 'buy'

        return signal
```

## Latency Optimization

Minimizing execution latency is critical for HFT:

```python
class LatencyOptimizedExecutor:
    """Optimized order execution with latency tracking."""

    def __init__(self):
        self.latency_history = []
        self.order_queue = deque()

    def measure_latency(self, start_time: float, end_time: float) -> float:
        """Measure execution latency in microseconds."""
        latency = (end_time - start_time) * 1_000_000  # Convert to microseconds
        self.latency_history.append(latency)
        return latency

    def execute_order(self, order: Dict) -> Dict:
        """Execute order with latency tracking."""
        start_time = time.perf_counter()

        # Simulate order execution
        # In production, this would be actual broker API call
        execution_result = {
            'order_id': len(self.latency_history) + 1,
            'status': 'filled',
            'filled_price': order['price'],
            'filled_quantity': order['quantity'],
            'timestamp': time.time()
        }

        end_time = time.perf_counter()
        latency = self.measure_latency(start_time, end_time)
        execution_result['latency_us'] = latency

        return execution_result

    def get_latency_statistics(self) -> Dict:
        """Calculate latency statistics."""
        if not self.latency_history:
            return {}

        return {
            'mean_us': np.mean(self.latency_history),
            'median_us': np.median(self.latency_history),
            'p95_us': np.percentile(self.latency_history, 95),
            'p99_us': np.percentile(self.latency_history, 99),
            'max_us': np.max(self.latency_history)
        }

    def batch_execute(self, orders: List[Dict]) -> List[Dict]:
        """Execute multiple orders efficiently."""
        results = []
        start_time = time.perf_counter()

        for order in orders:
            result = self.execute_order(order)
            results.append(result)

        end_time = time.perf_counter()
        batch_latency = (end_time - start_time) * 1_000_000

        return results, batch_latency


class PerformanceMonitor:
    """Monitor HFT strategy performance."""

    def __init__(self):
        self.trades = []
        self.pnl_history = []
        self.fill_rates = []

    def record_trade(self, trade: Dict):
        """Record executed trade."""
        self.trades.append(trade)

    def calculate_metrics(self) -> Dict:
        """Calculate comprehensive performance metrics."""
        if not self.trades:
            return {}

        # PnL calculation
        total_pnl = sum(t.get('pnl', 0) for t in self.trades)
        winning_trades = [t for t in self.trades if t.get('pnl', 0) > 0]
        losing_trades = [t for t in self.trades if t.get('pnl', 0) < 0]

        win_rate = len(winning_trades) / len(self.trades) if self.trades else 0

        # Average profit/loss
        avg_win = np.mean([t['pnl'] for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t['pnl'] for t in losing_trades]) if losing_trades else 0

        # Sharpe ratio (assuming trades are independent)
        pnl_values = [t.get('pnl', 0) for t in self.trades]
        sharpe = np.mean(pnl_values) / np.std(pnl_values) if np.std(pnl_values) > 0 else 0

        return {
            'total_trades': len(self.trades),
            'total_pnl': total_pnl,
            'win_rate': win_rate,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': abs(avg_win / avg_loss) if avg_loss != 0 else 0,
            'sharpe_ratio': sharpe * np.sqrt(len(self.trades))
        }
```

## Complete HFT System

```python
class HFTSystem:
    """Complete high-frequency trading system."""

    def __init__(self, symbol: str, strategy_type: str = 'market_making'):
        self.symbol = symbol
        self.order_book = OrderBook(symbol)
        self.executor = LatencyOptimizedExecutor()
        self.monitor = PerformanceMonitor()

        if strategy_type == 'market_making':
            self.strategy = MarketMaker(symbol)
        else:
            raise ValueError(f"Unknown strategy type: {strategy_type}")

    def process_market_data(self, bid_price: float, bid_qty: float,
                           ask_price: float, ask_qty: float):
        """Process incoming market data."""
        # Update order book
        self.order_book.update_bid(bid_price, bid_qty)
        self.order_book.update_ask(ask_price, ask_qty)

    def run_strategy_cycle(self):
        """Execute one strategy cycle."""
        # Generate orders based on strategy
        orders = self.strategy.generate_orders(self.order_book)

        # Execute orders
        for order in orders:
            result = self.executor.execute_order(order)

            # Update strategy state
            if result['status'] == 'filled':
                self.strategy.update_inventory(
                    order['side'],
                    result['filled_quantity'],
                    result['filled_price']
                )

                # Record trade
                trade = {
                    'timestamp': result['timestamp'],
                    'side': order['side'],
                    'price': result['filled_price'],
                    'quantity': result['filled_quantity'],
                    'pnl': self.strategy.pnl,
                    'latency': result['latency_us']
                }
                self.monitor.record_trade(trade)

    def get_performance_report(self) -> Dict:
        """Generate comprehensive performance report."""
        strategy_metrics = self.monitor.calculate_metrics()
        latency_metrics = self.executor.get_latency_statistics()

        return {
            'strategy_performance': strategy_metrics,
            'execution_latency': latency_metrics,
            'current_inventory': self.strategy.inventory,
            'current_pnl': self.strategy.pnl
        }
```

## Practical Example

```python
# Example: Running a simple market making strategy
def main():
    # Initialize HFT system
    system = HFTSystem('AAPL', strategy_type='market_making')

    # Simulate market data feed
    np.random.seed(42)
    base_price = 150.0

    print("Starting HFT market making simulation...")
    print("=" * 50)

    for i in range(100):
        # Simulate market data
        mid_price = base_price + np.random.randn() * 0.1
        spread = 0.02 + abs(np.random.randn() * 0.01)

        bid_price = mid_price - spread / 2
        ask_price = mid_price + spread / 2
        bid_qty = np.random.randint(100, 1000)
        ask_qty = np.random.randint(100, 1000)

        # Process market data
        system.process_market_data(bid_price, bid_qty, ask_price, ask_qty)

        # Run strategy
        system.run_strategy_cycle()

        # Print status every 20 cycles
        if (i + 1) % 20 == 0:
            report = system.get_performance_report()
            print(f"\nCycle {i + 1}:")
            print(f"  Inventory: {report['current_inventory']}")
            print(f"  PnL: ${report['current_pnl']:.2f}")
            print(f"  Total Trades: {report['strategy_performance'].get('total_trades', 0)}")

    # Final report
    print("\n" + "=" * 50)
    print("FINAL PERFORMANCE REPORT")
    print("=" * 50)

    final_report = system.get_performance_report()

    print("\nStrategy Performance:")
    for key, value in final_report['strategy_performance'].items():
        if isinstance(value, float):
            print(f"  {key}: {value:.4f}")
        else:
            print(f"  {key}: {value}")

    print("\nExecution Latency:")
    for key, value in final_report['execution_latency'].items():
        print(f"  {key}: {value:.2f} μs")

if __name__ == "__main__":
    main()
```

## Best Practices

1. **Infrastructure**
   - Use co-location services for minimum latency
   - Implement direct market access (DMA)
   - Optimize network and hardware configuration
   - Use compiled languages (C++, Rust) for critical paths

2. **Risk Management**
   - Implement strict position limits
   - Use kill switches for emergency shutdown
   - Monitor inventory risk continuously
   - Set maximum loss limits per day

3. **Order Management**
   - Cancel stale orders immediately
   - Avoid adverse selection
   - Monitor fill rates and slippage
   - Implement smart order routing

4. **Strategy Development**
   - Backtest with tick-level data
   - Account for market impact
   - Consider transaction costs accurately
   - Test in simulation before live trading

5. **Monitoring**
   - Track latency metrics continuously
   - Monitor market conditions
   - Log all orders and executions
   - Implement real-time alerting

## Exercises

1. **Order Book Analysis**: Implement a system that analyzes order book imbalance and predicts short-term price movements. Test its accuracy on historical data.

2. **Market Making Simulation**: Build a market making strategy with inventory management. Simulate different market conditions and measure profitability.

3. **Latency Measurement**: Create a latency monitoring system that tracks execution times. Identify bottlenecks and optimize performance.

4. **Statistical Arbitrage**: Implement a pairs trading strategy for two correlated assets. Measure the strategy's performance and Sharpe ratio.

5. **Risk Controls**: Add comprehensive risk controls to the HFT system including position limits, loss limits, and circuit breakers.

## Summary

High-frequency trading requires specialized infrastructure and careful attention to execution details. Key takeaways:

- Market microstructure understanding is essential for HFT strategies
- Latency optimization is critical for competitive advantage
- Market making provides liquidity while earning the spread
- Statistical arbitrage exploits temporary price discrepancies
- Robust risk management prevents catastrophic losses

In the next lesson, we'll explore options and derivatives trading strategies.

