# 第8.5课：期权与衍生品交易

## 学习目标
在本课结束时，您将能够：
- 理解期权定价和希腊字母
- 实施期权交易策略
- 构建波动率交易系统
- 使用衍生品创建对冲策略
- 分析和管理期权投资组合风险

## 引言

期权和衍生品为交易、对冲和投机提供了强大的工具。与股票不同，期权具有：

1. **非线性收益**：不对称的风险/回报特征
2. **时间衰减**：价值随到期日临近而侵蚀
3. **波动率敏感性**：从波动率变化中获利
4. **杠杆**：用小额资本控制大额头寸

本课涵盖实用的期权交易策略和风险管理技术。

## 期权定价和希腊字母

理解期权定价是衍生品交易的基础：

```python
import pandas as pd
import numpy as np
from scipy.stats import norm
from typing import Dict, Tuple
import yfinance as yf
from datetime import datetime, timedelta

class BlackScholesModel:
    """Black-Scholes期权定价模型。"""

    @staticmethod
    def calculate_d1_d2(S: float, K: float, T: float, r: float, sigma: float) -> Tuple[float, float]:
        """计算d1和d2参数。"""
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        return d1, d2

    @classmethod
    def call_price(cls, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """计算看涨期权价格。"""
        if T <= 0:
            return max(S - K, 0)

        d1, d2 = cls.calculate_d1_d2(S, K, T, r, sigma)
        call = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        return call

    @classmethod
    def put_price(cls, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """计算看跌期权价格。"""
        if T <= 0:
            return max(K - S, 0)

        d1, d2 = cls.calculate_d1_d2(S, K, T, r, sigma)
        put = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        return put


class OptionsGreeks:
    """计算期权希腊字母用于风险管理。"""

    @staticmethod
    def delta(S: float, K: float, T: float, r: float, sigma: float,
             option_type: str = 'call') -> float:
        """计算delta（价格敏感性）。"""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)

        if option_type == 'call':
            return norm.cdf(d1)
        else:  # put
            return norm.cdf(d1) - 1

    @staticmethod
    def gamma(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """计算gamma（delta敏感性）。"""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)
        gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
        return gamma

    @staticmethod
    def vega(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """计算vega（波动率敏感性）。"""
        if T <= 0:
            return 0

        d1, _ = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)
        vega = S * norm.pdf(d1) * np.sqrt(T) / 100  # 每1%波动率变化
        return vega

    @staticmethod
    def theta(S: float, K: float, T: float, r: float, sigma: float,
             option_type: str = 'call') -> float:
        """计算theta（时间衰减）。"""
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
        """计算rho（利率敏感性）。"""
        if T <= 0:
            return 0

        _, d2 = BlackScholesModel.calculate_d1_d2(S, K, T, r, sigma)

        if option_type == 'call':
            rho = K * T * np.exp(-r * T) * norm.cdf(d2) / 100
        else:  # put
            rho = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100

        return rho
```

## 期权交易策略

实施常见的期权策略：

```python
class OptionsStrategy:
    """期权交易策略的基类。"""

    def __init__(self, underlying_price: float, risk_free_rate: float = 0.02):
        self.S = underlying_price
        self.r = risk_free_rate

    def calculate_payoff(self, spot_price: float) -> float:
        """计算到期时的策略收益。"""
        raise NotImplementedError

    def calculate_pnl(self, spot_price: float, initial_cost: float) -> float:
        """计算盈亏。"""
        return self.calculate_payoff(spot_price) - initial_cost


class CoveredCall(OptionsStrategy):
    """备兑看涨策略：持有股票 + 卖出看涨期权。"""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # 计算初始成本
        self.stock_cost = underlying_price
        self.call_premium = BlackScholesModel.call_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.stock_cost - self.call_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """计算到期时的收益。"""
        stock_value = spot_price
        call_payoff = -max(spot_price - self.K, 0)  # 卖出看涨期权
        return stock_value + call_payoff


class ProtectivePut(OptionsStrategy):
    """保护性看跌策略：持有股票 + 买入看跌期权。"""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # 计算初始成本
        self.stock_cost = underlying_price
        self.put_premium = BlackScholesModel.put_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.stock_cost + self.put_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """计算到期时的收益。"""
        stock_value = spot_price
        put_payoff = max(self.K - spot_price, 0)  # 买入看跌期权
        return stock_value + put_payoff


class IronCondor(OptionsStrategy):
    """铁秃鹰策略：卖出虚值看涨价差 + 卖出虚值看跌价差。"""

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

        # 计算净收到的权利金
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
        """计算到期时的收益。"""
        # 看跌价差收益
        put_spread = (max(self.K_ph - spot_price, 0) -
                     max(self.K_pl - spot_price, 0))

        # 看涨价差收益
        call_spread = (max(spot_price - self.K_cl, 0) -
                      max(spot_price - self.K_ch, 0))

        # 我们卖出了两个价差，所以收益为负
        return -(put_spread + call_spread)


class Straddle(OptionsStrategy):
    """多头跨式策略：在相同行权价买入看涨期权 + 买入看跌期权。"""

    def __init__(self, underlying_price: float, strike: float,
                 expiry: float, volatility: float):
        super().__init__(underlying_price)
        self.K = strike
        self.T = expiry
        self.sigma = volatility

        # 计算初始成本
        self.call_premium = BlackScholesModel.call_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.put_premium = BlackScholesModel.put_price(
            underlying_price, strike, expiry, self.r, volatility
        )
        self.initial_cost = self.call_premium + self.put_premium

    def calculate_payoff(self, spot_price: float) -> float:
        """计算到期时的收益。"""
        call_payoff = max(spot_price - self.K, 0)
        put_payoff = max(self.K - spot_price, 0)
        return call_payoff + put_payoff
```

## 波动率交易

使用期权交易波动率：

```python
class VolatilityTrader:
    """使用期权策略交易波动率。"""

    def __init__(self, symbol: str):
        self.symbol = symbol
        self.historical_vol = None
        self.implied_vol = None

    def calculate_historical_volatility(self, prices: pd.Series,
                                       window: int = 30) -> float:
        """计算历史波动率。"""
        returns = prices.pct_change().dropna()
        vol = returns.rolling(window).std() * np.sqrt(252)
        self.historical_vol = vol.iloc[-1]
        return self.historical_vol

    def estimate_implied_volatility(self, option_price: float, S: float,
                                    K: float, T: float, r: float,
                                    option_type: str = 'call') -> float:
        """使用牛顿-拉夫森方法估计隐含波动率。"""
        sigma = 0.3  # 初始猜测
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

            # 计算vega用于牛顿-拉夫森方法
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
        """检测波动率交易机会。"""
        vol_diff = implied_vol - historical_vol

        if vol_diff > threshold:
            return 'sell_vol'  # IV > HV，卖出期权
        elif vol_diff < -threshold:
            return 'buy_vol'  # IV < HV，买入期权
        else:
            return 'neutral'

    def create_vol_trade(self, signal: str, S: float, K: float,
                        T: float, sigma: float) -> OptionsStrategy:
        """创建适当的波动率交易。"""
        if signal == 'buy_vol':
            # 买入跨式策略以从波动率增加中获利
            return Straddle(S, K, T, sigma)
        elif signal == 'sell_vol':
            # 卖出铁秃鹰策略以从低波动率中获利
            width = S * 0.05  # 5%的翼展
            return IronCondor(S, K - 2*width, K - width,
                            K + width, K + 2*width, T, sigma)
        return None


class OptionsPortfolio:
    """管理期权头寸组合。"""

    def __init__(self):
        self.positions = []

    def add_position(self, strategy: OptionsStrategy, quantity: int):
        """向投资组合添加期权头寸。"""
        self.positions.append({
            'strategy': strategy,
            'quantity': quantity,
            'entry_price': strategy.S
        })

    def calculate_portfolio_greeks(self, current_price: float) -> Dict:
        """计算整个投资组合的汇总希腊字母。"""
        total_delta = 0
        total_gamma = 0
        total_vega = 0
        total_theta = 0

        for pos in self.positions:
            strategy = pos['strategy']
            qty = pos['quantity']

            # 这是简化的 - 实际中，为每个部分计算希腊字母
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
        """计算当前投资组合价值。"""
        total_value = 0

        for pos in self.positions:
            strategy = pos['strategy']
            qty = pos['quantity']
            payoff = strategy.calculate_payoff(current_price)
            total_value += payoff * qty

        return total_value

    def get_risk_report(self, current_price: float) -> Dict:
        """生成综合风险报告。"""
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

## 实践示例

```python
# 示例：期权交易和投资组合管理
def main():
    # 当前市场条件
    underlying_price = 100.0
    risk_free_rate = 0.02
    volatility = 0.25
    time_to_expiry = 30 / 365  # 30天

    print("=== 期权定价和希腊字母 ===\\n")

    # 平值看涨和看跌期权定价
    atm_strike = 100.0
    call_price = BlackScholesModel.call_price(
        underlying_price, atm_strike, time_to_expiry, risk_free_rate, volatility
    )
    put_price = BlackScholesModel.put_price(
        underlying_price, atm_strike, time_to_expiry, risk_free_rate, volatility
    )

    print(f"平值看涨期权价格：${call_price:.2f}")
    print(f"平值看跌期权价格：${put_price:.2f}")

    # 计算希腊字母
    delta = OptionsGreeks.delta(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility, 'call')
    gamma = OptionsGreeks.gamma(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility)
    vega = OptionsGreeks.vega(underlying_price, atm_strike,
                             time_to_expiry, risk_free_rate, volatility)
    theta = OptionsGreeks.theta(underlying_price, atm_strike,
                               time_to_expiry, risk_free_rate, volatility, 'call')

    print(f"\\n平值看涨期权的希腊字母：")
    print(f"  Delta：{delta:.4f}")
    print(f"  Gamma：{gamma:.4f}")
    print(f"  Vega：{vega:.4f}")
    print(f"  Theta：{theta:.4f}")

    # 测试不同策略
    print("\\n=== 期权策略 ===\\n")

    # 备兑看涨
    covered_call = CoveredCall(underlying_price, 105, time_to_expiry, volatility)
    print(f"备兑看涨（行权价105）：")
    print(f"  初始成本：${covered_call.initial_cost:.2f}")
    print(f"  最大利润：${covered_call.calculate_payoff(105) - covered_call.initial_cost:.2f}")
    print(f"  盈亏平衡点：${covered_call.initial_cost:.2f}")

    # 保护性看跌
    protective_put = ProtectivePut(underlying_price, 95, time_to_expiry, volatility)
    print(f"\\n保护性看跌（行权价95）：")
    print(f"  初始成本：${protective_put.initial_cost:.2f}")
    print(f"  最大损失：${protective_put.calculate_payoff(0) - protective_put.initial_cost:.2f}")

    # 铁秃鹰
    iron_condor = IronCondor(underlying_price, 90, 95, 105, 110,
                            time_to_expiry, volatility)
    print(f"\\n铁秃鹰（90/95/105/110）：")
    print(f"  初始权利金：${iron_condor.initial_credit:.2f}")
    print(f"  最大利润：${iron_condor.initial_credit:.2f}")
    print(f"  在100时的利润：${iron_condor.calculate_payoff(100) + iron_condor.initial_credit:.2f}")

    # 跨式
    straddle = Straddle(underlying_price, 100, time_to_expiry, volatility)
    print(f"\\n多头跨式（行权价100）：")
    print(f"  初始成本：${straddle.initial_cost:.2f}")
    print(f"  上方盈亏平衡点：${100 + straddle.initial_cost:.2f}")
    print(f"  下方盈亏平衡点：${100 - straddle.initial_cost:.2f}")

    # 投资组合管理
    print("\\n=== 投资组合管理 ===\\n")

    portfolio = OptionsPortfolio()
    portfolio.add_position(covered_call, 10)
    portfolio.add_position(protective_put, 5)

    risk_report = portfolio.get_risk_report(underlying_price)
    print("投资组合风险报告：")
    print(f"  投资组合价值：${risk_report['portfolio_value']:.2f}")
    print(f"  Delta：{risk_report['greeks']['delta']:.2f}")
    print(f"  Gamma：{risk_report['greeks']['gamma']:.4f}")
    print(f"  Vega：{risk_report['greeks']['vega']:.2f}")
    print(f"  Theta：${risk_report['greeks']['theta']:.2f}/天")

    # 波动率交易
    print("\\n=== 波动率交易 ===\\n")

    vol_trader = VolatilityTrader('SPY')
    historical_vol = 0.20
    implied_vol = 0.28

    signal = vol_trader.detect_vol_opportunity(historical_vol, implied_vol)
    print(f"历史波动率：{historical_vol:.1%}")
    print(f"隐含波动率：{implied_vol:.1%}")
    print(f"信号：{signal}")

if __name__ == "__main__":
    main()
```

## 最佳实践

1. **风险管理**
   - 持续监控希腊字母
   - 为每个策略设置头寸限制
   - 对期权头寸使用止损
   - 必要时对冲delta敞口

2. **策略选择**
   - 将策略与市场展望相匹配
   - 考虑隐含波动率与历史波动率
   - 考虑时间衰减（theta）
   - 评估风险/回报比率

3. **执行**
   - 交易流动性好的期权（价差小）
   - 使用限价单，而非市价单
   - 考虑买卖价差成本
   - 在波动率事件前后把握入场时机

4. **投资组合管理**
   - 跨策略和标的资产分散投资
   - 定期重新平衡希腊字母
   - 在到期前平仓
   - 跟踪实际与预期盈亏

5. **波动率分析**
   - 比较隐含波动率与历史波动率
   - 监控波动率期限结构
   - 跟踪波动率偏斜
   - 使用波动率预测模型

## 练习

1. **期权定价**：计算不同行权价和到期日的看涨和看跌期权的价格和希腊字母。分析希腊字母如何随现货价格变动而变化。

2. **策略比较**：比较备兑看涨、保护性看跌和领口策略。在不同市场情景下哪个表现最好？

3. **铁秃鹰优化**：找到铁秃鹰的最优行权价选择以最大化风险调整后收益。在历史数据上进行测试。

4. **波动率交易**：构建一个通过比较隐含波动率和历史波动率来交易波动率的系统。回测该策略。

5. **投资组合对冲**：创建一个股票投资组合并使用期权进行对冲。在保留上行潜力的同时最小化下行风险。

## 总结

期权和衍生品为交易和风险管理提供了强大的工具。关键要点：

- Black-Scholes模型基于标的资产、行权价、时间、利率和波动率对期权定价
- 希腊字母衡量对各种风险因素的敏感性
- 不同的策略适合不同的市场展望和风险偏好
- 波动率交易利用隐含波动率和实现波动率之间的差异
- 投资组合希腊字母有助于管理总体风险敞口

在下一课中，我们将探讨建立专业交易业务。

