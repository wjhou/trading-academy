# 第7.1课：系统架构

## 学习目标

在本课结束时，你将能够：
- 理解自动化交易系统的组成部分
- 设计稳健的系统架构
- 实现适当的关注点分离
- 处理系统故障和边缘情况
- 构建可扩展和可维护的交易系统

## 简介

自动化交易系统根据预定义的规则在无人工干预的情况下执行交易。与回测不同，实时交易系统必须处理实时数据、网络问题、API故障和意外的市场状况。

良好设计的架构对于可靠性、可维护性和可扩展性至关重要。本课涵盖构建专业自动化交易系统的基本组件和设计原则。

## 系统组件

### 1. 数据源处理器

管理实时和历史市场数据：

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Callable
from datetime import datetime
import pandas as pd
from queue import Queue
import threading

class DataFeed(ABC):
    """
    数据源的抽象基类。
    """

    def __init__(self):
        self.subscribers: List[Callable] = []
        self.is_running = False

    def subscribe(self, callback: Callable):
        """订阅数据更新。"""
        self.subscribers.append(callback)

    def notify_subscribers(self, data: Dict):
        """通知所有订阅者新数据。"""
        for callback in self.subscribers:
            try:
                callback(data)
            except Exception as e:
                print(f"通知订阅者时出错: {e}")

    @abstractmethod
    def start(self):
        """启动数据源。"""
        pass

    @abstractmethod
    def stop(self):
        """停止数据源。"""
        pass


class SimulatedDataFeed(DataFeed):
    """
    用于测试的模拟数据源。
    """

    def __init__(self, historical_data: pd.DataFrame, speed: float = 1.0):
        """
        初始化模拟数据源。

        参数：
        -----------
        historical_data : pd.DataFrame
            历史OHLCV数据
        speed : float
            回放速度倍数
        """
        super().__init__()
        self.data = historical_data
        self.speed = speed
        self.current_index = 0
        self.thread = None

    def start(self):
        """启动模拟数据源。"""
        self.is_running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.start()
        print("模拟数据源已启动")

    def stop(self):
        """停止模拟数据源。"""
        self.is_running = False
        if self.thread:
            self.thread.join()
        print("模拟数据源已停止")

    def _run(self):
        """运行数据源循环。"""
        import time

        while self.is_running and self.current_index < len(self.data):
            # 获取当前K线
            bar = self.data.iloc[self.current_index]

            # 创建数据包
            data_packet = {
                'timestamp': bar.name,
                'open': bar['Open'],
                'high': bar['High'],
                'low': bar['Low'],
                'close': bar['Close'],
                'volume': bar['Volume']
            }

            # 通知订阅者
            self.notify_subscribers(data_packet)

            self.current_index += 1

            # 休眠以模拟实时
            time.sleep(1.0 / self.speed)


class LiveDataFeed(DataFeed):
    """
    使用API的实时数据源（示例结构）。
    """

    def __init__(self, api_key: str, symbols: List[str]):
        """
        初始化实时数据源。

        参数：
        -----------
        api_key : str
            数据提供商的API密钥
        symbols : List[str]
            要订阅的股票代码
        """
        super().__init__()
        self.api_key = api_key
        self.symbols = symbols
        self.thread = None

    def start(self):
        """启动实时数据源。"""
        self.is_running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.start()
        print(f"实时数据源已启动，订阅 {self.symbols}")

    def stop(self):
        """停止实时数据源。"""
        self.is_running = False
        if self.thread:
            self.thread.join()
        print("实时数据源已停止")

    def _run(self):
        """运行数据源循环。"""
        import time

        while self.is_running:
            try:
                # 从API获取最新数据
                # 这是一个占位符 - 实现实际的API调用
                data_packet = self._fetch_latest_data()

                if data_packet:
                    self.notify_subscribers(data_packet)

                time.sleep(1)  # 每秒轮询一次

            except Exception as e:
                print(f"实时数据源错误: {e}")
                time.sleep(5)  # 重试前等待

    def _fetch_latest_data(self) -> Dict:
        """从API获取最新数据。"""
        # 占位符 - 实现实际的API集成
        pass
```

### 2. 策略引擎

生成交易信号：

```python
class StrategyEngine:
    """
    管理交易策略和信号生成。
    """

    def __init__(self):
        self.strategies = []
        self.signal_queue = Queue()

    def add_strategy(self, strategy):
        """向引擎添加策略。"""
        self.strategies.append(strategy)

    def on_data(self, data: Dict):
        """
        处理新数据并生成信号。

        参数：
        -----------
        data : Dict
            市场数据包
        """
        for strategy in self.strategies:
            try:
                signals = strategy.generate_signals(data)

                if signals:
                    self.signal_queue.put(signals)

            except Exception as e:
                print(f"策略 {strategy.__class__.__name__} 出错: {e}")

    def get_signals(self) -> List[Dict]:
        """获取所有待处理信号。"""
        signals = []
        while not self.signal_queue.empty():
            signals.append(self.signal_queue.get())
        return signals
```

### 3. 风险管理器

验证交易并管理风险：

```python
class RiskManager:
    """
    验证交易并执行风险限制。
    """

    def __init__(self,
                 max_position_size: float = 0.10,
                 max_portfolio_risk: float = 0.06,
                 max_drawdown: float = 0.20):
        """
        初始化风险管理器。

        参数：
        -----------
        max_position_size : float
            最大持仓规模占资金的比例
        max_portfolio_risk : float
            最大总投资组合风险
        max_drawdown : float
            最大允许回撤
        """
        self.max_position_size = max_position_size
        self.max_portfolio_risk = max_portfolio_risk
        self.max_drawdown = max_drawdown

        self.current_positions = {}
        self.peak_capital = 0
        self.current_capital = 0

    def validate_order(self, order: Dict, portfolio_state: Dict) -> Tuple[bool, str]:
        """
        根据风险限制验证订单。

        参数：
        -----------
        order : Dict
            要验证的订单
        portfolio_state : Dict
            当前投资组合状态

        返回：
        --------
        Tuple[bool, str] : (是否有效, 原因)
        """
        # 检查回撤
        current_dd = self._calculate_drawdown(portfolio_state)
        if current_dd >= self.max_drawdown:
            return False, f"超过最大回撤: {current_dd:.2%}"

        # 检查持仓规模
        position_size = order['quantity'] * order['price'] / portfolio_state['total_value']
        if position_size > self.max_position_size:
            return False, f"持仓规模过大: {position_size:.2%}"

        # 检查投资组合风险
        total_risk = self._calculate_portfolio_risk(portfolio_state, order)
        if total_risk > self.max_portfolio_risk:
            return False, f"投资组合风险过高: {total_risk:.2%}"

        return True, "OK"

    def _calculate_drawdown(self, portfolio_state: Dict) -> float:
        """计算当前回撤。"""
        total_value = portfolio_state['total_value']

        if total_value > self.peak_capital:
            self.peak_capital = total_value

        if self.peak_capital == 0:
            return 0.0

        return (self.peak_capital - total_value) / self.peak_capital

    def _calculate_portfolio_risk(self, portfolio_state: Dict, new_order: Dict) -> float:
        """计算包括新订单在内的总投资组合风险。"""
        # 简化的风险计算
        # 实际应用中，考虑相关性、止损等
        current_risk = sum(pos.get('risk', 0) for pos in portfolio_state.get('positions', {}).values())

        # 估算新订单风险（例如，2%止损）
        new_risk = new_order['quantity'] * new_order['price'] * 0.02 / portfolio_state['total_value']

        return current_risk + new_risk
```

### 4. 执行处理器

管理订单执行：

```python
class ExecutionHandler:
    """
    处理订单执行和券商通信。
    """

    def __init__(self, broker_api):
        """
        初始化执行处理器。

        参数：
        -----------
        broker_api : object
            券商API客户端
        """
        self.broker_api = broker_api
        self.pending_orders = {}
        self.filled_orders = []

    def submit_order(self, order: Dict) -> str:
        """
        向券商提交订单。

        参数：
        -----------
        order : Dict
            订单详情

        返回：
        --------
        str : 订单ID
        """
        try:
            # 提交给券商
            order_id = self.broker_api.place_order(
                symbol=order['symbol'],
                side=order['side'],
                quantity=order['quantity'],
                order_type=order['type'],
                price=order.get('price')
            )

            # 跟踪订单
            self.pending_orders[order_id] = {
                'order': order,
                'status': 'pending',
                'submitted_at': datetime.now()
            }

            print(f"订单已提交: {order_id}")
            return order_id

        except Exception as e:
            print(f"提交订单时出错: {e}")
            return None

    def check_order_status(self, order_id: str) -> Dict:
        """
        检查订单状态。

        参数：
        -----------
        order_id : str
            订单ID

        返回：
        --------
        Dict : 订单状态
        """
        try:
            status = self.broker_api.get_order_status(order_id)
            return status

        except Exception as e:
            print(f"检查订单状态时出错: {e}")
            return None

    def cancel_order(self, order_id: str) -> bool:
        """
        取消待处理订单。

        参数：
        -----------
        order_id : str
            订单ID

        返回：
        --------
        bool : 如果成功取消则为True
        """
        try:
            self.broker_api.cancel_order(order_id)

            if order_id in self.pending_orders:
                self.pending_orders[order_id]['status'] = 'cancelled'

            print(f"订单已取消: {order_id}")
            return True

        except Exception as e:
            print(f"取消订单时出错: {e}")
            return False

    def update_orders(self):
        """更新所有待处理订单的状态。"""
        for order_id in list(self.pending_orders.keys()):
            status = self.check_order_status(order_id)

            if status and status['status'] == 'filled':
                # 移至已成交订单
                self.filled_orders.append({
                    'order_id': order_id,
                    'order': self.pending_orders[order_id]['order'],
                    'fill_price': status['fill_price'],
                    'fill_time': status['fill_time']
                })

                del self.pending_orders[order_id]
                print(f"订单已成交: {order_id}")
```

### 5. 投资组合管理器

跟踪持仓和投资组合状态：

```python
class PortfolioManager:
    """
    管理投资组合状态和持仓。
    """

    def __init__(self, initial_capital: float):
        """
        初始化投资组合管理器。

        参数：
        -----------
        initial_capital : float
            起始资金
        """
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions = {}
        self.trades = []

    def update_position(self, fill: Dict):
        """
        根据成交更新持仓。

        参数：
        -----------
        fill : Dict
            成交详情
        """
        symbol = fill['order']['symbol']
        side = fill['order']['side']
        quantity = fill['order']['quantity']
        price = fill['fill_price']

        if side == 'buy':
            if symbol in self.positions:
                # 添加到现有持仓
                pos = self.positions[symbol]
                total_cost = (pos['quantity'] * pos['avg_price']) + (quantity * price)
                pos['quantity'] += quantity
                pos['avg_price'] = total_cost / pos['quantity']
            else:
                # 新持仓
                self.positions[symbol] = {
                    'quantity': quantity,
                    'avg_price': price,
                    'current_price': price
                }

            self.cash -= quantity * price

        elif side == 'sell':
            if symbol in self.positions:
                pos = self.positions[symbol]

                # 计算盈亏
                pnl = (price - pos['avg_price']) * quantity

                # 记录交易
                self.trades.append({
                    'symbol': symbol,
                    'quantity': quantity,
                    'entry_price': pos['avg_price'],
                    'exit_price': price,
                    'pnl': pnl,
                    'exit_time': fill['fill_time']
                })

                # 更新持仓
                pos['quantity'] -= quantity

                if pos['quantity'] <= 0:
                    del self.positions[symbol]

                self.cash += quantity * price

    def update_prices(self, prices: Dict[str, float]):
        """
        更新持仓的当前价格。

        参数：
        -----------
        prices : Dict[str, float]
            按股票代码的当前价格
        """
        for symbol, pos in self.positions.items():
            if symbol in prices:
                pos['current_price'] = prices[symbol]

    def get_portfolio_state(self) -> Dict:
        """获取当前投资组合状态。"""
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

### 6. 主交易系统

协调所有组件：

```python
class TradingSystem:
    """
    主自动化交易系统。
    """

    def __init__(self,
                 data_feed: DataFeed,
                 strategy_engine: StrategyEngine,
                 risk_manager: RiskManager,
                 execution_handler: ExecutionHandler,
                 portfolio_manager: PortfolioManager):
        """
        初始化交易系统。

        参数：
        -----------
        data_feed : DataFeed
            数据源处理器
        strategy_engine : StrategyEngine
            策略引擎
        risk_manager : RiskManager
            风险管理器
        execution_handler : ExecutionHandler
            执行处理器
        portfolio_manager : PortfolioManager
            投资组合管理器
        """
        self.data_feed = data_feed
        self.strategy_engine = strategy_engine
        self.risk_manager = risk_manager
        self.execution_handler = execution_handler
        self.portfolio_manager = portfolio_manager

        self.is_running = False

        # 订阅数据源
        self.data_feed.subscribe(self.on_data)

    def start(self):
        """启动交易系统。"""
        print("正在启动交易系统...")
        self.is_running = True
        self.data_feed.start()
        print("交易系统已启动")

    def stop(self):
        """停止交易系统。"""
        print("正在停止交易系统...")
        self.is_running = False
        self.data_feed.stop()
        print("交易系统已停止")

    def on_data(self, data: Dict):
        """
        处理新的市场数据。

        参数：
        -----------
        data : Dict
            市场数据包
        """
        if not self.is_running:
            return

        try:
            # 更新投资组合价格
            prices = {data.get('symbol', 'ASSET'): data['close']}
            self.portfolio_manager.update_prices(prices)

            # 生成信号
            self.strategy_engine.on_data(data)

            # 处理信号
            signals = self.strategy_engine.get_signals()

            for signal in signals:
                self.process_signal(signal)

            # 更新待处理订单
            self.execution_handler.update_orders()

            # 更新已成交订单
            for fill in self.execution_handler.filled_orders:
                self.portfolio_manager.update_position(fill)

            self.execution_handler.filled_orders.clear()

        except Exception as e:
            print(f"交易循环出错: {e}")

    def process_signal(self, signal: Dict):
        """
        处理交易信号。

        参数：
        -----------
        signal : Dict
            交易信号
        """
        # 从信号创建订单
        order = {
            'symbol': signal['symbol'],
            'side': signal['side'],
            'quantity': signal['quantity'],
            'type': signal.get('type', 'market'),
            'price': signal.get('price')
        }

        # 使用风险管理器验证
        portfolio_state = self.portfolio_manager.get_portfolio_state()
        is_valid, reason = self.risk_manager.validate_order(order, portfolio_state)

        if is_valid:
            # 提交订单
            self.execution_handler.submit_order(order)
        else:
            print(f"订单被拒绝: {reason}")


# 使用示例
def example_trading_system():
    """
    演示交易系统架构。
    """
    import yfinance as yf

    print("自动化交易系统示例")
    print("=" * 70)

    # 下载历史数据用于模拟
    data = yf.download('AAPL', start='2023-01-01', end='2023-12-31', progress=False)

    # 创建组件
    data_feed = SimulatedDataFeed(data, speed=10.0)
    strategy_engine = StrategyEngine()
    risk_manager = RiskManager()
    execution_handler = ExecutionHandler(broker_api=None)  # 模拟券商
    portfolio_manager = PortfolioManager(initial_capital=100000)

    # 创建交易系统
    trading_system = TradingSystem(
        data_feed=data_feed,
        strategy_engine=strategy_engine,
        risk_manager=risk_manager,
        execution_handler=execution_handler,
        portfolio_manager=portfolio_manager
    )

    # 启动系统
    trading_system.start()

    # 运行一段时间
    import time
    time.sleep(10)

    # 停止系统
    trading_system.stop()

    # 打印结果
    portfolio_state = portfolio_manager.get_portfolio_state()
    print(f"\n最终投资组合价值: ${portfolio_state['total_value']:,.2f}")
    print(f"总交易次数: {len(portfolio_manager.trades)}")


if __name__ == "__main__":
    example_trading_system()
```

## 设计原则

### 1. 关注点分离

每个组件都有单一职责：
- 数据源：仅处理数据
- 策略：仅生成信号
- 风险管理器：仅验证交易
- 执行：仅处理订单
- 投资组合：仅跟踪持仓

### 2. 松耦合

组件通过定义良好的接口通信：
- 使用回调和队列
- 避免直接依赖
- 易于交换实现

### 3. 错误处理

在每个级别进行稳健的错误处理：
- 在关键操作周围使用try-catch块
- 优雅降级
- 日志记录和警报
- 尽可能自动恢复

### 4. 状态管理

清晰的状态跟踪：
- 投资组合状态
- 订单状态
- 系统状态
- 用于恢复的持久存储

### 5. 可扩展性

为增长而设计：
- 支持多个策略
- 支持多个资产
- 支持多个数据源
- 水平扩展能力

## 最佳实践

1. **彻底测试**：独立测试每个组件
2. **记录一切**：全面的日志记录用于调试
3. **持续监控**：实时监控和警报
4. **处理故障**：预期并处理所有故障模式
5. **版本控制**：跟踪所有代码和配置更改
6. **良好文档**：清晰的文档用于维护
7. **从简单开始**：从基本功能开始，逐步增加复杂性
8. **先模拟交易**：在实盘前使用模拟交易测试

## 练习

### 练习1：组件实现

实现一个完整的DataFeed类，它：
- 连接到实时数据源
- 处理连接故障
- 在中断期间缓冲数据
- 通知订阅者

### 练习2：风险管理器

增强RiskManager，添加：
- 持仓相关性限制
- 行业暴露限制
- 每日损失限制
- 基于时间的限制

### 练习3：系统集成

将所有组件集成到一个工作系统中：
- 添加一个简单策略
- 在模拟模式下运行
- 跟踪性能
- 生成报告

### 练习4：故障处理

实现故障处理，用于：
- 网络断开
- API速率限制
- 无效数据
- 订单拒绝

## 总结

一个架构良好的自动化交易系统包括：

- **数据源**：实时市场数据
- **策略引擎**：信号生成
- **风险管理器**：交易验证
- **执行处理器**：订单管理
- **投资组合管理器**：持仓跟踪
- **主系统**：协调

关键设计原则：
- 关注点分离
- 松耦合
- 稳健的错误处理
- 清晰的状态管理
- 可扩展性

从简单开始，彻底测试，逐步增加复杂性。在实盘前始终进行模拟交易。

## 下一步

在下一课中，我们将详细探讨数据管理，包括数据存储、清理、验证和处理公司行为。
