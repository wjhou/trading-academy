# 模块5项目：综合风险管理系统

## 项目概述

在这个项目中，您将构建一个完整的风险管理系统，整合模块5中学到的所有概念。该系统将处理仓位规模、止损管理、风险回报分析、投资组合多样化、回撤监控和凯利准则计算。

这个项目代表了一个专业级的风险管理框架，可以集成到任何交易系统中。

## 项目目标

通过完成这个项目，您将：
- 将多种风险管理技术整合到统一系统中
- 构建投资组合级别的风险监控仪表板
- 实施基于市场条件的自适应仓位规模
- 创建综合的风险报告和分析
- 开发可重用的风险管理框架

## 系统架构

风险管理系统由几个集成组件组成：

1. **RiskManager**：所有风险管理功能的中央协调器
2. **PositionSizer**：使用多种方法处理仓位规模
3. **StopLossManager**：管理止损订单和追踪止损
4. **RiskRewardAnalyzer**：计算和跟踪风险回报指标
5. **PortfolioRiskMonitor**：监控投资组合级别的风险和相关性
6. **DrawdownTracker**：跟踪和管理回撤
7. **KellyCalculator**：使用凯利准则计算最优仓位规模
8. **RiskReporter**：生成风险报告和可视化

## 实施

### 第1部分：核心风险管理器

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class Position:
    """代表一个交易仓位。"""
    symbol: str
    entry_price: float
    shares: int
    entry_date: datetime
    stop_loss: float
    take_profit: Optional[float] = None
    current_price: Optional[float] = None

    @property
    def position_value(self) -> float:
        """当前仓位价值。"""
        price = self.current_price or self.entry_price
        return self.shares * price

    @property
    def unrealized_pnl(self) -> float:
        """未实现盈亏。"""
        if self.current_price is None:
            return 0.0
        return (self.current_price - self.entry_price) * self.shares

    @property
    def unrealized_pnl_pct(self) -> float:
        """未实现盈亏百分比。"""
        if self.current_price is None:
            return 0.0
        return (self.current_price - self.entry_price) / self.entry_price


@dataclass
class Trade:
    """代表一个已完成的交易。"""
    symbol: str
    entry_price: float
    exit_price: float
    shares: int
    entry_date: datetime
    exit_date: datetime
    pnl: float
    pnl_pct: float
    hold_days: int


class RiskManager:
    """
    综合风险管理系统。
    """

    def __init__(self,
                 initial_capital: float,
                 max_position_size: float = 0.10,
                 max_portfolio_risk: float = 0.06,
                 max_correlation: float = 0.70,
                 max_drawdown: float = 0.20,
                 kelly_fraction: float = 0.5):
        """
        初始化风险管理器。

        参数：
        -----------
        initial_capital : float
            起始资本
        max_position_size : float
            最大仓位规模占资本的分数
        max_portfolio_risk : float
            最大总投资组合风险
        max_correlation : float
            仓位之间的最大相关性
        max_drawdown : float
            允许的最大回撤
        kelly_fraction : float
            使用的凯利分数
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.max_position_size = max_position_size
        self.max_portfolio_risk = max_portfolio_risk
        self.max_correlation = max_correlation
        self.max_drawdown = max_drawdown
        self.kelly_fraction = kelly_fraction

        # 跟踪仓位和交易
        self.positions: Dict[str, Position] = {}
        self.trade_history: List[Trade] = []

        # 跟踪权益曲线
        self.equity_curve = [initial_capital]
        self.equity_dates = [datetime.now()]

        # 峰值跟踪用于回撤
        self.peak_capital = initial_capital
        self.peak_date = datetime.now()

    def calculate_position_size(self,
                                symbol: str,
                                entry_price: float,
                                stop_loss: float,
                                method: str = 'fixed_risk',
                                risk_amount: float = None) -> int:
        """
        使用指定方法计算仓位规模。

        参数：
        -----------
        symbol : str
            股票代码
        entry_price : float
            入场价格
        stop_loss : float
            止损价格
        method : str
            规模方法：'fixed_risk'、'fixed_pct'、'atr'、'kelly'
        risk_amount : float
            风险金额（用于fixed_risk方法）

        返回：
        --------
        int : 股数
        """
        # 默认风险金额
        if risk_amount is None:
            risk_amount = self.current_capital * 0.01  # 1%风险

        # 计算每股风险
        risk_per_share = abs(entry_price - stop_loss)

        if risk_per_share == 0:
            return 0

        if method == 'fixed_risk':
            # 基于风险的规模
            shares = int(risk_amount / risk_per_share)

        elif method == 'fixed_pct':
            # 资本的固定百分比
            position_value = self.current_capital * 0.05  # 资本的5%
            shares = int(position_value / entry_price)

        elif method == 'kelly':
            # 凯利准则规模
            if len(self.trade_history) < 10:
                # 历史不足，使用保守规模
                shares = int((self.current_capital * 0.02) / entry_price)
            else:
                # 从交易历史计算凯利
                returns = [t.pnl_pct for t in self.trade_history]
                kelly_pct = self._calculate_kelly(returns)
                position_value = self.current_capital * kelly_pct
                shares = int(position_value / entry_price)

        else:
            shares = 0

        # 应用最大仓位规模限制
        max_shares = int((self.current_capital * self.max_position_size) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def _calculate_kelly(self, returns: List[float]) -> float:
        """从收益计算凯利百分比。"""
        if not returns:
            return 0.0

        returns_array = np.array(returns)
        wins = returns_array[returns_array > 0]
        losses = returns_array[returns_array < 0]

        if len(wins) == 0 or len(losses) == 0:
            return 0.02  # 默认2%

        win_rate = len(wins) / len(returns_array)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        if avg_loss == 0:
            return 0.02

        win_loss_ratio = avg_win / avg_loss
        kelly = win_rate - ((1 - win_rate) / win_loss_ratio)
        kelly = kelly * self.kelly_fraction

        return max(0.0, min(kelly, self.max_position_size))

    def check_correlation(self, symbol: str) -> bool:
        """
        检查添加仓位是否会违反相关性限制。

        参数：
        -----------
        symbol : str
            要检查的代码

        返回：
        --------
        bool : 如果相关性可接受则为True
        """
        if not self.positions:
            return True

        # 下载价格数据
        try:
            symbols = list(self.positions.keys()) + [symbol]
            data = yf.download(symbols, period='3mo', progress=False)['Adj Close']

            if len(symbols) == 2:
                corr = data.corr().iloc[0, 1]
            else:
                corr = data[symbol].corr(data[list(self.positions.keys())[0]])

            return abs(corr) < self.max_correlation

        except:
            return True  # 如果数据不可用则允许

    def check_portfolio_risk(self) -> float:
        """
        计算当前投资组合风险。

        返回：
        --------
        float : 总投资组合风险占比
        """
        if not self.positions:
            return 0.0

        total_risk = 0.0

        for pos in self.positions.values():
            # 每个仓位的风险
            risk_per_share = abs(pos.entry_price - pos.stop_loss)
            position_risk = (risk_per_share * pos.shares) / self.current_capital
            total_risk += position_risk

        return total_risk

    def can_open_position(self, symbol: str, position_risk: float) -> Tuple[bool, str]:
        """
        检查是否可以开新仓位。

        参数：
        -----------
        symbol : str
            要交易的代码
        position_risk : float
            新仓位的风险占比

        返回：
        --------
        Tuple[bool, str] : (can_open, reason)
        """
        # 检查是否已有仓位
        if symbol in self.positions:
            return False, "仓位已存在"

        # 检查回撤
        current_dd = self.get_current_drawdown()
        if current_dd >= self.max_drawdown:
            return False, f"达到最大回撤：{current_dd:.2%}"

        # 检查投资组合风险
        current_risk = self.check_portfolio_risk()
        if current_risk + position_risk > self.max_portfolio_risk:
            return False, f"超过投资组合风险限制：{current_risk + position_risk:.2%}"

        # 检查相关性
        if not self.check_correlation(symbol):
            return False, "超过相关性限制"

        return True, "OK"

    def open_position(self,
                     symbol: str,
                     entry_price: float,
                     shares: int,
                     stop_loss: float,
                     take_profit: Optional[float] = None) -> bool:
        """
        开新仓位。

        参数：
        -----------
        symbol : str
            股票代码
        entry_price : float
            入场价格
        shares : int
            股数
        stop_loss : float
            止损价格
        take_profit : float, optional
            止盈价格

        返回：
        --------
        bool : 如果仓位成功开启则为True
        """
        # 计算仓位风险
        risk_per_share = abs(entry_price - stop_loss)
        position_risk = (risk_per_share * shares) / self.current_capital

        # 检查是否可以开仓
        can_open, reason = self.can_open_position(symbol, position_risk)

        if not can_open:
            print(f"无法开仓：{reason}")
            return False

        # 创建仓位
        position = Position(
            symbol=symbol,
            entry_price=entry_price,
            shares=shares,
            entry_date=datetime.now(),
            stop_loss=stop_loss,
            take_profit=take_profit,
            current_price=entry_price
        )

        self.positions[symbol] = position

        # 更新资本
        self.current_capital -= entry_price * shares

        print(f"开仓：{symbol} - {shares}股 @ ${entry_price:.2f}")
        print(f"止损：${stop_loss:.2f}，风险：{position_risk:.2%}")

        return True

    def close_position(self, symbol: str, exit_price: float, reason: str = "手动") -> bool:
        """
        平仓现有仓位。

        参数：
        -----------
        symbol : str
            要平仓的代码
        exit_price : float
            退出价格
        reason : str
            平仓原因

        返回：
        --------
        bool : 如果成功平仓则为True
        """
        if symbol not in self.positions:
            print(f"未找到{symbol}的仓位")
            return False

        pos = self.positions[symbol]

        # 计算盈亏
        pnl = (exit_price - pos.entry_price) * pos.shares
        pnl_pct = (exit_price - pos.entry_price) / pos.entry_price

        # 更新资本
        self.current_capital += exit_price * pos.shares

        # 创建交易记录
        hold_days = (datetime.now() - pos.entry_date).days
        trade = Trade(
            symbol=symbol,
            entry_price=pos.entry_price,
            exit_price=exit_price,
            shares=pos.shares,
            entry_date=pos.entry_date,
            exit_date=datetime.now(),
            pnl=pnl,
            pnl_pct=pnl_pct,
            hold_days=hold_days
        )

        self.trade_history.append(trade)

        # 移除仓位
        del self.positions[symbol]

        # 更新权益曲线
        self.equity_curve.append(self.current_capital)
        self.equity_dates.append(datetime.now())

        # 更新峰值
        if self.current_capital > self.peak_capital:
            self.peak_capital = self.current_capital
            self.peak_date = datetime.now()

        print(f"平仓：{symbol} @ ${exit_price:.2f}")
        print(f"盈亏：${pnl:,.2f}（{pnl_pct:+.2%}）- 原因：{reason}")

        return True

    def update_positions(self):
        """用当前价格更新所有仓位。"""
        if not self.positions:
            return

        symbols = list(self.positions.keys())

        try:
            # 下载当前价格
            data = yf.download(symbols, period='1d', progress=False)

            if len(symbols) == 1:
                current_price = data['Adj Close'].iloc[-1]
                self.positions[symbols[0]].current_price = current_price
            else:
                for symbol in symbols:
                    current_price = data['Adj Close'][symbol].iloc[-1]
                    self.positions[symbol].current_price = current_price

            print("仓位已用当前价格更新")

        except Exception as e:
            print(f"更新仓位时出错：{e}")

    def check_stops(self) -> List[str]:
        """
        检查是否有仓位触及止损。

        返回：
        --------
        List[str] : 触及止损的代码
        """
        stopped_out = []

        for symbol, pos in self.positions.items():
            if pos.current_price is None:
                continue

            # 检查止损
            if pos.current_price <= pos.stop_loss:
                self.close_position(symbol, pos.stop_loss, "止损")
                stopped_out.append(symbol)

            # 检查止盈
            elif pos.take_profit and pos.current_price >= pos.take_profit:
                self.close_position(symbol, pos.take_profit, "止盈")
                stopped_out.append(symbol)

        return stopped_out

    def update_trailing_stops(self, trail_pct: float = 0.10):
        """
        更新盈利仓位的追踪止损。

        参数：
        -----------
        trail_pct : float
            追踪止损百分比
        """
        for symbol, pos in self.positions.items():
            if pos.current_price is None:
                continue

            # 只在盈利时追踪
            if pos.current_price > pos.entry_price:
                new_stop = pos.current_price * (1 - trail_pct)

                # 只提高止损，永不降低
                if new_stop > pos.stop_loss:
                    pos.stop_loss = new_stop
                    print(f"更新{symbol}的追踪止损：${new_stop:.2f}")

    def get_current_drawdown(self) -> float:
        """
        计算当前回撤。

        返回：
        --------
        float : 当前回撤占比
        """
        total_value = self.get_total_value()

        if self.peak_capital == 0:
            return 0.0

        drawdown = (self.peak_capital - total_value) / self.peak_capital
        return max(0.0, drawdown)

    def get_total_value(self) -> float:
        """
        获取总投资组合价值。

        返回：
        --------
        float : 总价值（现金+仓位）
        """
        position_value = sum(pos.position_value for pos in self.positions.values())
        return self.current_capital + position_value

    def get_performance_metrics(self) -> Dict:
        """
        计算表现指标。

        返回：
        --------
        Dict : 表现指标
        """
        if not self.trade_history:
            return {}

        returns = [t.pnl_pct for t in self.trade_history]
        pnls = [t.pnl for t in self.trade_history]

        wins = [r for r in returns if r > 0]
        losses = [r for r in returns if r < 0]

        total_return = (self.get_total_value() - self.initial_capital) / self.initial_capital

        metrics = {
            'total_trades': len(self.trade_history),
            'winning_trades': len(wins),
            'losing_trades': len(losses),
            'win_rate': len(wins) / len(returns) if returns else 0,
            'avg_win': np.mean(wins) if wins else 0,
            'avg_loss': np.mean(losses) if losses else 0,
            'avg_win_loss_ratio': abs(np.mean(wins) / np.mean(losses)) if wins and losses else 0,
            'total_pnl': sum(pnls),
            'total_return': total_return,
            'max_drawdown': self.get_max_drawdown(),
            'current_drawdown': self.get_current_drawdown(),
            'sharpe_ratio': self.calculate_sharpe_ratio(),
            'expectancy': self.calculate_expectancy()
        }

        return metrics

    def get_max_drawdown(self) -> float:
        """从权益曲线计算最大回撤。"""
        if len(self.equity_curve) < 2:
            return 0.0

        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        return np.max(drawdowns)

    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        """计算夏普比率。"""
        if len(self.trade_history) < 2:
            return 0.0

        returns = [t.pnl_pct for t in self.trade_history]
        excess_returns = np.array(returns) - (risk_free_rate / 252)

        if np.std(excess_returns) == 0:
            return 0.0

        return np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)

    def calculate_expectancy(self) -> float:
        """计算每笔交易的期望。"""
        if not self.trade_history:
            return 0.0

        returns = [t.pnl_pct for t in self.trade_history]
        wins = [r for r in returns if r > 0]
        losses = [r for r in returns if r < 0]

        if not wins or not losses:
            return 0.0

        win_rate = len(wins) / len(returns)
        avg_win = np.mean(wins)
        avg_loss = abs(np.mean(losses))

        expectancy = (win_rate * avg_win) - ((1 - win_rate) * avg_loss)
        return expectancy

    def generate_report(self):
        """生成综合风险报告。"""
        print("\n" + "=" * 70)
        print("风险管理报告")
        print("=" * 70)

        # 投资组合摘要
        print("\n投资组合摘要")
        print("-" * 70)
        print(f"初始资本：    ${self.initial_capital:,.2f}")
        print(f"当前现金：    ${self.current_capital:,.2f}")
        print(f"仓位价值：    ${sum(p.position_value for p in self.positions.values()):,.2f}")
        print(f"总价值：      ${self.get_total_value():,.2f}")
        print(f"总回报：      {(self.get_total_value() - self.initial_capital) / self.initial_capital:+.2%}")

        # 当前仓位
        print("\n当前仓位")
        print("-" * 70)
        if self.positions:
            for symbol, pos in self.positions.items():
                print(f"\n{symbol}：")
                print(f"  股数：          {pos.shares}")
                print(f"  入场价格：      ${pos.entry_price:.2f}")
                print(f"  当前价格：      ${pos.current_price:.2f}" if pos.current_price else "  当前价格：      N/A")
                print(f"  止损：          ${pos.stop_loss:.2f}")
                print(f"  仓位价值：      ${pos.position_value:,.2f}")
                print(f"  未实现盈亏：    ${pos.unrealized_pnl:,.2f}（{pos.unrealized_pnl_pct:+.2%}）")
        else:
            print("无开仓仓位")

        # 风险指标
        print("\n风险指标")
        print("-" * 70)
        print(f"投资组合风险：  {self.check_portfolio_risk():.2%} / {self.max_portfolio_risk:.2%}")
        print(f"当前回撤：      {self.get_current_drawdown():.2%}")
        print(f"最大回撤：      {self.get_max_drawdown():.2%}")
        print(f"峰值资本：      ${self.peak_capital:,.2f}")

        # 表现指标
        if self.trade_history:
            print("\n表现指标")
            print("-" * 70)
            metrics = self.get_performance_metrics()
            print(f"总交易数：      {metrics['total_trades']}")
            print(f"胜率：          {metrics['win_rate']:.2%}")
            print(f"平均盈利：      {metrics['avg_win']:+.2%}")
            print(f"平均亏损：      {metrics['avg_loss']:+.2%}")
            print(f"盈亏比：        {metrics['avg_win_loss_ratio']:.2f}")
            print(f"期望：          {metrics['expectancy']:+.2%}")
            print(f"夏普比率：      {metrics['sharpe_ratio']:.2f}")

        print("\n" + "=" * 70)

    def plot_equity_curve(self):
        """绘制权益曲线和回撤。"""
        if len(self.equity_curve) < 2:
            print("数据不足以绘图")
            return

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

        # 权益曲线
        ax1.plot(self.equity_dates, self.equity_curve, label='投资组合价值', linewidth=2)
        ax1.axhline(y=self.initial_capital, color='gray', linestyle='--', label='初始资本')
        ax1.set_ylabel('投资组合价值（$）')
        ax1.set_title('权益曲线')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 回撤
        equity = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (running_max - equity) / running_max

        ax2.fill_between(self.equity_dates, 0, -drawdowns * 100, alpha=0.3, color='red')
        ax2.plot(self.equity_dates, -drawdowns * 100, color='red', linewidth=2)
        ax2.axhline(y=-self.max_drawdown * 100, color='orange', linestyle='--',
                   label=f'最大回撤限制（{self.max_drawdown:.0%}）')
        ax2.set_ylabel('回撤（%）')
        ax2.set_xlabel('日期')
        ax2.set_title('回撤')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()


# 使用示例
def example_risk_system():
    """
    演示综合风险管理系统。
    """
    print("综合风险管理系统")
    print("=" * 70)

    # 初始化风险管理器
    risk_mgr = RiskManager(
        initial_capital=100000,
        max_position_size=0.10,
        max_portfolio_risk=0.06,
        max_correlation=0.70,
        max_drawdown=0.20,
        kelly_fraction=0.5
    )

    # 示例1：开仓
    print("\n示例1：开仓")
    print("-" * 70)

    # 计算仓位规模
    symbol = "AAPL"
    entry_price = 150.0
    stop_loss = 145.0

    shares = risk_mgr.calculate_position_size(
        symbol, entry_price, stop_loss, method='fixed_risk', risk_amount=1000
    )

    print(f"计算的仓位规模：{shares}股")

    # 开仓
    risk_mgr.open_position(
        symbol=symbol,
        entry_price=entry_price,
        shares=shares,
        stop_loss=stop_loss,
        take_profit=160.0
    )

    # 示例2：更新和监控
    print("\n示例2：仓位监控")
    print("-" * 70)

    # 模拟价格更新
    risk_mgr.positions[symbol].current_price = 155.0
    risk_mgr.update_trailing_stops(trail_pct=0.05)

    # 示例3：平仓
    print("\n示例3：平仓")
    print("-" * 70)

    risk_mgr.close_position(symbol, 155.0, "止盈")

    # 生成报告
    risk_mgr.generate_report()


if __name__ == "__main__":
    example_risk_system()
```

## 第2部分：高级功能

### 风险警报系统

```python
class RiskAlertSystem:
    """
    风险违规警报系统。
    """

    def __init__(self, risk_manager: RiskManager):
        self.risk_manager = risk_manager
        self.alerts = []

    def check_alerts(self) -> List[str]:
        """检查风险违规。"""
        alerts = []

        # 检查回撤
        dd = self.risk_manager.get_current_drawdown()
        if dd > self.risk_manager.max_drawdown * 0.8:
            alerts.append(f"警告：回撤达到{dd:.2%}，接近限制")

        # 检查投资组合风险
        risk = self.risk_manager.check_portfolio_risk()
        if risk > self.risk_manager.max_portfolio_risk * 0.9:
            alerts.append(f"警告：投资组合风险达到{risk:.2%}，接近限制")

        # 检查仓位集中度
        if self.risk_manager.positions:
            total_value = self.risk_manager.get_total_value()
            for symbol, pos in self.risk_manager.positions.items():
                concentration = pos.position_value / total_value
                if concentration > 0.25:
                    alerts.append(f"警告：{symbol}集中度达到{concentration:.2%}")

        self.alerts.extend(alerts)
        return alerts

    def get_alert_history(self) -> List[str]:
        """获取所有历史警报。"""
        return self.alerts
```

### 表现归因

```python
class PerformanceAttribution:
    """
    分析表现归因。
    """

    def __init__(self, risk_manager: RiskManager):
        self.risk_manager = risk_manager

    def analyze_by_symbol(self) -> pd.DataFrame:
        """按代码分析表现。"""
        if not self.risk_manager.trade_history:
            return pd.DataFrame()

        symbol_stats = {}

        for trade in self.risk_manager.trade_history:
            if trade.symbol not in symbol_stats:
                symbol_stats[trade.symbol] = {
                    'trades': 0,
                    'wins': 0,
                    'total_pnl': 0,
                    'total_pnl_pct': 0
                }

            stats = symbol_stats[trade.symbol]
            stats['trades'] += 1
            if trade.pnl > 0:
                stats['wins'] += 1
            stats['total_pnl'] += trade.pnl
            stats['total_pnl_pct'] += trade.pnl_pct

        # 转换为DataFrame
        df = pd.DataFrame.from_dict(symbol_stats, orient='index')
        df['win_rate'] = df['wins'] / df['trades']
        df['avg_pnl_pct'] = df['total_pnl_pct'] / df['trades']

        return df.sort_values('total_pnl', ascending=False)

    def analyze_by_hold_period(self) -> pd.DataFrame:
        """按持有期分析表现。"""
        if not self.risk_manager.trade_history:
            return pd.DataFrame()

        periods = {'0-1天': [], '1-5天': [], '5-20天': [], '20+天': []}

        for trade in self.risk_manager.trade_history:
            if trade.hold_days <= 1:
                periods['0-1天'].append(trade.pnl_pct)
            elif trade.hold_days <= 5:
                periods['1-5天'].append(trade.pnl_pct)
            elif trade.hold_days <= 20:
                periods['5-20天'].append(trade.pnl_pct)
            else:
                periods['20+天'].append(trade.pnl_pct)

        stats = {}
        for period, returns in periods.items():
            if returns:
                stats[period] = {
                    'trades': len(returns),
                    'avg_return': np.mean(returns),
                    'win_rate': len([r for r in returns if r > 0]) / len(returns)
                }

        return pd.DataFrame.from_dict(stats, orient='index')
```

## 第3部分：回测整合

```python
def backtest_risk_system(symbols: List[str],
                        start_date: str,
                        end_date: str,
                        initial_capital: float = 100000):
    """
    回测风险管理系统。

    参数：
    -----------
    symbols : List[str]
        要交易的代码列表
    start_date : str
        开始日期
    end_date : str
        结束日期
    initial_capital : float
        起始资本

    返回：
    --------
    RiskManager : 带回测结果的风险管理器
    """
    # 初始化风险管理器
    risk_mgr = RiskManager(initial_capital=initial_capital)

    # 下载数据
    data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']

    # 简单移动平均交叉策略
    for symbol in symbols:
        prices = data[symbol] if len(symbols) > 1 else data

        # 计算移动平均
        ma_short = prices.rolling(20).mean()
        ma_long = prices.rolling(50).mean()

        position_open = False

        for i in range(50, len(prices)):
            current_price = prices.iloc[i]

            # 入场信号
            if not position_open and ma_short.iloc[i] > ma_long.iloc[i]:
                # 计算止损（2 ATR）
                atr = prices.iloc[i-20:i].pct_change().std() * current_price
                stop_loss = current_price - (2 * atr)

                # 计算仓位规模
                shares = risk_mgr.calculate_position_size(
                    symbol, current_price, stop_loss, method='kelly'
                )

                if shares > 0:
                    success = risk_mgr.open_position(
                        symbol, current_price, shares, stop_loss
                    )
                    if success:
                        position_open = True

            # 退出信号
            elif position_open and ma_short.iloc[i] < ma_long.iloc[i]:
                risk_mgr.close_position(symbol, current_price, "信号")
                position_open = False

            # 更新仓位
            if symbol in risk_mgr.positions:
                risk_mgr.positions[symbol].current_price = current_price

            # 检查止损
            risk_mgr.check_stops()

    return risk_mgr
```

## 项目任务

### 任务1：系统实施
实施包含所有组件的完整风险管理系统。

### 任务2：实时监控
创建显示以下内容的仪表板：
- 当前仓位和盈亏
- 投资组合风险指标
- 回撤状态
- 风险警报

### 任务3：回测
在多个代码的历史数据上回测系统并分析：
- 表现指标
- 风险调整后的回报
- 回撤特征
- 仓位规模有效性

### 任务4：优化
优化风险参数：
- 最大仓位规模
- 凯利分数
- 回撤限制
- 相关性阈值

测试不同组合并比较结果。

### 任务5：报告
创建包括以下内容的综合报告：
- 按代码的表现归因
- 按持有期的表现
- 随时间变化的风险指标
- 带回撤的权益曲线

## 评估标准

您的项目将根据以下标准评估：

1. **完整性**（25%）：所有组件已实施并整合
2. **功能性**（25%）：系统正确工作并处理边缘情况
3. **风险管理**（20%）：正确实施风险控制
4. **表现**（15%）：系统实现良好的风险调整后回报
5. **代码质量**（15%）：清晰、有良好文档、可维护的代码

## 提交指南

提交以下内容：

1. 完整的Python实现
2. 至少3个不同代码的回测结果
3. 带指标和可视化的表现报告
4. 解释您的方法和发现的文档
5. 风险参数优化分析

## 额外挑战

1. 实施蒙特卡洛模拟进行风险评估
2. 添加机器学习进行动态参数调整
3. 创建带电子邮件/短信通知的实时警报系统
4. 使用现代投资组合理论实施投资组合优化
5. 添加对期权和其他衍生品的支持

## 结论

这个项目将模块5的所有风险管理概念整合到一个专业级系统中。通过完成这个项目，您将拥有一个可重用的框架，可以应用于任何交易策略，显著改善风险调整后的回报并在不利市场条件下保护资本。

这里开发的技能构成了专业交易系统开发的基础，对于任何认真对待系统化交易的人来说都是必不可少的。
