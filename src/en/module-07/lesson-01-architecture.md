# Lesson 7.1: System Architecture

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand the components of an automated trading system
- Design a robust system architecture
- Implement proper separation of concerns
- Handle system failures and edge cases
- Build scalable and maintainable trading systems

## Introduction

Automated trading systems execute trades without human intervention based on predefined rules. Unlike backtesting, live trading systems must handle real-time data, network issues, API failures, and unexpected market conditions.

A well-designed architecture is critical for reliability, maintainability, and scalability. This lesson covers the essential components and design principles for building professional automated trading systems.

## System Components

### 1. Data Feed Handler

Manages real-time and historical market data:

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Callable
from datetime import datetime
import pandas as pd
from queue import Queue
import threading

class DataFeed(ABC):
    """
    Abstract base class for data feeds.
    """

    def __init__(self):
        self.subscribers: List[Callable] = []
        self.is_running = False

    def subscribe(self, callback: Callable):
        """Subscribe to data updates."""
        self.subscribers.append(callback)

    def notify_subscribers(self, data: Dict):
        """Notify all subscribers of new data."""
        for callback in self.subscribers:
            try:
                callback(data)
            except Exception as e:
                print(f"Error notifying subscriber: {e}")

    @abstractmethod
    def start(self):
        """Start data feed."""
        pass

    @abstractmethod
    def stop(self):
        """Stop data feed."""
        pass


class SimulatedDataFeed(DataFeed):
    """
    Simulated data feed for testing.
    """

    def __init__(self, historical_data: pd.DataFrame, speed: float = 1.0):
        """
        Initialize simulated feed.

        Parameters:
        -----------
        historical_data : pd.DataFrame
            Historical OHLCV data
        speed : float
            Playback speed multiplier
        """
        super().__init__()
        self.data = historical_data
        self.speed = speed
        self.current_index = 0
        self.thread = None

    def start(self):
        """Start simulated feed."""
        self.is_running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.start()
        print("Simulated data feed started")

    def stop(self):
        """Stop simulated feed."""
        self.is_running = False
        if self.thread:
            self.thread.join()
        print("Simulated data feed stopped")

    def _run(self):
        """Run data feed loop."""
        import time

        while self.is_running and self.current_index < len(self.data):
            # Get current bar
            bar = self.data.iloc[self.current_index]

            # Create data packet
            data_packet = {
                'timestamp': bar.name,
                'open': bar['Open'],
                'high': bar['High'],
                'low': bar['Low'],
                'close': bar['Close'],
                'volume': bar['Volume']
            }

            # Notify subscribers
            self.notify_subscribers(data_packet)

            self.current_index += 1

            # Sleep to simulate real-time
            time.sleep(1.0 / self.speed)


class LiveDataFeed(DataFeed):
    """
    Live data feed using API (example structure).
    """

    def __init__(self, api_key: str, symbols: List[str]):
        """
        Initialize live feed.

        Parameters:
        -----------
        api_key : str
            API key for data provider
        symbols : List[str]
            Symbols to subscribe to
        """
        super().__init__()
        self.api_key = api_key
        self.symbols = symbols
        self.thread = None

    def start(self):
        """Start live feed."""
        self.is_running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.start()
        print(f"Live data feed started for {self.symbols}")

    def stop(self):
        """Stop live feed."""
        self.is_running = False
        if self.thread:
            self.thread.join()
        print("Live data feed stopped")

    def _run(self):
        """Run data feed loop."""
        import time

        while self.is_running:
            try:
                # Fetch latest data from API
                # This is a placeholder - implement actual API calls
                data_packet = self._fetch_latest_data()

                if data_packet:
                    self.notify_subscribers(data_packet)

                time.sleep(1)  # Poll every second

            except Exception as e:
                print(f"Error in live feed: {e}")
                time.sleep(5)  # Wait before retry

    def _fetch_latest_data(self) -> Dict:
        """Fetch latest data from API."""
        # Placeholder - implement actual API integration
        pass
```

### 2. Strategy Engine

Generates trading signals:

```python
class StrategyEngine:
    """
    Manages trading strategies and signal generation.
    """

    def __init__(self):
        self.strategies = []
        self.signal_queue = Queue()

    def add_strategy(self, strategy):
        """Add a strategy to the engine."""
        self.strategies.append(strategy)

    def on_data(self, data: Dict):
        """
        Process new data and generate signals.

        Parameters:
        -----------
        data : Dict
            Market data packet
        """
        for strategy in self.strategies:
            try:
                signals = strategy.generate_signals(data)

                if signals:
                    self.signal_queue.put(signals)

            except Exception as e:
                print(f"Error in strategy {strategy.__class__.__name__}: {e}")

    def get_signals(self) -> List[Dict]:
        """Get all pending signals."""
        signals = []
        while not self.signal_queue.empty():
            signals.append(self.signal_queue.get())
        return signals
```

### 3. Risk Manager

Validates trades and manages risk:

```python
class RiskManager:
    """
    Validates trades and enforces risk limits.
    """

    def __init__(self,
                 max_position_size: float = 0.10,
                 max_portfolio_risk: float = 0.06,
                 max_drawdown: float = 0.20):
        """
        Initialize risk manager.

        Parameters:
        -----------
        max_position_size : float
            Maximum position size as fraction of capital
        max_portfolio_risk : float
            Maximum total portfolio risk
        max_drawdown : float
            Maximum allowed drawdown
        """
        self.max_position_size = max_position_size
        self.max_portfolio_risk = max_portfolio_risk
        self.max_drawdown = max_drawdown

        self.current_positions = {}
        self.peak_capital = 0
        self.current_capital = 0

    def validate_order(self, order: Dict, portfolio_state: Dict) -> Tuple[bool, str]:
        """
        Validate an order against risk limits.

        Parameters:
        -----------
        order : Dict
            Order to validate
        portfolio_state : Dict
            Current portfolio state

        Returns:
        --------
        Tuple[bool, str] : (is_valid, reason)
        """
        # Check drawdown
        current_dd = self._calculate_drawdown(portfolio_state)
        if current_dd >= self.max_drawdown:
            return False, f"Maximum drawdown exceeded: {current_dd:.2%}"

        # Check position size
        position_size = order['quantity'] * order['price'] / portfolio_state['total_value']
        if position_size > self.max_position_size:
            return False, f"Position size too large: {position_size:.2%}"

        # Check portfolio risk
        total_risk = self._calculate_portfolio_risk(portfolio_state, order)
        if total_risk > self.max_portfolio_risk:
            return False, f"Portfolio risk too high: {total_risk:.2%}"

        return True, "OK"

    def _calculate_drawdown(self, portfolio_state: Dict) -> float:
        """Calculate current drawdown."""
        total_value = portfolio_state['total_value']

        if total_value > self.peak_capital:
            self.peak_capital = total_value

        if self.peak_capital == 0:
            return 0.0

        return (self.peak_capital - total_value) / self.peak_capital

    def _calculate_portfolio_risk(self, portfolio_state: Dict, new_order: Dict) -> float:
        """Calculate total portfolio risk including new order."""
        # Simplified risk calculation
        # In practice, consider correlations, stop losses, etc.
        current_risk = sum(pos.get('risk', 0) for pos in portfolio_state.get('positions', {}).values())

        # Estimate new order risk (e.g., 2% stop loss)
        new_risk = new_order['quantity'] * new_order['price'] * 0.02 / portfolio_state['total_value']

        return current_risk + new_risk
```

### 4. Execution Handler

Manages order execution:

```python
class ExecutionHandler:
    """
    Handles order execution and broker communication.
    """

    def __init__(self, broker_api):
        """
        Initialize execution handler.

        Parameters:
        -----------
        broker_api : object
            Broker API client
        """
        self.broker_api = broker_api
        self.pending_orders = {}
        self.filled_orders = []

    def submit_order(self, order: Dict) -> str:
        """
        Submit an order to the broker.

        Parameters:
        -----------
        order : Dict
            Order details

        Returns:
        --------
        str : Order ID
        """
        try:
            # Submit to broker
            order_id = self.broker_api.place_order(
                symbol=order['symbol'],
                side=order['side'],
                quantity=order['quantity'],
                order_type=order['type'],
                price=order.get('price')
            )

            # Track order
            self.pending_orders[order_id] = {
                'order': order,
                'status': 'pending',
                'submitted_at': datetime.now()
            }

            print(f"Order submitted: {order_id}")
            return order_id

        except Exception as e:
            print(f"Error submitting order: {e}")
            return None

    def check_order_status(self, order_id: str) -> Dict:
        """
        Check status of an order.

        Parameters:
        -----------
        order_id : str
            Order ID

        Returns:
        --------
        Dict : Order status
        """
        try:
            status = self.broker_api.get_order_status(order_id)
            return status

        except Exception as e:
            print(f"Error checking order status: {e}")
            return None

    def cancel_order(self, order_id: str) -> bool:
        """
        Cancel a pending order.

        Parameters:
        -----------
        order_id : str
            Order ID

        Returns:
        --------
        bool : True if cancelled successfully
        """
        try:
            self.broker_api.cancel_order(order_id)

            if order_id in self.pending_orders:
                self.pending_orders[order_id]['status'] = 'cancelled'

            print(f"Order cancelled: {order_id}")
            return True

        except Exception as e:
            print(f"Error cancelling order: {e}")
            return False

    def update_orders(self):
        """Update status of all pending orders."""
        for order_id in list(self.pending_orders.keys()):
            status = self.check_order_status(order_id)

            if status and status['status'] == 'filled':
                # Move to filled orders
                self.filled_orders.append({
                    'order_id': order_id,
                    'order': self.pending_orders[order_id]['order'],
                    'fill_price': status['fill_price'],
                    'fill_time': status['fill_time']
                })

                del self.pending_orders[order_id]
                print(f"Order filled: {order_id}")
```

### 5. Portfolio Manager

Tracks positions and portfolio state:

```python
class PortfolioManager:
    """
    Manages portfolio state and positions.
    """

    def __init__(self, initial_capital: float):
        """
        Initialize portfolio manager.

        Parameters:
        -----------
        initial_capital : float
            Starting capital
        """
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions = {}
        self.trades = []

    def update_position(self, fill: Dict):
        """
        Update positions based on fill.

        Parameters:
        -----------
        fill : Dict
            Fill details
        """
        symbol = fill['order']['symbol']
        side = fill['order']['side']
        quantity = fill['order']['quantity']
        price = fill['fill_price']

        if side == 'buy':
            if symbol in self.positions:
                # Add to existing position
                pos = self.positions[symbol]
                total_cost = (pos['quantity'] * pos['avg_price']) + (quantity * price)
                pos['quantity'] += quantity
                pos['avg_price'] = total_cost / pos['quantity']
            else:
                # New position
                self.positions[symbol] = {
                    'quantity': quantity,
                    'avg_price': price,
                    'current_price': price
                }

            self.cash -= quantity * price

        elif side == 'sell':
            if symbol in self.positions:
                pos = self.positions[symbol]

                # Calculate P&L
                pnl = (price - pos['avg_price']) * quantity

                # Record trade
                self.trades.append({
                    'symbol': symbol,
                    'quantity': quantity,
                    'entry_price': pos['avg_price'],
                    'exit_price': price,
                    'pnl': pnl,
                    'exit_time': fill['fill_time']
                })

                # Update position
                pos['quantity'] -= quantity

                if pos['quantity'] <= 0:
                    del self.positions[symbol]

                self.cash += quantity * price

    def update_prices(self, prices: Dict[str, float]):
        """
        Update current prices for positions.

        Parameters:
        -----------
        prices : Dict[str, float]
            Current prices by symbol
        """
        for symbol, pos in self.positions.items():
            if symbol in prices:
                pos['current_price'] = prices[symbol]

    def get_portfolio_state(self) -> Dict:
        """Get current portfolio state."""
        positions_value = sum(
            pos['quantity'] * pos['current_price']
            for pos in self.positions.values()
        )

        total_value = self.cash + positions_value

        return {
            'cash': self.cash,
            'positions_value': positions_value,
            'total_value': total_value,
            'positions': self.positions,
            'num_positions': len(self.positions)
        }
```

### 6. Main Trading System

Orchestrates all components:

```python
class TradingSystem:
    """
    Main automated trading system.
    """

    def __init__(self,
                 data_feed: DataFeed,
                 strategy_engine: StrategyEngine,
                 risk_manager: RiskManager,
                 execution_handler: ExecutionHandler,
                 portfolio_manager: PortfolioManager):
        """
        Initialize trading system.

        Parameters:
        -----------
        data_feed : DataFeed
            Data feed handler
        strategy_engine : StrategyEngine
            Strategy engine
        risk_manager : RiskManager
            Risk manager
        execution_handler : ExecutionHandler
            Execution handler
        portfolio_manager : PortfolioManager
            Portfolio manager
        """
        self.data_feed = data_feed
        self.strategy_engine = strategy_engine
        self.risk_manager = risk_manager
        self.execution_handler = execution_handler
        self.portfolio_manager = portfolio_manager

        self.is_running = False

        # Subscribe to data feed
        self.data_feed.subscribe(self.on_data)

    def start(self):
        """Start the trading system."""
        print("Starting trading system...")
        self.is_running = True
        self.data_feed.start()
        print("Trading system started")

    def stop(self):
        """Stop the trading system."""
        print("Stopping trading system...")
        self.is_running = False
        self.data_feed.stop()
        print("Trading system stopped")

    def on_data(self, data: Dict):
        """
        Handle new market data.

        Parameters:
        -----------
        data : Dict
            Market data packet
        """
        if not self.is_running:
            return

        try:
            # Update portfolio prices
            prices = {data.get('symbol', 'ASSET'): data['close']}
            self.portfolio_manager.update_prices(prices)

            # Generate signals
            self.strategy_engine.on_data(data)

            # Process signals
            signals = self.strategy_engine.get_signals()

            for signal in signals:
                self.process_signal(signal)

            # Update pending orders
            self.execution_handler.update_orders()

            # Update filled orders
            for fill in self.execution_handler.filled_orders:
                self.portfolio_manager.update_position(fill)

            self.execution_handler.filled_orders.clear()

        except Exception as e:
            print(f"Error in trading loop: {e}")

    def process_signal(self, signal: Dict):
        """
        Process a trading signal.

        Parameters:
        -----------
        signal : Dict
            Trading signal
        """
        # Create order from signal
        order = {
            'symbol': signal['symbol'],
            'side': signal['side'],
            'quantity': signal['quantity'],
            'type': signal.get('type', 'market'),
            'price': signal.get('price')
        }

        # Validate with risk manager
        portfolio_state = self.portfolio_manager.get_portfolio_state()
        is_valid, reason = self.risk_manager.validate_order(order, portfolio_state)

        if is_valid:
            # Submit order
            self.execution_handler.submit_order(order)
        else:
            print(f"Order rejected: {reason}")


# Example usage
def example_trading_system():
    """
    Demonstrate trading system architecture.
    """
    import yfinance as yf

    print("Automated Trading System Example")
    print("=" * 70)

    # Download historical data for simulation
    data = yf.download('AAPL', start='2023-01-01', end='2023-12-31', progress=False)

    # Create components
    data_feed = SimulatedDataFeed(data, speed=10.0)
    strategy_engine = StrategyEngine()
    risk_manager = RiskManager()
    execution_handler = ExecutionHandler(broker_api=None)  # Mock broker
    portfolio_manager = PortfolioManager(initial_capital=100000)

    # Create trading system
    trading_system = TradingSystem(
        data_feed=data_feed,
        strategy_engine=strategy_engine,
        risk_manager=risk_manager,
        execution_handler=execution_handler,
        portfolio_manager=portfolio_manager
    )

    # Start system
    trading_system.start()

    # Run for a while
    import time
    time.sleep(10)

    # Stop system
    trading_system.stop()

    # Print results
    portfolio_state = portfolio_manager.get_portfolio_state()
    print(f"\nFinal Portfolio Value: ${portfolio_state['total_value']:,.2f}")
    print(f"Total Trades: {len(portfolio_manager.trades)}")


if __name__ == "__main__":
    example_trading_system()
```

## Design Principles

### 1. Separation of Concerns

Each component has a single responsibility:
- Data feed: Only handles data
- Strategy: Only generates signals
- Risk manager: Only validates trades
- Execution: Only handles orders
- Portfolio: Only tracks positions

### 2. Loose Coupling

Components communicate through well-defined interfaces:
- Use callbacks and queues
- Avoid direct dependencies
- Easy to swap implementations

### 3. Error Handling

Robust error handling at every level:
- Try-catch blocks around critical operations
- Graceful degradation
- Logging and alerting
- Automatic recovery where possible

### 4. State Management

Clear state tracking:
- Portfolio state
- Order state
- System state
- Persistent storage for recovery

### 5. Scalability

Design for growth:
- Support multiple strategies
- Support multiple assets
- Support multiple data feeds
- Horizontal scaling capability

## Best Practices

1. **Test Thoroughly**: Test each component independently
2. **Log Everything**: Comprehensive logging for debugging
3. **Monitor Continuously**: Real-time monitoring and alerts
4. **Handle Failures**: Expect and handle all failure modes
5. **Version Control**: Track all code and configuration changes
6. **Document Well**: Clear documentation for maintenance
7. **Start Simple**: Begin with basic functionality, add complexity gradually
8. **Paper Trade First**: Test with paper trading before live

## Exercises

### Exercise 1: Component Implementation

Implement a complete DataFeed class that:
- Connects to a real-time data source
- Handles connection failures
- Buffers data during outages
- Notifies subscribers

### Exercise 2: Risk Manager

Enhance the RiskManager with:
- Position correlation limits
- Sector exposure limits
- Daily loss limits
- Time-based restrictions

### Exercise 3: System Integration

Integrate all components into a working system:
- Add a simple strategy
- Run in simulation mode
- Track performance
- Generate reports

### Exercise 4: Failure Handling

Implement failure handling for:
- Network disconnections
- API rate limits
- Invalid data
- Order rejections

## Summary

A well-architected automated trading system consists of:

- **Data Feed**: Real-time market data
- **Strategy Engine**: Signal generation
- **Risk Manager**: Trade validation
- **Execution Handler**: Order management
- **Portfolio Manager**: Position tracking
- **Main System**: Orchestration

Key design principles:
- Separation of concerns
- Loose coupling
- Robust error handling
- Clear state management
- Scalability

Start simple, test thoroughly, and add complexity gradually. Always paper trade before going live.

## Next Steps

In the next lesson, we'll explore data management in detail, including data storage, cleaning, validation, and handling corporate actions.