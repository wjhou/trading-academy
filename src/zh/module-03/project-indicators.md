# 实践项目：实现技术指标

**模块**：3 - 技术指标
**预计时间**：3-4 小时
**难度**：中级

## 🎯 项目目标

构建完整的技术指标库和交易系统：
- 从头实现所有主要指标
- 创建多指标分析仪表板
- 构建并回测交易策略
- 比较指标表现
- 生成交易信号

## 📋 项目概述

您将创建一个 Python 库，用于计算技术指标、分析股票并生成交易信号。

### 交付成果

1. **指标库** (`indicators.py`)
2. **交易策略** (`strategy.py`)
3. **回测引擎** (`backtest.py`)
4. **分析仪表板**（可视化）
5. **性能报告**（markdown 文档）

## 🔧 第 1 部分：构建指标库

创建包含所有指标的 `indicators.py`：

```python
import pandas as pd
import numpy as np

class TechnicalIndicators:
    """
    完整的技术指标库
    """

    @staticmethod
    def sma(df, period=20, column='Close'):
        """简单移动平均线"""
        return df[column].rolling(window=period).mean()

    @staticmethod
    def ema(df, period=20, column='Close'):
        """指数移动平均线"""
        return df[column].ewm(span=period, adjust=False).mean()

    @staticmethod
    def rsi(df, period=14, column='Close'):
        """相对强弱指数"""
        delta = df[column].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)

        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @staticmethod
    def macd(df, fast=12, slow=26, signal=9, column='Close'):
        """MACD 指标"""
        ema_fast = df[column].ewm(span=fast, adjust=False).mean()
        ema_slow = df[column].ewm(span=slow, adjust=False).mean()

        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line

        return macd_line, signal_line, histogram

    @staticmethod
    def bollinger_bands(df, period=20, std_dev=2, column='Close'):
        """布林带"""
        middle = df[column].rolling(window=period).mean()
        std = df[column].rolling(window=period).std()

        upper = middle + (std_dev * std)
        lower = middle - (std_dev * std)

        return upper, middle, lower

    @staticmethod
    def obv(df):
        """能量潮"""
        obv = [0]
        for i in range(1, len(df)):
            if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
                obv.append(obv[-1] + df['Volume'].iloc[i])
            elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
                obv.append(obv[-1] - df['Volume'].iloc[i])
            else:
                obv.append(obv[-1])
        return pd.Series(obv, index=df.index)

    @staticmethod
    def vwap(df):
        """成交量加权平均价"""
        typical_price = (df['High'] + df['Low'] + df['Close']) / 3
        return (typical_price * df['Volume']).cumsum() / df['Volume'].cumsum()

    @staticmethod
    def atr(df, period=14):
        """平均真实波幅"""
        high_low = df['High'] - df['Low']
        high_close = abs(df['High'] - df['Close'].shift())
        low_close = abs(df['Low'] - df['Close'].shift())

        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr

    @staticmethod
    def stochastic(df, period=14):
        """随机振荡器"""
        low_min = df['Low'].rolling(window=period).min()
        high_max = df['High'].rolling(window=period).max()

        k = 100 * (df['Close'] - low_min) / (high_max - low_min)
        d = k.rolling(window=3).mean()

        return k, d

    @staticmethod
    def add_all_indicators(df):
        """将所有指标添加到数据框"""
        # 移动平均线
        df['SMA_20'] = TechnicalIndicators.sma(df, 20)
        df['SMA_50'] = TechnicalIndicators.sma(df, 50)
        df['SMA_200'] = TechnicalIndicators.sma(df, 200)
        df['EMA_12'] = TechnicalIndicators.ema(df, 12)
        df['EMA_26'] = TechnicalIndicators.ema(df, 26)

        # RSI
        df['RSI'] = TechnicalIndicators.rsi(df)

        # MACD
        df['MACD'], df['MACD_Signal'], df['MACD_Hist'] = \
            TechnicalIndicators.macd(df)

        # 布林带
        df['BB_Upper'], df['BB_Middle'], df['BB_Lower'] = \
            TechnicalIndicators.bollinger_bands(df)

        # 成交量指标
        df['OBV'] = TechnicalIndicators.obv(df)
        df['VWAP'] = TechnicalIndicators.vwap(df)

        # 波动率
        df['ATR'] = TechnicalIndicators.atr(df)

        # 随机指标
        df['Stoch_K'], df['Stoch_D'] = TechnicalIndicators.stochastic(df)

        return df
```

## 📊 第 2 部分：构建交易策略

创建 `strategy.py`：

```python
import pandas as pd
from indicators import TechnicalIndicators

class MultiIndicatorStrategy:
    """
    使用多个指标的交易策略
    """

    def __init__(self, name="多指标策略"):
        self.name = name
        self.indicators = TechnicalIndicators()

    def generate_signals(self, df):
        """
        生成买入/卖出信号
        """
        # 添加所有指标
        df = self.indicators.add_all_indicators(df)

        # 初始化信号
        df['Signal'] = 0  # 0 = 持有, 1 = 买入, -1 = 卖出

        for i in range(200, len(df)):  # 在 200 日 MA 可用后开始
            # 获取当前值
            price = df['Close'].iloc[i]
            sma_50 = df['SMA_50'].iloc[i]
            sma_200 = df['SMA_200'].iloc[i]
            rsi = df['RSI'].iloc[i]
            macd = df['MACD'].iloc[i]
            macd_signal = df['MACD_Signal'].iloc[i]
            obv = df['OBV'].iloc[i]
            obv_ma = df['OBV'].iloc[i-20:i].mean()

            # 买入条件
            if (price > sma_50 > sma_200 and  # 上升趋势
                30 < rsi < 60 and  # 未超买
                macd > macd_signal and  # 看涨动量
                obv > obv_ma):  # 成交量确认
                df.loc[df.index[i], 'Signal'] = 1

            # 卖出条件
            elif (price < sma_50 < sma_200 and  # 下降趋势
                  40 < rsi < 70 and  # 未超卖
                  macd < macd_signal and  # 看跌动量
                  obv < obv_ma):  # 成交量确认
                df.loc[df.index[i], 'Signal'] = -1

        return df

    def calculate_positions(self, df):
        """
        从信号计算实际持仓
        """
        df['Position'] = df['Signal'].replace(0, method='ffill')
        df['Position'] = df['Position'].fillna(0)
        return df
```

## 🧪 第 3 部分：回测引擎

创建 `backtest.py`：

```python
import pandas as pd
import numpy as np

class Backtester:
    """
    回测交易策略
    """

    def __init__(self, initial_capital=10000, commission=0.001):
        self.initial_capital = initial_capital
        self.commission = commission

    def run(self, df, strategy):
        """
        运行回测
        """
        # 生成信号
        df = strategy.generate_signals(df)
        df = strategy.calculate_positions(df)

        # 计算收益
        df['Returns'] = df['Close'].pct_change()
        df['Strategy_Returns'] = df['Position'].shift(1) * df['Returns']

        # 应用佣金
        df['Trades'] = df['Position'].diff().abs()
        df['Commission'] = df['Trades'] * self.commission
        df['Strategy_Returns'] = df['Strategy_Returns'] - df['Commission']

        # 计算累积收益
        df['Cumulative_Returns'] = (1 + df['Returns']).cumprod()
        df['Cumulative_Strategy_Returns'] = (1 + df['Strategy_Returns']).cumprod()

        # 计算投资组合价值
        df['Portfolio_Value'] = self.initial_capital * df['Cumulative_Strategy_Returns']

        return df

    def calculate_metrics(self, df):
        """
        计算性能指标
        """
        # 总收益
        total_return = df['Cumulative_Strategy_Returns'].iloc[-1] - 1

        # 年化收益
        days = (df.index[-1] - df.index[0]).days
        years = days / 365.25
        annualized_return = (1 + total_return) ** (1 / years) - 1

        # 波动率
        volatility = df['Strategy_Returns'].std() * np.sqrt(252)

        # 夏普比率
        sharpe_ratio = annualized_return / volatility if volatility > 0 else 0

        # 最大回撤
        cumulative = df['Cumulative_Strategy_Returns']
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()

        # 胜率
        winning_trades = df[df['Strategy_Returns'] > 0]['Strategy_Returns'].count()
        total_trades = df[df['Trades'] > 0]['Trades'].count()
        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        return {
            '总收益': f"{total_return:.2%}",
            '年化收益': f"{annualized_return:.2%}",
            '波动率': f"{volatility:.2%}",
            '夏普比率': f"{sharpe_ratio:.2f}",
            '最大回撤': f"{max_drawdown:.2%}",
            '胜率': f"{win_rate:.2%}",
            '总交易次数': int(total_trades)
        }
```

## 📈 第 4 部分：分析仪表板

创建 `dashboard.py`：

```python
import matplotlib.pyplot as plt
import seaborn as sns

class Dashboard:
    """
    可视化仪表板
    """

    @staticmethod
    def plot_full_analysis(df, ticker):
        """
        创建综合分析仪表板
        """
        fig = plt.figure(figsize=(16, 12))
        gs = fig.add_gridspec(5, 2, hspace=0.3, wspace=0.3)

        # 1. 价格和移动平均线
        ax1 = fig.add_subplot(gs[0, :])
        ax1.plot(df.index, df['Close'], label='价格', linewidth=2)
        ax1.plot(df.index, df['SMA_50'], label='SMA 50', alpha=0.7)
        ax1.plot(df.index, df['SMA_200'], label='SMA 200', alpha=0.7)
        ax1.set_title(f'{ticker} - 价格和移动平均线')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 2. RSI
        ax2 = fig.add_subplot(gs[1, 0])
        ax2.plot(df.index, df['RSI'])
        ax2.axhline(y=70, color='r', linestyle='--', alpha=0.5)
        ax2.axhline(y=30, color='g', linestyle='--', alpha=0.5)
        ax2.fill_between(df.index, 70, 100, alpha=0.1, color='red')
        ax2.fill_between(df.index, 0, 30, alpha=0.1, color='green')
        ax2.set_title('RSI')
        ax2.set_ylim(0, 100)
        ax2.grid(True, alpha=0.3)

        # 3. MACD
        ax3 = fig.add_subplot(gs[1, 1])
        ax3.plot(df.index, df['MACD'], label='MACD')
        ax3.plot(df.index, df['MACD_Signal'], label='信号线')
        ax3.bar(df.index, df['MACD_Hist'], alpha=0.3, label='柱状图')
        ax3.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
        ax3.set_title('MACD')
        ax3.legend()
        ax3.grid(True, alpha=0.3)

        # 4. 布林带
        ax4 = fig.add_subplot(gs[2, 0])
        ax4.plot(df.index, df['Close'], label='价格')
        ax4.plot(df.index, df['BB_Upper'], 'r--', alpha=0.5)
        ax4.plot(df.index, df['BB_Middle'], 'g-', alpha=0.5)
        ax4.plot(df.index, df['BB_Lower'], 'r--', alpha=0.5)
        ax4.fill_between(df.index, df['BB_Upper'], df['BB_Lower'], alpha=0.1)
        ax4.set_title('布林带')
        ax4.legend()
        ax4.grid(True, alpha=0.3)

        # 5. 成交量和 OBV
        ax5 = fig.add_subplot(gs[2, 1])
        ax5_twin = ax5.twinx()
        ax5.bar(df.index, df['Volume'], alpha=0.3, label='成交量')
        ax5_twin.plot(df.index, df['OBV'], 'r-', label='OBV')
        ax5.set_title('成交量和 OBV')
        ax5.legend(loc='upper left')
        ax5_twin.legend(loc='upper right')
        ax5.grid(True, alpha=0.3)

        # 6. 交易信号
        ax6 = fig.add_subplot(gs[3, :])
        ax6.plot(df.index, df['Close'], label='价格', alpha=0.5)
        buy_signals = df[df['Signal'] == 1]
        sell_signals = df[df['Signal'] == -1]
        ax6.scatter(buy_signals.index, buy_signals['Close'],
                   marker='^', color='g', s=100, label='买入', zorder=5)
        ax6.scatter(sell_signals.index, sell_signals['Close'],
                   marker='v', color='r', s=100, label='卖出', zorder=5)
        ax6.set_title('交易信号')
        ax6.legend()
        ax6.grid(True, alpha=0.3)

        # 7. 投资组合价值
        ax7 = fig.add_subplot(gs[4, :])
        ax7.plot(df.index, df['Portfolio_Value'], label='策略', linewidth=2)
        ax7.plot(df.index, df['Cumulative_Returns'] * 10000,
                label='买入持有', linewidth=2, alpha=0.7)
        ax7.set_title('投资组合价值')
        ax7.legend()
        ax7.grid(True, alpha=0.3)

        plt.suptitle(f'{ticker} - 完整技术分析', fontsize=16, y=0.995)
        plt.savefig(f'{ticker}_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
```

## 🎯 第 5 部分：主分析脚本

创建 `main.py`：

```python
import yfinance as yf
from indicators import TechnicalIndicators
from strategy import MultiIndicatorStrategy
from backtest import Backtester
from dashboard import Dashboard

def analyze_stock(ticker, period="2y"):
    """
    完整股票分析
    """
    print(f"\n{'='*60}")
    print(f"分析 {ticker}")
    print(f"{'='*60}\n")

    # 获取数据
    df = yf.Ticker(ticker).history(period=period)

    # 初始化组件
    strategy = MultiIndicatorStrategy()
    backtester = Backtester(initial_capital=10000)
    dashboard = Dashboard()

    # 运行回测
    df = backtester.run(df, strategy)

    # 计算指标
    metrics = backtester.calculate_metrics(df)

    # 打印结果
    print("性能指标：")
    print("-" * 40)
    for key, value in metrics.items():
        print(f"{key:20s}: {value}")

    # 创建可视化
    dashboard.plot_full_analysis(df, ticker)

    return df, metrics

if __name__ == "__main__":
    # 分析多只股票
    tickers = ["AAPL", "MSFT", "GOOGL"]

    results = {}
    for ticker in tickers:
        df, metrics = analyze_stock(ticker)
        results[ticker] = metrics

    # 比较结果
    print("\n" + "="*60)
    print("比较")
    print("="*60)
    import pandas as pd
    comparison = pd.DataFrame(results).T
    print(comparison)
```

## ✅ 项目检查清单

- [ ] 在 `indicators.py` 中实现所有指标
- [ ] 在 `strategy.py` 中创建交易策略
- [ ] 在 `backtest.py` 中构建回测引擎
- [ ] 在 `dashboard.py` 中创建可视化仪表板
- [ ] 在 `main.py` 中编写主分析脚本
- [ ] 在 3+ 只股票上测试
- [ ] 生成性能报告
- [ ] 记录发现

## 📝 交付成果：性能报告

创建 `PROJECT_REPORT.md`：

```markdown
# 模块 3 项目报告

## 策略描述
[描述您的多指标策略]

## 使用的指标
1. **趋势**：[哪些指标及原因]
2. **动量**：[哪些指标及原因]
3. **成交量**：[哪些指标及原因]

## 入场规则
[列出所有入场条件]

## 出场规则
[列出所有出场条件]

## 回测结果

### 股票 1：[代码]
- 总收益：X%
- 夏普比率：X.XX
- 最大回撤：X%
- 胜率：X%

### 股票 2：[代码]
[相同指标]

### 股票 3：[代码]
[相同指标]

## 分析
[什么有效？什么无效？为什么？]

## 经验教训
[项目的关键收获]

## 未来改进
[您将如何改进策略？]
```

## 🎓 评估标准

1. **代码质量**（30%）：清晰、有文档、可运行的代码
2. **策略逻辑**（25%）：合理的指标组合
3. **回测结果**（20%）：现实的表现
4. **分析**（15%）：有洞察力的解释
5. **可视化**（10%）：清晰、信息丰富的图表

## 🚀 下一步

完成此项目后：
1. 在不同市场条件下测试
2. 优化参数
3. 添加更多指标
4. 实现风险管理
5. 继续学习模块 4：交易策略

---

**完成模块 3 了吗？** ✓ 继续[模块 4：交易策略](../module-04/lesson-01-trend-following.md)
