# Lesson 8.5: Options and Derivatives Trading

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand options pricing and the Greeks
- Implement options trading strategies
- Build volatility trading systems
- Create hedging strategies using derivatives
- Analyze and manage options portfolio risk

## Introduction

Options and derivatives provide powerful tools for trading, hedging, and speculation. Unlike stocks, options have:

1. **Non-linear Payoffs**: Asymmetric risk/reward profiles
2. **Time Decay**: Value erodes as expiration approaches
3. **Volatility Sensitivity**: Profits from volatility changes
4. **Leverage**: Control large positions with small capital

This lesson covers practical options trading strategies and risk management techniques.

## Options Pricing and Greeks

Understanding options pricing is fundamental to derivatives trading:

```python
import pandas as pd
import numpy as np
from scipy.stats import norm
from typing import Dict, Tuple
import yfinance as yf
from datetime import datetime, timedelta

class BlackScholesModel:
    """Black-Scholes options pricing model."""

    @staticmethod
    def calculate_d1_d2(S: float, K: float, T: float, r: float, sigma: float) -> Tuple[float, float]:
        """Calculate d1 and d2 parameters."""
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        return d1, d2

    @classmethod
    def call_price(cls, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate call option price."""
        if T <= 0:
            return max(S - K, 0)

        d1, d2 = cls.calculate_d1_d2(S, K, T, r, sigma)
        call = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        return call

    @classmethod
    def put_price(cls, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate put option price."""
        if T <= 0:
            return max(K - S, 0)

        d1, d2 = cls.calculate_d1_d2(S, K, T, r, sigma)
        put = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        return put


class OptionsGreeks:
    """Calculate options Greeks for risk management."""

    @staticmethod
    def delta(S: float, K: float, T: float, r: float, sigma: float,
             option_type: str = 'call') -> float:
        """Calculate delta (price sensitivity)."""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)

        if option_type == 'call':
            return norm.cdf(d1)
        else:  # put
            return norm.cdf(d1) - 1

    @staticmethod
    def gamma(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate gamma (delta sensitivity)."""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)
        gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
        return gamma

    @staticmethod
    def vega(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate vega (volatility sensitivity)."""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)
        vega = S * norm.pdf(d1) * np.sqrt(T) / 100  # Per 1% change in vol
        return vega

    @staticmethod
    def theta(S: float, K: float, T: float, r: float, sigma: float,
             option_type: str = 'call') -> float:
        """Calculate theta (time decay)."""
        if T <= 0:
            return 0

        d1, d2 = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)

        if option_type == 'call':
            theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) -
                    r * K * np.exp(-r * T) * norm.cdf(d2)) / 365
        else:  # put
            theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) +
                    r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365

        return theta

    @staticmethod
    def rho(S: float, K: float, T: float, r: float, sigma: float,
           option_type: str = 'call') -> float:
        """Calculate rho (interest rate sensitivity)."""
        if T <= 0:
            return 0

        _, d2 = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)

        if option_type == 'call':
            rho = K * T * np.exp(-r * T) * norm.cdf(d2) / 100
        else:  # put
            rho = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100

        return rho
```

## Options Trading Strategies

Implementing common options strategies:

```python
class OptionsStrategy:
    """Base class for options trading strategies."""

    def __init__(self, underlying_price: float, risk_free_rate: float = 0.02):
        self.S = underlying_price
        self.r = risk_free_rate

    def calculate_payoff(self, spot_price: float) -> float:
        """Calculate strategy payoff at expiration."""
        raise NotImplementedError

    def calculate_pnl(self, spot_price: float, initial_cost: float) -> float:
        """Calculate profit/loss."""
        return self.calculate_payoff(spot_price) - initial_cost


class CoveredCall(OptionsStrategy):
    """Covered call strategy: Long stock + Short call."""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # Calculate initial cost
        self.stock_cost = underlying_price
        self.call_premium = BlackScholesModel.call_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.stock_cost - self.call_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """Calculate payoff at expiration."""
        stock_value = spot_price
        call_payoff = -max(spot_price - self.K, 0)  # Short call
        return stock_value + call_payoff


class ProtectivePut(OptionsStrategy):
    """Protective put strategy: Long stock + Long put."""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # Calculate initial cost
        self.stock_cost = underlying_price
        self.put_premium = BlackScholesModel.put_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.stock_cost + self.put_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """Calculate payoff at expiration."""
        stock_value = spot_price
        put_payoff = max(self.K - spot_price, 0)  # Long put
        return stock_value + put_payoff


class IronCondor(OptionsStrategy):
    """Iron condor: Sell OTM call spread + Sell OTM put spread."""

    def __init__(self, underlying_price: float,
                 put_strike_low: float, put_strike_high: float,
                 call_strike_low: float, call_strike_high: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K_pl = put_strike_low
        self.K_ph = put_strike_high
        self.K_cl = call_strike_low
        self.K_ch = call_strike_high
        self.T = expiry
        self.sigma = volatility

        # Calculate net premium received
        put_spread_credit = (
            BlackScholesModel.put_price(underlying_price, put_strike_high, expiry, self.r, volatility) -
            BlackScholesModel.put_price(underlying_price, put_strike_low, expiry, self.r, volatility)
        )
        call_spread_credit = (
            BlackScholesModel.call_price(underlying_price, call_strike_low, expiry, self.r, volatility) -
            BlackScholesModel.call_price(underlying_price, call_strike_high, expiry, self.r, volatility)
        )
        self.initial_credit = put_spread_credit + call_spread_credit

    def calculate_payoff(self, spot_price: float) -> float:
        """Calculate payoff at expiration."""
        # Put spread payoff
        put_spread = (max(self.K_ph - spot_price, 0) -
                     max(self.K_pl - spot_price, 0))

        # Call spread payoff
        call_spread = (max(spot_price - self.K_cl, 0) -
                      max(spot_price - self.K_ch, 0))

        # We sold both spreads, so payoff is negative
        return -(put_spread + call_spread)


class Straddle(OptionsStrategy):
    """Long straddle: Long call + Long put at same strike."""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # Calculate initial cost
        self.call_premium = BlackScholesModel.call_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.put_premium = BlackScholesModel.put_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.call_premium + self.put_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """Calculate payoff at expiration."""
        call_payoff = max(spot_price - self.K, 0)
        put_payoff = max(self.K - spot_price, 0)
        return call_payoff + put_payoff
```

## Volatility Trading

Trading volatility using options:

```python
class VolatilityTrader:
    """Trade volatility using options strategies."""

    def __init__(self, symbol: str):
        self.symbol = symbol
        self.historical_vol = None
        self.implied_vol = None

    def calculate_historical_volatility(self, prices: pd.Series,
                                       window: int = 30) -> float:
        """Calculate historical volatility."""
        returns = prices.pct_change().dropna()
        vol = returns.rolling(window).std() * np.sqrt(252)
        self.historical_vol = vol.iloc[-1]
        return self.historical_vol

    def estimate_implied_volatility(self, option_price: float, S: float,
                                    K: float, T: float, r: float,
                                    option_type: str = 'call') -> float:
        """Estimate implied volatility using Newton-Raphson method."""
        sigma = 0.3  # Initial guess
        max_iterations = 100
        tolerance = 1e-5

        for _ in range(max_iterations):
            if option_type == 'call':
                price = BlackScholesModel.call_price(S, K, T, r, sigma)
            else:
                price = BlackScholesModel.put_price(S, K, T, r, sigma)

            diff = price - option_price

            if abs(diff) < tolerance:
                self.implied_vol = sigma
                return sigma

            # Calculate vega for Newton-Raphson
            vega = OptionsGreeks.vega(S, K, T, r, sigma) * 100

            if vega < 1e-10:
                break

            sigma = sigma - diff / vega

            if sigma <= 0:
                sigma = 0.01

        self.implied_vol = sigma
        return sigma

    def detect_vol_opportunity(self, historical_vol: float,
                              implied_vol: float,
                              threshold: float = 0.05) -> str:
        """Detect volatility trading opportunities."""
        vol_diff = implied_vol - historical_vol

        if vol_diff > threshold:
            return 'sell_vol'  # IV > HV, sell options
        elif vol_diff < -threshold:
            return 'buy_vol'  # IV < HV, buy options
        else:
            return 'neutral'

    def create_vol_trade(self, signal: str, S: float, K: float,
                        T: float, sigma: float) -> OptionsStrategy:
        """Create appropriate volatility trade."""
        if signal == 'buy_vol':
            # Buy straddle to profit from volatility increase
            return Straddle(S, K, T, sigma)
        elif signal == 'sell_vol':
            # Sell iron condor to profit from low volatility
            width = S * 0.05  # 5% wings
            return IronCondor(S, K - 2*width, K - width,
                            K + width, K + 2*width, T, sigma)
        return None


class OptionsPortfolio:
    """Manage a portfolio of options positions."""

    def __init__(self):
        self.positions = []

    def add_position(self, strategy: OptionsStrategy, quantity: int):
        """Add options position to portfolio."""
        self.positions.append({
            'strategy': strategy,
            'quantity': quantity,
            'entry_price': strategy.S
        })

    def calculate_portfolio_greeks(self, current_price: float) -> Dict:
        """Calculate aggregate Greeks for entire portfolio."""
        total_delta = 0
        total_gamma = 0
        total_vega = 0
        total_theta = 0

        for pos in self.positions:
            strategy = pos['strategy']
            qty = pos['quantity']

            # This is simplified - in practice, calculate Greeks for each leg
            if hasattr(strategy, 'K') and hasattr(strategy, 'T'):
                delta = OptionsGreeks.delta(current_price, strategy.K,
                                           strategy.T, strategy.r, strategy.sigma)
                gamma = OptionsGreeks.gamma(current_price, strategy.K,
                                           strategy.T, strategy.r, strategy.sigma)
                vega = OptionsGreeks.vega(current_price, strategy.K,
                                         strategy.T, strategy.r, strategy.sigma)
                theta = OptionsGreeks.theta(current_price, strategy.K,
                                           strategy.T, strategy.r, strategy.sigma)

                total_delta += delta * qty
                total_gamma += gamma * qty
                total_vega += vega * qty
                total_theta += theta * qty

        return {
            'delta': total_delta,
            'gamma': total_gamma,
            'vega': total_vega,
            'theta': total_theta
        }

    def calculate_portfolio_value(self, current_price: float) -> float:
        """Calculate current portfolio value."""
        total_value = 0

        for pos in self.positions:
            strategy = pos['strategy']
            qty = pos['quantity']
            payoff = strategy.calculate_payoff(current_price)
            total_value += payoff * qty

        return total_value

    def get_risk_report(self, current_price: float) -> Dict:
        """Generate comprehensive risk report."""
        greeks = self.calculate_portfolio_greeks(current_price)
        value = self.calculate_portfolio_value(current_price)

        return {
            'portfolio_value': value,
            'greeks': greeks,
            'num_positions': len(self.positions),
            'delta_exposure': greeks['delta'] * current_price,
            'gamma_risk': greeks['gamma'] * current_price ** 2,
            'vega_risk': greeks['vega'],
            'theta_decay': greeks['theta']
        }
```

## Practical Example

```python
# Example: Options trading and portfolio management
def main():
    # Current market conditions
    underlying_price = 100.0
    risk_free_rate = 0.02
    volatility = 0.25
    time_to_expiry = 30 / 365  # 30 days

    print("=== Options Pricing and Greeks ===\n")

    # Price ATM call and put
    atm_strike = 100.0
    call_price = BlackScholesModel.call_price(
        underlying_price, atm_strike, time_to_expiry, risk_free_rate, volatility
    )
    put_price = BlackScholesModel.put_price(
        underlying_price, atm_strike, time_to_expiry, risk_free_rate, volatility
    )

    print(f"ATM Call Price: ${call_price:.2f}")
    print(f"ATM Put Price: ${put_price:.2f}")

    # Calculate Greeks
    delta = OptionsGreeks.delta(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility, 'call')
    gamma = OptionsGreeks.gamma(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility)
    vega = OptionsGreeks.vega(underlying_price, atm_strike,
                             time_to_expiry, risk_free_rate, volatility)
    theta = OptionsGreeks.theta(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility, 'call')

    print(f"\nGreeks for ATM Call:")
    print(f"  Delta: {delta:.4f}")
    print(f"  Gamma: {gamma:.4f}")
    print(f"  Vega: {vega:.4f}")
    print(f"  Theta: {theta:.4f}")

    # Test different strategies
    print("\n=== Options Strategies ===\n")

    # Covered Call
    covered_call = CoveredCall(underlying_price, 105, time_to_expiry, volatility)
    print(f"Covered Call (Strike 105):")
    print(f"  Initial Cost: ${covered_call.initial_cost:.2f}")
    print(f"  Max Profit: ${covered_call.calculate_payoff(105) - covered_call.initial_cost:.2f}")
    print(f"  Breakeven: ${covered_call.initial_cost:.2f}")

    # Protective Put
    protective_put = ProtectivePut(underlying_price, 95, time_to_expiry, volatility)
    print(f"\nProtective Put (Strike 95):")
    print(f"  Initial Cost: ${protective_put.initial_cost:.2f}")
    print(f"  Max Loss: ${protective_put.calculate_payoff(0) - protective_put.initial_cost:.2f}")

    # Iron Condor
    iron_condor = IronCondor(underlying_price, 90, 95, 105, 110,
                            time_to_expiry, volatility)
    print(f"\nIron Condor (90/95/105/110):")
    print(f"  Initial Credit: ${iron_condor.initial_credit:.2f}")
    print(f"  Max Profit: ${iron_condor.initial_credit:.2f}")
    print(f"  Profit at 100: ${iron_condor.calculate_payoff(100) + iron_condor.initial_credit:.2f}")

    # Straddle
    straddle = Straddle(underlying_price, 100, time_to_expiry, volatility)
    print(f"\nLong Straddle (Strike 100):")
    print(f"  Initial Cost: ${straddle.initial_cost:.2f}")
    print(f"  Breakeven Up: ${100 + straddle.initial_cost:.2f}")
    print(f"  Breakeven Down: ${100 - straddle.initial_cost:.2f}")

    # Portfolio management
    print("\n=== Portfolio Management ===\n")

    portfolio = OptionsPortfolio()
    portfolio.add_position(covered_call, 10)
    portfolio.add_position(protective_put, 5)

    risk_report = portfolio.get_risk_report(underlying_price)
    print("Portfolio Risk Report:")
    print(f"  Portfolio Value: ${risk_report['portfolio_value']:.2f}")
    print(f"  Delta: {risk_report['greeks']['delta']:.2f}")
    print(f"  Gamma: {risk_report['greeks']['gamma']:.4f}")
    print(f"  Vega: {risk_report['greeks']['vega']:.2f}")
    print(f"  Theta: ${risk_report['greeks']['theta']:.2f}/day")

    # Volatility trading
    print("\n=== Volatility Trading ===\n")

    vol_trader = VolatilityTrader('SPY')
    historical_vol = 0.20
    implied_vol = 0.28

    signal = vol_trader.detect_vol_opportunity(historical_vol, implied_vol)
    print(f"Historical Vol: {historical_vol:.1%}")
    print(f"Implied Vol: {implied_vol:.1%}")
    print(f"Signal: {signal}")

if __name__ == "__main__":
    main()
```

## Best Practices

1. **Risk Management**
   - Monitor Greeks continuously
   - Set position limits per strategy
   - Use stop-losses on options positions
   - Hedge delta exposure when needed

2. **Strategy Selection**
   - Match strategy to market outlook
   - Consider implied vs historical volatility
   - Account for time decay (theta)
   - Evaluate risk/reward ratios

3. **Execution**
   - Trade liquid options (tight spreads)
   - Use limit orders, not market orders
   - Consider bid-ask spread costs
   - Time entries around volatility events

4. **Portfolio Management**
   - Diversify across strategies and underlyings
   - Rebalance Greeks regularly
   - Close positions before expiration
   - Track realized vs expected P&L

5. **Volatility Analysis**
   - Compare implied vs historical volatility
   - Monitor volatility term structure
   - Track volatility skew
   - Use volatility forecasting models

## Exercises

1. **Options Pricing**: Calculate prices and Greeks for calls and puts at different strikes and expirations. Analyze how Greeks change with spot price movements.

2. **Strategy Comparison**: Compare covered call, protective put, and collar strategies. Which performs best in different market scenarios?

3. **Iron Condor Optimization**: Find optimal strike selection for iron condors to maximize risk-adjusted returns. Test on historical data.

4. **Volatility Trading**: Build a system that trades volatility by comparing implied and historical volatility. Backtest the strategy.

5. **Portfolio Hedging**: Create a stock portfolio and hedge it using options. Minimize downside risk while preserving upside potential.

## Summary

Options and derivatives provide powerful tools for trading and risk management. Key takeaways:

- Black-Scholes model prices options based on underlying, strike, time, rate, and volatility
- Greeks measure sensitivity to various risk factors
- Different strategies suit different market outlooks and risk profiles
- Volatility trading exploits differences between implied and realized volatility
- Portfolio Greeks help manage aggregate risk exposure

In the next lesson, we'll explore building a professional trading business.

