# 实践项目：构建你的交易策略

**模块**：4 - 交易策略
**预计时间**：4-5小时
**难度**：中级到高级

## 🎯 项目目标

设计、实现和验证一个完整的交易策略：
- 基于市场分析选择策略类型
- 实现入场和出场规则
- 添加风险管理
- 彻底回测
- 验证稳健性
- 记录完整系统

## 📋 项目概述

你将从头创建一个生产就绪的交易策略，遵循专业开发实践。

### 交付成果

1. **策略文档** (`STRATEGY.md`)
2. **实现** (`strategy.py`)
3. **回测结果** (`backtest_results.py`)
4. **验证报告** (`VALIDATION.md`)
5. **实盘交易计划** (`DEPLOYMENT.md`)

## 🎯 第1部分：策略选择

选择一种策略类型来实现：

### 选项A：趋势跟随
- 带过滤器的移动平均交叉
- 唐奇安通道突破
- 基于ADX的趋势系统

### 选项B：均值回归
- 布林带反弹
- RSI超卖/超买
- Z分数回归

### 选项C：动量
- 相对强度轮动
- 突破动量
- 板块轮动

### 选项D：混合
- 结合2-3种方法
- 市场状态切换
- 多时间框架系统

## 📝 第2部分：策略文档

创建 `STRATEGY.md`：

```markdown
# [你的策略名称]

## 执行摘要
[2-3句策略描述]

## 经济学原理
**为什么这个策略应该有效：**
- [原因1]
- [原因2]
- [原因3]

## 市场条件
**最适合：**
- [条件1]
- [条件2]

**避免：**
- [条件1]
- [条件2]

## 入场规则
1. [规则1]
2. [规则2]
3. [规则3]

**入场确认：**
- [确认1]
- [确认2]

## 出场规则

### 盈利目标
- 目标1：[X%] - 获利[Y%]
- 目标2：[X%] - 获利[Y%]
- 跟踪止损：[描述]

### 止损
- 初始止损：[方法]
- 跟踪止损：[方法]
- 时间止损：[X天]

## 仓位大小
- 每笔交易风险：[X%]
- 最大仓位：[X%]
- 方法：[固定分数/基于ATR/等]

## 风险管理
- 最大回撤：[X%]
- 最大并发仓位：[X]
- 相关性限制：[描述]

## 参数
| 参数 | 值 | 测试范围 |
|------|-------|----------|
| 快速MA | 50 | 20-100 |
| 慢速MA | 200 | 100-300 |
| RSI周期 | 14 | 7-21 |
| ... | ... | ... |

## 预期绩效
- 目标夏普比率：[X]
- 目标胜率：[X%]
- 目标CAGR：[X%]
- 最大回撤：[X%]
```

## 💻 第3部分：实现

创建 `strategy.py`：

```python
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime

class MyTradingStrategy:
    """
    [你的策略名称]

    描述：[简要描述]
    """

    def __init__(self, **params):
        """
        用参数初始化策略
        """
        # 策略参数
        self.params = params

        # 状态
        self.positions = {}
        self.trades = []
        self.equity_curve = []

    def calculate_indicators(self, df):
        """
        计算所有技术指标
        """
        # 示例：移动平均
        df['MA_Fast'] = df['Close'].rolling(self.params['ma_fast']).mean()
        df['MA_Slow'] = df['Close'].rolling(self.params['ma_slow']).mean()

        # 在此添加你的指标
        # ...

        return df

    def generate_entry_signal(self, df):
        """
        生成入场信号

        返回：
            str: 'BUY', 'SELL', 或 'HOLD'
        """
        current = df.iloc[-1]

        # 实现你的入场逻辑
        # 示例：
        if current['MA_Fast'] > current['MA_Slow']:
            # 添加额外过滤器
            if self._confirm_entry(df):
                return 'BUY'

        elif current['MA_Fast'] < current['MA_Slow']:
            if self._confirm_entry(df):
                return 'SELL'

        return 'HOLD'

    def _confirm_entry(self, df):
        """
        额外的入场确认过滤器
        """
        # 添加你的确认逻辑
        # 示例：成交量、RSI等
        return True

    def calculate_position_size(self, df, account_value, entry_price):
        """
        基于风险计算仓位大小
        """
        # 计算止损
        stop_loss = self.calculate_stop_loss(df, entry_price, 'LONG')

        # 风险金额
        risk_amount = account_value * self.params['risk_per_trade']

        # 每股风险
        risk_per_share = abs(entry_price - stop_loss)

        # 仓位大小
        shares = int(risk_amount / risk_per_share)

        # 限制到最大仓位大小
        max_shares = int((account_value * self.params['max_position_pct']) / entry_price)
        shares = min(shares, max_shares)

        return shares

    def calculate_stop_loss(self, df, entry_price, direction):
        """
        计算止损水平
        """
        # 实现你的止损逻辑
        # 示例：基于ATR
        atr = self.calculate_atr(df)
        multiplier = self.params['atr_stop_multiplier']

        if direction == 'LONG':
            stop = entry_price - (multiplier * atr)
        else:
            stop = entry_price + (multiplier * atr)

        return stop

    def calculate_atr(self, df, period=14):
        """
        计算平均真实范围
        """
        high_low = df['High'] - df['Low']
        high_close = abs(df['High'] - df['Close'].shift())
        low_close = abs(df['Low'] - df['Close'].shift())

        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(period).mean()

        return atr.iloc[-1]

    def should_exit(self, df, position):
        """
        检查是否应该退出仓位

        参数：
            df: 包含价格数据的DataFrame
            position: 包含仓位信息的字典

        返回：
            tuple: (should_exit: bool, reason: str)
        """
        current_price = df['Close'].iloc[-1]

        # 止损
        if position['direction'] == 'LONG':
            if current_price <= position['stop_loss']:
                return True, 'STOP_LOSS'

            # 获利
            if current_price >= position['take_profit']:
                return True, 'TAKE_PROFIT'

        # 添加更多出场条件
        # ...

        return False, None

    def backtest(self, df, initial_capital=100000):
        """
        在历史数据上回测策略
        """
        df = self.calculate_indicators(df)

        capital = initial_capital
        position = None

        for i in range(self.params['ma_slow'], len(df)):
            current_df = df.iloc[:i+1]
            current = current_df.iloc[-1]

            # 如果有仓位则检查出场
            if position:
                should_exit, reason = self.should_exit(current_df, position)

                if should_exit:
                    # 计算盈亏
                    if position['direction'] == 'LONG':
                        pnl = (current['Close'] - position['entry_price']) * position['shares']
                    else:
                        pnl = (position['entry_price'] - current['Close']) * position['shares']

                    capital += pnl

                    # 记录交易
                    self.trades.append({
                        'entry_date': position['entry_date'],
                        'exit_date': current.name,
                        'direction': position['direction'],
                        'entry_price': position['entry_price'],
                        'exit_price': current['Close'],
                        'shares': position['shares'],
                        'pnl': pnl,
                        'pnl_pct': pnl / (position['entry_price'] * position['shares']),
                        'exit_reason': reason
                    })

                    position = None

            # 如果没有仓位则检查入场
            if not position:
                signal = self.generate_entry_signal(current_df)

                if signal in ['BUY', 'SELL']:
                    entry_price = current['Close']
                    shares = self.calculate_position_size(current_df, capital, entry_price)

                    if shares > 0:
                        position = {
                            'direction': 'LONG' if signal == 'BUY' else 'SHORT',
                            'entry_date': current.name,
                            'entry_price': entry_price,
                            'shares': shares,
                            'stop_loss': self.calculate_stop_loss(current_df, entry_price, 'LONG' if signal == 'BUY' else 'SHORT'),
                            'take_profit': entry_price * 1.10  # 示例：10%盈利目标
                        }

            # 记录权益
            equity = capital
            if position:
                if position['direction'] == 'LONG':
                    equity += (current['Close'] - position['entry_price']) * position['shares']
                else:
                    equity += (position['entry_price'] - current['Close']) * position['shares']

            self.equity_curve.append({
                'date': current.name,
                'equity': equity
            })

        return self.calculate_metrics(initial_capital)

    def calculate_metrics(self, initial_capital):
        """
        计算绩效指标
        """
        if not self.trades:
            return {}

        # 转换为DataFrame
        trades_df = pd.DataFrame(self.trades)
        equity_df = pd.DataFrame(self.equity_curve)

        # 计算指标
        total_trades = len(trades_df)
        winning_trades = len(trades_df[trades_df['pnl'] > 0])
        losing_trades = len(trades_df[trades_df['pnl'] < 0])

        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        total_pnl = trades_df['pnl'].sum()
        final_capital = equity_df['equity'].iloc[-1]
        total_return = (final_capital - initial_capital) / initial_capital

        # 计算夏普比率
        equity_df['returns'] = equity_df['equity'].pct_change()
        sharpe = (equity_df['returns'].mean() / equity_df['returns'].std()) * np.sqrt(252)

        # 最大回撤
        equity_df['cummax'] = equity_df['equity'].cummax()
        equity_df['drawdown'] = (equity_df['equity'] - equity_df['cummax']) / equity_df['cummax']
        max_drawdown = equity_df['drawdown'].min()

        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'total_return': total_return,
            'final_capital': final_capital,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_drawdown,
            'avg_win': trades_df[trades_df['pnl'] > 0]['pnl'].mean() if winning_trades > 0 else 0,
            'avg_loss': trades_df[trades_df['pnl'] < 0]['pnl'].mean() if losing_trades > 0 else 0
        }

# 使用示例
if __name__ == "__main__":
    # 定义参数
    params = {
        'ma_fast': 50,
        'ma_slow': 200,
        'risk_per_trade': 0.02,
        'max_position_pct': 0.10,
        'atr_stop_multiplier': 2.0
    }

    # 初始化策略
    strategy = MyTradingStrategy(**params)

    # 获取数据
    df = yf.Ticker("SPY").history(period="5y")

    # 回测
    results = strategy.backtest(df)

    # 打印结果
    print("\n回测结果：")
    print("-" * 50)
    for key, value in results.items():
        if isinstance(value, float):
            if 'rate' in key or 'return' in key or 'drawdown' in key:
                print(f"{key:20s}: {value:.2%}")
            else:
                print(f"{key:20s}: {value:.2f}")
        else:
            print(f"{key:20s}: {value}")
```

## 📊 第4部分：验证

创建 `VALIDATION.md`：

```markdown
# 策略验证报告

## 1. 回测结果

### 绩效指标
- 总回报：[X%]
- CAGR：[X%]
- 夏普比率：[X]
- 最大回撤：[X%]
- 胜率：[X%]
- 盈利因子：[X]

### 交易统计
- 总交易数：[X]
- 平均交易：[X%]
- 最佳交易：[X%]
- 最差交易：[X%]

## 2. 稳健性测试

### 参数敏感性
[显示参数范围内绩效的表格]

### 样本外绩效
- 样本内（2019-2021）：[结果]
- 样本外（2022-2024）：[结果]

### 多市场
[不同股票/ETF的结果]

## 3. 前向分析
[前向优化的结果]

## 4. 蒙特卡洛模拟
[蒙特卡洛分析的结果]

## 5. 检查清单
- [ ] 正期望值
- [ ] 足够的交易（>30）
- [ ] 可接受的回撤（<30%）
- [ ] 正夏普比率（>0.5）
- [ ] 样本外有效
- [ ] 参数稳定
- [ ] 经济学原理合理

## 6. 结论
[通过/失败及原因]
```

## 🚀 第5部分：部署计划

创建 `DEPLOYMENT.md`：

```markdown
# 实盘交易部署计划

## 部署前

### 1. 模拟交易
- 持续时间：[X周/月]
- 平台：[平台名称]
- 成功标准：[指标]

### 2. 风险限制
- 最大账户风险：[X%]
- 最大仓位大小：[X%]
- 每日亏损限制：[X%]

### 3. 监控
- 检查频率：[每日/每周]
- 要关注的关键指标：[列表]
- 警报阈值：[列表]

## 部署

### 阶段1：小资金
- 资金：[$X]
- 持续时间：[X月]
- 审查：[时间表]

### 阶段2：扩大规模
- 扩大规模的条件：[列表]
- 目标资金：[$X]

## 持续管理

### 每日任务
- [ ] 检查仓位
- [ ] 审查警报
- [ ] 更新止损

### 每周任务
- [ ] 审查绩效
- [ ] 检查状态变化
- [ ] 如需要则再平衡

### 每月任务
- [ ] 全面绩效审查
- [ ] 参数检查
- [ ] 如需要则调整策略

## 应急程序
- 市场崩盘：[行动]
- 系统故障：[行动]
- 意外亏损：[行动]
```

## ✅ 项目检查清单

- [ ] 策略文档完成
- [ ] 代码实现并测试
- [ ] 回测显示正面结果
- [ ] 稳健性测试通过
- [ ] 验证报告完成
- [ ] 部署计划就绪
- [ ] 所有代码已记录
- [ ] 结果可视化

## 🎓 评估标准

1. **策略设计**（25%）：清晰的原理，明确的规则
2. **实现**（25%）：干净的代码，适当的结构
3. **测试**（25%）：彻底的回测和验证
4. **文档**（15%）：完整清晰
5. **结果**（10%）：现实可实现

## 📚 提交

提交到文件夹：`module-04-project/`

```
module-04-project/
├── STRATEGY.md
├── strategy.py
├── backtest_results.py
├── VALIDATION.md
├── DEPLOYMENT.md
├── charts/
│   ├── equity_curve.png
│   ├── drawdown.png
│   └── parameter_sensitivity.png
└── README.md
```

---

**完成模块4？** ✓ 进入[模块5：风险管理](../module-05/lesson-01-position-sizing.md)
