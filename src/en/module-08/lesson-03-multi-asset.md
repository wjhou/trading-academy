# Lesson 8.3: Multi-Asset Trading Strategies

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the benefits of trading across multiple asset classes
- Implement correlation analysis for portfolio diversification
- Build multi-asset portfolio construction strategies
- Create dynamic asset allocation systems
- Develop cross-asset trading signals

## Introduction

Multi-asset trading involves managing positions across different asset classes such as equities, bonds, commodities, currencies, and cryptocurrencies. This approach offers several advantages:

1. **Diversification**: Different assets respond differently to market conditions
2. **Risk Reduction**: Uncorrelated assets can reduce portfolio volatility
3. **Opportunity Expansion**: Access to more trading opportunities
4. **Market Regime Adaptation**: Ability to shift capital to performing assets

In this lesson, we'll build a comprehensive multi-asset trading system that analyzes correlations, constructs optimal portfolios, and dynamically allocates capital across asset classes.

## Asset Class Definitions

```python
import pandas as pd
import numpy as np
import yfinance as yf
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.optimize import minimize

class AssetUniverse:
    """Define and manage a universe of tradable assets across multiple classes."""

    def __init__(self):
        self.asset_classes = {
            'equities': {
                'SPY': 'S&P 500 ETF',
                'QQQ': 'Nasdaq 100 ETF',
                'IWM': 'Russell 2000 ETF',
                'EFA': 'International Developed Markets'
            },
            'bonds': {
                'TLT': '20+ Year Treasury',
                'IEF': '7-10 Year Treasury',
                'LQD': 'Investment Grade Corporate',
                'HYG': 'High Yield Corporate'
            },
            'commodities': {
                'GLD': 'Gold',
                'SLV': 'Silver',
                'USO': 'Oil',
                'DBA': 'Agriculture'
            },
            'currencies': {
                'UUP': 'US Dollar Index',
                'FXE': 'Euro',
                'FXY': 'Japanese Yen',
                'FXA': 'Australian Dollar'
            },
            'alternatives': {
                'VNQ': 'Real Estate',
                'BTC-USD': 'Bitcoin',
                'ETH-USD': 'Ethereum'
            }
        }

    def get_all_symbols(self) -> List[str]:
        """Get all symbols across all asset classes."""
        symbols = []
        for asset_class in self.asset_classes.values():
            symbols.extend(asset_class.keys())
        return symbols

    def get_asset_class(self, symbol: str) -> str:
        """Get the asset class for a given symbol."""
        for class_name, assets in self.asset_classes.items():
            if symbol in assets:
                return class_name
        return 'unknown'

    def download_data(self, start_date: str, end_date: str) -> pd.DataFrame:
        """Download price data for all assets."""
        symbols = self.get_all_symbols()
        data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']
        return data
```

## Correlation Analysis

Understanding correlations between assets is crucial for diversification:

```python
class CorrelationAnalyzer:
    """Analyze correlations between assets and asset classes."""

    def __init__(self, price_data: pd.DataFrame, asset_universe: AssetUniverse):
        self.prices = price_data
        self.universe = asset_universe
        self.returns = price_data.pct_change().dropna()

    def calculate_correlation_matrix(self, window: int = None) -> pd.DataFrame:
        """Calculate correlation matrix for all assets."""
        if window:
            return self.returns.rolling(window).corr().iloc[-len(self.returns.columns):]
        return self.returns.corr()

    def get_asset_class_correlations(self) -> pd.DataFrame:
        """Calculate average correlations between asset classes."""
        class_returns = {}

        for class_name in self.universe.asset_classes.keys():
            symbols = list(self.universe.asset_classes[class_name].keys())
            available_symbols = [s for s in symbols if s in self.returns.columns]
            if available_symbols:
                class_returns[class_name] = self.returns[available_symbols].mean(axis=1)

        class_df = pd.DataFrame(class_returns)
        return class_df.corr()

    def find_diversification_pairs(self, threshold: float = 0.3) -> List[Tuple[str, str, float]]:
        """Find pairs of assets with low correlation for diversification."""
        corr_matrix = self.calculate_correlation_matrix()
        pairs = []

        symbols = corr_matrix.columns
        for i, sym1 in enumerate(symbols):
            for sym2 in symbols[i+1:]:
                corr = corr_matrix.loc[sym1, sym2]
                if abs(corr) < threshold:
                    pairs.append((sym1, sym2, corr))

        return sorted(pairs, key=lambda x: abs(x[2]))

    def plot_correlation_heatmap(self):
        """Visualize correlation matrix as heatmap."""
        corr_matrix = self.calculate_correlation_matrix()

        plt.figure(figsize=(14, 12))
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
                    center=0, vmin=-1, vmax=1)
        plt.title('Asset Correlation Matrix')
        plt.tight_layout()
        plt.show()

    def calculate_rolling_correlation(self, asset1: str, asset2: str,
                                     window: int = 60) -> pd.Series:
        """Calculate rolling correlation between two assets."""
        return self.returns[asset1].rolling(window).corr(self.returns[asset2])
```

## Portfolio Construction

Building optimal multi-asset portfolios using modern portfolio theory:

```python
class PortfolioOptimizer:
    """Optimize portfolio weights across multiple assets."""

    def __init__(self, returns: pd.DataFrame):
        self.returns = returns
        self.mean_returns = returns.mean() * 252  # Annualized
        self.cov_matrix = returns.cov() * 252  # Annualized

    def calculate_portfolio_metrics(self, weights: np.ndarray) -> Tuple[float, float]:
        """Calculate portfolio return and volatility."""
        portfolio_return = np.sum(self.mean_returns * weights)
        portfolio_std = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
        return portfolio_return, portfolio_std

    def optimize_sharpe_ratio(self, risk_free_rate: float = 0.02) -> Dict:
        """Find portfolio with maximum Sharpe ratio."""
        n_assets = len(self.mean_returns)

        def negative_sharpe(weights):
            ret, std = self.calculate_portfolio_metrics(weights)
            return -(ret - risk_free_rate) / std

        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        bounds = tuple((0, 1) for _ in range(n_assets))
        initial_weights = np.array([1/n_assets] * n_assets)

        result = minimize(negative_sharpe, initial_weights,
                         method='SLSQP', bounds=bounds, constraints=constraints)

        optimal_weights = result.x
        ret, std = self.calculate_portfolio_metrics(optimal_weights)
        sharpe = (ret - risk_free_rate) / std

        return {
            'weights': dict(zip(self.returns.columns, optimal_weights)),
            'return': ret,
            'volatility': std,
            'sharpe_ratio': sharpe
        }

    def optimize_minimum_variance(self) -> Dict:
        """Find portfolio with minimum variance."""
        n_assets = len(self.mean_returns)

        def portfolio_variance(weights):
            return self.calculate_portfolio_metrics(weights)[1]

        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        bounds = tuple((0, 1) for _ in range(n_assets))
        initial_weights = np.array([1/n_assets] * n_assets)

        result = minimize(portfolio_variance, initial_weights,
                         method='SLSQP', bounds=bounds, constraints=constraints)

        optimal_weights = result.x
        ret, std = self.calculate_portfolio_metrics(optimal_weights)

        return {
            'weights': dict(zip(self.returns.columns, optimal_weights)),
            'return': ret,
            'volatility': std
        }

    def optimize_risk_parity(self) -> Dict:
        """Create risk parity portfolio where each asset contributes equally to risk."""
        n_assets = len(self.mean_returns)

        def risk_parity_objective(weights):
            portfolio_vol = self.calculate_portfolio_metrics(weights)[1]
            marginal_contrib = np.dot(self.cov_matrix, weights)
            risk_contrib = weights * marginal_contrib / portfolio_vol
            target_risk = portfolio_vol / n_assets
            return np.sum((risk_contrib - target_risk) ** 2)

        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        bounds = tuple((0, 1) for _ in range(n_assets))
        initial_weights = np.array([1/n_assets] * n_assets)

        result = minimize(risk_parity_objective, initial_weights,
                         method='SLSQP', bounds=bounds, constraints=constraints)

        optimal_weights = result.x
        ret, std = self.calculate_portfolio_metrics(optimal_weights)

        return {
            'weights': dict(zip(self.returns.columns, optimal_weights)),
            'return': ret,
            'volatility': std
        }

    def generate_efficient_frontier(self, n_portfolios: int = 100) -> pd.DataFrame:
        """Generate efficient frontier portfolios."""
        n_assets = len(self.mean_returns)
        results = []

        for _ in range(n_portfolios):
            weights = np.random.random(n_assets)
            weights /= np.sum(weights)
            ret, std = self.calculate_portfolio_metrics(weights)
            results.append({'return': ret, 'volatility': std})

        return pd.DataFrame(results)
```

## Dynamic Asset Allocation

Implementing strategies that adjust allocations based on market conditions:

```python
class DynamicAssetAllocator:
    """Dynamically allocate capital across asset classes based on market conditions."""

    def __init__(self, price_data: pd.DataFrame, asset_universe: AssetUniverse):
        self.prices = price_data
        self.universe = asset_universe
        self.returns = price_data.pct_change().dropna()

    def momentum_allocation(self, lookback: int = 60, top_n: int = 5) -> pd.Series:
        """Allocate to assets with strongest momentum."""
        momentum = self.prices.pct_change(lookback).iloc[-1]
        top_assets = momentum.nlargest(top_n)

        weights = pd.Series(0.0, index=self.prices.columns)
        weights[top_assets.index] = 1.0 / top_n

        return weights

    def volatility_targeting(self, target_vol: float = 0.10,
                            lookback: int = 60) -> pd.Series:
        """Scale positions to target a specific portfolio volatility."""
        current_vol = self.returns.rolling(lookback).std().iloc[-1] * np.sqrt(252)

        # Equal weight base allocation
        weights = pd.Series(1.0 / len(self.prices.columns), index=self.prices.columns)

        # Scale each position by inverse volatility
        vol_scaled_weights = weights / current_vol
        vol_scaled_weights = vol_scaled_weights * target_vol

        # Normalize to sum to 1
        vol_scaled_weights = vol_scaled_weights / vol_scaled_weights.sum()

        return vol_scaled_weights

    def regime_based_allocation(self, lookback: int = 60) -> pd.Series:
        """Adjust allocation based on market regime (bull/bear/neutral)."""
        # Calculate market regime indicators
        returns_window = self.returns.tail(lookback)
        avg_return = returns_window.mean()
        volatility = returns_window.std()

        weights = pd.Series(0.0, index=self.prices.columns)

        for symbol in self.prices.columns:
            asset_class = self.universe.get_asset_class(symbol)

            # Determine regime
            if avg_return[symbol] > 0 and volatility[symbol] < volatility.median():
                regime = 'bull'  # Positive returns, low vol
            elif avg_return[symbol] < 0 and volatility[symbol] > volatility.median():
                regime = 'bear'  # Negative returns, high vol
            else:
                regime = 'neutral'

            # Allocate based on regime and asset class
            if regime == 'bull':
                if asset_class == 'equities':
                    weights[symbol] = 0.15
                elif asset_class == 'commodities':
                    weights[symbol] = 0.05
            elif regime == 'bear':
                if asset_class == 'bonds':
                    weights[symbol] = 0.15
                elif asset_class == 'alternatives':
                    weights[symbol] = 0.05
            else:  # neutral
                weights[symbol] = 0.05

        # Normalize
        if weights.sum() > 0:
            weights = weights / weights.sum()

        return weights

    def tactical_allocation(self, strategic_weights: Dict[str, float],
                           adjustment_factor: float = 0.3) -> pd.Series:
        """Combine strategic allocation with tactical adjustments."""
        # Start with strategic weights
        weights = pd.Series(strategic_weights)

        # Calculate momentum scores
        momentum = self.prices.pct_change(60).iloc[-1]
        momentum_z = (momentum - momentum.mean()) / momentum.std()

        # Adjust weights based on momentum
        for symbol in weights.index:
            if symbol in momentum_z.index:
                adjustment = momentum_z[symbol] * adjustment_factor * weights[symbol]
                weights[symbol] += adjustment

        # Ensure no negative weights and normalize
        weights = weights.clip(lower=0)
        weights = weights / weights.sum()

        return weights
```

## Complete Multi-Asset Trading System

Putting it all together into a comprehensive trading system:

```python
class MultiAssetTradingSystem:
    """Complete multi-asset trading system with portfolio optimization and rebalancing."""

    def __init__(self, initial_capital: float = 100000):
        self.capital = initial_capital
        self.universe = AssetUniverse()
        self.positions = {}
        self.portfolio_history = []

    def run_backtest(self, start_date: str, end_date: str,
                    allocation_method: str = 'sharpe',
                    rebalance_frequency: int = 20) -> pd.DataFrame:
        """Run backtest with specified allocation method."""
        # Download data
        prices = self.universe.download_data(start_date, end_date)
        prices = prices.dropna(axis=1, how='all')  # Remove assets with no data

        # Initialize
        returns = prices.pct_change().dropna()
        portfolio_values = []
        dates = []

        # Iterate through time
        for i in range(60, len(prices), rebalance_frequency):
            current_date = prices.index[i]
            historical_prices = prices.iloc[:i]
            historical_returns = returns.iloc[:i]

            # Calculate optimal weights
            if allocation_method == 'sharpe':
                optimizer = PortfolioOptimizer(historical_returns.tail(252))
                result = optimizer.optimize_sharpe_ratio()
                weights = pd.Series(result['weights'])
            elif allocation_method == 'min_var':
                optimizer = PortfolioOptimizer(historical_returns.tail(252))
                result = optimizer.optimize_minimum_variance()
                weights = pd.Series(result['weights'])
            elif allocation_method == 'risk_parity':
                optimizer = PortfolioOptimizer(historical_returns.tail(252))
                result = optimizer.optimize_risk_parity()
                weights = pd.Series(result['weights'])
            elif allocation_method == 'momentum':
                allocator = DynamicAssetAllocator(historical_prices, self.universe)
                weights = allocator.momentum_allocation()
            else:
                # Equal weight
                weights = pd.Series(1.0 / len(prices.columns), index=prices.columns)

            # Calculate portfolio value for this period
            period_end = min(i + rebalance_frequency, len(prices))
            period_returns = returns.iloc[i:period_end]

            # Portfolio return
            portfolio_return = (period_returns * weights).sum(axis=1)
            portfolio_value = self.capital * (1 + portfolio_return).cumprod()

            portfolio_values.extend(portfolio_value.values)
            dates.extend(portfolio_return.index)

            # Update capital for next period
            self.capital = portfolio_value.iloc[-1]

        # Create results DataFrame
        results = pd.DataFrame({
            'portfolio_value': portfolio_values,
            'returns': pd.Series(portfolio_values).pct_change()
        }, index=dates)

        return results

    def calculate_performance_metrics(self, results: pd.DataFrame) -> Dict:
        """Calculate comprehensive performance metrics."""
        returns = results['returns'].dropna()

        total_return = (results['portfolio_value'].iloc[-1] /
                       results['portfolio_value'].iloc[0] - 1)
        annual_return = (1 + total_return) ** (252 / len(returns)) - 1
        annual_vol = returns.std() * np.sqrt(252)
        sharpe_ratio = annual_return / annual_vol if annual_vol > 0 else 0

        # Drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()

        return {
            'total_return': total_return,
            'annual_return': annual_return,
            'annual_volatility': annual_vol,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'calmar_ratio': annual_return / abs(max_drawdown) if max_drawdown != 0 else 0
        }
```

## Practical Example

```python
# Example: Building and testing a multi-asset portfolio
def main():
    # Initialize system
    system = MultiAssetTradingSystem(initial_capital=100000)

    # Define date range
    start_date = '2020-01-01'
    end_date = '2024-01-01'

    # Test different allocation methods
    methods = ['sharpe', 'min_var', 'risk_parity', 'momentum']
    results_comparison = {}

    for method in methods:
        print(f"\nTesting {method} allocation...")
        results = system.run_backtest(start_date, end_date,
                                     allocation_method=method,
                                     rebalance_frequency=20)

        metrics = system.calculate_performance_metrics(results)
        results_comparison[method] = metrics

        print(f"Total Return: {metrics['total_return']:.2%}")
        print(f"Annual Return: {metrics['annual_return']:.2%}")
        print(f"Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
        print(f"Max Drawdown: {metrics['max_drawdown']:.2%}")

    # Analyze correlations
    universe = AssetUniverse()
    prices = universe.download_data(start_date, end_date)
    analyzer = CorrelationAnalyzer(prices, universe)

    print("\n=== Asset Class Correlations ===")
    class_corr = analyzer.get_asset_class_correlations()
    print(class_corr)

    # Find diversification opportunities
    print("\n=== Top Diversification Pairs ===")
    pairs = analyzer.find_diversification_pairs(threshold=0.3)
    for asset1, asset2, corr in pairs[:10]:
        print(f"{asset1} - {asset2}: {corr:.3f}")

if __name__ == "__main__":
    main()
```

## Best Practices

1. **Diversification Strategy**
   - Include assets with low or negative correlations
   - Diversify across asset classes, not just within them
   - Consider geographic and sector diversification
   - Monitor correlation changes over time

2. **Rebalancing**
   - Set regular rebalancing schedules (monthly, quarterly)
   - Use threshold-based rebalancing (when weights drift >5%)
   - Consider tax implications of rebalancing
   - Account for transaction costs

3. **Risk Management**
   - Set maximum allocation limits per asset class
   - Use volatility targeting to control portfolio risk
   - Implement stop-losses at the portfolio level
   - Monitor concentration risk

4. **Portfolio Construction**
   - Start with strategic asset allocation
   - Add tactical adjustments based on market conditions
   - Use optimization techniques but don't over-optimize
   - Consider practical constraints (minimum positions, liquidity)

5. **Performance Monitoring**
   - Track attribution by asset class
   - Compare against relevant benchmarks
   - Monitor correlation stability
   - Analyze regime-specific performance

## Exercises

1. **Correlation Analysis**: Download data for 10 different assets across multiple asset classes. Calculate and visualize their correlation matrix. Identify the best diversification pairs.

2. **Portfolio Optimization**: Build three portfolios using different optimization methods (max Sharpe, min variance, risk parity). Compare their performance over a 3-year period.

3. **Dynamic Allocation**: Implement a momentum-based allocation strategy that rebalances monthly. Compare it against a static 60/40 stock/bond portfolio.

4. **Regime Detection**: Create a system that detects market regimes (bull/bear/neutral) and adjusts asset allocation accordingly. Test it on historical data.

5. **Multi-Strategy Portfolio**: Combine multiple allocation strategies (momentum, mean reversion, risk parity) into a single portfolio. Optimize the weights given to each strategy.

## Summary

Multi-asset trading strategies provide powerful diversification benefits and access to a broader opportunity set. Key takeaways:

- Correlation analysis helps identify true diversification opportunities
- Portfolio optimization techniques can improve risk-adjusted returns
- Dynamic allocation adapts to changing market conditions
- Proper rebalancing maintains desired risk exposure
- Multi-asset systems require careful risk management across asset classes

In the next lesson, we'll explore high-frequency trading strategies and the infrastructure required to execute them effectively.

