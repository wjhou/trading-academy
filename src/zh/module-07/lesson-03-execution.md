# 第7.3课：订单执行

## 学习目标

在本课结束时，您将能够：
- 理解不同的订单类型及其用例
- 实施订单管理系统
- 处理部分成交和订单拒绝
- 管理订单生命周期和状态转换
- 实施执行算法

## 简介

订单执行是策略与现实的交汇点。糟糕的执行可能会通过滑点、错过成交和执行错误将盈利策略变成亏损策略。本课涵盖专业的订单管理和执行技术。

## 订单类型

### 市价单

以最佳可用价格立即执行：

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
    """表示交易订单。"""
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

### 限价单

以指定价格或更好的价格执行：

```python
class LimitOrder:
    """
    限价单实现。
    """

    @staticmethod
    def can_execute(order: Order, current_price: float) -> bool:
        """
        检查限价单是否可以执行。

        Parameters:
        -----------
        order : Order
            限价单
        current_price : float
            当前市场价格

        Returns:
        --------
        bool : 如果可以执行则为True
        """
        if order.side == OrderSide.BUY:
            # 买入限价：如果市场价格 <= 限价则执行
            return current_price <= order.price
        else:
            # 卖出限价：如果市场价格 >= 限价则执行
            return current_price >= order.price
```

### 止损单

当价格达到止损水平时触发：

```python
class StopOrder:
    """
    止损单实现。
    """

    @staticmethod
    def is_triggered(order: Order, current_price: float) -> bool:
        """
        检查止损单是否被触发。

        Parameters:
        -----------
        order : Order
            止损单
        current_price : float
            当前市场价格

        Returns:
        --------
        bool : 如果被触发则为True
        """
        if order.side == OrderSide.BUY:
            # 买入止损：如果价格 >= 止损价则触发
            return current_price >= order.stop_price
        else:
            # 卖出止损：如果价格 <= 止损价则触发
            return current_price <= order.stop_price
```

## 订单管理系统

完整的订单生命周期管理：

```python
from queue import Queue
from threading import Lock
import uuid

class OrderManager:
    """
    管理订单生命周期和执行。
    """

    def __init__(self, broker_api):
        """
        初始化订单管理器。

        Parameters:
        -----------
        broker_api : object
            券商API客户端
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
        创建新订单。

        Parameters:
        -----------
        symbol : str
            股票代码
        side : OrderSide
            买入或卖出
        order_type : OrderType
            订单类型
        quantity : int
            订单数量
        price : float, optional
            限价
        stop_price : float, optional
            止损价

        Returns:
        --------
        Order : 创建的订单
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
        向券商提交订单。

        Parameters:
        -----------
        order : Order
            要提交的订单

        Returns:
        --------
        bool : 如果成功提交则为True
        """
        try:
            # 提交给券商
            broker_order_id = self.broker_api.place_order(
                symbol=order.symbol,
                side=order.side.value,
                order_type=order.order_type.value,
                quantity=order.quantity,
                price=order.price,
                stop_price=order.stop_price,
                time_in_force=order.time_in_force
            )

            # 更新订单状态
            with self.lock:
                order.status = OrderStatus.SUBMITTED
                order.updated_at = datetime.now()

            print(f"订单已提交: {order.order_id}")
            return True

        except Exception as e:
            print(f"提交订单时出错: {e}")

            with self.lock:
                order.status = OrderStatus.REJECTED
                order.updated_at = datetime.now()

            return False

    def cancel_order(self, order_id: str) -> bool:
        """
        取消订单。

        Parameters:
        -----------
        order_id : str
            订单ID

        Returns:
        --------
        bool : 如果成功取消则为True
        """
        with self.lock:
            if order_id not in self.orders:
                print(f"未找到订单: {order_id}")
                return False

            order = self.orders[order_id]

            if order.status in [OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.REJECTED]:
                print(f"无法取消状态为{order.status}的订单")
                return False

        try:
            # 向券商取消
            self.broker_api.cancel_order(order_id)

            with self.lock:
                order.status = OrderStatus.CANCELLED
                order.updated_at = datetime.now()

            print(f"订单已取消: {order_id}")
            return True

        except Exception as e:
            print(f"取消订单时出错: {e}")
            return False

    def update_order_fill(self,
                         order_id: str,
                         filled_quantity: int,
                         fill_price: float):
        """
        使用成交信息更新订单。

        Parameters:
        -----------
        order_id : str
            订单ID
        filled_quantity : int
            成交数量
        fill_price : float
            成交价格
        """
        with self.lock:
            if order_id not in self.orders:
                print(f"未找到订单: {order_id}")
                return

            order = self.orders[order_id]

            # 更新成交数量和平均价格
            total_filled = order.filled_quantity + filled_quantity
            total_value = (order.filled_quantity * order.avg_fill_price) + (filled_quantity * fill_price)

            order.filled_quantity = total_filled
            order.avg_fill_price = total_value / total_filled

            # 更新状态
            if order.filled_quantity >= order.quantity:
                order.status = OrderStatus.FILLED
            else:
                order.status = OrderStatus.PARTIAL

            order.updated_at = datetime.now()

            print(f"订单{order_id}: 成交{filled_quantity}股 @ ${fill_price:.2f}")

    def get_order(self, order_id: str) -> Optional[Order]:
        """通过ID获取订单。"""
        with self.lock:
            return self.orders.get(order_id)

    def get_open_orders(self) -> List[Order]:
        """获取所有未完成订单。"""
        with self.lock:
            return [
                order for order in self.orders.values()
                if order.status in [OrderStatus.PENDING, OrderStatus.SUBMITTED, OrderStatus.PARTIAL]
            ]

    def get_filled_orders(self) -> List[Order]:
        """获取所有已成交订单。"""
        with self.lock:
            return [
                order for order in self.orders.values()
                if order.status == OrderStatus.FILLED
            ]
```

## 执行算法

### TWAP（时间加权平均价格）

将订单执行分散到一段时间内：

```python
import time

class TWAPExecutor:
    """
    TWAP执行算法。
    """

    def __init__(self, order_manager: OrderManager):
        """
        初始化TWAP执行器。

        Parameters:
        -----------
        order_manager : OrderManager
            订单管理器
        """
        self.order_manager = order_manager

    def execute(self,
               symbol: str,
               side: OrderSide,
               total_quantity: int,
               duration_minutes: int,
               num_slices: int = 10):
        """
        使用TWAP执行订单。

        Parameters:
        -----------
        symbol : str
            股票代码
        side : OrderSide
            买入或卖出
        total_quantity : int
            要执行的总数量
        duration_minutes : int
            执行持续时间（分钟）
        num_slices : int
            订单切片数量
        """
        slice_quantity = total_quantity // num_slices
        remaining = total_quantity % num_slices

        interval_seconds = (duration_minutes * 60) / num_slices

        print(f"TWAP: 在{duration_minutes}分钟内执行{total_quantity}股")
        print(f"切片大小: {slice_quantity}, 间隔: {interval_seconds:.1f}秒")

        for i in range(num_slices):
            # 将余数添加到最后一个切片
            quantity = slice_quantity + (remaining if i == num_slices - 1 else 0)

            # 创建并提交订单
            order = self.order_manager.create_order(
                symbol=symbol,
                side=side,
                order_type=OrderType.MARKET,
                quantity=quantity
            )

            self.order_manager.submit_order(order)

            # 等待下一个切片（最后一个除外）
            if i < num_slices - 1:
                time.sleep(interval_seconds)

        print("TWAP执行完成")
```

### VWAP（成交量加权平均价格）

基于历史成交量分布执行：

```python
class VWAPExecutor:
    """
    VWAP执行算法。
    """

    def __init__(self, order_manager: OrderManager):
        self.order_manager = order_manager

    def calculate_volume_profile(self, historical_data: pd.DataFrame) -> List[float]:
        """
        计算日内成交量分布。

        Parameters:
        -----------
        historical_data : pd.DataFrame
            历史日内数据

        Returns:
        --------
        List[float] : 按时间段的成交量百分比
        """
        # 按时间分组
        historical_data['time'] = historical_data.index.time
        volume_by_time = historical_data.groupby('time')['Volume'].mean()

        # 计算百分比
        total_volume = volume_by_time.sum()
        volume_profile = (volume_by_time / total_volume).tolist()

        return volume_profile

    def execute(self,
               symbol: str,
               side: OrderSide,
               total_quantity: int,
               volume_profile: List[float]):
        """
        使用VWAP执行订单。

        Parameters:
        -----------
        symbol : str
            股票代码
        side : OrderSide
            买入或卖出
        total_quantity : int
            总数量
        volume_profile : List[float]
            成交量分布
        """
        print(f"VWAP: 执行{total_quantity}股")

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

                # 等待下一个时段
                time.sleep(60)  # 1分钟间隔

        print("VWAP执行完成")
```

## 处理执行问题

### 部分成交

```python
class PartialFillHandler:
    """
    处理部分成交。
    """

    def __init__(self, order_manager: OrderManager):
        self.order_manager = order_manager

    def handle_partial_fill(self, order: Order, timeout_seconds: int = 60):
        """
        处理部分成交 - 等待或取消。

        Parameters:
        -----------
        order : Order
            部分成交的订单
        timeout_seconds : int
            取消前的超时时间
        """
        start_time = time.time()

        while order.status == OrderStatus.PARTIAL:
            elapsed = time.time() - start_time

            if elapsed > timeout_seconds:
                # 取消剩余部分
                print(f"部分成交超时 - 取消剩余部分")
                self.order_manager.cancel_order(order.order_id)
                break

            time.sleep(1)
```

### 订单拒绝

```python
class RejectionHandler:
    """
    处理订单拒绝。
    """

    def handle_rejection(self, order: Order, reason: str):
        """
        处理订单拒绝。

        Parameters:
        -----------
        order : Order
            被拒绝的订单
        reason : str
            拒绝原因
        """
        print(f"订单被拒绝: {reason}")

        # 常见拒绝原因和响应
        if "insufficient funds" in reason.lower():
            print("减少订单规模")
            # 使用较小规模重试
            new_quantity = order.quantity // 2
            if new_quantity > 0:
                # 创建规模减小的新订单
                pass

        elif "invalid price" in reason.lower():
            print("调整价格")
            # 使用市价单重试
            pass

        elif "symbol not found" in reason.lower():
            print("无效代码 - 无法重试")
            # 记录错误并发出警报

        else:
            print(f"未知拒绝原因: {reason}")
```

## 最佳实践

1. **订单验证**：提交前进行验证
2. **状态管理**：仔细跟踪订单生命周期
3. **错误处理**：处理所有拒绝场景
4. **执行算法**：对大订单使用TWAP/VWAP
5. **监控**：记录所有订单事件
6. **超时**：设置适当的超时时间
7. **部分成交**：制定处理策略
8. **测试**：首先使用模拟交易测试

## 练习

### 练习1：订单管理器

实现一个完整的订单管理系统，包括：
- 订单创建和提交
- 订单取消
- 成交跟踪
- 状态更新

### 练习2：执行算法

实现一个TWAP执行器，包括：
- 拆分大订单
- 随时间执行
- 处理失败
- 报告进度

### 练习3：智能订单路由

创建一个智能订单路由器，包括：
- 选择最佳执行场所
- 处理部分成交
- 重试失败的订单
- 最小化市场影响

### 练习4：执行分析

通过计算以下内容分析执行质量：
- 实施缺口
- VWAP比较
- 滑点分析
- 成交率统计

## 总结

专业的订单执行需要：

- **订单类型**：市价单、限价单、止损单
- **订单管理**：完整的生命周期跟踪
- **执行算法**：对大订单使用TWAP、VWAP
- **错误处理**：拒单、部分成交、超时
- **监控**：全面的日志记录和警报

良好的执行：
- 最小化滑点
- 减少市场影响
- 优雅地处理错误
- 提供执行分析

## 下一步

在下一课中，我们将探讨监控和警报系统，以跟踪系统健康状况、性能并实时检测问题。