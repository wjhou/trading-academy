# 第8.3课：多资产交易策略

## 学习目标
在本课结束时，您将能够：
- 理解跨多个资产类别交易的好处
- 实现用于投资组合多样化的相关性分析
- 构建多资产投资组合构建策略
- 创建动态资产配置系统
- 开发跨资产交易信号

## 简介

多资产交易涉及管理不同资产类别的头寸，如股票、债券、商品、货币和加密货币。这种方法提供了几个优势：

1. **多样化**：不同资产对市场条件的反应不同
2. **风险降低**：不相关的资产可以降低投资组合波动性
3. **机会扩展**：获得更多交易机会
4. **市场制度适应**：能够将资本转移到表现良好的资产

在本课中，我们将构建一个综合的多资产交易系统，分析相关性、构建最优投资组合，并在资产类别之间动态配置资本。

## 资产类别定义

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
    """定义和管理跨多个类别的可交易资产范围。"""

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
        """获取所有资产类别的所有代码。"""
        symbols = []
        for asset_class in self.asset_classes.values():
            symbols.extend(asset_class.keys())
        return symbols

    def get_asset_class(self, symbol: str) -> str:
        """获取给定代码的资产类别。"""
        for class_name, assets in self.asset_classes.items():
            if symbol in assets:
                return class_name
        return 'unknown'

    def download_data(self, start_date: str, end_date: str) -> pd.DataFrame:
        """下载所有资产的价格数据。"""
        symbols = self.get_all_symbols()
        data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']
        return data
```

## 相关性分析

理解资产之间的相关性对于多样化至关重要：

```python
class CorrelationAnalyzer:
    """分析资产和资产类别之间的相关性。"""

    def __init__(self, price_data: pd.DataFrame, asset_universe: AssetUniverse):
        self.prices = price_data
        self.universe = asset_universe
        self.returns = price_data.pct_change().dropna()

    def calculate_correlation_matrix(self, window: int = None) -> pd.DataFrame:
        """计算所有资产的相关性矩阵。"""
        if window:
            return self.returns.rolling(window).corr().iloc[-len(self.returns.columns):]
        return self.returns.corr()

    def get_asset_class_correlations(self) -> pd.DataFrame:
        """计算资产类别之间的平均相关性。"""
        class_returns = {}

        for class_name in self.universe.asset_classes.keys():
            symbols = list(self.universe.asset_classes[class_name].keys())
            available_symbols = [s for s in symbols if s in self.returns.columns]
            if available_symbols:
                class_returns[class_name] = self.returns[available_symbols].mean(axis=1)

        class_df = pd.DataFrame(class_returns)
        return class_df.corr()

    def find_diversification_pairs(self, threshold: float = 0.3) -> List[Tuple[str, str, float]]:
        """找到低相关性的资产对以实现多样化。"""
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
        """将相关性矩阵可视化为热图。"""
        corr_matrix = self.calculate_correlation_matrix()

        plt.figure(figsize=(14, 12))
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
                    center=0, vmin=-1, vmax=1)
        plt.title('Asset Correlation Matrix')
        plt.tight_layout()
        plt.show()

    def calculate_rolling_correlation(self, asset1: str, asset2: str,
                                     window: int = 60) -> pd.Series:
        """计算两个资产之间的滚动相关性。"""
        return self.returns[asset1].rolling(window).corr(self.returns[asset2])
```

## 投资组合构建

使用现代投资组合理论构建最优多资产投资组合：

```python
class PortfolioOptimizer:
    """优化跨多个资产的投资组合权重。"""

    def __init__(self, returns: pd.DataFrame):
        self.returns = returns
        self.mean_returns = returns.mean() * 252  # 年化
        self.cov_matrix = returns.cov() * 252  # 年化

    def calculate_portfolio_metrics(self, weights: np.ndarray) -> Tuple[float, float]:
        """计算投资组合收益和波动率。"""
        portfolio_return = np.sum(self.mean_returns * weights)
        portfolio_std = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
        return portfolio_return, portfolio_std

    def optimize_sharpe_ratio(self, risk_free_rate: float = 0.02) -> Dict:
        """找到具有最大夏普比率的投资组合。"""
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
        """找到具有最小方差的投资组合。"""
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
        """创建风险平价投资组合，其中每个资产对风险的贡献相等。"""
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
        """生成有效前沿投资组合。"""
        n_assets = len(self.mean_returns)
        results = []

        for _ in range(n_portfolios):
            weights = np.random.random(n_assets)
            weights /= np.sum(weights)
            ret, std = self.calculate_portfolio_metrics(weights)
            results.append({'return': ret, 'volatility': std})

        return pd.DataFrame(results)
```

## 动态资产配置

实现根据市场条件调整配置的策略：

```python
class DynamicAssetAllocator:
    """根据市场条件动态配置资本到资产类别。"""

    def __init__(self, price_data: pd.DataFrame, asset_universe: AssetUniverse):
        self.prices = price_data
        self.universe = asset_universe
        self.returns = price_data.pct_change().dropna()

    def momentum_allocation(self, lookback: int = 60, top_n: int = 5) -> pd.Series:
        """配置到具有最强动量的资产。"""
        momentum = self.prices.pct_change(lookback).iloc[-1]
        top_assets = momentum.nlargest(top_n)

        weights = pd.Series(0.0, index=self.prices.columns)
        weights[top_assets.index] = 1.0 / top_n

        return weights

    def volatility_targeting(self, target_vol: float = 0.10,
                            lookback: int = 60) -> pd.Series:
        """调整头寸规模以达到特定的投资组合波动率。"""
        current_vol = self.returns.rolling(lookback).std().iloc[-1] * np.sqrt(252)

        # 等权重基础配置
        weights = pd.Series(1.0 / len(self.prices.columns), index=self.prices.columns)

        # 按波动率倒数缩放每个头寸
        vol_scaled_weights = weights / current_vol
        vol_scaled_weights = vol_scaled_weights * target_vol

        # 归一化使总和为1
        vol_scaled_weights = vol_scaled_weights / vol_scaled_weights.sum()

        return vol_scaled_weights

    def regime_based_allocation(self, lookback: int = 60) -> pd.Series:
        """根据市场制度（牛市/熊市/中性）调整配置。"""
        # 计算市场制度指标
        returns_window = self.returns.tail(lookback)
        avg_return = returns_window.mean()
        volatility = returns_window.std()

        weights = pd.Series(0.0, index=self.prices.columns)

        for symbol in self.prices.columns:
            asset_class = self.universe.get_asset_class(symbol)

            # 确定制度
            if avg_return[symbol] > 0 and volatility[symbol] < volatility.median():
                regime = 'bull'  # 正收益，低波动
            elif avg_return[symbol] < 0 and volatility[symbol] > volatility.median():
                regime = 'bear'  # 负收益，高波动
            else:
                regime = 'neutral'

            # 根据制度和资产类别配置
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

        # 归一化
        if weights.sum() > 0:
            weights = weights / weights.sum()

        return weights

    def tactical_allocation(self, strategic_weights: Dict[str, float],
                           adjustment_factor: float = 0.3) -> pd.Series:
        """将战略配置与战术调整相结合。"""
        # 从战略权重开始
        weights = pd.Series(strategic_weights)

        # 计算动量分数
        momentum = self.prices.pct_change(60).iloc[-1]
        momentum_z = (momentum - momentum.mean()) / momentum.std()

        # 根据动量调整权重
        for symbol in weights.index:
            if symbol in momentum_z.index:
                adjustment = momentum_z[symbol] * adjustment_factor * weights[symbol]
                weights[symbol] += adjustment

        # 确保没有负权重并归一化
        weights = weights.clip(lower=0)
        weights = weights / weights.sum()

        return weights
```

## 完整的多资产交易系统

将所有内容整合到一个综合交易系统中：

```python
class MultiAssetTradingSystem:
    """具有投资组合优化和再平衡的完整多资产交易系统。"""

    def __init__(self, initial_capital: float = 100000):
        self.capital = initial_capital
        self.universe = AssetUniverse()
        self.positions = {}
        self.portfolio_history = []

    def run_backtest(self, start_date: str, end_date: str,
                    allocation_method: str = 'sharpe',
                    rebalance_frequency: int = 20) -> pd.DataFrame:
        """使用指定的配置方法运行回测。"""
        # 下载数据
        prices = self.universe.download_data(start_date, end_date)
        prices = prices.dropna(axis=1, how='all')  # 移除没有数据的资产

        # 初始化
        returns = prices.pct_change().dropna()
        portfolio_values = []
        dates = []

        # 遍历时间
        for i in range(60, len(prices), rebalance_frequency):
            current_date = prices.index[i]
            historical_prices = prices.iloc[:i]
            historical_returns = returns.iloc[:i]

            # 计算最优权重
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
                # 等权重
                weights = pd.Series(1.0 / len(prices.columns), index=prices.columns)

            # 计算此期间的投资组合价值
            period_end = min(i + rebalance_frequency, len(prices))
            period_returns = returns.iloc[i:period_end]

            # 投资组合收益
            portfolio_return = (period_returns * weights).sum(axis=1)
            portfolio_value = self.capital * (1 + portfolio_return).cumprod()

            portfolio_values.extend(portfolio_value.values)
            dates.extend(portfolio_return.index)

            # 更新下一期的资本
            self.capital = portfolio_value.iloc[-1]

        # 创建结果DataFrame
        results = pd.DataFrame({
            'portfolio_value': portfolio_values,
            'returns': pd.Series(portfolio_values).pct_change()
        }, index=dates)

        return results

    def calculate_performance_metrics(self, results: pd.DataFrame) -> Dict:
        """计算综合性能指标。"""
        returns = results['returns'].dropna()

        total_return = (results['portfolio_value'].iloc[-1] /
                       results['portfolio_value'].iloc[0] - 1)
        annual_return = (1 + total_return) ** (252 / len(returns)) - 1
        annual_vol = returns.std() * np.sqrt(252)
        sharpe_ratio = annual_return / annual_vol if annual_vol > 0 else 0

        # 回撤
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

## 实际示例

```python
# 示例：构建和测试多资产投资组合
def main():
    # 初始化系统
    system = MultiAssetTradingSystem(initial_capital=100000)

    # 定义日期范围
    start_date = '2020-01-01'
    end_date = '2024-01-01'

    # 测试不同的配置方法
    methods = ['sharpe', 'min_var', 'risk_parity', 'momentum']
    results_comparison = {}

    for method in methods:
        print(f"\n测试{method}配置...")
        results = system.run_backtest(start_date, end_date,
                                     allocation_method=method,
                                     rebalance_frequency=20)

        metrics = system.calculate_performance_metrics(results)
        results_comparison[method] = metrics

        print(f"总收益：{metrics['total_return']:.2%}")
        print(f"年化收益：{metrics['annual_return']:.2%}")
        print(f"夏普比率：{metrics['sharpe_ratio']:.2f}")
        print(f"最大回撤：{metrics['max_drawdown']:.2%}")

    # 分析相关性
    universe = AssetUniverse()
    prices = universe.download_data(start_date, end_date)
    analyzer = CorrelationAnalyzer(prices, universe)

    print("\n=== 资产类别相关性 ===")
    class_corr = analyzer.get_asset_class_correlations()
    print(class_corr)

    # 找到多样化机会
    print("\n=== 顶级多样化配对 ===")
    pairs = analyzer.find_diversification_pairs(threshold=0.3)
    for asset1, asset2, corr in pairs[:10]:
        print(f"{asset1} - {asset2}: {corr:.3f}")

if __name__ == "__main__":
    main()
```

## 最佳实践

1. **多样化策略**
   - 包括低相关性或负相关性的资产
   - 跨资产类别多样化，而不仅仅是在类别内
   - 考虑地理和行业多样化
   - 监控相关性随时间的变化

2. **再平衡**
   - 设置定期再平衡计划（每月、每季度）
   - 使用基于阈值的再平衡（当权重偏离>5%时）
   - 考虑再平衡的税务影响
   - 考虑交易成本

3. **风险管理**
   - 设置每个资产类别的最大配置限制
   - 使用波动率目标来控制投资组合风险
   - 在投资组合层面实施止损
   - 监控集中度风险

4. **投资组合构建**
   - 从战略资产配置开始
   - 根据市场条件添加战术调整
   - 使用优化技术但不要过度优化
   - 考虑实际约束（最小头寸、流动性）

5. **性能监控**
   - 按资产类别跟踪归因
   - 与相关基准比较
   - 监控相关性稳定性
   - 分析特定制度的性能

## 练习

1. **相关性分析**：下载跨多个资产类别的10种不同资产的数据。计算并可视化它们的相关性矩阵。识别最佳多样化配对。

2. **投资组合优化**：使用不同的优化方法（最大夏普、最小方差、风险平价）构建三个投资组合。比较它们在3年期间的性能。

3. **动态配置**：实现每月再平衡的基于动量的配置策略。将其与静态60/40股票/债券投资组合进行比较。

4. **制度检测**：创建一个检测市场制度（牛市/熊市/中性）并相应调整资产配置的系统。在历史数据上测试它。

5. **多策略投资组合**：将多个配置策略（动量、均值回归、风险平价）组合到单个投资组合中。优化给予每个策略的权重。

## 总结

多资产交易策略提供了强大的多样化优势和更广泛的机会集。关键要点：

- 相关性分析有助于识别真正的多样化机会
- 投资组合优化技术可以改善风险调整后的收益
- 动态配置适应不断变化的市场条件
- 适当的再平衡维持所需的风险敞口
- 多资产系统需要跨资产类别的仔细风险管理

在下一课中，我们将探索高频交易策略以及有效执行它们所需的基础设施。
