# Lesson 7.5: Error Handling

## Learning Objectives

By the end of this lesson, you will be able to:
- Implement robust error handling strategies
- Handle network failures and API errors
- Implement retry logic with exponential backoff
- Create circuit breakers for failing services
- Build graceful degradation mechanisms

## Introduction

Errors are inevitable in automated trading systems. Network failures, API rate limits, invalid data, and unexpected market conditions all require proper handling. This lesson covers building resilient systems that handle errors gracefully.

## Error Categories

### 1. Transient Errors

Temporary failures that may succeed on retry:

```python
from enum import Enum
from typing import Optional, Callable
import time

class ErrorType(Enum):
    TRANSIENT = "transient"  # Retry possible
    PERMANENT = "permanent"  # Retry won't help
    RATE_LIMIT = "rate_limit"  # Need to back off
    INVALID_INPUT = "invalid_input"  # Bad request

class TradingError(Exception):
    """Base exception for trading system errors."""

    def __init__(self, message: str, error_type: ErrorType,
                 details: dict = None):
        super().__init__(message)
        self.error_type = error_type
        self.details = details or {}
```

### 2. Retry Logic

Implement exponential backoff:

```python
class RetryHandler:
    """
    Handles retries with exponential backoff.
    """

    def __init__(self, max_retries: int = 3,
                 base_delay: float = 1.0,
                 max_delay: float = 60.0):
        """
        Initialize retry handler.

        Parameters:
        -----------
        max_retries : int
            Maximum number of retries
        base_delay : float
            Base delay in seconds
        max_delay : float
            Maximum delay in seconds
        """
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay

    def execute_with_retry(self, func: Callable, *args, **kwargs):
        """
        Execute function with retry logic.

        Parameters:
        -----------
        func : Callable
            Function to execute

        Returns:
        --------
        Result of function or raises exception
        """
        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                return func(*args, **kwargs)

            except TradingError as e:
                last_exception = e

                # Don't retry permanent errors
                if e.error_type == ErrorType.PERMANENT:
                    raise

                # Don't retry invalid input
                if e.error_type == ErrorType.INVALID_INPUT:
                    raise

                # Calculate delay
                if attempt < self.max_retries:
                    delay = min(
                        self.base_delay * (2 ** attempt),
                        self.max_delay
                    )

                    print(f"Attempt {attempt + 1} failed: {e}")
                    print(f"Retrying in {delay:.1f}s...")
                    time.sleep(delay)

            except Exception as e:
                # Unexpected error
                print(f"Unexpected error: {e}")
                raise

        # All retries exhausted
        raise last_exception
```

### 3. Circuit Breaker

Prevent cascading failures:

```python
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery

class CircuitBreaker:
    """
    Circuit breaker pattern implementation.
    """

    def __init__(self, failure_threshold: int = 5,
                 timeout_seconds: int = 60,
                 success_threshold: int = 2):
        """
        Initialize circuit breaker.

        Parameters:
        -----------
        failure_threshold : int
            Failures before opening circuit
        timeout_seconds : int
            Time before attempting recovery
        success_threshold : int
            Successes needed to close circuit
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
        Execute function through circuit breaker.

        Parameters:
        -----------
        func : Callable
            Function to execute

        Returns:
        --------
        Result of function
        """
        # Check if circuit is open
        if self.state == CircuitState.OPEN:
            # Check if timeout has passed
            if (datetime.now() - self.last_failure_time).seconds >= self.timeout_seconds:
                print("Circuit breaker: Attempting recovery (HALF_OPEN)")
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise TradingError(
                    "Circuit breaker is OPEN",
                    ErrorType.TRANSIENT,
                    {'state': self.state.value}
                )

        try:
            # Execute function
            result = func(*args, **kwargs)

            # Success
            self._on_success()
            return result

        except Exception as e:
            # Failure
            self._on_failure()
            raise

    def _on_success(self):
        """Handle successful call."""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1

            if self.success_count >= self.success_threshold:
                print("Circuit breaker: Recovery successful (CLOSED)")
                self.state = CircuitState.CLOSED
                self.failure_count = 0

        elif self.state == CircuitState.CLOSED:
            # Reset failure count on success
            self.failure_count = 0

    def _on_failure(self):
        """Handle failed call."""
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.state == CircuitState.HALF_OPEN:
            # Failed during recovery
            print("Circuit breaker: Recovery failed (OPEN)")
            self.state = CircuitState.OPEN
            self.success_count = 0

        elif self.failure_count >= self.failure_threshold:
            # Too many failures
            print(f"Circuit breaker: Too many failures (OPEN)")
            self.state = CircuitState.OPEN
```

## Specific Error Handlers

### Network Errors

```python
import requests

class NetworkErrorHandler:
    """
    Handles network-related errors.
    """

    def __init__(self):
        self.retry_handler = RetryHandler(max_retries=3)

    def make_api_call(self, url: str, method: str = 'GET',
                     **kwargs):
        """
        Make API call with error handling.

        Parameters:
        -----------
        url : str
            API endpoint
        method : str
            HTTP method

        Returns:
        --------
        Response data
        """
        def _call():
            try:
                response = requests.request(method, url, **kwargs)

                # Check status code
                if response.status_code == 429:
                    # Rate limit
                    raise TradingError(
                        "Rate limit exceeded",
                        ErrorType.RATE_LIMIT,
                        {'retry_after': response.headers.get('Retry-After')}
                    )

                elif response.status_code >= 500:
                    # Server error (transient)
                    raise TradingError(
                        f"Server error: {response.status_code}",
                        ErrorType.TRANSIENT
                    )

                elif response.status_code >= 400:
                    # Client error (permanent)
                    raise TradingError(
                        f"Client error: {response.status_code}",
                        ErrorType.PERMANENT,
                        {'response': response.text}
                    )

                return response.json()

            except requests.exceptions.ConnectionError as e:
                raise TradingError(
                    "Connection error",
                    ErrorType.TRANSIENT,
                    {'error': str(e)}
                )

            except requests.exceptions.Timeout as e:
                raise TradingError(
                    "Request timeout",
                    ErrorType.TRANSIENT,
                    {'error': str(e)}
                )

        return self.retry_handler.execute_with_retry(_call)
```

### Data Validation Errors

```python
class DataValidationHandler:
    """
    Handles data validation errors.
    """

    def validate_and_fix(self, data: dict) -> dict:
        """
        Validate data and attempt to fix issues.

        Parameters:
        -----------
        data : dict
            Data to validate

        Returns:
        --------
        dict : Validated/fixed data
        """
        fixed_data = data.copy()

        # Check for missing fields
        required_fields = ['symbol', 'price', 'quantity']
        for field in required_fields:
            if field not in fixed_data:
                raise TradingError(
                    f"Missing required field: {field}",
                    ErrorType.INVALID_INPUT,
                    {'data': data}
                )

        # Fix negative prices
        if fixed_data['price'] < 0:
            print(f"Warning: Negative price detected, taking absolute value")
            fixed_data['price'] = abs(fixed_data['price'])

        # Fix zero prices
        if fixed_data['price'] == 0:
            raise TradingError(
                "Invalid price: 0",
                ErrorType.INVALID_INPUT,
                {'data': data}
            )

        # Fix negative quantity
        if fixed_data['quantity'] < 0:
            print(f"Warning: Negative quantity detected, taking absolute value")
            fixed_data['quantity'] = abs(fixed_data['quantity'])

        return fixed_data
```

## Graceful Degradation

```python
class GracefulDegradation:
    """
    Implements graceful degradation strategies.
    """

    def __init__(self):
        self.fallback_data = {}
        self.degraded_mode = False

    def get_data_with_fallback(self, symbol: str,
                               primary_source: Callable,
                               fallback_source: Callable = None):
        """
        Get data with fallback to cached/alternative source.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        primary_source : Callable
            Primary data source
        fallback_source : Callable, optional
            Fallback data source

        Returns:
        --------
        Data from primary or fallback source
        """
        try:
            # Try primary source
            data = primary_source(symbol)

            # Cache for fallback
            self.fallback_data[symbol] = data
            self.degraded_mode = False

            return data

        except Exception as e:
            print(f"Primary source failed: {e}")

            # Try fallback source
            if fallback_source:
                try:
                    data = fallback_source(symbol)
                    print("Using fallback data source")
                    self.degraded_mode = True
                    return data
                except Exception as e2:
                    print(f"Fallback source failed: {e2}")

            # Use cached data
            if symbol in self.fallback_data:
                print("Using cached data (degraded mode)")
                self.degraded_mode = True
                return self.fallback_data[symbol]

            # No fallback available
            raise TradingError(
                f"All data sources failed for {symbol}",
                ErrorType.TRANSIENT
            )
```

## Error Recovery

```python
class ErrorRecoveryManager:
    """
    Manages error recovery procedures.
    """

    def __init__(self):
        self.recovery_procedures = {}

    def register_recovery(self, error_type: str,
                         recovery_func: Callable):
        """
        Register recovery procedure for error type.

        Parameters:
        -----------
        error_type : str
            Error type identifier
        recovery_func : Callable
            Recovery function
        """
        self.recovery_procedures[error_type] = recovery_func

    def handle_error(self, error: Exception, context: dict = None):
        """
        Handle error with appropriate recovery.

        Parameters:
        -----------
        error : Exception
            Error to handle
        context : dict, optional
            Error context
        """
        error_type = type(error).__name__

        print(f"Handling error: {error_type}")

        # Try registered recovery procedure
        if error_type in self.recovery_procedures:
            try:
                self.recovery_procedures[error_type](error, context)
                print(f"Recovery successful for {error_type}")
                return True
            except Exception as e:
                print(f"Recovery failed: {e}")

        # Default recovery
        self._default_recovery(error, context)
        return False

    def _default_recovery(self, error: Exception, context: dict):
        """Default recovery procedure."""
        print(f"Applying default recovery for: {error}")

        # Log error
        # Alert administrators
        # Attempt safe shutdown if critical
```

## Best Practices

1. **Classify Errors**: Distinguish transient vs permanent
2. **Retry Appropriately**: Use exponential backoff
3. **Implement Circuit Breakers**: Prevent cascading failures
4. **Provide Fallbacks**: Graceful degradation
5. **Log Everything**: Comprehensive error logging
6. **Alert on Critical Errors**: Immediate notification
7. **Test Error Paths**: Simulate failures
8. **Document Recovery**: Clear recovery procedures

## Exercises

### Exercise 1: Retry Logic

Implement retry logic with:
- Exponential backoff
- Maximum retry limit
- Jitter to prevent thundering herd

### Exercise 2: Circuit Breaker

Create a circuit breaker that:
- Opens after 5 failures
- Attempts recovery after 60s
- Requires 3 successes to close

### Exercise 3: Error Recovery

Build error recovery system for:
- Network failures
- API rate limits
- Invalid data
- Database errors

### Exercise 4: Graceful Degradation

Implement graceful degradation with:
- Multiple data sources
- Cached fallback data
- Degraded mode indicator

## Summary

Robust error handling requires:

- **Error Classification**: Transient vs permanent
- **Retry Logic**: Exponential backoff
- **Circuit Breakers**: Prevent cascading failures
- **Graceful Degradation**: Fallback mechanisms
- **Recovery Procedures**: Automated recovery

Good error handling:
- Prevents system crashes
- Maintains service availability
- Provides clear diagnostics
- Enables quick recovery

## Next Steps

In the next lesson, we'll explore performance tracking to measure and optimize trading system performance.