# 使用 stock-agent-system

使用 stock-agent-system 框架与本书配合的指南。

## 什么是 stock-agent-system？

stock-agent-system 是一个配套框架，旨在与本交易学院书籍配合使用。它提供：
- 预构建的交易基础设施
- 数据管理工具
- 策略模板
- 回测框架
- 实盘交易能力

## 安装

### 前置条件

- Python 3.8 或更高版本
- pip 包管理器
- Git

### 从 GitHub 安装

```bash
# 克隆仓库
git clone https://github.com/wjhou/stock-agent-system.git
cd stock-agent-system

# 以开发模式安装
pip install -e .

# 或直接从 GitHub 安装
pip install git+https://github.com/wjhou/stock-agent-system.git
```

### 验证安装

```python
import stock_agent_system
print(stock_agent_system.__version__)
```

## 快速开始

### 基本用法

```python
from stock_agent_system import DataManager, Strategy, Backtest

# 初始化数据管理器
dm = DataManager()

# 下载数据
data = dm.get_data('AAPL', start='2024-01-01', end='2024-12-31')

# 创建简单策略
class MyStrategy(Strategy):
    def generate_signals(self, data):
        # 您的策略逻辑在这里
        signals = data['Close'].rolling(20).mean()
        return signals

# 运行回测
strategy = MyStrategy()
backtest = Backtest(strategy, data)
results = backtest.run()

# 查看结果
print(results.summary())
```

## 与本书课程的集成

### 模块 1-2：入门

本书的早期模块使用基本的 Python 和 pandas。在此阶段 stock-agent-system 是可选的。

### 模块 3-4：指标和策略

使用 stock-agent-system 的指标库：

```python
from stock_agent_system.indicators import RSI, MACD, BollingerBands

# 计算指标
rsi = RSI(data['Close'], period=14)
macd = MACD(data['Close'])
bb = BollingerBands(data['Close'], period=20)
```

### 模块 5-6：风险管理和回测

利用 stock-agent-system 的回测框架：

```python
from stock_agent_system import Backtest, RiskManager

# 设置风险管理
risk_mgr = RiskManager(
    max_position_size=0.1,  # 每个仓位 10%
    max_portfolio_risk=0.20  # 总风险 20%
)

# 使用风险管理运行回测
backtest = Backtest(strategy, data, risk_manager=risk_mgr)
results = backtest.run()
```

### 模块 7-8：高级主题

使用 stock-agent-system 进行实盘交易：

```python
from stock_agent_system import LiveTrader

# 初始化实盘交易器
trader = LiveTrader(
    strategy=strategy,
    broker='alpaca',
    api_key='your_key',
    secret_key='your_secret'
)

# 开始交易
trader.start()
```

## 关键组件

### DataManager

处理数据下载和管理：

```python
from stock_agent_system import DataManager

dm = DataManager()

# 单个股票代码
data = dm.get_data('AAPL', start='2024-01-01')

# 多个股票代码
data = dm.get_data(['AAPL', 'GOOGL', 'MSFT'], start='2024-01-01')

# 保存/加载数据
dm.save_data(data, 'my_data.csv')
data = dm.load_data('my_data.csv')
```

### Strategy 基类

创建策略的模板：

```python
from stock_agent_system import Strategy

class MyStrategy(Strategy):
    def __init__(self, param1=10, param2=20):
        super().__init__()
        self.param1 = param1
        self.param2 = param2

    def generate_signals(self, data):
        """生成交易信号。"""
        # 您的逻辑在这里
        return signals

    def calculate_position_size(self, signal, capital):
        """计算仓位大小。"""
        # 您的仓位计算逻辑
        return size
```

### Backtest 引擎

全面的回测：

```python
from stock_agent_system import Backtest

backtest = Backtest(
    strategy=strategy,
    data=data,
    initial_capital=100000,
    commission=0.001,  # 0.1%
    slippage=0.0005    # 0.05%
)

results = backtest.run()

# 访问结果
print(f"总收益率: {results.total_return:.2%}")
print(f"夏普比率: {results.sharpe_ratio:.2f}")
print(f"最大回撤: {results.max_drawdown:.2%}")

# 绘制结果
results.plot()
```

### Risk Manager

内置风险管理：

```python
from stock_agent_system import RiskManager

risk_mgr = RiskManager(
    max_position_size=0.10,      # 每个仓位 10%
    max_portfolio_risk=0.20,     # 总风险 20%
    max_correlation=0.70,        # 仓位之间的最大相关性
    stop_loss_pct=0.05,          # 5% 止损
    take_profit_pct=0.15         # 15% 止盈
)

# 检查是否允许交易
if risk_mgr.check_trade(symbol, quantity, price):
    # 执行交易
    pass
```

## 示例：完整策略

这是一个使用 stock-agent-system 的完整示例：

```python
from stock_agent_system import (
    DataManager, Strategy, Backtest,
    RiskManager, indicators
)
import pandas as pd

class MovingAverageCrossover(Strategy):
    """使用 stock-agent-system 的均线交叉策略。"""

    def __init__(self, short_window=20, long_window=50):
        super().__init__()
        self.short_window = short_window
        self.long_window = long_window

    def generate_signals(self, data):
        """基于均线交叉生成信号。"""
        signals = pd.DataFrame(index=data.index)
        signals['signal'] = 0.0

        # 计算移动平均线
        signals['short_ma'] = data['Close'].rolling(
            window=self.short_window
        ).mean()
        signals['long_ma'] = data['Close'].rolling(
            window=self.long_window
        ).mean()

        # 生成信号
        signals['signal'][self.short_window:] = np.where(
            signals['short_ma'][self.short_window:] >
            signals['long_ma'][self.short_window:],
            1.0, 0.0
        )

        # 生成交易订单
        signals['positions'] = signals['signal'].diff()

        return signals

# 运行策略
if __name__ == '__main__':
    # 获取数据
    dm = DataManager()
    data = dm.get_data('AAPL', start='2020-01-01', end='2024-01-01')

    # 创建策略
    strategy = MovingAverageCrossover(short_window=20, long_window=50)

    # 设置风险管理
    risk_mgr = RiskManager(max_position_size=0.10)

    # 运行回测
    backtest = Backtest(
        strategy=strategy,
        data=data,
        initial_capital=100000,
        risk_manager=risk_mgr
    )

    results = backtest.run()

    # 打印结果
    print(results.summary())
    results.plot()
```

## 配置

### 配置文件

创建 `config.yaml` 文件：

```yaml
# config.yaml
data:
  source: yfinance
  cache_dir: ./data

backtest:
  initial_capital: 100000
  commission: 0.001
  slippage: 0.0005

risk:
  max_position_size: 0.10
  max_portfolio_risk: 0.20
  stop_loss_pct: 0.05

live_trading:
  broker: alpaca
  paper_trading: true
  update_frequency: 60  # 秒
```

加载配置：

```python
from stock_agent_system import Config

config = Config.from_file('config.yaml')
```

## 最佳实践

### 1. 使用版本控制

```bash
# 跟踪您的策略
git init
git add .
git commit -m "Initial strategy"
```

### 2. 分离开发和生产环境

```python
# development.py
config = Config(paper_trading=True)

# production.py
config = Config(paper_trading=False)
```

### 3. 记录所有内容

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("策略已启动")
logger.warning("检测到高波动性")
logger.error("交易执行失败")
```

### 4. 彻底测试

```python
# test_strategy.py
import unittest
from my_strategy import MyStrategy

class TestMyStrategy(unittest.TestCase):
    def test_signal_generation(self):
        strategy = MyStrategy()
        signals = strategy.generate_signals(test_data)
        self.assertIsNotNone(signals)

if __name__ == '__main__':
    unittest.main()
```

## 故障排除

### 问题：导入错误

```python
# 如果您遇到：ModuleNotFoundError: No module named 'stock_agent_system'

# 解决方案：重新安装
pip uninstall stock-agent-system
pip install -e /path/to/stock-agent-system
```

### 问题：数据下载失败

```python
# 如果数据下载失败，尝试：
dm = DataManager(cache=True)  # 使用缓存数据
data = dm.get_data('AAPL', start='2024-01-01', retry=3)
```

### 问题：回测运行缓慢

```python
# 通过以下方式优化：
# 1. 使用较小的日期范围进行测试
# 2. 降低数据频率（日线而不是分钟线）
# 3. 向量化计算
# 4. 对多个股票使用多进程
```

## 获取帮助

- **文档**：查看 stock-agent-system 文档
- **GitHub Issues**：报告错误或请求功能
- **示例**：查看 `examples/` 目录
- **社区**：在 GitHub 上加入讨论

## 下一步

1. 安装 stock-agent-system
2. 运行示例策略
3. 根据您的需求修改示例
4. 构建您自己的策略
5. 在实盘交易前彻底回测

---

**注意**：stock-agent-system 是可选的。本书中的所有概念都可以使用标准 Python 库（pandas、numpy 等）实现。如果您想要一个结构化的框架，请使用 stock-agent-system。
