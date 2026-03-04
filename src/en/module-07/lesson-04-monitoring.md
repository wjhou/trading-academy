# Lesson 7.4: Monitoring and Alerting

## Learning Objectives

By the end of this lesson, you will be able to:
- Implement comprehensive system monitoring
- Create effective alerting mechanisms
- Track key performance indicators in real-time
- Build monitoring dashboards
- Set up automated health checks

## Introduction

Monitoring is critical for automated trading systems. Without proper monitoring, you won't know when your system fails, performs poorly, or encounters issues. This lesson covers building robust monitoring and alerting systems.

## System Health Monitoring

### Health Check System

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
    """Represents a health check result."""
    component: str
    status: HealthStatus
    message: str
    timestamp: datetime
    metrics: Dict = None

class SystemMonitor:
    """
    Monitors system health and performance.
    """

    def __init__(self):
        self.health_checks: Dict[str, HealthCheck] = {}
        self.metrics_history: Dict[str, List] = {}

    def check_data_feed(self, last_update: datetime) -> HealthCheck:
        """
        Check data feed health.

        Parameters:
        -----------
        last_update : datetime
            Last data update time

        Returns:
        --------
        HealthCheck : Health check result
        """
        now = datetime.now()
        time_since_update = (now - last_update).total_seconds()

        if time_since_update < 60:
            status = HealthStatus.HEALTHY
            message = "Data feed is current"
        elif time_since_update < 300:
            status = HealthStatus.WARNING
            message = f"Data feed delayed by {time_since_update:.0f}s"
        else:
            status = HealthStatus.CRITICAL
            message = f"Data feed stale for {time_since_update:.0f}s"

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
        Check order execution health.

        Parameters:
        -----------
        pending_orders : int
            Number of pending orders
        avg_fill_time : float
            Average fill time in seconds

        Returns:
        --------
        HealthCheck : Health check result
        """
        now = datetime.now()

        if pending_orders > 10:
            status = HealthStatus.CRITICAL
            message = f"Too many pending orders: {pending_orders}"
        elif pending_orders > 5:
            status = HealthStatus.WARNING
            message = f"High pending orders: {pending_orders}"
        elif avg_fill_time > 60:
            status = HealthStatus.WARNING
            message = f"Slow fills: {avg_fill_time:.1f}s average"
        else:
            status = HealthStatus.HEALTHY
            message = "Order execution normal"

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
        Check portfolio health.

        Parameters:
        -----------
        current_drawdown : float
            Current drawdown
        max_drawdown_limit : float
            Maximum allowed drawdown

        Returns:
        --------
        HealthCheck : Health check result
        """
        now = datetime.now()

        if current_drawdown >= max_drawdown_limit:
            status = HealthStatus.CRITICAL
            message = f"Drawdown limit exceeded: {current_drawdown:.2%}"
        elif current_drawdown >= max_drawdown_limit * 0.8:
            status = HealthStatus.WARNING
            message = f"Approaching drawdown limit: {current_drawdown:.2%}"
        else:
            status = HealthStatus.HEALTHY
            message = f"Drawdown within limits: {current_drawdown:.2%}"

        return HealthCheck(
            component="portfolio",
            status=status,
            message=message,
            timestamp=now,
            metrics={'current_drawdown': current_drawdown}
        )

    def run_all_checks(self, system_state: Dict) -> Dict[str, HealthCheck]:
        """
        Run all health checks.

        Parameters:
        -----------
        system_state : Dict
            Current system state

        Returns:
        --------
        Dict[str, HealthCheck] : All health check results
        """
        checks = {}

        # Data feed check
        if 'last_data_update' in system_state:
            checks['data_feed'] = self.check_data_feed(
                system_state['last_data_update']
            )

        # Order execution check
        if 'pending_orders' in system_state:
            checks['order_execution'] = self.check_order_execution(
                system_state['pending_orders'],
                system_state.get('avg_fill_time', 0)
            )

        # Portfolio check
        if 'current_drawdown' in system_state:
            checks['portfolio'] = self.check_portfolio(
                system_state['current_drawdown'],
                system_state.get('max_drawdown_limit', 0.20)
            )

        self.health_checks = checks
        return checks

    def get_overall_status(self) -> HealthStatus:
        """Get overall system status."""
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

## Performance Metrics Tracking

```python
import time
from collections import deque

class MetricsCollector:
    """
    Collects and tracks performance metrics.
    """

    def __init__(self, history_size: int = 1000):
        """
        Initialize metrics collector.

        Parameters:
        -----------
        history_size : int
            Number of metrics to keep in history
        """
        self.metrics: Dict[str, deque] = {}
        self.history_size = history_size

    def record_metric(self, name: str, value: float, timestamp: datetime = None):
        """
        Record a metric value.

        Parameters:
        -----------
        name : str
            Metric name
        value : float
            Metric value
        timestamp : datetime, optional
            Timestamp (default: now)
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
        Get statistics for a metric.

        Parameters:
        -----------
        name : str
            Metric name
        window_minutes : int
            Time window in minutes

        Returns:
        --------
        Dict : Metric statistics
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
        Context manager to record operation latency.

        Parameters:
        -----------
        operation : str
            Operation name
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

## Alerting System

```python
from abc import ABC, abstractmethod

class AlertChannel(ABC):
    """Abstract base class for alert channels."""

    @abstractmethod
    def send_alert(self, level: str, message: str, details: Dict = None):
        """Send an alert."""
        pass

class ConsoleAlertChannel(AlertChannel):
    """Console alert channel."""

    def send_alert(self, level: str, message: str, details: Dict = None):
        """Print alert to console."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {level.upper()}: {message}")
        if details:
            print(f"Details: {details}")

class EmailAlertChannel(AlertChannel):
    """Email alert channel."""

    def __init__(self, smtp_config: Dict):
        """
        Initialize email channel.

        Parameters:
        -----------
        smtp_config : Dict
            SMTP configuration
        """
        self.smtp_config = smtp_config

    def send_alert(self, level: str, message: str, details: Dict = None):
        """Send alert via email."""
        # Placeholder - implement actual email sending
        print(f"Would send email: {level} - {message}")

class AlertManager:
    """
    Manages alerts and notifications.
    """

    def __init__(self):
        self.channels: List[AlertChannel] = []
        self.alert_history: List[Dict] = []
        self.alert_cooldowns: Dict[str, datetime] = {}

    def add_channel(self, channel: AlertChannel):
        """Add an alert channel."""
        self.channels.append(channel)

    def send_alert(self, level: str, message: str,
                  details: Dict = None,
                  cooldown_minutes: int = 5):
        """
        Send an alert through all channels.

        Parameters:
        -----------
        level : str
            Alert level (info, warning, critical)
        message : str
            Alert message
        details : Dict, optional
            Additional details
        cooldown_minutes : int
            Cooldown period to prevent spam
        """
        # Check cooldown
        alert_key = f"{level}:{message}"
        if alert_key in self.alert_cooldowns:
            last_sent = self.alert_cooldowns[alert_key]
            if datetime.now() - last_sent < timedelta(minutes=cooldown_minutes):
                return  # Skip due to cooldown

        # Send through all channels
        for channel in self.channels:
            try:
                channel.send_alert(level, message, details)
            except Exception as e:
                print(f"Error sending alert: {e}")

        # Record alert
        self.alert_history.append({
            'timestamp': datetime.now(),
            'level': level,
            'message': message,
            'details': details
        })

        # Update cooldown
        self.alert_cooldowns[alert_key] = datetime.now()

    def alert_on_health_check(self, health_check: HealthCheck):
        """
        Send alert based on health check result.

        Parameters:
        -----------
        health_check : HealthCheck
            Health check result
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

## Monitoring Dashboard

```python
class MonitoringDashboard:
    """
    Real-time monitoring dashboard.
    """

    def __init__(self, system_monitor: SystemMonitor,
                 metrics_collector: MetricsCollector):
        """
        Initialize dashboard.

        Parameters:
        -----------
        system_monitor : SystemMonitor
            System monitor
        metrics_collector : MetricsCollector
            Metrics collector
        """
        self.system_monitor = system_monitor
        self.metrics_collector = metrics_collector

    def print_dashboard(self):
        """Print dashboard to console."""
        print("\n" + "=" * 70)
        print("TRADING SYSTEM DASHBOARD")
        print("=" * 70)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Overall status
        overall_status = self.system_monitor.get_overall_status()
        status_symbol = {
            HealthStatus.HEALTHY: "✓",
            HealthStatus.WARNING: "⚠",
            HealthStatus.CRITICAL: "✗",
            HealthStatus.UNKNOWN: "?"
        }
        print(f"\nOverall Status: {status_symbol[overall_status]} {overall_status.value.upper()}")

        # Component health
        print("\nCOMPONENT HEALTH")
        print("-" * 70)
        for component, check in self.system_monitor.health_checks.items():
            symbol = status_symbol[check.status]
            print(f"{symbol} {component:20s} {check.message}")

        # Key metrics
        print("\nKEY METRICS (Last 60 minutes)")
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
                      f"Mean: {stats['mean']:.2f} "
                      f"Min: {stats['min']:.2f} "
                      f"Max: {stats['max']:.2f}")

        print("=" * 70)
```

## Logging System

```python
import logging
from logging.handlers import RotatingFileHandler

class TradingLogger:
    """
    Comprehensive logging system for trading.
    """

    def __init__(self, log_dir: str = "logs"):
        """
        Initialize logger.

        Parameters:
        -----------
        log_dir : str
            Directory for log files
        """
        import os
        os.makedirs(log_dir, exist_ok=True)

        # Main logger
        self.logger = logging.getLogger('trading_system')
        self.logger.setLevel(logging.DEBUG)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)

        # File handler (rotating)
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

        # Trade logger (separate file)
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
        Log a trade.

        Parameters:
        -----------
        trade : Dict
            Trade details
        """
        self.trade_logger.info(
            f"TRADE: {trade['symbol']} {trade['side']} "
            f"{trade['quantity']} @ ${trade['price']:.2f} "
            f"P&L: ${trade.get('pnl', 0):.2f}"
        )

    def log_order(self, order: Dict, event: str):
        """
        Log an order event.

        Parameters:
        -----------
        order : Dict
            Order details
        event : str
            Event type (submitted, filled, cancelled, rejected)
        """
        self.logger.info(
            f"ORDER {event.upper()}: {order['symbol']} "
            f"{order['side']} {order['quantity']} "
            f"@ ${order.get('price', 'MARKET')}"
        )

    def log_error(self, component: str, error: Exception):
        """
        Log an error.

        Parameters:
        -----------
        component : str
            Component name
        error : Exception
            Error exception
        """
        self.logger.error(
            f"ERROR in {component}: {str(error)}",
            exc_info=True
        )
```

## Best Practices

1. **Monitor Everything**: Data feeds, execution, portfolio, system resources
2. **Set Appropriate Thresholds**: Not too sensitive, not too lenient
3. **Use Alert Cooldowns**: Prevent alert spam
4. **Log Comprehensively**: All trades, orders, errors
5. **Create Dashboards**: Real-time visibility
6. **Test Alerts**: Ensure they work when needed
7. **Review Regularly**: Check logs and metrics daily

## Exercises

### Exercise 1: Health Checks

Implement health checks for:
- Database connectivity
- API rate limits
- Memory usage
- CPU usage

### Exercise 2: Custom Metrics

Create custom metrics for:
- Strategy performance
- Execution quality
- Risk metrics
- System latency

### Exercise 3: Alert System

Build an alert system that:
- Sends email alerts
- Has configurable thresholds
- Implements cooldowns
- Tracks alert history

### Exercise 4: Dashboard

Create a monitoring dashboard that:
- Shows real-time metrics
- Displays component health
- Updates every second
- Highlights issues

## Summary

Effective monitoring requires:

- **Health Checks**: Regular system health validation
- **Metrics Collection**: Track key performance indicators
- **Alerting**: Notify on critical issues
- **Logging**: Comprehensive event logging
- **Dashboards**: Real-time visibility

Good monitoring:
- Detects issues early
- Provides actionable insights
- Prevents system failures
- Enables quick response

## Next Steps

In the next lesson, we'll explore error handling strategies to make trading systems resilient to failures and unexpected conditions.