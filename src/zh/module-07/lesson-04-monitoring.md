# 第7.4课：监控和警报

## 学习目标

在本课结束时，您将能够：
- 实施全面的系统监控
- 创建有效的警报机制
- 实时跟踪关键性能指标
- 构建监控仪表板
- 设置自动化健康检查

## 简介

监控对于自动化交易系统至关重要。没有适当的监控，您将不知道系统何时失败、性能不佳或遇到问题。本课涵盖构建强大的监控和警报系统。

## 系统健康监控

### 健康检查系统

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

class HealthStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

@dataclass
class HealthCheck:
    """表示健康检查结果。"""
    component: str
    status: HealthStatus
    message: str
    timestamp: datetime
    metrics: Dict = None

class SystemMonitor:
    """
    监控系统健康和性能。
    """

    def __init__(self):
        self.health_checks: Dict[str, HealthCheck] = {}
        self.metrics_history: Dict[str, List] = {}

    def check_data_feed(self, last_update: datetime) -> HealthCheck:
        """
        检查数据源健康状况。

        Parameters:
        -----------
        last_update : datetime
            最后数据更新时间

        Returns:
        --------
        HealthCheck : 健康检查结果
        """
        now = datetime.now()
        time_since_update = (now - last_update).total_seconds()

        if time_since_update < 60:
            status = HealthStatus.HEALTHY
            message = "数据源正常"
        elif time_since_update < 300:
            status = HealthStatus.WARNING
            message = f"数据源延迟{time_since_update:.0f}秒"
        else:
            status = HealthStatus.CRITICAL
            message = f"数据源已过时{time_since_update:.0f}秒"

        return HealthCheck(
            component="data_feed",
            status=status,
            message=message,
            timestamp=now,
            metrics={'seconds_since_update': time_since_update}
        )

    def check_order_execution(self, pending_orders: int,
                             avg_fill_time: float) -> HealthCheck:
        """
        检查订单执行健康状况。

        Parameters:
        -----------
        pending_orders : int
            待处理订单数量
        avg_fill_time : float
            平均成交时间（秒）

        Returns:
        --------
        HealthCheck : 健康检查结果
        """
        now = datetime.now()

        if pending_orders > 10:
            status = HealthStatus.CRITICAL
            message = f"待处理订单过多: {pending_orders}"
        elif pending_orders > 5:
            status = HealthStatus.WARNING
            message = f"待处理订单较多: {pending_orders}"
        elif avg_fill_time > 60:
            status = HealthStatus.WARNING
            message = f"成交缓慢: 平均{avg_fill_time:.1f}秒"
        else:
            status = HealthStatus.HEALTHY
            message = "订单执行正常"

        return HealthCheck(
            component="order_execution",
            status=status,
            message=message,
            timestamp=now,
            metrics={
                'pending_orders': pending_orders,
                'avg_fill_time': avg_fill_time
            }
        )

    def check_portfolio(self, current_drawdown: float,
                       max_drawdown_limit: float) -> HealthCheck:
        """
        检查投资组合健康状况。

        Parameters:
        -----------
        current_drawdown : float
            当前回撤
        max_drawdown_limit : float
            最大允许回撤

        Returns:
        --------
        HealthCheck : 健康检查结果
        """
        now = datetime.now()

        if current_drawdown >= max_drawdown_limit:
            status = HealthStatus.CRITICAL
            message = f"超过回撤限制: {current_drawdown:.2%}"
        elif current_drawdown >= max_drawdown_limit * 0.8:
            status = HealthStatus.WARNING
            message = f"接近回撤限制: {current_drawdown:.2%}"
        else:
            status = HealthStatus.HEALTHY
            message = f"回撤在限制内: {current_drawdown:.2%}"

        return HealthCheck(
            component="portfolio",
            status=status,
            message=message,
            timestamp=now,
            metrics={'current_drawdown': current_drawdown}
        )

    def run_all_checks(self, system_state: Dict) -> Dict[str, HealthCheck]:
        """
        运行所有健康检查。

        Parameters:
        -----------
        system_state : Dict
            当前系统状态

        Returns:
        --------
        Dict[str, HealthCheck] : 所有健康检查结果
        """
        checks = {}

        # 数据源检查
        if 'last_data_update' in system_state:
            checks['data_feed'] = self.check_data_feed(
                system_state['last_data_update']
            )

        # 订单执行检查
        if 'pending_orders' in system_state:
            checks['order_execution'] = self.check_order_execution(
                system_state['pending_orders'],
                system_state.get('avg_fill_time', 0)
            )

        # 投资组合检查
        if 'current_drawdown' in system_state:
            checks['portfolio'] = self.check_portfolio(
                system_state['current_drawdown'],
                system_state.get('max_drawdown_limit', 0.20)
            )

        self.health_checks = checks
        return checks

    def get_overall_status(self) -> HealthStatus:
        """获取整体系统状态。"""
        if not self.health_checks:
            return HealthStatus.UNKNOWN

        statuses = [check.status for check in self.health_checks.values()]

        if HealthStatus.CRITICAL in statuses:
            return HealthStatus.CRITICAL
        elif HealthStatus.WARNING in statuses:
            return HealthStatus.WARNING
        else:
            return HealthStatus.HEALTHY
```

## 性能指标跟踪

```python
import time
from collections import deque

class MetricsCollector:
    """
    收集和跟踪性能指标。
    """

    def __init__(self, history_size: int = 1000):
        """
        初始化指标收集器。

        Parameters:
        -----------
        history_size : int
            历史记录中保留的指标数量
        """
        self.metrics: Dict[str, deque] = {}
        self.history_size = history_size

    def record_metric(self, name: str, value: float, timestamp: datetime = None):
        """
        记录指标值。

        Parameters:
        -----------
        name : str
            指标名称
        value : float
            指标值
        timestamp : datetime, optional
            时间戳（默认：现在）
        """
        if name not in self.metrics:
            self.metrics[name] = deque(maxlen=self.history_size)

        if timestamp is None:
            timestamp = datetime.now()

        self.metrics[name].append({
            'value': value,
            'timestamp': timestamp
        })

    def get_metric_stats(self, name: str, window_minutes: int = 60) -> Dict:
        """
        获取指标的统计信息。

        Parameters:
        -----------
        name : str
            指标名称
        window_minutes : int
            时间窗口（分钟）

        Returns:
        --------
        Dict : 指标统计信息
        """
        if name not in self.metrics:
            return {}

        cutoff_time = datetime.now() - timedelta(minutes=window_minutes)
        recent_values = [
            m['value'] for m in self.metrics[name]
            if m['timestamp'] >= cutoff_time
        ]

        if not recent_values:
            return {}

        import numpy as np

        return {
            'count': len(recent_values),
            'mean': np.mean(recent_values),
            'median': np.median(recent_values),
            'std': np.std(recent_values),
            'min': np.min(recent_values),
            'max': np.max(recent_values),
            'latest': recent_values[-1]
        }

    def record_latency(self, operation: str):
        """
        用于记录操作延迟的上下文管理器。

        Parameters:
        -----------
        operation : str
            操作名称
        """
        class LatencyRecorder:
            def __init__(self, collector, op_name):
                self.collector = collector
                self.op_name = op_name
                self.start_time = None

            def __enter__(self):
                self.start_time = time.time()
                return self

            def __exit__(self, exc_type, exc_val, exc_tb):
                latency = (time.time() - self.start_time) * 1000  # ms
                self.collector.record_metric(
                    f'latency_{self.op_name}',
                    latency
                )

        return LatencyRecorder(self, operation)
```

## 警报系统

```python
from abc import ABC, abstractmethod

class AlertChannel(ABC):
    """警报通道的抽象基类。"""

    @abstractmethod
    def send_alert(self, level: str, message: str, details: Dict = None):
        """发送警报。"""
        pass

class ConsoleAlertChannel(AlertChannel):
    """控制台警报通道。"""

    def send_alert(self, level: str, message: str, details: Dict = None):
        """将警报打印到控制台。"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {level.upper()}: {message}")
        if details:
            print(f"详情: {details}")

class EmailAlertChannel(AlertChannel):
    """电子邮件警报通道。"""

    def __init__(self, smtp_config: Dict):
        """
        初始化电子邮件通道。

        Parameters:
        -----------
        smtp_config : Dict
            SMTP配置
        """
        self.smtp_config = smtp_config

    def send_alert(self, level: str, message: str, details: Dict = None):
        """通过电子邮件发送警报。"""
        # 占位符 - 实现实际的电子邮件发送
        print(f"将发送电子邮件: {level} - {message}")

class AlertManager:
    """
    管理警报和通知。
    """

    def __init__(self):
        self.channels: List[AlertChannel] = []
        self.alert_history: List[Dict] = []
        self.alert_cooldowns: Dict[str, datetime] = {}

    def add_channel(self, channel: AlertChannel):
        """添加警报通道。"""
        self.channels.append(channel)

    def send_alert(self, level: str, message: str,
                  details: Dict = None,
                  cooldown_minutes: int = 5):
        """
        通过所有通道发送警报。

        Parameters:
        -----------
        level : str
            警报级别（info、warning、critical）
        message : str
            警报消息
        details : Dict, optional
            附加详情
        cooldown_minutes : int
            防止垃圾信息的冷却期
        """
        # 检查冷却期
        alert_key = f"{level}:{message}"
        if alert_key in self.alert_cooldowns:
            last_sent = self.alert_cooldowns[alert_key]
            if datetime.now() - last_sent < timedelta(minutes=cooldown_minutes):
                return  # 由于冷却期而跳过

        # 通过所有通道发送
        for channel in self.channels:
            try:
                channel.send_alert(level, message, details)
            except Exception as e:
                print(f"发送警报时出错: {e}")

        # 记录警报
        self.alert_history.append({
            'timestamp': datetime.now(),
            'level': level,
            'message': message,
            'details': details
        })

        # 更新冷却期
        self.alert_cooldowns[alert_key] = datetime.now()

    def alert_on_health_check(self, health_check: HealthCheck):
        """
        根据健康检查结果发送警报。

        Parameters:
        -----------
        health_check : HealthCheck
            健康检查结果
        """
        if health_check.status == HealthStatus.CRITICAL:
            self.send_alert(
                'critical',
                f"{health_check.component}: {health_check.message}",
                health_check.metrics
            )
        elif health_check.status == HealthStatus.WARNING:
            self.send_alert(
                'warning',
                f"{health_check.component}: {health_check.message}",
                health_check.metrics
            )
```

## 监控仪表板

```python
class MonitoringDashboard:
    """
    实时监控仪表板。
    """

    def __init__(self, system_monitor: SystemMonitor,
                 metrics_collector: MetricsCollector):
        """
        初始化仪表板。

        Parameters:
        -----------
        system_monitor : SystemMonitor
            系统监控器
        metrics_collector : MetricsCollector
            指标收集器
        """
        self.system_monitor = system_monitor
        self.metrics_collector = metrics_collector

    def print_dashboard(self):
        """将仪表板打印到控制台。"""
        print("\n" + "=" * 70)
        print("交易系统仪表板")
        print("=" * 70)
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # 整体状态
        overall_status = self.system_monitor.get_overall_status()
        status_symbol = {
            HealthStatus.HEALTHY: "✓",
            HealthStatus.WARNING: "⚠",
            HealthStatus.CRITICAL: "✗",
            HealthStatus.UNKNOWN: "?"
        }
        print(f"\n整体状态: {status_symbol[overall_status]} {overall_status.value.upper()}")

        # 组件健康状况
        print("\n组件健康状况")
        print("-" * 70)
        for component, check in self.system_monitor.health_checks.items():
            symbol = status_symbol[check.status]
            print(f"{symbol} {component:20s} {check.message}")

        # 关键指标
        print("\n关键指标（最近60分钟）")
        print("-" * 70)

        metrics_to_show = [
            'latency_data_processing',
            'latency_order_submission',
            'trades_executed',
            'pnl'
        ]

        for metric_name in metrics_to_show:
            stats = self.metrics_collector.get_metric_stats(metric_name, 60)
            if stats:
                print(f"{metric_name:30s} "
                      f"平均: {stats['mean']:.2f} "
                      f"最小: {stats['min']:.2f} "
                      f"最大: {stats['max']:.2f}")

        print("=" * 70)
```

## 日志系统

```python
import logging
from logging.handlers import RotatingFileHandler

class TradingLogger:
    """
    交易的综合日志系统。
    """

    def __init__(self, log_dir: str = "logs"):
        """
        初始化日志记录器。

        Parameters:
        -----------
        log_dir : str
            日志文件目录
        """
        import os
        os.makedirs(log_dir, exist_ok=True)

        # 主日志记录器
        self.logger = logging.getLogger('trading_system')
        self.logger.setLevel(logging.DEBUG)

        # 控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)

        # 文件处理器（轮转）
        file_handler = RotatingFileHandler(
            f"{log_dir}/trading_system.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_formatter)

        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)

        # 交易日志记录器（单独文件）
        self.trade_logger = logging.getLogger('trades')
        self.trade_logger.setLevel(logging.INFO)

        trade_handler = RotatingFileHandler(
            f"{log_dir}/trades.log",
            maxBytes=10*1024*1024,
            backupCount=10
        )
        trade_formatter = logging.Formatter(
            '%(asctime)s - %(message)s'
        )
        trade_handler.setFormatter(trade_formatter)
        self.trade_logger.addHandler(trade_handler)

    def log_trade(self, trade: Dict):
        """
        记录交易。

        Parameters:
        -----------
        trade : Dict
            交易详情
        """
        self.trade_logger.info(
            f"交易: {trade['symbol']} {trade['side']} "
            f"{trade['quantity']} @ ${trade['price']:.2f} "
            f"盈亏: ${trade.get('pnl', 0):.2f}"
        )

    def log_order(self, order: Dict, event: str):
        """
        记录订单事件。

        Parameters:
        -----------
        order : Dict
            订单详情
        event : str
            事件类型（submitted、filled、cancelled、rejected）
        """
        self.logger.info(
            f"订单 {event.upper()}: {order['symbol']} "
            f"{order['side']} {order['quantity']} "
            f"@ ${order.get('price', 'MARKET')}"
        )

    def log_error(self, component: str, error: Exception):
        """
        记录错误。

        Parameters:
        -----------
        component : str
            组件名称
        error : Exception
            错误异常
        """
        self.logger.error(
            f"{component}中的错误: {str(error)}",
            exc_info=True
        )
```

## 最佳实践

1. **监控一切**：数据源、执行、投资组合、系统资源
2. **设置适当的阈值**：不要太敏感，也不要太宽松
3. **使用警报冷却期**：防止警报垃圾信息
4. **全面记录**：所有交易、订单、错误
5. **创建仪表板**：实时可见性
6. **测试警报**：确保在需要时能正常工作
7. **定期审查**：每天检查日志和指标

## 练习

### 练习1：健康检查

实施以下健康检查：
- 数据库连接
- API速率限制
- 内存使用
- CPU使用

### 练习2：自定义指标

创建以下自定义指标：
- 策略性能
- 执行质量
- 风险指标
- 系统延迟

### 练习3：警报系统

构建一个警报系统，包括：
- 发送电子邮件警报
- 可配置的阈值
- 实施冷却期
- 跟踪警报历史

### 练习4：仪表板

创建一个监控仪表板，包括：
- 显示实时指标
- 显示组件健康状况
- 每秒更新
- 突出显示问题

## 总结

有效的监控需要：

- **健康检查**：定期系统健康验证
- **指标收集**：跟踪关键性能指标
- **警报**：在关键问题上发出通知
- **日志记录**：全面的事件日志记录
- **仪表板**：实时可见性

良好的监控：
- 及早发现问题
- 提供可操作的见解
- 防止系统故障
- 实现快速响应

## 下一步

在下一课中，我们将探讨错误处理策略，使交易系统能够抵御故障和意外情况。