# 第7.5课：错误处理

## 学习目标

在本课结束时，您将能够：
- 实施稳健的错误处理策略
- 处理网络故障和API错误
- 实施带指数退避的重试逻辑
- 为故障服务创建熔断器
- 构建优雅降级机制

## 简介

在自动化交易系统中，错误是不可避免的。网络故障、API速率限制、无效数据和意外的市场状况都需要适当的处理。本课涵盖构建能够优雅处理错误的弹性系统。

## 错误分类

### 1. 瞬态错误

可能在重试时成功的临时故障：

```python
from enum import Enum
from typing import Optional, Callable
import time

class ErrorType(Enum):
    TRANSIENT = "transient"  # 可以重试
    PERMANENT = "permanent"  # 重试无效
    RATE_LIMIT = "rate_limit"  # 需要退避
    INVALID_INPUT = "invalid_input"  # 错误请求

class TradingError(Exception):
    """交易系统错误的基础异常。"""

    def __init__(self, message: str, error_type: ErrorType,
                 details: dict = None):
        super().__init__(message)
        self.error_type = error_type
        self.details = details or {}
```

### 2. 重试逻辑

实施指数退避：

```python
class RetryHandler:
    """
    使用指数退避处理重试。
    """

    def __init__(self, max_retries: int = 3,
                 base_delay: float = 1.0,
                 max_delay: float = 60.0):
        """
        初始化重试处理器。

        参数：
        -----------
        max_retries : int
            最大重试次数
        base_delay : float
            基础延迟（秒）
        max_delay : float
            最大延迟（秒）
        """
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay

    def execute_with_retry(self, func: Callable, *args, **kwargs):
        """
        使用重试逻辑执行函数。

        参数：
        -----------
        func : Callable
            要执行的函数

        返回：
        --------
        函数结果或抛出异常
        """
        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                return func(*args, **kwargs)

            except TradingError as e:
                last_exception = e

                # 不重试永久性错误
                if e.error_type == ErrorType.PERMANENT:
                    raise

                # 不重试无效输入
                if e.error_type == ErrorType.INVALID_INPUT:
                    raise

                # 计算延迟
                if attempt < self.max_retries:
                    delay = min(
                        self.base_delay * (2 ** attempt),
                        self.max_delay
                    )

                    print(f"尝试 {attempt + 1} 失败：{e}")
                    print(f"{delay:.1f}秒后重试...")
                    time.sleep(delay)

            except Exception as e:
                # 意外错误
                print(f"意外错误：{e}")
                raise

        # 所有重试已用尽
        raise last_exception
```

### 3. 熔断器

防止级联故障：

```python
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"  # 正常运行
    OPEN = "open"  # 故障中，拒绝请求
    HALF_OPEN = "half_open"  # 测试恢复

class CircuitBreaker:
    """
    熔断器模式实现。
    """

    def __init__(self, failure_threshold: int = 5,
                 timeout_seconds: int = 60,
                 success_threshold: int = 2):
        """
        初始化熔断器。

        参数：
        -----------
        failure_threshold : int
            打开熔断器前的失败次数
        timeout_seconds : int
            尝试恢复前的时间
        success_threshold : int
            关闭熔断器所需的成功次数
        """
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.success_threshold = success_threshold

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

    def call(self, func: Callable, *args, **kwargs):
        """
        通过熔断器执行函数。

        参数：
        -----------
        func : Callable
            要执行的函数

        返回：
        --------
        函数结果
        """
        # 检查熔断器是否打开
        if self.state == CircuitState.OPEN:
            # 检查超时是否已过
            if (datetime.now() - self.last_failure_time).seconds >= self.timeout_seconds:
                print("熔断器：尝试恢复（HALF_OPEN）")
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise TradingError(
                    "熔断器处于OPEN状态",
                    ErrorType.TRANSIENT,
                    {'state': self.state.value}
                )

        try:
            # 执行函数
            result = func(*args, **kwargs)

            # 成功
            self._on_success()
            return result

        except Exception as e:
            # 失败
            self._on_failure()
            raise

    def _on_success(self):
        """处理成功调用。"""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1

            if self.success_count >= self.success_threshold:
                print("熔断器：恢复成功（CLOSED）")
                self.state = CircuitState.CLOSED
                self.failure_count = 0

        elif self.state == CircuitState.CLOSED:
            # 成功时重置失败计数
            self.failure_count = 0

    def _on_failure(self):
        """处理失败调用。"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.state == CircuitState.HALF_OPEN:
            # 恢复期间失败
            print("熔断器：恢复失败（OPEN）")
            self.state = CircuitState.OPEN
            self.success_count = 0

        elif self.failure_count >= self.failure_threshold:
            # 失败次数过多
            print(f"熔断器：失败次数过多（OPEN）")
            self.state = CircuitState.OPEN
```

## 特定错误处理器

### 网络错误

```python
import requests

class NetworkErrorHandler:
    """
    处理网络相关错误。
    """

    def __init__(self):
        self.retry_handler = RetryHandler(max_retries=3)

    def make_api_call(self, url: str, method: str = 'GET',
                     **kwargs):
        """
        使用错误处理进行API调用。

        参数：
        -----------
        url : str
            API端点
        method : str
            HTTP方法

        返回：
        --------
        响应数据
        """
        def _call():
            try:
                response = requests.request(method, url, **kwargs)

                # 检查状态码
                if response.status_code == 429:
                    # 速率限制
                    raise TradingError(
                        "超出速率限制",
                        ErrorType.RATE_LIMIT,
                        {'retry_after': response.headers.get('Retry-After')}
                    )

                elif response.status_code >= 500:
                    # 服务器错误（瞬态）
                    raise TradingError(
                        f"服务器错误：{response.status_code}",
                        ErrorType.TRANSIENT
                    )

                elif response.status_code >= 400:
                    # 客户端错误（永久性）
                    raise TradingError(
                        f"客户端错误：{response.status_code}",
                        ErrorType.PERMANENT,
                        {'response': response.text}
                    )

                return response.json()

            except requests.exceptions.ConnectionError as e:
                raise TradingError(
                    "连接错误",
                    ErrorType.TRANSIENT,
                    {'error': str(e)}
                )

            except requests.exceptions.Timeout as e:
                raise TradingError(
                    "请求超时",
                    ErrorType.TRANSIENT,
                    {'error': str(e)}
                )

        return self.retry_handler.execute_with_retry(_call)
```

### 数据验证错误

```python
class DataValidationHandler:
    """
    处理数据验证错误。
    """

    def validate_and_fix(self, data: dict) -> dict:
        """
        验证数据并尝试修复问题。

        参数：
        -----------
        data : dict
            要验证的数据

        返回：
        --------
        dict : 已验证/修复的数据
        """
        fixed_data = data.copy()

        # 检查缺失字段
        required_fields = ['symbol', 'price', 'quantity']
        for field in required_fields:
            if field not in fixed_data:
                raise TradingError(
                    f"缺少必需字段：{field}",
                    ErrorType.INVALID_INPUT,
                    {'data': data}
                )

        # 修复负价格
        if fixed_data['price'] < 0:
            print(f"警告：检测到负价格，取绝对值")
            fixed_data['price'] = abs(fixed_data['price'])

        # 修复零价格
        if fixed_data['price'] == 0:
            raise TradingError(
                "无效价格：0",
                ErrorType.INVALID_INPUT,
                {'data': data}
            )

        # 修复负数量
        if fixed_data['quantity'] < 0:
            print(f"警告：检测到负数量，取绝对值")
            fixed_data['quantity'] = abs(fixed_data['quantity'])

        return fixed_data
```

## 优雅降级

```python
class GracefulDegradation:
    """
    实施优雅降级策略。
    """

    def __init__(self):
        self.fallback_data = {}
        self.degraded_mode = False

    def get_data_with_fallback(self, symbol: str,
                               primary_source: Callable,
                               fallback_source: Callable = None):
        """
        获取数据，并回退到缓存/替代源。

        参数：
        -----------
        symbol : str
            股票代码
        primary_source : Callable
            主数据源
        fallback_source : Callable, optional
            备用数据源

        返回：
        --------
        来自主源或备用源的数据
        """
        try:
            # 尝试主数据源
            data = primary_source(symbol)

            # 缓存以备回退
            self.fallback_data[symbol] = data
            self.degraded_mode = False

            return data

        except Exception as e:
            print(f"主数据源失败：{e}")

            # 尝试备用数据源
            if fallback_source:
                try:
                    data = fallback_source(symbol)
                    print("使用备用数据源")
                    self.degraded_mode = True
                    return data
                except Exception as e2:
                    print(f"备用数据源失败：{e2}")

            # 使用缓存数据
            if symbol in self.fallback_data:
                print("使用缓存数据（降级模式）")
                self.degraded_mode = True
                return self.fallback_data[symbol]

            # 无可用备用方案
            raise TradingError(
                f"{symbol}的所有数据源均失败",
                ErrorType.TRANSIENT
            )
```

## 错误恢复

```python
class ErrorRecoveryManager:
    """
    管理错误恢复程序。
    """

    def __init__(self):
        self.recovery_procedures = {}

    def register_recovery(self, error_type: str,
                         recovery_func: Callable):
        """
        为错误类型注册恢复程序。

        参数：
        -----------
        error_type : str
            错误类型标识符
        recovery_func : Callable
            恢复函数
        """
        self.recovery_procedures[error_type] = recovery_func

    def handle_error(self, error: Exception, context: dict = None):
        """
        使用适当的恢复处理错误。

        参数：
        -----------
        error : Exception
            要处理的错误
        context : dict, optional
            错误上下文
        """
        error_type = type(error).__name__

        print(f"处理错误：{error_type}")

        # 尝试已注册的恢复程序
        if error_type in self.recovery_procedures:
            try:
                self.recovery_procedures[error_type](error, context)
                print(f"{error_type}恢复成功")
                return True
            except Exception as e:
                print(f"恢复失败：{e}")

        # 默认恢复
        self._default_recovery(error, context)
        return False

    def _default_recovery(self, error: Exception, context: dict):
        """默认恢复程序。"""
        print(f"应用默认恢复：{error}")

        # 记录错误
        # 警告管理员
        # 如果关键则尝试安全关闭
```

## 最佳实践

1. **分类错误**：区分瞬态与永久性错误
2. **适当重试**：使用指数退避
3. **实施熔断器**：防止级联故障
4. **提供备用方案**：优雅降级
5. **记录所有内容**：全面的错误日志
6. **关键错误警报**：立即通知
7. **测试错误路径**：模拟故障
8. **记录恢复**：清晰的恢复程序

## 练习

### 练习1：重试逻辑

实施包含以下内容的重试逻辑：
- 指数退避
- 最大重试限制
- 抖动以防止惊群效应

### 练习2：熔断器

创建一个熔断器：
- 5次失败后打开
- 60秒后尝试恢复
- 需要3次成功才能关闭

### 练习3：错误恢复

为以下情况构建错误恢复系统：
- 网络故障
- API速率限制
- 无效数据
- 数据库错误

### 练习4：优雅降级

实施包含以下内容的优雅降级：
- 多个数据源
- 缓存的备用数据
- 降级模式指示器

## 总结

稳健的错误处理需要：

- **错误分类**：瞬态与永久性
- **重试逻辑**：指数退避
- **熔断器**：防止级联故障
- **优雅降级**：备用机制
- **恢复程序**：自动恢复

良好的错误处理：
- 防止系统崩溃
- 维持服务可用性
- 提供清晰的诊断
- 实现快速恢复

## 下一步

在下一课中，我们将探索性能跟踪，以衡量和优化交易系统性能。
