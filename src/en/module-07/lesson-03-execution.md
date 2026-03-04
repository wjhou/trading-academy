# Lesson 7.3: Order Execution

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand different order types and their use cases
- Implement order management systems
- Handle partial fills and order rejections
- Manage order lifecycle and state transitions
- Implement execution algorithms

## Introduction

Order execution is where strategy meets reality. Poor execution can turn a profitable strategy into a losing one through slippage, missed fills, and execution errors. This lesson covers professional order management and execution techniques.

## Order Types

### Market Orders

Execute immediately at best available price:

```python
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderSide(Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    PARTIAL = "partial"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

@dataclass
class Order:
    """Represents a trading order."""
    order_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: int
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "DAY"  # DAY, GTC, IOC, FOK
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: int = 0
    avg_fill_price: float = 0.0
    created_at: datetime = None
    updated_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        self.updated_at = self.created_at
```

### Limit Orders

Execute at specified price or better:

```python
class LimitOrder:
    """
    Limit order implementation.
    """

    @staticmethod
    def can_execute(order: Order, current_price: float) -> bool:
        """
        Check if limit order can execute.

        Parameters:
        -----------
        order : Order
            Limit order
        current_price : float
            Current market price

        Returns:
        --------
        bool : True if can execute
        """
        if order.side == OrderSide.BUY:
            # Buy limit: execute if market price <= limit price
            return current_price <= order.price
        else:
            # Sell limit: execute if market price >= limit price
            return current_price >= order.price
```

### Stop Orders

Trigger when price reaches stop level:

```python
class StopOrder:
    """
    Stop order implementation.
    """

    @staticmethod
    def is_triggered(order: Order, current_price: float) -> bool:
        """
        Check if stop order is triggered.

        Parameters:
        -----------
        order : Order
            Stop order
        current_price : float
            Current market price

        Returns:
        --------
        bool : True if triggered
        """
        if order.side == OrderSide.BUY:
            # Buy stop: trigger if price >= stop price
            return current_price >= order.stop_price
        else:
            # Sell stop: trigger if price <= stop price
            return current_price <= order.stop_price
```

## Order Management System

Complete order lifecycle management:

```python
from queue import Queue
from threading import Lock
import uuid

class OrderManager:
    """
    Manages order lifecycle and execution.
    """

    def __init__(self, broker_api):
        """
        Initialize order manager.

        Parameters:
        -----------
        broker_api : object
            Broker API client
        """
        self.broker_api = broker_api
        self.orders: Dict[str, Order] = {}
        self.order_queue = Queue()
        self.lock = Lock()

    def create_order(self,
                    symbol: str,
                    side: OrderSide,
                    order_type: OrderType,
                    quantity: int,
                    price: Optional[float] = None,
                    stop_price: Optional[float] = None) -> Order:
        """
        Create a new order.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        side : OrderSide
            Buy or sell
        order_type : OrderType
            Order type
        quantity : int
            Order quantity
        price : float, optional
            Limit price
        stop_price : float, optional
            Stop price

        Returns:
        --------
        Order : Created order
        """
        order_id = str(uuid.uuid4())

        order = Order(
            order_id=order_id,
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price,
            stop_price=stop_price
        )

        with self.lock:
            self.orders[order_id] = order

        return order

    def submit_order(self, order: Order) -> bool:
        """
        Submit order to broker.

        Parameters:
        -----------
        order : Order
            Order to submit

        Returns:
        --------
        bool : True if submitted successfully
        """
        try:
            # Submit to broker
            broker_order_id = self.broker_api.place_order(
                symbol=order.symbol,
                side=order.side.value,
                order_type=order.order_type.value,
                quantity=order.quantity,
                price=order.price,
                stop_price=order.stop_price,
                time_in_force=order.time_in_force
            )

            # Update order status
            with self.lock:
                order.status = OrderStatus.SUBMITTED
                order.updated_at = datetime.now()

            print(f"Order submitted: {order.order_id}")
            return True

        except Exception as e:
            print(f"Error submitting order: {e}")

            with self.lock:
                order.status = OrderStatus.REJECTED
                order.updated_at = datetime.now()

            return False

    def cancel_order(self, order_id: str) -> bool:
        """
        Cancel an order.

        Parameters:
        -----------
        order_id : str
            Order ID

        Returns:
        --------
        bool : True if cancelled successfully
        """
        with self.lock:
            if order_id not in self.orders:
                print(f"Order not found: {order_id}")
                return False

            order = self.orders[order_id]

            if order.status in [OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.REJECTED]:
                print(f"Cannot cancel order in status: {order.status}")
                return False

        try:
            # Cancel with broker
            self.broker_api.cancel_order(order_id)

            with self.lock:
                order.status = OrderStatus.CANCELLED
                order.updated_at = datetime.now()

            print(f"Order cancelled: {order_id}")
            return True

        except Exception as e:
            print(f"Error cancelling order: {e}")
            return False

    def update_order_fill(self,
                         order_id: str,
                         filled_quantity: int,
                         fill_price: float):
        """
        Update order with fill information.

        Parameters:
        -----------
        order_id : str
            Order ID
        filled_quantity : int
            Quantity filled
        fill_price : float
            Fill price
        """
        with self.lock:
            if order_id not in self.orders:
                print(f"Order not found: {order_id}")
                return

            order = self.orders[order_id]

            # Update filled quantity and average price
            total_filled = order.filled_quantity + filled_quantity
            total_value = (order.filled_quantity * order.avg_fill_price) + (filled_quantity * fill_price)

            order.filled_quantity = total_filled
            order.avg_fill_price = total_value / total_filled

            # Update status
            if order.filled_quantity >= order.quantity:
                order.status = OrderStatus.FILLED
            else:
                order.status = OrderStatus.PARTIAL

            order.updated_at = datetime.now()

            print(f"Order {order_id}: Filled {filled_quantity} @ ${fill_price:.2f}")

    def get_order(self, order_id: str) -> Optional[Order]:
        """Get order by ID."""
        with self.lock:
            return self.orders.get(order_id)

    def get_open_orders(self) -> List[Order]:
        """Get all open orders."""
        with self.lock:
            return [
                order for order in self.orders.values()
                if order.status in [OrderStatus.PENDING, OrderStatus.SUBMITTED, OrderStatus.PARTIAL]
            ]

    def get_filled_orders(self) -> List[Order]:
        """Get all filled orders."""
        with self.lock:
            return [
                order for order in self.orders.values()
                if order.status == OrderStatus.FILLED
            ]
```

## Execution Algorithms

### TWAP (Time-Weighted Average Price)

Spread order execution over time:

```python
import time

class TWAPExecutor:
    """
    TWAP execution algorithm.
    """

    def __init__(self, order_manager: OrderManager):
        """
        Initialize TWAP executor.

        Parameters:
        -----------
        order_manager : OrderManager
            Order manager
        """
        self.order_manager = order_manager

    def execute(self,
               symbol: str,
               side: OrderSide,
               total_quantity: int,
               duration_minutes: int,
               num_slices: int = 10):
        """
        Execute order using TWAP.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        side : OrderSide
            Buy or sell
        total_quantity : int
            Total quantity to execute
        duration_minutes : int
            Execution duration in minutes
        num_slices : int
            Number of order slices
        """
        slice_quantity = total_quantity // num_slices
        remaining = total_quantity % num_slices

        interval_seconds = (duration_minutes * 60) / num_slices

        print(f"TWAP: Executing {total_quantity} shares over {duration_minutes} minutes")
        print(f"Slice size: {slice_quantity}, Interval: {interval_seconds:.1f}s")

        for i in range(num_slices):
            # Add remainder to last slice
            quantity = slice_quantity + (remaining if i == num_slices - 1 else 0)

            # Create and submit order
            order = self.order_manager.create_order(
                symbol=symbol,
                side=side,
                order_type=OrderType.MARKET,
                quantity=quantity
            )

            self.order_manager.submit_order(order)

            # Wait for next slice (except last)
            if i < num_slices - 1:
                time.sleep(interval_seconds)

        print("TWAP execution complete")
```

### VWAP (Volume-Weighted Average Price)

Execute based on historical volume profile:

```python
class VWAPExecutor:
    """
    VWAP execution algorithm.
    """

    def __init__(self, order_manager: OrderManager):
        self.order_manager = order_manager

    def calculate_volume_profile(self, historical_data: pd.DataFrame) -> List[float]:
        """
        Calculate intraday volume profile.

        Parameters:
        -----------
        historical_data : pd.DataFrame
            Historical intraday data

        Returns:
        --------
        List[float] : Volume percentages by time period
        """
        # Group by time of day
        historical_data['time'] = historical_data.index.time
        volume_by_time = historical_data.groupby('time')['Volume'].mean()

        # Calculate percentages
        total_volume = volume_by_time.sum()
        volume_profile = (volume_by_time / total_volume).tolist()

        return volume_profile

    def execute(self,
               symbol: str,
               side: OrderSide,
               total_quantity: int,
               volume_profile: List[float]):
        """
        Execute order using VWAP.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        side : OrderSide
            Buy or sell
        total_quantity : int
            Total quantity
        volume_profile : List[float]
            Volume distribution
        """
        print(f"VWAP: Executing {total_quantity} shares")

        for i, volume_pct in enumerate(volume_profile):
            quantity = int(total_quantity * volume_pct)

            if quantity > 0:
                order = self.order_manager.create_order(
                    symbol=symbol,
                    side=side,
                    order_type=OrderType.MARKET,
                    quantity=quantity
                )

                self.order_manager.submit_order(order)

                # Wait for next period
                time.sleep(60)  # 1 minute intervals

        print("VWAP execution complete")
```

## Handling Execution Issues

### Partial Fills

```python
class PartialFillHandler:
    """
    Handles partial fills.
    """

    def __init__(self, order_manager: OrderManager):
        self.order_manager = order_manager

    def handle_partial_fill(self, order: Order, timeout_seconds: int = 60):
        """
        Handle partial fill - wait or cancel.

        Parameters:
        -----------
        order : Order
            Partially filled order
        timeout_seconds : int
            Timeout before cancelling
        """
        start_time = time.time()

        while order.status == OrderStatus.PARTIAL:
            elapsed = time.time() - start_time

            if elapsed > timeout_seconds:
                # Cancel remaining
                print(f"Partial fill timeout - cancelling remaining")
                self.order_manager.cancel_order(order.order_id)
                break

            time.sleep(1)
```

### Order Rejections

```python
class RejectionHandler:
    """
    Handles order rejections.
    """

    def handle_rejection(self, order: Order, reason: str):
        """
        Handle order rejection.

        Parameters:
        -----------
        order : Order
            Rejected order
        reason : str
            Rejection reason
        """
        print(f"Order rejected: {reason}")

        # Common rejection reasons and responses
        if "insufficient funds" in reason.lower():
            print("Reducing order size")
            # Retry with smaller size
            new_quantity = order.quantity // 2
            if new_quantity > 0:
                # Create new order with reduced size
                pass

        elif "invalid price" in reason.lower():
            print("Adjusting price")
            # Retry with market order
            pass

        elif "symbol not found" in reason.lower():
            print("Invalid symbol - cannot retry")
            # Log error and alert

        else:
            print(f"Unknown rejection reason: {reason}")
```

## Best Practices

1. **Order Validation**: Validate before submission
2. **State Management**: Track order lifecycle carefully
3. **Error Handling**: Handle all rejection scenarios
4. **Execution Algorithms**: Use TWAP/VWAP for large orders
5. **Monitoring**: Log all order events
6. **Timeouts**: Set appropriate timeouts
7. **Partial Fills**: Have a strategy for handling
8. **Testing**: Test with paper trading first

## Exercises

### Exercise 1: Order Manager

Implement a complete order management system with:
- Order creation and submission
- Order cancellation
- Fill tracking
- Status updates

### Exercise 2: Execution Algorithm

Implement a TWAP executor that:
- Splits large orders
- Executes over time
- Handles failures
- Reports progress

### Exercise 3: Smart Order Router

Create a smart order router that:
- Chooses best execution venue
- Handles partial fills
- Retries failed orders
- Minimizes market impact

### Exercise 4: Execution Analysis

Analyze execution quality by calculating:
- Implementation shortfall
- VWAP comparison
- Slippage analysis
- Fill rate statistics

## Summary

Professional order execution requires:

- **Order Types**: Market, limit, stop orders
- **Order Management**: Complete lifecycle tracking
- **Execution Algorithms**: TWAP, VWAP for large orders
- **Error Handling**: Rejections, partial fills, timeouts
- **Monitoring**: Comprehensive logging and alerts

Good execution:
- Minimizes slippage
- Reduces market impact
- Handles errors gracefully
- Provides execution analytics

## Next Steps

In the next lesson, we'll explore monitoring and alerting systems to track system health, performance, and detect issues in real-time.