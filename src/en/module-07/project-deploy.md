# Module 7 Project: Deploy Automated Trading System

## Project Overview

In this capstone project for Module 7, you will build and deploy a complete automated trading system that integrates all components covered in this module. This system will run autonomously, execute trades based on your strategy, manage risk, monitor performance, and handle errors gracefully.

## Project Objectives

By completing this project, you will:
- Integrate all system components into a working automated trader
- Deploy a system that runs 24/7 (or during market hours)
- Implement comprehensive monitoring and alerting
- Handle real-world issues like network failures and API errors
- Track and report on live trading performance
- Build a production-ready trading system

## System Requirements

### Functional Requirements

1. **Data Management**
   - Real-time market data feed
   - Historical data storage
   - Data validation and cleaning
   - Backup and recovery

2. **Strategy Execution**
   - Automated signal generation
   - Position sizing
   - Order submission
   - Trade tracking

3. **Risk Management**
   - Pre-trade risk checks
   - Position limits
   - Drawdown monitoring
   - Emergency shutdown

4. **Monitoring**
   - System health checks
   - Performance tracking
   - Alert notifications
   - Dashboard display

5. **Error Handling**
   - Retry logic
   - Circuit breakers
   - Graceful degradation
   - Error logging

## Implementation

### Part 1: Complete System Integration

```python
import sys
import signal
from datetime import datetime
from typing import Dict
import time

# Import all components from previous lessons
from lesson_01_architecture import (
    TradingSystem, DataFeed, StrategyEngine,
    RiskManager, ExecutionHandler, PortfolioManager
)
from lesson_02_data import TimeSeriesDB, DataCache, DataFeedManager
from lesson_03_execution import OrderManager, TWAPExecutor
from lesson_04_monitoring import SystemMonitor, MetricsCollector, AlertManager
from lesson_05_errors import RetryHandler, CircuitBreaker, ErrorRecoveryManager
from lesson_06_tracking import PerformanceTracker, PerformanceComparator

class AutomatedTradingSystem:
    """
    Complete automated trading system.
    """

    def __init__(self, config: Dict):
        """
        Initialize automated trading system.

        Parameters:
        -----------
        config : Dict
            System configuration
        """
        self.config = config
        self.is_running = False

        # Initialize database
        self.db = TimeSeriesDB(config['db_path'])

        # Initialize cache
        self.cache = DataCache(max_bars=1000)

        # Initialize data feed manager
        self.data_feed_manager = DataFeedManager(self.db, self.cache)

        # Initialize portfolio
        self.portfolio = PortfolioManager(config['initial_capital'])

        # Initialize order manager
        self.order_manager = OrderManager(config['broker_api'])

        # Initialize risk manager
        self.risk_manager = RiskManager(
            max_position_size=config['max_position_size'],
            max_portfolio_risk=config['max_portfolio_risk'],
            max_drawdown=config['max_drawdown']
        )

        # Initialize strategy engine
        self.strategy_engine = StrategyEngine()

        # Initialize monitoring
        self.system_monitor = SystemMonitor()
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager()

        # Initialize performance tracking
        self.performance_tracker = PerformanceTracker(config['initial_capital'])

        # Initialize error handling
        self.retry_handler = RetryHandler()
        self.circuit_breaker = CircuitBreaker()
        self.error_recovery = ErrorRecoveryManager()

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def start(self):
        """Start the automated trading system."""
        print("=" * 70)
        print("STARTING AUTOMATED TRADING SYSTEM")
        print("=" * 70)
        print(f"Time: {datetime.now()}")
        print(f"Initial Capital: ${self.config['initial_capital']:,.2f}")
        print("=" * 70)

        self.is_running = True

        # Start data feed
        self.data_feed_manager.add_feed(self.config['data_feed'])
        self.data_feed_manager.subscribe(self.on_data)

        # Start monitoring loop
        self._monitoring_loop()

    def stop(self):
        """Stop the automated trading system."""
        print("\n" + "=" * 70)
        print("STOPPING AUTOMATED TRADING SYSTEM")
        print("=" * 70)

        self.is_running = False

        # Close all positions
        self._close_all_positions()

        # Generate final report
        self._generate_final_report()

        # Cleanup
        self.db.close()

        print("System stopped successfully")
        print("=" * 70)

    def on_data(self, data: Dict):
        """
        Handle new market data.

        Parameters:
        -----------
        data : Dict
            Market data
        """
        if not self.is_running:
            return

        try:
            # Record latency
            with self.metrics_collector.record_latency('data_processing'):
                # Update portfolio prices
                symbol = data.get('symbol', 'ASSET')
                self.portfolio.update_prices({symbol: data['close']})

                # Generate signals
                self.strategy_engine.on_data(data)

                # Process signals
                signals = self.strategy_engine.get_signals()

                for signal in signals:
                    self._process_signal(signal)

                # Update orders
                self.order_manager.update_orders()

                # Process fills
                for fill in self.order_manager.filled_orders:
                    self.portfolio.update_position(fill)

                self.order_manager.filled_orders.clear()

                # Update performance
                portfolio_state = self.portfolio.get_portfolio_state()
                self.performance_tracker.update(
                    portfolio_state['total_value'],
                    self.portfolio.trades
                )

        except Exception as e:
            self.error_recovery.handle_error(e, {'component': 'data_handler'})

    def _process_signal(self, signal: Dict):
        """
        Process a trading signal.

        Parameters:
        -----------
        signal : Dict
            Trading signal
        """
        try:
            # Create order
            order = self.order_manager.create_order(
                symbol=signal['symbol'],
                side=signal['side'],
                order_type=signal['type'],
                quantity=signal['quantity'],
                price=signal.get('price')
            )

            # Validate with risk manager
            portfolio_state = self.portfolio.get_portfolio_state()
            is_valid, reason = self.risk_manager.validate_order(
                order.__dict__,
                portfolio_state
            )

            if is_valid:
                # Submit order through circuit breaker
                def submit():
                    return self.order_manager.submit_order(order)

                with self.metrics_collector.record_latency('order_submission'):
                    self.circuit_breaker.call(submit)

                self.metrics_collector.record_metric('orders_submitted', 1)

            else:
                print(f"Order rejected by risk manager: {reason}")
                self.alert_manager.send_alert(
                    'warning',
                    f"Order rejected: {reason}",
                    {'order': order.__dict__}
                )

        except Exception as e:
            self.error_recovery.handle_error(e, {'component': 'signal_processor'})

    def _monitoring_loop(self):
        """Main monitoring loop."""
        last_health_check = datetime.now()
        last_report = datetime.now()

        while self.is_running:
            try:
                # Health checks every minute
                if (datetime.now() - last_health_check).seconds >= 60:
                    self._run_health_checks()
                    last_health_check = datetime.now()

                # Performance report every hour
                if (datetime.now() - last_report).seconds >= 3600:
                    self._generate_performance_report()
                    last_report = datetime.now()

                # Sleep briefly
                time.sleep(1)

            except Exception as e:
                self.error_recovery.handle_error(e, {'component': 'monitoring_loop'})

    def _run_health_checks(self):
        """Run system health checks."""
        system_state = {
            'last_data_update': self.cache.get_latest_bar('ASSET')['timestamp']
                if self.cache.get_latest_bar('ASSET') else datetime.now(),
            'pending_orders': len(self.order_manager.get_open_orders()),
            'avg_fill_time': 5.0,  # Calculate from metrics
            'current_drawdown': self.performance_tracker.get_current_metrics().get('max_drawdown', 0),
            'max_drawdown_limit': self.config['max_drawdown']
        }

        health_checks = self.system_monitor.run_all_checks(system_state)

        # Send alerts for issues
        for component, check in health_checks.items():
            self.alert_manager.alert_on_health_check(check)

    def _generate_performance_report(self):
        """Generate and save performance report."""
        from lesson_06_tracking import PerformanceReporter

        reporter = PerformanceReporter(self.performance_tracker)
        report = reporter.generate_daily_report()

        # Print to console
        print(report)

        # Save to file
        filename = f"reports/performance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        reporter.save_report(report, filename)

        # Send alert
        metrics = self.performance_tracker.get_current_metrics()
        self.alert_manager.send_alert(
            'info',
            'Daily performance report generated',
            metrics
        )

    def _close_all_positions(self):
        """Close all open positions."""
        print("\nClosing all positions...")

        for symbol, position in self.portfolio.positions.items():
            try:
                order = self.order_manager.create_order(
                    symbol=symbol,
                    side='sell',
                    order_type='market',
                    quantity=position.quantity
                )

                self.order_manager.submit_order(order)
                print(f"Closed position: {symbol}")

            except Exception as e:
                print(f"Error closing position {symbol}: {e}")

    def _generate_final_report(self):
        """Generate final performance report."""
        print("\nFINAL PERFORMANCE REPORT")
        print("=" * 70)

        metrics = self.performance_tracker.get_current_metrics()

        print(f"Initial Capital:    ${self.config['initial_capital']:,.2f}")
        print(f"Final Value:        ${metrics['current_value']:,.2f}")
        print(f"Total Return:       {metrics['total_return']:+.2%}")
        print(f"Total Trades:       {metrics['num_trades']}")
        print(f"Win Rate:           {metrics['win_rate']:.2%}")
        print(f"Sharpe Ratio:       {metrics['sharpe_ratio']:.2f}")
        print(f"Max Drawdown:       {metrics['max_drawdown']:.2%}")

        print("=" * 70)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        print(f"\nReceived signal {signum}, shutting down...")
        self.stop()
        sys.exit(0)


# Configuration
def create_config() -> Dict:
    """Create system configuration."""
    return {
        'initial_capital': 100000,
        'max_position_size': 0.10,
        'max_portfolio_risk': 0.06,
        'max_drawdown': 0.20,
        'db_path': 'data/trading.db',
        'broker_api': None,  # Configure with actual broker
        'data_feed': None,  # Configure with actual data feed
    }


# Main entry point
def main():
    """Main entry point for automated trading system."""
    # Load configuration
    config = create_config()

    # Create system
    system = AutomatedTradingSystem(config)

    # Start system
    try:
        system.start()
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
        system.stop()
    except Exception as e:
        print(f"\nFatal error: {e}")
        system.stop()
        raise


if __name__ == "__main__":
    main()
```

## Part 2: Deployment Checklist

### Pre-Deployment

- [ ] Complete backtesting with realistic costs
- [ ] Run walk-forward analysis
- [ ] Test with paper trading for at least 1 month
- [ ] Verify all error handling paths
- [ ] Test system recovery from failures
- [ ] Review and optimize performance
- [ ] Document all configuration parameters
- [ ] Set up monitoring and alerting
- [ ] Configure backup systems
- [ ] Prepare rollback plan

### Deployment

- [ ] Deploy to production server
- [ ] Configure environment variables
- [ ] Set up database and storage
- [ ] Configure API credentials
- [ ] Test connectivity to broker
- [ ] Verify data feed connection
- [ ] Start with small capital allocation
- [ ] Monitor closely for first week
- [ ] Gradually increase capital
- [ ] Document any issues

### Post-Deployment

- [ ] Daily performance review
- [ ] Weekly system health check
- [ ] Monthly strategy review
- [ ] Quarterly optimization
- [ ] Continuous monitoring
- [ ] Regular backups
- [ ] Update documentation
- [ ] Track vs backtest performance

## Part 3: Production Considerations

### Infrastructure

1. **Server Requirements**
   - Reliable hosting (AWS, GCP, dedicated server)
   - Sufficient CPU and memory
   - Fast network connection
   - Redundancy and failover

2. **Security**
   - Secure API key storage
   - Encrypted connections
   - Access control
   - Audit logging

3. **Monitoring**
   - System metrics (CPU, memory, disk)
   - Application metrics (latency, errors)
   - Business metrics (P&L, trades)
   - Alerting on issues

### Operational Procedures

1. **Daily Operations**
   - Check system health
   - Review overnight performance
   - Verify data quality
   - Monitor open positions

2. **Weekly Operations**
   - Performance analysis
   - Strategy review
   - System optimization
   - Backup verification

3. **Monthly Operations**
   - Comprehensive performance review
   - Strategy reoptimization
   - Infrastructure review
   - Documentation updates

## Project Tasks

### Task 1: System Integration

Integrate all components:
- Data management
- Strategy execution
- Risk management
- Order execution
- Monitoring
- Error handling
- Performance tracking

### Task 2: Paper Trading

Deploy system in paper trading mode:
- Run for at least 1 month
- Track all metrics
- Compare to backtest
- Identify and fix issues

### Task 3: Production Deployment

Deploy to production:
- Start with small capital
- Monitor continuously
- Scale gradually
- Document everything

### Task 4: Performance Analysis

Analyze live performance:
- Compare to backtest
- Identify degradation
- Optimize as needed
- Report results

## Evaluation Criteria

Your project will be evaluated on:

1. **System Completeness** (20%): All components integrated
2. **Reliability** (20%): Handles errors gracefully
3. **Performance** (20%): Achieves expected returns
4. **Monitoring** (15%): Comprehensive tracking
5. **Documentation** (15%): Clear and complete
6. **Code Quality** (10%): Clean, maintainable code

## Submission Guidelines

Submit the following:

1. Complete system implementation
2. Configuration files and documentation
3. Paper trading results (minimum 1 month)
4. Performance analysis report
5. Deployment guide
6. Operational procedures document
7. Lessons learned and improvements

## Common Pitfalls

1. **Insufficient Testing**: Test thoroughly before live trading
2. **Poor Error Handling**: Handle all failure modes
3. **Inadequate Monitoring**: Monitor everything
4. **Overconfidence**: Start small, scale gradually
5. **Ignoring Costs**: Model realistic transaction costs
6. **No Backup Plan**: Have rollback procedures
7. **Lack of Documentation**: Document everything

## Success Criteria

A successful deployment should:
- Run reliably 24/7 (or during market hours)
- Handle errors without manual intervention
- Achieve performance within 20% of backtest
- Provide comprehensive monitoring
- Generate regular reports
- Scale to handle increased capital
- Be maintainable and extensible

## Conclusion

This project represents the culmination of Module 7, bringing together all aspects of automated trading systems. By completing this project, you'll have built a production-ready trading system capable of autonomous operation.

Remember:
- Start small and scale gradually
- Monitor continuously
- Be prepared for the unexpected
- Keep learning and improving
- Never risk more than you can afford to lose

The transition from backtest to live trading is challenging, but with proper preparation, testing, and monitoring, you can build a reliable automated trading system.

## Next Steps

After completing this project, you'll be ready for Module 8 (Advanced Topics), where we'll explore machine learning, sentiment analysis, multi-asset strategies, and building a trading business.